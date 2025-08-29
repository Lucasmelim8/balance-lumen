import { useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Edit, Plus, Save, X, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { useFinanceStore, Category, Transaction } from '@/store/financeStore';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const formatCurrency = (amount: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount);

export default function MonthDetail() {
  const { year, month } = useParams<{ year: string, month: string }>();
  const { transactions, categories, monthlyGoals, setMonthlyGoal } = useFinanceStore();

  const [editingGoals, setEditingGoals] = useState<Record<string, string>>({});
  const [isEditing, setIsEditing] = useState(false);

  const numericYear = parseInt(year || '0');
  const numericMonth = parseInt(month || '0');

  const monthName = format(new Date(numericYear, numericMonth), 'MMMM', { locale: ptBR });
  const expenseCategories = categories.filter(c => c.type === 'expense');

  const monthlyData = useMemo(() => {
    const relevantTransactions = transactions.filter(t => {
      const date = new Date(t.date);
      return date.getFullYear() === numericYear && date.getMonth() === numericMonth;
    });

    const expensesByCategory: Record<string, { total: number, transactions: Transaction[] }> = {};
    let totalIncome = 0;
    let totalExpense = 0;

    relevantTransactions.forEach(t => {
      if (t.type === 'income') {
        totalIncome += t.amount;
      } else {
        if (!expensesByCategory[t.categoryId]) {
          expensesByCategory[t.categoryId] = { total: 0, transactions: [] };
        }
        expensesByCategory[t.categoryId].total += t.amount;
        expensesByCategory[t.categoryId].transactions.push(t);
        totalExpense += t.amount;
      }
    });

    return { expensesByCategory, totalIncome, totalExpense, balance: totalIncome - totalExpense };
  }, [numericYear, numericMonth, transactions]);

  const handleGoalChange = (categoryId: string, value: string) => {
    setEditingGoals(prev => ({ ...prev, [categoryId]: value }));
  };
  
  const handleSaveGoals = () => {
    Object.entries(editingGoals).forEach(([categoryId, amountStr]) => {
      const amount = parseFloat(amountStr) || 0;
      setMonthlyGoal({ year: numericYear, month: numericMonth, categoryId, amount });
    });
    setIsEditing(false);
  };
  
  const handleCancelEdit = () => {
    setEditingGoals({});
    setIsEditing(false);
  }

  const handleStartEditing = () => {
    const initialEditingGoals = expenseCategories.reduce((acc, category) => {
        const goal = monthlyGoals.find(g => g.year === numericYear && g.month === numericMonth && g.categoryId === category.id);
        acc[category.id] = goal ? goal.amount.toString() : '0';
        return acc;
    }, {} as Record<string, string>);
    setEditingGoals(initialEditingGoals);
    setIsEditing(true);
  }

  const totalGoal = expenseCategories.reduce((sum, cat) => {
      const goal = monthlyGoals.find(g => g.year === numericYear && g.month === numericMonth && g.categoryId === cat.id);
      return sum + (goal?.amount || 0);
  }, 0);
  const totalActual = monthlyData.totalExpense;
  
  return (
    <div className="space-y-6">
      <div>
        <Button variant="ghost" asChild className="mb-4">
          <Link to="/reports"><ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Relatórios</Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight capitalize">{monthName} de {year}</h1>
        <p className="text-muted-foreground">Detalhes de suas finanças para o mês selecionado.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
          <Card><CardHeader><CardTitle>Receitas</CardTitle></CardHeader><CardContent className="text-2xl font-bold text-success">{formatCurrency(monthlyData.totalIncome)}</CardContent></Card>
          <Card><CardHeader><CardTitle>Despesas</CardTitle></CardHeader><CardContent className="text-2xl font-bold text-destructive">{formatCurrency(monthlyData.totalExpense)}</CardContent></Card>
          <Card><CardHeader><CardTitle>Saldo</CardTitle></CardHeader><CardContent className={`text-2xl font-bold ${monthlyData.balance >= 0 ? 'text-foreground' : 'text-destructive'}`}>{formatCurrency(monthlyData.balance)}</CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Metas vs. Gastos Reais</CardTitle>
              <CardDescription>Compare o planejado com o que foi efetivamente gasto.</CardDescription>
            </div>
            {isEditing ? (
                 <div className="flex gap-2">
                    <Button size="sm" onClick={handleSaveGoals}><Save className="mr-2 h-4 w-4"/> Salvar</Button>
                    <Button size="sm" variant="outline" onClick={handleCancelEdit}><X className="mr-2 h-4 w-4"/> Cancelar</Button>
                 </div>
            ) : (
                <Button size="sm" variant="outline" onClick={handleStartEditing}><Edit className="mr-2 h-4 w-4"/> Definir Metas</Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Categoria</TableHead>
                <TableHead className="text-right">Meta</TableHead>
                <TableHead className="text-right">Realizado</TableHead>
                <TableHead className="text-right">Diferença</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenseCategories.map(category => {
                const goal = monthlyGoals.find(g => g.year === numericYear && g.month === numericMonth && g.categoryId === category.id);
                const actual = monthlyData.expensesByCategory[category.id]?.total || 0;
                const goalAmount = isEditing ? parseFloat(editingGoals[category.id]) || 0 : goal?.amount || 0;
                const difference = goalAmount - actual;
                return (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell className="text-right">
                        {isEditing ? (
                            <Input 
                                type="number" 
                                value={editingGoals[category.id] || ''} 
                                onChange={(e) => handleGoalChange(category.id, e.target.value)}
                                className="h-8 text-right"
                                placeholder="0,00"
                            />
                        ) : (
                            formatCurrency(goalAmount)
                        )}
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(actual)}</TableCell>
                    <TableCell className={`text-right font-medium ${difference >= 0 ? 'text-success' : 'text-destructive'}`}>
                      {formatCurrency(difference)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
             <TableFooter>
                <TableRow className="font-bold text-base">
                    <TableCell>Total</TableCell>
                    <TableCell className="text-right">{formatCurrency(isEditing ? Object.values(editingGoals).reduce((s, a) => s + (parseFloat(a) || 0), 0) : totalGoal)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(totalActual)}</TableCell>
                    <TableCell className={`text-right ${totalGoal - totalActual >= 0 ? 'text-success' : 'text-destructive'}`}>
                        {formatCurrency(totalGoal - totalActual)}
                    </TableCell>
                </TableRow>
            </TableFooter>
          </Table>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Detalhes dos Gastos Reais</CardTitle>
          <CardDescription>Todas as despesas do mês, agrupadas por categoria.</CardDescription>
        </CardHeader>
        <CardContent>
          {expenseCategories.map(category => {
            const categoryExpenses = monthlyData.expensesByCategory[category.id];
            if (!categoryExpenses || categoryExpenses.transactions.length === 0) return null;

            return (
              <div key={category.id} className="mb-6">
                <h3 className="font-semibold text-lg mb-2">{category.name}</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categoryExpenses.transactions.map(t => (
                      <TableRow key={t.id}>
                        <TableCell>{format(new Date(t.date), 'dd/MM/yyyy', { locale: ptBR })}</TableCell>
                        <TableCell>{t.description}</TableCell>
                        <TableCell className="text-right text-destructive">{formatCurrency(t.amount)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                   <TableFooter>
                        <TableRow>
                            <TableCell colSpan={2} className="font-bold">Subtotal</TableCell>
                            <TableCell className="text-right font-bold">{formatCurrency(categoryExpenses.total)}</TableCell>
                        </TableRow>
                   </TableFooter>
                </Table>
              </div>
            );
          })}
           {monthlyData.totalExpense === 0 && <p className="text-center text-muted-foreground py-4">Nenhuma despesa registrada para este mês.</p>}
        </CardContent>
      </Card>
    </div>
  );
}
