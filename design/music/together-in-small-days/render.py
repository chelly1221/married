"""Render our written score with a sample-free, softly voiced piano synthesizer.

Run using the adjacent Dockerfile. numpy/scipy generate every sound; ffmpeg only
masters and encodes the result. No remote audio, soundfonts, or recordings are used.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import math
from pathlib import Path
import struct
import subprocess

import numpy as np
from scipy import signal
from scipy.io import wavfile

SOURCE = Path(__file__).resolve().parent
ROOT = SOURCE.parents[2]
RATE = 44100
SEED = 730912


def piano(midi: int, seconds: float, velocity: float, rng) -> np.ndarray:
    """Damped, slightly inharmonic string modes plus a very quiet hammer transient."""
    frequency = 440 * 2 ** ((midi - 69) / 12)
    release = .48 + .18 * max(0, (60 - midi) / 24)
    count = math.ceil((seconds + release * 5) * RATE)
    time = np.arange(count, dtype=np.float64) / RATE
    sound = np.zeros(count, dtype=np.float64)
    # Lower strings bloom longer. The felt-like attack suppresses high modes.
    decay = np.clip(3.7 * (261.63 / frequency) ** .31, 1.6, 6.2)
    stiffness = .000055 * (frequency / 261.63) ** .72
    detune = .35 + .65 * np.clip((midi - 40) / 45, 0, 1)
    attack = 1 - np.exp(-time / .0045)
    brightness = 5.0 + 2.0 * velocity / 127
    for partial in range(1, 19):
        pitch = frequency * partial * math.sqrt(1 + stiffness * partial ** 2)
        if pitch > 11000:
            break
        amplitude = math.exp(-((partial - 1) / brightness) ** 1.3) / partial ** 1.02
        if partial == 1:
            amplitude *= .84
        mode_decay = decay / partial ** .61
        envelope = attack * (.79 * np.exp(-time / mode_decay)
                             + .21 * np.exp(-time / (.08 + .14 / partial)))
        # Paired strings beat subtly without an electronic chorus effect.
        phase = rng.uniform(-.035, .035)
        carrier = (.65 * np.sin(2 * np.pi * pitch * time + phase)
                   + .35 * np.sin(2 * np.pi * pitch * 2 ** (detune / 1200) * time - phase))
        sound += amplitude * envelope * carrier
    # Damper release after a modest pedal hold, with no abrupt waveform truncation.
    sound *= np.exp(-np.maximum(0, time - seconds) / release)
    hammer = rng.normal(0, 1, count)
    hammer = signal.sosfilt(signal.butter(1, 1300, fs=RATE, output='sos'), hammer)
    sound += .012 * hammer * attack * np.exp(-time / .013)
    sound *= (velocity / 90) ** 1.7
    sound[-min(count, 256):] *= np.linspace(1, 0, min(count, 256))
    return sound.astype(np.float32)


def vlq(value: int) -> bytes:
    data = [value & 127]
    while value > 127:
        value >>= 7
        data.insert(0, (value & 127) | 128)
    return bytes(data)


def write_midi(score: dict, path: Path) -> None:
    """Keep an editable, standard MIDI version alongside the explicit JSON score."""
    ppq = 480
    tempo = round(60000000 / score['tempo'])
    events = [(0, b'\xff\x51\x03' + tempo.to_bytes(3, 'big')),
              (0, b'\xff\x58\x04\x04\x02\x18\x08')]
    channels = {'melody': 0, 'accompaniment': 1, 'bass': 2}
    events.extend((0, bytes([0xC0 | channel, 0])) for channel in channels.values())
    for note in score['notes']:
        start = round(note['beat'] * ppq)
        end = round((note['beat'] + note['duration']) * ppq)
        channel = channels[note['part']]
        events.extend([(start, bytes([0x90 | channel, note['midi'], note['velocity']])),
                       (end, bytes([0x80 | channel, note['midi'], 0]))])
    events.sort(key=lambda item: (item[0], item[1][0]))
    track = bytearray()
    previous = 0
    for tick, message in events:
        track.extend(vlq(tick - previous) + message)
        previous = tick
    end = round(score['bars'] * score['meter'][0] * ppq)
    track.extend(vlq(max(0, end - previous)) + b'\xff\x2f\x00')
    path.write_bytes(b'MThd' + struct.pack('>IHHH', 6, 0, 1, ppq)
                     + b'MTrk' + struct.pack('>I', len(track)) + track)


def render(score: dict, output: Path) -> None:
    rng = np.random.default_rng(SEED)
    beat_seconds = 60 / score['tempo']
    total_beats = score['bars'] * score['meter'][0]
    total_seconds = total_beats * beat_seconds + 3
    length = math.ceil(total_seconds * RATE)
    dry = np.zeros((length, 2), dtype=np.float32)
    notes = sorted(score['notes'], key=lambda item: (item['beat'], item['midi']))
    assert notes and score['meter'] == [4, 4]
    for index, note in enumerate(notes):
        assert 21 <= note['midi'] <= 108 and 1 <= note['velocity'] <= 127
        assert note['duration'] > 0 and note['beat'] >= 0
        assert note['beat'] + note['duration'] <= total_beats + 1e-6
        beat = note['beat']
        # Tiny phrase breathing and hand separation; the pulse remains stable.
        bar_position = (beat % 16) / 16
        breath = .045 * math.sin(math.pi * bar_position) ** 2
        jitter = float(rng.uniform(-.010, .010))
        start = max(0, round((.08 + beat * beat_seconds + breath + jitter) * RATE))
        sustain = note['duration'] * beat_seconds
        pedal = .48 if note['part'] == 'accompaniment' else .28
        velocity = np.clip(note['velocity'] + rng.uniform(-2.0, 2.0), 1, 127)
        voice = piano(note['midi'], sustain + pedal, velocity, rng)
        # Put the keys in a narrow stereo field, leaving melody close to center.
        pan = np.clip((note['midi'] - 60) / 60, -.28, .28)
        if note['part'] == 'melody':
            pan *= .4
        gain = {'melody': .95, 'accompaniment': .73, 'bass': .78}[note['part']]
        angle = (pan + 1) * np.pi / 4
        size = min(len(voice), length - start)
        dry[start:start + size, 0] += voice[:size] * (gain * math.cos(angle))
        dry[start:start + size, 1] += voice[:size] * (gain * math.sin(angle))
        if index % 80 == 0:
            print(f'Rendered {index + 1}/{len(notes)} notes', flush=True)

    # A small, warm room, built from filtered noise and a few early reflections.
    wet = np.zeros_like(dry)
    ir_time = np.arange(round(RATE * 2.2)) / RATE
    mono = dry.mean(axis=1)
    for channel in range(2):
        impulse = rng.normal(0, 1, len(ir_time))
        impulse = signal.sosfilt(signal.butter(2, 3800, fs=RATE, output='sos'), impulse)
        impulse *= np.exp(-ir_time * 5.0) * np.minimum(ir_time / .06, 1)
        impulse[:round(.024 * RATE)] = 0
        impulse *= .24 / np.sqrt(np.sum(impulse ** 2))
        for delay, gain in [(.023, .10), (.041, .065), (.069, .045), (.097, .025)]:
            impulse[round((delay + channel * .0031) * RATE)] += gain
        wet[:, channel] = signal.oaconvolve(mono, impulse, mode='full')[:length]
    mix = dry + wet
    mix = signal.sosfilt(signal.butter(2, 45, 'highpass', fs=RATE, output='sos'), mix, axis=0)
    mix = signal.sosfilt(signal.butter(2, 7200, 'lowpass', fs=RATE, output='sos'), mix, axis=0)
    mix[:round(.02 * RATE)] *= np.linspace(0, 1, round(.02 * RATE))[:, None]
    # The score resolves first; only the room tail fades, with a quiet loop boundary.
    fade = round(2.4 * RATE)
    mix[-fade:] *= np.linspace(1, 0, fade)[:, None] ** 2
    peak = float(np.max(np.abs(mix)))
    assert math.isfinite(peak) and peak > .01
    mix *= .80 / peak
    wavfile.write(output / 'together-in-small-days-mix.wav', RATE, mix.astype(np.float32))
    write_midi(score, SOURCE / 'together-in-small-days.mid')
    master(score, output)


def master(score: dict, output: Path) -> None:
    asset = ROOT / 'client/src/assets/together-in-small-days.mp3'
    # Master consistently without changing timing; preserve the written dynamics.
    analysis = subprocess.run([
        'ffmpeg', '-hide_banner', '-i', str(output / 'together-in-small-days-mix.wav'),
        '-af', 'loudnorm=I=-20:TP=-2:LRA=11:print_format=json', '-f', 'null', '-'
    ], check=True, capture_output=True, text=True)
    measured, _ = json.JSONDecoder().raw_decode(analysis.stderr[analysis.stderr.rfind('{'):])
    loudnorm = ('loudnorm=I=-20:TP=-2:LRA=11:linear=true:'
                f"measured_I={measured['input_i']}:measured_TP={measured['input_tp']}:"
                f"measured_LRA={measured['input_lra']}:measured_thresh={measured['input_thresh']}:"
                f"offset={measured['target_offset']}")
    subprocess.run([
        'ffmpeg', '-y', '-hide_banner', '-loglevel', 'error',
        '-i', str(output / 'together-in-small-days-mix.wav'), '-af', loudnorm,
        '-ar', str(RATE), '-codec:a', 'libmp3lame', '-b:a', '192k',
        '-metadata', f"title={score['titleEn']}", '-metadata', 'artist=Codex',
        '-metadata', 'album=For Sanghyeon and Tingting',
        '-metadata', 'comment=Original written score and synthesized piano; no third-party audio samples.',
        str(asset)
    ], check=True)
    info = {
        'title': score['title'], 'titleEn': score['titleEn'], 'tempo': score['tempo'],
        'bars': score['bars'], 'notes': len(score['notes']), 'sampleRate': RATE,
        'durationSeconds': round(score['bars'] * score['meter'][0] * 60 / score['tempo'] + 3, 3),
        'seed': SEED, 'sha256': hashlib.sha256(asset.read_bytes()).hexdigest(),
        'targetLufs': -20, 'targetTruePeakDb': -2,
        'source': 'Original score and additive synthesized piano; no sampled audio.',
    }
    (SOURCE / 'render-info.json').write_text(json.dumps(info, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps(info, ensure_ascii=False), flush=True)
    print(f'Created {asset} ({asset.stat().st_size:,} bytes)', flush=True)


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--output-dir', type=Path, default=Path('/tmp/original-music'))
    parser.add_argument('--master-only', action='store_true', help='Reuse the existing mix WAV; score and synth must be unchanged.')
    args = parser.parse_args()
    args.output_dir.mkdir(parents=True, exist_ok=True)
    operation = master if args.master_only else render
    operation(json.loads((SOURCE / 'score.json').read_text()), args.output_dir)
