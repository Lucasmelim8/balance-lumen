import { useMemo, useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Edit, Save, X, Calendar, StickyNote } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { useFinanceStore } from '@/store/financeStore';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const formatCurrency = (amount: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount);

const getWeeksOfMonth = (year: number, month: number) => {
    const startDate = startOfMonth(new Date(year, month));
    const endDate = endOfMonth(new Date(year, month));
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    const weeks: Date[][] = [];
    let currentWeek: Date[] = [];

    // Agrupa os dias em semanas, começando na segunda-feira (1)
    days.forEach(day => {
        const dayOfWeek = getDay(day);
        const isMonday = dayOfWeek === 1; // 1 = Monday in date-fns

        if (currentWeek.length > 0 && isMonday) {
            weeks.push(currentWeek);
            currentWeek = [];
        }
        currentWeek.push(day);
    });
    if (currentWeek.length > 0) {
        weeks.push(currentWeek);
    }
    
    // Fix for 6 weeks issue: merge last two weeks if necessary
    if (weeks.length > 5) {
        const lastWeek = weeks.pop()!;
        weeks[4] = [...weeks[4], ...lastWeek];
    }
    
    return weeks;
};

export default function MonthDetail() {
  const { year, month } = useParams<{ year: string; month: string }>();
  const { transactions, categories, monthlyGoals, setMonthlyGoal, specialDates, monthlyNotes, setMonthlyNote } = useFinanceStore();

  const [editingGoals, setEditingGoals] = useState<Record<string, { weekly: (number | undefined)[], monthly?: number }>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [noteContent, setNoteContent] = useState('');

  const numericYear = parseInt(year || '0', 10);
  const numericMonth = parseInt(month || '0', 10);

  useEffect(() => {
    const note = monthlyNotes.find(n => n.year === numericYear && n.month === numericMonth);
    setNoteContent(note?.content || '');
  }, [numericYear, numericMonth, monthlyNotes]);

  const { monthName, weeks, relevantSpecialDates } = useMemo(() => {
    if (isNaN(numericYear) || isNaN(numericMonth) || numericMonth < 0 || numericMonth > 11) {
      return { monthName: '', weeks: [], relevantSpecialDates: [] };
    }
    const date = new Date(numericYear, numericMonth, 1);
    const weeksOfMonth = getWeeksOfMonth(numericYear, numericMonth);
    const monthNameStr = format(date, 'MMMM', { locale: ptBR });
    const relevantDates = specialDates.filter(d => {
        const specialDate = new Date(d.date);
        return specialDate.getFullYear() === numericYear && specialDate.getMonth() === numericMonth;
    });
    return { monthName: monthNameStr, weeks: weeksOfMonth, relevantSpecialDates: relevantDates };
  }, [numericYear, numericMonth, specialDates]);

  const expenseCategories = categories.filter(c => c.type === 'expense');

  const { weeklyExpenses, monthlyExpenses } = useMemo(() => {
    const expensesByWeek: Record<string, number[]> = {};
    const expensesByMonth: Record<string, number> = {};
    expenseCategories.forEach(cat => {
        expensesByWeek[cat.id] = Array(weeks.length).fill(0);
        expensesByMonth[cat.id] = 0;
    });

    transactions.forEach(t => {
      const date = new Date(t.date);
      // UTC fix for date comparison
      const transactionDate = addDays(date, 1);
      
      if (t.type === 'expense' && transactionDate.getFullYear() === numericYear && transactionDate.getMonth() === numericMonth) {
        if (t.paymentType === 'monthly' || t.paymentType === 'recurring') {
            expensesByMonth[t.categoryId] = (expensesByMonth[t.categoryId] || 0) + t.amount;
        } else {
            const weekIndex = weeks.findIndex(week => week.some(day => day.toDateString() === transactionDate.toDateString()));
            if (weekIndex !== -1 && expensesByWeek[t.categoryId]) {
                expensesByWeek[t.categoryId][weekIndex] += t.amount;
            }
        }
      }
    });
    return { weeklyExpenses: expensesByWeek, monthlyExpenses: expensesByMonth };
  }, [numericYear, numericMonth, transactions, expenseCategories, weeks]);

  const handleWeeklyGoalChange = (categoryId: string, weekIndex: number, value: string) => {
    setEditingGoals(prev => {
        const newGoals = { ...prev };
        const categoryGoal = newGoals[categoryId] || { weekly: Array(weeks.length).fill(undefined), monthly: undefined };
        categoryGoal.weekly[weekIndex] = parseFloat(value) || 0;
        newGoals[categoryId] = categoryGoal;
        return newGoals;
    });
  };

  const handleMonthlyGoalChange = (categoryId: string, value: string) => {
    setEditingGoals(prev => {
        const newGoals = { ...prev };
        const categoryGoal = newGoals[categoryId] || { weekly: Array(weeks.length).fill(undefined), monthly: undefined };
        categoryGoal.monthly = parseFloat(value) || 0;
        newGoals[categoryId] = categoryGoal;
        return newGoals;
    });
  };
  
  const handleSaveGoals = () => {
    Object.entries(editingGoals).forEach(([categoryId, { weekly, monthly }]) => {
      setMonthlyGoal({ year: numericYear, month: numericMonth, categoryId, weeklyAmounts: weekly, monthlyAmount: monthly });
    });
    setIsEditing(false);
  };
  
  const handleCancelEdit = () => {
    setEditingGoals({});
    setIsEditing(false);
  }

  const handleStartEditing = () => {
    const initialGoals = expenseCategories.reduce((acc, category) => {
        const goal = monthlyGoals.find(g => g.year === numericYear && g.month === numericMonth && g.categoryId === category.id);
        acc[category.id] = {
            weekly: goal ? [...goal.weeklyAmounts] : Array(weeks.length).fill(undefined),
            monthly: goal ? goal.monthlyAmount : undefined
        };
        return acc;
    }, {} as Record<string, { weekly: (number | undefined)[], monthly?: number }>);
    setEditingGoals(initialGoals);
    setIsEditing(true);
  }

  const handleSaveNote = () => {
    setMonthlyNote({ year: numericYear, month: numericMonth, content: noteContent });
  };
  
  const calculateTotals = (data: Record<string, number[] | number>, isWeekly: boolean) => {
    const weeklyTotals = isWeekly ? weeks.map((_, weekIndex) =>
      expenseCategories.reduce((sum, cat) => sum + ((data[cat.id] as number[])?.[weekIndex] || 0), 0)
    ) : [];
  
    const monthlyTotalCol = expenseCategories.reduce((sum, cat) => sum + (isWeekly ? 0 : (data[cat.id] as number) || 0), 0);
  
    const grandTotal = isWeekly
      ? weeklyTotals.reduce((s, t) => s + t, 0)
      : monthlyTotalCol;
  
    return { weeklyTotals, monthlyTotalCol, grandTotal };
  };

  if (!monthName) {
    return (
        <div>
            <Button variant="ghost" asChild className="mb-4">
                <Link to="/reports"><ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Relatórios</Link>
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">Data Inválida</h1>
            <p className="text-muted-foreground">O ano ou mês selecionado não é válido.</p>
        </div>
    )
  }

  return (
    <div className="space-y-6">
        <div>
            <Button variant="ghost" asChild className="mb-4">
            <Link to="/reports"><ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Relatórios</Link>
            </Button>
            <h1 className="text-3xl font-bold tracking-tight capitalize">{monthName} de {year}</h1>
            <p className="text-muted-foreground">Planeje e acompanhe seus gastos do mês.</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle>Planejamento de Metas</CardTitle>
                                <CardDescription>Defina seus limites de gastos.</CardDescription>
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
                                    {weeks.map((_, i) => <TableHead key={i} className="text-right">{i + 1}ª sem.</TableHead>)}
                                    <TableHead className="text-right">Mensal</TableHead>
                                    <TableHead className="text-right font-bold">Total</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                            {expenseCategories.map(cat => {
                                const goalData = isEditing
                                    ? editingGoals[cat.id]
                                    : monthlyGoals.find(g => g.year === numericYear && g.month === numericMonth && g.categoryId === cat.id);
                                
                                const weeklyAmounts = goalData?.weeklyAmounts || goalData?.weekly || [];
                                const monthlyAmount = goalData?.monthlyAmount || goalData?.monthly || 0;
                                const total = weeklyAmounts.reduce((s, v) => s + (v || 0), 0) + monthlyAmount;

                                return (
                                <TableRow key={cat.id}>
                                    <TableCell className="font-medium">{cat.name}</TableCell>
                                    {weeks.map((_, weekIndex) => (
                                    <TableCell key={weekIndex} className="text-right">
                                        {isEditing ? (
                                        <Input 
                                            type="number"
                                            placeholder="0,00"
                                            defaultValue={weeklyAmounts[weekIndex] || ''}
                                            onChange={(e) => handleWeeklyGoalChange(cat.id, weekIndex, e.target.value)}
                                            className="h-8 w-20 text-right ml-auto"
                                        />
                                        ) : formatCurrency(weeklyAmounts[weekIndex] || 0)}
                                    </TableCell>
                                    ))}
                                    <TableCell className="text-right">
                                        {isEditing ? (
                                        <Input 
                                            type="number"
                                            placeholder="0,00"
                                            defaultValue={monthlyAmount || ''}
                                            onChange={(e) => handleMonthlyGoalChange(cat.id, e.target.value)}
                                            className="h-8 w-20 text-right ml-auto"
                                        />
                                        ) : formatCurrency(monthlyAmount)}
                                    </TableCell>
                                    <TableCell className="text-right font-bold">{formatCurrency(total)}</TableCell>
                                </TableRow>
                                );
                            })}
                            </TableBody>
                             <TableFooter>
                                <TableRow className="font-bold bg-muted/50">
                                    <TableCell>Total</TableCell>
                                    {weeks.map((_, weekIndex) => {
                                        const weeklyTotal = expenseCategories.reduce((sum, cat) => {
                                            const goalData = isEditing ? editingGoals[cat.id] : monthlyGoals.find(g => g.year === numericYear && g.month === numericMonth && g.categoryId === cat.id);
                                            const weeklyAmounts = goalData?.weeklyAmounts || goalData?.weekly || [];
                                            return sum + (weeklyAmounts[weekIndex] || 0);
                                        }, 0);
                                        return <TableCell key={weekIndex} className="text-right">{formatCurrency(weeklyTotal)}</TableCell>;
                                    })}
                                    <TableCell className="text-right">{formatCurrency(expenseCategories.reduce((sum, cat) => {
                                        const goalData = isEditing ? editingGoals[cat.id] : monthlyGoals.find(g => g.year === numericYear && g.month === numericMonth && g.categoryId === cat.id);
                                        return sum + (goalData?.monthlyAmount || goalData?.monthly || 0);
                                    }, 0))}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(expenseCategories.reduce((sum, cat) => {
                                        const goalData = isEditing ? editingGoals[cat.id] : monthlyGoals.find(g => g.year === numericYear && g.month === numericMonth && g.categoryId === cat.id);
                                        const weeklyTotal = (goalData?.weeklyAmounts || goalData?.weekly || []).reduce((s, v) => s + (v || 0), 0);
                                        return sum + weeklyTotal + (goalData?.monthlyAmount || goalData?.monthly || 0);
                                    }, 0))}</TableCell>
                                </TableRow>
                            </TableFooter>
                        </Table>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle>Acompanhamento de Gastos Reais</CardTitle></CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Categoria</TableHead>
                                    {weeks.map((_, i) => <TableHead key={i} className="text-right">{i + 1}ª sem.</TableHead>)}
                                    <TableHead className="text-right">Mensal</TableHead>
                                    <TableHead className="text-right font-bold">Total</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                            {expenseCategories.map(cat => {
                                const weeklyData = weeklyExpenses[cat.id] || Array(weeks.length).fill(0);
                                const monthlyData = monthlyExpenses[cat.id] || 0;
                                const total = weeklyData.reduce((s, v) => s + v, 0) + monthlyData;
                                return (
                                <TableRow key={cat.id}>
                                    <TableCell className="font-medium">{cat.name}</TableCell>
                                    {weeklyData.map((amount, weekIndex) => (
                                        <TableCell key={weekIndex} className="text-right">{formatCurrency(amount)}</TableCell>
                                    ))}
                                    <TableCell className="text-right">{formatCurrency(monthlyData)}</TableCell>
                                    <TableCell className="text-right font-bold">{formatCurrency(total)}</TableCell>
                                </TableRow>
                                );
                            })}
                            </TableBody>
                            <TableFooter>
                                <TableRow className="font-bold bg-muted/50">
                                    <TableCell>Total</TableCell>
                                    {totalExpensesByWeek.map((total, weekIndex) => (
                                        <TableCell key={weekIndex} className="text-right">{formatCurrency(total)}</TableCell>
                                    ))}
                                    <TableCell className="text-right">{formatCurrency(Object.values(monthlyExpenses).reduce((s, v) => s + v, 0))}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(grandTotalExpense)}</TableCell>
                                </TableRow>
                            </TableFooter>
                        </Table>
                    </CardContent>
                </Card>
            </div>
            <div className="lg:col-span-1 space-y-6">
                <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2"><StickyNote className="h-5 w-5"/>Anotações do Mês</CardTitle></CardHeader>
                    <CardContent className="space-y-2">
                        <Textarea 
                            placeholder="Adicione suas anotações para este mês..." 
                            rows={5}
                            value={noteContent}
                            onChange={(e) => setNoteContent(e.target.value)}
                        />
                        <Button onClick={handleSaveNote} className="w-full">Salvar Anotação</Button>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5"/>Datas Especiais</CardTitle></CardHeader>
                    <CardContent>
                        {relevantSpecialDates.length > 0 ? (
                            <ul className="space-y-2">
                                {relevantSpecialDates.map(d => (
                                    <li key={d.id} className="text-sm">
                                        <span className="font-semibold">{format(new Date(d.date), 'dd/MM')}</span>: {d.name}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-muted-foreground">Nenhuma data especial este mês.</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    </div>
  );
}

