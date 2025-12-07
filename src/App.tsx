import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Kunden from "./pages/Kunden";
import Objekte from "./pages/Objekte";
import Waescheartikel from "./pages/Waescheartikel";
import Waeschesets from "./pages/Waeschesets";
import Bestellungen from "./pages/Bestellungen";
import BestellungsManagement from "./pages/BestellungsManagement";
import Liefertouren from "./pages/Liefertouren";
import Rechnungen from "./pages/Rechnungen";
import Waeschekraefte from "./pages/Waeschekraefte";
import Buchungen from "./pages/Buchungen";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

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
            <Route path="/objekte" element={<Objekte />} />
            <Route path="/waescheartikel" element={<Waescheartikel />} />
            <Route path="/waeschesets" element={<Waeschesets />} />
            <Route path="/bestellungen" element={<Bestellungen />} />
            <Route path="/bestellungen/management" element={<BestellungsManagement />} />
            <Route path="/liefertouren" element={<Liefertouren />} />
            <Route path="/rechnungen" element={<Rechnungen />} />
            <Route path="/waeschekraefte" element={<Waeschekraefte />} />
            <Route path="/buchungen" element={<Buchungen />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
