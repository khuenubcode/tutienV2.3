import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Flame, Beaker, Package, Zap } from 'lucide-react';
import { PlayerState, Recipe } from '../types';
import { cn } from '../lib/utils';
import { RECIPES } from '../data/worldData';

interface AlchemyUIProps {
  state: PlayerState;
  onCraft: (recipe: Recipe) => void;
}

export function AlchemyUI({ state, onCraft }: AlchemyUIProps) {
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  const alchemyRecipes = RECIPES.filter(r => r.type === 'Đan dược' || r.type === undefined);

  return (
    <div className="flex flex-col h-full bg-[#0a0c0f]">
      <div className="flex items-end justify-between border-b border-slate-800 pb-4 mb-8">
        <div>
          <h2 className="title-font text-3xl text-slate-100 font-bold italic flex items-center gap-3 mb-2">
            <Flame className="text-amber-500" size={32} />
            Đan Dược Đỉnh
          </h2>
          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="text-slate-400 bg-slate-900 px-2 py-1 rounded border border-slate-800">
              Cấp: <span className="text-amber-400">{state.alchemyLevel || 1}</span>
            </span>
            <span className="text-slate-400 bg-slate-900 px-2 py-1 rounded border border-slate-800">
              EXP: <span className="text-amber-400">{state.alchemyExp || 0} / {(state.alchemyLevel || 1) * 100}</span>
            </span>
          </div>
        </div>
        <p className="text-xs text-slate-500 font-mono">ĐƠN PHƯƠNG KHẢ DỤNG: {alchemyRecipes.length}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Recipe List */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          {alchemyRecipes.map((recipe) => {
            const materials = recipe.materials || {};
            const canCraft = Object.entries(materials).every(([res, amount]) => ((state.resources || {})[res] || 0) >= amount);
            
            let successChance = 100 - (recipe.difficulty || 0) + ((state.alchemyLevel || 1) * 2);
            if (recipe.requiredTuVi) {
              const ratio = state.tuVi / Math.max(1, recipe.requiredTuVi);
              if (ratio > 1) {
                successChance += Math.min(30, (ratio - 1) * 20);
              }
            }
            successChance = Math.floor(Math.max(5, Math.min(95, successChance)));
            
            const meetTuVi = !recipe.requiredTuVi || state.tuVi >= recipe.requiredTuVi;
            const disableCraft = !canCraft || !meetTuVi;
            const isSelected = selectedRecipe?.id === recipe.id;

            return (
              <div 
                key={recipe.id} 
                onClick={() => setSelectedRecipe(recipe)}
                className={cn(
                  "border p-4 rounded-xl cursor-pointer transition-all relative overflow-hidden group",
                  isSelected 
                    ? "bg-amber-950/20 border-amber-500/50" 
                    : disableCraft
                      ? "bg-[#0d1014] border-slate-800 opacity-60 hover:opacity-100"
                      : "bg-[#0d1014] border-slate-700 hover:border-amber-500/30"
                )}
              >
                {isSelected && (
                   <motion.div 
                     layoutId="recipe-highlight"
                     className="absolute inset-0 bg-amber-500/5 z-0"
                   />
                )}
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className={cn("text-sm font-bold uppercase tracking-wider", isSelected ? "text-amber-400" : "text-slate-200")}>{recipe.name}</h4>
                    {recipe.requiredTuVi && (
                      <span className={cn("text-[10px] px-2 py-0.5 rounded font-mono", meetTuVi ? "bg-slate-900 border border-slate-700 text-slate-400" : "bg-rose-950/50 border border-rose-900/50 text-rose-500")}>
                        Y/C: {recipe.requiredTuVi} Tu Vi
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 italic mb-4 line-clamp-2">{recipe?.description}</p>
                  
                  <div className="flex justify-between items-center text-[10px] font-mono">
                    <span className={canCraft ? "text-emerald-500" : "text-rose-500 flex items-center gap-1"}>
                      <Package size={12} />
                      {canCraft ? "Đủ nguyên liệu" : "Thiếu nguyên liệu"}
                    </span>
                    {(recipe.type === 'Đan dược' || recipe.difficulty) && (
                      <span className={successChance < 50 ? "text-rose-400" : "text-emerald-400"}>
                        Tỷ lệ: {successChance}%
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Crafting Cauldron / Details */}
        <div className="lg:col-span-1 border border-slate-800 rounded-xl bg-[#0d1014] p-6 relative flex flex-col">
          {selectedRecipe ? (
            <AnimateCauldron 
              recipe={selectedRecipe} 
              state={state} 
              onCraft={onCraft} 
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-600 opacity-50">
              <Flame size={64} className="mb-4" />
              <p className="text-sm font-mono text-center">Chọn một phương thuốc<br/>để bắt đầu luyện chế.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AnimateCauldron({ recipe, state, onCraft }: { recipe: Recipe, state: PlayerState, onCraft: (r: Recipe) => void }) {
  const [isCrafting, setIsCrafting] = useState(false);

  const materials = recipe.materials || {};
  const canCraft = Object.entries(materials).every(([res, amount]) => ((state.resources || {})[res] || 0) >= amount);
  
  let successChance = 100 - (recipe.difficulty || 0) + ((state.alchemyLevel || 1) * 2);
  if (recipe.requiredTuVi) {
    const ratio = state.tuVi / Math.max(1, recipe.requiredTuVi);
    if (ratio > 1) {
      successChance += Math.min(30, (ratio - 1) * 20);
    }
  }
  successChance = Math.floor(Math.max(5, Math.min(95, successChance)));
  const meetTuVi = !recipe.requiredTuVi || state.tuVi >= recipe.requiredTuVi;
  const disableCraft = !canCraft || !meetTuVi;

  const handleCraft = () => {
    if (disableCraft || isCrafting) return;
    setIsCrafting(true);
    setTimeout(() => {
      onCraft(recipe);
      setIsCrafting(false);
    }, 1500); // Faux crafting delay for animation
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 mb-6 flex flex-col items-center justify-center relative">
        {/* Cauldron placeholder animation */}
        <div className="relative w-32 h-32 flex items-center justify-center">
          {isCrafting && (
             <motion.div
               initial={{ opacity: 0, scale: 0.8 }}
               animate={{ opacity: [0.5, 1, 0.5], scale: [0.9, 1.1, 0.9] }}
               transition={{ duration: 1, repeat: Infinity }}
               className="absolute inset-0 bg-amber-500/20 blur-xl rounded-full"
             />
          )}
          <Beaker 
            size={80} 
            className={cn("relative z-10 transition-colors", isCrafting ? "text-amber-500" : "text-slate-700")} 
          />
          {isCrafting && (
            <motion.div
              animate={{ y: [-10, -30], opacity: [0, 1, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="absolute top-0 text-amber-300 z-20"
            >
              <Zap size={24} />
            </motion.div>
          )}
        </div>
        <h3 className="text-xl font-bold text-amber-500 mt-4 text-center">{recipe.name}</h3>
        <p className="text-xs text-slate-400 text-center mt-2">{recipe.description}</p>
      </div>

      <div className="bg-slate-900/80 rounded-xl p-4 mb-6 border border-slate-800">
        <h4 className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-3">Nguyên liệu yêu cầu</h4>
        <div className="space-y-2">
          {Object.entries(materials).map(([res, amount]) => {
            const has = (state.resources || {})[res] || 0;
            const sufficient = has >= amount;
            return (
              <div key={res} className="flex justify-between text-xs font-mono">
                <span className={sufficient ? "text-slate-300" : "text-rose-500"}>{res}</span>
                <span className={sufficient ? "text-emerald-400" : "text-rose-500"}>{has} / {amount}</span>
              </div>
            );
          })}
        </div>

        <div className="border-t border-slate-800 mt-3 pt-3 flex justify-between text-xs font-mono">
          <span className="text-amber-500/80">Tỷ lệ luyện thành:</span>
          <span className={successChance >= 50 ? "text-emerald-400" : "text-amber-400"}>{successChance}%</span>
        </div>
      </div>

      <button
        onClick={handleCraft}
        disabled={disableCraft || isCrafting}
        className={cn(
          "w-full py-4 rounded-xl text-sm font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2",
          !disableCraft && !isCrafting
            ? "bg-amber-600 text-black hover:bg-amber-500 hover:shadow-[0_0_20px_rgba(245,158,11,0.3)]" 
            : "bg-slate-800 text-slate-500 cursor-not-allowed"
        )}
      >
        {isCrafting ? (
          <>
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
              <Flame size={18} />
            </motion.div>
            Đang Luyện Chế...
          </>
        ) : (
          "Bắt Đầu Luyện Chế"
        )}
      </button>
    </div>
  );
}
