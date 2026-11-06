/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { CreditCard as CardIcon, Wifi, ChevronRight, TrendingUp } from 'lucide-react';
import { CreditCard } from '../types';

interface CardItemProps {
  key?: string;
  card: CreditCard;
  onPayBill: (cardId: string) => void;
  onAdjustLimit: (cardId: string, newLimit: number) => void;
}

export const CardItem: React.FC<CardItemProps> = ({ card, onPayBill, onAdjustLimit }) => {
  const percentUsed = Math.min((card.used / card.limit) * 100, 100);

  // Gradient themes matching standard elite Brazilian banking assets (Aeternum black/gold, Ultravioleta, etc.)
  const themeStyles = {
    gold: {
      bg: 'bg-gradient-to-tr from-stone-900 via-neutral-950 to-amber-950',
      border: 'border-yellow-500/30',
      accent: 'text-brand-primary',
      badge: 'bg-yellow-500/10 text-brand-primary border-yellow-500/20',
      glow: 'shadow-[0_0_30px_rgba(255,215,0,0.06)]'
    },
    purple: {
      bg: 'bg-gradient-to-tr from-indigo-950 via-purple-950 to-stone-950',
      border: 'border-purple-500/20',
      accent: 'text-purple-400',
      badge: 'bg-purple-500/10 text-purple-300 border-purple-500/20',
      glow: 'shadow-[0_0_30px_rgba(168,85,247,0.06)]'
    },
    slate: {
      bg: 'bg-gradient-to-tr from-neutral-900 via-zinc-950 to-stone-900',
      border: 'border-neutral-500/20',
      accent: 'text-neutral-300',
      badge: 'bg-neutral-500/10 text-neutral-200 border-neutral-500/20',
      glow: 'shadow-[0_0_30px_rgba(115,115,115,0.06)]'
    },
    emerald: {
      bg: 'bg-gradient-to-tr from-emerald-950 via-neutral-950 to-teal-950',
      border: 'border-emerald-500/20',
      accent: 'text-emerald-400',
      badge: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
      glow: 'shadow-[0_0_30px_rgba(16,185,129,0.06)]'
    }
  };

  const style = themeStyles[card.colorTheme] || themeStyles.gold;

  const handlePay = () => {
    onPayBill(card.id);
  };

  const handleLimitIncrease = () => {
    const response = window.prompt(`Defina o novo limite para o cartão ${card.brand} (atual R$: ${card.limit.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}):`, card.limit.toString());
    if (response) {
      const parsed = parseFloat(response.replace(/[^\d]/g, ''));
      if (!isNaN(parsed) && parsed > 0) {
        onAdjustLimit(card.id, parsed);
      }
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.01, y: -2 }}
      className={`relative overflow-hidden rounded-2xl border ${style.border} ${style.bg} ${style.glow} p-6 flex flex-col justify-between h-56 transition-all duration-300`}
      id={`credit-card-${card.id}`}
    >
      {/* Background Microtexture Card Chip Accent Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.03),transparent)] pointer-events-none" />

      {/* Card Header */}
      <div className="flex items-start justify-between z-10">
        <div>
          <span className={`text-[10px] px-2.5 py-1 rounded-full border tracking-widest font-mono uppercase ${style.badge}`}>
            {card.brand}
          </span>
          <h4 className="text-text-muted text-xs mt-2 tracking-wide">Titular</h4>
          <p className="text-text-high font-mono tracking-wider font-bold text-sm">
            {card.holder}
          </p>
        </div>
        
        {/* Contactless + Chip visualizer */}
        <div className="flex flex-col items-end gap-3">
          <div className="w-10 h-7 rounded bg-gradient-to-r from-amber-400/80 via-yellow-200 to-amber-500/80 border border-yellow-500/30 flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-x-2.5 inset-y-0.5 border-x border-black/10 flex justify-between">
              <div className="w-px h-full bg-black/10" />
              <div className="w-px h-full bg-black/10" />
            </div>
            <div className="absolute inset-y-2 inset-x-0.5 border-y border-black/10 flex flex-col justify-between">
              <div className="h-px w-full bg-black/10" />
              <div className="h-px w-full bg-black/10" />
            </div>
          </div>
          <Wifi className="text-text-muted opacity-80 rotate-90" size={18} />
        </div>
      </div>

      {/* Card Footer Detail Panel */}
      <div className="mt-8 z-10">
        <div className="flex justify-between items-end">
          <div>
            <p className="text-text-high font-mono text-lg tracking-widest">
              •••• ••• •••• {card.lastFour}
            </p>
            <div className="flex gap-4 mt-1 text-[11px] text-text-muted">
              <span>Validade: <strong className="text-text-high font-mono">{card.expiry}</strong></span>
              <span>CVC: <strong className="text-text-high font-mono">•••</strong></span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-text-muted uppercase tracking-wider block">Fatura Atual</span>
            <span className="text-text-high font-display font-black text-xl">
              R$ {card.used.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Limit Meter Progress Bar */}
        <div className="mt-4 pt-4 border-t border-white/5 space-y-1.5">
          <div className="flex justify-between text-[11px] text-text-muted">
            <span>Limite Utilizado: <strong className="text-text-high">{percentUsed.toFixed(0)}%</strong></span>
            <span>Total: <strong>R$ {card.limit.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></span>
          </div>
          <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${percentUsed}%` }}
              className={`h-full rounded-full ${
                percentUsed > 80 ? 'bg-red-500' : percentUsed > 50 ? 'bg-amber-500' : 'bg-brand-primary'
              }`}
            />
          </div>

          {/* Quick Actions Panel */}
          <div className="flex justify-between items-center pt-2 gap-2">
            <button
              onClick={handleLimitIncrease}
              className="text-[10px] bg-white/5 border border-white/10 text-text-high hover:bg-white/10 px-2 py-1 rounded transition-colors flex items-center gap-1 cursor-pointer"
              id={`adjust-limit-${card.id}`}
            >
              <TrendingUp size={11} className={style.accent} />
              Ajustar Limite
            </button>
            {card.used > 0 && (
              <button
                onClick={handlePay}
                className="text-[10px] bg-brand-primary text-black font-bold hover:bg-brand-accent px-2 py-1 rounded transition-all cursor-pointer"
                id={`pay-bill-${card.id}`}
              >
                Pagar Fatura
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CardItem;
