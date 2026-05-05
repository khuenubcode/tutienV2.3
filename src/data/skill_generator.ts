// =====================================================
// SKILL GENERATOR SYSTEM (Procedural Skills)
// =====================================================

import { ElementType, getReaction } from './element_system';
import { StatusEffectInstance, EffectsFactory } from './status_effect_system';

// =====================================================
// TYPES
// =====================================================

export type SkillType = 'ACTIVE' | 'PASSIVE';
export type TargetType = 'SINGLE' | 'AOE' | 'SELF';

export interface Skill {
  id: string;
  name: string;
  type: SkillType;
  element: ElementType | ElementType[];
  targetType: TargetType;
  baseDamage: number;
  scaling: number; // percentage scaling with attack/spirit (e.g., 120 for 120%)
  cost: number; // mana cost
  cooldown: number;
  effects?: StatusEffectInstance[];
  description: string;
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY' | 'MYTHIC';
  originTechnique?: string;
}

export interface GenerateSkillParams {
  level: number;
  elements: ElementType[];
  rarity?: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY' | 'MYTHIC';
  type?: 'OFFENSIVE' | 'DEFENSIVE' | 'UTILITY';
}

// =====================================================
// HELPERS
// =====================================================

let _id = Date.now();
function uid() {
  _id += 1;
  return `skill_${_id}`;
}

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(arr: T[]): T {
  if (!arr || arr.length === 0) return undefined as any;
  return arr[rand(0, arr.length - 1)];
}

// =====================================================
// NAME GENERATOR
// =====================================================

const PREFIX: Record<string, string[]> = {
  HOA: ['Xích Diễm', 'Hỏa Long', 'Phần Thiên', 'Liệt Dương'],
  THUY: ['Hàn Băng', 'Nhược Thủy', 'Lạc Hà', 'Thanh Hải'],
  MOC: ['Thanh Mộc', 'Trường Sinh', 'Bích Diệp', 'Thiên Liên'],
  KIM: ['Thái Ất', 'Canh Kim', 'Kiếm Khí', 'Bạch Đế'],
  THO: ['Huyền Vân', 'Thăng Long', 'Tứ Tượng', 'Địa Long'],
  LOI: ['Thiên Lôi', 'U Minh Lôi', 'Cửu Thiên', 'Tử Tiêu'],
  PHONG: ['Thần Phong', 'Toái Nguyệt', 'Hư Vô', 'Sát Na'],
  BANG: ['Vạn Niên', 'Cực Hàn', 'Tuyết Ảnh', 'Hàn Minh'],
  QUANG: ['Đại Nhật', 'Hạo Nhiên', 'Thánh Quang', 'Cực Lạc'],
  AM: ['Hoàng Tuyền', 'U Hồn', 'Quỷ Sát', 'Tịch Diệt'],
};

const SUFFIX = ['Trảm', 'Ấn', 'Chưởng', 'Kiếm', 'Bạo', 'Thuật', 'Lệnh', 'Finger', 'Burst', 'Wave'];

function generateName(elements: ElementType[]): string {
  const el = pick(elements);
  const prefix = pick(PREFIX[el] || ['Huyền', 'Thiên', 'Cổ']);
  const suffix = pick(SUFFIX);
  return `${prefix} ${suffix}`;
}

// =====================================================
// EFFECT GENERATOR
// =====================================================

function generateEffects(element: ElementType, level: number, rarityMultiplier: number): StatusEffectInstance[] {
  const effects: StatusEffectInstance[] = [];
  const power = level * rarityMultiplier;

  switch (element) {
    case 'HOA':
      effects.push(EffectsFactory.burn(Math.ceil(2 * power), 3));
      break;
    case 'THUY':
      effects.push(EffectsFactory.slow(Math.ceil(10 + power), 2));
      break;
    case 'LOI':
      if (Math.random() < 0.3 * rarityMultiplier) effects.push(EffectsFactory.stun(1));
      break;
    case 'BANG':
      if (Math.random() < 0.2 * rarityMultiplier) effects.push(EffectsFactory.freeze(1));
      break;
    case 'MOC':
      effects.push(EffectsFactory.poison(Math.ceil(3 * power), 4));
      break;
    case 'KIM':
      effects.push(EffectsFactory.bleed(Math.ceil(4 * power), 2));
      break;
    case 'THO':
      effects.push(EffectsFactory.fortify(Math.ceil(15 + power), 3));
      break;
    case 'PHONG':
      effects.push(EffectsFactory.slow(Math.ceil(5 + power), 2));
      break;
    case 'QUANG':
      effects.push(EffectsFactory.regen(Math.ceil(1 * power), 3));
      break;
    case 'AM':
      effects.push(EffectsFactory.curse(Math.ceil(5 + power), 3));
      break;
  }

  return effects;
}

