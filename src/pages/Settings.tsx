import { Settings as SettingsIcon, Palette, DollarSign, Layout } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

export default function Settings() {
  const { toast } = useToast();

  const handleSettingChange = (setting: string, value: any) => {
    toast({
      title: "Configuração atualizada",
      description: `${setting} foi alterado com sucesso`,
    });
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
                onCheckedChange={(checked) => handleSettingChange('Modo Escuro', checked)}
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