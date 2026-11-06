import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  PlusCircle, 
  Trash2, 
  Edit3, 
  ArrowRight, 
  CreditCard, 
  Wallet, 
  Check, 
  X, 
  AlertCircle 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PlanScreenProps, PlanEntry, PlanCard } from '../types';

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const monthToNum = (m: string): number => {
  const [y, mm] = m.split('-').map(Number);
  return y * 12 + mm;
};

const numToMonth = (num: number): string => {
  const y = Math.floor((num - 1) / 12);
  const mm = (num - 1) % 12 + 1;
  return `${y}-${mm < 10 ? '0' + mm : mm}`;
};

const getCurrentYearMonth = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

export default function PlanScreen({
  planEntries,
  setPlanEntries,
  planIncomes,
  setPlanIncomes,
  planCards,
  setPlanCards,
  triggerToast,
  accounts,
  activePlanMonth = getCurrentYearMonth(),
  setActivePlanMonth,
  planMonth,
  setPlanMonth
}: PlanScreenProps) {
  // Use activePlanMonth or planMonth if provided, otherwise fallback to internal currentMonth
  const [internalCurrentMonth, setInternalCurrentMonth] = useState(activePlanMonth || planMonth || getCurrentYearMonth());
  const currentMonth = planMonth !== undefined ? planMonth : internalCurrentMonth;

  const setCurrentMonth = (action: React.SetStateAction<string>) => {
    if (setPlanMonth) {
      if (typeof action === 'function') {
        setPlanMonth(action(currentMonth));
      } else {
        setPlanMonth(action);
      }
    } else {
      setInternalCurrentMonth(action);
    }
  };
  
  // Sync view month when activePlanMonth changes or mounts
  useEffect(() => {
    if (activePlanMonth) {
      if (setPlanMonth) {
        setPlanMonth(activePlanMonth);
      } else {
        setInternalCurrentMonth(activePlanMonth);
      }
    }
  }, [activePlanMonth]);

  // Recursively or iteratively calculate the projected balance of accounts starting from the Active Month
  const getAccountBalanceProjection = (accountId: string, monthStr: string) => {
    const account = accounts.find(a => a.id === accountId);
    if (!account) return { start: 0, end: 0 };

    const startMonthNum = monthToNum(activePlanMonth || getCurrentYearMonth());
    const targetMonthNum = monthToNum(monthStr);

    if (targetMonthNum < startMonthNum) {
      const targetEntries = planEntries.filter(e => e.month === monthStr && e.category === 'contas' && e.accountId === accountId);
      const incomes = targetEntries.filter(e => e.type === 'income').reduce((sum, e) => sum + e.amount, 0);
      const expenses = targetEntries.filter(e => e.type !== 'income').reduce((sum, e) => sum + e.amount, 0);
      return {
        start: account.balance,
        end: account.balance - incomes + expenses
      };
    }

    let currentBal = account.balance;
    for (let m = startMonthNum; m <= targetMonthNum; m++) {
      const mStr = numToMonth(m);
      const targetEntries = planEntries.filter(e => e.month === mStr && e.category === 'contas' && e.accountId === accountId);
      const incomes = targetEntries.filter(e => e.type === 'income').reduce((sum, e) => sum + e.amount, 0);
      const expenses = targetEntries.filter(e => e.type !== 'income').reduce((sum, e) => sum + e.amount, 0);

      if (m === targetMonthNum) {
        return {
          start: currentBal,
          end: currentBal - incomes + expenses
        };
      }
      currentBal = currentBal - incomes + expenses;
    }

    return { start: currentBal, end: currentBal };
  };
  
  // Inline/Modal states
  const [editingIncomeMonth, setEditingIncomeMonth] = useState<string | null>(null);
  const [incomeInputStr, setIncomeInputStr] = useState('');
  
  // Launch Add/Edit Modal
  const [isLaunchModalOpen, setIsLaunchModalOpen] = useState(false);
  const [launchModalMode, setLaunchModalMode] = useState<'create' | 'edit'>('create');
  const [editingLaunchId, setEditingLaunchId] = useState<string | null>(null);
  
  // Selected target category/subcategory/month for creation
  const [modalMonth, setModalMonth] = useState(activePlanMonth || getCurrentYearMonth());
  const [modalCategory, setModalCategory] = useState<'gastos' | 'cartoes' | 'contas'>('gastos');
  const [modalSubcategory, setModalSubcategory] = useState('');
  const [modalCardId, setModalCardId] = useState<string | undefined>(undefined);
  const [modalAccountId, setModalAccountId] = useState<string | undefined>(undefined);
  
  // Inputs inside launch modal
  const [launchName, setLaunchName] = useState('');
  const [launchAmountStr, setLaunchAmountStr] = useState('');
  const [launchType, setLaunchType] = useState<'expense' | 'income'>('expense');
  const [isInstallment, setIsInstallment] = useState(false);
  const [installmentsCount, setInstallmentsCount] = useState<number | undefined>(undefined);
  const [currentInstallment, setCurrentInstallment] = useState<number | undefined>(undefined);
  
  // Card Creation inline state
  const [addingCardMonth, setAddingCardMonth] = useState<string | null>(null);
  const [newCardName, setNewCardName] = useState('');

  // Card Deletion modal confirmation state
  const [cardToDelete, setCardToDelete] = useState<{ id: string; name: string; month: string } | null>(null);

  // Payment Checklist popup states
  const [isPaymentPopupOpen, setIsPaymentPopupOpen] = useState(false);
  const [paymentPopupMonth, setPaymentPopupMonth] = useState<string | null>(null);
  const [selectedEntryIds, setSelectedEntryIds] = useState<string[]>([]);
  const [paidEntryIds, setPaidEntryIds] = useState<string[]>([]);

  const handleOpenPaymentPopup = (monthStr: string) => {
    setPaymentPopupMonth(monthStr);
    setSelectedEntryIds([]);
    const initialPaidIds = planEntries
      .filter(entry => entry.month === monthStr && entry.paid)
      .map(entry => entry.id);
    setPaidEntryIds(initialPaidIds);
    setIsPaymentPopupOpen(true);
  };

  // Helpers to handle month changes
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

  // Income handler
  const handleStartEditIncome = (monthStr: string) => {
    setEditingIncomeMonth(monthStr);
    const mIncome = planIncomes[monthStr] || 0;
    if (mIncome > 0) {
      const centsValue = (mIncome * 100).toFixed(0);
      handleAutomaticCentsInput(centsValue, setIncomeInputStr);
    } else {
      setIncomeInputStr('');
    }
  };

  const handleSaveIncome = () => {
    if (!editingIncomeMonth) return;
    const parsed = parseFormattedAmount(incomeInputStr);
    setPlanIncomes(prev => ({
      ...prev,
      [editingIncomeMonth]: parsed
    }));
    setEditingIncomeMonth(null);
    triggerToast('Entrada mensal atualizada!');
  };

  const formatBRL = (value: number) => {
    const isNegative = value < 0;
    const absValue = Math.abs(value);
    const formatted = absValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return isNegative ? `- R$ ${formatted}` : `R$ ${formatted}`;
  };

  // Calculations per month function
  const getMonthCalculations = (monthStr: string) => {
    const currentIncome = planIncomes[monthStr] || 0;
    const monthlyEntries = planEntries.filter(entry => entry.month === monthStr);
    const visibleCards = planCards.filter(card => {
      const isExcluded = card.excludedMonths?.includes(monthStr);
      if (isExcluded) return false;
      if (card.months !== undefined) {
        return card.months.includes(monthStr);
      }
      return true;
    });
    const activeEntries = monthlyEntries.filter(entry => entry.category !== 'cartoes' || !entry.cardId || visibleCards.some(vc => vc.id === entry.cardId));
    const totalExpenses = activeEntries.filter(entry => entry.type !== 'income').reduce((sum, entry) => sum + entry.amount, 0);
    const totalIncomesFromEntries = activeEntries.filter(entry => entry.type === 'income').reduce((sum, entry) => sum + entry.amount, 0);
    const headerEntrada = currentIncome;
    const headerGastos = totalExpenses - totalIncomesFromEntries;
    const balanceValue = headerEntrada - headerGastos;
    const gastosEntries = monthlyEntries.filter(entry => entry.category === 'gastos');
    const sumGastos = gastosEntries.reduce((sum, entry) => sum + (entry.type === 'income' ? -entry.amount : entry.amount), 0);
    const sumGastosCasa = gastosEntries.filter(entry => entry.subcategory === 'CASA').reduce((sum, entry) => sum + (entry.type === 'income' ? -entry.amount : entry.amount), 0);
    const sumGastosFixos = gastosEntries.filter(entry => entry.subcategory === 'FIXOS').reduce((sum, entry) => sum + (entry.type === 'income' ? -entry.amount : entry.amount), 0);
    const sumGastosGeral = gastosEntries.filter(entry => entry.subcategory === 'GERAL').reduce((sum, entry) => sum + (entry.type === 'income' ? -entry.amount : entry.amount), 0);
    const cartoesEntries = monthlyEntries.filter(entry => entry.category === 'cartoes');
    const sumCartoesTotal = cartoesEntries.filter(entry => !entry.cardId || visibleCards.some(vc => vc.id === entry.cardId)).reduce((sum, entry) => sum + (entry.type === 'income' ? -entry.amount : entry.amount), 0);
    const contasEntries = monthlyEntries.filter(entry => entry.category === 'contas');
    const sumContasTotal = contasEntries.reduce((sum, entry) => sum + (entry.type === 'income' ? -entry.amount : entry.amount), 0);

    const getCardTotal = (cardId: string) => {
      return cartoesEntries.filter(entry => entry.cardId === cardId).reduce((sum, entry) => sum + (entry.type === 'income' ? -entry.amount : entry.amount), 0);
    };

    const getCardSubcategoryTotal = (cardId: string, subcat: string) => {
      return cartoesEntries
        .filter(entry => entry.cardId === cardId && entry.subcategory === subcat)
        .reduce((sum, entry) => sum + (entry.type === 'income' ? -entry.amount : entry.amount), 0);
    };

    const getAccountTotal = (accId: string) => {
      return contasEntries.filter(entry => entry.accountId === accId).reduce((sum, entry) => sum + (entry.type === 'income' ? -entry.amount : entry.amount), 0);
    };

    return {
      currentIncome,
      monthlyEntries,
      visibleCards,
      activeEntries,
      totalExpenses,
      totalIncomesFromEntries,
      headerEntrada,
      headerGastos,
      balanceValue,
      gastosEntries,
      sumGastos,
      sumGastosCasa,
      sumGastosFixos,
      sumGastosGeral,
      cartoesEntries,
      sumCartoesTotal,
      contasEntries,
      sumContasTotal,
      getCardTotal,
      getCardSubcategoryTotal,
      getAccountTotal
    };
  };

  // Launch modal creation trigger
  const handleOpenCreateLaunch = (category: 'gastos' | 'cartoes' | 'contas', subcategory: string, cardId?: string, accountId?: string, targetMonth: string = currentMonth) => {
    setLaunchModalMode('create');
    setModalMonth(targetMonth);
    setModalCategory(category);
    setModalSubcategory(subcategory);
    setModalCardId(cardId);
    setModalAccountId(accountId);
    setLaunchName('');
    setLaunchAmountStr('');
    setLaunchType('expense');
    setIsInstallment(false);
    setInstallmentsCount(undefined);
    setCurrentInstallment(undefined);
    setIsLaunchModalOpen(true);
  };

  // Launch modal edit trigger
  const handleOpenEditLaunch = (entry: PlanEntry) => {
    setLaunchModalMode('edit');
    setEditingLaunchId(entry.id);
    setModalMonth(entry.month);
    setModalCategory(entry.category);
    setModalSubcategory(entry.subcategory);
    setModalCardId(entry.cardId);
    setModalAccountId(entry.accountId);
    setLaunchName(entry.name);
    setLaunchType(entry.type || 'expense');
    setIsInstallment(entry.isInstallment || false);
    setInstallmentsCount(entry.installmentsCount);
    setCurrentInstallment(entry.currentInstallment);
    const centsValue = (entry.amount * 100).toFixed(0);
    handleAutomaticCentsInput(centsValue, setLaunchAmountStr);
    setIsLaunchModalOpen(true);
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

    if (launchModalMode === 'create') {
      const newEntry: PlanEntry = {
        id: 'plan-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
        name: launchName.trim(),
        amount: val,
        month: modalMonth,
        category: modalCategory,
        subcategory: modalSubcategory,
        cardId: modalCategory === 'cartoes' ? modalCardId : undefined,
        accountId: modalCategory === 'contas' ? modalAccountId : undefined,
        type: launchType,
        isInstallment,
        installmentsCount: isInstallment ? installmentsCount : undefined,
        currentInstallment: isInstallment ? currentInstallment : undefined
      };
      setPlanEntries(prev => [...prev, newEntry]);
      triggerToast('Lançamento adicionado com sucesso!');
    } else if (launchModalMode === 'edit' && editingLaunchId) {
      setPlanEntries(prev => prev.map(entry => {
        if (entry.id === editingLaunchId) {
          return {
            ...entry,
            name: launchName.trim(),
            amount: val,
            type: launchType,
            cardId: entry.category === 'cartoes' ? modalCardId : undefined,
            accountId: entry.category === 'contas' ? modalAccountId : undefined,
            isInstallment,
            installmentsCount: isInstallment ? installmentsCount : undefined,
            currentInstallment: isInstallment ? currentInstallment : undefined
          };
        }
        return entry;
      }));
      triggerToast('Lançamento atualizado!');
    }
    setIsLaunchModalOpen(false);
  };

  const handleDeleteLaunch = (id: string) => {
    setPlanEntries(prev => prev.filter(entry => entry.id !== id));
    triggerToast('Lançamento excluído.');
  };

  // Replication logic
  const handleReplicateSingleLaunch = (entry: PlanEntry) => {
    const nextMonth = getNextMonth(entry.month);
    const duplicated: PlanEntry = {
      ...entry,
      id: 'plan-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      month: nextMonth,
      currentInstallment: entry.isInstallment && entry.currentInstallment && entry.installmentsCount
        ? Math.min(entry.currentInstallment + 1, entry.installmentsCount)
        : entry.currentInstallment,
      paid: false
    };
    
    if (entry.category === 'cartoes' && entry.cardId) {
      setPlanCards(prev => prev.map(c => {
        if (c.id === entry.cardId) {
          const updatedMonths = c.months ? [...c.months] : [];
          if (!updatedMonths.includes(nextMonth)) {
            updatedMonths.push(nextMonth);
          }
          return {
            ...c,
            excludedMonths: c.excludedMonths?.filter(m => m !== nextMonth) || [],
            months: updatedMonths
          };
        }
        return c;
      }));
    }

    setPlanEntries(prev => [...prev, duplicated]);
    triggerToast(`"${entry.name}" replicado para ${formatMonthName(nextMonth)}!`);
  };

  const handleReplicateSubcategory = (category: 'gastos' | 'cartoes' | 'contas', subcategory: string, cardId?: string, accountId?: string, fromMonth: string = currentMonth) => {
    const targetEntries = planEntries.filter(entry => 
      entry.month === fromMonth && 
      entry.category === category && 
      entry.subcategory === subcategory && 
      entry.cardId === cardId &&
      entry.accountId === accountId
    );

    if (targetEntries.length === 0) {
      triggerToast('Nenhum lançamento nesta subcategoria para replicar.');
      return;
    }

    const nextMonth = getNextMonth(fromMonth);
    const duplicated: PlanEntry[] = targetEntries.map(entry => ({
      ...entry,
      id: 'plan-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4) + '-' + Math.random().toString(36).substr(2, 4),
      month: nextMonth,
      currentInstallment: entry.isInstallment && entry.currentInstallment && entry.installmentsCount
        ? Math.min(entry.currentInstallment + 1, entry.installmentsCount)
        : entry.currentInstallment,
      paid: false
    }));

    if (category === 'cartoes' && cardId) {
      setPlanCards(prev => prev.map(c => {
        if (c.id === cardId) {
          const updatedMonths = c.months ? [...c.months] : [];
          if (!updatedMonths.includes(nextMonth)) {
            updatedMonths.push(nextMonth);
          }
          return {
            ...c,
            excludedMonths: c.excludedMonths?.filter(m => m !== nextMonth) || [],
            months: updatedMonths
          };
        }
        return c;
      }));
    }

    setPlanEntries(prev => [...prev, ...duplicated]);
    triggerToast(`Subcategoria replicada para ${formatMonthName(nextMonth)} (${targetEntries.length} itens)!`);
  };

  const handleReplicateCategory = (category: 'gastos' | 'cartoes' | 'contas', cardId?: string, accountId?: string, fromMonth: string = currentMonth) => {
    const nextMonth = getNextMonth(fromMonth);

    // If replicating a card specifically (even if it has 0 entries)
    if (category === 'cartoes' && cardId !== undefined) {
      setPlanCards(prev => prev.map(c => {
        if (c.id === cardId) {
          const updatedMonths = c.months ? [...c.months] : [];
          if (!updatedMonths.includes(nextMonth)) {
            updatedMonths.push(nextMonth);
          }
          return {
            ...c,
            excludedMonths: c.excludedMonths?.filter(m => m !== nextMonth) || [],
            months: updatedMonths
          };
        }
        return c;
      }));
    }

    const targetEntries = planEntries.filter(entry => 
      entry.month === fromMonth && 
      entry.category === category && 
      (cardId === undefined || entry.cardId === cardId) &&
      (accountId === undefined || entry.accountId === accountId)
    );

    let duplicatedCount = 0;
    if (targetEntries.length > 0) {
      const duplicated: PlanEntry[] = targetEntries.map(entry => ({
        ...entry,
        id: 'plan-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4) + '-' + Math.random().toString(36).substr(2, 4),
        month: nextMonth,
        currentInstallment: entry.isInstallment && entry.currentInstallment && entry.installmentsCount
          ? Math.min(entry.currentInstallment + 1, entry.installmentsCount)
          : entry.currentInstallment,
        paid: false
      }));
      setPlanEntries(prev => [...prev, ...duplicated]);
      duplicatedCount = targetEntries.length;
    }

    if (category === 'cartoes') {
      setPlanCards(prev => prev.map(c => {
        const isCardVisibleInFromMonth = !c.excludedMonths?.includes(fromMonth) && (!c.months || c.months.includes(fromMonth));
        if (isCardVisibleInFromMonth && (cardId === undefined || c.id === cardId)) {
          const updatedMonths = c.months ? [...c.months] : [];
          if (!updatedMonths.includes(nextMonth)) {
            updatedMonths.push(nextMonth);
          }
          return {
            ...c,
            excludedMonths: c.excludedMonths?.filter(m => m !== nextMonth) || [],
            months: updatedMonths
          };
        }
        return c;
      }));
    }

    const catName = category === 'gastos' ? 'GASTOS' : category === 'cartoes' ? `CARTÃO` : `CONTAS`;
    if (category === 'cartoes' && cardId !== undefined) {
      const cardName = planCards.find(c => c.id === cardId)?.name || 'Cartão';
      triggerToast(`Cartão "${cardName}" e seus ${duplicatedCount} lançamentos replicados para ${formatMonthName(nextMonth)}!`);
    } else {
      triggerToast(`${catName} replicado para ${formatMonthName(nextMonth)} (${duplicatedCount} itens)!`);
    }
  };

  // Card creation logic
  const handleCreateCard = (monthStr: string) => {
    if (!newCardName.trim()) {
      triggerToast('Informe o nome do cartão.');
      return;
    }

    const trimmedName = newCardName.trim();
    const existingCard = planCards.find(c => c.name.toLowerCase() === trimmedName.toLowerCase());
    
    if (existingCard) {
      const isExcluded = existingCard.excludedMonths?.includes(monthStr);
      const hasMonths = existingCard.months && existingCard.months.length > 0;
      const isAlreadyInMonths = hasMonths && existingCard.months?.includes(monthStr);

      if (!isExcluded && (!hasMonths || isAlreadyInMonths)) {
        triggerToast('Já existe um cartão com esse nome neste mês.');
        return;
      }

      setPlanCards(prev => prev.map(c => {
        if (c.id === existingCard.id) {
          const updatedMonths = c.months ? [...c.months] : [];
          if (!updatedMonths.includes(monthStr)) {
            updatedMonths.push(monthStr);
          }
          return {
            ...c,
            excludedMonths: c.excludedMonths?.filter(m => m !== monthStr) || [],
            months: updatedMonths
          };
        }
        return c;
      }));

      setNewCardName('');
      setAddingCardMonth(null);
      triggerToast(`Cartão "${existingCard.name}" adicionado para este mês.`);
      return;
    }

    const newCard: PlanCard = {
      id: 'pcard-' + Date.now(),
      name: trimmedName,
      months: [monthStr]
    };

    setPlanCards(prev => [...prev, newCard]);
    setNewCardName('');
    setAddingCardMonth(null);
    triggerToast(`Cartão ${newCard.name} criado para este mês!`);
  };

  const handleDeleteCard = (cardId: string, cardName: string, monthStr: string) => {
    setCardToDelete({ id: cardId, name: cardName, month: monthStr });
  };

  const handleConfirmDeleteCard = () => {
    if (!cardToDelete) return;
    const { id, name, month } = cardToDelete;
    
    setPlanCards(prev => prev.map(c => {
      if (c.id === id) {
        const excluded = c.excludedMonths || [];
        const updatedMonths = c.months ? c.months.filter(m => m !== month) : [];
        return {
          ...c,
          excludedMonths: excluded.includes(month) ? excluded : [...excluded, month],
          months: updatedMonths
        };
      }
      return c;
    }));

    setPlanEntries(prev => prev.filter(entry => !(entry.cardId === id && entry.month === month)));
    triggerToast(`Cartão "${name}" excluído deste mês.`);
    setCardToDelete(null);
  };

  const renderMonthColumn = (monthStr: string, isDesktop: boolean = false) => {
    const {
      currentIncome,
      monthlyEntries,
      visibleCards,
      activeEntries,
      totalExpenses,
      totalIncomesFromEntries,
      headerEntrada,
      headerGastos,
      balanceValue,
      gastosEntries,
      sumGastos,
      sumGastosCasa,
      sumGastosFixos,
      sumGastosGeral,
      cartoesEntries,
      sumCartoesTotal,
      contasEntries,
      sumContasTotal,
      getCardTotal,
      getCardSubcategoryTotal,
      getAccountTotal
    } = getMonthCalculations(monthStr);

    const isEditingIncome = editingIncomeMonth === monthStr;
    const isAddingCard = addingCardMonth === monthStr;

    const columnContent = (
      <>
        {/* MONTH HEADER FOR COLUMN (shows month name and Active Month toggle) - DESKTOP ONLY */}
        {isDesktop && (
          <div className="flex items-center justify-between bg-bg-surface-low border border-outline-variant/50 rounded-2xl p-4 shadow-sm" id={`plan-month-header-${monthStr}`}>
            {activePlanMonth === monthStr ? (
              <button
                onClick={() => handleOpenPaymentPopup(monthStr)}
                className="text-xs font-black uppercase tracking-widest text-brand-primary font-display hover:text-emerald-400 transition-all cursor-pointer bg-transparent border-none p-0 focus:outline-none text-left underline decoration-brand-primary/30 decoration-2 underline-offset-4 hover:decoration-emerald-400"
                title="Clique para abrir controle de pagamentos do Mês Ativo"
                id={`btn-open-payment-column-${monthStr}`}
              >
                {formatMonthName(monthStr)}
              </button>
            ) : (
              <span className="text-xs font-black uppercase tracking-widest text-brand-primary font-display">
                {formatMonthName(monthStr)}
              </span>
            )}

            {/* Active Month Status & Button */}
            <div className="flex items-center gap-2">
              {activePlanMonth === monthStr ? (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-[10px] font-black uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Mês Ativo</span>
                </div>
              ) : (
                <button
                  onClick={() => {
                    if (setActivePlanMonth) {
                      setActivePlanMonth(monthStr);
                      triggerToast(`"${formatMonthName(monthStr)}" definido como Mês Ativo!`);
                    }
                  }}
                  className="px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 text-text-muted hover:text-white border border-white/10 text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer"
                  id={`btn-set-active-month-${monthStr}`}
                >
                  Definir Ativo
                </button>
              )}
            </div>
          </div>
        )}

        {/* 2. RESUMO PANEL (BALANÇO, ENTRADA, GASTOS) */}
        <div className="grid grid-cols-3 gap-2.5" id={`plan-summary-grid-${monthStr}`}>
          {/* BALANÇO */}
          <div className="bg-bg-surface-low border border-outline-variant/40 rounded-xl p-3 flex flex-col justify-between" id={`summary-balance-card-${monthStr}`}>
            <span className="text-[9px] uppercase tracking-wider text-text-muted font-bold">BALANÇO</span>
            <span className={`text-xs font-black font-mono tracking-tight truncate mt-1 ${balanceValue >= 0 ? 'text-green-400' : 'text-rose-400'}`}>
              {formatBRL(balanceValue)}
            </span>
          </div>

          {/* ENTRADA (Editable) */}
          <div 
            onClick={() => { if (!isEditingIncome) handleStartEditIncome(monthStr); }}
            className="bg-bg-surface-low border border-outline-variant/40 rounded-xl p-3 flex flex-col justify-between cursor-pointer hover:border-brand-primary/40 transition-colors"
            id={`summary-income-card-${monthStr}`}
          >
            <span className="text-[9px] uppercase tracking-wider text-text-muted font-bold flex items-center gap-1 justify-between">
              ENTRADA
              <Edit3 size={10} className="opacity-60" />
            </span>

            {isEditingIncome ? (
              <div className="flex items-center gap-1 mt-1" onClick={e => e.stopPropagation()}>
                <input
                  type="text"
                  autoFocus
                  inputMode="decimal"
                  value={incomeInputStr}
                  onChange={e => handleAutomaticCentsInput(e.target.value, setIncomeInputStr)}
                  onBlur={handleSaveIncome}
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleSaveIncome();
                    if (e.key === 'Escape') setEditingIncomeMonth(null);
                  }}
                  className="bg-bg-base border border-brand-primary rounded px-1.5 py-0.5 text-xs font-bold font-mono text-white w-full focus:outline-none"
                  id={`income-editable-input-${monthStr}`}
                />
                <button onClick={handleSaveIncome} className="text-green-400 p-0.5" id={`btn-save-income-${monthStr}`}>
                  <Check size={12} />
                </button>
              </div>
            ) : (
              <span className="text-xs font-black font-mono tracking-tight truncate mt-1 text-brand-primary">
                {formatBRL(headerEntrada)}
              </span>
            )}
          </div>

          {/* GASTOS */}
          <div className="bg-bg-surface-low border border-outline-variant/40 rounded-xl p-3 flex flex-col justify-between" id={`summary-expenses-card-${monthStr}`}>
            <span className="text-[9px] uppercase tracking-wider text-text-muted font-bold">GASTOS</span>
            <span className="text-xs font-black font-mono tracking-tight truncate mt-1 text-white">
              {formatBRL(headerGastos)}
            </span>
          </div>
        </div>

        {/* 3. CATEGORIA GASTOS */}
        <div className="bg-bg-surface-low border border-outline-variant/50 rounded-2xl p-4 shadow-sm space-y-4" id={`category-gastos-box-${monthStr}`}>
          <div className="flex items-center justify-between pb-3 border-b border-outline-variant/30">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded bg-brand-primary" />
              <h3 className="text-xs font-black uppercase tracking-widest text-white">GASTOS</h3>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 ${sumGastos < 0 ? 'text-emerald-400 font-bold' : 'text-text-muted'}`}>
                {sumGastos < 0 ? `+ R$ ${Math.abs(sumGastos).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : formatBRL(sumGastos)}
              </span>
            </div>
            
            <button
              onClick={() => handleReplicateCategory('gastos', undefined, undefined, monthStr)}
              className="p-1.5 rounded bg-white/5 border border-white/10 text-text-muted hover:text-white hover:border-white/30 transition-all cursor-pointer flex items-center justify-center"
              title="Replicar todos os gastos para o mês seguinte"
              id={`btn-replicate-gastos-category-${monthStr}`}
            >
              <ArrowRight size={12} />
            </button>
          </div>

          {/* Subcategories */}
          <div className="space-y-4">
            {[
              { key: 'CASA', label: 'CASA', sum: sumGastosCasa },
              { key: 'FIXOS', label: 'FIXOS', sum: sumGastosFixos },
              { key: 'GERAL', label: 'GERAL', sum: sumGastosGeral }
            ].map(sub => {
              const subEntries = gastosEntries.filter(entry => entry.subcategory === sub.key);

              return (
                <div key={sub.key} className="bg-bg-base/30 rounded-xl p-3 border border-outline-variant/20 space-y-2.5" id={`sub-gastos-${sub.key}-${monthStr}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black tracking-widest text-text-muted uppercase font-display">{sub.label}</span>
                      <span className={`text-[10px] font-mono font-bold ${sub.sum < 0 ? 'text-emerald-400' : 'text-white/80'}`}>
                        {sub.sum < 0 ? `+ R$ ${Math.abs(sub.sum).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : formatBRL(sub.sum)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenCreateLaunch('gastos', sub.key, undefined, undefined, monthStr)}
                        className="p-1 rounded bg-brand-primary/10 hover:bg-brand-primary/20 text-brand-primary border border-brand-primary/20 transition-all cursor-pointer flex items-center gap-0.5 text-[9px] font-bold uppercase tracking-wider px-1.5"
                        id={`btn-add-sub-gastos-${sub.key}-${monthStr}`}
                      >
                        <Plus size={11} />
                        <span>Novo</span>
                      </button>

                      <button
                        onClick={() => handleReplicateSubcategory('gastos', sub.key, undefined, undefined, monthStr)}
                        className="p-1 rounded bg-white/5 hover:bg-white/10 text-text-muted hover:text-white border border-white/5 transition-all cursor-pointer"
                        title="Replicar subcategoria para o mês seguinte"
                        id={`btn-replicate-sub-gastos-${sub.key}-${monthStr}`}
                      >
                        <ArrowRight size={11} />
                      </button>
                    </div>
                  </div>

                  {/* Subcategory List of Entries */}
                  <div className="space-y-1.5">
                    {subEntries.length === 0 ? (
                      <p className="text-[10px] text-text-muted italic opacity-60 pl-1">Nenhum lançamento.</p>
                    ) : (
                      subEntries.map(entry => (
                        <div 
                          key={entry.id} 
                          className="flex items-center justify-between bg-black/25 hover:bg-black/40 border border-white/5 rounded-lg p-2 transition-colors"
                          id={`entry-${entry.id}`}
                        >
                          <span className="text-[11px] font-medium text-white/90 pl-1">
                            {entry.name}
                            {entry.isInstallment && entry.currentInstallment !== undefined && entry.installmentsCount !== undefined && (
                              <span className="text-[10px] text-purple-300 font-mono ml-1">
                                ({entry.currentInstallment}/{entry.installmentsCount})
                              </span>
                            )}
                          </span>
                          
                          <div className="flex items-center gap-3">
                            <span className={`text-[11px] font-mono font-semibold ${entry.type === 'income' ? 'text-emerald-400' : 'text-text-muted'}`}>
                              {entry.type === 'income' ? '+' : '-'} R$ {entry.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>

                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => handleOpenEditLaunch(entry)}
                                className="text-text-muted hover:text-brand-primary p-1 rounded hover:bg-white/5 transition-colors"
                                title="Editar"
                                id={`btn-edit-entry-${entry.id}`}
                              >
                                <Edit3 size={11} />
                              </button>
                              <button
                                onClick={() => handleDeleteLaunch(entry.id)}
                                className="text-text-muted hover:text-rose-400 p-1 rounded hover:bg-white/5 transition-colors"
                                title="Excluir"
                                id={`btn-delete-entry-${entry.id}`}
                              >
                                <Trash2 size={11} />
                              </button>
                              <button
                                onClick={() => handleReplicateSingleLaunch(entry)}
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
              );
            })}
          </div>
        </div>

        {/* 4. CATEGORIA CARTÕES */}
        <div className="bg-bg-surface-low border border-outline-variant/50 rounded-2xl p-4 shadow-sm space-y-4" id={`category-cartoes-box-${monthStr}`}>
          <div className="flex items-center justify-between pb-3 border-b border-outline-variant/30">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded bg-purple-400" />
              <h3 className="text-xs font-black uppercase tracking-widest text-white">CARTÕES</h3>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 ${sumCartoesTotal < 0 ? 'text-emerald-400 font-bold' : 'text-text-muted'}`}>
                {sumCartoesTotal < 0 ? `+ R$ ${Math.abs(sumCartoesTotal).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : formatBRL(sumCartoesTotal)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setAddingCardMonth(isAddingCard ? null : monthStr)}
                className="p-1.5 rounded bg-purple-400/10 hover:bg-purple-400/20 text-purple-300 border border-purple-400/20 transition-all cursor-pointer flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider px-2"
                id={`btn-open-add-card-${monthStr}`}
              >
                <PlusCircle size={11} />
                <span>Novo Cartão</span>
              </button>

              <button
                onClick={() => handleReplicateCategory('cartoes', undefined, undefined, monthStr)}
                className="p-1.5 rounded bg-white/5 border border-white/10 text-text-muted hover:text-white hover:border-white/30 transition-all cursor-pointer flex items-center justify-center"
                title="Replicar todos os cartões para o mês seguinte"
                id={`btn-replicate-cartoes-category-${monthStr}`}
              >
                <ArrowRight size={12} />
              </button>
            </div>
          </div>

          {/* Inline Card Creation Form */}
          <AnimatePresence>
            {isAddingCard && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden bg-bg-base/40 rounded-xl p-3 border border-purple-500/20 space-y-2.5"
                id={`add-card-inline-form-${monthStr}`}
              >
                <span className="block text-[9px] uppercase tracking-wider text-purple-300 font-bold">Novo Cartão</span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Nome do cartão (ex: Ultravioleta)"
                    value={newCardName}
                    onChange={e => setNewCardName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleCreateCard(monthStr)}
                    className="bg-bg-base border border-outline-variant/60 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-text-muted/60 focus:outline-none focus:border-purple-400 w-full"
                    id={`input-new-card-name-${monthStr}`}
                  />
                  <button
                    onClick={() => handleCreateCard(monthStr)}
                    className="bg-purple-400 text-black px-3 rounded-lg text-xs font-bold cursor-pointer"
                    id={`btn-confirm-add-card-${monthStr}`}
                  >
                    Criar
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* List of Custom Cards */}
          <div className="space-y-6">
            {visibleCards.length === 0 ? (
              <div className="text-center py-4 text-[11px] text-text-muted italic bg-black/10 rounded-xl border border-dashed border-outline-variant/30" id={`no-cards-placeholder-${monthStr}`}>
                Nenhum cartão cadastrado neste mês. Clique em "+ Novo Cartão" para adicionar.
              </div>
            ) : (
              visibleCards.map(card => {
                const cardTotal = getCardTotal(card.id);

                return (
                  <div key={card.id} className="border border-purple-500/10 rounded-xl p-3 bg-purple-950/5 space-y-4" id={`card-block-${card.id}-${monthStr}`}>
                    <div className="flex items-center justify-between pb-2 border-b border-purple-500/10">
                      <div className="flex items-center gap-2">
                        <CreditCard size={13} className="text-purple-400" />
                        <h4 className="text-[11px] font-black uppercase tracking-wider text-purple-200">{card.name}</h4>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${cardTotal < 0 ? 'bg-emerald-400/5 border-emerald-500/10 text-emerald-400 font-bold' : 'bg-purple-400/5 border-purple-400/10 text-purple-300'}`}>
                          {cardTotal < 0 ? `+ R$ ${Math.abs(cardTotal).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : formatBRL(cardTotal)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDeleteCard(card.id, card.name, monthStr)}
                          className="p-1 rounded bg-rose-500/5 hover:bg-rose-500/10 text-rose-400 border border-rose-500/10 transition-all cursor-pointer"
                          title="Excluir Cartão"
                          id={`btn-delete-card-${card.id}-${monthStr}`}
                        >
                          <Trash2 size={11} />
                        </button>

                        <button
                          onClick={() => handleReplicateCategory('cartoes', card.id, undefined, monthStr)}
                          className="p-1 rounded bg-white/5 hover:bg-white/10 text-text-muted hover:text-white border border-white/5 transition-all cursor-pointer flex items-center justify-center px-1.5"
                          title="Replicar todo este cartão para o mês seguinte"
                          id={`btn-replicate-card-${card.id}-${monthStr}`}
                        >
                          <ArrowRight size={10} />
                        </button>
                      </div>
                    </div>

                    {/* Card Subcategories */}
                    <div className="grid grid-cols-1 gap-3">
                      {[
                        { key: 'PARCELAS', label: 'PARCELAS' },
                        { key: 'FIXOS', label: 'FIXOS' },
                        { key: 'GERAL', label: 'GERAL' }
                      ].map(sub => {
                        const subTotal = getCardSubcategoryTotal(card.id, sub.key);
                        const subEntries = cartoesEntries.filter(entry => entry.cardId === card.id && entry.subcategory === sub.key);

                        return (
                          <div key={sub.key} className="bg-bg-base/30 rounded-lg p-2.5 border border-outline-variant/15 space-y-2" id={`card-${card.id}-sub-${sub.key}-${monthStr}`}>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5">
                                <span className="text-[9px] font-black tracking-wider text-text-muted uppercase font-display">{sub.label}</span>
                                <span className={`text-[9px] font-mono font-bold ${subTotal < 0 ? 'text-emerald-400' : 'text-white/70'}`}>
                                  {subTotal < 0 ? `+ R$ ${Math.abs(subTotal).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : formatBRL(subTotal)}
                                </span>
                              </div>

                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => handleOpenCreateLaunch('cartoes', sub.key, card.id, undefined, monthStr)}
                                  className="p-0.5 rounded bg-purple-400/10 hover:bg-purple-400/20 text-purple-300 transition-all cursor-pointer"
                                  id={`btn-add-card-${card.id}-sub-${sub.key}-${monthStr}`}
                                >
                                  <Plus size={11} />
                                </button>

                                <button
                                  onClick={() => handleReplicateSubcategory('cartoes', sub.key, card.id, undefined, monthStr)}
                                  className="p-0.5 rounded bg-white/5 hover:bg-white/10 text-text-muted hover:text-white transition-all cursor-pointer"
                                  title="Replicar esta subcategoria do cartão para o mês seguinte"
                                  id={`btn-replicate-card-${card.id}-sub-${sub.key}-${monthStr}`}
                                >
                                  <ArrowRight size={10} />
                                </button>
                              </div>
                            </div>

                            {/* Card Subcategory Entries List */}
                            <div className="space-y-1">
                              {subEntries.length === 0 ? (
                                <p className="text-[9px] text-text-muted italic opacity-50 pl-1">Nenhum lançamento.</p>
                              ) : (
                                subEntries.map(entry => (
                                  <div 
                                    key={entry.id} 
                                    className="flex items-center justify-between bg-black/20 hover:bg-black/35 border border-white/5 rounded p-1.5 transition-colors"
                                    id={`entry-${entry.id}`}
                                  >
                                    <span className="text-[10px] font-medium text-white/90 pl-1 flex items-center gap-1 min-w-0 flex-1 mr-2">
                                      <span className="truncate">{entry.name}</span>
                                      {entry.isInstallment && entry.currentInstallment !== undefined && entry.installmentsCount !== undefined && (
                                        <span className="text-[9px] text-purple-300 font-mono shrink-0">
                                          ({entry.currentInstallment}/{entry.installmentsCount})
                                        </span>
                                      )}
                                    </span>
                                    
                                    <div className="flex items-center gap-2">
                                      <span className={`text-[10px] font-mono font-semibold ${entry.type === 'income' ? 'text-emerald-400' : 'text-text-muted'}`}>
                                        {entry.type === 'income' ? '+' : '-'} R$ {entry.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                      </span>

                                      <div className="flex items-center gap-1">
                                        <button
                                          onClick={() => handleOpenEditLaunch(entry)}
                                          className="text-text-muted hover:text-purple-300 p-0.5 rounded hover:bg-white/5 transition-colors"
                                          title="Editar"
                                          id={`btn-edit-entry-${entry.id}`}
                                        >
                                          <Edit3 size={10} />
                                        </button>
                                        <button
                                          onClick={() => handleDeleteLaunch(entry.id)}
                                          className="text-text-muted hover:text-rose-400 p-0.5 rounded hover:bg-white/5 transition-colors"
                                          title="Excluir"
                                          id={`btn-delete-entry-${entry.id}`}
                                        >
                                          <Trash2 size={10} />
                                        </button>
                                        <button
                                          onClick={() => handleReplicateSingleLaunch(entry)}
                                          className="text-text-muted hover:text-white p-0.5 rounded hover:bg-white/5 transition-colors"
                                          title="Replicar para o mês seguinte"
                                          id={`btn-replicate-entry-${entry.id}`}
                                        >
                                          <ArrowRight size={10} />
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* 5. CATEGORIA CONTAS */}
        <div className="bg-bg-surface-low border border-outline-variant/50 rounded-2xl p-4 shadow-sm space-y-4" id={`category-contas-box-${monthStr}`}>
          <div className="flex items-center justify-between pb-3 border-b border-outline-variant/30">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded bg-emerald-500" />
              <h3 className="text-xs font-black uppercase tracking-widest text-white">CONTAS</h3>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 ${sumContasTotal < 0 ? 'text-emerald-400 font-bold' : 'text-text-muted'}`}>
                {sumContasTotal < 0 ? `+ R$ ${Math.abs(sumContasTotal).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : formatBRL(sumContasTotal)}
              </span>
            </div>

            <button
              onClick={() => handleReplicateCategory('contas', undefined, undefined, monthStr)}
              className="p-1 px-1.5 rounded bg-white/5 hover:bg-white/10 text-text-muted hover:text-white border border-white/5 transition-all cursor-pointer flex items-center justify-center"
              title="Replicar todas as contas para o mês seguinte"
              id={`btn-replicate-contas-category-${monthStr}`}
            >
              <ArrowRight size={12} />
            </button>
          </div>

          {/* List of Custom Accounts */}
          <div className="space-y-6">
            {accounts.length === 0 ? (
              <div className="text-center py-4 text-[11px] text-text-muted italic bg-black/10 rounded-xl border border-dashed border-outline-variant/30" id={`no-accounts-placeholder-${monthStr}`}>
                Nenhuma conta cadastrada no menu CONTAS. Cadastre suas contas lá para exibi-las aqui.
              </div>
            ) : (
              accounts.map(account => {
                const accountTotal = getAccountTotal(account.id);
                const accEntries = contasEntries.filter(e => e.accountId === account.id);
                const { start: projectedStart, end: projectedEnd } = getAccountBalanceProjection(account.id, monthStr);

                return (
                  <div key={account.id} className="border border-emerald-500/10 rounded-xl p-3 bg-emerald-950/5 space-y-4" id={`account-block-${account.id}-${monthStr}`}>
                    <div className="flex items-center justify-between pb-2 border-b border-emerald-500/10">
                      <div className="flex items-center gap-2">
                        <Wallet size={13} className="text-emerald-400" />
                        <h4 className="text-[11px] font-black uppercase tracking-wider text-emerald-200">{account.name}</h4>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${accountTotal < 0 ? 'bg-emerald-400/10 border-emerald-500/20 text-emerald-400 font-bold' : 'bg-emerald-400/5 border-emerald-400/10 text-emerald-300'}`}>
                          Total: {accountTotal < 0 ? `+ R$ ${Math.abs(accountTotal).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : formatBRL(accountTotal)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenCreateLaunch('contas', 'GERAL', undefined, account.id, monthStr)}
                          className="p-1 rounded bg-emerald-400/10 hover:bg-emerald-400/20 text-emerald-300 border border-emerald-500/10 transition-all cursor-pointer text-[9px] font-semibold flex items-center gap-1 px-1.5"
                          title="Adicionar lançamento para esta conta"
                          id={`btn-add-account-${account.id}-${monthStr}`}
                        >
                          <Plus size={10} />
                          <span>Novo</span>
                        </button>

                        <button
                          onClick={() => handleReplicateCategory('contas', undefined, account.id, monthStr)}
                          className="p-1 rounded bg-white/5 hover:bg-white/10 text-text-muted hover:text-white border border-white/5 transition-all cursor-pointer flex items-center justify-center px-1.5"
                          title="Replicar toda esta conta para o mês seguinte"
                          id={`btn-replicate-account-${account.id}-${monthStr}`}
                        >
                          <ArrowRight size={10} />
                        </button>
                      </div>
                    </div>

                    {/* Saldo info */}
                    <div className="grid grid-cols-2 gap-2 bg-black/15 p-2 rounded-lg border border-white/5" id={`account-balance-info-${account.id}-${monthStr}`}>
                      <div className="flex flex-col">
                        <span className="text-[9px] text-text-muted font-bold uppercase tracking-wider">Saldo Atual</span>
                        <span className="text-xs font-mono font-bold text-white mt-0.5">{formatBRL(projectedStart)}</span>
                      </div>
                      <div className="flex flex-col items-end text-right">
                        <span className="text-[9px] text-text-muted font-bold uppercase tracking-wider">
                          PROJEÇÃO
                        </span>
                        <span className={`text-xs font-mono font-bold mt-0.5 ${projectedEnd >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {formatBRL(projectedEnd)}
                        </span>
                      </div>
                    </div>

                    {/* Account Entries Flat List */}
                    <div className="bg-bg-base/30 rounded-lg p-2.5 border border-outline-variant/15 space-y-2" id={`account-${account.id}-entries-${monthStr}`}>
                      <div className="space-y-1">
                        {accEntries.length === 0 ? (
                          <p className="text-[9px] text-text-muted italic opacity-50 pl-1">Nenhum lançamento.</p>
                        ) : (
                          accEntries.map(entry => (
                            <div 
                              key={entry.id} 
                              className="flex items-center justify-between bg-black/20 hover:bg-black/35 border border-white/5 rounded p-1.5 transition-colors"
                              id={`entry-${entry.id}`}
                            >
                              <span className="text-[10px] font-medium text-white/90 pl-1 flex items-center gap-1 min-w-0 flex-1 mr-2">
                                <span className="truncate">{entry.name}</span>
                                {entry.isInstallment && entry.currentInstallment !== undefined && entry.installmentsCount !== undefined && (
                                  <span className="text-[9px] text-emerald-300 font-mono shrink-0">
                                    ({entry.currentInstallment}/{entry.installmentsCount})
                                  </span>
                                )}
                              </span>
                              
                              <div className="flex items-center gap-2">
                                <span className={`text-[10px] font-mono font-semibold ${entry.type === 'income' ? 'text-emerald-400' : 'text-text-muted'}`}>
                                  {entry.type === 'income' ? '+' : '-'} R$ {entry.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>

                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => handleOpenEditLaunch(entry)}
                                    className="text-text-muted hover:text-emerald-300 p-0.5 rounded hover:bg-white/5 transition-colors"
                                    title="Editar"
                                    id={`btn-edit-entry-${entry.id}`}
                                  >
                                    <Edit3 size={10} />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteLaunch(entry.id)}
                                    className="text-text-muted hover:text-rose-400 p-0.5 rounded hover:bg-white/5 transition-colors"
                                    title="Excluir"
                                    id={`btn-delete-entry-${entry.id}`}
                                  >
                                    <Trash2 size={10} />
                                  </button>
                                  <button
                                    onClick={() => handleReplicateSingleLaunch(entry)}
                                    className="text-text-muted hover:text-white p-0.5 rounded hover:bg-white/5 transition-colors"
                                    title="Replicar para o mês seguinte"
                                    id={`btn-replicate-entry-${entry.id}`}
                                  >
                                    <ArrowRight size={10} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </>
    );

    if (isDesktop) {
      return (
        <div className="flex flex-col space-y-5 bg-bg-surface-low/30 p-4 rounded-3xl border border-outline-variant/10 w-full" id={`month-column-${monthStr}`}>
          {columnContent}
        </div>
      );
    } else {
      return (
        <div className="flex flex-col space-y-6" id={`month-column-${monthStr}`}>
          {columnContent}
        </div>
      );
    }
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto pb-24" id="plan-screen-container">
      
      {/* 1. DISCREET DESKTOP MONTH NAVIGATOR (Arrows only, no repeated month names) - Hidden since it is now in the global header */}
      <div className="hidden" id="plan-desktop-header">
        <h2 className="text-lg font-black tracking-wider text-white uppercase font-display">
          Planejamento Mensal
        </h2>
        
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider mr-1">Navegar Meses</span>
          <div className="flex items-center bg-bg-surface-low border border-outline-variant/30 rounded-xl p-1 gap-1">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 text-text-muted hover:text-white hover:bg-white/5 active:bg-white/10 rounded-lg transition-all cursor-pointer"
              title="Mês anterior"
              id="btn-plan-prev-month-desktop"
            >
              <ChevronLeft size={16} />
            </button>
            <div className="w-[1px] h-4 bg-outline-variant/20" />
            <button
              onClick={handleNextMonth}
              className="p-1.5 text-text-muted hover:text-white hover:bg-white/5 active:bg-white/10 rounded-lg transition-all cursor-pointer"
              title="Próximo mês"
              id="btn-plan-next-month-desktop"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* 2. UNIFIED MOBILE MONTH SELECTOR (Month selector and active state toggle embedded) */}
      <div className="flex lg:hidden flex-col bg-bg-surface-low border border-outline-variant/50 rounded-2xl p-4 mb-5 shadow-sm space-y-3" id="plan-month-selector-mobile">
        <div className="flex items-center justify-between">
          <button
            onClick={handlePrevMonth}
            className="p-2 text-text-muted hover:text-white hover:bg-white/5 active:bg-white/10 rounded-full transition-all cursor-pointer"
            id="btn-plan-prev-month"
          >
            <ChevronLeft size={20} />
          </button>

          {activePlanMonth === currentMonth ? (
            <button
              onClick={() => handleOpenPaymentPopup(currentMonth)}
              className="text-sm font-black uppercase tracking-widest text-brand-primary font-display hover:text-emerald-400 transition-all cursor-pointer bg-transparent border-none p-0 focus:outline-none underline decoration-brand-primary/30 decoration-2 underline-offset-4 hover:decoration-emerald-400"
              title="Clique para abrir controle de pagamentos do Mês Ativo"
              id="btn-trigger-payment-popup-selector"
            >
              {formatMonthName(currentMonth)}
            </button>
          ) : (
            <span className="text-sm font-black uppercase tracking-widest text-white font-display">
              {formatMonthName(currentMonth)}
            </span>
          )}

          <button
            onClick={handleNextMonth}
            className="p-2 text-text-muted hover:text-white hover:bg-white/5 active:bg-white/10 rounded-full transition-all cursor-pointer"
            id="btn-plan-next-month"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Embedded Active Month logic for Mobile */}
        <div className="flex items-center justify-center pt-2 border-t border-outline-variant/10">
          {activePlanMonth === currentMonth ? (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-[10px] font-black uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Mês Ativo</span>
            </div>
          ) : (
            <button
              onClick={() => {
                if (setActivePlanMonth) {
                  setActivePlanMonth(currentMonth);
                  triggerToast(`"${formatMonthName(currentMonth)}" definido como Mês Ativo!`);
                }
              }}
              className="px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 text-text-muted hover:text-white border border-white/10 text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer"
              id={`btn-set-active-month-mobile-${currentMonth}`}
            >
              Definir como Mês Ativo
            </button>
          )}
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
        {isLaunchModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm shadow-2xl" id="launch-modal-overlay">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-bg-surface-low border border-outline-variant/60 rounded-3xl p-6 w-full max-w-sm space-y-6 relative"
              id="launch-modal-content"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-white">
                    {launchModalMode === 'create' ? 'Novo Lançamento' : 'Editar Lançamento'}
                  </h3>
                  <p className="text-[10px] text-text-muted mt-1 uppercase tracking-wide">
                    {modalCategory === 'gastos'
                      ? `GASTOS -> ${modalSubcategory}`
                      : modalCategory === 'cartoes'
                      ? `CARTÕES -> ${planCards.find(c => c.id === modalCardId)?.name} -> ${modalSubcategory}`
                      : `CONTAS -> ${accounts.find(a => a.id === modalAccountId)?.name} -> ${modalSubcategory}`}
                  </p>
                </div>
                <button
                  onClick={() => setIsLaunchModalOpen(false)}
                  className="text-text-muted hover:text-white p-1 rounded-full hover:bg-white/5 cursor-pointer"
                  id="btn-close-launch-modal"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSaveLaunch} className="space-y-4">
                {/* Tipo Toggle */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] uppercase tracking-wider text-text-muted font-bold">Tipo</label>
                  <div className="grid grid-cols-2 gap-2 bg-bg-base p-1 rounded-xl border border-outline-variant/40">
                    <button
                      type="button"
                      onClick={() => setLaunchType('expense')}
                      className={`py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        launchType === 'expense'
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/25'
                          : 'text-text-muted hover:text-white border border-transparent'
                      }`}
                    >
                      Despesa (-)
                    </button>
                    <button
                      type="button"
                      onClick={() => setLaunchType('income')}
                      className={`py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        launchType === 'income'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25'
                          : 'text-text-muted hover:text-white border border-transparent'
                      }`}
                    >
                      Receita (+)
                    </button>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] uppercase tracking-wider text-text-muted font-bold">Descrição</label>
                  <input
                    type="text"
                    placeholder="Ex: Aluguel, Supermercado"
                    value={launchName}
                    onChange={e => setLaunchName(e.target.value)}
                    className="w-full bg-bg-base border border-outline-variant/60 rounded-xl px-4 py-3 placeholder:text-text-muted/60 text-text-high font-medium text-xs focus:outline-none focus:border-brand-primary"
                    required
                    id="input-launch-desc"
                  />
                </div>

                {/* Amount with automatic cents formatting */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] uppercase tracking-wider text-text-muted font-bold">Valor (R$)</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-brand-primary font-black text-xs">R$</span>
                    <input
                      type="text"
                      inputMode="decimal"
                      placeholder="0,00"
                      value={launchAmountStr}
                      onChange={e => handleAutomaticCentsInput(e.target.value, setLaunchAmountStr)}
                      className="w-full bg-bg-base border border-outline-variant/60 rounded-xl pl-10 pr-4 py-3 placeholder:text-text-muted/60 text-text-high font-bold text-sm focus:outline-none focus:border-brand-primary font-mono"
                      required
                      id="input-launch-amount"
                    />
                  </div>
                </div>

                {/* Parcelado Checkbox and inputs */}
                <div className="space-y-3 bg-white/5 p-3 rounded-2xl border border-white/5">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isInstallment}
                      onChange={e => setIsInstallment(e.target.checked)}
                      className="rounded border-outline-variant/60 text-brand-primary focus:ring-0 cursor-pointer w-4 h-4 bg-bg-base"
                      id="checkbox-launch-is-installment"
                    />
                    <span className="text-xs font-bold text-white uppercase tracking-wider select-none">Parcelado?</span>
                  </label>

                  {isInstallment && (
                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div className="space-y-1.5">
                        <label className="block text-[9px] uppercase tracking-wider text-text-muted font-bold">Total de parcelas</label>
                        <input
                          type="number"
                          min="1"
                          placeholder="Ex: 10"
                          value={installmentsCount !== undefined ? installmentsCount : ''}
                          onChange={e => {
                            const val = parseInt(e.target.value, 10);
                            setInstallmentsCount(isNaN(val) ? undefined : val);
                          }}
                          className="w-full bg-bg-base border border-outline-variant/60 rounded-lg px-2.5 py-1.5 text-text-high text-xs font-medium focus:outline-none focus:border-brand-primary"
                          required={isInstallment}
                          id="input-launch-total-installments"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-[9px] uppercase tracking-wider text-text-muted font-bold">Parcela inicial</label>
                        <input
                          type="number"
                          min="1"
                          max={installmentsCount}
                          placeholder="Ex: 1"
                          value={currentInstallment !== undefined ? currentInstallment : ''}
                          onChange={e => {
                            const val = parseInt(e.target.value, 10);
                            setCurrentInstallment(isNaN(val) ? undefined : val);
                          }}
                          className="w-full bg-bg-base border border-outline-variant/60 rounded-lg px-2.5 py-1.5 text-text-high text-xs font-medium focus:outline-none focus:border-brand-primary"
                          required={isInstallment}
                          id="input-launch-current-installment"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Buttons */}
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsLaunchModalOpen(false)}
                    className="w-1/2 border border-outline-variant/40 text-text-high hover:bg-white/5 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    id="btn-cancel-launch-modal"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="w-1/2 bg-brand-primary text-black hover:bg-brand-accent py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
                    id="btn-submit-launch-modal"
                  >
                    Salvar
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 6. DELETE CARD CONFIRMATION MODAL */}
      <AnimatePresence>
        {cardToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm shadow-2xl" id="delete-card-modal-overlay">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-bg-surface-low border border-rose-500/30 rounded-3xl p-6 w-full max-w-sm space-y-5 relative"
              id="delete-card-modal-content"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 bg-rose-500/10 text-rose-400 rounded-full mt-0.5">
                  <AlertCircle size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-white">Excluir Cartão?</h3>
                  <p className="text-[11px] text-text-muted mt-2 leading-relaxed">
                    Tem certeza que deseja remover o cartão <span className="text-purple-300 font-bold">"{cardToDelete.name}"</span> deste mês?
                  </p>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCardToDelete(null)}
                  className="w-1/2 border border-outline-variant/40 text-text-high hover:bg-white/5 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  id="btn-cancel-delete-card"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDeleteCard}
                  className="w-1/2 bg-rose-500 text-white hover:bg-rose-600 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  id="btn-confirm-delete-card-action"
                >
                  Excluir
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 7. TEMPORARY PAYMENT POPUP MODAL */}
      <AnimatePresence>
        {isPaymentPopupOpen && paymentPopupMonth && (() => {
          const popupCalculations = getMonthCalculations(paymentPopupMonth);
          const monthlyEntries = planEntries.filter(entry => entry.month === paymentPopupMonth);
          const visibleCards = planCards.filter(card => {
            const isExcluded = card.excludedMonths?.includes(paymentPopupMonth);
            if (isExcluded) return false;
            if (card.months !== undefined) {
              return card.months.includes(paymentPopupMonth);
            }
            return true;
          });
          const activeEntries = monthlyEntries.filter(entry => entry.category !== 'cartoes' || !entry.cardId || visibleCards.some(vc => vc.id === entry.cardId));

          // Define Grouped List Item interface
          interface PopupListItem {
            type: 'individual' | 'card_grouped';
            id: string;
            cardId?: string;
            name: string;
            amount: number;
            isIncome: boolean;
            category: string;
            subcategory: string;
            badgeColor: string;
            originName: string;
            entryIds: string[];
          }

          const groupedItems: PopupListItem[] = [];
          const processedEntryIds = new Set<string>();

          const createIndividualItem = (entry: PlanEntry): PopupListItem => {
            let badgeColor = 'bg-rose-500/10 text-rose-400 border-rose-500/20';
            let originName = entry.subcategory;

            if (entry.category === 'contas') {
              badgeColor = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
              const acc = accounts.find(a => a.id === entry.accountId);
              originName = acc ? acc.name : entry.subcategory;
            }

            return {
              type: 'individual',
              id: entry.id,
              name: entry.name,
              amount: entry.amount,
              isIncome: entry.type === 'income',
              category: entry.category,
              subcategory: entry.subcategory,
              badgeColor,
              originName,
              entryIds: [entry.id],
            };
          };

          // 1. GASTOS ordered identically to PLAN: CASA, FIXOS, GERAL, then any remaining
          const gastosEntries = activeEntries.filter(entry => entry.category === 'gastos');
          const standardGastosSubcategories = ['CASA', 'FIXOS', 'GERAL'];

          standardGastosSubcategories.forEach(subKey => {
            const subEntries = gastosEntries.filter(e => e.subcategory === subKey);
            subEntries.forEach(entry => {
              groupedItems.push(createIndividualItem(entry));
              processedEntryIds.add(entry.id);
            });
          });

          gastosEntries.forEach(entry => {
            if (!processedEntryIds.has(entry.id)) {
              groupedItems.push(createIndividualItem(entry));
              processedEntryIds.add(entry.id);
            }
          });

          // 2. CARTÕES ordered identically to visibleCards in PLAN
          const cardEntries = activeEntries.filter(entry => entry.category === 'cartoes' && entry.cardId);

          visibleCards.forEach(card => {
            const entriesOfCard = cardEntries.filter(entry => entry.cardId === card.id);
            if (entriesOfCard.length > 0) {
              const netSum = entriesOfCard.reduce((sum, entry) => sum + (entry.type === 'income' ? -entry.amount : entry.amount), 0);
              const entryIds = entriesOfCard.map(e => e.id);
              entryIds.forEach(id => processedEntryIds.add(id));

              groupedItems.push({
                type: 'card_grouped',
                id: `card-${card.id}`,
                cardId: card.id,
                name: card.name,
                amount: Math.abs(netSum),
                isIncome: netSum < 0,
                category: 'cartoes',
                subcategory: 'CARTÃO',
                badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
                originName: 'Fatura Mensal',
                entryIds,
              });
            }
          });

          // Any other card entries not matched with visibleCards
          const otherCardEntries = activeEntries.filter(entry => entry.category === 'cartoes' && !processedEntryIds.has(entry.id));
          otherCardEntries.forEach(entry => {
            groupedItems.push(createIndividualItem(entry));
            processedEntryIds.add(entry.id);
          });

          // 3. CONTAS ordered identically to accounts in PLAN
          const contasEntries = activeEntries.filter(entry => entry.category === 'contas');

          accounts.forEach(account => {
            const accEntries = contasEntries.filter(e => e.accountId === account.id);
            accEntries.forEach(entry => {
              groupedItems.push(createIndividualItem(entry));
              processedEntryIds.add(entry.id);
            });
          });

          // Any remaining contas entries (unmatched account)
          contasEntries.forEach(entry => {
            if (!processedEntryIds.has(entry.id)) {
              groupedItems.push(createIndividualItem(entry));
              processedEntryIds.add(entry.id);
            }
          });

          // Fallback: any other activeEntries not yet processed
          activeEntries.forEach(entry => {
            if (!processedEntryIds.has(entry.id)) {
              groupedItems.push(createIndividualItem(entry));
              processedEntryIds.add(entry.id);
            }
          });

          const selectedSum = activeEntries
            .filter(e => selectedEntryIds.includes(e.id))
            .reduce((sum, e) => sum + (e.type === 'income' ? e.amount : -e.amount), 0);

          const selectedGroupedCount = groupedItems.filter(item => item.entryIds.every(id => selectedEntryIds.includes(id))).length;

          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm shadow-2xl" id="payment-popup-overlay">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-bg-surface-low border border-outline-variant/60 rounded-3xl p-6 w-full max-w-xl max-h-[85vh] flex flex-col relative space-y-4 shadow-2xl text-left"
                id="payment-popup-content"
              >
                {/* Header */}
                <div className="flex justify-between items-start border-b border-outline-variant/30 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-black uppercase tracking-wider text-white">
                        PAGAMENTO
                      </h3>
                      {activeEntries.length > 0 && activeEntries.every(entry => paidEntryIds.includes(entry.id)) && (
                        <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider animate-pulse shrink-0">
                          Concluído!
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-brand-primary mt-0.5 uppercase tracking-wide font-bold">
                      Mês Ativo: {formatMonthName(paymentPopupMonth)}
                    </p>
                  </div>
                  <button
                    onClick={() => setIsPaymentPopupOpen(false)}
                    className="text-text-muted hover:text-white p-1 rounded-full hover:bg-white/5 cursor-pointer"
                    id="btn-close-payment-popup"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Checklist Content */}
                <div 
                  className="flex-1 overflow-y-auto pr-1.5 space-y-2 min-h-[220px] max-h-[380px] [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-white/20" 
                  id="payment-popup-list-container"
                >
                  {groupedItems.length === 0 ? (
                    <div className="text-center py-10 text-text-muted text-xs">
                      Nenhum lançamento planejado para este mês.
                    </div>
                  ) : (
                    groupedItems.map(item => {
                      const isSelected = item.entryIds.every(id => selectedEntryIds.includes(id));
                      const isPaid = item.entryIds.every(id => paidEntryIds.includes(id));

                      return (
                        <div
                          key={item.id}
                          className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                            isPaid 
                              ? 'bg-black/30 border-white/5 opacity-50' 
                              : isSelected
                              ? 'bg-brand-primary/10 border-brand-primary/35'
                              : 'bg-white/5 border-white/5 hover:border-white/10'
                          }`}
                          id={`payment-row-${item.id}`}
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            {/* Sleek Custom Checkbox for selection (sum) */}
                            <button
                              onClick={() => {
                                if (isSelected) {
                                  setSelectedEntryIds(prev => prev.filter(id => !item.entryIds.includes(id)));
                                } else {
                                  setSelectedEntryIds(prev => {
                                    const filtered = prev.filter(id => !item.entryIds.includes(id));
                                    return [...filtered, ...item.entryIds];
                                  });
                                }
                              }}
                              className={`w-4 h-4 rounded flex items-center justify-center transition-all border cursor-pointer focus:outline-none ${
                                isSelected 
                                  ? 'bg-brand-primary border-brand-primary text-black' 
                                  : 'bg-black/40 border-white/20 hover:border-brand-primary/60 text-transparent'
                              }`}
                              title="Selecionar para somatório"
                              id={`check-select-${item.id}`}
                            >
                              {isSelected && (
                                <svg className="w-2.5 h-2.5 stroke-[3.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                </svg>
                              )}
                            </button>

                            {/* Entry Details */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className={`text-xs font-bold text-text-high truncate ${isPaid ? 'line-through decoration-rose-500/80 text-text-muted' : ''}`}>
                                  {item.name}
                                </span>
                                {item.isIncome && (
                                  <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase tracking-wider">
                                    Receita
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1.5 mt-1 text-[9px] uppercase tracking-wider text-text-muted font-semibold flex-wrap">
                                <span className={`px-1.5 py-0.5 rounded-full border ${item.badgeColor}`}>
                                  {item.category === 'cartoes' ? 'Cartões' : item.category === 'contas' ? 'Contas' : 'Gastos'}
                                </span>
                                <span className="text-text-muted/60">•</span>
                                <span className="truncate max-w-[150px]">{item.originName}</span>
                              </div>
                            </div>
                          </div>

                          {/* Right Side: Value & Custom Mark as Paid pill */}
                          <div className="flex items-center gap-4">
                            <span className={`text-xs font-mono font-bold whitespace-nowrap ${
                              isPaid 
                                ? 'line-through decoration-rose-500/80 text-text-muted/50' 
                                : item.isIncome 
                                ? 'text-emerald-400' 
                                : 'text-rose-400'
                            }`}>
                              {item.isIncome ? '+' : '-'} {formatBRL(item.amount)}
                            </span>

                            {/* Sleek Custom Button for Paid toggle */}
                            <button
                              onClick={() => {
                                if (isPaid) {
                                  setPaidEntryIds(prev => prev.filter(id => !item.entryIds.includes(id)));
                                  setPlanEntries(prev => prev.map(entry => {
                                    if (item.entryIds.includes(entry.id)) {
                                      return { ...entry, paid: false };
                                    }
                                    return entry;
                                  }));
                                } else {
                                  setPaidEntryIds(prev => {
                                    const filtered = prev.filter(id => !item.entryIds.includes(id));
                                    return [...filtered, ...item.entryIds];
                                  });
                                  setPlanEntries(prev => prev.map(entry => {
                                    if (item.entryIds.includes(entry.id)) {
                                      return { ...entry, paid: true };
                                    }
                                    return entry;
                                  }));
                                  // Automatically uncheck from selection (somatório) when marked as paid
                                  setSelectedEntryIds(prev => prev.filter(id => !item.entryIds.includes(id)));
                                }
                              }}
                              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border transition-all duration-200 text-left focus:outline-none cursor-pointer ${
                                isPaid 
                                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-sm shadow-emerald-500/5' 
                                  : 'bg-white/5 border-white/10 text-text-muted hover:border-white/20 hover:bg-white/10'
                              }`}
                              title="Marcar como Pago"
                              id={`check-paid-${item.id}`}
                            >
                              <div className={`w-2.5 h-2.5 rounded-full flex items-center justify-center border transition-all ${
                                isPaid ? 'bg-emerald-400 border-emerald-400' : 'border-white/30'
                              }`}>
                                {isPaid && (
                                  <div className="w-1 h-1 rounded-full bg-black" />
                                )}
                              </div>
                              <span className="text-[9px] font-bold uppercase tracking-wider">
                                Pago
                              </span>
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Compact Calculation / Footer Section */}
                <div className="bg-black/30 border border-outline-variant/30 rounded-2xl p-3 flex flex-col sm:flex-row items-center justify-between gap-2 shadow-inner" id="payment-popup-footer">
                  <div className="flex flex-col text-center sm:text-left">
                    <span className="text-[9px] text-text-muted uppercase tracking-wider font-bold">
                      Somatório dos Itens Selecionados ({selectedGroupedCount})
                    </span>
                    <span className="text-xs font-mono font-bold text-white mt-0.5">
                      Total: <span className="text-brand-primary">{formatBRL(selectedSum)}</span>
                    </span>
                  </div>

                  <div className="flex gap-1.5 w-full sm:w-auto justify-end">
                    <button
                      onClick={() => {
                        setSelectedEntryIds([]);
                        setPaidEntryIds([]);
                        if (paymentPopupMonth) {
                          setPlanEntries(prev => prev.map(entry => {
                            if (entry.month === paymentPopupMonth) {
                              return { ...entry, paid: false };
                            }
                            return entry;
                          }));
                        }
                      }}
                      className="px-2.5 py-1.5 rounded-xl text-[10px] font-bold border border-white/10 hover:bg-white/5 text-text-muted hover:text-white transition-colors cursor-pointer"
                      id="btn-payment-popup-reset"
                    >
                      Limpar
                    </button>
                    <button
                      onClick={() => setIsPaymentPopupOpen(false)}
                      className="px-3 py-1.5 rounded-xl text-[10px] font-bold bg-brand-primary text-black hover:bg-brand-accent transition-all cursor-pointer"
                      id="btn-payment-popup-done"
                    >
                      Fechar
                    </button>
                  </div>
                </div>

              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>

    </div>
  );
}
