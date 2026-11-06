import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  History,
  ArrowUpRight,
  ArrowDownLeft,
  Edit3,
  Sparkles,
  Clock,
  Wallet,
  X
} from 'lucide-react';
import { Account, AccountHistoryEntry } from '../types';
import { getAccountColorClasses } from '../App';

interface AccountHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  account: Account | null;
  historyEntries: AccountHistoryEntry[];
}

export default function AccountHistoryModal({
  isOpen,
  onClose,
  account,
  historyEntries
}: AccountHistoryModalProps) {
  if (!isOpen || !account) return null;

  // Filter entries for this account and limit to the last 10 modifications (sorted newest first)
  const accountLogs = historyEntries
    .filter(entry => entry.accountId === account.id)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 10);

  const formatCurrency = (val: number) => {
    return `R$ ${val.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  const getTypeBadge = (type: AccountHistoryEntry['type']) => {
    switch (type) {
      case 'soma':
        return {
          icon: <ArrowUpRight size={13} strokeWidth={2.5} className="text-emerald-500" />,
          bgIcon: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500',
          badgeBg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-400',
          label: 'DEPÓSITO'
        };
      case 'subtracao':
        return {
          icon: <ArrowDownLeft size={13} strokeWidth={2.5} className="text-red-500" />,
          bgIcon: 'bg-red-500/10 border-red-500/30 text-red-500',
          badgeBg: 'bg-red-500/15 border-red-500/30 text-red-600 dark:text-red-400',
          label: 'RETIRADA'
        };
      case 'edicao':
        return {
          icon: <Edit3 size={13} strokeWidth={2.5} className="text-amber-500" />,
          bgIcon: 'bg-amber-500/10 border-amber-500/30 text-amber-500',
          badgeBg: 'bg-amber-500/15 border-amber-500/30 text-amber-600 dark:text-amber-400',
          label: 'EDIÇÃO'
        };
      case 'criacao':
      default:
        return {
          icon: <Sparkles size={13} strokeWidth={2.5} className="text-brand-primary" />,
          bgIcon: 'bg-brand-primary/10 border-brand-primary/30 text-brand-primary',
          badgeBg: 'bg-brand-primary/15 border-brand-primary/30 text-brand-primary',
          label: 'CRIAÇÃO'
        };
    }
  };

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm shadow-2xl"
        id="account-history-modal-overlay"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 10 }}
          transition={{ duration: 0.18 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-lg bg-bg-surface-low border border-outline-variant/60 rounded-3xl p-5 sm:p-6 flex flex-col max-h-[90vh] shadow-2xl relative text-left"
          id="account-history-modal-content"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-outline-variant/30 pb-4 mb-4" id="account-history-modal-header">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-brand-primary/10 border border-brand-primary/30 flex items-center justify-center text-brand-primary shrink-0">
                <History size={20} strokeWidth={2.5} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${getAccountColorClasses(account.color)}`} />
                  <h3 className="font-display font-black text-sm sm:text-base tracking-wide text-text-high uppercase">
                    {account.name}
                  </h3>
                </div>
                <p className="text-[10px] text-text-muted font-mono font-semibold uppercase tracking-wider mt-0.5">
                  Histórico das últimas 10 modificações
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-bg-surface-med hover:bg-bg-surface-high border border-outline-variant/30 text-text-muted hover:text-text-high transition-colors flex items-center justify-center cursor-pointer"
              title="Fechar"
              id="btn-close-account-history-modal"
            >
              <X size={16} />
            </button>
          </div>

          {/* Account Snapshot Card */}
          <div className="bg-bg-surface-med/70 border border-outline-variant/40 rounded-2xl p-3.5 mb-4 flex items-center justify-between gap-3 shadow-inner" id="account-history-current-balance-box">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-bg-surface-high border border-outline-variant/40 flex items-center justify-center text-text-muted">
                <Wallet size={15} />
              </div>
              <div>
                <span className="text-[9px] uppercase tracking-widest text-text-muted font-mono font-bold block">
                  Saldo Atual
                </span>
                <span className="text-sm font-mono font-black text-text-high">
                  {formatCurrency(account.balance)}
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="inline-block px-2.5 py-1 rounded-lg text-[9px] font-mono font-bold bg-bg-surface-high border border-outline-variant/40 text-text-muted uppercase">
                {accountLogs.length} {accountLogs.length === 1 ? 'registro' : 'registros'}
              </span>
            </div>
          </div>

          {/* History List */}
          <div className="flex-1 overflow-y-auto pr-1 space-y-2.5 custom-scrollbar min-h-[180px] max-h-[360px]" id="account-history-entries-list">
            {accountLogs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 px-4 text-center rounded-2xl bg-bg-surface-med/30 border border-dashed border-outline-variant/40 space-y-2">
                <div className="w-10 h-10 rounded-full bg-bg-surface-med flex items-center justify-center text-text-muted mb-1">
                  <Clock size={18} />
                </div>
                <h4 className="text-xs font-bold text-text-high">Nenhuma modificação recente gravada</h4>
                <p className="text-[11px] text-text-muted max-w-[280px]">
                  Operações de soma (+), subtração (-) ou edição realizadas nesta conta aparecerão listadas aqui automaticamente.
                </p>
              </div>
            ) : (
              accountLogs.map((entry, index) => {
                const typeConfig = getTypeBadge(entry.type);
                const hasAmountChange = entry.amountChange !== undefined && entry.amountChange !== 0;

                return (
                  <div
                    key={entry.id}
                    className="bg-bg-surface-med/50 hover:bg-bg-surface-med/80 border border-outline-variant/30 hover:border-outline-variant/60 rounded-2xl p-3.5 space-y-2 transition-all"
                    id={`account-history-item-${entry.id}`}
                  >
                    {/* Top Row: Type Pill and Date */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 ${typeConfig.bgIcon}`}>
                          {typeConfig.icon}
                        </div>
                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-display font-black uppercase tracking-wider border ${typeConfig.badgeBg}`}>
                          {typeConfig.label}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 text-[10px] text-text-muted font-mono shrink-0">
                        <Clock size={11} className="opacity-70" />
                        <span>{entry.dateFormatted}</span>
                      </div>
                    </div>

                    {/* Middle Row: Description */}
                    <div className="text-xs text-text-high font-medium pl-8">
                      {entry.description}
                    </div>

                    {/* Bottom Row: Balance Transition */}
                    <div className="flex items-center justify-between pt-1.5 border-t border-outline-variant/15 pl-8 text-[10px] font-mono">
                      <div className="flex items-center gap-1.5 text-text-muted">
                        <span>Anterior:</span>
                        <span className="font-semibold text-text-high">
                          {formatCurrency(entry.previousBalance)}
                        </span>
                        <span className="text-text-muted">➔</span>
                        <span>Novo:</span>
                        <span className="font-bold text-text-high">
                          {formatCurrency(entry.newBalance)}
                        </span>
                      </div>

                      {hasAmountChange && (
                        <div
                          className={`font-black text-[11px] ${
                            entry.amountChange! > 0
                              ? 'text-emerald-500'
                              : 'text-red-500'
                          }`}
                        >
                          {entry.amountChange! > 0 ? '+' : ''}
                          {formatCurrency(entry.amountChange!)}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="pt-4 mt-4 border-t border-outline-variant/30 flex justify-end" id="account-history-modal-footer">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-bg-surface-med hover:bg-bg-surface-high border border-outline-variant/30 text-text-high font-display font-extrabold uppercase text-[10px] tracking-wider transition-all cursor-pointer text-center"
              id="btn-close-account-history-footer"
            >
              Fechar
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
