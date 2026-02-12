import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Outlet, Link } from "react-router-dom";
import { UserProvider, useCurrentUser } from "@/contexts/UserContext";
import { TimeEntriesProvider } from "@/contexts/TimeEntriesContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/AdminDashboard";

const queryClient = new QueryClient();

function AdminGuard() {
  const { isAdmin } = useCurrentUser();
  if (!isAdmin) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background">
        <h1 className="text-2xl font-semibold">Not authorised</h1>
        <p className="text-muted-foreground">You need admin access to view this page.</p>
        <Link to="/" className="text-primary underline">
          Back to home
        </Link>
      </div>
    );
  }
  return <Outlet />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <UserProvider>
        <TimeEntriesProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/admin" element={<AdminGuard />}>
                <Route index element={<AdminDashboard />} />
              </Route>
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TimeEntriesProvider>
      </UserProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
