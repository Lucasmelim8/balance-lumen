import { useMemo, useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Edit, Save, X, Calendar, StickyNote } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { useFinanceStore } from '@/store/financeStore';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay } from 'date-fns';
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
        if (currentWeek.length > 0 && getDay(day) === 1) { // 1 = Segunda-feira
            weeks.push(currentWeek);
            currentWeek = [];
        }
        currentWeek.push(day);
    });
    if (currentWeek.length > 0) {
        weeks.push(currentWeek);
    }
    return weeks;
};

export default function MonthDetail() {
  const { year, month } = useParams<{ year: string; month: string }>();
  const { transactions, categories, weeklyGoals, setWeeklyGoal, specialDates, monthlyNotes, setMonthlyNote } = useFinanceStore();

  const [editingGoals, setEditingGoals] = useState<Record<string, (number | undefined)[]>>({});
  const [editingMonthlyGoals, setEditingMonthlyGoals] = useState<Record<string, number | undefined>>({});
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
    const weeklyExp: Record<string, number[]> = {};
    const monthlyExp: Record<string, number> = {};
    expenseCategories.forEach(cat => {
        weeklyExp[cat.id] = Array(weeks.length).fill(0);
        monthlyExp[cat.id] = 0;
    });

    transactions.forEach(t => {
      const date = new Date(t.date);
      if (t.type === 'expense' && date.getFullYear() === numericYear && date.getMonth() === numericMonth) {
        if (t.paymentType === 'monthly') {
            monthlyExp[t.categoryId] = (monthlyExp[t.categoryId] || 0) + t.amount;
        } else {
            const weekIndex = weeks.findIndex(week => week.some(day => day.toDateString() === date.toDateString()));
            if (weekIndex !== -1 && weeklyExp[t.categoryId]) {
              weeklyExp[t.categoryId][weekIndex] += t.amount;
            }
        }
      }
    });
    return { weeklyExpenses: weeklyExp, monthlyExpenses: monthlyExp };
  }, [numericYear, numericMonth, transactions, expenseCategories, weeks]);

  const handleGoalChange = (categoryId: string, weekIndex: number, value: string) => {
    const newGoals = { ...editingGoals };
    if (!newGoals[categoryId]) {
      newGoals[categoryId] = Array(weeks.length).fill(undefined);
    }
    newGoals[categoryId][weekIndex] = parseFloat(value) || 0;
    setEditingGoals(newGoals);
  };

  const handleMonthlyGoalChange = (categoryId: string, value: string) => {
    const newMonthlyGoals = { ...editingMonthlyGoals };
    newMonthlyGoals[categoryId] = parseFloat(value) || 0;
    setEditingMonthlyGoals(newMonthlyGoals);
  };
  
  const handleSaveGoals = () => {
    const allCategoryIds = new Set([...Object.keys(editingGoals), ...Object.keys(editingMonthlyGoals)]);
  
    allCategoryIds.forEach(categoryId => {
      const weeklyAmounts = editingGoals[categoryId] || weeklyGoals.find(g => g.year === numericYear && g.month === numericMonth && g.categoryId === categoryId)?.weeklyAmounts || Array(weeks.length).fill(undefined);
      const monthlyAmount = editingMonthlyGoals[categoryId];
      
      const goalToSet: any = { year: numericYear, month: numericMonth, categoryId, weeklyAmounts };
      if (monthlyAmount !== undefined) {
        goalToSet.monthlyAmount = monthlyAmount;
      }
      setWeeklyGoal(goalToSet);
    });
  
    setIsEditing(false);
  };
  
  const handleCancelEdit = () => {
    setEditingGoals({});
    setEditingMonthlyGoals({});
    setIsEditing(false);
  }

  const handleStartEditing = () => {
    const initialGoals = expenseCategories.reduce((acc, category) => {
        const goal = weeklyGoals.find(g => g.year === numericYear && g.month === numericMonth && g.categoryId === category.id);
        acc[category.id] = goal ? [...goal.weeklyAmounts] : Array(weeks.length).fill(undefined);
        return acc;
    }, {} as Record<string, (number | undefined)[]>);

    const initialMonthlyGoals = expenseCategories.reduce((acc, category) => {
        const goal = weeklyGoals.find(g => g.year === numericYear && g.month === numericMonth && g.categoryId === category.id);
        acc[category.id] = goal?.monthlyAmount;
        return acc;
    }, {} as Record<string, number | undefined>);

    setEditingGoals(initialGoals);
    setEditingMonthlyGoals(initialMonthlyGoals);
    setIsEditing(true);
  }

  const handleSaveNote = () => {
    setMonthlyNote({ year: numericYear, month: numericMonth, content: noteContent });
  };
  
  const totalGoalsByWeek = useMemo(() => {
    return weeks.map((_, weekIndex) =>
      expenseCategories.reduce((sum, cat) => {
        const categoryGoals = isEditing
          ? editingGoals[cat.id] || []
          : weeklyGoals.find(g => g.year === numericYear && g.month === numericMonth && g.categoryId === cat.id)?.weeklyAmounts || [];
        return sum + (categoryGoals[weekIndex] || 0);
      }, 0)
    );
  }, [isEditing, editingGoals, weeklyGoals, expenseCategories, weeks, numericYear, numericMonth]);

  const totalMonthlyGoals = useMemo(() => {
    return expenseCategories.reduce((sum, cat) => {
      const goal = isEditing 
        ? editingMonthlyGoals[cat.id]
        : weeklyGoals.find(g => g.year === numericYear && g.month === numericMonth && g.categoryId === cat.id)?.monthlyAmount;
      return sum + (goal || 0);
    }, 0);
  }, [isEditing, editingMonthlyGoals, weeklyGoals, expenseCategories, numericYear, numericMonth]);
  
  const grandTotalGoal = totalGoalsByWeek.reduce((sum, val) => sum + val, 0) + totalMonthlyGoals;

  const totalExpensesByWeek = useMemo(() => {
    return weeks.map((_, weekIndex) =>
      expenseCategories.reduce((sum, cat) => sum + (weeklyExpenses[cat.id]?.[weekIndex] || 0), 0)
    );
  }, [weeklyExpenses, expenseCategories, weeks]);
  
  const totalMonthlyExpenses = useMemo(() => {
    return expenseCategories.reduce((sum, cat) => sum + (monthlyExpenses[cat.id] || 0), 0)
  }, [monthlyExpenses, expenseCategories]);
  
  const grandTotalExpense = totalExpensesByWeek.reduce((sum, val) => sum + val, 0) + totalMonthlyExpenses;


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
                                <CardDescription>Defina seus limites de gastos para cada categoria.</CardDescription>
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
                                const categoryGoals = isEditing 
                                    ? (editingGoals[cat.id] || []) 
                                    : (weeklyGoals.find(g => g.year === numericYear && g.month === numericMonth && g.categoryId === cat.id)?.weeklyAmounts || []);
                                const monthlyGoal = isEditing
                                    ? editingMonthlyGoals[cat.id]
                                    : (weeklyGoals.find(g => g.year === numericYear && g.month === numericMonth && g.categoryId === cat.id)?.monthlyAmount);

                                const weeklyTotal = categoryGoals.reduce((sum, val) => sum + (val || 0), 0);
                                const totalGoal = weeklyTotal + (monthlyGoal || 0);

                                return (
                                <TableRow key={cat.id}>
                                    <TableCell className="font-medium">{cat.name}</TableCell>
                                    {weeks.map((_, weekIndex) => (
                                    <TableCell key={weekIndex} className="text-right">
                                        {isEditing ? (
                                        <Input 
                                            type="number"
                                            placeholder="0,00"
                                            defaultValue={categoryGoals[weekIndex] || ''}
                                            onChange={(e) => handleGoalChange(cat.id, weekIndex, e.target.value)}
                                            className="h-8 w-24 text-right ml-auto"
                                        />
                                        ) : (
                                        formatCurrency(categoryGoals[weekIndex] || 0)
                                        )}
                                    </TableCell>
                                    ))}
                                    <TableCell className="text-right">
                                        {isEditing ? (
                                        <Input 
                                            type="number"
                                            placeholder="0,00"
                                            defaultValue={monthlyGoal || ''}
                                            onChange={(e) => handleMonthlyGoalChange(cat.id, e.target.value)}
                                            className="h-8 w-24 text-right ml-auto"
                                        />
                                        ) : (
                                        formatCurrency(monthlyGoal || 0)
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right font-bold">{formatCurrency(totalGoal)}</TableCell>
                                </TableRow>
                                );
                            })}
                            </TableBody>
                             <TableFooter>
                                <TableRow className="font-bold bg-muted/50">
                                    <TableCell>Total</TableCell>
                                    {totalGoalsByWeek.map((total, weekIndex) => (
                                        <TableCell key={weekIndex} className="text-right">{formatCurrency(total)}</TableCell>
                                    ))}
                                    <TableCell className="text-right">{formatCurrency(totalMonthlyGoals)}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(grandTotalGoal)}</TableCell>
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
                                const monthlyTotal = (monthlyExpenses[cat.id] || 0);
                                const grandTotal = weeklyData.reduce((sum, val) => sum + val, 0) + monthlyTotal;
                                return (
                                <TableRow key={cat.id}>
                                    <TableCell className="font-medium">{cat.name}</TableCell>
                                    {weeklyData.map((amount, weekIndex) => (
                                        <TableCell key={weekIndex} className="text-right">{formatCurrency(amount)}</TableCell>
                                    ))}
                                    <TableCell className="text-right">{formatCurrency(monthlyTotal)}</TableCell>
                                    <TableCell className="text-right font-bold">{formatCurrency(grandTotal)}</TableCell>
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
                                    <TableCell className="text-right">{formatCurrency(totalMonthlyExpenses)}</TableCell>
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

