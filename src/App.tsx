import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthGuard } from "./components/layout/AuthGuard";
import { MainLayout } from "./components/layout/MainLayout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Transactions from "./pages/Transactions";
import Categories from "./pages/Categories";
import SpecialDates from "./pages/SpecialDates";
import Savings from "./pages/Savings";
import Settings from "./pages/Settings";
import Reports from "./pages/Reports"; // Importe a nova página
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected routes */}
          <Route path="/" element={<Navigate to="/home" replace />} />
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
           <Route path="/reports" element={ // Adicione a nova rota
            <AuthGuard>
              <MainLayout>
                <Reports />
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
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
