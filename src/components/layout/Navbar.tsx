import { Bell, LogOut, User, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuthStore } from '@/store/authStore';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Clock } from './Clock'; // Importe o novo componente

export function Navbar() {
  const { user, logout } = useAuthStore();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card shadow-soft">
      <div className="flex h-16 items-center px-6">
        {/* Left - Sidebar Toggle (Mobile) */}
        <div className="flex items-center gap-4">
          <SidebarTrigger className="md:hidden" />
        </div>

        {/* Center - Clock */}
        <div className="flex-1 flex items-center justify-center">
          <Clock />
        </div>

        {/* Right - Notifications and User Menu */}
        <div className="flex items-center gap-3">
          {/* Notifications Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72">
              <div className="px-3 py-2 text-sm font-medium">Notificações</div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/transactions" className="flex items-center text-sm">
                  Nova transação adicionada
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/savings" className="flex items-center text-sm">
                  Você alcançou sua meta da Caixinha 🎉
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/special-dates" className="flex items-center text-sm">
                  Lembre-se: Data especial amanhã
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <div className="px-3 py-2 text-xs text-muted-foreground">
                Ver todas as notificações
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-3 px-3 py-2 h-auto">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {user?.user_metadata?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:block text-left">
                  <div className="text-sm font-medium">{user?.user_metadata?.name || user?.email?.split('@')[0]}</div>
                  <div className="text-xs text-muted-foreground">{user?.email}</div>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem asChild>
                <Link to="/settings" className="flex items-center">
                  <Settings className="mr-2 h-4 w-4" />
                  Configurações
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
