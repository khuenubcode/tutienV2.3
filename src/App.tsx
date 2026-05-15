import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Scroll, 
  Sword, 
  User, 
  Zap, 
  Heart, 
  Sparkles, 
  RotateCcw,
  Package,
  Settings,
  History,
  Activity,
  Brain,
  LayoutDashboard,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  Database,
  Book
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { memo } from 'react';

// Memoized story component for performance
const StorySegment = memo(({ item, isNew }: { item: any; isNew?: boolean }) => {
  const [displayedText, setDisplayedText] = useState(isNew ? "" : item.story);
  
  useEffect(() => {
    if (isNew && displayedText.length < item.story.length) {
      const timeout = setTimeout(() => {
        // Type faster for longer stories
        const increment = Math.ceil(item.story.length / 100);
        setDisplayedText(item.story.slice(0, displayedText.length + increment));
      }, 10);
      return () => clearTimeout(timeout);
    }
  }, [displayedText, item.story, isNew]);

  return (
    <motion.div 
      initial={isNew ? { opacity: 0, x: -10 } : false}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      {item.actionTaken && (
        <div className="flex justify-end">
          <div className="bg-slate-900/50 border border-slate-800 px-4 py-2 rounded-lg text-amber-500/80 text-[11px] font-mono uppercase tracking-widest max-w-[80%]">
            {item.actionTaken}
          </div>
        </div>
      )}
      <div className="text-slate-300 leading-relaxed text-lg font-serif">
        <ReactMarkdown
          components={{
            p: ({ children }) => {
              const textContent = Array.isArray(children) 
                ? children.join('') 
                : (typeof children === 'string' ? children : '');
              
              const dialogueMatch = textContent.match(/^\[(.*?)\]:\s*"(.*?)"$/);
              const systemMatch = textContent.match(/^\[(HỆ THỐNG|SYSTEM|NOTIFICATION)\]:\s*(.*)$/i);
              
              if (dialogueMatch) {
                const [, name, speech] = dialogueMatch;
                return (
                  <div className="my-8 p-5 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-l-2 border-amber-500 rounded-r-xl relative group shadow-2xl shadow-black/40">
                    <div className="absolute -top-3 left-4 bg-[#080a0d] border border-amber-500/40 px-3 py-1 rounded-full shadow-lg shadow-amber-500/10 transition-all group-hover:scale-105 group-hover:border-amber-400">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500 group-hover:text-amber-400">
                        {name}
                      </span>
                    </div>
                    <div className="text-slate-100 italic font-medium leading-relaxed drop-shadow-sm">
                      “{speech}”
                    </div>
                    <div className="absolute right-4 bottom-2 opacity-5 text-amber-500 pointer-events-none">
                      <Sparkles size={40} />
                    </div>
                  </div>
                );
              }

              if (systemMatch) {
                const [, prefix, content] = systemMatch;
                return (
                  <div className="my-6 p-4 bg-sky-500/5 border border-sky-500/20 rounded-lg flex items-start gap-4 shadow-inner">
                    <div className="mt-1 p-1.5 bg-sky-500/10 border border-sky-500/30 rounded shadow-sm">
                      <ShieldAlert size={14} className="text-sky-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-[9px] font-black text-sky-500 uppercase tracking-[0.25em]">{prefix}</span>
                        <div className="h-px flex-1 bg-gradient-to-r from-sky-500/30 to-transparent" />
                      </div>
                      <div className="text-slate-300 text-sm font-mono leading-relaxed italic">{content}</div>
                    </div>
                  </div>
                );
              }
              
              return <p className="mb-6 last:mb-0 drop-shadow-sm">{children}</p>;
            }
          }}
        >
          {displayedText}
        </ReactMarkdown>
      </div>
    </motion.div>
  );
});
import { 
  generateNextStep, 
  GameResponse, 
  getSessionUsage, 
  resetSessionUsage, 
  AIUsage, 
  generateLoreSuggestions,
  validateApiKey,
  testApiKey
} from './services/geminiService';
import { useGameState } from './hooks/useGameState';
import { Difficulty, InventoryItem } from './types';
import { cn } from './lib/utils';
import { WeatherEffect } from './components/WeatherEffect';

