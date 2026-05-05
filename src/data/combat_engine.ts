// =====================================================
// COMBAT ENGINE (Turn-based, pluggable with element & status systems)
// =====================================================

import {
  ElementType,
  computeFinalDamage,
  CombatContext
} from './element_system';

import {
  StatusEffectManager,
  StatusEffectInstance,
  UnitSnapshot,
  getIncomingDamageMultiplier,
  getModifiedDefense,
  getModifiedSpeed,
  isHardControlled
} from './status_effect_system';

import { Skill } from './skill_generator';

// =====================================================
// TYPES
// =====================================================

export interface CombatUnit extends UnitSnapshot {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  mana: number;
  maxMana: number;
  element: ElementType;
  skills: Skill[];
  alive: boolean;
  cooldowns: Record<string, number>; // Maps skill ID to turn index when it becomes available
  stats: {
    attack: number;
    defense: number;
    speed: number;
    stability: number;
    critChance?: number;
    critDamage?: number;
  };
  luck: number;
  realmLevel: number;
}

export interface ActionResult {
  logs: string[];
}

export interface TurnOrderEntry {
  unitId: string;
  speed: number;
}

// =====================================================
// ENGINE
// =====================================================

export class CombatEngine {
  private units: Map<string, CombatUnit> = new Map();
  private status = new StatusEffectManager();
  private tickCount = 0;

  constructor(units: CombatUnit[]) {
    for (const u of units) {
      this.units.set(u.id, { ...u, alive: true });
      this.status.clear(u.id);
    }
  }

  // -----------------------------
  // TURN ORDER
  // -----------------------------
  private buildTurnOrder(): TurnOrderEntry[] {
    const order: TurnOrderEntry[] = [];

    for (const u of this.units.values()) {
      if (!u.alive) continue;
      const effects = this.status.get(u.id);
      const speed = getModifiedSpeed(u.stats.speed, effects);
      order.push({ unitId: u.id, speed });
    }

    return order.sort((a, b) => b.speed - a.speed);
  }

  // -----------------------------
  // MAIN LOOP (1 ROUND)
  // -----------------------------
  runRound(): ActionResult {
    const logs: string[] = [];
    const order = this.buildTurnOrder();

    for (const entry of order) {
      const unit = this.units.get(entry.unitId);
      if (!unit || !unit.alive) continue;

      const effects = this.status.get(unit.id);

      // Regenerate tiny mana per turn
      unit.mana = Math.min(unit.maxMana, unit.mana + Math.ceil(unit.maxMana * 0.05));

      // Hard CC check
      if (isHardControlled(effects)) {
        logs.push(`${unit.name} bị khống chế, bỏ lượt.`);
        continue;
      }

      // choose skill (simple AI: pick best available)
      const skill = this.chooseSkill(unit);
      
      // If skill found and has cost
      if (skill.cost > 0) {
        unit.mana -= skill.cost;
      }
      if (skill.cooldown > 0) {
        unit.cooldowns[skill.id] = this.tickCount + skill.cooldown;
      }

      const targets = this.chooseTargets(unit, skill);

      for (const target of targets) {
        if (!target.alive) continue;

        const dmg = this.applySkill(unit, target, skill, logs);
        target.hp -= dmg;

        if (target.hp <= 0) {
          target.alive = false;
          logs.push(`${target.name} bị hạ gục.`);
        }
      }
    }

    // tick status after actions
    this.tickAll(logs);

    this.tickCount++;
    return { logs };
  }

  // -----------------------------
  // SKILL LOGIC
  // -----------------------------

  private chooseSkill(unit: CombatUnit): Skill {
    const basicAttack: Skill = {
      id: 'basic_attack',
      name: 'Tấn công cơ bản',
      type: 'ACTIVE',
      description: 'Tấn công vật lý thông thường',
      baseDamage: Math.ceil(unit.stats.attack * 0.2),
      scaling: 1.0,
      cost: 0,
      cooldown: 0,
      targetType: 'SINGLE',
      element: 'VẬT LÝ',
      rarity: 'COMMON'
    };

    const skills = (unit.skills || []).filter(s => {
      const cooldownFinish = unit.cooldowns[s.id] || 0;
      return cooldownFinish <= this.tickCount && unit.mana >= (s.cost || 0);
    });

    if (skills.length === 0) return basicAttack;

    const hpPercent = unit.hp / unit.maxHp;
    
    // If low HP, highly prioritize defensive / healing skills if available
    if (hpPercent < 0.4) {
      const defensiveSkills = skills.filter(s => s.effects?.some(e => e.type === 'REGEN' || e.type === 'FORTIFY'));
      if (defensiveSkills.length > 0) {
         return defensiveSkills[Math.floor(Math.random() * defensiveSkills.length)];
      }
    }

    // Prefer high damage, add some variance
    skills.sort((a, b) => (b.baseDamage || 0) - (a.baseDamage || 0));
    
    // 70% chance to use the best skill, 30% chance to use the second best
    if (skills.length > 1 && Math.random() < 0.3) {
      return skills[1];
    }
    return skills[0];
  }

