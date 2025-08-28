import { 
  House, 
  List, 
  PiggyBank, 
  Calendar, 
  Tags, 
  Settings, 
  LogOut
} from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarHeader,
  useSidebar,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

const mainNavigation = [
  { title: 'Home', url: '/home', icon: House },
  { title: 'Transações', url: '/transactions', icon: List },
  { title: 'Caixinha', url: '/savings', icon: PiggyBank },
];

const extraNavigation = [
  { title: 'Datas Especiais', url: '/special-dates', icon: Calendar },
  { title: 'Categorias', url: '/categories', icon: Tags },
  { title: 'Configurações', url: '/settings', icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const isCollapsed = state === 'collapsed';

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
      {/* HEADER COM LOGO/NOME */}
      <SidebarHeader className="px-3 py-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2 font-bold text-sidebar-foreground">
          <PiggyBank className="h-6 w-6 text-sidebar-primary" />
          {!isCollapsed && <span className="text-base">FinanceApp</span>}
        </div>
      </SidebarHeader>

      {/* CONTEÚDO */}
      <SidebarContent className="flex-1 px-2 py-4 space-y-6">
        <SidebarGroup>
          <SidebarGroupContent>{renderMenu(mainNavigation)}</SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          {!isCollapsed && (
            <p className="px-3 mb-2 text-xs font-medium text-muted-foreground">
              Mais
            </p>
          )}
          <SidebarGroupContent>{renderMenu(extraNavigation)}</SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* FOOTER */}
      <SidebarFooter className="px-2 py-3 border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="w-full gap-3 px-3 py-2.5 hover:bg-sidebar-accent transition rounded-lg text-red-500">
              <LogOut className="h-5 w-5" />
              {!isCollapsed && <span className="text-sm">Sair</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
