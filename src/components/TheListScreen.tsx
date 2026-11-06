import React, { useState } from 'react';
import { 
  Plus, Trash2, Search, BookLock, X, Check, ShieldAlert, Edit2, Info, 
  BarChart3, Database, Calendar, ChevronUp, ChevronDown, PlusCircle, MinusCircle, Filter,
  List, AlignJustify, BookA
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { TheListEntry } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface TheListScreenProps {
  theListEntries: TheListEntry[];
  setTheListEntries: React.Dispatch<React.SetStateAction<TheListEntry[]>>;
  theListYearCounts?: Record<string, number>;
  setTheListYearCounts?: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  triggerToast: (msg: string) => void;
  theme?: 'light' | 'dark';
}

export default function TheListScreen({
  theListEntries,
  setTheListEntries,
  theListYearCounts = {},
  setTheListYearCounts = () => {},
  triggerToast,
  theme = 'dark'
}: TheListScreenProps) {
  const [subTab, setSubTab] = useState<'entries' | 'dados'>('entries');
  const [showFullAlphabet, setShowFullAlphabet] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<TheListEntry | null>(null);

  // Editing State
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);

  // Note States
  const [noteEntry, setNoteEntry] = useState<TheListEntry | null>(null);
  const [noteText, setNoteText] = useState('');

  // Form Fields
  const [nome, setNome] = useState('');
  const [periodo, setPeriodo] = useState('');
  const [local, setLocal] = useState('');
  const [k, setK] = useState(false);
  const [f, setF] = useState(false);
  const [d, setD] = useState(false);
  const [t, setT] = useState(false);
  const [p, setP] = useState(false);
  const [s, setS] = useState(false);
  const [esquadrao, setEsquadrao] = useState('');

  const handleResetForm = () => {
    setNome('');
    setPeriodo('');
    setLocal('');
    setK(false);
    setF(false);
    setD(false);
    setT(false);
    setP(false);
    setS(false);
    setEsquadrao('');
    setEditingEntryId(null);
    setIsModalOpen(false);
  };

  const handleCreateEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !periodo.trim() || !local.trim()) {
      triggerToast('Preencha os campos obrigatórios (Nome, Período e Local).');
      return;
    }

    if (editingEntryId) {
      setTheListEntries(prev => prev.map(entry => {
        if (entry.id === editingEntryId) {
          return {
            ...entry,
            nome: nome.trim(),
            periodo: periodo.trim(),
            local: local.trim(),
            k,
            f,
            d,
            t,
            p,
            s,
            esquadrao: esquadrao.trim() || undefined
          };
        }
        return entry;
      }));
      triggerToast(`Lançamento "${nome.trim()}" atualizado com sucesso!`);
    } else {
      const newEntry: TheListEntry = {
        id: `list-${Math.random().toString(36).substring(2, 9)}`,
        nome: nome.trim(),
        periodo: periodo.trim(),
        local: local.trim(),
        k,
        f,
        d,
        t,
        p,
        s,
        esquadrao: esquadrao.trim() || undefined
      };

      setTheListEntries(prev => [...prev, newEntry]);
      triggerToast(`Lançamento "${newEntry.nome}" adicionado com sucesso!`);
    }

    handleResetForm();
  };

  const handleStartEdit = (entry: TheListEntry) => {
    setEditingEntryId(entry.id);
    setNome(entry.nome);
    setPeriodo(entry.periodo);
    setLocal(entry.local);
    setK(entry.k);
    setF(entry.f);
    setD(entry.d);
    setT(entry.t);
    setP(entry.p);
    setS(entry.s);
    setEsquadrao(entry.esquadrao || '');
    setIsModalOpen(true);
  };

  const handleOpenNoteModal = (entry: TheListEntry) => {
    setNoteEntry(entry);
    setNoteText(entry.note || '');
  };

  const handleDeleteEntry = (id: string) => {
    setTheListEntries(prev => prev.filter(item => item.id !== id));
    triggerToast('Lançamento excluído com sucesso.');
  };

  // --- DADOS CALCS ---
  const ESQ_COLORS = ['AZUL', 'VERDE', 'AMARELO', 'BRANCO', 'NEGRO', 'PRATA'];
  
  const esqColorStats = ESQ_COLORS.map(color => {
    const count = theListEntries.filter(entry => 
      entry.esquadrao && entry.esquadrao.trim().toUpperCase() === color
    ).length;
    return { color, count, isUsed: count > 0 };
  });

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  
  const alphabetRelevantEntries = theListEntries.filter(entry => showFullAlphabet ? true : !entry.p);
  const alphabetStats = alphabet.map(letter => {
    const count = alphabetRelevantEntries.filter(entry => 
      entry.nome && entry.nome.trim().toUpperCase().startsWith(letter)
    ).length;
    return { letter, count, isUsed: count > 0 };
  });

  const startYear = 2001;
  const currentYear = new Date().getFullYear();
  const yearsList: number[] = [];
  for (let y = startYear; y <= currentYear; y++) {
    yearsList.push(y);
  }
  const sortedYearsForList = [...yearsList].reverse();

  const handleIncrementYear = (year: number) => {
    const yearStr = year.toString();
    setTheListYearCounts(prev => ({
      ...prev,
      [yearStr]: (prev[yearStr] || 0) + 1
    }));
  };

  const handleDecrementYear = (year: number) => {
    const yearStr = year.toString();
    const currentVal = theListYearCounts[yearStr] || 0;
    if (currentVal <= 0) return;
    setTheListYearCounts(prev => ({
      ...prev,
      [yearStr]: currentVal - 1
    }));
  };

  const chartData = yearsList.map(year => {
    const yearStr = year.toString();
    return {
      name: yearStr,
      'Quantidade': theListYearCounts[yearStr] || 0
    };
  });

  // Filter entries
  const filteredEntries = theListEntries.filter(entry => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      entry.nome.toLowerCase().includes(query) ||
      entry.periodo.toLowerCase().includes(query) ||
      entry.local.toLowerCase().includes(query) ||
      (entry.esquadrao && entry.esquadrao.toLowerCase().includes(query))
    );
  });

  return (
    <div className="w-full space-y-6 relative pb-24 text-left" id="the-list-screen-container">
      {/* Persistent Header */}
      <div 
        className="bg-bg-surface-low border border-outline-variant/60 rounded-3xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4" 
        id="the-list-header-card"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-primary/10 rounded-xl flex items-center justify-center border border-brand-primary/20">
            <BookLock className="text-brand-primary" size={20} />
          </div>
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-wider font-display">
              THE LIST
            </h3>
          </div>
        </div>

        {/* Action Tabs/Buttons on the Top Right of Header */}
        <div className="flex items-center gap-2 self-end sm:self-auto" id="the-list-tabs-navigation">
          <button
            type="button"
            onClick={() => setSubTab('entries')}
            className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider font-display transition-all cursor-pointer flex items-center gap-1.5 ${
              subTab === 'entries'
                ? 'bg-brand-primary text-black gold-glow font-bold'
                : 'bg-bg-surface-med border border-outline-variant/20 text-text-muted hover:text-white'
            }`}
          >
            <List size={12} /> LIST
          </button>
          <button
            type="button"
            onClick={() => setSubTab('dados')}
            className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider font-display transition-all cursor-pointer flex items-center gap-1.5 ${
              subTab === 'dados'
                ? 'bg-brand-primary text-black gold-glow font-bold'
                : 'bg-bg-surface-med border border-outline-variant/20 text-text-muted hover:text-white'
            }`}
          >
            <BarChart3 size={12} /> DADOS
          </button>
        </div>
      </div>

      {subTab === 'entries' ? (
        <>
          {/* Search Input bar */}
          <div className="relative w-full" id="the-list-search-wrapper">
            <input
              type="text"
              placeholder="Buscar..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="bg-bg-surface-low border border-outline-variant/60 hover:border-outline-variant/80 focus:border-brand-primary focus:outline-none rounded-2xl pl-10 pr-4 py-3 text-xs text-white placeholder:text-text-muted/60 w-full transition-all font-sans shadow-lg"
              id="the-list-search-input"
            />
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
          </div>

          {/* Main Table / List Card */}
          <div 
            className="bg-bg-surface-low border border-outline-variant/60 rounded-3xl p-6 shadow-xl" 
            id="the-list-table-card"
          >
            {filteredEntries.length === 0 ? (
              <div className="text-center py-16" id="the-list-empty-state">
                <BookLock className="mx-auto text-text-muted/20 mb-4" size={48} strokeWidth={1.5} />
                <p className="text-xs text-text-muted font-mono">
                  {searchQuery ? 'Nenhum lançamento corresponde à busca.' : 'Nenhum lançamento cadastrado. Clique no botão + no canto inferior direito para adicionar.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto -mx-6 px-6" id="the-list-table-wrapper">
                <table className="w-full text-left border-collapse" id="the-list-main-table">
                  <thead>
                    <tr className="border-b border-outline-variant/20 text-text-muted text-[10px] font-black uppercase tracking-widest font-display">
                      <th className="pb-3.5 pl-2">Nome</th>
                      <th className="pb-3.5 pr-2">Período</th>
                      <th className="pb-3.5 pr-2">Local</th>
                      <th className="pb-3.5 text-center w-12">K</th>
                      <th className="pb-3.5 text-center w-12">F</th>
                      <th className="pb-3.5 text-center w-12">D</th>
                      <th className="pb-3.5 text-center w-12">T</th>
                      <th className="pb-3.5 text-center w-12">P</th>
                      <th className="pb-3.5 text-center w-12">S</th>
                      <th className="pb-3.5 pr-2">ESQ</th>
                      <th className="pb-3.5 text-right w-14"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10">
                    {filteredEntries.map((entry) => (
                      <tr 
                        key={entry.id} 
                        className="hover:bg-bg-surface-med/20 transition-all group"
                        id={`thelist-row-${entry.id}`}
                      >
                        {/* Nome */}
                        <td 
                          className="py-4 pl-2 font-display text-xs font-black text-white cursor-pointer hover:text-brand-primary hover:underline transition-all flex items-center gap-1.5"
                          onClick={() => handleOpenNoteModal(entry)}
                        >
                          <span>{entry.nome}</span>
                          {entry.note && (
                            <div className="relative group/note inline-flex items-center ml-1.5 shrink-0 select-none">
                              <Info size={13} className="text-brand-primary/60 hover:text-brand-primary cursor-help" />
                              {/* Tooltip floating window */}
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-bg-surface-high border border-outline-variant/80 rounded-lg p-2.5 shadow-xl opacity-0 scale-95 pointer-events-none group-hover/note:opacity-100 group-hover/note:scale-100 group-hover/note:pointer-events-auto transition-all duration-200 z-50 text-[10px] text-text-high leading-relaxed normal-case font-sans break-words whitespace-pre-wrap">
                                <div className="font-bold border-b border-outline-variant/20 pb-1 mb-1 text-[9px] uppercase tracking-wider text-brand-primary">Nota</div>
                                {entry.note}
                              </div>
                            </div>
                          )}
                        </td>

                        {/* Período */}
                        <td className="py-4 pr-2 font-mono text-xs text-text-high">
                          {entry.periodo}
                        </td>

                        {/* Local */}
                        <td className="py-4 pr-2 font-sans text-xs text-text-high">
                          {entry.local}
                        </td>

                        {/* Checkbox Indicators */}
                        {['k', 'f', 'd', 't', 'p', 's'].map((char) => {
                          const value = entry[char as 'k' | 'f' | 'd' | 't' | 'p' | 's'];
                          return (
                            <td key={char} className="py-4 text-center">
                              <div className="flex justify-center">
                                <span 
                                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black font-mono transition-all border ${
                                    value 
                                      ? 'bg-brand-primary/10 border-brand-primary text-brand-primary font-bold shadow-sm shadow-brand-primary/10' 
                                      : 'bg-bg-surface-med/30 border-outline-variant/10 text-text-muted/30'
                                  }`}
                                >
                                  {char.toUpperCase()}
                                </span>
                              </div>
                            </td>
                          );
                        })}

                        {/* Esquadrão */}
                        <td className="py-4 pr-2 font-sans text-xs text-text-muted">
                          {entry.esquadrao || (
                            <span className="text-text-muted/30 italic font-mono text-[10px]">-</span>
                          )}
                        </td>

                        {/* Ações */}
                        <td className="py-4 text-right pr-2">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => handleStartEdit(entry)}
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted/40 hover:text-brand-primary hover:bg-brand-primary/10 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 cursor-pointer"
                              title="Editar lançamento"
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              type="button"
                              onClick={() => setEntryToDelete(entry)}
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted/40 hover:text-red-400 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 cursor-pointer"
                              title="Excluir lançamento"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Floating Action Button (FAB) */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsModalOpen(true)}
            className="fixed bottom-20 md:bottom-8 right-6 w-14 h-14 bg-brand-primary text-black rounded-full flex items-center justify-center shadow-2xl hover:brightness-110 z-30 cursor-pointer gold-glow ring-2 ring-brand-primary/20"
            title="Novo lançamento"
            id="thelist-add-fab-btn"
          >
            <Plus size={28} strokeWidth={3} />
          </motion.button>
        </>
      ) : (
        /* DADOS RESUMOS VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="thelist-dados-container">
          
          {/* CARD 1: ESQUADRÕES */}
          <div className="bg-bg-surface-low border border-outline-variant/60 rounded-3xl p-6 shadow-xl space-y-4" id="card-esquadrao-resumo">
            <div className="flex items-center gap-2 border-b border-outline-variant/20 pb-3">
              <AlignJustify className="text-brand-primary" size={16} />
              <h3 className="text-xs font-black text-white uppercase tracking-wider font-display">Esquadrões</h3>
            </div>
            <div className="space-y-2.5">
              {esqColorStats.map(({ color, count, isUsed }) => (
                <div 
                  key={color}
                  className={`px-4 py-3 rounded-2xl flex items-center justify-between border transition-all ${
                    isUsed 
                      ? 'border-dashed border-outline-variant/15 bg-bg-surface-med/15'
                      : 'border-outline-variant/30 bg-bg-surface-med/30'
                  }`}
                  id={`color-stat-${color}`}
                >
                  <span className={`font-display tracking-wider text-xs uppercase ${
                    isUsed ? 'text-text-muted/40 line-through font-normal' : 'text-white font-black'
                  }`}>{color}</span>
                  <div className="px-2 py-0.5 rounded-lg text-[9px] font-mono border bg-brand-primary/10 text-brand-primary border-brand-primary/20 font-bold">
                    {count} {count === 1 ? 'vez' : 'vezes'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CARD 2: ALFABETO */}
          <div className="bg-bg-surface-low border border-outline-variant/60 rounded-3xl p-6 shadow-xl space-y-4 flex flex-col justify-between" id="card-alfabeto-resumo">
            <div>
              <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <BookA className="text-brand-primary" size={16} />
                  <h3 className="text-xs font-black text-white uppercase tracking-wider font-display">Alfabeto</h3>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-mono text-text-muted font-bold" id="alphabet-total-count">
                    Total: <strong className="text-brand-primary font-mono">{alphabetRelevantEntries.length}</strong>
                  </span>
                  {/* Button FULL */}
                  <button
                    type="button"
                    onClick={() => setShowFullAlphabet(!showFullAlphabet)}
                    className={`text-[9px] font-black uppercase px-2.5 py-1.5 rounded-xl border transition-all cursor-pointer ${
                      showFullAlphabet 
                        ? 'bg-brand-primary border-brand-primary text-black gold-glow'
                        : 'bg-bg-surface-med border-outline-variant/30 text-text-muted hover:text-white'
                    }`}
                    title="Alterar para considerar todas as entradas (inclusive com P marcado)"
                    id="btn-full-alphabet-filter"
                  >
                    {showFullAlphabet ? 'FULL: Ativo' : 'FULL: Inativo'}
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2" id="alphabet-grid">
                {alphabetStats.map(({ letter, count, isUsed }) => (
                  <div 
                    key={letter}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl border aspect-square transition-all ${
                      isUsed 
                        ? 'border-dashed border-outline-variant/15 bg-bg-surface-med/10'
                        : 'border-outline-variant/30 bg-bg-surface-med/30'
                    }`}
                    id={`letter-stat-${letter}`}
                  >
                    <span className={`text-sm font-display leading-none ${
                      isUsed ? 'text-text-muted/40 line-through font-normal' : 'text-white font-black'
                    }`}>{letter}</span>
                    <span className="text-[8px] font-mono mt-1 text-brand-primary font-bold">
                      ({count})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CARD 3: CONTADOR DE HISTÓRICO POR ANO & GRÁFICO (COL-SPAN-2) */}
          <div className="bg-bg-surface-low border border-outline-variant/60 rounded-3xl p-6 shadow-xl space-y-5 md:col-span-2" id="card-anos-resumo">
            <div className="flex items-center gap-2 border-b border-outline-variant/20 pb-3">
              <Calendar className="text-brand-primary" size={16} />
              <h3 className="text-xs font-black text-white uppercase tracking-wider font-display">Histórico por Ano (2001 - Atual)</h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Years controller list */}
              <div className="lg:col-span-5 flex flex-col space-y-3">
                <div className="text-[10px] font-black uppercase tracking-wider text-text-muted font-display">Valores por Ano</div>
                <div className="border border-outline-variant/15 rounded-2xl bg-bg-surface-med/10 p-4 pr-3.5" id="years-controller-list-container">
                  <div className="h-[256px] overflow-y-auto pl-1 pr-2.5 py-1 custom-scrollbar divide-y divide-outline-variant/10" id="years-controller-list">
                    {sortedYearsForList.map(year => {
                      const count = theListYearCounts[year.toString()] || 0;
                      return (
                        <div key={year} className="flex items-center justify-between py-2.5 px-2" id={`year-row-${year}`}>
                          <span className="font-display font-black text-xs text-white">{year}</span>
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-xs text-brand-primary bg-brand-primary/5 border border-brand-primary/10 px-2.5 py-0.5 rounded-lg min-w-[2.5rem] text-center" id={`year-count-badge-${year}`}>
                              {count}
                            </span>
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleDecrementYear(year)}
                                className="w-7 h-7 rounded-lg bg-bg-surface-med/80 border border-outline-variant/20 hover:border-red-500/40 hover:text-red-400 transition-all flex items-center justify-center cursor-pointer text-text-muted"
                                title="Subtrair 1"
                                id={`btn-decrement-year-${year}`}
                              >
                                <MinusCircle size={14} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleIncrementYear(year)}
                                className="w-7 h-7 rounded-lg bg-bg-surface-med/80 border border-outline-variant/20 hover:border-brand-primary/40 hover:text-brand-primary transition-all flex items-center justify-center cursor-pointer text-text-muted"
                                title="Adicionar 1"
                                id={`btn-increment-year-${year}`}
                              >
                                <PlusCircle size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right Column: Recharts Bar Chart */}
              <div className="lg:col-span-7 flex flex-col space-y-3 justify-between">
                <div className="text-[10px] font-black uppercase tracking-wider text-text-muted font-display">Gráfico de Distribuição</div>
                <div className="w-full h-72 bg-bg-surface-med/5 border border-outline-variant/15 rounded-2xl p-4 flex items-center justify-center" id="years-bar-chart-container">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                      <XAxis 
                        dataKey="name" 
                        stroke="#71717a" 
                        fontSize={8} 
                        tickLine={false} 
                        axisLine={false} 
                      />
                      <YAxis 
                        stroke="#71717a" 
                        fontSize={8} 
                        tickLine={false} 
                        axisLine={false} 
                        allowDecimals={false}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#161920', 
                          borderColor: 'rgba(255,255,255,0.1)', 
                          borderRadius: '12px', 
                          fontSize: '11px', 
                          color: '#fff' 
                        }} 
                      />
                      <Bar dataKey="Quantidade" fill="#ffe08b" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADICIONAR LANÇAMENTO */}
      <AnimatePresence>
        {isModalOpen && (
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in" 
            id="the-list-create-modal-backdrop"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-bg-surface-low border border-outline-variant/60 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-6 text-left" 
              id="the-list-create-modal"
            >
              <div className="flex items-center justify-between border-b border-outline-variant/20 pb-4">
                <div className="flex items-center gap-2">
                  <BookLock className="text-brand-primary" size={18} />
                  <h3 className="text-sm font-black text-white uppercase tracking-wider font-display">
                    {editingEntryId ? 'Editar Lançamento' : 'Novo Lançamento'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-text-muted hover:text-white hover:bg-white/5 transition-all cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleCreateEntry} className="space-y-4" id="form-new-the-list-entry">
                {/* Nome */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-text-muted font-display block">
                    Nome <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Nome"
                    value={nome}
                    onChange={e => setNome(e.target.value)}
                    className="w-full bg-bg-surface-med border border-outline-variant/30 hover:border-outline-variant/50 focus:border-brand-primary focus:outline-none rounded-xl p-3 text-xs text-white placeholder:text-text-muted/40 transition-all font-sans"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Período */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-text-muted font-display block">
                      Período <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Período"
                      value={periodo}
                      onChange={e => setPeriodo(e.target.value)}
                      className="w-full bg-bg-surface-med border border-outline-variant/30 hover:border-outline-variant/50 focus:border-brand-primary focus:outline-none rounded-xl p-3 text-xs text-white placeholder:text-text-muted/40 transition-all font-sans"
                    />
                  </div>

                  {/* Local */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-text-muted font-display block">
                      Local <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Local"
                      value={local}
                      onChange={e => setLocal(e.target.value)}
                      className="w-full bg-bg-surface-med border border-outline-variant/30 hover:border-outline-variant/50 focus:border-brand-primary focus:outline-none rounded-xl p-3 text-xs text-white placeholder:text-text-muted/40 transition-all font-sans"
                    />
                  </div>
                </div>

                {/* Checkboxes (K, F, D, T, P, S) */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-text-muted font-display block">
                    Atribuições (K, F, D, T, P, S)
                  </label>
                  <div className="flex items-center justify-between bg-bg-surface-med/55 border border-outline-variant/15 rounded-2xl p-3.5">
                    {[
                      { state: k, setState: setK, label: 'K' },
                      { state: f, setState: setF, label: 'F' },
                      { state: d, setState: setD, label: 'D' },
                      { state: t, setState: setT, label: 'T' },
                      { state: p, setState: setP, label: 'P' },
                      { state: s, setState: setS, label: 'S' }
                    ].map((item) => (
                      <button
                        key={item.label}
                        type="button"
                        onClick={() => item.setState(!item.state)}
                        className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black font-mono transition-all border cursor-pointer ${
                          item.state
                            ? 'bg-brand-primary/20 border-brand-primary text-brand-primary shadow-sm shadow-brand-primary/10'
                            : 'bg-bg-surface-low border-outline-variant/20 text-text-muted hover:border-outline-variant/40'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* ESQ */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-text-muted font-display block">
                    ESQ <span className="text-[9px] text-text-muted lowercase normal-case font-mono font-normal">(opcional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="ESQ"
                    value={esquadrao}
                    onChange={e => setEsquadrao(e.target.value)}
                    className="w-full bg-bg-surface-med border border-outline-variant/30 hover:border-outline-variant/50 focus:border-brand-primary focus:outline-none rounded-xl p-3 text-xs text-white placeholder:text-text-muted/40 transition-all font-sans"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-outline-variant/10">
                  <button
                    type="button"
                    onClick={handleResetForm}
                    className="bg-bg-surface-med hover:bg-bg-surface-high border border-outline-variant/20 text-text-muted hover:text-white px-5 py-3 rounded-2xl text-[10px] font-black tracking-widest uppercase font-display transition-all cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="bg-brand-primary text-black hover:brightness-110 px-5 py-3 rounded-2xl text-[10px] font-black tracking-widest uppercase font-display transition-all gold-glow cursor-pointer"
                  >
                    {editingEntryId ? 'Salvar' : 'Adicionar'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CONFIRMATION DIALOG: EXCLUIR REGISTRO */}
      <AnimatePresence>
        {entryToDelete && (
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in" 
            id="the-list-delete-modal-backdrop"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-bg-surface-low border border-outline-variant/60 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-5 text-left" 
              id="the-list-delete-modal"
            >
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
                Tem certeza que deseja excluir o lançamento de <span className="text-white font-bold">{entryToDelete.nome}</span>? 
                Este registro será removido permanentemente de THE LIST.
              </p>

              <div className="flex justify-end gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setEntryToDelete(null)}
                  className="bg-bg-surface-med hover:bg-bg-surface-high border border-outline-variant/20 text-text-muted hover:text-white px-4 py-2.5 rounded-xl text-[10px] font-black tracking-wider uppercase font-display transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleDeleteEntry(entryToDelete.id);
                    setEntryToDelete(null);
                  }}
                  className="bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 px-4 py-2.5 rounded-xl text-[10px] font-black tracking-wider uppercase font-display transition-all cursor-pointer"
                >
                  Excluir
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: ADICIONAR / EDITAR NOTA */}
      <AnimatePresence>
        {noteEntry && (
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in" 
            id="the-list-note-modal-backdrop"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-bg-surface-low border border-outline-variant/60 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 text-left" 
              id="the-list-note-modal"
            >
              <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
                <div className="flex items-center gap-2">
                  <Info className="text-brand-primary" size={18} />
                  <h3 className="text-xs font-black text-white uppercase tracking-wider font-display">Nota de {noteEntry.nome}</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setNoteEntry(null)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-text-muted hover:text-white hover:bg-white/5 transition-all cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-text-muted font-display block">
                  Conteúdo da Nota
                </label>
                <textarea
                  placeholder="Escreva observações, detalhes ou informações importantes..."
                  value={noteText}
                  onChange={e => setNoteText(e.target.value)}
                  className="w-full h-32 bg-bg-surface-med border border-outline-variant/30 hover:border-outline-variant/50 focus:border-brand-primary focus:outline-none rounded-xl p-3 text-xs text-white placeholder:text-text-muted/40 transition-all font-sans resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setNoteEntry(null)}
                  className="bg-bg-surface-med hover:bg-bg-surface-high border border-outline-variant/20 text-text-muted hover:text-white px-4 py-2.5 rounded-xl text-[10px] font-black tracking-wider uppercase font-display transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTheListEntries(prev => prev.map(entry => 
                      entry.id === noteEntry.id 
                        ? { ...entry, note: noteText.trim() || undefined } 
                        : entry
                    ));
                    triggerToast(`Nota de ${noteEntry.nome} atualizada!`);
                    setNoteEntry(null);
                  }}
                  className="bg-brand-primary text-black hover:brightness-110 px-4 py-2.5 rounded-xl text-[10px] font-black tracking-wider uppercase font-display transition-all gold-glow cursor-pointer"
                >
                  Salvar Nota
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
