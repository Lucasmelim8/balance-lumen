import { useState, useMemo } from 'react';
import { Plus, Edit, Trash2, PiggyBank, TrendingUp, Coins, ArrowRight, ArrowLeft, Calendar } from 'lucide-react';
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
  DialogClose,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';


// --- Simulação do Store (Zustand) e Hooks ---
const mockAccounts = [
  { id: 'acc1', name: 'Conta Corrente', balance: 5420.50 },
  { id: 'acc2', name: 'Poupança', balance: 12345.00 },
];

const mockSavingsGoals = [
    { id: 'sg1', name: 'Viagem para a Praia', targetAmount: 3000, currentAmount: 750, targetDate: '2025-12-20' },
    { id: 'sg2', name: 'Novo Celular', targetAmount: 5000, currentAmount: 5000, targetDate: '2025-10-01' },
];

const useFinanceStore = () => {
  const [savingsGoals, setSavingsGoals] = useState(mockSavingsGoals);
  const [accounts, setAccounts] = useState(mockAccounts);

  const addSavingsGoal = (goal: any) => {
    setSavingsGoals(prev => [...prev, { ...goal, id: Date.now().toString() }]);
  };

  const updateSavingsGoal = (id: string, updatedData: any) => {
    setSavingsGoals(prev => prev.map(g => g.id === id ? { ...g, ...updatedData } : g));
  };

  const removeSavingsGoal = (id: string) => {
    setSavingsGoals(prev => prev.filter(g => g.id !== id));
  };

  const moveMoneyInSavings = (goalId: string, accountId: string, amount: number, type: 'add' | 'withdraw') => {
    // Atualiza a caixinha
    setSavingsGoals(prev => prev.map(goal => {
        if (goal.id === goalId) {
            const newCurrentAmount = type === 'add' ? goal.currentAmount + amount : goal.currentAmount - amount;
            return { ...goal, currentAmount: Math.max(0, newCurrentAmount) };
        }
        return goal;
    }));
    // Atualiza a conta
    setAccounts(prev => prev.map(account => {
        if (account.id === accountId) {
            const newBalance = type === 'add' ? account.balance - amount : account.balance + amount;
            return { ...account, balance: newBalance };
        }
        return account;
    }));
  };

  return { savingsGoals, accounts, addSavingsGoal, updateSavingsGoal, removeSavingsGoal, moveMoneyInSavings };
};

const useToast = () => ({
    toast: (options: { title: string, description: string, variant?: string }) => {
        console.log(`Toast: ${options.title} - ${options.description}`);
    }
});
// --- Fim da Simulação ---

