import React, { useState } from 'react';
import { Trash2, Send, CornerDownLeft, ScrollText, Copy, Check } from 'lucide-react';
import { AppNote } from '../types';

interface NotesScreenProps {
  notes: AppNote[];
  setNotes: React.Dispatch<React.SetStateAction<AppNote[]>>;
  theme?: 'light' | 'dark';
}

export default function NotesScreen({ notes, setNotes, theme = 'dark' }: NotesScreenProps) {
  const [inputText, setInputText] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newNote: AppNote = {
      id: Math.random().toString(36).substring(2, 9),
      text: inputText.trim(),
      createdAt: new Date().toISOString()
    };

    setNotes(prev => [newNote, ...prev]);
    setInputText('');
  };

  const handleDeleteNote = (id: string) => {
    setNotes(prev => prev.filter(note => note.id !== id));
  };

  const handleCopyNote = async (id: string, text: string) => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopiedId(id);
      setTimeout(() => {
        setCopiedId(prev => (prev === id ? null : prev));
      }, 2000);
    } catch (err) {
      console.error('Falha ao copiar nota:', err);
    }
  };

  // Sort notes descending (newest on top)
  const sortedNotes = [...notes].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="w-full space-y-8" id="notes-screen-container">
      {/* New Note Form */}
      <div 
        className="bg-bg-surface-low border border-outline-variant/60 rounded-3xl p-6 shadow-xl space-y-4" 
        id="notes-composer-card"
      >
        <div className="flex items-center gap-2">
          <ScrollText className="text-brand-primary" size={18} />
          <h3 className="text-sm font-bold text-text-high uppercase tracking-wider font-display">
            Criar Nova Nota
          </h3>
        </div>

        <form onSubmit={handleSaveNote} className="space-y-3" id="form-new-note">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="O que está na sua mente? Adicione uma nota, link, lembrete ou pensamento..."
            className="w-full min-h-[110px] bg-bg-surface-med border border-outline-variant/30 hover:border-outline-variant/50 focus:border-brand-primary focus:outline-none rounded-xl p-4 text-xs font-sans text-text-high placeholder:text-text-muted transition-all resize-none leading-relaxed"
            id="input-note-text"
          />

          <div className="flex justify-end" id="notes-action-row">
            <button
              type="submit"
              disabled={!inputText.trim()}
              className={`px-5 py-2.5 rounded-xl text-[10px] font-black tracking-widest uppercase font-display transition-all cursor-pointer flex items-center gap-2 border ${
                inputText.trim()
                  ? 'bg-brand-primary border-brand-primary text-black hover:bg-brand-primary/90 hover:scale-[1.02]'
                  : 'bg-outline-variant/10 border-outline-variant/20 text-text-muted cursor-not-allowed'
              }`}
              id="btn-save-note"
            >
              <span>Salvar Nota</span>
              <Send size={12} />
            </button>
          </div>
        </form>
      </div>

      {/* Forum-style Notes Feed */}
      <div className="space-y-4 text-left" id="notes-feed-container">
        <h4 className="text-[11px] font-black tracking-widest uppercase text-text-muted font-display border-b border-outline-variant/20 pb-2">
          Mural de Notas ({notes.length})
        </h4>

        {sortedNotes.length === 0 ? (
          <div className="text-center py-12" id="notes-empty-state">
            <ScrollText className="mx-auto text-text-muted/30 mb-3" size={36} strokeWidth={1.5} />
            <p className="text-xs text-text-muted font-mono">Nenhuma nota salva ainda. Use o campo acima para salvar sua primeira nota.</p>
          </div>
        ) : (
          <div className="divide-y divide-outline-variant/10" id="forum-notes-list">
            {sortedNotes.map((note) => {
              const dateObj = new Date(note.createdAt);
              const formattedDate = dateObj.toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
              });
              const formattedTime = dateObj.toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit'
              });

              return (
                <div 
                  key={note.id} 
                  className="py-5 flex items-start gap-4 hover:bg-black/[0.01] dark:hover:bg-white/[0.01] transition-colors group"
                  id={`forum-note-${note.id}`}
                >
                  {/* Left Column: Avatar icon or placeholder resembling classic internet forum layout */}
                  <div className="w-8 h-8 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-primary flex items-center justify-center font-display font-extrabold text-[10px] shrink-0">
                    N
                  </div>

                  {/* Middle Column: Note content, headers, date */}
                  <div className="flex-1 space-y-1.5 min-w-0 text-left">
                    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                      <span className="text-[10px] font-black text-brand-primary uppercase tracking-wider font-display">
                        {formattedDate} às {formattedTime}
                      </span>
                    </div>

                    <div className="text-xs text-text-high font-sans leading-relaxed whitespace-pre-wrap font-medium">
                      {note.text}
                    </div>
                  </div>

                  {/* Right Column: Actions (Copy & Delete) */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleCopyNote(note.id, note.text)}
                      className={`p-1.5 rounded-lg transition-all cursor-pointer border ${
                        copiedId === note.id
                          ? 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30'
                          : 'text-text-muted hover:text-brand-primary hover:bg-brand-primary/10 border-transparent hover:border-brand-primary/20'
                      }`}
                      title={copiedId === note.id ? "Copiado!" : "Copiar texto"}
                      aria-label="Copiar texto da nota"
                      id={`btn-copy-note-${note.id}`}
                    >
                      {copiedId === note.id ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                    </button>

                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      className="p-1.5 rounded-lg text-text-muted hover:text-red-500 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all cursor-pointer"
                      title="Excluir nota"
                      aria-label="Excluir nota"
                      id={`btn-delete-note-${note.id}`}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
