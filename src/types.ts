export type Difficulty = 'Dễ' | 'Thường' | 'Khó' | 'Hồng Hoang';
export type StoryLength = 'Ngắn' | 'Bình thường' | 'Dài';
export type WeatherType = 'Nắng' | 'Mưa' | 'Tuyết' | 'Sương mù' | 'U ám' | 'Sấm sét';

export interface Talent {
  name: string;
  rank: 'Phàm' | 'Linh' | 'Địa' | 'Thiên' | 'Tiên' | 'Thần';
  effect: string;
}

export interface Background {
  id: string;
  name: string;
  description: string;
  startingItems: InventoryItem[];
  passive: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  type: string;
  rarity: string;
  amount: number;
}

export interface NPC {
  id: string;
  name: string;
  temporaryName?: string;
  isNameRevealed: boolean;
  age: number;
  gender: string;
  realm: string;
  personality: string;
  background: string;
  status: 'alive' | 'dead';
  impression?: string;
}

export interface PlayerState {
  name: string;
  gender: 'Nam' | 'Nữ';
  realm: string;
  stage: string;
  realmLevel: number;
  tuVi: number;
  tuViCapacity: number;
  health: number;
  maxHealth: number;
  mana: number;
  maxMana: number;
  reputation: number;
  karma: number;
  background: string;
  talent: string;
  linhCan: string;
  inventory: InventoryItem[];
  history: GameHistoryItem[];
  currentLocation: string;
  chronicles: string;
  difficulty: Difficulty;
  storyLength: StoryLength;
  weather: WeatherType;
  isInitialized: boolean;
  isNsfwEnabled: boolean;
  isScenePopupEnabled: boolean;
  aiTier: 'flash' | 'pro';
  customApiKey?: string;
  preferCustomKey?: boolean;
  lastApiKeyStatus?: string;
  worldDescription?: string;
  environmentSummary?: string;
  npcSummary?: string;
  eventSummary?: string;
  lore?: {
    world: string;
    origin: string;
    majorArcs: string;
  };
}

export interface GameHistoryItem {
  story: string;
  actionTaken?: string;
  timestamp: number;
  metadata?: any;
}
