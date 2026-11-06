import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plane, 
  Calendar, 
  MapPin, 
  Plus, 
  Trash2, 
  ArrowLeft, 
  GraduationCap, 
  BookOpen, 
  Award, 
  X, 
  Check, 
  ChevronRight,
  TrendingUp,
  Clock,
  History
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { HistoricoEntry } from '../types';

interface HistoricoScreenProps {
  historicoEntries: HistoricoEntry[];
  setHistoricoEntries: React.Dispatch<React.SetStateAction<HistoricoEntry[]>>;
  triggerToast: (msg: string) => void;
  contrachequeTotalNet: number;
  isAfastamentosView: boolean;
  setIsAfastamentosView: (val: boolean) => void;
  theme?: 'dark' | 'light';
}

// Utility: parse dd/mm/aa format into Date object safely
function parseDDMMAA(str: string): Date | null {
  const parts = str.split('/');
  if (parts.length !== 3) return null;
  
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1; // 0-indexed
  let year = parseInt(parts[2], 10);
  
  if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
  
  if (year < 100) {
    year += 2000; // Assume 20xx for yy format
  }
  
  return new Date(year, month, day);
}

// Helper to format Date back to dd/mm/aa string
function formatDateToDDMMAA(date: Date): string {
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const y = String(date.getFullYear()).slice(-2);
  return `${d}/${m}/${y}`;
}

// Precise calendar-aware duration breakdown
function getTimeDifference(start: Date, end: Date) {
  let diffMs = end.getTime() - start.getTime();
  if (diffMs < 0) diffMs = 0;

  let years = end.getFullYear() - start.getFullYear();
  let months = end.getMonth() - start.getMonth();
  let days = end.getDate() - start.getDate();
  let hours = end.getHours() - start.getHours();
  let minutes = end.getMinutes() - start.getMinutes();
  let seconds = end.getSeconds() - start.getSeconds();

  if (seconds < 0) {
    seconds += 60;
    minutes--;
  }
  if (minutes < 0) {
    minutes += 60;
    hours--;
  }
  if (hours < 0) {
    hours += 24;
    days--;
  }
  if (days < 0) {
    // Get days in previous month of end date
    const prevMonth = new Date(end.getFullYear(), end.getMonth(), 0);
    days += prevMonth.getDate();
    months--;
  }
  if (months < 0) {
    months += 12;
    years--;
  }

  return { years, months, days, hours, minutes, seconds };
}

