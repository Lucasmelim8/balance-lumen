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

  const formatCurrency = (amount: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount);
  const getCategoryName = (categoryId: string) => categories.find(c => c.id === categoryId)?.name || 'N/A';
  const getAccountName = (accountId: string) => accounts.find(a => a.id === accountId)?.name || 'N/A';
  const getPaymentTypeName = (type: string) => {
    switch (type) {
      case 'monthly': return 'Mensal';
      case 'recurring': return 'Recorrente';
      default: return 'Único';
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

      <Card className="bg-gradient-card shadow-medium">
        <CardHeader>
          <CardTitle>Lista de Transações</CardTitle>
          <CardDescription>{filteredTransactions.length} transação(ões) encontrada(s)</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredTransactions.length > 0 ? (
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
                {filteredTransactions.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-medium">{t.description}<div className="text-xs text-muted-foreground">{getCategoryName(t.categoryId)}</div></TableCell>
                    <TableCell><Badge variant="secondary">{getPaymentTypeName(t.paymentType)}</Badge></TableCell>
                    <TableCell>{getAccountName(t.accountId)}</TableCell>
                    <TableCell>{new Date(t.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</TableCell>
                    <TableCell><Badge variant={t.type === 'income' ? 'default' : 'destructive'} className={t.type === 'income' ? 'bg-success hover:bg-success/80' : ''}>{t.type === 'income' ? 'Receita' : 'Despesa'}</Badge></TableCell>
                    <TableCell className={`text-right font-semibold ${t.type === 'income' ? 'text-success' : 'text-destructive'}`}>{t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleOpenEditModal(t)}><Edit className="h-4 w-4" /></Button>
                        <Button variant="outline" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleOpenDeleteConfirm(t)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Nenhuma transação encontrada</p>
              <Button onClick={handleOpenAddModal} className="mt-4"><Plus className="mr-2 h-4 w-4" /> Adicionar primeira transação</Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>{currentTransaction ? 'Editar Transação' : 'Adicionar Nova Transação'}</DialogTitle>
            <DialogDescription>Preencha os detalhes da sua movimentação financeira.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">Descrição</Label>
              <Input id="description" name="description" value={transactionFormData.description} onChange={handleFormChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">Valor</Label>
              <Input id="amount" name="amount" type="number" value={transactionFormData.amount} onChange={handleFormChange} className="col-span-3" placeholder="0.00" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">Data</Label>
              <Input id="date" name="date" type="date" value={transactionFormData.date} onChange={handleFormChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">Tipo</Label>
              <Select onValueChange={(v) => handleSelectChange('type', v)} value={transactionFormData.type}>
                <SelectTrigger className="col-span-3"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="expense">Despesa</SelectItem><SelectItem value="income">Receita</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="accountId" className="text-right">Conta</Label>
              <Select onValueChange={(v) => handleSelectChange('accountId', v)} value={transactionFormData.accountId}>
                <SelectTrigger className="col-span-3"><SelectValue placeholder="Selecione uma conta" /></SelectTrigger>
                <SelectContent>{accounts.map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="categoryId" className="text-right">Categoria</Label>
              <Select onValueChange={(v) => handleSelectChange('categoryId', v)} value={transactionFormData.categoryId}>
                <SelectTrigger className="col-span-3"><SelectValue placeholder="Selecione uma categoria" /></SelectTrigger>
                <SelectContent>{categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            {transactionFormData.type === 'expense' && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Opções</Label>
                <div className="col-span-3 flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                        <Checkbox id="isMonthly" checked={transactionFormData.isMonthly} onCheckedChange={(checked) => handleCheckboxChange('isMonthly', !!checked)} />
                        <label htmlFor="isMonthly" className="text-sm font-medium leading-none">Gasto Mensal</label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox id="isRecurring" checked={transactionFormData.isRecurring} onCheckedChange={(checked) => handleCheckboxChange('isRecurring', !!checked)} />
                        <label htmlFor="isRecurring" className="text-sm font-medium leading-none">Gasto Recorrente</label>
                    </div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild><Button type="button" variant="secondary">Cancelar</Button></DialogClose>
            <Button type="submit" onClick={handleSaveChanges}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>Você tem certeza que deseja excluir a transação "{currentTransaction?.description}"? Esta ação não pode ser desfeita.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild><Button type="button" variant="secondary">Cancelar</Button></DialogClose>
            <Button type="button" variant="destructive" onClick={handleDeleteConfirm}>Excluir</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
