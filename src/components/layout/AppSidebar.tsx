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
  SidebarGroupLabel,
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
  const { state, toggleSidebar } = useSidebar();
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
              tooltip={isCollapsed ? item.title : undefined}
              className={cn(
                "w-full justify-start gap-3 px-3 py-2.5 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-primary transition-all duration-200 rounded-lg",
                isActive &&
                  "bg-sidebar-primary text-sidebar-primary-foreground font-semibold shadow-sm"
              )}
            >
              <NavLink to={item.url} className="flex items-center gap-3">
                <item.icon className="h-5 w-5 flex-shrink-0" />
                <span className={cn("text-sm", isCollapsed && "sr-only")}>{item.title}</span>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );

  return (
    <Sidebar collapsible="icon" className="bg-sidebar-background border-r border-sidebar-border flex flex-col">
      <SidebarHeader className="flex flex-row h-16 items-center border-b px-3">
        <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={toggleSidebar}
          >
            <Menu className="h-5 w-5" />
        </Button>
        <div className={cn("flex items-center gap-2 font-bold text-sidebar-foreground", isCollapsed ? "hidden" : "ml-4")}>
            <PiggyBank className="h-6 w-6 text-sidebar-primary" />
            <span className="text-base whitespace-nowrap">Balance Lumen</span>
        </div>
      </SidebarHeader>

      <SidebarContent className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        <SidebarGroup className="p-0">
          <SidebarGroupContent>{renderMenu(mainNavigation)}</SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="my-2"/>

        <SidebarGroup className="p-0">
          <SidebarGroupLabel asChild>
            <h3 className="flex items-center">
              Você <ChevronRight className="h-4 w-4 ml-1" />
            </h3>
          </SidebarGroupLabel>
          <SidebarGroupContent>{renderMenu(secondaryNavigation)}</SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="px-2 py-3 border-t border-sidebar-border mt-auto">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              onClick={handleLogout} 
              tooltip={isCollapsed ? "Sair" : undefined}
              className="w-full justify-start gap-3 px-3 py-2.5 hover:bg-sidebar-accent transition rounded-lg text-red-500 hover:text-red-600"
            >
              <LogOut className="h-5 w-5" />
              <span className={cn("text-sm", isCollapsed && "sr-only")}>Sair</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

