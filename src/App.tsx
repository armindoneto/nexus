/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence, Reorder, useDragControls } from 'motion/react';
import {
  Utensils,
  ShoppingBag,
  TrendingUp,
  TrendingDown,
  Fuel,
  Tv,
  HeartPulse,
  Gamepad2,
  HelpCircle,
  Home,
  Wallet,
  CreditCard as CardIcon,
  User as UserIcon,
  Search,
  SlidersHorizontal,
  Plus,
  Trash2,
  Edit3,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  FileText,
  CheckCircle2,
  RotateCcw,
  Wrench,
  PlusCircle,
  Percent,
  Banknote,
  DollarSign,
  ArrowDownLeft,
  ArrowUpRight,
  Calendar,
  Landmark,
  GripVertical,
  Clock,
  Flame,
  Cat,
  Zap,
  Settings,
  RefreshCw,
  Sparkles,
  History,
  Briefcase,
  ArrowLeft,
  Receipt,
  Plane,
  ListOrdered,
  AlertTriangle,
  Award,
  X,
  Motorbike,
  ScrollText,
  CalendarDays,
  BookLock,
  Trophy,
  Play,
  Eye,
  EyeOff,
  ListChecks,
  Radio,
  Compass,
  Moon,
  Sun,
  Download,
  Upload
} from 'lucide-react';

import { Transaction, CreditCard, Account, AccountHistoryEntry, UserProfile, ActiveTab, TempCategory, TempEntry, PatrimonyEntry, PlanEntry, PlanCard, FuelEntry, ContrachequeEntry, HistoricoEntry, ME4Exclusion, EscalaTurno, EscalaDay, TheListEntry, GameTrophyEntry, ToPlayConsole, PokemonGeneration, PokemonEntry, SystemVersions, ChecklistCategory, PokopiaEntry } from './types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { getSupabase, isSupabaseConfigured } from './supabase';
import SpotifyModal from './components/SpotifyModal';
import SyncStatusIndicator, { SyncStatusType } from './components/SyncStatusIndicator';
import AccountHistoryModal from './components/AccountHistoryModal';
export interface AppUser {
  uid: string;
  email?: string | null;
  displayName?: string | null;
  photoURL?: string | null;
}
import {
  INITIAL_USER,
  INITIAL_ACCOUNTS,
  INITIAL_TRANSACTIONS,
  INITIAL_CARDS,
  CATEGORIES_WITH_ICONS,
  AVAILABLE_ACCOUNTS
} from './data';
import TransactionForm from './components/TransactionForm';
import CardItem from './components/CardItem';
import PlanScreen from './components/PlanScreen';
import ContrachequeScreen from './components/ContrachequeScreen';
import HistoricoScreen from './components/HistoricoScreen';
import ME4Screen from './components/ME4Screen';
import NotesScreen from './components/NotesScreen';
import EscalaScreen from './components/EscalaScreen';
import TheListScreen from './components/TheListScreen';
import GamesScreen from './components/GamesScreen';
import ChecklistsScreen from './components/ChecklistsScreen';
import { PokopiaScreen } from './components/PokopiaScreen';
import { AppNote } from './types';
import { parseRawGames } from './gamesSeed';
import { RAW_POKEMON_GEN1_TSV } from './pokemonSeed';

export function parseRawPokemonGen1(): PokemonEntry[] {
  const lines = RAW_POKEMON_GEN1_TSV.split('\n');
  return lines.map((line, idx) => {
    const parts = line.split('\t');
    const num = parts[0] || '001';
    const id = parts[1] || num;
    const name = parts[2] || 'Unknown';
    const maleStr = parts[3] || '--';
    const femaleStr = parts[4] || '--';
    const genderlessStr = parts[5] || '--';

    const hasMale = maleStr.trim().toUpperCase() === 'X';
    const hasFemale = (femaleStr.trim().toUpperCase() === 'X' || femaleStr.trim().toUpperCase() === 'F');
    const hasGenderless = genderlessStr.trim().toUpperCase() === 'X';

    return {
      id,
      num,
      name,
      hasMale,
      hasFemale,
      hasGenderless,
      isMaleCaught: false,
      isFemaleCaught: false,
      isGenderlessCaught: false
    };
  });
}


export const ACCOUNT_COLORS = [
  { value: 'brand-primary', label: 'Dourado', bgClass: 'bg-brand-primary' },
  { value: 'emerald-400', label: 'Verde', bgClass: 'bg-emerald-400' },
  { value: 'purple-400', label: 'Roxo', bgClass: 'bg-purple-400' },
  { value: 'blue-400', label: 'Azul', bgClass: 'bg-blue-400' },
  { value: 'red-400', label: 'Vermelho', bgClass: 'bg-red-400' },
  { value: 'orange-400', label: 'Laranja', bgClass: 'bg-orange-400' },
  { value: 'cyan-400', label: 'Ciano', bgClass: 'bg-cyan-400' },
  { value: 'slate-400', label: 'Cinza', bgClass: 'bg-slate-400' },
];

export const getAccountColorClasses = (colorValue?: string) => {
  switch (colorValue) {
    case 'emerald-400': return 'bg-emerald-400 shadow-sm shadow-emerald-400/50';
    case 'purple-400': return 'bg-purple-400 shadow-sm shadow-purple-400/50';
    case 'blue-400': return 'bg-blue-400 shadow-sm shadow-blue-400/50';
    case 'red-400': return 'bg-red-400 shadow-sm shadow-red-400/50';
    case 'orange-400': return 'bg-orange-400 shadow-sm shadow-orange-400/50';
    case 'cyan-400': return 'bg-cyan-400 shadow-sm shadow-cyan-400/50';
    case 'slate-400': return 'bg-slate-400 shadow-sm shadow-slate-400/50';
    case 'brand-primary':
    default:
      return 'bg-brand-primary shadow-sm shadow-brand-primary/50';
  }
};

interface AccountItemProps {
  acc: Account;
  onEdit: (acc: Account) => void;
  onDelete: (acc: Account) => void;
  onViewHistory: (acc: Account) => void;
  onAddBalance: (acc: Account) => void;
  onSubBalance: (acc: Account) => void;
  key?: React.Key;
}