export default function HistoricoScreen({
  historicoEntries,
  setHistoricoEntries,
  triggerToast,
  contrachequeTotalNet,
  isAfastamentosView,
  setIsAfastamentosView,
  theme = 'dark'
}: HistoricoScreenProps) {
  const [entryToDelete, setEntryToDelete] = useState<HistoricoEntry | null>(null);
  const [now, setNow] = useState<Date>(new Date());
  
  // Real-time ticking effect
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Constants for global loading bar
  const startDateGlobal = useMemo(() => new Date(2010, 0, 28, 0, 0, 0), []);
  const endDateGlobal = useMemo(() => new Date(2043, 5, 22, 23, 59, 59), []);
  
  const totalGlobalDuration = useMemo(() => endDateGlobal.getTime() - startDateGlobal.getTime(), [startDateGlobal, endDateGlobal]);
  
  const globalProgressData = useMemo(() => {
    const elapsedMs = Math.max(0, now.getTime() - startDateGlobal.getTime());
    const remainingMs = Math.max(0, endDateGlobal.getTime() - now.getTime());
    
    const percentage = Math.min(100, Math.max(0, (elapsedMs / totalGlobalDuration) * 100));
    
    // Elapsed time calculation
    const elapsed = getTimeDifference(startDateGlobal, now);
    // Remaining time calculation
    const remaining = getTimeDifference(now, endDateGlobal);
    
    return {
      percentage,
      elapsed,
      remaining
    };
  }, [now, startDateGlobal, endDateGlobal, totalGlobalDuration]);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalCategory, setModalCategory] = useState<'CURSOS' | 'INSTRUÇÃO' | 'MISSÕES'>('CURSOS');
  
  // Form Fields
  const [formName, setFormName] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formStartDate, setFormStartDate] = useState('');
  const [formEndDate, setFormEndDate] = useState('');
  const [formTravelDays, setFormTravelDays] = useState('');
  const [formIsAbsence, setFormIsAbsence] = useState(true);

  // Auto mask for dd/mm/aa date inputs
  const handleDateMask = (val: string, setter: (v: string) => void) => {
    let clean = val.replace(/[^\d]/g, '');
    if (clean.length <= 2) {
      setter(clean);
    } else if (clean.length <= 4) {
      setter(clean.slice(0, 2) + '/' + clean.slice(2));
    } else {
      setter(clean.slice(0, 2) + '/' + clean.slice(2, 4) + '/' + clean.slice(4, 6));
    }
  };

  const handleOpenLaunch = (category: 'CURSOS' | 'INSTRUÇÃO' | 'MISSÕES') => {
    setModalCategory(category);
    setFormName('');
    setFormLocation('');
    setFormStartDate('');
    setFormEndDate('');
    setFormTravelDays('');
    setFormIsAbsence(true);
    setIsModalOpen(true);
  };

  const handleSaveLaunch = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formName.trim()) {
      triggerToast('Por favor, informe o nome do item.');
      return;
    }
    if (!formLocation.trim()) {
      triggerToast('Por favor, informe o local.');
      return;
    }
    
    const start = parseDDMMAA(formStartDate);
    const end = parseDDMMAA(formEndDate);
    
    if (!start) {
      triggerToast('Data de início inválida. Use o formato dd/mm/aa.');
      return;
    }
    if (!end) {
      triggerToast('Data de fim inválida. Use o formato dd/mm/aa.');
      return;
    }
    if (end < start) {
      triggerToast('A data de fim deve ser posterior ou igual à data de início.');
      return;
    }
    
    const travelDays = formTravelDays === '' ? 0 : parseInt(formTravelDays, 10);
    if (isNaN(travelDays) || travelDays < 0) {
      triggerToast('Informe uma quantidade válida de dias de deslocamento.');
      return;
    }

    const newEntry: HistoricoEntry = {
      id: 'historico-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      category: modalCategory,
      name: formName.trim(),
      location: formLocation.trim(),
      startDate: formStartDate,
      endDate: formEndDate,
      travelDays: travelDays,
      isAbsence: formIsAbsence
    };

    setHistoricoEntries(prev => [newEntry, ...prev]);
    setIsModalOpen(false);
    triggerToast('Lançamento adicionado com sucesso!');
  };

  const handleDeleteEntry = (id: string) => {
    setHistoricoEntries(prev => prev.filter(entry => entry.id !== id));
    triggerToast('Lançamento excluído com sucesso.');
  };

  // Calculate entry duration and progress bar value
  const getEntryProgress = (entry: HistoricoEntry) => {
    const start = parseDDMMAA(entry.startDate);
    const end = parseDDMMAA(entry.endDate);
    
    if (!start || !end) return { duration: 0, percent: 0, status: 'unknown' };
    
    const totalTime = end.getTime() - start.getTime();
    const durationDays = Math.ceil(totalTime / (1000 * 60 * 60 * 24)) + 1;
    
    let percent = 0;
    let status: 'past' | 'present' | 'future' = 'present';
    
    if (now > end) {
      percent = 100;
      status = 'past';
    } else if (now < start) {
      percent = 0;
      status = 'future';
    } else {
      if (totalTime > 0) {
        percent = ((now.getTime() - start.getTime()) / totalTime) * 100;
      } else {
        percent = 100;
      }
      status = 'present';
    }
    
    return {
      duration: durationDays,
      percent: Math.min(100, Math.max(0, percent)),
      status
    };
  };

  // --- CALCULATION OF AFASTAMENTOS RANKING ---
  const afastamentosRanking = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const yearsMap: { [key: number]: { awayDays: number; travelDays: number } } = {};
    
    // Initialize years from 2010 to currentYear
    for (let y = 2010; y <= currentYear; y++) {
      yearsMap[y] = { awayDays: 0, travelDays: 0 };
    }

    historicoEntries.forEach(entry => {
      if (entry.isAbsence === false) return;
      const start = parseDDMMAA(entry.startDate);
      const end = parseDDMMAA(entry.endDate);
      
      if (!start || !end) return;

      const startYear = start.getFullYear();
      
      // 1. Add travel days to the start year
      if (yearsMap[startYear] !== undefined) {
        yearsMap[startYear].travelDays += entry.travelDays;
      }

      // 2. Add days away, distributing across overlapping years
      for (let y = 2010; y <= currentYear; y++) {
        const yearStart = new Date(y, 0, 1);
        const yearEnd = new Date(y, 11, 31, 23, 59, 59);

        const overlapStart = start > yearStart ? start : yearStart;
        const overlapEnd = end < yearEnd ? end : yearEnd;

        if (overlapStart <= overlapEnd) {
          const overlapTime = overlapEnd.getTime() - overlapStart.getTime();
          const overlapDays = Math.ceil(overlapTime / (1000 * 60 * 60 * 24)) + 1;
          yearsMap[y].awayDays += Math.max(0, overlapDays);
        }
      }
    });

    // Convert map to list, compute totals and rank
    const list = Object.entries(yearsMap).map(([yearStr, data]) => {
      const year = parseInt(yearStr, 10);
      const total = data.awayDays + data.travelDays;
      return {
        year,
        awayDays: data.awayDays,
        travelDays: data.travelDays,
        total
      };
    });

    // Sort descending by total absence days
    return list.sort((a, b) => b.total - a.total);
  }, [historicoEntries]);

  // Max total for relative ranking bars
  const maxTotalAfastamento = useMemo(() => {
    const max = Math.max(...afastamentosRanking.map(r => r.total));
    return max > 0 ? max : 1;
  }, [afastamentosRanking]);

  // Render Afastamentos Sub-view
  if (isAfastamentosView) {
    return (
      <div className="flex flex-col h-full space-y-6" id="afastamentos-ranking-view">
        {/* Sub-view Header */}
        <div className="flex items-center gap-3 border-b border-outline-variant/15 pb-4">
          <button
            onClick={() => setIsAfastamentosView(false)}
            className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-text-muted hover:text-white hover:bg-white/10 transition-all cursor-pointer flex items-center justify-center"
            title="Voltar para Histórico"
            id="btn-back-from-afastamentos"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h2 className="text-lg font-black tracking-wider text-white uppercase font-display flex items-center gap-2">
              <Plane size={18} className="text-brand-primary" />
              Ranking de Afastamentos
            </h2>
          </div>
        </div>

        {/* Ranking List */}
        <div className="grid grid-cols-1 gap-4 pb-20 max-w-xl mx-auto w-full" id="afastamentos-grid">
          {afastamentosRanking.map((item, index) => {
            const isZero = item.total === 0;

            return (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                key={item.year}
                className={`p-4 rounded-2xl border transition-all ${
                  isZero 
                    ? 'bg-bg-surface-low/30 border-outline-variant/10 opacity-60' 
                    : 'bg-bg-surface-low border-outline-variant/40 hover:border-brand-primary/45'
                } flex flex-col justify-between shadow-sm`}
                id={`afastamentos-card-${item.year}`}
              >
                {/* Year Name and Position Badge */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black font-display text-white">{item.year}</span>
                    {item.total > 0 && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-brand-primary/10 border border-brand-primary/20 text-brand-primary font-bold">
                        {index + 1}º Lugar
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-text-muted font-bold block uppercase tracking-wider">Total Acumulado</span>
                    <span className={`text-base font-black font-mono tracking-tight ${isZero ? 'text-text-muted' : 'text-brand-primary'}`}>
                      {item.total} {item.total === 1 ? 'dia' : 'dias'}
                    </span>
                  </div>
                </div>

                {/* Overlap distribution bars & visual bar */}
                <div className="space-y-2.5">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-black/20 p-2 rounded-xl border border-white/5">
                      <span className="text-[9px] text-text-muted block font-semibold uppercase tracking-wider">Dias Afastados</span>
                      <span className="text-xs font-bold font-mono text-white mt-0.5 block">{item.awayDays} d</span>
                    </div>
                    <div className="bg-black/20 p-2 rounded-xl border border-white/5">
                      <span className="text-[9px] text-text-muted block font-semibold uppercase tracking-wider">Deslocamento</span>
                      <span className="text-xs font-bold font-mono text-white mt-0.5 block">{item.travelDays} d</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full space-y-6 overflow-y-auto pb-24" id="historico-screen-container">
      
      {/* 1. HORIZONTAL TIME LOADING BAR (28/01/2010 to 22/06/2043) */}
      <div className="bg-bg-surface-low border border-outline-variant/50 rounded-2xl p-4 sm:p-5 shadow-md flex flex-col space-y-4" id="time-progress-container">
        {/* Title & overall percentage */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-brand-primary animate-pulse" />
            <span className="text-xs font-black uppercase tracking-widest text-white font-display">TEMPO DE SERVIÇO</span>
          </div>
          <div className="text-right">
            <span className="text-sm font-black font-mono text-brand-primary">
              {globalProgressData.percentage.toFixed(2)}%
            </span>
          </div>
        </div>

        {/* Visual Dual Load Bar: Green (elapsed) and Red (remaining) */}
        <div className="h-4 bg-red-600/20 rounded-full overflow-hidden flex border border-outline-variant/30 relative" id="carrier-timeline-bar">
          <div 
            className="h-full bg-emerald-500 bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-l-full transition-all duration-1000"
            style={{ width: `${globalProgressData.percentage}%` }}
          />
          <div 
            className="h-full bg-rose-600 bg-gradient-to-r from-rose-500 to-rose-700 rounded-r-full transition-all duration-1000"
            style={{ width: `${100 - globalProgressData.percentage}%` }}
          />
        </div>

        {/* Dual Text Breakdown info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1 text-xs" id="carrier-timeline-breakdown">
          {/* ELAPSED INFO (Green portion) */}
          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-3 space-y-1.5 flex flex-col">
            <div className="flex items-center gap-1.5 text-emerald-400 font-bold uppercase tracking-wider text-[10px]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              TEMPO DECORRIDO (DESDE 28/01/2010)
            </div>
            <div className="text-sm font-black font-mono text-white tracking-tight leading-relaxed">
              {globalProgressData.elapsed.years}a {globalProgressData.elapsed.months}m {globalProgressData.elapsed.days}d {String(globalProgressData.elapsed.hours).padStart(2, '0')}h {String(globalProgressData.elapsed.minutes).padStart(2, '0')}m {String(globalProgressData.elapsed.seconds).padStart(2, '0')}s
            </div>
          </div>

          {/* REMAINING INFO (Red portion) */}
          <div className="bg-rose-500/5 border border-rose-500/20 rounded-xl p-3 space-y-1.5 flex flex-col">
            <div className="flex items-center gap-1.5 text-rose-400 font-bold uppercase tracking-wider text-[10px]">
              <span className="w-2 h-2 rounded bg-rose-400 animate-pulse" />
              TEMPO RESTANTE (ATÉ 22/06/2043)
            </div>
            <div className="text-sm font-black font-mono text-white tracking-tight leading-relaxed">
              {globalProgressData.remaining.years}a {globalProgressData.remaining.months}m {globalProgressData.remaining.days}d {String(globalProgressData.remaining.hours).padStart(2, '0')}h {String(globalProgressData.remaining.minutes).padStart(2, '0')}m {String(globalProgressData.remaining.seconds).padStart(2, '0')}s
            </div>
          </div>
        </div>
      </div>

      {/* 2. CATEGORY CARDS GRID (CURSOS, INSTRUÇÃO, MISSÕES) */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6" id="historico-categories-container">
        
        {/* CURSOS CARD */}
        <div className="bg-bg-surface-low border border-outline-variant/50 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4 flex flex-col justify-between" id="category-box-cursos">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-brand-primary/10 rounded-lg flex items-center justify-center border border-brand-primary/20">
                  <GraduationCap size={16} className="text-brand-primary" />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-white">CURSOS</h3>
                </div>
              </div>
              <button
                onClick={() => handleOpenLaunch('CURSOS')}
                className="py-1.5 px-2.5 rounded-lg bg-brand-primary text-black hover:opacity-90 transition-opacity flex items-center gap-1 text-[10px] font-black uppercase tracking-wider cursor-pointer"
                id="btn-add-curso"
              >
                <Plus size={12} strokeWidth={3} />
                <span>Lançar</span>
              </button>
            </div>

            {/* List for Cursos */}
            <div className="space-y-3" id="list-cursos">
              {historicoEntries.filter(e => e.category === 'CURSOS').length === 0 ? (
                <p className="text-xs text-text-muted italic py-6 text-center opacity-60">Nenhum curso lançado.</p>
              ) : (
                historicoEntries.filter(e => e.category === 'CURSOS').map(entry => {
                  const prog = getEntryProgress(entry);
                  return (
                    <div key={entry.id} className="bg-black/15 border border-white/5 rounded-xl p-3.5 space-y-2 relative group" id={`entry-${entry.id}`}>
                      <div className="flex justify-between items-start gap-2">
                        <div className="space-y-0.5">
                          <button
                            type="button"
                            onClick={() => setEntryToDelete(entry)}
                            className={`text-xs font-bold text-left uppercase tracking-tight cursor-pointer hover:text-brand-primary transition-colors ${
                              theme === 'light' ? 'text-zinc-900' : 'text-white'
                            }`}
                            title="Opções de exclusão"
                            id={`btn-open-delete-entry-${entry.id}`}
                          >
                            {entry.name}
                          </button>
                          <span className="text-[10px] text-text-muted flex items-center gap-1 font-semibold">
                            <MapPin size={10} className="text-brand-primary" />
                            {entry.location}
                          </span>
                          {entry.isAbsence === false && (
                            <span className="inline-block mt-1 text-[8px] font-black text-text-muted px-1.5 py-0.5 rounded bg-white/5 border border-white/5 uppercase tracking-wider">
                              Apenas Histórico
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => setEntryToDelete(entry)}
                          className="text-text-muted hover:text-rose-400 p-1 rounded hover:bg-white/5 transition-colors cursor-pointer"
                          title="Excluir"
                          id={`btn-delete-entry-${entry.id}`}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[10px] font-mono border-t border-white/5 pt-2">
                        <div>
                          <span className="text-text-muted block uppercase text-[8px] font-bold tracking-wider">Período ({prog.duration}d)</span>
                          <span className={`font-semibold ${theme === 'light' ? 'text-zinc-900' : 'text-white'}`}>{entry.startDate} a {entry.endDate}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-text-muted block uppercase text-[8px] font-bold tracking-wider">Deslocamento</span>
                          <span className={`font-semibold ${theme === 'light' ? 'text-zinc-900' : 'text-white'}`}>{entry.travelDays} {entry.travelDays === 1 ? 'dia' : 'dias'}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* INSTRUÇÃO CARD */}
        <div className="bg-bg-surface-low border border-outline-variant/50 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4 flex flex-col justify-between" id="category-box-instrucao">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-brand-primary/10 rounded-lg flex items-center justify-center border border-brand-primary/20">
                  <BookOpen size={16} className="text-brand-primary" />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-white">INSTRUÇÃO</h3>
                </div>
              </div>
              <button
                onClick={() => handleOpenLaunch('INSTRUÇÃO')}
                className="py-1.5 px-2.5 rounded-lg bg-brand-primary text-black hover:opacity-90 transition-opacity flex items-center gap-1 text-[10px] font-black uppercase tracking-wider cursor-pointer"
                id="btn-add-instrucao"
              >
                <Plus size={12} strokeWidth={3} />
                <span>Lançar</span>
              </button>
            </div>

            {/* List for Instrucao */}
            <div className="space-y-3" id="list-instrucao">
              {historicoEntries.filter(e => e.category === 'INSTRUÇÃO').length === 0 ? (
                <p className="text-xs text-text-muted italic py-6 text-center opacity-60">Nenhuma instrução lançada.</p>
              ) : (
                historicoEntries.filter(e => e.category === 'INSTRUÇÃO').map(entry => {
                  const prog = getEntryProgress(entry);
                  return (
                    <div key={entry.id} className="bg-black/15 border border-white/5 rounded-xl p-3.5 space-y-2 relative group" id={`entry-${entry.id}`}>
                      <div className="flex justify-between items-start gap-2">
                        <div className="space-y-0.5">
                          <button
                            type="button"
                            onClick={() => setEntryToDelete(entry)}
                            className={`text-xs font-bold text-left uppercase tracking-tight cursor-pointer hover:text-brand-primary transition-colors ${
                              theme === 'light' ? 'text-zinc-900' : 'text-white'
                            }`}
                            title="Opções de exclusão"
                            id={`btn-open-delete-entry-${entry.id}`}
                          >
                            {entry.name}
                          </button>
                          <span className="text-[10px] text-text-muted flex items-center gap-1 font-semibold">
                            <MapPin size={10} className="text-brand-primary" />
                            {entry.location}
                          </span>
                          {entry.isAbsence === false && (
                            <span className="inline-block mt-1 text-[8px] font-black text-text-muted px-1.5 py-0.5 rounded bg-white/5 border border-white/5 uppercase tracking-wider">
                              Apenas Histórico
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => setEntryToDelete(entry)}
                          className="text-text-muted hover:text-rose-400 p-1 rounded hover:bg-white/5 transition-colors cursor-pointer"
                          title="Excluir"
                          id={`btn-delete-entry-${entry.id}`}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[10px] font-mono border-t border-white/5 pt-2">
                        <div>
                          <span className="text-text-muted block uppercase text-[8px] font-bold tracking-wider">Período ({prog.duration}d)</span>
                          <span className={`font-semibold ${theme === 'light' ? 'text-zinc-900' : 'text-white'}`}>{entry.startDate} a {entry.endDate}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-text-muted block uppercase text-[8px] font-bold tracking-wider">Deslocamento</span>
                          <span className={`font-semibold ${theme === 'light' ? 'text-zinc-900' : 'text-white'}`}>{entry.travelDays} {entry.travelDays === 1 ? 'dia' : 'dias'}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* MISSÕES CARD */}
        <div className="bg-bg-surface-low border border-outline-variant/50 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4 flex flex-col justify-between" id="category-box-missoes">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-brand-primary/10 rounded-lg flex items-center justify-center border border-brand-primary/20">
                  <Plane size={16} className="text-brand-primary" />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-white">MISSÕES</h3>
                </div>
              </div>
              <button
                onClick={() => handleOpenLaunch('MISSÕES')}
                className="py-1.5 px-2.5 rounded-lg bg-brand-primary text-black hover:opacity-90 transition-opacity flex items-center gap-1 text-[10px] font-black uppercase tracking-wider cursor-pointer"
                id="btn-add-missao"
              >
                <Plus size={12} strokeWidth={3} />
                <span>Lançar</span>
              </button>
            </div>

            {/* List for Missoes */}
            <div className="space-y-3" id="list-missoes">
              {historicoEntries.filter(e => e.category === 'MISSÕES').length === 0 ? (
                <p className="text-xs text-text-muted italic py-6 text-center opacity-60">Nenhuma missão lançada.</p>
              ) : (
                historicoEntries.filter(e => e.category === 'MISSÕES').map(entry => {
                  const prog = getEntryProgress(entry);
                  return (
                    <div key={entry.id} className="bg-black/15 border border-white/5 rounded-xl p-3.5 space-y-2 relative group" id={`entry-${entry.id}`}>
                      <div className="flex justify-between items-start gap-2">
                        <div className="space-y-0.5">
                          <button
                            type="button"
                            onClick={() => setEntryToDelete(entry)}
                            className={`text-xs font-bold text-left uppercase tracking-tight cursor-pointer hover:text-brand-primary transition-colors ${
                              theme === 'light' ? 'text-zinc-900' : 'text-white'
                            }`}
                            title="Opções de exclusão"
                            id={`btn-open-delete-entry-${entry.id}`}
                          >
                            {entry.name}
                          </button>
                          <span className="text-[10px] text-text-muted flex items-center gap-1 font-semibold">
                            <MapPin size={10} className="text-brand-primary" />
                            {entry.location}
                          </span>
                          {entry.isAbsence === false && (
                            <span className="inline-block mt-1 text-[8px] font-black text-text-muted px-1.5 py-0.5 rounded bg-white/5 border border-white/5 uppercase tracking-wider">
                              Apenas Histórico
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => setEntryToDelete(entry)}
                          className="text-text-muted hover:text-rose-400 p-1 rounded hover:bg-white/5 transition-colors cursor-pointer"
                          title="Excluir"
                          id={`btn-delete-entry-${entry.id}`}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[10px] font-mono border-t border-white/5 pt-2">
                        <div>
                          <span className="text-text-muted block uppercase text-[8px] font-bold tracking-wider">Período ({prog.duration}d)</span>
                          <span className={`font-semibold ${theme === 'light' ? 'text-zinc-900' : 'text-white'}`}>{entry.startDate} a {entry.endDate}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-text-muted block uppercase text-[8px] font-bold tracking-wider">Deslocamento</span>
                          <span className={`font-semibold ${theme === 'light' ? 'text-zinc-900' : 'text-white'}`}>{entry.travelDays} {entry.travelDays === 1 ? 'dia' : 'dias'}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
        
      </div>

      {/* 3. MODAL FOR NEW LAUNCH */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" id="modal-historico-overlay">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className={`border rounded-3xl p-6 w-full max-w-sm shadow-2xl relative ${
                theme === 'light'
                  ? 'bg-white border-zinc-200 text-zinc-900'
                  : 'bg-bg-surface-low border-outline-variant/60 text-white'
              }`}
              id="modal-historico-container"
            >
              <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20 mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-widest text-brand-primary font-display">Lançar Novo Item</span>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className={`p-1 rounded-full cursor-pointer transition-colors ${
                    theme === 'light' ? 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100' : 'text-text-muted hover:text-white hover:bg-white/5'
                  }`}
                  id="btn-close-historico-modal"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSaveLaunch} className="space-y-4">
                {/* Category Display */}
                <div className="space-y-1">
                  <span className={`text-[9px] uppercase tracking-wider font-bold block ${
                    theme === 'light' ? 'text-zinc-500' : 'text-text-muted'
                  }`}>Categoria Selecionada</span>
                  <div className={`flex items-center gap-2 px-3 py-2 border rounded-xl text-xs font-black uppercase tracking-widest ${
                    theme === 'light' ? 'bg-zinc-100 border-zinc-200 text-zinc-900' : 'bg-white/5 border-outline-variant/20 text-white'
                  }`}>
                    {modalCategory === 'CURSOS' && <GraduationCap size={14} className="text-brand-primary" />}
                    {modalCategory === 'INSTRUÇÃO' && <BookOpen size={14} className="text-brand-primary" />}
                    {modalCategory === 'MISSÕES' && <Plane size={14} className="text-brand-primary" />}
                    <span>{modalCategory}</span>
                  </div>
                </div>

                {/* Name */}
                <div className="space-y-1.5">
                  <label className={`block text-[9px] uppercase tracking-wider font-bold ${
                    theme === 'light' ? 'text-zinc-600' : 'text-text-muted'
                  }`}>Nome do {modalCategory === 'CURSOS' ? 'Curso' : modalCategory === 'INSTRUÇÃO' ? 'Instrução' : 'Missão'}</label>
                  <input
                    type="text"
                    required
                    placeholder={`Ex: ${modalCategory === 'CURSOS' ? 'Curso de Piloto' : modalCategory === 'INSTRUÇÃO' ? 'Palestras Básicas' : 'Operação Amazônia'}`}
                    value={formName}
                    onChange={e => setFormName(e.target.value)}
                    className={`border rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-brand-primary w-full ${
                      theme === 'light'
                        ? 'bg-zinc-50 border-zinc-200 text-zinc-900 placeholder:text-zinc-400 focus:bg-white'
                        : 'bg-bg-base border-outline-variant/60 text-white placeholder:text-text-muted/60'
                    }`}
                    id="input-historico-name"
                  />
                </div>

                {/* Location */}
                <div className="space-y-1.5">
                  <label className={`block text-[9px] uppercase tracking-wider font-bold ${
                    theme === 'light' ? 'text-zinc-600' : 'text-text-muted'
                  }`}>Local</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Rio de Janeiro - RJ"
                    value={formLocation}
                    onChange={e => setFormLocation(e.target.value)}
                    className={`border rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-brand-primary w-full ${
                      theme === 'light'
                        ? 'bg-zinc-50 border-zinc-200 text-zinc-900 placeholder:text-zinc-400 focus:bg-white'
                        : 'bg-bg-base border-outline-variant/60 text-white placeholder:text-text-muted/60'
                    }`}
                    id="input-historico-location"
                  />
                </div>

                {/* Dates Início and Fim */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className={`block text-[9px] uppercase tracking-wider font-bold ${
                      theme === 'light' ? 'text-zinc-600' : 'text-text-muted'
                    }`}>Início</label>
                    <input
                      type="text"
                      required
                      placeholder="DD/MM/AA"
                      value={formStartDate}
                      onChange={e => handleDateMask(e.target.value, setFormStartDate)}
                      maxLength={8}
                      className={`border rounded-xl px-3 py-2 text-xs font-bold font-mono text-center focus:outline-none focus:border-brand-primary w-full tracking-wider ${
                        theme === 'light'
                          ? 'bg-zinc-50 border-zinc-200 text-zinc-900 placeholder:text-zinc-400 focus:bg-white'
                          : 'bg-bg-base border-outline-variant/60 text-white placeholder:text-text-muted/40'
                      }`}
                      id="input-historico-start-date"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className={`block text-[9px] uppercase tracking-wider font-bold ${
                      theme === 'light' ? 'text-zinc-600' : 'text-text-muted'
                    }`}>Fim</label>
                    <input
                      type="text"
                      required
                      placeholder="DD/MM/AA"
                      value={formEndDate}
                      onChange={e => handleDateMask(e.target.value, setFormEndDate)}
                      maxLength={8}
                      className={`border rounded-xl px-3 py-2 text-xs font-bold font-mono text-center focus:outline-none focus:border-brand-primary w-full tracking-wider ${
                        theme === 'light'
                          ? 'bg-zinc-50 border-zinc-200 text-zinc-900 placeholder:text-zinc-400 focus:bg-white'
                          : 'bg-bg-base border-outline-variant/60 text-white placeholder:text-text-muted/40'
                      }`}
                      id="input-historico-end-date"
                    />
                  </div>
                </div>

                {/* Dias de Deslocamento */}
                <div className="space-y-1.5">
                  <label className={`block text-[9px] uppercase tracking-wider font-bold ${
                    theme === 'light' ? 'text-zinc-600' : 'text-text-muted'
                  }`}>Dias de Deslocamento</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={formTravelDays}
                    onChange={e => setFormTravelDays(e.target.value)}
                    className={`border rounded-xl px-3 py-2 text-xs font-bold font-mono focus:outline-none focus:border-brand-primary w-full ${
                      theme === 'light'
                        ? 'bg-zinc-50 border-zinc-200 text-zinc-900 placeholder:text-zinc-400 focus:bg-white'
                        : 'bg-bg-base border-outline-variant/60 text-white placeholder:text-text-muted/60'
                    }`}
                    id="input-historico-travel-days"
                  />
                </div>

                {/* Contar como afastamento Checkbox */}
                <div className="flex items-center gap-2 py-1">
                  <input
                    type="checkbox"
                    checked={formIsAbsence}
                    onChange={e => setFormIsAbsence(e.target.checked)}
                    className="w-4 h-4 rounded border-outline-variant/60 bg-bg-base text-brand-primary focus:ring-brand-primary cursor-pointer accent-brand-primary"
                    id="checkbox-historico-is-absence"
                  />
                  <label htmlFor="checkbox-historico-is-absence" className={`text-xs font-semibold cursor-pointer select-none ${
                    theme === 'light' ? 'text-zinc-800' : 'text-white'
                  }`}>
                    Contar como afastamento
                  </label>
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className={`w-1/2 py-2.5 rounded-xl border text-xs font-black uppercase tracking-widest transition-colors cursor-pointer text-center ${
                      theme === 'light'
                        ? 'border-zinc-200 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                        : 'border-outline-variant/60 text-text-muted hover:text-white'
                    }`}
                    id="btn-cancel-historico-modal"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="w-1/2 py-2.5 rounded-xl bg-brand-primary text-black text-xs font-black uppercase tracking-widest hover:opacity-90 transition-opacity cursor-pointer text-center font-bold"
                    id="btn-submit-historico-modal"
                  >
                    Salvar
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 4. MODAL DE OPÇÃO DE EXCLUSÃO */}
      <AnimatePresence>
        {entryToDelete && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" id="modal-delete-historico-overlay">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className={`border rounded-3xl p-6 w-full max-w-sm shadow-2xl relative space-y-5 ${
                theme === 'light'
                  ? 'bg-white border-zinc-200 text-zinc-900 shadow-xl'
                  : 'bg-bg-surface-low border-outline-variant/60 text-white'
              }`}
              id="modal-delete-historico-container"
            >
              <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20">
                <div className="space-y-0.5">
                  <span className="text-[9px] font-black uppercase tracking-widest text-brand-primary font-display">Opção de Exclusão</span>
                  <h4 className={`text-sm font-bold uppercase tracking-tight ${theme === 'light' ? 'text-zinc-900' : 'text-white'}`}>
                    {entryToDelete.name}
                  </h4>
                </div>
                <button
                  onClick={() => setEntryToDelete(null)}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    theme === 'light' ? 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100' : 'text-text-muted hover:text-white hover:bg-white/5'
                  }`}
                  id="btn-close-delete-historico-modal"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Informações detalhadas */}
              <div className={`p-3.5 rounded-2xl border space-y-2 text-xs font-mono ${
                theme === 'light' ? 'bg-zinc-50 border-zinc-200 text-zinc-800' : 'bg-black/30 border-white/5 text-text-high'
              }`}>
                <div className="flex justify-between items-center text-[11px]">
                  <span className={theme === 'light' ? 'text-zinc-500' : 'text-text-muted'}>Categoria</span>
                  <span className="font-bold font-sans uppercase text-[10px] px-2 py-0.5 rounded bg-brand-primary/10 text-brand-primary border border-brand-primary/20">
                    {entryToDelete.category}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className={theme === 'light' ? 'text-zinc-500' : 'text-text-muted'}>Local</span>
                  <span className={`font-semibold ${theme === 'light' ? 'text-zinc-900' : 'text-white'}`}>{entryToDelete.location}</span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className={theme === 'light' ? 'text-zinc-500' : 'text-text-muted'}>Período</span>
                  <span className={`font-semibold ${theme === 'light' ? 'text-zinc-900' : 'text-white'}`}>
                    {entryToDelete.startDate} a {entryToDelete.endDate}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className={theme === 'light' ? 'text-zinc-500' : 'text-text-muted'}>Deslocamento</span>
                  <span className={`font-semibold ${theme === 'light' ? 'text-zinc-900' : 'text-white'}`}>
                    {entryToDelete.travelDays} {entryToDelete.travelDays === 1 ? 'dia' : 'dias'}
                  </span>
                </div>
              </div>

              <p className={`text-xs leading-relaxed ${theme === 'light' ? 'text-zinc-600' : 'text-text-muted'}`}>
                Deseja realmente excluir este lançamento do histórico? Esta ação é definitiva.
              </p>

              <div className="flex gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => setEntryToDelete(null)}
                  className={`w-1/2 py-2.5 rounded-xl border text-xs font-black uppercase tracking-widest transition-colors cursor-pointer text-center ${
                    theme === 'light'
                      ? 'border-zinc-200 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                      : 'border-outline-variant/60 text-text-muted hover:text-white hover:bg-white/5'
                  }`}
                  id="btn-cancel-delete-historico"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleDeleteEntry(entryToDelete.id);
                    setEntryToDelete(null);
                  }}
                  className="w-1/2 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-black uppercase tracking-widest transition-all cursor-pointer text-center shadow-md flex items-center justify-center gap-1.5 font-bold"
                  id="btn-confirm-delete-historico"
                >
                  <Trash2 size={13} />
                  <span>Excluir</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
