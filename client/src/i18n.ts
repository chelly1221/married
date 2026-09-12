// 4개 로케일 전체 카피. KR을 기준으로 EN/JP/CN의 의미와 어조를 맞춘다.
// 신부 부친 성함은 의도적으로 생략한다(모친 刘丽娟 만 표기). story 의 CN 카피는 신부 검수 전 초안.

export type Locale = 'ko' | 'en' | 'ja' | 'zh';

export const LOCALES: { key: Locale; label: string }[] = [
  { key: 'ko', label: 'KR' },
  { key: 'en', label: 'EN' },
  { key: 'ja', label: 'JP' },
  { key: 'zh', label: 'CN' },
];

interface Person {
  role: string;
  name: string;
  note?: string;
  roman: string;
  parents: string;
}

// 혼인일 전/후로 시제가 달라지는 카피. 방문자의 현지 날짜가 혼인일 이상이면 after 를 쓴다.
export type Phase = 'before' | 'after';

export interface PhasedStrings {
  heroMsg: string[];
  greetingParas: string[][];
  weddingLabel: string;
}

// 컴포넌트가 받는 완성된 카피 (phase 가 반영된 상태)
export interface Strings extends PhasedStrings {
  htmlLang: string;
  docTitle: string;
  musicPlay: string;
  musicStop: string;
  seal: string;
  heroLabel: string;
  heroGroom: string;
  heroBride: string;
  heroNameSize: number;
  scrollHint: string;
  notice: string[];
  coupleLabel: string;
  groom: Person;
  bride: Person;
  storyLabel: string;
  story: { mark: string; text: string }[];
  dateFull: string;
  dateMasked: string; // DATE_HIDDEN 일 때 dateFull 대신
  dows: string[];
  dplusLabel: string;
  gbLabel: string;
  gbName: string;
  gbMsg: string;
  gbSubmit: string;
  gbError: string;
  footerThanks: string[];
  footerSig: string;
}

// 로케일 파일에 적는 형태: 공통 카피 + 혼인일 전/후 카피
interface LocaleCopy extends Omit<Strings, keyof PhasedStrings> {
  before: PhasedStrings;
  after: PhasedStrings;
}

