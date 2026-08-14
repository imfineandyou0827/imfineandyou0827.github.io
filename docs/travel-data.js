// 旅行数据：地图、时间线、照片墙、统计共用的单一数据源。
// 以后新增/修改地点，只需改这一份文件。
// 注意：date 目前是占位，请替换成真实日期。

// 去过并需要在地图上高亮的市级行政区（需与 GeoJSON 中的 name 完全一致）
export const visited = [
  '杭州市', '拉萨市', '乌鲁木齐市', '北京市', '上海市', '重庆市'
]

export const places = [
  {
    name: '北京',
    title: '北京之旅',
    lng: 116.4074,
    lat: 39.9042,
    date: '2023年',
    icon: '🏛️',
    type: 'city',
    description: '首都，历史文化名城',
    highlights: ['故宫、天安门、长城', '历史文化底蕴深厚，值得深度游览']
  },
  {
    name: '上海',
    title: '上海之行',
    lng: 121.4737,
    lat: 31.2304,
    date: '2023年',
    icon: '🌆',
    type: 'city',
    description: '魔都，现代化大都市',
    highlights: ['外滩、东方明珠、豫园', '现代化与历史文化的完美融合']
  },
  {
    name: '杭州',
    title: '杭州游',
    lng: 120.1551,
    lat: 30.2741,
    date: '2023年',
    icon: '🏞️',
    type: 'city',
    description: '人间天堂，西湖美景',
    highlights: ['西湖、灵隐寺、西溪湿地', '人间天堂，风景如画']
  },
  {
    name: '拉萨',
    title: '西藏之旅',
    lng: 91.1,
    lat: 29.65,
    date: '2023年',
    icon: '🏔️',
    type: 'city',
    description: '雪域高原，布达拉宫',
    highlights: ['布达拉宫、大昭寺、八廓街', '雪域高原的神秘与神圣']
  },
  {
    name: '冈仁波齐',
    title: '冈仁波齐转山',
    lng: 81.3125,
    lat: 31.0667,
    date: '2023年',
    icon: '⛰️',
    type: 'nature',
    description: '神山，世界中心',
    highlights: ['冈仁波齐峰、玛旁雍错', '世界中心的神山，心灵净化之旅']
  },
  {
    name: '玛旁雍错',
    title: '玛旁雍错',
    lng: 81.3333,
    lat: 30.6667,
    date: '2023年',
    icon: '💧',
    type: 'nature',
    description: '圣湖，三大圣湖之一',
    highlights: ['玛旁雍错湖', '高原圣湖，纯净澄澈']
  },
  {
    name: '羊湖',
    title: '羊卓雍错',
    lng: 90.5,
    lat: 29.0,
    date: '2023年',
    icon: '🌊',
    type: 'nature',
    description: '羊卓雍错，高原蓝宝石',
    highlights: ['羊湖、卡若拉冰川', '高原蓝宝石，纯净如镜']
  },
  {
    name: '日本',
    title: '日本之旅',
    lng: 138.2529,
    lat: 36.2048,
    date: '2023年',
    icon: '🌸',
    type: 'nature',
    description: '樱花之国，现代与传统',
    highlights: ['东京、京都、大阪', '现代科技与传统文化的完美融合']
  },
  {
    name: '新疆',
    title: '新疆之行',
    lng: 87.6168,
    lat: 43.8256,
    date: '2023年',
    icon: '🏜️',
    type: 'nature',
    description: '大美新疆，丝路明珠',
    highlights: ['天山、吐鲁番、喀什', '大漠风光，丝路文化，美食天堂']
  }
]
