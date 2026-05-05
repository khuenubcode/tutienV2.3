/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback, useEffect } from 'react';
import { PlayerState, GameHistoryItem, WeatherType, MapRegion, CombatUnit, CombatState, Skill, NPC, Difficulty, InventoryItem, Rarity, ChronicleEntry, SectRank, isConsumable } from '../types';
import { getCounterMultiplier, getReaction, ElementType } from '../data/element_system';
import { REALMS, ORGANIZATIONS, SECTS } from '../data/worldData';
import { INITIAL_NPCS } from '../data/npcData';
import { calculateCoreStats, calculateNPCStats, calculateBeastStats } from '../data/corestat';
import { calculateAllPlayerStats } from '../lib/playerStats';
import { checkRequirements } from '../lib/requirements';
import { generateSkill } from '../data/skill_generator';
import { initCultivationTimeline, advanceTime, applyCultivationEffects } from '../data/cultivation_timeline_system';
import { TIME_UNIT_DAYS } from '../data/timename';
import { BEAST_DATABASE, BeastDefinition } from '../data/beastDatabase';
import { ITEM_DATABASE } from '../data/item_database';
import { SECT_MECHANICS, getSectInteractions } from '../data/sect_system';
import { ORG_MECHANICS, getOrgInteractions } from '../data/org_system';
import { 
  StatusEffectManager, 
  isHardControlled, 
  getModifiedSpeed, 
  getModifiedDefense, 
  getIncomingDamageMultiplier,
  EffectsFactory
} from '../data/status_effect_system';
import { summarizeRecentHistory } from '../utils/narrativeMemory';

const statusEffectMgr = new StatusEffectManager();

const generateCombatRewards = (enemies: CombatUnit[], playerLuck: number, difficulty: string): InventoryItem[] => {
  const drops: InventoryItem[] = [];
  
  // Difficulty multiplier
  const diffMult = difficulty === 'Hồng Hoang' ? 2.0 : difficulty === 'Khó' ? 1.5 : 1.0;
  const luckMult = 1 + (playerLuck / 100);

  enemies.forEach(enemy => {
    if (enemy.isBeast && enemy.beastData) {
      // Find the beast definition to get the loot table
      const beastId = Object.keys(BEAST_DATABASE).find(k => BEAST_DATABASE[k].id === enemy.id || BEAST_DATABASE[k].name === enemy.name);
      const beastDef = beastId ? BEAST_DATABASE[beastId] : null;

      if (beastDef && beastDef.lootTable) {
        beastDef.lootTable.forEach(loot => {
          const adjustedChance = loot.chance * diffMult * luckMult;
          if (Math.random() < adjustedChance) {
            const itemDef = ITEM_DATABASE[loot.itemId];
            if (itemDef) {
              const amount = Math.floor(Math.random() * (loot.maxAmount - loot.minAmount + 1)) + loot.minAmount;
              drops.push({
                ...itemDef,
                amount
              });
            }
          }
        });
      }
    } else {
      // Humanoids/NPCs might drop items from their inventory or random pills
      if (Math.random() < 0.3 * diffMult) {
        const rewardKeys = ['heal_pill', 'mana_pill'];
        const randomKey = rewardKeys[Math.floor(Math.random() * rewardKeys.length)];
        const itemDef = ITEM_DATABASE[randomKey];
        if (itemDef) {
          drops.push({ ...itemDef, amount: 1 });
        }
      }
    }
  });

  // Consolidate identical items
  const consolidated: Record<string, InventoryItem> = {};
  drops.forEach(d => {
    if (consolidated[d.id]) {
      consolidated[d.id].amount += d.amount;
    } else {
      consolidated[d.id] = { ...d };
    }
  });

  return Object.values(consolidated);
};

const STORAGE_KEY = 'thien_dao_story_save';

const INITIAL_PLAYER_STATE: PlayerState = {
  name: '',
  gender: 'Nam',
  difficulty: 'Thường',
  realm: REALMS[0].name,
  stage: REALMS[0].stages[0],
  realmLevel: 0,
  body: 10,
  spirit: 10,
  foundation: 10,
  spiritualRoot: {
    purity: 50,
    type: 'Kim'
  },
  linhCan: '',
  talent: '',
  background: '',
  inventory: [],
  tuVi: 0,
  tuViCapacity: 100,
  daoTam: 50,
  alchemyLevel: 1,
  alchemyExp: 0,
  breakthroughChance: 50,
  breakthroughBonus: 0,
  cultivationFocus: 'Balanced',
  health: 100,
  maxHealth: 100,
  mana: 50,
  maxMana: 50,
  reputation: 0,
  karma: 0,
  factionsReputation: {},
  knownFactions: [],
  resources: {},
  knownRecipes: ['heal_pill', 'mana_pill'],
  activeMissions: [],
  skills: [],
  combatSkills: [
    {
      id: 'basic_attack',
      name: 'Đánh Thường',
      type: 'ACTIVE',
      element: 'VẬT LÝ',
      targetType: 'SINGLE',
      baseDamage: 10,
      scaling: 100,
      cost: 0,
      cooldown: 0,
      description: 'Đòn tấn công vật lý cơ bản.',
      rarity: 'COMMON'
    }
  ],
  element: 'KIM',
  masteredTechniques: [],
  equipment: [],
  equippedItems: {
    weapon: undefined,
    armor: undefined,
    accessory: undefined
  },
  assets: [],
  identities: [],
  powerScore: 100,
  attack: 20,
  defense: 15,
  speed: 10,
  critChance: 5,
  critDamage: 150,
  luck: 10,
  accuracy: 60,
  history: [],
  npcs: INITIAL_NPCS,
  currentLocation: 'Phàm Giới (Thanh Thạch Thành)',
  currentSect: undefined,
  currentOrg: undefined,
  sectRank: undefined,
  orgRank: undefined,
  sectContribution: 0,
  orgContribution: 0,
  memberTrials: {},
  metNPCs: {},
  rivalNPCs: [
    { id: 'rival_1', name: 'Lâm Phong', realm: 'Trúc Cơ Sơ Kỳ', luckScore: 80, activeQuest: 'Tìm Kiếm Huyết Sâm', lastMetLocation: 'Cấm địa Huyết Sắc', progress: 20 },
    { id: 'rival_2', name: 'Diệp Thần', realm: 'Trúc Cơ Trung Kỳ', luckScore: 90, activeQuest: 'Đoạt Cổ Bảo', lastMetLocation: 'Vạn Thú Sơn Mạch', progress: 50 },
  ],
  positionX: 0,
  positionY: 0,
  aiContext: {
    summary: 'Hành trình mới bắt đầu.',
    recentKeyEvents: [],
    activeGoals: ['Khám phá thế giới', 'Tu luyện đạt đến cảnh giới cao hơn'],
    notableNPCs: {}
  },
  chronicles: '[TÓM TẮT CỐT TRUYỆN CHÍNH]: Hành trình chưa bắt đầu.\n[NHÂN VẬT & QUAN HỆ QUAN TRỌNG]: Chưa có.\n[KỲ NGỘ & BẢO VẬT TỐI CAO]: Chưa có.\n[DÒNG THỜI GIAN SỰ KIỆN LỚN (TIMELINE)]:\n- Khởi đầu cuộc hành trình.',
  chronicleEntries: [],
  mapData: [],
  worldEquipments: [],
  worldTechniques: [],
  worldNPCs: [],
  worldBeasts: [],
  timeline: initCultivationTimeline(),
  storyLength: 'Bình thường',
  weather: 'Nắng',
  isInitialized: false,
  isNsfwEnabled: false,
  isCombat: false
};

const getSavedState = (): PlayerState => {
  if (typeof window === 'undefined') return INITIAL_PLAYER_STATE;
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      // Ensure history is not empty if we were initialized
      if (parsed.isInitialized && (!parsed.history || parsed.history.length === 0)) {
        return INITIAL_PLAYER_STATE;
      }
      return {
        ...INITIAL_PLAYER_STATE,
        ...parsed,
        spiritualRoot: {
          ...INITIAL_PLAYER_STATE.spiritualRoot,
          ...(parsed.spiritualRoot || {})
        },
        equippedItems: {
          ...INITIAL_PLAYER_STATE.equippedItems,
          ...(parsed.equippedItems || {})
        },
        factionsReputation: parsed.factionsReputation || INITIAL_PLAYER_STATE.factionsReputation,
        knownFactions: parsed.knownFactions || INITIAL_PLAYER_STATE.knownFactions,
        resources: parsed.resources || INITIAL_PLAYER_STATE.resources,
        inventory: parsed.inventory || INITIAL_PLAYER_STATE.inventory,
        skills: parsed.skills || INITIAL_PLAYER_STATE.skills,
        combatSkills: parsed.combatSkills || INITIAL_PLAYER_STATE.combatSkills,
        masteredTechniques: (parsed.masteredTechniques || []).map((t: any, idx: number) => ({
          id: `tech_${idx}_${Date.now()}`,
          ...t,
          core: {
            focus: 'Balanced',
            description: '',
            ...(t.core || {})
          }
        })),
        equipment: (parsed.equipment || INITIAL_PLAYER_STATE.equipment).map((e: any) => ({ ...e, rarity: e.rarity || 'Phàm' })),
        assets: parsed.assets || INITIAL_PLAYER_STATE.assets,
        history: parsed.history || INITIAL_PLAYER_STATE.history,
        mapData: parsed.mapData || INITIAL_PLAYER_STATE.mapData,
        worldEquipments: parsed.worldEquipments || INITIAL_PLAYER_STATE.worldEquipments,
        worldTechniques: parsed.worldTechniques || INITIAL_PLAYER_STATE.worldTechniques,
        worldNPCs: parsed.worldNPCs || INITIAL_PLAYER_STATE.worldNPCs,
        worldBeasts: parsed.worldBeasts || INITIAL_PLAYER_STATE.worldBeasts,
        rivalNPCs: parsed.rivalNPCs || INITIAL_PLAYER_STATE.rivalNPCs,
        timeline: parsed.timeline || INITIAL_PLAYER_STATE.timeline,
        isCombat: parsed.isCombat || false,
        combatState: parsed.combatState
      };
    } catch (e) {
      console.error("Failed to load saved state", e);
      return INITIAL_PLAYER_STATE;
    }
  }
  return INITIAL_PLAYER_STATE;
};

