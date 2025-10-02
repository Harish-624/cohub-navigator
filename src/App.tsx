import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DataProvider } from "./contexts/DataContext";
import { MainLayout } from "./components/MainLayout";
import Dashboard from "./pages/Dashboard";
import Upload from "./pages/Upload";
import Cities from "./pages/Cities";
import CityDetail from "./pages/CityDetail";
import Countries from "./pages/Countries";
import CountryDetail from "./pages/CountryDetail";
import AllSpaces from "./pages/AllSpaces";
import Duplicates from "./pages/Duplicates";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <DataProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <MainLayout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/upload" element={<Upload />} />
              <Route path="/cities" element={<Cities />} />
              <Route path="/cities/:cityName" element={<CityDetail />} />
              <Route path="/countries" element={<Countries />} />
              <Route path="/countries/:countryName" element={<CountryDetail />} />
              <Route path="/spaces" element={<AllSpaces />} />
              <Route path="/duplicates" element={<Duplicates />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </MainLayout>
        </BrowserRouter>
      </DataProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
