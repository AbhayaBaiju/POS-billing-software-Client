import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { useAuth } from './auth'
import { AdminLayout, BillingLayout, MobileShell } from './layouts'
import { LayoutProvider } from './ui'
import Login from './pages/Login'
import Dashboard from './pages/admin/Dashboard'
import Products from './pages/admin/Products'
import Sales from './pages/admin/Sales'
import Returns from './pages/admin/Returns'
import Suppliers from './pages/admin/Suppliers'
import Purchases from './pages/admin/Purchases'
import Customers from './pages/admin/Customers'
import Staff from './pages/admin/Staff'
import Reports from './pages/admin/Reports'
import Billing from './pages/billing/Billing'
import History from './pages/billing/History'

function Guard({ admin, children }) {
  const { user } = useAuth()
  const loc = useLocation()
  if (!user) return <Navigate to="/login" state={{ from: loc.pathname }} replace />
  if (admin && user.role !== 'admin') return <Navigate to="/billing" replace />
  return children
}

function Home() {
  const { user } = useAuth()
  return <Navigate to={user ? (user.role === 'admin' ? '/admin' : '/billing') : '/login'} replace />
}

const adminPages = (
  <>
    <Route index element={<Dashboard />} />
    <Route path="products" element={<Products />} />
    <Route path="sales" element={<Sales />} />
    <Route path="returns" element={<Returns />} />
    <Route path="suppliers" element={<Suppliers />} />
    <Route path="purchases" element={<Purchases />} />
    <Route path="customers" element={<Customers />} />
    <Route path="staff" element={<Staff />} />
    <Route path="reports" element={<Reports />} />
  </>
)

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />

      {/* Admin portal, responsive: switches to the mobile layout on narrow screens */}
      <Route path="/admin" element={<Guard admin><LayoutProvider><AdminLayout base="/admin" /></LayoutProvider></Guard>}>
        {adminPages}
      </Route>

      {/* Mobile Admin UI: the same portal, always in the mobile app layout (phone frame on desktop) */}
      <Route path="/m" element={<Navigate to="/m/admin" replace />} />
      <Route path="/m/admin" element={<Guard admin><MobileShell><AdminLayout base="/m/admin" /></MobileShell></Guard>}>
        {adminPages}
      </Route>

      {/* Billing portal for staff (admins can use it too) */}
      <Route path="/billing" element={<Guard><BillingLayout /></Guard>}>
        <Route index element={<Billing />} />
        <Route path="history" element={<History />} />
      </Route>

      <Route path="*" element={<Home />} />
    </Routes>
  )
}
