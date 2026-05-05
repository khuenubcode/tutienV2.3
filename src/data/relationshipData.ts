/**
 * File: src/data/relationshipData.ts
 * Description: Short, concise storage for AI-tracked relationships 
 * between NPCs and the Player.
 */

export interface Relationship {
  id: string; // Unique relationship identifier
  sourceId: string; // NPC_ID or 'PLAYER'
  targetId: string; // NPC_ID
  type: 'Thù địch' | 'Bằng hữu' | 'Sư đồ' | 'Đạo lữ' | 'Sư huynh đệ' | 'Người dưng' | 'Sư phụ';
  affinity: number; // -1000 to 1000
  lastInteraction: string; // Brief note on last event
}

// Global store for relationships between entities for easy AI checking
export const worldRelationships: Relationship[] = [];
