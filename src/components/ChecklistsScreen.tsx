import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2, Check, ListChecks, CheckSquare, FileUp, Upload, X } from 'lucide-react';
import { ChecklistsScreenProps, ChecklistItem } from '../types';

export default function ChecklistsScreen({
  checklists,
  setChecklists,
  triggerToast
}: ChecklistsScreenProps) {
  const [newChecklistName, setNewChecklistName] = useState('');
  const [newItemTexts, setNewItemTexts] = useState<Record<string, string>>({});
  const [checkingItems, setCheckingItems] = useState<Record<string, boolean>>({});
  const [importModalChecklistId, setImportModalChecklistId] = useState<string | null>(null);
  const [importText, setImportText] = useState('');

  const handleAddChecklist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChecklistName.trim()) return;

    const exists = checklists.some(
      c => c.name.toLowerCase() === newChecklistName.trim().toLowerCase()
    );
    if (exists) {
      triggerToast('Este checklist já existe!');
      return;
    }

    const newCategory = {
      id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9),
      name: newChecklistName.trim(),
      items: []
    };

    setChecklists([...checklists, newCategory]);
    setNewChecklistName('');
    triggerToast('Checklist criado com sucesso!');
  };

  const handleDeleteChecklist = (id: string) => {
    setChecklists(checklists.filter(c => c.id !== id));
    triggerToast('Checklist removido.');
  };

  const handleAddItem = (checklistId: string) => {
    const text = newItemTexts[checklistId] || '';
    if (!text.trim()) return;

    const updated = checklists.map(c => {
      if (c.id === checklistId) {
        const itemExists = c.items.some(
          item => item.text.toLowerCase() === text.trim().toLowerCase()
        );
        if (itemExists) {
          triggerToast('Este item já está na lista!');
          return c;
        }
        return {
          ...c,
          items: [
            ...c.items,
            {
              id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9),
              text: text.trim(),
              completed: false
            }
          ]
        };
      }
      return c;
    });

    setChecklists(updated);
    setNewItemTexts(prev => ({ ...prev, [checklistId]: '' }));
    triggerToast('Item adicionado!');
  };

  const handleCheckItem = (checklistId: string, itemId: string) => {
    if (checkingItems[itemId]) return;
    setCheckingItems(prev => ({ ...prev, [itemId]: true }));

    setTimeout(() => {
      const updated = checklists.map(c => {
        if (c.id === checklistId) {
          return {
            ...c,
            items: c.items.filter(item => item.id !== itemId)
          };
        }
        return c;
      });
      setChecklists(updated);
      setCheckingItems(prev => {
        const copy = { ...prev };
        delete copy[itemId];
        return copy;
      });
      triggerToast('Item concluído e removido!');
    }, 350);
  };

  const handleConfirmImport = () => {
    if (!importModalChecklistId) return;

    const lines = importText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    if (lines.length === 0) {
      triggerToast('Insira ou carregue ao menos um item para importar.');
      return;
    }

    let addedCount = 0;
    const updated = checklists.map(c => {
      if (c.id === importModalChecklistId) {
        const existingMap = new Set(c.items.map(i => i.text.toLowerCase()));
        const newItems: ChecklistItem[] = [];

        lines.forEach(lineText => {
          if (!existingMap.has(lineText.toLowerCase())) {
            existingMap.add(lineText.toLowerCase());
            newItems.push({
              id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9),
              text: lineText,
              completed: false
            });
            addedCount++;
          }
        });

        return {
          ...c,
          items: [...c.items, ...newItems]
        };
      }
      return c;
    });

    setChecklists(updated);
    setImportModalChecklistId(null);
    setImportText('');
    if (addedCount > 0) {
      triggerToast(`${addedCount} ${addedCount === 1 ? 'item importado' : 'itens importados'} com sucesso!`);
    } else {
      triggerToast('Todos os itens já existiam no checklist.');
    }
  };

  const targetChecklist = checklists.find(c => c.id === importModalChecklistId);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 w-full text-left"
      id="checklists-container"
    >
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-bg-surface-low border border-outline-variant/40 rounded-3xl p-5 shadow-lg" id="checklists-action-bar">
        <div>
          <h3 className="font-display font-black text-xs text-white uppercase tracking-wider flex items-center gap-2">
            <ListChecks size={16} className="text-brand-primary" />
            <span>CHECKLISTS</span>
          </h3>
        </div>
        <form onSubmit={handleAddChecklist} className="w-full sm:max-w-xs flex items-center gap-2 bg-bg-surface-med/30 p-1.5 rounded-xl border border-outline-variant/30 shadow-inner" id="new-checklist-form">
          <input
            type="text"
            placeholder="Nome do checklist..."
            value={newChecklistName}
            onChange={(e) => setNewChecklistName(e.target.value)}
            maxLength={40}
            className="flex-1 bg-transparent text-white placeholder-text-muted/60 text-xs font-semibold px-2.5 outline-none border-none focus:ring-0"
            id="input-checklist-name"
          />
          <button
            type="submit"
            className="px-3.5 py-1.5 bg-brand-primary text-black rounded-lg text-[10px] font-black uppercase tracking-wider font-display hover:bg-brand-primary/95 transition-all flex items-center gap-1 cursor-pointer shrink-0"
            id="btn-add-checklist"
          >
            <Plus size={12} strokeWidth={2.5} /> Adicionar
          </button>
        </form>
      </div>

      {checklists.length === 0 ? (
        <div className="bg-bg-surface-low border border-outline-variant/40 rounded-3xl p-12 text-center max-w-md mx-auto space-y-4 shadow-lg flex flex-col items-center" id="checklists-empty-state">
          <div className="w-12 h-12 bg-brand-primary/10 rounded-xl flex items-center justify-center border border-brand-primary/20">
            <ListChecks size={24} className="text-brand-primary" />
          </div>
          <p className="text-xs text-text-muted leading-relaxed">Nenhum checklist cadastrado. Adicione um checklist acima para começar a organizar suas tarefas!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="checklists-grid">
          {checklists.map(checklist => {
            return (
              <div key={checklist.id} className="bg-bg-surface-low border border-outline-variant/50 rounded-2xl p-5 shadow-lg flex flex-col space-y-4 hover:border-outline-variant transition-all" id={`checklist-card-${checklist.id}`}>
                {/* Card Header */}
                <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3 gap-2">
                  <div className="flex items-center gap-2 truncate min-w-0 flex-1">
                    <CheckSquare size={14} className="text-brand-primary/80 shrink-0" />
                    <h4 className="font-display font-black text-xs text-white uppercase tracking-wider truncate">
                      {checklist.name}
                    </h4>
                    <span className="text-[10px] font-mono text-text-muted bg-bg-surface-med/60 px-1.5 py-0.5 rounded-md border border-outline-variant/30 shrink-0 font-bold">
                      {checklist.items.filter(i => !i.completed).length}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setImportModalChecklistId(checklist.id);
                        setImportText('');
                      }}
                      className="px-2 py-0.5 rounded-lg bg-brand-primary/10 hover:bg-brand-primary/20 text-brand-primary border border-brand-primary/30 text-[9px] font-black uppercase tracking-wider font-display transition-all cursor-pointer flex items-center gap-1 shrink-0"
                      title="Importar lista de itens"
                      id={`btn-import-checklist-${checklist.id}`}
                    >
                      <FileUp size={11} /> Importar
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteChecklist(checklist.id)}
                    className="w-7 h-7 rounded-lg hover:bg-red-500/10 text-text-muted hover:text-red-400 transition-all flex items-center justify-center cursor-pointer border border-transparent hover:border-red-500/15 shrink-0"
                    title="Excluir checklist"
                    id={`btn-delete-checklist-${checklist.id}`}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>

                {/* Add item row */}
                <div className="flex items-center gap-2 bg-bg-surface-med/40 p-1 rounded-xl border border-outline-variant/20">
                  <input
                    type="text"
                    placeholder="Novo item..."
                    value={newItemTexts[checklist.id] || ''}
                    onChange={(e) => setNewItemTexts(prev => ({ ...prev, [checklist.id]: e.target.value }))}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddItem(checklist.id);
                      }
                    }}
                    maxLength={80}
                    className="flex-1 bg-transparent text-white placeholder-text-muted/60 text-xs px-2 py-1 outline-none border-none focus:ring-0"
                    id={`input-item-${checklist.id}`}
                  />
                  <button
                    type="button"
                    onClick={() => handleAddItem(checklist.id)}
                    className="w-7 h-7 bg-brand-primary hover:bg-brand-primary/90 text-black rounded-lg flex items-center justify-center transition-all cursor-pointer shrink-0"
                    id={`btn-add-item-${checklist.id}`}
                  >
                    <Plus size={13} strokeWidth={2.5} />
                  </button>
                </div>

                {/* Items list */}
                <div className="flex-1 space-y-2">
                  {checklist.items.length === 0 ? (
                    <div className="text-center py-6 text-text-muted/40 text-[10px] font-semibold uppercase tracking-wider font-mono">
                      Sem itens pendentes
                    </div>
                  ) : (
                    <AnimatePresence initial={false}>
                      {checklist.items.map(item => {
                        const isChecking = checkingItems[item.id];
                        return (
                          <motion.div
                            key={item.id}
                            initial={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20, height: 0, marginBottom: 0, padding: 0 }}
                            transition={{ duration: 0.2 }}
                            className="flex items-center gap-3 bg-bg-surface-med/25 hover:bg-bg-surface-med/45 px-3 py-2 rounded-xl border border-outline-variant/15 hover:border-outline-variant/30 group transition-all"
                          >
                            <button
                              type="button"
                              onClick={() => handleCheckItem(checklist.id, item.id)}
                              className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                                isChecking
                                  ? 'bg-brand-primary border-brand-primary text-black shadow-[0_0_8px_rgba(var(--brand-primary-rgb),0.5)]'
                                  : 'border-outline-variant hover:border-brand-primary bg-brand-primary/5 text-brand-primary'
                              }`}
                              id={`btn-check-item-${item.id}`}
                            >
                              <Check
                                size={12}
                                strokeWidth={3}
                                className={isChecking ? 'scale-100 text-black' : 'opacity-0 scale-0 group-hover:opacity-60 group-hover:scale-100 transition-all'}
                              />
                            </button>
                            <span
                              onClick={() => handleCheckItem(checklist.id, item.id)}
                              className={`text-xs font-semibold flex-1 truncate cursor-pointer transition-all ${
                                isChecking ? 'line-through text-text-muted/50' : 'text-text-high'
                              }`}
                            >
                              {item.text}
                            </span>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* IMPORT MODAL */}
      {importModalChecklistId && targetChecklist && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fade-in" id="import-checklist-modal">
          <div className="bg-bg-surface-low border border-outline-variant/50 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
              <div className="flex items-center gap-2 truncate pr-2">
                <FileUp size={18} className="text-brand-primary shrink-0" />
                <h3 className="font-display font-black text-xs text-white uppercase tracking-wider truncate">
                  Importar para: {targetChecklist.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setImportModalChecklistId(null);
                  setImportText('');
                }}
                className="w-7 h-7 rounded-lg hover:bg-white/10 text-text-muted hover:text-white transition-all flex items-center justify-center cursor-pointer shrink-0"
                id="btn-close-import-modal"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-text-muted font-display block">
                Cole a lista de itens (um por linha)
              </label>
              <textarea
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder={`Item 1\nItem 2\nItem 3\n...`}
                rows={8}
                className="w-full bg-bg-surface-med/50 border border-outline-variant/30 hover:border-outline-variant/50 focus:border-brand-primary focus:outline-none rounded-xl p-3 text-xs text-white placeholder:text-text-muted/40 transition-all font-mono resize-none"
                id="textarea-import-checklist"
              />
              <div className="flex items-center justify-between text-[10px] text-text-muted">
                <span>Cada linha será inserida como um item individual.</span>
                <label className="cursor-pointer text-brand-primary hover:underline flex items-center gap-1 font-semibold">
                  <Upload size={11} /> Carregar .txt
                  <input
                    type="file"
                    accept=".txt,.csv,.tsv"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          const content = event.target?.result as string;
                          if (content) {
                            setImportText(content);
                          }
                        };
                        reader.readAsText(file);
                      }
                    }}
                  />
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-outline-variant/20">
              <button
                type="button"
                onClick={() => {
                  setImportModalChecklistId(null);
                  setImportText('');
                }}
                className="px-4 py-2 rounded-xl bg-bg-surface-med hover:bg-bg-surface-high border border-outline-variant/30 text-text-muted hover:text-white text-[10px] font-black uppercase tracking-wider font-display transition-all cursor-pointer"
                id="btn-cancel-import-checklist"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmImport}
                className="px-5 py-2 rounded-xl bg-brand-primary hover:bg-brand-primary/90 text-black text-[10px] font-black uppercase tracking-wider font-display transition-all cursor-pointer flex items-center gap-1.5 shadow-md"
                id="btn-confirm-import-checklist"
              >
                <FileUp size={13} strokeWidth={2.5} /> Confirmar Importação
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}