export function useGameState() {
  const [state, setState] = useState<PlayerState>(getSavedState);

  // Auto-save on state change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  // Update AI context summary on history change
  useEffect(() => {
    setState(prev => ({
      ...prev,
      aiContext: {
        ...prev.aiContext,
        summary: summarizeRecentHistory(prev.history)
      }
    }));
  }, [state.history.length]);

  // Recalculate stats whenever relevant state changes
  useEffect(() => {
    if (state.name) {
      const allStats = calculateAllPlayerStats(state);

      if (
        allStats.attack !== state.attack || 
        allStats.defense !== state.defense || 
        allStats.maxHealth !== state.maxHealth || 
        allStats.maxMana !== state.maxMana ||
        allStats.powerScore !== state.powerScore ||
        allStats.speed !== state.speed ||
        allStats.critChance !== state.critChance ||
        allStats.critDamage !== state.critDamage ||
        allStats.luck !== state.luck ||
        allStats.accuracy !== state.accuracy ||
        allStats.breakthroughChance !== state.breakthroughChance
      ) {
        setState(prev => ({ 
          ...prev, 
          attack: allStats.attack, 
          defense: allStats.defense, 
          maxHealth: allStats.maxHealth, 
          maxMana: allStats.maxMana,
          powerScore: allStats.powerScore,
          speed: allStats.speed,
          accuracy: allStats.accuracy,
          critChance: allStats.critChance,
          critDamage: allStats.critDamage,
          luck: allStats.luck,
          breakthroughChance: allStats.breakthroughChance,
          // Sync current health/mana if they exceed new max
          health: Math.min(prev.health, allStats.maxHealth),
          mana: Math.min(prev.mana, allStats.maxMana)
        }));
      }
    }
  }, [
    state.realmLevel,
    state.body,
    state.spirit,
    state.foundation,
    state.spiritualRoot?.purity,
    state.masteredTechniques,
    state.equippedItems,
    state.realm,
    state.stage,
    state.domain,
    state.name
  ]);

  // Death Logic
  useEffect(() => {
    if (state.isInitialized && state.health <= 0 && !state.isCombat) {
      // In a text-based game, death could be a reset or a special story event
      // For now, let's just alert and we could later add a specific death screen
      console.log("Nhân vật đã vẫn lạc...");
    }
  }, [state.health, state.isInitialized, state.isCombat]);

  const isAtLocation = useCallback((locationName: string) => {
    if (!state.currentLocation) return false;
    return state.currentLocation.toLowerCase().includes(locationName.toLowerCase());
  }, [state.currentLocation]);

  const getFactionLocation = (factionName: string): string => {
    const locations: Record<string, string> = {
      'Hoàng Phong Cốc': 'Hoàng Phong Cốc',
      'Thanh Vân Môn': 'Thanh Vân Môn',
      'Thiên Sát Tông': 'Thiên Sát Tông',
      'Quỷ Linh Môn': 'Quỷ Linh Môn',
      'Tinh Cung': 'Thiên Tinh Thành',
      'Nghịch Tinh Minh': 'Loạn Tinh Hải',
      'Mộ Lan Nhân': 'Mộ Lan Thảo Nguyên',
      'Thái Nhất Môn': 'Thái Nhất Môn',
      'Hóa Ý Môn': 'Đại Tấn',
      'Thiên Bảo Lâu': 'Thiên Bảo Thành',
      'Thần Bí Các': 'Thần Bí Các',
      'Huyết Nguyệt Lâu': 'Huyết Nguyệt Lâu',
      'Đại Việt Hoàng Tộc': 'Kinh Thành'
    };
    return locations[factionName] || factionName;
  };

  const initPlayer = useCallback((data: Partial<PlayerState>) => {
    setState(prev => ({
      ...prev,
      ...data,
      isInitialized: true
    }));
  }, []);

  const joinSect = useCallback((sectName: string) => {
    setState(prev => {
      if (prev.currentSect) return prev;
      const sect = SECTS.find(s => s.name === sectName);
      if (!sect) return prev;

      const requiredLoc = getFactionLocation(sectName);
      if (!prev.currentLocation.toLowerCase().includes(requiredLoc.toLowerCase())) {
        return {
          ...prev,
          history: [...prev.history, { story: `Bạn cần đến ${requiredLoc} để bái nhập ${sectName}.`, timestamp: Date.now() }]
        };
      }

      if (sect.requirements) {
        const check = checkRequirements(sect.requirements, prev, REALMS);
        if (!check.met || !prev.memberTrials[sectName]) {
          return {
            ...prev,
            history: [...prev.history, { story: `Bạn đã cố gắng gia nhập ${sectName} nhưng bị từ chối. Lý do: ${!check.met ? check.reason : 'Bạn chưa vượt qua thử thách nhập môn.'}`, timestamp: Date.now() }]
          };
        }
      }
      
      const newFactionsRep = { ...prev.factionsReputation };
      newFactionsRep[sectName] = Math.max(newFactionsRep[sectName] || 0, 0);

      return {
        ...prev,
        currentSect: sectName,
        sectRank: 'NGOAI_MON',
        sectContribution: 100,
        factionsReputation: newFactionsRep,
        history: [...prev.history, { story: `Bạn đã chính thức gia nhập ${sectName} với tư cách là Đệ tử Ngoại môn.`, timestamp: Date.now() }]
      };
    });
  }, []);

  const completeSectTrial = useCallback((sectName: string) => {
    setState(prev => {
      const sect = SECTS.find(s => s.name === sectName);
      if (!sect) return prev;
      
      return {
        ...prev,
        memberTrials: { ...prev.memberTrials, [sectName]: true },
        history: [...prev.history, { story: `Bạn đã vượt qua thử thách nhập môn của ${sectName}! Giờ đây bạn có thể bái nhập môn phái.`, timestamp: Date.now() }]
      };
    });
  }, []);

  const meetFactionNPC = useCallback((factionName: string) => {
    setState(prev => {
      return {
        ...prev,
        metNPCs: { ...prev.metNPCs, [factionName]: true },
        history: [...prev.history, { story: `Bạn đã gặp gỡ đại diện của ${factionName} và được họ công nhận bước đầu.`, timestamp: Date.now() }],
        aiContext: {
          ...prev.aiContext,
          notableNPCs: { ...prev.aiContext.notableNPCs, [factionName]: 'Đại diện' }
        }
      };
    });
  }, []);

  const promoteSectRank = useCallback(() => {
    setState(prev => {
      if (!prev.currentSect) return prev;
      const currentRep = prev.factionsReputation[prev.currentSect] || 0;
      
      const currentRankIndex = SECT_MECHANICS.ranks.findIndex(r => r.id === prev.sectRank);
      if (currentRankIndex >= SECT_MECHANICS.ranks.length - 1) return prev; // Already max rank

      const nextRank = SECT_MECHANICS.ranks[currentRankIndex + 1];
      if (currentRep < nextRank.requirementReputation) return prev;

      return {
        ...prev,
        sectRank: nextRank.id,
        history: [...prev.history, { story: `Chúc mừng! Bạn đã thăng cấp thành ${nextRank.name} của ${prev.currentSect}.`, timestamp: Date.now() }]
      };
    });
  }, []);

  const leaveSect = useCallback(() => {
    setState(prev => {
      if (!prev.currentSect) return prev;
      const oldSect = prev.currentSect;
      const newFactionsRep = { ...prev.factionsReputation };
      newFactionsRep[oldSect] = (newFactionsRep[oldSect] || 0) - 500;

      return {
        ...prev,
        currentSect: undefined,
        sectRank: undefined,
        sectContribution: 0,
        factionsReputation: newFactionsRep,
        history: [...prev.history, { story: `Bạn đã rời khỏi ${oldSect}. Các bậc tiền bối trong tông coi đây là hành vi phản bội, danh tiếng của bạn tại đây bị giảm sút nghiêm trọng.`, timestamp: Date.now() }]
      };
    });
  }, []);

  const performSectAction = useCallback((actionId: string) => {
    setState(prev => {
      if (!prev.currentSect) return prev;
      
      const requiredLoc = getFactionLocation(prev.currentSect);
      if (!prev.currentLocation.toLowerCase().includes(requiredLoc.toLowerCase())) {
        return {
          ...prev,
          history: [...prev.history, { story: `Bạn cần phải ở ${requiredLoc} để thực hiện hành động này.`, timestamp: Date.now() }]
        };
      }

      const action = SECT_MECHANICS.actions[actionId as keyof typeof SECT_MECHANICS.actions];
      if (!action) return prev;
      if (prev.sectContribution < action.contributionCost) return prev;

      const rankInfo = SECT_MECHANICS.ranks.find(r => r.id === prev.sectRank);
      const multiplier = rankInfo?.benefits.tuViMultiplier || 1.0;

      let tuViBonus = 0;
      let newInventory = [...prev.inventory];
      let message = `Bạn đã thực hiện ${action.name}. ${action.description}.`;

      let stageMult = 1.0;
      const realmData = REALMS.find(r => r.level === prev.realmLevel);
      if (realmData && realmData.stageMultipliers) {
         const idx = realmData.stages.indexOf(prev.stage);
         if (idx >= 0 && idx < realmData.stageMultipliers.length) {
            stageMult = realmData.stageMultipliers[idx];
         }
      }

      if (actionId === 'train') {
        tuViBonus = Math.floor(200 * multiplier * stageMult);
        message += ` Bạn cảm thấy linh khí trong người vận chuyển nhanh hơn nhờ vị thế của ${rankInfo?.name}. (Tu vi +${tuViBonus})`;
      } else if (actionId === 'collect') {
        const linhThachCount = rankInfo?.benefits.monthlyLinhThach || 0;
        const itemDef = Object.values(ITEM_DATABASE).find(i => i.id === 'linh_thach_ha_pham');
        if (itemDef && linhThachCount > 0) {
          const existing = newInventory.find(i => i.id === itemDef.id);
          if (existing) {
            existing.amount += linhThachCount;
          } else {
            newInventory.push({ ...itemDef, amount: linhThachCount });
          }
          message += ` Bạn đã nhận được bổng lộc hàng tháng: ${linhThachCount} Linh Thạch.`;
        }
      } else if (actionId === 'meditation') {
        tuViBonus = Math.floor(100 * multiplier * stageMult);
        message += ` Tâm cảnh của bạn trở nên vững vàng hơn sau buổi tĩnh tọa. (Tu vi +${tuViBonus})`;
      }

      return {
        ...prev,
        inventory: newInventory,
        sectContribution: prev.sectContribution - action.contributionCost,
        tuVi: Math.min(prev.tuViCapacity, prev.tuVi + tuViBonus),
        history: [...prev.history, { story: message, timestamp: Date.now() }]
      };
    });
  }, []);

  const acceptMission = useCallback((missionId: string) => {
    setState(prev => {
      if (!prev.currentSect) return prev;
      
      const requiredLoc = getFactionLocation(prev.currentSect);
      if (!prev.currentLocation.toLowerCase().includes(requiredLoc.toLowerCase())) {
        return {
          ...prev,
          history: [...prev.history, { story: `Bạn cần phải ở ${requiredLoc} để tiếp nhận nhiệm vụ.`, timestamp: Date.now() }]
        };
      }

      if (prev.activeMissions.find(m => m.id === missionId)) return prev;
      
      const interactions = getSectInteractions(prev.currentSect);
      const missionData = interactions.missions.find(m => m.id === missionId);
      if (!missionData) return prev;

      const newMission: any = {
        id: missionData.id,
        name: missionData.name,
        description: `Nhiệm vụ từ ${prev.currentSect}`,
        type: 'Sect',
        source: prev.currentSect,
        status: 'active',
        rewardContribution: missionData.rewardContribution,
        rewardReputation: missionData.rewardReputation || 0,
        rewardItems: missionData.rewardItems,
        acceptedAt: Date.now()
      };

      return {
        ...prev,
        activeMissions: [...prev.activeMissions, newMission],
        history: [...prev.history, { story: `Bạn đã tiếp nhận nhiệm vụ: ${missionData.name}.`, actionTaken: `ACCEPT_MISSION:SECT:${missionData.id}`, timestamp: Date.now() }]
      };
    });
  }, []);

  const completeSectMission = useCallback((missionId: string) => {
    setState(prev => {
      const activeMission = prev.activeMissions.find(m => m.id === missionId && m.type === 'Sect');
      if (!activeMission) return prev;
      
      if (!prev.currentSect || prev.currentSect !== activeMission.source) return prev;

      if (activeMission.status !== 'ready_to_turn_in' && (activeMission.progress || 0) < 100) {
        return {
          ...prev,
          history: [...prev.history, { story: `Chưa hoàn thành yêu cầu của nhiệm vụ. Hãy ra ngoài làm nhiệm vụ rồi quay lại bàn giao!`, timestamp: Date.now() }]
        };
      }

      const requiredLoc = getFactionLocation(prev.currentSect);
      if (!prev.currentLocation.toLowerCase().includes(requiredLoc.toLowerCase())) {
        return {
          ...prev,
          history: [...prev.history, { story: `Bạn cần quay về ${requiredLoc} để bàn giao nhiệm vụ.`, timestamp: Date.now() }]
        };
      }
      
      const interactions = getSectInteractions(prev.currentSect);
      const mission = interactions.missions.find(m => m.id === missionId);
      if (!mission) return prev;

      const newInventory = [...prev.inventory];
      mission.rewardItems.forEach(itemName => {
        const itemDef = Object.values(ITEM_DATABASE).find(i => i.name === itemName);
        if (itemDef) {
          const existing = newInventory.find(i => i.id === itemDef.id);
          if (existing) {
            existing.amount += 1;
          } else {
            newInventory.push({ ...itemDef, amount: 1 });
          }
        }
      });

      const newFactionsRep = { ...prev.factionsReputation };
      newFactionsRep[prev.currentSect] = (newFactionsRep[prev.currentSect] || 0) + mission.rewardContribution;

      let newRank = prev.sectRank;
      const currentRep = newFactionsRep[prev.currentSect];
      
      const potentialRanks = [...SECT_MECHANICS.ranks].reverse();
      const reachedRank = potentialRanks.find(r => currentRep >= r.requirementReputation);
      
      if (reachedRank && reachedRank.id !== prev.sectRank) {
        newRank = reachedRank.id as SectRank;
      }

      return {
        ...prev,
        activeMissions: prev.activeMissions.filter(m => m.id !== missionId),
        inventory: newInventory,
        sectContribution: prev.sectContribution + mission.rewardContribution,
        factionsReputation: newFactionsRep,
        sectRank: newRank,
        history: [...prev.history, { story: `Bạn đã hoàn thành nhiệm vụ tông môn: ${mission.name}. Nhận được ${mission.rewardContribution} điểm cống hiến.`, timestamp: Date.now() }]
      };
    });
  }, []);

  const joinOrg = useCallback((orgName: string) => {
    setState(prev => {
      if (prev.currentOrg === orgName) return prev;
      const org = ORGANIZATIONS.find(o => o.name === orgName);
      if (!org) return prev;

      if (org.requirements) {
        const check = checkRequirements(org.requirements, prev, REALMS);
        if (!check.met) {
          return {
            ...prev,
            history: [...prev.history, { story: `Bạn đã cố gắng gia nhập ${orgName} nhưng bị từ chối. Lý do: ${check.reason}`, timestamp: Date.now() }]
          };
        }
      }

      const initialRank = org?.ranks[0]?.id;
      
      const newFactionsRep = { ...prev.factionsReputation };
      if (!newFactionsRep[orgName]) newFactionsRep[orgName] = 0;
      
      return {
        ...prev,
        currentOrg: orgName,
        orgRank: initialRank,
        orgContribution: 100,
        factionsReputation: newFactionsRep,
        history: [...prev.history, { story: `Bạn đã trở thành hội viên của ${orgName}, cấp bậc: ${org?.ranks[0]?.name || 'Tân thủ'}.`, timestamp: Date.now() }]
      };
    });
  }, []);

  const performOrgAction = useCallback((actionId: string) => {
    setState(prev => {
      if (!prev.currentOrg) return prev;

      const requiredLoc = getFactionLocation(prev.currentOrg);
      if (!prev.currentLocation.toLowerCase().includes(requiredLoc.toLowerCase())) {
        return {
          ...prev,
          history: [...prev.history, { story: `Bạn cần phải có mặt tại chi nhánh ${prev.currentOrg} ở ${requiredLoc} để thực hiện việc này.`, timestamp: Date.now() }]
        };
      }

      const action = ORG_MECHANICS.actions[actionId];
      if (!action) return prev;
      if (prev.orgContribution < action.contributionCost) return prev;

      let message = `Bạn đã thực hiện ${action.name}. ${action.description}.`;
      
      // Additional effects can be added here
      if (action.benefitType === 'INFO') {
        message += ` Bạn nhận được một số tin đồn về vị trí xuất hiện của dị bảo cấp cao.`;
      }

      return {
        ...prev,
        orgContribution: prev.orgContribution - action.contributionCost,
        history: [...prev.history, { story: message, timestamp: Date.now() }]
      };
    });
  }, []);

  const acceptOrgMission = useCallback((missionId: string) => {
    setState(prev => {
      if (!prev.currentOrg) return prev;

      const requiredLoc = getFactionLocation(prev.currentOrg);
      if (!prev.currentLocation.toLowerCase().includes(requiredLoc.toLowerCase())) {
        return {
          ...prev,
          history: [...prev.history, { story: `Bạn cần phải đến ${requiredLoc} để nhận ủy thác từ ${prev.currentOrg}.`, timestamp: Date.now() }]
        };
      }

      if (prev.activeMissions.find(m => m.id === missionId)) return prev;
      
      const interactions = getOrgInteractions(prev.currentOrg);
      const missionData = interactions.missions.find(m => m.id === missionId);
      if (!missionData) return prev;

      const newMission: any = {
        id: missionData.id,
        name: missionData.name,
        description: `Công việc từ ${prev.currentOrg}`,
        type: 'Organization',
        source: prev.currentOrg,
        status: 'active',
        rewardContribution: missionData.rewardContribution,
        rewardReputation: missionData.rewardReputation,
        rewardItems: missionData.rewardItems,
        acceptedAt: Date.now()
      };

      return {
        ...prev,
        activeMissions: [...prev.activeMissions, newMission],
        history: [...prev.history, { story: `Bạn đã nhận ủy thác: ${missionData.name}.`, actionTaken: `ACCEPT_MISSION:ORG:${missionData.id}`, timestamp: Date.now() }]
      };
    });
  }, []);

  const completeOrgMission = useCallback((missionId: string) => {
    setState(prev => {
      const activeMission = prev.activeMissions.find(m => m.id === missionId && m.type === 'Organization');
      if (!activeMission) return prev;

      if (!prev.currentOrg || prev.currentOrg !== activeMission.source) return prev;

      if (activeMission.status !== 'ready_to_turn_in' && (activeMission.progress || 0) < 100) {
        return {
          ...prev,
          history: [...prev.history, { story: `Ủy thác chưa hoàn thành. Hãy đi thực hiện rồi quay về nộp nhiệm vụ.`, timestamp: Date.now() }]
        };
      }

      const requiredLoc = getFactionLocation(prev.currentOrg);
      if (!prev.currentLocation.toLowerCase().includes(requiredLoc.toLowerCase())) {
        return {
          ...prev,
          history: [...prev.history, { story: `Bạn cần quay về ${requiredLoc} để báo cáo hoàn thành nhiệm vụ cho ${prev.currentOrg}.`, timestamp: Date.now() }]
        };
      }
      
      const interactions = getOrgInteractions(prev.currentOrg);
      const mission = interactions.missions.find(m => m.id === missionId);
      if (!mission) return prev;

      const newInventory = [...prev.inventory];
      mission.rewardItems.forEach(itemStr => {
        // Handle "Item xAmount" format
        const [itemName, amountStr] = (itemStr || '').split(' x');
        const amount = amountStr ? parseInt(amountStr) : 1;
        
        const itemDef = Object.values(ITEM_DATABASE).find(i => i.name === itemName || i.id === itemName);
        if (itemDef) {
          const existing = newInventory.find(i => i.id === itemDef.id);
          if (existing) {
            existing.amount += amount;
          } else {
            newInventory.push({ ...itemDef, amount });
          }
        }
      });

      const newFactionsRep = { ...prev.factionsReputation };
      const orgName = prev.currentOrg;
      newFactionsRep[orgName] = (newFactionsRep[orgName] || 0) + mission.rewardReputation;

      const org = ORGANIZATIONS.find(o => o.name === orgName);
      let newRank = prev.orgRank;
      if (org) {
        const currentRep = newFactionsRep[orgName];
        const potentialRanks = [...org.ranks].reverse();
        const reachedRank = potentialRanks.find(r => currentRep >= r.requirementReputation);
        if (reachedRank) {
          newRank = reachedRank.id;
        }
      }

      return {
        ...prev,
        activeMissions: prev.activeMissions.filter(m => m.id !== missionId),
        inventory: newInventory,
        orgContribution: prev.orgContribution + mission.rewardContribution,
        factionsReputation: newFactionsRep,
        orgRank: newRank,
        history: [...prev.history, { story: `Hoàn thành nhiệm vụ tổ chức: ${mission.name}. Nhận được ${mission.rewardContribution} điểm cống hiến và ${mission.rewardReputation} uy danh.`, timestamp: Date.now() }]
      };
    });
  }, []);

  const leaveOrg = useCallback(() => {
    setState(prev => {
      if (!prev.currentOrg) return prev;
      const oldOrg = prev.currentOrg;
      return {
        ...prev,
        currentOrg: undefined,
        orgRank: undefined,
        orgContribution: 0,
        history: [...prev.history, { story: `Bạn đã rời khỏi tổ chức ${oldOrg}.`, timestamp: Date.now() }]
      };
    });
  }, []);

  const resetGame = useCallback(() => {
    // Clear persistence
    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.clear();
    
    // Attempt to clear Cache Storage
    if ('caches' in window) {
      caches.keys().then(names => {
        return Promise.all(names.map(name => caches.delete(name)));
      }).catch(err => console.error("Cache clear error:", err));
    }

    // Reset state
    setState(INITIAL_PLAYER_STATE);
    
    // Force reload to clear any remaining in-memory cache/AI context
    window.location.href = window.location.origin + window.location.pathname;
  }, []);

  const updateStats = useCallback((updates: any) => {
    setState(prev => {
      let newState = { ...prev };
      
      if (updates.tuViChange !== undefined) {
        const change = Number(updates.tuViChange);
        if (!isNaN(change) && isFinite(change)) {
          let stageMult = 1.0;
          const realmData = REALMS.find(r => r.level === newState.realmLevel);
          if (realmData && realmData.stageMultipliers) {
             const idx = realmData.stages.indexOf(newState.stage);
             if (idx >= 0 && idx < realmData.stageMultipliers.length) {
                stageMult = realmData.stageMultipliers[idx];
             }
          }
          const boostedChange = change > 0 ? change * stageMult : change;
          // Cap tuVi change to 5% of capacity per action to prevent "infinite" jumps from AI (but boosted by stageMult)
          const cappedChange = Math.min(boostedChange, newState.tuViCapacity * 0.05 * stageMult);
          newState.tuVi = Math.max(0, Math.min(newState.tuViCapacity, newState.tuVi + cappedChange));
        }
      }
      if (updates.healthChange !== undefined) {
        const change = Number(updates.healthChange);
        if (!isNaN(change)) {
          newState.health = Math.max(0, Math.min(prev.maxHealth || 100, prev.health + change));
        }
      }
      if (updates.manaChange !== undefined) {
        const change = Number(updates.manaChange);
        if (!isNaN(change)) {
          newState.mana = Math.max(0, Math.min(prev.maxMana || 50, prev.mana + change));
        }
      }
      if (updates.reputationChange) newState.reputation += updates.reputationChange;
      if (updates.karmaChange) newState.karma += updates.karmaChange;
      if (updates.body !== undefined) newState.body = updates.body;
      if (updates.spirit !== undefined) newState.spirit = updates.spirit;
      if (updates.foundation !== undefined) newState.foundation = updates.foundation;
      if (updates.spiritualRoot) {
        newState.spiritualRoot = { ...prev.spiritualRoot, ...updates.spiritualRoot };
      }
      if (updates.talent) newState.talent = updates.talent;
      if (updates.linhCan) newState.linhCan = updates.linhCan;
      if (updates.background) newState.background = updates.background;
      if (updates.element) newState.element = updates.element;
      
      // Extended realm/tuVi support
      if (updates.realm) newState.realm = updates.realm;
      if (updates.stage) newState.stage = updates.stage;
      if (updates.realmLevel !== undefined) newState.realmLevel = updates.realmLevel;
      if (updates.tuVi !== undefined) {
        const val = Number(updates.tuVi);
        if (!isNaN(val) && isFinite(val)) {
          newState.tuVi = Math.max(0, Math.min(newState.tuViCapacity, val));
        }
      }
      if (updates.tuViCapacity !== undefined) {
        const val = Number(updates.tuViCapacity);
        if (!isNaN(val) && isFinite(val) && val > 0) {
          newState.tuViCapacity = val;
        }
      }
      
      if (updates.missionUpdates && Array.isArray(updates.missionUpdates)) {
        let updatedMissions = [...(newState.activeMissions || [])];
        updates.missionUpdates.forEach((mu: any) => {
          const idx = updatedMissions.findIndex(m => m.id === mu.id);
          if (idx !== -1) {
            updatedMissions[idx] = { ...updatedMissions[idx], ...mu };
            if (mu.status === 'completed' || mu.status === 'failed') {
               // We don't automatically delete it so the UI can show its final status before player clears it or until we filter it
               // Wait! For clean UI, if it's completed via completeSectMission, it gets filtered. 
               // If AI completes it, we might want to filter it out here!
               updatedMissions = updatedMissions.filter(m => m.id !== mu.id);
            }
          }
        });
        newState.activeMissions = updatedMissions;
      }
      
      // New structure support
      if (updates.inventoryAdd) {
        let currentInventory = [...(prev.inventory || [])];
        updates.inventoryAdd.forEach((item: any) => {
            const existingItem = currentInventory.find(i => i.name === item.name);
            if (existingItem) {
                existingItem.amount += (item.amount || 1);
            } else {
                currentInventory.push({
                   id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                   name: item.name,
                   description: item.description,
                   type: item.type || (item.name.toLowerCase().includes('đan') ? 'Đan dược' : 'Vật liệu'),
                   rarity: 'Phàm', // Default
                   amount: item.amount || 1,
                   consumableEffects: item.consumableEffects
                });
            }
        });
        newState.inventory = currentInventory;
      }
      if (updates.inventoryRemove && Array.isArray(updates.inventoryRemove)) {
        const removeNames = updates.inventoryRemove.map(n => typeof n === 'string' ? n.toLowerCase() : String(n));
        newState.inventory = (prev.inventory || []).filter(item => !removeNames.some(rn => item.name.toLowerCase().includes(rn) || rn.includes(item.name.toLowerCase())));
      }
      if (updates.skillsAdd) {
        newState.skills = [...(prev.skills || []), ...updates.skillsAdd];
      }
      if (updates.combatSkillsAdd && Array.isArray(updates.combatSkillsAdd)) {
        const validSkills = updates.combatSkillsAdd.map((s: any, idx: number) => ({
          ...s,
          id: s.id || `combat_skill_${Date.now()}_${idx}`,
          name: s.name || 'Vô Danh Kỹ',
          baseDamage: typeof s.baseDamage === 'number' ? s.baseDamage : 15,
          scaling: typeof s.scaling === 'number' ? s.scaling : 100,
          cost: typeof s.cost === 'number' ? s.cost : 10,
          cooldown: typeof s.cooldown === 'number' ? s.cooldown : 3,
          element: s.element || 'VẬT LÝ',
          targetType: s.targetType || s.target || 'SINGLE',
          rarity: s.rarity || 'COMMON',
          type: s.type || 'ACTIVE',
          description: s.description || 'Chưa rõ huyền cơ.'
        }));
        newState.combatSkills = [...(prev.combatSkills || []), ...validSkills];
      }
      if (updates.assetsAdd) {
        newState.assets = [...(prev.assets || []), ...updates.assetsAdd];
      }
      if (updates.locationUpdate && typeof updates.locationUpdate === 'string') {
        newState.currentLocation = updates.locationUpdate;
        
        // Auto-sync position if mapData exists and coordinates weren't explicitly provided
        if (newState.mapData && updates.positionX === undefined && updates.positionY === undefined) {
          const locLower = updates.locationUpdate.toLowerCase();
          const region = newState.mapData.find(r => 
            r.name.toLowerCase().includes(locLower) || 
            locLower.includes(r.name.toLowerCase()) ||
            r.id === updates.locationUpdate
          );
          if (region && region.positionX !== undefined && region.positionY !== undefined) {
            newState.positionX = region.positionX;
            newState.positionY = region.positionY;
          }
        }
      }
      if (updates.positionX !== undefined) {
        newState.positionX = updates.positionX;
      }
      if (updates.positionY !== undefined) {
        newState.positionY = updates.positionY;
      }
      
      if (updates.discoveredRegionIds && Array.isArray(updates.discoveredRegionIds)) {
        if (newState.mapData) {
          newState.mapData = newState.mapData.map(region => ({
            ...region,
            discovered: region.discovered || 
                        updates.discoveredRegionIds!.includes(region.id) ||
                        updates.discoveredRegionIds!.some((idOrName: string) => 
                          region.name.toLowerCase().includes(idOrName.toLowerCase()) || 
                          idOrName.toLowerCase().includes(region.name.toLowerCase())
                        )
          }));
        }
      }

      // Update faction reputation if provided
      if (updates.factionUpdates && typeof updates.factionUpdates === 'object') {
        newState.factionsReputation = { ...(prev.factionsReputation || {}) };
        newState.knownFactions = [...(prev.knownFactions || [])];
        Object.entries(updates.factionUpdates).forEach(([faction, change]) => {
          newState.factionsReputation[faction] = (newState.factionsReputation[faction] || 0) + (change as number);
          if (!newState.knownFactions.includes(faction)) {
            newState.knownFactions.push(faction);
          }
        });
      }

      if (updates.knownFactionsAdd) {
        newState.knownFactions = [...new Set([...(newState.knownFactions || []), ...updates.knownFactionsAdd])];
      }

      // Update resources if provided
      if (updates.resourceUpdates && typeof updates.resourceUpdates === 'object') {
        newState.resources = { ...(prev.resources || {}) };
        Object.entries(updates.resourceUpdates).forEach(([res, change]) => {
          newState.resources[res] = Math.max(0, (newState.resources[res] || 0) + (change as number));
        });
      }

      return newState;
    });
  }, []);

  const craftItem = useCallback((recipe: any) => {
    setState(prev => {
      const materials = recipe.materials || {};
      const resources = prev.resources || {};
      const canCraft = Object.entries(materials as Record<string, number>).every(([res, amount]) => (resources[res] || 0) >= amount);
      if (!canCraft) return prev;

      if (recipe.requiredTuVi && prev.tuVi < recipe.requiredTuVi) {
        return {
          ...prev,
          history: [...prev.history, { story: `Tu vi của bạn không đủ để luyện chế ${recipe.name}. Yêu cầu: ${recipe.requiredTuVi} Tu vi.`, timestamp: Date.now() }]
        };
      }

      const newResources = { ...resources };
      Object.entries(materials as Record<string, number>).forEach(([res, amount]) => {
        newResources[res] -= amount;
      });

      let isSuccess = true;
      let rollStr = '';
      if (recipe.difficulty && (recipe.type === 'Đan dược' || recipe.name.includes('Đan'))) {
        let successChance = 100 - recipe.difficulty + ((prev.alchemyLevel || 1) * 2);
        if (recipe.requiredTuVi) {
          const ratio = prev.tuVi / recipe.requiredTuVi;
          if (ratio > 1) {
            successChance += Math.min(30, (ratio - 1) * 20); // +max 30% if overleveled
          }
        }
        successChance = Math.floor(Math.max(5, Math.min(95, successChance)));
        const roll = Math.random() * 100;
        rollStr = ` [Tỷ lệ thành công: ${successChance}%]`;
        if (roll > successChance) {
          isSuccess = false;
        }
      }

      let nextExp = prev.alchemyExp || 0;
      let nextLevel = prev.alchemyLevel || 1;
      let expGain = recipe.difficulty ? Math.floor(recipe.difficulty / 2) : 5;
      
      let failStr = !isSuccess ? ` Luyện chế thất bại, nhận ${Math.floor(expGain/2)} EXP.` : ` Nhận ${expGain} EXP luyện đan.`;
      
      if (isSuccess) {
        nextExp += expGain;
      } else {
        nextExp += Math.max(1, Math.floor(expGain / 2));
      }

      let levelUpStr = '';
      if (nextExp >= nextLevel * 100) {
        nextExp -= nextLevel * 100;
        nextLevel += 1;
        levelUpStr = ` Đan Đạo đột phá! Cấp luyện đan của bạn đã đạt cấp ${nextLevel}.`;
      }

      if (!isSuccess) {
        return {
          ...prev,
          resources: newResources,
          alchemyExp: nextExp,
          alchemyLevel: nextLevel,
          history: [...prev.history, { story: `Luyện chế ${recipe.name} THẤT BẠI${rollStr}. Nguyên liệu đã bị hủy thiêu rụi thành tro bụi.${failStr}${levelUpStr}`, timestamp: Date.now() }]
        };
      }

      const itemDef = Object.values(ITEM_DATABASE).find(i => i.name === recipe.result) || {
        id: `crafted_${Date.now()}`,
        name: recipe.result,
        description: 'Luyện chế phẩm',
        type: recipe.type || 'Đan dược',
        rarity: 'Phàm' as Rarity,
        amount: 1
      };

      const newItem: InventoryItem = {
        ...itemDef,
        amount: 1
      };

      const newInventory = [...prev.inventory];
      const existing = newInventory.find(i => i.id === newItem.id);
      if (existing) {
        existing.amount += 1;
      } else {
        newInventory.push(newItem);
      }

      return {
        ...prev,
        resources: newResources,
        inventory: newInventory,
        alchemyExp: nextExp,
        alchemyLevel: nextLevel,
        history: [...prev.history, { story: `Luyện chế ${recipe.name} THÀNH CÔNG${rollStr}. Nhận được ${recipe.result}.${failStr}${levelUpStr}`, timestamp: Date.now() }]
      };
    });
  }, []);

  const equipItem = useCallback((item: any) => {
    setState(prev => {
      const type = item.type.toLowerCase();
      let slot: 'weapon' | 'armor' | 'accessory' = 'accessory';
      
      if (type.includes('kiếm') || type.includes('đao') || type.includes('vũ khí')) slot = 'weapon';
      else if (type.includes('giáp') || type.includes('y phục')) slot = 'armor';
      
      return {
        ...prev,
        equippedItems: {
          ...prev.equippedItems,
          [slot]: item
        }
      };
    });
  }, []);

  const unequipItem = useCallback((slot: 'weapon' | 'armor' | 'accessory') => {
    setState(prev => ({
      ...prev,
      equippedItems: {
        ...prev.equippedItems,
        [slot]: undefined
      }
    }));
  }, []);

  const consumeItem = useCallback((itemId: string) => {
    setState(prev => {
      const itemIndex = prev.inventory.findIndex(i => i.id === itemId);
      if (itemIndex === -1) return prev;
      
      const item = prev.inventory[itemIndex];
      if (item.type !== 'CONSUMABLE' && item.type !== 'Đan dược' && !item.name.toLowerCase().includes('đan') && !item.name.toLowerCase().includes('dược')) {
        return prev;
      }

      // 1. Check native embedded item effects (dynamic items)
      // 2. Fallback to global datastore ITEM_DATABASE 
  const effects = isConsumable(item) ? item.consumableEffects : undefined;
      let hpRestore = effects?.hpRestore || 0;
      let manaRestore = effects?.manaRestore || 0;
      let tuViBonus = effects?.tuViBonus || 0;
      let maxHpInc = effects?.maxHpIncrease || 0;
      let maxManaInc = effects?.maxManaIncrease || 0;
      let btBonus = effects?.breakthroughBonus || 0;

      const staticDef = ITEM_DATABASE[item.id];
      if (staticDef?.effects) {
        if (!hpRestore && staticDef.effects.hpRestore) hpRestore = staticDef.effects.hpRestore;
        if (!manaRestore && staticDef.effects.manaRestore) manaRestore = staticDef.effects.manaRestore;
        // If static ITEM_DATABASE gets more effect props in future, map them here.
      }

      // Legacy fallback
      if (!hpRestore && !manaRestore && !tuViBonus && !maxHpInc && !maxManaInc && !btBonus) {
        if (item.name.includes('hồi máu') || item.name.includes('Hồi Huyết')) hpRestore = 50;
        if (item.name.includes('hồi mana') || item.name.includes('Hồi Linh')) manaRestore = 30;
      }

      const newInventory = [...prev.inventory];
      if (item.amount > 1) {
        newInventory[itemIndex] = { ...item, amount: item.amount - 1 };
      } else {
        newInventory.splice(itemIndex, 1);
      }

      let hxStr = `Bạn sử dụng ${item.name}.`;
      if (hpRestore > 0) hxStr += ` Hồi phục ${hpRestore} Khí huyết.`;
      if (manaRestore > 0) hxStr += ` Hồi phục ${manaRestore} Chân khí.`;
      if (tuViBonus > 0) hxStr += ` Tăng thêm ${tuViBonus} Tu vi.`;
      if (maxHpInc > 0) hxStr += ` Giới hạn Khí huyết tăng ${maxHpInc}.`;
      if (maxManaInc > 0) hxStr += ` Giới hạn Chân khí tăng ${maxManaInc}.`;
      if (btBonus > 0) hxStr += ` Tỷ lệ Đột phá tăng thêm ${btBonus}%.`;

      return {
        ...prev,
        inventory: newInventory,
        history: [...prev.history, { story: hxStr, timestamp: Date.now() }],
        health: Math.min(prev.maxHealth + maxHpInc, prev.health + hpRestore),
        maxHealth: prev.maxHealth + maxHpInc,
        mana: Math.min(prev.maxMana + maxManaInc, prev.mana + manaRestore),
        maxMana: prev.maxMana + maxManaInc,
        tuVi: Math.min(prev.tuViCapacity, prev.tuVi + tuViBonus),
        breakthroughBonus: prev.breakthroughBonus + btBonus
      };
    });
  }, []);

  const addHistory = useCallback((
    story: string, 
    actionTaken?: string, 
    newNpcs?: any[], 
    chronicles?: string, 
    weather?: WeatherType, 
    mapData?: MapRegion[], 
    newEquipment?: any, 
    newTechnique?: any, 
    newBeasts?: any[], 
    timePassed?: { unit: string, value: number },
    chronicleEntry?: ChronicleEntry
  ) => {
    setState(prev => {
      let updatedNpcs = [...(prev.npcs || [])];
      if (newNpcs) {
        newNpcs.forEach(n => {
          const idx = updatedNpcs.findIndex(old => old.id === n.id || old.name === (n.name || n.temporaryName));
          if (idx >= 0) {
            // Prevent accidental resurrection
            const wasDead = updatedNpcs[idx].status === 'dead';
            const isAliveNow = n.status === 'alive';
            
            let mergedStatus = wasDead ? 'dead' : (n.status || updatedNpcs[idx].status);
            
            updatedNpcs[idx] = { 
              ...updatedNpcs[idx], 
              ...n,
              status: mergedStatus as any
            };
          } else {
            // New NPC: Ensure defaults
            const newNpcWithDefaults = {
              status: 'alive',
              health: 100,
              maxHealth: 100,
              attack: 10,
              defense: 5,
              speed: 10,
              mana: 50,
              maxMana: 50,
              realm: 'Phàm Nhân',
              age: 20,
              inventory: [],
              skills: [],
              relationship: 0,
              isNameRevealed: n.isNameRevealed ?? false,
              ...n,
              id: n.id || `npc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
            };
            updatedNpcs.push(newNpcWithDefaults);
          }
        });
      }

      const updatedEquipment = newEquipment 
        ? [...(prev.equipment || []), { ...newEquipment, rarity: newEquipment.rarity || 'Phàm' }] 
        : (prev.equipment || []);
      
      const updatedBeasts = newBeasts
        ? [...(prev.worldBeasts || []), ...newBeasts]
        : (prev.worldBeasts || []);
      
      let updatedTechniques = [...(prev.masteredTechniques || [])];
      let updatedCombatSkills = [...(prev.combatSkills || [])];
      let extraHistory: GameHistoryItem[] = [];
      let nextRealmLevel = prev.realmLevel;
      let nextRealm = prev.realm;
      let nextStage = prev.stage;
      let historyMetadata: any = {};

      if (newEquipment) {
        historyMetadata.foundEquipment = newEquipment.name;
      }

      if (newTechnique) {
        const alreadyHas = updatedTechniques.find(t => t.name === newTechnique.name);
        if (!alreadyHas) {
          const techWithDefaults = {
            ...newTechnique,
            id: newTechnique.id || `tech_${Date.now()}`,
            level: newTechnique.level || 1,
            maxLevel: newTechnique.maxLevel || 10,
            experience: newTechnique.experience || 0,
            isActive: updatedTechniques.length === 0, // Auto-activate if it's the first one
            circulation: {
              type: 'Chu Thiên',
              efficiency: 100,
              path: [],
              ...(newTechnique.circulation || {})
            },
            mastery: {
              refinement: 10,
              application: 5,
              ...(newTechnique.mastery || {})
            },
            core: {
              focus: 'Balanced',
              description: '',
              ...(newTechnique.core || {})
            }
          };
          updatedTechniques.push(techWithDefaults);
          historyMetadata.learnedTechnique = newTechnique.name;
          
          // If player is still a Phàm Nhân (Realm 0), upgrade to Luyện Khí (Realm 1)
          if (prev.realmLevel === 0) {
            nextRealmLevel = 1;
            const realmData = REALMS.find(r => r.level === 1);
            if (realmData) {
              nextRealm = realmData.name;
              nextStage = realmData.stages[0];
            }
            historyMetadata.realmUpgrade = nextRealm;
            extraHistory.push({
              story: `[Đột Phá] Thông qua việc lĩnh hội ${newTechnique.name}, bạn đã cảm ứng được linh khí, chính thức bước vào con đường tu tiên (Luyện Khí Tầng 1)!`,
              timestamp: Date.now() + 1
            });
          }

          // Generate a combat skill for the new technique
          const newSkill = generateSkill({
            level: Math.max(1, nextRealmLevel) * 10,
            elements: techWithDefaults.element,
            rarity: techWithDefaults.tier === 'Thiên' || techWithDefaults.tier === 'Đạo' ? 'MYTHIC' : 
                    techWithDefaults.tier === 'Địa' ? 'LEGENDARY' :
                    techWithDefaults.tier === 'Huyền' ? 'EPIC' : 
                    techWithDefaults.tier === 'Linh' ? 'RARE' : 'COMMON'
          });
          newSkill.originTechnique = techWithDefaults.name;
          updatedCombatSkills.push(newSkill);
          extraHistory.push({
            story: `[Ngộ Đạo] Bạn đã lĩnh hội được tuyệt học mới thông qua ${techWithDefaults.name}: ${newSkill.name}!`,
            timestamp: Date.now() + 1
          });
        }
      }

      // Advance timeline
      let updatedTimeline = { ...prev.timeline };
      let daysPassed = 30; // default 1 tháng
      if (timePassed && timePassed.unit && typeof timePassed.value === 'number') {
         let multiplier = TIME_UNIT_DAYS[timePassed.unit.toLowerCase()] || 1;
         daysPassed = timePassed.value * multiplier;
      }
      advanceTime(updatedTimeline, daysPassed);
      
      let nextHealth = prev.health;
      let nextMana = prev.mana;
      
      if (!prev.isCombat) {
          const hpRegen = Math.floor(prev.maxHealth * 0.02 + (prev.realmLevel || 0) * 2);
          const mpRegen = Math.floor(prev.maxMana * 0.03 + (prev.realmLevel || 0) * 3);
          nextHealth = Math.min(prev.maxHealth, prev.health + hpRegen);
          nextMana = Math.min(prev.maxMana, prev.mana + mpRegen);
      }

      return {
        ...prev,
        realm: nextRealm,
        realmLevel: nextRealmLevel,
        stage: nextStage,
        history: [...(prev.history || []), { story, actionTaken, timestamp: Date.now(), metadata: historyMetadata }, ...extraHistory],
        npcs: updatedNpcs,
        equipment: updatedEquipment,
        masteredTechniques: updatedTechniques,
        combatSkills: updatedCombatSkills,
        chronicles: chronicles || prev.chronicles,
        chronicleEntries: chronicleEntry ? [...(prev.chronicleEntries || []), chronicleEntry] : (prev.chronicleEntries || []),
        weather: weather || (prev.weather as any),
        mapData: mapData || prev.mapData,
        worldBeasts: updatedBeasts,
        timeline: updatedTimeline,
        health: nextHealth,
        mana: nextMana
      };
    });
  }, []);

  const toggleNsfw = useCallback(() => {
    setState(prev => ({ ...prev, isNsfwEnabled: !prev.isNsfwEnabled }));
  }, []);

  const updateCustomApiKey = useCallback((key: string) => {
    const sanitizedKey = key.replace(/[^\x20-\x7E]/g, "").trim();
    setState(prev => ({ ...prev, customApiKey: sanitizedKey }));
  }, []);

  const updateStoryLength = useCallback((length: PlayerState['storyLength']) => {
    setState(prev => ({ ...prev, storyLength: length }));
  }, []);

  const startCombat = useCallback((enemies: any[]) => {
    try {
      setState(prev => {
        let playerSkills = prev.combatSkills || [];
        const basicAttack: Skill = {
          id: 'basic_attack',
          name: 'Đấm Tay Đôi',
          description: 'Chiêu thức bản năng khi chưa có pháp lực hoặc cạn kiệt linh lực.',
          type: 'ACTIVE',
          baseDamage: Math.ceil((prev.attack || 10) * 0.2),
          scaling: 100,
          element: 'VẬT LÝ' as ElementType,
          cost: 0,
          cooldown: 0,
          targetType: 'SINGLE',
          rarity: 'COMMON'
        };

        if (!playerSkills.some(s => s.id === 'basic_attack')) {
          playerSkills = [...playerSkills, basicAttack];
        }

        const playerUnit: CombatUnit = {
          id: 'player',
          name: prev.name || 'Người chơi',
          hp: prev.health || 100,
          maxHp: prev.maxHealth || 100,
          mana: prev.mana || 50,
          maxMana: prev.maxMana || 50,
          attack: prev.attack || 10,
          defense: prev.defense || 5,
          speed: prev.speed || 10,
          accuracy: prev.accuracy || 60,
          element: (prev.element as ElementType) || 'KIM',
          skills: playerSkills as any,
          isPlayer: true,
          isAlive: true,
          realmLevel: prev.realmLevel || 0,
          cooldowns: {},
          activeEffects: [],
          position: { x: 5, y: 50 },
          actionTimer: 0,
          hitboxSize: 7,
          luck: prev.luck || 0
        };

        const enemyUnits: CombatUnit[] = enemies.map((e, idx) => {
          let beastDef = e.name && typeof e.name === 'string' ? BEAST_DATABASE[e.name] : null;
          if (!beastDef && prev.worldBeasts && e.name) {
            beastDef = prev.worldBeasts.find(b => b.name === e.name);
          }
          
          const beastLevelMap: Record<string, number> = { 'LOW': 1, 'MID': 3, 'HIGH': 5, 'LEGEND': 8 };
          const rawLevel = e.realmLevel || e.level || 0;
          const numericLevel = typeof rawLevel === 'string' ? (beastLevelMap[rawLevel] || 1) : rawLevel;

          const isBeast = !!beastDef || !!e.isBeast || !!e.species || !!e.talents;
          const powerFactor = e.basePower || beastDef?.basePower || 0.5;
          const bloodline = e.instinct?.bloodline || beastDef?.instinct?.bloodline || 0.2;
          const bloodlineType = e.bloodlineType || beastDef?.bloodlineType;

          // Standardized calculation
          const standardStats = isBeast 
            ? calculateBeastStats({ level: numericLevel, bloodline, basePower: powerFactor, bloodlineType })
            : calculateNPCStats({ realm: numericLevel, powerFactor });

          // Scale factor for difficulty
          let diffMult = 1.0;
          if (prev.difficulty === 'Dễ') diffMult = 0.7;
          else if (prev.difficulty === 'Khó') diffMult = 1.5;
          else if (prev.difficulty === 'Hồng Hoang') diffMult = 2.5;

          const attack = Math.floor((e.stats?.attack || e.attack || standardStats.attack) * diffMult);
          const defense = Math.floor((e.stats?.defense || e.defense || standardStats.defense) * diffMult);
          const maxHp = Math.floor((e.stats?.health || e.stats?.maxHealth || e.health || e.maxHealth || standardStats.maxHealth) * diffMult);
          const hp = maxHp;
          const maxMana = e.stats?.mana || e.mana || standardStats.maxMana;
          const mana = maxMana;
          const speed = e.stats?.speed || e.speed || (standardStats as any).speed || (standardStats.maxHealth / 100 + 10); // Simple speed scaling
          const accuracy = e.stats?.accuracy || e.accuracy || 60 + numericLevel;
          
          // Beasts use talents, NPCs use combatSkills or skills
          let rawSkills = e.combatSkills || e.talents || e.skills;
          let skills: any[] = [];
          if (rawSkills && rawSkills.length > 0) {
              skills = [...rawSkills];
          } else {
              skills = [
                {
                  id: `npc_basic_${idx}`,
                  name: 'Thần Thông Cơ Bản',
                  type: 'ACTIVE',
                  baseDamage: Math.max(10, attack * 0.5),
                  scaling: 100,
                  element: e.element || beastDef?.element || e.domain?.element || 'VẬT LÝ',
                  cost: 0,
                  cooldown: 0,
                  targetType: 'SINGLE',
                  rarity: 'COMMON'
                }
              ];
              
              // Give some generic enemies a healing/defensive skill
              if (Math.random() < 0.3) {
                  const isHeal = Math.random() < 0.5;
                  if (isHeal) {
                      skills.push({
                          id: `npc_heal_${idx}`,
                          name: 'Linh Thú Hồi Xuân',
                          type: 'ACTIVE',
                          element: 'MOC',
                          targetType: 'SELF',
                          baseDamage: -Math.max(20, maxHp * 0.1),
                          scaling: 0,
                          cost: 10,
                          cooldown: 12,
                          effects: [EffectsFactory.regen(3, 3)],
                          description: 'Tự phục hồi sinh lực.',
                          rarity: 'RARE'
                      });
                  } else {
                      skills.push({
                          id: `npc_def_${idx}`,
                          name: 'Ngọc Thạch Quyết',
                          type: 'ACTIVE',
                          element: 'THO',
                          targetType: 'SELF',
                          baseDamage: 0,
                          scaling: 0,
                          cost: 15,
                          cooldown: 10,
                          effects: [EffectsFactory.fortify(30, 5)],
                          description: 'Tăng cường phòng ngự.',
                          rarity: 'RARE'
                      });
                  }
              }
          }

          return {
            id: e.id || `enemy_${idx}`,
            name: e.isNameRevealed !== undefined ? (e.isNameRevealed ? e.name : e.temporaryName) : (e.name || (e.species ? e.species : "Kẻ Địch")),
            hp,
            maxHp,
            mana,
            maxMana,
            attack,
            defense,
            speed,
            accuracy,
            element: (e.element || beastDef?.element || e.domain?.element || 'KIM') as ElementType,
            skills: skills,
            isPlayer: false,
            isAlive: true,
            realmLevel: numericLevel,
            cooldowns: {},
            activeEffects: [],
            isBeast: !!beastDef || !!e.isBeast || !!e.species || !!e.talents,
            beastData: beastDef ? {
              level: beastDef.level,
              instinct: beastDef.instinct,
              habitat: beastDef.habitat
            } : (e.beastData || (e.instinct ? { level: e.level, instinct: e.instinct, habitat: [] } : undefined)),
            position: { x: Math.random() * 20 + 80, y: Math.random() * 80 + 10 },
            actionTimer: 0,
            hitboxSize: 7,
            luck: e.luck || 0
          };
        });

        console.log("Starting combat with enemies:", enemyUnits);

        return {
          ...prev,
          isCombat: true,
          combatState: {
            participants: [playerUnit, ...enemyUnits],
            projectiles: [],
            logs: ['Bắt đầu chiến đấu!'],
            isFinished: false,
            lastUpdate: Date.now()
          }
        };
      });
    } catch (err) {
      console.error("Lỗi khi khởi tạo trận chiến:", err);
    }
  }, []);

  const endCombat = useCallback((winnerId?: string) => {
    setState(prev => {
      if (!prev.combatState) return prev;
      
      const player = prev.combatState.participants.find(p => p.isPlayer);
      if (!player) return prev;

      const playerWins = winnerId === player.id;
      let rewards: InventoryItem[] = [];
      
      if (playerWins) {
        const deadEnemies = prev.combatState.participants.filter(p => !p.isPlayer && !p.isAlive);
        rewards = generateCombatRewards(deadEnemies, prev.luck || 10, prev.difficulty);
      }

      // Ensure any NPCs that died in combat are marked as dead in the global state
      const deadEnemyIds = prev.combatState.participants
        .filter(p => !p.isPlayer && !p.isAlive)
        .map(p => p.id);

      const updatedNpcs = (prev.npcs || []).map(npc => {
        if (deadEnemyIds.includes(npc.id)) {
          return { ...npc, status: 'dead' as const };
        }
        return npc;
      });

      // Update inventory and trigger finished state in combatState
      const newInventory = [...prev.inventory];
      rewards.forEach(reward => {
        const existing = newInventory.find(i => i.id === reward.id);
        if (existing) {
          existing.amount += reward.amount;
        } else {
          newInventory.push(reward);
        }
      });

      return {
        ...prev,
        isCombat: playerWins ? true : false, // Keep UI open if wins to show rewards
        health: Math.max(1, player.hp),
        mana: player.mana,
        inventory: newInventory,
        combatState: {
          ...prev.combatState!,
          isFinished: true,
          winnerId,
          rewards: rewards.length > 0 ? rewards : undefined,
          rewardsClaimed: true
        },
        npcs: updatedNpcs
      };
    });
  }, []);

  const closeCombat = useCallback(() => {
    setState(prev => ({
      ...prev,
      isCombat: false,
      combatState: undefined
    }));
  }, []);

  const updateCombatState = useCallback((updater: (prev: any) => any) => {
    setState(prev => {
      if (!prev.combatState) return prev;
      return {
        ...prev,
        combatState: updater(prev.combatState)
      };
    });
  }, []);

  const combatLoopUpdate = useCallback(() => {
    setState(prev => {
      if (!prev.isCombat || !prev.combatState || prev.combatState.isFinished) return prev;
      
      const now = Date.now();
      const dt = now - prev.combatState.lastUpdate;
      if (dt < 16) return prev; // limit to ~60fps
      
      const currentRegion = prev.mapData?.find(r => r.name === prev.currentLocation);
      
      let newParticipants = prev.combatState.participants.map(p => ({ ...p }));
      let newProjectiles = [...prev.combatState.projectiles];
      const newLogs = [...prev.combatState.logs];
      
      // Move projectiles
      newProjectiles = newProjectiles.filter(proj => {
        const target = newParticipants.find(p => p.id === proj.targetId);
        
        let dx = 1, dy = 1, dist = 999;
        if (target) {
           dx = target.position.x - proj.position.x;
           dy = target.position.y - proj.position.y;
           dist = Math.sqrt(dx * dx + dy * dy);
        }

        // Initialize velocity on first frame if not set
        if (!proj.velocity) {
             if (target && dist > 0) {
                 proj.velocity = { x: (dx / dist) * proj.speed, y: (dy / dist) * proj.speed };
             } else {
                 return false; // remove if target dead on frame 1 or zero distance
             }
        }
        
        // Use geometry for hits
        let isCollided = false;
        const hitbox = target?.hitboxSize || 7;

        if (target && dist < hitbox) {
            isCollided = true;
        }

        // Projectile goes out of bounds
        if (proj.position.x < -10 || proj.position.x > 110 || proj.position.y < -10 || proj.position.y > 110) {
            return false;
        }
        
        if (isCollided && target) {
          // Collision occurred! Now determine if it's a solid Hit or a Miss (Glancing blow)
          // Base hit chance is 85%
          const isHit = Math.random() < 0.85;
          
          const armor = target.isPlayer ? prev.defense : target.defense;
          const modifiedDef = getModifiedDefense(armor, target.activeEffects || []);
          const incomingMult = getIncomingDamageMultiplier(target.activeEffects || []);
          
          const counterMult = getCounterMultiplier(proj.element, target.element);
          const reaction = getReaction(proj.element, target.element);
          const elementMult = counterMult * (reaction.multiplier || 1);
          
          // Even a "Miss" (Trượt) deals 10% damage (shockwave/force) but is still mitigated by DEF
          const hitMult = isHit ? 1.0 : 0.1; 
          // Final Damage Formula: Damage * Element * DefenseReduc * Buffs
          // Defense Reduction: 200 / (200 + Defense) - more weight to defense in Tu Tien worlds
          const defenseReduc = 200 / (200 + modifiedDef);
          const finalDamage = proj.damage * hitMult * elementMult * defenseReduc * incomingMult;
          
          target.hp = Math.max(0, target.hp - finalDamage);
          
          let logMsg = `【${proj.sourceId === target.id ? 'Tự thân' : 'Kẻ địch'}】 ${isHit ? 'trúng đòn' : 'đánh trượt'} gây ${Math.floor(finalDamage)} sát thương!`;
          if (proj.isCrit && isHit) logMsg = `[CHÍ MẠNG] ${logMsg}`;
          newLogs.push(logMsg);
          
          if (isHit && reaction.effect && reaction.multiplier > 1) {
            newLogs.push(`[PHẢN ỨNG NGUYÊN TỐ]: ${reaction.effect}! Sát thương tăng x${reaction.multiplier}`);
            
            // Apply special status effects based on reaction
            if (reaction.effect === 'FREEZE') {
              target.activeEffects = [...(target.activeEffects || []), EffectsFactory.freeze(2)];
              newLogs.push(`【${target.name}】 bị đóng băng!`);
            } else if (reaction.effect === 'AOE_BURN') {
              target.activeEffects = [...(target.activeEffects || []), EffectsFactory.burn(2, 3)];
              newLogs.push(`【${target.name}】 bị thiêu đốt!`);
            } else if (reaction.effect === 'CHAIN_STUN') {
              target.activeEffects = [...(target.activeEffects || []), EffectsFactory.stun(1.5)];
              newLogs.push(`【${target.name}】 bị tê liệt!`);
            }
          }
          
          // Apply status effects from projectile
          if (proj.effects && proj.effects.length > 0) {
            proj.effects.forEach(effect => {
              // Deep clone effect to avoid shared state
              const newEffect = { ...effect, id: `eff_${Date.now()}_${Math.random()}` };
              target.activeEffects = [...(target.activeEffects || []), newEffect];
              newLogs.push(`【${target.name}】 bị ảnh hưởng bởi trạng thái ${newEffect.type}!`);
            });
          }
          
          if (target.hp <= 0) {
             target.isAlive = false;
             newLogs.push(`【${target.name}】 đã bị đánh bại!`);
          }
          return false;
        } else {
          // move exactly by velocity
          const speedObj = dt / 1000 / 4;
          proj.position.x += (proj.velocity.x) * speedObj;
          proj.position.y += (proj.velocity.y) * speedObj;
          return true;
        }
      });
      
      // Handle cooldowns, status effects
      newParticipants.forEach(unit => {
        if (!unit.isAlive) return;

        // Process status effects (ticking once per second)
        const unitTime = unit.lastTickTime || now;
        const timeSinceLastTick = now - unitTime;
        
        if (timeSinceLastTick >= 1000) {
          unit.lastTickTime = now;
          if (unit.activeEffects && unit.activeEffects.length > 0) {
            const nextEffects: typeof unit.activeEffects = [];
            
            unit.activeEffects.forEach(effect => {
              // Apply DoT
              if (effect.type === 'BURN') {
                const dmg = (unit.maxHp * (effect.potency / 100)) * (effect.stacks || 1);
                unit.hp = Math.max(0, unit.hp - dmg);
                if (unit.isPlayer || Math.random() < 0.2) newLogs.push(`【${unit.name}】 bị thiêu đốt mất ${Math.floor(dmg)} HP!`);
              } else if (effect.type === 'POISON') {
                const dmg = effect.potency * (effect.stacks || 1);
                unit.hp = Math.max(0, unit.hp - dmg);
                if (unit.isPlayer || Math.random() < 0.2) newLogs.push(`【${unit.name}】 bị trúng độc mất ${Math.floor(dmg)} HP!`);
              } else if (effect.type === 'REGEN') {
                const heal = unit.maxHp * (effect.potency / 100);
                unit.hp = Math.min(unit.maxHp, unit.hp + heal);
              }

              // Decrease duration
              effect.duration -= 1;
              if (effect.duration > 0) {
                nextEffects.push(effect);
              } else {
                newLogs.push(`【${unit.name}】 đã thoát khỏi trạng thái ${effect.type}.`);
              }
            });
            unit.activeEffects = nextEffects;
            
            if (unit.hp <= 0) {
              unit.isAlive = false;
              newLogs.push(`【${unit.name}】 đã vẫn lạc do tác động của ngoại lực!`);
            }
          }
        } else if (!unit.lastTickTime) {
          unit.lastTickTime = now;
        }

        if (!unit.isAlive) return;

        // Skip action if hard-controlled
        const isStunned = isHardControlled(unit.activeEffects || []);
        if (isStunned) {
          unit.targetPosition = undefined; // Stop moving
          return;
        }

        // Combatant logic (Player and NPCs)
        if (unit.isAlive) {
           const targets = newParticipants.filter(p => !p.isPlayer !== !unit.isPlayer && p.isAlive);
           if (targets.length > 0) {
              // Target nearest enemy
              let minDistance = Infinity;
              let target: CombatUnit | undefined;
              targets.forEach(t => {
                const dx = t.position.x - unit.position.x;
                const dy = t.position.y - unit.position.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < minDistance) {
                  minDistance = dist;
                  target = t;
                }
              });

              if (target) {
                  // Auto Movement (Both Player and Enemies)
                  if (!unit.isEscaping) {
                     // Check for incoming projectiles to dodge
                     const incomingProj = newProjectiles.find(p => p.targetId === unit.id);
                     let isDodging = false;
                     
                     if (incomingProj && incomingProj.velocity) {
                         const dx = unit.position.x - incomingProj.position.x;
                         const dy = unit.position.y - incomingProj.position.y;
                         const distProj = Math.sqrt(dx*dx + dy*dy);
                         
                         // If within sensing distance
                         if (distProj < 35) {
                             const accuracyVal = unit.accuracy || 30;
                             
                             // Simple pseudo-random determined by id
                             const sign = (incomingProj.id.charCodeAt(incomingProj.id.length - 1) % 2 === 0) ? 1 : -1;
                             
                             // Speed of dodging depends on accuracy
                             // Normal move speed will cap how fast they physically move,
                             // but we can set a strong target offset based on accuracy.
                             // A higher accuracy means they react earlier and stronger.
                             if (accuracyVal > 10) {
                                 isDodging = true;
                                 
                                 const pdx = -incomingProj.velocity.y;
                                 const pdy = incomingProj.velocity.x;
                                 const pLen = Math.sqrt(pdx*pdx + pdy*pdy);
                                 
                                 if (pLen > 0) {
                                     const dodgeAmt = Math.min(20, accuracyVal / 3);
                                     unit.targetPosition = { 
                                         x: Math.max(5, Math.min(95, unit.position.x + (pdx / pLen) * dodgeAmt * sign)),
                                         y: Math.max(5, Math.min(95, unit.position.y + (pdy / pLen) * dodgeAmt * sign))
                                     };
                                 }
                             }
                         }
                     }

                     if (!isDodging) {
                         // Basic tactical AI: If too far, approach. If too close, retreat slightly.
                         const optimalRange = 25;
                         if (minDistance > optimalRange + 5) {
                            // Approach
                            unit.targetPosition = { x: target.position.x, y: target.position.y };
                         } else if (minDistance < optimalRange - 5) {
                            // Kite / Retreat
                            const angle = Math.atan2(unit.position.y - target.position.y, unit.position.x - target.position.x);
                            const retreatX = Math.max(5, Math.min(95, unit.position.x + Math.cos(angle) * 10));
                            const retreatY = Math.max(5, Math.min(95, unit.position.y + Math.sin(angle) * 10));
                            unit.targetPosition = { x: retreatX, y: retreatY };
                         } else {
                            // Hold position
                            unit.targetPosition = undefined;
                         }
                     }
                  }

                  // Auto Attack (Enemies only)
                  if (!unit.isPlayer && minDistance <= 35 && !unit.isEscaping) {
                      // Choose a random available skill based on cooldown and mana
                      const availableSkills = unit.skills.filter(s => (unit.cooldowns[s.id] || 0) <= now && unit.mana >= (s.cost || 0));
                      
                      if (availableSkills.length > 0) {
                          // Prefer skills with higher damage
                          availableSkills.sort((a, b) => (b.baseDamage || 0) - (a.baseDamage || 0));
                          const skill = availableSkills[Math.floor(Math.random() * Math.min(availableSkills.length, 2))]; 
                          
                          const cost = skill.cost || 0;
                          unit.mana -= cost;
                          const cooldownMs = (skill.cooldown && skill.cooldown > 0) ? skill.cooldown * 1000 : 1500;
                          unit.cooldowns[skill.id] = now + cooldownMs;
                          
                          const attackValue = unit.attack;
                          
                          if (skill.targetType === 'SELF') {
                              if (skill.effects) {
                                  unit.activeEffects = unit.activeEffects || [];
                                  skill.effects.forEach(eff => {
                                      unit.activeEffects?.push({ ...eff, id: `${eff.type}_${Date.now()}_${Math.random()}` });
                                  });
                              }
                              if (skill.baseDamage < 0) {
                                  const heal = -skill.baseDamage;
                                  unit.hp = Math.min(unit.maxHp, unit.hp + heal);
                              }
                              newLogs.push(`【${unit.name}】 thi triển [${skill.name}], ánh sáng chói lóa bao phủ toàn thân!`);
                          } else {
                              const variance = 0.9 + Math.random() * 0.2;
                              const damage = ((skill.baseDamage || 10) + attackValue * ((skill.scaling || 100) / 100)) * variance;
                              
                              newProjectiles.push({
                                     id: `proj_${now}_${Math.random()}`,
                                     sourceId: unit.id,
                                     targetId: target.id,
                                     position: { ...unit.position },
                                     speed: 15,
                                     damage,
                                     accuracy: unit.accuracy || 50,
                                     element: skill.element as unknown as ElementType,
                                     isCrit: Math.random() < (unit.critChance || 0) / 100,
                                     skillId: skill.id,
                                     effects: skill.effects
                                  });
                              
                              if (Math.random() < 0.3) {
                                 newLogs.push(`【${unit.name}】 thi triển [${skill.name}]!`);
                              }
                          }
                      }
                  }
              }
           }
         }

         // simple move logic
         if (unit.targetPosition) {
           const dx = unit.targetPosition.x - unit.position.x;
           const dy = unit.targetPosition.y - unit.position.y;
           const dist = Math.sqrt(dx * dx + dy * dy);
           if (dist > 1) {
              const currentSpeed = getModifiedSpeed(unit.speed, unit.activeEffects || []);
              const speedObj = (currentSpeed * (currentRegion?.terrain && ['Snow', 'Blizzard', 'Cold'].includes(currentRegion.terrain) ? 0.7 : 1.0) / 10 * dt) / 1000;
              unit.position.x += (dx / dist) * Math.min(speedObj, dist);
              unit.position.y += (dy / dist) * Math.min(speedObj, dist);
           }
         }
      });
      
      // Perform environmental updates
      if (currentRegion?.terrain === 'Lava') {
        newParticipants.forEach(unit => {
          if (unit.isAlive) {
            if (!unit.lastTickTime || now - unit.lastTickTime > 1000) {
              unit.hp = Math.max(0, unit.hp - 2);
              unit.lastTickTime = now;
              newLogs.push(`Địa hình dung nham khiến ${unit.name} chịu 2 sát thương!`);
            }
          }
        });
      }

      // Check if combat is finished
      const alivePlayers = newParticipants.filter(p => p.isPlayer && p.isAlive);
      const aliveEnemies = newParticipants.filter(p => !p.isPlayer && p.isAlive);
      
      let isFinished = false;
      let winnerId: string | undefined = undefined;
      
      const escapingPlayer = alivePlayers.find(p => p.isEscaping && (p.position.x <= 2 || p.position.x >= 98 || p.position.y <= 2 || p.position.y >= 98));

      if (escapingPlayer) {
        isFinished = true;
        winnerId = undefined;
        newLogs.push("Trận chiến kết thúc. Bạn đã chạy trốn thành công!");
      } else if (alivePlayers.length === 0) {
        isFinished = true;
        winnerId = aliveEnemies[0]?.id;
        newLogs.push("Trận chiến kết thúc. Bạn đã bại trận...");
      } else if (aliveEnemies.length === 0) {
        isFinished = true;
        winnerId = alivePlayers[0]?.id;
        newLogs.push("Trận chiến kết thúc. Bạn đã thắng lợi!");
      }

      return {
        ...prev,
        combatState: {
          ...prev.combatState,
          participants: newParticipants,
          projectiles: newProjectiles,
          logs: newLogs,
          isFinished,
          winnerId,
          lastUpdate: now
        }
      };
    });
  }, []);

  const performRealtimeAttack = useCallback((attackerId: string, skillId: string) => {
    setState(prev => {
      if (!prev.isCombat || !prev.combatState) return prev;
      
      const now = Date.now();
      const attackerFastCheck = prev.combatState.participants.find(p => p.id === attackerId);
      if (!attackerFastCheck || !attackerFastCheck.isAlive) return prev;
      
      const skillFastCheck = attackerFastCheck.skills.find(s => s.id === skillId);
      if (!skillFastCheck) return prev;
      
      if ((attackerFastCheck.cooldowns[skillId] || 0) > now) return prev;
      if (attackerFastCheck.mana < (skillFastCheck.cost || 0)) return prev;

      const newParticipants = prev.combatState.participants.map(p => ({ ...p }));
      const newProjectiles = [...prev.combatState.projectiles];
      const newLogs = [...prev.combatState.logs];
      
      const attacker = newParticipants.find(p => p.id === attackerId);
      if (!attacker || !attacker.isAlive) return prev;
      
      const skill = attacker.skills.find(s => s.id === skillId);
      if (!skill) return prev;
      
      // Handle SELF target type (healing/buffs)
      if (skill.targetType === 'SELF') {
         if (attacker.mana < (skill.cost || 0)) {
            newLogs.push(`${attacker.name} không đủ nội lực!`);
            return prev;
         }
         if ((attacker.cooldowns[skill.id] || 0) > now) {
            return prev;
         }
         
         attacker.mana -= (skill.cost || 0);
         const cooldownMs = Math.max(2000, (skill.cooldown && skill.cooldown > 0) ? skill.cooldown * 1000 : 2000);
         attacker.cooldowns[skill.id] = now + cooldownMs;
         
         if (skill.effects) {
             attacker.activeEffects = attacker.activeEffects || [];
             skill.effects.forEach(eff => {
                 attacker.activeEffects?.push({ ...eff, id: `${eff.type}_${Date.now()}_${Math.random()}` });
             });
         }
         
         if (skill.baseDamage < 0) {
              const heal = -skill.baseDamage;
              attacker.hp = Math.min(attacker.maxHp, attacker.hp + heal);
         }
         
         newLogs.push(`【${attacker.name}】 thi triển [${skill.name}], nội thể bừng lên sinh cơ!`);

         return {
           ...prev,
           combatState: {
             ...prev.combatState,
             participants: newParticipants,
             logs: newLogs
           }
         };
      }
      
      // Auto-target: find nearest enemy in range
      let target: CombatUnit | undefined;
      const enemies = newParticipants.filter(p => p.isAlive && p.isPlayer !== attacker.isPlayer);
      
      if (enemies.length === 0) return prev;
      
      // Find nearest
      let minDistance = Infinity;
      enemies.forEach(e => {
        const dx = e.position.x - attacker.position.x;
        const dy = e.position.y - attacker.position.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < minDistance) {
          minDistance = dist;
          target = e;
        }
      });
      
      if (!target) return prev;
      
      // Check Distance
      if (minDistance > 35) {
         // Out of range, let auto-movement bring them closer
         return prev;
      }
      
      // Check MP & Cooldown
      if (attacker.mana < (skill.cost || 0)) {
         newLogs.push(`${attacker.name} không đủ nội lực!`);
         return prev;
      }
      
      if ((attacker.cooldowns[skill.id] || 0) > now) {
         // still on cooldown
         return prev;
      }
      
      // Fire!
      attacker.mana -= (skill.cost || 0);
      const cooldownMs = Math.max(2000, (skill.cooldown && skill.cooldown > 0) ? skill.cooldown * 1000 : 2000);
      attacker.cooldowns[skill.id] = now + cooldownMs;
      
      // Calculate Base Damage (defense will be applied when projectile hits)
      const skillElements = Array.isArray(skill.element) ? skill.element : [skill.element];
      const primaryElement = skillElements[0] as any;
      const targetElement = target.element as any;
      
      let attackValue = attacker.attack;
      
      // Damage = (Base + Attack * Scaling) * Variance
      // Scaling is now a coefficient (e.g., 1.2, 2.5)
      // (Elemental multipliers will be applied on impact)
      const variance = 0.95 + Math.random() * 0.1; // 0.95x to 1.05x for more stability
      const scaling = skill.scaling || 1.0;
      let damage = attackValue * scaling * variance;
      
      const isCrit = Math.random() * 100 < (attacker.isPlayer ? prev.critChance : (attacker.critChance || 5));
      if (isCrit) {
        damage *= (attacker.isPlayer ? prev.critDamage / 100 : (attacker.critDamage || 150) / 100);
      }
      
      newProjectiles.push({
         id: `proj_${now}_${Math.random()}`,
         sourceId: attacker.id,
         targetId: target.id,
         position: { ...attacker.position },
         speed: 15, // units per second
         damage,
         accuracy: attacker.accuracy || 60,
         element: primaryElement,
         isCrit,
         skillId: skill.id,
         effects: skill.effects // Pass the status effects to projectile
      });
      
      return {
        ...prev,
        combatState: {
          ...prev.combatState,
          participants: newParticipants,
          projectiles: newProjectiles,
          logs: newLogs
        }
      };
    });
  }, []);

  const moveCombatant = useCallback((unitId: string, position: { x: number, y: number }) => {
     setState(prev => {
        if (!prev.isCombat || !prev.combatState) return prev;
        return {
           ...prev,
           combatState: {
              ...prev.combatState,
              participants: prev.combatState.participants.map(p => 
                 p.id === unitId ? { ...p, targetPosition: position } : p
              )
           }
        };
     });
  }, []);

  const attemptEscape = useCallback(() => {
    setState(prev => {
      if (!prev.isCombat || !prev.combatState) return prev;
      
      const newLogs = [...prev.combatState.logs];
      const participants = prev.combatState.participants;
      const playerIndex = participants.findIndex(p => p.isPlayer);
      if (playerIndex === -1) return prev;

      const player = participants[playerIndex];
      
      // If already escaping, cancel it
      if (player.isEscaping) {
         newLogs.push(`[Hủy Thoát Ly] Bạn quyết định quay lại chiến đấu!`);
         return {
           ...prev,
           combatState: {
             ...prev.combatState,
             logs: newLogs,
             participants: participants.map((p, i) => i === playerIndex ? { ...p, isEscaping: false, targetPosition: undefined } : p)
           }
         };
      }

      newLogs.push(`[Thoát Ly] Bạn đang cố gắng chạy trốn ra khỏi biên giới chiến trường! (Di chuyển ra rìa để thoát)`);
      
      // Calculate nearest edge
      let targetX = player.position.x;
      let targetY = player.position.y;
      
      if (player.position.x < 50) targetX = 0; else targetX = 100;
      if (player.position.y < 50) targetY = 0; else targetY = 100;
      
      // Choose the closest edge
      if (Math.abs(player.position.x - targetX) < Math.abs(player.position.y - targetY)) {
          targetY = player.position.y;
      } else {
          targetX = player.position.x;
      }

      return {
        ...prev,
        combatState: {
          ...prev.combatState,
          logs: newLogs,
          participants: participants.map((p, i) => i === playerIndex ? { ...p, isEscaping: true, targetPosition: { x: targetX, y: targetY } } : p)
        }
      };
    });
  }, []);

  const exportGame = useCallback(() => {
    const dataStr = JSON.stringify(state, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `thien_dao_${state.name}_${new Date().toISOString().slice(0, 10)}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }, [state]);

  const importGame = useCallback((file: File) => {
    console.log("Importing game file:", file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result;
        console.log("File content length:", typeof content === 'string' ? content.length : 'unknown');
        if (typeof content === 'string') {
          const parsed = JSON.parse(content);
          if (parsed && typeof parsed === 'object') {
            // Validate required fields if necessary
            setState({ 
              ...parsed, 
              isInitialized: true,
              // Ensure critical fields exist
              history: parsed.history || [],
              inventory: parsed.inventory || [],
              npcs: parsed.npcs || [],
              factionsReputation: parsed.factionsReputation || {},
              resources: parsed.resources || {}
            });
            alert("Tải dữ liệu Thiên Cơ thành công!");
          } else {
            alert("Định dạng file Thiên Cơ không hợp lệ!");
          }
        }
      } catch (err) {
        alert("Thất bại khi triệu hồi ký ức từ file!");
        console.error(err);
      }
    };
    reader.readAsText(file);
  }, []);

  const exitToMenu = useCallback(() => {
    if (window.confirm("Bạn muốn thoát ra màn hình chính? (Tiến trình hiện tại vẫn sẽ được lưu trữ tự động)")) {
      setState(prev => ({ ...prev, isInitialized: false }));
    }
  }, []);

  const meditate = useCallback(() => {
    const activeTech = state.masteredTechniques.find(t => t.isActive) || state.masteredTechniques[0];
    const techName = activeTech ? activeTech.name : "vô danh công pháp";
    const focus = activeTech?.core?.focus || "cân bằng";

    // Level up active technique experience
    if (activeTech) {
      setState(prev => {
        const updatedTechs = prev.masteredTechniques.map(t => {
          if (t.id === activeTech.id) {
            const expGain = Math.floor(10 + Math.random() * 10);
            const nextExp = t.experience + expGain;
            const expToLevel = t.level * 100;
            
            if (nextExp >= expToLevel && t.level < t.maxLevel) {
              return { ...t, level: t.level + 1, experience: nextExp - expToLevel };
            }
            return { ...t, experience: nextExp };
          }
          return t;
        });
        
        // Add a small amount of tuVi during manual meditation
        let mult = 1.0;
        const realmData = REALMS.find(r => r.level === prev.realmLevel);
        if (realmData && realmData.stageMultipliers) {
           const idx = realmData.stages.indexOf(prev.stage);
           if (idx >= 0 && idx < realmData.stageMultipliers.length) {
              mult = realmData.stageMultipliers[idx];
           }
        }
        const tuViGain = Math.floor((5 + Math.random() * 5) * mult);
        return { 
          ...prev, 
          masteredTechniques: updatedTechs,
          tuVi: Math.min(prev.tuViCapacity, prev.tuVi + tuViGain)
        };
      });
    }

    return `[Hành động: Tĩnh toạ tu luyện] Tôi đang vận hành ${techName}, tập trung vào ${focus} để hấp thu linh khí, rèn luyện tu vi.`;
  }, [state.masteredTechniques]);

  const toggleTechnique = useCallback((techId: string) => {
    setState(prev => {
      const activeTechs = prev.masteredTechniques.filter(t => t.isActive);
      const isActivating = !prev.masteredTechniques.find(t => t.id === techId)?.isActive;

      if (isActivating && activeTechs.length >= 3) {
        return prev; // Limit to 3 active techniques
      }

      const updatedTechs = prev.masteredTechniques.map(t => {
        if (t.id === techId) {
          return { ...t, isActive: !t.isActive };
        }
        return t;
      });
      return { ...prev, masteredTechniques: updatedTechs };
    });
  }, []);

  const attemptBreakthrough = useCallback(() => {
    let success = false;
    let message = "";
    
    setState(prev => {
      if (prev.tuVi < prev.tuViCapacity) return prev;
      
      const roll = Math.random() * 100;
      success = roll < prev.breakthroughChance;
      
      if (success) {
        const currentRealm = REALMS.find(r => r.level === prev.realmLevel);
        const stageIndex = currentRealm?.stages.indexOf(prev.stage) ?? -1;
        
        let nextRealm = prev.realm;
        let nextStage = prev.stage;
        let nextLevel = prev.realmLevel;
        let nextStageIndex = stageIndex;
        let nextRealmObj = currentRealm;
        
        if (stageIndex < (currentRealm?.stages.length ?? 0) - 1) {
          // Advance stage
          nextStage = currentRealm!.stages[stageIndex + 1];
          nextStageIndex = stageIndex + 1;
          message = `[Đột Phá] Chúc mừng! Bạn đã đột phá lên ${nextRealm} - ${nextStage}!`;
        } else {
          // Advance realm
          const nextRealmData = REALMS.find(r => r.level === prev.realmLevel + 1);
          if (nextRealmData) {
            nextRealmObj = nextRealmData;
            nextRealm = nextRealmData.name;
            nextStage = nextRealmData.stages[0];
            nextLevel = prev.realmLevel + 1;
            nextStageIndex = 0;
            message = `[Đại Đột Phá] Thiên địa dị tượng! Bạn đã thành công tiến vào ${nextRealm}!`;
          } else {
             message = "[Viên Mãn] Bạn đã đạt đến đỉnh cao của thế giới này!";
             return prev;
          }
        }
        
        let nextStageMult = 1.0;
        if (nextRealmObj && nextRealmObj.stageMultipliers && nextStageIndex >= 0 && nextStageIndex < nextRealmObj.stageMultipliers.length) {
          nextStageMult = nextRealmObj.stageMultipliers[nextStageIndex];
        }

        // Base capacity grows smoothly: base * (realmLevel*2 + 1)^1.5 * stageMult
        // Level 0: 100 * 1 * 1.0 = 100
        // Level 1: 100 * 3^1.5 ≈ 520 * 1.1 ≈ 570
        // Level 2: 100 * 5^1.5 ≈ 1118 * 2.5 ≈ 2800
        // Level 3: 100 * 7^1.5 ≈ 1852 * 5.0 ≈ 9260
        // Level 9: 100 * 19^1.5 ≈ 8280 * 1000 ≈ 8,280,000
        // Use nextStageIndex + 1 inside as well to make stages within same realm grow a bit
        const stageFactor = 1 + (nextStageIndex * 0.1); 
        let nextCapacity = Math.floor(100 * Math.pow((nextLevel * 2) + 1, 1.5) * stageFactor * nextStageMult);
        
        return {
          ...prev,
          realm: nextRealm,
          stage: nextStage,
          realmLevel: nextLevel,
          tuVi: 0,
          tuViCapacity: nextCapacity,
          breakthroughBonus: (prev.breakthroughBonus || 0) - 10, // Higher realms are fundamentally harder
          history: [...prev.history, { story: message, timestamp: Date.now() }]
        };
      } else {
        message = "[Thất Bại] Đột phá không thành công, tâm mạch bị tổn thương nhẹ. Tu vi bị tiêu tán một phần.";
        return {
          ...prev,
          tuVi: Math.floor(prev.tuVi * 0.7),
          health: Math.max(1, prev.health - 20),
          breakthroughBonus: (prev.breakthroughBonus || 0) + 5, // Learn from failure
          history: [...prev.history, { story: message, timestamp: Date.now() }]
        };
      }
    });

    return { success, message };
  }, []);

  return {
    state,
    initPlayer,
    updateStats,
    addHistory,
    equipItem,
    unequipItem,
    craftItem,
    resetGame,
    toggleNsfw,
    updateCustomApiKey,
    updateStoryLength,
    exportGame,
    importGame,
    exitToMenu,
    startCombat,
    endCombat,
    closeCombat,
    updateCombatState,
    combatLoopUpdate,
    performRealtimeAttack,
    moveCombatant,
    attemptEscape,
    meditate,
    toggleTechnique,
    attemptBreakthrough,
    consumeItem,
    joinSect,
    promoteSectRank,
    leaveSect,
    performSectAction,
    completeSectMission,
    completeSectTrial,
    meetFactionNPC,
    joinOrg,
    leaveOrg,
    acceptMission,
    acceptOrgMission,
    performOrgAction,
    completeOrgMission
  };
}
