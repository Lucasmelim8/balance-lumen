import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { useAuth } from '@/store/authStore'
import { CircleUser, Menu, Package2 } from 'lucide-react'
import { Link, NavLink } from 'react-router-dom'
import { Button } from '../ui/button'
import Clock from './Clock' // 1. Importando o componente Clock

export function Navbar() {
  const { user, logout } = useAuth()

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
        <Link
          to="#"
          className="flex items-center gap-2 text-lg font-semibold md:text-base"
        >
          <Package2 className="h-6 w-6" />
          <span className="sr-only">Acme Inc</span>
        </Link>
        <NavLink
          to="/"
          className={({ isActive }) =>
            isActive
              ? 'text-foreground transition-colors hover:text-foreground'
              : 'text-muted-foreground transition-colors hover:text-foreground'
          }
        >
          Dashboard
        </NavLink>
        <NavLink
          to="/transactions"
          className={({ isActive }) =>
            isActive
              ? 'text-foreground transition-colors hover:text-foreground'
              : 'text-muted-foreground transition-colors hover:text-foreground'
          }
        >
          Transações
        </NavLink>
        <NavLink
          to="/categories"
          className={({ isActive }) =>
            isActive
              ? 'text-foreground transition-colors hover:text-foreground'
              : 'text-muted-foreground transition-colors hover:text-foreground'
          }
        >
          Categorias
        </NavLink>
        <NavLink
          to="/savings"
          className={({ isActive }) =>
            isActive
              ? 'text-foreground transition-colors hover:text-foreground'
              : 'text-muted-foreground transition-colors hover:text-foreground'
          }
        >
          Poupança
        </NavLink>
        <NavLink
          to="/special-dates"
          className={({ isActive }) =>
            isActive
              ? 'text-foreground transition-colors hover:text-foreground'
              : 'text-muted-foreground transition-colors hover:text-foreground'
          }
        >
          Datas Especiais
        </NavLink>
      </nav>
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="shrink-0 md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left">
          <nav className="grid gap-6 text-lg font-medium">
            <Link
              to="#"
              className="flex items-center gap-2 text-lg font-semibold"
            >
              <Package2 className="h-6 w-6" />
              <span className="sr-only">Acme Inc</span>
            </Link>
            <NavLink
              to="/"
              className={({ isActive }) =>
                isActive ? 'text-foreground' : 'text-muted-foreground'
              }
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/transactions"
              className={({ isActive }) =>
                isActive ? 'text-foreground' : 'text-muted-foreground'
              }
            >
              Transações
            </NavLink>
            <NavLink
              to="/categories"
              className={({ isActive }) =>
                isActive ? 'text-foreground' : 'text-muted-foreground'
              }
            >
              Categorias
            </NavLink>
            <NavLink
              to="/savings"
              className={({ isActive }) =>
                isActive ? 'text-foreground' : 'text-muted-foreground'
              }
            >
              Poupança
            </NavLink>
            <NavLink
              to="/special-dates"
              className={({ isActive }) =>
                isActive ? 'text-foreground' : 'text-muted-foreground'
              }
            >
              Datas Especiais
            </NavLink>
          </nav>
        </SheetContent>
      </Sheet>
      <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
        <div className="ml-auto flex-grow" />
        <Clock /> {/* 2. Adicionando o componente Clock aqui, antes do menu do usuário */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" size="icon" className="rounded-full">
              <CircleUser className="h-5 w-5" />
              <span className="sr-only">Toggle user menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>
              {user ? user.email : 'Minha Conta'}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Link to="/settings">Configurações</Link>
            </DropdownMenuItem>
            <DropdownMenuItem>Suporte</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout}>Sair</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
