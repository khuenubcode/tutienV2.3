/**
 * File: src/data/itemData.ts
 * Description: Short, concise storage for AI-tracked non-equipment items 
 * (materials, consumables, quest items, treasures) generated or discovered 
 * during gameplay to maintain consistency.
 */

import { Rarity } from '../types';

export interface WorldItem {
  id: string;
  name: string;
  type: 'Vật liệu' | 'Đan dược' | 'Nhiệm vụ' | 'Thiên tài địa bảo' | 'Khác';
  rarity: Rarity;
  description: string;
  origin: string; // Who dropped it or where it was found
  effects?: string; // Brief note on its uses or effects
}

// Global store for dynamically generated items in the world
// so the AI can reference their properties later.
export const worldItemsData: WorldItem[] = [];
