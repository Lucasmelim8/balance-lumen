import React, { useState, createContext, useContext, useMemo } from 'react';
import { Plus, Edit, Trash2, PiggyBank, TrendingUp, ArrowDown, ArrowUp, Calendar as CalendarIcon, AlertTriangle } from 'lucide-react';
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// --- Início das Mocks e Simulações ---

// Mock para o hook useToast
const ToastContext = createContext({ toast: (options) => console.log('Toast:', options) });
const useToast = () => useContext(ToastContext);
const ToastProvider = ({ children }) => {
    const toast = (options) => {
        console.log(`TOAST: [${options.variant || 'default'}] ${options.title} - ${options.description}`);
    };
    return <ToastContext.Provider value={{ toast }}>{children}</ToastContext.Provider>;
};

// Mock para a store Zustand (useFinanceStore)
const useFinanceStore = () => {
    const [savingsGoals, setSavingsGoals] = useState([
        { id: 'goal1', name: 'Viagem para a Praia', currentAmount: 750, targetAmount: 2000, createdAt: new Date().toISOString(), targetDate: new Date(2025, 11, 20).toISOString() },
        { id: 'goal2', name: 'PC Novo', currentAmount: 3200, targetAmount: 5000, createdAt: new Date().toISOString(), targetDate: new Date(2025, 9, 15).toISOString() },
        { id: 'goal3', name: 'Meta Concluída', currentAmount: 1000, targetAmount: 1000, createdAt: new Date().toISOString(), targetDate: null },
    ]);

    const actions = useMemo(() => ({
        addSavingsGoal: (goal) => setSavingsGoals(prev => [...prev, { ...goal, id: `goal${Date.now()}` }]),
        updateSavingsGoal: (id, updatedGoal) => setSavingsGoals(prev => prev.map(g => g.id === id ? { ...g, ...updatedGoal } : g)),
        removeSavingsGoal: (id) => setSavingsGoals(prev => prev.filter(g => g.id !== id)),
        addToSavingsGoal: (id, amount) => setSavingsGoals(prev => prev.map(g => g.id === id ? { ...g, currentAmount: g.currentAmount + amount } : g)),
        withdrawFromSavingsGoal: (id, amount) => setSavingsGoals(prev => prev.map(g => g.id === id ? { ...g, currentAmount: g.currentAmount - amount } : g)),
    }), []);

    return { savingsGoals, ...actions };
};

// Mock para a função utilitária cn (classnames)
const cn = (...inputs) => {
  return inputs.filter(Boolean).join(' ');
}

// Mock de componentes UI (simulando shadcn/ui)
const Button = ({ children, className, ...props }) => <button className={cn("inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background px-4 py-2", className)} {...props}>{children}</button>;
const Input = ({ className, ...props }) => <input className={cn("flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50", className)} {...props} />;
const Label = (props) => <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" {...props} />;
const Card = ({ className, children }) => <div className={cn("rounded-xl border bg-card text-card-foreground shadow", className)}>{children}</div>;
const CardHeader = ({ children, className }) => <div className={cn("flex flex-col space-y-1.5 p-6", className)}>{children}</div>;
const CardTitle = ({ children, className }) => <h3 className={cn("font-semibold leading-none tracking-tight", className)}>{children}</h3>;
const CardDescription = ({ children, className }) => <p className={cn("text-sm text-muted-foreground", className)}>{children}</p>;
const CardContent = ({ children, className }) => <div className={cn("p-6 pt-0", className)}>{children}</div>;
const Progress = ({ value, className }) => <div className={cn("relative h-2 w-full overflow-hidden rounded-full bg-primary/20", className)}><div className="h-full w-full flex-1 bg-primary transition-all" style={{ transform: `translateX(-${100 - (value || 0)}%)` }}></div></div>;
const Dialog = ({ children, open, onOpenChange }) => open ? <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center" onClick={() => onOpenChange(false)}><div onClick={e => e.stopPropagation()}>{children}</div></div> : null;
const DialogContent = ({ children, className }) => <div className={cn("bg-card p-6 rounded-lg shadow-lg w-full max-w-lg", className)}>{children}</div>;
const DialogHeader = ({ children }) => <div className="flex flex-col space-y-2 text-center sm:text-left">{children}</div>;
const DialogTitle = ({ children }) => <h2 className="text-lg font-semibold">{children}</h2>;
const DialogDescription = ({ children }) => <p className="text-sm text-muted-foreground">{children}</p>;
const DialogFooter = ({ children }) => <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 pt-4">{children}</div>;
const DialogTrigger = ({ children, asChild, ...props }) => React.cloneElement(children, props);
const Popover = ({ children }) => <div className="relative inline-block">{children}</div>;
const PopoverTrigger = ({ children, asChild, ...props }) => React.cloneElement(children, props);
const PopoverContent = ({ children }) => <div className="absolute z-10 mt-1 rounded-md border bg-popover text-popover-foreground shadow-md">{children}</div>;
const Calendar = ({ selected, onSelect }) => <div className="bg-card p-2 rounded-md border">Simulação de Calendário</div>;

