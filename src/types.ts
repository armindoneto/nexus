/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Transaction {
  id: string;
  description: string;
  amount: number; // Positive for incoming (depósitos), Negative for outgoing (despesas)
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  account: string; // e.g. "Nubank", "Aeternum", "Itaú Personnalité"
  category: string; // e.g. "Alimentação", "Depósito", "Transporte", "Lazer", "Assinaturas", "Saúde", "Outros"
  status: 'processado' | 'pendente' | 'cancelado';
}

export interface CreditCard {
  id: string;
  brand: string; // e.g. "Aeternum Card", "Nubank Gold"
  holder: string;
  lastFour: string;
  expiry: string;
  limit: number;
  used: number;
  colorTheme: 'gold' | 'purple' | 'slate' | 'emerald';
}

export interface Account {
  id: string;
  name: string;
  balance: number;
  color?: string; // Suffix/value of customizeable dot color
}

export interface AccountHistoryEntry {
  id: string;
  accountId: string;
  type: 'soma' | 'subtracao' | 'edicao' | 'criacao';
  timestamp: string; // ISO string
  dateFormatted: string; // e.g. "01/09/2026 às 10:45"
  description: string;
  previousBalance: number;
  newBalance: number;
  amountChange?: number;
}

export interface TempEntry {
  id: string;
  description: string;
  amount: number; // For simplicity, positive values (or negative as chosen by user)
  date: string;
}

export interface TempCategory {
  id: string;
  name: string;
  entries: TempEntry[];
}

export interface UserProfile {
  name: string;
  avatarUrl: string;
  monthlyIncomeGoal: number;
  customMainAccount: string;
}

export interface PatrimonyEntry {
  id: string;
  monthYear: string; // e.g. "05/2026"
  amount: number;
}

export interface PlanCard {
  id: string;
  name: string;
  excludedMonths?: string[]; // "YYYY-MM" where this card has been removed
  months?: string[]; // "YYYY-MM" months where this card is active
}

export interface PlanEntry {
  id: string;
  name: string;
  amount: number;
  month: string; // "YYYY-MM"
  category: 'gastos' | 'cartoes' | 'contas';
  cardId?: string; // only if category === 'cartoes'
  accountId?: string; // only if category === 'contas'
  subcategory: string; // 'CASA' | 'FIXOS' | 'GERAL' for 'gastos', or 'PARCELAS' | 'FIXOS' | 'GERAL' for 'cartoes', or account name/id for 'contas'
  type?: 'expense' | 'income'; // 'expense' by default, or 'income' for revenue
  isInstallment?: boolean;
  installmentsCount?: number;
  currentInstallment?: number;
  paid?: boolean;
}

export type ActiveTab = 'inicio' | 'transacoes' | 'cartoes' | 'perfil';

export interface PlanScreenProps {
  planEntries: PlanEntry[];
  setPlanEntries: (value: PlanEntry[] | ((prev: PlanEntry[]) => PlanEntry[])) => void;
  planIncomes: { [month: string]: number };
  setPlanIncomes: (value: { [month: string]: number } | ((prev: { [month: string]: number }) => { [month: string]: number })) => void;
  planCards: PlanCard[];
  setPlanCards: (value: PlanCard[] | ((prev: PlanCard[]) => PlanCard[])) => void;
  triggerToast: (msg: string) => void;
  accounts: Account[];
  activePlanMonth?: string;
  setActivePlanMonth?: (value: string | ((prev: string) => string)) => void;
  planMonth?: string;
  setPlanMonth?: (value: string | ((prev: string) => string)) => void;
}

export interface FuelEntry {
  id: string;
  date: string; // DD/MM/AA
  km: number; // Km (float)
  qty: number; // Litros (float)
  value: number; // Valor (float)
}

export interface ContrachequeEntry {
  id: string;
  name: string;
  amount: number;
  month: string; // "YYYY-MM"
  type: 'receita' | 'despesa';
  isAdiantado?: boolean;
  isAtrasado?: boolean;
}

