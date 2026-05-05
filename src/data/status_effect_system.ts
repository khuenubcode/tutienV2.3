// =====================================================
// STATUS EFFECT SYSTEM (DoT, CC, Debuff, Buff hooks)
// =====================================================

export type StatusEffectType =
  | 'BURN'        // damage over time (fire)
  | 'FREEZE'      // hard CC (skip turns / no action)
  | 'STUN'        // interrupt / skip action (short)
  | 'CURSE'       // % stat reduction / incoming amp
  | 'SLOW'        // speed reduction
  | 'SHOCK'       // chance to chain/interrupt
  | 'POISON'      // stacking DoT (wood/venom)
  | 'BLEED'       // physical DoT ignoring part of resist
  | 'FORTIFY'     // defensive buff
  | 'REGEN';      // heal over time

export interface StatusEffectInstance {
  id: string;                    // unique instance id
  type: StatusEffectType;
  sourceId?: string;             // caster/source
  element?: string;              // optional link to element
  duration: number;              // in ticks/turns
  maxDuration?: number;          // cap for refresh logic
  stacks?: number;               // stack count
  maxStacks?: number;
  potency: number;               // generic strength (e.g. % or flat)
  interval?: number;             // tick interval (default 1)
  nextTickAt?: number;           // internal scheduler
  flags?: Partial<{
    dispellable: boolean;
    refreshable: boolean;        // reapply refresh duration
    stackable: boolean;          // can stack
    unique: boolean;             // only one instance allowed
    ignoreResist: boolean;       // e.g. bleed
    control: boolean;            // CC flag
  }>;
}

export interface UnitSnapshot {
  id: string;
  hp: number;
  maxHp: number;
  mp?: number;
  stats: {
    attack: number;
    defense: number;
    speed: number;
    stability: number; // resist CC
  };
  resist?: Partial<Record<StatusEffectType, number>>; // %
}

export interface TickContext {
  now: number; // current tick index
  delta: number; // tick step (usually 1)
}

export interface EffectResult {
  damage?: number;
  heal?: number;
  applied?: StatusEffectInstance[];
  removed?: string[]; // ids removed
  interrupts?: boolean; // caused interrupt this tick
}

// =====================================================
// HELPERS
// =====================================================

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

function chance(pct: number): boolean {
  return Math.random() * 100 < pct;
}

function applyResist(value: number, resistPct = 0, ignore = false) {
  if (ignore) return value;
  return value * (1 - clamp(resistPct, 0, 90) / 100);
}

// =====================================================
// FACTORIES (create effects)
// =====================================================

let _id = 0;
function uid() {
  _id += 1;
  return `se_${_id}`;
}

