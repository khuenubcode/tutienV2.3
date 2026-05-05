import { Equipment, CanonicalItem, ItemVariant } from '../types';

export const canonicalizeItems = (items: Equipment[]): CanonicalItem[] => {
  const canonicalMap: Record<string, CanonicalItem> = {};

  items.forEach((item, index) => {
    if (!canonicalMap[item.name]) {
      canonicalMap[item.name] = {
        name: item.name,
        type: item.type,
        baseAttributes: {
          rarity: item.rarity,
          tier: item.tier,
          realm: item.realm,
          origin: item.origin,
          main_effect: item.main_effect,
          sub_effect: item.sub_effect,
          restriction: item.restriction,
          backlash: item.backlash,
          stats: item.stats,
          type: item.type
        },
        variants: []
      };
    }

    const variant: ItemVariant = {
      variantId: `${item.name.replace(/\s+/g, '_').toLowerCase()}_${index}`,
      sentience: item.sentience,
      evolution_paths: item.evolution_paths,
      fate_quest: item.fate_quest,
      lore_hook: item.lore_hook,
    };
    canonicalMap[item.name].variants.push(variant);
  });

  return Object.values(canonicalMap);
};
