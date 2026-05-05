/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ElementType } from './data/element_system';
import { Skill } from './data/skill_generator';
import { BeastLevel, BeastInstinct } from './prompts/MindsetBeast';

export type { Skill };

export type RealmLevel = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
export type Difficulty = 'Dễ' | 'Thường' | 'Khó' | 'Hồng Hoang';
export type StoryLength = 'Ngắn' | 'Bình thường' | 'Dài';
export type WeatherType = 'Nắng' | 'Mưa' | 'Tuyết' | 'Sương mù' | 'U ám' | 'Sấm sét';
export interface Realm {
  name: string;
  level: number;
  description: string;
  stages: string[];
  stageMultipliers?: number[];
}

export type SectRank = 'NGOAI_MON' | 'NOI_MON' | 'NONG_COT' | 'TRUONG_LAO' | 'TONG_CHU';

export interface OrgRank {
  id: string;
  name: string;
  requirementReputation: number;
  perks: string[];
}

export interface Organization {
  id: string;
  name: string;
  type: 'Hộ Bảo' | 'Thương Nhân' | 'Ám Sát' | 'Nghiên Cứu' | 'Tự Do' | 'Hoàng Gia';
  tenet: string;
  description: string;
  ranks: OrgRank[];
  leader?: string;
  baseLocation?: string;
  requirements?: string[];
}

export interface Sect {
  id: string;
  name: string;
  align: 'Chính' | 'Tà' | 'Trung Lập' | 'Ma';
  tenet: string;
  specialty: string;
  description: string;
  requirements?: string[];
}

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
  startingReputation: Record<string, number>;
  passive: string;
}

export interface Recipe {
  id: string;
  name: string;
  materials: Record<string, number>;
  result: string;
  description: string;
  type?: 'Đan dược' | 'Trang bị' | 'Khác';
  difficulty?: number;
  requiredTuVi?: number;
}

export interface Domain {
  name: string;
  element: string;
  strength: number; // 0-100
  stability: number; // 0-100
  effects: {
    buffSelf: string[];
    debuffEnemy: string[];
  };
}

export interface InventoryItemBase {
  id: string;
  name: string;
  description: string;
  type: string;
  rarity: Rarity;
  amount: number;
  element?: ElementType;
  value?: number;
}

export interface EquipmentItem extends InventoryItemBase {
  type: string;
  stats?: {
    attack?: number;
    defense?: number;
    health?: number;
    mana?: number;
    speed?: number;
    accuracy?: number;
  };
}

export interface ConsumableItem extends InventoryItemBase {
  type: string;
  consumableEffects?: {
    hpRestore?: number;
    manaRestore?: number;
    tuViBonus?: number;
    maxHpIncrease?: number;
    maxManaIncrease?: number;
    breakthroughBonus?: number;
  };
}

export interface MaterialItem extends InventoryItemBase {
  type: string;
}

export type InventoryItem = EquipmentItem | ConsumableItem | MaterialItem;

// Helper Type Guards to maintain compatibility
export function isEquipment(item: InventoryItem): item is EquipmentItem {
  return item.type === 'EQUIPMENT' || item.type === 'TREASURE';
}
export function isConsumable(item: InventoryItem): item is ConsumableItem {
  return item.type === 'CONSUMABLE';
}
export function isMaterial(item: InventoryItem): item is MaterialItem {
  return item.type === 'MATERIAL' || item.type === 'ALCHEMY_INGREDIENT';
}

export interface NPC {
  id: string;
  name: string;
  temporaryName: string;
  isNameRevealed: boolean;
  alias?: string;
  nickname?: string;
  age: number;
  gender: string;
  style: string;
  powerLevel: string;
  realm: string;
  personality: string;
  innerSelf: string;
  background: string;
  faction: string;
  alignment: string;
  positionX?: number;
  positionY?: number;
  relationship: number; // Affinity 0-1000
  virginity: string;
  currentOutfit: string;
  eyeColor?: string;
  hairStyle?: string;
  clothing?: string;
  bodyDescription: Record<string, string>;
  libido: number;
  willpower: number;
  lust: number;
  fetish: string;
  sexualPreferences: string[];
  sexualArchetype: string;
  physicalLust: string;
  soulAmbition: string;
  shortTermGoal: string;
  longTermDream: string;
  mood: string;
  impression: string;
  currentOpinion: string;
  witnessedEvents: string[];
  knowledgeBase: string[];
  conditions: { name: string; type: 'temporary' | 'permanent'; description: string }[];
  network: { npcId: string; npcName: string; relation: string; description: string; affinity?: number }[];
  type: string; // Relationship with MC (e.g. "Chị gái", "Người lạ")
  inventory: InventoryItem[];
  skills: Skill[];
  combatSkills?: Skill[];
  element?: ElementType;
  voice: string;
  aura: string;
  physiologicalResponse: string;
  readinessState: string;
  iq?: number;
  mindset?: string;
  signaturePose: string;
  sensitivePoints: string;
  secrets: string;
  status: 'alive' | 'dead';
  powerScore?: number;
  attack?: number;
  defense?: number;
  maxHealth?: number;
  maxMana?: number;
  health?: number;
  mana?: number;
  speed?: number;
  accuracy?: number;
  luck?: number;
  domain?: Domain;
}

