import { Settings as SettingsIcon, Palette, DollarSign, Layout, Upload, Download, FileSpreadsheet, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { useToast } from '@/hooks/use-toast';
import { useFinanceStore } from '@/store/financeStore';
import { useTheme } from '@/components/layout/ThemeProvider';
import { useRef, useState } from 'react';

export default function Settings() {
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const { transactions, categories, accounts, addTransaction, addAccount, clearAllData } = useFinanceStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isClearing, setIsClearing] = useState(false);

  const handleClearAllData = async () => {
    setIsClearing(true);
    try {
      await clearAllData();
      toast({
        title: "Dados limpos",
        description: "Todos os seus dados foram removidos com sucesso",
      });
    } catch (error) {
      toast({
        title: "Erro ao limpar dados",
        description: "Ocorreu um erro ao limpar os dados. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsClearing(false);
    }
  };

  const handleSettingChange = (setting: string, value: any) => {
    toast({
      title: "Configuração atualizada",
      description: `${setting} foi alterado com sucesso`,
    });
  };

  const downloadTemplate = () => {
    const template = [
      ['Descrição', 'Valor', 'Data', 'Tipo', 'Categoria', 'Conta', 'Tipo de Pagamento'],
      ['Salário', '5000', '2024-01-01', 'income', 'Salário', 'Conta Corrente', 'single'],
      ['Supermercado', '150.50', '2024-01-02', 'expense', 'Alimentação', 'Conta Corrente', 'single'],
      ['Aluguel', '1200', '2024-01-05', 'expense', 'Moradia', 'Conta Corrente', 'monthly']
    ];

    const csvContent = template.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'modelo_transacoes.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Modelo baixado",
      description: "O modelo de Excel foi baixado com sucesso",
    });
  };

  const exportTransactions = () => {
    if (transactions.length === 0) {
      toast({
        title: "Nenhuma transação",
        description: "Não há transações para exportar",
        variant: "destructive",
      });
      return;
    }

    const header = ['Descrição', 'Valor', 'Data', 'Tipo', 'Categoria', 'Conta', 'Tipo de Pagamento'];
    const data = transactions.map(transaction => {
      const category = categories.find(c => c.id === transaction.categoryId);
      const account = accounts.find(a => a.id === transaction.accountId);
      
      return [
        transaction.description,
        transaction.amount.toString(),
        transaction.date,
        transaction.type,
        category?.name || 'Categoria não encontrada',
        account?.name || 'Conta não encontrada',
        transaction.paymentType || 'single'
      ];
    });

    const csvContent = [header, ...data].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'transacoes_exportadas.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Transações exportadas",
      description: `${transactions.length} transações foram exportadas com sucesso`,
    });
  };

  const handleImportFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        toast({
          title: "Arquivo inválido",
          description: "O arquivo deve conter pelo menos um cabeçalho e uma linha de dados",
          variant: "destructive",
        });
        return;
      }

      // Skip header line
      const dataLines = lines.slice(1);
      let importedCount = 0;
      let createdAccounts = 0;

      for (const line of dataLines) {
        const [description, amount, date, type, categoryName, accountName, paymentType] = line.split(',').map(s => s.trim());
        
        if (!description || !amount || !date || !type || !categoryName || !accountName) {
          continue; // Skip invalid lines
        }

        // Find or create account
        let account = accounts.find(a => a.name.toLowerCase() === accountName.toLowerCase());
        if (!account) {
          await addAccount({
            name: accountName,
            balance: 0,
            type: 'checking' as const
          });
          createdAccounts++;
          // Refresh accounts list after adding
          const updatedAccounts = useFinanceStore.getState().accounts;
          account = updatedAccounts.find(a => a.name.toLowerCase() === accountName.toLowerCase());
        }

        // Find category
        const category = categories.find(c => 
          c.name.toLowerCase() === categoryName.toLowerCase() && 
          c.type === type
        );

        if (!account || !category) {
          continue; // Skip if account creation failed or category not found
        }

        await addTransaction({
          description,
          amount: parseFloat(amount),
          date,
          type: type as 'income' | 'expense',
          categoryId: category.id,
          accountId: account.id,
          paymentType: (paymentType && ['single', 'monthly', 'recurring'].includes(paymentType)) 
            ? paymentType as 'single' | 'monthly' | 'recurring' 
            : 'single'
        });

        importedCount++;
      }

      toast({
        title: "Importação concluída",
        description: `${importedCount} transações importadas${createdAccounts > 0 ? ` e ${createdAccounts} contas criadas` : ''}`,
      });

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

    } catch (error) {
      toast({
        title: "Erro na importação",
        description: "Ocorreu um erro ao processar o arquivo. Verifique o formato.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground">
          Personalize sua experiência no ExpenseTracker
        </p>
      </div>

      <div className="grid gap-6">
        {/* Appearance Settings */}
        <Card className="bg-gradient-card shadow-medium">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Aparência
            </CardTitle>
            <CardDescription>
              Configure a aparência do aplicativo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="dark-mode">Modo Escuro</Label>
                <p className="text-sm text-muted-foreground">
                  Ativar tema escuro para reduzir o cansaço visual
                </p>
              </div>
              <Switch
                id="dark-mode"
                checked={theme === "dark"}
                onCheckedChange={(checked) => {
                  setTheme(checked ? "dark" : "light");
                  handleSettingChange('Modo Escuro', checked);
                }}
              />
            </div>

            <div className="space-y-2">
              <Label>Tema de Cores</Label>
              <Select 
                defaultValue="blue"
                onValueChange={(value) => handleSettingChange('Tema de Cores', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="blue">Azul (Padrão)</SelectItem>
                  <SelectItem value="green">Verde</SelectItem>
                  <SelectItem value="purple">Roxo</SelectItem>
                  <SelectItem value="orange">Laranja</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Currency Settings */}
        <Card className="bg-gradient-card shadow-medium">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Moeda
            </CardTitle>
            <CardDescription>
              Configure a moeda e formato de valores
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Moeda Principal</Label>
              <Select 
                defaultValue="BRL"
                onValueChange={(value) => handleSettingChange('Moeda Principal', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BRL">Real Brasileiro (R$)</SelectItem>
                  <SelectItem value="USD">Dólar Americano ($)</SelectItem>
                  <SelectItem value="EUR">Euro (€)</SelectItem>
                  <SelectItem value="GBP">Libra Esterlina (£)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Formato de Número</Label>
              <Select 
                defaultValue="br"
                onValueChange={(value) => handleSettingChange('Formato de Número', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="br">Brasileiro (1.234,56)</SelectItem>
                  <SelectItem value="us">Americano (1,234.56)</SelectItem>
                  <SelectItem value="eu">Europeu (1 234,56)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Layout Settings */}
        <Card className="bg-gradient-card shadow-medium">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layout className="h-5 w-5" />
              Layout
            </CardTitle>
            <CardDescription>
              Personalize a disposição dos elementos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="compact-mode">Modo Compacto</Label>
                <p className="text-sm text-muted-foreground">
                  Reduzir espaçamentos para exibir mais informações
                </p>
              </div>
              <Switch
                id="compact-mode"
                onCheckedChange={(checked) => handleSettingChange('Modo Compacto', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="sidebar-auto-collapse">Sidebar Auto-colapsar</Label>
                <p className="text-sm text-muted-foreground">
                  Colapsar automaticamente o menu lateral em telas pequenas
                </p>
              </div>
              <Switch
                id="sidebar-auto-collapse"
                defaultChecked
                onCheckedChange={(checked) => handleSettingChange('Sidebar Auto-colapsar', checked)}
              />
            </div>

            <div className="space-y-2">
              <Label>Página Inicial</Label>
              <Select 
                defaultValue="dashboard"
                onValueChange={(value) => handleSettingChange('Página Inicial', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dashboard">Dashboard</SelectItem>
                  <SelectItem value="transactions">Transações</SelectItem>
                  <SelectItem value="categories">Categorias</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Import/Export Settings */}
        <Card className="bg-gradient-card shadow-medium">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5" />
              Importar e Exportar Dados
            </CardTitle>
            <CardDescription>
              Faça backup ou importe suas transações em formato Excel/CSV
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label className="text-base font-medium">Exportar Transações</Label>
                <p className="text-sm text-muted-foreground mb-3">
                  Baixe todas as suas transações em formato CSV
                </p>
                <Button onClick={exportTransactions} variant="outline" className="w-full">
                  <Download className="mr-2 h-4 w-4" />
                  Exportar Transações
                </Button>
              </div>

              <div className="border-t pt-4">
                <Label className="text-base font-medium">Importar Transações</Label>
                <p className="text-sm text-muted-foreground mb-3">
                  Importe transações de um arquivo CSV seguindo nosso modelo
                </p>
                
                <div className="space-y-3">
                  <Button onClick={downloadTemplate} variant="outline" className="w-full">
                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                    Baixar Modelo CSV
                  </Button>
                  
                  <div className="relative">
                    <Input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv,.xlsx,.xls"
                      onChange={handleImportFile}
                      className="hidden"
                      id="import-file"
                    />
                    <Button 
                      onClick={() => fileInputRef.current?.click()} 
                      className="w-full bg-gradient-primary"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Importar Arquivo CSV
                    </Button>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    <strong>Importante:</strong> Contas que não existirem serão criadas automaticamente. 
                    Contas com o mesmo nome serão consideradas a mesma conta.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card className="bg-gradient-card shadow-medium">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              Gerenciar Dados
            </CardTitle>
            <CardDescription>
              Limpe todos os seus dados permanentemente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <h4 className="font-medium text-destructive mb-2">Zona de Perigo</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Esta ação irá remover permanentemente todas as suas transações, contas, 
                  metas de economia, datas especiais e anotações mensais. Esta ação não pode ser desfeita.
                </p>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" disabled={isClearing}>
                      <Trash2 className="mr-2 h-4 w-4" />
                      {isClearing ? "Limpando..." : "Limpar Todos os Dados"}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Você tem certeza absoluta?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta ação não pode ser desfeita. Isso irá remover permanentemente
                        todas as suas transações, contas, metas de economia, datas especiais
                        e anotações mensais.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-destructive hover:bg-destructive/90"
                        onClick={handleClearAllData}
                      >
                        Sim, limpar todos os dados
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications Settings */}
        <Card className="bg-gradient-card shadow-medium">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SettingsIcon className="h-5 w-5" />
              Notificações
            </CardTitle>
            <CardDescription>
              Gerencie suas preferências de notificação
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-notifications">Notificações por Email</Label>
                <p className="text-sm text-muted-foreground">
                  Receber resumos e lembretes por email
                </p>
              </div>
              <Switch
                id="email-notifications" 
                defaultChecked
                onCheckedChange={(checked) => handleSettingChange('Notificações por Email', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="push-notifications">Notificações Push</Label>
                <p className="text-sm text-muted-foreground">
                  Receber notificações no navegador
                </p>
              </div>
              <Switch
                id="push-notifications"
                onCheckedChange={(checked) => handleSettingChange('Notificações Push', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="special-dates-reminder">Lembrete de Datas Especiais</Label>
                <p className="text-sm text-muted-foreground">
                  Ser lembrado sobre datas especiais próximas
                </p>
              </div>
              <Switch
                id="special-dates-reminder"
                defaultChecked
                onCheckedChange={(checked) => handleSettingChange('Lembrete de Datas Especiais', checked)}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}