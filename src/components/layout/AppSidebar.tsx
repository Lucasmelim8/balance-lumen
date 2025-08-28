import { 
  Home, 
  CreditCard, 
  FolderOpen, 
  Calendar, 
  PiggyBank, 
  Settings,
  ChevronRight
} from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

const navigationItems = [
  { title: 'Dashboard', url: '/home', icon: Home },
  { title: 'Transações', url: '/transactions', icon: CreditCard },
  { title: 'Categorias', url: '/categories', icon: FolderOpen },
  { title: 'Datas Especiais', url: '/special-dates', icon: Calendar },
  { title: 'Caixinha', url: '/savings', icon: PiggyBank },
  { title: 'Configurações', url: '/settings', icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const isCollapsed = state === 'collapsed';

  return (
    <Sidebar className="border-r bg-gradient-card">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground font-medium">
            Menu Principal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => {
                const isActive = location.pathname === item.url || 
                  (item.url === '/home' && location.pathname === '/') ||
                  (item.url !== '/home' && location.pathname.startsWith(item.url));
                
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild 
                      className={cn(
                        "group relative transition-all duration-200 hover:bg-accent/50",
                        isActive && "bg-primary text-primary-foreground hover:bg-primary/90 shadow-medium"
                      )}
                    >
                      <NavLink to={item.url} className="flex items-center gap-3">
                        <item.icon className={cn(
                          "h-5 w-5 transition-transform group-hover:scale-110",
                          isActive && "text-primary-foreground"
                        )} />
                        {!isCollapsed && (
                          <>
                            <span className="font-medium">{item.title}</span>
                            {isActive && (
                              <ChevronRight className="ml-auto h-4 w-4 text-primary-foreground" />
                            )}
                          </>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}