export default function App() {
  const { 
    state, 
    initPlayer, 
    updateStats, 
    addHistory, 
    resetGame, 
    exitToMenu,
    toggleNsfw,
    toggleScenePopup,
    toggleAiTier,
    togglePreferCustomKey,
    setApiKeyStatus
  } = useGameState();

  const [currentResponse, setCurrentResponse] = useState<GameResponse | null>(null);
  const [activeScene, setActiveScene] = useState<{title: string, description: string} | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoreLoading, setIsLoreLoading] = useState(false);
  const [isTestingKey, setIsTestingKey] = useState(false);
  const [keyTestResult, setKeyTestResult] = useState<{success?: boolean, message?: string} | null>(null);
  const [playerName, setPlayerName] = useState(state.name || '');
  const [playerGender, setPlayerGender] = useState<'Nam' | 'Nữ'>(state.gender || 'Nam');
  const [playerDifficulty, setPlayerDifficulty] = useState<Difficulty>(state.difficulty || 'Thường');
  const [activeTab, setActiveTab] = useState<'story' | 'inventory' | 'history' | 'settings' | 'lore'>('story');
  const [sessionTokens, setSessionTokens] = useState<AIUsage>(getSessionUsage());
  const [customKey, setCustomKey] = useState(state.customApiKey || '');
  const [isSaved, setIsSaved] = useState(false);

  // Sync internal state with global state (useful for imports)
  useEffect(() => {
    if (state.customApiKey !== undefined && state.customApiKey !== customKey) {
      setCustomKey(state.customApiKey);
    }
  }, [state.customApiKey]);
  const [showActions, setShowActions] = useState(true);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{success?: boolean, message?: string} | null>(null);

  const handleValidateKey = async (key: string) => {
    setIsValidating(true);
    setValidationResult(null);
    try {
      const result = await validateApiKey(key);
      setValidationResult(result);
    } catch (err) {
      setValidationResult({ success: false, message: "Lỗi hệ thống khi kiểm tra." });
    } finally {
      setIsValidating(false);
    }
  };

  const scrollRef = useRef<HTMLDivElement>(null);

  const handleLoreSuggestion = async (section?: 'world' | 'origin' | 'majorArcs') => {
    if (!playerName.trim()) {
      alert("Vui lòng nhập tên nhân vật trước khi xin gợi ý.");
      return;
    }
    setIsLoreLoading(true);
    try {
      const suggestion = await generateLoreSuggestions({ 
        ...state, 
        name: playerName, 
        gender: playerGender, 
        customApiKey: customKey 
      }, section);
      
      if (suggestion) {
        const newLore = { ...state.lore! };
        if (section) {
          if (suggestion[section]) newLore[section] = suggestion[section];
        } else {
          if (suggestion.world) newLore.world = suggestion.world;
          if (suggestion.origin) newLore.origin = suggestion.origin;
          if (suggestion.majorArcs) newLore.majorArcs = suggestion.majorArcs;
        }
        updateStats({ lore: newLore });
      } else {
        alert("Không thể tạo gợi ý. Vui lòng kiểm tra API Key.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoreLoading(false);
    }
  };

  const handleTestKey = async () => {
    setIsTestingKey(true);
    setKeyTestResult(null);
    try {
      const result = await testApiKey(customKey);
      setKeyTestResult(result);
      setApiKeyStatus(result.success ? 'success' : 'error');
    } catch (err) {
      setKeyTestResult({ success: false, message: "Lỗi hệ thống khi kiểm tra key." });
      setApiKeyStatus('error');
    } finally {
      setIsTestingKey(false);
    }
  };

  useEffect(() => {
    if (!isLoading) {
      setSessionTokens(getSessionUsage());
    }
  }, [isLoading]);

  useEffect(() => {
    if (scrollRef.current && activeTab === 'story') {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [state.history, isLoading, activeTab]);

  const parseSceneDescription = (story: string) => {
    const sceneRegex = /\[SCENE_DESCRIBE:\s*title="(.*?)",\s*description="(.*?)"\]/;
    const match = story.match(sceneRegex);
    if (match) {
      setActiveScene({
        title: match[1],
        description: match[2]
      });
      // Remove the tag from the story for cleaner display
      return story.replace(sceneRegex, '').trim();
    }
    return story;
  };

  const handleStartGame = async () => {
    if (!playerName.trim()) return;
    
    setIsLoading(true);
    const initialData = {
      name: playerName,
      gender: playerGender,
      difficulty: playerDifficulty,
      customApiKey: customKey,
      isInitialized: true,
      history: []
    };

    try {
      const initialPrompt = `Bắt đầu hành trình tu tiên cho nhân vật ${playerName}, giới tính ${playerGender}. Hãy mở đầu một cách kịch tính.`;
      const response = await generateNextStep({ ...state, ...initialData } as any, initialPrompt, []);
      
      const cleanedStory = parseSceneDescription(response.story);
      const cleanedResponse = { ...response, story: cleanedStory };

      initPlayer({ 
        ...initialData, 
        ...response.playerUpdates,
        environmentSummary: response.environmentSummary,
        npcSummary: response.npcSummary,
        eventSummary: response.eventSummary
      });
      setCurrentResponse(cleanedResponse);
      addHistory(
        cleanedResponse.story, 
        undefined, 
        response.playerUpdates, 
        response.chronicles, 
        response.weather as any,
        response.environmentSummary,
        response.npcSummary,
        response.eventSummary
      );
    } catch (err: any) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      alert(`[THIÊN CƠ BẤT LỘ]: Không thể khởi tạo thế giới.\n\nLỗi: ${errorMessage}\n\nVui lòng thử lại hoặc kiểm tra API Key.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = async (actionText: string) => {
    if (isLoading || !actionText.trim()) return;
    setIsLoading(true);
    
    try {
      const historyContext = state.history.slice(-5).map(item => ({
        role: 'model',
        content: `Hành động: ${item.actionTaken || 'Khởi đầu'}\n\nDiễn biến: ${item.story}`
      }));

      const response = await generateNextStep(state, actionText, historyContext);
      
      const cleanedStory = parseSceneDescription(response.story);
      const cleanedResponse = { ...response, story: cleanedStory };

      if (response.playerUpdates) {
        updateStats(response.playerUpdates);
      }
      
      setCurrentResponse(cleanedResponse);
      addHistory(
        cleanedResponse.story, 
        actionText, 
        response.playerUpdates, 
        response.chronicles, 
        response.weather as any,
        response.environmentSummary,
        response.npcSummary,
        response.eventSummary
      );
    } catch (err: any) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      addHistory(`[HỆ THỐNG]: Đã xảy ra lỗi khi kết nối với Thiên Cơ. \n\n**Chi tiết:** ${errorMessage}\n\nVui lòng thử lại sau giây lát hoặc kiểm tra API Key trong phần Thiết Lập.`, actionText);
    } finally {
      setIsLoading(false);
    }
  };

  if (!state.isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#0a0c0f]">
        <div className="absolute inset-0 bg-radial-gradient from-amber-500/5 to-transparent pointer-events-none"></div>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 w-full max-w-lg bg-[#0f1218] border border-slate-800 shadow-2xl rounded-xl p-8 space-y-8"
        >
          <div className="text-center space-y-2">
            <div className="inline-flex w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 items-center justify-center mb-2">
              <span className="text-amber-500 text-3xl">☯</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-100 tracking-wider uppercase font-serif">Thiên Đạo Diễn Hóa</h1>
            <p className="text-[10px] text-slate-500 font-mono uppercase tracking-[0.2em]">Sơn Hải Chi Thượng - Phá Toái Hư Không</p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-2 block">Thánh Danh (Name)</label>
              <input 
                type="text" 
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Nhập tên tu sĩ..."
                className="w-full bg-[#0d1014] border border-slate-800 p-4 rounded text-slate-100 focus:outline-none focus:border-amber-500/50 transition-all font-serif italic text-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-2 block">Đạo Thể (Gender)</label>
                <div className="flex bg-[#0d1014] p-1 rounded border border-slate-800">
                  <button 
                    onClick={() => setPlayerGender('Nam')}
                    className={cn("flex-1 py-2 rounded text-xs font-bold uppercase", playerGender === 'Nam' ? "bg-amber-500 text-black" : "text-slate-500")}
                  >
                    Nam
                  </button>
                  <button 
                    onClick={() => setPlayerGender('Nữ')}
                    className={cn("flex-1 py-2 rounded text-xs font-bold uppercase", playerGender === 'Nữ' ? "bg-amber-500 text-black" : "text-slate-500")}
                  >
                    Nữ
                  </button>
                </div>
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-2 block">Cơ Duyên (Diff)</label>
                <select 
                  value={playerDifficulty}
                  onChange={(e) => setPlayerDifficulty(e.target.value as Difficulty)}
                  className="w-full bg-[#0d1014] border border-slate-800 p-2 rounded text-xs font-bold uppercase text-slate-300 focus:outline-none focus:border-amber-500/50"
                >
                  <option value="Dễ">Hào Quang (Dễ)</option>
                  <option value="Thường">Tu Sĩ (Thường)</option>
                  <option value="Khó">Nghịch Thiên (Khó)</option>
                  <option value="Hồng Hoang">Tử Địa (Hồng Hoang)</option>
                </select>
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <div className="space-y-3">
                <div className="flex justify-between items-end mb-1">
                  <label className="text-[10px] uppercase font-bold text-slate-500 tracking-widest block">Thiết Lập Thiên Cơ (API Keys)</label>
                </div>
                <div className="p-4 bg-slate-900/50 border border-slate-800 rounded space-y-3">
                   <div className="relative">
                     <textarea 
                       value={customKey}
                       onChange={(e) => {
                         const val = e.target.value;
                         setCustomKey(val);
                         updateStats({ customApiKey: val });
                         setIsSaved(true);
                         setTimeout(() => setIsSaved(false), 2000);
                       }}
                       placeholder="Nhập API Key (ngăn cách bằng dấu phẩy hoặc xuống dòng)..."
                       className="w-full bg-[#0d1014] border border-slate-800 p-3 rounded text-slate-100 text-xs focus:outline-none focus:border-amber-500/50 font-mono"
                       rows={2}
                     />
                     <div className="absolute right-2 bottom-2 flex gap-2">
                       {isSaved && (
                         <motion.span initial={{ opacity: 0, x: 5 }} animate={{ opacity: 1, x: 0 }} className="text-[9px] text-emerald-500 font-bold self-center">Đã Lưu</motion.span>
                       )}
                       <button 
                        onClick={() => handleValidateKey(customKey)}
                        disabled={isValidating}
                        className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-amber-500 transition-all disabled:opacity-50"
                        title="Kiểm tra kết nối"
                       >
                         <Activity size={12} className={cn(isValidating && "animate-spin")} />
                       </button>
                     </div>
                   </div>
                   
                   {validationResult && (
                     <motion.div 
                      initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                      className={cn("text-[9px] font-bold px-2 py-1 rounded border", 
                        validationResult.success ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500" : "bg-rose-500/10 border-rose-500/30 text-rose-500"
                      )}
                     >
                       {validationResult.message}
                     </motion.div>
                   )}
                   
                   <p className="text-[9px] text-slate-600 italic">Mẹo: Hệ thống sẽ tự động dùng Key dự phòng nếu Key chính bị giới hạn.</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-end mb-1">
                  <label className="text-[10px] uppercase font-bold text-slate-500 tracking-widest block">Thiết Lập Bối Cảnh (Lore)</label>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  <div className="flex justify-between items-center px-1">
                    <span className="text-[9px] text-slate-500 uppercase font-bold tracking-tighter">Thế Giới</span>
                    <button onClick={() => handleLoreSuggestion('world')} className="text-[9px] text-amber-500/60 hover:text-amber-500 transition-colors uppercase font-bold">Gợi Ý</button>
                  </div>
                  <textarea 
                    placeholder="Thế giới (VD: Linh khí hồi phục, mạt pháp thời đại...)"
                    className="w-full bg-[#0d1014] border border-slate-800 p-3 rounded text-xs text-slate-300 focus:border-amber-500/50 outline-none"
                    rows={2}
                    value={state.lore?.world}
                    onChange={(e) => updateStats({ lore: { ...state.lore!, world: e.target.value } })}
                  />
                  <div className="flex justify-between items-center px-1 mt-1">
                    <span className="text-[9px] text-slate-500 uppercase font-bold tracking-tighter">Khởi Đầu</span>
                    <button onClick={() => handleLoreSuggestion('origin')} className="text-[9px] text-amber-500/60 hover:text-amber-500 transition-colors uppercase font-bold">Gợi Ý</button>
                  </div>
                  <textarea 
                    placeholder="Khởi đầu (VD: Phế vật nghịch thiên, trọng sinh...)"
                    className="w-full bg-[#0d1014] border border-slate-800 p-3 rounded text-xs text-slate-300 focus:border-amber-500/50 outline-none"
                    rows={2}
                    value={state.lore?.origin}
                    onChange={(e) => updateStats({ lore: { ...state.lore!, origin: e.target.value } })}
                  />
                  <div className="flex justify-between items-center px-1 mt-1">
                    <span className="text-[9px] text-slate-500 uppercase font-bold tracking-tighter">Các Arc Lớn</span>
                    <button onClick={() => handleLoreSuggestion('majorArcs')} className="text-[9px] text-amber-500/60 hover:text-amber-500 transition-colors uppercase font-bold">Gợi Ý</button>
                  </div>
                  <textarea 
                    placeholder="Các Arc lớn (VD: Đại chiến tông môn, Thượng giới giáng lâm...)"
                    className="w-full bg-[#0d1014] border border-slate-800 p-3 rounded text-xs text-slate-300 focus:border-amber-500/50 outline-none"
                    rows={2}
                    value={state.lore?.majorArcs}
                    onChange={(e) => updateStats({ lore: { ...state.lore!, majorArcs: e.target.value } })}
                  />
                </div>
              </div>

            <button 
              onClick={handleStartGame}
              disabled={!playerName.trim() || isLoading}
              className="w-full py-4 bg-amber-500 disabled:opacity-50 text-black font-black uppercase tracking-[0.2em] text-xs rounded shadow-lg hover:scale-[1.01] transition-all"
            >
              {isLoading ? "Đang Diễn Hóa..." : "Bước Vào Luân Hồi"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

  return (
    <div className="h-screen flex flex-col bg-[#0a0c0f] text-slate-300">
      {/* Header */}
      <header className="h-16 border-b border-slate-800 bg-[#0f1218] flex items-center justify-between px-6 shrink-0 z-20">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
            <span className="text-amber-500 text-2xl font-bold">☯</span>
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-100 tracking-wider uppercase">{state.name}</h1>
            <p className="text-[9px] text-slate-500 font-mono tracking-widest">{state.realm} - {state.stage}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end mr-4">
            <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500">
              <Database size={10} />
              <span className="flex gap-2">
                <span>{(sessionTokens.totalTokens / 1000).toFixed(1)}k</span>
                <span className="text-emerald-500/80">
                  ${(
                    (sessionTokens.flashPromptTokens / 1000000) * 0.10 + 
                    (sessionTokens.flashCompletionTokens / 1000000) * 0.40 +
                    (sessionTokens.proPromptTokens / 1000000) * 3.50 +
                    (sessionTokens.proCompletionTokens / 1000000) * 10.50
                  ).toFixed(4)}
                </span>
              </span>
            </div>
            <button 
              onClick={() => { resetSessionUsage(); setSessionTokens(getSessionUsage()); }}
              className="text-[8px] text-amber-500/50 hover:text-amber-500 uppercase tracking-tighter"
            >
              Reset Counter
            </button>
          </div>
          <button 
            onClick={() => setActiveTab('story')}
            className={cn("p-2 rounded transition-colors", activeTab === 'story' ? "text-amber-500 bg-amber-500/10" : "text-slate-500 hover:text-slate-300")}
          >
            <Scroll size={20} />
          </button>
          <button 
            onClick={() => setActiveTab('inventory')}
            className={cn("p-2 rounded transition-colors", activeTab === 'inventory' ? "text-amber-500 bg-amber-500/10" : "text-slate-500 hover:text-slate-300")}
          >
            <Package size={20} />
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={cn("p-2 rounded transition-colors", activeTab === 'history' ? "text-amber-500 bg-amber-500/10" : "text-slate-500 hover:text-slate-300")}
          >
            <History size={20} />
          </button>
          <button 
            onClick={() => setActiveTab('lore')}
            className={cn("p-2 rounded transition-colors", activeTab === 'lore' ? "text-amber-500 bg-amber-500/10" : "text-slate-500 hover:text-slate-300")}
          >
            <Book size={20} />
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={cn("p-2 rounded transition-colors", activeTab === 'settings' ? "text-amber-500 bg-amber-500/10" : "text-slate-500 hover:text-slate-300")}
          >
            <Settings size={20} />
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Main Content */}
        <main className="flex-1 flex flex-col bg-[#080a0d] overflow-hidden relative">
          <AnimatePresence mode="wait">
            {activeTab === 'story' && (
              <motion.div 
                key="story"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col h-full"
              >
                <div ref={scrollRef} className="flex-1 p-6 md:p-12 overflow-y-auto scroll-container relative">
                  <WeatherEffect type={state.weather} />
                  <div className="max-w-2xl mx-auto space-y-12 relative z-10">
                    {state.history.map((item, idx) => (
                      <StorySegment 
                        key={idx} 
                        item={item} 
                        isNew={idx === state.history.length - 1} 
                      />
                    ))}
                    {isLoading && (
                      <div className="flex items-center gap-2 text-amber-500/60 font-mono text-xs uppercase tracking-widest animate-pulse italic">
                        <Sparkles size={14} />
                        <span>Thiên Cơ đang xoay chuyển...</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Area */}
                <div className="shrink-0 bg-[#0d1014] border-t border-slate-800 relative">
                  {/* Toggle Button Container */}
                  <div className="absolute -top-8 left-0 right-0 flex justify-center pointer-events-none z-30">
                    <button 
                      onClick={() => setShowActions(!showActions)}
                      className="pointer-events-auto flex items-center gap-2 px-4 py-1.5 bg-[#0d1014] border-t border-x border-slate-800 rounded-t-lg text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-amber-500 transition-all shadow-[0_-4px_12px_rgba(0,0,0,0.5)] group"
                    >
                      {showActions ? (
                        <>
                          <ChevronDown size={10} className="group-hover:translate-y-0.5 transition-transform" />
                          <span>Ẩn Lựa Chọn</span>
                        </>
                      ) : (
                        <>
                          <ChevronUp size={10} className="group-hover:-translate-y-0.5 transition-transform" />
                          <span>Hiện Lựa Chọn</span>
                        </>
                      )}
                    </button>
                  </div>
                  
                  <AnimatePresence initial={false}>
                    {showActions && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="p-6">
                          <div className="max-w-2xl mx-auto space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {!isLoading && currentResponse?.actions.map((action) => (
                                <button
                                  key={action.id}
                                  onClick={() => handleAction(action.text)}
                                  className="p-4 text-left rounded bg-[#0f1218] border border-slate-800 hover:border-amber-500/50 group transition-all flex flex-col gap-2 relative overflow-hidden"
                                >
                                  <div className="flex justify-between items-start">
                                    <span className="text-xs font-bold text-slate-200 group-hover:text-amber-500 transition-colors flex-1">{action.text}</span>
                                    {action.chance !== undefined && (
                                      <span className={cn(
                                        "text-[9px] font-mono px-1.5 py-0.5 rounded border ml-2",
                                        action.chance > 70 ? "text-emerald-400 border-emerald-400/30 bg-emerald-400/5" :
                                        action.chance > 40 ? "text-amber-400 border-amber-400/30 bg-amber-400/5" :
                                        "text-rose-400 border-rose-400/30 bg-rose-400/5"
                                      )}>
                                        {action.chance}%
                                      </span>
                                    )}
                                  </div>

                                  {action.outcome && (
                                    <div className="flex gap-4 text-[9px] font-medium tracking-tight">
                                      <div className="flex items-center gap-1 text-emerald-500/70 italic">
                                        <div className="w-1 h-1 rounded-full bg-emerald-500" />
                                        <span>Thành: {action.outcome.success}</span>
                                      </div>
                                      <div className="flex items-center gap-1 text-rose-500/70 italic">
                                        <div className="w-1 h-1 rounded-full bg-rose-500" />
                                        <span>Bại: {action.outcome.failure}</span>
                                      </div>
                                    </div>
                                  )}
                                  
                                  {/* Progress bar decoration */}
                                  {action.chance !== undefined && (
                                    <div className="absolute bottom-0 left-0 h-[1.5px] bg-slate-800 w-full">
                                      <div 
                                        className={cn(
                                          "h-full transition-all duration-1000",
                                          action.chance > 70 ? "bg-emerald-500/40" :
                                          action.chance > 40 ? "bg-amber-500/40" :
                                          "bg-rose-500/40"
                                        )}
                                        style={{ width: `${action.chance}%` }}
                                      />
                                    </div>
                                  )}
                                </button>
                              ))}
                            </div>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                placeholder="Hành động khác..."
                                className="flex-1 bg-black/40 border border-slate-800 rounded px-4 py-3 text-sm focus:outline-none focus:border-amber-500"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' && !isLoading) {
                                    handleAction(e.currentTarget.value);
                                    e.currentTarget.value = '';
                                  }
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}

            {activeTab === 'inventory' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-8 max-w-2xl mx-auto space-y-6">
                <h2 className="text-2xl font-serif text-amber-500 italic">Túi Càn Khôn</h2>
                <div className="grid grid-cols-1 gap-3">
                  {state.inventory.length > 0 ? state.inventory.map(item => (
                    <div key={item.id} className="p-4 bg-[#0d1014] border border-slate-800 rounded flex justify-between items-center">
                      <div>
                        <h3 className="font-bold text-slate-200">{item.name}</h3>
                        <p className="text-xs text-slate-500">{item.description}</p>
                      </div>
                      <span className="text-[10px] font-mono text-slate-600">x{item.amount}</span>
                    </div>
                  )) : (
                    <p className="text-slate-600 italic">Trống rỗng...</p>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'history' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-8 max-w-2xl mx-auto space-y-6">
                <h2 className="text-2xl font-serif text-amber-500 italic">Mệnh Ký</h2>
                <div className="text-sm text-slate-400 leading-relaxed font-serif whitespace-pre-wrap">
                  {state.chronicles}
                </div>
              </motion.div>
            )}

            {activeTab === 'lore' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-8 max-w-2xl mx-auto space-y-8">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-serif text-amber-500 italic">Thiên Đạo Thư Kinh (Lore)</h2>
                  <button 
                    onClick={() => handleLoreSuggestion()}
                    disabled={isLoreLoading}
                    className="px-4 py-1.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-500 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-amber-500/20 transition-all disabled:opacity-50"
                  >
                    <Sparkles size={12} />
                    {isLoreLoading ? "Đang Diễn Hóa..." : "Đại Diễn Hóa (Tất Cả)"}
                  </button>
                </div>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-black uppercase text-slate-500 tracking-widest">Thế Giới Bản Nguyên</label>
                      <button 
                        onClick={() => handleLoreSuggestion('world')}
                        disabled={isLoreLoading}
                        className="text-[9px] text-amber-500/70 hover:text-amber-500 flex items-center gap-1 uppercase font-bold tracking-tighter"
                      >
                        <Sparkles size={10} /> Gợi Ý Thế Giới
                      </button>
                    </div>
                    <textarea 
                      value={state.lore?.world}
                      onChange={(e) => updateStats({ lore: { ...state.lore!, world: e.target.value } })}
                      placeholder="Mô tả về thế giới, quy tắc linh khí, các thế lực..."
                      rows={5}
                      className="w-full bg-[#0d1014] border border-slate-800 p-4 rounded text-sm text-slate-300 focus:border-amber-500 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-black uppercase text-slate-500 tracking-widest">Nhân Quả Khởi Đầu</label>
                      <button 
                        onClick={() => handleLoreSuggestion('origin')}
                        disabled={isLoreLoading}
                        className="text-[9px] text-amber-500/70 hover:text-amber-500 flex items-center gap-1 uppercase font-bold tracking-tighter"
                      >
                        <Sparkles size={10} /> Gợi Ý Khởi Đầu
                      </button>
                    </div>
                    <textarea 
                      value={state.lore?.origin}
                      onChange={(e) => updateStats({ lore: { ...state.lore!, origin: e.target.value } })}
                      placeholder="Nguồn gốc của nhân vật, bi kịch hoặc cơ duyên ban đầu..."
                      rows={5}
                      className="w-full bg-[#0d1014] border border-slate-800 p-4 rounded text-sm text-slate-300 focus:border-amber-500 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-black uppercase text-slate-500 tracking-widest">Đại Kiếp Chân Kinh (Major Arcs)</label>
                      <button 
                        onClick={() => handleLoreSuggestion('majorArcs')}
                        disabled={isLoreLoading}
                        className="text-[9px] text-amber-500/70 hover:text-amber-500 flex items-center gap-1 uppercase font-bold tracking-tighter"
                      >
                        <Sparkles size={10} /> Gợi Ý Arc Lớn
                      </button>
                    </div>
                    <textarea 
                      value={state.lore?.majorArcs}
                      onChange={(e) => updateStats({ lore: { ...state.lore!, majorArcs: e.target.value } })}
                      placeholder="Các giai đoạn quan trọng dự kiến: Đại chiến tông môn, Thượng giới giáng lâm..."
                      rows={5}
                      className="w-full bg-[#0d1014] border border-slate-800 p-4 rounded text-sm text-slate-300 focus:border-amber-500 outline-none transition-all"
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 italic uppercase text-center border-t border-slate-800 pt-4">Thông tin ở đây sẽ trực tiếp điều hướng Thiên Cơ (AI) để tạo ra mạch truyện nhất quán.</p>
                </div>
              </motion.div>
            )}

            {activeTab === 'settings' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-8 max-w-2xl mx-auto space-y-8">
                <h2 className="text-2xl font-serif text-amber-500 italic">Thiết Lập</h2>
                <div className="space-y-6">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold uppercase text-slate-500 tracking-widest block">Quản Lý Thiên Cơ (API Keys)</label>
                      <button 
                        onClick={() => handleValidateKey(customKey)}
                        disabled={isValidating}
                        className="text-[9px] font-bold text-amber-500/80 hover:text-amber-500 uppercase tracking-widest flex items-center gap-1 transition-colors"
                      >
                        <Activity size={10} className={cn(isValidating && "animate-spin")} />
                        {isValidating ? "Đang Kiểm Tra..." : "Kiểm Tra Kết Nối"}
                      </button>
                    </div>
                    <div className="p-5 bg-slate-900/50 border border-slate-800 rounded-lg space-y-4 shadow-inner">
                       <div className="space-y-2">
                         <textarea
                          value={customKey}
                          onChange={(e) => {
                            const val = e.target.value;
                            setCustomKey(val);
                            updateStats({ customApiKey: val });
                            setIsSaved(true);
                            setTimeout(() => setIsSaved(false), 2000);
                          }}
                          placeholder="Key1, Key2, Key3 (Phân cách bằng dấu phẩy hoặc xuống dòng)..."
                          rows={4}
                          className="w-full bg-[#0d1014] border border-slate-800 p-3 rounded text-slate-100 text-xs focus:outline-none focus:border-amber-500/50 font-mono leading-relaxed"
                        />
                        <div className="flex justify-between items-center mt-1">
                          <p className="text-[9px] text-slate-600 italic">Hệ thống sẽ tự động xoay vòng Key nếu bị giới hạn.</p>
                          {isSaved && (
                            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[9px] text-emerald-500 font-bold">Lưu thành công</motion.span>
                          )}
                        </div>
                        {validationResult && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }} 
                            animate={{ opacity: 1, height: 'auto' }}
                            className={cn("text-[10px] font-medium p-2 rounded-md flex items-center gap-2", 
                              validationResult.success ? "bg-emerald-500/5 border border-emerald-500/20 text-emerald-400" : "bg-rose-500/5 border border-rose-500/20 text-rose-400"
                            )}
                          >
                            <ShieldAlert size={12} />
                            {validationResult.message}
                          </motion.div>
                        )}
                       </div>

                      <div className="flex justify-between items-center pt-3 border-t border-slate-800/80">
                        <div className="space-y-1">
                          <p className="text-[10px] uppercase font-bold text-slate-500">Chi Phí Ước Tính</p>
                          <p className="text-lg font-mono text-emerald-500">
                            ${(
                              (sessionTokens.flashPromptTokens / 1000000) * 0.10 + 
                              (sessionTokens.flashCompletionTokens / 1000000) * 0.40 +
                              (sessionTokens.proPromptTokens / 1000000) * 3.50 +
                              (sessionTokens.proCompletionTokens / 1000000) * 10.50
                            ).toFixed(5)}
                          </p>
                        </div>
                        <div className="text-right space-y-1">
                          <p className="text-[10px] uppercase font-bold text-slate-500 tracking-tighter">
                            F: {(sessionTokens.flashPromptTokens + sessionTokens.flashCompletionTokens).toLocaleString()} | 
                            P: {(sessionTokens.proPromptTokens + sessionTokens.proCompletionTokens).toLocaleString()}
                          </p>
                          <div className="flex gap-1 justify-end">
                            <div className="h-0.5 w-8 bg-slate-800 rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-500/50" style={{ width: `${Math.min(100, (sessionTokens.flashPromptTokens + sessionTokens.flashCompletionTokens)/10000)}%` }} />
                            </div>
                            <div className="h-0.5 w-8 bg-slate-800 rounded-full overflow-hidden">
                              <div className="h-full bg-amber-500/50" style={{ width: `${Math.min(100, (sessionTokens.proPromptTokens + sessionTokens.proCompletionTokens)/2000)}%` }} />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label className="text-xs font-bold uppercase text-slate-500 tracking-widest">Lưu Lượng (Stats)</label>
                       <div className="p-4 bg-slate-900/50 border border-slate-800 rounded space-y-3">
                          <div className="flex justify-between items-center text-[10px]">
                            <span className="text-slate-500">Flash (In/Out)</span>
                            <span className="font-mono">{sessionTokens.flashPromptTokens}/{sessionTokens.flashCompletionTokens}</span>
                          </div>
                          <div className="flex justify-between items-center text-[10px]">
                            <span className="text-slate-500">Pro (In/Out)</span>
                            <span className="font-mono">{sessionTokens.proPromptTokens}/{sessionTokens.proCompletionTokens}</span>
                          </div>
                          <button 
                            onClick={() => { resetSessionUsage(); setSessionTokens(getSessionUsage()); }}
                            className="w-full mt-2 py-1 bg-slate-800 hover:bg-slate-700 text-[8px] text-slate-400 uppercase font-bold rounded"
                          >
                            Reset Stats
                          </button>
                       </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase text-slate-500 tracking-widest">Chất Lượng AI</label>
                      <button 
                        onClick={toggleAiTier}
                        className={cn("w-full px-4 py-2 rounded text-[10px] font-bold uppercase border flex items-center justify-center gap-2 transition-all", state.aiTier === 'pro' ? "border-amber-500 text-amber-500 bg-amber-500/5 shadow-[0_0_10px_rgba(245,158,11,0.1)]" : "border-emerald-500 text-emerald-500 bg-emerald-500/5")}
                      >
                        {state.aiTier === 'pro' ? (
                          <>
                            <Sparkles size={12} />
                            Bản Pro (Sâu Sắc/Chậm)
                          </>
                        ) : (
                          <>
                            <Zap size={12} />
                            Bản Flash (Tốc Độ/Nhanh)
                          </>
                        )}
                      </button>
                      <p className="text-[8px] text-slate-600 italic text-center">Bản Flash phản hồi nhanh gấp 3-5 lần.</p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase text-slate-500 tracking-widest">Dữ Liệu</label>
                      <div className="flex flex-col gap-2">
                        <button onClick={resetGame} className="w-full px-4 py-2 bg-rose-500/10 border border-rose-500/30 text-rose-500 rounded text-[10px] font-bold uppercase transition-colors hover:bg-rose-500 hover:text-white">Xóa Save</button>
                        <button onClick={() => exitToMenu()} className="w-full px-4 py-2 bg-slate-800 border border-slate-700 text-slate-300 rounded text-[10px] font-bold uppercase">Thoát Ra Menu</button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase text-slate-500 tracking-widest">NSFW Mode</label>
                      <button 
                        onClick={toggleNsfw}
                        className={cn("w-full px-4 py-2 rounded text-[10px] font-bold uppercase border", state.isNsfwEnabled ? "border-rose-500 text-rose-500 bg-rose-500/5" : "border-slate-800 text-slate-500")}
                      >
                        {state.isNsfwEnabled ? "Đã Bật" : "Đã Tắt"}
                      </button>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase text-slate-500 tracking-widest">Scene Popups</label>
                      <button 
                        onClick={toggleScenePopup}
                        className={cn("w-full px-4 py-2 rounded text-[10px] font-bold uppercase border", state.isScenePopupEnabled ? "border-emerald-500 text-emerald-500 bg-emerald-500/5" : "border-slate-800 text-slate-500")}
                      >
                        {state.isScenePopupEnabled ? "Đã Bật" : "Đã Tắt"}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Scene Description Popup */}
          <AnimatePresence>
            {activeScene && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
              >
                <motion.div 
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.9, y: 20 }}
                  className="w-full max-w-lg bg-[#0f1218] border border-amber-500/30 rounded-xl p-8 space-y-6 relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent"></div>
                  <div className="space-y-2 text-center">
                    <h3 className="text-amber-500 font-serif italic text-xl tracking-wide">{activeScene.title}</h3>
                    <div className="w-12 h-0.5 bg-amber-500/20 mx-auto"></div>
                  </div>
                  <p className="text-slate-300 leading-relaxed font-serif text-lg italic text-center">
                    {activeScene.description}
                  </p>
                  <button 
                    onClick={() => setActiveScene(null)}
                    className="w-full py-3 bg-amber-500/10 border border-amber-500/30 text-amber-500 text-[10px] font-bold uppercase tracking-[0.2em] rounded hover:bg-amber-500 hover:text-black transition-all"
                  >
                    Tiếp Tục Nghịch Thiên
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Sidebar Right: Stats */}
        <aside className="w-64 border-l border-slate-800 bg-[#0d1014] p-6 hidden lg:flex flex-col gap-8 shrink-0 overflow-y-auto scroll-container">
          <section className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 border-b border-slate-800 pb-2">Trạng Thái</h3>
            <div className="space-y-3">
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-mono">
                  <span>Khí Huyết (HP)</span>
                  <span className="text-rose-500">{state.health}/{state.maxHealth}</span>
                </div>
                <div className="h-1 bg-slate-900 rounded-full overflow-hidden">
                  <div className="h-full bg-rose-500" style={{ width: `${(state.health/state.maxHealth)*100}%` }} />
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-mono">
                  <span>Chân Khí (MP)</span>
                  <span className="text-blue-500">{state.mana}/{state.maxMana}</span>
                </div>
                <div className="h-1 bg-slate-900 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500" style={{ width: `${(state.mana/state.maxMana)*100}%` }} />
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-mono">
                  <span>Tu Vi</span>
                  <span className="text-amber-500">{Math.floor((state.tuVi/state.tuViCapacity)*100)}%</span>
                </div>
                <div className="h-1 bg-slate-900 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500" style={{ width: `${(state.tuVi/state.tuViCapacity)*100}%` }} />
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 border-b border-slate-800 pb-2">Chi Tiết</h3>
            <ul className="text-xs space-y-3">
              <li className="flex justify-between"><span className="text-slate-600">Linh Căn:</span> <span className="text-amber-200/80">{state.linhCan || "Phàm Căn"}</span></li>
              <li className="flex justify-between"><span className="text-slate-600">Thiên Phú:</span> <span className="text-emerald-500/80">{state.talent || "Bình Thường"}</span></li>
              <li className="flex justify-between"><span className="text-slate-600">Cơ Duyên:</span> <span className="text-slate-300">{state.difficulty}</span></li>
              <li className="flex justify-between"><span className="text-slate-600">Danh Vọng:</span> <span className="text-blue-400">{state.reputation}</span></li>
              <li className="flex justify-between"><span className="text-slate-600">Nhân Quả:</span> <span className={cn(state.karma >= 0 ? "text-emerald-500" : "text-rose-500")}>{state.karma}</span></li>
            </ul>
          </section>

          <section className="mt-auto pt-4 border-t border-slate-800/50">
            <div className="p-3 bg-amber-500/5 rounded border border-amber-500/20">
              <p className="text-[9px] text-slate-500 uppercase font-mono mb-2">Thức Hải (Memory)</p>
              <button 
                onClick={() => {
                  const dataStr = JSON.stringify(state, null, 2);
                  const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
                  const exportFileDefaultName = `thien_dao_save_${state.name}.json`;
                  const linkElement = document.createElement('a');
                  linkElement.setAttribute('href', dataUri);
                  linkElement.setAttribute('download', exportFileDefaultName);
                  linkElement.click();
                }}
                className="w-full py-2 bg-amber-500/10 border border-amber-500/30 text-amber-500 text-[10px] font-bold uppercase tracking-widest rounded"
              >
                Xuất Save File
              </button>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
