import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from './authStore';

// Database types mapping to frontend types
export interface Account {
  id: string;
  name: string;
  balance: number;
  type: 'checking' | 'savings' | 'credit';
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  date: string;
  categoryId: string;
  accountId: string;
  type: 'income' | 'expense';
  paymentType?: 'single' | 'monthly' | 'recurring';
}

export interface Category {
  id: string;
  name: string;
  color: string;
  type: 'income' | 'expense';
}

export interface SpecialDate {
  id: string;
  name: string;
  date: string;
  description?: string;
  isRecurring?: boolean;
  isCompleted?: boolean;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  createdAt: string;
  targetDate?: string | null;
}

export interface SavingsMovement {
  id: string;
  goalId: string;
  accountId: string;
  type: 'deposit' | 'withdraw';
  amount: number;
  date: string;
  note?: string;
  createdAt: string;
}

export interface WeeklyGoal {
  id: string;
  year: number;
  month: number;
  categoryId: string;
  weeklyAmounts: (number | undefined)[];
  monthlyAmount?: number;
}

export interface MonthlyNote {
  id: string;
  year: number;
  month: number;
  content: string;
}

interface FinanceState {
  accounts: Account[];
  transactions: Transaction[];
  categories: Category[];
  specialDates: SpecialDate[];
  savingsGoals: SavingsGoal[];
  savingsMovements: SavingsMovement[];
  weeklyGoals: WeeklyGoal[];
  monthlyNotes: MonthlyNote[];
  isLoading: boolean;

  // Data loading
  loadUserData: () => Promise<void>;
  
  // Account methods
  addAccount: (account: Omit<Account, 'id'>) => Promise<void>;
  updateAccount: (id: string, account: Partial<Account>) => Promise<void>;
  removeAccount: (id: string) => Promise<void>;
  
  // Transaction methods
  addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<void>;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => Promise<void>;
  removeTransaction: (id: string) => Promise<void>;
  
  // Category methods
  addCategory: (category: Omit<Category, 'id'>) => Promise<void>;
  updateCategory: (id: string, category: Partial<Category>) => Promise<void>;
  removeCategory: (id: string) => Promise<void>;
  
  // Special dates methods
  addSpecialDate: (date: Omit<SpecialDate, 'id'>) => Promise<void>;
  updateSpecialDate: (id: string, date: Partial<SpecialDate>) => Promise<void>;
  removeSpecialDate: (id: string) => Promise<void>;
  
  // Savings goals methods
  addSavingsGoal: (goal: Omit<SavingsGoal, 'id'>) => Promise<void>;
  updateSavingsGoal: (id: string, goal: Partial<SavingsGoal>) => Promise<void>;
  removeSavingsGoal: (id: string) => Promise<void>;
  
  // Savings movements methods
  addSavingsMovement: (movement: Omit<SavingsMovement, 'id' | 'createdAt'>) => Promise<void>;
  updateSavingsMovement: (id: string, movement: Partial<SavingsMovement>) => Promise<void>;
  removeSavingsMovement: (id: string) => Promise<void>;
  getSavingsMovementsByGoal: (goalId: string) => SavingsMovement[];

  // Weekly goals methods
  setWeeklyGoal: (goal: Omit<WeeklyGoal, 'id'>) => Promise<void>;

  // Monthly notes methods
  setMonthlyNote: (note: Omit<MonthlyNote, 'id'>) => Promise<void>;
  
  // Getters
  getTotalBalance: () => number;
  getTotalIncome: (month?: number, year?: number) => number;
  getTotalExpenses: (month?: number, year?: number) => number;
}

const initialCategories: Category[] = [
  { id: '1', name: 'Alimentação', color: '#ef4444', type: 'expense' },
  { id: '2', name: 'Transporte', color: '#f97316', type: 'expense' },
  { id: '3', name: 'Moradia', color: '#eab308', type: 'expense' },
  { id: '4', name: 'Salário', color: '#22c55e', type: 'income' },
  { id: '5', name: 'Freelance', color: '#10b981', type: 'income' },
];

