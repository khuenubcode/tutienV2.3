import React from 'react';
import { motion } from 'motion/react';
import { 
  Shield, 
  Map as MapIcon, 
  Target, 
  Award, 
  Briefcase, 
  BookOpen, 
  Users,
  Trophy,
  History,
  TrendingUp,
  AlertCircle,
  Star,
  Crown,
  Check,
  Lock
} from 'lucide-react';
import { PlayerState, SectRank } from '../types';
import { SECT_MECHANICS, getSectInteractions } from '../data/sect_system';
import { ORG_MECHANICS, getOrgInteractions } from '../data/org_system';
import { SECTS, ORGANIZATIONS, REALMS } from '../data/worldData';
import { cn } from '../lib/utils';
import { checkRequirements } from '../lib/requirements';

interface SectUIProps {
  state: PlayerState;
  onJoinSect: (sectName: string) => void;
  onPromoteSectRank: () => void;
  onLeaveSect: () => void;
  onPerformAction: (actionId: string) => void;
  onAcceptMission: (missionId: string) => void;
  onCompleteMission: (missionId: string) => void;
  onJoinOrg: (orgName: string) => void;
  onLeaveOrg: () => void;
  onPerformOrgAction: (actionId: string) => void;
  onAcceptOrgMission: (missionId: string) => void;
  onCompleteOrgMission: (missionId: string) => void;
  onCompleteSectTrial: (sectName: string) => void;
  onMeetFactionNPC: (factionName: string) => void;
}

