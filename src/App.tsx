import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthGuard } from "./components/layout/AuthGuard";
import { MainLayout } from "./components/layout/MainLayout";
import { AuthProvider } from "./components/layout/AuthProvider";
import { ThemeProvider } from "./components/layout/ThemeProvider";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Transactions from "./pages/Transactions";
import Categories from "./pages/Categories";
import SpecialDates from "./pages/SpecialDates";
import Savings from "./pages/Savings";
import Settings from "./pages/Settings";
import Reports from "./pages/Reports";
import MonthDetail from "./pages/MonthDetail";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="system" storageKey="ui-theme">
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Navigate to="/" replace />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected routes */}
          <Route path="/home" element={
            <AuthGuard>
              <MainLayout>
                <Home />
              </MainLayout>
            </AuthGuard>
          } />
          <Route path="/transactions" element={
            <AuthGuard>
              <MainLayout>
                <Transactions />
              </MainLayout>
            </AuthGuard>
          } />
           <Route path="/reports" element={
            <AuthGuard>
              <MainLayout>
                <Reports />
              </MainLayout>
            </AuthGuard>
          } />
          {/* NOVO: Rota para o detalhe do mês */}
          <Route path="/reports/:year/:month" element={
            <AuthGuard>
              <MainLayout>
                <MonthDetail />
              </MainLayout>
            </AuthGuard>
          } />
          <Route path="/categories" element={
            <AuthGuard>
              <MainLayout>
                <Categories />
              </MainLayout>
            </AuthGuard>
          } />
          <Route path="/special-dates" element={
            <AuthGuard>
              <MainLayout>
                <SpecialDates />
              </MainLayout>
            </AuthGuard>
          } />
          <Route path="/savings" element={
            <AuthGuard>
              <MainLayout>
                <Savings />
              </MainLayout>
            </AuthGuard>
          } />
          <Route path="/settings" element={
            <AuthGuard>
              <MainLayout>
                <Settings />
              </MainLayout>
            </AuthGuard>
          } />
          
          {/* Catch-all route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
