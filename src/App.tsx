import { Routes, Route } from "react-router-dom";
import AppLayout from "./components/layouts/AppLayout";
import { ToastProvider, ProtectedRoute, PublicRoute } from "./components";
import { AuthProvider } from "./contexts";
import CommercialOfferDetails from "./pages/CommercialOfferDetails";
import CommercialOffers from "./pages/CommercialOffers";
import WebPreview from "./pages/WebPreview";
import Products from "./pages/Products";
import Clients from "./pages/Clients";
import Templates from "./pages/Templates";
import Users from "./pages/Users";
import Currencies from "./pages/Currencies";
import Integrations from "./pages/Integrations";
import SignIn from "./pages/auth/SignIn";
import RecoveryPassword from "./pages/auth/RecoveryPassword";
import PasRecMsgSentToEmail from "./pages/auth/PasRecMsgSentToEmail";
import EmailConfirmation from "./pages/auth/EmailConfirmation";
import SignUp from "./pages/auth/SignUp";
import Scenarios from "./pages/Scenarios";
import Plans from "./pages/Plans";
import Graphics from "./pages/Graphics";
import NotFound from "./pages/404";
import SubscriptionExpired from "./pages/SubscriptionExpired";
import SubscriptionExpiredUser from "./pages/SubscriptionExpiredUser";

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Routes>
          {/* Protected Routes with AppLayout (main app) */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <CommercialOffers />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/details"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <CommercialOfferDetails />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/products"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Products />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/clients"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Clients />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/templates"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Templates />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/users"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Users />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/currencies"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Currencies />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/integrations"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Integrations />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/scenarios"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Scenarios />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/plans"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Plans />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/graphics"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Graphics />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/subscription-expired"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <SubscriptionExpired />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/subscription-expired-user"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <SubscriptionExpiredUser />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Public Routes (auth pages) */}
          <Route
            path="/auth/sign-in"
            element={
              <PublicRoute>
                <SignIn />
              </PublicRoute>
            }
          />
          <Route
            path="/auth/recovery-password"
            element={
              <PublicRoute>
                <RecoveryPassword />
              </PublicRoute>
            }
          />
          <Route
            path="/auth/pas-rec-msg-sent-to-email"
            element={
              <PublicRoute>
                <PasRecMsgSentToEmail />
              </PublicRoute>
            }
          />
          <Route
            path="/auth/email-confirmation"
            element={
              <PublicRoute>
                <EmailConfirmation />
              </PublicRoute>
            }
          />
          <Route
            path="/auth/sign-up"
            element={
              <PublicRoute>
                <SignUp />
              </PublicRoute>
            }
          />

          {/* Public Routes without auth protection */}
          <Route path="/preview" element={<WebPreview />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
