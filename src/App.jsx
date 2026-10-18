import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from '@/components/ProtectedRoute';
// Auth pages
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
// Portal layout + home
import PortalLayout from '@/components/portal/PortalLayout';
import Home from '@/pages/Home';
// Portal pages
import Trading from '@/pages/portal/Trading';
import Battlepass from '@/pages/portal/Battlepass';
import Quests from '@/pages/portal/Quests';
import Casino from '@/pages/portal/Casino';
import Bounties from '@/pages/portal/Bounties';
import Killfeed from '@/pages/portal/Killfeed';
import Leaderboard from '@/pages/portal/Leaderboard';
import Giveaways from '@/pages/portal/Giveaways';
import Tickets from '@/pages/portal/Tickets';
import Wallet from '@/pages/portal/Wallet';
import TokenShop from '@/pages/portal/TokenShop';
import EconomyAdmin from '@/pages/portal/EconomyAdmin';

// Sends signed-out visitors to the sign-in page, remembering where they
// were headed so they land back on it (e.g. the garage) after logging in.
const LoginRedirect = () => {
  const { pathname } = useLocation();
  return <Navigate to={`/login?returnTo=${encodeURIComponent(pathname)}`} replace />;
};

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Routes>
      {/* Auth pages */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      <Route element={<PortalLayout />}>
        {/* Public pages */}
        <Route path="/" element={<Home />} />
        <Route path="/killfeed" element={<Killfeed />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/giveaways" element={<Giveaways />} />
        <Route path="/tickets" element={<Tickets />} />


        {/* Member pages */}
        <Route element={<ProtectedRoute unauthenticatedElement={<LoginRedirect />} />}>
          <Route path="/trading" element={<Trading />} />
          <Route path="/battlepass" element={<Battlepass />} />
          <Route path="/quests" element={<Quests />} />
          <Route path="/casino" element={<Casino />} />

          <Route path="/bounties" element={<Bounties />} />

          <Route path="/wallet" element={<Wallet />} />
          <Route path="/store" element={<TokenShop />} />
          <Route path="/admin-economy" element={<EconomyAdmin />} />
        </Route>

        <Route path="*" element={<PageNotFound />} />
      </Route>
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App