import React, { useState, useEffect } from 'react';
import { Plus, Trash2, CalendarDays, ChevronLeft, ChevronRight, Eraser, Info, Search, ArrowLeft, Clock, Sparkles, TrendingUp, Layers, Calendar, BarChart4, Edit3, Eye, EyeOff } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { EscalaTurno, EscalaDay } from '../types';

export const SHIFT_COLORS = [
  { id: 'amber', name: 'Amarelo', bg: 'bg-amber-500/15', border: 'border-amber-500/40', text: 'text-amber-400', badge: 'bg-amber-500 text-black', hex: '#F59E0B' },
  { id: 'red', name: 'Vermelho', bg: 'bg-red-500/15', border: 'border-red-500/40', text: 'text-red-400', badge: 'bg-red-500 text-white', hex: '#EF4444' },
  { id: 'blue', name: 'Azul', bg: 'bg-blue-500/15', border: 'border-blue-500/40', text: 'text-blue-400', badge: 'bg-blue-500 text-white', hex: '#3B82F6' },
  { id: 'emerald', name: 'Verde', bg: 'bg-emerald-500/15', border: 'border-emerald-500/40', text: 'text-emerald-400', badge: 'bg-emerald-500 text-black', hex: '#10B981' },
  { id: 'purple', name: 'Roxo', bg: 'bg-purple-500/15', border: 'border-purple-500/40', text: 'text-purple-400', badge: 'bg-purple-500 text-white', hex: '#8B5CF6' },
  { id: 'pink', name: 'Rosa', bg: 'bg-pink-500/15', border: 'border-pink-500/40', text: 'text-pink-400', badge: 'bg-pink-500 text-white', hex: '#EC4899' },
  { id: 'orange', name: 'Laranja', bg: 'bg-orange-500/15', border: 'border-orange-500/40', text: 'text-orange-400', badge: 'bg-orange-500 text-white', hex: '#F97316' },
  { id: 'cyan', name: 'Ciano', bg: 'bg-cyan-500/15', border: 'border-cyan-500/40', text: 'text-cyan-400', badge: 'bg-cyan-500 text-black', hex: '#06B6D4' },
];

const DEFAULT_TURNOS: EscalaTurno[] = [
  { id: 't-1', nome: 'Manhã Supervisor', legenda: 'MS', duracao: '06:00', categoria: 'Manhã', cor: 'amber' },
  { id: 't-2', nome: 'Tarde Operador', legenda: 'TO', duracao: '08:00', categoria: 'Tarde', cor: 'blue' },
  { id: 't-3', nome: 'Serviço 24h', legenda: 'SV', duracao: '24:00', categoria: 'Serviço', cor: 'red' },
  { id: 't-4', nome: 'Noite Apoio', legenda: 'NA', duracao: '12:00', categoria: 'Noite', cor: 'purple' },
];

interface EscalaScreenProps {
  turnos: EscalaTurno[];
  setTurnos: React.Dispatch<React.SetStateAction<EscalaTurno[]>>;
  escalaDays: EscalaDay[];
  setEscalaDays: React.Dispatch<React.SetStateAction<EscalaDay[]>>;
  triggerToast: (msg: string) => void;
}

