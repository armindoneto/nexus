/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, DollarSign, Calendar, Clock, CreditCard, Tag, AlertCircle } from 'lucide-react';
import { Transaction } from '../types';
import { CATEGORIES_WITH_ICONS, AVAILABLE_ACCOUNTS } from '../data';

interface TransactionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transaction: Omit<Transaction, 'id'> & { id?: string }) => void;
  initialTransaction?: Transaction | null;
}

export default function TransactionForm({
  isOpen,
  onClose,
  onSave,
  initialTransaction
}: TransactionFormProps) {
  const [description, setDescription] = useState('');
  const [amountStr, setAmountStr] = useState('');
  const [type, setType] = useState<'income' | 'outcome'>('outcome');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [account, setAccount] = useState('');
  const [category, setCategory] = useState('');
  const [error, setError] = useState('');

  // Auto-fill form when editing
  useEffect(() => {
    if (initialTransaction) {
      setDescription(initialTransaction.description);
      setAmountStr(Math.abs(initialTransaction.amount).toFixed(2));
      setType(initialTransaction.amount >= 0 ? 'income' : 'outcome');
      setDate(initialTransaction.date);
      setTime(initialTransaction.time);
      setAccount(initialTransaction.account);
      setCategory(initialTransaction.category);
    } else {
      // Defaults for a new transaction
      setDescription('');
      setAmountStr('');
      setType('outcome');
      
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      setDate(`${yyyy}-${mm}-${dd}`);
      
      const hh = String(today.getHours()).padStart(2, '0');
      const min = String(today.getMinutes()).padStart(2, '0');
      setTime(`${hh}:${min}`);
      
      setAccount(AVAILABLE_ACCOUNTS[0]);
      setCategory(CATEGORIES_WITH_ICONS[0].name);
    }
    setError('');
  }, [initialTransaction, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!description.trim()) {
      setError('Por favor, informe a descrição.');
      return;
    }

    const numericAmount = parseFloat(amountStr.replace(',', '.'));
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setError('Por favor, insira um valor válido maior que zero.');
      return;
    }

    const finalAmount = type === 'income' ? numericAmount : -numericAmount;

    onSave({
      id: initialTransaction?.id,
      description: description.trim(),
      amount: finalAmount,
      date,
      time,
      account,
      category,
      status: 'processado'
    });

    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            id="backdrop"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 30 }}
            transition={{ type: 'spring', duration: 0.4 }}
            className="fixed inset-x-4 bottom-4 md:inset-auto md:w-full md:max-w-lg bg-bg-surface-low rounded-2xl border border-outline-variant p-6 z-50 overflow-y-auto max-h-[90vh] custom-scrollbar gold-glow"
            id="transaction-form-modal"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-outline-variant pb-4 mb-6">
              <h2 className="font-display text-xl font-bold text-text-high">
                {initialTransaction ? 'Editar Lançamento' : 'Novo Lançamento'}
              </h2>
              <button
                onClick={onClose}
                className="text-text-muted hover:text-text-high p-1 rounded-lg transition-colors cursor-pointer"
                id="close-button"
              >
                <X size={20} />
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 flex items-center gap-3 mb-4 text-xs text-red-400">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5" id="transaction-form">
              {/* Type Toggle */}
              <div className="grid grid-cols-2 gap-3 bg-bg-base p-1.5 rounded-xl border border-outline-variant">
                <button
                  type="button"
                  onClick={() => setType('outcome')}
                  className={`py-2.5 rounded-lg text-xs font-semibold tracking-wider uppercase transition-all cursor-pointer ${
                    type === 'outcome'
                      ? 'bg-transparent text-brand-primary border border-brand-primary/40'
                      : 'text-text-muted hover:text-text-high'
                  }`}
                  id="type-outcome-btn"
                >
                  Despesa (Débito)
                </button>
                <button
                  type="button"
                  onClick={() => setType('income')}
                  className={`py-2.5 rounded-lg text-xs font-semibold tracking-wider uppercase transition-all cursor-pointer ${
                    type === 'income'
                      ? 'bg-brand-primary text-black font-bold'
                      : 'text-text-muted hover:text-text-high'
                  }`}
                  id="type-income-btn"
                >
                  Receita (Crédito)
                </button>
              </div>

              {/* Amount Input */}
              <div className="space-y-1.5">
                <label className="block text-[11px] uppercase tracking-wider text-text-muted font-semibold">
                  Valor (R$)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-brand-primary font-bold">
                    R$
                  </div>
                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder="0,00"
                    value={amountStr}
                    onChange={(e) => {
                      const val = e.target.value;
                      const digits = val.replace(/\D/g, '');
                      if (!digits) {
                        setAmountStr('');
                        return;
                      }
                      if (digits.length < 3) {
                        const parsedNum = parseInt(digits, 10);
                        setAmountStr(isNaN(parsedNum) ? '' : String(parsedNum));
                      } else {
                        const cents = digits.slice(-2);
                        const whole = digits.slice(0, -2);
                        const parsedWhole = parseInt(whole, 10);
                        const formattedWhole = isNaN(parsedWhole) ? '0' : String(parsedWhole);
                        setAmountStr(`${formattedWhole},${cents}`);
                      }
                    }}
                    className="w-full bg-bg-base border border-outline-variant rounded-xl pl-12 pr-4 py-3 placeholder:text-text-muted text-text-high font-bold text-lg focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20 transition-all"
                    id="amount-input"
                  />
                </div>
              </div>

              {/* Description Input */}
              <div className="space-y-1.5">
                <label className="block text-[11px] uppercase tracking-wider text-text-muted font-semibold">
                  Descrição
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-text-muted">
                    <DollarSign size={16} />
                  </div>
                  <input
                    type="text"
                    placeholder=""
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-bg-base border border-outline-variant rounded-xl pl-12 pr-4 py-2.5 placeholder:text-text-muted text-text-high focus:outline-none focus:border-brand-primary transition-all"
                    id="description-input"
                  />
                </div>
              </div>

              {/* Account selection (full width now that Category is removed) */}
              <div className="space-y-1.5">
                <label className="block text-[11px] uppercase tracking-wider text-text-muted font-semibold">
                  Conta
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-text-muted">
                    <CreditCard size={15} />
                  </div>
                  <select
                    value={account}
                    onChange={(e) => setAccount(e.target.value)}
                    className="w-full bg-bg-base border border-outline-variant rounded-xl pl-10 pr-3 py-2.5 text-xs text-text-high focus:outline-none focus:border-brand-primary transition-all appearance-none cursor-pointer"
                    id="account-select"
                  >
                    {AVAILABLE_ACCOUNTS.map((accName) => (
                      <option key={accName} value={accName} className="bg-bg-surface-low">
                        {accName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Date selection (full width now that time/hour is removed) */}
              <div className="space-y-1.5">
                <label className="block text-[11px] uppercase tracking-wider text-text-muted font-semibold">
                  Data
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-text-muted">
                    <Calendar size={15} />
                  </div>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    onClick={(e) => {
                      try {
                        e.currentTarget.showPicker();
                      } catch (_) {}
                    }}
                    onFocus={(e) => {
                      try {
                        e.currentTarget.showPicker();
                      } catch (_) {}
                    }}
                    className="w-full bg-bg-base border border-outline-variant rounded-xl pl-10 pr-3 py-2 text-xs text-text-high focus:outline-none focus:border-brand-primary transition-all cursor-pointer"
                    id="date-input"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 border-t border-outline-variant pt-5 mt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 bg-transparent hover:bg-bg-base text-text-muted hover:text-text-high border border-outline-variant py-2.5 rounded-xl transition-all font-semibold text-xs cursor-pointer text-center"
                  id="cancel-submit-btn"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-brand-primary hover:bg-brand-accent text-black font-bold py-2.5 rounded-xl transition-all text-xs cursor-pointer text-center"
                  id="save-submit-btn"
                >
                  Salvar Lançamento
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
