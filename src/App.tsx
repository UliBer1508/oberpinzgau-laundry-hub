import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Kunden from "./pages/Kunden";

import Waescheartikel from "./pages/Waescheartikel";
import Waeschesets from "./pages/Waeschesets";
import Bestellungen from "./pages/Bestellungen";
import BestellungsManagement from "./pages/BestellungsManagement";
import Liefertouren from "./pages/Liefertouren";
import Rechnungen from "./pages/Rechnungen";
import Waeschekraefte from "./pages/Waeschekraefte";
import Benutzerverwaltung from "./pages/Benutzerverwaltung";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/kunden" element={<Kunden />} />
            <Route path="/objekte" element={<Navigate to="/kunden" replace />} />
            <Route path="/waescheartikel" element={<Waescheartikel />} />
            <Route path="/waeschesets" element={<Waeschesets />} />
            <Route path="/bestellungen" element={<Bestellungen />} />
            <Route path="/bestellungen/management" element={<BestellungsManagement />} />
            <Route path="/liefertouren" element={<Liefertouren />} />
            <Route path="/rechnungen" element={<Rechnungen />} />
            <Route path="/waeschekraefte" element={<Waeschekraefte />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <MobileBottomNav />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
