'use client';

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { demoGoals, demoTransactions } from '@/lib/demo-data';
import { loadLocal, saveLocal } from '@/lib/storage';
import { supabase } from '@/lib/auth';
import { useAuth } from './AuthProvider';
import type { Goal, Transaction } from '@/lib/types';

type FinanceContextValue = {
  transactions: Transaction[];
  goals: Goal[];
  addTransaction: (
    t: Omit<Transaction, 'id' | 'user_id'>
  ) => Promise<boolean>;
  deleteTransaction: (id: string) => Promise<void>;
  addGoal: (g: Omit<Goal, 'id' | 'user_id'>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  updateGoal: (
    id: string,
    patch: Partial<Goal>
  ) => Promise<void>;
};

const FinanceContext = createContext<FinanceContextValue | null>(null);

export function FinanceProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);

  useEffect(() => {
    let cancelled = false;

    if (!user) {
      setTransactions([]);
      setGoals([]);
      return;
    }

    if (!supabase) {
      setTransactions(
        loadLocal('transactions', demoTransactions, user.id)
      );
      setGoals(loadLocal('goals', demoGoals, user.id));

      return () => {
        cancelled = true;
      };
    }

    Promise.all([
      supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false }),

      supabase
        .from('goals')
        .select('*')
        .order('created_at', { ascending: false }),
    ]).then(([tx, gs]) => {
      if (cancelled) return;

      setTransactions(
        !tx.error && tx.data
          ? (tx.data as Transaction[])
          : []
      );

      setGoals(
        !gs.error && gs.data
          ? (gs.data as Goal[])
          : []
      );
    });

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const value = useMemo<FinanceContextValue>(
    () => ({
      transactions,
      goals,

      addTransaction: async (input) => {
        const currentUser = user;

        if (!currentUser) {
          return false;
        }

        const optimisticId = crypto.randomUUID();

        const optimistic: Transaction = {
          ...input,
          id: optimisticId,
          user_id: currentUser.id,
        };

        /*
         * Local/demo mode
         */
        if (!supabase) {
          setTransactions((prev) => {
            const next = [optimistic, ...prev];

            saveLocal(
              'transactions',
              next,
              currentUser.id
            );

            return next;
          });

          return true;
        }

        /*
         * Supabase mode
         */
        const { data, error } = await supabase
          .from('transactions')
          .insert({
            ...input,
            user_id: currentUser.id,
          })
          .select('*')
          .single();

        if (error || !data) {
          return false;
        }

        setTransactions((prev) => [
          data as Transaction,
          ...prev,
        ]);

        return true;
      },

      deleteTransaction: async (id) => {
        const currentUser = user;

        if (!currentUser) {
          return;
        }

        const previous = transactions;

        /*
         * Optimistic UI update
         */
        const nextTransactions = previous.filter(
          (transaction) => transaction.id !== id
        );

        setTransactions(nextTransactions);

        /*
         * Local/demo mode
         */
        if (!supabase) {
          saveLocal(
            'transactions',
            nextTransactions,
            currentUser.id
          );

          return;
        }

        /*
         * Supabase mode
         */
        const { error } = await supabase
          .from('transactions')
          .delete()
          .eq('id', id)
          .eq('user_id', currentUser.id);

        if (error) {
          setTransactions(previous);
        }
      },

      addGoal: async (input) => {
        const currentUser = user;

        if (!currentUser) {
          return;
        }

        /*
         * Local/demo mode
         */
        if (!supabase) {
          const goal: Goal = {
            ...input,
            id: crypto.randomUUID(),
            user_id: currentUser.id,
          };

          setGoals((prev) => {
            const next = [goal, ...prev];

            saveLocal(
              'goals',
              next,
              currentUser.id
            );

            return next;
          });

          return;
        }

        /*
         * Supabase mode
         */
        const { data, error } = await supabase
          .from('goals')
          .insert({
            ...input,
            user_id: currentUser.id,
          })
          .select('*')
          .single();

        if (!error && data) {
          setGoals((prev) => [
            data as Goal,
            ...prev,
          ]);
        }
      },

      deleteGoal: async (id) => {
        const currentUser = user;

        if (!currentUser) {
          return;
        }

        const previous = goals;

        /*
         * Optimistic UI update
         */
        const nextGoals = previous.filter(
          (goal) => goal.id !== id
        );

        setGoals(nextGoals);

        /*
         * Local/demo mode
         */
        if (!supabase) {
          saveLocal(
            'goals',
            nextGoals,
            currentUser.id
          );

          return;
        }

        /*
         * Supabase mode
         */
        const { error } = await supabase
          .from('goals')
          .delete()
          .eq('id', id)
          .eq('user_id', currentUser.id);

        if (error) {
          setGoals(previous);
        }
      },

      updateGoal: async (id, patch) => {
        const currentUser = user;

        if (!currentUser) {
          return;
        }

        const previous = goals;

        const nextGoals = previous.map((goal) =>
          goal.id === id
            ? { ...goal, ...patch }
            : goal
        );

        /*
         * Optimistic UI update
         */
        setGoals(nextGoals);

        /*
         * Local/demo mode
         */
        if (!supabase) {
          saveLocal(
            'goals',
            nextGoals,
            currentUser.id
          );

          return;
        }

        /*
         * Supabase mode
         */
        const { error } = await supabase
          .from('goals')
          .update(patch)
          .eq('id', id)
          .eq('user_id', currentUser.id);

        if (error) {
          setGoals(previous);
        }
      },
    }),
    [transactions, goals, user]
  );

  return (
    <FinanceContext.Provider value={value}>
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  const ctx = useContext(FinanceContext);

  if (!ctx) {
    throw new Error(
      'useFinance must be used inside FinanceProvider'
    );
  }

  return ctx;
}