export default function Savings() {
  const { savingsGoals, accounts, addSavingsGoal, updateSavingsGoal, removeSavingsGoal, moveMoneyInSavings } = useFinanceStore();
  const { toast } = useToast();
  
  const [isGoalDialogOpen, setIsGoalDialogOpen] = useState(false);
  const [isMoveMoneyDialogOpen, setIsMoveMoneyDialogOpen] = useState(false);
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  
  const [goalFormData, setGoalFormData] = useState({
    name: '',
    targetAmount: '',
    targetDate: '',
  });

  const [moveMoneyData, setMoveMoneyData] = useState({
    goalId: '',
    amount: '',
    accountId: '',
    actionType: 'add' as 'add' | 'withdraw',
  });

  const totalSaved = useMemo(() => savingsGoals.reduce((sum, goal) => sum + goal.currentAmount, 0), [savingsGoals]);
  const totalTarget = useMemo(() => savingsGoals.reduce((sum, goal) => sum + goal.targetAmount, 0), [savingsGoals]);

  const formatCurrency = (amount: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount);
  const formatDate = (dateString: string) => dateString ? new Date(dateString).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : 'Sem prazo';

  const handleOpenGoalDialog = (goal: any | null = null) => {
    if (goal) {
      setEditingGoalId(goal.id);
      setGoalFormData({
        name: goal.name,
        targetAmount: goal.targetAmount.toString(),
        targetDate: goal.targetDate ? new Date(goal.targetDate).toISOString().split('T')[0] : '',
      });
    } else {
      setEditingGoalId(null);
      setGoalFormData({ name: '', targetAmount: '', targetDate: '' });
    }
    setIsGoalDialogOpen(true);
  };

  const handleGoalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalFormData.name.trim() || !goalFormData.targetAmount) {
      toast({ title: "Erro", description: "Nome e valor alvo são obrigatórios", variant: "destructive" });
      return;
    }

    const goalData = {
      name: goalFormData.name,
      targetAmount: parseFloat(goalFormData.targetAmount),
      targetDate: goalFormData.targetDate,
    };

    if (editingGoalId) {
      updateSavingsGoal(editingGoalId, goalData);
      toast({ title: "Meta atualizada", description: "Sua meta foi atualizada com sucesso." });
    } else {
      addSavingsGoal({ ...goalData, currentAmount: 0, createdAt: new Date().toISOString() });
      toast({ title: "Meta criada", description: "Sua nova meta de economia foi criada." });
    }
    setIsGoalDialogOpen(false);
  };

  const handleDeleteGoal = (goalId: string) => {
    removeSavingsGoal(goalId);
    toast({ title: "Meta removida", description: "A meta de economia foi removida." });
  };

  const handleOpenMoveMoneyDialog = (goalId: string, actionType: 'add' | 'withdraw') => {
    setMoveMoneyData({ goalId, actionType, amount: '', accountId: '' });
    setIsMoveMoneyDialogOpen(true);
  };

  const handleMoveMoneySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { goalId, accountId, amount, actionType } = moveMoneyData;
    const numericAmount = parseFloat(amount);
    const selectedAccount = accounts.find(acc => acc.id === accountId);
    const selectedGoal = savingsGoals.find(g => g.id === goalId);

    if (!goalId || !accountId || !numericAmount || numericAmount <= 0) {
      toast({ title: "Erro", description: "Preencha todos os campos com valores válidos.", variant: "destructive" });
      return;
    }
    
    if (actionType === 'withdraw' && selectedGoal && numericAmount > selectedGoal.currentAmount) {
        toast({ title: "Saldo insuficiente", description: "Você não pode retirar mais do que o valor atual da caixinha.", variant: "destructive" });
        return;
    }

    if (actionType === 'add' && selectedAccount && numericAmount > selectedAccount.balance) {
        toast({ title: "Saldo insuficiente", description: "O saldo da conta selecionada é insuficiente.", variant: "destructive" });
        return;
    }

    moveMoneyInSavings(goalId, accountId, numericAmount, actionType);
    toast({ title: "Sucesso!", description: `Valor de ${formatCurrency(numericAmount)} foi ${actionType === 'add' ? 'adicionado' : 'retirado'}.` });
    setIsMoveMoneyDialogOpen(false);
  };

  const calculateProgress = (current: number, target: number) => Math.min((current / target) * 100, 100);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Caixinha</h1>
          <p className="text-muted-foreground">Defina e acompanhe suas metas de economia</p>
        </div>
        <Button onClick={() => handleOpenGoalDialog()} className="bg-gradient-primary">
          <Plus className="mr-2 h-4 w-4" /> Nova Meta
        </Button>
      </div>

      {savingsGoals.length > 0 && (
        <Card className="bg-gradient-card shadow-medium">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5" /> Resumo das Economias</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center"><p className="text-2xl font-bold text-primary">{savingsGoals.length}</p><p className="text-sm text-muted-foreground">Metas Ativas</p></div>
              <div className="text-center"><p className="text-2xl font-bold text-success">{formatCurrency(totalSaved)}</p><p className="text-sm text-muted-foreground">Total Economizado</p></div>
              <div className="text-center"><p className="text-2xl font-bold text-warning">{formatCurrency(totalTarget)}</p><p className="text-sm text-muted-foreground">Meta Total</p></div>
            </div>
          </CardContent>
        </Card>
      )}

      {savingsGoals.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {savingsGoals.map((goal) => {
            const progress = calculateProgress(goal.currentAmount, goal.targetAmount);
            const isCompleted = goal.currentAmount >= goal.targetAmount;
            return (
              <Card key={goal.id} className={`bg-gradient-card shadow-medium transition-all hover:shadow-large ${isCompleted ? 'ring-2 ring-success/50' : ''}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <PiggyBank className={`h-6 w-6 ${isCompleted ? 'text-success' : 'text-primary'}`} />
                      <div>
                        <CardTitle className="text-lg">{goal.name}</CardTitle>
                        <CardDescription className="flex items-center text-xs gap-1"><Calendar className="h-3 w-3" /> {formatDate(goal.targetDate)}</CardDescription>
                      </div>
                    </div>
                    {isCompleted && <div className="bg-success text-success-foreground text-xs px-2 py-1 rounded-full">Concluída!</div>}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">Progresso</span><span className="font-medium">{progress.toFixed(1)}%</span></div>
                    <Progress value={progress} className="h-2" />
                    <div className="flex justify-between text-sm"><span className="font-medium text-success">{formatCurrency(goal.currentAmount)}</span><span className="text-muted-foreground">de {formatCurrency(goal.targetAmount)}</span></div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => handleOpenMoveMoneyDialog(goal.id, 'add')} variant="outline" size="sm" className="flex-1 text-success border-success hover:bg-success/10" disabled={isCompleted}><Plus className="mr-1 h-3 w-3" /> Adicionar</Button>
                    <Button onClick={() => handleOpenMoveMoneyDialog(goal.id, 'withdraw')} variant="outline" size="sm" className="flex-1 text-destructive border-destructive hover:bg-destructive/10" disabled={goal.currentAmount <= 0}><ArrowLeft className="mr-1 h-3 w-3" /> Retirar</Button>
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleOpenGoalDialog(goal)}><Edit className="h-4 w-4" /></Button>
                    <Button variant="outline" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDeleteGoal(goal.id)}><Trash2 className="h-4 w-4" /></Button>
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
            <p className="text-muted-foreground mb-6">Comece definindo uma meta para organizar suas economias e alcançar seus objetivos</p>
            <Button onClick={() => handleOpenGoalDialog()} className="bg-gradient-primary"><Plus className="mr-2 h-4 w-4" /> Criar primeira meta</Button>
          </CardContent>
        </Card>
      )}

      {/* Dialog para Criar/Editar Meta */}
      <Dialog open={isGoalDialogOpen} onOpenChange={setIsGoalDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingGoalId ? 'Editar Meta' : 'Nova Meta de Economia'}</DialogTitle>
            <DialogDescription>{editingGoalId ? 'Edite os dados da meta de economia' : 'Crie uma nova meta para organizar suas economias'}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleGoalSubmit} className="space-y-4">
            <div className="space-y-2"><Label htmlFor="name">Nome da Meta</Label><Input id="name" value={goalFormData.name} onChange={(e) => setGoalFormData({ ...goalFormData, name: e.target.value })} placeholder="Ex: Viagem, Carro novo..." required /></div>
            <div className="space-y-2"><Label htmlFor="targetAmount">Valor Alvo (R$)</Label><Input id="targetAmount" type="number" step="0.01" min="0" value={goalFormData.targetAmount} onChange={(e) => setGoalFormData({ ...goalFormData, targetAmount: e.target.value })} placeholder="0,00" required /></div>
            <div className="space-y-2"><Label htmlFor="targetDate">Data Alvo</Label><Input id="targetDate" type="date" value={goalFormData.targetDate} onChange={(e) => setGoalFormData({ ...goalFormData, targetDate: e.target.value })} /></div>
            <DialogFooter><DialogClose asChild><Button type="button" variant="secondary">Cancelar</Button></DialogClose><Button type="submit" className="bg-gradient-primary">{editingGoalId ? 'Salvar Alterações' : 'Criar Meta'}</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Dialog para Adicionar/Retirar Dinheiro */}
      <Dialog open={isMoveMoneyDialogOpen} onOpenChange={setIsMoveMoneyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{moveMoneyData.actionType === 'add' ? 'Adicionar Dinheiro' : 'Retirar Dinheiro'}</DialogTitle>
            <DialogDescription>Selecione a conta e o valor para a movimentação.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleMoveMoneySubmit} className="space-y-4">
            <div className="space-y-2"><Label htmlFor="amount">Valor (R$)</Label><Input id="amount" type="number" step="0.01" min="0" value={moveMoneyData.amount} onChange={(e) => setMoveMoneyData({...moveMoneyData, amount: e.target.value})} placeholder="0,00" required /></div>
            <div className="space-y-2">
              <Label htmlFor="accountId">Conta</Label>
              <Select value={moveMoneyData.accountId} onValueChange={(value) => setMoveMoneyData({...moveMoneyData, accountId: value})}>
                <SelectTrigger><SelectValue placeholder="Selecione uma conta..." /></SelectTrigger>
                <SelectContent>{accounts.map(acc => <SelectItem key={acc.id} value={acc.id}>{acc.name} ({formatCurrency(acc.balance)})</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <DialogFooter>
                <DialogClose asChild><Button type="button" variant="secondary">Cancelar</Button></DialogClose>
                <Button type="submit" className={moveMoneyData.actionType === 'add' ? 'bg-gradient-success' : 'bg-gradient-destructive'}>
                    {moveMoneyData.actionType === 'add' ? <><Coins className="mr-2 h-4 w-4"/>Adicionar</>` : <><ArrowLeft className="mr-2 h-4 w-4"/>Retirar</>}
                </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
