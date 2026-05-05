// ======================================
// CORE STATS SYSTEM (HP / MP / ATK / DEF)
// ======================================

export const STATS_SYSTEM_PROMPT = `
You are an AI that calculates core combat stats of cultivators.

# INPUT

{
  "realm": number, // 1-8

  "body": number,      // thể chất (0-100)
  "spirit": number,    // thần thức (0-100)
  "foundation": number,// căn cơ (0-100)

  "spiritualRoot": {
    "purity": number
  },

  "technique": {
    "tier": number,
    "circulationEfficiency": number,
    "mastery": {
      "refinement": number,
      "application": number
    }
  }
}

# OUTPUT

{
  "hp": number,
  "mp": number,
  "attack": number,
  "defense": number
}

# CALCULATION

## 1. REALM SCALE
realmScale = realm ^ 2

## 2. HP (SINH MỆNH)
hp =
  (body * 10 + foundation * 5) *
  realmScale *
  (1 + (technique.mastery?.refinement || 0) / 200)

## 3. MP (LINH LỰC)
mp =
  (spirit * 12 + foundation * 4) *
  realmScale *
  (1 + (technique.circulationEfficiency || 0) / 100)

## 4. ATTACK (CÔNG)
attack =
  (spirit * 6 + body * 4) *
  (technique.tier || 1) *
  (1 + (technique.mastery?.application || 0) / 150)

## 5. DEFENSE (THỦ)
defense =
  (body * 8 + foundation * 6) *
  (1 + (technique.mastery?.refinement || 0) / 150)

# BALANCE RULES

- High HP → slower combat style
- High MP → skill-dependent
- High attack → fragile if body low
- High defense → low burst

# NOTES

- Foundation stabilizes everything
- Refinement boosts defense & HP
- Application boosts attack
- Circulation boosts MP

`;

export function calculateCoreStats(data: {
  realm: number;
  body: number;
  spirit: number;
  foundation: number;
  spiritualRoot: { purity: number };
  stageMultiplier?: number;
}) {
  // Remove the old realmScale calculation.
  // Use requested formula: 
  // HP = baseHP * (1 + realm^1.3)
  // MP = baseMP * (1 + realm^1.4)
  // ATK = baseATK * (1 + realm^1.25)
  // DEF = baseDEF * (1 + realm^1.35)

  const mult = data.stageMultiplier || 1.0;

  const rawBaseHp = (100 + data.body * 10 + data.foundation * 5) * mult;
  const rawBaseMp = (50 + data.spirit * 12 + data.foundation * 4) * mult;
  const rawBaseAtk = (20 + data.spirit * 6 + data.body * 4) * mult;
  const rawBaseDef = (15 + data.body * 8 + data.foundation * 6) * mult;

  const applySoftCap = (stat: number, cap: number = 1000000) => stat; // Removed softcap to allow infinite scalinig. Wait, the original code had it. Let's keep it but larger.
  // Actually, I'll keep the soft cap calculation from the original code exactly, but just scale the rawBase.
  const applySoftCapOriginal = (stat: number, cap: number = 1000000) => stat / (1 + stat / cap);

  const maxHealth = Math.floor(
    applySoftCapOriginal(rawBaseHp * (1 + Math.pow(data.realm, 1.3)))
  );

  const maxMana = Math.floor(
    applySoftCapOriginal(rawBaseMp * (1 + Math.pow(data.realm, 1.4)))
  );

  const attack = Math.floor(
    applySoftCapOriginal(rawBaseAtk * (1 + Math.pow(data.realm, 1.25)))
  );
 
  const defense = Math.floor(
    applySoftCapOriginal(rawBaseDef * (1 + Math.pow(data.realm, 1.35)))
  );

  return { maxHealth, maxMana, attack, defense };
}

/**
 * Generic calculation for NPCs/Mobs where detailed stats might be missing
 */
export function calculateNPCStats(data: {
  realm: number;
  powerFactor?: number; // 0.5 - 2.0
}) {
  const factor = data.powerFactor || 1.0;
  // Assume average stats for an NPC of that realm
  const base = {
    realm: data.realm,
    body: 50 * factor,
    spirit: 50 * factor,
    foundation: 50 * factor,
    spiritualRoot: { purity: 50 }
  };
  
  const baseStats = calculateCoreStats(base);
  
  // Apply generic technique bonuses for NPCs
  // NPCs at higher realms should have better techniques automatically
  let tierValue = 1.0;
  if (data.realm >= 8) tierValue = 6.0;
  else if (data.realm >= 6) tierValue = 3.5;
  else if (data.realm >= 4) tierValue = 2.0;
  else if (data.realm >= 2) tierValue = 1.3;

  const tierMult = tierValue * (0.85 + factor * 0.3); 
  const masteryMult = 1 + (data.realm * 0.05);

  return {
    maxHealth: Math.floor(baseStats.maxHealth * (1 + data.realm * 0.5) * factor),
    maxMana: Math.floor(baseStats.maxMana * (1 + data.realm * 0.2)),
    attack: Math.floor(baseStats.attack * tierMult * masteryMult),
    defense: Math.floor(baseStats.defense * (1 + data.realm * 0.3) * masteryMult)
  };
}

/**
 * Beasts have higher HP scaling based on bloodline (1.1x to 2.0x)
 */
export function calculateBeastStats(data: {
  level: number;
  bloodline: number; // 0.0 - 1.0
  basePower?: number; // 0.5 - 2.0
  bloodlineType?: string; // 'Phàm Huyết' | 'Linh Huyết' | 'Cổ Huyết' | 'Thần Huyết' | 'Thánh Huyết'
}) {
  const factor = (data.basePower || 1.0);
  const baseStats = calculateNPCStats({ 
    realm: data.level, 
    powerFactor: factor 
  });
  
  // Base bloodline multiplier for legacy
  let hpMult = 1.1 + (data.bloodline * 0.9);
  let atkMult = 1.1;
  let defMult = 1.2;
  let spdMult = 1.0;

  // Modern string-based bloodlines (overrides array length)
  switch (data.bloodlineType) {
    case 'Phàm Huyết':
      hpMult = 1.2; atkMult = 1.0; defMult = 1.0; spdMult = 1.0;
      break;
    case 'Linh Huyết':
      hpMult = 1.5; atkMult = 1.2; defMult = 1.2; spdMult = 1.1;
      break;
    case 'Cổ Huyết':
      hpMult = 2.0; atkMult = 1.5; defMult = 1.5; spdMult = 1.2;
      break;
    case 'Thần Huyết':
      hpMult = 3.5; atkMult = 2.5; defMult = 2.0; spdMult = 1.5;
      break;
    case 'Thánh Huyết':
      hpMult = 5.0; atkMult = 4.0; defMult = 3.0; spdMult = 2.0;
      break;
    default:
      break;
  }

  // Speed calculation logic
  const baseSpeed = 15 + (data.level * 2) + Math.floor(baseStats.maxHealth / 100);
  const finalSpeed = Math.floor(baseSpeed * spdMult);
  
  return {
    ...baseStats,
    maxHealth: Math.floor(baseStats.maxHealth * hpMult),
    attack: Math.floor(baseStats.attack * atkMult), 
    defense: Math.floor(baseStats.defense * defMult),
    speed: finalSpeed
  };
}
