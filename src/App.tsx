import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Outlet, Link, Navigate } from "react-router-dom";
import { UserProvider, useCurrentUser } from "@/contexts/UserContext";
import { ReferenceDataProvider } from "@/contexts/ReferenceDataContext";
import { TimeEntriesProvider } from "@/contexts/TimeEntriesContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/AdminDashboard";
import AdminReportsOverview from "./pages/AdminReportsOverview";
import AdminReferenceData from "./pages/admin/AdminReferenceData";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminImportExport from "./pages/admin/AdminImportExport";
import AdminRoles from "./pages/admin/AdminRoles";
import AdminAudit from "./pages/admin/AdminAudit";
import EmployeeInsights from "./pages/EmployeeInsights";
import SignIn from "./pages/SignIn";
import DevAccess from "./pages/DevAccess";
import { AUTH_ENABLED, DEV_MODE } from "@/lib/devMode";

const queryClient = new QueryClient();

function SessionGate() {
  const { currentUser, isLoading } = useCurrentUser();

  // When auth is disabled, pass through without redirect
  if (!AUTH_ENABLED) {
    if (isLoading) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      );
    }
    return <Outlet />;
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }
  if (!currentUser) return <Navigate to={DEV_MODE ? "/dev/access" : "/sign-in"} replace />;
  return <Outlet />;
}

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
        <ReferenceDataProvider>
        <TimeEntriesProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/sign-in" element={<SignIn />} />
              <Route path="/dev/access" element={<DevAccess />} />
              <Route element={<SessionGate />}>
                <Route path="/" element={<Index />} />
                <Route path="/me/insights" element={<EmployeeInsights />} />
                <Route path="/admin" element={<AdminGuard />}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="reports/overview" element={<AdminReportsOverview />} />
                  <Route path="reference-data" element={<AdminReferenceData />} />
                  <Route path="users" element={<AdminUsers />} />
                  <Route path="import-export" element={<AdminImportExport />} />
                  <Route path="roles" element={<AdminRoles />} />
                  <Route path="audit" element={<AdminAudit />} />
                </Route>
              </Route>
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TimeEntriesProvider>
        </ReferenceDataProvider>
      </UserProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
