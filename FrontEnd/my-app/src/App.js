import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import LoginPage from "./pages/LoginPage";
import MainLayout from "./layout/MainLayout";
import TicketPage from "./pages/TicketPages";
import DashboardHome from "./pages/DashboardHome";
import CreateTicketPage from "./pages/CreateTicketPage";
import DeleteTicketPage from "./pages/DeleteTicketPage";
import ProfilePage from "./pages/ProfilePage";
import ProductPage from "./pages/ProductPage";
import AdminProductsPage from "./pages/AdminProductsPage";
import AdminSubProductsPage from "./pages/AdminSubProductsPage";
import AdminCustomerProductsPage from "./pages/AdminCustomerProductsPage";
import CustomerProductsPage from "./pages/CustomerProductsPage";
import CustomerProductsPOVPage from "./pages/CustomerProductsPOVPage";
import GroupedTicketPage        from "./pages/GroupedTicketPage";
import SummaryTicket            from "./pages/CustomerTicket";
import TicketGroupedDetailPage from "./pages/TicketGroupedDetailPage";
import CustomerTicketDetailPage from "./pages/CustomerTicketDetailPage";
import IncidentLogSubmitPage from "./pages/IncidentLogSubmitPage";
import TicketHistoryPage from "./pages/TicketHistoryPage";
import TicketHistoryDetailPage from "./pages/TicketHistoryDetailPage";
import IncidentApprovalPage from "./pages/IncidentApprovalPage";
import IncidentApprovalDetailPage from "./pages/IncidentApprovalDetailPage";
import CustomerRatingPage from "./pages/CustomerRatingPage";
import SLAConfigPage from "./pages/SLAConfigPage";

import UserManagementPage from "./pages/UserManagementPage";
import RolePermissionPage from "./pages/RolePermissionPage";
import ReminderPage from "./pages/ReminderPage";

function PrivateRoute({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" replace />;
}

// ✅ TAMBAHKAN INI (yang hilang)
function W({ children }) {
  return (
    <PrivateRoute>
      <MainLayout>{children}</MainLayout>
    </PrivateRoute>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* PUBLIC */}
        <Route path="/login" element={<LoginPage />} />

        {/* DASHBOARD */}
        <Route
          path="/"
          element={
            <W>
              <DashboardHome />
            </W>
          }
        />

        {/* TICKET */}
        <Route
          path="/ticket"
          element={
            <W>
              <TicketPage />
            </W>
          }
        />
        <Route
          path="/ticket/create"
          element={
            <W>
              <CreateTicketPage />
            </W>
          }
        />
        <Route
          path="/ticket/delete"
          element={
            <W>
              <DeleteTicketPage />
            </W>
          }
        />
        <Route 
          path="/ticket/sla-config"
          element={
            <W>
              <SLAConfigPage />
            </W>
          }
        />

        <Route
          path="/ticket/grouped/:id"
          element={
            <PrivateRoute>
              <MainLayout>
                <TicketGroupedDetailPage />
              </MainLayout>
            </PrivateRoute>
          }
        />

        <Route
          path="/my/tickets/:id"
          element={
            <PrivateRoute>
              <MainLayout>
                <CustomerTicketDetailPage />
              </MainLayout>
            </PrivateRoute>
          }
        />

        <Route
          path="/ticket/grouped/:id/incident-submit"
          element={
            <PrivateRoute>
              <MainLayout>
                <IncidentLogSubmitPage />
              </MainLayout>
            </PrivateRoute>
          }
        />

        <Route
          path="/ticket/history"
          element={
            <PrivateRoute>
              <MainLayout>
                <TicketHistoryPage />
              </MainLayout>
            </PrivateRoute>
          }
        />

        <Route
          path="/ticket/history/:id"
          element={
            <PrivateRoute>
              <MainLayout>
                <TicketHistoryDetailPage />
              </MainLayout>
            </PrivateRoute>
          }
        />

        <Route
          path="/ticket/approval"
          element={
            <PrivateRoute>
              <MainLayout>
                <IncidentApprovalPage />
              </MainLayout>
            </PrivateRoute>
          }
        />

        <Route
          path="/ticket/approval/:id"
          element={
            <PrivateRoute>
              <MainLayout>
                <IncidentApprovalDetailPage />
              </MainLayout>
            </PrivateRoute>
          }
        />

        <Route
          path="/ticket/rating"
          element={
            <PrivateRoute>
              <MainLayout>
                <CustomerRatingPage />
              </MainLayout>
            </PrivateRoute>
          }
        />
        

                <Route path="/summary" element={<PrivateRoute><MainLayout><SummaryTicket /></MainLayout></PrivateRoute>} />
        <Route path="/ticket/grouped"element={<PrivateRoute><MainLayout><GroupedTicketPage /></MainLayout></PrivateRoute>}/>

        {/* PRODUCTS */}
        <Route
          path="/products"
          element={
            <W>
              <ProductPage />
            </W>
          }
        />
        <Route
          path="/admin/products"
          element={
            <W>
              <AdminProductsPage />
            </W>
          }
        />
        <Route
          path="/admin/sub-products"
          element={
            <W>
              <AdminSubProductsPage />
            </W>
          }
        />
        <Route
          path="/admin/customer-products"
          element={
            <W>
              <AdminCustomerProductsPage />
            </W>
          }
        />
        <Route
          path="/my-products"
          element={
            <W>
              <CustomerProductsPage />
            </W>
          }
        />
        <Route
          path="/my-services"
          element={
            <W>
              <CustomerProductsPOVPage />
            </W>
          }
        />

        {/* PROFILE */}
        <Route
          path="/profile"
          element={
            <W>
              <ProfilePage />
            </W>
          }
        />

            {/* SETTINGS */}
        <Route path="/setting/user" element={<W><UserManagementPage /></W>} />
        <Route path="/setting/role" element={<W><RolePermissionPage /></W>} />
          <Route path="/setting/reminder" element={<W><ReminderPage /></W>} />

        {/* FALLBACK */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