export const EffectsFactory = {
  burn(potency: number, duration: number): StatusEffectInstance {
    return {
      id: uid(),
      type: 'BURN',
      duration,
      maxDuration: duration,
      stacks: 1,
      maxStacks: 5,
      potency, // % maxHp per tick (e.g. 1.5 => 1.5%)
      interval: 1,
      nextTickAt: 0,
      flags: { dispellable: true, refreshable: true, stackable: true }
    };
  },

  freeze(duration: number): StatusEffectInstance {
    return {
      id: uid(),
      type: 'FREEZE',
      duration,
      potency: 1,
      interval: 1,
      nextTickAt: 0,
      flags: { dispellable: true, control: true, unique: true }
    };
  },

  stun(duration: number): StatusEffectInstance {
    return {
      id: uid(),
      type: 'STUN',
      duration,
      potency: 1,
      interval: 1,
      nextTickAt: 0,
      flags: { dispellable: true, control: true, unique: false }
    };
  },

  curse(potency: number, duration: number): StatusEffectInstance {
    return {
      id: uid(),
      type: 'CURSE',
      duration,
      potency, // % increased damage taken
      interval: 1,
      nextTickAt: 0,
      flags: { dispellable: true, refreshable: true }
    };
  },

  slow(potency: number, duration: number): StatusEffectInstance {
    return {
      id: uid(),
      type: 'SLOW',
      duration,
      potency, // % speed reduction
      interval: 1,
      nextTickAt: 0,
      flags: { dispellable: true }
    };
  },

  shock(potency: number, duration: number): StatusEffectInstance {
    return {
      id: uid(),
      type: 'SHOCK',
      duration,
      potency, // % chance to interrupt per tick
      interval: 1,
      nextTickAt: 0,
      flags: { dispellable: true }
    };
  },

  poison(potency: number, duration: number): StatusEffectInstance {
    return {
      id: uid(),
      type: 'POISON',
      duration,
      maxDuration: duration,
      stacks: 1,
      maxStacks: 10,
      potency, // flat dmg per tick scaled by stacks
      interval: 1,
      nextTickAt: 0,
      flags: { dispellable: true, stackable: true, refreshable: true }
    };
  },

  bleed(potency: number, duration: number): StatusEffectInstance {
    return {
      id: uid(),
      type: 'BLEED',
      duration,
      potency, // % attack per tick
      interval: 1,
      nextTickAt: 0,
      flags: { dispellable: true, ignoreResist: true }
    };
  },

  fortify(potency: number, duration: number): StatusEffectInstance {
    return {
      id: uid(),
      type: 'FORTIFY',
      duration,
      potency, // % defense up
      interval: 1,
      nextTickAt: 0,
      flags: { dispellable: true }
    };
  },

  regen(potency: number, duration: number): StatusEffectInstance {
    return {
      id: uid(),
      type: 'REGEN',
      duration,
      potency, // % maxHp per tick
      interval: 1,
      nextTickAt: 0,
      flags: { dispellable: true }
    };
  }
};

// =====================================================
// MANAGER
// =====================================================

export class StatusEffectManager {
  private effects: Map<string, StatusEffectInstance[]> = new Map();

  get(unitId: string) {
    return this.effects.get(unitId) || [];
  }

  clear(unitId: string) {
    this.effects.set(unitId, []);
  }

  apply(unit: UnitSnapshot, incoming: StatusEffectInstance): EffectResult {
    const list = this.get(unit.id).slice();

    // resist roll for control effects
    if (incoming.flags?.control) {
      const resist = unit.resist?.[incoming.type] || 0;
      const chanceToApply = clamp(100 - resist - unit.stats.stability, 5, 95);
      if (!chance(chanceToApply)) {
        return { applied: [] };
      }
    }

    // unique handling
    if (incoming.flags?.unique) {
      const idx = list.findIndex(e => e.type === incoming.type);
      if (idx >= 0) {
        // refresh or replace
        if (incoming.flags?.refreshable) {
          list[idx].duration = Math.max(
            list[idx].duration,
            incoming.duration
          );
        } else {
          list[idx] = incoming;
        }
        this.effects.set(unit.id, list);
        return { applied: [incoming] };
      }
    }

    // stacking
    if (incoming.flags?.stackable) {
      const same = list.find(e => e.type === incoming.type);
      if (same) {
        same.stacks = clamp((same.stacks || 1) + 1, 1, same.maxStacks || 999);
        if (incoming.flags?.refreshable && same.maxDuration) {
          same.duration = same.maxDuration;
        }
        this.effects.set(unit.id, list);
        return { applied: [same] };
      }
    }

    // default push
    list.push(incoming);
    this.effects.set(unit.id, list);
    return { applied: [incoming] };
  }

  dispel(unitId: string, types?: StatusEffectType[]): EffectResult {
    const list = this.get(unitId);
    const remain: StatusEffectInstance[] = [];
    const removed: string[] = [];

    for (const e of list) {
      const match = !types || types.includes(e.type);
      if (match && e.flags?.dispellable !== false) {
        removed.push(e.id);
      } else {
        remain.push(e);
      }
    }

    this.effects.set(unitId, remain);
    return { removed };
  }