  private chooseTargets(unit: CombatUnit, skill: Skill): CombatUnit[] {
    const enemies = Array.from(this.units.values()).filter(
      u => u.id !== unit.id && u.alive
    );

    if (enemies.length === 0) return [];
    if (skill.targetType === 'AOE') return enemies;
    
    // For single target, focus the one with the lowest current HP
    enemies.sort((a, b) => a.hp - b.hp);
    return [enemies[0]];
  }

  private applySkill(
    attacker: CombatUnit,
    defender: CombatUnit,
    skill: Skill,
    logs: string[]
  ): number {
    const atkEffects = this.status.get(attacker.id);
    const defEffects = this.status.get(defender.id);

    const defMultiplier = getIncomingDamageMultiplier(defEffects);
    const defense = getModifiedDefense(defender.stats.defense, defEffects);

    const ctx: CombatContext = {
      attacker: {
        affinity: {},
        power: {},
        resist: {},
        penetration: {}
      },
      defender: {
        affinity: {},
        power: {},
        resist: {},
        penetration: {}
      },
      attackerElement: Array.isArray(skill.element)
        ? skill.element[0]
        : skill.element,
      defenderElement: defender.element,
      baseDamage: attacker.stats.attack * (skill.scaling || 1.0)
    };

    const atk = attacker.stats.attack;
    const def = getModifiedDefense(defender.stats.defense, defEffects);
    
    // Final Damage Formula: (AttackerAtk * Scaling) * DefenseReduc
    const skillDamage = atk * (skill.scaling || 1.0);
    const defenseReduc = 200 / (200 + def);
    let damage = skillDamage * defenseReduc;
    
    // Realm gap
    const realmGap = (attacker.realmLevel || 0) - (defender.realmLevel || 0);
    damage *= (1 + realmGap * 0.05);

    // Critical Hit calculation
    let isCrit = false;
    const luck = attacker.luck || 0;
    const realm = attacker.realmLevel || 0;
    const critChance = Math.min(0.3, luck * 0.01) * 100;
    
    if (Math.random() * 100 < critChance) {
      isCrit = true;
      const critDamage = 1.3 + realm * 0.03;
      damage *= critDamage;
    }

    // apply status effects
    if (skill.effects) {
      for (const e of skill.effects) {
        this.status.apply(defender, { ...e });
      }
    }

    const finalDamage = Math.max(1, Math.floor(damage * (0.9 + Math.random() * 0.2)));
    
    logs.push(
      `${attacker.name} dùng ${skill.name} → ${defender.name} chịu ${finalDamage}${isCrit ? ' (BẠO KÍCH!)' : ''} sát thương`
    );

    return finalDamage;
  }

  // -----------------------------
  // STATUS TICK
  // -----------------------------

  private tickAll(logs: string[]) {
    for (const u of this.units.values()) {
      if (!u.alive) continue;

      const res = this.status.tick(u, { now: this.tickCount, delta: 1 });

      if (res.damage) {
        u.hp -= res.damage;
        logs.push(`${u.name} chịu ${Math.floor(res.damage)} sát thương từ hiệu ứng.`);
      }

      if (res.heal) {
        u.hp = Math.min(u.maxHp, u.hp + res.heal);
        logs.push(`${u.name} hồi ${Math.floor(res.heal)} HP.`);
      }

      if (u.hp <= 0) {
        u.alive = false;
        logs.push(`${u.name} đã ngã xuống do tác động tiêu cực.`);
      }
    }
  }

  // -----------------------------
  // UTIL
  // -----------------------------

  isCombatFinished(): boolean {
    const alive = Array.from(this.units.values()).filter(u => u.alive);
    return alive.length <= 1;
  }

  getWinner(): CombatUnit | null {
    const alive = Array.from(this.units.values()).filter(u => u.alive);
    return alive.length === 1 ? alive[0] : null;
  }
}

// =====================================================
// EXAMPLE
// =====================================================
/*
const engine = new CombatEngine([unitA, unitB]);

while (!engine.isCombatFinished()) {
  const res = engine.runRound();
  console.log(res.logs);
}

console.log('Winner:', engine.getWinner());
*/
