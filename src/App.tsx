
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import React, { Suspense } from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

const Index = React.lazy(() => import("./pages/Index"));
const AdminLogin = React.lazy(() => import("./pages/AdminLogin"));
const Dashboard = React.lazy(() => import("./pages/Dashboard"));
const OrderTracking = React.lazy(() => import("@/pages/OrderTracking"));
// Removed standalone pages now embedded inside dashboard
// const DiscountCodesPage = React.lazy(() => import("@/pages/DiscountCodesPage"));
// const UpsellPayment = React.lazy(() => import("@/pages/UpsellPayment"));
// const UserAccess = React.lazy(() => import("@/pages/UserAccess"));
const NotFound = React.lazy(() => import("@/pages/NotFound"));
const TestConnection = React.lazy(() => import("@/pages/TestConnection"));

const queryClient = new QueryClient();

// Hard refresh component: forces all users to be logged out and redirects to login
// Hard refresh functionality moved to AdminLogin component

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Suspense fallback={<div />}> 
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/*" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/order-tracking" element={<OrderTracking />} />
            {/** Routes removed: now embedded inside the dashboard */}
            {/** <Route path="/discount-codes" element={<DiscountCodesPage />} /> */}
            {/** <Route path="/upsell/:productId" element={<UpsellPayment />} /> */}
            {/** <Route path="/user-access" element={<UserAccess />} /> */}
            <Route path="*" element={<NotFound />} />
            {/* Test route - remove in production */}
            <Route path="/test-connection" element={<TestConnection />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
