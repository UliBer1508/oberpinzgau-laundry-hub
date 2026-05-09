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
import Rechnungseinstellungen from "./pages/Rechnungseinstellungen";
import Waeschekraefte from "./pages/Waeschekraefte";
import Benutzerverwaltung from "./pages/Benutzerverwaltung";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { RequireAccess } from "@/components/auth/RequireAccess";

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
            <Route path="/kunden" element={<RequireAccess resource="kunden"><Kunden /></RequireAccess>} />
            <Route path="/objekte" element={<Navigate to="/kunden" replace />} />
            <Route path="/waescheartikel" element={<RequireAccess resource="waescheartikel"><Waescheartikel /></RequireAccess>} />
            <Route path="/waeschesets" element={<RequireAccess resource="waeschesets"><Waeschesets /></RequireAccess>} />
            <Route path="/bestellungen" element={<RequireAccess resource="bestellungen"><Bestellungen /></RequireAccess>} />
            <Route path="/bestellungen/management" element={<RequireAccess resource="bestellungen_management"><BestellungsManagement /></RequireAccess>} />
            <Route path="/liefertouren" element={<RequireAccess resource="liefertouren"><Liefertouren /></RequireAccess>} />
            <Route path="/rechnungen" element={<RequireAccess resource="rechnungen"><Rechnungen /></RequireAccess>} />
            <Route path="/waeschekraefte" element={<RequireAccess resource="waeschekraefte"><Waeschekraefte /></RequireAccess>} />
            <Route path="/benutzer" element={<RequireAccess resource="benutzer"><Benutzerverwaltung /></RequireAccess>} />
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
