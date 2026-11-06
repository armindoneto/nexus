/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Transaction, CreditCard, Account, UserProfile } from './types';

export const INITIAL_USER: UserProfile = {
  name: "Armindo Netto",
  avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCLXmWXmniqsM3Oc15oMelwUXhmdIotFyOYbjwLQWsMJ-pQB6p_R4WhpmIWbMvUSoUArCyLjHllyKgSK-sAKYZA_55FsbA_vpdNqxXTqXCt2aOOwavxH6PLAMnLIVEuEnfeJ2eciTjsvg-UIy70Qj6y66Eu2wc6kx6K46eUFfXzwcURny9R0ucSSxVCVZ-ZoQcDrsN3HkXbI19WYnD-V5V7L9RZqfZjejRLsNi-hEOhuIAo05nm3-2SZ7CWx7QrbBkCwhiN3jYr4bhO",
  monthlyIncomeGoal: 15000,
  customMainAccount: "Æternum"
};

export const INITIAL_ACCOUNTS: Account[] = [
  { id: '1', name: 'Æternum', balance: 0.00 },
  { id: '2', name: 'PIX', balance: 0.00 },
  { id: '3', name: 'Nubank', balance: 0.00 },
  { id: '4', name: 'Pai', balance: 0.00 },
  { id: '5', name: 'Mercado Livre', balance: 0.00 },
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 't1',
    description: 'Mercado Livre',
    amount: -250.00,
    date: '2026-10-24',
    time: '14:20',
    account: 'Nubank',
    category: 'Processado',
    status: 'processado'
  },
  {
    id: 't2',
    description: 'Almoço Executivo',
    amount: -45.00,
    date: '2026-10-24',
    time: '12:45',
    account: 'Æternum',
    category: 'Alimentação',
    status: 'processado'
  },
  {
    id: 't3',
    description: 'Transferência Recebida',
    amount: 1200.00,
    date: '2026-10-23',
    time: '10:15',
    account: 'Æternum',
    category: 'Depósito',
    status: 'processado'
  },
  {
    id: 't4',
    description: 'Posto Shell',
    amount: -320.45,
    date: '2026-10-23',
    time: '08:30',
    account: 'Æternum',
    category: 'Transporte',
    status: 'processado'
  },
  {
    id: 't5',
    description: 'Assinatura Spotify',
    amount: -34.90,
    date: '2026-10-22',
    time: '04:12',
    account: 'Nubank',
    category: 'Assinaturas',
    status: 'processado'
  },
  {
    id: 't6',
    description: 'Dividendo Petrobras',
    amount: 450.00,
    date: '2026-10-20',
    time: '09:00',
    account: 'Æternum',
    category: 'Depósito',
    status: 'processado'
  },
  {
    id: 't7',
    description: 'Drogaria São Paulo',
    amount: -89.90,
    date: '2026-10-19',
    time: '18:30',
    account: 'PIX',
    category: 'Saúde',
    status: 'processado'
  }
];

export const INITIAL_CARDS: CreditCard[] = [
  {
    id: 'c1',
    brand: 'Æternum Infinite',
    holder: 'ARMINDO NETTO',
    lastFour: '8840',
    expiry: '12/32',
    limit: 100000.00,
    used: 28450.00,
    colorTheme: 'gold'
  },
  {
    id: 'c2',
    brand: 'Nubank Ultravioleta',
    holder: 'ARMINDO NETTO',
    lastFour: '4091',
    expiry: '09/30',
    limit: 45000.00,
    used: 12480.00,
    colorTheme: 'purple'
  },
  {
    id: 'c3',
    brand: 'Itaú Personnalité Black',
    holder: 'ARMINDO NETTO',
    lastFour: '5562',
    expiry: '05/31',
    limit: 80000.00,
    used: 320.45,
    colorTheme: 'slate'
  }
];

export const CATEGORIES_WITH_ICONS = [
  { name: 'Alimentação', icon: 'restaurant', color: 'text-amber-400 bg-amber-500/10' },
  { name: 'Processado', icon: 'shopping_bag', color: 'text-yellow-400 bg-yellow-500/10' },
  { name: 'Depósito', icon: 'payments', color: 'text-green-400 bg-green-500/10' },
  { name: 'Transporte', icon: 'local_gas_station', color: 'text-blue-400 bg-blue-500/10' },
  { name: 'Assinaturas', icon: 'subscriptions', color: 'text-purple-400 bg-purple-500/10' },
  { name: 'Saúde', icon: 'vaccines', color: 'text-red-400 bg-red-500/10' },
  { name: 'Lazer', icon: 'sports_esports', color: 'text-pink-400 bg-pink-500/10' },
  { name: 'Outros', icon: 'help_outline', color: 'text-slate-400 bg-slate-500/10' }
];

export const AVAILABLE_ACCOUNTS = [
  'Æternum',
  'PIX',
  'Nubank',
  'Pai',
  'Mercado Livre'
];
