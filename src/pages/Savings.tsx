import { useState } from 'react';
import { Plus, Edit, Trash2, PiggyBank, TrendingUp, Coins, ArrowDown, ArrowUp, Calendar as CalendarIcon, History, Clock } from 'lucide-react';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
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


export default function Savings() {
  const { 
    savingsGoals, 
    savingsMovements,
    accounts, 
    addSavingsGoal, 
    updateSavingsGoal, 
    removeSavingsGoal, 
    addSavingsMovement,
    updateSavingsMovement,
    removeSavingsMovement,
    getSavingsMovementsByGoal
  } = useFinanceStore();
  const { toast } = useToast();

  const [isGoalDialogOpen, setIsGoalDialogOpen] = useState(false);
  const [isTransactionDialogOpen, setIsTransactionDialogOpen] = useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [isEditMovementDialogOpen, setIsEditMovementDialogOpen] = useState(false);
  const [transactionType, setTransactionType] = useState<'add' | 'withdraw'>('add');
  const [deleteGoalId, setDeleteGoalId] = useState<string | null>(null);
  const [editingMovementId, setEditingMovementId] = useState<string | null>(null);

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
    note: '',
  });

  const [editMovementData, setEditMovementData] = useState({
    amount: '',
    accountId: '',
    note: '',
    date: '',
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

  const handleDelete = async (goalId: string) => {
    await removeSavingsGoal(goalId);
    toast({
      title: "Meta removida",
      description: "A meta de economia foi removida com sucesso.",
    });
    setDeleteGoalId(null);
  };


  const handleTransactionSubmit = async (e: React.FormEvent) => {
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
    const account = accounts.find(acc => acc.id === transactionData.accountId);
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
    } else { // Withdraw
        if (goal.currentAmount < amount) {
            toast({ title: "Valor insuficiente", description: `Você não tem ${formatCurrency(amount)} para retirar desta caixinha.`, variant: "destructive" });
            return;
        }
    }

    // Create savings movement that will automatically update balances via triggers
    await addSavingsMovement({
        goalId: selectedGoal,
        accountId: transactionData.accountId,
        type: transactionType === 'add' ? 'deposit' : 'withdraw',
        amount: amount,
        date: new Date().toISOString(),
        note: transactionData.note || undefined
    });

    toast({ 
        title: transactionType === 'add' ? "Valor adicionado" : "Valor retirado", 
        description: `${formatCurrency(amount)} foi ${transactionType === 'add' ? 'adicionado à' : 'retirado da'} sua caixinha.` 
    });

    setIsTransactionDialogOpen(false);
    setSelectedGoal(null);
    setTransactionData({ amount: '', accountId: '', note: '' });
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
                        {accounts.map(account => (
                            <SelectItem key={account.id} value={account.id}>
                                {account.name} ({formatCurrency(account.balance)})
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
                <Label htmlFor="note">Observação (opcional)</Label>
                <Input
                    id="note"
                    value={transactionData.note}
                    onChange={(e) => setTransactionData({ ...transactionData, note: e.target.value })}
                    placeholder="Ex: Economias para viagem..."
                />
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
                     <Button 
                       variant="outline" 
                       size="icon" 
                       onClick={() => {setSelectedGoal(goal.id); setIsHistoryDialogOpen(true);}}
                       className="text-blue-600 hover:text-blue-600 border-blue-600 hover:bg-blue-50"
                     >
                       <History className="h-4 w-4" />
                     </Button>
                     <Button variant="outline" size="icon" onClick={() => handleEdit(goal)}>
                       <Edit className="h-4 w-4" />
                     </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="icon" className="text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Excluir caixinha</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja excluir a caixinha "{goal.name}"? 
                            {goal.currentAmount > 0 && ` Você tem ${formatCurrency(goal.currentAmount)} guardado nela.`}
                            Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleDelete(goal.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
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

      {/* History Dialog */}
      <Dialog open={isHistoryDialogOpen} onOpenChange={setIsHistoryDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Histórico de Movimentações
            </DialogTitle>
            <DialogDescription>
              {selectedGoal && savingsGoals.find(g => g.id === selectedGoal)?.name && 
                `Histórico da caixinha "${savingsGoals.find(g => g.id === selectedGoal)?.name}"`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedGoal && getSavingsMovementsByGoal(selectedGoal).length > 0 ? (
              <div className="space-y-3">
                {getSavingsMovementsByGoal(selectedGoal).map((movement) => {
                  const account = accounts.find(acc => acc.id === movement.accountId);
                  return (
                    <Card key={movement.id} className="bg-background border">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-full ${
                              movement.type === 'deposit' 
                                ? 'bg-success/10 text-success' 
                                : 'bg-destructive/10 text-destructive'
                            }`}>
                              {movement.type === 'deposit' ? (
                                <ArrowUp className="h-4 w-4" />
                              ) : (
                                <ArrowDown className="h-4 w-4" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium">
                                {movement.type === 'deposit' ? 'Depósito' : 'Retirada'}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {account?.name || 'Conta não encontrada'}
                              </p>
                              {movement.note && (
                                <p className="text-sm text-muted-foreground italic">
                                  {movement.note}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`font-semibold ${
                              movement.type === 'deposit' ? 'text-success' : 'text-destructive'
                            }`}>
                              {movement.type === 'deposit' ? '+' : '-'}{formatCurrency(movement.amount)}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(movement.date), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                            </p>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setEditingMovementId(movement.id);
                                setEditMovementData({
                                  amount: movement.amount.toString(),
                                  accountId: movement.accountId,
                                  note: movement.note || '',
                                  date: new Date(movement.date).toISOString().slice(0, 16)
                                });
                                setIsEditMovementDialogOpen(true);
                              }}
                              className="h-8 w-8"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Excluir Movimentação</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Tem certeza que deseja excluir esta movimentação? Os saldos da conta e caixinha serão ajustados automaticamente.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={async () => {
                                      await removeSavingsMovement(movement.id);
                                      toast({
                                        title: "Movimentação excluída",
                                        description: "A movimentação foi excluída e os saldos foram ajustados.",
                                      });
                                    }}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Excluir
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Clock className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhuma movimentação</h3>
                <p className="text-muted-foreground">
                  Ainda não há movimentações para esta caixinha.
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Movement Dialog */}
      <Dialog open={isEditMovementDialogOpen} onOpenChange={setIsEditMovementDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Editar Movimentação</DialogTitle>
            <DialogDescription>
              Altere os dados da movimentação. Os saldos serão ajustados automaticamente.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={async (e) => {
            e.preventDefault();
            if (!editingMovementId || !editMovementData.amount || !editMovementData.accountId) {
              toast({
                title: "Erro",
                description: "Preencha todos os campos obrigatórios.",
                variant: "destructive",
              });
              return;
            }

            const amount = parseFloat(editMovementData.amount);
            if (amount <= 0) {
              toast({
                title: "Erro",
                description: "O valor deve ser maior que zero.",
                variant: "destructive",
              });
              return;
            }

            await updateSavingsMovement(editingMovementId, {
              amount: amount,
              accountId: editMovementData.accountId,
              note: editMovementData.note || undefined,
              date: new Date(editMovementData.date).toISOString()
            });

            toast({
              title: "Movimentação atualizada",
              description: "A movimentação foi atualizada e os saldos foram ajustados.",
            });

            setIsEditMovementDialogOpen(false);
            setEditingMovementId(null);
            setEditMovementData({ amount: '', accountId: '', note: '', date: '' });
          }} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="editAmount">Valor (R$)</Label>
              <Input
                id="editAmount"
                type="number"
                step="0.01"
                min="0.01"
                value={editMovementData.amount}
                onChange={(e) => setEditMovementData({ ...editMovementData, amount: e.target.value })}
                placeholder="0,00"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editAccount">Conta</Label>
              <Select
                value={editMovementData.accountId}
                onValueChange={(value) => setEditMovementData({ ...editMovementData, accountId: value })}
              >
                <SelectTrigger id="editAccount">
                  <SelectValue placeholder="Selecione uma conta" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map(account => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name} ({formatCurrency(account.balance)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="editDate">Data e Hora</Label>
              <Input
                id="editDate"
                type="datetime-local"
                value={editMovementData.date}
                onChange={(e) => setEditMovementData({ ...editMovementData, date: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editNote">Observação (opcional)</Label>
              <Input
                id="editNote"
                value={editMovementData.note}
                onChange={(e) => setEditMovementData({ ...editMovementData, note: e.target.value })}
                placeholder="Ex: Economias para viagem..."
              />
            </div>
            <DialogFooter>
              <Button type="submit" className="bg-gradient-primary">
                Salvar Alterações
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