export const COPY: Record<Locale, LocaleCopy> = {
  ko: {
    htmlLang: 'ko',
    docTitle: '서상현 · 주정정 — 결혼 알림',
    musicPlay: '♪ 음악 켜기',
    musicStop: '♪ 음악 끄기',
    seal: '謹　告',
    heroLabel: '결 혼 인 사',
    heroGroom: '서상현',
    heroBride: '주정정',
    heroNameSize: 36,
    scrollHint: '아래로',
    notice: ['예식은 진행하지 않으며,', '축의금은 정중히 사양합니다.'],
    coupleLabel: '두 사람',
    groom: {
      role: '신랑',
      name: '서상현',
      roman: 'SEO SANG HYUN',
      parents: '서갑수 · 이윤진 의 아들',
    },
    bride: {
      role: '신부',
      name: '주정정',
      note: '周婷婷',
      roman: 'ZHOU TING TING',
      parents: '유려연 의 딸',
    },
    storyLabel: '두 사람의 이야기',
    story: [
      {
        mark: '첫 인사',
        text: '저희의 시작은 언어교환 앱에서 나눈 인사였습니다. 대화를 이어 가며, 저희는 조금씩 서로를 알아갔습니다.',
      },
      {
        mark: '첫 만남',
        text: '저희는 상현의 자전거 여행 중 후허하오터에서 처음 만나, 나흘 동안 함께 시간을 보냈습니다. 집으로 돌아온 뒤 상현이 마음을 전했고, 석 달 뒤 정정은 그 마음에 답했습니다.',
      },
      {
        mark: '하얼빈, 그리고 도쿄',
        text: '첫 데이트는 하얼빈에서 시작되었습니다. 상현이 정정을 마중하러 갔고, 그날 함께 도쿄행 비행기에 올랐습니다.',
      },
      {
        mark: '한집에서',
        text: '정정이 대학을 졸업한 뒤, 저희는 두 달 동안 한집에서 지냈습니다. 일상을 함께 나누며, 저희는 부부가 되기로 했습니다.',
      },
    ],
    dateFull: '2026년 9월 18일 금요일',
    dateMasked: '????년 ??월 ??일',
    dows: ['일', '월', '화', '수', '목', '금', '토'],
    dplusLabel: '함께한 날',
    gbLabel: '축하의 말씀',
    gbName: '성함',
    gbMsg: '따뜻한 한마디를 남겨 주세요',
    gbSubmit: '남기기',
    gbError: '말씀을 남기지 못했습니다. 잠시 후 다시 시도해 주세요.',
    before: {
      heroMsg: ['저희 두 사람,', '곧 부부가 됨을 알려 드립니다'],
      greetingParas: [
        ['저희 두 사람, 오랜 시간 서로를 아끼며', '지내온 끝에 한 가정을 이루려 합니다.'],
        ['따로 예식은 갖추지 아니하오나,', '귀한 분들께 저희의 새로운 시작을', '정중히 알려 드리고자 합니다.'],
        ['보내 주시는 축하의 말씀만으로', '저희에게는 넘치는 선물이 됩니다.'],
      ],
      weddingLabel: '혼인하는 날',
    },
    after: {
      heroMsg: ['저희 두 사람,', '부부가 되었음을 알려 드립니다'],
      greetingParas: [
        ['저희 두 사람, 오랜 시간 서로를 아끼며', '지내온 끝에 마침내 한 가정을 이루었습니다.'],
        ['따로 예식은 갖추지 아니하였으나,', '귀한 분들께 저희의 새로운 시작을', '정중히 알려 드리고자 합니다.'],
        ['보내 주시는 축하의 말씀만으로', '저희에게는 넘치는 선물이 됩니다.'],
      ],
      weddingLabel: '혼인한 날',
    },
    footerThanks: ['따뜻한 축하를 보내 주신 모든 분께', '진심으로 감사드립니다'],
    footerSig: 'SANG HYUN & TING TING',
  },

  en: {
    htmlLang: 'en',
    docTitle: 'Sang Hyun & Ting Ting — Marriage Announcement',
    musicPlay: '♪ Music on',
    musicStop: '♪ Music off',
    seal: '謹　告',
    heroLabel: 'OUR MARRIAGE',
    heroGroom: 'Sang Hyun',
    heroBride: 'Ting Ting',
    heroNameSize: 27,
    scrollHint: 'SCROLL',
    notice: ['No ceremony will be held, and we', 'respectfully decline monetary gifts.'],
    coupleLabel: 'THE TWO OF US',
    groom: {
      role: 'GROOM',
      name: '서상현',
      roman: 'SEO SANG HYUN',
      parents: 'Son of Seo Gap-su & Lee Yun-jin',
    },
    bride: {
      role: 'BRIDE',
      name: '周婷婷',
      roman: 'ZHOU TING TING',
      parents: 'Daughter of Liu Lijuan',
    },
    storyLabel: 'OUR STORY',
    story: [
      {
        mark: 'OUR FIRST HELLO',
        text: 'Our story began with a hello on a language-exchange app. As we kept talking, we gradually got to know one another.',
      },
      {
        mark: 'OUR FIRST MEETING',
        text: 'We first met in Hohhot during Sang Hyun’s cycling trip and spent four days together. After returning home, Sang Hyun shared his feelings, and three months later, Ting Ting gave her answer.',
      },
      {
        mark: 'HARBIN, THEN TOKYO',
        text: 'Our first date began in Harbin. Sang Hyun came to meet Ting Ting, and that same day we boarded a flight to Tokyo together.',
      },
      {
        mark: 'UNDER ONE ROOF',
        text: 'After Ting Ting graduated from university, we lived together for two months. As we shared everyday life, we decided to get married.',
      },
    ],
    dateFull: 'Friday, September 18, 2026',
    dateMasked: '????. ??. ??',
    dows: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
    dplusLabel: 'DAYS TOGETHER',
    gbLabel: 'WORDS OF BLESSING',
    gbName: 'Your name',
    gbMsg: 'Leave us a warm message',
    gbSubmit: 'LEAVE A NOTE',
    gbError: 'Your message could not be saved. Please try again in a moment.',
    before: {
      heroMsg: ['With full hearts, we announce', 'that we will soon become husband and wife'],
      greetingParas: [
        ['After cherishing one another for so long,', 'we are about to become a family.'],
        ['Although we will not hold a ceremony,', 'we wish to share our new beginning', 'with those most dear to us.'],
        ['Your kind words of congratulations', 'are the greatest gift we could receive.'],
      ],
      weddingLabel: 'THE DAY WE MARRY',
    },
    after: {
      heroMsg: ['With full hearts, we announce', 'that we have become husband and wife'],
      greetingParas: [
        ['After cherishing one another for so long,', 'we have now become a family.'],
        ['Although we are not holding a ceremony,', 'we wish to share our new beginning', 'with those most dear to us.'],
        ['Your kind words of congratulations', 'are the greatest gift we could receive.'],
      ],
      weddingLabel: 'THE DAY WE MARRIED',
    },
    footerThanks: ['Our heartfelt thanks to everyone', 'for your warm wishes'],
    footerSig: 'SANG HYUN & TING TING',
  },

  ja: {
    htmlLang: 'ja',
    docTitle: '徐相賢 · 周婷婷 — 結婚のお知らせ',
    musicPlay: '♪ 音楽をかける',
    musicStop: '♪ 音楽を止める',
    seal: '謹　告',
    heroLabel: '結婚のご挨拶',
    heroGroom: '徐相賢',
    heroBride: '周婷婷',
    heroNameSize: 32,
    scrollHint: '下へ',
    notice: ['挙式は行わず、', 'ご祝儀は謹んでご辞退申し上げます。'],
    coupleLabel: 'ふたり',
    groom: {
      role: '新郎',
      name: '徐相賢',
      note: 'ソ・サンヒョン',
      roman: 'SEO SANG HYUN',
      parents: 'ソ・ガプス、イ・ユンジン の息子',
    },
    bride: {
      role: '新婦',
      name: '周婷婷',
      note: 'チョウ・ティンティン',
      roman: 'ZHOU TING TING',
      parents: '刘丽娟 の娘',
    },
    storyLabel: 'ふたりの歩み',
    story: [
      {
        mark: '最初の挨拶',
        text: '私たちの始まりは、言語交換アプリで交わした挨拶でした。会話を重ねながら、少しずつお互いを知っていきました。',
      },
      {
        mark: '初めて会った日',
        text: '私たちは相賢の自転車旅行中にフフホトで初めて会い、四日間一緒に過ごしました。家に帰ったあと、相賢が想いを伝え、その三か月後、婷婷はその想いに応えました。',
      },
      {
        mark: 'ハルビン、そして東京',
        text: '初めてのデートはハルビンから始まりました。相賢が婷婷を迎えに行き、その日のうちに一緒に東京行きの飛行機に乗りました。',
      },
      {
        mark: 'ひとつ屋根の下で',
        text: '婷婷が大学を卒業したあと、私たちは二か月間、一緒に暮らしました。日常をともにする中で、私たちは夫婦になることを決めました。',
      },
    ],
    dateFull: '2026年9月18日（金）',
    dateMasked: '????年??月??日',
    dows: ['日', '月', '火', '水', '木', '金', '土'],
    dplusLabel: 'ともに歩んだ日々',
    gbLabel: 'お祝いの言葉',
    gbName: 'お名前',
    gbMsg: '温かいひとことをお寄せください',
    gbSubmit: '送る',
    gbError: 'メッセージを保存できませんでした。しばらくしてからもう一度お試しください。',
    before: {
      heroMsg: ['私たちふたり、夫婦となりますことを', '謹んでお知らせいたします'],
      greetingParas: [
        ['私たちふたりは互いを大切に想いながら歩み、', 'このたびひとつの家庭を築くこととなりました。'],
        ['式は執り行いませんが、', '大切な皆さまに新しい門出を', '謹んでお知らせ申し上げます。'],
        ['お祝いのお言葉をいただけるだけで、', '私たちには余りある贈り物です。'],
      ],
      weddingLabel: '夫婦になる日',
    },
    after: {
      heroMsg: ['私たちふたり、夫婦となりましたことを', '謹んでお知らせいたします'],
      greetingParas: [
        ['私たちふたりは互いを大切に想いながら歩み、', 'このたびひとつの家庭を築きました。'],
        ['式は執り行いませんが、', '大切な皆さまに新しい門出を', '謹んでお知らせ申し上げます。'],
        ['お祝いのお言葉をいただけるだけで、', '私たちには余りある贈り物です。'],
      ],
      weddingLabel: '夫婦になった日',
    },
    footerThanks: ['温かいお祝いの言葉をくださった皆さまに', '心より感謝申し上げます'],
    footerSig: '徐相賢 · 周婷婷',
  },

  zh: {
    htmlLang: 'zh-CN',
    docTitle: '徐相贤 · 周婷婷 — 结婚告知',
    musicPlay: '♪ 播放音乐',
    musicStop: '♪ 停止音乐',
    seal: '謹　告',
    heroLabel: '结婚告知',
    heroGroom: '徐相贤',
    heroBride: '周婷婷',
    heroNameSize: 32,
    scrollHint: '向下',
    notice: ['我们不举办婚礼，', '礼金敬请免送。'],
    coupleLabel: '关于我们',
    groom: {
      role: '新郎',
      name: '徐相贤',
      roman: 'SEO SANG HYUN',
      parents: 'Seo Gap-su · Lee Yun-jin 之子',
    },
    bride: {
      role: '新娘',
      name: '周婷婷',
      roman: 'ZHOU TING TING',
      parents: '刘丽娟 之女',
    },
    storyLabel: '我们的故事',
    story: [
      {
        mark: '初次问候',
        text: '我们的故事，始于语言交换软件上的一声问候。在一次次交谈中，我们渐渐了解了彼此。',
      },
      {
        mark: '初次见面',
        text: '在相贤的骑行旅途中，我们在呼和浩特第一次见面，一起度过了四天。回家后，相贤表达了心意，三个月后，婷婷回应了这份心意。',
      },
      {
        mark: '哈尔滨，然后东京',
        text: '我们的第一次约会从哈尔滨开始。相贤去接婷婷，当天我们一起登上了飞往东京的航班。',
      },
      {
        mark: '同一个屋檐下',
        text: '婷婷大学毕业后，我们一起生活了两个月。在日常相处中，我们决定结为夫妻。',
      },
    ],
    dateFull: '2026年9月18日 星期五',
    dateMasked: '????年??月??日',
    dows: ['日', '一', '二', '三', '四', '五', '六'],
    dplusLabel: '相伴天数',
    gbLabel: '祝福留言',
    gbName: '您的姓名',
    gbMsg: '请留下一句温暖的祝福',
    gbSubmit: '留言',
    gbError: '留言未能保存，请稍后再试。',
    before: {
      heroMsg: ['我们二人即将结为夫妻', '谨此告知各位亲友'],
      greetingParas: [
        ['一路走来，我们始终珍惜彼此，', '如今即将组成一个家庭。'],
        ['虽然不举办婚礼，', '仍想将我们的新开始', '郑重地告知各位亲友。'],
        ['您的一句祝福，', '于我们而言已是最珍贵的礼物。'],
      ],
      weddingLabel: '成婚之日',
    },
    after: {
      heroMsg: ['我们二人已结为夫妻', '谨此告知各位亲友'],
      greetingParas: [
        ['一路走来，我们始终珍惜彼此，', '如今终于组成了一个家庭。'],
        ['虽然没有举办婚礼，', '仍想将我们的新开始', '郑重地告知各位亲友。'],
        ['您的一句祝福，', '于我们而言已是最珍贵的礼物。'],
      ],
      weddingLabel: '成婚之日',
    },
    footerThanks: ['衷心感谢每一位亲友', '送来的温暖祝福'],
    footerSig: '徐相贤 · 周婷婷',
  },
};

// 로케일과 혼인일 전/후 단계로 완성된 카피를 만든다.
export function getStrings(locale: Locale, phase: Phase): Strings {
  const { before, after, ...base } = COPY[locale];
  return { ...base, ...(phase === 'after' ? after : before) };
}

export function detectLocale(): Locale {
  const saved = localStorage.getItem('locale');
  if (saved === 'ko' || saved === 'en' || saved === 'ja' || saved === 'zh') return saved;
  const l = navigator.language.toLowerCase();
  if (l.startsWith('ja')) return 'ja';
  if (l.startsWith('zh')) return 'zh';
  if (l.startsWith('en')) return 'en';
  return 'ko';
}
