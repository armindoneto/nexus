import React, { useState, useMemo } from 'react';
import { 
  Sparkles, 
  Search, 
  Plus, 
  Trash2, 
  X, 
  Edit2, 
  Check, 
  Filter, 
  AlertCircle,
  FileText,
  Compass,
  Smile,
  MessageSquare,
  CheckCircle2,
  HelpCircle,
  ChevronDown
} from 'lucide-react';
import { PokopiaEntry, PokopiaHabitat, PokopiaComfort, PokopiaScreenProps } from '../types';

export const POKOPIA_HABITATS: PokopiaHabitat[] = [
  'Withered Wastelands',
  'Rocky Ridges',
  'Bleak Beach',
  'Sparkling Skylands',
  'Pallet Town',
  'Befriended',
  'Not Met'
];

export const POKOPIA_COMFORTS: { value: PokopiaComfort; label: string }[] = [
  { value: '', label: '— Vazio —' },
  { value: 'Awesome', label: 'Awesome' },
  { value: 'Great', label: 'Great' },
  { value: 'Nice', label: 'Nice' },
  { value: 'Average', label: 'Average' },
  { value: 'Iffy', label: 'Iffy' }
];

// Helper colors for Habitat
export const getHabitatBadgeStyle = (habitat: PokopiaHabitat) => {
  switch (habitat) {
    case 'Befriended':
      return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40';
    case 'Not Met':
      return 'bg-neutral-800/80 text-neutral-400 border-neutral-700/50';
    case 'Pallet Town':
      return 'bg-blue-500/15 text-blue-400 border-blue-500/40';
    case 'Withered Wastelands':
      return 'bg-amber-600/15 text-amber-400 border-amber-600/40';
    case 'Rocky Ridges':
      return 'bg-stone-500/15 text-stone-300 border-stone-500/40';
    case 'Bleak Beach':
      return 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40';
    case 'Sparkling Skylands':
      return 'bg-purple-500/15 text-purple-300 border-purple-500/40';
    default:
      return 'bg-white/10 text-white/70 border-white/20';
  }
};

// Helper colors for Comfort
export const getComfortBadgeStyle = (comfort: PokopiaComfort) => {
  switch (comfort) {
    case 'Awesome':
      return 'bg-yellow-500/15 text-yellow-300 border-yellow-500/40';
    case 'Great':
      return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40';
    case 'Nice':
      return 'bg-sky-500/15 text-sky-300 border-sky-500/40';
    case 'Average':
      return 'bg-amber-500/15 text-amber-300 border-amber-500/40';
    case 'Iffy':
      return 'bg-rose-500/15 text-rose-300 border-rose-500/40';
    default:
      return 'bg-white/5 text-text-muted/60 border-outline-variant/30';
  }
};

// Helper button styles for Habitat filter buttons
export const getHabitatFilterButtonStyle = (habitat: PokopiaHabitat, isSelected: boolean) => {
  if (!isSelected) {
    return 'bg-bg-surface-med/40 text-text-muted hover:text-white hover:bg-bg-surface-med/70 border-outline-variant/30';
  }
  switch (habitat) {
    case 'Befriended':
      return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/60 shadow-sm shadow-emerald-500/20';
    case 'Not Met':
      return 'bg-neutral-800 text-neutral-200 border-neutral-600 shadow-sm';
    case 'Pallet Town':
      return 'bg-blue-500/20 text-blue-300 border-blue-500/60 shadow-sm shadow-blue-500/20';
    case 'Withered Wastelands':
      return 'bg-amber-600/20 text-amber-300 border-amber-600/60 shadow-sm shadow-amber-600/20';
    case 'Rocky Ridges':
      return 'bg-stone-500/20 text-stone-200 border-stone-500/60 shadow-sm shadow-stone-500/20';
    case 'Bleak Beach':
      return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/60 shadow-sm shadow-cyan-500/20';
    case 'Sparkling Skylands':
      return 'bg-purple-500/20 text-purple-300 border-purple-500/60 shadow-sm shadow-purple-500/20';
    default:
      return 'bg-white/10 text-white border-white/40 shadow-sm';
  }
};

