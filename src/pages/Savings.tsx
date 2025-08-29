import { useState } from 'react';
import { Plus, Edit, Trash2, PiggyBank, TrendingUp, Coins, ArrowDown, ArrowUp, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useToast } from '@/hooks/use-toast';
import { useFinanceStore } from '@/store/financeStore';
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";


// Mock de contas do usuário, substitua pelo seu estado global ou props
const userAccounts = [
    { id: 'acc1', name: 'Conta Corrente', balance: 5000 },
    { id: 'acc2', name: 'Poupança', balance: 15000 },
    { id: 'acc3', name: 'Carteira', balance: 350 },
];


export default function Savings() {
  const { savingsGoals, addSavingsGoal, updateSavingsGoal, removeSavingsGoal, addToSavingsGoal } = useFinanceStore();
  const { toast } = useToast();

  const [isGoalDialogOpen, setIsGoalDialogOpen] = useState(false);
  const [isTransactionDialogOpen, setIsTransactionDialogOpen] = useState(false);
  const [transactionType, setTransactionType] = useState<'add' | 'withdraw'>('add');

  const [editingGoal, setEditingGoal] = useState<string | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    targetAmount: '',
    targetDate: null as Date | null,
  });

  const [transactionData, setTransactionData] = useState({
    amount: '',
    accountId: '',
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(amount);
  };

  const handleGoalSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.targetAmount) {
      toast({
        title: "Erro",
        description: "Nome e valor alvo são obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    const goalData = {
      name: formData.name,
      targetAmount: parseFloat(formData.targetAmount),
      currentAmount: editingGoal ? savingsGoals.find(g => g.id === editingGoal)?.currentAmount || 0 : 0,
      createdAt: new Date().toISOString(),
      targetDate: formData.targetDate?.toISOString() || null,
    };

    if (editingGoal) {
      updateSavingsGoal(editingGoal, goalData);
      toast({
        title: "Meta atualizada",
        description: "Sua meta de economia foi atualizada com sucesso.",
      });
    } else {
      addSavingsGoal(goalData);
      toast({
        title: "Meta criada",
        description: "Sua nova meta de economia foi criada com sucesso.",
      });
    }

    setIsGoalDialogOpen(false);
    setEditingGoal(null);
    setFormData({ name: '', targetAmount: '', targetDate: null });
  };

  const handleEdit = (goal: any) => {
    setEditingGoal(goal.id);
    setFormData({
      name: goal.name,
      targetAmount: goal.targetAmount.toString(),
      targetDate: goal.targetDate ? new Date(goal.targetDate) : null,
    });
    setIsGoalDialogOpen(true);
  };

  const handleDelete = (goalId: string) => {
    removeSavingsGoal(goalId);
    toast({
      title: "Meta removida",
      description: "A meta de economia foi removida com sucesso.",
    });
  };

  const handleTransactionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGoal || !transactionData.amount || !transactionData.accountId) {
        toast({
            title: "Erro",
            description: "Preencha todos os campos para continuar.",
            variant: "destructive",
        });
        return;
    }

    const amount = parseFloat(transactionData.amount);
    const account = userAccounts.find(acc => acc.id === transactionData.accountId);
    const goal = savingsGoals.find(g => g.id === selectedGoal);

    if (!account || !goal) return;

    if (amount <= 0) {
      toast({ title: "Erro", description: "O valor deve ser maior que zero.", variant: "destructive" });
      return;
    }

    if (transactionType === 'add') {
        if (account.balance < amount) {
            toast({ title: "Saldo insuficiente", description: `Você não tem saldo suficiente na conta "${account.name}".`, variant: "destructive" });
            return;
        }
        addToSavingsGoal(selectedGoal, amount);
        // Aqui você também deveria atualizar o saldo da conta no seu estado global
        toast({ title: "Valor adicionado", description: `${formatCurrency(amount)} foi adicionado à sua caixinha.` });
    } else { // Withdraw
        if (goal.currentAmount < amount) {
            toast({ title: "Valor insuficiente", description: `Você não tem ${formatCurrency(amount)} para retirar desta caixinha.`, variant: "destructive" });
            return;
        }
        // Simulate withdraw function (since it doesn't exist in store)
        const newAmount = Math.max(goal.currentAmount - amount, 0);
        updateSavingsGoal(selectedGoal, { currentAmount: newAmount });
        // Aqui você também deveria atualizar o saldo da conta no seu estado global
        toast({ title: "Valor retirado", description: `${formatCurrency(amount)} foi retirado da sua caixinha.` });
    }

    setIsTransactionDialogOpen(false);
    setSelectedGoal(null);
    setTransactionData({ amount: '', accountId: '' });
  };

  const openTransactionDialog = (goalId: string, type: 'add' | 'withdraw') => {
      setSelectedGoal(goalId);
      setTransactionType(type);
      setIsTransactionDialogOpen(true);
  }

  const calculateProgress = (current: number, target: number) => {
    if (target === 0) return 0;
    return Math.min((current / target) * 100, 100);
  };

  const totalSaved = savingsGoals.reduce((total, goal) => total + goal.currentAmount, 0);
  const totalTarget = savingsGoals.reduce((total, goal) => total + goal.targetAmount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Caixinhas</h1>
          <p className="text-muted-foreground">
            Defina e acompanhe suas metas de economia.
          </p>
        </div>
        <Dialog open={isGoalDialogOpen} onOpenChange={setIsGoalDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary">
              <Plus className="mr-2 h-4 w-4" />
              Nova Meta
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {editingGoal ? 'Editar Meta' : 'Nova Meta de Economia'}
              </DialogTitle>
              <DialogDescription>
                {editingGoal
                  ? 'Edite os dados da sua meta de economia.'
                  : 'Crie uma nova meta para organizar suas economias.'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleGoalSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome da Meta</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Viagem, Carro novo..."
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="targetAmount">Valor Alvo (R$)</Label>
                <Input
                  id="targetAmount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={formData.targetAmount}
                  onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                  placeholder="0,00"
                  required
                />
              </div>
               <div className="space-y-2">
                <Label htmlFor="targetDate">Data Alvo</Label>
                 <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.targetDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.targetDate ? format(formData.targetDate, "PPP", { locale: ptBR }) : <span>Escolha uma data</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.targetDate}
                        onSelect={(date) => setFormData({ ...formData, targetDate: date || null })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
              </div>
              <DialogFooter>
                <Button type="submit" className="bg-gradient-primary">
                  {editingGoal ? 'Salvar Alterações' : 'Criar Meta'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Card */}
      {savingsGoals.length > 0 && (
        <Card className="bg-gradient-card shadow-medium">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Resumo das Economias
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 grid-cols-2 md:grid-cols-3">
              <div className="text-center p-2 rounded-lg bg-background/50">
                <p className="text-2xl font-bold text-primary">
                  {savingsGoals.length}
                </p>
                <p className="text-sm text-muted-foreground">Metas Ativas</p>
              </div>
              <div className="text-center p-2 rounded-lg bg-background/50">
                <p className="text-2xl font-bold text-success">
                  {formatCurrency(totalSaved)}
                </p>
                <p className="text-sm text-muted-foreground">Total Guardado</p>
              </div>
              <div className="text-center p-2 rounded-lg bg-background/50 col-span-2 md:col-span-1">
                <p className="text-2xl font-bold text-amber-500">
                  {formatCurrency(totalTarget)}
                </p>
                <p className="text-sm text-muted-foreground">Meta Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Transaction Dialog */}
      <Dialog open={isTransactionDialogOpen} onOpenChange={setIsTransactionDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{transactionType === 'add' ? 'Adicionar Dinheiro' : 'Retirar Dinheiro'}</DialogTitle>
            <DialogDescription>
                {transactionType === 'add' ? 'Quanto você quer adicionar à sua caixinha?' : 'Quanto você quer retirar da sua caixinha?'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleTransactionSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="amount">Valor (R$)</Label>
                <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={transactionData.amount}
                    onChange={(e) => setTransactionData({ ...transactionData, amount: e.target.value })}
                    placeholder="0,00"
                    required
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="account">
                    {transactionType === 'add' ? 'Retirar da conta' : 'Enviar para a conta'}
                </Label>
                <Select
                    value={transactionData.accountId}
                    onValueChange={(value) => setTransactionData({ ...transactionData, accountId: value })}
                >
                    <SelectTrigger id="account">
                        <SelectValue placeholder="Selecione uma conta" />
                    </SelectTrigger>
                    <SelectContent>
                        {userAccounts.map(account => (
                            <SelectItem key={account.id} value={account.id}>
                                {account.name} ({formatCurrency(account.balance)})
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <DialogFooter>
              <Button type="submit" className={transactionType === 'add' ? 'bg-gradient-success' : 'bg-gradient-destructive'}>
                {transactionType === 'add' ? <ArrowUp className="mr-2 h-4 w-4" /> : <ArrowDown className="mr-2 h-4 w-4" />}
                {transactionType === 'add' ? 'Adicionar' : 'Retirar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {savingsGoals.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {savingsGoals.map((goal) => {
            const progress = calculateProgress(goal.currentAmount, goal.targetAmount);
            const isCompleted = goal.currentAmount >= goal.targetAmount;
            return (
              <Card
                key={goal.id}
                className={`bg-gradient-card shadow-medium transition-all hover:shadow-large flex flex-col ${
                  isCompleted ? 'ring-2 ring-success/50' : ''
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <PiggyBank className={`h-5 w-5 ${isCompleted ? 'text-success' : 'text-primary'}`} />
                      <CardTitle className="text-lg">{goal.name}</CardTitle>
                    </div>
                    {isCompleted && (
                      <div className="bg-success text-success-foreground text-xs px-2 py-1 rounded-full">
                        Concluída!
                      </div>
                    )}
                   </div>
                </CardHeader>
                <CardContent className="space-y-4 flex-grow flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progresso</span>
                      <span className="font-medium">{progress.toFixed(1)}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-success">
                        {formatCurrency(goal.currentAmount)}
                      </span>
                      <span className="text-muted-foreground">
                        de {formatCurrency(goal.targetAmount)}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openTransactionDialog(goal.id, 'add')}
                      className="flex-1 text-success border-success hover:bg-success/10"
                      disabled={isCompleted}
                    >
                      <ArrowUp className="mr-1 h-3 w-3" />
                      Adicionar
                    </Button>
                     <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openTransactionDialog(goal.id, 'withdraw')}
                      className="flex-1 text-destructive border-destructive hover:bg-destructive/10"
                      disabled={goal.currentAmount <= 0}
                    >
                      <ArrowDown className="mr-1 h-3 w-3" />
                      Retirar
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => handleEdit(goal)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => handleDelete(goal.id)} className="text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="bg-gradient-card shadow-medium">
          <CardContent className="text-center py-12">
            <PiggyBank className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Nenhuma meta de economia criada</h3>
            <p className="text-muted-foreground mb-6">
              Comece definindo uma meta para organizar suas economias.
            </p>
            <Button onClick={() => setIsGoalDialogOpen(true)} className="bg-gradient-primary">
              <Plus className="mr-2 h-4 w-4" />
              Criar primeira meta
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