export interface HistoricoEntry {
  id: string;
  category: 'CURSOS' | 'INSTRUÇÃO' | 'MISSÕES';
  name: string;
  location: string;
  startDate: string; // DD/MM/AA
  endDate: string; // DD/MM/AA
  travelDays: number; // DIAS DE DESLOCAMENTO
  isAbsence?: boolean; // Contar como afastamento
}

export interface ME4Exclusion {
  nrOrd: string;
  reason: string;
  timestamp: string;
}

export interface AppNote {
  id: string;
  text: string;
  createdAt: string; // ISO date string or formatted date string
}

export interface EscalaTurno {
  id: string;
  nome: string;
  legenda: string;
  duracao: string; // HH:MM
  categoria: string; // e.g. "Manhã", "Tarde", "Noite", "Serviço", "Outro"
  cor: string; // id of color in SHIFT_COLORS
  hidden?: boolean;
}

export interface EscalaDay {
  dateStr: string; // YYYY-MM-DD
  turnos: string[]; // ids of EscalaTurno assigned (max 2)
}

export interface TheListEntry {
  id: string;
  nome: string;
  periodo: string;
  local: string;
  k: boolean;
  f: boolean;
  d: boolean;
  t: boolean;
  p: boolean;
  s: boolean;
  esquadrao?: string;
  note?: string;
}

export interface GameTrophyEntry {
  id: string;
  jogo: string;
  platina: number;
  ouro: number;
  prata: number;
  bronze: number;
  platforms: ('PS3' | 'PSVita' | 'PS4' | 'PS5')[];
  garapa: boolean;
  hide: boolean;
  dataPlatina?: string; // date YYYY-MM-DD
}

export interface ToPlayGame {
  id: string;
  name: string;
}

export interface ToPlayConsole {
  id: string;
  name: string;
  games: ToPlayGame[];
}

export interface PokemonEntry {
  id: string;
  num: string;
  name: string;
  spriteId?: string;
  hasMale: boolean;
  hasFemale: boolean;
  hasGenderless: boolean;
  isMaleCaught?: boolean;
  isFemaleCaught?: boolean;
  isGenderlessCaught?: boolean;
  isShinyCaught?: boolean;
  isShinyExcluded?: boolean;
  type1?: string;
  type2?: string;
  isLegendary?: boolean;
  isMythical?: boolean;
  isExtraForm?: boolean;
}

export interface PokemonGeneration {
  id: string;
  name: string;
  pokemons: PokemonEntry[];
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface ChecklistCategory {
  id: string;
  name: string;
  items: ChecklistItem[];
}

export interface ChecklistsScreenProps {
  checklists: ChecklistCategory[];
  setChecklists: (value: ChecklistCategory[] | ((prev: ChecklistCategory[]) => ChecklistCategory[])) => void;
  triggerToast: (msg: string) => void;
  theme?: 'dark' | 'light';
}

export interface SystemVersions {
  finance: string;
  work: string;
  fuel: string;
  games: string;
  tools: string;
  app: string;
}

export type PokopiaHabitat = 
  | 'Withered Wastelands'
  | 'Rocky Ridges'
  | 'Bleak Beach'
  | 'Sparkling Skylands'
  | 'Pallet Town'
  | 'Befriended'
  | 'Not Met';

export type PokopiaComfort = 
  | ''
  | 'Awesome'
  | 'Great'
  | 'Nice'
  | 'Average'
  | 'Iffy';

export interface PokopiaEntry {
  id: string;
  name: string;
  habitat: PokopiaHabitat;
  comfort: PokopiaComfort;
  request: string;
  requestCompleted?: boolean;
  createdAt?: string;
}

export interface PokopiaScreenProps {
  pokopiaEntries: PokopiaEntry[];
  setPokopiaEntries: (value: PokopiaEntry[] | ((prev: PokopiaEntry[]) => PokopiaEntry[])) => void;
  triggerToast: (msg: string) => void;
  theme?: 'dark' | 'light';
}
