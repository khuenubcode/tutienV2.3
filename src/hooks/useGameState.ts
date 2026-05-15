import { useState, useCallback, useEffect } from 'react';
import { PlayerState, GameHistoryItem, WeatherType, NPC, Difficulty, InventoryItem } from '../types';

const STORAGE_KEY = 'thien_dao_story_save';

const INITIAL_PLAYER_STATE: PlayerState = {
  name: '',
  gender: 'Nam',
  realm: 'Phàm Nhân',
  stage: 'Tầng 1',
  realmLevel: 0,
  tuVi: 0,
  tuViCapacity: 100,
  health: 100,
  maxHealth: 100,
  mana: 50,
  maxMana: 50,
  reputation: 0,
  karma: 0,
  background: '',
  talent: '',
  linhCan: '',
  inventory: [],
  history: [],
  currentLocation: 'Tân Thủ Thôn',
  chronicles: 'Hành trình chưa bắt đầu.',
  difficulty: 'Thường',
  storyLength: 'Bình thường',
  weather: 'Nắng',
  isInitialized: false,
  isNsfwEnabled: false,
  isScenePopupEnabled: true,
  aiTier: 'flash',
  customApiKey: '',
  preferCustomKey: true,
  lastApiKeyStatus: 'idle',
  worldDescription: '',
  environmentSummary: 'Chưa xác định.',
  npcSummary: 'Chưa có NPC nào xuất hiện.',
  eventSummary: 'Chưa có sự kiện nào diễn ra.',
  lore: {
    world: '',
    origin: '',
    majorArcs: ''
  }
};

const getSavedState = (): PlayerState => {
  if (typeof window === 'undefined') return INITIAL_PLAYER_STATE;
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      return { ...INITIAL_PLAYER_STATE, ...parsed };
    } catch (e) {
      console.error("Failed to load saved state", e);
      return INITIAL_PLAYER_STATE;
    }
  }
  return INITIAL_PLAYER_STATE;
};

export function useGameState() {
  const [state, setState] = useState<PlayerState>(getSavedState);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const initPlayer = useCallback((data: Partial<PlayerState>) => {
    setState(prev => ({
      ...prev,
      ...data,
      isInitialized: true
    }));
  }, []);

  const updateStats = useCallback((updates: Partial<PlayerState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const addHistory = useCallback((
    story: string, 
    actionTaken?: string,
    playerUpdates?: Partial<PlayerState>,
    chronicles?: string,
    weather?: WeatherType,
    environmentSummary?: string,
    npcSummary?: string,
    eventSummary?: string
  ) => {
    setState(prev => {
      const newHistoryItem: GameHistoryItem = {
        story,
        actionTaken,
        timestamp: Date.now()
      };

      return {
        ...prev,
        ...playerUpdates,
        history: [...(prev.history || []), newHistoryItem],
        chronicles: chronicles || prev.chronicles,
        weather: weather || prev.weather,
        environmentSummary: environmentSummary || prev.environmentSummary,
        npcSummary: npcSummary || prev.npcSummary,
        eventSummary: eventSummary || prev.eventSummary
      };
    });
  }, []);

  const resetGame = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setState(INITIAL_PLAYER_STATE);
    window.location.reload();
  }, []);

  const exportGame = useCallback(() => {
    const dataStr = JSON.stringify(state, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', `thien_dao_save_${state.name || 'new'}.json`);
    linkElement.click();
  }, [state]);

  const importGame = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result;
        if (typeof content === 'string') {
          const parsed = JSON.parse(content);
          setState({ ...parsed, isInitialized: true });
        }
      } catch (err) {
        alert("Lỗi khi tải file save!");
      }
    };
    reader.readAsText(file);
  }, []);

  const exitToMenu = useCallback(() => {
    setState(prev => ({ ...prev, isInitialized: false }));
  }, []);

  const toggleNsfw = useCallback(() => {
    setState(prev => ({ ...prev, isNsfwEnabled: !prev.isNsfwEnabled }));
  }, []);

  const toggleScenePopup = useCallback(() => {
    setState(prev => ({ ...prev, isScenePopupEnabled: !prev.isScenePopupEnabled }));
  }, []);

  const toggleAiTier = useCallback(() => {
    setState(prev => ({ ...prev, aiTier: prev.aiTier === 'flash' ? 'pro' : 'flash' }));
  }, []);

  const togglePreferCustomKey = useCallback(() => {
    setState(prev => ({ ...prev, preferCustomKey: !prev.preferCustomKey }));
  }, []);

  const setApiKeyStatus = useCallback((status: string) => {
    setState(prev => ({ ...prev, lastApiKeyStatus: status }));
  }, []);

  return {
    state,
    initPlayer,
    updateStats,
    addHistory,
    resetGame,
    exportGame,
    importGame,
    exitToMenu,
    toggleNsfw,
    toggleScenePopup,
    toggleAiTier,
    togglePreferCustomKey,
    setApiKeyStatus
  };
}
