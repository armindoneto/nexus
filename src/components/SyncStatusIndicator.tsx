import React, { useState } from 'react';
import {
  CloudOff,
  CheckCircle2,
  RefreshCw,
  AlertTriangle,
  Clock,
  Check,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export type SyncStatusType = 'synced' | 'syncing' | 'pending' | 'error' | 'offline';

interface SyncStatusIndicatorProps {
  status: SyncStatusType;
  lastSynced: string | null;
  errorMessage?: string | null;
  isOffline?: boolean;
  onManualSync: () => void;
  variant: 'desktop' | 'mobile';
  className?: string;
}

export const formatSyncTime = (isoString: string | null): string => {
  if (!isoString) return '--:--';
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return '--:--';
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  } catch {
    return '--:--';
  }
};

export default function SyncStatusIndicator({
  status,
  lastSynced,
  errorMessage,
  isOffline,
  onManualSync,
  variant,
  className = ''
}: SyncStatusIndicatorProps) {
  const [showErrorModal, setShowErrorModal] = useState(false);

  // Normalize effective status
  const effectiveStatus: SyncStatusType = isOffline && status !== 'syncing' ? 'offline' : status;

  if (variant === 'mobile') {
    return (
      <div className={`flex items-center ${className}`} id="mobile-sync-status-container">
        <button
          type="button"
          onClick={() => {
            if (effectiveStatus === 'error' && errorMessage) {
              setShowErrorModal(true);
            } else {
              onManualSync();
            }
          }}
          title={
            effectiveStatus === 'synced'
              ? `Nuvem Sincronizada às ${formatSyncTime(lastSynced)} (Toque para sincronizar)`
              : effectiveStatus === 'syncing'
              ? 'Sincronizando com a nuvem...'
              : effectiveStatus === 'pending'
              ? 'Salvando alterações em instantes...'
              : effectiveStatus === 'error'
              ? `Erro ao sincronizar: ${errorMessage || 'Toque para detalhes'}`
              : 'Modo Offline (Toque para tentar conectar)'
          }
          className={`px-2.5 py-1.5 rounded-xl border flex items-center gap-1.5 text-xs font-bold transition-all cursor-pointer select-none active:scale-95 ${
            effectiveStatus === 'synced'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20'
              : effectiveStatus === 'syncing'
              ? 'bg-brand-primary/10 border-brand-primary/30 text-brand-primary hover:bg-brand-primary/20'
              : effectiveStatus === 'pending'
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20'
              : effectiveStatus === 'error'
              ? 'bg-red-500/15 border-red-500/40 text-red-600 dark:text-red-300 hover:bg-red-500/25 animate-pulse'
              : 'bg-bg-surface-med border-outline-variant/40 text-text-muted hover:bg-bg-surface-high'
          }`}
          id="btn-mobile-sync-status"
        >
          {effectiveStatus === 'synced' && (
            <>
              <div className="relative flex items-center justify-center">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping absolute opacity-75" />
                <CheckCircle2 size={13} className="text-emerald-500 relative z-10" />
              </div>
              <span className="text-[10px] font-display uppercase tracking-wider">Sincronizado</span>
            </>
          )}

          {effectiveStatus === 'syncing' && (
            <>
              <RefreshCw size={13} className="animate-spin text-brand-primary" />
              <span className="text-[10px] font-display uppercase tracking-wider">Salvando...</span>
            </>
          )}

          {effectiveStatus === 'pending' && (
            <>
              <Clock size={13} className="text-amber-500 animate-pulse" />
              <span className="text-[10px] font-display uppercase tracking-wider">Pendente</span>
            </>
          )}

          {effectiveStatus === 'error' && (
            <>
              <AlertTriangle size={13} className="text-red-500" />
              <span className="text-[10px] font-display uppercase tracking-wider">Erro ao Salvar</span>
            </>
          )}

          {effectiveStatus === 'offline' && (
            <>
              <CloudOff size={13} className="text-text-muted" />
              <span className="text-[10px] font-display uppercase tracking-wider">Offline</span>
            </>
          )}
        </button>

        {/* Error Detail Modal on Mobile */}
        <AnimatePresence>
          {showErrorModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowErrorModal(false)}
                className="fixed inset-0 bg-black/80 backdrop-blur-md"
              />
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="bg-bg-surface-low border border-red-500/40 rounded-3xl p-5 shadow-2xl max-w-sm w-full relative z-10 space-y-4 text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-500 shrink-0">
                    <AlertCircle size={20} />
                  </div>
                  <div>
                    <h3 className="font-display font-black text-sm text-text-high">Falha na Sincronização</h3>
                    <p className="text-[10px] text-text-muted">Supabase / Nuvem</p>
                  </div>
                </div>

                <div className="bg-bg-surface-med rounded-xl p-3 border border-outline-variant/30 font-mono text-[11px] text-red-600 dark:text-red-400 break-words max-h-32 overflow-y-auto">
                  {errorMessage || 'Erro de conexão com o banco de dados.'}
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowErrorModal(false)}
                    className="flex-1 py-2 rounded-xl bg-bg-surface-med hover:bg-bg-surface-high text-text-muted font-bold text-xs uppercase tracking-wider font-display transition-colors"
                  >
                    Fechar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowErrorModal(false);
                      onManualSync();
                    }}
                    className="flex-1 py-2 rounded-xl bg-brand-primary hover:bg-brand-primary-hover text-bg-base font-black text-xs uppercase tracking-wider font-display transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <RefreshCw size={13} />
                    <span>Tentar Agora</span>
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Desktop Variant - Adapts seamlessly to Light & Dark themes
  return (
    <div
      className={`bg-bg-surface-med/90 border rounded-2xl p-2.5 shadow-sm select-none transition-all duration-300 ${
        effectiveStatus === 'synced'
          ? 'border-emerald-500/30 dark:border-emerald-500/40 hover:border-emerald-500/50'
          : effectiveStatus === 'syncing'
          ? 'border-brand-primary/40 hover:border-brand-primary/60'
          : effectiveStatus === 'pending'
          ? 'border-amber-500/30 dark:border-amber-500/40 hover:border-amber-500/50'
          : effectiveStatus === 'error'
          ? 'border-red-500/40 bg-red-500/5 dark:bg-red-950/20'
          : 'border-outline-variant/30'
      } ${className}`}
      id="desktop-sync-status-widget"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {/* Icon indicator */}
          <div
            className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 border relative transition-all ${
              effectiveStatus === 'synced'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                : effectiveStatus === 'syncing'
                ? 'bg-brand-primary/10 border-brand-primary/30 text-brand-primary'
                : effectiveStatus === 'pending'
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400'
                : effectiveStatus === 'error'
                ? 'bg-red-500/15 border-red-500/40 text-red-600 dark:text-red-400'
                : 'bg-bg-surface-high border-outline-variant/40 text-text-muted'
            }`}
          >
            {effectiveStatus === 'synced' && (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping absolute -top-0.5 -right-0.5 opacity-75" />
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 absolute -top-0.5 -right-0.5" />
                <Check size={14} strokeWidth={2.5} />
              </>
            )}
            {effectiveStatus === 'syncing' && (
              <RefreshCw size={13} className="animate-spin text-brand-primary" />
            )}
            {effectiveStatus === 'pending' && (
              <Clock size={13} className="text-amber-500 animate-pulse" />
            )}
            {effectiveStatus === 'error' && (
              <AlertTriangle size={13} className="text-red-500 animate-bounce-subtle" />
            )}
            {effectiveStatus === 'offline' && (
              <CloudOff size={13} className="text-text-muted" />
            )}
          </div>

          {/* Text Labels - full width, no truncation on label */}
          <div className="min-w-0 flex-1 overflow-hidden">
            <div className="flex items-center">
              <span className="font-display font-black text-[11px] uppercase tracking-wider text-text-high whitespace-nowrap">
                {effectiveStatus === 'synced' && 'Sincronizado'}
                {effectiveStatus === 'syncing' && 'Salvando...'}
                {effectiveStatus === 'pending' && 'Pendente'}
                {effectiveStatus === 'error' && 'Erro ao Salvar'}
                {effectiveStatus === 'offline' && 'Modo Offline'}
              </span>
            </div>
            <p className="text-[10px] text-text-muted font-mono whitespace-nowrap overflow-hidden text-ellipsis leading-tight">
              {effectiveStatus === 'synced' && (lastSynced ? `Salvo às ${formatSyncTime(lastSynced)}` : 'Salvo na nuvem')}
              {effectiveStatus === 'syncing' && 'Enviando ao banco de dados'}
              {effectiveStatus === 'pending' && 'Alteração detectada'}
              {effectiveStatus === 'error' && (errorMessage || 'Falha de conexão')}
              {effectiveStatus === 'offline' && 'Salvo localmente'}
            </p>
          </div>
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={onManualSync}
          disabled={effectiveStatus === 'syncing'}
          title="Forçar sincronização com a nuvem agora"
          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer shrink-0 border active:scale-95 ${
            effectiveStatus === 'error'
              ? 'bg-red-500/10 hover:bg-red-500/20 border-red-500/30 text-red-600 dark:text-red-300'
              : 'bg-bg-surface-low hover:bg-bg-surface-high border-outline-variant/30 text-text-muted hover:text-text-high'
          }`}
          id="btn-desktop-sync-manual"
        >
          <RefreshCw
            size={12}
            className={`${effectiveStatus === 'syncing' ? 'animate-spin text-brand-primary' : ''}`}
          />
        </button>
      </div>

      {/* If error on desktop, show retry banner with one click */}
      {effectiveStatus === 'error' && (
        <div className="mt-2 pt-2 border-t border-red-500/20 flex items-center justify-between gap-2">
          <span className="text-[9px] text-red-600 dark:text-red-300 font-mono truncate">
            {errorMessage ? `Erro: ${errorMessage.slice(0, 20)}...` : 'Tente novamente'}
          </span>
          <button
            type="button"
            onClick={onManualSync}
            className="px-2 py-0.5 rounded-md bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-700 dark:text-red-200 text-[9px] font-black font-display uppercase tracking-wider transition-all cursor-pointer"
          >
            Tentar
          </button>
        </div>
      )}
    </div>
  );
}