export interface RivalNPC {
  id: string;
  name: string;
  realm: string;
  luckScore: number; // 0-100, determines chance to find opportunities
  activeQuest: string; // Current opportunity they are chasing
  lastMetLocation: string;
  progress: number; // 0-100, how close they are to succeeding at their quest
}

export interface Beast {
  id: string;
  name: string;
  species: string;
  level: number;
  rarity: 'common' | 'rare' | 'elite' | 'boss';
  element: ElementType;
  habitat: string[];
  drops: string[];
  instinct: BeastInstinct;
  description: string;
  stats: {
    health: number;
    maxHealth: number;
    attack: number;
    defense: number;
    speed: number;
    accuracy: number;
    mana: number;
    maxMana: number;
  };
  talents: Skill[]; // Beasts use talents instead of techniques
  status: 'alive' | 'dead';
}

export type Rarity = 'Phàm' | 'Linh' | 'Huyền' | 'Địa' | 'Thiên' | 'Đạo' | 'Thần';

export interface Equipment {
  name: string;
  rarity: Rarity;
  tier: string;
  realm: string;
  type: string;
  origin: string;
  main_effect: string;
  sub_effect: string;
  restriction: string;
  sentience: {
    level: 'none' | 'weak' | 'active' | 'independent';
    note: string;
  };
  backlash: string;
  stats?: {
    attack?: number;
    defense?: number;
    health?: number;
    mana?: number;
    speed?: number;
    accuracy?: number;
  };
  evolution_paths: string[];
  fate_quest: {
    trigger: string;
    chain: string[];
  };
  lore_hook: string;
}

export interface ItemVariant {
  variantId: string;
  sentience: Equipment['sentience'];
  evolution_paths: Equipment['evolution_paths'];
  fate_quest: Equipment['fate_quest'];
  lore_hook: Equipment['lore_hook'];
}

export interface CanonicalItem {
  name: string;
  type: string;
  baseAttributes: Omit<Equipment, 'name' | 'sentience' | 'evolution_paths' | 'fate_quest' | 'lore_hook'>;
  variants: ItemVariant[];
}

export interface CultivationTechnique {
  id: string;
  name: string;
  tier: 'Phàm' | 'Linh' | 'Huyền' | 'Địa' | 'Thiên' | 'Đạo';
  path: 'Chính' | 'Ma' | 'Thể' | 'Hồn' | 'Kiếm' | 'Dị';
  element: ElementType[];
  level: number;
  maxLevel: number;
  experience: number;
  isActive: boolean;
  core: {
    description?: string; // Tạm giữ để tương thích ngược
    origin?: string;
    characteristics?: string;
    focus: 'Body' | 'Spirit' | 'Foundation' | 'Balanced';
  };
  circulation: {
    type: 'Tiểu Chu Thiên' | 'Đại Chu Thiên' | 'Nghịch';
    efficiency: number;
  };
  effects: {
    passive: string[];
    active: string[];
    stats?: {
      attackMult?: number;
      defenseMult?: number;
      healthMult?: number;
    };
  };
  cost: {
    risk: string;
    lifespan: number;
    requirements: string[];
  };
  mastery: {
    refinement: number;
    application: number;
  };
  evolution: {
    canMutate: boolean;
    direction: string[];
  };
}

export interface MapRegion {
  id: string; // Unique identifier (e.g. 'continent_east', 'sect_thanh_van')
  type: 'Continent' | 'City' | 'Sect' | 'Mountain' | 'Forest' | 'River' | 'Sea' | 'Dungeon' | 'ForbiddenZone' | 'Village' | 'Cave' | 'Island';
  dangerLevel: 'Safe' | 'Neutral' | 'Danger' | 'Extreme';
  continentId?: string; // ID of the parent continent if applicable
  tierId: string;
  name: string;
  discovered: boolean;
  description: string;
  positionX?: number;
  positionY?: number;
  linhKhi: string;
  cap: string; // Max realm limit
  terrain: string;
  difficulty: number; // 1-10
  commonBeasts: string[];
  connectedRegionIds: string[];
  ownerFaction?: string;
}

export interface Vector2D {
  x: number;
  y: number;
}

export interface Projectile {
  id: string;
  sourceId: string;
  targetId: string;
  position: Vector2D;
  velocity?: Vector2D;
  speed: number;
  damage: number;
  accuracy: number;
  element: ElementType;
  isCrit: boolean;
  skillId: string;
  effects?: StatusEffectInstance[];
}

import { StatusEffectInstance } from './data/status_effect_system';

