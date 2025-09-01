import { 
  House, 
  List, 
  PiggyBank, 
  Calendar, 
  Tags, 
  Settings, 
  LogOut,
  BarChart,
  ChevronRight,
  Menu,
} from 'lucide-react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
  SidebarSeparator,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';

const mainNavigation = [
  { title: 'Home', url: '/home', icon: House },
  { title: 'Transações', url: '/transactions', icon: List },
  { title: 'Relatórios', url: '/reports', icon: BarChart },
  { title: 'Caixinha', url: '/savings', icon: PiggyBank },
];

const secondaryNavigation = [
  { title: 'Datas Especiais', url: '/special-dates', icon: Calendar },
  { title: 'Categorias', url: '/categories', icon: Tags },
  { title: 'Configurações', url: '/settings', icon: Settings },
];

export function AppSidebar() {
  const { state, toggleSidebar, isMobile } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const isCollapsed = state === 'collapsed';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const renderMenu = (items: typeof mainNavigation) => (
    <SidebarMenu className="space-y-1">
      {items.map((item) => {
        const isActive =
          location.pathname === item.url ||
          (item.url === '/home' && location.pathname === '/') ||
          (item.url !== '/home' && location.pathname.startsWith(item.url));

        return (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton
              asChild
              className={cn(
                "w-full justify-start gap-3 px-3 py-2.5 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-primary transition-all duration-200 rounded-lg",
                isActive &&
                  "bg-sidebar-primary text-sidebar-primary-foreground font-semibold shadow-sm"
              )}
            >
              <NavLink to={item.url} className="flex items-center gap-3">
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {!isCollapsed && (
                  <span className="text-sm">{item.title}</span>
                )}
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );

  return (
    <Sidebar className="bg-sidebar-background border-r border-sidebar-border flex flex-col">
      {/* HEADER: Mostrado quando expandido ou em mobile */}
      {(!isCollapsed || isMobile) && (
        <SidebarHeader className="px-3 py-4 border-b border-sidebar-border flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={toggleSidebar}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2 font-bold text-sidebar-foreground">
            <PiggyBank className="h-6 w-6 text-sidebar-primary" />
            {!isCollapsed && <span className="text-base">Balance Lumen</span>}
          </div>
        </SidebarHeader>
      )}

      {/* CONTEÚDO */}
      <SidebarContent className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        <SidebarGroup className="p-0">
          <SidebarGroupContent>{renderMenu(mainNavigation)}</SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="my-2"/>

        <SidebarGroup className="p-0">
          {!isCollapsed && (
            <h3 className="px-3 mb-2 text-sm font-semibold tracking-tight text-muted-foreground flex items-center">
              Você <ChevronRight className="h-4 w-4 ml-1" />
            </h3>
          )}
          <SidebarGroupContent>{renderMenu(secondaryNavigation)}</SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* FOOTER */}
      <SidebarFooter className="px-2 py-3 border-t border-sidebar-border mt-auto">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              onClick={handleLogout} 
              className="w-full justify-start gap-3 px-3 py-2.5 hover:bg-sidebar-accent transition rounded-lg text-red-500 hover:text-red-600"
            >
              <LogOut className="h-5 w-5" />
              {!isCollapsed && <span className="text-sm">Sair</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
