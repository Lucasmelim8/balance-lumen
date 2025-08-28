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
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  createdAt: string;
}

interface FinanceState {
  accounts: Account[];
  transactions: Transaction[];
  categories: Category[];
  specialDates: SpecialDate[];
  savingsGoals: SavingsGoal[];
  
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
  
  // Getters
  getTotalBalance: () => number;
  getTotalIncome: () => number;
  getTotalExpenses: () => number;
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

export const useFinanceStore = create<FinanceState>()(
  persist(
    (set, get) => ({
      accounts: initialAccounts,
      transactions: [],
      categories: initialCategories,
      specialDates: [],
      savingsGoals: [],
      
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
      
      // Getters
      getTotalBalance: () => {
        const { accounts } = get();
        return accounts.reduce((total, account) => total + account.balance, 0);
      },
      getTotalIncome: () => {
        const { transactions } = get();
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        
        return transactions
          .filter((tx) => {
            const txDate = new Date(tx.date);
            return tx.type === 'income' && 
                   txDate.getMonth() === currentMonth && 
                   txDate.getFullYear() === currentYear;
          })
          .reduce((total, tx) => total + tx.amount, 0);
      },
      getTotalExpenses: () => {
        const { transactions } = get();
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        
        return transactions
          .filter((tx) => {
            const txDate = new Date(tx.date);
            return tx.type === 'expense' && 
                   txDate.getMonth() === currentMonth && 
                   txDate.getFullYear() === currentYear;
          })
          .reduce((total, tx) => total + tx.amount, 0);
      },
    }),
    {
      name: 'finance-storage',
    }
  )
);