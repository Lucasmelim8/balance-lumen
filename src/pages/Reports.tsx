import { useMemo, useState } from 'react';
import { BarChart, ArrowDown, ArrowUp, Minus } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useFinanceStore, Transaction, Category } from '@/store/financeStore';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Helper to format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(amount);
};

export default function Reports() {
  const { transactions, categories } = useFinanceStore();
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());

  // Memoize processed data for performance
  const reportData = useMemo(() => {
    const expenseCategories = categories.filter(c => c.type === 'expense');
    
    // Initialize data structures
    const monthlyExpenses: { [key: string]: { [key: number]: number } } = {};
    for (const category of expenseCategories) {
      monthlyExpenses[category.id] = {};
    }
    const monthlyExpenseTotals: { [key: number]: number } = {};
    const monthlyIncomeTotals: { [key: number]: number } = {};

    for (let i = 0; i < 12; i++) {
      monthlyExpenseTotals[i] = 0;
      monthlyIncomeTotals[i] = 0;
    }

    const filteredTransactions = transactions.filter(t => {
      const transactionYear = new Date(t.date).getFullYear().toString();
      return transactionYear === selectedYear;
    });

    for (const transaction of filteredTransactions) {
      const month = new Date(transaction.date).getMonth(); // 0-11
      
      if (transaction.type === 'expense') {
        if (!monthlyExpenses[transaction.categoryId]) {
            monthlyExpenses[transaction.categoryId] = {};
        }
        monthlyExpenses[transaction.categoryId][month] = (monthlyExpenses[transaction.categoryId][month] || 0) + transaction.amount;
        monthlyExpenseTotals[month] += transaction.amount;
      } else if (transaction.type === 'income') {
        monthlyIncomeTotals[month] += transaction.amount;
      }
    }
    
    const categoryTotals = expenseCategories.map(category => {
        const total = Object.values(monthlyExpenses[category.id] || {}).reduce((sum, amount) => sum + amount, 0);
        return { categoryId: category.id, total };
    });

    const overallTotalExpenses = Object.values(monthlyExpenseTotals).reduce((sum, total) => sum + total, 0);
    const overallTotalIncomes = Object.values(monthlyIncomeTotals).reduce((sum, total) => sum + total, 0);

    return { 
        expenseCategories, 
        monthlyExpenses, 
        monthlyExpenseTotals, 
        monthlyIncomeTotals,
        categoryTotals,
        overallTotalExpenses,
        overallTotalIncomes
    };
  }, [transactions, categories, selectedYear]);

  const { 
    expenseCategories, 
    monthlyExpenses, 
    monthlyExpenseTotals,
    monthlyIncomeTotals,
    categoryTotals,
    overallTotalExpenses,
    overallTotalIncomes
  } = reportData;

  const availableYears = useMemo(() => {
    const years = new Set(transactions.map(t => new Date(t.date).getFullYear().toString()));
    if (!years.has(new Date().getFullYear().toString())) {
        years.add(new Date().getFullYear().toString());
    }
    return Array.from(years).sort((a, b) => parseInt(b) - parseInt(a));
  }, [transactions]);
  
  const months = Array.from({ length: 12 }, (_, i) => {
    return format(new Date(2000, i), 'MMM', { locale: ptBR });
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Relatórios</h1>
        <p className="text-muted-foreground">
          Analise suas finanças mensais por categoria.
        </p>
      </div>

      <Card className="bg-gradient-card shadow-medium">
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle className="flex items-center gap-2">
                    <BarChart className="h-5 w-5" />
                    Resumo Anual de Transações
                </CardTitle>
                <CardDescription>
                    Veja o fluxo de suas receitas e despesas, mês a mês.
                </CardDescription>
            </div>
            <div className="w-40">
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger>
                        <SelectValue placeholder="Selecione o ano" />
                    </SelectTrigger>
                    <SelectContent>
                        {availableYears.map(year => (
                            <SelectItem key={year} value={year}>{year}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="sticky left-0 bg-card z-10 w-[200px] font-semibold text-foreground">Categoria</TableHead>
                  {months.map((month, index) => (
                    <TableHead key={index} className="text-center min-w-[100px]">{month}</TableHead>
                  ))}
                  <TableHead className="text-right sticky right-0 bg-card z-10 font-semibold text-foreground min-w-[120px]">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenseCategories.map(category => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium sticky left-0 bg-card z-10">{category.name}</TableCell>
                    {months.map((_, monthIndex) => (
                      <TableCell key={monthIndex} className="text-center text-destructive">
                        {monthlyExpenses[category.id]?.[monthIndex] 
                          ? formatCurrency(monthlyExpenses[category.id][monthIndex]) 
                          : '-'}
                      </TableCell>
                    ))}
                    <TableCell className="text-right font-bold sticky right-0 bg-card z-10 text-destructive">
                        {formatCurrency(categoryTotals.find(c => c.categoryId === category.id)?.total || 0)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow className="bg-muted/50 font-bold">
                  <TableHead className="sticky left-0 bg-muted/50 z-10 flex items-center gap-2"><ArrowDown className="h-4 w-4 text-destructive" />Total Despesas</TableHead>
                  {months.map((_, monthIndex) => (
                    <TableHead key={monthIndex} className="text-center text-destructive">
                      {formatCurrency(monthlyExpenseTotals[monthIndex])}
                    </TableHead>
                  ))}
                  <TableHead className="text-right sticky right-0 bg-muted/50 z-10 text-destructive">
                    {formatCurrency(overallTotalExpenses)}
                  </TableHead>
                </TableRow>
                <TableRow className="bg-muted/50 font-bold">
                  <TableHead className="sticky left-0 bg-muted/50 z-10 flex items-center gap-2"><ArrowUp className="h-4 w-4 text-success" />Total Receitas</TableHead>
                  {months.map((_, monthIndex) => (
                    <TableHead key={monthIndex} className="text-center text-success">
                      {formatCurrency(monthlyIncomeTotals[monthIndex])}
                    </TableHead>
                  ))}
                  <TableHead className="text-right sticky right-0 bg-muted/50 z-10 text-success">
                     {formatCurrency(overallTotalIncomes)}
                  </TableHead>
                </TableRow>
                <TableRow className="bg-background font-extrabold border-t-2">
                  <TableHead className="sticky left-0 bg-background z-10 flex items-center gap-2"><Minus className="h-4 w-4 text-primary" />Saldo Mensal</TableHead>
                  {months.map((_, monthIndex) => {
                    const balance = monthlyIncomeTotals[monthIndex] - monthlyExpenseTotals[monthIndex];
                    return (
                        <TableHead key={monthIndex} className={`text-center ${balance >= 0 ? 'text-success' : 'text-destructive'}`}>
                        {formatCurrency(balance)}
                        </TableHead>
                    );
                  })}
                  <TableHead className={`text-right sticky right-0 bg-background z-10 ${overallTotalIncomes - overallTotalExpenses >= 0 ? 'text-success' : 'text-destructive'}`}>
                    {formatCurrency(overallTotalIncomes - overallTotalExpenses)}
                  </TableHead>
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