export const PokopiaScreen: React.FC<PokopiaScreenProps> = ({
  pokopiaEntries,
  setPokopiaEntries,
  triggerToast
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHabitatFilter, setSelectedHabitatFilter] = useState<string>('ALL');

  // Count per habitat for filter buttons
  const habitatCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    POKOPIA_HABITATS.forEach(h => {
      counts[h] = 0;
    });
    pokopiaEntries.forEach(p => {
      counts[p.habitat] = (counts[p.habitat] || 0) + 1;
    });
    return counts;
  }, [pokopiaEntries]);

  // Modal states for adding Pokemon
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [batchInputText, setBatchInputText] = useState('');
  const [ignoreDuplicates, setIgnoreDuplicates] = useState(true);

  // Quick edit Pokémon name state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  // Clear requests confirmation modal state
  const [isClearAllModalOpen, setIsClearAllModalOpen] = useState(false);

  // Calculate parsed valid lines from textarea
  const parsedLines = useMemo(() => {
    return batchInputText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
  }, [batchInputText]);

  // Existing names set for duplicate check
  const existingNamesLower = useMemo(() => {
    return new Set(pokopiaEntries.map(p => p.name.toLowerCase()));
  }, [pokopiaEntries]);

  const newValidLinesCount = useMemo(() => {
    if (!ignoreDuplicates) return parsedLines.length;
    return parsedLines.filter(line => !existingNamesLower.has(line.toLowerCase())).length;
  }, [parsedLines, ignoreDuplicates, existingNamesLower]);

  // Handle batch add
  const handleConfirmBatchAdd = () => {
    if (parsedLines.length === 0) {
      triggerToast('Nenhum Pokémon informado para adicionar.');
      return;
    }

    const seenInBatch = new Set<string>();
    const toAdd: PokopiaEntry[] = [];
    let skippedCount = 0;

    for (const name of parsedLines) {
      const lower = name.toLowerCase();
      if (seenInBatch.has(lower) || (ignoreDuplicates && existingNamesLower.has(lower))) {
        skippedCount++;
        continue;
      }
      seenInBatch.add(lower);

      toAdd.push({
        id: `pkp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        name,
        habitat: 'Not Met',
        comfort: '',
        request: '',
        createdAt: new Date().toISOString()
      });
    }

    if (toAdd.length === 0) {
      triggerToast('Todos os Pokémons informados já estão cadastrados na lista.');
      return;
    }

    setPokopiaEntries(prev => [...prev, ...toAdd]);
    triggerToast(`${toAdd.length} Pokémon(s) adicionado(s) com sucesso!${skippedCount > 0 ? ` (${skippedCount} ignorados por duplicação)` : ''}`);
    setBatchInputText('');
    setIsAddModalOpen(false);
  };

  // Helper card styles based on request checkbox and content
  const getPokemonCardStyle = (entry: PokopiaEntry) => {
    const isChecked = entry.comfort === 'Awesome' || !!entry.requestCompleted;
    const hasRequestText = entry.request.trim().length > 0;

    if (isChecked) {
      // Green card
      return 'bg-emerald-950/40 border-emerald-500/50 hover:border-emerald-400 text-white shadow-emerald-950/20';
    }

    if (hasRequestText && !isChecked) {
      // Red card
      return 'bg-rose-950/40 border-rose-500/50 hover:border-rose-400 text-white shadow-rose-950/20';
    }

    // White card (clean neutral-white card)
    return 'bg-white text-neutral-900 border-white/80 shadow-md';
  };

  // Update entry helpers
  const handleUpdateHabitat = (id: string, newHabitat: PokopiaHabitat) => {
    setPokopiaEntries(prev => prev.map(p => p.id === id ? { ...p, habitat: newHabitat } : p));
  };

  const handleUpdateComfort = (id: string, newComfort: PokopiaComfort) => {
    setPokopiaEntries(prev => prev.map(p => {
      if (p.id !== id) return p;
      const isAwesome = newComfort === 'Awesome';
      return { 
        ...p, 
        comfort: newComfort,
        requestCompleted: isAwesome ? true : p.requestCompleted
      };
    }));
  };

  const handleUpdateRequest = (id: string, newRequest: string) => {
    setPokopiaEntries(prev => prev.map(p => p.id === id ? { ...p, request: newRequest } : p));
  };

  const handleToggleRequestCompleted = (id: string) => {
    setPokopiaEntries(prev => prev.map(p => {
      if (p.id !== id) return p;
      if (p.comfort === 'Awesome') {
        // Se comfort for Awesome, a checkbox está sempre marcada
        return { ...p, requestCompleted: true };
      }
      return { ...p, requestCompleted: !p.requestCompleted };
    }));
  };

  const handleClearRequest = (id: string) => {
    setPokopiaEntries(prev => prev.map(p => p.id === id ? { ...p, request: '' } : p));
    triggerToast('Request removido.');
  };

  const handleStartEditName = (entry: PokopiaEntry) => {
    setEditingId(entry.id);
    setEditingName(entry.name);
  };

  const handleSaveEditName = (id: string) => {
    const trimmed = editingName.trim();
    if (trimmed) {
      setPokopiaEntries(prev => prev.map(p => p.id === id ? { ...p, name: trimmed } : p));
    }
    setEditingId(null);
  };

  const handleClearRequestsAndCheckboxes = () => {
    setPokopiaEntries(prev => prev.map(p => ({
      ...p,
      request: '',
      // Se conforto for Awesome, a checkbox permanece marcada; caso contrário, é desmarcada
      requestCompleted: p.comfort === 'Awesome'
    })));
    setIsClearAllModalOpen(false);
    triggerToast('Requests limpos e checkboxes desmarcadas com sucesso.');
  };

  // Stats calculation
  const stats = useMemo(() => {
    const total = pokopiaEntries.length;
    // Befriended conta todos os Pokémons fora da categoria Not Met
    const befriended = pokopiaEntries.filter(p => p.habitat !== 'Not Met').length;
    const notMet = pokopiaEntries.filter(p => p.habitat === 'Not Met').length;
    const inHabitats = pokopiaEntries.filter(p => p.habitat !== 'Not Met' && p.habitat !== 'Befriended').length;
    const withRequest = pokopiaEntries.filter(p => p.request.trim().length > 0).length;
    const withComfort = pokopiaEntries.filter(p => p.comfort.length > 0).length;

    return { total, befriended, notMet, inHabitats, withRequest, withComfort };
  }, [pokopiaEntries]);

  // Filtered entries
  const filteredEntries = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return pokopiaEntries.filter(entry => {
      // Search
      if (q) {
        const matchesName = entry.name.toLowerCase().includes(q);
        const matchesRequest = entry.request.toLowerCase().includes(q);
        const matchesHabitat = entry.habitat.toLowerCase().includes(q);
        if (!matchesName && !matchesRequest && !matchesHabitat) {
          return false;
        }
      }

      // Habitat filter
      if (selectedHabitatFilter !== 'ALL' && entry.habitat !== selectedHabitatFilter) {
        return false;
      }

      return true;
    });
  }, [pokopiaEntries, searchQuery, selectedHabitatFilter]);

  return (
    <div className="space-y-6 w-full text-left" id="pokopia-main-screen">
      {/* Header Banner */}
      <div className="bg-bg-surface-low border border-outline-variant/40 rounded-3xl p-4 sm:p-5 shadow-xl flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-brand-primary/15 border border-brand-primary/30 flex items-center justify-center text-brand-primary shrink-0">
            <Compass size={20} />
          </div>
          <h2 className="font-display font-black text-xl sm:text-2xl text-white uppercase tracking-wider">
            POKOPIA
          </h2>
        </div>

        {/* Action Buttons aligned to the right margin of the box */}
        <div className="flex items-center gap-2">
          {/* Botão de adicionar apenas com símbolo de + */}
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="w-8 h-8 rounded-xl bg-brand-primary text-black font-black hover:opacity-90 transition-all flex items-center justify-center shadow-md shadow-brand-primary/20 cursor-pointer"
            title="Adicionar Pokémons"
            aria-label="Adicionar Pokémons"
            id="btn-open-add-pokemons"
          >
            <Plus size={18} strokeWidth={3} />
          </button>

          {/* Botão de lixeira: apaga requests e desmarca checkboxes */}
          {pokopiaEntries.length > 0 && (
            <button
              type="button"
              onClick={() => setIsClearAllModalOpen(true)}
              className="w-8 h-8 rounded-xl bg-bg-surface-med/60 border border-outline-variant/30 hover:border-red-500/40 hover:text-red-400 text-text-muted transition-all flex items-center justify-center cursor-pointer"
              title="Limpar todos os requests e desmarcar checkboxes"
              aria-label="Limpar todos os requests e desmarcar checkboxes"
              id="btn-open-clear-all-pokopia"
            >
              <Trash2 size={15} />
            </button>
          )}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4" id="pokopia-metrics-row">
        <div className="bg-bg-surface-low border border-outline-variant/30 rounded-2xl p-4">
          <span className="text-[10px] font-mono font-bold text-text-muted uppercase tracking-wider block mb-1">
            Total
          </span>
          <span className="text-2xl font-display font-black text-white">{stats.total}</span>
        </div>

        <div className="bg-bg-surface-low border border-outline-variant/30 rounded-2xl p-4">
          <span className="text-[10px] font-mono font-bold text-emerald-400/80 uppercase tracking-wider block mb-1">
            Befriended
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-display font-black text-emerald-400">{stats.befriended}</span>
            {stats.total > 0 && (
              <span className="text-xs font-mono text-emerald-400/70 font-semibold">
                ({Math.round((stats.befriended / stats.total) * 100)}%)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Search and Habitat Filter Dropdown Bar */}
      <div className="bg-bg-surface-low border border-outline-variant/40 rounded-3xl p-4 sm:p-5 shadow-lg" id="pokopia-filters-box">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          {/* Search Box */}
          <div className="sm:col-span-7 relative bg-bg-surface-med/40 rounded-2xl border border-outline-variant/30 px-3.5 py-2.5 flex items-center gap-2">
            <Search size={16} className="text-text-muted shrink-0" />
            <input
              type="text"
              placeholder="Buscar por Pokémon ou request..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-xs text-white placeholder-text-muted/60 focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-text-muted hover:text-white text-xs font-mono p-0.5"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Habitat Dropdown Filter */}
          <div className="sm:col-span-5 flex items-center gap-2 bg-bg-surface-med border border-outline-variant/40 rounded-2xl px-3.5 py-2 shadow-inner">
            <Filter size={15} className="text-brand-primary shrink-0" />
            <div className="flex-1 flex flex-col min-w-0">
              <label htmlFor="pokopia-habitat-filter-select" className="text-[10px] font-mono font-bold uppercase tracking-wider text-text-muted leading-tight">
                Habitat:
              </label>
              <div className="relative flex items-center">
                <select
                  id="pokopia-habitat-filter-select"
                  value={selectedHabitatFilter}
                  onChange={e => setSelectedHabitatFilter(e.target.value)}
                  className="w-full appearance-none bg-transparent text-xs font-bold text-text-high focus:outline-none cursor-pointer py-0.5 pr-5"
                >
                  <option value="ALL" className="bg-bg-surface-high text-text-high py-1">
                    Todos os Habitats ({pokopiaEntries.length})
                  </option>
                  {POKOPIA_HABITATS.map(h => (
                    <option key={h} value={h} className="bg-bg-surface-high text-text-high py-1">
                      {h} ({habitatCounts[h] || 0})
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} className="text-text-muted pointer-events-none absolute right-0" />
              </div>
            </div>
            {selectedHabitatFilter !== 'ALL' && (
              <button
                type="button"
                onClick={() => setSelectedHabitatFilter('ALL')}
                className="text-text-muted hover:text-white text-xs font-mono p-1 rounded-lg hover:bg-white/10 shrink-0"
                title="Limpar filtro de habitat"
              >
                <X size={13} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main List Section */}
      {pokopiaEntries.length === 0 ? (
        /* Empty State */
        <div className="bg-bg-surface-low border border-dashed border-outline-variant/50 rounded-3xl p-10 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center text-brand-primary mx-auto">
            <Compass size={32} />
          </div>
          <div className="space-y-1.5 max-w-md mx-auto">
            <h3 className="font-display font-black text-lg text-white">Nenhum Pokémon Cadastrado</h3>
            <p className="text-xs text-text-muted leading-relaxed">
              Carregue a lista de Pokémons do jogo clicando no botão abaixo. Você poderá colar ou digitar a lista com um Pokémon por linha.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="px-5 py-3 rounded-2xl bg-brand-primary text-black font-display font-black text-xs uppercase tracking-wider hover:opacity-90 transition-all inline-flex items-center gap-2 shadow-lg shadow-brand-primary/20 cursor-pointer"
          >
            <Plus size={16} strokeWidth={3} />
            Adicionar Pokémons Agora
          </button>
        </div>
      ) : filteredEntries.length === 0 ? (
        /* No Search Match State */
        <div className="bg-bg-surface-low border border-outline-variant/30 rounded-3xl p-8 text-center space-y-3">
          <p className="text-xs text-text-muted">Nenhum Pokémon corresponde aos filtros selecionados.</p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedHabitatFilter('ALL');
            }}
            className="px-3.5 py-1.5 rounded-xl bg-bg-surface-med border border-outline-variant/30 text-xs text-text-high hover:text-white cursor-pointer"
          >
            Limpar Filtros
          </button>
        </div>
      ) : (
        /* List Cards */
        <div className="space-y-3" id="pokopia-items-cards">
          {/* Table Header (Desktop) */}
          <div className="hidden md:grid md:grid-cols-12 gap-3 px-5 py-2.5 bg-bg-surface-med/30 border border-outline-variant/30 rounded-2xl text-[11px] font-mono font-bold text-text-muted uppercase tracking-wider">
            <div className="col-span-3">Pokémon</div>
            <div className="col-span-3">Habitat</div>
            <div className="col-span-2">Comfort</div>
            <div className="col-span-4">Request & Check</div>
          </div>

          {/* Individual Pokémon Cards with conditional background colors */}
          <div className="space-y-2.5">
            {filteredEntries.map((entry, index) => {
              const isEditing = editingId === entry.id;
              const isChecked = entry.comfort === 'Awesome' || !!entry.requestCompleted;
              const cardBgStyle = getPokemonCardStyle(entry);
              const isWhiteCard = !isChecked && entry.request.trim().length === 0;

              return (
                <div
                  key={entry.id}
                  className={`p-4 sm:px-5 sm:py-3.5 rounded-2xl border transition-all duration-200 flex flex-col md:grid md:grid-cols-12 gap-3 md:items-center ${cardBgStyle}`}
                >
                  {/* Pokémon Name Column */}
                  <div className="col-span-3 flex items-center justify-between md:justify-start gap-2.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`text-[10px] font-mono font-bold w-6 shrink-0 ${isWhiteCard ? 'text-neutral-400' : 'text-white/60'}`}>
                        #{index + 1}
                      </span>
                      {isEditing ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            value={editingName}
                            onChange={e => setEditingName(e.target.value)}
                            className={`border rounded-lg px-2 py-1 text-xs font-bold focus:outline-none ${
                              isWhiteCard 
                                ? 'bg-neutral-100 text-neutral-900 border-neutral-400 focus:border-brand-primary' 
                                : 'bg-black/40 text-white border-brand-primary'
                            }`}
                            autoFocus
                            onKeyDown={e => {
                              if (e.key === 'Enter') handleSaveEditName(entry.id);
                              if (e.key === 'Escape') setEditingId(null);
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveEditName(entry.id)}
                            className="p-1 rounded bg-brand-primary text-black hover:opacity-90"
                            title="Salvar"
                          >
                            <Check size={12} strokeWidth={3} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 min-w-0 group">
                          <span className={`font-display font-black text-sm truncate ${isWhiteCard ? 'text-neutral-950 font-black' : 'text-white'}`}>
                            {entry.name}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleStartEditName(entry)}
                            className={`opacity-0 group-hover:opacity-100 transition-opacity p-0.5 ${
                              isWhiteCard ? 'text-neutral-500 hover:text-neutral-900' : 'text-white/60 hover:text-white'
                            }`}
                            title="Editar nome"
                          >
                            <Edit2 size={11} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Habitat Column */}
                  <div className="col-span-3">
                    <div className="flex items-center gap-2">
                      <span className={`md:hidden text-[10px] font-mono font-bold w-16 shrink-0 ${isWhiteCard ? 'text-neutral-500' : 'text-white/70'}`}>
                        Habitat:
                      </span>
                      <div className="relative w-full flex items-center">
                        <select
                          value={entry.habitat}
                          onChange={e => handleUpdateHabitat(entry.id, e.target.value as PokopiaHabitat)}
                          className={`w-full appearance-none text-xs font-semibold rounded-xl border pl-2.5 pr-6 py-1.5 focus:outline-none transition-colors cursor-pointer ${
                            isWhiteCard
                              ? 'bg-neutral-100 text-neutral-800 border-neutral-300 hover:border-neutral-400'
                              : `${getHabitatBadgeStyle(entry.habitat)} hover:brightness-110`
                          }`}
                        >
                          {POKOPIA_HABITATS.map(h => (
                            <option 
                              key={h} 
                              value={h} 
                              className={isWhiteCard ? 'bg-white text-neutral-900 py-1' : 'bg-bg-surface-high text-text-high py-1'}
                            >
                              {h}
                            </option>
                          ))}
                        </select>
                        <ChevronDown 
                          size={13} 
                          className={`pointer-events-none absolute right-2 ${
                            isWhiteCard ? 'text-neutral-500' : 'text-white/70'
                          }`} 
                        />
                      </div>
                    </div>
                  </div>

                  {/* Comfort Column */}
                  <div className="col-span-2">
                    <div className="flex items-center gap-2">
                      <span className={`md:hidden text-[10px] font-mono font-bold w-16 shrink-0 ${isWhiteCard ? 'text-neutral-500' : 'text-white/70'}`}>
                        Comfort:
                      </span>
                      <div className="relative w-full flex items-center">
                        <select
                          value={entry.comfort}
                          onChange={e => handleUpdateComfort(entry.id, e.target.value as PokopiaComfort)}
                          className={`w-full appearance-none text-xs font-semibold rounded-xl border pl-2.5 pr-6 py-1.5 focus:outline-none transition-colors cursor-pointer ${
                            isWhiteCard
                              ? 'bg-neutral-100 text-neutral-800 border-neutral-300 hover:border-neutral-400'
                              : `${getComfortBadgeStyle(entry.comfort)} hover:brightness-110`
                          }`}
                        >
                          {POKOPIA_COMFORTS.map(c => (
                            <option 
                              key={c.value} 
                              value={c.value} 
                              className={isWhiteCard ? 'bg-white text-neutral-900 py-1' : 'bg-bg-surface-high text-text-high py-1'}
                            >
                              {c.label}
                            </option>
                          ))}
                        </select>
                        <ChevronDown 
                          size={13} 
                          className={`pointer-events-none absolute right-2 ${
                            isWhiteCard ? 'text-neutral-500' : 'text-white/70'
                          }`} 
                        />
                      </div>
                    </div>
                  </div>

                  {/* Request Column + Checkbox on Right */}
                  <div className="col-span-4">
                    <div className="flex items-center gap-2">
                      <span className={`md:hidden text-[10px] font-mono font-bold w-16 shrink-0 ${isWhiteCard ? 'text-neutral-500' : 'text-white/70'}`}>
                        Request:
                      </span>
                      <div className="relative flex-1">
                        <input
                          type="text"
                          placeholder="Adicionar request..."
                          value={entry.request}
                          onChange={e => handleUpdateRequest(entry.id, e.target.value)}
                          className={`w-full text-xs rounded-xl px-2.5 py-1.5 border transition-colors focus:outline-none ${
                            isWhiteCard
                              ? 'bg-neutral-100 text-neutral-900 border-neutral-300 focus:border-brand-primary placeholder-neutral-400'
                              : 'bg-black/30 text-white border-white/20 focus:border-white/50 placeholder-white/40'
                          } ${entry.request.trim() ? 'pr-7' : ''}`}
                        />
                        {entry.request.trim() && (
                          <button
                            type="button"
                            onClick={() => handleClearRequest(entry.id)}
                            className={`absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded cursor-pointer ${
                              isWhiteCard ? 'text-neutral-400 hover:text-red-600' : 'text-white/60 hover:text-red-400'
                            }`}
                            title="Limpar request"
                          >
                            <X size={13} />
                          </button>
                        )}
                      </div>

                      {/* Checkbox / Botão ao lado direito do Request */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (entry.comfort !== 'Awesome') {
                            handleToggleRequestCompleted(entry.id);
                          }
                        }}
                        disabled={entry.comfort === 'Awesome'}
                        className={`flex items-center justify-center w-7 h-7 rounded-xl border select-none shrink-0 transition-all ${
                          isChecked 
                            ? 'bg-emerald-500 border-emerald-400 text-white shadow-sm shadow-emerald-500/30 cursor-pointer' 
                            : isWhiteCard
                              ? 'bg-neutral-100 border-neutral-300 hover:border-neutral-400 text-neutral-300 cursor-pointer'
                              : 'bg-black/30 border-white/30 hover:border-white/60 text-white/20 cursor-pointer'
                        } ${entry.comfort === 'Awesome' ? 'cursor-not-allowed opacity-90' : ''}`}
                        title={
                          entry.comfort === 'Awesome' 
                            ? 'Marcado automaticamente (Comfort: Awesome)' 
                            : isChecked 
                              ? 'Request concluído (Card verde)' 
                              : 'Marcar request como concluído'
                        }
                        aria-label={isChecked ? 'Request concluído' : 'Marcar request como concluído'}
                        role="checkbox"
                        aria-checked={isChecked}
                      >
                        <Check 
                          size={14} 
                          strokeWidth={isChecked ? 3.5 : 2} 
                          className={isChecked ? 'text-white' : 'opacity-0'} 
                        />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODAL: Adicionar Pokémons (Lista com cada linha = 1 Pokémon) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div 
            className="bg-bg-surface-low border border-outline-variant/60 rounded-3xl p-6 w-full max-w-xl shadow-2xl space-y-5 animate-scale-up text-left"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <h3 className="font-display font-black text-lg text-white uppercase tracking-wider flex items-center gap-2">
                  <Compass size={18} className="text-brand-primary" />
                  Carregar Pokémons do Jogo
                </h3>
                <p className="text-xs text-text-muted">
                  Cole ou digite a lista de Pokémons. Cada linha corresponderá a um Pokémon.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-text-muted hover:text-white p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            {/* Explanatory notes */}
            <div className="bg-bg-surface-med/50 border border-outline-variant/30 rounded-2xl p-3 text-[11px] text-text-muted space-y-1">
              <div className="flex items-center gap-1.5 text-text-high font-semibold">
                <AlertCircle size={13} className="text-brand-primary" /> Regras de inicialização:
              </div>
              <p>• Todo Pokémon é adicionado inicialmente com Habitat <strong className="text-white">Not Met</strong>.</p>
              <p>• O parâmetro Comfort inicia <strong className="text-white">vazio</strong>.</p>
              <p>• O parâmetro Request poderá ser preenchido a qualquer momento.</p>
            </div>

            {/* Textarea Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <label className="font-mono font-bold text-text-high uppercase tracking-wider">
                  Lista de Pokémons (uma linha por Pokémon):
                </label>
                <span className="font-mono text-brand-primary font-bold">
                  {parsedLines.length} identificado(s)
                </span>
              </div>
              <textarea
                rows={9}
                value={batchInputText}
                onChange={e => setBatchInputText(e.target.value)}
                placeholder={`Pikachu\nCharmander\nBulbasaur\nSquirtle\nEevee\nSnorlax`}
                className="w-full bg-bg-surface-med/60 border border-outline-variant/40 rounded-2xl p-3.5 text-xs font-mono text-white placeholder-text-muted/40 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
              />
            </div>

            {/* Ignore Duplicates Toggle */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 text-xs text-text-muted cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={ignoreDuplicates}
                  onChange={e => setIgnoreDuplicates(e.target.checked)}
                  className="rounded border-outline-variant bg-bg-surface-med text-brand-primary focus:ring-0 cursor-pointer"
                />
                Ignorar nomes que já estão cadastrados na lista
              </label>

              {ignoreDuplicates && parsedLines.length > 0 && (
                <span className="text-[11px] font-mono text-text-muted">
                  {newValidLinesCount} novos
                </span>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-outline-variant/20">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-bg-surface-med/50 hover:bg-bg-surface-med text-text-muted hover:text-white text-xs font-semibold transition-all"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmBatchAdd}
                disabled={parsedLines.length === 0}
                className="px-5 py-2.5 rounded-xl bg-brand-primary text-black font-display font-black text-xs uppercase tracking-wider hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1.5 shadow-lg shadow-brand-primary/20"
                id="btn-confirm-add-pokemons"
              >
                <CheckCircle2 size={14} strokeWidth={2.5} />
                Adicionar {parsedLines.length > 0 ? `(${newValidLinesCount})` : ''}
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Clear Requests and Checkboxes Confirmation Modal */}
      {isClearAllModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-bg-surface-low border border-amber-500/40 rounded-3xl p-6 w-full max-w-sm shadow-2xl space-y-4 animate-scale-up text-left">
            <h3 className="font-display font-black text-base text-white flex items-center gap-2">
              <AlertCircle size={18} className="text-amber-400" />
              Limpar Requests e Checkboxes
            </h3>
            <p className="text-xs text-text-muted leading-relaxed">
              Deseja apagar os textos de todos os requests e desmarcar as checkboxes de todos os Pokémons?
              <br />
              <span className="text-[11px] text-text-muted/80 block mt-1">
                (Atenção: Pokémons com conforto <strong className="text-amber-400 font-bold">Awesome</strong> permanecerão marcados automaticamente).
              </span>
            </p>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsClearAllModalOpen(false)}
                className="px-3.5 py-2 rounded-xl bg-bg-surface-med text-text-muted hover:text-white text-xs font-semibold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleClearRequestsAndCheckboxes}
                className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white font-display font-black text-xs uppercase tracking-wider cursor-pointer"
              >
                Confirmar e Limpar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