export const useFinanceStore = create<FinanceState>()(
  persist(
    (set, get) => ({
      accounts: [],
      transactions: [],
      categories: [],
      specialDates: [],
      savingsGoals: [],
      savingsMovements: [],
      weeklyGoals: [],
      monthlyNotes: [],
      isLoading: false,

      loadUserData: async () => {
        const { user } = useAuthStore.getState();
        if (!user) return;

        set({ isLoading: true });

        try {
          // Load all user data in parallel
          const [
            accountsResult,
            categoriesResult,
            transactionsResult,
            specialDatesResult,
            savingsGoalsResult,
            savingsMovementsResult,
            weeklyGoalsResult,
            monthlyNotesResult
          ] = await Promise.all([
            supabase.from('accounts').select('*').eq('user_id', user.id),
            supabase.from('categories').select('*').eq('user_id', user.id),
            supabase.from('transactions').select('*').eq('user_id', user.id),
            supabase.from('special_dates').select('*').eq('user_id', user.id),
            supabase.from('savings_goals').select('*').eq('user_id', user.id),
            supabase.from('savings_movements').select('*').eq('user_id', user.id).order('date', { ascending: false }),
            supabase.from('weekly_goals').select('*').eq('user_id', user.id),
            supabase.from('monthly_notes').select('*').eq('user_id', user.id)
          ]);

          // Map database results to frontend types
          const accounts = accountsResult.data?.map(acc => ({
            id: acc.id,
            name: acc.name,
            balance: Number(acc.balance),
            type: acc.type as 'checking' | 'savings' | 'credit'
          })) || [];

          const categories = categoriesResult.data?.map(cat => ({
            id: cat.id,
            name: cat.name,
            color: cat.color,
            type: cat.type as 'income' | 'expense'
          })) || [];

          // If no categories exist, create default ones
          if (categories.length === 0) {
            for (const category of initialCategories) {
              await supabase.from('categories').insert({
                user_id: user.id,
                name: category.name,
                color: category.color,
                type: category.type
              });
            }
            // Reload categories
            const newCategoriesResult = await supabase.from('categories').select('*').eq('user_id', user.id);
            categories.push(...(newCategoriesResult.data?.map(cat => ({
              id: cat.id,
              name: cat.name,
              color: cat.color,
              type: cat.type as 'income' | 'expense'
            })) || []));
          }

          const transactions = transactionsResult.data?.map(tx => ({
            id: tx.id,
            description: tx.description,
            amount: Number(tx.amount),
            date: new Date(tx.date).toISOString().split('T')[0], // Convert timestamp to date string
            categoryId: tx.category_id,
            accountId: tx.account_id,
            type: tx.type as 'income' | 'expense',
            paymentType: tx.payment_type as 'single' | 'monthly' | 'recurring' | undefined
          })) || [];

          const specialDates = specialDatesResult.data?.map(sd => ({
            id: sd.id,
            name: sd.name,
            date: sd.date,
            description: sd.description || undefined,
            isRecurring: sd.is_recurring,
            isCompleted: sd.is_completed
          })) || [];

          const savingsGoals = savingsGoalsResult.data?.map(sg => ({
            id: sg.id,
            name: sg.name,
            targetAmount: Number(sg.target_amount),
            currentAmount: Number(sg.current_amount),
            createdAt: sg.created_at,
            targetDate: sg.target_date || null
          })) || [];

          const savingsMovements = savingsMovementsResult.data?.map(sm => ({
            id: sm.id,
            goalId: sm.goal_id,
            accountId: sm.account_id,
            type: sm.type as 'deposit' | 'withdraw',
            amount: Number(sm.amount),
            date: new Date(sm.date).toISOString(),
            note: sm.note || undefined,
            createdAt: sm.created_at
          })) || [];

          const weeklyGoals = weeklyGoalsResult.data?.map(wg => ({
            id: wg.id,
            year: wg.year,
            month: wg.month,
            categoryId: wg.category_id,
            weeklyAmounts: wg.weekly_amounts || [],
            monthlyAmount: wg.monthly_amount ? Number(wg.monthly_amount) : undefined
          })) || [];

          const monthlyNotes = monthlyNotesResult.data?.map(mn => ({
            id: mn.id,
            year: mn.year,
            month: mn.month,
            content: mn.content
          })) || [];

          set({
            accounts,
            categories,
            transactions,
            specialDates,
            savingsGoals,
            savingsMovements,
            weeklyGoals,
            monthlyNotes,
            isLoading: false
          });

        } catch (error) {
          console.error('Error loading user data:', error);
          set({ isLoading: false });
        }
      },
      
      // Account methods
      addAccount: async (account) => {
        const { user } = useAuthStore.getState();
        if (!user) return;

        const { data, error } = await supabase
          .from('accounts')
          .insert({
            user_id: user.id,
            name: account.name,
            balance: account.balance,
            type: account.type
          })
          .select()
          .single();

        if (!error && data) {
          const newAccount = {
            id: data.id,
            name: data.name,
            balance: Number(data.balance),
            type: data.type as 'checking' | 'savings' | 'credit'
          };
          set(state => ({ accounts: [...state.accounts, newAccount] }));
        }
      },

      updateAccount: async (id, account) => {
        const { error } = await supabase
          .from('accounts')
          .update({
            name: account.name,
            balance: account.balance,
            type: account.type
          })
          .eq('id', id);

        if (!error) {
          set(state => ({
            accounts: state.accounts.map(acc =>
              acc.id === id ? { ...acc, ...account } : acc
            )
          }));
        }
      },

      removeAccount: async (id) => {
        const { error } = await supabase
          .from('accounts')
          .delete()
          .eq('id', id);

        if (!error) {
          set(state => ({
            accounts: state.accounts.filter(acc => acc.id !== id)
          }));
        }
      },
      
      // Transaction methods
      addTransaction: async (transaction) => {
        const { user } = useAuthStore.getState();
        if (!user) return;

        const { data, error } = await supabase
          .from('transactions')
          .insert({
            user_id: user.id,
            description: transaction.description,
            amount: transaction.amount,
            date: transaction.date,
            category_id: transaction.categoryId,
            account_id: transaction.accountId,
            type: transaction.type,
            payment_type: transaction.paymentType
          })
          .select()
          .single();

        if (!error && data) {
          const newTransaction = {
            id: data.id,
            description: data.description,
            amount: Number(data.amount),
            date: new Date(data.date).toISOString().split('T')[0], // Convert timestamp to date string
            categoryId: data.category_id,
            accountId: data.account_id,
            type: data.type as 'income' | 'expense',
            paymentType: data.payment_type as 'single' | 'monthly' | 'recurring' | undefined
          };

          // Update account balance  
          const balanceChange = transaction.type === 'income' ? transaction.amount : -transaction.amount;
          
          // Get current account balance
          const { accounts } = get();
          const account = accounts.find(acc => acc.id === transaction.accountId);
          if (account) {
            const newBalance = account.balance + balanceChange;
            await supabase
              .from('accounts')
              .update({ balance: newBalance })
              .eq('id', transaction.accountId);
          }

          // Update local state
          set(state => ({ 
            transactions: [...state.transactions, newTransaction],
            accounts: state.accounts.map(acc => 
              acc.id === transaction.accountId 
                ? { ...acc, balance: acc.balance + balanceChange }
                : acc
            )
          }));
        }
      },

      updateTransaction: async (id, transaction) => {
        const { transactions, accounts } = get();
        const oldTransaction = transactions.find(t => t.id === id);
        if (!oldTransaction) return;

        const updateData: any = {};
        if (transaction.description !== undefined) updateData.description = transaction.description;
        if (transaction.amount !== undefined) updateData.amount = transaction.amount;
        if (transaction.date !== undefined) updateData.date = transaction.date;
        if (transaction.categoryId !== undefined) updateData.category_id = transaction.categoryId;
        if (transaction.accountId !== undefined) updateData.account_id = transaction.accountId;
        if (transaction.type !== undefined) updateData.type = transaction.type;
        if (transaction.paymentType !== undefined) updateData.payment_type = transaction.paymentType;

        const { error } = await supabase
          .from('transactions')
          .update(updateData)
          .eq('id', id);

        if (!error) {
          // Calculate balance changes
          const oldBalanceChange = oldTransaction.type === 'income' ? -oldTransaction.amount : oldTransaction.amount;
          const newAmount = transaction.amount ?? oldTransaction.amount;
          const newType = transaction.type ?? oldTransaction.type;
          const newBalanceChange = newType === 'income' ? newAmount : -newAmount;
          const totalChange = oldBalanceChange + newBalanceChange;
          
          const oldAccountId = oldTransaction.accountId;
          const newAccountId = transaction.accountId ?? oldTransaction.accountId;

          // Update account balances
          if (oldAccountId === newAccountId && totalChange !== 0) {
            // Same account - just update the difference
            const account = accounts.find(acc => acc.id === oldAccountId);
            if (account) {
              const newBalance = account.balance + totalChange;
              await supabase
                .from('accounts')
                .update({ balance: newBalance })
                .eq('id', oldAccountId);
            }
          } else if (oldAccountId !== newAccountId) {
            // Different accounts - reverse old and apply new
            const oldAccount = accounts.find(acc => acc.id === oldAccountId);
            const newAccount = accounts.find(acc => acc.id === newAccountId);
            
            if (oldAccount && newAccount) {
              await Promise.all([
                supabase
                  .from('accounts')
                  .update({ balance: oldAccount.balance + oldBalanceChange })
                  .eq('id', oldAccountId),
                supabase
                  .from('accounts')
                  .update({ balance: newAccount.balance + newBalanceChange })
                  .eq('id', newAccountId)
              ]);
            }
          }

          // Update local state
          set(state => ({
            transactions: state.transactions.map(tx =>
              tx.id === id ? { ...tx, ...transaction } : tx
            ),
            accounts: state.accounts.map(acc => {
              if (acc.id === oldAccountId && acc.id === newAccountId) {
                return { ...acc, balance: acc.balance + totalChange };
              } else if (acc.id === oldAccountId) {
                return { ...acc, balance: acc.balance + oldBalanceChange };
              } else if (acc.id === newAccountId) {
                return { ...acc, balance: acc.balance + newBalanceChange };
              }
              return acc;
            })
          }));
        }
      },

      removeTransaction: async (id) => {
        const { transactions, accounts } = get();
        const transaction = transactions.find(t => t.id === id);
        if (!transaction) return;

        const { error } = await supabase
          .from('transactions')
          .delete()
          .eq('id', id);

        if (!error) {
          // Reverse the balance change
          const balanceChange = transaction.type === 'income' ? -transaction.amount : transaction.amount;
          const account = accounts.find(acc => acc.id === transaction.accountId);
          
          if (account) {
            const newBalance = account.balance + balanceChange;
            await supabase
              .from('accounts')
              .update({ balance: newBalance })
              .eq('id', transaction.accountId);
          }

          // Update local state
          set(state => ({
            transactions: state.transactions.filter(tx => tx.id !== id),
            accounts: state.accounts.map(acc =>
              acc.id === transaction.accountId
                ? { ...acc, balance: acc.balance + balanceChange }
                : acc
            )
          }));
        }
      },
      
      // Category methods
      addCategory: async (category) => {
        const { user } = useAuthStore.getState();
        if (!user) return;

        const { data, error } = await supabase
          .from('categories')
          .insert({
            user_id: user.id,
            name: category.name,
            color: category.color,
            type: category.type
          })
          .select()
          .single();

        if (!error && data) {
          const newCategory = {
            id: data.id,
            name: data.name,
            color: data.color,
            type: data.type as 'income' | 'expense'
          };
          set(state => ({ categories: [...state.categories, newCategory] }));
        }
      },

      updateCategory: async (id, category) => {
        const { error } = await supabase
          .from('categories')
          .update({
            name: category.name,
            color: category.color,
            type: category.type
          })
          .eq('id', id);

        if (!error) {
          set(state => ({
            categories: state.categories.map(cat =>
              cat.id === id ? { ...cat, ...category } : cat
            )
          }));
        }
      },

      removeCategory: async (id) => {
        const { error } = await supabase
          .from('categories')
          .delete()
          .eq('id', id);

        if (!error) {
          set(state => ({
            categories: state.categories.filter(cat => cat.id !== id)
          }));
        }
      },
      
      // Special dates methods
      addSpecialDate: async (date) => {
        const { user } = useAuthStore.getState();
        if (!user) return;

        const { data, error } = await supabase
          .from('special_dates')
          .insert({
            user_id: user.id,
            name: date.name,
            date: date.date,
            description: date.description,
            is_recurring: date.isRecurring || false,
            is_completed: date.isCompleted || false
          })
          .select()
          .single();

        if (!error && data) {
          const newDate = {
            id: data.id,
            name: data.name,
            date: data.date,
            description: data.description || undefined,
            isRecurring: data.is_recurring,
            isCompleted: data.is_completed
          };
          set(state => ({ specialDates: [...state.specialDates, newDate] }));
        }
      },

      updateSpecialDate: async (id, date) => {
        const updateData: any = {};
        if (date.name !== undefined) updateData.name = date.name;
        if (date.date !== undefined) updateData.date = date.date;
        if (date.description !== undefined) updateData.description = date.description;
        if (date.isRecurring !== undefined) updateData.is_recurring = date.isRecurring;
        if (date.isCompleted !== undefined) updateData.is_completed = date.isCompleted;

        const { error } = await supabase
          .from('special_dates')
          .update(updateData)
          .eq('id', id);

        if (!error) {
          set(state => ({
            specialDates: state.specialDates.map(sd =>
              sd.id === id ? { ...sd, ...date } : sd
            )
          }));
        }
      },

      removeSpecialDate: async (id) => {
        const { error } = await supabase
          .from('special_dates')
          .delete()
          .eq('id', id);

        if (!error) {
          set(state => ({
            specialDates: state.specialDates.filter(sd => sd.id !== id)
          }));
        }
      },
      
      // Savings goals methods
      addSavingsGoal: async (goal) => {
        const { user } = useAuthStore.getState();
        if (!user) return;

        const { data, error } = await supabase
          .from('savings_goals')
          .insert({
            user_id: user.id,
            name: goal.name,
            target_amount: goal.targetAmount,
            current_amount: goal.currentAmount || 0,
            target_date: goal.targetDate
          })
          .select()
          .single();

        if (!error && data) {
          const newGoal = {
            id: data.id,
            name: data.name,
            targetAmount: Number(data.target_amount),
            currentAmount: Number(data.current_amount),
            createdAt: data.created_at,
            targetDate: data.target_date || null
          };
          set(state => ({ savingsGoals: [...state.savingsGoals, newGoal] }));
        }
      },

      updateSavingsGoal: async (id, goal) => {
        const updateData: any = {};
        if (goal.name !== undefined) updateData.name = goal.name;
        if (goal.targetAmount !== undefined) updateData.target_amount = goal.targetAmount;
        if (goal.currentAmount !== undefined) updateData.current_amount = goal.currentAmount;
        if (goal.targetDate !== undefined) updateData.target_date = goal.targetDate;

        const { error } = await supabase
          .from('savings_goals')
          .update(updateData)
          .eq('id', id);

        if (!error) {
          set(state => ({
            savingsGoals: state.savingsGoals.map(sg =>
              sg.id === id ? { ...sg, ...goal } : sg
            )
          }));
        }
      },

      removeSavingsGoal: async (id) => {
        const { error } = await supabase
          .from('savings_goals')
          .delete()
          .eq('id', id);

        if (!error) {
          set(state => ({
            savingsGoals: state.savingsGoals.filter(sg => sg.id !== id)
          }));
        }
      },

      // Savings movements methods
      addSavingsMovement: async (movement) => {
        const { user } = useAuthStore.getState();
        if (!user) return;

        const { data, error } = await supabase
          .from('savings_movements')
          .insert({
            user_id: user.id,
            goal_id: movement.goalId,
            account_id: movement.accountId,
            type: movement.type,
            amount: movement.amount,
            date: movement.date,
            note: movement.note
          })
          .select()
          .single();

        if (!error && data) {
          const newMovement = {
            id: data.id,
            goalId: data.goal_id,
            accountId: data.account_id,
            type: data.type as 'deposit' | 'withdraw',
            amount: Number(data.amount),
            date: new Date(data.date).toISOString(),
            note: data.note || undefined,
            createdAt: data.created_at
          };
          set(state => ({ 
            savingsMovements: [newMovement, ...state.savingsMovements]
          }));
        }
      },

      updateSavingsMovement: async (id, movement) => {
        const updateData: any = {};
        if (movement.goalId !== undefined) updateData.goal_id = movement.goalId;
        if (movement.accountId !== undefined) updateData.account_id = movement.accountId;
        if (movement.type !== undefined) updateData.type = movement.type;
        if (movement.amount !== undefined) updateData.amount = movement.amount;
        if (movement.date !== undefined) updateData.date = movement.date;
        if (movement.note !== undefined) updateData.note = movement.note;

        const { error } = await supabase
          .from('savings_movements')
          .update(updateData)
          .eq('id', id);

        if (!error) {
          set(state => ({
            savingsMovements: state.savingsMovements.map(sm =>
              sm.id === id ? { ...sm, ...movement } : sm
            )
          }));
        }
      },

      removeSavingsMovement: async (id) => {
        const { error } = await supabase
          .from('savings_movements')
          .delete()
          .eq('id', id);

        if (!error) {
          set(state => ({
            savingsMovements: state.savingsMovements.filter(sm => sm.id !== id)
          }));
        }
      },

      getSavingsMovementsByGoal: (goalId) => {
        const { savingsMovements } = get();
        return savingsMovements.filter(sm => sm.goalId === goalId);
      },

      setWeeklyGoal: async (goal) => {
        const { user } = useAuthStore.getState();
        if (!user) return;

        const { data, error } = await supabase
          .from('weekly_goals')
          .upsert({
            user_id: user.id,
            year: goal.year,
            month: goal.month,
            category_id: goal.categoryId,
            weekly_amounts: goal.weeklyAmounts,
            monthly_amount: goal.monthlyAmount
          })
          .select()
          .single();

        if (!error && data) {
          const newGoal = {
            id: data.id,
            year: data.year,
            month: data.month,
            categoryId: data.category_id,
            weeklyAmounts: data.weekly_amounts || [],
            monthlyAmount: data.monthly_amount ? Number(data.monthly_amount) : undefined
          };
          
          set(state => {
            const existingIndex = state.weeklyGoals.findIndex(
              wg => wg.year === goal.year && wg.month === goal.month && wg.categoryId === goal.categoryId
            );
            
            if (existingIndex >= 0) {
              const updated = [...state.weeklyGoals];
              updated[existingIndex] = newGoal;
              return { weeklyGoals: updated };
            }
            
            return { weeklyGoals: [...state.weeklyGoals, newGoal] };
          });
        }
      },

      setMonthlyNote: async (note) => {
        const { user } = useAuthStore.getState();
        if (!user) return;

        const { data, error } = await supabase
          .from('monthly_notes')
          .upsert({
            user_id: user.id,
            year: note.year,
            month: note.month,
            content: note.content
          })
          .select()
          .single();

        if (!error && data) {
          const newNote = {
            id: data.id,
            year: data.year,
            month: data.month,
            content: data.content
          };
          
          set(state => {
            const existingIndex = state.monthlyNotes.findIndex(
              mn => mn.year === note.year && mn.month === note.month
            );
            
            if (existingIndex >= 0) {
              const updated = [...state.monthlyNotes];
              updated[existingIndex] = newNote;
              return { monthlyNotes: updated };
            }
            
            return { monthlyNotes: [...state.monthlyNotes, newNote] };
          });
        }
      },
      
      // Getters
      getTotalBalance: () => {
        const { accounts } = get();
        return accounts.reduce((total, account) => total + account.balance, 0);
      },
      
      getTotalIncome: (month, year) => {
        const { transactions } = get();
        const currentMonth = month ?? new Date().getMonth();
        const currentYear = year ?? new Date().getFullYear();
        
        return transactions
          .filter((tx) => {
            const txDate = new Date(tx.date);
            const matchMonth = month === undefined ? true : txDate.getMonth() === currentMonth;
            const matchYear = year === undefined ? true : txDate.getFullYear() === currentYear;
            return tx.type === 'income' && matchMonth && matchYear;
          })
          .reduce((total, tx) => total + tx.amount, 0);
      },
      
      getTotalExpenses: (month, year) => {
        const { transactions } = get();
        const currentMonth = month ?? new Date().getMonth();
        const currentYear = year ?? new Date().getFullYear();
        
        return transactions
          .filter((tx) => {
            const txDate = new Date(tx.date);
            const matchMonth = month === undefined ? true : txDate.getMonth() === currentMonth;
            const matchYear = year === undefined ? true : txDate.getFullYear() === currentYear;
            return tx.type === 'expense' && matchMonth && matchYear;
          })
          .reduce((total, tx) => total + tx.amount, 0);
      },
    }),
    {
      name: 'finance-storage',
      partialize: (state) => ({
        // Only persist non-database data for faster initial loads
        isLoading: state.isLoading
      }),
    }
  )
);