// Mock de contas do usuário
const userAccounts = [
    { id: 'acc1', name: 'Conta Corrente', balance: 5000 },
    { id: 'acc2', name: 'Poupança', balance: 15000 },
    { id: 'acc3', name: 'Carteira', balance: 350 },
];

// --- Fim das Mocks e Simulações ---

function Savings() {
  const { savingsGoals, addSavingsGoal, updateSavingsGoal, removeSavingsGoal, addToSavingsGoal, withdrawFromSavingsGoal } = useFinanceStore();
  const { toast } = useToast();

  const [isGoalDialogOpen, setIsGoalDialogOpen] = useState(false);
  const [isTransactionDialogOpen, setIsTransactionDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const [transactionType, setTransactionType] = useState<'add' | 'withdraw'>('add');
  const [editingGoal, setEditingGoal] = useState<string | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const [goalToDelete, setGoalToDelete] = useState<string | null>(null);

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
    setGoalToDelete(goalId);
    setIsDeleteDialogOpen(true);
  };
  
  const confirmDelete = () => {
    if (goalToDelete) {
        removeSavingsGoal(goalToDelete);
        toast({
            title: "Meta removida",
            description: "A meta de economia foi removida com sucesso.",
        });
        setIsDeleteDialogOpen(false);
        setGoalToDelete(null);
    }
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
        toast({ title: "Valor adicionado", description: `${formatCurrency(amount)} foi adicionado à sua caixinha.` });
    } else { // Withdraw
        if (goal.currentAmount < amount) {
            toast({ title: "Valor insuficiente", description: `Você não tem ${formatCurrency(amount)} para retirar desta caixinha.`, variant: "destructive" });
            return;
        }
        withdrawFromSavingsGoal(selectedGoal, amount);
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
    <div className="space-y-6 p-4 md:p-6 bg-background text-foreground">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Caixinhas</h1>
          <p className="text-muted-foreground">
            Defina e acompanhe suas metas de economia.
          </p>
        </div>
        <Dialog open={isGoalDialogOpen} onOpenChange={setIsGoalDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 text-white hover:bg-blue-700" onClick={() => setIsGoalDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Meta
            </Button>
          </DialogTrigger>
          <DialogContent>
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
                          "w-full justify-start text-left font-normal border-gray-300",
                          !formData.targetDate && "text-gray-500"
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
                <Button type="submit" className="bg-blue-600 text-white hover:bg-blue-700">
                  {editingGoal ? 'Salvar Alterações' : 'Criar Meta'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {savingsGoals.length > 0 && (
        <Card className="bg-card shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Resumo das Economias
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 grid-cols-2 md:grid-cols-3">
              <div className="text-center p-2 rounded-lg bg-gray-100">
                <p className="text-2xl font-bold text-blue-600">
                  {savingsGoals.length}
                </p>
                <p className="text-sm text-gray-500">Metas Ativas</p>
              </div>
              <div className="text-center p-2 rounded-lg bg-gray-100">
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(totalSaved)}
                </p>
                <p className="text-sm text-gray-500">Total Guardado</p>
              </div>
              <div className="text-center p-2 rounded-lg bg-gray-100 col-span-2 md:col-span-1">
                <p className="text-2xl font-bold text-amber-500">
                  {formatCurrency(totalTarget)}
                </p>
                <p className="text-sm text-gray-500">Meta Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={isTransactionDialogOpen} onOpenChange={setIsTransactionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{transactionType === 'add' ? 'Adicionar Dinheiro' : 'Retirar Dinheiro'}</DialogTitle>
            <DialogDescription>
                {transactionType === 'add' ? 'Quanto você quer adicionar à sua caixinha?' : 'Quanto você quer retirar da sua caixinha?'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleTransactionSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="amount">Valor (R$)</Label>
                <Input id="amount" type="number" step="0.01" min="0.01" value={transactionData.amount} onChange={(e) => setTransactionData({ ...transactionData, amount: e.target.value })} placeholder="0,00" required />
            </div>
            <div className="space-y-2">
                <Label htmlFor="account">
                    {transactionType === 'add' ? 'Retirar da conta' : 'Enviar para a conta'}
                </Label>
                <select id="account" value={transactionData.accountId} onChange={(e) => setTransactionData({ ...transactionData, accountId: e.target.value })} className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm">
                    <option value="" disabled>Selecione uma conta</option>
                    {userAccounts.map(account => (
                        <option key={account.id} value={account.id}>
                            {account.name} ({formatCurrency(account.balance)})
                        </option>
                    ))}
                </select>
            </div>
            <DialogFooter>
              <Button type="submit" className={transactionType === 'add' ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-red-600 text-white hover:bg-red-700'}>
                {transactionType === 'add' ? <ArrowUp className="mr-2 h-4 w-4" /> : <ArrowDown className="mr-2 h-4 w-4" />}
                {transactionType === 'add' ? 'Adicionar' : 'Retirar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="text-red-500" />
                    Confirmar Exclusão
                </DialogTitle>
                <DialogDescription>
                    Você tem certeza que deseja excluir esta meta? Todo o progresso será perdido e esta ação não pode ser desfeita.
                </DialogDescription>
            </DialogHeader>
            <DialogFooter className="pt-4">
                <Button className="bg-gray-200 hover:bg-gray-300 text-black" onClick={() => setIsDeleteDialogOpen(false)}>
                    Cancelar
                </Button>
                <Button onClick={confirmDelete} className="bg-red-600 hover:bg-red-700 text-white">
                    Excluir Meta
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

      {savingsGoals.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {savingsGoals.map((goal) => {
            const progress = calculateProgress(goal.currentAmount, goal.targetAmount);
            const isCompleted = goal.currentAmount >= goal.targetAmount;
            return (
              <Card key={goal.id} className={`bg-card shadow-md transition-all hover:shadow-lg flex flex-col ${isCompleted ? 'ring-2 ring-green-500/50' : ''}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <PiggyBank className={`h-5 w-5 ${isCompleted ? 'text-green-500' : 'text-blue-600'}`} />
                      <CardTitle className="text-lg">{goal.name}</CardTitle>
                    </div>
                    {isCompleted && (
                      <div className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                        Concluída!
                      </div>
                    )}
                  </div>
                   {goal.targetDate && (
                      <p className="text-xs text-gray-500 pt-1">
                          Meta para: {format(new Date(goal.targetDate), "dd/MM/yyyy")}
                      </p>
                  )}
                </CardHeader>
                <CardContent className="space-y-4 flex-grow flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Progresso</span>
                      <span className="font-medium">{progress.toFixed(1)}%</span>
                    </div>
                    <Progress value={progress} />
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-green-600">
                        {formatCurrency(goal.currentAmount)}
                      </span>
                      <span className="text-gray-500">
                        de {formatCurrency(goal.targetAmount)}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" onClick={() => openTransactionDialog(goal.id, 'add')} className="flex-1 text-green-600 border-green-600 hover:bg-green-500/10" disabled={isCompleted}>
                      <ArrowUp className="mr-1 h-3 w-3" /> Adicionar
                    </Button>
                     <Button variant="outline" size="sm" onClick={() => openTransactionDialog(goal.id, 'withdraw')} className="flex-1 text-red-600 border-red-600 hover:bg-red-500/10" disabled={goal.currentAmount <= 0}>
                      <ArrowDown className="mr-1 h-3 w-3" /> Retirar
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => handleEdit(goal)} className="border-gray-300"><Edit className="h-4 w-4" /></Button>
                    <Button variant="outline" size="icon" onClick={() => handleDelete(goal.id)} className="text-red-600 border-gray-300 hover:text-red-600"><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="bg-card shadow-md">
          <CardContent className="text-center py-12">
            <PiggyBank className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Nenhuma meta de economia criada</h3>
            <p className="text-gray-500 mb-6">
              Comece definindo uma meta para organizar suas economias.
            </p>
            <Button onClick={() => setIsGoalDialogOpen(true)} className="bg-blue-600 text-white hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" />
              Criar primeira meta
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Componente principal que renderiza a aplicação com os providers necessários
export default function App() {
    return (
        <ToastProvider>
            <Savings />
        </ToastProvider>
    )
}
