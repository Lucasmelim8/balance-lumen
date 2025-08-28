import { useState } from 'react';
import { Plus, Search, Filter, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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

// --- INÍCIO DA CORREÇÃO: Simulação do Store (Zustand) ---
// Dados de exemplo para simular o que viria do seu store.
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
];

const mockTransactions = [
  { id: 't1', description: 'Salário Mensal', amount: 7500, date: '2025-08-05', type: 'income', categoryId: 'cat1', accountId: 'acc1' },
  { id: 't2', description: 'Supermercado', amount: 450.60, date: '2025-08-10', type: 'expense', categoryId: 'cat2', accountId: 'acc2' },
  { id: 't3', description: 'Uber para o trabalho', amount: 25.50, date: '2025-08-11', type: 'expense', categoryId: 'cat3', accountId: 'acc2' },
  { id: 't4', description: 'Cinema', amount: 60.00, date: '2025-08-12', type: 'expense', categoryId: 'cat4', accountId: 'acc1' },
];

// Hook de simulação que imita o comportamento do useFinanceStore
const useFinanceStore = () => {
  const [transactions, setTransactions] = useState(mockTransactions);
  const [accounts] = useState(mockAccounts);
  const [categories] = useState(mockCategories);

  const addTransaction = (transaction: any) => {
    setTransactions(prev => [...prev, transaction]);
  };

  const updateTransaction = (updatedTransaction: any) => {
    setTransactions(prev => prev.map(t => t.id === updatedTransaction.id ? updatedTransaction : t));
  };

  const removeTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  return { transactions, categories, accounts, addTransaction, updateTransaction, removeTransaction };
};
// --- FIM DA CORREÇÃO ---


// Interface para o formulário da transação
interface TransactionFormData {
  description: string;
  amount: number;
  date: string;
  type: 'income' | 'expense';
  categoryId: string;
  accountId: string;
}

