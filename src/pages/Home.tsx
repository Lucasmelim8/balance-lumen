import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Wallet, 
  Plus,
  CreditCard,
  TrendingUp,
  Calendar,
  PiggyBank,
  Settings
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useFinanceStore } from '@/store/financeStore';

export default function Home() {
  const { 
    accounts, 
    transactions, 
    categories,
    getTotalBalance, 
    getTotalIncome, 
    getTotalExpenses 
  } = useFinanceStore();

  const totalBalance = getTotalBalance();
  const totalIncome = getTotalIncome();
  const totalExpenses = getTotalExpenses();
  const recentTransactions = transactions.slice(-5).reverse();

  const quickActions = [
    { 
      title: 'Transações', 
      description: 'Gerenciar receitas e despesas',
      icon: CreditCard, 
      href: '/transactions',
      color: 'bg-primary'
    },
    { 
      title: 'Categorias', 
      description: 'Organizar tipos de gastos',
      icon: TrendingUp, 
      href: '/categories',
      color: 'bg-warning'
    },
    { 
      title: 'Datas Especiais', 
      description: 'Lembretes importantes',
      icon: Calendar, 
      href: '/special-dates',
      color: 'bg-success'
    },
    { 
      title: 'Caixinha', 
      description: 'Metas de economia',
      icon: PiggyBank, 
      href: '/savings',
      color: 'bg-destructive'
    },
    { 
      title: 'Configurações', 
      description: 'Personalizar aplicativo',
      icon: Settings, 
      href: '/settings',
      color: 'bg-muted-foreground'
    },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Visão geral das suas finanças
          </p>
        </div>
        <Button asChild className="bg-gradient-primary">
          <Link to="/transactions/new">
            <Plus className="mr-2 h-4 w-4" />
            Nova Transação
          </Link>
        </Button>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-gradient-card shadow-medium">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Total</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalBalance)}</div>
            <p className="text-xs text-muted-foreground">
              {accounts.length} contas ativas
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-card shadow-medium">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receitas do Mês</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{formatCurrency(totalIncome)}</div>
            <p className="text-xs text-muted-foreground">
              Entradas este mês
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-card shadow-medium">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Despesas do Mês</CardTitle>
            <ArrowDownRight className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{formatCurrency(totalExpenses)}</div>
            <p className="text-xs text-muted-foreground">
              Gastos este mês
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Accounts */}
        <Card className="bg-gradient-card shadow-medium">
          <CardHeader>
            <CardTitle>Contas</CardTitle>
            <CardDescription>Suas contas bancárias</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {accounts.slice(0, 3).map((account) => (
                <div key={account.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <p className="font-medium">{account.name}</p>
                    <p className="text-sm text-muted-foreground capitalize">{account.type}</p>
                  </div>
                  <p className="font-semibold">{formatCurrency(account.balance)}</p>
                </div>
              ))}
              {accounts.length === 0 && (
                <p className="text-center text-muted-foreground py-4">
                  Nenhuma conta cadastrada
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card className="bg-gradient-card shadow-medium">
          <CardHeader>
            <CardTitle>Últimas Transações</CardTitle>
            <CardDescription>Suas movimentações recentes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentTransactions.slice(0, 4).map((transaction) => {
                const category = categories.find(c => c.id === transaction.categoryId);
                return (
                  <div key={transaction.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      <p className="text-sm text-muted-foreground">{category?.name}</p>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${
                        transaction.type === 'income' ? 'text-success' : 'text-destructive'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(transaction.date).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                );
              })}
              {recentTransactions.length === 0 && (
                <p className="text-center text-muted-foreground py-4">
                  Nenhuma transação registrada
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="bg-gradient-card shadow-medium">
        <CardHeader>
          <CardTitle>Atalhos</CardTitle>
          <CardDescription>Acesso rápido às principais funcionalidades</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-5">
            {quickActions.map((action) => (
              <Button
                key={action.title}
                asChild
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-2 hover:shadow-medium transition-shadow"
              >
                <Link to={action.href}>
                  <div className={`p-2 rounded-lg ${action.color} text-white`}>
                    <action.icon className="h-5 w-5" />
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-sm">{action.title}</p>
                    <p className="text-xs text-muted-foreground">{action.description}</p>
                  </div>
                </Link>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}