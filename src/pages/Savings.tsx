import { useState } from 'react';
import { Plus, Edit, Trash2, PiggyBank, TrendingUp, Coins } from 'lucide-react';
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
import { useToast } from '@/hooks/use-toast';
import { useFinanceStore } from '@/store/financeStore';

export default function Savings() {
  const { savingsGoals, addSavingsGoal, updateSavingsGoal, removeSavingsGoal, 
          addToSavingsGoal } = useFinanceStore();
  const { toast } = useToast();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAddMoneyDialogOpen, setIsAddMoneyDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<string | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    targetAmount: '',
    currentAmount: '',
  });
  const [addAmount, setAddAmount] = useState('');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(amount);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.targetAmount) {
      toast({
        title: "Erro",
        description: "Nome e valor alvo são obrigatórios",
        variant: "destructive",
      });
      return;
    }

    const goalData = {
      name: formData.name,
      targetAmount: parseFloat(formData.targetAmount),
      currentAmount: parseFloat(formData.currentAmount) || 0,
      createdAt: new Date().toISOString(),
    };

    if (editingGoal) {
      updateSavingsGoal(editingGoal, goalData);
      toast({
        title: "Meta atualizada",
        description: "A meta de economia foi atualizada com sucesso",
      });
    } else {
      addSavingsGoal(goalData);
      toast({
        title: "Meta criada",
        description: "A nova meta de economia foi criada com sucesso",
      });
    }

    setIsDialogOpen(false);
    setEditingGoal(null);
    setFormData({
      name: '',
      targetAmount: '',
      currentAmount: '',
    });
  };

  const handleEdit = (goal: any) => {
    setEditingGoal(goal.id);
    setFormData({
      name: goal.name,
      targetAmount: goal.targetAmount.toString(),
      currentAmount: goal.currentAmount.toString(),
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (goalId: string) => {
    removeSavingsGoal(goalId);
    toast({
      title: "Meta removida",
      description: "A meta de economia foi removida com sucesso",
    });
  };

  const handleAddMoney = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedGoal || !addAmount) return;
    
    const amount = parseFloat(addAmount);
    if (amount <= 0) {
      toast({
        title: "Erro",
        description: "O valor deve ser maior que zero",
        variant: "destructive",
      });
      return;
    }

    addToSavingsGoal(selectedGoal, amount);
    toast({
      title: "Valor adicionado",
      description: `${formatCurrency(amount)} foi adicionado à sua caixinha`,
    });

    setIsAddMoneyDialogOpen(false);
    setSelectedGoal(null);
    setAddAmount('');
  };

  const calculateProgress = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Caixinha</h1>
          <p className="text-muted-foreground">
            Defina e acompanhe suas metas de economia
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary">
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
                  ? 'Edite os dados da meta de economia'
                  : 'Crie uma nova meta para organizar suas economias'
                }
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome da Meta</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Viagem, Carro novo, Emergência..."
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="targetAmount">Valor Alvo (R$)</Label>
                <Input
                  id="targetAmount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.targetAmount}
                  onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                  placeholder="0,00"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="currentAmount">Valor Atual (R$)</Label>
                <Input
                  id="currentAmount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.currentAmount}
                  onChange={(e) => setFormData({ ...formData, currentAmount: e.target.value })}
                  placeholder="0,00"
                />
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

      {/* Add Money Dialog */}
      <Dialog open={isAddMoneyDialogOpen} onOpenChange={setIsAddMoneyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Dinheiro</DialogTitle>
            <DialogDescription>
              Quanto você quer adicionar à sua caixinha?
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddMoney} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="addAmount">Valor (R$)</Label>
              <Input
                id="addAmount"
                type="number"
                step="0.01"
                min="0"
                value={addAmount}
                onChange={(e) => setAddAmount(e.target.value)}
                placeholder="0,00"
                required
              />
            </div>
            <DialogFooter>
              <Button type="submit" className="bg-gradient-success">
                <Coins className="mr-2 h-4 w-4" />
                Adicionar
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
                className={`bg-gradient-card shadow-medium transition-all hover:shadow-large ${
                  isCompleted ? 'ring-2 ring-success/50' : ''
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <PiggyBank className={`h-5 w-5 ${
                        isCompleted ? 'text-success' : 'text-primary'
                      }`} />
                      <CardTitle className="text-lg">{goal.name}</CardTitle>
                    </div>
                    {isCompleted && (
                      <div className="bg-success text-success-foreground text-xs px-2 py-1 rounded-full">
                        Concluída!
                      </div>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progresso</span>
                      <span className="font-medium">{progress.toFixed(1)}%</span>
                    </div>
                    <Progress 
                      value={progress} 
                      className="h-2"
                    />
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-success">
                        {formatCurrency(goal.currentAmount)}
                      </span>
                      <span className="text-muted-foreground">
                        de {formatCurrency(goal.targetAmount)}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedGoal(goal.id);
                        setIsAddMoneyDialogOpen(true);
                      }}
                      className="flex-1 text-success border-success hover:bg-success/10"
                      disabled={isCompleted}
                    >
                      <Plus className="mr-1 h-3 w-3" />
                      Adicionar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(goal)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(goal.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
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
              Comece definindo uma meta para organizar suas economias e alcançar seus objetivos
            </p>
            <Button onClick={() => setIsDialogOpen(true)} className="bg-gradient-primary">
              <Plus className="mr-2 h-4 w-4" />
              Criar primeira meta
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Statistics Card */}
      {savingsGoals.length > 0 && (
        <Card className="bg-gradient-card shadow-medium">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Resumo das Economias
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">
                  {savingsGoals.length}
                </p>
                <p className="text-sm text-muted-foreground">Metas Ativas</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-success">
                  {formatCurrency(
                    savingsGoals.reduce((total, goal) => total + goal.currentAmount, 0)
                  )}
                </p>
                <p className="text-sm text-muted-foreground">Total Economizado</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-warning">
                  {formatCurrency(
                    savingsGoals.reduce((total, goal) => total + goal.targetAmount, 0)
                  )}
                </p>
                <p className="text-sm text-muted-foreground">Meta Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}