function AccountItem({ acc, onEdit, onDelete, onViewHistory, onAddBalance, onSubBalance }: AccountItemProps) {
  const dragControls = useDragControls();

  return (
    <Reorder.Item
      value={acc}
      dragListener={false}
      dragControls={dragControls}
      className="bg-bg-surface-low border border-outline-variant/50 rounded-xl p-3.5 space-y-2 transition-all hover:border-outline-variant select-none active:cursor-grabbing relative"
      id={`card-account-${acc.id}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Drag Handle */}
          <div
            onPointerDown={(e) => dragControls.start(e)}
            className="cursor-grab active:cursor-grabbing p-1.5 hover:bg-white/5 rounded-lg text-text-muted hover:text-brand-primary transition-colors flex items-center justify-center touch-none mr-0.5"
            title="Arrastar para reordenar"
          >
            <GripVertical size={13} strokeWidth={2.5} />
          </div>
          <div className={`w-1.5 h-1.5 rounded-full ${getAccountColorClasses(acc.color)}`} />
          <span className="text-[11px] font-bold text-white uppercase tracking-wide">{acc.name}</span>
        </div>
        <div className="flex items-center gap-1.5" onPointerDown={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => onViewHistory(acc)}
            className="text-text-muted hover:text-[#ffe08b] p-1 rounded-lg hover:bg-white/5 transition-colors cursor-pointer flex items-center justify-center"
            title="Histórico de modificações"
            id={`btn-history-acc-${acc.id}`}
          >
            <History size={12} />
          </button>
          <button
            type="button"
            onClick={() => onEdit(acc)}
            className="text-text-muted hover:text-brand-primary p-1 rounded-lg hover:bg-white/5 transition-colors cursor-pointer flex items-center justify-center"
            title="Editar conta"
            id={`btn-edit-acc-${acc.id}`}
          >
            <Edit3 size={12} />
          </button>
          <button
            type="button"
            onClick={() => onDelete(acc)}
            className="text-text-muted hover:text-red-400 p-1 rounded-lg hover:bg-red-500/10 transition-colors cursor-pointer flex items-center justify-center"
            title="Remover conta"
            id={`btn-delete-acc-${acc.id}`}
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-base font-bold font-mono text-white tracking-tight mt-0.5">
            R$ {acc.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>

        {/* Botões rápidos ao lado do saldo */}
        <div className="flex gap-1.5 select-none shrink-0" onPointerDown={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => onAddBalance(acc)}
            className="bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 font-extrabold uppercase text-[8px] tracking-wider px-2.5 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-0.5"
            id={`btn-open-add-dialog-${acc.id}`}
          >
            <ArrowUpRight size={10} strokeWidth={3} /> Somar
          </button>
          <button
            type="button"
            onClick={() => onSubBalance(acc)}
            className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 font-extrabold uppercase text-[8px] tracking-wider px-2.5 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-0.5"
            id={`btn-open-sub-dialog-${acc.id}`}
          >
            <ArrowDownLeft size={10} strokeWidth={3} /> Subtrair
          </button>
        </div>
      </div>
    </Reorder.Item>
  );
}

let cachedFabSvg: string | null = null;
const fabSvgListeners = new Set<(svg: string) => void>();

const FABIcon = ({ size = 16, className = '' }: { size?: number, className?: string }) => {
  const [svgContent, setSvgContent] = useState<string>(cachedFabSvg || '');

  useEffect(() => {
    if (cachedFabSvg) {
      setSvgContent(cachedFabSvg);
      return;
    }

    const listener = (svg: string) => setSvgContent(svg);
    fabSvgListeners.add(listener);

    if (fabSvgListeners.size === 1) {
      fetch('/fab.svg')
        .then(res => res.text())
        .then(text => {
          const cleaned = text
            .replace(/width="[^"]*"/, 'width="100%"')
            .replace(/height="[^"]*"/, 'height="100%"');
          cachedFabSvg = cleaned;
          fabSvgListeners.forEach(l => l(cleaned));
          fabSvgListeners.clear();
        })
        .catch(err => {
          console.error('Error loading fab.svg', err);
          fabSvgListeners.clear();
        });
    }

    return () => {
      fabSvgListeners.delete(listener);
    };
  }, []);

  if (!svgContent) {
    return <Briefcase size={size} className={className} />;
  }

  return (
    <div 
      className={`inline-flex items-center justify-center shrink-0 ${className}`}
      style={{ width: size, height: size }}
      dangerouslySetInnerHTML={{ __html: svgContent }}
    />
  );
};

const PokebolaIcon = ({ size = 16, className = '' }: { size?: number, className?: string }) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M2.1 12h5.9" />
      <path d="M16 12h5.9" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
};

export default function App() {
  // --- Firebase Auth & Synced States ---
  const [firebaseUser, setFirebaseUser] = useState<AppUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [dataLoadedFromFirestore, setDataLoadedFromFirestore] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [firestoreWriteError, setFirestoreWriteError] = useState<string | null>(null);
  const [cloudLastSynced, setCloudLastSynced] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatusType>('synced');
  const isInitialSyncMountRef = useRef<boolean>(true);
  const isApplyingRemoteUpdateRef = useRef<boolean>(false);
  const hasLocalPendingEditsRef = useRef<boolean>(false);
  const clientIdRef = useRef<string>((() => {
    try {
      let id = sessionStorage.getItem('nocturne_client_instance_id');
      if (!id) {
        id = `client_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        sessionStorage.setItem('nocturne_client_instance_id', id);
      }
      return id;
    } catch (_) {
      return `client_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    }
  })());
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const lastProcessedUserIdRef = useRef<string | null>(null);
  const lastSavedTimestampRef = useRef<string | null>(null);

  // --- Service Worker & Update States ---
  const [swRegistration, setSwRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [swUpdateAvailable, setSwUpdateAvailable] = useState<boolean>(false);
  const [isCheckingUpdate, setIsCheckingUpdate] = useState<boolean>(false);

  // --- Theme State ---
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    // Padrão: modo claro. Chave 'app-theme-v2' (a antiga 'app-theme' gravava 'dark'
    // automaticamente em todo acesso, o que impediria o novo padrão de valer).
    return (localStorage.getItem('app-theme-v2') as 'dark' | 'light') || 'light';
  });

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
    localStorage.setItem('app-theme-v2', theme);
  }, [theme]);

  // --- Persistent States ---
  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('nocturne_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as UserProfile;
        if (parsed.customMainAccount === 'Aeternum') {
          parsed.customMainAccount = 'Æternum';
        }
        return parsed;
      } catch (_) {}
    }
    return INITIAL_USER;
  });

  const [accounts, setAccounts] = useState<Account[]>(() => {
    const saved = localStorage.getItem('nocturne_accounts');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Account[];
        return parsed.map(acc => {
          let updated = acc.name === 'Aeternum' ? { ...acc, name: 'Æternum' } : acc;
          if (updated.name === 'Repo Nu') {
            updated = { ...updated, name: 'PIX' };
          }
          return updated;
        });
      } catch (_) {}
    }
    return INITIAL_ACCOUNTS;
  });

  const [budgetAccounts, setBudgetAccounts] = useState<Account[]>(() => {
    const saved = localStorage.getItem('nocturne_budget_accounts');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Account[];
        const mapped = parsed.map(a => a.name === 'Repo Nu' ? { ...a, name: 'PIX' } : a);
        const requiredNames = ['Æternum', 'PIX', 'Nubank', 'Pai', 'Mercado Livre'];
        return requiredNames.map((name, index) => {
          const found = mapped.find(a => a.name === name);
          return {
            id: found ? found.id : `b${index + 1}`,
            name,
            balance: found ? found.balance : 0.00
          };
        });
      } catch (_) {}
    }
    return [
      { id: 'b1', name: 'Æternum', balance: 0.00 },
      { id: 'b2', name: 'PIX', balance: 0.00 },
      { id: 'b3', name: 'Nubank', balance: 0.00 },
      { id: 'b4', name: 'Pai', balance: 0.00 },
      { id: 'b5', name: 'Mercado Livre', balance: 0.00 },
    ];
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('nocturne_transactions');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Transaction[];
        return parsed.map(tx => {
          let updated = tx.account === 'Aeternum' ? { ...tx, account: 'Æternum' } : tx;
          if (updated.account === 'Repo Nu') {
            updated = { ...updated, account: 'PIX' };
          }
          return updated;
        });
      } catch (_) {}
    }
    return INITIAL_TRANSACTIONS;
  });

  const [cards, setCards] = useState<CreditCard[]>(() => {
    const saved = localStorage.getItem('nocturne_cards');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as CreditCard[];
        return parsed.map(c => c.brand === 'Aeternum Infinite' ? { ...c, brand: 'Æternum Infinite' } : c);
      } catch (_) {}
    }
    return INITIAL_CARDS;
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>('transacoes'); // Standard initially is 'transacoes' (matches user screenshot)
  const [isAccountsExpanded, setIsAccountsExpanded] = useState(false);

  // --- Search & Filter States ---
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedAccountFilter, setSelectedAccountFilter] = useState<string>('all');
  const [showFilterPopover, setShowFilterPopover] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // --- Custom Period States ---
  const [periodActive, setPeriodActive] = useState<boolean>(() => {
    return localStorage.getItem('nocturne_period_active') === 'true';
  });

  const [periodStart, setPeriodStart] = useState<string>(() => {
    return localStorage.getItem('nocturne_period_start') || '';
  });

  const [periodEnd, setPeriodEnd] = useState<string>(() => {
    return localStorage.getItem('nocturne_period_end') || '';
  });

  const [periodTotal, setPeriodTotal] = useState<number>(() => {
    const saved = localStorage.getItem('nocturne_period_total');
    return saved ? parseFloat(saved) : 0;
  });

  const [isPeriodModalOpen, setIsPeriodModalOpen] = useState(false);
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
  const [isAnalysisView, setIsAnalysisView] = useState(false);

  // --- Navigation & Account Management Screens States ---
  const [activeScreen, setActiveScreen] = useState<
    | 'budget'
    | 'contas'
    | 'plan'
    | 'temp'
    | 'config'
    | 'fab'
    | 'fuel'
    | 'games'
    | 'contracheque'
    | 'missoes'
    | 'me4'
    | 'notes'
    | 'escala'
    | 'thelist'
    | 'checklists'
    | 'pokopia'
  >('budget');

  const [activeModule, setActiveModule] = useState<'finance' | 'fab' | 'fuel' | 'games' | 'tools' | 'system'>('finance');

  const [isFinanceExpanded, setIsFinanceExpanded] = useState(true);
  const [isWorkExpanded, setIsWorkExpanded] = useState(false);
  const [isFuelExpanded, setIsFuelExpanded] = useState(false);
  const [isGamesExpanded, setIsGamesExpanded] = useState(false);
  const [isToolsExpanded, setIsToolsExpanded] = useState(false);
  const [gamesSubmenu, setGamesSubmenu] = useState<'TROPHIES' | 'POKÉMON' | 'TO PLAY'>('TROPHIES');
  const [showMobileSubmenu, setShowMobileSubmenu] = useState(false);
  const [isRefreshingApp, setIsRefreshingApp] = useState(false);
  const [newAccountName, setNewAccountName] = useState('');
  const [newAccountBalance, setNewAccountBalance] = useState('');
  const [newAccountColor, setNewAccountColor] = useState<string>('brand-primary');
  const [isNewAccountModalOpen, setIsNewAccountModalOpen] = useState(false);
  const [isAdjustBalanceModalOpen, setIsAdjustBalanceModalOpen] = useState(false);
  const [selectedAdjustingAccount, setSelectedAdjustingAccount] = useState<Account | null>(null);
  const [adjustingType, setAdjustingType] = useState<'somar' | 'subtrair' | null>(null);
  const [adjustmentAmount, setAdjustmentAmount] = useState('');

  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [isEditAccountModalOpen, setIsEditAccountModalOpen] = useState(false);
  const [editAccountName, setEditAccountName] = useState('');
  const [editAccountBalance, setEditAccountBalance] = useState('');
  const [editAccountColor, setEditAccountColor] = useState<string>('brand-primary');
  const [accountToDelete, setAccountToDelete] = useState<Account | null>(null);

  // --- Account History Logs (Last modifications: soma, subtração, edição) ---
  const [accountHistory, setAccountHistory] = useState<AccountHistoryEntry[]>(() => {
    const saved = localStorage.getItem('nocturne_account_history');
    return saved ? (JSON.parse(saved) as AccountHistoryEntry[]) : [];
  });
  const [selectedHistoryAccount, setSelectedHistoryAccount] = useState<Account | null>(null);
  const [isAccountHistoryModalOpen, setIsAccountHistoryModalOpen] = useState(false);

  const logAccountHistory = (
    accountId: string,
    type: 'soma' | 'subtracao' | 'edicao' | 'criacao',
    previousBalance: number,
    newBalance: number,
    description: string,
    amountChange?: number
  ) => {
    const now = new Date();
    const dateFormatted = `${now.toLocaleDateString('pt-BR')} às ${now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
    const newEntry: AccountHistoryEntry = {
      id: 'acchist_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      accountId,
      type,
      dateFormatted,
      timestamp: now.toISOString(),
      description,
      previousBalance,
      newBalance,
      amountChange
    };

    setAccountHistory(prev => [newEntry, ...prev]);
  };

  // --- Plan/Budget Planning Screen States ---
  const [planEntries, setPlanEntries] = useState<PlanEntry[]>(() => {
    const saved = localStorage.getItem('nocturne_plan_entries');
    const parsed = saved ? JSON.parse(saved) as PlanEntry[] : [];
    const clearedFlag = localStorage.getItem('nocturne_cards_cleared_v10');
    if (!clearedFlag) {
      return parsed.filter(entry => entry.category !== 'cartoes' && !entry.cardId);
    }
    return parsed;
  });
  const [planIncomes, setPlanIncomes] = useState<{ [month: string]: number }>(() => {
    const saved = localStorage.getItem('nocturne_plan_incomes');
    return saved ? JSON.parse(saved) : {};
  });
  const [planCards, setPlanCards] = useState<PlanCard[]>(() => {
    const clearedFlag = localStorage.getItem('nocturne_cards_cleared_v10');
    if (!clearedFlag) {
      localStorage.setItem('nocturne_cards_cleared_v10', 'true');
      return [];
    }
    const saved = localStorage.getItem('nocturne_plan_cards');
    return saved ? JSON.parse(saved) : [];
  });
  const [activePlanMonth, setActivePlanMonth] = useState<string>(() => {
    const saved = localStorage.getItem('nocturne_active_plan_month');
    if (saved) return saved;
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  useEffect(() => {
    localStorage.setItem('nocturne_active_plan_month', activePlanMonth);
  }, [activePlanMonth]);

  // --- System Versions States ---
  const [systemVersions, setSystemVersions] = useState<SystemVersions>(() => {
    const saved = localStorage.getItem('nocturne_system_versions');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          finance: parsed.finance || 'v8.1.5',
          work: parsed.work || 'v2.0.5',
          fuel: parsed.fuel || 'v2.0.0',
          games: parsed.games || 'v3.1.1',
          tools: parsed.tools || 'v1.0.0',
          app: parsed.app || 'v2.1.9'
        };
      } catch (_) {}
    }
    return {
      finance: 'v8.1.5',
      work: 'v2.0.5',
      fuel: 'v2.0.0',
      games: 'v3.1.1',
      tools: 'v1.0.0',
      app: 'v2.1.9'
    };
  });

  const [isEditVersionsModalOpen, setIsEditVersionsModalOpen] = useState(false);
  const [tempVersionFinance, setTempVersionFinance] = useState('');
  const [tempVersionWork, setTempVersionWork] = useState('');
  const [tempVersionFuel, setTempVersionFuel] = useState('');
  const [tempVersionGames, setTempVersionGames] = useState('');
  const [tempVersionTools, setTempVersionTools] = useState('');
  const [tempVersionApp, setTempVersionApp] = useState('');

  useEffect(() => {
    if (isEditVersionsModalOpen) {
      setTempVersionFinance(systemVersions.finance);
      setTempVersionWork(systemVersions.work);
      setTempVersionFuel(systemVersions.fuel);
      setTempVersionGames(systemVersions.games);
      setTempVersionTools(systemVersions.tools || 'v1.0.0');
      setTempVersionApp(systemVersions.app);
    }
  }, [isEditVersionsModalOpen, systemVersions]);

  useEffect(() => {
    localStorage.setItem('nocturne_system_versions', JSON.stringify(systemVersions));
  }, [systemVersions]);

  // --- Temporary Information Screen States ---
  const [tempCategories, setTempCategories] = useState<TempCategory[]>(() => {
    const saved = localStorage.getItem('nocturne_temp_categories');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [
      {
        id: 'temp-1',
        name: 'Viagem de Fim de Semana',
        entries: [
          { id: 'te-1', description: 'Gasolina', amount: 150.00, date: '21/06/2026' },
          { id: 'te-2', description: 'Pedágio', amount: 22.40, date: '21/06/2026' },
          { id: 'te-3', description: 'Hospedagem', amount: 450.00, date: '21/06/2026' },
        ],
      },
      {
        id: 'temp-2',
        name: 'Churrasco de Aniversário',
        entries: [
          { id: 'te-4', description: 'Carnes', amount: 280.00, date: '21/06/2026' },
          { id: 'te-5', description: 'Bebidas', amount: 120.00, date: '21/06/2026' },
        ],
      }
    ];
  });

  const [isNewTempCategoryModalOpen, setIsNewTempCategoryModalOpen] = useState(false);
  const [newTempCategoryName, setNewTempCategoryName] = useState('');
  const [newEntryDesc, setNewEntryDesc] = useState<{[catId: string]: string}>({});
  const [newEntryAmount, setNewEntryAmount] = useState<{[catId: string]: string}>({});

  // --- Toast notification for micro-interactions ---
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // --- Patrimony History States ---
  const [patrimonyHistory, setPatrimonyHistory] = useState<PatrimonyEntry[]>(() => {
    const saved = localStorage.getItem('nocturne_patrimony_history');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (_) {}
    }
    return [
      { id: 'pe-1', monthYear: '02/2026', amount: 48000.00 },
      { id: 'pe-2', monthYear: '03/2026', amount: 52500.00 },
      { id: 'pe-3', monthYear: '04/2026', amount: 55000.00 },
      { id: 'pe-4', monthYear: '05/2026', amount: 62300.00 },
    ];
  });
  const [fuelEntries, setFuelEntries] = useState<FuelEntry[]>(() => {
    const saved = localStorage.getItem('nocturne_fuel_entries');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (_) {}
    }
    return [];
  });
  const [isPatrimonyModalOpen, setIsPatrimonyModalOpen] = useState(false);
  const [isPatrimonyHistoryView, setIsPatrimonyHistoryView] = useState(false);
  const [showAddPatrimonyForm, setShowAddPatrimonyForm] = useState(false);
  const [newPatrimonyMonthYear, setNewPatrimonyMonthYear] = useState('');
  const [newPatrimonyAmount, setNewPatrimonyAmount] = useState('');

  // Privacy visibility toggles (defaults to hidden on page load, synced across finance header and contas)
  const [showNetWorth, setShowNetWorth] = useState<boolean>(false);
  const showConsolidatedBalance = showNetWorth;

  const toggleNetWorth = () => {
    setShowNetWorth(prev => !prev);
  };
  const toggleConsolidatedBalance = toggleNetWorth;

  // --- Fuel Module States ---
  const [isFuelFormOpen, setIsFuelFormOpen] = useState(false);
  const [fuelDate, setFuelDate] = useState(() => {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yy = String(today.getFullYear()).slice(-2);
    return `${dd}/${mm}/${yy}`;
  });
  const [fuelKm, setFuelKm] = useState('');
  const [fuelQty, setFuelQty] = useState('');
  const [fuelValue, setFuelValue] = useState('');
  const [fuelError, setFuelError] = useState<string | null>(null);
  const [fuelSubView, setFuelSubView] = useState<'list' | 'analysis'>('list');
  const [simulatedConsumption, setSimulatedConsumption] = useState<string>('');
  const [fuelEntryToDelete, setFuelEntryToDelete] = useState<string | null>(null);

  // --- Maintenance States ---
  const [lastMaintenance, setLastMaintenance] = useState<{ date: string; km: string }>(() => {
    const saved = localStorage.getItem('nocturne_last_maintenance');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (_) {}
    }
    return { date: '', km: '' };
  });

  // --- Contracheque States ---
  const [contrachequeEntries, setContrachequeEntries] = useState<ContrachequeEntry[]>(() => {
    const saved = localStorage.getItem('nocturne_contracheque_entries');
    if (saved) {
      try {
        return JSON.parse(saved) as ContrachequeEntry[];
      } catch (_) {}
    }
    return [];
  });

  const [contrachequeMonth, setContrachequeMonth] = useState<string>(() => {
    const today = new Date();
    let year = today.getFullYear();
    let month = today.getMonth(); // 0-indexed: 0 is Jan, which represents the previous month if we are in Feb (1). If we are in Jan (0), previous month is Dec (12) of prev year
    if (month === 0) {
      month = 12;
      year -= 1;
    }
    const monthFormatted = month < 10 ? `0${month}` : `${month}`;
    return `${year}-${monthFormatted}`;
  });
  const [contrachequeSearchQuery, setContrachequeSearchQuery] = useState('');
  const [contrachequeIsResumoView, setContrachequeIsResumoView] = useState(false);

  // --- Historico States ---
  const [historicoEntries, setHistoricoEntries] = useState<HistoricoEntry[]>(() => {
    const saved = localStorage.getItem('nocturne_historico_entries');
    if (saved) {
      try {
        return JSON.parse(saved) as HistoricoEntry[];
      } catch (_) {}
    }
    return [
      {
        id: 'seed-1',
        category: 'CURSOS',
        name: 'Curso de Aperfeiçoamento de Oficiais',
        location: 'Rio de Janeiro - RJ',
        startDate: '01/03/2025',
        endDate: '15/05/2025',
        travelDays: 2
      },
      {
        id: 'seed-2',
        category: 'MISSÕES',
        name: 'Operação Ostentação',
        location: 'Manaus - AM',
        startDate: '10/10/2025',
        endDate: '25/10/2025',
        travelDays: 4
      },
      {
        id: 'seed-3',
        category: 'INSTRUÇÃO',
        name: 'Instrução de Voo Avançado',
        location: 'Natal - RN',
        startDate: '05/01/2026',
        endDate: '12/01/2026',
        travelDays: 1
      }
    ];
  });
  const [historicoIsAfastamentosView, setHistoricoIsAfastamentosView] = useState(false);

  // --- ME4 States ---
  const [me4Exclusions, setMe4Exclusions] = useState<ME4Exclusion[]>(() => {
    const saved = localStorage.getItem('nocturne_me4_exclusions');
    if (saved) {
      try {
        return JSON.parse(saved) as ME4Exclusion[];
      } catch (_) {}
    }
    return [];
  });

  const [me4Highlights, setMe4Highlights] = useState<string[]>(() => {
    const saved = localStorage.getItem('nocturne_me4_highlights');
    if (saved) {
      try {
        return JSON.parse(saved) as string[];
      } catch (_) {}
    }
    return [];
  });

  const [notes, setNotes] = useState<AppNote[]>(() => {
    const saved = localStorage.getItem('nocturne_notes');
    if (saved) {
      try {
        return JSON.parse(saved) as AppNote[];
      } catch (_) {}
    }
    return [];
  });

  const [checklists, setChecklists] = useState<ChecklistCategory[]>(() => {
    const saved = localStorage.getItem('nocturne_checklists');
    if (saved) {
      try {
        return JSON.parse(saved) as ChecklistCategory[];
      } catch (_) {}
    }
    return [];
  });

  const [pokopiaEntries, setPokopiaEntries] = useState<PokopiaEntry[]>(() => {
    const saved = localStorage.getItem('nocturne_pokopia');
    if (saved) {
      try {
        return JSON.parse(saved) as PokopiaEntry[];
      } catch (_) {}
    }
    return [];
  });

  // --- The List States ---
  const [theListEntries, setTheListEntries] = useState<TheListEntry[]>(() => {
    const saved = localStorage.getItem('nocturne_thelist_entries');
    if (saved) {
      try {
        return JSON.parse(saved) as TheListEntry[];
      } catch (_) {}
    }
    return [];
  });

  // --- Games / Trophy States ---
  const [trophyEntries, setTrophyEntries] = useState<GameTrophyEntry[]>(() => {
    const saved = localStorage.getItem('nocturne_trophy_entries');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as GameTrophyEntry[];
        if (parsed && parsed.length > 0) {
          return parsed;
        }
      } catch (_) {}
    }
    const seeded = parseRawGames();
    localStorage.setItem('nocturne_trophy_entries', JSON.stringify(seeded));
    return seeded;
  });

  const [toPlayConsoles, setToPlayConsoles] = useState<ToPlayConsole[]>(() => {
    const saved = localStorage.getItem('nocturne_toplay_consoles');
    if (saved) {
      try {
        return JSON.parse(saved) as ToPlayConsole[];
      } catch (_) {}
    }
    return [];
  });

  const [pokemonGenerations, setPokemonGenerations] = useState<PokemonGeneration[]>(() => {
    const saved = localStorage.getItem('nocturne_pokemon_generations');
    const freshGen1 = parseRawPokemonGen1();
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as PokemonGeneration[];
        const oldGen1 = parsed.find(g => g.id === 'gen1');
        if (oldGen1) {
          // Always map status from old to fresh to guarantee correct IDs/structure
          freshGen1.forEach(newP => {
            const oldP = oldGen1.pokemons.find(op => 
              op.id === newP.id ||
              op.name === newP.name || 
              op.num === newP.num && op.name.replace(' (F)', '') === newP.name.replace(' (F)', '') ||
              op.id === `p1-${newP.num}` ||
              op.id.includes(`-${newP.num}-`)
            );
            if (oldP) {
              newP.isMaleCaught = !!oldP.isMaleCaught;
              newP.isFemaleCaught = !!oldP.isFemaleCaught;
              newP.isGenderlessCaught = !!oldP.isGenderlessCaught;
              
              // Preserve edited fields
              if (oldP.name !== undefined) newP.name = oldP.name;
              if (oldP.spriteId !== undefined) newP.spriteId = oldP.spriteId;
              if (oldP.hasMale !== undefined) newP.hasMale = oldP.hasMale;
              if (oldP.hasFemale !== undefined) newP.hasFemale = oldP.hasFemale;
              if (oldP.hasGenderless !== undefined) newP.hasGenderless = oldP.hasGenderless;
              if (oldP.type1 !== undefined) newP.type1 = oldP.type1;
              if (oldP.type2 !== undefined) newP.type2 = oldP.type2;
              if (oldP.isLegendary !== undefined) newP.isLegendary = oldP.isLegendary;
              if (oldP.isMythical !== undefined) newP.isMythical = oldP.isMythical;
              if (oldP.isExtraForm !== undefined) newP.isExtraForm = oldP.isExtraForm;
            }
          });

          // Keep any custom added/imported Pokemons in Gen 1
          const freshIds = new Set(freshGen1.map(p => p.id));
          const customPokemons = oldGen1.pokemons.filter(op => !freshIds.has(op.id));
          const mergedPokemons = [...freshGen1, ...customPokemons];

          const index = parsed.findIndex(g => g.id === 'gen1');
          if (index !== -1) {
            parsed[index].pokemons = mergedPokemons;
          }
        } else {
          parsed.push({ id: 'gen1', name: '1ª Geração', pokemons: freshGen1 });
        }
        return parsed;
      } catch (_) {}
    }
    return [
      { id: 'gen1', name: '1ª Geração', pokemons: freshGen1 },
      { id: 'gen2', name: '2ª Geração', pokemons: [] },
      { id: 'gen3', name: '3ª Geração', pokemons: [] },
      { id: 'gen4', name: '4ª Geração', pokemons: [] },
      { id: 'gen5', name: '5ª Geração', pokemons: [] },
      { id: 'gen6', name: '6ª Geração', pokemons: [] },
      { id: 'gen7', name: '7ª Geração', pokemons: [] },
      { id: 'gen8', name: '8ª Geração', pokemons: [] },
      { id: 'gen9', name: '9ª Geração', pokemons: [] }
    ];
  });

  const [theListYearCounts, setTheListYearCounts] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('nocturne_thelist_year_counts');
    if (saved) {
      try {
        return JSON.parse(saved) as Record<string, number>;
      } catch (_) {}
    }
    return {};
  });
  const [isTheListPasswordModalOpen, setIsTheListPasswordModalOpen] = useState(false);
  const [isSpotifyModalOpen, setIsSpotifyModalOpen] = useState(false);
  const [theListPasswordInput, setTheListPasswordInput] = useState('');

  // --- Escala States ---
  const [escalaTurnos, setEscalaTurnos] = useState<EscalaTurno[]>(() => {
    const saved = localStorage.getItem('nocturne_escala_turnos');
    if (saved) {
      try {
        return JSON.parse(saved) as EscalaTurno[];
      } catch (_) {}
    }
    return [];
  });

  const [escalaDays, setEscalaDays] = useState<EscalaDay[]>(() => {
    const saved = localStorage.getItem('nocturne_escala_days');
    if (saved) {
      try {
        return JSON.parse(saved) as EscalaDay[];
      } catch (_) {}
    }
    return [];
  });

  // --- Plan States ---
  const [planMonth, setPlanMonth] = useState<string>(() => {
    const saved = localStorage.getItem('nocturne_active_plan_month');
    if (saved) return saved;
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [planSearchQuery, setPlanSearchQuery] = useState('');

  // Ao entrar no menu PLAN, o mês inicial exibido sempre é o Mês Ativo definido
  useEffect(() => {
    if (activeScreen === 'plan' && activePlanMonth) {
      setPlanMonth(activePlanMonth);
    }
  }, [activeScreen, activePlanMonth]);

  useEffect(() => {
    if (planMonth) {
      const [y, m] = planMonth.split('-');
      setPlanSearchQuery(`${m}/${y}`);
    }
  }, [planMonth]);

  useEffect(() => {
    if (contrachequeMonth) {
      const [y, m] = contrachequeMonth.split('-');
      setContrachequeSearchQuery(`${m}/${y}`);
    }
  }, [contrachequeMonth]);

  const handleContrachequeSearchChange = (val: string) => {
    let clean = val.replace(/[^\d/]/g, '');
    if (clean.length > 2 && !clean.includes('/')) {
      clean = clean.slice(0, 2) + '/' + clean.slice(2);
    }
    clean = clean.slice(0, 7);
    setContrachequeSearchQuery(clean);

    if (clean.length === 7) {
      const match = clean.match(/^(\d{2})\/(\d{4})$/);
      if (match) {
        const m = parseInt(match[1], 10);
        const y = parseInt(match[2], 10);
        if (m >= 1 && m <= 12 && y >= 1900 && y <= 2100) {
          const monthFormatted = m < 10 ? `0${m}` : `${m}`;
          const targetMonth = `${y}-${monthFormatted}`;
          setContrachequeMonth(targetMonth);
          triggerToast(`Exibindo mês ${clean} no Contracheque!`);
        } else {
          triggerToast('Mês inválido (01 a 12).');
        }
      }
    }
  };

  const handlePlanSearchChange = (val: string) => {
    let clean = val.replace(/[^\d/]/g, '');
    if (clean.length > 2 && !clean.includes('/')) {
      clean = clean.slice(0, 2) + '/' + clean.slice(2);
    }
    clean = clean.slice(0, 7);
    setPlanSearchQuery(clean);

    if (clean.length === 7) {
      const match = clean.match(/^(\d{2})\/(\d{4})$/);
      if (match) {
        const m = parseInt(match[1], 10);
        const y = parseInt(match[2], 10);
        if (m >= 1 && m <= 12 && y >= 1900 && y <= 2100) {
          const monthFormatted = m < 10 ? `0${m}` : `${m}`;
          const targetMonth = `${y}-${monthFormatted}`;
          setPlanMonth(targetMonth);
          triggerToast(`Planejamento de ${clean} exibido!`);
        } else {
          triggerToast('Mês inválido (01 a 12).');
        }
      }
    }
  };

  const handleContrachequePrevMonth = () => {
    const [yearStr, monthNumStr] = contrachequeMonth.split('-');
    let year = parseInt(yearStr, 10);
    let month = parseInt(monthNumStr, 10);
    month -= 1;
    if (month < 1) {
      month = 12;
      year -= 1;
    }
    const monthFormatted = month < 10 ? `0${month}` : `${month}`;
    setContrachequeMonth(`${year}-${monthFormatted}`);
  };

  const handleContrachequeNextMonth = () => {
    const [yearStr, monthNumStr] = contrachequeMonth.split('-');
    let year = parseInt(yearStr, 10);
    let month = parseInt(monthNumStr, 10);
    month += 1;
    if (month > 12) {
      month = 1;
      year += 1;
    }
    const monthFormatted = month < 10 ? `0${month}` : `${month}`;
    setContrachequeMonth(`${year}-${monthFormatted}`);
  };

  const handlePlanPrevMonth = () => {
    const [yearStr, monthNumStr] = planMonth.split('-');
    let year = parseInt(yearStr, 10);
    let month = parseInt(monthNumStr, 10);
    month -= 1;
    if (month < 1) {
      month = 12;
      year -= 1;
    }
    const monthFormatted = month < 10 ? `0${month}` : `${month}`;
    setPlanMonth(`${year}-${monthFormatted}`);
  };

  const handlePlanNextMonth = () => {
    const [yearStr, monthNumStr] = planMonth.split('-');
    let year = parseInt(yearStr, 10);
    let month = parseInt(monthNumStr, 10);
    month += 1;
    if (month > 12) {
      month = 1;
      year += 1;
    }
    const monthFormatted = month < 10 ? `0${month}` : `${month}`;
    setPlanMonth(`${year}-${monthFormatted}`);
  };


  const [maintDateInput, setMaintDateInput] = useState(() => {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yy = String(today.getFullYear()).slice(-2);
    return `${dd}/${mm}/${yy}`;
  });
  const [maintKmInput, setMaintKmInput] = useState('');

  // Synchronize localStorage
  useEffect(() => {
    localStorage.setItem('nocturne_contracheque_entries', JSON.stringify(contrachequeEntries));
  }, [contrachequeEntries]);

  useEffect(() => {
    localStorage.setItem('nocturne_historico_entries', JSON.stringify(historicoEntries));
  }, [historicoEntries]);

  useEffect(() => {
    localStorage.setItem('nocturne_me4_exclusions', JSON.stringify(me4Exclusions));
  }, [me4Exclusions]);

  useEffect(() => {
    localStorage.setItem('nocturne_me4_highlights', JSON.stringify(me4Highlights));
  }, [me4Highlights]);

  useEffect(() => {
    localStorage.setItem('nocturne_notes', JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem('nocturne_checklists', JSON.stringify(checklists));
  }, [checklists]);

  useEffect(() => {
    localStorage.setItem('nocturne_pokopia', JSON.stringify(pokopiaEntries));
  }, [pokopiaEntries]);


  useEffect(() => {
    localStorage.setItem('nocturne_thelist_entries', JSON.stringify(theListEntries));
  }, [theListEntries]);

  useEffect(() => {
    localStorage.setItem('nocturne_trophy_entries', JSON.stringify(trophyEntries));
  }, [trophyEntries]);

  useEffect(() => {
    localStorage.setItem('nocturne_toplay_consoles', JSON.stringify(toPlayConsoles));
  }, [toPlayConsoles]);

  useEffect(() => {
    localStorage.setItem('nocturne_pokemon_generations', JSON.stringify(pokemonGenerations));
  }, [pokemonGenerations]);

  useEffect(() => {
    localStorage.setItem('nocturne_thelist_year_counts', JSON.stringify(theListYearCounts));
  }, [theListYearCounts]);

  useEffect(() => {
    localStorage.setItem('nocturne_escala_turnos', JSON.stringify(escalaTurnos));
  }, [escalaTurnos]);

  useEffect(() => {
    localStorage.setItem('nocturne_escala_days', JSON.stringify(escalaDays));
  }, [escalaDays]);

  useEffect(() => {
    localStorage.setItem('nocturne_last_maintenance', JSON.stringify(lastMaintenance));
  }, [lastMaintenance]);

  useEffect(() => {
    localStorage.setItem('nocturne_fuel_entries', JSON.stringify(fuelEntries));
  }, [fuelEntries]);

  useEffect(() => {
    localStorage.setItem('nocturne_user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem('nocturne_patrimony_history', JSON.stringify(patrimonyHistory));
  }, [patrimonyHistory]);

  useEffect(() => {
    localStorage.setItem('nocturne_accounts', JSON.stringify(accounts));
  }, [accounts]);

  useEffect(() => {
    localStorage.setItem('nocturne_account_history', JSON.stringify(accountHistory));
  }, [accountHistory]);

  useEffect(() => {
    localStorage.setItem('nocturne_budget_accounts', JSON.stringify(budgetAccounts));
  }, [budgetAccounts]);

  useEffect(() => {
    localStorage.setItem('nocturne_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('nocturne_cards', JSON.stringify(cards));
  }, [cards]);

  useEffect(() => {
    localStorage.setItem('nocturne_period_active', String(periodActive));
  }, [periodActive]);

  useEffect(() => {
    localStorage.setItem('nocturne_period_start', periodStart);
  }, [periodStart]);

  useEffect(() => {
    localStorage.setItem('nocturne_period_end', periodEnd);
  }, [periodEnd]);

  useEffect(() => {
    localStorage.setItem('nocturne_period_total', String(periodTotal));
  }, [periodTotal]);

  useEffect(() => {
    localStorage.setItem('nocturne_temp_categories', JSON.stringify(tempCategories));
  }, [tempCategories]);

  useEffect(() => {
    localStorage.setItem('nocturne_plan_entries', JSON.stringify(planEntries));
  }, [planEntries]);

  useEffect(() => {
    localStorage.setItem('nocturne_plan_incomes', JSON.stringify(planIncomes));
  }, [planIncomes]);

  useEffect(() => {
    localStorage.setItem('nocturne_plan_cards', JSON.stringify(planCards));
  }, [planCards]);

  // Scroll back to top whenever switching menu or screen
  useEffect(() => {
    const scroller = document.getElementById('content-scroller');
    if (scroller) {
      scroller.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [activeScreen, activeModule]);

  // Toast feedback if the app was just refreshed via top icon
  useEffect(() => {
    if (sessionStorage.getItem('nocturne_refreshed_toast')) {
      sessionStorage.removeItem('nocturne_refreshed_toast');
      triggerToast('Aplicativo atualizado com sucesso!');
    }
  }, []);

  // Helper to apply loaded cloud data to state and storage
  const applyLoadedData = (data: any, updatedAt?: string) => {
    if (!data) return;

    // Signal that states are being loaded from remote, not edited locally
    isApplyingRemoteUpdateRef.current = true;

    if (data.user) setUser(data.user);
    if (data.accounts) {
      const loadedAccs = (data.accounts as Account[]).map(acc => {
        let updated = acc.name === 'Aeternum' ? { ...acc, name: 'Æternum' } : acc;
        if (updated.name === 'Repo Nu') {
          updated = { ...updated, name: 'PIX' };
        }
        return updated;
      });
      setAccounts(loadedAccs);
    }
    if (data.accountHistory) {
      setAccountHistory(data.accountHistory);
    }
    if (data.budgetAccounts) {
      const loadedBudgetAccs = (data.budgetAccounts as Account[]).map(acc => acc.name === 'Repo Nu' ? { ...acc, name: 'PIX' } : acc);
      setBudgetAccounts(loadedBudgetAccs);
    }
    if (data.transactions) {
      const loadedTxs = (data.transactions as Transaction[]).map(tx => {
        let updated = tx.account === 'Aeternum' ? { ...tx, account: 'Æternum' } : tx;
        if (updated.account === 'Repo Nu') {
          updated = { ...updated, account: 'PIX' };
        }
        return updated;
      });
      setTransactions(loadedTxs);
    }
    if (data.cards) {
      setCards(data.cards);
    }
    if (data.periodActive !== undefined) setPeriodActive(data.periodActive);
    if (data.periodStart !== undefined) setPeriodStart(data.periodStart);
    if (data.periodEnd !== undefined) setPeriodEnd(data.periodEnd);
    if (data.periodTotal !== undefined) setPeriodTotal(data.periodTotal);
    if (data.tempCategories) {
      setTempCategories(data.tempCategories);
    }
    if (data.patrimonyHistory) {
      setPatrimonyHistory(data.patrimonyHistory);
    }
    
    let finalPlanEntries = data.planEntries || [];
    let finalPlanCards = data.planCards || [];

    if (!data.didClearLegacyCards_v10) {
      finalPlanCards = [];
      finalPlanEntries = finalPlanEntries.filter((entry: any) => entry.category !== 'cartoes' && !entry.cardId);
      localStorage.setItem('nocturne_cards_cleared_v10', 'true');
      triggerToast('Banco de cartões planejado resetado com sucesso!');
    }

    setPlanEntries(finalPlanEntries);
    if (data.planIncomes) {
      setPlanIncomes(data.planIncomes);
    }
    setPlanCards(finalPlanCards);
    if (data.activePlanMonth !== undefined) setActivePlanMonth(data.activePlanMonth);
    if (data.fuelEntries) {
      setFuelEntries((data.fuelEntries as FuelEntry[]).sort((a, b) => a.km - b.km));
    }
    if (data.lastMaintenance !== undefined) {
      setLastMaintenance(data.lastMaintenance);
    }
    if (data.contrachequeEntries !== undefined) {
      setContrachequeEntries(data.contrachequeEntries);
    }
    if (data.historicoEntries !== undefined) {
      setHistoricoEntries(data.historicoEntries);
    }
    if (data.me4Exclusions !== undefined) {
      setMe4Exclusions(data.me4Exclusions);
    }
    if (data.me4Highlights !== undefined) {
      setMe4Highlights(data.me4Highlights);
    }
    if (data.notes !== undefined) {
      setNotes(data.notes);
    }
    if (data.checklists !== undefined) {
      setChecklists(data.checklists);
    }
    if (data.pokopiaEntries !== undefined) {
      setPokopiaEntries(data.pokopiaEntries);
    }
    if (data.escalaTurnos !== undefined) {
      setEscalaTurnos(data.escalaTurnos);
    }
    if (data.escalaDays !== undefined) {
      setEscalaDays(data.escalaDays);
    }
    if (data.theListEntries !== undefined) {
      setTheListEntries(data.theListEntries);
    }
    if (data.theListYearCounts !== undefined) {
      setTheListYearCounts(data.theListYearCounts);
    }
    if (data.trophyEntries !== undefined && data.trophyEntries.length > 0) {
      setTrophyEntries(data.trophyEntries);
    } else {
      setTrophyEntries(parseRawGames());
    }
    if (data.toPlayConsoles !== undefined) {
      setToPlayConsoles(data.toPlayConsoles);
    }
    if (data.pokemonGenerations !== undefined) {
      setPokemonGenerations(data.pokemonGenerations);
    }
    if (data.systemVersions !== undefined) {
      setSystemVersions(data.systemVersions);
    }
    if (updatedAt) {
      setCloudLastSynced(updatedAt);
    }
    setFirestoreWriteError(null);
    setSyncStatus('synced');
    setIsOffline(false);
    hasLocalPendingEditsRef.current = false;

    // Release flag after state batching settles
    setTimeout(() => {
      isApplyingRemoteUpdateRef.current = false;
    }, 800);
  };

  // Refresh handler when user clicks the app icon at the top of the page
  const handleAppRefresh = async () => {
    if (isRefreshingApp) return;
    setIsRefreshingApp(true);

    // Ensure the current activeScreen and activeModule are saved so the reload returns right here
    localStorage.setItem('nocturne_active_screen', activeScreen);
    localStorage.setItem('nocturne_active_module', activeModule);
    sessionStorage.setItem('nocturne_refreshed_toast', 'true');

    triggerToast('Atualizando aplicativo e dados...');

    // Pre-fetch from Supabase to accelerate data sync
    const supabase = getSupabase();
    if (supabase && firebaseUser && firebaseUser.uid !== 'local-user') {
      try {
        const { data: dbData, error: fetchErr } = await supabase
          .from('nocturne_data')
          .select('data, updated_at')
          .eq('user_id', firebaseUser.uid)
          .maybeSingle();

        if (!fetchErr && dbData && dbData.data) {
          applyLoadedData(dbData.data, (dbData as any).updated_at);
        }
      } catch (err) {
        console.warn('Pre-reload cloud sync error:', err);
      }
    }

    // Smooth transition before reloading page
    setTimeout(() => {
      window.location.reload();
    }, 350);
  };

  // --- Supabase Authenticated Sync & Listeners ---
  const handleFirestoreError = (error: unknown, operationType: 'create' | 'update' | 'delete' | 'list' | 'get' | 'write', path: string | null) => {
    const errInfo = {
      error: error instanceof Error ? error.message : String(error),
      authInfo: {
        userId: firebaseUser?.uid,
        email: firebaseUser?.email,
        emailVerified: false,
        isAnonymous: false,
        tenantId: null,
        providerInfo: []
      },
      operationType,
      path
    };
    console.error('Database Error: ', JSON.stringify(errInfo));
    throw new Error(JSON.stringify(errInfo));
  };

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) {
      setAuthLoading(false);
      return;
    }

    const handleUserSession = async (session: any) => {
      const u = session?.user;
      if (u) {
        if (lastProcessedUserIdRef.current === u.id) {
          return;
        }
        lastProcessedUserIdRef.current = u.id;
        setAuthLoading(true);
        const appUserObj = {
          uid: u.id,
          email: u.email,
          displayName: u.user_metadata?.full_name || u.email?.split('@')[0] || 'Usuário',
          photoURL: u.user_metadata?.avatar_url || null
        };
        setFirebaseUser(appUserObj);

        try {
          const { data: dbData, error: fetchErr } = await supabase
            .from('nocturne_data')
            .select('data, updated_at')
            .eq('user_id', u.id)
            .maybeSingle();

          setIsOffline(false);

          if (fetchErr) {
            console.warn("Supabase fetch failed (falling back to offline/local):", fetchErr);
            setFirestoreWriteError(`Falha ao carregar dados do Supabase: ${fetchErr.message}`);
            setIsOffline(true);
            setSyncStatus('error');
            setDataLoadedFromFirestore(true);
            setAuthLoading(false);
            return;
          }

          if (dbData && (dbData as any).updated_at) {
            setCloudLastSynced((dbData as any).updated_at);
            lastSavedTimestampRef.current = (dbData as any).updated_at;
          } else {
            const now = new Date().toISOString();
            setCloudLastSynced(now);
            lastSavedTimestampRef.current = now;
          }
          setSyncStatus('synced');

          if (!dbData) {
            // Document doesn't exist yet, insert initial state
            const initialSyncData = {
              user,
              accounts,
              accountHistory,
              budgetAccounts,
              transactions,
              cards,
              periodActive,
              periodStart,
              periodEnd,
              periodTotal,
              tempCategories,
              patrimonyHistory,
              fuelEntries,
              lastMaintenance,
              contrachequeEntries,
              historicoEntries,
              me4Exclusions,
              notes,
              checklists,
              pokopiaEntries,
              planEntries,
              planIncomes,
              planCards,
              activePlanMonth,
              escalaTurnos,
              escalaDays,
              theListEntries,
              theListYearCounts,
              trophyEntries,
              toPlayConsoles,
              pokemonGenerations,
              systemVersions,
              didClearLegacyCards_v8: true,
              didClearLegacyCards_v9: true,
              didClearLegacyCards_v10: true
            };
            
            const { error: insertErr } = await supabase
              .from('nocturne_data')
              .insert({
                user_id: u.id,
                data: JSON.parse(JSON.stringify(initialSyncData))
              });

            if (insertErr) {
              console.warn("Supabase insert failed (using local storage):", insertErr);
              setFirestoreWriteError(`Falha ao inicializar dados na nuvem: ${insertErr.message}`);
            } else {
              setFirestoreWriteError(null);
            }
            setDataLoadedFromFirestore(true);
            setAuthLoading(false);
            return;
          }

          if (dbData && dbData.data) {
            applyLoadedData(dbData.data, (dbData as any).updated_at);
          }
          setDataLoadedFromFirestore(true);
        } catch (err: any) {
          console.warn('Error fetching Supabase data (using local storage):', err);
          setFirestoreWriteError(`Falha ao sincronizar dados com o Supabase: ${err.message}`);
          setIsOffline(true);
          setSyncStatus('error');
          setDataLoadedFromFirestore(true);
        } finally {
          setAuthLoading(false);
        }
      } else {
        lastProcessedUserIdRef.current = null;
        setFirebaseUser(null);
        setDataLoadedFromFirestore(false);
        setSyncStatus('offline');
        setAuthLoading(false);
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      handleUserSession(session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Supabase Realtime: Listen for real-time changes across devices/instances
  useEffect(() => {
    if (!firebaseUser || firebaseUser.uid === 'local-user' || !dataLoadedFromFirestore) {
      return;
    }

    const supabase = getSupabase();
    if (!supabase) return;

    // Connect to Supabase Realtime publication on nocturne_data table for current user
    const channelName = `realtime-nocturne-${firebaseUser.uid}`;
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'nocturne_data',
          filter: `user_id=eq.${firebaseUser.uid}`
        },
        (payload: any) => {
          const newRow = payload?.new;
          if (!newRow || !newRow.data) return;

          // 1. NEVER process our own writes (guaranteed echo prevention via unique client ID)
          if (newRow.data._client_id && newRow.data._client_id === clientIdRef.current) {
            return;
          }

          // 2. If this client has local pending edits in progress, do NOT wipe them out!
          if (hasLocalPendingEditsRef.current) {
            console.warn('[Supabase Realtime] Alteração remota ignorada momentaneamente pois há edições locais em andamento.');
            return;
          }

          console.log('[Supabase Realtime] Atualização remota recebida de outro dispositivo:', newRow.updated_at);
          lastSavedTimestampRef.current = newRow.updated_at;
          applyLoadedData(newRow.data, newRow.updated_at);
          triggerToast('Dados sincronizados em tempo real!');
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('[Supabase Realtime] Ouvinte Realtime ativo para usuário:', firebaseUser.uid);
        }
      });

    // Auto-sync when tab regains focus or screen wakes up from sleep
    const handleVisibilityOrFocus = async () => {
      if (document.visibilityState === 'visible') {
        // Do NOT overwrite if user has unsaved edits in progress on this device
        if (hasLocalPendingEditsRef.current) {
          return;
        }

        try {
          const { data: dbData } = await supabase
            .from('nocturne_data')
            .select('data, updated_at')
            .eq('user_id', firebaseUser.uid)
            .maybeSingle();

          if (dbData && dbData.data && (dbData as any).updated_at) {
            const remoteClientId = dbData.data._client_id;
            const remoteTimestamp = (dbData as any).updated_at;

            // Only apply if the change came from a DIFFERENT device/tab and has a newer timestamp
            if (
              remoteClientId !== clientIdRef.current &&
              remoteTimestamp !== cloudLastSynced &&
              remoteTimestamp !== lastSavedTimestampRef.current
            ) {
              console.log('[Supabase Realtime] Sincronização ao focar tela/acordar de outro dispositivo:', remoteTimestamp);
              lastSavedTimestampRef.current = remoteTimestamp;
              applyLoadedData(dbData.data, remoteTimestamp);
            }
          }
        } catch (err) {
          console.warn('[Supabase Realtime] Erro ao sincronizar ao focar:', err);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityOrFocus);
    window.addEventListener('focus', handleVisibilityOrFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
      window.removeEventListener('focus', handleVisibilityOrFocus);
      supabase.removeChannel(channel);
    };
  }, [firebaseUser, dataLoadedFromFirestore, cloudLastSynced]);

  // Before unload handler to warn user if changes are still pending saving
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (syncStatus === 'pending' || syncStatus === 'syncing') {
        e.preventDefault();
        e.returnValue = 'Há alterações pendentes sendo salvas na nuvem. Deseja realmente sair?';
        return e.returnValue;
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [syncStatus]);

  // Proactive runtime migration for 'Repo Nu' -> 'PIX'
  useEffect(() => {
    let changed = false;
    const updatedAccounts = accounts.map(acc => {
      if (acc.name === 'Repo Nu') {
        changed = true;
        return { ...acc, name: 'PIX' };
      }
      return acc;
    });
    if (changed) {
      setAccounts(updatedAccounts);
    }
  }, [accounts]);

  useEffect(() => {
    let changed = false;
    const updatedBudgetAccounts = budgetAccounts.map(acc => {
      if (acc.name === 'Repo Nu') {
        changed = true;
        return { ...acc, name: 'PIX' };
      }
      return acc;
    });
    if (changed) {
      setBudgetAccounts(updatedBudgetAccounts);
    }
  }, [budgetAccounts]);

  useEffect(() => {
    let changed = false;
    const updatedTxs = transactions.map(tx => {
      if (tx.account === 'Repo Nu') {
        changed = true;
        return { ...tx, account: 'PIX' };
      }
      return tx;
    });
    if (changed) {
      setTransactions(updatedTxs);
    }
  }, [transactions]);

  // Synchronize with Supabase (Cloud Database)
  useEffect(() => {
    if (!firebaseUser || !dataLoadedFromFirestore) return;
    if (firebaseUser.uid === 'local-user') {
      setSyncStatus('offline');
      return;
    }

    if (isInitialSyncMountRef.current) {
      isInitialSyncMountRef.current = false;
      return;
    }

    // If state change came from loading remote data, do NOT echo-save it!
    if (isApplyingRemoteUpdateRef.current) {
      return;
    }

    // Mark that the local user has pending unsaved changes
    hasLocalPendingEditsRef.current = true;
    setSyncStatus('pending');

    const timer = setTimeout(async () => {
      setSyncStatus('syncing');
      setSaveLoading(true);
      const supabase = getSupabase();
      if (!supabase) {
        setSaveLoading(false);
        setSyncStatus('error');
        setFirestoreWriteError('Supabase não configurado');
        return;
      }

      try {
        const nowStr = new Date().toISOString();
        const dataToSave = {
          _client_id: clientIdRef.current,
          user,
          accounts,
          accountHistory,
          budgetAccounts,
          transactions,
          cards,
          periodActive,
          periodStart,
          periodEnd,
          periodTotal,
          tempCategories,
          patrimonyHistory,
          fuelEntries,
          lastMaintenance,
          contrachequeEntries,
          historicoEntries,
          me4Exclusions,
          me4Highlights,
          notes,
          checklists,
          pokopiaEntries,
          planEntries,
          planIncomes,
          planCards,
          activePlanMonth,
          escalaTurnos,
          escalaDays,
          theListEntries,
          theListYearCounts,
          trophyEntries,
          toPlayConsoles,
          pokemonGenerations,
          systemVersions,
          didClearLegacyCards_v8: true,
          didClearLegacyCards_v9: true,
          didClearLegacyCards_v10: true
        };

        lastSavedTimestampRef.current = nowStr;
        const { error: saveErr } = await supabase
          .from('nocturne_data')
          .upsert({
            user_id: firebaseUser.uid,
            data: JSON.parse(JSON.stringify(dataToSave)),
            updated_at: nowStr
          });

        if (saveErr) {
          console.warn("Supabase upsert failed (retaining offline copy):", saveErr);
          setFirestoreWriteError(`Falha ao salvar dados na nuvem: ${saveErr.message}`);
          setIsOffline(true);
          setSyncStatus('error');
        } else {
          setIsOffline(false);
          setFirestoreWriteError(null);
          setCloudLastSynced(nowStr);
          setSyncStatus('synced');
          hasLocalPendingEditsRef.current = false;
        }
      } catch (err: any) {
        console.warn('Error saving data to Supabase (using local fallback):', err);
        setFirestoreWriteError(`Erro ao conectar ao Supabase: ${err.message}`);
        setSyncStatus('error');
      } finally {
        setSaveLoading(false);
      }
    }, 600); // Fast 600ms debounce ensures rapid persistence without race conditions

    return () => clearTimeout(timer);
  }, [
    firebaseUser,
    dataLoadedFromFirestore,
    user,
    accounts,
    accountHistory,
    budgetAccounts,
    transactions,
    cards,
    periodActive,
    periodStart,
    periodEnd,
    periodTotal,
    tempCategories,
    patrimonyHistory,
    planEntries,
    planIncomes,
    planCards,
    fuelEntries,
    lastMaintenance,
    contrachequeEntries,
    historicoEntries,
    me4Exclusions,
    me4Highlights,
    notes,
    checklists,
    pokopiaEntries,
    activePlanMonth,
    escalaTurnos,
    escalaDays,
    theListEntries,
    theListYearCounts,
    trophyEntries,
    toPlayConsoles,
    pokemonGenerations,
    systemVersions
  ]);

  // One-time automatic migration to clean up duplicate cards in Firebase / LocalStorage
  useEffect(() => {
    if (!dataLoadedFromFirestore) return;

    const needsMigration = planCards.some(card => !card.months);
    if (!needsMigration) return;

    setPlanCards(prev => {
      return prev.map(card => {
        if (!card.months) {
          const usedMonths = Array.from(new Set(
            planEntries
              .filter(entry => entry.cardId === card.id)
              .map(entry => entry.month)
          ));
          return {
            ...card,
            months: usedMonths.length > 0 ? usedMonths : ['2026-06']
          };
        }
        return card;
      });
    });

    triggerToast('Planejamento de cartões otimizado e limpo com sucesso!');
  }, [dataLoadedFromFirestore, planEntries, planCards]);

  const handleGoogleSignIn = async () => {
    const supabase = getSupabase();
    if (!supabase) {
      triggerToast('Supabase não configurado.');
      return;
    }
    try {
      setAuthLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) throw error;
    } catch (err: any) {
      console.error('Google login error:', err);
      triggerToast(`Falha ao autenticar com Google: ${err.message}`);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput || !passwordInput) {
      triggerToast('Por favor, preencha o e-mail e a senha.');
      return;
    }
    const supabase = getSupabase();
    if (!supabase) {
      triggerToast('Supabase não configurado.');
      return;
    }
    try {
      setAuthLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email: emailInput,
        password: passwordInput,
      });
      if (error) throw error;
      triggerToast('Sessão iniciada com sucesso!');
    } catch (err: any) {
      console.error('Email sign in error:', err);
      if (err.message && (err.message.includes('Email not confirmed') || err.message.includes('not confirmed'))) {
        triggerToast('E-mail não verificado! Verifique seu e-mail para ativar a conta, ou desative "Confirm email" no painel do Supabase (Auth > Providers > Email).');
      } else {
        triggerToast(`Erro ao entrar: ${err.message || err.error_description || 'Senha inválida ou usuário não cadastrado.'}`);
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput || !passwordInput) {
      triggerToast('Por favor, preencha o e-mail e a senha.');
      return;
    }
    if (passwordInput.length < 6) {
      triggerToast('A senha precisa ter pelo menos 6 caracteres.');
      return;
    }
    const supabase = getSupabase();
    if (!supabase) {
      triggerToast('Supabase não configurado.');
      return;
    }
    try {
      setAuthLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email: emailInput,
        password: passwordInput,
      });
      if (error) throw error;
      
      if (data?.session) {
        triggerToast('Conta criada e logada com sucesso!');
      } else {
        triggerToast('Conta criada! Se o Supabase exigir confirmação por e-mail, confirme-o antes de tentar entrar.');
      }
    } catch (err: any) {
      console.error('Email sign up error:', err);
      triggerToast(`Erro ao cadastrar: ${err.message || err.error_description || 'Falha ao realizar cadastro.'}`);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      setAuthLoading(true);
      const supabase = getSupabase();
      if (supabase && firebaseUser && firebaseUser.uid !== 'local-user') {
        // Save current states to Supabase before logging out to prevent loss of recent modifications
        const dataToSave = {
          _client_id: clientIdRef.current,
          user,
          accounts,
          budgetAccounts,
          transactions,
          cards,
          periodActive,
          periodStart,
          periodEnd,
          periodTotal,
          tempCategories,
          patrimonyHistory,
          fuelEntries,
          lastMaintenance,
          contrachequeEntries,
          historicoEntries,
          me4Exclusions,
          me4Highlights,
          notes,
          checklists,
          pokopiaEntries,
          planEntries,
          planIncomes,
          planCards,
          activePlanMonth,
          escalaTurnos,
          escalaDays,
          theListEntries,
          theListYearCounts,
          trophyEntries,
          toPlayConsoles,
          pokemonGenerations,
          systemVersions,
          didClearLegacyCards_v8: true,
          didClearLegacyCards_v9: true,
          didClearLegacyCards_v10: true
        };
        const nowStr = new Date().toISOString();
        lastSavedTimestampRef.current = nowStr;
        const { error: saveErr } = await supabase
          .from('nocturne_data')
          .upsert({
            user_id: firebaseUser.uid,
            data: JSON.parse(JSON.stringify(dataToSave)),
            updated_at: nowStr
          });
        if (saveErr) {
          console.error("Save on sign out failed:", saveErr);
        }
      }
      if (supabase) {
        await supabase.auth.signOut();
      }
      // Reset to initials on logout
      setUser(INITIAL_USER);
      setAccounts(INITIAL_ACCOUNTS);
      setBudgetAccounts([
        { id: 'b1', name: 'Æternum', balance: 0.00 },
        { id: 'b2', name: 'PIX', balance: 0.00 },
        { id: 'b3', name: 'Nubank', balance: 0.00 },
        { id: 'b4', name: 'Pai', balance: 0.00 },
        { id: 'b5', name: 'Mercado Livre', balance: 0.00 },
      ]);
      setTransactions(INITIAL_TRANSACTIONS);
      setCards(INITIAL_CARDS);
      setPeriodActive(false);
      setPeriodStart('');
      setPeriodEnd('');
      setPeriodTotal(0);
      setTempCategories([]);
      setMe4Exclusions([]);
      setMe4Highlights([]);
      setTheListEntries([]);
      setTheListYearCounts({});
      setTrophyEntries(parseRawGames());
      setPatrimonyHistory([
        { id: 'pe-1', monthYear: '02/2026', amount: 48000.00 },
        { id: 'pe-2', monthYear: '03/2026', amount: 52500.00 },
        { id: 'pe-3', monthYear: '04/2026', amount: 55000.00 },
        { id: 'pe-4', monthYear: '05/2026', amount: 62300.00 },
      ]);
      triggerToast('Sessão encerrada com sucesso.');
    } catch (err) {
      console.error('Logout error:', err);
      triggerToast('Erro ao encerrar sessão.');
    } finally {
      setAuthLoading(false);
    }
  };

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // --- Service Worker Lifecycle & Action Listeners ---
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          setSwRegistration(registration);

          // Check for waiting update immediately
          if (registration.waiting) {
            setSwUpdateAvailable(true);
          }

          // Monitor for future service worker updates
          registration.addEventListener('updatefound', () => {
            const installing = registration.installing;
            if (installing) {
              installing.addEventListener('statechange', () => {
                if (installing.state === 'installed' && navigator.serviceWorker.controller) {
                  setSwUpdateAvailable(true);
                }
              });
            }
          });
        })
        .catch((error) => {
          console.warn('Service Worker registration skipped or failed:', error);
        });

      // Reload upon successful SKIP_WAITING claim
      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          refreshing = true;
          window.location.reload();
        }
      });
    }
  }, []);

  const handleUpdateApp = () => {
    if (swRegistration && swRegistration.waiting) {
      swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
    } else {
      window.location.reload();
    }
  };

  const checkServiceWorkerUpdate = async () => {
    if (!('serviceWorker' in navigator)) {
      triggerToast('Service Worker não suportado neste navegador.');
      return;
    }
    setIsCheckingUpdate(true);
    try {
      if (swRegistration) {
        await swRegistration.update();
        if (swRegistration.waiting) {
          setSwUpdateAvailable(true);
          triggerToast('Nova versão encontrada!');
        } else {
          triggerToast('O aplicativo já está na versão mais recente.');
        }
      } else {
        const reg = await navigator.serviceWorker.getRegistration();
        if (reg) {
          setSwRegistration(reg);
          await reg.update();
          if (reg.waiting) {
            setSwUpdateAvailable(true);
            triggerToast('Nova versão encontrada!');
          } else {
            triggerToast('O aplicativo já está na versão mais recente.');
          }
        } else {
          triggerToast('Service worker temporariamente indisponível.');
        }
      }
    } catch (err) {
      console.warn('Manual update check error:', err);
      triggerToast('Nenhuma nova atualização disponível no servidor.');
    } finally {
      setTimeout(() => {
        setIsCheckingUpdate(false);
      }, 800);
    }
  };

  const totalPeriodDays = useMemo(() => {
    if (!periodStart || !periodEnd) return 1;
    const s = new Date(periodStart + 'T00:00:00');
    const e = new Date(periodEnd + 'T00:00:00');
    const diffTime = e.getTime() - s.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return isNaN(diffDays) || diffDays <= 0 ? 1 : diffDays;
  }, [periodStart, periodEnd]);

  const elapsedDays = useMemo(() => {
    if (!periodActive || !periodStart || !periodEnd) return 1;
    const start = new Date(periodStart + 'T00:00:00');
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(periodEnd + 'T00:00:00');
    end.setHours(0, 0, 0, 0);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (today < start) {
      return 1;
    }
    if (today > end) {
      return totalPeriodDays;
    }
    
    const diffTime = today.getTime() - start.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return isNaN(diffDays) || diffDays <= 0 ? 1 : diffDays;
  }, [periodActive, periodStart, periodEnd, totalPeriodDays]);

  const daysRemaining = useMemo(() => {
    if (!periodActive || !periodEnd) return 1;
    const end = new Date(periodEnd + 'T00:00:00');
    end.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (today > end) {
      return 1;
    }
    
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return isNaN(diffDays) || diffDays < 1 ? 1 : diffDays;
  }, [periodActive, periodEnd]);

  // --- Dynamic Accounting Calculus ---
  const totalBalance = useMemo(() => {
    return accounts.reduce((acc, curr) => acc + curr.balance, 0);
  }, [accounts]);

  const contrachequeTotalNet = useMemo(() => {
    return contrachequeEntries
      .reduce((acc, entry) => {
        if (entry.type === 'receita') {
          return acc + entry.amount;
        } else if (entry.type === 'despesa') {
          return acc - entry.amount;
        }
        return acc;
      }, 0);
  }, [contrachequeEntries]);

  const remainingTotalPeriodBudget = useMemo(() => {
    if (!periodActive) return periodTotal;
    const currentTransactionsSum = transactions.reduce((sum, t) => sum + t.amount, 0);
    return periodTotal + currentTransactionsSum;
  }, [transactions, periodActive, periodTotal]);

  const saldoDoDia = useMemo(() => {
    if (periodActive) {
      return remainingTotalPeriodBudget / daysRemaining;
    }

    // Current total for today (mock/real computed for the selected newest date '2026-10-24')
    // We sum up the transactions of that specific day
    const newestDate = '2026-10-24';
    const dayConclued = transactions.filter(t => t.date === newestDate);
    // Let's display the constant R$ 2.450,00, but update dynamically if modified/added!
    const updatedTodayOutcome = dayConclued.reduce((sum, t) => sum + t.amount, 0);
    // Absolute representative base value or computed:
    // If user deleted or modified the original items, reflect it. 
    return 2450.00 + (updatedTodayOutcome - (-295.00)); // offset by difference to initial day total
  }, [transactions, periodActive, periodTotal, totalPeriodDays, elapsedDays, remainingTotalPeriodBudget]);

  // Compute daily metrics and projections for the Analysis modal window
  const analysisData = useMemo(() => {
    if (!periodActive || !periodStart || !periodEnd) {
      return {
        initialDailyBudget: 0,
        daysElapsed: 0,
        projectedBudget: 0,
        totalExpenses: 0,
        projectedBalance: 0,
        daysList: []
      };
    }

    const start = new Date(periodStart + 'T00:00:00');
    start.setHours(0, 0, 0, 0);

    const initialDailyBudget = periodTotal / totalPeriodDays;
    // Number of days in the period that have already occurred so far (up to the current day)
    const daysElapsed = Math.max(1, elapsedDays);

    const daysList = [];

    for (let j = 0; j < daysElapsed; j++) {
      const currentDayDateObj = new Date(start.getTime() + j * 24 * 60 * 60 * 1000);
      const year = currentDayDateObj.getFullYear();
      const month = String(currentDayDateObj.getMonth() + 1).padStart(2, '0');
      const dateVal = String(currentDayDateObj.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${dateVal}`;

      // Sum transactions strictly dated before the current day to understand budget at starting moment
      const txsBeforeCurrentDay = transactions.filter(t => t.date < dateStr);
      const accumulatedTxSumBefore = txsBeforeCurrentDay.reduce((sum, t) => sum + t.amount, 0);

      const remainingDaysFromThisDay = totalPeriodDays - j;
      const budgetAtStartOfDay = periodTotal + accumulatedTxSumBefore;
      
      // Saldo do dia assigned immediately as the day started
      const dailySaldoAtStart = remainingDaysFromThisDay > 0 ? (budgetAtStartOfDay / remainingDaysFromThisDay) : 0;

      // Filter all transactions on that specific day
      const dayTransactions = transactions.filter(t => t.date === dateStr);
      
      // Calculate total expense (negative values)
      const dayExpenses = dayTransactions
        .filter(t => t.amount < 0)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);

      // Balance of the day (starting budget minus day expenses)
      const dailyNetBalance = dailySaldoAtStart - dayExpenses;

      daysList.push({
        dayNumber: j + 1,
        dateFormatted: `${dateVal}/${month}/${String(year).substring(2)}`,
        dateStr,
        dailySaldoAtStart,
        dayExpenses,
        dailyNetBalance,
      });
    }

    // Projection calculation:
    // "caso todos os dias tivessem este mesmo valor, qual seria o balanço entre a soma dos saldos do dia ate o momento e o total de despesas realizadas"
    const projectedBudget = initialDailyBudget * daysElapsed;
    const totalExpenses = daysList.reduce((sum, d) => sum + d.dayExpenses, 0);
    const projectedBalance = projectedBudget - totalExpenses;
    const averageDailyExpenses = daysElapsed > 0 ? (totalExpenses / daysElapsed) : 0;

    return {
      initialDailyBudget,
      daysElapsed,
      projectedBudget,
      totalExpenses,
      projectedBalance,
      averageDailyExpenses,
      daysList: daysList.reverse() // show latest days first
    };
  }, [periodActive, periodStart, periodEnd, periodTotal, totalPeriodDays, elapsedDays, transactions]);

  // Chronological data for the daily budget bar chart in Analysis modal
  const chartData = useMemo(() => {
    return [...analysisData.daysList].reverse().map(d => ({
      name: `D${d.dayNumber}`,
      'Limite Atribuído': Number(d.dailySaldoAtStart.toFixed(2)),
    }));
  }, [analysisData.daysList]);

  // Accounts balance map
  const accountsMap = useMemo(() => {
    return new Map(budgetAccounts.map(acc => [acc.name, acc]));
  }, [budgetAccounts]);

  // Category Icon map resolver
  const getCategoryIconAndColor = (category: string) => {
    const found = CATEGORIES_WITH_ICONS.find(c => c.name === category);
    const classesProps = found ? found.color : 'text-slate-400 bg-slate-500/10';
    
    let lucideIcon = <HelpCircle size={18} />;
    switch (category) {
      case 'Alimentação':
        lucideIcon = <Utensils size={18} />;
        break;
      case 'Processado':
        lucideIcon = <ShoppingBag size={18} />;
        break;
      case 'Depósito':
        lucideIcon = <TrendingUp size={18} />;
        break;
      case 'Transporte':
        lucideIcon = <Fuel size={18} />;
        break;
      case 'Assinaturas':
        lucideIcon = <Tv size={18} />;
        break;
      case 'Saúde':
        lucideIcon = <HeartPulse size={18} />;
        break;
      case 'Lazer':
        lucideIcon = <Gamepad2 size={18} />;
        break;
    }

    return { icon: lucideIcon, classes: classesProps };
  };

  // --- New Period Modal Inputs and logic ---
  const [modalPeriodStart, setModalPeriodStart] = useState('');
  const [modalPeriodEnd, setModalPeriodEnd] = useState('');
  const [modalPeriodTotal, setModalPeriodTotal] = useState('');

  useEffect(() => {
    if (isPeriodModalOpen) {
      setModalPeriodStart(periodStart || new Date().toISOString().split('T')[0]);
      
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);
      setModalPeriodEnd(periodEnd || futureDate.toISOString().split('T')[0]);
      
      setModalPeriodTotal(periodTotal > 0 ? String(periodTotal) : '2000');
    }
  }, [isPeriodModalOpen, periodActive, periodStart, periodEnd, periodTotal]);

  const handleConfirmNewPeriod = (startStr: string, endStr: string, total: number) => {
    // 1. Clear all old transactions
    setTransactions([]);
    
    // 2. Set period states
    setPeriodActive(true);
    setPeriodStart(startStr);
    setPeriodEnd(endStr);
    setPeriodTotal(total);

    // 3. Set all account spendings to 0
    setBudgetAccounts(prev => prev.map((acc) => {
      return { ...acc, balance: 0 };
    }));

    // 4. Trigger alert toast
    const daysCount = () => {
      const s = new Date(startStr + 'T00:00:00');
      const e = new Date(endStr + 'T00:00:00');
      const diffTime = e.getTime() - s.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      return isNaN(diffDays) || diffDays <= 0 ? 1 : diffDays;
    };
    triggerToast(`Novo período de ${daysCount()} dias iniciado com sucesso!`);
  };

  // --- Transaction Create / Update / Delete handlers ---
  const handleSaveTransaction = (newTxData: Omit<Transaction, 'id'> & { id?: string }) => {
    if (newTxData.id) {
       // --- Update Flow ---
      const oldTx = transactions.find(t => t.id === newTxData.id);
      if (!oldTx) return;

      // Reverse previous accountant impact (spending should go down when old expense is removed)
      setBudgetAccounts(prevAccs => prevAccs.map(acc => {
        if (acc.name === oldTx.account && oldTx.amount < 0) {
          return { ...acc, balance: Math.max(0, acc.balance - Math.abs(oldTx.amount)) };
        }
        return acc;
      }));

      // Apply new accountant impact (spending should go up when new expense is registered)
      setBudgetAccounts(prevAccs => prevAccs.map(acc => {
        if (acc.name === newTxData.account && newTxData.amount < 0) {
          return { ...acc, balance: acc.balance + Math.abs(newTxData.amount) };
        }
        return acc;
      }));

      setTransactions(prev => prev.map(t => {
        if (t.id === newTxData.id) {
          return { ...t, ...newTxData } as Transaction;
        }
        return t;
      }));

      triggerToast('Lançamento atualizado com sucesso.');
    } else {
      // --- Create Flow ---
      const createdTx: Transaction = {
        ...newTxData,
        id: 'user_t_' + Date.now(),
      } as Transaction;

      // Adjust account balance corresponding to target account (spending goes up)
      setBudgetAccounts(prevAccs => prevAccs.map(acc => {
        if (acc.name === createdTx.account && createdTx.amount < 0) {
          return { ...acc, balance: acc.balance + Math.abs(createdTx.amount) };
        }
        return acc;
      }));

      // Se for um novo gasto com a conta PIX, subtrai automaticamente da conta cadastrada como PIX no menu Contas
      const isPixExpense = createdTx.amount < 0 && createdTx.account?.trim().toLowerCase() === 'pix';
      if (isPixExpense) {
        const expenseAmount = Math.abs(createdTx.amount);
        const targetPixAcc = accounts.find(a => a.name.trim().toLowerCase() === 'pix');
        if (targetPixAcc) {
          const prevBal = targetPixAcc.balance;
          const newBal = prevBal - expenseAmount;

          setAccounts(prev => prev.map(acc => {
            if (acc.id === targetPixAcc.id) {
              return { ...acc, balance: acc.balance - expenseAmount };
            }
            return acc;
          }));

          const descText = createdTx.description?.trim()
            ? `Retirada de R$ ${expenseAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (${createdTx.description.trim()})`
            : `Retirada de R$ ${expenseAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

          logAccountHistory(
            targetPixAcc.id,
            'subtracao',
            prevBal,
            newBal,
            descText,
            -expenseAmount
          );
        }
      }

      setTransactions(prev => [createdTx, ...prev]);
      if (isPixExpense) {
        triggerToast('Novo lançamento registrado e valor debitado da conta PIX.');
      } else {
        triggerToast('Novo lançamento registrado.');
      }
    }
    setEditingTransaction(null);
  };

  const handleDeleteTransaction = (txId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid opening dialog on item click

    const target = transactions.find(t => t.id === txId);
    if (!target) return;

    // Reverse spending: remove it from target account spending balance
    setBudgetAccounts(prevAccs => prevAccs.map(acc => {
      if (acc.name === target.account && target.amount < 0) {
        return { ...acc, balance: Math.max(0, acc.balance - Math.abs(target.amount)) };
      }
      return acc;
    }));

    setTransactions(prev => prev.filter(t => t.id !== txId));
    triggerToast('Lançamento excluído com sucesso.');
  };

  const handleEditClick = (tx: Transaction, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingTransaction(tx);
    setIsFormOpen(true);
  };

  // --- Credit Card handlers ---
  const handlePayBill = (cardId: string) => {
    const card = cards.find(c => c.id === cardId);
    if (!card || card.used <= 0) return;

    // Ask which account to use to pay
    const options = budgetAccounts.map(a => `${a.name} (Saldo: R$ ${a.balance.toLocaleString('pt-BR')})`).join('\n');
    const selectedAccName = window.prompt(
      `Digite o nome exato da conta para pagar a fatura de R$ ${card.used.toLocaleString('pt-BR')} do ${card.brand}:\n\n${options}`,
      budgetAccounts[0]?.name
    );

    if (!selectedAccName) return;

    const targetAccount = budgetAccounts.find(a => a.name.trim().toLowerCase() === selectedAccName.trim().toLowerCase());
    if (!targetAccount) {
      alert('Conta não encontrada. Certifique-se de digitar o nome exatamente.');
      return;
    }

    if (targetAccount.balance < card.used) {
      alert('Saldo insuficiente na conta selecionada para cobrir o pagamento.');
      return;
    }

    // Process payment
    setBudgetAccounts(prev => prev.map(a => {
      if (a.id === targetAccount.id) {
        return { ...a, balance: a.balance - card.used };
      }
      return a;
    }));

    // Register a mock outcome transaction of credit card payment
    const paymentTx: Transaction = {
      id: 'tx_pay_' + Date.now(),
      description: `Pagamento ${card.brand}`,
      amount: -card.used,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0, 5),
      account: targetAccount.name,
      category: 'Processado',
      status: 'processado'
    };

    setTransactions(prev => [paymentTx, ...prev]);

    setCards(prev => prev.map(c => {
      if (c.id === cardId) {
        return { ...c, used: 0 };
      }
      return c;
    }));

    triggerToast('Fatura paga com sucesso!');
  };

  const handleAdjustLimit = (cardId: string, newLimit: number) => {
    setCards(prev => prev.map(c => {
      if (c.id === cardId) {
        return { ...c, limit: newLimit };
      }
      return c;
    }));
    triggerToast('Limite ajustado com sucesso.');
  };

  const handleAddCard = (e: React.FormEvent) => {
    e.preventDefault();
    const brand = window.prompt('Nome do Cartão (ex: Æternum Infinite):', 'Mastercard Black');
    if (!brand) return;
    const holder = window.prompt('Nome do Titular:', user.name.toUpperCase());
    if (!holder) return;
    const limitInput = window.prompt('Limite total do Cartão:', '50000');
    if (!limitInput) return;
    const themeInput = window.prompt('Tema de Cor (gold, purple, slate, emerald):', 'emerald');
    if (!themeInput) return;

    const limitParsed = parseFloat(limitInput);
    if (isNaN(limitParsed) || limitParsed <= 0) {
      alert('Limite inválido!');
      return;
    }

    const newCard: CreditCard = {
      id: 'c_' + Date.now(),
      brand,
      holder: holder.toUpperCase(),
      lastFour: String(Math.floor(1000 + Math.random() * 9000)),
      expiry: '09/31',
      limit: limitParsed,
      used: 0,
      colorTheme: (['gold', 'purple', 'slate', 'emerald'].includes(themeInput) ? themeInput : 'gold') as any
    };

    setCards(prev => [...prev, newCard]);
    triggerToast(`Cartão ${brand} criado com sucesso.`);
  };

  // --- Reset/Seed Data ---
  const handleResetData = () => {
    if (window.confirm('Tem certeza que deseja restaurar os valores originais do app? Seus novos dados serão perdidos.')) {
      localStorage.clear();
      setUser(INITIAL_USER);
      setAccounts(INITIAL_ACCOUNTS);
      setBudgetAccounts([
        { id: 'b1', name: 'Æternum', balance: 0.00 },
        { id: 'b2', name: 'PIX', balance: 0.00 },
        { id: 'b3', name: 'Nubank', balance: 0.00 },
        { id: 'b4', name: 'Pai', balance: 0.00 },
        { id: 'b5', name: 'Mercado Livre', balance: 0.00 },
      ]);
      setTransactions(INITIAL_TRANSACTIONS);
      setCards(INITIAL_CARDS);
      triggerToast('Dados restaurados com base na nossa inteligência fiscal.');
    }
  };

  const handleUpdateAccountBalance = (accId: string, newBalanceStr: string) => {
    const rawVal = parseFloat(newBalanceStr.replace(',', '.'));
    if (isNaN(rawVal)) return;

    setBudgetAccounts(prev => prev.map(acc => {
      if (acc.id === accId) {
        return { ...acc, balance: rawVal };
      }
      return acc;
    }));
    triggerToast('Gasto acumulado da conta atualizado.');
  };

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccountName.trim()) {
      triggerToast('Por favor, informe o nome da conta.');
      return;
    }

    const exists = accounts.some(acc => acc.name.trim().toLowerCase() === newAccountName.trim().toLowerCase());
    if (exists) {
      triggerToast('Já existe uma conta com este nome.');
      return;
    }

    const initialBal = parseFloat(newAccountBalance.replace(',', '.')) || 0;
    const newAcc: Account = {
      id: 'acc_' + Math.random().toString(36).substr(2, 9),
      name: newAccountName.trim(),
      balance: initialBal,
      color: newAccountColor
    };

    setAccounts(prev => [...prev, newAcc]);
    logAccountHistory(
      newAcc.id,
      'criacao',
      0,
      initialBal,
      `Conta criada com saldo inicial de R$ ${initialBal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      initialBal
    );

    setNewAccountName('');
    setNewAccountBalance('');
    setNewAccountColor('brand-primary');
    setIsNewAccountModalOpen(false);
    triggerToast(`Conta "${newAcc.name}" criada de forma segura.`);
  };

  const handleEditAccountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAccount) return;

    if (!editAccountName.trim()) {
      triggerToast('Por favor, informe o nome da conta.');
      return;
    }

    const exists = accounts.some(acc => 
      acc.id !== editingAccount.id && 
      acc.name.trim().toLowerCase() === editAccountName.trim().toLowerCase()
    );
    if (exists) {
      triggerToast('Já existe outra conta com este nome.');
      return;
    }

    const updatedBal = parseFloat(editAccountBalance.replace(',', '.')) || 0;
    const prevBalance = editingAccount.balance;
    const isBalanceChanged = Math.abs(updatedBal - prevBalance) > 0.001;
    const isNameChanged = editAccountName.trim() !== editingAccount.name;
    const isColorChanged = editAccountColor !== (editingAccount.color || 'brand-primary');

    if (isBalanceChanged || isNameChanged || isColorChanged) {
      let desc = '';
      if (isBalanceChanged && isNameChanged) {
        desc = `Saldo ajustado de R$ ${prevBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} para R$ ${updatedBal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} e nome alterado para "${editAccountName.trim()}"`;
      } else if (isBalanceChanged) {
        desc = `Saldo editado de R$ ${prevBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} para R$ ${updatedBal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      } else if (isNameChanged) {
        desc = `Nome alterado de "${editingAccount.name}" para "${editAccountName.trim()}"`;
      } else {
        desc = `Cor e dados visuais da conta atualizados`;
      }

      logAccountHistory(
        editingAccount.id,
        'edicao',
        prevBalance,
        updatedBal,
        desc,
        isBalanceChanged ? updatedBal - prevBalance : undefined
      );
    }
    
    setAccounts(prev => prev.map(acc => {
      if (acc.id === editingAccount.id) {
        return {
          ...acc,
          name: editAccountName.trim(),
          balance: updatedBal,
          color: editAccountColor
        };
      }
      return acc;
    }));

    // Sincroniza o nome com budgetAccounts se bater
    setBudgetAccounts(prev => prev.map(acc => {
      if (acc.name === editingAccount.name) {
        return {
          ...acc,
          name: editAccountName.trim()
        };
      }
      return acc;
    }));

    setIsEditAccountModalOpen(false);
    setEditingAccount(null);
    triggerToast(`Conta "${editAccountName.trim()}" atualizada com sucesso.`);
  };

  const handleDeleteAccount = (id: string, name: string) => {
    if (accounts.length <= 1) {
      triggerToast('Mantenha pelo menos uma conta ativa para operacionalizar o app.');
      return;
    }
    setAccounts(prev => prev.filter(acc => acc.id !== id));
    triggerToast(`Conta "${name}" removida com sucesso.`);
  };

  const handleCreateTempCategory = (name: string) => {
    if (!name.trim()) return;
    const newCat: TempCategory = {
      id: 'temp-' + Date.now(),
      name: name.trim(),
      entries: []
    };
    setTempCategories(prev => [...prev, newCat]);
    triggerToast(`Categoria "${name}" criada com sucesso!`);
  };

  const handleDeleteTempCategory = (id: string, name: string) => {
    setTempCategories(prev => prev.filter(cat => cat.id !== id));
    triggerToast(`Categoria "${name}" excluída.`);
  };

  const handleAddTempEntry = (catId: string, description: string, amountStr: string) => {
    if (!description.trim()) {
      triggerToast('A descrição do lançamento é obrigatória.');
      return;
    }
    const cleanAmountStr = amountStr.replace(/\s/g, '').replace(',', '.');
    const amountNum = parseFloat(cleanAmountStr);
    if (isNaN(amountNum) || amountNum <= 0) {
      triggerToast('Digite um valor válido maior que zero.');
      return;
    }

    const today = new Date();
    const formattedDate = today.toLocaleDateString('pt-BR');

    const newEntry: TempEntry = {
      id: 'te-' + Date.now() + Math.random().toString(36).substring(2, 6),
      description: description.trim(),
      amount: amountNum,
      date: formattedDate
    };

    setTempCategories(prev => prev.map(cat => {
      if (cat.id === catId) {
        return {
          ...cat,
          entries: [...cat.entries, newEntry]
        };
      }
      return cat;
    }));

    // Clear input states for this category
    setNewEntryDesc(prev => ({ ...prev, [catId]: '' }));
    setNewEntryAmount(prev => ({ ...prev, [catId]: '' }));
    triggerToast('Lançamento temporário adicionado!');
  };

  const handleDeleteTempEntry = (catId: string, entryId: string) => {
    setTempCategories(prev => prev.map(cat => {
      if (cat.id === catId) {
        return {
          ...cat,
          entries: cat.entries.filter(e => e.id !== entryId)
        };
      }
      return cat;
    }));
    triggerToast('Lançamento temporário removido.');
  };

  const handleAdjustBalanceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAdjustingAccount || !adjustingType) return;

    if (!adjustmentAmount) {
      triggerToast('Digite um valor numérico para ajustar.');
      return;
    }
    
    const amount = parseFloat(adjustmentAmount.replace(',', '.'));
    if (isNaN(amount) || amount <= 0) {
      triggerToast('Por favor, digite um valor maior que zero.');
      return;
    }

    const isAddition = adjustingType === 'somar';
    const change = isAddition ? amount : -amount;
    const prevBalance = selectedAdjustingAccount.balance;
    const newBal = prevBalance + change;
    
    setAccounts(prev => prev.map(acc => {
      if (acc.id === selectedAdjustingAccount.id) {
        return {
          ...acc,
          balance: newBal
        };
      }
      return acc;
    }));

    logAccountHistory(
      selectedAdjustingAccount.id,
      isAddition ? 'soma' : 'subtracao',
      prevBalance,
      newBal,
      `${isAddition ? 'Depósito' : 'Retirada'} de R$ ${amount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      change
    );

    setAdjustmentAmount('');
    setIsAdjustBalanceModalOpen(false);
    setSelectedAdjustingAccount(null);
    setAdjustingType(null);

    triggerToast(`${isAddition ? 'Depósito de' : 'Retirada de'} R$ ${amount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} concluído.`);
  };

  const handleSaveVersionsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSystemVersions({
      finance: tempVersionFinance,
      work: tempVersionWork,
      fuel: tempVersionFuel,
      games: tempVersionGames,
      tools: tempVersionTools,
      app: tempVersionApp
    });
    setIsEditVersionsModalOpen(false);
    triggerToast('Versões do sistema atualizadas!');
  };

  const handleExportBackup = () => {
    try {
      const backupData: Record<string, string | null> = {};
      const keysToBackup = [
        'nocturne_user',
        'nocturne_accounts',
        'nocturne_account_history',
        'nocturne_budget_accounts',
        'nocturne_transactions',
        'nocturne_cards',
        'nocturne_period_active',
        'nocturne_period_start',
        'nocturne_period_end',
        'nocturne_period_total',
        'nocturne_temp_categories',
        'nocturne_plan_entries',
        'nocturne_plan_incomes',
        'nocturne_plan_cards',
        'nocturne_patrimony_history',
        'nocturne_fuel_entries',
        'nocturne_last_maintenance',
        'nocturne_contracheque_entries',
        'nocturne_historico_entries',
        'nocturne_me4_exclusions',
        'nocturne_me4_highlights',
        'nocturne_notes',
        'nocturne_checklists',
        'nocturne_pokopia',
        'nocturne_escala_turnos',
        'nocturne_escala_days',
        'nocturne_thelist_entries',
        'nocturne_thelist_year_counts',
        'nocturne_trophy_entries',
        'nocturne_toplay_consoles',
        'nocturne_pokemon_generations',
        'nocturne_system_versions'
      ];
      
      keysToBackup.forEach(key => {
        backupData[key] = localStorage.getItem(key);
      });

      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const today = new Date().toISOString().slice(0, 10);
      link.href = url;
      link.download = `nocturne_backup_${today}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      triggerToast('Backup exportado com sucesso!');
    } catch (err) {
      triggerToast('Erro ao exportar backup.');
      console.error(err);
    }
  };

  const handleImportBackup = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const backupData = JSON.parse(text) as Record<string, string | null>;

        const keysToRestore = [
          'nocturne_user',
          'nocturne_accounts',
          'nocturne_account_history',
          'nocturne_budget_accounts',
          'nocturne_transactions',
          'nocturne_cards',
          'nocturne_period_active',
          'nocturne_period_start',
          'nocturne_period_end',
          'nocturne_period_total',
          'nocturne_temp_categories',
          'nocturne_plan_entries',
          'nocturne_plan_incomes',
          'nocturne_plan_cards',
          'nocturne_patrimony_history',
          'nocturne_fuel_entries',
          'nocturne_last_maintenance',
          'nocturne_contracheque_entries',
          'nocturne_historico_entries',
          'nocturne_me4_exclusions',
          'nocturne_me4_highlights',
          'nocturne_notes',
          'nocturne_escala_turnos',
          'nocturne_escala_days',
          'nocturne_thelist_entries',
          'nocturne_thelist_year_counts',
          'nocturne_trophy_entries',
          'nocturne_toplay_consoles',
          'nocturne_pokemon_generations',
          'nocturne_system_versions'
        ];

        const hasValidKey = keysToRestore.some(key => key in backupData);
        if (!hasValidKey) {
          triggerToast('Arquivo de backup inválido.');
          return;
        }

        Object.entries(backupData).forEach(([key, val]) => {
          if (keysToRestore.includes(key)) {
            if (val === null) {
              localStorage.removeItem(key);
            } else {
              localStorage.setItem(key, val);
            }
          }
        });

        triggerToast('Dados carregados com sucesso!');
        
        if (backupData['nocturne_user']) setUser(JSON.parse(backupData['nocturne_user']!));
        if (backupData['nocturne_accounts']) {
          const bAccs = JSON.parse(backupData['nocturne_accounts']!) as Account[];
          setAccounts(bAccs.map(acc => acc.name === 'Repo Nu' ? { ...acc, name: 'PIX' } : acc));
        }
        if (backupData['nocturne_account_history']) {
          setAccountHistory(JSON.parse(backupData['nocturne_account_history']!));
        }
        if (backupData['nocturne_budget_accounts']) {
          const bBudgetAccs = JSON.parse(backupData['nocturne_budget_accounts']!) as Account[];
          setBudgetAccounts(bBudgetAccs.map(acc => acc.name === 'Repo Nu' ? { ...acc, name: 'PIX' } : acc));
        }
        if (backupData['nocturne_transactions']) {
          const bTxs = JSON.parse(backupData['nocturne_transactions']!) as Transaction[];
          setTransactions(bTxs.map(tx => tx.account === 'Repo Nu' ? { ...tx, account: 'PIX' } : tx));
        }
        if (backupData['nocturne_cards']) setCards(JSON.parse(backupData['nocturne_cards']!));
        if (backupData['nocturne_temp_categories']) setTempCategories(JSON.parse(backupData['nocturne_temp_categories']!));
        
        if (backupData['nocturne_plan_entries']) setPlanEntries(JSON.parse(backupData['nocturne_plan_entries']!));
        if (backupData['nocturne_plan_incomes']) setPlanIncomes(JSON.parse(backupData['nocturne_plan_incomes']!));
        if (backupData['nocturne_plan_cards']) setPlanCards(JSON.parse(backupData['nocturne_plan_cards']!));

        if (backupData['nocturne_period_active'] !== undefined) setPeriodActive(backupData['nocturne_period_active'] === 'true');
        if (backupData['nocturne_period_start'] !== undefined) setPeriodStart(backupData['nocturne_period_start'] || '');
        if (backupData['nocturne_period_end'] !== undefined) setPeriodEnd(backupData['nocturne_period_end'] || '');
        if (backupData['nocturne_period_total'] !== undefined) setPeriodTotal(backupData['nocturne_period_total'] ? parseFloat(backupData['nocturne_period_total']!) : 0);

        if (backupData['nocturne_patrimony_history']) setPatrimonyHistory(JSON.parse(backupData['nocturne_patrimony_history']!));
        if (backupData['nocturne_fuel_entries']) setFuelEntries(JSON.parse(backupData['nocturne_fuel_entries']!));
        if (backupData['nocturne_last_maintenance']) setLastMaintenance(JSON.parse(backupData['nocturne_last_maintenance']!));
        if (backupData['nocturne_contracheque_entries']) setContrachequeEntries(JSON.parse(backupData['nocturne_contracheque_entries']!));
        if (backupData['nocturne_historico_entries']) setHistoricoEntries(JSON.parse(backupData['nocturne_historico_entries']!));
        if (backupData['nocturne_me4_exclusions']) setMe4Exclusions(JSON.parse(backupData['nocturne_me4_exclusions']!));
        if (backupData['nocturne_me4_highlights']) setMe4Highlights(JSON.parse(backupData['nocturne_me4_highlights']!));
        if (backupData['nocturne_notes']) setNotes(JSON.parse(backupData['nocturne_notes']!));
        if (backupData['nocturne_checklists']) setChecklists(JSON.parse(backupData['nocturne_checklists']!));
        if (backupData['nocturne_pokopia']) setPokopiaEntries(JSON.parse(backupData['nocturne_pokopia']!));
        if (backupData['nocturne_escala_turnos']) setEscalaTurnos(JSON.parse(backupData['nocturne_escala_turnos']!));
        if (backupData['nocturne_escala_days']) setEscalaDays(JSON.parse(backupData['nocturne_escala_days']!));
        if (backupData['nocturne_thelist_entries']) setTheListEntries(JSON.parse(backupData['nocturne_thelist_entries']!));
        if (backupData['nocturne_thelist_year_counts']) setTheListYearCounts(JSON.parse(backupData['nocturne_thelist_year_counts']!));
        if (backupData['nocturne_trophy_entries']) setTrophyEntries(JSON.parse(backupData['nocturne_trophy_entries']!));
        if (backupData['nocturne_toplay_consoles']) setToPlayConsoles(JSON.parse(backupData['nocturne_toplay_consoles']!));
        if (backupData['nocturne_pokemon_generations']) setPokemonGenerations(JSON.parse(backupData['nocturne_pokemon_generations']!));
        if (backupData['nocturne_system_versions']) setSystemVersions(JSON.parse(backupData['nocturne_system_versions']!));
        
        if (firebaseUser && firebaseUser.uid !== 'local-user') {
          setDataLoadedFromFirestore(true);
          
          // Immediate synchronous upload to Supabase to prevent loss on fast logout
          const supabase = getSupabase();
          if (supabase) {
            const parsedUser = backupData['nocturne_user'] ? JSON.parse(backupData['nocturne_user']!) : user;
            const parsedAccounts = backupData['nocturne_accounts']
              ? (JSON.parse(backupData['nocturne_accounts']!) as Account[]).map(acc => acc.name === 'Repo Nu' ? { ...acc, name: 'PIX' } : acc)
              : accounts;
            const parsedBudgetAccounts = backupData['nocturne_budget_accounts']
              ? (JSON.parse(backupData['nocturne_budget_accounts']!) as Account[]).map(acc => acc.name === 'Repo Nu' ? { ...acc, name: 'PIX' } : acc)
              : budgetAccounts;
            const parsedTransactions = backupData['nocturne_transactions']
              ? (JSON.parse(backupData['nocturne_transactions']!) as Transaction[]).map(tx => tx.account === 'Repo Nu' ? { ...tx, account: 'PIX' } : tx)
              : transactions;
            const parsedCards = backupData['nocturne_cards'] ? JSON.parse(backupData['nocturne_cards']!) : cards;
            const parsedTempCategories = backupData['nocturne_temp_categories'] ? JSON.parse(backupData['nocturne_temp_categories']!) : tempCategories;
            const parsedPlanEntries = backupData['nocturne_plan_entries'] ? JSON.parse(backupData['nocturne_plan_entries']!) : planEntries;
            const parsedPlanIncomes = backupData['nocturne_plan_incomes'] ? JSON.parse(backupData['nocturne_plan_incomes']!) : planIncomes;
            const parsedPlanCards = backupData['nocturne_plan_cards'] ? JSON.parse(backupData['nocturne_plan_cards']!) : planCards;
            const parsedPatrimonyHistory = backupData['nocturne_patrimony_history'] ? JSON.parse(backupData['nocturne_patrimony_history']!) : patrimonyHistory;
            const parsedFuelEntries = backupData['nocturne_fuel_entries'] ? JSON.parse(backupData['nocturne_fuel_entries']!) : fuelEntries;
            const parsedLastMaintenance = backupData['nocturne_last_maintenance'] ? JSON.parse(backupData['nocturne_last_maintenance']!) : lastMaintenance;
            const parsedContrachequeEntries = backupData['nocturne_contracheque_entries'] ? JSON.parse(backupData['nocturne_contracheque_entries']!) : contrachequeEntries;
            const parsedHistoricoEntries = backupData['nocturne_historico_entries'] ? JSON.parse(backupData['nocturne_historico_entries']!) : historicoEntries;
            const parsedMe4Exclusions = backupData['nocturne_me4_exclusions'] ? JSON.parse(backupData['nocturne_me4_exclusions']!) : me4Exclusions;
            const parsedMe4Highlights = backupData['nocturne_me4_highlights'] ? JSON.parse(backupData['nocturne_me4_highlights']!) : me4Highlights;
            const parsedNotes = backupData['nocturne_notes'] ? JSON.parse(backupData['nocturne_notes']!) : notes;
            const parsedChecklists = backupData['nocturne_checklists'] ? JSON.parse(backupData['nocturne_checklists']!) : checklists;
            const parsedPokopiaEntries = backupData['nocturne_pokopia'] ? JSON.parse(backupData['nocturne_pokopia']!) : pokopiaEntries;
            const parsedEscalaTurnos = backupData['nocturne_escala_turnos'] ? JSON.parse(backupData['nocturne_escala_turnos']!) : escalaTurnos;
            const parsedEscalaDays = backupData['nocturne_escala_days'] ? JSON.parse(backupData['nocturne_escala_days']!) : escalaDays;
            const parsedTheListEntries = backupData['nocturne_thelist_entries'] ? JSON.parse(backupData['nocturne_thelist_entries']!) : theListEntries;
            const parsedTheListYearCounts = backupData['nocturne_thelist_year_counts'] ? JSON.parse(backupData['nocturne_thelist_year_counts']!) : theListYearCounts;
            const parsedTrophyEntriesRaw = backupData['nocturne_trophy_entries'] ? JSON.parse(backupData['nocturne_trophy_entries']!) : [];
            const parsedTrophyEntries = (parsedTrophyEntriesRaw && parsedTrophyEntriesRaw.length > 0) ? parsedTrophyEntriesRaw : (trophyEntries.length > 0 ? trophyEntries : parseRawGames());
            const parsedToPlayConsoles = backupData['nocturne_toplay_consoles'] ? JSON.parse(backupData['nocturne_toplay_consoles']!) : toPlayConsoles;
            const parsedPokemonGenerations = backupData['nocturne_pokemon_generations'] ? JSON.parse(backupData['nocturne_pokemon_generations']!) : pokemonGenerations;
            const parsedSystemVersions = backupData['nocturne_system_versions'] ? JSON.parse(backupData['nocturne_system_versions']!) : systemVersions;
 
            const dataToSave = {
              user: parsedUser,
              accounts: parsedAccounts,
              budgetAccounts: parsedBudgetAccounts,
              transactions: parsedTransactions,
              cards: parsedCards,
              periodActive: backupData['nocturne_period_active'] === 'true',
              periodStart: backupData['nocturne_period_start'] || '',
              periodEnd: backupData['nocturne_period_end'] || '',
              periodTotal: backupData['nocturne_period_total'] ? parseFloat(backupData['nocturne_period_total']!) : 0,
              tempCategories: parsedTempCategories,
              patrimonyHistory: parsedPatrimonyHistory,
              fuelEntries: parsedFuelEntries,
              lastMaintenance: parsedLastMaintenance,
              contrachequeEntries: parsedContrachequeEntries,
              historicoEntries: parsedHistoricoEntries,
              me4Exclusions: parsedMe4Exclusions,
              me4Highlights: parsedMe4Highlights,
              notes: parsedNotes,
              checklists: parsedChecklists,
              pokopiaEntries: parsedPokopiaEntries,
              planEntries: parsedPlanEntries,
              planIncomes: parsedPlanIncomes,
              planCards: parsedPlanCards,
              activePlanMonth: activePlanMonth,
              escalaTurnos: parsedEscalaTurnos,
              escalaDays: parsedEscalaDays,
              theListEntries: parsedTheListEntries,
              theListYearCounts: parsedTheListYearCounts,
              trophyEntries: parsedTrophyEntries,
              toPlayConsoles: parsedToPlayConsoles,
              pokemonGenerations: parsedPokemonGenerations,
              systemVersions: parsedSystemVersions,
              didClearLegacyCards_v8: true,
              didClearLegacyCards_v9: true,
              didClearLegacyCards_v10: true
            };

            const nowStr = new Date().toISOString();
            lastSavedTimestampRef.current = nowStr;
            supabase
              .from('nocturne_data')
              .upsert({
                user_id: firebaseUser.uid,
                data: JSON.parse(JSON.stringify(dataToSave)),
                updated_at: nowStr
              })
              .then(({ error: saveErr }) => {
                if (saveErr) {
                  console.warn("Immediate Supabase upsert failed (imported locally):", saveErr);
                  triggerToast(`Erro ao salvar importação na nuvem: ${saveErr.message}`);
                } else {
                  setCloudLastSynced(nowStr);
                  triggerToast('Backup importado e salvo na nuvem com sucesso!');
                }
              });
          }
        }

        setActiveScreen('budget');
        setActiveModule('finance');
      } catch (err) {
        triggerToast('Falha ao processar arquivo de backup.');
        console.error(err);
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const handleManualSync = async () => {
    if (!firebaseUser) {
      triggerToast('Você precisa estar logado para sincronizar com a nuvem.');
      setSyncStatus('offline');
      return;
    }
    if (firebaseUser.uid === 'local-user') {
      triggerToast('Modo Offline: não é possível salvar na nuvem.');
      setSyncStatus('offline');
      return;
    }
    
    setSyncStatus('syncing');
    setSaveLoading(true);
    const supabase = getSupabase();
    if (!supabase) {
      triggerToast('Supabase não configurado.');
      setFirestoreWriteError('Supabase não configurado');
      setSyncStatus('error');
      setSaveLoading(false);
      return;
    }

    try {
      const dataToSave = {
        _client_id: clientIdRef.current,
        user,
        accounts,
        accountHistory,
        budgetAccounts,
        transactions,
        cards,
        periodActive,
        periodStart,
        periodEnd,
        periodTotal,
        tempCategories,
        patrimonyHistory,
        fuelEntries,
        lastMaintenance,
        contrachequeEntries,
        historicoEntries,
        me4Exclusions,
        me4Highlights,
        notes,
        checklists,
        pokopiaEntries,
        planEntries,
        planIncomes,
        planCards,
        activePlanMonth,
        escalaTurnos,
        escalaDays,
        theListEntries,
        theListYearCounts,
        trophyEntries,
        toPlayConsoles,
        pokemonGenerations,
        systemVersions,
        didClearLegacyCards_v8: true,
        didClearLegacyCards_v9: true,
        didClearLegacyCards_v10: true
      };

      const nowStr = new Date().toISOString();
      lastSavedTimestampRef.current = nowStr;
      const { error: saveErr } = await supabase
        .from('nocturne_data')
        .upsert({
          user_id: firebaseUser.uid,
          data: JSON.parse(JSON.stringify(dataToSave)),
          updated_at: nowStr
        });

      if (saveErr) {
        console.warn("Supabase manual upsert failed (using local sync):", saveErr);
        triggerToast(`Erro ao sincronizar: ${saveErr.message}`);
        setFirestoreWriteError(`Falha ao sincronizar: ${saveErr.message}`);
        setIsOffline(true);
        setSyncStatus('error');
      } else {
        triggerToast('Sincronizado com a nuvem com sucesso!');
        setCloudLastSynced(nowStr);
        setIsOffline(false);
        setFirestoreWriteError(null);
        setSyncStatus('synced');
      }
    } catch (err: any) {
      console.warn('Error in manual sync:', err);
      triggerToast(`Erro ao sincronizar: ${err.message || err}`);
      setFirestoreWriteError(`Erro ao sincronizar: ${err.message || err}`);
      setSyncStatus('error');
    } finally {
      setSaveLoading(false);
    }
  };

  // --- Transaction queries & filters calculation ---
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const matchSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.account.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchCategory = selectedCategory === 'all' || t.category === selectedCategory;
      const matchAccount = selectedAccountFilter === 'all' || t.account === selectedAccountFilter;

      return matchSearch && matchCategory && matchAccount;
    });
  }, [transactions, searchTerm, selectedCategory, selectedAccountFilter]);

  // Group transactions list by humanized dates
  const groupedTransactions = useMemo(() => {
    const groups: { [key: string]: { txs: Transaction[]; dailySum: number; rawDate: string } } = {};

    filteredTransactions.forEach(t => {
      // Format header keys in dd/mm/aa format
      let formattedHeader = t.date;
      try {
        const parts = t.date.split('-');
        const year = parts[0].substring(2);
        const month = parts[1];
        const day = parts[2];
        const dateObj = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        const daysOfWeek = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
        
        let prefix = '';
        if (t.date === '2026-10-24') {
          prefix = 'Hoje, ';
        } else if (t.date === '2026-10-23') {
          prefix = 'Ontem, ';
        } else {
          prefix = `${daysOfWeek[dateObj.getDay()]}, `;
        }
        formattedHeader = `${prefix}${day}/${month}/${year}`;
      } catch (_) {
        formattedHeader = t.date;
      }

      if (!groups[formattedHeader]) {
        groups[formattedHeader] = { txs: [], dailySum: 0, rawDate: t.date };
      }

      groups[formattedHeader].txs.push(t);
      groups[formattedHeader].dailySum += t.amount;
    });

    return Object.entries(groups).map(([date, data]) => ({
      dateLabel: date,
      transactions: data.txs,
      dailySum: data.dailySum,
      rawDate: data.rawDate
    })).sort((a, b) => b.rawDate.localeCompare(a.rawDate));
  }, [filteredTransactions]);

  // Dynamic dashboard analytics (cashflows graph values)
  const dashboardStats = useMemo(() => {
    const totalOutcomesByCat: { [key: string]: number } = {};
    let totalIncomes = 0;
    let totalOutcomes = 0;

    transactions.forEach(t => {
      if (t.amount < 0) {
        totalOutcomes += Math.abs(t.amount);
        totalOutcomesByCat[t.category] = (totalOutcomesByCat[t.category] || 0) + Math.abs(t.amount);
      } else {
        totalIncomes += t.amount;
      }
    });

    const categoryDistribution = Object.entries(totalOutcomesByCat).map(([name, val]) => ({
      name,
      value: val,
      percentage: totalOutcomes > 0 ? (val / totalOutcomes) * 100 : 0
    })).sort((a, b) => b.value - a.value);

    return {
      totalIncomes,
      totalOutcomes,
      categoryDistribution
    };
  }, [transactions]);

  // --- Dynamic Greeting ---
  const activeGreeting = useMemo(() => {
    // Current time from metadata: 2026-06-21T06:35:08-07:00 => 6:35 AM
    const hour = 6; // morning
    if (hour >= 5 && hour < 12) return 'Bom dia';
    if (hour >= 12 && hour < 18) return 'Boa tarde';
    return 'Boa noite';
  }, []);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-bg-base flex flex-col items-center justify-center p-6 text-center" id="loading-screen">
        <div className="w-10 h-10 border-2 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin mb-4" />
        <p className="text-xs font-mono text-text-muted tracking-wider uppercase">VERIFICANDO USUÁRIO</p>
      </div>
    );
  }

  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen bg-bg-base flex flex-col items-center justify-center p-6 select-none" id="welcome-login-screen">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="max-w-xl w-full bg-bg-surface-low border border-outline-variant/60 rounded-3xl p-8 shadow-2xl space-y-6 text-left relative overflow-hidden"
          id="welcome-card"
        >
          <div className="flex flex-col items-center text-center space-y-3" id="welcome-brand">
            <img 
              src="/nexus3.png" 
              alt="NEXUS Logo" 
              className="w-12 h-12 rounded-2xl shadow-md border border-brand-primary/30 object-cover"
              referrerPolicy="no-referrer"
              id="brand-emblem-img"
            />
            <span className="text-[10px] text-brand-primary font-mono tracking-widest font-black uppercase">
              NEXUS • Supabase
            </span>
            <h1 className="text-2xl font-display font-black text-white tracking-tight">
              Configuração do Supabase Necessária
            </h1>
          </div>

          <div className="text-xs text-text-high leading-relaxed space-y-4 bg-bg-base/50 p-6 rounded-2xl border border-outline-variant/30">
            <p className="font-semibold text-brand-primary uppercase tracking-wider text-[10px]">Passo 1: Crie a Tabela no SQL Editor do Supabase</p>
            <p className="text-text-muted">
              Abra seu painel do Supabase, vá em <strong>SQL Editor</strong>, crie uma nova query e execute o comando abaixo para criar a tabela de dados do NEXUS:
            </p>
            <pre className="p-3 bg-zinc-950 rounded-xl border border-white/5 font-mono text-[10px] text-emerald-400 overflow-x-auto select-all max-h-40 overflow-y-auto">
{`create table if not exists public.nocturne_data (
  user_id uuid references auth.users on delete cascade primary key,
  data jsonb not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habilitar RLS
alter table public.nocturne_data enable row level security;

-- Criar políticas
create policy "Users can read own data" on public.nocturne_data
  for select using (auth.uid() = user_id);

create policy "Users can insert own data" on public.nocturne_data
  for insert with check (auth.uid() = user_id);

create policy "Users can update own data" on public.nocturne_data
  for update using (auth.uid() = user_id);

-- Habilitar Realtime
alter publication supabase_realtime add table public.nocturne_data;`}
            </pre>

            <p className="font-semibold text-brand-primary uppercase tracking-wider text-[10px] pt-2">Passo 2: Defina as Variáveis de Ambiente (Vercel ou .env.local)</p>
            <p className="text-text-muted">
              Adicione as seguintes variáveis em <strong>Environment Variables</strong> da Vercel (ou no arquivo <strong>.env.local</strong>):
            </p>
            <ul className="list-disc list-inside space-y-1 pl-1 text-text-high">
              <li><code className="bg-white/5 px-1.5 py-0.5 rounded text-brand-primary font-mono font-bold">VITE_SUPABASE_URL</code>: A URL do seu projeto Supabase.</li>
              <li><code className="bg-white/5 px-1.5 py-0.5 rounded text-brand-primary font-mono font-bold">VITE_SUPABASE_ANON_KEY</code>: A chave anônima (anon/public key).</li>
            </ul>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!firebaseUser) {
    return (
      <div className="min-h-screen bg-bg-base flex flex-col items-center justify-center p-6 select-none" id="welcome-login-screen">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="max-w-md w-full bg-bg-surface-low border border-outline-variant/60 rounded-3xl p-8 shadow-2xl space-y-6 relative overflow-hidden text-left"
          id="welcome-card"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-brand-primary/10 to-transparent rounded-bl-full pointer-events-none" />
          
          <div className="flex flex-col items-center text-center space-y-3" id="welcome-brand">
            <img 
              src="/nexus3.png" 
              alt="NEXUS Logo" 
              className="w-12 h-12 rounded-2xl shadow-md border border-brand-primary/30 object-cover"
              referrerPolicy="no-referrer"
              id="brand-emblem-img"
            />
            <h1 className="text-3xl font-display font-black text-white tracking-tight">
              NEXUS
            </h1>
          </div>

          <div className="flex bg-zinc-950 p-1.5 rounded-xl border border-white/5 mb-2">
            <button
              type="button"
              onClick={() => setIsSignUp(false)}
              className={`flex-1 text-center py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${!isSignUp ? 'bg-brand-primary text-black font-extrabold' : 'text-text-muted hover:text-white'}`}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => setIsSignUp(true)}
              className={`flex-1 text-center py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${isSignUp ? 'bg-brand-primary text-black font-extrabold' : 'text-text-muted hover:text-white'}`}
            >
              Cadastrar
            </button>
          </div>

          <form onSubmit={isSignUp ? handleEmailSignUp : handleEmailSignIn} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-white uppercase tracking-wider pl-1">E-mail</label>
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="seu@email.com"
                className="w-full bg-zinc-950 border border-outline-variant/40 rounded-xl px-4 py-3 text-xs text-white placeholder-text-muted/65 focus:border-brand-primary outline-none transition-all"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-white uppercase tracking-wider pl-1">Senha</label>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-zinc-950 border border-outline-variant/40 rounded-xl px-4 py-3 text-xs text-white placeholder-text-muted/65 focus:border-brand-primary outline-none transition-all"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-brand-primary hover:bg-brand-primary/95 border border-brand-primary/20 text-black font-black uppercase text-[10px] tracking-widest py-3.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-brand-primary/10 mt-2"
            >
              {isSignUp ? 'Criar Conta' : 'Acessar Conta'}
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div 
      className="h-[100dvh] md:h-screen w-full overflow-hidden bg-bg-base text-text-high font-sans selection:bg-brand-primary/20 flex flex-col md:flex-row max-w-md md:max-w-none mx-auto md:mx-0 relative shadow-2xl md:shadow-none border-x md:border-none border-outline-variant/40 md:mt-0 md:rounded-none pb-0 custom-scrollbar" 
      id="web-main-container"
    >
      
      {/* Elegant Desktop Sidebar */}
      <aside 
        className="hidden md:flex flex-col w-60 bg-zinc-950 border-r border-outline-variant/20 p-5 shrink-0 justify-between h-full overflow-y-auto custom-scrollbar relative select-none"
        id="desktop-sidebar"
      >
        <div className="space-y-8">
          {/* Logo Brand Header */}
          <button 
            type="button"
            onClick={handleAppRefresh}
            disabled={isRefreshingApp}
            className="w-full flex items-center gap-3 pb-5 border-b border-outline-variant/10 text-left group cursor-pointer active:scale-95 transition-all outline-none" 
            id="desktop-sidebar-brand"
            title="Clique no ícone para recarregar o app e sincronizar dados da nuvem"
          >
            <div className="relative">
              <img 
                src="/nexus3.png" 
                alt="NEXUS Logo" 
                className={`w-10 h-10 rounded-xl shadow-md border border-brand-primary/20 object-cover transition-all duration-300 ${isRefreshingApp ? 'animate-spin border-brand-primary' : 'group-hover:scale-105 group-hover:border-brand-primary/50'}`}
                referrerPolicy="no-referrer"
              />
              {isRefreshingApp && (
                <div className="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center backdrop-blur-xs">
                  <RotateCcw size={16} className="text-brand-primary animate-spin" />
                </div>
              )}
            </div>
            <div>
              <h1 className="text-lg font-black tracking-wider text-white uppercase font-display leading-tight group-hover:text-brand-primary transition-colors">NEXUS</h1>
            </div>
          </button>

          {/* Navigation Links */}
          <nav className="space-y-2 select-none" id="desktop-sidebar-nav">
            {/* FINANCE MODULE (Collapsible) */}
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => {
                  setIsFinanceExpanded(!isFinanceExpanded);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-black tracking-widest uppercase font-display transition-all cursor-pointer ${
                  activeModule === 'finance'
                    ? 'bg-brand-primary/10 text-brand-primary border border-brand-primary/10'
                    : 'text-text-muted hover:text-text-high hover:bg-white/5 border border-transparent'
                }`}
                id="btn-sidebar-module-finance"
              >
                <div className="flex items-center gap-3">
                  <DollarSign size={16} />
                  <span>FINANCE</span>
                </div>
                {isFinanceExpanded ? <ChevronUp size={14} className="text-text-muted" /> : <ChevronDown size={14} className="text-text-muted" />}
              </button>

              {/* Submenus under FINANCE */}
              <AnimatePresence initial={false}>
                {isFinanceExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden pl-4 space-y-1"
                    id="finance-submenu-container"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setActiveScreen('budget');
                        setActiveTab('transacoes');
                        setActiveModule('finance');
                        setIsAnalysisView(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-[10px] font-black tracking-widest uppercase font-display transition-all cursor-pointer ${
                        activeScreen === 'budget'
                          ? 'text-brand-primary bg-brand-primary/5'
                          : 'text-text-muted hover:text-text-high hover:bg-white/5'
                      }`}
                      id="btn-sidebar-budget"
                    >
                      <Wallet size={14} />
                      <span>BUDGET</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setActiveScreen('contas');
                        setActiveModule('finance');
                        setIsPatrimonyHistoryView(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-[10px] font-black tracking-widest uppercase font-display transition-all cursor-pointer ${
                        activeScreen === 'contas'
                          ? 'text-brand-primary bg-brand-primary/5'
                          : 'text-text-muted hover:text-text-high hover:bg-white/5'
                      }`}
                      id="btn-sidebar-contas"
                    >
                      <Landmark size={14} />
                      <span>CONTAS</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setActiveScreen('plan');
                        setActiveModule('finance');
                      }}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-[10px] font-black tracking-widest uppercase font-display transition-all cursor-pointer ${
                        activeScreen === 'plan'
                          ? 'text-brand-primary bg-brand-primary/5'
                          : 'text-text-muted hover:text-text-high hover:bg-white/5'
                      }`}
                      id="btn-sidebar-plan"
                    >
                      <Calendar size={14} />
                      <span>PLAN</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setActiveScreen('temp');
                        setActiveModule('finance');
                      }}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-[10px] font-black tracking-widest uppercase font-display transition-all cursor-pointer ${
                        activeScreen === 'temp'
                          ? 'text-brand-primary bg-brand-primary/5'
                          : 'text-text-muted hover:text-text-high hover:bg-white/5'
                      }`}
                      id="btn-sidebar-temp"
                    >
                      <Clock size={14} />
                      <span>TEMP</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* WORK MODULE (Collapsible) */}
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => {
                  setIsWorkExpanded(!isWorkExpanded);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-black tracking-widest uppercase font-display transition-all cursor-pointer border ${
                  activeModule === 'fab'
                    ? 'bg-brand-primary/10 text-brand-primary border-brand-primary/10'
                    : 'text-text-muted hover:text-text-high hover:bg-white/5 border-transparent'
                }`}
                id="btn-sidebar-module-work"
              >
                <div className="flex items-center gap-3">
                  <FABIcon size={16} />
                  <span>WORK</span>
                </div>
                {isWorkExpanded ? <ChevronUp size={14} className="text-text-muted" /> : <ChevronDown size={14} className="text-text-muted" />}
              </button>

              {/* Submenus under WORK */}
              <AnimatePresence initial={false}>
                {isWorkExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden pl-4 space-y-1"
                    id="work-submenu-container"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setActiveScreen('contracheque');
                        setActiveModule('fab');
                      }}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-[10px] font-black tracking-widest uppercase font-display transition-all cursor-pointer ${
                        activeScreen === 'contracheque'
                          ? 'text-brand-primary bg-brand-primary/5'
                          : 'text-text-muted hover:text-text-high hover:bg-white/5'
                      }`}
                      id="btn-sidebar-contracheque"
                    >
                      <Receipt size={14} />
                      <span>CONTRACHEQUE</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setActiveScreen('missoes');
                        setActiveModule('fab');
                      }}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-[10px] font-black tracking-widest uppercase font-display transition-all cursor-pointer ${
                        activeScreen === 'missoes'
                          ? 'text-brand-primary bg-brand-primary/5'
                          : 'text-text-muted hover:text-text-high hover:bg-white/5'
                      }`}
                      id="btn-sidebar-missoes"
                    >
                      <History size={14} />
                      <span>HISTÓRICO</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setActiveScreen('me4');
                        setActiveModule('fab');
                      }}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-[10px] font-black tracking-widest uppercase font-display transition-all cursor-pointer ${
                        activeScreen === 'me4'
                          ? 'text-brand-primary bg-brand-primary/5'
                          : 'text-text-muted hover:text-text-high hover:bg-white/5'
                      }`}
                      id="btn-sidebar-me4"
                    >
                      <ListOrdered size={14} />
                      <span>ME4</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setActiveScreen('escala');
                        setActiveModule('fab');
                      }}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-[10px] font-black tracking-widest uppercase font-display transition-all cursor-pointer ${
                        activeScreen === 'escala'
                          ? 'text-brand-primary bg-brand-primary/5'
                          : 'text-text-muted hover:text-text-high hover:bg-white/5'
                      }`}
                      id="btn-sidebar-escala"
                    >
                      <CalendarDays size={14} />
                      <span>ESCALA</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* FUEL MODULE */}
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => {
                  setIsFuelExpanded(!isFuelExpanded);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-black tracking-widest uppercase font-display transition-all cursor-pointer border ${
                  activeModule === 'fuel'
                    ? 'bg-brand-primary/10 text-brand-primary border-brand-primary/10'
                    : 'text-text-muted hover:text-text-high hover:bg-white/5 border border-transparent'
                }`}
                id="btn-sidebar-module-fuel"
              >
                <div className="flex items-center gap-3">
                  <Fuel size={16} />
                  <span>FUEL</span>
                </div>
                {isFuelExpanded ? <ChevronUp size={14} className="text-text-muted" /> : <ChevronDown size={14} className="text-text-muted" />}
              </button>

              <AnimatePresence initial={false}>
                {isFuelExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden pl-4 space-y-1"
                    id="fuel-submenu-container"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setActiveScreen('fuel');
                        setActiveModule('fuel');
                      }}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-[10px] font-black tracking-widest uppercase font-display transition-all cursor-pointer ${
                        activeScreen === 'fuel'
                          ? 'text-brand-primary bg-brand-primary/5'
                          : 'text-text-muted hover:text-text-high hover:bg-white/5'
                      }`}
                      id="btn-sidebar-biz"
                    >
                      <Motorbike size={14} />
                      <span>BIZ</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* GAMES MODULE (Collapsible) */}
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => {
                  setIsGamesExpanded(!isGamesExpanded);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-black tracking-widest uppercase font-display transition-all cursor-pointer border ${
                  activeModule === 'games'
                    ? 'bg-brand-primary/10 text-brand-primary border-brand-primary/10'
                    : 'text-text-muted hover:text-text-high hover:bg-white/5 border border-transparent'
                }`}
                id="btn-sidebar-module-games"
              >
                <div className="flex items-center gap-3">
                  <Gamepad2 size={16} />
                  <span>GAMES</span>
                </div>
                {isGamesExpanded ? <ChevronUp size={14} className="text-text-muted" /> : <ChevronDown size={14} className="text-text-muted" />}
              </button>

              <AnimatePresence initial={false}>
                {isGamesExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden pl-4 space-y-1"
                    id="games-submenu-container"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setActiveScreen('games');
                        setActiveModule('games');
                        setGamesSubmenu('TROPHIES');
                      }}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-[10px] font-black tracking-widest uppercase font-display transition-all cursor-pointer ${
                        activeScreen === 'games' && gamesSubmenu === 'TROPHIES'
                          ? 'text-brand-primary bg-brand-primary/5'
                          : 'text-text-muted hover:text-text-high hover:bg-white/5'
                      }`}
                      id="btn-sidebar-games-trophies"
                    >
                      <Trophy size={14} />
                      <span>TROPHIES</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setActiveScreen('games');
                        setActiveModule('games');
                        setGamesSubmenu('POKÉMON');
                      }}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-[10px] font-black tracking-widest uppercase font-display transition-all cursor-pointer ${
                        activeScreen === 'games' && gamesSubmenu === 'POKÉMON'
                          ? 'text-brand-primary bg-brand-primary/5'
                          : 'text-text-muted hover:text-text-high hover:bg-white/5'
                      }`}
                      id="btn-sidebar-games-pokemon"
                    >
                      <PokebolaIcon size={14} />
                      <span>POKÉMON</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setActiveScreen('games');
                        setActiveModule('games');
                        setGamesSubmenu('TO PLAY');
                      }}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-[10px] font-black tracking-widest uppercase font-display transition-all cursor-pointer ${
                        activeScreen === 'games' && gamesSubmenu === 'TO PLAY'
                          ? 'text-brand-primary bg-brand-primary/5'
                          : 'text-text-muted hover:text-text-high hover:bg-white/5'
                      }`}
                      id="btn-sidebar-games-toplay"
                    >
                      <Play size={14} />
                      <span>TO PLAY</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setActiveScreen('pokopia');
                        setActiveModule('games');
                      }}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-[10px] font-black tracking-widest uppercase font-display transition-all cursor-pointer ${
                        activeScreen === 'pokopia'
                          ? 'text-brand-primary bg-brand-primary/5'
                          : 'text-text-muted hover:text-text-high hover:bg-white/5'
                      }`}
                      id="btn-sidebar-games-pokopia"
                    >
                      <Compass size={14} />
                      <span>POKOPIA</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* TOOLS MODULE (Collapsible) */}
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => {
                  setIsToolsExpanded(!isToolsExpanded);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-black tracking-widest uppercase font-display transition-all cursor-pointer border ${
                  activeModule === 'tools'
                    ? 'bg-brand-primary/10 text-brand-primary border border-brand-primary/10'
                    : 'text-text-muted hover:text-text-high hover:bg-white/5 border border-transparent'
                }`}
                id="btn-sidebar-module-tools"
              >
                <div className="flex items-center gap-3">
                  <Wrench size={16} />
                  <span>TOOLS</span>
                </div>
                {isToolsExpanded ? <ChevronUp size={14} className="text-text-muted" /> : <ChevronDown size={14} className="text-text-muted" />}
              </button>

              <AnimatePresence initial={false}>
                {isToolsExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden pl-4 space-y-1"
                    id="tools-submenu-container"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setActiveScreen('notes');
                        setActiveModule('tools');
                      }}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-[10px] font-black tracking-widest uppercase font-display transition-all cursor-pointer ${
                        activeScreen === 'notes' && activeModule === 'tools'
                          ? 'text-brand-primary bg-brand-primary/5'
                          : 'text-text-muted hover:text-text-high hover:bg-white/5'
                      }`}
                      id="btn-sidebar-tools-notes"
                    >
                      <ScrollText size={14} />
                      <span>NOTES</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setActiveModule('tools');
                        setIsTheListPasswordModalOpen(true);
                      }}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-[10px] font-black tracking-widest uppercase font-display transition-all cursor-pointer ${
                        activeScreen === 'thelist' && activeModule === 'tools'
                          ? 'text-brand-primary bg-brand-primary/5'
                          : 'text-text-muted hover:text-text-high hover:bg-white/5'
                      }`}
                      id="btn-sidebar-tools-thelist"
                    >
                      <BookLock size={14} />
                      <span>THE LIST</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setActiveScreen('checklists');
                        setActiveModule('tools');
                      }}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-[10px] font-black tracking-widest uppercase font-display transition-all cursor-pointer ${
                        activeScreen === 'checklists' && activeModule === 'tools'
                          ? 'text-brand-primary bg-brand-primary/5'
                          : 'text-text-muted hover:text-text-high hover:bg-white/5'
                      }`}
                      id="btn-sidebar-tools-checklists"
                    >
                      <ListChecks size={14} />
                      <span>CHECKLISTS</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsSpotifyModalOpen(true);
                      }}
                      className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-[10px] font-black tracking-widest uppercase font-display transition-all cursor-pointer text-text-muted hover:text-text-high hover:bg-white/5"
                      id="btn-sidebar-tools-spotify"
                    >
                      <Radio size={14} />
                      <span>SPOTIFY</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* SYSTEM MODULE */}
            <button
              type="button"
              onClick={() => {
                setActiveScreen('config');
                setActiveModule('system');
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-black tracking-widest uppercase font-display transition-all cursor-pointer border ${
                activeModule === 'system'
                  ? 'bg-brand-primary/10 text-brand-primary border border-brand-primary/10'
                  : 'text-text-muted hover:text-text-high hover:bg-white/5 border border-transparent'
              }`}
              id="btn-sidebar-module-system"
            >
              <Settings size={16} className={activeScreen === 'config' ? 'rotate-45' : ''} />
              <span>SYSTEM</span>
            </button>
          </nav>
        </div>

        {/* Sync Status Box at the Bottom of Desktop Sidebar */}
        <div className="pt-4 border-t border-outline-variant/15 mt-4 shrink-0" id="desktop-sidebar-sync-status">
          <SyncStatusIndicator
            status={syncStatus}
            lastSynced={cloudLastSynced}
            errorMessage={firestoreWriteError}
            isOffline={isOffline || !firebaseUser || firebaseUser.uid === 'local-user'}
            onManualSync={handleManualSync}
            variant="desktop"
          />
        </div>
      </aside>

      {/* Dynamic Toast Message */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 w-11/12 max-w-sm bg-bg-surface-low border border-brand-primary/30 py-3 px-4 rounded-xl z-50 flex items-center justify-between shadow-2xl"
            id="toast-notification"
          >
            <div className="flex items-center gap-3">
              <CheckCircle2 className="text-brand-primary" size={18} />
              <span className="text-xs text-text-high font-medium">{toastMessage}</span>
            </div>
            <button onClick={() => setToastMessage(null)} className="text-text-muted hover:text-text-high">
              <RotateCcw size={14} className="animate-spin-hover" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Container Area */}
      <main className="flex-1 overflow-y-auto px-6 pt-6 pb-28 md:px-10 md:py-8 md:pb-8 custom-scrollbar flex flex-col justify-between h-full" id="content-scroller">
        <div className="flex-1 pb-6">
        
        {/* App Title Header with Generated Yellow/Black Icon (Visible on Mobile only) */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-outline-variant/10 md:hidden" id="app-brand-header">
          <button
            type="button"
            onClick={handleAppRefresh}
            disabled={isRefreshingApp}
            className="flex items-center gap-3 text-left group cursor-pointer active:scale-95 transition-all outline-none"
            title="Toque no ícone para recarregar o app e sincronizar dados da nuvem"
            id="btn-header-refresh-mobile"
          >
            <div className="relative">
              <img 
                src="/nexus3.png" 
                alt="NEXUS Logo" 
                className={`w-10 h-10 rounded-xl shadow-md border border-brand-primary/20 object-cover transition-all duration-300 ${isRefreshingApp ? 'animate-spin border-brand-primary' : 'group-hover:scale-105 group-hover:border-brand-primary/50'}`}
                referrerPolicy="no-referrer"
              />
              {isRefreshingApp && (
                <div className="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center backdrop-blur-xs">
                  <RotateCcw size={16} className="text-brand-primary animate-spin" />
                </div>
              )}
            </div>
            <div>
              <h1 className="text-xl font-black tracking-wider text-white uppercase font-display leading-tight group-hover:text-brand-primary transition-colors">NEXUS</h1>
            </div>
          </button>

          <div className="flex items-center gap-2">
            {/* Mobile Sync Status Indicator */}
            <SyncStatusIndicator
              status={syncStatus}
              lastSynced={cloudLastSynced}
              errorMessage={firestoreWriteError}
              isOffline={isOffline || !firebaseUser || firebaseUser.uid === 'local-user'}
              onManualSync={handleManualSync}
              variant="mobile"
            />

            {activeScreen === 'fuel' && (
              <button
                type="button"
                onClick={() => setFuelSubView(prev => prev === 'list' ? 'analysis' : 'list')}
                className="bg-brand-primary hover:bg-brand-primary-hover text-bg-base font-black text-[10px] uppercase tracking-wider py-2 px-3 rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                id="btn-fuel-toggle-analysis-mobile"
              >
                {fuelSubView === 'list' ? (
                  <>
                    <TrendingUp size={12} strokeWidth={2.5} />
                    <span>ANÁLISE</span>
                  </>
                ) : (
                  <>
                    <ArrowLeft size={12} strokeWidth={2.5} />
                    <span>VOLTAR</span>
                  </>
                )}
              </button>
            )}

            {activeScreen === 'missoes' && (
              <button
                type="button"
                onClick={() => setHistoricoIsAfastamentosView(prev => !prev)}
                className="bg-brand-primary hover:bg-brand-primary-hover text-bg-base font-black text-[10px] uppercase tracking-wider py-2 px-3 rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                id="btn-historico-toggle-afastamentos-mobile"
              >
                {historicoIsAfastamentosView ? (
                  <>
                    <ArrowLeft size={12} strokeWidth={2.5} />
                    <span>VOLTAR</span>
                  </>
                ) : (
                  <>
                    <Plane size={12} strokeWidth={2.5} />
                    <span>AFASTAMENTOS</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Desktop Page Title Header (Visible on Desktop only) */}
        {activeScreen !== 'me4' && activeScreen !== 'notes' && activeScreen !== 'checklists' && activeScreen !== 'escala' && activeScreen !== 'thelist' && activeScreen !== 'games' && activeScreen !== 'pokopia' && (
          <div className="hidden md:flex justify-between items-center mb-6 pb-4 border-b border-outline-variant/10" id="desktop-page-header">
            {/* Left section: Title */}
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-black uppercase tracking-wider text-white font-display flex items-center gap-2.5">
                <span>
                  {activeScreen === 'budget' && 'BUDGET'}
                  {activeScreen === 'contas' && 'CONTAS'}
                  {activeScreen === 'plan' && 'PLANEJAMENTO MENSAL'}
                  {activeScreen === 'temp' && 'TEMP'}
                  {activeScreen === 'config' && 'SYSTEM'}
                  {activeScreen === 'notes' && 'SYSTEM / NOTES'}
                  {activeScreen === 'checklists' && 'CHECKLISTS'}
                  {activeScreen === 'fab' && 'WORK'}
                  {activeScreen === 'contracheque' && 'CONTRACHEQUE'}
                  {activeScreen === 'missoes' && 'HISTÓRICO'}
                  {activeScreen === 'fuel' && 'FUEL'}
                  {activeScreen === 'games' && 'GAMES'}
                  {activeScreen === 'escala' && 'ESCALA'}
                </span>
                {isOffline && (
                  <span className="px-2 py-0.5 text-[10px] font-mono bg-amber-500/15 border border-amber-500/35 text-amber-500 rounded-lg font-semibold uppercase tracking-wider">Modo Offline</span>
                )}
              </h2>
            </div>

            {/* Center section: Month Navigation and Search centered */}
            {(activeScreen === 'contracheque' || activeScreen === 'plan') && (
              <div className="flex-1 flex items-center justify-center gap-3 select-none">
                {/* Month Navigation on the LEFT of search */}
                <div className="flex items-center bg-bg-surface-low border border-outline-variant/30 rounded-xl p-1 gap-1">
                  <button
                    onClick={activeScreen === 'contracheque' ? handleContrachequePrevMonth : handlePlanPrevMonth}
                    className="p-1.5 text-text-muted hover:text-white hover:bg-white/5 active:bg-white/10 rounded-lg transition-all cursor-pointer"
                    title="Mês anterior"
                    id={`btn-${activeScreen}-prev-month-header`}
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <div className="w-[1px] h-4 bg-outline-variant/20" />
                  <button
                    onClick={activeScreen === 'contracheque' ? handleContrachequeNextMonth : handlePlanNextMonth}
                    className="p-1.5 text-text-muted hover:text-white hover:bg-white/5 active:bg-white/10 rounded-lg transition-all cursor-pointer"
                    title="Próximo mês"
                    id={`btn-${activeScreen}-next-month-header`}
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>

                {/* Search box MM/AAAA */}
                <div className="relative max-w-[140px] w-full" id={`${activeScreen}-search-header-container`}>
                  <input
                    type="text"
                    placeholder="MM/AAAA"
                    value={activeScreen === 'contracheque' ? contrachequeSearchQuery : planSearchQuery}
                    onChange={e => activeScreen === 'contracheque' ? handleContrachequeSearchChange(e.target.value) : handlePlanSearchChange(e.target.value)}
                    className="bg-bg-surface-low border border-outline-variant/50 rounded-xl pl-8 pr-3 py-2 text-xs font-bold text-white placeholder:text-text-muted/60 focus:outline-none focus:border-brand-primary w-full text-center tracking-widest font-mono"
                    maxLength={7}
                    id={`input-${activeScreen}-search-header`}
                  />
                  <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                </div>
              </div>
            )}
            
            {/* Right section */}
            <div className="flex-1 flex justify-end items-center gap-4 select-none">
              {activeScreen === 'fuel' ? (
                <button
                  type="button"
                  onClick={() => setFuelSubView(prev => prev === 'list' ? 'analysis' : 'list')}
                  className="bg-brand-primary hover:bg-brand-primary-hover text-bg-base font-black text-xs uppercase tracking-wider py-2.5 px-4 rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                  id="btn-fuel-toggle-analysis"
                >
                  {fuelSubView === 'list' ? (
                    <>
                      <TrendingUp size={14} strokeWidth={2.5} />
                      <span>ANÁLISE</span>
                    </>
                  ) : (
                    <>
                      <ArrowLeft size={14} strokeWidth={2.5} />
                      <span>VOLTAR</span>
                    </>
                  )}
                </button>
              ) : activeScreen === 'config' ? null : activeScreen === 'contracheque' ? (
                <div className="flex items-center gap-3">
                  {/* Resumo button on the LEFT of the Total Recebido information */}
                  <button
                    onClick={() => setContrachequeIsResumoView(prev => !prev)}
                    className={`flex items-center gap-2 py-2 px-4 border rounded-xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer shadow-sm ${
                      contrachequeIsResumoView
                        ? 'bg-brand-primary text-black border-brand-primary hover:bg-brand-primary/80'
                        : 'bg-brand-primary/15 hover:bg-brand-primary/25 text-brand-primary border-brand-primary/20'
                    }`}
                    id="btn-contracheque-resumo-desktop-top"
                  >
                    <FileText size={14} />
                    <span>Resumo</span>
                  </button>

                  <div className="bg-bg-surface-low border border-outline-variant/50 px-4 py-2 rounded-xl text-right">
                    <span className="text-[9px] text-text-muted uppercase tracking-wider block font-semibold">Total Recebido</span>
                    <span className="text-sm font-bold text-brand-primary font-mono">
                      R$ {contrachequeTotalNet.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              ) : activeScreen === 'missoes' ? (
                <div className="flex items-center gap-3">
                  {/* AFASTAMENTOS button instead of Resumo */}
                  <button
                    onClick={() => setHistoricoIsAfastamentosView(prev => !prev)}
                    className={`flex items-center gap-2 py-2 px-4 border rounded-xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer shadow-sm ${
                      historicoIsAfastamentosView
                        ? 'bg-brand-primary text-black border-brand-primary hover:bg-brand-primary/80'
                        : 'bg-brand-primary/15 hover:bg-brand-primary/25 text-brand-primary border-brand-primary/20'
                    }`}
                    id="btn-historico-afastamentos-desktop-top"
                  >
                    <Plane size={14} />
                    <span>AFASTAMENTOS</span>
                  </button>
                </div>
              ) : (
                <div className="bg-bg-surface-low border border-outline-variant/50 px-4 py-2 rounded-xl text-right flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-[9px] text-text-muted uppercase tracking-wider block font-semibold">Patrimônio Líquido</span>
                    <span className="text-sm font-bold text-brand-primary font-mono">
                      {showNetWorth ? (
                        `R$ ${totalBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                      ) : (
                        "R$ ••••••••"
                      )}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={toggleNetWorth}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-outline-variant/30 text-text-muted hover:text-white transition-all cursor-pointer flex items-center justify-center"
                    title={showNetWorth ? "Ocultar patrimônio" : "Mostrar patrimônio"}
                    id="btn-toggle-networth-visibility"
                  >
                    {showNetWorth ? <EyeOff size={12} /> : <Eye size={12} />}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {activeScreen === 'budget' && (
          <>
            {isAnalysisView ? (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col h-full space-y-6"
                id="budget-analysis-page-view"
              >
                {/* PAGE-STYLE RENDERING FOR ANÁLISE */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-outline-variant/15 pb-4" id="budget-analysis-header">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setIsAnalysisView(false)}
                      className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-text-muted hover:text-white hover:bg-white/10 transition-all cursor-pointer flex items-center justify-center"
                      title="Voltar para orçamento"
                      id="btn-analysis-back-top"
                    >
                      <ArrowLeft size={16} />
                    </button>
                    <div>
                      <h2 className="text-lg font-black tracking-wider text-white uppercase font-display flex items-center gap-2">
                        <TrendingUp size={18} className="text-amber-500" strokeWidth={2.5} />
                        Análise de Saldo Geral
                      </h2>
                    </div>
                  </div>
                </div>

                {!periodActive ? (
                  <div className="flex-1 flex flex-col items-center justify-center py-12 text-center space-y-3 bg-bg-surface-low border border-outline-variant/40 rounded-2xl p-6">
                    <span className="text-4xl">📊</span>
                    <h4 className="text-sm font-bold text-white">Nenhum período ativo</h4>
                    <p className="text-xs text-text-muted max-w-[280px]">
                      Inicie um período de orçamento primeiro para acompanhar a evolução diária e projeções.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Consolidado metrics like in RESUMO */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" id="analysis-summary-cards">
                      <div className="bg-bg-surface-low border border-outline-variant/40 rounded-2xl p-4 flex flex-col justify-between shadow-sm relative overflow-hidden">
                        <div className="absolute right-3 top-3 w-8 h-8 bg-amber-500/5 rounded-lg flex items-center justify-center border border-amber-500/10">
                          <TrendingUp size={16} className="text-amber-500" />
                        </div>
                        <div>
                          <span className="text-[10px] uppercase tracking-wider text-text-muted font-bold block">Balanço Projetado</span>
                          <span className={`text-lg font-black font-mono tracking-tight block mt-1 ${analysisData.projectedBalance >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            R$ {analysisData.projectedBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>

                      <div className="bg-bg-surface-low border border-outline-variant/40 rounded-2xl p-4 flex flex-col justify-between shadow-sm relative overflow-hidden">
                        <div className="absolute right-3 top-3 w-8 h-8 bg-rose-500/5 rounded-lg flex items-center justify-center border border-rose-500/10">
                          <TrendingDown size={16} className="text-rose-400" />
                        </div>
                        <div>
                          <span className="text-[10px] uppercase tracking-wider text-text-muted font-bold block">Média Diária</span>
                          <span className="text-lg font-black font-mono tracking-tight text-rose-400 block mt-1">
                            R$ {analysisData.averageDailyExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>

                      <div className="bg-bg-surface-low border border-outline-variant/40 rounded-2xl p-4 flex flex-col justify-between shadow-sm relative overflow-hidden">
                        <div className="absolute right-3 top-3 w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center border border-white/10">
                          <DollarSign size={16} className="text-white/70" />
                        </div>
                        <div>
                          <span className="text-[10px] uppercase tracking-wider text-text-muted font-bold block">Total de Gastos</span>
                          <span className="text-lg font-black font-mono tracking-tight text-white block mt-1">
                            R$ {analysisData.totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Chart & Daily Evolution list inside a grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="analysis-grid-content">
                      {/* Left: Recharts Bar Chart */}
                      <div className="bg-bg-surface-low border border-outline-variant p-5 rounded-2xl space-y-4">
                        <span className="block text-[11px] uppercase tracking-widest text-[#ffe08b] font-bold font-mono">
                          Evolução do Limite Atribuído
                        </span>
                        <div className="w-full h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                              <XAxis 
                                dataKey="name" 
                                stroke="#71717a" 
                                fontSize={10} 
                                tickLine={false} 
                                axisLine={false} 
                                tickMargin={6}
                              />
                              <YAxis 
                                stroke="#71717a" 
                                fontSize={10} 
                                tickLine={false} 
                                axisLine={false} 
                                tickMargin={6}
                              />
                              <Tooltip 
                                contentStyle={{ 
                                  backgroundColor: '#111318', 
                                  borderColor: '#2d3139', 
                                  borderRadius: '8px',
                                  fontSize: '11px',
                                  color: '#ffffff'
                                }} 
                                labelClassName="text-text-muted"
                                formatter={(value: any) => [`R$ ${value}`, 'Limite']}
                              />
                              <Bar dataKey="Limite Atribuído" fill="#ffe08b" radius={[4, 4, 0, 0]} barSize={20} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      {/* Right: Daily Evolution List */}
                      <div className="bg-bg-surface-low border border-outline-variant p-5 rounded-2xl flex flex-col h-full max-h-[350px] lg:max-h-[350px]">
                        <span className="block text-[11px] uppercase tracking-widest text-[#ffe08b] font-bold mb-4 font-mono">
                          Evolução Diária do Período
                        </span>
                        <div className="flex-1 overflow-y-auto pr-1 space-y-3 custom-scrollbar">
                          {analysisData.daysList.length === 0 ? (
                            <div className="text-center py-12 text-text-muted text-xs">Nenhum dia decorrido no período atual.</div>
                          ) : (
                            analysisData.daysList.map((day) => {
                              const isPositive = day.dailyNetBalance >= 0;
                              return (
                                <div 
                                  key={day.dayNumber} 
                                  className="bg-black/25 border border-outline-variant/30 hover:border-outline-variant/60 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all"
                                >
                                  <div>
                                    <div className="flex items-center gap-1.5 mb-1.5">
                                      <span className="text-[9px] font-bold uppercase tracking-wider text-brand-primary font-mono bg-brand-primary/10 border border-brand-primary/25 rounded px-1.5 py-0.5">
                                        Dia {day.dayNumber}
                                      </span>
                                      <span className="text-[10px] text-text-muted font-mono">{day.dateFormatted}</span>
                                    </div>
                                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-text-muted font-mono">
                                      <div>
                                        Lim. Atribuído:{' '}
                                        <strong className="text-white font-semibold">R$ {day.dailySaldoAtStart.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                                      </div>
                                      <div>
                                        Despesas Reais:{' '}
                                        <strong className="text-white font-semibold">R$ {day.dayExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="text-right flex sm:flex-col items-center justify-between sm:justify-center gap-1 border-t sm:border-t-0 border-white/5 pt-1.5 sm:pt-0">
                                    <span className="text-[9px] uppercase tracking-widest text-text-muted font-bold font-mono sm:hidden">
                                      Balanço:
                                    </span>
                                    <span className={`font-mono font-black tracking-tight text-xs ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                                      {isPositive ? '+' : ''} R$ {day.dailyNetBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </span>
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </motion.div>
            ) : (
              <>
                {/* TAB 1: INÍCIO (DASHBOARD) */}
        {activeTab === 'inicio' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
            id="tab-inicio-view"
          >
            {/* Header Greeting */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-text-muted text-xs tracking-wider uppercase font-semibold">Portfólio Ativo</h3>
                <h2 className="text-2xl font-display font-black text-white mt-1">
                  {activeGreeting}, <span className="text-brand-secondary">{user.name.split(' ')[0]}</span>
                </h2>
              </div>
              <div className="bg-bg-surface-low border border-outline-variant px-3 py-1 text-[10px] font-mono rounded text-brand-primary">
                Prestige Club
              </div>
            </div>

            {/* Responsive Desktop Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start" id="dashboard-responsive-grid">
              
              {/* Main Column (Cards, Chart, Recent Transactions) */}
              <div className="lg:col-span-2 space-y-6">
                {/* Total balance micro cards */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-bg-surface-low border border-outline-variant/50 p-4 rounded-xl flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-text-muted uppercase tracking-wider block font-semibold">Total em Contas</span>
                        <button
                          type="button"
                          onClick={toggleConsolidatedBalance}
                          className="text-text-muted hover:text-white transition-all cursor-pointer p-0.5 rounded"
                          title={showConsolidatedBalance ? "Ocultar saldos" : "Mostrar saldos"}
                        >
                          {showConsolidatedBalance ? <EyeOff size={11} /> : <Eye size={11} />}
                        </button>
                      </div>
                      <p className="text-lg font-bold text-white mt-1">
                        {showConsolidatedBalance ? (
                          `R$ ${totalBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                        ) : (
                          "R$ ••••••••"
                        )}
                      </p>
                    </div>
                    <div className="text-[10px] text-green-400 flex items-center gap-1 mt-2 font-mono">
                      <ArrowUpRight size={10} /> + R$ {dashboardStats.totalIncomes.toLocaleString('pt-BR', { maximumFractionDigits: 0 })} entrada
                    </div>
                  </div>

                  <div className="bg-bg-surface-low border border-outline-variant/50 p-4 rounded-xl flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] text-text-muted uppercase tracking-wider block font-semibold">Limite Disponível</span>
                      <p className="text-lg font-bold text-white mt-1">
                        R$ {cards.reduce((sum, c) => sum + (c.limit - c.used), 0).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                      </p>
                    </div>
                    <div className="text-[10px] text-red-500 flex items-center gap-1 mt-2 font-mono">
                      <ArrowDownLeft size={10} /> - R$ {dashboardStats.totalOutcomes.toLocaleString('pt-BR', { maximumFractionDigits: 0 })} saída
                    </div>
                  </div>
                </div>

                {/* Cash Flow Custom Area Chart Widget */}
                <section className="bg-bg-surface-low border border-outline-variant/80 rounded-xl p-5 gold-glow shadow-md">
                  <h4 className="text-[11px] uppercase tracking-widest text-text-muted font-bold mb-4">Performance e Volume Comercial</h4>
                  
                  <div className="h-32 w-full mt-2 relative flex items-end">
                    {/* Visual gridlines */}
                    <div className="absolute inset-0 flex flex-col justify-between py-2 border-b border-white/5">
                      <div className="border-t border-white/5 w-full h-px" />
                      <div className="border-t border-white/5 w-full h-px" />
                      <div className="border-t border-white/10 w-full h-px" />
                    </div>

                    {/* Animated graphic SVG representation */}
                    <svg className="w-full h-full overflow-visible" preserveAspectRatio="none">
                      {/* Area fill */}
                      <path
                        d="M 0 120 C 30 110, 60 70, 90 85 C 120 100, 150 40, 180 50 C 210 60, 240 10, 270 25 C 300 40, 330 90, 360 85 L 360 120 L 0 120 Z"
                        fill="url(#goldGradient)"
                        opacity="0.15"
                      />
                      {/* Grid-line path */}
                      <motion.path
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 1.5 }}
                        d="M 0 120 C 30 110, 60 70, 90 85 C 120 100, 150 40, 180 50 C 210 60, 240 10, 270 25 C 300 40, 330 90, 360 85"
                        fill="none"
                        stroke="#ffd700"
                        strokeWidth="2.5"
                      />
                      
                      {/* Decorative Gradient Def */}
                      <defs>
                        <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#ffd700" />
                          <stop offset="100%" stopColor="#050505" />
                        </linearGradient>
                      </defs>
                    </svg>

                    {/* Hover highlights */}
                    <div className="absolute left-[38%] top-[30%] w-3 h-3 rounded-full bg-brand-primary border-2 border-black animate-ping" />
                    <div className="absolute left-[38%] top-[30%] w-3 h-3 rounded-full bg-brand-primary border-2 border-black" />
                    
                    {/* floating tooltip */}
                    <div className="absolute left-[44%] top-[10%] bg-bg-surface-high border border-brand-primary/20 px-2 py-1 rounded text-[10px] font-mono text-brand-primary z-20">
                      Dia 24: R$ 2.450,00
                    </div>
                  </div>

                  <div className="flex justify-between text-[10px] text-text-muted mt-2 font-mono">
                    <span>Mai</span>
                    <span>Jun</span>
                    <span>Jul</span>
                    <span>Ago</span>
                    <span>Set</span>
                    <span>Out (Atual)</span>
                  </div>
                </section>

                {/* Micro Quick Transactions log header */}
                <div className="pt-2">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-[11px] uppercase tracking-widest text-text-muted font-bold">Lançamentos Recentes</h4>
                    <button onClick={() => setActiveTab('transacoes')} className="text-[11px] text-brand-primary hover:underline font-bold">
                      Ver todos
                    </button>
                  </div>

                  <div className="space-y-2">
                    {transactions.slice(0, 3).map(t => {
                      return (
                        <div
                          key={t.id}
                          className="flex items-center justify-between p-3.5 bg-bg-surface-low border border-outline-variant/30 rounded-xl transition-all"
                        >
                          <div className="flex items-center gap-2">
                            <div>
                              <p className="text-xs font-bold text-text-high">{t.description}</p>
                              <p className="text-[10px] text-text-muted font-mono">{t.account} • {t.time}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`text-xs font-bold ${t.amount >= 0 ? 'text-green-500' : 'text-text-high'}`}>
                              {t.amount >= 0 ? '+' : '-'} R$ {Math.abs(t.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                            <button
                              onClick={(e) => handleEditClick(t, e)}
                              className="p-1.5 hover:text-brand-primary text-text-muted rounded hover:bg-white/5 transition-all cursor-pointer"
                              title="Editar"
                              id={`edit-recent-${t.id}`}
                            >
                              <Edit3 size={14} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Side Column (Concentration of Expenses) */}
              <div className="space-y-6">
                {/* Category distribution visual block */}
                <section className="bg-bg-surface-low border border-outline-variant p-5 rounded-xl h-full flex flex-col justify-between">
                  <div>
                    <h4 className="text-[11px] uppercase tracking-widest text-text-muted font-bold mb-4">Concentração de Despesas</h4>
                    <div className="space-y-3.5">
                      {dashboardStats.categoryDistribution.slice(0, 5).map((item) => {
                        return (
                          <div key={item.name} className="space-y-1">
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-text-high font-medium">{item.name}</span>
                              <span className="font-mono text-text-muted">
                                R$ {item.value.toLocaleString('pt-BR')} ({item.percentage.toFixed(0)}%)
                              </span>
                            </div>
                            <div className="w-full h-1.5 bg-bg-base rounded-full overflow-hidden">
                              <div
                                  className="h-full bg-brand-secondary rounded-full"
                                  style={{ width: `${item.percentage}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                      {dashboardStats.categoryDistribution.length === 0 && (
                        <p className="text-xs text-text-muted italic text-center py-4">Sem despesas registradas.</p>
                      )}
                    </div>
                  </div>
                </section>
              </div>

            </div>
          </motion.div>
        )}

        {/* TAB 2: TRANSAÇÕES (THE DETAILED LIST & SEARCH ENGINE) */}
        {activeTab === 'transacoes' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
            id="tab-transactions-view"
          >
            {/* Balance Hero Section exact copy */}
            <section className="relative overflow-hidden rounded-xl border-t-2 border-brand-primary p-6 bg-gradient-to-b from-bg-surface-low to-bg-base gold-glow border border-outline-variant/50 animate-glow" id="balance-hero">
              <div className="relative z-10">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-text-muted mb-2.5 font-bold">Saldo do Dia</p>
                    <div className="flex items-baseline gap-1" id="daily-balance-display">
                      <span className="text-2xl font-black text-brand-primary font-display">R$</span>
                      <span className="text-4xl font-black text-white tracking-tighter font-display">
                        {saldoDoDia.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                  
                  {/* Custom Period Buttons on the right side of the main card panel */}
                  <div className="flex flex-col gap-2 items-end" id="period-actions-group">
                    <button
                      onClick={() => setIsPeriodModalOpen(true)}
                      className="inline-flex items-center gap-1 bg-brand-primary/10 hover:bg-brand-primary/20 border border-brand-primary/30 hover:border-brand-primary text-brand-primary text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg transition-all duration-250 cursor-pointer shadow-sm w-32 justify-center"
                      id="btn-define-period"
                    >
                      <Calendar size={12} />
                      Novo Período
                    </button>

                    <button
                      onClick={() => setIsAnalysisView(true)}
                      className="inline-flex items-center gap-1 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 hover:border-amber-500 text-amber-500 text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg transition-all duration-250 cursor-pointer shadow-sm w-32 justify-center"
                      id="btn-open-analysis"
                    >
                      <TrendingUp size={12} strokeWidth={2.5} />
                      Análise
                    </button>
                  </div>
                </div>

                <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-outline-variant/20 pt-3">
                  <span className="text-xs text-text-muted">
                    Saldo Mensal: <strong className="text-text-high font-bold">R$ {(periodActive ? remainingTotalPeriodBudget : totalBalance).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                  </span>

                  {periodActive && (
                    <span className="text-[10px] text-brand-primary font-mono font-medium flex items-center gap-1.5 bg-brand-primary/5 px-2 py-0.5 rounded-md border border-brand-primary/10">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-pulse"></span>
                      Período: {new Date(periodStart + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })} até {new Date(periodEnd + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })} ({daysRemaining === 1 ? 'falta 1 dia' : `faltam ${daysRemaining} dias`})
                    </span>
                  )}
                </div>

                {/* Collapsible Accounts Accordion */}
                <div className="mt-6 border-t border-outline-variant/60 pt-4">
                  <button
                    onClick={() => setIsAccountsExpanded(!isAccountsExpanded)}
                    className="flex items-center justify-between w-full text-brand-primary font-bold uppercase tracking-widest text-[10px] cursor-pointer"
                    id="accounts-accordion-toggle"
                  >
                    <span>Contas</span>
                    <ChevronDown
                      size={14}
                      className={`transition-transform duration-300 ${isAccountsExpanded ? 'rotate-180' : ''}`}
                    />
                  </button>

                  <AnimatePresence>
                    {isAccountsExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 space-y-3 overflow-hidden font-mono text-xs"
                        id="expanded-accounts-panel"
                      >
                        {budgetAccounts.map(acc => (
                          <div key={acc.id} className="flex justify-between items-center border-b border-white/5 pb-2 last:border-0 last:pb-0">
                            <span className="text-text-muted font-sans font-medium">{acc.name}</span>
                            <span className="text-white font-bold">
                              R$ {acc.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </section>

            {/* Search Bar */}
            <div className="flex gap-2">
              <div className="flex-1 flex items-center bg-bg-surface-low border border-outline-variant/60 rounded-xl px-4 py-1.5 focus-within:border-brand-primary transition-all">
                <Search size={16} className="text-text-muted mr-3" />
                <input
                  type="text"
                  placeholder="Buscar no histórico..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-transparent border-0 focus:ring-0 text-text-high w-full p-2 placeholder:text-text-muted focus:outline-none text-xs"
                  id="search-input"
                />
              </div>
            </div>

            {/* Transactions List segmented daily */}
            <div className="space-y-8" id="transactions-grouped-container">
              {groupedTransactions.map((group) => (
                <div key={group.dateLabel} className="space-y-3">
                  <h3 className="text-[11px] font-bold text-text-muted uppercase tracking-[0.15em] border-b border-outline-variant/40 pb-1.5 flex items-center justify-between">
                    <span>{group.dateLabel}</span>
                    <span className={group.dailySum >= 0 ? 'text-green-500' : 'text-text-high'}>
                      {group.dailySum >= 0 ? '+ R$ ' : '- R$ '}
                      {Math.abs(group.dailySum).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </h3>

                  <div className="space-y-2">
                    {group.transactions.map((tx) => {
                      return (
                        <div
                          key={tx.id}
                          className="flex items-center justify-between p-4 bg-bg-surface-low border border-outline-variant/30 rounded-xl transition-all duration-150"
                        >
                          <div className="flex items-center gap-2">
                            <div>
                              <h4 className="font-bold text-sm text-text-high transition-colors">
                                {tx.description}
                              </h4>
                              <p className="text-xs text-text-muted mt-0.5">
                                {tx.account} • {tx.time}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <p className={`font-bold text-sm ${tx.amount >= 0 ? 'text-green-500' : 'text-text-high'}`}>
                                {tx.amount >= 0 ? '+' : '-'} R$ {Math.abs(tx.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </p>
                            </div>

                            {/* Editing/Deleting Micro controls visible in items */}
                            <div className="flex items-center gap-1.5 pl-2 border-l border-white/5 opacity-90 transition-opacity duration-200">
                              <button
                                onClick={(e) => handleEditClick(tx, e)}
                                className="p-2.5 hover:text-brand-primary text-text-muted rounded-lg hover:bg-white/5 transition-all"
                                title="Editar"
                                id={`edit-tx-${tx.id}`}
                              >
                                <Edit3 size={16} />
                              </button>
                              <button
                                onClick={(e) => handleDeleteTransaction(tx.id, e)}
                                className="p-2.5 hover:text-red-500 text-text-muted rounded-lg hover:bg-red-500/10 transition-all"
                                title="Excluir"
                                id={`delete-tx-${tx.id}`}
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}

              {filteredTransactions.length === 0 && (
                <div className="text-center py-12 bg-bg-surface-low border border-dashed border-outline-variant/40 rounded-xl" id="empty-transactions-state">
                  <p className="text-xs text-text-muted italic">Nenhum lançamento no período.</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* TAB 3: CARTÕES (CREDIT CARDS AND BILL DETAILS) */}
        {activeTab === 'cartoes' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
            id="tab-cartoes-view"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-text-muted text-xs uppercase tracking-wider font-semibold">Crédito & Cartões</h3>
                <h2 className="text-xl font-display font-black text-white mt-1">Sua carteira de prestígio</h2>
              </div>
              <button
                onClick={(e) => handleAddCard(e)}
                className="bg-brand-primary hover:bg-brand-accent text-black font-bold p-2 text-xs rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                id="add-card-launcher"
              >
                <Plus size={14} /> Novo Cartão
              </button>
            </div>

            {/* Main scrollable credit cards list */}
            <div className="space-y-5" id="credit-cards-scroller">
              {cards.map(cardItem => (
                <CardItem
                  key={cardItem.id}
                  card={cardItem}
                  onPayBill={handlePayBill}
                  onAdjustLimit={handleAdjustLimit}
                />
              ))}

              {cards.length === 0 && (
                <p className="text-xs text-text-muted italic text-center py-8">Nenhum cartão cadastrado.</p>
              )}
            </div>

            {/* Billing visual simulation report */}
            <div className="bg-bg-surface-low border border-outline-variant p-5 rounded-2xl space-y-4">
              <h4 className="text-[11px] uppercase tracking-widest text-[#ffe08b] font-bold">Consolidação de Crédito</h4>
              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-text-muted font-sans font-medium">Faturas Totais em Aberto</span>
                  <span className="text-white font-bold">R$ {cards.reduce((sum, c) => sum + c.used, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-text-muted font-sans font-medium">Limite Global Disponível</span>
                  <span className="text-brand-primary font-bold">R$ {cards.reduce((sum, c) => sum + (c.limit - c.used), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 4: PERFIL (REAL SETTINGS & ACCOUNT SIMULATIONS) */}
        {activeTab === 'perfil' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
            id="tab-perfil-view"
          >
            {/* Header profile details */}
            <div className="flex items-center gap-4 bg-bg-surface-low border border-outline-variant/60 p-5 rounded-2xl gold-glow">
              <div className="w-14 h-14 rounded-full border border-brand-primary overflow-hidden bg-bg-surface-med shrink-0">
                <img className="w-full h-full object-cover" src={user.avatarUrl} alt={user.name} referrerPolicy="no-referrer" />
              </div>
              <div>
                <h3 className="font-display font-black text-lg text-white">{user.name}</h3>
                <p className="text-xs text-text-muted">armindo.netto@gmail.com</p>
                <span className="inline-block text-[9px] font-mono tracking-wider font-bold bg-amber-500/10 text-brand-primary border border-yellow-500/30 px-1.5 py-0.5 rounded mt-1.5 uppercase">VIP CLIENT</span>
              </div>
            </div>

            {/* Custom Interactive Simulators Section */}
            <section className="space-y-4">
              <h4 className="text-[11px] uppercase tracking-widest text-[#ffe08b] font-bold">Gastos Mensais por Conta</h4>
              
              <div className="bg-bg-surface-low border border-outline-variant rounded-2xl p-4 space-y-3">
                <p className="text-[11px] text-text-muted pb-2 border-b border-white/5">
                  Ajuste ou acompanhe os gastos acumulados de cada uma das suas contas bancárias neste período (iniciam em zero):
                </p>

                <div className="space-y-3">
                  {budgetAccounts.map(acc => (
                    <div key={acc.id} className="flex items-center justify-between text-xs gap-4">
                      <span className="text-text-mid font-medium min-w-[100px] text-left">{acc.name}</span>
                      <div className="relative flex-1 max-w-[160px]">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-primary font-bold text-[10px]">R$</span>
                        <input
                          type="text"
                          value={acc.balance.toString()}
                          onChange={(e) => handleUpdateAccountBalance(acc.id, e.target.value)}
                          className="w-full bg-bg-base border border-outline-variant rounded-lg pl-8 pr-3 py-1.5 text-right font-mono text-white text-xs focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary/25 transition-all"
                          id={`account-balance-input-${acc.id}`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Goal setter */}
            <div className="bg-bg-surface-low border border-outline-variant p-5 rounded-2xl space-y-3">
              <h4 className="text-[11px] uppercase tracking-widest text-[#ffe08b] font-bold">Meta de Performance</h4>
              <div className="space-y-1 text-xs">
                <label className="block text-text-muted text-[11px] mb-1">Entrada Mensal Alvo (R$)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted font-bold text-[11px]">R$</span>
                  <input
                    type="number"
                    value={user.monthlyIncomeGoal}
                    onChange={(e) => setUser(prev => ({ ...prev, monthlyIncomeGoal: parseFloat(e.target.value) || 0 }))}
                    className="w-full bg-bg-base border border-outline-variant rounded-xl pl-9 pr-4 py-2.5 text-white placeholder:text-text-muted focus:outline-none focus:border-brand-primary transition-all text-xs"
                    id="income-goal-input"
                  />
                </div>
              </div>
            </div>

            {/* Utility and reset section */}
            <div className="space-y-3">
              <h4 className="text-[11px] uppercase tracking-widest text-[#ffe08b] font-bold">Sistema de Inteligência</h4>
              
              <div className="grid grid-cols-1 gap-2.5">
                <button
                  onClick={handleResetData}
                  className="w-full bg-transparent hover:bg-red-500/10 text-red-400 hover:text-red-300 border border-red-500/20 rounded-xl py-3 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer inline-block text-center"
                  id="reset-data-launcher"
                >
                  <RotateCcw size={14} /> Restaurar Simulações de Fábrica
                </button>
              </div>

              <div className="text-center pt-2 text-[10px] text-text-muted">
                Versão v8.1.4 • NEXUS
              </div>
            </div>
          </motion.div>
        )}
              </>
            )}
          </>
        )}

        {/* TAB 2: CONTAS */}
        {activeScreen === 'contas' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col h-full"
            id="contas-screen-view"
          >
            {isPatrimonyHistoryView ? (
              <div className="flex flex-col space-y-6" id="patrimony-history-page-view">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-outline-variant/15 pb-4" id="patrimony-page-header">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setIsPatrimonyHistoryView(false);
                        setNewPatrimonyMonthYear('');
                        setNewPatrimonyAmount('');
                      }}
                      className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-text-muted hover:text-white hover:bg-white/10 transition-all cursor-pointer flex items-center justify-center"
                      title="Voltar para contas"
                      id="btn-patrimony-back-top"
                    >
                      <ArrowLeft size={16} />
                    </button>
                    <div>
                      <h2 className="text-lg font-black tracking-wider text-white uppercase font-display flex items-center gap-2">
                        <History className="text-[#ffe08b]" size={18} strokeWidth={2.5} />
                        Histórico de Patrimônio Consolidado
                      </h2>
                    </div>
                  </div>
                </div>

                {/* Main page body */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start" id="patrimony-page-grid">
                  {/* Left Column (2/3 width on desktop): Chart & Add Record Form */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Line Chart */}
                    <div className="bg-bg-surface-low border border-outline-variant rounded-2xl p-5 shadow-lg relative overflow-hidden" id="patrimony-chart-container">
                      <span className="block text-[11px] uppercase tracking-widest text-[#ffe08b] font-mono font-bold mb-4">
                        Evolução do Patrimônio Acumulado (R$)
                      </span>
                      <div className="w-full h-64">
                        {patrimonyHistory.length < 2 ? (
                          <div className="w-full h-full flex items-center justify-center text-[11px] text-text-muted font-mono bg-white/5 rounded-xl border border-outline-variant/10 text-center px-4">
                            Adicione pelo menos 2 pontos de dados para exibir a linha de evolução histórica.
                          </div>
                        ) : (
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart 
                              data={[...patrimonyHistory]
                                .sort((a, b) => {
                                  const [mA, yA] = a.monthYear.split('/').map(n => parseInt(n, 10));
                                  const [mB, yB] = b.monthYear.split('/').map(n => parseInt(n, 10));
                                  const dateA = new Date(yA < 100 ? 2000 + yA : yA, mA - 1, 1);
                                  const dateB = new Date(yB < 100 ? 2000 + yB : yB, mB - 1, 1);
                                  return dateA.getTime() - dateB.getTime();
                                })} 
                              margin={{ top: 10, right: 15, left: -20, bottom: 5 }}
                            >
                              <XAxis 
                                dataKey="monthYear" 
                                stroke="#71717a" 
                                fontSize={10} 
                                tickLine={false} 
                                axisLine={false} 
                                tickMargin={6}
                              />
                              <YAxis 
                                stroke="#71717a" 
                                fontSize={10} 
                                tickLine={false} 
                                axisLine={false} 
                                tickFormatter={(val) => `R$ ${val >= 1000 ? (val/1000) + 'k' : val}`}
                                tickMargin={6}
                              />
                              <Tooltip 
                                contentStyle={{ 
                                  backgroundColor: '#111318', 
                                  borderColor: '#2d3139', 
                                  borderRadius: '8px',
                                  fontSize: '11px',
                                  color: '#ffffff'
                                }} 
                                labelClassName="text-text-muted font-bold"
                                formatter={(value: any) => [`R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 'Patrimônio']}
                              />
                              <Line 
                                type="monotone" 
                                dataKey="amount" 
                                stroke="#ffe08b" 
                                strokeWidth={2.5}
                                activeDot={{ r: 6 }}
                                dot={false}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        )}
                      </div>
                    </div>

                    {/* Form to insert new records */}
                    <div className="bg-bg-surface-low border border-outline-variant p-5 rounded-2xl space-y-4">
                      <h4 className="text-xs uppercase font-extrabold text-[#ffe08b] tracking-wider flex items-center gap-1.5 font-mono">
                        <Plus size={14} /> Inserir Novo Registro Histórico
                      </h4>
                      <form 
                        onSubmit={(e) => {
                          e.preventDefault();
                          if (!newPatrimonyMonthYear || !newPatrimonyAmount) {
                            triggerToast('Preencha os campos de mês/ano e valor.');
                            return;
                          }

                          const dateRegex = /^(0?[1-9]|1[0-2])\/\d{2,4}$/;
                          if (!dateRegex.test(newPatrimonyMonthYear)) {
                            triggerToast('Período inválido. Use o formato Mês/Ano (MM/AAAA, ex: 06/2026).');
                            return;
                          }

                          const cleanedVal = newPatrimonyAmount.replace(/\s/g, '').replace('R$', '').replace(/\./g, '').replace(',', '.');
                          const numericAmount = parseFloat(cleanedVal);
                          if (isNaN(numericAmount) || numericAmount < 0) {
                            triggerToast('Insira um valor patrimonial válido maior ou igual a zero.');
                            return;
                          }

                          const newEntry: PatrimonyEntry = {
                            id: `pe-${Date.now()}`,
                            monthYear: newPatrimonyMonthYear,
                            amount: numericAmount
                          };

                          setPatrimonyHistory(prev => {
                            const filtered = prev.filter(p => p.monthYear !== newPatrimonyMonthYear);
                            return [...filtered, newEntry];
                          });

                          setNewPatrimonyMonthYear('');
                          setNewPatrimonyAmount('');
                          triggerToast('Registro patrimonial adicionado!');
                        }}
                        className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end"
                        id="patrimony-page-form"
                      >
                        <div className="space-y-1.5">
                          <label className="block text-[9px] uppercase tracking-widest text-[#ffe08b] font-bold font-mono">Mês/Ano</label>
                          <input
                            type="text"
                            required
                            placeholder="MM/AAAA"
                            value={newPatrimonyMonthYear}
                            onChange={(e) => {
                              const value = e.target.value;
                              const digits = value.replace(/\D/g, '');
                              let formatted = value;
                              if (digits.length === 2) {
                                if (value.length === 2) {
                                  formatted = digits + '/';
                                } else {
                                  formatted = digits;
                                }
                              } else if (digits.length > 2) {
                                formatted = digits.slice(0, 2) + '/' + digits.slice(2, 6);
                              } else {
                                formatted = digits;
                              }
                              setNewPatrimonyMonthYear(formatted.slice(0, 7));
                            }}
                            className="w-full bg-black/40 border border-outline-variant/30 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-text-muted/50 focus:border-brand-primary outline-none font-mono"
                            id="page-inp-patrimony-monthyear"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="block text-[9px] uppercase tracking-widest text-[#ffe08b] font-bold font-mono">Valor Total (R$)</label>
                          <input
                            type="text"
                            inputMode="decimal"
                            required
                            placeholder="0,00"
                            value={newPatrimonyAmount}
                            onChange={(e) => {
                              const val = e.target.value;
                              const digits = val.replace(/\D/g, '');
                              if (!digits) {
                                setNewPatrimonyAmount('');
                                return;
                              }
                              if (digits.length < 3) {
                                const parsedNum = parseInt(digits, 10);
                                setNewPatrimonyAmount(isNaN(parsedNum) ? '' : String(parsedNum));
                              } else {
                                const cents = digits.slice(-2);
                                const whole = digits.slice(0, -2);
                                const parsedWhole = parseInt(whole, 10);
                                const formattedWhole = isNaN(parsedWhole) ? '0' : String(parsedWhole);
                                setNewPatrimonyAmount(`${formattedWhole},${cents}`);
                              }
                            }}
                            className="w-full bg-black/40 border border-outline-variant/30 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-text-muted/50 focus:border-brand-primary outline-none font-mono"
                            id="page-inp-patrimony-amount"
                          />
                        </div>
                        <button
                          type="submit"
                          className="w-full bg-brand-primary hover:bg-brand-primary/80 text-black font-extrabold uppercase text-[10px] tracking-widest py-2.5 rounded-xl transition-all cursor-pointer h-[42px]"
                          id="page-btn-submit-patrimony"
                        >
                          SALVAR REGISTRO
                        </button>
                      </form>
                    </div>
                  </div>

                  {/* Right Column (1/3 width on desktop): Existing controls list */}
                  <div className="bg-bg-surface-low border border-outline-variant p-5 rounded-2xl flex flex-col h-full max-h-[500px]" id="patrimony-list-container">
                    <h4 className="text-[11px] uppercase tracking-widest text-[#ffe08b] font-bold mb-4 font-mono flex items-center justify-between border-b border-outline-variant/20 pb-3">
                      <span>Registros</span>
                      <span className="text-[10px] text-text-muted font-mono">{patrimonyHistory.length}</span>
                    </h4>

                    <div className="flex-1 overflow-y-auto pr-1 space-y-2.5 custom-scrollbar">
                      {patrimonyHistory.length === 0 ? (
                        <div className="text-center py-12 text-text-muted text-xs">Nenhum registro de patrimônio lançado.</div>
                      ) : (
                        [...patrimonyHistory]
                          .sort((a, b) => {
                            const [mA, yA] = a.monthYear.split('/').map(n => parseInt(n, 10));
                            const [mB, yB] = b.monthYear.split('/').map(n => parseInt(n, 10));
                            const dateA = new Date(yA < 100 ? 2000 + yA : yA, mA - 1, 1);
                            const dateB = new Date(yB < 100 ? 2000 + yB : yB, mB - 1, 1);
                            return dateB.getTime() - dateA.getTime();
                          })
                          .map((item) => (
                            <div 
                              key={item.id} 
                              className="bg-black/25 border border-outline-variant/30 hover:border-outline-variant/60 rounded-xl p-3.5 flex items-center justify-between transition-all"
                              id={`page-patrimony-item-${item.id}`}
                            >
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-[#ffe08b]" />
                                <span className="text-xs font-bold text-white font-mono">{item.monthYear}</span>
                              </div>

                              <div className="flex items-center gap-3">
                                <span className="font-mono font-black text-xs text-white">
                                  R$ {item.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setPatrimonyHistory(prev => prev.filter(p => p.id !== item.id));
                                    triggerToast('Registro de patrimônio removido!');
                                  }}
                                  className="text-text-muted hover:text-red-400 p-1.5 rounded hover:bg-white/5 transition-all cursor-pointer"
                                  title="Remover ponto de controle"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </div>
                          ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-6" id="contas-screen-grid">
              
              {/* Top Section: Consolidado Card & Action Trigger */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch" id="contas-top-section">
                {/* Header / Summary Card */}
                <div className="bg-bg-surface-low border border-outline-variant/60 rounded-2xl p-5 shadow-lg relative overflow-hidden flex flex-col justify-center" id="contas-summary-header">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-brand-primary/10 to-transparent rounded-bl-full pointer-events-none" />
                  <div className="flex justify-between items-center relative z-10">
                    <div className="space-y-1">
                      <span className="text-[10px] text-brand-primary uppercase tracking-widest font-mono font-bold block">
                        Patrimônio Líquido
                      </span>
                      <h2 className="text-2xl font-display font-black text-white tracking-tight">
                        {showConsolidatedBalance ? (
                          `R$ ${totalBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                        ) : (
                          "R$ ••••••••"
                        )}
                      </h2>
                    </div>
                    
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={toggleConsolidatedBalance}
                        className="inline-flex items-center justify-center bg-white/5 hover:bg-white/10 border border-outline-variant/30 text-text-muted hover:text-white p-2 rounded-xl transition-all duration-200 cursor-pointer shadow-md"
                        id="btn-toggle-consolidated-visibility"
                        title={showConsolidatedBalance ? "Ocultar saldo" : "Mostrar saldo"}
                      >
                        {showConsolidatedBalance ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>

                      <button
                        type="button"
                        onClick={() => setIsPatrimonyHistoryView(true)}
                        className="inline-flex items-center gap-1.5 bg-[#ffe08b]/10 hover:bg-[#ffe08b]/20 border border-[#ffe08b]/30 hover:border-[#ffe08b] text-[#ffe08b] text-[10px] font-black uppercase tracking-wider px-3 py-2 rounded-xl transition-all duration-200 cursor-pointer shadow-md shadow-[#ffe08b]/5 shrink-0"
                        id="btn-open-patrimony-history"
                      >
                        <History size={13} strokeWidth={2.5} />
                        Histórico
                      </button>
                    </div>
                  </div>
                </div>

                {/* Botão de Cadastrar Nova Conta em popup modal */}
                <button
                  type="button"
                  onClick={() => {
                    setNewAccountName('');
                    setNewAccountBalance('');
                    setIsNewAccountModalOpen(true);
                  }}
                  className="w-full md:h-full md:min-h-[88px] bg-brand-primary/10 hover:bg-brand-primary/20 border border-brand-primary/35 text-brand-primary font-bold uppercase text-[10px] tracking-widest py-2.5 md:py-3.5 rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-2"
                  id="btn-open-create-account-modal"
                >
                  <Plus size={14} strokeWidth={3} /> Cadastrar Nova Conta
                </button>
              </div>

              {/* Bottom Section: List of accounts */}
              <div className="space-y-4" id="contas-managed-list-container">
                <span className="block text-[10px] uppercase tracking-widest text-[#ffe08b] font-bold font-mono">
                  Suas Contas Cadastradas
                </span>

                <Reorder.Group axis="y" values={accounts} onReorder={setAccounts} className="space-y-4" id="reorder-accounts-group">
                  {accounts.map(acc => (
                    <AccountItem
                      key={acc.id}
                      acc={acc}
                      onViewHistory={(accToView) => {
                        setSelectedHistoryAccount(accToView);
                        setIsAccountHistoryModalOpen(true);
                      }}
                      onEdit={(accToEdit) => {
                        setEditingAccount(accToEdit);
                        setEditAccountName(accToEdit.name);
                        setEditAccountBalance(accToEdit.balance.toFixed(2).replace('.', ','));
                        setEditAccountColor(accToEdit.color || 'brand-primary');
                        setIsEditAccountModalOpen(true);
                      }}
                      onDelete={(accToDelete) => {
                        if (accounts.length <= 1) {
                          triggerToast('Mantenha pelo menos uma conta ativa para operacionalizar o app.');
                          return;
                        }
                        setAccountToDelete(accToDelete);
                      }}
                      onAddBalance={(accToAdd) => {
                        setSelectedAdjustingAccount(accToAdd);
                        setAdjustingType('somar');
                        setAdjustmentAmount('');
                        setIsAdjustBalanceModalOpen(true);
                      }}
                      onSubBalance={(accToSub) => {
                        setSelectedAdjustingAccount(accToSub);
                        setAdjustingType('subtrair');
                        setAdjustmentAmount('');
                        setIsAdjustBalanceModalOpen(true);
                      }}
                    />
                  ))}
                </Reorder.Group>
              </div>

            </div>
            )}
          </motion.div>
        )}

        {/* TAB PLAN (PLANEJAMENTO FINANCEIRO MENSAL) */}
        {activeScreen === 'plan' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col h-full overflow-hidden"
            id="plan-screen-view"
          >
            <PlanScreen
              planEntries={planEntries}
              setPlanEntries={setPlanEntries}
              planIncomes={planIncomes}
              setPlanIncomes={setPlanIncomes}
              planCards={planCards}
              setPlanCards={setPlanCards}
              triggerToast={triggerToast}
              accounts={accounts}
              activePlanMonth={activePlanMonth}
              setActivePlanMonth={setActivePlanMonth}
              planMonth={planMonth}
              setPlanMonth={setPlanMonth}
            />
          </motion.div>
        )}

        {/* TAB 3: TEMP (INFORMAÇÕES TEMPORÁRIAS) */}
        {activeScreen === 'temp' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col"
            id="temp-screen-view"
          >
            {/* Header / Summary Card */}
            <div className="bg-bg-surface-low border border-outline-variant/60 rounded-2xl p-5 shadow-lg relative overflow-hidden mb-6" id="temp-summary-header">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-brand-primary/10 to-transparent rounded-bl-full pointer-events-none" />
              <span className="text-[10px] text-brand-primary uppercase tracking-widest font-mono font-bold block mb-1">
                Controle Temporário Consolidado
              </span>
              <h2 className="text-3xl font-display font-black text-white tracking-tight">
                R$ {tempCategories.reduce((acc, cat) => acc + cat.entries.reduce((eAcc, entry) => eAcc + entry.amount, 0), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h2>
              <p className="text-[10px] text-text-muted mt-1 uppercase font-semibold">
                {tempCategories.length} {tempCategories.length === 1 ? 'categoria ativa' : 'categorias ativas'}
              </p>
            </div>

            {/* Botão de Cadastrar Nova Categoria em popup modal */}
            <button
              type="button"
              onClick={() => {
                setNewTempCategoryName('');
                setIsNewTempCategoryModalOpen(true);
              }}
              className="w-full bg-brand-primary/10 hover:bg-brand-primary/20 border border-brand-primary/35 text-brand-primary font-bold uppercase text-[10px] tracking-widest py-3.5 rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-2 mb-6"
              id="btn-open-create-temp-modal"
            >
              <PlusCircle size={14} strokeWidth={3} /> Nova Categoria Temporária
            </button>

            {/* List of temporary categories */}
            <div className="space-y-6" id="temp-managed-list-container">
              {tempCategories.length === 0 ? (
                <div className="text-center py-10 bg-bg-surface-low/30 border border-dashed border-outline-variant/40 rounded-2xl text-text-muted text-xs">
                  <Flame size={20} className="mx-auto mb-2 opacity-50 text-brand-primary" />
                  Nenhuma categoria temporária cadastrada.
                </div>
              ) : (
                tempCategories.map(cat => {
                  const sumOfCategory = cat.entries.reduce((acc, e) => acc + e.amount, 0);
                  return (
                    <div 
                      key={cat.id} 
                      className="bg-bg-surface-low border border-outline-variant/50 rounded-2xl p-4.5 space-y-3 relative transition-all hover:border-outline-variant"
                      id={`card-temp-${cat.id}`}
                    >
                      {/* Header row with Name and trash button */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-brand-primary shadow-sm shadow-brand-primary/50" />
                          <span className="text-xs font-black text-white uppercase tracking-wider">{cat.name}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteTempCategory(cat.id, cat.name)}
                          className="text-text-muted hover:text-red-400 p-1 rounded-lg hover:bg-red-500/10 transition-colors cursor-pointer flex items-center justify-center"
                          title="Remover categoria"
                          id={`btn-delete-temp-${cat.id}`}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>

                      {/* Entries List */}
                      <div className="space-y-2 mt-1">
                        {cat.entries.length === 0 ? (
                          <p className="text-[11px] text-text-muted italic opacity-70">Nenhum lançamento nesta categoria.</p>
                        ) : (
                          <div className="space-y-1.5 max-h-[160px] overflow-y-auto custom-scrollbar pr-1">
                            {cat.entries.map(entry => (
                              <div 
                                key={entry.id} 
                                className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-bg-base/40 border border-outline-variant/20 hover:border-outline-variant/40 transition-all"
                                id={`entry-row-${entry.id}`}
                              >
                                <div className="flex flex-col">
                                  <span className="text-white font-medium text-[11px]">{entry.description}</span>
                                  <span className="text-[9px] text-text-muted">{entry.date}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="font-mono font-bold text-white text-[11px]">
                                    R$ {entry.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteTempEntry(cat.id, entry.id)}
                                    className="text-text-muted hover:text-red-400 p-0.5 rounded transition-colors cursor-pointer"
                                    title="Excluir lançamento"
                                    id={`btn-delete-entry-${entry.id}`}
                                  >
                                    <Trash2 size={10} />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Somatório field */}
                      <div className="flex items-center justify-between pt-2 border-t border-outline-variant/20">
                        <span className="text-[10px] text-text-muted uppercase tracking-wider font-semibold">Somatório</span>
                        <span className="text-sm font-extrabold font-mono text-[#ffe08b]">
                          R$ {sumOfCategory.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>

                      {/* Add Lançamento form */}
                      <div className="bg-bg-base/30 border border-outline-variant/30 rounded-xl p-2.5 mt-3 space-y-2">
                        <span className="block text-[9px] uppercase tracking-widest text-brand-primary font-black">Adicionar Lançamento</span>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Descrição"
                            value={newEntryDesc[cat.id] || ''}
                            onChange={(e) => setNewEntryDesc(prev => ({ ...prev, [cat.id]: e.target.value }))}
                            className="flex-1 bg-bg-base border border-outline-variant/40 rounded-lg px-2.5 py-1.5 text-[11px] text-white placeholder:text-text-muted focus:outline-none focus:border-brand-primary transition-all"
                            id={`input-desc-temp-${cat.id}`}
                          />
                          <input
                            type="text"
                            inputMode="decimal"
                            placeholder="0,00"
                            value={newEntryAmount[cat.id] || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              const digits = val.replace(/\D/g, '');
                              if (!digits) {
                                setNewEntryAmount(prev => ({ ...prev, [cat.id]: '' }));
                                return;
                              }
                              if (digits.length < 3) {
                                const parsedNum = parseInt(digits, 10);
                                setNewEntryAmount(prev => ({ ...prev, [cat.id]: isNaN(parsedNum) ? '' : String(parsedNum) }));
                              } else {
                                const cents = digits.slice(-2);
                                const whole = digits.slice(0, -2);
                                const parsedWhole = parseInt(whole, 10);
                                const formattedWhole = isNaN(parsedWhole) ? '0' : String(parsedWhole);
                                setNewEntryAmount(prev => ({ ...prev, [cat.id]: `${formattedWhole},${cents}` }));
                              }
                            }}
                            className="w-20 bg-bg-base border border-outline-variant/40 rounded-lg px-2 py-1.5 text-[11px] text-white placeholder:text-text-muted focus:outline-none focus:border-brand-primary transition-all text-center font-mono"
                            id={`input-val-temp-${cat.id}`}
                          />
                          <button
                            type="button"
                            onClick={() => handleAddTempEntry(cat.id, newEntryDesc[cat.id] || '', newEntryAmount[cat.id] || '')}
                            className="bg-brand-primary/10 hover:bg-brand-primary text-brand-primary hover:text-black py-1 px-3 border border-brand-primary/30 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center shrink-0"
                            id={`btn-add-entry-${cat.id}`}
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}

        {/* TAB 4: CONFIG (CONFIGURAÇÕES E BACKUP) */}
        {activeScreen === 'config' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col space-y-6 text-left"
            id="config-screen-view"
          >
            {/* User Account / Session Profile */}
            <div className="bg-bg-surface-low border border-outline-variant/60 rounded-2xl p-5 space-y-4" id="config-user-profile-box">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-primary shadow-sm shadow-brand-primary/50" />
                <span className="text-xs font-black text-white uppercase tracking-wider">Conta Conectada</span>
              </div>
              
              <div className="bg-gradient-to-r from-bg-base to-bg-base/60 border border-outline-variant/30 rounded-xl p-3.5 flex items-center justify-between gap-3" id="profile-card-details">
                <div className="flex items-center gap-3">
                  {firebaseUser && firebaseUser.photoURL ? (
                    <img 
                      src={firebaseUser.photoURL} 
                      alt={firebaseUser.displayName || 'Avatar'} 
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 rounded-full border border-brand-primary/20 object-cover"
                      id="profile-avatar"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full border border-brand-primary/20 bg-brand-primary/15 text-brand-primary flex items-center justify-center font-bold text-sm" id="profile-avatar-placeholder">
                      {firebaseUser && firebaseUser.displayName ? firebaseUser.displayName.charAt(0).toUpperCase() : 'U'}
                    </div>
                  )}
                  <div className="text-left">
                    <h4 className="text-xs font-bold text-white leading-tight">
                      {firebaseUser ? (firebaseUser.displayName || 'Usuário Google') : 'Usuário Conectado'}
                    </h4>
                    <p className="text-[10px] text-text-muted mt-0.5 truncate max-w-[150px]">
                      {firebaseUser ? firebaseUser.email : ''}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {saveLoading && (
                    <span className="text-[8px] font-mono text-brand-primary animate-pulse tracking-tight bg-brand-primary/10 px-1.5 py-1 rounded border border-brand-primary/20 shrink-0">
                      Sincro
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 text-red-500 font-extrabold uppercase text-[8px] tracking-widest px-2.5 py-2 rounded-lg transition-all cursor-pointer shrink-0"
                    id="btn-signout"
                  >
                    Sair
                  </button>
                </div>
              </div>
            </div>



            {/* Linha Única de Ações Rápidas: Aparência, Exportar e Importar */}
            <div className="grid grid-cols-3 gap-3" id="config-quick-actions-row">
              {/* Botão de Troca de Aparência */}
              <button
                type="button"
                onClick={() => {
                  const nextTheme = theme === 'dark' ? 'light' : 'dark';
                  setTheme(nextTheme);
                  triggerToast(`Modo ${nextTheme === 'dark' ? 'Escuro' : 'Claro'} ativado!`);
                }}
                className={`flex items-center justify-center py-3.5 px-4 rounded-2xl border transition-all cursor-pointer shadow-md group ${
                  theme === 'light'
                    ? 'bg-white hover:bg-zinc-100 border-zinc-200 text-zinc-900'
                    : 'bg-bg-surface-low hover:bg-bg-surface-med border-outline-variant/60 text-white'
                }`}
                title={theme === 'dark' ? 'Mudar para Modo Claro' : 'Mudar para Modo Escuro'}
                id="btn-quick-theme"
              >
                {theme === 'dark' ? (
                  <Moon size={20} className="text-brand-primary group-hover:scale-110 transition-transform" />
                ) : (
                  <Sun size={20} className="text-amber-500 group-hover:scale-110 transition-transform" />
                )}
              </button>

              {/* Botão de Exportar Dados */}
              <button
                type="button"
                onClick={handleExportBackup}
                className={`flex items-center justify-center py-3.5 px-4 rounded-2xl border transition-all cursor-pointer shadow-md group ${
                  theme === 'light'
                    ? 'bg-white hover:bg-zinc-100 border-zinc-200 text-zinc-900'
                    : 'bg-bg-surface-low hover:bg-bg-surface-med border-outline-variant/60 text-white'
                }`}
                title="Exportar Dados (Backup)"
                id="btn-quick-export"
              >
                <Download size={20} className="text-brand-primary group-hover:scale-110 transition-transform" />
              </button>

              {/* Botão de Importar Dados */}
              <button
                type="button"
                onClick={() => document.getElementById('import-backup-file-input')?.click()}
                className={`flex items-center justify-center py-3.5 px-4 rounded-2xl border transition-all cursor-pointer shadow-md group ${
                  theme === 'light'
                    ? 'bg-white hover:bg-zinc-100 border-zinc-200 text-zinc-900'
                    : 'bg-bg-surface-low hover:bg-bg-surface-med border-outline-variant/60 text-white'
                }`}
                title="Importar Dados (Restaurar Backup)"
                id="btn-quick-import"
              >
                <Upload size={20} className="text-brand-primary group-hover:scale-110 transition-transform" />
              </button>

              <input
                type="file"
                accept=".json"
                onChange={handleImportBackup}
                className="hidden"
                id="import-backup-file-input"
              />
            </div>

            {/* Informações do Sistema Card */}
            <div className="bg-bg-surface-low border border-outline-variant/60 rounded-2xl p-5 space-y-4 shadow-lg" id="config-system-info-box">
              <div className="flex items-center gap-2 border-b border-outline-variant/30 pb-3">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-primary shadow-sm shadow-brand-primary/50" />
                <span 
                  onClick={() => setIsEditVersionsModalOpen(true)} 
                  className="text-xs font-black text-white uppercase tracking-wider cursor-default select-none"
                  id="system-info-title-invisible-btn"
                >
                  Informações do Sistema
                </span>
              </div>
              
              <ul className="space-y-2 font-mono text-[11px] leading-relaxed">
                <li className="flex items-center justify-between text-text-muted py-1 border-b border-outline-variant/10">
                  <div className="flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-brand-primary" />
                    <span>Módulo Finance</span>
                  </div>
                  <span className="text-white font-bold">{systemVersions.finance}</span>
                </li>
                <li className="flex items-center justify-between text-text-muted py-1 border-b border-outline-variant/10">
                  <div className="flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-brand-primary" />
                    <span>Módulo Work</span>
                  </div>
                  <span className="text-white font-bold">{systemVersions.work}</span>
                </li>
                <li className="flex items-center justify-between text-text-muted py-1 border-b border-outline-variant/10">
                  <div className="flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-brand-primary" />
                    <span>Módulo Fuel</span>
                  </div>
                  <span className="text-white font-bold">{systemVersions.fuel}</span>
                </li>
                <li className="flex items-center justify-between text-text-muted py-1 border-b border-outline-variant/10">
                  <div className="flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-brand-primary" />
                    <span>Módulo Games</span>
                  </div>
                  <span className="text-white font-bold">{systemVersions.games}</span>
                </li>
                <li className="flex items-center justify-between text-text-muted py-1">
                  <div className="flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-brand-primary" />
                    <span>Módulo Tools</span>
                  </div>
                  <span className="text-white font-bold">{systemVersions.tools || 'v1.0.0'}</span>
                </li>
              </ul>

              <div className="text-center pt-3 border-t border-outline-variant/10 text-[11px] font-bold text-brand-primary select-none font-mono" id="system-info-developer-text">
                2026 - {systemVersions.app} - Desenvolvido por Armindo Neto
              </div>
            </div>
          </motion.div>
        )}

        {/* WORK SCREENS: CONTRACHEQUE */}
        {activeScreen === 'contracheque' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col h-full overflow-hidden"
            id="contracheque-screen-view"
          >
            <ContrachequeScreen
              contrachequeEntries={contrachequeEntries}
              setContrachequeEntries={setContrachequeEntries}
              triggerToast={triggerToast}
              currentMonth={contrachequeMonth}
              setCurrentMonth={setContrachequeMonth}
              isResumoView={contrachequeIsResumoView}
              setIsResumoView={setContrachequeIsResumoView}
              searchQuery={contrachequeSearchQuery}
              setSearchQuery={handleContrachequeSearchChange}
            />
          </motion.div>
        )}

        {/* WORK SCREENS: HISTÓRICO */}
        {activeScreen === 'missoes' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col h-full overflow-hidden"
            id="missoes-screen-view"
          >
            <HistoricoScreen
              historicoEntries={historicoEntries}
              setHistoricoEntries={setHistoricoEntries}
              triggerToast={triggerToast}
              contrachequeTotalNet={contrachequeTotalNet}
              isAfastamentosView={historicoIsAfastamentosView}
              setIsAfastamentosView={setHistoricoIsAfastamentosView}
              theme={theme}
            />
          </motion.div>
        )}

        {/* WORK SCREENS: ME4 */}
        {activeScreen === 'me4' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full"
            id="me4-screen-view"
          >
            <ME4Screen 
              exclusions={me4Exclusions} 
              setExclusions={setMe4Exclusions} 
              highlights={me4Highlights} 
              setHighlights={setMe4Highlights} 
              theme={theme}
            />
          </motion.div>
        )}

        {/* WORK SCREENS: ESCALA */}
        {activeScreen === 'escala' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full"
            id="escala-screen-view"
          >
            <EscalaScreen
              turnos={escalaTurnos}
              setTurnos={setEscalaTurnos}
              escalaDays={escalaDays}
              setEscalaDays={setEscalaDays}
              triggerToast={triggerToast}
            />
          </motion.div>
        )}

        {/* GENERAL WORK SCREEN (FALLBACK) */}
        {activeScreen === 'fab' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 text-center"
            id="fab-screen-view"
          >
            <div className="bg-bg-surface-low border border-outline-variant/60 rounded-3xl p-10 max-w-md w-full shadow-2xl space-y-6 flex flex-col items-center">
              <div className="w-16 h-16 bg-brand-primary/10 rounded-2xl flex items-center justify-center border border-brand-primary/20 gold-glow">
                <FABIcon size={32} className="text-brand-primary animate-pulse" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-display font-black text-white uppercase tracking-wider">MÓDULO WORK</h3>
                <p className="text-sm font-semibold text-text-high">Módulo em desenvolvimento.</p>
                <p className="text-xs text-text-muted">Em breve você terá acesso a todas as funcionalidades deste espaço.</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* FUEL SCREEN */}
        {activeScreen === 'fuel' && (() => {
          const sortedAsc = [...fuelEntries].sort((a, b) => a.km - b.km);
          
          const totalAbastecido = fuelEntries.reduce((sum, e) => sum + e.qty, 0);
          const totalGasto = fuelEntries.reduce((sum, e) => sum + e.value, 0);
          
          const totalPercorrido = sortedAsc.length >= 2 
            ? sortedAsc[sortedAsc.length - 1].km - sortedAsc[0].km 
            : 0;

          const intervals: { dist: number; qty: number; consumption: number }[] = [];
          for (let i = 1; i < sortedAsc.length; i++) {
            const dist = sortedAsc[i].km - sortedAsc[i - 1].km;
            const qty = sortedAsc[i].qty;
            const consumption = qty > 0 ? dist / qty : 0;
            intervals.push({ dist, qty, consumption });
          }

          const last3Intervals = intervals.slice(-3);
          const totalDistLast3 = last3Intervals.reduce((sum, item) => sum + item.dist, 0);
          const totalQtyLast3 = last3Intervals.reduce((sum, item) => sum + item.qty, 0);
          const mediaConsumoUltimos3 = totalQtyLast3 > 0 ? totalDistLast3 / totalQtyLast3 : 0;

          const totalDistTotal = intervals.reduce((sum, item) => sum + item.dist, 0);
          const totalQtyTotal = intervals.reduce((sum, item) => sum + item.qty, 0);
          const mediaConsumoReal = totalQtyTotal > 0 ? totalDistTotal / totalQtyTotal : 0;

          const parseFuelDate = (dateStr: string): Date => {
            const parts = dateStr.split('/');
            if (parts.length === 3) {
              const day = parseInt(parts[0], 10);
              const month = parseInt(parts[1], 10) - 1;
              let year = parseInt(parts[2], 10);
              if (parts[2].length === 2) {
                year += 2000;
              }
              return new Date(year, month, day);
            }
            return new Date();
          };

          // Simple linear regression to calculate trendline on chronological time basis
          const dataForChart = sortedAsc.map((entry, index) => {
            const parsedDate = parseFuelDate(entry.date);
            return {
              name: entry.date,
              timestamp: parsedDate.getTime(),
              km: entry.km,
              index: index
            };
          });

          let trendData = [...dataForChart];
          const n = dataForChart.length;
          if (n >= 2) {
            const firstT = dataForChart[0].timestamp;
            let sumX = 0;
            let sumY = 0;
            let sumXY = 0;
            let sumXX = 0;
            for (let i = 0; i < n; i++) {
              const x = dataForChart[i].timestamp - firstT;
              const y = dataForChart[i].km;
              sumX += x;
              sumY += y;
              sumXY += x * y;
              sumXX += x * x;
            }
            const denominator = n * sumXX - sumX * sumX;
            const slope = denominator !== 0 ? (n * sumXY - sumX * sumY) / denominator : 0;
            const intercept = (sumY - slope * sumX) / n;

            trendData = dataForChart.map(d => {
              const x = d.timestamp - firstT;
              return {
                ...d,
                kmReal: d.km,
                kmTendência: parseFloat((slope * x + intercept).toFixed(1))
              };
            });
          } else {
            trendData = dataForChart.map(d => ({
              ...d,
              kmReal: d.km,
              kmTendência: d.km
            }));
          }

          const entriesWithMetrics = sortedAsc.map((entry, index) => {
            const precoLitro = entry.qty > 0 ? entry.value / entry.qty : 0;
            let distancia = 0;
            let consumo = 0;
            if (index > 0) {
              distancia = entry.km - sortedAsc[index - 1].km;
              consumo = entry.qty > 0 ? distancia / entry.qty : 0;
            }
            return {
              ...entry,
              precoLitro,
              distancia,
              consumo,
              isFirst: index === 0
            };
          });

          const displayEntries = [...entriesWithMetrics].reverse();

          const handleAddFuelEntry = (e: React.FormEvent) => {
            e.preventDefault();
            setFuelError(null);

            if (fuelDate.length !== 8) {
              setFuelError('Por favor, informe a data completa no formato DD/MM/AA.');
              return;
            }
            if (!fuelKm) {
              setFuelError('Por favor, informe a quilometragem (Km).');
              return;
            }
            if (!fuelQty) {
              setFuelError('Por favor, informe a quantidade de litros (l).');
              return;
            }
            if (!fuelValue) {
              setFuelError('Por favor, informe o valor pago (R$).');
              return;
            }

            const parsedKm = parseFloat(fuelKm.replace(/\./g, '').replace(',', '.'));
            const parsedQty = parseFloat(fuelQty.replace(/\./g, '').replace(',', '.'));
            const parsedValue = parseFloat(fuelValue.replace(/\./g, '').replace(',', '.'));

            if (isNaN(parsedKm) || parsedKm <= 0) {
              setFuelError('Km deve ser maior que zero.');
              return;
            }
            if (isNaN(parsedQty) || parsedQty <= 0) {
              setFuelError('Quantidade deve ser maior que zero.');
              return;
            }
            if (isNaN(parsedValue) || parsedValue <= 0) {
              setFuelError('Valor pago deve ser maior que zero.');
              return;
            }

            // Check if Km is valid compared to existing if there are entries (optional warning/validation)
            // But let's keep it flexible so the user can back-insert if needed.

            const newEntry: FuelEntry = {
              id: `fuel-${Date.now()}`,
              date: fuelDate,
              km: parsedKm,
              qty: parsedQty,
              value: parsedValue
            };

            setFuelEntries(prev => [...prev, newEntry]);
            triggerToast('Abastecimento registrado com sucesso!');
            setIsFuelFormOpen(false);

            // Reset fields
            setFuelKm('');
            setFuelQty('');
            setFuelValue('');
            setFuelError(null);

            // Set date to today
            const today = new Date();
            const dd = String(today.getDate()).padStart(2, '0');
            const mm = String(today.getMonth() + 1).padStart(2, '0');
            const yy = String(today.getFullYear()).slice(-2);
            setFuelDate(`${dd}/${mm}/${yy}`);
          };

          const handleDeleteFuelEntry = (id: string) => {
            setFuelEntryToDelete(id);
          };

          const confirmDeleteFuelEntry = () => {
            if (fuelEntryToDelete) {
              setFuelEntries(prev => prev.filter(e => e.id !== fuelEntryToDelete));
              triggerToast('Abastecimento excluído.');
              setFuelEntryToDelete(null);
            }
          };

          return (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-7xl mx-auto px-4 md:px-6 py-6 space-y-6 text-left"
              id="fuel-screen-view"
            >
              {/* Resumo no Topo */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" id="fuel-summary-cards">
                <div className="bg-bg-surface-low border border-outline-variant/60 rounded-2xl p-4 flex flex-col justify-between space-y-2 shadow-lg">
                  <span className="text-[10px] uppercase tracking-wider text-text-muted font-bold block">Total Abastecido</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xl md:text-2xl font-mono font-black text-white">
                      {totalAbastecido.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <span className="text-xs text-brand-primary font-bold">litros</span>
                  </div>
                </div>

                <div className="bg-bg-surface-low border border-outline-variant/60 rounded-2xl p-4 flex flex-col justify-between space-y-2 shadow-lg">
                  <span className="text-[10px] uppercase tracking-wider text-text-muted font-bold block">Total Gasto</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xs text-brand-primary font-bold">R$</span>
                    <span className="text-xl md:text-2xl font-mono font-black text-white">
                      {totalGasto.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                <div className="bg-bg-surface-low border border-outline-variant/60 rounded-2xl p-4 flex flex-col justify-between space-y-2 shadow-lg">
                  <span className="text-[10px] uppercase tracking-wider text-text-muted font-bold block">Total Percorrido</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xl md:text-2xl font-mono font-black text-white">
                      {totalPercorrido.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                    </span>
                    <span className="text-xs text-brand-primary font-bold">Km</span>
                  </div>
                </div>

                <div className="bg-bg-surface-low border border-outline-variant/60 rounded-2xl p-4 flex flex-col justify-between space-y-2 shadow-lg">
                  <span className="text-[10px] uppercase tracking-wider text-text-muted font-bold block">Média de Consumo (Últ. 3)</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xl md:text-2xl font-mono font-black text-white">
                      {mediaConsumoUltimos3 > 0 
                        ? mediaConsumoUltimos3.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) 
                        : '-'}
                    </span>
                    <span className="text-xs text-brand-primary font-bold">{mediaConsumoUltimos3 > 0 ? 'Km/l' : ''}</span>
                  </div>
                </div>
              </div>

              {/* Histórico ou Painel de Análise */}
              {fuelSubView === 'analysis' ? (
                <div className="space-y-6" id="fuel-analysis-panel">
                  {/* Gráfico de Evolução de Quilometragem (Ocupa toda a linha) */}
                  <div className="bg-bg-surface-low border border-outline-variant/60 rounded-2xl p-5 shadow-xl space-y-4">
                      <div className="border-b border-outline-variant/30 pb-3 flex items-center justify-start">
                        <div className="flex items-center gap-2">
                          <TrendingUp size={18} className="text-brand-primary" />
                          <h3 className="font-display font-black text-sm tracking-tight text-white uppercase">Evolução da Quilometragem</h3>
                        </div>
                      </div>

                      {sortedAsc.length < 2 ? (
                        <div className="py-16 text-center text-text-muted text-xs space-y-2">
                          <p className="font-bold">Dados insuficientes para gerar o gráfico histórico.</p>
                          <p className="max-w-xs mx-auto text-[10px]">Registre pelo menos 2 abastecimentos para visualizar a evolução da quilometragem e a linha de tendência.</p>
                        </div>
                      ) : (
                        <div className="h-[300px] w-full pt-4" id="fuel-analysis-chart-container">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={trendData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                              <XAxis 
                                dataKey="timestamp" 
                                type="number"
                                domain={['dataMin', 'dataMax']}
                                tickFormatter={(tick) => {
                                  try {
                                    const d = new Date(tick);
                                    if (isNaN(d.getTime())) return '';
                                    const dd = String(d.getDate()).padStart(2, '0');
                                    const mm = String(d.getMonth() + 1).padStart(2, '0');
                                    const yyyy = d.getFullYear();
                                    return `${dd}/${mm}/${yyyy}`;
                                  } catch (_) {
                                    return '';
                                  }
                                }}
                                stroke="#888888" 
                                fontSize={10} 
                                tickLine={false} 
                                axisLine={false}
                              />
                              <YAxis 
                                stroke="#888888" 
                                fontSize={10} 
                                tickLine={false} 
                                axisLine={false}
                                domain={['auto', 'auto']}
                                tickFormatter={(val) => `${val} Km`}
                              />
                              <Tooltip 
                                contentStyle={{ backgroundColor: '#121212', borderColor: '#2d2d2d', borderRadius: '12px' }}
                                labelClassName="text-[10px] font-mono text-text-muted"
                                itemStyle={{ fontSize: '11px', padding: '2px 0' }}
                                labelFormatter={(label) => {
                                  try {
                                    const d = new Date(label);
                                    if (isNaN(d.getTime())) return label;
                                    const dd = String(d.getDate()).padStart(2, '0');
                                    const mm = String(d.getMonth() + 1).padStart(2, '0');
                                    const yyyy = d.getFullYear();
                                    return `${dd}/${mm}/${yyyy}`;
                                  } catch (_) {
                                    return label;
                                  }
                                }}
                                formatter={(value: any, name: any) => [
                                  `${Number(value).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} Km`,
                                  name === 'kmReal' ? 'Km Real' : 'Tendência'
                                ]}
                              />
                              <Line 
                                type="monotone" 
                                dataKey="kmReal" 
                                name="kmReal"
                                stroke="var(--color-brand-primary)" 
                                strokeWidth={2.5}
                                dot={false}
                                activeDot={{ r: 6 }}
                              />
                              <Line 
                                type="monotone" 
                                dataKey="kmTendência" 
                                name="kmTendência"
                                stroke="#50e3c2" 
                                strokeWidth={1.5}
                                strokeDasharray="5 5"
                                dot={false}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      )}
                    </div>

                    {/* Container de Simulador e Última Manutenção (Lado a lado) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Simulador de Média de Consumo */}
                      <div className="bg-bg-surface-low border border-outline-variant/60 rounded-2xl p-5 shadow-xl space-y-4">
                      <div className="border-b border-outline-variant/30 pb-3 flex items-center gap-2">
                        <SlidersHorizontal size={18} className="text-brand-primary" />
                        <h3 className="font-display font-black text-sm tracking-tight text-white uppercase">Simulador de Consumo</h3>
                      </div>

                      <div className="space-y-4">
                        {/* Média Real Display */}
                        <div className="bg-bg-base/50 border border-outline-variant/30 rounded-xl p-3.5 flex items-center justify-between">
                          <div>
                            <span className="text-[9px] uppercase tracking-wider text-text-muted font-bold block">Consumo</span>
                          </div>
                          <div className="text-right">
                            <span className="text-lg font-mono font-black text-brand-primary">
                              {mediaConsumoReal > 0 
                                ? `${mediaConsumoReal.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}` 
                                : '-'}
                            </span>
                            <span className="text-[10px] text-text-muted ml-1 font-bold">Km/l</span>
                          </div>
                        </div>

                        {/* Campo de Simulação */}
                        <div className="space-y-1.5">
                          <label className="block text-[10px] uppercase tracking-wider text-text-muted font-bold">CONSUMO COMPARATIVO</label>
                          <div className="relative">
                            <input
                              type="text"
                              inputMode="numeric"
                              value={simulatedConsumption}
                              onChange={(e) => {
                                const digits = e.target.value.replace(/\D/g, '');
                                if (!digits) {
                                  setSimulatedConsumption('');
                                } else {
                                  const num = parseInt(digits, 10);
                                  const floatVal = num / 10;
                                  setSimulatedConsumption(floatVal.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }));
                                }
                              }}
                              className="w-full bg-bg-base border border-outline-variant rounded-xl px-3.5 py-2.5 text-xs text-text-high font-mono tracking-tight focus:outline-none focus:border-brand-primary transition-all text-right pr-14"
                              placeholder="0,0"
                              id="fuel-input-simulated-consumption"
                            />
                            <span className="absolute inset-y-0 right-3.5 flex items-center text-[10px] font-bold text-text-muted">Km/l</span>
                          </div>
                        </div>

                        {/* Resultados */}
                        {(() => {
                          const parsedSim = parseFloat(simulatedConsumption.replace(',', '.'));
                          if (!parsedSim || parsedSim <= 0 || mediaConsumoReal <= 0 || totalPercorrido <= 0) {
                            return (
                              <div className="bg-bg-base/30 border border-dashed border-outline-variant/50 rounded-xl p-4 text-center text-text-muted text-[11px]">
                                Digite um consumo simulado válido para calcular a economia ou gasto adicional.
                              </div>
                            );
                          }

                          const simQty = totalPercorrido / parsedSim;
                          const diffQty = totalQtyTotal - simQty;
                          const avgPrice = totalAbastecido > 0 ? totalGasto / totalAbastecido : 0;
                          const diffCash = diffQty * avgPrice;

                          const isSaving = diffQty >= 0;

                          return (
                            <div className="space-y-3 pt-2" id="fuel-simulation-results">
                              <div className="text-[10px] uppercase tracking-wider text-text-muted font-bold">Resultado da Comparação</div>
                              
                              {/* Litragem comparison */}
                              <div className="grid grid-cols-2 gap-3">
                                <div className="bg-bg-base/40 border border-outline-variant/30 rounded-xl p-2.5">
                                  <span className="text-[9px] uppercase tracking-wider text-text-muted block">Litragem Real</span>
                                  <span className="text-sm font-mono font-bold text-white">
                                    {totalQtyTotal.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 2 })} l
                                  </span>
                                </div>
                                <div className="bg-bg-base/40 border border-outline-variant/30 rounded-xl p-2.5">
                                  <span className="text-[9px] uppercase tracking-wider text-text-muted block">Litragem Simulada</span>
                                  <span className="text-sm font-mono font-bold text-white">
                                    {simQty.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 2 })} l
                                  </span>
                                </div>
                              </div>

                              {/* Resultado Financeiro e de combustível */}
                              <div className={`border rounded-xl p-4 flex flex-col items-center text-center space-y-1 ${
                                isSaving 
                                  ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-400' 
                                  : 'bg-red-950/20 border-red-500/30 text-red-400'
                              }`}>
                                <span className="text-[10px] uppercase tracking-wider font-bold block">
                                  {isSaving ? 'Estimativa de Economia' : 'Estimativa de Custo Extra'}
                                </span>
                                
                                <div className="text-2xl font-mono font-black mt-1">
                                  R$ {Math.abs(diffCash).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </div>
                                
                                <span className="text-[11px] font-semibold opacity-90">
                                  {isSaving 
                                    ? `Você teria economizado ${Math.abs(diffQty).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 2 })} litros` 
                                    : `Você teria gasto ${Math.abs(diffQty).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 2 })} litros a mais`
                                  }
                                </span>
                                <span className="text-[9px] opacity-65 font-medium block mt-1">
                                  Cálculo baseado no preço médio de R$ {avgPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/l
                                </span>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    </div>

                      {/* Registro de Última Manutenção */}
                      <div className="bg-bg-surface-low border border-outline-variant/60 rounded-2xl p-5 shadow-xl space-y-4" id="maint-section">
                        <div className="border-b border-outline-variant/30 pb-3 flex items-center gap-2">
                          <Wrench size={18} className="text-brand-primary" />
                          <h3 className="font-display font-black text-sm tracking-tight text-white uppercase">Última Manutenção</h3>
                        </div>

                        {/* Informação Atual */}
                        <div className="bg-bg-base/50 border border-outline-variant/30 rounded-xl p-3.5 space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-text-muted font-semibold uppercase tracking-wider text-[9px]">Data da Manutenção</span>
                            <span className="font-mono font-black text-white">{lastMaintenance.date || 'Não cadastrada'}</span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-text-muted font-semibold uppercase tracking-wider text-[9px]">Quilometragem</span>
                            <span className="font-mono font-black text-brand-primary">
                              {lastMaintenance.km ? `${Number(lastMaintenance.km).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} Km` : '-'}
                            </span>
                          </div>
                        </div>

                        {/* Formulário Simples para Sobrescrever */}
                        <div className="space-y-3 pt-1">
                          <div className="text-[10px] uppercase tracking-wider text-text-muted font-bold">Registrar Nova Manutenção</div>
                          
                          <div className="grid grid-cols-2 gap-3">
                            {/* Data */}
                            <div className="space-y-1">
                              <label className="block text-[9px] uppercase tracking-wider text-text-muted font-bold">Data (DD/MM/AA)</label>
                              <div className="relative">
                                <span className="absolute inset-y-0 left-3 flex items-center text-text-muted">
                                  <Calendar size={12} />
                                </span>
                                <input
                                  type="text"
                                  inputMode="numeric"
                                  value={maintDateInput}
                                  onChange={(e) => {
                                    let clean = e.target.value.replace(/\D/g, '');
                                    if (clean.length > 6) {
                                      clean = clean.slice(0, 6);
                                    }
                                    let formatted = "";
                                    if (clean.length > 0) {
                                      formatted += clean.slice(0, 2);
                                    }
                                    if (clean.length > 2) {
                                      formatted += "/" + clean.slice(2, 4);
                                    }
                                    if (clean.length > 4) {
                                      formatted += "/" + clean.slice(4, 6);
                                    }
                                    setMaintDateInput(formatted);
                                  }}
                                  className="w-full bg-bg-base border border-outline-variant rounded-xl pl-8 pr-2 py-2 text-[11px] text-text-high font-mono tracking-tight focus:outline-none focus:border-brand-primary transition-all"
                                  placeholder="Ex: 15/06/26"
                                  maxLength={8}
                                />
                              </div>
                            </div>

                            {/* Km */}
                            <div className="space-y-1">
                              <label className="block text-[9px] uppercase tracking-wider text-text-muted font-bold">Km</label>
                              <input
                                type="text"
                                inputMode="numeric"
                                value={maintKmInput}
                                onChange={(e) => {
                                  const digits = e.target.value.replace(/\D/g, '');
                                  if (!digits) {
                                    setMaintKmInput('');
                                  } else {
                                    const num = parseInt(digits, 10);
                                    const floatVal = num / 10;
                                    setMaintKmInput(floatVal.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }));
                                  }
                                }}
                                className="w-full bg-bg-base border border-outline-variant rounded-xl px-3 py-2 text-[11px] text-text-high font-mono tracking-tight focus:outline-none focus:border-brand-primary transition-all text-right"
                                placeholder="0,0"
                              />
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              if (maintDateInput.length !== 8) {
                                triggerToast('Por favor, informe a data completa no formato DD/MM/AA.');
                                return;
                              }
                              if (!maintKmInput) {
                                triggerToast('Por favor, informe a quilometragem da manutenção.');
                                return;
                              }
                              const rawKm = maintKmInput.replace(/\./g, '').replace(',', '.');
                              setLastMaintenance({
                                date: maintDateInput,
                                km: rawKm
                              });
                              triggerToast('Manutenção registrada com sucesso!');
                            }}
                            className="w-full bg-brand-primary hover:bg-brand-primary-hover text-bg-base font-black text-[10px] uppercase tracking-wider py-2 rounded-xl transition-all shadow-md text-center cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            <Wrench size={12} />
                            <span>Atualizar Manutenção</span>
                          </button>
                        </div>
                      </div>

                    </div>
                  </div>
              ) : (
                <div className="w-full bg-bg-surface-low border border-outline-variant/60 rounded-2xl p-5 shadow-xl space-y-4">
                    <div className="border-b border-outline-variant/30 pb-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <History size={18} className="text-brand-primary" />
                        <h3 className="font-display font-black text-sm tracking-tight text-white uppercase">Histórico de Abastecimentos</h3>
                      </div>
                      <span className="text-[10px] bg-bg-base border border-outline-variant/50 px-2.5 py-1 rounded-full font-mono text-text-muted">
                        {fuelEntries.length} {fuelEntries.length === 1 ? 'registro' : 'registros'}
                      </span>
                    </div>

                    {displayEntries.length === 0 ? (
                      <div className="py-12 text-center text-text-muted space-y-2" id="fuel-history-empty">
                        <p className="text-sm font-semibold">Nenhum abastecimento registrado ainda.</p>
                        <p className="text-[11px] max-w-sm mx-auto">Clique no botão flutuante <strong className="text-brand-primary font-bold">"+"</strong> no canto inferior direito para cadastrar o seu primeiro abastecimento da moto e iniciar as análises de consumo.</p>
                      </div>
                    ) : (
                      <>
                        {/* Desktop Table */}
                        <div className="hidden md:block overflow-x-auto" id="fuel-desktop-table">
                          <table className="w-full text-center border-collapse">
                            <thead>
                              <tr className="border-b border-outline-variant/30 text-[9px] uppercase tracking-wider text-text-muted font-bold">
                                <th className="py-3 px-2 text-center">Data</th>
                                <th className="py-3 px-2 text-center">Odômetro</th>
                                <th className="py-3 px-2 text-center">Valor</th>
                                <th className="py-3 px-2 text-center">Quantidade</th>
                                <th className="py-3 px-2 text-center">Preço Litro</th>
                                <th className="py-3 px-2 text-center">Distância</th>
                                <th className="py-3 px-2 text-center">Consumo</th>
                                <th className="py-3 px-3 text-center w-10"></th>
                              </tr>
                            </thead>
                            <tbody>
                              {displayEntries.map((e) => (
                                <tr key={e.id} className="border-b border-outline-variant/20 hover:bg-white/[0.02] transition-colors text-xs text-text-high">
                                  <td className="py-3.5 px-2 text-center font-mono text-text-muted">{e.date}</td>
                                  <td className="py-3.5 px-2 text-center font-mono font-medium">
                                    {e.km.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} Km
                                  </td>
                                  <td className="py-3.5 px-2 text-center font-mono font-semibold text-white">
                                    R$ {e.value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                  </td>
                                  <td className="py-3.5 px-2 text-center font-mono text-text-muted">
                                    {e.qty.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} l
                                  </td>
                                  <td className="py-3.5 px-2 text-center font-mono text-text-muted">
                                    R$ {e.precoLitro.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/l
                                  </td>
                                  <td className="py-3.5 px-2 text-center font-mono">
                                    {e.isFirst ? (
                                      <span className="text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-md bg-white/5 text-text-muted font-sans font-bold">Primeiro</span>
                                    ) : (
                                      <span className="text-emerald-400 font-bold">+{e.distancia.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} Km</span>
                                    )}
                                  </td>
                                  <td className="py-3.5 px-2 text-center font-mono">
                                    {e.isFirst ? (
                                      <span className="text-text-muted">-</span>
                                    ) : (
                                      <span className="text-brand-primary font-bold">{e.consumo.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} Km/l</span>
                                    )}
                                  </td>
                                  <td className="py-3.5 px-3 text-center">
                                    <button
                                      onClick={() => handleDeleteFuelEntry(e.id)}
                                      className="text-text-muted hover:text-red-400 p-1.5 hover:bg-red-500/10 rounded-lg transition-colors"
                                      title="Excluir"
                                    >
                                      <Trash2 size={13} />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {/* Mobile Cards View */}
                        <div className="md:hidden space-y-3" id="fuel-mobile-cards">
                          {displayEntries.map((e) => (
                            <div key={e.id} className="bg-bg-base border border-outline-variant/50 rounded-xl p-4 space-y-3 shadow-sm text-xs">
                              <div className="flex items-center justify-between border-b border-outline-variant/20 pb-2">
                                <span className="font-mono text-text-muted font-bold">{e.date}</span>
                                <button
                                  onClick={() => handleDeleteFuelEntry(e.id)}
                                  className="text-text-muted hover:text-red-400 p-1 rounded-md hover:bg-red-500/10 transition-all"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>

                              <div className="grid grid-cols-2 gap-y-2.5">
                                <div>
                                  <span className="text-[9px] uppercase tracking-wider text-text-muted font-bold block">Odomêtro (Km)</span>
                                  <span className="font-mono font-bold text-white">{e.km.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} Km</span>
                                </div>
                                <div className="text-right">
                                  <span className="text-[9px] uppercase tracking-wider text-text-muted font-bold block">Abastecido</span>
                                  <span className="font-mono font-bold text-brand-primary">R$ {e.value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                  <span className="text-[10px] text-text-muted block">({e.qty.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} l)</span>
                                </div>
                                <div>
                                  <span className="text-[9px] uppercase tracking-wider text-text-muted font-bold block">Preço do Litro</span>
                                  <span className="font-mono text-text-muted">R$ {e.precoLitro.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/l</span>
                                </div>
                                <div className="text-right">
                                  <span className="text-[9px] uppercase tracking-wider text-text-muted font-bold block">Percurso / Consumo</span>
                                  {e.isFirst ? (
                                    <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-white/5 text-text-muted font-bold">Primeiro</span>
                                  ) : (
                                    <div className="font-mono space-y-0.5">
                                      <div className="text-emerald-400 font-bold">+{e.distancia.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} Km</div>
                                      <div className="text-brand-primary font-bold">{e.consumo.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} Km/l</div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                </div>
              )}

                {/* Modal de Novo Abastecimento */}
                <AnimatePresence>
                  {isFuelFormOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm shadow-2xl" id="fuel-form-modal-overlay">
                      <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        className="w-full max-w-sm bg-bg-surface-low border border-outline-variant/60 rounded-2xl p-6 space-y-5 shadow-xl text-left relative"
                        id="fuel-form-modal-content"
                      >
                        {/* Close button */}
                        <button
                          type="button"
                          onClick={() => {
                            setIsFuelFormOpen(false);
                            setFuelError(null);
                          }}
                          className="absolute top-4 right-4 text-text-muted hover:text-white transition-colors cursor-pointer p-1"
                          id="btn-close-fuel-modal"
                        >
                          ✕
                        </button>

                        {/* Header */}
                        <div className="flex items-center gap-2 border-b border-outline-variant/30 pb-3">
                          <Fuel className="text-brand-primary" size={18} />
                          <h3 className="font-display font-black text-sm tracking-tight text-white uppercase">
                            Novo Abastecimento
                          </h3>
                        </div>

                        {/* Form */}
                        <form onSubmit={(e) => {
                          handleAddFuelEntry(e);
                        }} className="space-y-4" id="fuel-modal-form">
                          {fuelError && (
                            <div className="text-xs text-red-400 bg-red-950/20 border border-red-500/30 rounded-xl p-3" id="fuel-form-modal-error">
                              {fuelError}
                            </div>
                          )}

                          {/* Data */}
                          <div className="space-y-1.5">
                            <label className="block text-[10px] uppercase tracking-wider text-text-muted font-bold">Data (DD/MM/AA)</label>
                            <div className="relative">
                              <span className="absolute inset-y-0 left-3.5 flex items-center text-text-muted">
                                <Calendar size={14} />
                              </span>
                              <input
                                type="text"
                                inputMode="numeric"
                                value={fuelDate}
                                onChange={(e) => {
                                  let clean = e.target.value.replace(/\D/g, '');
                                  if (clean.length > 6) {
                                    clean = clean.slice(0, 6);
                                  }
                                  let formatted = "";
                                  if (clean.length > 0) {
                                    formatted += clean.slice(0, 2);
                                  }
                                  if (clean.length > 2) {
                                    formatted += "/" + clean.slice(2, 4);
                                  }
                                  if (clean.length > 4) {
                                    formatted += "/" + clean.slice(4, 6);
                                  }
                                  setFuelDate(formatted);
                                }}
                                className="w-full bg-bg-base border border-outline-variant rounded-xl pl-10 pr-4 py-2.5 text-xs text-text-high font-mono tracking-tight focus:outline-none focus:border-brand-primary transition-all"
                                placeholder="Ex: 21/06/26"
                                maxLength={8}
                                id="fuel-modal-input-date"
                              />
                            </div>
                          </div>

                          {/* Km */}
                          <div className="space-y-1.5">
                            <label className="block text-[10px] uppercase tracking-wider text-text-muted font-bold">Quilometragem (Km)</label>
                            <div className="relative">
                              <input
                                type="text"
                                inputMode="numeric"
                                value={fuelKm}
                                onChange={(e) => {
                                  const digits = e.target.value.replace(/\D/g, '');
                                  if (!digits) {
                                    setFuelKm('');
                                  } else {
                                    const num = parseInt(digits, 10);
                                    const floatVal = num / 10;
                                    setFuelKm(floatVal.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }));
                                  }
                                }}
                                className="w-full bg-bg-base border border-outline-variant rounded-xl px-3.5 py-2.5 text-xs text-text-high font-mono tracking-tight focus:outline-none focus:border-brand-primary transition-all text-right pr-12"
                                placeholder="0,0"
                                id="fuel-modal-input-km"
                              />
                              <span className="absolute inset-y-0 right-3.5 flex items-center text-[10px] font-bold text-text-muted uppercase tracking-wider">Km</span>
                            </div>
                          </div>

                          {/* Quantidade */}
                          <div className="space-y-1.5">
                            <label className="block text-[10px] uppercase tracking-wider text-text-muted font-bold">Quantidade (Litros)</label>
                            <div className="relative">
                              <input
                                type="text"
                                inputMode="numeric"
                                value={fuelQty}
                                onChange={(e) => {
                                  const digits = e.target.value.replace(/\D/g, '');
                                  if (!digits) {
                                    setFuelQty('');
                                  } else {
                                    const num = parseInt(digits, 10);
                                    const floatVal = num / 100;
                                    setFuelQty(floatVal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
                                  }
                                }}
                                className="w-full bg-bg-base border border-outline-variant rounded-xl px-3.5 py-2.5 text-xs text-text-high font-mono tracking-tight focus:outline-none focus:border-brand-primary transition-all text-right pr-10"
                                placeholder="0,00"
                                id="fuel-modal-input-qty"
                              />
                              <span className="absolute inset-y-0 right-3.5 flex items-center text-[10px] font-bold text-text-muted uppercase tracking-wider">L</span>
                            </div>
                          </div>

                          {/* Valor */}
                          <div className="space-y-1.5">
                            <label className="block text-[10px] uppercase tracking-wider text-text-muted font-bold">Valor Pago (R$)</label>
                            <div className="relative">
                              <span className="absolute inset-y-0 left-3.5 flex items-center text-[10px] font-bold text-brand-primary">R$</span>
                              <input
                                type="text"
                                inputMode="numeric"
                                value={fuelValue}
                                onChange={(e) => {
                                  const digits = e.target.value.replace(/\D/g, '');
                                  if (!digits) {
                                    setFuelValue('');
                                  } else {
                                    const num = parseInt(digits, 10);
                                    const floatVal = num / 100;
                                    setFuelValue(floatVal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
                                  }
                                }}
                                className="w-full bg-bg-base border border-outline-variant rounded-xl pl-9 pr-4 py-2.5 text-xs text-text-high font-mono tracking-tight focus:outline-none focus:border-brand-primary transition-all text-right font-bold text-brand-primary"
                                placeholder="0,00"
                                id="fuel-modal-input-value"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3 pt-2">
                            <button
                              type="button"
                              onClick={() => {
                                setIsFuelFormOpen(false);
                                setFuelError(null);
                              }}
                              className="bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-text-high font-extrabold uppercase text-[10px] tracking-wider py-3 rounded-xl transition-all cursor-pointer text-center"
                              id="btn-cancel-fuel-modal"
                            >
                              Cancelar
                            </button>
                            <button
                              type="submit"
                              className="bg-brand-primary hover:bg-brand-primary-hover text-bg-base font-black text-[10px] uppercase tracking-wider py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-1"
                              id="btn-submit-fuel-modal"
                            >
                              <Plus size={12} strokeWidth={3} />
                              <span>Salvar</span>
                            </button>
                          </div>
                        </form>
                      </motion.div>
                    </div>
                  )}

                  {fuelEntryToDelete && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm shadow-2xl" id="fuel-delete-modal-overlay">
                      <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        className="w-full max-w-xs bg-bg-surface-low border border-outline-variant/60 rounded-2xl p-6 space-y-5 shadow-xl text-left relative"
                        id="fuel-delete-modal-content"
                      >
                        <h3 className="font-display font-black text-sm tracking-tight text-white uppercase border-b border-outline-variant/30 pb-3">
                          Confirmar Exclusão
                        </h3>
                        <p className="text-xs text-text-muted leading-relaxed">
                          Deseja realmente excluir este abastecimento? Essa ação é permanente.
                        </p>
                        <div className="grid grid-cols-2 gap-3 pt-2">
                          <button
                            type="button"
                            onClick={() => setFuelEntryToDelete(null)}
                            className="bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-text-high font-extrabold uppercase text-[10px] tracking-wider py-3 rounded-xl transition-all cursor-pointer text-center"
                          >
                            Cancelar
                          </button>
                          <button
                            type="button"
                            onClick={confirmDeleteFuelEntry}
                            className="bg-red-500 hover:bg-red-600 text-white font-black text-[10px] uppercase tracking-wider py-3 rounded-xl transition-all shadow-md text-center"
                          >
                            Excluir
                          </button>
                        </div>
                      </motion.div>
                    </div>
                  )}
                </AnimatePresence>
            </motion.div>
          );
        })()}

        {/* GAMES SCREEN */}
        {activeScreen === 'games' && (
          <GamesScreen
            trophyEntries={trophyEntries}
            setTrophyEntries={setTrophyEntries}
            toPlayConsoles={toPlayConsoles}
            setToPlayConsoles={setToPlayConsoles}
            pokemonGenerations={pokemonGenerations}
            setPokemonGenerations={setPokemonGenerations}
            triggerToast={triggerToast}
            activeSubmenu={gamesSubmenu}
            setActiveSubmenu={setGamesSubmenu}
          />
        )}

        {/* NOTES SCREEN */}
        {activeScreen === 'notes' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col space-y-6 text-left"
            id="notes-screen-view"
          >
            <NotesScreen 
              notes={notes} 
              setNotes={setNotes} 
              theme={theme}
            />
          </motion.div>
        )}

        {/* THE LIST SCREEN */}
        {activeScreen === 'thelist' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col space-y-6 text-left"
            id="thelist-screen-view"
          >
            <TheListScreen 
              theListEntries={theListEntries} 
              setTheListEntries={setTheListEntries} 
              theListYearCounts={theListYearCounts}
              setTheListYearCounts={setTheListYearCounts}
              triggerToast={triggerToast}
              theme={theme}
            />
          </motion.div>
        )}

        {/* CHECKLISTS SCREEN */}
        {activeScreen === 'checklists' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col space-y-6 text-left"
            id="checklists-screen-view"
          >
            <ChecklistsScreen 
              checklists={checklists} 
              setChecklists={setChecklists} 
              triggerToast={triggerToast}
              theme={theme}
            />
          </motion.div>
        )}

        {/* POKOPIA SCREEN */}
        {activeScreen === 'pokopia' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col space-y-6 text-left"
            id="pokopia-screen-view"
          >
            <PokopiaScreen 
              pokopiaEntries={pokopiaEntries} 
              setPokopiaEntries={setPokopiaEntries} 
              triggerToast={triggerToast}
              theme={theme}
            />
          </motion.div>
        )}

        </div>
      </main>

      {/* Mobile Submenu for FINANCE module (only shown when activeModule === 'finance' and showMobileSubmenu is true on mobile) */}
      <AnimatePresence>
        {activeModule === 'finance' && showMobileSubmenu && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="fixed bottom-20 left-4 right-4 z-55 bg-zinc-950/95 backdrop-blur-md border border-outline-variant/30 px-4 py-3 rounded-2xl flex items-center justify-around md:hidden shadow-2xl"
            id="mobile-finance-subnav"
          >
            <button
              type="button"
              onClick={() => {
                setActiveScreen('budget');
                setActiveTab('transacoes');
                setShowMobileSubmenu(false);
              }}
              className={`flex flex-col items-center gap-1 cursor-pointer transition-all ${activeScreen === 'budget' ? 'text-brand-primary scale-105' : 'text-text-muted hover:text-text-high'}`}
              id="btn-subnav-budget"
            >
              <Wallet size={16} />
              <span className="text-[9px] font-black tracking-widest uppercase font-display">BUDGET</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveScreen('contas');
                setShowMobileSubmenu(false);
              }}
              className={`flex flex-col items-center gap-1 cursor-pointer transition-all ${activeScreen === 'contas' ? 'text-brand-primary scale-105' : 'text-text-muted hover:text-text-high'}`}
              id="btn-subnav-contas"
            >
              <Landmark size={16} />
              <span className="text-[9px] font-black tracking-widest uppercase font-display">CONTAS</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveScreen('plan');
                setShowMobileSubmenu(false);
              }}
              className={`flex flex-col items-center gap-1 cursor-pointer transition-all ${activeScreen === 'plan' ? 'text-brand-primary scale-105' : 'text-text-muted hover:text-text-high'}`}
              id="btn-subnav-plan"
            >
              <Calendar size={16} />
              <span className="text-[9px] font-black tracking-widest uppercase font-display">PLAN</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveScreen('temp');
                setShowMobileSubmenu(false);
              }}
              className={`flex flex-col items-center gap-1 cursor-pointer transition-all ${activeScreen === 'temp' ? 'text-brand-primary scale-105' : 'text-text-muted hover:text-text-high'}`}
              id="btn-subnav-temp"
            >
              <Clock size={16} />
              <span className="text-[9px] font-black tracking-widest uppercase font-display">TEMP</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Submenu for WORK module (only shown when activeModule === 'fab' and showMobileSubmenu is true on mobile) */}
      <AnimatePresence>
        {activeModule === 'fab' && showMobileSubmenu && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="fixed bottom-20 left-4 right-4 z-55 bg-zinc-950/95 backdrop-blur-md border border-outline-variant/30 px-4 py-3 rounded-2xl flex items-center justify-around md:hidden shadow-2xl"
            id="mobile-work-subnav"
          >
            <button
              type="button"
              onClick={() => {
                setActiveScreen('contracheque');
                setShowMobileSubmenu(false);
              }}
              className={`flex flex-col items-center gap-1 cursor-pointer transition-all ${activeScreen === 'contracheque' ? 'text-brand-primary scale-105' : 'text-text-muted hover:text-text-high'}`}
              id="btn-subnav-contracheque"
            >
              <Receipt size={16} />
              <span className="text-[9px] font-black tracking-widest uppercase font-display">CONTRACHEQUE</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveScreen('missoes');
                setShowMobileSubmenu(false);
              }}
              className={`flex flex-col items-center gap-1 cursor-pointer transition-all ${activeScreen === 'missoes' ? 'text-brand-primary scale-105' : 'text-text-muted hover:text-text-high'}`}
              id="btn-subnav-missoes"
            >
              <History size={16} />
              <span className="text-[9px] font-black tracking-widest uppercase font-display">HISTÓRICO</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveScreen('me4');
                setShowMobileSubmenu(false);
              }}
              className={`flex flex-col items-center gap-1 cursor-pointer transition-all ${activeScreen === 'me4' ? 'text-brand-primary scale-105' : 'text-text-muted hover:text-text-high'}`}
              id="btn-subnav-me4"
            >
              <ListOrdered size={16} />
              <span className="text-[9px] font-black tracking-widest uppercase font-display">ME4</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveScreen('escala');
                setShowMobileSubmenu(false);
              }}
              className={`flex flex-col items-center gap-1 cursor-pointer transition-all ${activeScreen === 'escala' ? 'text-brand-primary scale-105' : 'text-text-muted hover:text-text-high'}`}
              id="btn-subnav-escala"
            >
              <CalendarDays size={16} />
              <span className="text-[9px] font-black tracking-widest uppercase font-display">ESCALA</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Submenu for FUEL module (only shown when activeModule === 'fuel' and showMobileSubmenu is true on mobile) */}
      <AnimatePresence>
        {activeModule === 'fuel' && showMobileSubmenu && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="fixed bottom-20 left-4 right-4 z-55 bg-zinc-950/95 backdrop-blur-md border border-outline-variant/30 px-4 py-3 rounded-2xl flex items-center justify-around md:hidden shadow-2xl"
            id="mobile-fuel-subnav"
          >
            <button
              type="button"
              onClick={() => {
                setActiveScreen('fuel');
                setShowMobileSubmenu(false);
              }}
              className={`flex flex-col items-center gap-1 cursor-pointer transition-all ${activeScreen === 'fuel' ? 'text-brand-primary scale-105' : 'text-text-muted hover:text-text-high'}`}
              id="btn-subnav-biz"
            >
              <Motorbike size={16} />
              <span className="text-[9px] font-black tracking-widest uppercase font-display">BIZ</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Submenu for GAMES module (only shown when activeModule === 'games' and showMobileSubmenu is true on mobile) */}
      <AnimatePresence>
        {activeModule === 'games' && showMobileSubmenu && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="fixed bottom-20 left-4 right-4 z-55 bg-zinc-950/95 backdrop-blur-md border border-outline-variant/30 px-4 py-3 rounded-2xl flex items-center justify-around md:hidden shadow-2xl"
            id="mobile-games-subnav"
          >
            <button
              type="button"
              onClick={() => {
                setActiveScreen('games');
                setGamesSubmenu('TROPHIES');
                setShowMobileSubmenu(false);
              }}
              className={`flex flex-col items-center gap-1 cursor-pointer transition-all ${activeScreen === 'games' && gamesSubmenu === 'TROPHIES' ? 'text-brand-primary scale-105' : 'text-text-muted hover:text-text-high'}`}
              id="btn-subnav-games-trophies"
            >
              <Trophy size={16} />
              <span className="text-[9px] font-black tracking-widest uppercase font-display">TROPHIES</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveScreen('games');
                setGamesSubmenu('POKÉMON');
                setShowMobileSubmenu(false);
              }}
              className={`flex flex-col items-center gap-1 cursor-pointer transition-all ${activeScreen === 'games' && gamesSubmenu === 'POKÉMON' ? 'text-brand-primary scale-105' : 'text-text-muted hover:text-text-high'}`}
              id="btn-subnav-games-pokemon"
            >
              <PokebolaIcon size={16} />
              <span className="text-[9px] font-black tracking-widest uppercase font-display">POKÉMON</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveScreen('games');
                setGamesSubmenu('TO PLAY');
                setShowMobileSubmenu(false);
              }}
              className={`flex flex-col items-center gap-1 cursor-pointer transition-all ${activeScreen === 'games' && gamesSubmenu === 'TO PLAY' ? 'text-brand-primary scale-105' : 'text-text-muted hover:text-text-high'}`}
              id="btn-subnav-games-toplay"
            >
              <Play size={16} />
              <span className="text-[9px] font-black tracking-widest uppercase font-display">TO PLAY</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveScreen('pokopia');
                setActiveModule('games');
                setShowMobileSubmenu(false);
              }}
              className={`flex flex-col items-center gap-1 cursor-pointer transition-all ${activeScreen === 'pokopia' ? 'text-brand-primary scale-105' : 'text-text-muted hover:text-text-high'}`}
              id="btn-subnav-games-pokopia"
            >
              <Compass size={16} />
              <span className="text-[9px] font-black tracking-widest uppercase font-display">POKOPIA</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Submenu for TOOLS module (only shown when activeModule === 'tools' and showMobileSubmenu is true on mobile) */}
      <AnimatePresence>
        {activeModule === 'tools' && showMobileSubmenu && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="fixed bottom-20 left-3 right-3 z-55 bg-zinc-950/95 backdrop-blur-md border border-outline-variant/30 px-2 py-3 rounded-2xl flex items-center justify-around md:hidden shadow-2xl"
            id="mobile-tools-subnav"
          >
            <button
              type="button"
              onClick={() => {
                setActiveScreen('notes');
                setActiveModule('tools');
                setShowMobileSubmenu(false);
              }}
              className={`flex flex-col items-center gap-1 cursor-pointer transition-all ${activeScreen === 'notes' && activeModule === 'tools' ? 'text-brand-primary scale-105' : 'text-text-muted hover:text-text-high'}`}
              id="btn-subnav-tools-notes"
            >
              <ScrollText size={16} />
              <span className="text-[8px] font-black tracking-widest uppercase font-display">NOTES</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveModule('tools');
                setIsTheListPasswordModalOpen(true);
                setShowMobileSubmenu(false);
              }}
              className={`flex flex-col items-center gap-1 cursor-pointer transition-all ${activeScreen === 'thelist' && activeModule === 'tools' ? 'text-brand-primary scale-105' : 'text-text-muted hover:text-text-high'}`}
              id="btn-subnav-tools-thelist"
            >
              <BookLock size={16} />
              <span className="text-[8px] font-black tracking-widest uppercase font-display">THE LIST</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveScreen('checklists');
                setActiveModule('tools');
                setShowMobileSubmenu(false);
              }}
              className={`flex flex-col items-center gap-1 cursor-pointer transition-all ${activeScreen === 'checklists' && activeModule === 'tools' ? 'text-brand-primary scale-105' : 'text-text-muted hover:text-text-high'}`}
              id="btn-subnav-tools-checklists"
            >
              <ListChecks size={16} />
              <span className="text-[8px] font-black tracking-widest uppercase font-display">LISTS</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setIsSpotifyModalOpen(true);
                setShowMobileSubmenu(false);
              }}
              className="flex flex-col items-center gap-1 cursor-pointer transition-all text-text-muted hover:text-text-high"
              id="btn-subnav-tools-spotify"
            >
              <Radio size={16} />
              <span className="text-[8px] font-black tracking-widest uppercase font-display">SPOTIFY</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fixed bottom menu bar with active dynamic states */}
      <div 
        className="fixed bottom-0 left-0 right-0 z-50 bg-zinc-950/95 backdrop-blur-md border-t border-outline-variant/30 px-2 sm:px-6 py-3 flex items-center justify-around md:hidden" 
        id="bottom-menu-bar"
      >
        <button
          type="button"
          onClick={() => {
            if (activeModule === 'finance') {
              setShowMobileSubmenu(prev => !prev);
            } else {
              setActiveModule('finance');
              setShowMobileSubmenu(true);
            }
          }}
          className={`flex flex-col items-center gap-1 cursor-pointer transition-all ${activeModule === 'finance' ? 'text-brand-primary' : 'text-text-muted hover:text-text-high'}`}
          id="btn-nav-finance"
        >
          <DollarSign size={18} className={activeModule === 'finance' ? 'scale-110 text-brand-primary transition-transform' : 'transition-transform'} />
          <span className="text-[8px] sm:text-[9px] font-black tracking-widest uppercase font-display">FINANCE</span>
        </button>

        <button
          type="button"
          onClick={() => {
            if (activeModule === 'fab') {
              setShowMobileSubmenu(prev => !prev);
            } else {
              setActiveModule('fab');
              setShowMobileSubmenu(true);
            }
          }}
          className={`flex flex-col items-center gap-1 cursor-pointer transition-all ${activeModule === 'fab' ? 'text-brand-primary' : 'text-text-muted hover:text-text-high'}`}
          id="btn-nav-work"
        >
          <FABIcon size={18} className={activeModule === 'fab' ? 'scale-110 text-brand-primary transition-transform' : 'transition-transform'} />
          <span className="text-[8px] sm:text-[9px] font-black tracking-widest uppercase font-display">WORK</span>
        </button>

        <button
          type="button"
          onClick={() => {
            if (activeModule === 'fuel') {
              setShowMobileSubmenu(prev => !prev);
            } else {
              setActiveModule('fuel');
              setShowMobileSubmenu(true);
            }
          }}
          className={`flex flex-col items-center gap-1 cursor-pointer transition-all ${activeModule === 'fuel' ? 'text-brand-primary' : 'text-text-muted hover:text-text-high'}`}
          id="btn-nav-fuel"
        >
          <Fuel size={18} className={activeModule === 'fuel' ? 'scale-110 text-brand-primary transition-transform' : 'transition-transform'} />
          <span className="text-[8px] sm:text-[9px] font-black tracking-widest uppercase font-display">FUEL</span>
        </button>

        <button
          type="button"
          onClick={() => {
            if (activeModule === 'games') {
              setShowMobileSubmenu(prev => !prev);
            } else {
              setActiveModule('games');
              setShowMobileSubmenu(true);
            }
          }}
          className={`flex flex-col items-center gap-1 cursor-pointer transition-all ${activeModule === 'games' ? 'text-brand-primary' : 'text-text-muted hover:text-text-high'}`}
          id="btn-nav-games"
        >
          <Gamepad2 size={18} className={activeModule === 'games' ? 'scale-110 text-brand-primary transition-transform' : 'transition-transform'} />
          <span className="text-[8px] sm:text-[9px] font-black tracking-widest uppercase font-display">GAMES</span>
        </button>

        <button
          type="button"
          onClick={() => {
            if (activeModule === 'tools') {
              setShowMobileSubmenu(prev => !prev);
            } else {
              setActiveModule('tools');
              setShowMobileSubmenu(true);
            }
          }}
          className={`flex flex-col items-center gap-1 cursor-pointer transition-all ${activeModule === 'tools' ? 'text-brand-primary' : 'text-text-muted hover:text-text-high'}`}
          id="btn-nav-tools"
        >
          <Wrench size={18} className={activeModule === 'tools' ? 'scale-110 text-brand-primary transition-transform' : 'transition-transform'} />
          <span className="text-[8px] sm:text-[9px] font-black tracking-widest uppercase font-display">TOOLS</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveModule('system');
            setActiveScreen('config');
            setShowMobileSubmenu(false);
          }}
          className={`flex flex-col items-center gap-1 cursor-pointer transition-all ${activeModule === 'system' ? 'text-brand-primary' : 'text-text-muted hover:text-text-high'}`}
          id="btn-nav-config"
        >
          <Settings size={18} className={activeModule === 'system' ? 'scale-110 text-brand-primary transition-transform rotate-45' : 'transition-transform'} />
          <span className="text-[8px] sm:text-[9px] font-black tracking-widest uppercase font-display">SYSTEM</span>
        </button>
      </div>

      {/* FAB (Floating Action Button): Visible only on BUDGET screen */}
      <AnimatePresence>
        {activeScreen === 'budget' && (
          <motion.button
            key="add-fab-button"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setEditingTransaction(null);
              setIsFormOpen(true);
            }}
            className="absolute bottom-20 md:bottom-8 right-6 w-14 h-14 bg-brand-primary text-black rounded-full flex items-center justify-center shadow-2xl hover:brightness-110 z-30 cursor-pointer gold-glow ring-2 ring-brand-primary/20"
            title="Novo lançamento"
            id="global-add-fab-btn"
          >
            <Plus size={28} strokeWidth={3} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* FAB (Floating Action Button): Visible only on FUEL screen */}
      <AnimatePresence>
        {activeScreen === 'fuel' && (
          <motion.button
            key="add-fuel-fab-button"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setFuelError(null);
              setIsFuelFormOpen(true);
            }}
            className="absolute bottom-20 md:bottom-8 right-6 w-14 h-14 bg-brand-primary text-black rounded-full flex items-center justify-center shadow-2xl hover:brightness-110 z-30 cursor-pointer gold-glow ring-2 ring-brand-primary/20"
            title="Novo abastecimento"
            id="global-add-fuel-fab-btn"
          >
            <Plus size={28} strokeWidth={3} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Stateful Transaction Input & Editor Modal Form */}
      <TransactionForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingTransaction(null);
        }}
        onSave={handleSaveTransaction}
        initialTransaction={editingTransaction}
      />

      {/* Spotify Playlist Auditor Modal */}
      <SpotifyModal
        isOpen={isSpotifyModalOpen}
        onClose={() => setIsSpotifyModalOpen(false)}
      />

      {/* THE LIST PASSWORD MODAL */}
      <AnimatePresence>
        {isTheListPasswordModalOpen && (
          <div 
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" 
            id="the-list-password-modal-overlay"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm bg-bg-surface-low border border-outline-variant/60 rounded-3xl p-6 space-y-4 shadow-xl text-left"
              id="the-list-password-modal-content"
            >
              <div className="flex items-center gap-2 border-b border-outline-variant/10 pb-3">
                <BookLock className="text-brand-primary" size={18} />
                <h3 className="text-xs font-black text-white uppercase tracking-wider font-display">
                  Área Restrita
                </h3>
              </div>

              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (theListPasswordInput === 'Katet19xixmcmxcix!') {
                    setActiveScreen('thelist');
                    setActiveModule('tools');
                    setTheListPasswordInput('');
                    setIsTheListPasswordModalOpen(false);
                    triggerToast('Acesso concedido!');
                  } else {
                    triggerToast('Senha incorreta!');
                  }
                }}
                className="space-y-4"
                id="form-the-list-password"
              >
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-text-muted font-display block">
                    Senha:
                  </label>
                  <input
                    type="password"
                    placeholder="Digite a senha de acesso..."
                    value={theListPasswordInput}
                    onChange={(e) => setTheListPasswordInput(e.target.value)}
                    className="w-full bg-bg-surface-med border border-outline-variant/30 hover:border-outline-variant/50 focus:border-brand-primary focus:outline-none rounded-xl p-3 text-xs text-white placeholder:text-text-muted transition-all font-sans"
                    autoFocus
                    id="input-the-list-password"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setIsTheListPasswordModalOpen(false);
                      setTheListPasswordInput('');
                    }}
                    className="bg-bg-surface-med hover:bg-bg-surface-high border border-outline-variant/20 text-text-muted hover:text-white px-4 py-2.5 rounded-xl text-[10px] font-black tracking-wider uppercase font-display transition-all cursor-pointer"
                    id="btn-cancel-the-list-password"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="bg-brand-primary text-black hover:brightness-110 px-4 py-2.5 rounded-xl text-[10px] font-black tracking-wider uppercase font-display transition-all gold-glow cursor-pointer"
                    id="btn-submit-the-list-password"
                  >
                    Entrar
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal para Novo Período de Despesas */}
      <AnimatePresence>
        {isPeriodModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" id="period-modal-overlay">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm bg-bg-surface-low border border-outline-variant/60 rounded-2xl p-6 space-y-4 shadow-xl text-left"
              id="period-modal-content"
            >
              <div className="flex items-center gap-2 border-b border-outline-variant/30 pb-3">
                <Calendar className="text-brand-primary" size={18} />
                <h3 className="font-display font-black text-sm tracking-tight text-white uppercase">
                  Iniciar Novo Período
                </h3>
              </div>

              <p className="text-[11px] text-text-muted leading-relaxed">
                Esta ação irá <strong className="text-white font-semibold">apagar definitivamente todos os lançamentos</strong> de despesa/receita anteriores e reconfigurar o saldo das contas para o total definido para o novo período.
              </p>

              <div className="space-y-4 py-2">
                <div className="space-y-1.5">
                  <label className="block text-[10px] uppercase tracking-wider text-text-muted font-bold">
                    Saldo Total do Período (R$)
                  </label>
                  <input
                    type="number"
                    value={modalPeriodTotal}
                    onChange={(e) => setModalPeriodTotal(e.target.value)}
                    className="w-full bg-bg-base border border-outline-variant rounded-xl px-3.5 py-2.5 text-xs text-text-high font-mono tracking-tight focus:outline-none focus:border-brand-primary transition-all"
                    placeholder="Ex: 5000.00"
                    min="1"
                    step="0.01"
                    id="period-total-input"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="block text-[10px] uppercase tracking-wider text-text-muted font-bold">
                      Data de Início
                    </label>
                    <input
                      type="date"
                      value={modalPeriodStart}
                      onChange={(e) => setModalPeriodStart(e.target.value)}
                      className="w-full bg-bg-base border border-outline-variant rounded-xl px-3 py-2 text-xs text-text-high focus:outline-none focus:border-brand-primary transition-all"
                      id="period-start-input"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[10px] uppercase tracking-wider text-text-muted font-bold">
                      Data de Término
                    </label>
                    <input
                      type="date"
                      value={modalPeriodEnd}
                      onChange={(e) => setModalPeriodEnd(e.target.value)}
                      className="w-full bg-bg-base border border-outline-variant rounded-xl px-3 py-2 text-xs text-text-high focus:outline-none focus:border-brand-primary transition-all"
                      id="period-end-input"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPeriodModalOpen(false)}
                  className="flex-1 border border-outline-variant/60 hover:bg-white/5 text-text-muted font-bold uppercase text-[10px] tracking-wider py-2.5 rounded-xl transition-all cursor-pointer"
                  id="period-cancel-btn"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const totalVal = parseFloat(modalPeriodTotal);
                    if (isNaN(totalVal) || totalVal <= 0) {
                      alert('Por favor, defina um saldo total válido maior que zero.');
                      return;
                    }
                    if (!modalPeriodStart || !modalPeriodEnd) {
                      alert('Por favor, selecione as datas de início e término.');
                      return;
                    }
                    if (new Date(modalPeriodEnd) < new Date(modalPeriodStart)) {
                      alert('A data de término não pode ser anterior à data de início.');
                      return;
                    }
                    
                    // Proceed to set and launch
                    handleConfirmNewPeriod(modalPeriodStart, modalPeriodEnd, totalVal);
                    setIsPeriodModalOpen(false);
                  }}
                  className="flex-1 bg-brand-primary hover:bg-brand-primary/80 text-black font-extrabold uppercase text-[10px] tracking-wider py-2.5 rounded-xl transition-all cursor-pointer"
                  id="period-confirm-btn"
                >
                  Confirmar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Cadastrar Nova Conta */}
      <AnimatePresence>
        {isNewAccountModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm shadow-2xl" id="new-account-modal-overlay">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm bg-bg-surface-low border border-outline-variant/60 rounded-2xl p-6 space-y-4 shadow-xl text-left"
              id="new-account-modal-content"
            >
              <div className="flex items-center gap-2 border-b border-outline-variant/30 pb-3">
                <Landmark className="text-[#ffe08b]" size={18} />
                <h3 className="font-display font-black text-sm tracking-tight text-white uppercase">
                  Cadastrar Nova Conta
                </h3>
              </div>

              <form onSubmit={handleCreateAccount} className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-[11px] text-text-muted">Nome da Conta</label>
                  <input
                    type="text"
                    value={newAccountName}
                    onChange={(e) => setNewAccountName(e.target.value)}
                    placeholder="Ex: Inter, Itaú, XP"
                    className="w-full bg-bg-base border border-outline-variant rounded-xl px-3.5 py-2.5 text-xs text-text-high font-medium focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/25 transition-all"
                    id="modal-new-account-name-input"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] text-text-muted">Saldo Inicial (R$)</label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={newAccountBalance}
                    onChange={(e) => {
                      const val = e.target.value;
                      const digits = val.replace(/\D/g, '');
                      if (!digits) {
                        setNewAccountBalance('');
                        return;
                      }
                      if (digits.length < 3) {
                        const parsedNum = parseInt(digits, 10);
                        setNewAccountBalance(isNaN(parsedNum) ? '' : String(parsedNum));
                      } else {
                        const cents = digits.slice(-2);
                        const whole = digits.slice(0, -2);
                        const parsedWhole = parseInt(whole, 10);
                        const formattedWhole = isNaN(parsedWhole) ? '0' : String(parsedWhole);
                        setNewAccountBalance(`${formattedWhole},${cents}`);
                      }
                    }}
                    placeholder="0,00"
                    className="w-full bg-bg-base border border-outline-variant rounded-xl px-3.5 py-2.5 text-xs text-text-high font-mono tracking-tight focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/25 transition-all"
                    id="modal-new-account-balance-input"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-[11px] text-text-muted uppercase tracking-wider font-semibold">Cor do Ícone</label>
                  <div className="flex items-center gap-2.5 py-1">
                    {ACCOUNT_COLORS.map(c => (
                      <button
                        key={c.value}
                        type="button"
                        onClick={() => setNewAccountColor(c.value)}
                        className={`w-7 h-7 rounded-full flex items-center justify-center transition-all border border-outline-variant/30 ${
                          newAccountColor === c.value
                            ? 'ring-2 ring-brand-primary/50 bg-zinc-900 border-zinc-700 scale-110'
                            : 'bg-zinc-950 hover:bg-zinc-900 hover:scale-105'
                        }`}
                        title={c.label}
                        id={`btn-color-select-new-${c.value}`}
                      >
                        <span className={`w-3 h-3 rounded-full ${getAccountColorClasses(c.value)}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsNewAccountModalOpen(false);
                      setNewAccountName('');
                      setNewAccountBalance('');
                    }}
                    className="bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-text-high font-extrabold uppercase text-[10px] tracking-wider py-3 rounded-xl transition-all cursor-pointer text-center"
                    id="btn-cancel-new-account"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="bg-brand-primary hover:bg-brand-primary/80 text-black font-extrabold uppercase text-[10px] tracking-wider py-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 font-display"
                    id="btn-confirm-new-account"
                  >
                    Criar Conta
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Cadastrar Nova Categoria Temporária */}
      <AnimatePresence>
        {isNewTempCategoryModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm shadow-2xl" id="new-temp-modal-overlay">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm bg-bg-surface-low border border-outline-variant/60 rounded-2xl p-6 space-y-4 shadow-xl text-left"
              id="new-temp-modal-content"
            >
              <div className="flex items-center gap-2 border-b border-outline-variant/30 pb-3">
                <Clock className="text-[#ffe08b]" size={18} />
                <h3 className="font-display font-black text-sm tracking-tight text-white uppercase">
                  Nova Categoria Temporária
                </h3>
              </div>

              <form onSubmit={(e) => {
                e.preventDefault();
                if (!newTempCategoryName.trim()) {
                  triggerToast('Por favor, digite um nome para a categoria.');
                  return;
                }
                handleCreateTempCategory(newTempCategoryName);
                setIsNewTempCategoryModalOpen(false);
                setNewTempCategoryName('');
              }} className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-[11px] text-text-muted font-semibold uppercase tracking-wider">Nome da Categoria</label>
                  <input
                    type="text"
                    value={newTempCategoryName}
                    onChange={(e) => setNewTempCategoryName(e.target.value)}
                    placeholder="Ex: Viagem Paraty, Compras de Natal"
                    className="w-full bg-bg-base border border-outline-variant rounded-xl px-3.5 py-2.5 text-xs text-text-high font-medium focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/25 transition-all"
                    id="modal-new-temp-category-name-input"
                    required
                    autoFocus
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsNewTempCategoryModalOpen(false);
                      setNewTempCategoryName('');
                    }}
                    className="bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-text-high font-extrabold uppercase text-[10px] tracking-wider py-3 rounded-xl transition-all cursor-pointer text-center"
                    id="btn-cancel-new-temp-category"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="bg-brand-primary hover:bg-brand-primary/80 text-black font-extrabold uppercase text-[10px] tracking-wider py-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 font-display"
                    id="btn-confirm-new-temp-category"
                  >
                    Criar Categoria
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Editar Conta */}
      <AnimatePresence>
        {isEditAccountModalOpen && editingAccount && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm shadow-2xl" id="edit-account-modal-overlay">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm bg-bg-surface-low border border-outline-variant/60 rounded-2xl p-6 space-y-4 shadow-xl text-left"
              id="edit-account-modal-content"
            >
              <div className="flex items-center gap-2 border-b border-outline-variant/30 pb-3">
                <Edit3 className="text-[#ffe08b]" size={18} />
                <h3 className="font-display font-black text-sm tracking-tight text-white uppercase">
                  Editar Conta
                </h3>
              </div>

              <form onSubmit={handleEditAccountSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-[11px] text-text-muted">Nome da Conta</label>
                  <input
                    type="text"
                    value={editAccountName}
                    onChange={(e) => setEditAccountName(e.target.value)}
                    placeholder="Ex: Inter, Itaú, XP"
                    className="w-full bg-bg-base border border-outline-variant rounded-xl px-3.5 py-2.5 text-xs text-text-high font-medium focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/25 transition-all"
                    id="modal-edit-account-name-input"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] text-text-muted">Saldo Atual (R$)</label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={editAccountBalance}
                    onChange={(e) => {
                      const val = e.target.value;
                      const digits = val.replace(/\D/g, '');
                      if (!digits) {
                        setEditAccountBalance('');
                        return;
                      }
                      if (digits.length < 3) {
                        const parsedNum = parseInt(digits, 10);
                        setEditAccountBalance(isNaN(parsedNum) ? '' : String(parsedNum));
                      } else {
                        const cents = digits.slice(-2);
                        const whole = digits.slice(0, -2);
                        const parsedWhole = parseInt(whole, 10);
                        const formattedWhole = isNaN(parsedWhole) ? '0' : String(parsedWhole);
                        setEditAccountBalance(`${formattedWhole},${cents}`);
                      }
                    }}
                    placeholder="0,00"
                    className="w-full bg-bg-base border border-outline-variant rounded-xl px-3.5 py-2.5 text-xs text-text-high font-mono tracking-tight focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/25 transition-all"
                    id="modal-edit-account-balance-input"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-[11px] text-text-muted uppercase tracking-wider font-semibold">Cor do Ícone</label>
                  <div className="flex items-center gap-2.5 py-1">
                    {ACCOUNT_COLORS.map(c => (
                      <button
                        key={c.value}
                        type="button"
                        onClick={() => setEditAccountColor(c.value)}
                        className={`w-7 h-7 rounded-full flex items-center justify-center transition-all border border-outline-variant/30 ${
                          editAccountColor === c.value
                            ? 'ring-2 ring-brand-primary/50 bg-zinc-900 border-zinc-700 scale-110'
                            : 'bg-zinc-950 hover:bg-zinc-900 hover:scale-105'
                        }`}
                        title={c.label}
                        id={`btn-color-select-edit-${c.value}`}
                      >
                        <span className={`w-3 h-3 rounded-full ${getAccountColorClasses(c.value)}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditAccountModalOpen(false);
                      setEditingAccount(null);
                    }}
                    className="bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-text-high font-extrabold uppercase text-[10px] tracking-wider py-3 rounded-xl transition-all cursor-pointer text-center"
                    id="btn-cancel-edit-account"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="bg-brand-primary hover:bg-brand-primary/80 text-black font-extrabold uppercase text-[10px] tracking-wider py-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 font-display"
                    id="btn-confirm-edit-account"
                  >
                    Salvar Alterações
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Confirmação de Exclusão de Conta */}
      <AnimatePresence>
        {accountToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm shadow-2xl" id="delete-account-modal-overlay">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm bg-bg-surface-low border border-outline-variant/60 rounded-2xl p-6 space-y-4 shadow-xl text-left"
              id="delete-account-modal-content"
            >
              <div className="flex items-center gap-2 border-b border-outline-variant/30 pb-3 text-red-400">
                <Trash2 size={18} />
                <h3 className="font-display font-black text-sm tracking-tight uppercase">
                  Excluir Conta
                </h3>
              </div>

              <div className="space-y-2 text-xs">
                <p className="text-text-high leading-relaxed">
                  Tem certeza que deseja remover a conta <strong className="text-[#ffe08b]">"{accountToDelete.name}"</strong>?
                </p>
                <p className="text-red-400/90 leading-relaxed font-mono text-[10px]">
                  * Esta ação irá reajustar o seu ativo consolidado. Os lançamentos vinculados a esta conta não serão removidos, mas a conta em si deixará de existir no sistema.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setAccountToDelete(null)}
                  className="bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-text-high font-extrabold uppercase text-[10px] tracking-wider py-3 rounded-xl transition-all cursor-pointer text-center"
                  id="btn-cancel-delete"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleDeleteAccount(accountToDelete.id, accountToDelete.name);
                    setAccountToDelete(null);
                  }}
                  className="bg-red-500 hover:bg-red-600 text-white font-extrabold uppercase text-[10px] tracking-wider py-3 rounded-xl transition-all cursor-pointer text-center"
                  id="btn-confirm-delete"
                >
                  Excluir
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Ajuste Rápido de Saldo */}
      <AnimatePresence>
        {isAdjustBalanceModalOpen && selectedAdjustingAccount && adjustingType && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm shadow-2xl" id="adjust-balance-modal-overlay">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm bg-bg-surface-low border border-outline-variant/60 rounded-2xl p-6 space-y-4 shadow-xl text-left"
              id="adjust-balance-modal-content"
            >
              <div className="flex items-center gap-2 border-b border-outline-variant/30 pb-3">
                {adjustingType === 'somar' ? (
                  <ArrowUpRight className="text-emerald-400" size={18} />
                ) : (
                  <ArrowDownLeft className="text-red-400" size={18} />
                )}
                <h3 className="font-display font-black text-sm tracking-tight text-white uppercase">
                  {adjustingType === 'somar' ? 'Somar ao Saldo' : 'Subtrair do Saldo'}
                </h3>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-text-muted uppercase tracking-wider block font-semibold font-mono">Conta Selecionada</span>
                <span className="text-xs font-bold text-white uppercase tracking-wide">{selectedAdjustingAccount.name}</span>
                <p className="text-xs text-text-muted">
                  Saldo atual: <span className="font-mono text-white font-semibold">R$ {selectedAdjustingAccount.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </p>
              </div>

              <form onSubmit={handleAdjustBalanceSubmit} className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <label className="block text-[11px] text-text-muted">
                    Valor a {adjustingType === 'somar' ? 'somar' : 'subtrair'} (R$)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted font-bold text-xs">R$</span>
                    <input
                      type="text"
                      inputMode="decimal"
                      placeholder="0,00"
                      value={adjustmentAmount}
                      onChange={(e) => {
                        const val = e.target.value;
                        const digits = val.replace(/\D/g, '');
                        if (!digits) {
                          setAdjustmentAmount('');
                          return;
                        }
                        if (digits.length < 3) {
                          const parsedNum = parseInt(digits, 10);
                          setAdjustmentAmount(isNaN(parsedNum) ? '' : String(parsedNum));
                        } else {
                          const cents = digits.slice(-2);
                          const whole = digits.slice(0, -2);
                          const parsedWhole = parseInt(whole, 10);
                          const formattedWhole = isNaN(parsedWhole) ? '0' : String(parsedWhole);
                          setAdjustmentAmount(`${formattedWhole},${cents}`);
                        }
                      }}
                      className="w-full bg-bg-base border border-outline-variant rounded-xl pl-8 pr-3 py-2.5 font-mono text-white text-xs focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary/25 transition-all placeholder:text-text-muted/40"
                      id="modal-adjust-amount-input"
                      autoFocus
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAdjustBalanceModalOpen(false);
                      setSelectedAdjustingAccount(null);
                      setAdjustingType(null);
                      setAdjustmentAmount('');
                    }}
                    className="bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-text-high font-extrabold uppercase text-[10px] tracking-wider py-3 rounded-xl transition-all cursor-pointer text-center"
                    id="btn-cancel-adjust"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className={`font-extrabold uppercase text-[10px] tracking-wider py-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${adjustingType === 'somar' ? 'bg-emerald-500 hover:bg-emerald-400 text-black' : 'bg-red-500 hover:bg-red-400 text-white'}`}
                    id="btn-confirm-adjust"
                  >
                    {adjustingType === 'somar' ? 'Somar' : 'Subtrair'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Histórico de Modificações da Conta */}
      <AccountHistoryModal
        isOpen={isAccountHistoryModalOpen}
        onClose={() => {
          setIsAccountHistoryModalOpen(false);
          setSelectedHistoryAccount(null);
        }}
        account={selectedHistoryAccount}
        historyEntries={accountHistory}
      />

      {/* Modal de Análise de Saldo e Projeções */}
      <AnimatePresence>
        {isAnalysisModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md" id="analysis-modal-overlay">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg bg-bg-surface-low border border-outline-variant/60 rounded-2xl p-6 flex flex-col max-h-[85vh] shadow-2xl relative text-left"
              id="analysis-modal-content"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-outline-variant/30 pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                    <TrendingUp className="text-amber-500" size={16} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h3 className="font-display font-black text-xs tracking-wider text-white uppercase">
                      Análise de Saldo Geral
                    </h3>
                    <p className="text-[9px] uppercase tracking-widest text-text-muted font-bold font-mono">
                      Controle Diário Integrado
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAnalysisModalOpen(false)}
                  className="text-text-muted hover:text-white transition-colors cursor-pointer p-1 text-xs"
                >
                  ✕
                </button>
              </div>

              {!periodActive ? (
                <div className="flex-1 flex flex-col items-center justify-center py-12 text-center space-y-3">
                  <span className="text-4xl">📊</span>
                  <h4 className="text-sm font-bold text-white">Nenhum período ativo</h4>
                  <p className="text-xs text-text-muted max-w-[280px]">
                    Inicie um período de orçamento primeiro para acompanhar a evolução diária e projeções.
                  </p>
                </div>
              ) : (
                <>
                  {/* Projections Key Card - The Most Important Metric */}
                  <div className="bg-black/40 rounded-xl border border-outline-variant/30 p-4 mb-4" id="analysis-projection-card">
                    <div className="flex items-baseline justify-between mb-3">
                      <span className="text-[10px] uppercase tracking-wider text-text-muted font-bold">Balanço Projetado:</span>
                      <span className={`text-xl font-black font-display tracking-tight ${analysisData.projectedBalance >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        R$ {analysisData.projectedBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>

                    {/* Breakdown micro metrics */}
                    <div className="grid grid-cols-2 gap-2 pt-2.5 border-t border-white/5 font-mono text-[9px] text-text-muted">
                      <div>
                        Média Diária:{' '}
                        <strong className="text-white font-bold">R$ {analysisData.averageDailyExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                      </div>
                      <div className="text-right">
                        Total de Gastos:{' '}
                        <strong className="text-white font-bold">R$ {analysisData.totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Gráfico de barras simples com Recharts */}
                  <div className="bg-black/40 rounded-xl border border-outline-variant/30 p-3 mb-4" id="analysis-chart-card">
                    <span className="block text-[9px] uppercase tracking-widest text-[#ffe08b] font-bold mb-3 font-mono">
                      Evolução do Limite Atribuído (R$)
                    </span>
                    <div className="w-full h-32">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                          <XAxis 
                            dataKey="name" 
                            stroke="#71717a" 
                            fontSize={9} 
                            tickLine={false} 
                            axisLine={false} 
                            tickMargin={6}
                          />
                          <YAxis 
                            stroke="#71717a" 
                            fontSize={9} 
                            tickLine={false} 
                            axisLine={false} 
                            tickFormatter={(val) => `${val}`}
                            tickMargin={6}
                          />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: '#111318', 
                              borderColor: '#2d3139', 
                              borderRadius: '8px',
                              fontSize: '10px',
                              color: '#ffffff'
                            }} 
                            labelClassName="text-text-muted"
                            formatter={(value: any) => [`R$ ${value}`, 'Limite']}
                          />
                          <Bar dataKey="Limite Atribuído" fill="#ffe08b" radius={[4, 4, 0, 0]} barSize={16} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Daily list header */}
                  <h4 className="text-[10px] uppercase tracking-widest text-[#ffe08b] font-bold mb-2">
                    Evolução Diária do Período
                  </h4>

                  {/* Scrollable list content */}
                  <div className="flex-1 overflow-y-auto pr-1 py-1 space-y-2 custom-scrollbar max-h-[30vh]">
                    {analysisData.daysList.length === 0 ? (
                      <div className="text-center py-6 text-text-muted text-xs">Nenhum dia decorrido no período atual.</div>
                    ) : (
                      analysisData.daysList.map((day) => {
                        const isPositive = day.dailyNetBalance >= 0;
                        return (
                          <div 
                            key={day.dayNumber} 
                            className="bg-bg-surface-low border border-outline-variant/30 hover:border-outline-variant/60 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 transition-all"
                          >
                            <div>
                              <div className="flex items-center gap-1.5 mb-1.5">
                                <span className="text-[9px] font-bold uppercase tracking-wider text-brand-primary font-mono bg-brand-primary/10 border border-brand-primary/25 rounded px-1.5 py-0.5">
                                  Dia {day.dayNumber}
                                </span>
                                <span className="text-[10px] text-text-muted font-mono">{day.dateFormatted}</span>
                              </div>
                              <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-text-muted font-mono">
                                <div>
                                  Lim. Atribuído:{' '}
                                  <strong className="text-white font-semibold">R$ {day.dailySaldoAtStart.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                                </div>
                                <div>
                                  Despesas Reais:{' '}
                                  <strong className="text-white font-semibold">R$ {day.dayExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                                </div>
                              </div>
                            </div>

                            <div className="text-right flex sm:flex-col items-center justify-between sm:justify-center gap-1 border-t sm:border-t-0 border-white/5 pt-1.5 sm:pt-0">
                              <span className="text-[9px] uppercase tracking-widest text-text-muted font-bold font-mono sm:hidden">
                                Balanço:
                              </span>
                              <span className={`font-mono font-black tracking-tight text-xs ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                                {isPositive ? '+' : ''} R$ {day.dailyNetBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </>
              )}

              {/* Footer close */}
              <div className="border-t border-outline-variant/30 pt-4 mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsAnalysisModalOpen(false)}
                  className="bg-brand-primary hover:bg-brand-primary/80 border border-brand-primary text-black font-extrabold uppercase text-[10px] tracking-wider px-6 py-2 rounded-xl transition-all cursor-pointer"
                  id="analysis-close-btn"
                >
                  FECHAR
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal de Histórico de Evolução de Patrimônio */}
      <AnimatePresence>
        {isPatrimonyModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md" id="patrimony-modal-overlay">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg bg-bg-surface-low border border-outline-variant/60 rounded-2xl p-6 flex flex-col max-h-[85vh] shadow-2xl relative text-left"
              id="patrimony-modal-content"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-outline-variant/30 pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#ffe08b]/10 flex items-center justify-center border border-[#ffe08b]/20">
                    <History className="text-[#ffe08b]" size={16} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h3 className="font-display font-black text-xs tracking-wider text-white uppercase">
                      Evolução de Patrimônio
                    </h3>
                    <p className="text-[9px] uppercase tracking-widest text-[#ffe08b] font-bold font-mono">
                      Controle Histórico Consolidado
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsPatrimonyModalOpen(false);
                    setNewPatrimonyMonthYear('');
                    setNewPatrimonyAmount('');
                  }}
                  className="text-text-muted hover:text-white transition-colors cursor-pointer p-1 text-xs"
                >
                  ✕
                </button>
              </div>

              {/* Gráfico de linha da evolução do patrimônio */}
              <div className="bg-black/40 rounded-xl border border-outline-variant/30 p-3 mb-4" id="patrimony-chart-card">
                <span className="block text-[9px] uppercase tracking-widest text-brand-primary font-bold mb-3 font-mono">
                  Evolução do Patrimônio Acumulado (R$)
                </span>
                <div className="w-full h-36">
                  {patrimonyHistory.length < 2 ? (
                    <div className="w-full h-full flex items-center justify-center text-[10px] text-text-muted font-mono bg-white/5 rounded-lg border border-outline-variant/10 text-center px-4">
                      Adicione pelo menos 2 pontos de dados para exibir a linha de evolução histórica.
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart 
                        data={[...patrimonyHistory]
                          .sort((a, b) => {
                            const [mA, yA] = a.monthYear.split('/').map(n => parseInt(n, 10));
                            const [mB, yB] = b.monthYear.split('/').map(n => parseInt(n, 10));
                            const dateA = new Date(yA < 100 ? 2000 + yA : yA, mA - 1, 1);
                            const dateB = new Date(yB < 100 ? 2000 + yB : yB, mB - 1, 1);
                            return dateA.getTime() - dateB.getTime();
                          })} 
                        margin={{ top: 10, right: 15, left: -20, bottom: 5 }}
                      >
                        <XAxis 
                          dataKey="monthYear" 
                          stroke="#71717a" 
                          fontSize={9} 
                          tickLine={false} 
                          axisLine={false} 
                          tickMargin={6}
                        />
                        <YAxis 
                          stroke="#71717a" 
                          fontSize={9} 
                          tickLine={false} 
                          axisLine={false} 
                          tickFormatter={(val) => `R$ ${val >= 1000 ? (val/1000) + 'k' : val}`}
                          tickMargin={6}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#111318', 
                            borderColor: '#2d3139', 
                            borderRadius: '8px',
                            fontSize: '10px',
                            color: '#ffffff'
                          }} 
                          labelClassName="text-text-muted font-bold"
                          formatter={(value: any) => [`R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 'Patrimônio']}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="amount" 
                          stroke="#ffe08b" 
                          strokeWidth={2.5}
                          activeDot={{ r: 6 }}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              {/* Botão/Formulário para Inserir Novo Registro */}
              <div className="space-y-3 mb-4">
                <button
                  type="button"
                  onClick={() => setShowAddPatrimonyForm(prev => !prev)}
                  className="w-full bg-white/5 hover:bg-white/10 text-text-high font-bold uppercase text-[9px] tracking-wider py-2.5 rounded-xl border border-outline-variant/30 hover:border-outline-variant/60 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  id="btn-toggle-add-patrimony-form"
                >
                  <Plus size={12} />
                  {showAddPatrimonyForm ? 'Ocultar Lançador de Registro' : 'Inserir Novo Registro Histórico'}
                </button>

                {showAddPatrimonyForm && (
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!newPatrimonyMonthYear || !newPatrimonyAmount) {
                        triggerToast('Preencha os campos de mês/ano e valor.');
                        return;
                      }

                      const dateRegex = /^(0?[1-9]|1[0-2])\/\d{2,4}$/;
                      if (!dateRegex.test(newPatrimonyMonthYear)) {
                        triggerToast('Período inválido. Use o formato Mês/Ano (MM/AAAA, ex: 06/2026).');
                        return;
                      }

                      const cleanedVal = newPatrimonyAmount.replace(/\s/g, '').replace('R$', '').replace(/\./g, '').replace(',', '.');
                      const numericAmount = parseFloat(cleanedVal);
                      if (isNaN(numericAmount) || numericAmount < 0) {
                        triggerToast('Insira um valor patrimonial válido maior ou igual a zero.');
                        return;
                      }

                      // Create and add
                      const newEntry: PatrimonyEntry = {
                        id: `pe-${Date.now()}`,
                        monthYear: newPatrimonyMonthYear,
                        amount: numericAmount
                      };

                      setPatrimonyHistory(prev => {
                        const filtered = prev.filter(p => p.monthYear !== newPatrimonyMonthYear);
                        return [...filtered, newEntry];
                      });

                      setNewPatrimonyMonthYear('');
                      setNewPatrimonyAmount('');
                      setShowAddPatrimonyForm(false);
                      triggerToast('Registro patrimonial adicionado!');
                    }}
                    className="bg-black/25 border border-outline-variant/45 rounded-xl p-3.5 space-y-3"
                    id="add-patrimony-history-form"
                  >
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="block text-[9px] uppercase tracking-widest text-[#ffe08b] font-bold font-mono">Mês/Ano</label>
                        <input
                          type="text"
                          required
                          placeholder="MM/AAAA"
                          value={newPatrimonyMonthYear}
                          onChange={(e) => {
                            const value = e.target.value;
                            const digits = value.replace(/\D/g, '');
                            let formatted = value;
                            if (digits.length === 2) {
                              if (value.length === 2) {
                                formatted = digits + '/';
                              } else {
                                formatted = digits;
                              }
                            } else if (digits.length > 2) {
                              formatted = digits.slice(0, 2) + '/' + digits.slice(2, 6);
                            } else {
                              formatted = digits;
                            }
                            setNewPatrimonyMonthYear(formatted.slice(0, 7));
                          }}
                          className="w-full bg-black/40 border border-outline-variant/30 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-text-muted/50 focus:border-brand-primary outline-none font-mono"
                          id="inp-patrimony-monthyear"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[9px] uppercase tracking-widest text-[#ffe08b] font-bold font-mono">Valor Total (R$)</label>
                        <input
                          type="text"
                          inputMode="decimal"
                          required
                          placeholder="0,00"
                          value={newPatrimonyAmount}
                          onChange={(e) => {
                            const val = e.target.value;
                            const digits = val.replace(/\D/g, '');
                            if (!digits) {
                              setNewPatrimonyAmount('');
                              return;
                            }
                            if (digits.length < 3) {
                              const parsedNum = parseInt(digits, 10);
                              setNewPatrimonyAmount(isNaN(parsedNum) ? '' : String(parsedNum));
                            } else {
                              const cents = digits.slice(-2);
                              const whole = digits.slice(0, -2);
                              const parsedWhole = parseInt(whole, 10);
                              const formattedWhole = isNaN(parsedWhole) ? '0' : String(parsedWhole);
                              setNewPatrimonyAmount(`${formattedWhole},${cents}`);
                            }
                          }}
                          className="w-full bg-black/40 border border-outline-variant/30 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-text-muted/50 focus:border-brand-primary outline-none font-mono"
                          id="inp-patrimony-amount"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-brand-primary hover:bg-brand-primary/80 text-black font-extrabold uppercase text-[9px] tracking-widest py-2.5 rounded-lg transition-all cursor-pointer"
                      id="btn-submit-patrimony"
                    >
                      SALVAR
                    </button>
                  </form>
                )}
              </div>

              {/* Título de lista */}
              <h4 className="text-[10px] uppercase tracking-widest text-[#ffe08b] font-bold mb-2 font-mono flex items-center justify-between">
                <span>HISTÓRICO DE PATRIMÔNIO</span>
                <span className="text-[8px] text-text-muted uppercase tracking-normal">Total: {patrimonyHistory.length}</span>
              </h4>

              {/* Lista em ordem decrescente de data */}
              <div className="flex-1 overflow-y-auto pr-1 py-1 space-y-2 custom-scrollbar max-h-[25vh]">
                {patrimonyHistory.length === 0 ? (
                  <div className="text-center py-8 text-text-muted text-xs">Nenhum registro de patrimônio lançado.</div>
                ) : (
                  [...patrimonyHistory]
                    .sort((a, b) => {
                      const [mA, yA] = a.monthYear.split('/').map(n => parseInt(n, 10));
                      const [mB, yB] = b.monthYear.split('/').map(n => parseInt(n, 10));
                      const dateA = new Date(yA < 100 ? 2000 + yA : yA, mA - 1, 1);
                      const dateB = new Date(yB < 100 ? 2000 + yB : yB, mB - 1, 1);
                      return dateB.getTime() - dateA.getTime(); // Descending!
                    })
                    .map((item) => (
                      <div 
                        key={item.id} 
                        className="bg-bg-surface-low border border-outline-variant/30 hover:border-outline-variant/60 rounded-xl p-3 flex items-center justify-between transition-all"
                        id={`patrimony-item-${item.id}`}
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#ffe08b]" />
                          <span className="text-xs font-bold text-white font-mono">{item.monthYear}</span>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="font-mono font-black text-xs text-white">
                            R$ {item.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setPatrimonyHistory(prev => prev.filter(p => p.id !== item.id));
                              triggerToast('Registro de patrimônio removido!');
                            }}
                            className="text-text-muted hover:text-red-400 p-1 rounded hover:bg-white/5 transition-all cursor-pointer"
                            title="Remover ponto de controle"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ))
                )}
              </div>

              {/* Footer close option */}
              <div className="border-t border-outline-variant/30 pt-4 mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setIsPatrimonyModalOpen(false);
                    setNewPatrimonyMonthYear('');
                    setNewPatrimonyAmount('');
                  }}
                  className="bg-brand-primary hover:bg-brand-primary/80 border border-brand-primary text-black font-extrabold uppercase text-[10px] tracking-wider px-6 py-2 rounded-xl transition-all cursor-pointer"
                  id="patrimony-close-btn"
                >
                  OK
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Editar Versões */}
      <AnimatePresence>
        {isEditVersionsModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm shadow-2xl" id="edit-versions-modal-overlay">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm bg-bg-surface-low border border-outline-variant/60 rounded-2xl p-6 space-y-4 shadow-xl text-left"
              id="edit-versions-modal-content"
            >
              <div className="flex items-center gap-2 border-b border-outline-variant/30 pb-3">
                <SlidersHorizontal className="text-brand-primary" size={18} />
                <h3 className="font-display font-black text-sm tracking-tight text-white uppercase">
                  Alterar Versões
                </h3>
              </div>

              <form onSubmit={handleSaveVersionsSubmit} className="space-y-4 pt-2">
                <div className="space-y-1">
                  <label className="block text-[9px] uppercase tracking-widest text-[#ffe08b] font-bold font-mono">Módulo Finance</label>
                  <input
                    type="text"
                    required
                    value={tempVersionFinance}
                    onChange={(e) => setTempVersionFinance(e.target.value)}
                    className="w-full bg-black/40 border border-outline-variant/30 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-text-muted/50 focus:border-brand-primary outline-none font-mono"
                    id="inp-version-finance"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[9px] uppercase tracking-widest text-[#ffe08b] font-bold font-mono">Módulo Work</label>
                  <input
                    type="text"
                    required
                    value={tempVersionWork}
                    onChange={(e) => setTempVersionWork(e.target.value)}
                    className="w-full bg-black/40 border border-outline-variant/30 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-text-muted/50 focus:border-brand-primary outline-none font-mono"
                    id="inp-version-work"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[9px] uppercase tracking-widest text-[#ffe08b] font-bold font-mono">Módulo Fuel</label>
                  <input
                    type="text"
                    required
                    value={tempVersionFuel}
                    onChange={(e) => setTempVersionFuel(e.target.value)}
                    className="w-full bg-black/40 border border-outline-variant/30 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-text-muted/50 focus:border-brand-primary outline-none font-mono"
                    id="inp-version-fuel"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[9px] uppercase tracking-widest text-[#ffe08b] font-bold font-mono">Módulo Games</label>
                  <input
                    type="text"
                    required
                    value={tempVersionGames}
                    onChange={(e) => setTempVersionGames(e.target.value)}
                    className="w-full bg-black/40 border border-outline-variant/30 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-text-muted/50 focus:border-brand-primary outline-none font-mono"
                    id="inp-version-games"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[9px] uppercase tracking-widest text-[#ffe08b] font-bold font-mono">Módulo Tools</label>
                  <input
                    type="text"
                    required
                    value={tempVersionTools}
                    onChange={(e) => setTempVersionTools(e.target.value)}
                    className="w-full bg-black/40 border border-outline-variant/30 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-text-muted/50 focus:border-brand-primary outline-none font-mono"
                    id="inp-version-tools"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[9px] uppercase tracking-widest text-[#ffe08b] font-bold font-mono">Versão do App</label>
                  <input
                    type="text"
                    required
                    value={tempVersionApp}
                    onChange={(e) => setTempVersionApp(e.target.value)}
                    className="w-full bg-black/40 border border-outline-variant/30 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-text-muted/50 focus:border-brand-primary outline-none font-mono"
                    id="inp-version-app"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-outline-variant/30">
                  <button
                    type="button"
                    onClick={() => setIsEditVersionsModalOpen(false)}
                    className="text-text-muted hover:text-white font-extrabold uppercase text-[9px] tracking-widest py-2 px-4 transition-all cursor-pointer"
                    id="btn-cancel-versions"
                  >
                    CANCELAR
                  </button>
                  <button
                    type="submit"
                    className="bg-brand-primary hover:bg-brand-primary/80 text-black font-extrabold uppercase text-[9px] tracking-widest py-2 px-6 rounded-lg transition-all cursor-pointer"
                    id="btn-save-versions"
                  >
                    SALVAR
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