// =====================================================
// MAIN GENERATOR
// =====================================================

export function generateSkill(params: GenerateSkillParams): Skill {
  const { level, elements = [], rarity = 'COMMON', type = 'OFFENSIVE' } = params;

  // Rarity Constants
  const RARITY_MAP = {
    'COMMON': { mult: 1.0, color: '#94a3b8', maxEffects: 1, aoeChance: 0.1 },
    'RARE': { mult: 1.15, color: '#3b82f6', maxEffects: 1, aoeChance: 0.12 },
    'EPIC': { mult: 1.3, color: '#a855f7', maxEffects: 1, aoeChance: 0.2 },
    'LEGENDARY': { mult: 1.6, color: '#f59e0b', maxEffects: 2, aoeChance: 0.35 },
    'MYTHIC': { mult: 2.0, color: '#ef4444', maxEffects: 2, aoeChance: 0.5 },
  };

  const rData = RARITY_MAP[rarity];
  
  // Element Bias
  let damageBias = 1.0;
  let costBias = 1.0;
  let cooldownBias = 1.0;

  if (elements.includes('HOA')) damageBias += 0.15;
  if (elements.includes('THO')) { damageBias -= 0.05; cooldownBias -= 0.1; }
  if (elements.includes('PHONG')) { damageBias -= 0.1; cooldownBias -= 0.15; }
  if (elements.includes('LOI')) { damageBias += 0.08; costBias += 0.15; }

  // Base Stats
  const basePower = level * 8; 
  const dmgRoll = rand(90, 110) / 100;
  const scaling = Math.floor(rand(90, 140) * rData.mult); 
  
  // AOE Logic influenced by rarity and level
  const baseAoeChance = rData.aoeChance;
  const levelAoeBonus = Math.min(0.2, level / 300); 
  const finalAoeChance = Math.min(0.9, baseAoeChance + levelAoeBonus + (elements.length > 1 ? 0.1 : 0));
  
  const targetType: TargetType = Math.random() < finalAoeChance ? 'AOE' : 'SINGLE';
  const targetMult = targetType === 'AOE' ? 0.7 : 1.0; 

  const baseDamage = Math.floor(basePower * dmgRoll * rData.mult); 
  
  // Balanced Cost/Cooldown - increase cost significance
  const powerScore = (baseDamage + (level * 10 * (scaling / 100))) * (targetType === 'AOE' ? 1.5 : 1);
  const cost = Math.max(15, Math.floor((powerScore / 2) * costBias));
  const cooldown = Math.max(1, Math.min(10, Math.floor((powerScore / 50) * cooldownBias)));

  // Effects
  let effects: StatusEffectInstance[] = [];
  const shuffledElements = [...elements].sort(() => Math.random() - 0.5);
  for (let i = 0; i < Math.min(shuffledElements.length, rData.maxEffects); i++) {
    effects = effects.concat(generateEffects(shuffledElements[i], level, rData.mult));
  }

  // Dual Element Synergy
  let description = `Công kích gây sát thương thuộc tính.`;
  if (elements.length >= 2) {
    const reaction = getReaction(elements[0], elements[1]);
    if (reaction.effect) {
      description += ` Kích hoạt cộng hưởng ${reaction.effect} (x${reaction.multiplier}).`;
    }
  }

  return {
    id: uid(),
    name: generateName(elements),
    type: 'ACTIVE',
    element: elements.length === 1 ? elements[0] : elements,
    targetType,
    baseDamage,
    scaling,
    cost,
    cooldown,
    effects,
    rarity,
    description: `${description} Tiêu hao ${cost} linh lực. Hồi chiêu ${cooldown} lượt.`
  };
}

// =====================================================
// EXAMPLE
// =====================================================
/*
const skill = generateSkill({
  level: 10,
  elements: ['HOA', 'LOI'],
  rarity: 'EPIC'
});

console.log(skill);
*/
