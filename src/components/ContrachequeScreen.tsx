import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Trash2, 
  Edit3, 
  ArrowRight, 
  Check, 
  X, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Search,
  FileText,
  ArrowLeft,
  Calendar,
  ClipboardList,
  AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ContrachequeEntry } from '../types';

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const getSubsequentMonth = (): string => {
  const today = new Date();
  let year = today.getFullYear();
  let month = today.getMonth() + 2; // subsequent month (+1 because 0-indexed, +1 because next)
  if (month > 12) {
    month = month - 12;
    year += 1;
  }
  const monthFormatted = month < 10 ? `0${month}` : `${month}`;
  return `${year}-${monthFormatted}`;
};

interface ContrachequeScreenProps {
  contrachequeEntries: ContrachequeEntry[];
  setContrachequeEntries: React.Dispatch<React.SetStateAction<ContrachequeEntry[]>>;
  triggerToast: (msg: string) => void;
  currentMonth?: string;
  setCurrentMonth?: (val: string) => void;
  isResumoView?: boolean;
  setIsResumoView?: (val: boolean) => void;
  searchQuery?: string;
  setSearchQuery?: (val: string) => void;
}

export default function ContrachequeScreen({
  contrachequeEntries,
  setContrachequeEntries,
  triggerToast,
  currentMonth: propsCurrentMonth,
  setCurrentMonth: propsSetCurrentMonth,
  isResumoView: propsIsResumoView,
  setIsResumoView: propsSetIsResumoView,
  searchQuery: propsSearchQuery,
  setSearchQuery: propsSetSearchQuery,
}: ContrachequeScreenProps) {
  const [internalCurrentMonth, setInternalCurrentMonth] = useState<string>(getSubsequentMonth());
  const [internalIsResumoView, setInternalIsResumoView] = useState(false);
  const [internalSearchQuery, setInternalSearchQuery] = useState('');
  const [resumoSearchQuery, setResumoSearchQuery] = useState('');

  const currentMonth = propsCurrentMonth !== undefined ? propsCurrentMonth : internalCurrentMonth;
  const setCurrentMonth = propsSetCurrentMonth !== undefined ? propsSetCurrentMonth : setInternalCurrentMonth;
  const isResumoView = propsIsResumoView !== undefined ? propsIsResumoView : internalIsResumoView;
  const setIsResumoView = propsSetIsResumoView !== undefined ? propsSetIsResumoView : setInternalIsResumoView;
  const searchQuery = propsSearchQuery !== undefined ? propsSearchQuery : internalSearchQuery;
  const setSearchQuery = propsSetSearchQuery !== undefined ? propsSetSearchQuery : setInternalSearchQuery;

  // Handle month/year search (MM/AAAA)
  const handleSearchChange = (val: string) => {
    // Only allow numbers and slash
    let clean = val.replace(/[^\d/]/g, '');
    
    // Auto-insert slash after 2 digits
    if (clean.length > 2 && !clean.includes('/')) {
      clean = clean.slice(0, 2) + '/' + clean.slice(2);
    }
    
    // Limit length to 7
    clean = clean.slice(0, 7);
    
    setSearchQuery(clean);

    // If length is exactly 7, parse and update month
    if (clean.length === 7) {
      const match = clean.match(/^(\d{2})\/(\d{4})$/);
      if (match) {
        const m = parseInt(match[1], 10);
        const y = parseInt(match[2], 10);
        if (m >= 1 && m <= 12 && y >= 1900 && y <= 2100) {
          const monthFormatted = m < 10 ? `0${m}` : `${m}`;
          const targetMonth = `${y}-${monthFormatted}`;
          setCurrentMonth(targetMonth);
          triggerToast(`Mês ${clean} exibido no início!`);
        } else {
          triggerToast('Mês inválido (01 a 12).');
        }
      }
    }
  };

  // Group entries by name (case-insensitive) and type for Resumo view
  const getGroupedSummaryData = () => {
    const groups: {
      [key: string]: {
        name: string;
        type: 'receita' | 'despesa';
        totalAmount: number;
        totalAdiantado: number;
        totalAtrasado: number;
        occurrences: { month: string; amount: number; isAdiantado: boolean; isAtrasado: boolean }[];
      }
    } = {};

    let grandTotalReceita = 0;
    let grandTotalDespesa = 0;
    let grandTotalAdiantado = 0;
    let grandTotalAtrasado = 0;

    contrachequeEntries.forEach(entry => {
      const key = `${entry.type}-${entry.name.trim().toLowerCase()}`;
      
      if (entry.type === 'receita') {
        grandTotalReceita += entry.amount;
      } else {
        grandTotalDespesa += entry.amount;
      }

      if (entry.isAdiantado) grandTotalAdiantado += entry.amount;
      if (entry.isAtrasado) grandTotalAtrasado += entry.amount;

      if (!groups[key]) {
        groups[key] = {
          name: entry.name.trim(),
          type: entry.type,
          totalAmount: 0,
          totalAdiantado: 0,
          totalAtrasado: 0,
          occurrences: []
        };
      }

      groups[key].totalAmount += entry.amount;
      if (entry.isAdiantado) groups[key].totalAdiantado += entry.amount;
      if (entry.isAtrasado) groups[key].totalAtrasado += entry.amount;
      groups[key].occurrences.push({
        month: entry.month,
        amount: entry.amount,
        isAdiantado: !!entry.isAdiantado,
        isAtrasado: !!entry.isAtrasado
      });
    });

    const items = Object.values(groups).sort((a, b) => b.totalAmount - a.totalAmount);

    return {
      items,
      grandTotalReceita,
      grandTotalDespesa,
      grandTotalAdiantado,
      grandTotalAtrasado,
      grandTotalLiquido: grandTotalReceita - grandTotalDespesa
    };
  };

  // Navigation helpers
  const getPrevMonth = (monthStr: string): string => {
    const [yearStr, monthNumStr] = monthStr.split('-');
    let year = parseInt(yearStr, 10);
    let month = parseInt(monthNumStr, 10);
    month -= 1;
    if (month < 1) {
      month = 12;
      year -= 1;
    }
    const monthFormatted = month < 10 ? `0${month}` : `${month}`;
    return `${year}-${monthFormatted}`;
  };

  const getNextMonth = (monthStr: string): string => {
    const [yearStr, monthNumStr] = monthStr.split('-');
    let year = parseInt(yearStr, 10);
    let month = parseInt(monthNumStr, 10);
    month += 1;
    if (month > 12) {
      month = 1;
      year += 1;
    }
    const monthFormatted = month < 10 ? `0${month}` : `${month}`;
    return `${year}-${monthFormatted}`;
  };

  const formatMonthName = (monthStr: string): string => {
    const [yearStr, monthNumStr] = monthStr.split('-');
    const monthIdx = parseInt(monthNumStr, 10) - 1;
    const monthName = MONTH_NAMES[monthIdx] || '';
    return `${monthName} de ${yearStr}`;
  };

  const handlePrevMonth = () => {
    setCurrentMonth(prev => getPrevMonth(prev));
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => getNextMonth(prev));
  };

  // Automatic Cents Formatting for inputs
  const handleAutomaticCentsInput = (val: string, setter: (s: string) => void) => {
    const digits = val.replace(/\D/g, '');
    if (!digits) {
      setter('');
      return;
    }
    if (digits.length < 3) {
      const parsedNum = parseInt(digits, 10);
      setter(isNaN(parsedNum) ? '' : String(parsedNum));
    } else {
      const cents = digits.slice(-2);
      const whole = digits.slice(0, -2);
      const parsedWhole = parseInt(whole, 10);
      const formattedWhole = isNaN(parsedWhole) ? '0' : String(parsedWhole);
      setter(`${formattedWhole},${cents}`);
    }
  };

  const parseFormattedAmount = (str: string): number => {
    if (!str) return 0;
    const cleanStr = str.replace(',', '.');
    const parsed = parseFloat(cleanStr);
    if (isNaN(parsed)) return 0;
    return parsed;
  };

  const formatBRL = (value: number) => {
    const isNegative = value < 0;
    const absValue = Math.abs(value);
    const formatted = absValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return isNegative ? `- R$ ${formatted}` : `R$ ${formatted}`;
  };

  // Calculations per month
  const getMonthCalculations = (monthStr: string) => {
    const monthlyEntries = contrachequeEntries.filter(entry => entry.month === monthStr);
    const totalIncomes = monthlyEntries.filter(e => e.type === 'receita').reduce((sum, e) => sum + e.amount, 0);
    const totalExpenses = monthlyEntries.filter(e => e.type === 'despesa').reduce((sum, e) => sum + e.amount, 0);
    const totalLiquido = totalIncomes - totalExpenses;

    const receitas = monthlyEntries.filter(e => e.type === 'receita');
    const despesas = monthlyEntries.filter(e => e.type === 'despesa');

    return {
      monthlyEntries,
      totalIncomes,
      totalExpenses,
      totalLiquido,
      receitas,
      despesas
    };
  };

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);

  // Modal fields
  const [modalMonth, setModalMonth] = useState('');
  const [launchName, setLaunchName] = useState('');
  const [launchAmountStr, setLaunchAmountStr] = useState('');
  const [launchType, setLaunchType] = useState<'receita' | 'despesa'>('receita');
  const [isAdiantado, setIsAdiantado] = useState(false);
  const [isAtrasado, setIsAtrasado] = useState(false);

  // Trigger modal for creation
  const handleOpenCreate = (type: 'receita' | 'despesa', targetMonth: string) => {
    setModalMode('create');
    setModalMonth(targetMonth);
    setLaunchType(type);
    setLaunchName('');
    setLaunchAmountStr('');
    setIsAdiantado(false);
    setIsAtrasado(false);
    setEditingEntryId(null);
    setIsModalOpen(true);
  };

  // Trigger modal for editing
  const handleOpenEdit = (entry: ContrachequeEntry) => {
    setModalMode('edit');
    setEditingEntryId(entry.id);
    setModalMonth(entry.month);
    setLaunchType(entry.type);
    setLaunchName(entry.name);
    setIsAdiantado(!!entry.isAdiantado);
    setIsAtrasado(!!entry.isAtrasado);
    const centsValue = (entry.amount * 100).toFixed(0);
    handleAutomaticCentsInput(centsValue, setLaunchAmountStr);
    setIsModalOpen(true);
  };

  const handleSaveLaunch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!launchName.trim()) {
      triggerToast('Informe o nome do lançamento.');
      return;
    }
    const val = parseFormattedAmount(launchAmountStr);
    if (val <= 0) {
      triggerToast('Informe um valor válido maior que zero.');
      return;
    }

    if (modalMode === 'create') {
      const newEntry: ContrachequeEntry = {
        id: 'contracheque-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
        name: launchName.trim(),
        amount: val,
        month: modalMonth,
        type: launchType,
        isAdiantado,
        isAtrasado
      };
      setContrachequeEntries(prev => [...prev, newEntry]);
      triggerToast('Lançamento adicionado com sucesso!');
    } else if (modalMode === 'edit' && editingEntryId) {
      setContrachequeEntries(prev => prev.map(entry => {
        if (entry.id === editingEntryId) {
          return {
            ...entry,
            name: launchName.trim(),
            amount: val,
            type: launchType,
            isAdiantado,
            isAtrasado
          };
        }
        return entry;
      }));
      triggerToast('Lançamento atualizado!');
    }
    setIsModalOpen(false);
  };

  const handleDeleteEntry = (id: string) => {
    setContrachequeEntries(prev => prev.filter(entry => entry.id !== id));
    triggerToast('Lançamento excluído.');
  };

  // Replication logic
  const handleReplicateSingleEntry = (entry: ContrachequeEntry) => {
    const nextMonth = getNextMonth(entry.month);
    const duplicated: ContrachequeEntry = {
      ...entry,
      id: 'contracheque-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      month: nextMonth
    };
    setContrachequeEntries(prev => [...prev, duplicated]);
    triggerToast(`"${entry.name}" replicado para ${formatMonthName(nextMonth)}!`);
  };

  const handleReplicateCategory = (type: 'receita' | 'despesa', fromMonth: string) => {
    const targetEntries = contrachequeEntries.filter(entry => entry.month === fromMonth && entry.type === type);
    if (targetEntries.length === 0) {
      triggerToast('Nenhum lançamento nesta categoria para replicar.');
      return;
    }

    const nextMonth = getNextMonth(fromMonth);
    const duplicated: ContrachequeEntry[] = targetEntries.map(entry => ({
      ...entry,
      id: 'contracheque-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4) + '-' + Math.random().toString(36).substr(2, 4),
      month: nextMonth
    }));

    setContrachequeEntries(prev => [...prev, ...duplicated]);
    const catName = type === 'receita' ? 'Receitas' : 'Despesas';
    triggerToast(`${catName} replicadas para ${formatMonthName(nextMonth)} (${targetEntries.length} itens)!`);
  };

  const renderMonthColumn = (monthStr: string, isDesktop: boolean = false) => {
    const {
      totalIncomes,
      totalExpenses,
      totalLiquido,
      receitas,
      despesas
    } = getMonthCalculations(monthStr);

    const columnContent = (
      <>
        {/* Month Title Header */}
        {isDesktop && (
          <div className="flex items-center justify-between bg-bg-surface-low border border-outline-variant/50 rounded-2xl p-4 shadow-sm" id={`contracheque-month-header-${monthStr}`}>
            <span className="text-xs font-black uppercase tracking-widest text-brand-primary font-display">
              {formatMonthName(monthStr)}
            </span>
          </div>
        )}

        {/* 3 Summary cards (RECEITA, DESPESA, LÍQUIDO) - NOT EDITABLE */}
        <div className="grid grid-cols-3 gap-2.5" id={`contracheque-summary-grid-${monthStr}`}>
          {/* RECEITA CARD */}
          <div className="bg-bg-surface-low border border-outline-variant/40 rounded-xl p-3 flex flex-col justify-between" id={`contracheque-summary-income-${monthStr}`}>
            <span className="text-[9px] uppercase tracking-wider text-text-muted font-bold flex items-center gap-1">
              <TrendingUp size={10} className="text-emerald-400" />
              RECEITA
            </span>
            <span className="text-xs font-black font-mono tracking-tight truncate mt-1 text-emerald-400">
              {formatBRL(totalIncomes)}
            </span>
          </div>

          {/* DESPESA CARD */}
          <div className="bg-bg-surface-low border border-outline-variant/40 rounded-xl p-3 flex flex-col justify-between" id={`contracheque-summary-expense-${monthStr}`}>
            <span className="text-[9px] uppercase tracking-wider text-text-muted font-bold flex items-center gap-1">
              <TrendingDown size={10} className="text-rose-400" />
              DESPESA
            </span>
            <span className="text-xs font-black font-mono tracking-tight truncate mt-1 text-rose-400">
              {formatBRL(totalExpenses)}
            </span>
          </div>

          {/* LÍQUIDO CARD */}
          <div className="bg-bg-surface-low border border-outline-variant/40 rounded-xl p-3 flex flex-col justify-between" id={`contracheque-summary-liquido-${monthStr}`}>
            <span className="text-[9px] uppercase tracking-wider text-text-muted font-bold flex items-center gap-1">
              <DollarSign size={10} className="text-white/80" />
              LÍQUIDO
            </span>
            <span className={`text-xs font-black font-mono tracking-tight truncate mt-1 ${totalLiquido >= 0 ? 'text-green-400' : 'text-rose-400'}`}>
              {formatBRL(totalLiquido)}
            </span>
          </div>
        </div>

        {/* CATEGORY 1: RECEITA */}
        <div className="bg-bg-surface-low border border-outline-variant/50 rounded-2xl p-4 shadow-sm space-y-4" id={`contracheque-receita-box-${monthStr}`}>
          <div className="flex items-center justify-between pb-3 border-b border-outline-variant/30">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded bg-emerald-400" />
              <h3 className="text-xs font-black uppercase tracking-widest text-white">RECEITA</h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-emerald-400 font-bold">
                {formatBRL(totalIncomes)}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleOpenCreate('receita', monthStr)}
                className="p-1 rounded bg-brand-primary/10 hover:bg-brand-primary/20 text-brand-primary border border-brand-primary/20 transition-all cursor-pointer flex items-center gap-0.5 text-[9px] font-bold uppercase tracking-wider px-1.5"
                id={`btn-add-receita-${monthStr}`}
              >
                <Plus size={11} />
                <span>Novo</span>
              </button>

              <button
                onClick={() => handleReplicateCategory('receita', monthStr)}
                className="p-1.5 rounded bg-white/5 border border-white/10 text-text-muted hover:text-white hover:border-white/30 transition-all cursor-pointer flex items-center justify-center"
                title="Replicar todas as receitas para o mês seguinte"
                id={`btn-replicate-receitas-${monthStr}`}
              >
                <ArrowRight size={12} />
              </button>
            </div>
          </div>

          {/* List of Incomes */}
          <div className="space-y-1.5">
            {receitas.length === 0 ? (
              <p className="text-[10px] text-text-muted italic opacity-60 pl-1">Nenhuma receita lançada.</p>
            ) : (
              receitas.map(entry => (
                <div 
                  key={entry.id} 
                  className="flex items-center justify-between bg-black/25 hover:bg-black/40 border border-white/5 rounded-lg p-2 transition-colors"
                  id={`contracheque-entry-${entry.id}`}
                >
                  <div className="flex flex-col pl-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-medium text-white/90">
                        {entry.name}
                      </span>
                      {entry.isAdiantado && (
                        <span className="px-1.5 py-0.5 text-[9px] font-black font-display bg-emerald-500/10 border border-emerald-500/35 text-emerald-400 rounded uppercase tracking-wider">
                          AD
                        </span>
                      )}
                      {entry.isAtrasado && (
                        <span className="px-1.5 py-0.5 text-[9px] font-black font-display bg-amber-500/10 border border-amber-500/35 text-amber-500 rounded uppercase tracking-wider">
                          AT
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-mono font-semibold text-emerald-400">
                      R$ {entry.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(entry)}
                        className="text-text-muted hover:text-brand-primary p-1 rounded hover:bg-white/5 transition-colors"
                        title="Editar"
                        id={`btn-edit-entry-${entry.id}`}
                      >
                        <Edit3 size={11} />
                      </button>
                      <button
                        onClick={() => handleDeleteEntry(entry.id)}
                        className="text-text-muted hover:text-rose-400 p-1 rounded hover:bg-white/5 transition-colors"
                        title="Excluir"
                        id={`btn-delete-entry-${entry.id}`}
                      >
                        <Trash2 size={11} />
                      </button>
                      <button
                        onClick={() => handleReplicateSingleEntry(entry)}
                        className="text-text-muted hover:text-white p-1 rounded hover:bg-white/5 transition-colors"
                        title="Replicar para o mês seguinte"
                        id={`btn-replicate-entry-${entry.id}`}
                      >
                        <ArrowRight size={11} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* CATEGORY 2: DESPESA */}
        <div className="bg-bg-surface-low border border-outline-variant/50 rounded-2xl p-4 shadow-sm space-y-4" id={`contracheque-despesa-box-${monthStr}`}>
          <div className="flex items-center justify-between pb-3 border-b border-outline-variant/30">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded bg-rose-400" />
              <h3 className="text-xs font-black uppercase tracking-widest text-white">DESPESA</h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-rose-400 font-bold">
                {formatBRL(totalExpenses)}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleOpenCreate('despesa', monthStr)}
                className="p-1 rounded bg-brand-primary/10 hover:bg-brand-primary/20 text-brand-primary border border-brand-primary/20 transition-all cursor-pointer flex items-center gap-0.5 text-[9px] font-bold uppercase tracking-wider px-1.5"
                id={`btn-add-despesa-${monthStr}`}
              >
                <Plus size={11} />
                <span>Novo</span>
              </button>

              <button
                onClick={() => handleReplicateCategory('despesa', monthStr)}
                className="p-1.5 rounded bg-white/5 border border-white/10 text-text-muted hover:text-white hover:border-white/30 transition-all cursor-pointer flex items-center justify-center"
                title="Replicar todas as despesas para o mês seguinte"
                id={`btn-replicate-despesas-${monthStr}`}
              >
                <ArrowRight size={12} />
              </button>
            </div>
          </div>

          {/* List of Expenses */}
          <div className="space-y-1.5">
            {despesas.length === 0 ? (
              <p className="text-[10px] text-text-muted italic opacity-60 pl-1">Nenhuma despesa lançada.</p>
            ) : (
              despesas.map(entry => (
                <div 
                  key={entry.id} 
                  className="flex items-center justify-between bg-black/25 hover:bg-black/40 border border-white/5 rounded-lg p-2 transition-colors"
                  id={`contracheque-entry-${entry.id}`}
                >
                  <div className="flex flex-col pl-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-medium text-white/90">
                        {entry.name}
                      </span>
                      {entry.isAdiantado && (
                        <span className="px-1.5 py-0.5 text-[9px] font-black font-display bg-emerald-500/10 border border-emerald-500/35 text-emerald-400 rounded uppercase tracking-wider">
                          AD
                        </span>
                      )}
                      {entry.isAtrasado && (
                        <span className="px-1.5 py-0.5 text-[9px] font-black font-display bg-amber-500/10 border border-amber-500/35 text-amber-500 rounded uppercase tracking-wider">
                          AT
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-mono font-semibold text-rose-400">
                      R$ {entry.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(entry)}
                        className="text-text-muted hover:text-brand-primary p-1 rounded hover:bg-white/5 transition-colors"
                        title="Editar"
                        id={`btn-edit-entry-${entry.id}`}
                      >
                        <Edit3 size={11} />
                      </button>
                      <button
                        onClick={() => handleDeleteEntry(entry.id)}
                        className="text-text-muted hover:text-rose-400 p-1 rounded hover:bg-white/5 transition-colors"
                        title="Excluir"
                        id={`btn-delete-entry-${entry.id}`}
                      >
                        <Trash2 size={11} />
                      </button>
                      <button
                        onClick={() => handleReplicateSingleEntry(entry)}
                        className="text-text-muted hover:text-white p-1 rounded hover:bg-white/5 transition-colors"
                        title="Replicar para o mês seguinte"
                        id={`btn-replicate-entry-${entry.id}`}
                      >
                        <ArrowRight size={11} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </>
    );

    if (isDesktop) {
      return (
        <div className="flex flex-col space-y-5 bg-bg-surface-low/30 p-4 rounded-3xl border border-outline-variant/10 w-full" id={`contracheque-month-column-${monthStr}`}>
          {columnContent}
        </div>
      );
    } else {
      return (
        <div className="flex flex-col space-y-6" id={`contracheque-month-column-${monthStr}`}>
          {columnContent}
        </div>
      );
    }
  };

  // --- RENDERING RESUMO VIEW ---
  if (isResumoView) {
    const {
      items,
      grandTotalReceita,
      grandTotalDespesa,
      grandTotalLiquido
    } = getGroupedSummaryData();

    // Filter items by search query if any
    const filteredItems = items.filter(item => 
      item.name.toLowerCase().includes(resumoSearchQuery.toLowerCase())
    );

    const filteredReceitas = filteredItems.filter(item => item.type === 'receita');
    const filteredDespesas = filteredItems.filter(item => item.type === 'despesa');

    return (
      <div className="flex flex-col h-full overflow-y-auto pb-24 space-y-6" id="contracheque-resumo-container">
        {/* Header with Voltar and Title */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-outline-variant/15 pb-4" id="contracheque-resumo-header">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setIsResumoView(false);
                setResumoSearchQuery('');
              }}
              className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-text-muted hover:text-white hover:bg-white/10 transition-all cursor-pointer flex items-center justify-center"
              title="Voltar para planejamento"
              id="btn-contracheque-back-from-resumo-top"
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <h2 className="text-lg font-black tracking-wider text-white uppercase font-display flex items-center gap-2">
                <ClipboardList size={18} className="text-brand-primary" />
                RESUMO TOTAL
              </h2>
            </div>
          </div>

          {/* Search filter inside Resumo */}
          <div className="relative max-w-xs w-full" id="resumo-search-filter-wrapper">
            <input
              type="text"
              placeholder="Filtrar item por nome..."
              value={resumoSearchQuery}
              onChange={e => setResumoSearchQuery(e.target.value)}
              className="bg-bg-surface-low border border-outline-variant/50 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder:text-text-muted/60 focus:outline-none focus:border-brand-primary w-full"
              id="resumo-search-filter"
            />
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          </div>
        </div>

        {/* Consolidado Grand Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" id="resumo-grand-cards-grid">
          {/* TOTAL RECEITAS */}
          <div className="bg-bg-surface-low border border-outline-variant/40 rounded-2xl p-4 flex flex-col justify-between shadow-sm relative overflow-hidden group">
            <div className="absolute right-3 top-3 w-8 h-8 bg-emerald-500/5 rounded-lg flex items-center justify-center border border-emerald-500/10">
              <TrendingUp size={16} className="text-emerald-400" />
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wider text-text-muted font-bold block">Total Receitas</span>
              <span className="text-lg font-black font-mono tracking-tight text-emerald-400 block mt-1">
                {formatBRL(grandTotalReceita)}
              </span>
            </div>
          </div>

          {/* TOTAL DESPESAS */}
          <div className="bg-bg-surface-low border border-outline-variant/40 rounded-2xl p-4 flex flex-col justify-between shadow-sm relative overflow-hidden group">
            <div className="absolute right-3 top-3 w-8 h-8 bg-rose-500/5 rounded-lg flex items-center justify-center border border-rose-500/10">
              <TrendingDown size={16} className="text-rose-400" />
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wider text-text-muted font-bold block">Total Despesas</span>
              <span className="text-lg font-black font-mono tracking-tight text-rose-400 block mt-1">
                {formatBRL(grandTotalDespesa)}
              </span>
            </div>
          </div>

          {/* TOTAL LÍQUIDO */}
          <div className="bg-bg-surface-low border border-outline-variant/40 rounded-2xl p-4 flex flex-col justify-between shadow-sm relative overflow-hidden group">
            <div className="absolute right-3 top-3 w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center border border-white/10">
              <DollarSign size={16} className="text-white/70" />
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wider text-text-muted font-bold block">Saldo Líquido</span>
              <span className={`text-lg font-black font-mono tracking-tight block mt-1 ${grandTotalLiquido >= 0 ? 'text-green-400' : 'text-rose-400'}`}>
                {formatBRL(grandTotalLiquido)}
              </span>
            </div>
          </div>
        </div>

        {/* Two separate cards: RECEITAS and DESPESAS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="resumo-details-grid">
          {/* Card RECEITAS */}
          <div className="bg-bg-surface-low border border-outline-variant/50 rounded-2xl p-5 shadow-sm space-y-4" id="resumo-receitas-box">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded bg-emerald-400" />
                <h3 className="text-xs font-black uppercase tracking-wider text-white">RECEITAS</h3>
              </div>
            </div>

            {filteredReceitas.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-xs text-text-muted italic opacity-60">Nenhuma receita localizada.</p>
              </div>
            ) : (
              <div className="space-y-3.5" id="resumo-receitas-list">
                {filteredReceitas.map((item, index) => {
                  const uniqueId = `resumo-grouped-receita-${index}`;
                  return (
                    <div key={uniqueId} className="flex flex-col sm:flex-row sm:items-center justify-between py-1.5 gap-3" id={uniqueId}>
                      <div className="space-y-1">
                        <span className="text-xs font-bold text-white">{item.name}</span>
                      </div>

                      <div className="flex flex-col items-end gap-1 text-right">
                        <span className="text-sm font-black font-mono text-emerald-400">
                          {formatBRL(item.totalAmount)}
                        </span>

                        {(item.totalAdiantado > 0 || item.totalAtrasado > 0) && (
                          <div className="flex items-center gap-2">
                            {item.totalAdiantado > 0 && (
                              <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-[9px] font-mono font-bold">
                                AD: {formatBRL(item.totalAdiantado)}
                              </span>
                            )}
                            {item.totalAtrasado > 0 && (
                              <span className="px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/25 text-amber-500 text-[9px] font-mono font-bold">
                                AT: {formatBRL(item.totalAtrasado)}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Card DESPESAS */}
          <div className="bg-bg-surface-low border border-outline-variant/50 rounded-2xl p-5 shadow-sm space-y-4" id="resumo-despesas-box">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded bg-rose-400" />
                <h3 className="text-xs font-black uppercase tracking-wider text-white">DESPESAS</h3>
              </div>
            </div>

            {filteredDespesas.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-xs text-text-muted italic opacity-60">Nenhuma despesa localizada.</p>
              </div>
            ) : (
              <div className="space-y-3.5" id="resumo-despesas-list">
                {filteredDespesas.map((item, index) => {
                  const uniqueId = `resumo-grouped-despesa-${index}`;
                  return (
                    <div key={uniqueId} className="flex flex-col sm:flex-row sm:items-center justify-between py-1.5 gap-3" id={uniqueId}>
                      <div className="space-y-1">
                        <span className="text-xs font-bold text-white">{item.name}</span>
                      </div>

                      <div className="flex flex-col items-end gap-1 text-right">
                        <span className="text-sm font-black font-mono text-rose-400">
                          {formatBRL(item.totalAmount)}
                        </span>

                        {(item.totalAdiantado > 0 || item.totalAtrasado > 0) && (
                          <div className="flex items-center gap-2">
                            {item.totalAdiantado > 0 && (
                              <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-[9px] font-mono font-bold">
                                AD: {formatBRL(item.totalAdiantado)}
                              </span>
                            )}
                            {item.totalAtrasado > 0 && (
                              <span className="px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/25 text-amber-500 text-[9px] font-mono font-bold">
                                AT: {formatBRL(item.totalAtrasado)}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto pb-24" id="contracheque-screen-container">
      {/* 1. DISCREET DESKTOP MONTH NAVIGATOR (Resumo Button, Search Input, and Nav buttons) - Hidden since it is now in the global header */}
      <div className="hidden" id="contracheque-desktop-header">
        {/* Left: Button "Resumo" replacing the title */}
        <button
          onClick={() => setIsResumoView(true)}
          className="flex items-center gap-2 py-2 px-4 bg-brand-primary/15 hover:bg-brand-primary/25 text-brand-primary border border-brand-primary/20 rounded-xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer shadow-sm"
          id="btn-contracheque-resumo-desktop"
        >
          <FileText size={14} />
          <span>Resumo</span>
        </button>

        {/* Center: Search input for month and year MM/AAAA */}
        <div className="relative max-w-[220px] w-full" id="contracheque-search-wrapper">
          <input
            type="text"
            placeholder="Mês e Ano MM/AAAA"
            value={searchQuery}
            onChange={e => handleSearchChange(e.target.value)}
            className="bg-bg-surface-low border border-outline-variant/50 rounded-xl pl-9 pr-3 py-2 text-xs font-bold text-white placeholder:text-text-muted/60 focus:outline-none focus:border-brand-primary w-full text-center tracking-widest font-mono"
            maxLength={7}
            id="contracheque-search-input"
          />
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
        </div>
        
        {/* Right: Navigation arrows */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider mr-1">Navegar Meses</span>
          <div className="flex items-center bg-bg-surface-low border border-outline-variant/30 rounded-xl p-1 gap-1">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 text-text-muted hover:text-white hover:bg-white/5 active:bg-white/10 rounded-lg transition-all cursor-pointer"
              title="Mês anterior"
              id="btn-contracheque-prev-month-desktop"
            >
              <ChevronLeft size={16} />
            </button>
            <div className="w-[1px] h-4 bg-outline-variant/20" />
            <button
              onClick={handleNextMonth}
              className="p-1.5 text-text-muted hover:text-white hover:bg-white/5 active:bg-white/10 rounded-lg transition-all cursor-pointer"
              title="Próximo mês"
              id="btn-contracheque-next-month-desktop"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* 2. MOBILE ACTION BAR (Resumo & Search) */}
      <div className="flex lg:hidden flex-col gap-3 mb-4" id="contracheque-mobile-actions">
        <div className="flex gap-2">
          {/* Resumo Button */}
          <button
            onClick={() => setIsResumoView(true)}
            className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-brand-primary/10 hover:bg-brand-primary/20 text-brand-primary border border-brand-primary/20 rounded-xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer shadow-sm"
            id="btn-contracheque-resumo-mobile"
          >
            <FileText size={14} />
            <span>Resumo</span>
          </button>

          {/* Search Box */}
          <div className="relative flex-1" id="contracheque-search-wrapper-mobile">
            <input
              type="text"
              placeholder="Buscar MM/AAAA"
              value={searchQuery}
              onChange={e => handleSearchChange(e.target.value)}
              className="bg-bg-surface-low border border-outline-variant/50 rounded-xl pl-8 pr-3 py-2 text-xs font-semibold text-white placeholder:text-text-muted/60 focus:outline-none focus:border-brand-primary w-full text-center tracking-widest font-mono"
              maxLength={7}
              id="contracheque-search-input-mobile"
            />
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted" />
          </div>
        </div>
      </div>

      {/* 3. UNIFIED MOBILE MONTH SELECTOR */}
      <div className="flex lg:hidden flex-col bg-bg-surface-low border border-outline-variant/50 rounded-2xl p-4 mb-5 shadow-sm space-y-3" id="contracheque-month-selector-mobile">
        <div className="flex items-center justify-between">
          <button
            onClick={handlePrevMonth}
            className="p-2 text-text-muted hover:text-white hover:bg-white/5 active:bg-white/10 rounded-full transition-all cursor-pointer"
            id="btn-contracheque-prev-month"
          >
            <ChevronLeft size={20} />
          </button>

          <span className="text-sm font-black uppercase tracking-widest text-white font-display">
            {formatMonthName(currentMonth)}
          </span>

          <button
            onClick={handleNextMonth}
            className="p-2 text-text-muted hover:text-white hover:bg-white/5 active:bg-white/10 rounded-full transition-all cursor-pointer"
            id="btn-contracheque-next-month"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* MOBILE ONLY VIEW: renders single column */}
      <div className="block lg:hidden space-y-6">
        {renderMonthColumn(currentMonth, false)}
      </div>

      {/* DESKTOP ONLY VIEW: renders 3 columns side-by-side */}
      <div className="hidden lg:grid lg:grid-cols-3 gap-6 items-start">
        {renderMonthColumn(currentMonth, true)}
        {renderMonthColumn(getNextMonth(currentMonth), true)}
        {renderMonthColumn(getNextMonth(getNextMonth(currentMonth)), true)}
      </div>

      {/* 5. UNIFIED LAUNCH FORM MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm shadow-2xl" id="contracheque-modal-overlay">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-bg-surface-low border border-outline-variant/60 rounded-3xl p-6 w-full max-w-sm space-y-6 relative"
              id="contracheque-modal-content"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-white">
                    {modalMode === 'create' ? 'Novo Lançamento' : 'Editar Lançamento'}
                  </h3>
                  <p className="text-[10px] text-text-muted mt-1 uppercase tracking-wide">
                    {launchType === 'receita' ? 'RECEITA' : 'DESPESA'} &bull; {formatMonthName(modalMonth)}
                  </p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-text-muted hover:text-white p-1 rounded-full hover:bg-white/5 cursor-pointer"
                  id="btn-close-contracheque-modal"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSaveLaunch} className="space-y-4">
                {/* Tipo - Only show, can't change because of category rule */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] uppercase tracking-wider text-text-muted font-bold">Categoria</label>
                  <div className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-outline-variant/20 rounded-xl text-xs font-black uppercase tracking-widest text-white">
                    {launchType === 'receita' ? (
                      <>
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        <span>Receita</span>
                      </>
                    ) : (
                      <>
                        <span className="w-2 h-2 rounded-full bg-rose-400" />
                        <span>Despesa</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Nome do Item */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] uppercase tracking-wider text-text-muted font-bold">Item</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Salário, Vale, Gasolina..."
                    value={launchName}
                    onChange={e => setLaunchName(e.target.value)}
                    className="bg-bg-base border border-outline-variant/60 rounded-xl px-3 py-2 text-xs text-white placeholder:text-text-muted/60 focus:outline-none focus:border-brand-primary w-full"
                    id="input-contracheque-name"
                  />
                </div>

                {/* Valor */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] uppercase tracking-wider text-text-muted font-bold">Valor (R$)</label>
                  <input
                    type="text"
                    required
                    inputMode="decimal"
                    placeholder="0,00"
                    value={launchAmountStr}
                    onChange={e => handleAutomaticCentsInput(e.target.value, setLaunchAmountStr)}
                    className="bg-bg-base border border-outline-variant/60 rounded-xl px-3 py-2 text-xs font-bold font-mono text-white placeholder:text-text-muted/60 focus:outline-none focus:border-brand-primary w-full"
                    id="input-contracheque-amount"
                  />
                </div>

                {/* Checkboxes: ADIANTADO and ATRASADO */}
                <div className="bg-bg-base/40 rounded-xl p-3 border border-outline-variant/15 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-wider text-text-muted font-bold">Informações Adicionais</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <label 
                      className={`flex items-center gap-2 p-2.5 rounded-xl border transition-all cursor-pointer select-none ${
                        isAdiantado 
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                          : 'bg-black/20 border-white/5 text-text-muted hover:text-white hover:bg-black/30'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isAdiantado}
                        onChange={e => {
                          setIsAdiantado(e.target.checked);
                          if (e.target.checked) setIsAtrasado(false); // Exclusive if desirable, but let's allow custom combos, though normally they are mutually exclusive. We uncheck the other to be helpful.
                        }}
                        className="sr-only"
                      />
                      <span className="text-[10px] font-black uppercase tracking-widest font-display">Adiantado</span>
                      {isAdiantado && <Check size={12} className="ml-auto" />}
                    </label>

                    <label 
                      className={`flex items-center gap-2 p-2.5 rounded-xl border transition-all cursor-pointer select-none ${
                        isAtrasado 
                          ? 'bg-amber-500/10 border-amber-500/30 text-amber-500' 
                          : 'bg-black/20 border-white/5 text-text-muted hover:text-white hover:bg-black/30'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isAtrasado}
                        onChange={e => {
                          setIsAtrasado(e.target.checked);
                          if (e.target.checked) setIsAdiantado(false); // Mutually exclusive
                        }}
                        className="sr-only"
                      />
                      <span className="text-[10px] font-black uppercase tracking-widest font-display">Atrasado</span>
                      {isAtrasado && <Check size={12} className="ml-auto" />}
                    </label>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="w-1/2 py-2.5 rounded-xl border border-outline-variant/60 text-xs font-black uppercase tracking-widest text-text-muted hover:text-white transition-colors cursor-pointer text-center"
                    id="btn-cancel-contracheque-modal"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="w-1/2 py-2.5 rounded-xl bg-brand-primary text-black text-xs font-black uppercase tracking-widest hover:opacity-90 transition-opacity cursor-pointer text-center"
                    id="btn-submit-contracheque-modal"
                  >
                    Salvar
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
