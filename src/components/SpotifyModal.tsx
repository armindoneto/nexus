import React, { useState } from 'react';
import { X, Upload, Radio, Music, CheckCircle2, AlertTriangle, FileText, Search, RefreshCw } from 'lucide-react';

interface SpotifyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CSVRow {
  trackName: string;
  artistName: string;
  album: string;
  playlistName: string;
  type: string;
  isrc: string;
  spotifyId: string;
}

interface SongGroup {
  id: string;
  trackName: string;
  artistName: string;
  album: string;
  inFavorite: boolean;
  favoritePlaylists: string[];
  otherPlaylists: string[];
}

export default function SpotifyModal({ isOpen, onClose }: SpotifyModalProps) {
  const [fileData, setFileData] = useState<CSVRow[] | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'missing' | 'extra'>('all');

  if (!isOpen) return null;

  const parseCSV = (text: string): CSVRow[] => {
    const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length < 2) return [];

    const parseLine = (line: string): string[] => {
      const result: string[] = [];
      let start = 0;
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        if (line[i] === '"') {
          inQuotes = !inQuotes;
        } else if (line[i] === ',' && !inQuotes) {
          let field = line.substring(start, i).trim();
          if (field.startsWith('"') && field.endsWith('"')) {
            field = field.slice(1, -1).replace(/""/g, '"');
          }
          result.push(field);
          start = i + 1;
        }
      }
      let field = line.substring(start).trim();
      if (field.startsWith('"') && field.endsWith('"')) {
        field = field.slice(1, -1).replace(/""/g, '"');
      }
      result.push(field);
      return result;
    };

    const headers = parseLine(lines[0]).map(h => h.trim().toLowerCase());
    
    const trackIdx = headers.findIndex(h => h.includes('track name') || h === 'track');
    const artistIdx = headers.findIndex(h => h.includes('artist name') || h === 'artist');
    const albumIdx = headers.findIndex(h => h.includes('album'));
    const playlistIdx = headers.findIndex(h => h.includes('playlist name') || h === 'playlist');
    const typeIdx = headers.findIndex(h => h === 'type');
    const isrcIdx = headers.findIndex(h => h === 'isrc');
    const spotifyIdIdx = headers.findIndex(h => h.includes('spotify - id') || h.includes('spotify id') || h === 'id');

    const rows: CSVRow[] = [];
    for (let i = 1; i < lines.length; i++) {
      const cols = parseLine(lines[i]);
      if (cols.length < 2) continue;
      
      const rowType = (cols[typeIdx >= 0 ? typeIdx : 4] || '').trim().toLowerCase();
      const rowIsrc = (cols[isrcIdx >= 0 ? isrcIdx : 5] || '').trim();

      // Ignore rows where Type is "Artist" or "Artists"
      if (rowType === 'artist' || rowType === 'artists' || rowType.startsWith('artist')) {
        continue;
      }

      // Ignore rows where ISRC is empty
      if (!rowIsrc) {
        continue;
      }

      rows.push({
        trackName: cols[trackIdx >= 0 ? trackIdx : 0] || '',
        artistName: cols[artistIdx >= 0 ? artistIdx : 1] || '',
        album: cols[albumIdx >= 0 ? albumIdx : 2] || '',
        playlistName: cols[playlistIdx >= 0 ? playlistIdx : 3] || '',
        type: cols[typeIdx >= 0 ? typeIdx : 4] || '',
        isrc: rowIsrc,
        spotifyId: cols[spotifyIdIdx >= 0 ? spotifyIdIdx : 6] || ''
      });
    }

    return rows;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const parsed = parseCSV(content);
        setFileData(parsed);
      }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    setFileData(null);
    setFileName('');
    setSearchTerm('');
    setActiveTab('all');
  };

  const handleCloseModal = () => {
    handleReset();
    onClose();
  };

  // Group unique songs
  let totalUniqueSongs = 0;
  let missingFavoriteErrors: SongGroup[] = [];
  let extraFavoriteErrors: SongGroup[] = [];

  if (fileData) {
    const songsMap = new Map<string, SongGroup>();

    fileData.forEach(row => {
      const rowType = row.type.trim().toLowerCase();
      if (rowType === 'artist' || rowType === 'artists' || rowType.startsWith('artist')) {
        return;
      }

      if (!row.isrc || row.isrc.trim().length === 0) {
        return;
      }

      const key = (row.spotifyId && row.spotifyId.trim().length > 0)
        ? row.spotifyId.trim()
        : `${row.trackName.trim().toLowerCase()}||${row.artistName.trim().toLowerCase()}`;

      const isFav = row.type.trim().toLowerCase() === 'favorite' || row.playlistName.trim().toLowerCase() === 'favorite songs';

      if (!songsMap.has(key)) {
        songsMap.set(key, {
          id: key,
          trackName: row.trackName || 'Sem título',
          artistName: row.artistName || 'Desconhecido',
          album: row.album || '',
          inFavorite: false,
          favoritePlaylists: [],
          otherPlaylists: []
        });
      }

      const song = songsMap.get(key)!;

      if (isFav) {
        song.inFavorite = true;
        const favName = row.playlistName || 'Favorite Songs';
        if (!song.favoritePlaylists.includes(favName)) {
          song.favoritePlaylists.push(favName);
        }
      } else {
        const plName = row.playlistName || 'Sem playlist';
        if (!song.otherPlaylists.includes(plName)) {
          song.otherPlaylists.push(plName);
        }
      }
    });

    const allSongs = Array.from(songsMap.values());
    // Total de Músicas: apenas as músicas que estão na categoria/playlist Favorite Songs
    totalUniqueSongs = allSongs.filter(s => s.inFavorite).length;

    // Erro de favorito faltando: song present in playlist(s) but not marked as Favorite
    missingFavoriteErrors = allSongs.filter(s => !s.inFavorite);

    // Erro de favorito extra: song marked as Favorite but not in any other playlist
    extraFavoriteErrors = allSongs.filter(s => s.inFavorite && s.otherPlaylists.length === 0);
  }

  const filterSongsByTerm = (list: SongGroup[]) => {
    if (!searchTerm.trim()) return list;
    const term = searchTerm.toLowerCase();
    return list.filter(
      s =>
        s.trackName.toLowerCase().includes(term) ||
        s.artistName.toLowerCase().includes(term) ||
        s.otherPlaylists.some(p => p.toLowerCase().includes(term)) ||
        s.favoritePlaylists.some(p => p.toLowerCase().includes(term))
    );
  };

  const filteredMissing = filterSongsByTerm(missingFavoriteErrors);
  const filteredExtra = filterSongsByTerm(extraFavoriteErrors);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in" id="spotify-modal">
      <div className="bg-bg-surface-low border border-outline-variant/50 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-left" id="spotify-modal-container">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/20 bg-bg-surface-med/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-primary/10 border border-brand-primary/30 flex items-center justify-center text-brand-primary shadow-inner">
              <Radio size={18} />
            </div>
            <div>
              <h3 className="font-display font-black text-sm text-white uppercase tracking-wider flex items-center gap-2">
                Auditoria de Playlists Spotify
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={handleCloseModal}
            className="w-8 h-8 rounded-xl hover:bg-white/10 text-text-muted hover:text-white transition-all flex items-center justify-center cursor-pointer"
            id="btn-close-spotify-modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {!fileData ? (
            /* File Upload State */
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-outline-variant/40 hover:border-brand-primary/60 rounded-3xl p-10 text-center bg-bg-surface-med/20 transition-all space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center text-brand-primary">
                <Upload size={28} />
              </div>

              <label className="px-6 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-primary/90 text-black text-xs font-black uppercase tracking-wider font-display transition-all cursor-pointer shadow-lg hover:shadow-brand-primary/20 flex items-center gap-2">
                <FileText size={15} strokeWidth={2.5} />
                <span>Escolher Arquivo .CSV</span>
                <input
                  type="file"
                  accept=".csv,.txt"
                  className="hidden"
                  onChange={handleFileUpload}
                  id="input-spotify-csv"
                />
              </label>
            </div>
          ) : (
            /* Results View */
            <div className="space-y-6">
              {/* File Info Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-bg-surface-med/30 p-3.5 rounded-2xl border border-outline-variant/30">
                <div className="flex items-center gap-2.5 text-xs font-medium text-white truncate">
                  <FileText size={16} className="text-brand-primary shrink-0" />
                  <span className="font-semibold truncate">{fileName || 'arquivo_spotify.csv'}</span>
                </div>
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-text-muted hover:text-white text-[10px] font-black uppercase tracking-wider font-display transition-all flex items-center gap-1.5 shrink-0 self-start sm:self-auto cursor-pointer"
                  id="btn-reload-spotify-csv"
                >
                  <RefreshCw size={12} /> Carregar outro arquivo
                </button>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="spotify-metrics-cards">
                {/* Total Unique Songs */}
                <div className="bg-bg-surface-med/40 border border-outline-variant/30 rounded-2xl p-4 flex flex-col justify-between space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-text-muted font-display">
                      Total de Músicas
                    </span>
                    <Music size={16} className="text-brand-primary" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black font-display text-white">
                      {totalUniqueSongs.toLocaleString('pt-BR')}
                    </span>
                  </div>
                </div>

                {/* Missing Favorite Error */}
                <div className={`bg-bg-surface-med/40 border rounded-2xl p-4 flex flex-col justify-between space-y-2 ${
                  missingFavoriteErrors.length > 0 ? 'border-amber-500/40 bg-amber-500/5' : 'border-outline-variant/30'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-text-muted font-display">
                      Erro de Favorito Faltando
                    </span>
                    {missingFavoriteErrors.length > 0 ? (
                      <AlertTriangle size={16} className="text-amber-400" />
                    ) : (
                      <CheckCircle2 size={16} className="text-emerald-400" />
                    )}
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className={`text-2xl font-black font-display ${
                      missingFavoriteErrors.length > 0 ? 'text-amber-400' : 'text-emerald-400'
                    }`}>
                      {missingFavoriteErrors.length}
                    </span>
                    <span className="text-[10px] text-text-muted">
                      {missingFavoriteErrors.length === 1 ? 'erro' : 'erros'}
                    </span>
                  </div>
                </div>

                {/* Extra Favorite Error */}
                <div className={`bg-bg-surface-med/40 border rounded-2xl p-4 flex flex-col justify-between space-y-2 ${
                  extraFavoriteErrors.length > 0 ? 'border-amber-500/40 bg-amber-500/5' : 'border-outline-variant/30'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-text-muted font-display">
                      Erro de Favorito Extra
                    </span>
                    {extraFavoriteErrors.length > 0 ? (
                      <AlertTriangle size={16} className="text-amber-400" />
                    ) : (
                      <CheckCircle2 size={16} className="text-emerald-400" />
                    )}
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className={`text-2xl font-black font-display ${
                      extraFavoriteErrors.length > 0 ? 'text-amber-400' : 'text-emerald-400'
                    }`}>
                      {extraFavoriteErrors.length}
                    </span>
                    <span className="text-[10px] text-text-muted">
                      {extraFavoriteErrors.length === 1 ? 'erro' : 'erros'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Error Details Section */}
              <div className="bg-bg-surface-med/20 border border-outline-variant/30 rounded-2xl p-4 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-outline-variant/20 pb-3">
                  {/* Tabs */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab('all')}
                      className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider font-display transition-all cursor-pointer ${
                        activeTab === 'all'
                          ? 'bg-brand-primary text-black'
                          : 'bg-white/5 text-text-muted hover:text-white'
                      }`}
                    >
                      Todos os Erros ({missingFavoriteErrors.length + extraFavoriteErrors.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('missing')}
                      className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider font-display transition-all cursor-pointer ${
                        activeTab === 'missing'
                          ? 'bg-amber-500 text-black'
                          : 'bg-white/5 text-text-muted hover:text-white'
                      }`}
                    >
                      Favorito Faltando ({missingFavoriteErrors.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('extra')}
                      className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider font-display transition-all cursor-pointer ${
                        activeTab === 'extra'
                          ? 'bg-amber-500 text-black'
                          : 'bg-white/5 text-text-muted hover:text-white'
                      }`}
                    >
                      Favorito Extra ({extraFavoriteErrors.length})
                    </button>
                  </div>

                  {/* Search filter */}
                  <div className="flex items-center gap-2 bg-bg-surface-med/50 border border-outline-variant/30 rounded-xl px-3 py-1.5 max-w-xs w-full">
                    <Search size={13} className="text-text-muted shrink-0" />
                    <input
                      type="text"
                      placeholder="Filtrar músicas..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="bg-transparent text-xs text-white placeholder-text-muted/50 outline-none w-full border-none focus:ring-0 p-0"
                    />
                  </div>
                </div>

                {/* Details List */}
                <div className="space-y-4 max-h-[320px] overflow-y-auto pr-1 custom-scrollbar">
                  {/* Missing Favorites Section */}
                  {(activeTab === 'all' || activeTab === 'missing') && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-amber-400 font-display">
                        <AlertTriangle size={12} />
                        <span>Favorito Faltando ({filteredMissing.length})</span>
                      </div>

                      {filteredMissing.length === 0 ? (
                        <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-emerald-400 text-xs text-center flex items-center justify-center gap-2">
                          <CheckCircle2 size={14} />
                          <span>0 - Todas as músicas das playlists constam em Favorite Songs!</span>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 gap-2">
                          {filteredMissing.map((song) => (
                            <div
                              key={`missing-${song.id}`}
                              className="p-3 rounded-xl bg-bg-surface-low border border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                            >
                              <div className="min-w-0 flex-1">
                                <div className="text-xs font-bold text-white truncate">
                                  {song.trackName}
                                </div>
                                <div className="text-[11px] text-text-muted truncate">
                                  {song.artistName} {song.album ? `• ${song.album}` : ''}
                                </div>
                              </div>
                              <div className="text-right shrink-0">
                                <span className="text-[10px] font-mono text-amber-300/90 bg-amber-500/10 px-2 py-1 rounded-md border border-amber-500/20 block truncate max-w-xs">
                                  Playlist: {song.otherPlaylists.join(', ')}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Extra Favorites Section */}
                  {(activeTab === 'all' || activeTab === 'extra') && (
                    <div className="space-y-2 pt-2">
                      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-amber-400 font-display">
                        <AlertTriangle size={12} />
                        <span>Favorito Extra ({filteredExtra.length})</span>
                      </div>

                      {filteredExtra.length === 0 ? (
                        <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-emerald-400 text-xs text-center flex items-center justify-center gap-2">
                          <CheckCircle2 size={14} />
                          <span>0 - Todas as músicas em Favorite Songs também estão em outras playlists!</span>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 gap-2">
                          {filteredExtra.map((song) => (
                            <div
                              key={`extra-${song.id}`}
                              className="p-3 rounded-xl bg-bg-surface-low border border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                            >
                              <div className="min-w-0 flex-1">
                                <div className="text-xs font-bold text-white truncate">
                                  {song.trackName}
                                </div>
                                <div className="text-[11px] text-text-muted truncate">
                                  {song.artistName} {song.album ? `• ${song.album}` : ''}
                                </div>
                              </div>
                              <div className="text-right shrink-0">
                                <span className="text-[10px] font-mono text-amber-300/90 bg-amber-500/10 px-2 py-1 rounded-md border border-amber-500/20 block truncate max-w-xs">
                                  Apenas em: Favorite Songs
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-outline-variant/20 bg-bg-surface-med/30 flex justify-end">
          <button
            type="button"
            onClick={handleCloseModal}
            className="px-5 py-2 rounded-xl bg-bg-surface-med hover:bg-bg-surface-high border border-outline-variant/30 text-text-muted hover:text-white text-[10px] font-black uppercase tracking-wider font-display transition-all cursor-pointer"
            id="btn-close-spotify-footer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
