import { useMemo, useState } from 'react';
import { BarChart } from 'lucide-react';
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
import { useFinanceStore, Transaction, Category } from '../store/financeStore';
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
    const monthlyExpenses: { [key: string]: { [key: number]: number } } = {};
    const monthlyTotals: { [key: number]: number } = {};

    // Initialize months for totals
    for (let i = 0; i < 12; i++) {
      monthlyTotals[i] = 0;
    }

    // Initialize categories
    for (const category of expenseCategories) {
      monthlyExpenses[category.id] = {};
    }

    const filteredTransactions = transactions.filter(t => {
      const transactionYear = new Date(t.date).getFullYear().toString();
      return t.type === 'expense' && transactionYear === selectedYear;
    });

    for (const transaction of filteredTransactions) {
      const month = new Date(transaction.date).getMonth(); // 0-11
      if (!monthlyExpenses[transaction.categoryId]) {
        monthlyExpenses[transaction.categoryId] = {};
      }
      monthlyExpenses[transaction.categoryId][month] = (monthlyExpenses[transaction.categoryId][month] || 0) + transaction.amount;
      monthlyTotals[month] = (monthlyTotals[month] || 0) + transaction.amount;
    }
    
    const categoryTotals = expenseCategories.map(category => {
        const total = Object.values(monthlyExpenses[category.id] || {}).reduce((sum, amount) => sum + amount, 0);
        return { categoryId: category.id, total };
    });

    return { expenseCategories, monthlyExpenses, monthlyTotals, categoryTotals };
  }, [transactions, categories, selectedYear]);

  const { expenseCategories, monthlyExpenses, monthlyTotals, categoryTotals } = reportData;

  const availableYears = useMemo(() => {
    const years = new Set(transactions.map(t => new Date(t.date).getFullYear().toString()));
    return Array.from(years).sort((a, b) => parseInt(b) - parseInt(a));
  }, [transactions]);
  
  const months = Array.from({ length: 12 }, (_, i) => {
    return format(new Date(0, i), 'MMM', { locale: ptBR });
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Relatórios</h1>
        <p className="text-muted-foreground">
          Analise seus gastos mensais por categoria.
        </p>
      </div>

      <Card className="bg-gradient-card shadow-medium">
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle className="flex items-center gap-2">
                    <BarChart className="h-5 w-5" />
                    Resumo de Despesas por Categoria
                </CardTitle>
                <CardDescription>
                    Veja quanto gastou em cada categoria, mês a mês.
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
                  <TableHead className="sticky left-0 bg-card z-10 w-[200px]">Categoria</TableHead>
                  {months.map((month, index) => (
                    <TableHead key={index} className="text-center">{month}</TableHead>
                  ))}
                  <TableHead className="text-right sticky right-0 bg-card z-10">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenseCategories.map(category => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium sticky left-0 bg-card z-10">{category.name}</TableCell>
                    {months.map((_, monthIndex) => (
                      <TableCell key={monthIndex} className="text-center">
                        {monthlyExpenses[category.id]?.[monthIndex] 
                          ? formatCurrency(monthlyExpenses[category.id][monthIndex]) 
                          : '-'}
                      </TableCell>
                    ))}
                    <TableCell className="text-right font-bold sticky right-0 bg-card z-10">
                        {formatCurrency(categoryTotals.find(c => c.categoryId === category.id)?.total || 0)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow className="bg-muted/50">
                  <TableHead className="sticky left-0 bg-muted/50 z-10">Total Mensal</TableHead>
                  {months.map((_, monthIndex) => (
                    <TableHead key={monthIndex} className="text-center font-bold">
                      {formatCurrency(monthlyTotals[monthIndex])}
                    </TableHead>
                  ))}
                  <TableHead className="text-right sticky right-0 bg-muted/50 z-10 font-bold">
                    {formatCurrency(Object.values(monthlyTotals).reduce((sum, total) => sum + total, 0))}
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