const MONTHS_PT = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export default function EscalaScreen({
  turnos,
  setTurnos,
  escalaDays,
  setEscalaDays,
  triggerToast
}: EscalaScreenProps) {
  // View mode: month or year overview
  const [viewMode, setViewMode] = useState<'month' | 'year'>('month');

  // Initialize current month & year to the current runtime date
  const [currentYear, setCurrentYear] = useState(() => new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(() => new Date().getMonth() + 1); // 1-indexed

  // Active painting tool: null, 'eraser', or turno ID
  const [activeTool, setActiveTool] = useState<string | 'eraser' | null>(null);

  // Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Toggle for full summary dashboard
  const [isResumoOpen, setIsResumoOpen] = useState(false);

  // Form States for New Turno
  const [nome, setNome] = useState('');
  const [legenda, setLegenda] = useState('');
  const [duracao, setDuracao] = useState('');
  const [categoria, setCategoria] = useState('');
  const [selectedColor, setSelectedColor] = useState('amber');

  // State for Editing/Hiding/Confirmation
  const [turnoToEdit, setTurnoToEdit] = useState<EscalaTurno | null>(null);
  const [turnoToDelete, setTurnoToDelete] = useState<EscalaTurno | null>(null);
  const [showHiddenTurnos, setShowHiddenTurnos] = useState(false);

  // Month search string (MM/AAAA or AAAA depending on mode)
  const [searchQuery, setSearchQuery] = useState('');

  // Search query to filter shifts in paintbox
  const [turnoSearchQuery, setTurnoSearchQuery] = useState('');

  // Sync search input with active month/year changes
  useEffect(() => {
    if (viewMode === 'year') {
      setSearchQuery(`${currentYear}`);
    } else {
      setSearchQuery(`${String(currentMonth).padStart(2, '0')}/${currentYear}`);
    }
  }, [currentMonth, currentYear, viewMode]);

  // Load defaults if empty
  useEffect(() => {
    if (turnos.length === 0) {
      setTurnos(DEFAULT_TURNOS);
    }
  }, [turnos, setTurnos]);

  // Automatic format for duration: HH:MM with colon inserted automatically
  const handleDuracaoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, ''); // Digits only
    if (val.length > 4) val = val.slice(0, 4);
    if (val.length > 2) {
      val = val.slice(0, 2) + ':' + val.slice(2);
    }
    setDuracao(val);
  };

  const handleSearchChange = (val: string) => {
    // Only allow numbers and slash
    let clean = val.replace(/[^\d/]/g, '');
    
    if (viewMode === 'year') {
      // Limit to 4 digits for year view
      clean = clean.replace(/\//g, '').slice(0, 4);
      setSearchQuery(clean);
      if (clean.length === 4) {
        const y = parseInt(clean, 10);
        if (y >= 1900 && y <= 2100) {
          setCurrentYear(y);
        }
      }
    } else {
      // Monthly view MM/AAAA format
      if (clean.length > 2 && !clean.includes('/')) {
        clean = clean.slice(0, 2) + '/' + clean.slice(2);
      }
      clean = clean.slice(0, 7);
      setSearchQuery(clean);

      if (clean.length === 7) {
        const match = clean.match(/^(\d{2})\/(\d{4})$/);
        if (match) {
          const m = parseInt(match[1], 10);
          const y = parseInt(match[2], 10);
          if (m >= 1 && m <= 12 && y >= 1900 && y <= 2100) {
            setCurrentMonth(m);
            setCurrentYear(y);
          }
        }
      }
    }
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
    setTurnoToEdit(null);
    setNome('');
    setLegenda('');
    setDuracao('');
    setCategoria('');
    setSelectedColor('amber');
  };

  const handleStartEditTurno = (turno: EscalaTurno) => {
    setTurnoToEdit(turno);
    setNome(turno.nome);
    setLegenda(turno.legenda);
    setDuracao(turno.duracao);
    setCategoria(turno.categoria);
    setSelectedColor(turno.cor);
    setIsCreateModalOpen(true);
  };

  const handleToggleHideTurno = (id: string) => {
    setTurnos(prev => prev.map(t => {
      if (t.id === id) {
        const nextHidden = !t.hidden;
        triggerToast(nextHidden ? `Turno "${t.nome}" ocultado do seletor!` : `Turno "${t.nome}" visível no seletor!`);
        return { ...t, hidden: nextHidden };
      }
      return t;
    }));
  };

  const handleCreateTurno = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) {
      triggerToast('Informe o nome do turno');
      return;
    }
    if (!legenda.trim()) {
      triggerToast('Informe a legenda');
      return;
    }
    if (duracao.length !== 5) {
      triggerToast('Informe a duração no formato HH:MM');
      return;
    }

    if (turnoToEdit) {
      setTurnos(prev => prev.map(t => t.id === turnoToEdit.id ? {
        ...t,
        nome: nome.trim(),
        legenda: legenda.trim().toUpperCase(),
        duracao,
        categoria: categoria.trim() || 'Geral',
        cor: selectedColor
      } : t));
      triggerToast(`Turno "${nome.trim()}" atualizado com sucesso!`);
    } else {
      const newTurno: EscalaTurno = {
        id: `t-${Math.random().toString(36).substring(2, 9)}`,
        nome: nome.trim(),
        legenda: legenda.trim().toUpperCase(),
        duracao,
        categoria: categoria.trim() || 'Geral',
        cor: selectedColor
      };

      setTurnos(prev => [...prev, newTurno]);
      triggerToast(`Turno "${newTurno.nome}" criado com sucesso!`);
      // Set as active tool immediately for convenience
      setActiveTool(newTurno.id);
    }
    
    // Reset Form
    handleCloseCreateModal();
  };

  const handleDeleteTurno = (id: string) => {
    setTurnos(prev => prev.filter(t => t.id !== id));
    
    // Also clean up references to deleted turno in days
    setEscalaDays(prev => prev.map(day => ({
      ...day,
      turnos: day.turnos.filter(tid => tid !== id)
    })).filter(day => day.turnos.length > 0));

    if (activeTool === id) {
      setActiveTool(null);
    }
    triggerToast('Turno excluído com sucesso');
  };

  // Nav month functions
  const handlePrevMonth = () => {
    if (viewMode === 'year') {
      setCurrentYear(prev => prev - 1);
    } else {
      if (currentMonth === 1) {
        setCurrentMonth(12);
        setCurrentYear(prev => prev - 1);
      } else {
        setCurrentMonth(prev => prev - 1);
      }
    }
  };

  const handleNextMonth = () => {
    if (viewMode === 'year') {
      setCurrentYear(prev => prev + 1);
    } else {
      if (currentMonth === 12) {
        setCurrentMonth(1);
        setCurrentYear(prev => prev + 1);
      } else {
        setCurrentMonth(prev => prev + 1);
      }
    }
  };

  // Column Index mapping: Sunday first (column index 0), Saturday last (column index 6)
  const getColIndex = (dayOfWeek: number) => {
    return dayOfWeek; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  };

  // Build Calendar grid for monthly view
  const generateCalendarGrid = () => {
    const firstDayDate = new Date(currentYear, currentMonth - 1, 1);
    const firstDayWeekday = firstDayDate.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
    const firstColIndex = getColIndex(firstDayWeekday);
    
    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
    const daysInPrevMonth = new Date(currentYear, currentMonth - 1, 0).getDate();
    
    const cells = [];
    
    // Prev month days
    for (let i = firstColIndex - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
      const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;
      cells.push({
        dayNum,
        dateStr: `${prevYear}-${String(prevMonth).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`,
        isCurrentMonth: false,
      });
    }
    
    // Current month days
    for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
      cells.push({
        dayNum,
        dateStr: `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`,
        isCurrentMonth: true,
      });
    }
    
    // Next month days to complete grid
    const totalCells = Math.ceil(cells.length / 7) * 7;
    const nextMonthDaysNeeded = totalCells - cells.length;
    for (let dayNum = 1; dayNum <= nextMonthDaysNeeded; dayNum++) {
      const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
      const nextYear = currentMonth === 12 ? currentYear + 1 : currentYear;
      cells.push({
        dayNum,
        dateStr: `${nextYear}-${String(nextMonth).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`,
        isCurrentMonth: false,
      });
    }
    
    // Group into weeks of 7
    const weeks = [];
    for (let i = 0; i < cells.length; i += 7) {
      weeks.push(cells.slice(i, i + 7));
    }
    return weeks;
  };

  // Build compact grid for miniature monthly calendar inside Yearly view
  const generateMiniCalendarGrid = (year: number, month: number) => {
    const firstDayDate = new Date(year, month - 1, 1);
    const firstDayWeekday = firstDayDate.getDay();
    const firstColIndex = getColIndex(firstDayWeekday);
    
    const daysInMonth = new Date(year, month, 0).getDate();
    const cells = [];
    
    // Fill empty offset columns
    for (let i = 0; i < firstColIndex; i++) {
      cells.push({ dayNum: null, dateStr: '' });
    }
    
    // Add real month days
    for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
      cells.push({
        dayNum,
        dateStr: `${year}-${String(month).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`,
      });
    }
    
    // Pad end columns to form clean rows
    const totalCells = Math.ceil(cells.length / 7) * 7;
    const paddingNeeded = totalCells - cells.length;
    for (let i = 0; i < paddingNeeded; i++) {
      cells.push({ dayNum: null, dateStr: '' });
    }
    
    // Group into weeks
    const weeks = [];
    for (let i = 0; i < cells.length; i += 7) {
      weeks.push(cells.slice(i, i + 7));
    }
    return weeks;
  };

  const handleCellClick = (dateStr: string) => {
    if (!activeTool) {
      triggerToast('Selecione um turno ou a borracha para pintar os dias');
      return;
    }

    const existingDay = escalaDays.find(d => d.dateStr === dateStr);
    const existingTurnos = existingDay ? existingDay.turnos : [];

    if (activeTool === 'eraser') {
      if (existingTurnos.length > 0) {
        setEscalaDays(prev => prev.filter(d => d.dateStr !== dateStr));
        triggerToast('Turnos removidos do dia');
      }
    } else {
      if (existingTurnos.includes(activeTool)) {
        const updatedTurnos = existingTurnos.filter(id => id !== activeTool);
        if (updatedTurnos.length === 0) {
          setEscalaDays(prev => prev.filter(d => d.dateStr !== dateStr));
        } else {
          setEscalaDays(prev => prev.map(d => d.dateStr === dateStr ? { ...d, turnos: updatedTurnos } : d));
        }
      } else {
        if (existingTurnos.length >= 2) {
          const updatedTurnos = [existingTurnos[0], activeTool];
          setEscalaDays(prev => prev.map(d => d.dateStr === dateStr ? { ...d, turnos: updatedTurnos } : d));
          triggerToast('Substituído segundo turno do dia');
        } else {
          if (existingDay) {
            setEscalaDays(prev => prev.map(d => d.dateStr === dateStr ? { ...d, turnos: [...existingTurnos, activeTool] } : d));
          } else {
            setEscalaDays(prev => [...prev, { dateStr, turnos: [activeTool] }]);
          }
        }
      }
    }
  };

  const weeks = generateCalendarGrid();
  const weekdayLabels = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  // Calculate statistics based on selected view mode (entire year or current month)
  const currentPrefix = viewMode === 'year' 
    ? `${currentYear}-` 
    : `${currentYear}-${String(currentMonth).padStart(2, '0')}-`;

  const filteredDays = escalaDays.filter(d => d.dateStr.startsWith(currentPrefix));
  
  // Total hours calculation
  let totalMinutes = 0;
  const shiftCounts: { [key: string]: number } = {};

  filteredDays.forEach(day => {
    day.turnos.forEach(tid => {
      const turno = turnos.find(t => t.id === tid);
      if (turno) {
        shiftCounts[turno.id] = (shiftCounts[turno.id] || 0) + 1;
        const [h, m] = turno.duracao.split(':').map(Number);
        totalMinutes += h * 60 + m;
      }
    });
  });

  const totalHours = Math.floor(totalMinutes / 60);
  const totalMinsLeft = totalMinutes % 60;
  const formattedTotalHours = `${totalHours}h${totalMinsLeft > 0 ? ` ${totalMinsLeft}m` : ''}`;

  // Helpers for summary calculations
  const getDurationMinutes = (dur: string) => {
    const parts = dur.split(':');
    if (parts.length !== 2) return 0;
    const h = parseInt(parts[0], 10) || 0;
    const m = parseInt(parts[1], 10) || 0;
    return h * 60 + m;
  };

  const formatMinutesToHours = (totalMins: number) => {
    const h = Math.floor(totalMins / 60);
    const m = totalMins % 60;
    return `${h}h${m > 0 ? ` ${m}m` : ''}`;
  };

  // Calculations for all months/years (entire history)
  const totalMinutesAll = escalaDays.reduce((acc, day) => {
    if (!day.turnos) return acc;
    return acc + day.turnos.reduce((dayAcc, turnoId) => {
      const t = turnos.find(turno => turno.id === turnoId);
      if (!t) return dayAcc;
      return dayAcc + getDurationMinutes(t.duracao);
    }, 0);
  }, 0);
  const formattedTotalMinutesAll = formatMinutesToHours(totalMinutesAll);

  const turnosSummary = turnos.map(turno => {
    let count = 0;
    escalaDays.forEach(day => {
      if (day.turnos) {
        day.turnos.forEach(id => {
          if (id === turno.id) count++;
        });
      }
    });
    const mins = count * getDurationMinutes(turno.duracao);
    return {
      ...turno,
      count,
      totalMins: mins,
      formattedTotal: formatMinutesToHours(mins)
    };
  }).sort((a, b) => b.totalMins - a.totalMins);

  const categoriesMap = new Map<string, { count: number; totalMins: number }>();
  // Initialize with all unique categories defined in registered turnos
  turnos.forEach(t => {
    const cat = t.categoria?.trim() || 'Outro';
    if (!categoriesMap.has(cat)) {
      categoriesMap.set(cat, { count: 0, totalMins: 0 });
    }
  });

  escalaDays.forEach(day => {
    if (day.turnos) {
      day.turnos.forEach(turnoId => {
        const t = turnos.find(turno => turno.id === turnoId);
        if (t) {
          const cat = t.categoria?.trim() || 'Outro';
          const durMins = getDurationMinutes(t.duracao);
          const current = categoriesMap.get(cat) || { count: 0, totalMins: 0 };
          categoriesMap.set(cat, {
            count: current.count + 1,
            totalMins: current.totalMins + durMins
          });
        }
      });
    }
  });

  const categoriesSummary = Array.from(categoriesMap.entries()).map(([name, data]) => {
    return {
      name,
      count: data.count,
      totalMins: data.totalMins,
      formattedTotal: formatMinutesToHours(data.totalMins)
    };
  }).sort((a, b) => b.totalMins - a.totalMins);

  const monthlyMap = new Map<string, number>();
  escalaDays.forEach(day => {
    if (day.turnos && day.dateStr) {
      const yearMonth = day.dateStr.substring(0, 7); // "YYYY-MM"
      day.turnos.forEach(turnoId => {
        const t = turnos.find(turno => turno.id === turnoId);
        if (t) {
          const durMins = getDurationMinutes(t.duracao);
          monthlyMap.set(yearMonth, (monthlyMap.get(yearMonth) || 0) + durMins);
        }
      });
    }
  });

  const monthlyChartData = Array.from(monthlyMap.entries()).map(([yearMonth, mins]) => {
    const [year, month] = yearMonth.split('-');
    const mIdx = parseInt(month, 10) - 1;
    const mName = MONTHS_PT[mIdx]?.substring(0, 3) || month;
    const shortYear = year.substring(2);
    return {
      key: yearMonth,
      label: `${mName}/${shortYear}`,
      'Horas': parseFloat((mins / 60).toFixed(1)),
      mins
    };
  }).sort((a, b) => a.key.localeCompare(b.key));

  const yearlyMap = new Map<string, number>();
  escalaDays.forEach(day => {
    if (day.turnos && day.dateStr) {
      const year = day.dateStr.substring(0, 4); // "YYYY"
      day.turnos.forEach(turnoId => {
        const t = turnos.find(turno => turno.id === turnoId);
        if (t) {
          const durMins = getDurationMinutes(t.duracao);
          yearlyMap.set(year, (yearlyMap.get(year) || 0) + durMins);
        }
      });
    }
  });

  const yearlyChartData = Array.from(yearlyMap.entries()).map(([year, mins]) => {
    return {
      label: year,
      'Horas': parseFloat((mins / 60).toFixed(1)),
      mins
    };
  }).sort((a, b) => a.label.localeCompare(b.label));

  if (isResumoOpen) {
    return (
      <div className="w-full space-y-6 pb-12 animate-fade-in" id="escala-resumo-view">
        {/* Header Section */}
        <div className="bg-bg-surface-low border border-outline-variant/60 rounded-3xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4" id="escala-resumo-header">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsResumoOpen(false)}
              className="w-10 h-10 rounded-xl border border-outline-variant/30 bg-bg-surface-med text-text-muted hover:text-white hover:border-outline-variant/60 hover:bg-bg-surface-high transition-all cursor-pointer flex items-center justify-center shadow-md shrink-0 animate-fade-in"
              title="Voltar para o calendário"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h2 className="text-sm font-black text-white uppercase tracking-wider font-display flex items-center gap-2">
                Resumo Geral de Escalas
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsResumoOpen(false)}
            className="px-4 py-2.5 bg-brand-primary/10 border border-brand-primary/30 text-brand-primary hover:bg-brand-primary/20 rounded-xl text-[10px] font-black tracking-widest uppercase font-display transition-all cursor-pointer flex items-center gap-2 shadow-md hover:shadow-brand-primary/5 self-start sm:self-auto"
          >
            <ArrowLeft size={12} strokeWidth={3} /> Voltar ao Calendário
          </button>
        </div>

        {/* Carga Horária Total Big Metric */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-bg-surface-low to-bg-surface-med border border-outline-variant/60 rounded-3xl p-6 shadow-xl flex items-center justify-between col-span-full relative overflow-hidden group">
            <div className="space-y-1.5 relative z-10">
              <span className="text-[10px] font-black uppercase text-brand-primary tracking-widest font-display flex items-center gap-1.5">
                <Sparkles size={11} className="animate-pulse" /> Histórico Acumulado
              </span>
              <h3 className="text-3xl font-black text-white font-mono tracking-tight">{formattedTotalMinutesAll}</h3>
            </div>
            <div className="text-brand-primary/5 text-9xl font-black font-display select-none absolute right-6 top-1/2 -translate-y-1/2 group-hover:scale-105 transition-transform duration-500 hidden sm:block">
              HRS
            </div>
          </div>
        </div>

        {/* Lists Section (Turnos and Categorias side-by-side) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Turnos List Card */}
          <div className="bg-bg-surface-low border border-outline-variant/60 rounded-3xl p-6 shadow-xl space-y-4 flex flex-col">
            <div className="flex items-center gap-2 border-b border-outline-variant/10 pb-3">
              <Clock size={16} className="text-brand-primary" />
              <h3 className="text-[11px] font-black text-text-high uppercase tracking-widest font-display">Resumo por Turno</h3>
            </div>
            <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1 flex-1 custom-scrollbar">
              {turnosSummary.length === 0 ? (
                <p className="text-xs text-text-muted py-8 text-center">Nenhum turno registrado.</p>
              ) : (
                turnosSummary.map(turno => {
                  const colorObj = SHIFT_COLORS.find(c => c.id === turno.cor) || SHIFT_COLORS[0];
                  return (
                    <div 
                      key={turno.id} 
                      className="bg-bg-surface-med/40 hover:bg-bg-surface-med/60 border border-outline-variant/15 hover:border-outline-variant/30 rounded-2xl px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 transition-all"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className={`w-8 h-8 rounded-full ${colorObj.badge} flex items-center justify-center text-xs font-mono font-black shadow-sm shrink-0`}>
                          {turno.legenda}
                        </span>
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-black text-text-high uppercase truncate max-w-[200px] sm:max-w-xs" title={turno.nome}>
                            {turno.nome}
                          </span>
                          <span className="text-[10px] text-text-muted font-mono">
                            {turno.categoria || 'Sem categoria'} • {turno.duracao}/escala
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 sm:gap-6 justify-between sm:justify-end sm:text-right w-full sm:w-auto border-t sm:border-t-0 border-outline-variant/10 pt-2 sm:pt-0">
                        <div className="flex flex-col text-left sm:text-right">
                          <span className="text-sm font-black text-white font-mono">{turno.count}x</span>
                          <span className="text-[8px] text-text-muted font-bold uppercase tracking-wider">Atribuído</span>
                        </div>
                        <div className="flex flex-col border-l border-outline-variant/20 pl-4 min-w-[70px] text-right">
                          <span className="text-sm font-black text-brand-primary font-mono">{turno.formattedTotal}</span>
                          <span className="text-[8px] text-text-muted font-bold uppercase tracking-wider">Carga Total</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Categorias List Card */}
          <div className="bg-bg-surface-low border border-outline-variant/60 rounded-3xl p-6 shadow-xl space-y-4 flex flex-col">
            <div className="flex items-center gap-2 border-b border-outline-variant/10 pb-3">
              <Layers size={16} className="text-brand-primary" />
              <h3 className="text-[11px] font-black text-text-high uppercase tracking-widest font-display">Resumo por Categoria</h3>
            </div>
            <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1 flex-1 custom-scrollbar">
              {categoriesSummary.length === 0 ? (
                <p className="text-xs text-text-muted py-8 text-center">Nenhuma categoria registrada.</p>
              ) : (
                categoriesSummary.map(cat => {
                  return (
                    <div 
                      key={cat.name} 
                      className="bg-bg-surface-med/40 hover:bg-bg-surface-med/60 border border-outline-variant/15 hover:border-outline-variant/30 rounded-2xl px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 transition-all"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-brand-primary/10 border border-brand-primary/25 text-brand-primary flex items-center justify-center text-[10px] font-black uppercase font-display shrink-0 shadow-sm">
                          {cat.name.substring(0, 2)}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-black text-text-high uppercase font-display truncate max-w-[200px] sm:max-w-xs" title={cat.name}>
                            {cat.name}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 sm:gap-6 justify-between sm:justify-end sm:text-right w-full sm:w-auto border-t sm:border-t-0 border-outline-variant/10 pt-2 sm:pt-0">
                        <div className="flex flex-col text-left sm:text-right">
                          <span className="text-sm font-black text-white font-mono">{cat.count}x</span>
                          <span className="text-[8px] text-text-muted font-bold uppercase tracking-wider">Lançamentos</span>
                        </div>
                        <div className="flex flex-col border-l border-outline-variant/20 pl-4 min-w-[70px] text-right">
                          <span className="text-sm font-black text-brand-primary font-mono">{cat.formattedTotal}</span>
                          <span className="text-[8px] text-text-muted font-bold uppercase tracking-wider">Carga Total</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Workload Bar Chart */}
          <div className="bg-bg-surface-low border border-outline-variant/60 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-outline-variant/10 pb-3">
              <div className="flex items-center gap-2">
                <TrendingUp size={16} className="text-brand-primary" />
                <h3 className="text-[11px] font-black text-text-high uppercase tracking-widest font-display">Carga Horária por Mês</h3>
              </div>
              <span className="text-[9px] text-text-muted font-mono uppercase tracking-widest">Valores em Horas</span>
            </div>
            <div className="h-64 pt-4" id="monthly-chart-container">
              {monthlyChartData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-text-muted">
                  Nenhum registro para exibir o gráfico.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                    <XAxis 
                      dataKey="label" 
                      stroke="#8E9AA6" 
                      fontSize={10} 
                      tickLine={false} 
                      axisLine={false} 
                    />
                    <YAxis 
                      stroke="#8E9AA6" 
                      fontSize={10} 
                      tickLine={false} 
                      axisLine={false} 
                      tickFormatter={(value) => `${value}h`}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#131920', borderColor: '#2E3843', borderRadius: '12px' }}
                      labelStyle={{ color: '#E2E8F0', fontWeight: 'bold', fontSize: '11px', fontFamily: 'monospace' }}
                      itemStyle={{ color: '#E5A93C', fontSize: '11px' }}
                      formatter={(value) => [`${value} horas`, 'Carga Horária']}
                    />
                    <Bar 
                      dataKey="Horas" 
                      fill="#E5A93C" 
                      radius={[6, 6, 0, 0]} 
                      maxBarSize={35}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Yearly Workload Bar Chart */}
          <div className="bg-bg-surface-low border border-outline-variant/60 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-outline-variant/10 pb-3">
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-brand-primary" />
                <h3 className="text-[11px] font-black text-text-high uppercase tracking-widest font-display">Carga Horária por Ano</h3>
              </div>
              <span className="text-[9px] text-text-muted font-mono uppercase tracking-widest">Valores em Horas</span>
            </div>
            <div className="h-64 pt-4" id="yearly-chart-container">
              {yearlyChartData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-text-muted">
                  Nenhum registro para exibir o gráfico.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={yearlyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                    <XAxis 
                      dataKey="label" 
                      stroke="#8E9AA6" 
                      fontSize={10} 
                      tickLine={false} 
                      axisLine={false} 
                    />
                    <YAxis 
                      stroke="#8E9AA6" 
                      fontSize={10} 
                      tickLine={false} 
                      axisLine={false} 
                      tickFormatter={(value) => `${value}h`}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#131920', borderColor: '#2E3843', borderRadius: '12px' }}
                      labelStyle={{ color: '#E2E8F0', fontWeight: 'bold', fontSize: '11px', fontFamily: 'monospace' }}
                      itemStyle={{ color: '#E5A93C', fontSize: '11px' }}
                      formatter={(value) => [`${value} horas`, 'Carga Horária']}
                    />
                    <Bar 
                      dataKey="Horas" 
                      fill="#C28C28" 
                      radius={[6, 6, 0, 0]} 
                      maxBarSize={35}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6" id="escala-screen-container">
      {/* HEADER / TOOLBAR */}
      <div className="bg-bg-surface-low border border-outline-variant/60 rounded-3xl p-6 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-4" id="escala-toolbar">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-primary/10 rounded-xl flex items-center justify-center border border-brand-primary/20">
            <CalendarDays className="text-brand-primary" size={20} />
          </div>
          <div>
            <h2 className="text-sm font-black text-white uppercase tracking-wider font-display">Controle de Escala</h2>
          </div>
        </div>

        {/* Month/Year Selector & Search input */}
        <div className="flex flex-col sm:flex-row items-center gap-3" id="escala-month-controls">
          {/* Arrow Navigator */}
          <div className="flex items-center justify-between md:justify-center gap-3 bg-bg-surface-med border border-outline-variant/30 rounded-2xl p-1.5 min-w-[240px]">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-text-muted hover:text-white hover:bg-white/5 transition-all cursor-pointer"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="text-xs font-black tracking-widest text-white uppercase font-display select-none">
              {viewMode === 'year' ? `${currentYear}` : `${MONTHS_PT[currentMonth - 1]} de ${currentYear}`}
            </span>
            <button
              type="button"
              onClick={handleNextMonth}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-text-muted hover:text-white hover:bg-white/5 transition-all cursor-pointer"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Typeable Input */}
          <div className="relative w-full sm:w-36" id="escala-search-wrapper">
            <input
              type="text"
              placeholder={viewMode === 'year' ? 'AAAA' : 'MM/AAAA'}
              value={searchQuery}
              onChange={e => handleSearchChange(e.target.value)}
              className="bg-bg-surface-med border border-outline-variant/30 rounded-2xl pl-9 pr-3 py-3 text-xs font-bold text-white placeholder:text-text-muted/60 focus:outline-none focus:border-brand-primary w-full text-center tracking-widest font-mono"
              maxLength={viewMode === 'year' ? 4 : 7}
              id="escala-search-input"
            />
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
          </div>
        </div>

        {/* YEAR VIEW TOGGLE BUTTON (Placed where Add Turno was) */}
        <button
          type="button"
          onClick={() => setViewMode(prev => prev === 'month' ? 'year' : 'month')}
          className={`border text-xs font-black tracking-widest uppercase font-display px-6 py-3 rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
            viewMode === 'year'
              ? 'bg-brand-primary text-black border-brand-primary shadow-lg shadow-brand-primary/20 font-bold'
              : 'bg-brand-primary/10 border-brand-primary/30 text-brand-primary hover:bg-brand-primary/20 gold-glow'
          }`}
          id="btn-toggle-year-view"
        >
          <CalendarDays size={16} />
          {viewMode === 'month' ? 'ANO' : 'MÊS'}
        </button>
      </div>

      {/* CALENDAR OR YEAR VIEW CONTENT */}
      {viewMode === 'month' ? (
        /* MONTH CALENDAR GRID */
        <div className="bg-bg-surface-low border border-outline-variant/60 rounded-3xl md:p-6 p-2 shadow-xl md:space-y-4 space-y-2 overflow-x-auto md:overflow-x-auto overflow-x-hidden" id="escala-calendar-grid">
          <div className="md:min-w-[700px] min-w-0 w-full md:space-y-2 space-y-1">
            {/* Grid Headers */}
            <div className="grid grid-cols-7 md:gap-2 gap-1">
              {weekdayLabels.map((lbl, idx) => {
                const isWeekend = idx === 0 || idx === 6;
                return (
                  <div
                    key={lbl}
                    className={`text-center md:py-2.5 py-1 text-[8px] md:text-[10px] font-black tracking-widest uppercase font-display rounded-lg md:rounded-xl ${
                      isWeekend ? 'text-brand-primary bg-brand-primary/5' : 'text-text-muted'
                    }`}
                  >
                    {lbl}
                  </div>
                );
              })}
            </div>

            {/* Grid Rows */}
            <div className="md:space-y-2 space-y-1">
              {weeks.map((week, weekIdx) => (
                <div key={weekIdx} className="grid grid-cols-7 md:gap-2 gap-1">
                  {week.map((cell, cellIdx) => {
                    const dayData = escalaDays.find(d => d.dateStr === cell.dateStr);
                    const cellTurnos = dayData ? dayData.turnos : [];
                    
                    const isSelectable = cell.isCurrentMonth;
                    const borderClass = activeTool && isSelectable ? 'hover:border-brand-primary/60' : '';

                    return (
                      <div
                        key={cellIdx}
                        onClick={() => isSelectable && handleCellClick(cell.dateStr)}
                        className={`md:min-h-[90px] min-h-[48px] md:rounded-2xl rounded-xl border bg-bg-surface-med/50 transition-all relative overflow-hidden flex flex-col ${
                          isSelectable ? 'border-outline-variant/30 cursor-pointer' : 'border-outline-variant/10 opacity-30 select-none'
                        } ${borderClass}`}
                      >
                        {/* Day number (top right) */}
                        <span className={`absolute md:top-1.5 md:right-2 top-0.5 right-1 z-10 text-[7.5px] md:text-[10px] font-mono font-bold px-0.5 md:px-1.5 py-0 md:py-0.5 rounded ${
                          cellTurnos.length > 0 ? 'bg-black/60 text-white' : 'text-text-muted'
                        }`}>
                          {cell.dayNum}
                        </span>

                        {/* Cell Content depending on Turnos - LEGEND ONLY AS REQUESTED */}
                        {cellTurnos.length === 0 ? (
                          <div className="flex-1 flex items-center justify-center p-1 md:p-2 text-text-muted/10 group hover:text-brand-primary/30">
                            {isSelectable && activeTool && (
                              <span className="text-[7px] md:text-[9px] font-black uppercase tracking-wider font-display opacity-0 group-hover:opacity-100 transition-opacity">
                                Pintar
                              </span>
                            )}
                          </div>
                        ) : cellTurnos.length === 1 ? (
                          (() => {
                            const t = turnos.find(x => x.id === cellTurnos[0]);
                            if (!t) return null;
                            const c = SHIFT_COLORS.find(col => col.id === t.cor) || SHIFT_COLORS[0];
                            return (
                              <div className={`flex-1 flex flex-col items-center justify-center p-0.5 md:p-2 text-center ${c.bg}`}>
                                <span className={`md:w-8 md:h-8 w-5 h-5 rounded-full ${c.badge} flex items-center justify-center text-[8px] md:text-xs font-black tracking-wider uppercase font-mono shadow-md`}>
                                  {t.legenda}
                                </span>
                              </div>
                            );
                          })()
                        ) : (
                          /* Horizontal Split (2 turnos) - LEGENDS ONLY */
                          <div className="flex-1 flex flex-col h-full animate-fade-in justify-center">
                            {cellTurnos.map((tid, idx) => {
                              const t = turnos.find(x => x.id === tid);
                              if (!t) return null;
                              const c = SHIFT_COLORS.find(col => col.id === t.cor) || SHIFT_COLORS[0];
                              return (
                                <div
                                  key={idx}
                                  className={`flex-1 flex items-center justify-center ${c.bg} border-b last:border-b-0 border-outline-variant/10 py-0.5`}
                                >
                                  <span className={`md:w-6 md:h-6 w-3.5 h-3.5 rounded-full ${c.badge} flex items-center justify-center text-[7px] md:text-[10px] font-black tracking-wider uppercase font-mono shadow-sm`}>
                                    {t.legenda}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* YEARLY VIEW - 12 MINI CALENDARS IN GRID */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-fade-in" id="escala-yearly-grid">
          {MONTHS_PT.map((monthName, monthIdx) => {
            const monthNum = monthIdx + 1;
            const monthWeeks = generateMiniCalendarGrid(currentYear, monthNum);

            return (
              <div
                key={monthName}
                onClick={() => {
                  setCurrentMonth(monthNum);
                  setViewMode('month');
                  triggerToast(`Navegando para ${monthName} de ${currentYear}`);
                }}
                className="bg-bg-surface-low border border-outline-variant/30 hover:border-brand-primary/40 rounded-2xl p-4 shadow-md transition-all cursor-pointer group flex flex-col justify-between space-y-3"
              >
                {/* Month Name */}
                <div className="flex items-center justify-between border-b border-outline-variant/10 pb-1.5">
                  <span className="text-xs font-black tracking-wider text-white uppercase font-display group-hover:text-brand-primary transition-colors">
                    {monthName}
                  </span>
                  <span className="text-[8px] text-text-muted font-mono uppercase group-hover:opacity-100 opacity-0 transition-opacity">Abrir</span>
                </div>

                {/* Weekday indicator labels */}
                <div className="grid grid-cols-7 gap-1 text-center">
                  {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => (
                    <span key={i} className="text-[7px] font-black text-text-muted/50 uppercase">
                      {d}
                    </span>
                  ))}
                </div>

                {/* Mini Weeks Grid */}
                <div className="space-y-1">
                  {monthWeeks.map((week, wIdx) => (
                    <div key={wIdx} className="grid grid-cols-7 gap-1">
                      {week.map((cell, cIdx) => {
                        if (!cell.dayNum) {
                          return <div key={cIdx} className="aspect-square" />;
                        }

                        const dayData = escalaDays.find(d => d.dateStr === cell.dateStr);
                        const cellTurnos = dayData ? dayData.turnos : [];

                        let cellBgClass = 'bg-bg-surface-med/30 hover:bg-bg-surface-med/60 border border-outline-variant/10';
                        let textClass = 'text-text-muted';
                        let content = null;

                        if (cellTurnos.length === 1) {
                          const t = turnos.find(x => x.id === cellTurnos[0]);
                          const c = SHIFT_COLORS.find(col => col.id === (t?.cor || ''));
                          if (c) {
                            cellBgClass = `${c.badge} border-transparent`;
                            textClass = c.id === 'amber' || c.id === 'cyan' || c.id === 'emerald' ? 'text-black' : 'text-white';
                          }
                        } else if (cellTurnos.length >= 2) {
                          const t1 = turnos.find(x => x.id === cellTurnos[0]);
                          const t2 = turnos.find(x => x.id === cellTurnos[1]);
                          const c1 = SHIFT_COLORS.find(col => col.id === (t1?.cor || ''));
                          const c2 = SHIFT_COLORS.find(col => col.id === (t2?.cor || ''));
                          cellBgClass = 'border-transparent overflow-hidden';
                          textClass = 'text-white';
                          content = (
                            <div className="absolute inset-0 flex flex-col">
                              <div className={`flex-1 ${c1?.badge || 'bg-brand-primary'}`} />
                              <div className={`flex-1 ${c2?.badge || 'bg-purple-500'}`} />
                              <span className="absolute inset-0 flex items-center justify-center text-[7px] font-mono font-black text-white bg-black/30 drop-shadow-sm">
                                {cell.dayNum}
                              </span>
                            </div>
                          );
                        }

                        return (
                          <div
                            key={cIdx}
                            className={`aspect-square rounded-md text-[7px] font-mono font-bold flex items-center justify-center relative ${cellBgClass} transition-colors`}
                          >
                            {!content ? (
                              <span className={textClass}>{cell.dayNum}</span>
                            ) : (
                              content
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* SHIFT PANEL & PAINTBOX (Positioned below the calendar, with the Add button integrated inside) */}
      <div className="bg-bg-surface-low border border-outline-variant/60 rounded-3xl p-6 shadow-xl space-y-4" id="escala-paintbox">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-outline-variant/30 pb-3">
          <h3 className="text-[11px] font-black text-text-high uppercase tracking-widest font-display flex items-center gap-2">
            Turnos
          </h3>
          
          <div className="flex items-center gap-2" id="escala-search-and-hidden-toggle-container">
            {/* Toggle Hidden Button */}
            <button
              type="button"
              onClick={() => {
                setShowHiddenTurnos(prev => !prev);
                triggerToast(!showHiddenTurnos ? 'Exibindo todos os turnos (incluindo ocultos)' : 'Ocultando turnos inativos');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all text-[9px] font-black tracking-widest uppercase font-display cursor-pointer shrink-0 ${
                showHiddenTurnos
                  ? 'bg-brand-primary/20 border-brand-primary text-brand-primary font-bold'
                  : 'bg-bg-surface-med border-outline-variant/30 text-text-muted hover:text-text-high hover:border-outline-variant/60'
              }`}
              title="Exibir/Ocultar turnos ocultados"
            >
              {showHiddenTurnos ? <Eye size={12} /> : <EyeOff size={12} />}
              <span>{showHiddenTurnos ? 'Ocultos Visíveis' : 'Ver Ocultos'}</span>
            </button>

            {/* Search bar inside paintbox */}
            <div className="relative max-w-xs w-full sm:w-60" id="escala-turno-search-wrapper">
              <input
                type="text"
                placeholder="Buscar turno..."
                value={turnoSearchQuery}
                onChange={e => setTurnoSearchQuery(e.target.value)}
                className="bg-bg-surface-med border border-outline-variant/30 hover:border-outline-variant/50 focus:border-brand-primary focus:outline-none rounded-xl pl-8 pr-3 py-1.5 text-[10px] text-white placeholder:text-text-muted/60 w-full transition-all"
                id="escala-turno-search-input"
              />
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted" />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2.5 items-center">
          {/* Eraser Tool */}
          <button
            type="button"
            onClick={() => setActiveTool('eraser')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all text-[10px] font-black tracking-wider uppercase font-display cursor-pointer ${
              activeTool === 'eraser'
                ? 'bg-amber-500/20 border-amber-500 text-amber-400 font-bold'
                : 'bg-bg-surface-med border-outline-variant/30 text-text-muted hover:text-text-high hover:border-outline-variant/60'
            }`}
          >
            <Eraser size={14} />
            Borracha
          </button>

          {/* Filtered Turnos list */}
          {turnos
            .filter(turno => {
              if (turno.hidden && !showHiddenTurnos) return false;

              const query = turnoSearchQuery.toLowerCase().trim();
              if (!query) return true;
              return (
                turno.nome.toLowerCase().includes(query) ||
                turno.legenda.toLowerCase().includes(query) ||
                (turno.categoria || '').toLowerCase().includes(query)
              );
            })
            .map(turno => {
              const colorObj = SHIFT_COLORS.find(c => c.id === turno.cor) || SHIFT_COLORS[0];
              const isActive = activeTool === turno.id;
              const isHidden = !!turno.hidden;
              return (
                <div
                  key={turno.id}
                  onClick={() => setActiveTool(turno.id)}
                  className={`group flex items-center gap-3 pl-4 pr-2.5 py-2 rounded-xl border transition-all cursor-pointer relative ${
                    isActive
                      ? `${colorObj.bg} ${colorObj.border} ${colorObj.text} font-bold ring-1 ring-offset-2 ring-offset-bg-surface-low ring-brand-primary/20`
                      : isHidden
                        ? 'bg-bg-surface-med/30 border-outline-variant/10 text-text-muted/40 hover:border-outline-variant/20'
                        : 'bg-bg-surface-med border-outline-variant/30 text-text-muted hover:text-text-high hover:border-outline-variant/60'
                  }`}
                >
                  <div className={`flex flex-col text-left ${isHidden ? 'opacity-50' : ''}`}>
                    <span className="text-[10px] font-black tracking-wider uppercase font-display flex items-center gap-1.5">
                      <span className={`w-2.5 h-2.5 rounded-full ${colorObj.badge} flex items-center justify-center text-[7px] font-mono font-black ${isHidden ? 'opacity-60' : ''}`}>
                        {turno.legenda}
                      </span>
                      {turno.nome}
                      {isHidden && <span className="text-[7px] bg-bg-surface-high border border-outline-variant/20 px-1 rounded text-text-muted font-bold tracking-tight lowercase">oculto</span>}
                    </span>
                    <span className="text-[9px] text-text-muted font-mono">
                      {turno.categoria} • {turno.duracao}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 ml-2">
                    {/* Hide/Show Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleHideTurno(turno.id);
                      }}
                      className="w-6 h-6 rounded-lg flex items-center justify-center text-text-muted hover:text-brand-primary hover:bg-brand-primary/10 transition-all"
                      title={isHidden ? "Reexibir no seletor" : "Ocultar do seletor"}
                    >
                      {isHidden ? <Eye size={11} /> : <EyeOff size={11} />}
                    </button>

                    {/* Edit Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartEditTurno(turno);
                      }}
                      className="w-6 h-6 rounded-lg flex items-center justify-center text-text-muted hover:text-brand-primary hover:bg-brand-primary/10 transition-all"
                      title="Editar turno"
                    >
                      <Edit3 size={11} />
                    </button>

                    {/* Delete Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setTurnoToDelete(turno);
                      }}
                      className="w-6 h-6 rounded-lg flex items-center justify-center text-text-muted hover:text-red-400 hover:bg-red-500/10 transition-all"
                      title="Excluir este turno"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                </div>
              );
            })}

          {turnos.length > 0 && turnos.filter(turno => {
            if (turno.hidden && !showHiddenTurnos) return false;
            const query = turnoSearchQuery.toLowerCase().trim();
            if (!query) return true;
            return (
              turno.nome.toLowerCase().includes(query) ||
              turno.legenda.toLowerCase().includes(query) ||
              (turno.categoria || '').toLowerCase().includes(query)
            );
          }).length === 0 && (
            <span className="text-xs text-text-muted py-2">Nenhum turno corresponde à busca.</span>
          )}

          {turnos.length === 0 && (
            <span className="text-xs text-text-muted font-medium py-2">Nenhum turno cadastrado.</span>
          )}

          {/* ADD TURNO BUTTON (Moved inside the turnos box as requested) */}
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-brand-primary/30 bg-brand-primary/5 text-brand-primary hover:bg-brand-primary/10 transition-all text-[10px] font-black tracking-wider uppercase font-display cursor-pointer"
            id="btn-add-turno-inline"
          >
            <Plus size={14} />
            Novo Turno
          </button>
        </div>
      </div>

      {/* STATISTICS AND TOTAL CARGA HORARIA */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Carga Horária Card */}
        <div className="bg-bg-surface-low border border-outline-variant/60 rounded-3xl p-6 shadow-xl flex flex-col justify-between space-y-4">
          <div className="flex items-center gap-2">
            <Info className="text-brand-primary" size={16} />
            <h4 className="text-[11px] font-black text-text-high uppercase tracking-widest font-display">CARGA HORÁRIA</h4>
          </div>
          <div>
            <span className="text-3xl font-black text-brand-primary font-mono">{formattedTotalHours}</span>
          </div>
          <button
            type="button"
            onClick={() => setIsResumoOpen(true)}
            className="w-full py-2.5 rounded-2xl bg-brand-primary/10 border border-brand-primary/30 hover:bg-brand-primary/20 text-brand-primary text-[10px] font-black tracking-widest uppercase font-display transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm mt-1"
            id="btn-open-resumo"
          >
            <BarChart4 size={12} strokeWidth={2.5} /> Ver Resumo Geral
          </button>
        </div>

        {/* Shift Frequencies Card */}
        <div className="bg-bg-surface-low border border-outline-variant/60 rounded-3xl p-6 shadow-xl md:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-outline-variant/10 pb-3">
            <h4 className="text-[11px] font-black text-text-high uppercase tracking-widest font-display">Frequência por Turno</h4>
            <span className="text-[9px] text-text-muted font-mono uppercase tracking-widest">
              {viewMode === 'year' ? `Resumo ${currentYear}` : 'Resumo Mensal'}
            </span>
          </div>

          <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
            {(() => {
              const assignedTurnos = turnos.filter(turno => (shiftCounts[turno.id] || 0) > 0);

              if (assignedTurnos.length === 0) {
                return (
                  <div className="py-8 text-center text-xs text-text-muted flex flex-col items-center justify-center gap-1.5">
                    <span className="text-lg">📅</span>
                    <span>Nenhum turno atribuído neste período.</span>
                  </div>
                );
              }

              return assignedTurnos.map(turno => {
                const count = shiftCounts[turno.id] || 0;
                const colorObj = SHIFT_COLORS.find(c => c.id === turno.cor) || SHIFT_COLORS[0];
                
                // Calculate total workload for this shift
                const [h, m] = turno.duracao.split(':').map(Number);
                const shiftMinutes = (h * 60 + m) * count;
                const shiftHours = Math.floor(shiftMinutes / 60);
                const shiftMinsLeft = shiftMinutes % 60;
                const formattedShiftHours = `${shiftHours}h${shiftMinsLeft > 0 ? ` ${shiftMinsLeft}m` : ''}`;

                return (
                  <div 
                    key={turno.id} 
                    className="bg-bg-surface-med/40 hover:bg-bg-surface-med/60 border border-outline-variant/15 hover:border-outline-variant/30 rounded-2xl px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 transition-all"
                  >
                    {/* Left: Badge + Name */}
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={`w-8 h-8 rounded-full ${colorObj.badge} flex items-center justify-center text-xs font-mono font-black shadow-sm shrink-0`}>
                        {turno.legenda}
                      </span>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-black text-text-high uppercase truncate max-w-[200px] sm:max-w-xs font-sans" title={turno.nome}>
                          {turno.nome}
                        </span>
                        <span className="text-[10px] text-text-muted font-mono">
                          {turno.categoria} • {turno.duracao}/escala
                        </span>
                      </div>
                    </div>

                    {/* Right: Assignments and Hours */}
                    <div className="flex items-center gap-4 sm:gap-6 justify-between sm:justify-end sm:text-right w-full sm:w-auto border-t sm:border-t-0 border-outline-variant/10 pt-2 sm:pt-0">
                      <div className="flex flex-col text-left sm:text-right">
                        <span className="text-sm font-black text-white font-mono">{count}x</span>
                        <span className="text-[8px] text-text-muted font-bold uppercase tracking-wider">Vezes Atribuído</span>
                      </div>
                      <div className="flex flex-col border-l border-outline-variant/20 pl-4 min-w-[70px] text-right">
                        <span className="text-sm font-black text-brand-primary font-mono">{formattedShiftHours}</span>
                        <span className="text-[8px] text-text-muted font-bold uppercase tracking-wider">Carga Horária</span>
                      </div>
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </div>
      </div>

      {/* POPUP / MODAL PARA CRIAR/EDITAR TURNO */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in" id="modal-create-turno-backdrop">
          <div className="bg-bg-surface-low border border-outline-variant/60 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-6" id="modal-create-turno-container">
            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
              <div className="flex items-center gap-2">
                <CalendarDays className="text-brand-primary" size={18} />
                <h3 className="text-sm font-black text-white uppercase tracking-wider font-display">
                  {turnoToEdit ? 'Editar Turno' : 'Cadastrar Novo Turno'}
                </h3>
              </div>
              <button
                type="button"
                onClick={handleCloseCreateModal}
                className="w-8 h-8 rounded-full flex items-center justify-center text-text-muted hover:text-white hover:bg-white/5 transition-all cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTurno} className="space-y-4" id="form-create-turno">
              {/* Turno Name */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase text-text-muted tracking-wider block font-display">Nome do Turno</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Manhã Supervisor, Serviço 24h, Apoio Noturno"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full bg-bg-surface-med border border-outline-variant/30 hover:border-outline-variant/50 focus:border-brand-primary focus:outline-none rounded-xl px-4 py-3 text-xs font-sans text-text-high placeholder:text-text-muted transition-all"
                  id="input-turno-nome"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Legenda */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase text-text-muted tracking-wider block font-display">Legenda (Max 3 letras)</label>
                  <input
                    type="text"
                    required
                    maxLength={3}
                    placeholder="Ex: MS, SV, TO"
                    value={legenda}
                    onChange={(e) => setLegenda(e.target.value.toUpperCase())}
                    className="w-full bg-bg-surface-med border border-outline-variant/30 hover:border-outline-variant/50 focus:border-brand-primary focus:outline-none rounded-xl px-4 py-3 text-xs font-mono text-text-high placeholder:text-text-muted transition-all uppercase text-center"
                    id="input-turno-legenda"
                  />
                </div>

                {/* Duration */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase text-text-muted tracking-wider block font-display">Duração (HH:MM)</label>
                  <input
                    type="text"
                    required
                    placeholder="08:00"
                    value={duracao}
                    onChange={handleDuracaoChange}
                    className="w-full bg-bg-surface-med border border-outline-variant/30 hover:border-outline-variant/50 focus:border-brand-primary focus:outline-none rounded-xl px-4 py-3 text-xs font-mono text-text-high placeholder:text-text-muted transition-all text-center"
                    id="input-turno-duracao"
                  />
                </div>
              </div>

              {/* Category (Text input as requested instead of closed select) */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase text-text-muted tracking-wider block font-display">Categoria</label>
                <input
                  type="text"
                  placeholder="Ex: Manhã, Tarde, Serviço, Plantão, etc."
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value)}
                  className="w-full bg-bg-surface-med border border-outline-variant/30 hover:border-outline-variant/50 focus:border-brand-primary focus:outline-none rounded-xl px-4 py-3 text-xs font-sans text-text-high placeholder:text-text-muted transition-all"
                  id="input-turno-categoria"
                />
              </div>

              {/* Color picker (8 circles) */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase text-text-muted tracking-wider block font-display">Cor do Turno</label>
                <div className="flex flex-wrap gap-3 justify-center py-2 bg-bg-surface-med/50 border border-outline-variant/10 rounded-2xl" id="color-options-container">
                  {SHIFT_COLORS.map(c => {
                    const isSelected = selectedColor === c.id;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setSelectedColor(c.id)}
                        className={`w-8 h-8 rounded-full ${c.badge} border-2 flex items-center justify-center transition-all scale-105 hover:scale-115 cursor-pointer relative ${
                          isSelected ? 'border-white scale-120 ring-2 ring-brand-primary/40' : 'border-transparent'
                        }`}
                        title={c.name}
                      >
                        {isSelected && <span className="text-[10px]">✓</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCloseCreateModal}
                  className="bg-bg-surface-med hover:bg-bg-surface-high border border-outline-variant/20 text-text-muted hover:text-white px-5 py-3 rounded-2xl text-xs font-black tracking-widest uppercase font-display transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-brand-primary/10 border border-brand-primary/30 text-brand-primary hover:bg-brand-primary/20 px-5 py-3 rounded-2xl text-xs font-black tracking-widest uppercase font-display transition-all gold-glow cursor-pointer"
                >
                  {turnoToEdit ? 'Atualizar Turno' : 'Salvar Turno'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {turnoToDelete && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in" id="modal-delete-turno-backdrop">
          <div className="bg-bg-surface-low border border-outline-variant/60 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-5" id="modal-delete-turno-container">
            <div className="flex items-center gap-3 border-b border-outline-variant/20 pb-3">
              <div className="w-9 h-9 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 shrink-0">
                <Trash2 size={18} />
              </div>
              <div>
                <h3 className="text-xs font-black text-white uppercase tracking-wider font-display">Confirmar Exclusão</h3>
                <p className="text-[10px] text-text-muted font-sans">Esta ação não pode ser desfeita.</p>
              </div>
            </div>

            <p className="text-xs text-text-muted leading-relaxed font-sans">
              Tem certeza que deseja excluir o turno <span className="text-white font-bold">{turnoToDelete.nome}</span> ({turnoToDelete.legenda})? 
              Ele será removido permanentemente de todas as escalas e dias em que foi lançado.
            </p>

            <div className="flex justify-end gap-3 pt-1">
              <button
                type="button"
                onClick={() => setTurnoToDelete(null)}
                className="bg-bg-surface-med hover:bg-bg-surface-high border border-outline-variant/20 text-text-muted hover:text-white px-4 py-2.5 rounded-xl text-[10px] font-black tracking-wider uppercase font-display transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  handleDeleteTurno(turnoToDelete.id);
                  setTurnoToDelete(null);
                }}
                className="bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 px-4 py-2.5 rounded-xl text-[10px] font-black tracking-wider uppercase font-display transition-all cursor-pointer"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
