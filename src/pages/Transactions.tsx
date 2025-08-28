import { useState, useMemo } from 'react';
import { Plus, Search, Filter, Edit, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';

// --- Simulação do Store (Zustand) ---
const mockAccounts = [
  { id: 'acc1', name: 'Conta Corrente', type: 'corrente', balance: 5420.50 },
  { id: 'acc2', name: 'Cartão de Crédito', type: 'credito', balance: -850.75 },
  { id: 'acc3', name: 'Poupança', type: 'poupanca', balance: 12345.00 },
];

const mockCategories = [
  { id: 'cat1', name: 'Salário' },
  { id: 'cat2', name: 'Alimentação' },
  { id: 'cat3', name: 'Transporte' },
  { id: 'cat4', name: 'Lazer' },
  { id: 'cat5', name: 'Assinaturas' },
];

const mockTransactions = [
  { id: 't1', description: 'Salário Mensal', amount: 7500, date: '2025-08-05', type: 'income', categoryId: 'cat1', accountId: 'acc1', paymentType: 'single' },
  { id: 't2', description: 'Supermercado', amount: 450.60, date: '2025-08-10', type: 'expense', categoryId: 'cat2', accountId: 'acc2', paymentType: 'monthly' },
  { id: 't3', description: 'Uber para o trabalho', amount: 25.50, date: '2025-08-11', type: 'expense', categoryId: 'cat3', accountId: 'acc2', paymentType: 'single' },
  { id: 't4', description: 'Cinema', amount: 60.00, date: '2025-08-12', type: 'expense', categoryId: 'cat4', accountId: 'acc1', paymentType: 'single' },
  { id: 't5', description: 'Netflix', amount: 39.90, date: '2025-07-15', type: 'expense', categoryId: 'cat5', accountId: 'acc2', paymentType: 'recurring' },
  { id: 't6', description: 'Salário Mensal', amount: 7500, date: '2025-07-05', type: 'income', categoryId: 'cat1', accountId: 'acc1', paymentType: 'single' },
];

const useFinanceStore = () => {
  const [transactions, setTransactions] = useState(mockTransactions);
  const [accounts] = useState(mockAccounts);
  const [categories] = useState(mockCategories);

  const addTransaction = (transaction: any) => {
    setTransactions(prev => [...prev, transaction].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  };

  const updateTransaction = (updatedTransaction: any) => {
    setTransactions(prev => prev.map(t => t.id === updatedTransaction.id ? updatedTransaction : t));
  };

  const removeTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  return { transactions, categories, accounts, addTransaction, updateTransaction, removeTransaction };
};

// Interface para o formulário da transação
interface TransactionFormData {
  description: string;
  amount: number;
  date: string;
  type: 'income' | 'expense';
  accountId: string;
  categoryId: string;
  isMonthly: boolean;
  isRecurring: boolean;
}

export default function Transactions() {
  const {
    transactions,
    categories,
    accounts,
    addTransaction,
    updateTransaction,
    removeTransaction
  } = useFinanceStore();

  // Estados dos filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterAccount, setFilterAccount] = useState<string>('all');
  const [filterMonth, setFilterMonth] = useState<string>('all');
  const [filterYear, setFilterYear] = useState<string>('all');

  // Estados do modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [currentTransaction, setCurrentTransaction] = useState<any | null>(null);
  const [transactionFormData, setTransactionFormData] = useState<TransactionFormData>({
    description: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    type: 'expense',
    accountId: '',
    categoryId: '',
    isMonthly: false,
    isRecurring: false,
  });

  // Estados da paginação
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);

  const { months, years } = useMemo(() => {
    const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    const uniqueYears = [...new Set(transactions.map(t => new Date(t.date).getFullYear()))].sort((a, b) => b - a);
    return { months: monthNames, years: uniqueYears };
  }, [transactions]);

  const filteredTransactions = transactions.filter((transaction) => {
    const transactionDate = new Date(transaction.date);
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || transaction.type === filterType;
    const matchesCategory = filterCategory === 'all' || transaction.categoryId === filterCategory;
    const matchesAccount = filterAccount === 'all' || transaction.accountId === filterAccount;
    const matchesMonth = filterMonth === 'all' || transactionDate.getMonth() === parseInt(filterMonth);
    const matchesYear = filterYear === 'all' || transactionDate.getFullYear() === parseInt(filterYear);
    return matchesSearch && matchesType && matchesCategory && matchesAccount && matchesMonth && matchesYear;
  });

  // Paginação aplicada
  const totalPages = Math.ceil(filteredTransactions.length / rowsPerPage);
  const paginatedTransactions = filteredTransactions.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const formatCurrency = (amount: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount);
  const getCategoryName = (categoryId: string) => categories.find(c => c.id === categoryId)?.name || 'N/A';
  const getAccountName = (accountId: string) => accounts.find(a => a.id === accountId)?.name || 'N/A';
  const getPaymentBadge = (type: string) => {
    switch (type) {
      case 'monthly': return <Badge className="bg-blue-500 text-white">Mensal</Badge>;
      case 'recurring': return <Badge className="bg-purple-500 text-white">Recorrente</Badge>;
      default: return <Badge variant="secondary">Único</Badge>;
    }
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setFilterType('all');
    setFilterCategory('all');
    setFilterAccount('all');
    setFilterMonth('all');
    setFilterYear('all');
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setTransactionFormData(prev => ({ ...prev, [name]: type === 'number' ? parseFloat(value) : value }));
  };

  const handleSelectChange = (name: keyof Omit<TransactionFormData, 'isMonthly' | 'isRecurring'>, value: string) => {
    setTransactionFormData(prev => ({ ...prev, [name]: value as any }));
  };

  const handleCheckboxChange = (name: 'isMonthly' | 'isRecurring', checked: boolean) => {
    setTransactionFormData(prev => ({
      ...prev,
      isMonthly: name === 'isMonthly' ? checked : (checked ? false : prev.isMonthly),
      isRecurring: name === 'isRecurring' ? checked : (checked ? false : prev.isRecurring),
    }));
  };

  const handleOpenAddModal = () => {
    setCurrentTransaction(null);
    setTransactionFormData({
      description: '', amount: 0, date: new Date().toISOString().split('T')[0],
      type: 'expense', accountId: '', categoryId: '', isMonthly: false, isRecurring: false,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (transaction: any) => {
    setCurrentTransaction(transaction);
    setTransactionFormData({
      description: transaction.description, amount: transaction.amount,
      date: new Date(transaction.date).toISOString().split('T')[0],
      type: transaction.type, accountId: transaction.accountId, categoryId: transaction.categoryId,
      isMonthly: transaction.paymentType === 'monthly',
      isRecurring: transaction.paymentType === 'recurring',
    });
    setIsModalOpen(true);
  };

  const handleSaveChanges = () => {
    if (!transactionFormData.description || transactionFormData.amount <= 0 || !transactionFormData.accountId || !transactionFormData.categoryId) {
      console.error("Por favor, preencha todos os campos obrigatórios.");
      return;
    }
    const { isMonthly, isRecurring, ...rest } = transactionFormData;
    let paymentType = 'single';
    if (transactionFormData.type === 'expense') {
        if (isRecurring) paymentType = 'recurring';
        else if (isMonthly) paymentType = 'monthly';
    }

    const transactionData = { ...rest, paymentType };

    if (currentTransaction) {
      updateTransaction({ ...currentTransaction, ...transactionData });
    } else {
      addTransaction({ id: Date.now().toString(), ...transactionData });
    }
    setIsModalOpen(false);
  };

  const handleOpenDeleteConfirm = (transaction: any) => {
    setCurrentTransaction(transaction);
    setIsDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (currentTransaction) removeTransaction(currentTransaction.id);
    setIsDeleteConfirmOpen(false);
    setCurrentTransaction(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transações</h1>
          <p className="text-muted-foreground">Gerencie suas receitas e despesas</p>
        </div>
        <Button onClick={handleOpenAddModal} className="bg-gradient-primary">
          <Plus className="mr-2 h-4 w-4" /> Nova Transação
        </Button>
      </div>

      {/* Filtros */}
      <Card className="bg-gradient-card shadow-medium">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Filter className="h-5 w-5" /> Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 items-end">
            <div className="relative xl:col-span-2">
              <Label>Buscar</Label>
              <Search className="absolute left-3 top-1/2 transform translate-y-1/4 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar por descrição..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
            </div>
            <div className="flex flex-col gap-1.5"><Label>Tipo</Label><Select value={filterType} onValueChange={(v: any) => setFilterType(v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Todos</SelectItem><SelectItem value="income">Receitas</SelectItem><SelectItem value="expense">Despesas</SelectItem></SelectContent></Select></div>
            <div className="flex flex-col gap-1.5"><Label>Categoria</Label><Select value={filterCategory} onValueChange={setFilterCategory}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Todas</SelectItem>{categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select></div>
            <div className="flex flex-col gap-1.5"><Label>Mês</Label><Select value={filterMonth} onValueChange={setFilterMonth}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Todos</SelectItem>{months.map((m, i) => <SelectItem key={i} value={i.toString()}>{m}</SelectItem>)}</SelectContent></Select></div>
            <div className="flex flex-col gap-1.5"><Label>Ano</Label><Select value={filterYear} onValueChange={setFilterYear}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Todos</SelectItem>{years.map(y => <SelectItem key={y} value={y.toString()}>{y}</SelectItem>)}</SelectContent></Select></div>
            <Button variant="outline" onClick={handleClearFilters} className="w-full"><X className="mr-2 h-4 w-4" /> Limpar</Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Transações */}
      <Card className="bg-gradient-card shadow-medium">
        <CardHeader>
          <CardTitle>Lista de Transações</CardTitle>
          <CardDescription>{filteredTransactions.length} transação(ões) encontrada(s)</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredTransactions.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Pagamento</TableHead>
                    <TableHead>Conta</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedTransactions.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell className="font-medium">{t.description}<div className="text-xs text-muted-foreground">{getCategoryName(t.categoryId)}</div></TableCell>
                      <TableCell>{getPaymentBadge(t.paymentType)}</TableCell>
                      <TableCell>{getAccountName(t.accountId)}</TableCell>
                      <TableCell>{new Date(t.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</TableCell>
                      <TableCell><Badge variant={t.type === 'income' ? 'default' : 'destructive'} className={t.type === 'income' ? 'bg-success hover:bg-success/80' : ''}>{t.type === 'income' ? 'Receita' : 'Despesa'}</Badge></TableCell>
                      <TableCell className={`text-right font-semibold ${t.type === 'income' ? 'text-success' : 'text-destructive'}`}>{t.type === 'income' ? '+' :
