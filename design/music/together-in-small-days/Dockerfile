FROM python:3.12-alpine

# Build-only tools; none of these are added to the web server image.
RUN apk add --no-cache python3 py3-numpy py3-scipy ffmpeg
WORKDIR /work
ENTRYPOINT ["/usr/bin/python3", "design/music/together-in-small-days/render.py"]