const SectUI: React.FC<SectUIProps> = ({ 
  state, 
  onJoinSect, 
  onPromoteSectRank,
  onLeaveSect, 
  onPerformAction, 
  onAcceptMission,
  onCompleteMission,
  onCompleteSectTrial,
  onMeetFactionNPC,
  onJoinOrg,
  onLeaveOrg,
  onPerformOrgAction,
  onAcceptOrgMission,
  onCompleteOrgMission
}) => {
  const currentSect = state.currentSect;
  const currentOrg = state.currentOrg;
  const orgData = ORGANIZATIONS.find(o => o.name === currentOrg);
  const interactions = currentSect ? getSectInteractions(currentSect) : null;
  const orgInteractions = currentOrg ? getOrgInteractions(currentOrg) : null;
  const currentRankIndex = SECT_MECHANICS.ranks.findIndex(r => r.id === state.sectRank);
  const rankInfo = SECT_MECHANICS.ranks[currentRankIndex];
  const nextRank = currentRankIndex >= 0 && currentRankIndex < SECT_MECHANICS.ranks.length - 1 
    ? SECT_MECHANICS.ranks[currentRankIndex + 1] 
    : undefined;

  const isMissionActive = (missionId: string) => state.activeMissions?.some(m => m.id === missionId);

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

  const currentFactionLocation = currentSect ? getFactionLocation(currentSect) : "";
  const isAtSectLocation = state.currentLocation.toLowerCase().includes(currentFactionLocation.toLowerCase());
  const currentOrgLocation = currentOrg ? getFactionLocation(currentOrg) : "";
  const isAtOrgLocation = state.currentLocation.toLowerCase().includes(currentOrgLocation.toLowerCase());

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between border-b border-slate-800 pb-4 gap-4">
        <div className="space-y-1">
          <h2 className="title-font text-3xl text-slate-100 font-bold italic">Tông Môn & Thế Lực</h2>
          <p className="text-[10px] text-slate-500 font-mono uppercase tracking-[0.3em]">Sect Affiliation & Faction Standings</p>
        </div>
      </header>

      {!currentSect ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SECTS.map(sect => {
            const loc = getFactionLocation(sect.name);
            const isAtLoc = state.currentLocation.toLowerCase().includes(loc.toLowerCase());
            const isKnown = (state.knownFactions || []).includes(sect.name) || state.factionsReputation[sect.name] !== undefined || isAtLoc;
            const hasPassedTrial = !!state.memberTrials[sect.name];
            const hasMetNPC = !!state.metNPCs[sect.name];
            const check = sect.requirements ? checkRequirements(sect.requirements, state, REALMS) : { met: true, reason: '' };
            
            return (
              <div key={sect.id} className="p-8 bg-[#0f1218] border border-slate-800 rounded-3xl space-y-6 hover:border-amber-500/50 transition-all group flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-600 group-hover:text-amber-400 group-hover:border-amber-500/30 transition-all shadow-inner">
                      <Shield size={24} />
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className={cn(
                        "text-[8px] px-2 py-1 rounded-full border uppercase font-black tracking-widest",
                        !isKnown ? "bg-slate-500/10 text-slate-500 border-slate-500/20" :
                        sect.align === 'Chính' ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                        sect.align === 'Ma' || sect.align === 'Tà' ? "bg-rose-500/10 text-rose-400 border-rose-500/20" :
                        "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      )}>{isKnown ? sect.align : '???'}</span>
                      {!isAtLoc && isKnown && <span className="text-[8px] text-slate-500 italic">Cần ở: {loc}</span>}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-lg font-bold text-slate-100 group-hover:text-amber-400 transition-colors tracking-tight">{isKnown ? sect.name : 'Thế Lực Bí Ẩn'}</h4>
                    <p className="text-[10px] text-amber-500/80 font-mono tracking-widest">{isKnown ? sect.specialty : '???'}</p>
                    <p className="text-[11px] text-slate-500 line-clamp-3 leading-relaxed mt-2">{isKnown ? sect.description : 'Thông tin về thế lực này vẫn còn là một bí ẩn đối với bạn. Hãy tiếp tục tu luyện và phiêu lưu để khám phá thêm.'}</p>
                    <p className="text-[9px] text-slate-400 italic font-serif mt-2 max-w-full truncate pl-2 border-l border-white/10">"{isKnown ? sect.tenet : '???'}"</p>
                  </div>
                </div>
                <div className="space-y-4">
                  {isKnown && sect.requirements && sect.requirements.length > 0 && (
                    <div className="space-y-1 mt-4">
                      <p className="text-[9px] text-slate-600 uppercase font-bold tracking-widest">Yêu Cầu Gia Nhập</p>
                      <div className="flex flex-wrap gap-1">
                        {sect.requirements.map(req => (
                          <span key={req} className="text-[8px] px-1.5 py-0.5 bg-slate-800/50 text-slate-400 rounded border border-white/5 font-medium">{req}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="space-y-2 pt-2">
                    {isKnown && !check.met && (
                      <p className="text-[9px] text-rose-400 italic font-serif">Chưa đủ điều kiện: {check.reason}</p>
                    )}
                    {!hasMetNPC && (
                      <button
                        onClick={() => onMeetFactionNPC(sect.name)}
                        disabled={!isAtLoc}
                        className={cn(
                          "w-full py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all",
                          isAtLoc 
                            ? "bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-white border border-emerald-500/20 mb-2"
                            : "bg-slate-900 text-slate-600 border border-slate-800 cursor-not-allowed opacity-50 mb-2"
                        )}
                      >
                        {isAtLoc ? "Gặp Gỡ Đại Diện" : "Cần tới nơi để gặp"}
                      </button>
                    )}
                    {!hasPassedTrial && hasMetNPC && (
                      <button
                        onClick={() => onCompleteSectTrial(sect.name)}
                        disabled={!isAtLoc}
                        className={cn(
                          "w-full py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all",
                          "bg-blue-500/10 hover:bg-blue-500 text-blue-500 hover:text-white border border-blue-500/20 mb-2"
                        )}
                      >
                        Thử Thách Nhập Môn
                      </button>
                    )}
                    <button 
                      onClick={() => onJoinSect(sect.name)}
                      disabled={!isKnown || !check.met || !isAtLoc || !hasPassedTrial || !hasMetNPC}
                      className={cn(
                        "w-full py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all",
                        isKnown && check.met && isAtLoc && hasPassedTrial && hasMetNPC
                          ? "bg-amber-500/10 hover:bg-amber-500 text-amber-500 hover:text-black border border-amber-500/20 hover:border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0)] hover:shadow-[0_0_20px_rgba(245,158,11,0.2)]" 
                          : "bg-slate-900 text-slate-600 border border-slate-800 cursor-not-allowed opacity-50"
                      )}
                    >
                      {!isKnown ? "Chưa Từng Gặp" : check.met ? (isAtLoc ? (hasPassedTrial && hasMetNPC ? "Bái Nhập Môn Tường" : (!hasMetNPC ? "Cần Gặp NPC" : "Cần Vượt Thử Thách")) : "Đang Ở Xa") : "Tư Chất Kém Cỏi"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-8">
          <div className="space-y-8">
            {/* Sect Profile */}
            <section className="bg-[#0f1218] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl relative">
              <div className="h-24 bg-gradient-to-r from-amber-900/40 to-slate-900 relative">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
                <div className="absolute -bottom-10 left-8">
                   <div className="w-20 h-20 rounded-2xl bg-amber-500 text-black flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.3)] border-4 border-[#0f1218]">
                      <Shield size={40} />
                   </div>
                </div>
              </div>
              
              <div className="pt-14 pb-8 px-8 space-y-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <h3 className="text-2xl font-bold text-slate-100">{currentSect}</h3>
                    <p className="text-xs text-amber-500 font-mono uppercase tracking-widest">{rankInfo?.name || 'Đệ tử'}</p>
                    <p className="text-[10px] text-slate-400 font-serif italic mt-2 opacity-80">
                      " {SECTS.find(s => s.name === currentSect)?.tenet} "
                    </p>
                  </div>
                  <button 
                    onClick={onLeaveSect}
                    className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white border border-rose-500/20 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all"
                  >
                    Rời Khỏi Tông Môn
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-4 border-y border-white/5 py-6">
                    <div className="text-center space-y-1">
                      <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest">Điểm Cống Hiến</p>
                      <p className="text-lg font-mono font-bold text-amber-400">{state.sectContribution}</p>
                    </div>
                    <div className="text-center space-y-1 border-x border-white/5">
                      <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest">Danh Tiếng</p>
                      <p className="text-lg font-mono font-bold text-blue-400">{state.factionsReputation[currentSect] || 0}</p>
                    </div>
                    <div className="text-center space-y-1">
                      <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest">Hiệu Suất Tu Luyện</p>
                      <p className="text-lg font-mono font-bold text-emerald-400">x{rankInfo?.benefits.tuViMultiplier || 1}</p>
                    </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-1 space-y-1">
                    <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest">Bổng lộc hàng tháng</p>
                    <p className="text-sm font-mono text-slate-300">{rankInfo?.benefits.monthlyLinhThach || 0} Linh Thạch</p>
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest">Quyền hạn bí cảnh</p>
                    <p className={cn(
                      "text-sm font-mono",
                      rankInfo?.benefits.accessRestrictedAreas ? "text-emerald-400" : "text-slate-600"
                    )}>
                      {rankInfo?.benefits.accessRestrictedAreas ? "ĐÃ CẤP" : "CHƯA CÓ"}
                    </p>
                  </div>
                </div>

                {nextRank && (
                   <div className="space-y-2">
                      <div className="flex justify-between items-end">
                        <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Tiến độ thăng cấp: {nextRank.name}</span>
                        <div className="flex items-center gap-4">
                          <span className="text-[10px] text-slate-600 font-mono">{(state.factionsReputation[currentSect] || 0)} / {nextRank.requirementReputation}</span>
                          {(state.factionsReputation[currentSect] || 0) >= nextRank.requirementReputation && (
                            <button
                              onClick={onPromoteSectRank}
                              disabled={!isAtSectLocation}
                              className={cn(
                                "text-[10px] uppercase font-black px-3 py-1 rounded-full transition-all",
                                isAtSectLocation 
                                  ? "bg-emerald-500 text-white hover:bg-emerald-400 shadow-lg shadow-emerald-500/20 animate-pulse" 
                                  : "bg-slate-800 text-slate-500 cursor-not-allowed"
                              )}
                            >
                              Thăng Cấp
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(100, ((state.factionsReputation[currentSect] || 0) / nextRank.requirementReputation) * 100)}%` }}
                          className="h-full bg-blue-500"
                        />
                      </div>
                   </div>
                )}
              </div>
            </section>

            {/* Sect Actions */}
            <section className="space-y-4">
               <div className="flex items-center justify-between">
                 <div className="flex items-center gap-2">
                   <Briefcase size={16} className="text-amber-500" />
                   <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Hành Động Tông Môn</h3>
                 </div>
                 {!isAtSectLocation && (
                   <span className="text-[9px] text-rose-500 font-bold animate-pulse italic">Cần ở {currentFactionLocation}</span>
                 )}
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.values(SECT_MECHANICS.actions).map((action) => (
                    <button
                      key={action.id}
                      onClick={() => onPerformAction(action.id)}
                      disabled={!isAtSectLocation || state.sectContribution < action.contributionCost}
                      className={cn(
                        "p-6 border rounded-2xl flex flex-col items-start text-left gap-3 transition-all relative overflow-hidden group",
                        isAtSectLocation && state.sectContribution >= action.contributionCost
                          ? "bg-slate-900/50 border-slate-800 hover:border-amber-500/50"
                          : "bg-black/20 border-white/5 opacity-50 cursor-not-allowed grayscale"
                      )}
                    >
                      <div className="flex justify-between items-start w-full">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                          {action.id === 'train' ? <TrendingUp size={20} /> : action.id === 'collect' ? <Award size={20} /> : <BookOpen size={20} />}
                        </div>
                        {action.contributionCost > 0 && (
                          <span className="text-[9px] font-mono font-bold text-amber-500/70">-{action.contributionCost} CP</span>
                        )}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-100">{action.name}</h4>
                        <p className="text-[10px] text-slate-500 italic font-serif mt-1">{action.description}</p>
                      </div>
                      <div className="absolute inset-0 bg-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
               </div>
            </section>

            {/* Sect Missions */}
            <section className="space-y-4">
               <div className="flex items-center gap-2">
                 <Target size={16} className="text-rose-500" />
                 <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Nhiệm Vụ Đang Treo</h3>
               </div>

               <div className="space-y-3">
                 {interactions?.missions.map((mission) => {
                    const activeMissionData = state.activeMissions?.find(m => m.id === mission.id);
                    const active = !!activeMissionData;
                    return (
                    <div 
                      key={mission.id}
                      className={cn(
                        "p-5 border rounded-xl space-y-4 group transition-all",
                        active ? "bg-emerald-500/5 border-emerald-500/30 shadow-lg shadow-emerald-950/20" : "bg-slate-900/30 border-slate-800 hover:border-rose-500/30"
                      )}
                    >
                       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-2">
                            <div className="flex items-center gap-3">
                              <h4 className="text-sm font-bold text-slate-200">{mission.name}</h4>
                              <div className="flex gap-1">
                                  {[...Array(mission.difficulty)].map((_, i) => (
                                    <div key={i} className="w-1 h-1 rounded-full bg-rose-500" />
                                  ))}
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {mission.requirements.length > 0 ? (
                                mission.requirements.map(req => (
                                  <span key={req} className="text-[8px] px-1.5 py-0.5 bg-white/5 text-slate-500 rounded border border-white/5 uppercase">{req}</span>
                                ))
                              ) : (
                                <span className="text-[8px] px-1.5 py-0.5 bg-emerald-500/10 text-emerald-500 rounded border border-emerald-500/20 uppercase font-black">Mọi Cấp Bậc</span>
                              )}
                              {active && <span className="text-[8px] px-1.5 py-0.5 bg-rose-600 text-white rounded font-bold uppercase">Đang thực hiện</span>}
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-6">
                            <div className="text-right">
                              <p className="text-[8px] text-slate-600 uppercase font-bold tracking-widest">Phần Thưởng</p>
                              <div className="flex items-center gap-2 mt-1">
                                  <span className="text-xs font-mono font-bold text-amber-500">+{mission.rewardContribution} CP</span>
                                  <div className="w-1 h-1 rounded-full bg-slate-700" />
                                  <span className="text-xs font-serif text-slate-400 italic">{mission.rewardItems.join(', ')}</span>
                              </div>
                            </div>
                           <button 
                              onClick={() => active ? onCompleteMission(mission.id) : onAcceptMission(mission.id)}
                              disabled={!isAtSectLocation || (active && activeMissionData.status !== 'ready_to_turn_in' && (activeMissionData.progress || 0) < 100)}
                              className={cn(
                                "px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                                !isAtSectLocation || (active && activeMissionData.status !== 'ready_to_turn_in' && (activeMissionData.progress || 0) < 100)
                                  ? "bg-slate-800 text-slate-500 cursor-not-allowed" 
                                  : active 
                                    ? "bg-emerald-600 text-white border border-emerald-500 shadow-lg shadow-emerald-900/20" 
                                    : "bg-white/5 hover:bg-rose-500 hover:text-white border border-white/10"
                              )}
                            >
                              {active ? ((activeMissionData.status === 'ready_to_turn_in' || (activeMissionData.progress || 0) >= 100) ? "Đổi Thưởng" : `Đang Làm (${activeMissionData.progress || 0}%)`) : "Tiếp Nhận"}
                            </button>
                        </div>
                       </div>

                       {active && activeMissionData.details && (
                         <div className="p-4 bg-black/40 rounded-xl border border-white/5 text-[10px] text-slate-400 font-serif italic leading-relaxed animate-in fade-in slide-in-from-top-2">
                           <p className="text-amber-500/70 mb-2 uppercase font-mono tracking-widest not-italic">Chi tiết nhiệm vụ:</p>
                           {activeMissionData.details}
                         </div>
                       )}
                    </div>
                  );})}
               </div>
            </section>
          </div>

          <aside className="space-y-6">
            {/* Faction Reputation List */}
            <div className="bg-[#0f1218] p-6 border border-slate-800 rounded-2xl space-y-6">
              <h3 className="stat-label flex items-center gap-2 border-b border-white/5 pb-4">
                <Users size={14} className="text-blue-500" />
                Thế Lực Thiên Hạ
              </h3>
              
              <div className="space-y-4">
                 {Object.entries(state.factionsReputation || {}).map(([faction, rep]) => (
                   <div key={faction} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-medium text-slate-400">{faction}</span>
                        <span className={cn(
                          "text-[10px] font-mono font-bold",
                          rep >= 1000 ? "text-amber-400" : rep >= 0 ? "text-emerald-400" : "text-rose-400"
                        )}>
                          {rep > 0 ? `+${rep}` : rep}
                        </span>
                      </div>
                      <div className="h-1 bg-slate-950 rounded-full overflow-hidden">
                        <div 
                          className={cn("h-full transition-all", rep >= 0 ? "bg-emerald-500" : "bg-rose-500")}
                          style={{ width: `${Math.min(100, (Math.abs(rep) / 2000) * 100)}%` }}
                        />
                      </div>
                   </div>
                 ))}
                 
                 {Object.keys(state.factionsReputation || {}).length === 0 && (
                   <p className="text-[10px] text-slate-600 italic text-center font-serif">Chưa có danh tiếng với thế lực nào.</p>
                 )}
              </div>
            </div>

            {/* Sect News/History */}
            <div className="bg-slate-900/30 border border-slate-800 p-6 rounded-2xl space-y-4">
               <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <History size={12} className="text-slate-500" />
                  Môn Quy & Đặc Quyền
               </h4>
               <ul className="space-y-3">
                  {[
                    "Không được tàn sát đồng môn.",
                    "Đạt Trúc Cơ Kỳ có thể thăng cấp Nội Môn.",
                    "Cống hiến cho tông môn để đổi đan dược.",
                    "Trưởng lão có quyền điều hành bí cảnh."
                  ].map((rule, i) => (
                    <li key={i} className="flex gap-2 text-[10px] text-slate-500 font-serif leading-relaxed">
                      <div className="w-1 h-1 rounded-full bg-slate-700 mt-1.5 shrink-0" />
                      <span>{rule}</span>
                    </li>
                  ))}
               </ul>
            </div>
          </aside>
        </div>
      )}

      {/* Organizations Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <h3 className="title-font text-2xl text-slate-100 font-bold italic">Hội Nhóm & Tổ Chức</h3>
            <p className="text-[9px] text-slate-500 font-mono uppercase tracking-widest">Affiliations & Guilds</p>
          </div>
        </div>

        {currentOrg ? (
          <div className="bg-[#0f1218] border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
            <div className="bg-gradient-to-r from-blue-900/20 to-transparent p-8 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shadow-inner">
                  <Briefcase size={40} />
                </div>
                <div className="space-y-2">
                  <h4 className="text-2xl font-bold text-slate-100">{currentOrg}</h4>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded border border-blue-500/20 font-black uppercase tracking-tighter">
                      {orgData?.ranks.find(r => r.id === state.orgRank)?.name || 'Hội Viên'}
                    </span>
                    <span className="text-slate-600">|</span>
                    <span className="text-[10px] text-slate-400 font-mono">Cống hiến: {state.orgContribution}</span>
                  </div>
                  <p className="text-xs text-slate-500 italic max-w-md">"{orgData?.tenet}"</p>
                </div>
              </div>
              <button 
                onClick={onLeaveOrg}
                className="px-6 py-3 bg-rose-500/5 hover:bg-rose-600 text-rose-500 hover:text-white border border-rose-500/10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all mt-4 md:mt-0"
              >
                Rời Tổ Chức
              </button>
            </div>
            
            <div className="border-t border-slate-800/50 p-8 grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="space-y-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-blue-400">
                    <Star size={16} />
                    <h5 className="text-[10px] font-black uppercase tracking-widest">Đặc Quyền Hiện Tại</h5>
                  </div>
                  <ul className="space-y-4">
                    {(orgData?.ranks.find(r => r.id === state.orgRank)?.perks || []).map((perk, idx) => (
                      <li key={idx} className="flex items-center gap-3 text-xs text-slate-300">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                        {perk}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-400">
                      <History size={16} />
                      <h5 className="text-[10px] font-black uppercase tracking-widest">Hành Động Đặc Thù</h5>
                    </div>
                    {!isAtOrgLocation && (
                      <span className="text-[8px] text-blue-500 font-bold animate-pulse">Cần ở {currentOrgLocation}</span>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {Object.values(ORG_MECHANICS.actions).map(action => (
                      <button
                        key={action.id}
                        onClick={() => onPerformOrgAction(action.id)}
                        disabled={!isAtOrgLocation || state.orgContribution < action.contributionCost}
                        className={cn(
                          "p-4 border rounded-xl flex flex-col items-start text-left gap-2 transition-all relative overflow-hidden group",
                          isAtOrgLocation && state.orgContribution >= action.contributionCost
                            ? "bg-slate-900/50 border-slate-800 hover:border-blue-500/50"
                            : "bg-black/20 border-white/5 opacity-50 cursor-not-allowed grayscale"
                        )}
                      >
                        <div className="flex justify-between items-start w-full">
                           <h6 className="text-[11px] font-bold text-slate-200">{action.name}</h6>
                           <span className="text-[8px] font-mono font-bold text-blue-500/70">-{action.contributionCost} CP</span>
                        </div>
                        <p className="text-[9px] text-slate-500 leading-relaxed">{action.description}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Crown size={16} />
                    <h5 className="text-[10px] font-black uppercase tracking-widest">Lộ Trình Thăng Tiến</h5>
                  </div>
                  <div className="space-y-3">
                    {orgData?.ranks.map((rank) => {
                      const isUnlocked = (state.factionsReputation[orgData.name] || 0) >= rank.requirementReputation;
                      const isCurrent = state.orgRank === rank.id;
                      return (
                        <div key={rank.id} className={cn(
                          "flex items-center justify-between p-4 rounded-xl border transition-all",
                          isCurrent ? "bg-blue-600/10 border-blue-500" :
                          isUnlocked ? "bg-blue-500/5 border-blue-500/20" : "bg-slate-900/50 border-slate-800 opacity-50"
                        )}>
                          <div className="space-y-1">
                            <p className="text-[11px] font-bold text-slate-100">{rank.name} {isCurrent && <span className="text-[8px] ml-2 text-blue-400 uppercase tracking-widest">[Hiện tại]</span>}</p>
                            <p className="text-[9px] text-slate-500 tracking-tighter">Yêu cầu uy danh: {rank.requirementReputation}</p>
                          </div>
                          {isUnlocked ? (
                            <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                              <Check size={12} />
                            </div>
                          ) : (
                            <div className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-slate-600">
                              <Lock size={12} />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {orgInteractions && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-rose-400">
                        <Target size={16} />
                        <h5 className="text-[10px] font-black uppercase tracking-widest">Nhiệm Vụ Tổ Chức</h5>
                      </div>
                      {!isAtOrgLocation && (
                        <span className="text-[8px] text-blue-400 font-black italic animate-pulse">Cần ở {currentOrgLocation}</span>
                      )}
                    </div>
                    <div className="space-y-3">
                      {orgInteractions.missions.map(mission => {
                        const activeMissionData = state.activeMissions?.find(m => m.id === mission.id);
                        const active = !!activeMissionData;
                        return (
                        <div key={mission.id} className={cn(
                          "p-4 border rounded-xl space-y-3 group transition-all",
                          active ? "bg-blue-600/10 border-blue-500 shadow-lg shadow-blue-900/20" : "bg-slate-900/40 border-slate-800 hover:border-blue-500/30"
                        )}>
                           <div className="flex justify-between items-start">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <h6 className="text-[11px] font-bold text-slate-200">{mission.name}</h6>
                                  {active && <span className="text-[7px] px-1 bg-blue-600 text-white rounded font-black uppercase tracking-widest">Đang nhận</span>}
                                </div>
                                <p className="text-[8px] text-slate-500 font-serif italic">Độ khó: {mission.difficulty}/10</p>
                              </div>
                              <button
                                onClick={() => active ? onCompleteOrgMission(mission.id) : onAcceptOrgMission(mission.id)}
                                disabled={!isAtOrgLocation || (active && activeMissionData.status !== 'ready_to_turn_in' && (activeMissionData.progress || 0) < 100)}
                                className={cn(
                                  "px-4 py-1.5 rounded text-[9px] font-black uppercase tracking-widest transition-all",
                                  !isAtOrgLocation || (active && activeMissionData.status !== 'ready_to_turn_in' && (activeMissionData.progress || 0) < 100)
                                    ? "bg-slate-800 text-slate-600 cursor-not-allowed"
                                    : active ? "bg-emerald-600 text-white hover:bg-emerald-500" : "bg-blue-600 text-white hover:bg-blue-500"
                                )}
                              >
                                {active ? ((activeMissionData.status === 'ready_to_turn_in' || (activeMissionData.progress || 0) >= 100) ? "Đổi Thưởng" : `Đang Làm (${activeMissionData.progress || 0}%)`) : "Nhận"}
                              </button>
                           </div>
                           <div className="flex items-center justify-between border-t border-white/5 pt-2">
                              <div className="flex items-center gap-2">
                                <span className="text-[9px] font-bold text-amber-500">+{mission.rewardContribution} CP</span>
                                <span className="text-[9px] font-bold text-blue-400">+{mission.rewardReputation} RP</span>
                              </div>
                              <span className="text-[9px] text-slate-500 italic max-w-[150px] truncate">{mission.rewardItems.join(', ')}</span>
                           </div>
                           {active && activeMissionData.details && (
                             <div className="p-3 bg-black/60 rounded-lg border border-blue-500/20 text-[9px] text-slate-400 font-serif italic leading-relaxed animate-in fade-in slide-in-from-top-1">
                               <p className="text-blue-400/70 mb-1 uppercase font-mono tracking-widest not-italic">Chỉ dẫn bí mật:</p>
                               {activeMissionData.details}
                             </div>
                           )}
                        </div>
                      );})}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {ORGANIZATIONS.map(org => {
               const loc = getFactionLocation(org.name);
               const isAtLoc = state.currentLocation.toLowerCase().includes(loc.toLowerCase());
               const isKnown = (state.knownFactions || []).includes(org.name) || state.factionsReputation[org.name] !== undefined || isAtLoc;
               const check = org.requirements ? checkRequirements(org.requirements, state, REALMS) : { met: true };

               return (
                 <div key={org.id} className="p-8 bg-[#0f1218] border border-slate-800 rounded-3xl space-y-6 hover:border-blue-500/50 transition-all group flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-600 group-hover:text-blue-400 group-hover:border-blue-500/30 transition-all shadow-inner">
                          <Briefcase size={24} />
                        </div>
                        <span className="text-[8px] px-2 py-1 bg-white/5 text-slate-500 rounded-full border border-white/5 uppercase font-black tracking-widest">{isKnown ? org.type : '???'}</span>
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-lg font-bold text-slate-100 group-hover:text-blue-400 transition-colors tracking-tight">{isKnown ? org.name : 'Tổ Chức Bí Ẩn'}</h4>
                        <p className="text-[11px] text-slate-500 line-clamp-3 leading-relaxed">{isKnown ? org.description : 'Thông tin về thế lực này vẫn còn là một bí ẩn đối với bạn. Hãy tiếp tục tu luyện và phiêu lưu để khám phá thêm.'}</p>
                      </div>
                    </div>
                      <div className="space-y-4">
                        {isKnown && org.requirements && org.requirements.length > 0 && (
                          <div className="space-y-1">
                            <p className="text-[9px] text-slate-600 uppercase font-bold tracking-widest">Yêu Cầu Gia Nhập</p>
                            <div className="flex flex-wrap gap-1">
                              {org.requirements.map(req => (
                                <span key={req} className="text-[8px] px-1.5 py-0.5 bg-rose-500/5 text-rose-500/80 rounded border border-rose-500/10 font-medium">{req}</span>
                              ))}
                            </div>
                          </div>
                        )}
                        <div className="flex flex-wrap gap-1.5">
                           {isKnown && org.ranks[0]?.perks.map(perk => (
                              <span key={perk} className="text-[9px] px-2 py-0.5 bg-blue-500/5 text-blue-400/80 rounded border border-blue-500/10 font-medium">{perk}</span>
                           ))}
                        </div>
                        <div className="space-y-2">
                           {isKnown && !check.met && (
                             <p className="text-[9px] text-rose-400 italic font-serif">Chưa đủ điều kiện: {check.reason}</p>
                           )}
                           <button 
                             onClick={() => onJoinOrg(org.name)}
                             disabled={!isKnown || !check.met}
                             className={cn(
                               "w-full py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all",
                               isKnown && check.met 
                                 ? "bg-white/5 hover:bg-blue-600 text-slate-300 hover:text-white border border-white/10 hover:border-blue-500" 
                                 : "bg-slate-900 text-slate-600 border border-slate-800 cursor-not-allowed opacity-50"
                             )}
                           >
                             {!isKnown ? "Chưa Từng Gặp" : check.met ? "Gia Nhập" : "Bị Từ Chối"}
                           </button>
                        </div>
                      </div>
                 </div>
               );
             })}
          </div>
        )}
      </section>
    </div>
  );
};

export default SectUI;