  // Per-tick processing
  tick(unit: UnitSnapshot, ctx: TickContext): EffectResult {
    const list = this.get(unit.id);
    const next: StatusEffectInstance[] = [];

    let totalDamage = 0;
    let totalHeal = 0;
    let interrupted = false;

    for (const e of list) {
      const interval = e.interval ?? 1;
      const shouldTick = (e.nextTickAt ?? 0) <= ctx.now;

      if (shouldTick) {
        const res = this.processEffect(unit, e);
        totalDamage += res.damage || 0;
        totalHeal += res.heal || 0;
        if (res.interrupts) interrupted = true;

        e.nextTickAt = ctx.now + interval;
      }

      // decrease duration after processing
      e.duration -= ctx.delta;
      if (e.duration > 0) next.push(e);
    }

    this.effects.set(unit.id, next);

    return {
      damage: Math.floor(totalDamage),
      heal: Math.floor(totalHeal),
      interrupts: interrupted
    };
  }

  private processEffect(unit: UnitSnapshot, e: StatusEffectInstance): EffectResult {
    const resist = unit.resist?.[e.type] || 0;

    switch (e.type) {
      case 'BURN': {
        const stacks = e.stacks || 1;
        const dmg = (unit.maxHp * (e.potency / 100)) * stacks;
        return { damage: applyResist(dmg, resist) };
      }

      case 'POISON': {
        const stacks = e.stacks || 1;
        const dmg = e.potency * stacks;
        return { damage: applyResist(dmg, resist) };
      }

      case 'BLEED': {
        const dmg = unit.stats.attack * (e.potency / 100);
        return { damage: applyResist(dmg, resist, e.flags?.ignoreResist) };
      }

      case 'REGEN': {
        const heal = unit.maxHp * (e.potency / 100);
        return { heal };
      }

      case 'CURSE': {
        // applied as modifier in damage pipeline (handled externally)
        return {};
      }

      case 'SLOW': {
        return {};
      }

      case 'FORTIFY': {
        return {};
      }

      case 'FREEZE': {
        return { interrupts: true };
      }

      case 'STUN': {
        return { interrupts: true };
      }

      case 'SHOCK': {
        const interruptChance = clamp(e.potency, 0, 100);
        return { interrupts: chance(interruptChance) };
      }

      default:
        return {};
    }
  }
}

// =====================================================
// INTEGRATION HELPERS
// =====================================================

// Compute outgoing damage modifier from statuses like CURSE on defender
export function getIncomingDamageMultiplier(effects: StatusEffectInstance[]): number {
  let mul = 1;
  for (const e of effects) {
    if (e.type === 'CURSE') {
      mul *= 1 + e.potency / 100;
    }
  }
  return mul;
}

// Compute speed after SLOW
export function getModifiedSpeed(base: number, effects: StatusEffectInstance[]): number {
  let speed = base;
  for (const e of effects) {
    if (e.type === 'SLOW') {
      speed *= 1 - e.potency / 100;
    }
  }
  return Math.max(1, Math.floor(speed));
}

// Compute defense after FORTIFY
export function getModifiedDefense(base: number, effects: StatusEffectInstance[]): number {
  let def = base;
  for (const e of effects) {
    if (e.type === 'FORTIFY') {
      def *= 1 + e.potency / 100;
    }
  }
  return Math.floor(def);
}

// Check if unit is hard-CCed (cannot act)
export function isHardControlled(effects: StatusEffectInstance[]): boolean {
  return effects.some(e => e.type === 'FREEZE' || e.type === 'STUN');
}

// =====================================================
// EXAMPLE
// =====================================================
/*
const mgr = new StatusEffectManager();
const unit: UnitSnapshot = {
  id: 'u1',
  hp: 5000,
  maxHp: 5000,
  stats: { attack: 300, defense: 200, speed: 120, stability: 20 },
  resist: { BURN: 10 }
};

mgr.apply(unit, EffectsFactory.burn(1.5, 5));
mgr.apply(unit, EffectsFactory.poison(30, 4));

for (let t = 0; t < 6; t++) {
  const res = mgr.tick(unit, { now: t, delta: 1 });
  console.log('tick', t, res);
}
*/
