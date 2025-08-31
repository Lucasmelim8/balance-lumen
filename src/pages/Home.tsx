import { useState } from 'react';
import {
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Plus,
  CreditCard,
  TrendingUp,
  Calendar,
  PiggyBank,
  Settings,
  MoreVertical,
  Pencil,
  Trash2,
  Landmark,         // Ícone adicionado para conta corrente
  CircleDollarSign, // Ícone adicionado para o tipo 'outro'
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFinanceStore } from '@/store/financeStore';
import { toast } from '@/components/ui/use-toast';

// Mock de dados para o tipo de conta, caso não venha do store
const accountTypes = [
  { value: 'checking', label: 'Conta Corrente' },
  { value: 'savings', label: 'Poupança' },
  { value: 'credit', label: 'Cartão de Crédito' },
];

// --- NOVO: Componente auxiliar para renderizar o ícone da conta ---
const AccountIcon = ({ type, className = "h-5 w-5 text-primary" }) => {
  switch (type?.toLowerCase()) {
    case 'checking':
      return <Landmark className={className} />;
    case 'savings':
      return <PiggyBank className={className} />;
    case 'credit':
      return <CreditCard className={className} />;
    default:
      return <Wallet className={className} />;
  }
};

export default function Home() {
  // Estado do store Zustand
  const {
    accounts,
    transactions,
    categories,
    getTotalBalance,
    getTotalIncome,
    getTotalExpenses,
    addAccount,   // Assumindo que essas funções existem no seu store
    updateAccount, // Assumindo que essas funções existem no seu store
    removeAccount, // Corrigido: deleteAccount -> removeAccount
  } = useFinanceStore();

  // Estados locais para controle dos modais e formulários
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [currentAccount, setCurrentAccount] = useState(null);
  const [accountFormData, setAccountFormData] = useState<{
    name: string;
    type: 'checking' | 'savings' | 'credit' | '';
    balance: number;
  }>({
    name: '',
    type: '',
    balance: 0,
  });

  // Cálculos financeiros
  const totalBalance = getTotalBalance();
  const totalIncome = getTotalIncome();
  const totalExpenses = getTotalExpenses();
  const recentTransactions = transactions.slice(-5).reverse();

  // Ações rápidas
  const quickActions = [
    { title: 'Transações', description: 'Gerenciar receitas e despesas', icon: CreditCard, href: '/transactions', color: 'bg-primary' },
    { title: 'Categorias', description: 'Organizar tipos de gastos', icon: TrendingUp, href: '/categories', color: 'bg-warning' },
    { title: 'Datas Especiais', description: 'Lembretes importantes', icon: Calendar, href: '/special-dates', color: 'bg-success' },
    { title: 'Caixinha', description: 'Metas de economia', icon: PiggyBank, href: '/savings', color: 'bg-destructive' },
    { title: 'Configurações', description: 'Personalizar aplicativo', icon: Settings, href: '/settings', color: 'bg-muted-foreground' },
  ];

  // Função para formatar moeda
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(amount);
  };

  // Funções para manipulação de contas
  const handleOpenAddModal = () => {
    setCurrentAccount(null);
    setAccountFormData({ name: '', type: '', balance: 0 });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (account) => {
    setCurrentAccount(account);
    setAccountFormData({
      name: account.name,
      type: account.type,
      balance: account.balance,
    });
    setIsModalOpen(true);
  };

  const handleOpenDeleteConfirm = (account) => {
    setCurrentAccount(account);
    setIsDeleteConfirmOpen(true);
  };

  const handleSaveAccount = async () => {
    if (!accountFormData.name || !accountFormData.type) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    const accountData = {
      name: accountFormData.name,
      type: accountFormData.type as 'checking' | 'savings' | 'credit',
      balance: accountFormData.balance,
    };

    try {
      if (currentAccount) {
        await updateAccount(currentAccount.id, accountData);
        toast({
          title: "Sucesso",
          description: "Conta atualizada com sucesso!",
        });
      } else {
        await addAccount(accountData);
        toast({
          title: "Sucesso",
          description: "Conta adicionada com sucesso!",
        });
      }
      setIsModalOpen(false);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar a conta.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteConfirm = async () => {
    if (currentAccount) {
      try {
        await removeAccount(currentAccount.id);
        toast({
          title: "Sucesso",
          description: "Conta excluída com sucesso!",
        });
      } catch (error) {
        toast({
          title: "Erro",
          description: "Ocorreu um erro ao excluir a conta.",
          variant: "destructive",
        });
      }
    }
    setIsDeleteConfirmOpen(false);
    setCurrentAccount(null);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setAccountFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: 'checking' | 'savings' | 'credit') => {
    setAccountFormData(prev => ({ ...prev, type: value }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Visão geral das suas finanças</p>
        </div>
        <Button asChild className="bg-gradient-primary">
          <Link to="/transactions/new">
            <Plus className="mr-2 h-4 w-4" />
            Nova Transação
          </Link>
        </Button>
      </div>

      {/* Cards de Resumo Financeiro */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-gradient-card shadow-medium">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Total</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalBalance)}</div>
            <p className="text-xs text-muted-foreground">{accounts.length} contas ativas</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-card shadow-medium">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receitas do Mês</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{formatCurrency(totalIncome)}</div>
            <p className="text-xs text-muted-foreground">Entradas este mês</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-card shadow-medium">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Despesas do Mês</CardTitle>
            <ArrowDownRight className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{formatCurrency(totalExpenses)}</div>
            <p className="text-xs text-muted-foreground">Gastos este mês</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Card de Contas com CRUD */}
        <Card className="bg-gradient-card shadow-medium flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Contas</CardTitle>
              <CardDescription>Suas contas bancárias</CardDescription>
            </div>
            <Button size="sm" onClick={handleOpenAddModal}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Conta
            </Button>
          </CardHeader>
          <CardContent className="flex-grow">
            <div className="space-y-3">
              {accounts.length > 0 ? (
                accounts.slice(0, 4).map((account) => (
                  <div key={account.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-4">
                      {/* --- ALTERADO: Ícone dinâmico baseado no tipo da conta --- */}
                      <AccountIcon type={account.type} />
                      <div>
                        <p className="font-medium">{account.name}</p>
                        <p className="text-sm text-muted-foreground capitalize">
                          {account.type === 'checking' ? 'Conta Corrente' : 
                           account.type === 'savings' ? 'Poupança' : 
                           account.type === 'credit' ? 'Cartão de Crédito' : account.type}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{formatCurrency(account.balance)}</p>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleOpenEditModal(account)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            <span>Editar</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleOpenDeleteConfirm(account)} className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>Excluir</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-muted-foreground py-4 flex flex-col items-center justify-center h-full">
                  <p>Nenhuma conta cadastrada.</p>
                  <Button variant="link" onClick={handleOpenAddModal}>Adicionar primeira conta</Button>
                </div>
              )}
            </div>
          </CardContent>
           {accounts.length > 4 && (
             <CardFooter>
                <Button variant="outline" className="w-full" asChild>
                    <Link to="/accounts">Ver todas as contas</Link>
                </Button>
             </CardFooter>
           )}
        </Card>

        {/* Card de Transações Recentes */}
        <Card className="bg-gradient-card shadow-medium">
          <CardHeader>
            <CardTitle>Últimas Transações</CardTitle>
            <CardDescription>Suas movimentações recentes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentTransactions.length > 0 ? (
                recentTransactions.slice(0, 4).map((transaction) => {
                  const category = categories.find(c => c.id === transaction.categoryId);
                  return (
                    <div key={transaction.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div>
                        <p className="font-medium">{transaction.description}</p>
                        <p className="text-sm text-muted-foreground">{category?.name || 'Sem categoria'}</p>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${transaction.type === 'income' ? 'text-success' : 'text-destructive'}`}>
                          {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(transaction.date).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-center text-muted-foreground py-4">Nenhuma transação registrada</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Card de Ações Rápidas */}
      <Card className="bg-gradient-card shadow-medium">
        <CardHeader>
          <CardTitle>Atalhos</CardTitle>
          <CardDescription>Acesso rápido às principais funcionalidades</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            {quickActions.map((action) => (
              <Button
                key={action.title}
                asChild
                variant="outline"
                className="h-auto p-4 flex flex-col items-center justify-center gap-2 hover:shadow-medium transition-shadow text-center"
              >
                <Link to={action.href}>
                  <div className={`p-2 rounded-lg ${action.color} text-white inline-block`}>
                    <action.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-sm mt-2">{action.title}</p>
                    <p className="text-xs text-muted-foreground">{action.description}</p>
                  </div>
                </Link>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Modal para Adicionar/Editar Conta */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{currentAccount ? 'Editar Conta' : 'Adicionar Nova Conta'}</DialogTitle>
            <DialogDescription>
              {currentAccount ? 'Atualize os detalhes da sua conta.' : 'Preencha as informações da nova conta.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Nome</Label>
              <Input id="name" name="name" value={accountFormData.name} onChange={handleFormChange} className="col-span-3" placeholder="Ex: Banco Principal" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">Tipo</Label>
              <Select onValueChange={handleSelectChange} defaultValue={accountFormData.type}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {accountTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="balance" className="text-right">Saldo</Label>
              <Input id="balance" name="balance" type="number" value={accountFormData.balance} onChange={handleFormChange} className="col-span-3" placeholder="0.00" />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">Cancelar</Button>
            </DialogClose>
            <Button type="submit" onClick={handleSaveAccount}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Confirmação de Exclusão */}
      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Você tem certeza que deseja excluir a conta "{currentAccount?.name}"? Esta ação não pode ser desfeita.
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
