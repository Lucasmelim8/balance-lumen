import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
}

// NOVO: Interface para Metas Mensais
export interface MonthlyGoal {
  id: string; // ex: "2024-08-cat1"
  year: number;
  month: number; // 0-11
  categoryId: string;
  amount: number;
}


interface FinanceState {
  accounts: Account[];
  transactions: Transaction[];
  categories: Category[];
  specialDates: SpecialDate[];
  savingsGoals: SavingsGoal[];
  monthlyGoals: MonthlyGoal[]; // NOVO

  // Account methods
  addAccount: (account: Omit<Account, 'id'>) => void;
  updateAccount: (id: string, account: Partial<Account>) => void;
  removeAccount: (id: string) => void;
  
  // Transaction methods
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => void;
  removeTransaction: (id: string) => void;
  
  // Category methods
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, category: Partial<Category>) => void;
  removeCategory: (id: string) => void;
  
  // Special dates methods
  addSpecialDate: (date: Omit<SpecialDate, 'id'>) => void;
  updateSpecialDate: (id: string, date: Partial<SpecialDate>) => void;
  removeSpecialDate: (id: string) => void;
  
  // Savings goals methods
  addSavingsGoal: (goal: Omit<SavingsGoal, 'id'>) => void;
  updateSavingsGoal: (id: string, goal: Partial<SavingsGoal>) => void;
  removeSavingsGoal: (id: string) => void;
  addToSavingsGoal: (id: string, amount: number) => void;

  // NOVO: Métodos para Metas Mensais
  setMonthlyGoal: (goal: Omit<MonthlyGoal, 'id'>) => void;
  
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

const initialAccounts: Account[] = [
  { id: '1', name: 'Conta Corrente', balance: 2500, type: 'checking' },
  { id: '2', name: 'Poupança', balance: 8000, type: 'savings' },
];

// NOVO: Dados iniciais para metas
const initialMonthlyGoals: MonthlyGoal[] = [
    { id: '2025-7-1', year: 2025, month: 7, categoryId: '1', amount: 800 },
    { id: '2025-7-2', year: 2025, month: 7, categoryId: '2', amount: 250 },
]

export const useFinanceStore = create<FinanceState>()(
  persist(
    (set, get) => ({
      accounts: initialAccounts,
      transactions: [],
      categories: initialCategories,
      specialDates: [],
      savingsGoals: [],
      monthlyGoals: initialMonthlyGoals, // NOVO
      
      // Account methods
      addAccount: (account) => {
        const newAccount = { ...account, id: Date.now().toString() };
        set((state) => ({ accounts: [...state.accounts, newAccount] }));
      },
      updateAccount: (id, account) => {
        set((state) => ({
          accounts: state.accounts.map((acc) =>
            acc.id === id ? { ...acc, ...account } : acc
          ),
        }));
      },
      removeAccount: (id) => {
        set((state) => ({
          accounts: state.accounts.filter((acc) => acc.id !== id),
        }));
      },
      
      // Transaction methods  
      addTransaction: (transaction) => {
        const newTransaction = { ...transaction, id: Date.now().toString() };
        set((state) => ({ transactions: [...state.transactions, newTransaction] }));
      },
      updateTransaction: (id, transaction) => {
        set((state) => ({
          transactions: state.transactions.map((tx) =>
            tx.id === id ? { ...tx, ...transaction } : tx
          ),
        }));
      },
      removeTransaction: (id) => {
        set((state) => ({
          transactions: state.transactions.filter((tx) => tx.id !== id),
        }));
      },
      
      // Category methods
      addCategory: (category) => {
        const newCategory = { ...category, id: Date.now().toString() };
        set((state) => ({ categories: [...state.categories, newCategory] }));
      },
      updateCategory: (id, category) => {
        set((state) => ({
          categories: state.categories.map((cat) =>
            cat.id === id ? { ...cat, ...category } : cat
          ),
        }));
      },
      removeCategory: (id) => {
        set((state) => ({
          categories: state.categories.filter((cat) => cat.id !== id),
        }));
      },
      
      // Special dates methods
      addSpecialDate: (date) => {
        const newDate = { ...date, id: Date.now().toString() };
        set((state) => ({ specialDates: [...state.specialDates, newDate] }));
      },
      updateSpecialDate: (id, date) => {
        set((state) => ({
          specialDates: state.specialDates.map((sd) =>
            sd.id === id ? { ...sd, ...date } : sd
          ),
        }));
      },
      removeSpecialDate: (id) => {
        set((state) => ({
          specialDates: state.specialDates.filter((sd) => sd.id !== id),
        }));
      },
      
      // Savings goals methods
      addSavingsGoal: (goal) => {
        const newGoal = { 
          ...goal, 
          id: Date.now().toString(),
          createdAt: new Date().toISOString()
        };
        set((state) => ({ savingsGoals: [...state.savingsGoals, newGoal] }));
      },
      updateSavingsGoal: (id, goal) => {
        set((state) => ({
          savingsGoals: state.savingsGoals.map((sg) =>
            sg.id === id ? { ...sg, ...goal } : sg
          ),
        }));
      },
      removeSavingsGoal: (id) => {
        set((state) => ({
          savingsGoals: state.savingsGoals.filter((sg) => sg.id !== id),
        }));
      },
      addToSavingsGoal: (id, amount) => {
        set((state) => ({
          savingsGoals: state.savingsGoals.map((sg) =>
            sg.id === id 
              ? { ...sg, currentAmount: Math.min(sg.currentAmount + amount, sg.targetAmount) }
              : sg
          ),
        }));
      },

      // NOVO: Métodos para Metas
      setMonthlyGoal: (goal) => {
        const id = `${goal.year}-${goal.month}-${goal.categoryId}`;
        set((state) => {
            const existingGoal = state.monthlyGoals.find(g => g.id === id);
            if (existingGoal) {
                return {
                    monthlyGoals: state.monthlyGoals.map(g => g.id === id ? { ...g, ...goal, id } : g)
                }
            }
            return { monthlyGoals: [...state.monthlyGoals, { ...goal, id }] }
        });
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
    }
  )
);
