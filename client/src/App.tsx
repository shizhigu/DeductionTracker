import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Expenses from "@/pages/Expenses";
import Categories from "@/pages/Categories";
import TaxReports from "@/pages/TaxReports";
import Settings from "@/pages/Settings";
import ExpenseDetail from "@/pages/ExpenseDetail";
import { useMobile } from "@/hooks/use-mobile";
import MobileLayout from "@/components/layouts/MobileLayout";
import DesktopLayout from "@/components/layouts/DesktopLayout";

function Router() {
  const isMobile = useMobile();
  
  const Layout = isMobile ? MobileLayout : DesktopLayout;
  
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/expenses" component={Expenses} />
        <Route path="/expenses/:id" component={ExpenseDetail} />
        <Route path="/categories" component={Categories} />
        <Route path="/reports" component={TaxReports} />
        <Route path="/settings" component={Settings} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
