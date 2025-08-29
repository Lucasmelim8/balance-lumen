import { useState } from 'react';
import { Plus, Edit, Trash2, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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

export default function SpecialDates() {
  const { specialDates, addSpecialDate, updateSpecialDate, removeSpecialDate } = useFinanceStore();
  const { toast } = useToast();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDate, setEditingDate] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    description: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.date) {
      toast({
        title: "Erro",
        description: "Nome e data são obrigatórios",
        variant: "destructive",
      });
      return;
    }

    if (editingDate) {
      updateSpecialDate(editingDate, formData);
      toast({
        title: "Data especial atualizada",
        description: "A data especial foi atualizada com sucesso",
      });
    } else {
      addSpecialDate(formData);
      toast({
        title: "Data especial criada",
        description: "A nova data especial foi criada com sucesso",
      });
    }

    setIsDialogOpen(false);
    setEditingDate(null);
    setFormData({
      name: '',
      date: '',
      description: '',
    });
  };

  const handleEdit = (specialDate: any) => {
    setEditingDate(specialDate.id);
    setFormData({
      name: specialDate.name,
      date: specialDate.date,
      description: specialDate.description || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (dateId: string) => {
    removeSpecialDate(dateId);
    toast({
      title: "Data especial removida",
      description: "A data especial foi removida com sucesso",
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const isUpcoming = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const timeDiff = date.getTime() - today.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return daysDiff >= 0 && daysDiff <= 30;
  };

  const sortedDates = [...specialDates].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Datas Especiais</h1>
          <p className="text-muted-foreground">
            Gerencie seus lembretes e datas importantes
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary">
              <Plus className="mr-2 h-4 w-4" />
              Nova Data
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {editingDate ? 'Editar Data Especial' : 'Nova Data Especial'}
              </DialogTitle>
              <DialogDescription>
                {editingDate 
                  ? 'Edite os dados da data especial'
                  : 'Adicione uma nova data especial para não esquecer'
                }
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Evento</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Aniversário da Maria, Reunião importante..."
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="date">Data</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Observação (opcional)</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Adicione detalhes sobre o evento..."
                  rows={3}
                />
              </div>

              <DialogFooter>
                <Button type="submit" className="bg-gradient-primary">
                  {editingDate ? 'Salvar Alterações' : 'Criar Data Especial'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {sortedDates.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sortedDates.map((specialDate) => (
            <Card 
              key={specialDate.id} 
              className={`bg-gradient-card shadow-medium transition-all hover:shadow-large ${
                isUpcoming(specialDate.date) ? 'ring-2 ring-primary/50' : ''
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className={`h-5 w-5 ${
                      isUpcoming(specialDate.date) ? 'text-primary' : 'text-muted-foreground'
                    }`} />
                    <CardTitle className="text-lg">{specialDate.name}</CardTitle>
                  </div>
                  {isUpcoming(specialDate.date) && (
                    <div className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                      Próximo
                    </div>
                  )}
                </div>
                <CardDescription className="text-lg font-medium">
                  {formatDate(specialDate.date)}
                </CardDescription>
              </CardHeader>
              {specialDate.description && (
                <CardContent className="pt-0 pb-3">
                  <p className="text-sm text-muted-foreground">
                    {specialDate.description}
                  </p>
                </CardContent>
              )}
              <CardContent className="pt-0">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(specialDate)}
                    className="flex-1"
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(specialDate.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="bg-gradient-card shadow-medium">
          <CardContent className="text-center py-12">
            <CalendarIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Nenhuma data especial cadastrada</h3>
            <p className="text-muted-foreground mb-6">
              Comece adicionando aniversários, reuniões e outros eventos importantes
            </p>
            <Button onClick={() => setIsDialogOpen(true)} className="bg-gradient-primary">
              <Plus className="mr-2 h-4 w-4" />
              Adicionar primeira data
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}