export interface CombatUnit {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  mana: number;
  maxMana: number;
  attack: number;
  defense: number;
  speed: number;
  accuracy: number;
  critChance?: number;
  critDamage?: number;
  luck: number; // Added luck
  element: ElementType;
  skills: Skill[];
  isPlayer: boolean;
  isAlive: boolean;
  realmLevel: number;
  cooldowns: Record<string, number>; // Maps skill ID to timestamp when it becomes available again
  activeEffects: StatusEffectInstance[];
  isBeast?: boolean;
  beastData?: {
    level: BeastLevel;
    instinct: BeastInstinct;
    habitat: string[];
  };
  position: Vector2D;
  targetPosition?: Vector2D; // where the unit wants to move
  actionTimer: number; // For AI decision intervals
  lastTickTime?: number; // Internal for effect processing
  hitboxSize?: number; // Visual hitbox size for hit detection
  isEscaping?: boolean; // Tactic to run away
}

export interface CombatState {
  participants: CombatUnit[];
  projectiles: Projectile[];
  logs: string[];
  isFinished: boolean;
  winnerId?: string;
  lastUpdate: number;
  rewards?: InventoryItem[];
  rewardsClaimed?: boolean;
}

export interface ChronicleEntry {
  id: string;
  timestamp: number;
  title: string;
  content: string;
  importance: 'common' | 'important' | 'monumental';
  category: 'player_choice' | 'fate' | 'world' | 'combat';
}

export interface Mission {
  id: string;
  name: string;
  description: string;
  type: 'Sect' | 'Organization' | 'World';
  source: string; // Sect or Org name
  status: 'active' | 'completed' | 'failed' | 'in_progress' | 'ready_to_turn_in';
  rewardContribution: number;
  rewardReputation: number;
  rewardItems: string[];
  acceptedAt: number;
  targetLocation?: string; 
  progress?: number; 
  details?: string; // AI generated content
}

export interface PlayerState {
  name: string;
  realm: string;
  stage: string;
  realmLevel: number;
  body: number;
  spirit: number;
  foundation: number;
  spiritualRoot: {
    purity: number;
    type: string;
  };
  linhCan: string;
  talent: string;
  background: string;
  tuVi: number;
  tuViCapacity: number;
  daoTam: number; // Added Dao Tâm stat
  alchemyLevel: number;
  alchemyExp: number;
  breakthroughChance: number;
  breakthroughBonus: number; // Modifiers from failures/successes
  cultivationFocus: 'Body' | 'Spirit' | 'Foundation' | 'Balanced';
  health: number;
  maxHealth: number;
  mana: number;
  maxMana: number;
  reputation: number;
  karma: number;
  factionsReputation: Record<string, number>;
  knownFactions: string[];
  resources: Record<string, number>;
  knownRecipes: string[];
  inventory: InventoryItem[];
  activeMissions: Mission[];
  skills: Skill[];
  masteredTechniques: CultivationTechnique[];
  element?: ElementType;
  combatSkills?: Skill[];
  domain?: Domain;
  powerScore: number;
  attack: number;
  defense: number;
  speed: number;
  accuracy: number;
  critChance: number;
  critDamage: number;
  luck: number;
  equipment: Equipment[];
  equippedItems: {
    weapon?: Equipment;
    armor?: Equipment;
    accessory?: Equipment;
  };
  assets: { name: string; description: string }[];
  identities: string[];
  history: GameHistoryItem[];
  npcs: NPC[];
  rivalNPCs: RivalNPC[];
  currentLocation: string;
  currentSect?: string;
  currentOrg?: string; // For loose organizations
  sectRank?: SectRank;
  orgRank?: string; // Current rank ID in organization
  memberTrials: Record<string, boolean>; // Sect/Org name -> completed
  metNPCs: Record<string, boolean>; // Sect/Org name -> met NPC
  sectContribution: number;
  orgContribution: number; // Contribution points for organizations
  positionX?: number;
  positionY?: number;
  aiContext: AIContext;
  chronicles: string;
  chronicleEntries: ChronicleEntry[];
  mapData?: MapRegion[];
  worldEquipments?: Equipment[];
  worldTechniques?: CultivationTechnique[];
  worldNPCs?: NPC[];
  worldBeasts?: any[];
  timeline: any; // Using any for now to avoid circular import or define it here
  gender: 'Nam' | 'Nữ';
  difficulty: Difficulty;
  customApiKey?: string;
  storyLength: StoryLength;
  weather: WeatherType;
  isInitialized: boolean;
  isNsfwEnabled: boolean;
  isCombat: boolean;
  combatState?: CombatState;
}

export interface GameHistoryItem {
  story: string;
  actionTaken?: string;
  timestamp: number;
  metadata?: {
    learnedTechnique?: string;
    foundEquipment?: string;
    realmUpgrade?: string;
  };
}

export interface AIContext {
  summary: string;
  recentKeyEvents: ChronicleEntry[];
  activeGoals: string[];
  notableNPCs: Record<string, string>;
}
