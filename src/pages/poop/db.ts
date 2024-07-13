import DataBase from "../../components/database";

const Color = {
  "yellow": "黄色",
  "brown": "棕色",
  "green": "绿色",
  "black": "黑色",
  "orange": "橙色",
} as const;

const Smell = {
  "sour": "酸的",
  "pungent": "刺鼻的",
  "rotten": "腐烂的",
  "fishy": "腥味的",
  "foul": "恶臭的",
  "milky": "奶味的"
} as const

const style = {
  "soft": "软的",
  "firm": "硬的",
  "runny": "稀溏的",
  "lumpy": "结块的",
  "smooth": "光滑的",
  "seedy": "有种子状的",
  "stringy": "丝状的",
  "watery": "水样的",
  "pasty": "糊状的"
} as const


export interface PoopRecord {
  time: number
  color: keyof typeof Color
  smell: keyof typeof Smell,
  style: keyof typeof style,
}

export default new DataBase<PoopRecord>('poop', []);