export default function Transactions() {
  // Acessando o estado e as ações do store Zustand (agora simulado)
  const {
    transactions,
    categories,
    accounts,
    addTransaction,
    updateTransaction,
    removeTransaction
  } = useFinanceStore();

  // Estados para os filtros da tabela
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterAccount, setFilterAccount] = useState<string>('all'); // Novo estado para filtro de conta

  // Estados para controle do modal e do formulário
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [currentTransaction, setCurrentTransaction] = useState<any | null>(null);
  const [transactionFormData, setTransactionFormData] = useState<TransactionFormData>({
    description: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0], // Data de hoje por padrão
    type: 'expense',
    categoryId: '',
    accountId: '',
  });

  // Lógica para filtrar as transações com base nos estados de filtro
  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch = transaction.description
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || transaction.type === filterType;
    const matchesCategory = filterCategory === 'all' || transaction.categoryId === filterCategory;
    const matchesAccount = filterAccount === 'all' || transaction.accountId === filterAccount; // Lógica do novo filtro

    return matchesSearch && matchesType && matchesCategory && matchesAccount;
  });

  // Funções auxiliares
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(amount);
  };

  const getCategoryName = (categoryId: string) => {
    return categories.find(c => c.id === categoryId)?.name || 'N/A';
  };

  const getAccountName = (accountId: string) => {
    return accounts.find(a => a.id === accountId)?.name || 'N/A';
  };

  // Funções para manipular o formulário e o modal
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setTransactionFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value,
    }));
  };

  const handleSelectChange = (name: keyof TransactionFormData, value: string) => {
    setTransactionFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleOpenAddModal = () => {
    setCurrentTransaction(null);
    setTransactionFormData({
      description: '',
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      type: 'expense',
      categoryId: '',
      accountId: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (transaction: any) => {
    setCurrentTransaction(transaction);
    setTransactionFormData({
      description: transaction.description,
      amount: transaction.amount,
      date: new Date(transaction.date).toISOString().split('T')[0],
      type: transaction.type,
      categoryId: transaction.categoryId,
      accountId: transaction.accountId,
    });
    setIsModalOpen(true);
  };

  const handleSaveChanges = () => {
    // Validação simples para garantir que campos essenciais estão preenchidos
    if (!transactionFormData.description || transactionFormData.amount <= 0 || !transactionFormData.accountId || !transactionFormData.categoryId) {
        alert("Por favor, preencha todos os campos obrigatórios.");
        return;
    }

    if (currentTransaction) {
      // Atualiza transação existente
      updateTransaction({ ...currentTransaction, ...transactionFormData });
    } else {
      // Adiciona nova transação
      addTransaction({
        id: Date.now().toString(),
        ...transactionFormData,
      });
    }
    setIsModalOpen(false);
  };

  const handleOpenDeleteConfirm = (transaction: any) => {
    setCurrentTransaction(transaction);
    setIsDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (currentTransaction) {
      removeTransaction(currentTransaction.id);
    }
    setIsDeleteConfirmOpen(false);
    setCurrentTransaction(null);
  };


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transações</h1>
          <p className="text-muted-foreground">
            Gerencie suas receitas e despesas
          </p>
        </div>
        <Button onClick={handleOpenAddModal} className="bg-gradient-primary">
          <Plus className="mr-2 h-4 w-4" />
          Nova Transação
        </Button>
      </div>

      {/* Filtros */}
      <Card className="bg-gradient-card shadow-medium">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar transação..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={filterType} onValueChange={(value: 'all' | 'income' | 'expense') => setFilterType(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="income">Receitas</SelectItem>
                <SelectItem value="expense">Despesas</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as categorias</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterAccount} onValueChange={setFilterAccount}>
              <SelectTrigger>
                <SelectValue placeholder="Conta" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as contas</SelectItem>
                {accounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Transações */}
      <Card className="bg-gradient-card shadow-medium">
        <CardHeader>
          <CardTitle>Lista de Transações</CardTitle>
          <CardDescription>
            {filteredTransactions.length} transação(ões) encontrada(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredTransactions.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Conta</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-medium">
                      {transaction.description}
                    </TableCell>
                    <TableCell>{getCategoryName(transaction.categoryId)}</TableCell>
                    <TableCell>{getAccountName(transaction.accountId)}</TableCell>
                    <TableCell>
                      {new Date(transaction.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={transaction.type === 'income' ? 'default' : 'destructive'}
                        className={transaction.type === 'income' ? 'bg-success hover:bg-success/80' : ''}
                      >
                        {transaction.type === 'income' ? 'Receita' : 'Despesa'}
                      </Badge>
                    </TableCell>
                    <TableCell className={`text-right font-semibold ${
                      transaction.type === 'income' ? 'text-success' : 'text-destructive'
                      }`}>
                      {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleOpenEditModal(transaction)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => handleOpenDeleteConfirm(transaction)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Nenhuma transação encontrada</p>
              <Button onClick={handleOpenAddModal} className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                Adicionar primeira transação
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal para Adicionar/Editar Transação */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>{currentTransaction ? 'Editar Transação' : 'Adicionar Nova Transação'}</DialogTitle>
            <DialogDescription>
              Preencha os detalhes da sua movimentação financeira.
            </DialogDescription>
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
              <Select onValueChange={(value) => handleSelectChange('type', value)} value={transactionFormData.type}>
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="expense">Despesa</SelectItem>
                  <SelectItem value="income">Receita</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="accountId" className="text-right">Conta</Label>
              <Select onValueChange={(value) => handleSelectChange('accountId', value)} value={transactionFormData.accountId}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecione uma conta" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map(acc => <SelectItem key={acc.id} value={acc.id}>{acc.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="categoryId" className="text-right">Categoria</Label>
              <Select onValueChange={(value) => handleSelectChange('categoryId', value)} value={transactionFormData.categoryId}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">Cancelar</Button>
            </DialogClose>
            <Button type="submit" onClick={handleSaveChanges}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Confirmação de Exclusão */}
      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Você tem certeza que deseja excluir a transação "{currentTransaction?.description}"? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">Cancelar</Button>
            </DialogClose>
            <Button type="button" variant="destructive" onClick={handleDeleteConfirm}>Excluir</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
