import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, ArrowDown, ArrowUp, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useFinanceStore } from '@/store/financeStore';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(amount);
};

export default function Reports() {
  const { transactions } = useFinanceStore();
  const navigate = useNavigate();
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());

  const availableYears = useMemo(() => {
    const years = new Set(transactions.map(t => new Date(t.date).getFullYear().toString()));
    if (!years.has(new Date().getFullYear().toString())) {
        years.add(new Date().getFullYear().toString());
    }
    return Array.from(years).sort((a, b) => parseInt(b) - parseInt(a));
  }, [transactions]);

  const monthlyData = useMemo(() => {
    const data = Array.from({ length: 12 }, (_, i) => ({
      month: i,
      monthName: format(new Date(2000, i, 1), 'MMMM', { locale: ptBR }),
      income: 0,
      expense: 0,
    }));

    transactions.forEach(t => {
      const date = new Date(t.date);
      if (date.getFullYear().toString() === selectedYear) {
        const monthIndex = date.getMonth();
        if (t.type === 'income') {
          data[monthIndex].income += t.amount;
        } else {
          data[monthIndex].expense += t.amount;
        }
      }
    });

    return data;
  }, [transactions, selectedYear]);
  
  // A função de clique agora passa o índice do mês (0-11)
  const handleMonthClick = (monthIndex: number) => {
    navigate(`/reports/${selectedYear}/${monthIndex}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Relatórios Anuais</h1>
          <p className="text-muted-foreground">
            Selecione um ano e clique em um mês para ver os detalhes.
          </p>
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
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {monthlyData.map(({ month, monthName, income, expense }) => {
          const balance = income - expense;
          const hasData = income > 0 || expense > 0;
          return (
            <Card 
              key={month} 
              className={`transition-all hover:shadow-large hover:-translate-y-1 cursor-pointer ${!hasData && 'opacity-60'}`}
              // Certifique-se de que o clique só funciona se houver dados
              onClick={() => hasData && handleMonthClick(month)}
            >
              <CardHeader>
                <CardTitle className="capitalize">{monthName}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-success"><ArrowUp className="h-4 w-4"/> Receitas</span>
                  <span className="font-medium">{formatCurrency(income)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-destructive"><ArrowDown className="h-4 w-4"/> Despesas</span>
                  <span className="font-medium">{formatCurrency(expense)}</span>
                </div>
                 <div className={`flex items-center justify-between pt-2 border-t font-semibold ${balance >= 0 ? 'text-foreground' : 'text-destructive'}`}>
                  <span className="flex items-center gap-2">
                    {balance >= 0 ? <TrendingUp className="h-4 w-4"/> : <TrendingDown className="h-4 w-4"/>}
                    Saldo
                  </span>
                  <span>{formatCurrency(balance)}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
