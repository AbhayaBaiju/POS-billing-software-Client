import { useState } from 'react'
import { NavLink, Outlet, Link } from 'react-router-dom'
import {
  BarChart3,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Receipt,
  Smartphone,
  Store,
  Truck,
  Undo2,
  UserCog,
  Users,
  Monitor,
  ShoppingCart,
  History,
  ChevronRight,
} from 'lucide-react'

import { useAuth } from './auth'
import { LayoutProvider, Modal, useMobile } from './ui'

const NAV = [
  ['', 'Dashboard', LayoutDashboard],
  ['products', 'Products & stock', Package],
  ['sales', 'Bills', Receipt],
  ['returns', 'Returns', Undo2],
  ['suppliers', 'Suppliers', Truck],
  ['purchases', 'Purchases', ClipboardList],
  ['customers', 'Customers', Users],
  ['staff', 'Staff', UserCog],
  ['reports', 'Reports & ledger', BarChart3],
]

const TABS = [
  ['', 'Home', LayoutDashboard],
  ['products', 'Stock', Package],
  ['sales', 'Bills', Receipt],
  ['reports', 'Reports', BarChart3],
]

const shopName =
  import.meta.env.VITE_SHOP_NAME || 'Loomhouse Textiles'


/* ============================================================
   COMMON TEXTILE BACKGROUND
============================================================ */

const textileStyle = {
  backgroundImage: `
    repeating-linear-gradient(
      45deg,
      #c59d5f 0,
      #c59d5f 1px,
      transparent 1px,
      transparent 8px
    ),
    repeating-linear-gradient(
      -45deg,
      #c59d5f 0,
      #c59d5f 1px,
      transparent 1px,
      transparent 8px
    )
  `,
}


/* ============================================================
   MOBILE SHELL
============================================================ */

export function MobileShell({ children }) {
  return (
    <LayoutProvider forced>
      <div className="flex min-h-full items-center justify-center bg-[#dfe2e6] sm:p-6">

        <div
          className="
            relative h-[100dvh] w-full overflow-hidden
            bg-[#f8f6f2]
            sm:h-[812px]
            sm:max-h-[calc(100vh-3rem)]
            sm:w-[390px]
            sm:rounded-[2.2rem]
            sm:border-[10px]
            sm:border-[#172033]
            sm:shadow-2xl
          "
          style={{ transform: 'translateZ(0)' }}
        >
          {children}
        </div>

      </div>
    </LayoutProvider>
  )
}


/* ============================================================
   SIDEBAR NAV ITEM
============================================================ */

function SidebarItem({
  to,
  label,
  Icon,
  end = false,
  gold = false,
}) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `
        group flex items-center gap-3
        rounded-xl px-3 py-2.5
        text-sm font-semibold
        transition-all duration-200
        ${
          isActive
            ? gold
              ? 'bg-[#c59d5f] text-[#172033] shadow-md'
              : 'bg-white text-[#172033] shadow-sm'
            : 'text-white/70 hover:bg-white/[0.07] hover:text-white'
        }
        `
      }
    >
      <Icon size={18} strokeWidth={2} />

      <span className="flex-1">
        {label}
      </span>

      <ChevronRight
        size={14}
        className="
          opacity-0
          transition
          group-hover:opacity-50
        "
      />
    </NavLink>
  )
}


/* ============================================================
   ACCOUNT SECTION
============================================================ */

function AccountSection({
  user,
  logout,
  inFrame = false,
}) {
  return (
    <div className="border-t border-white/10 p-3">

      <div className="mb-3 rounded-xl bg-white/[0.05] p-3">

        <div className="mb-1 text-[10px] font-bold uppercase tracking-wider text-white/40">
          Signed in as
        </div>

        <div className="truncate text-sm font-extrabold text-white">
          {user.first_name || user.username}
        </div>

      </div>


      <div className="space-y-1">

        <Link
          to="/billing"
          className="
            flex items-center gap-2
            rounded-xl px-3 py-2
            text-xs font-semibold
            text-white/75
            transition
            hover:bg-white/[0.07]
            hover:text-white
          "
        >
          <Store size={15} />
          Billing counter
        </Link>


        {inFrame ? (
          <Link
            to="/admin"
            className="
              flex items-center gap-2
              rounded-xl px-3 py-2
              text-xs font-semibold
              text-white/75
              transition
              hover:bg-white/[0.07]
              hover:text-white
            "
          >
            <Monitor size={15} />
            Desktop admin
          </Link>
        ) : (
          <Link
            to="/m/admin"
            className="
              flex items-center gap-2
              rounded-xl px-3 py-2
              text-xs font-semibold
              text-white/75
              transition
              hover:bg-white/[0.07]
              hover:text-white
            "
          >
            <Smartphone size={15} />
            Mobile admin
          </Link>
        )}


        <button
          onClick={logout}
          className="
            flex w-full items-center gap-2
            rounded-xl px-3 py-2
            text-left text-xs font-semibold
            text-white/75
            transition
            hover:bg-red-500/10
            hover:text-red-300
          "
        >
          <LogOut size={15} />
          Sign out
        </button>

      </div>

    </div>
  )
}


/* ============================================================
   ADMIN LAYOUT
============================================================ */

export function AdminLayout({ base }) {
  const mobile = useMobile()
  const { user, logout } = useAuth()

  const [menu, setMenu] = useState(false)

  const to = (p) =>
    p ? `${base}/${p}` : base

  const inFrame = base.startsWith('/m')


  /* ==========================================================
     MOBILE ADMIN
  ========================================================== */

  if (mobile) {
    return (
      <div className="flex h-full flex-col bg-[#f8f6f2]">

        {/* Mobile Header */}

        <header className="relative overflow-hidden bg-[#172033] px-4 py-3 text-white">

          <div
            className="pointer-events-none absolute inset-0 opacity-[0.035]"
            style={textileStyle}
          />

          <div className="relative flex items-center justify-between">

            <div>

              <div className="text-[10px] font-bold uppercase tracking-widest text-[#c59d5f]">
                Admin portal
              </div>

              <div className="mt-0.5 text-base font-extrabold">
                {shopName}
              </div>

            </div>


            <button
              aria-label="Menu"
              onClick={() => setMenu(true)}
              className="
                rounded-xl
                border border-white/10
                bg-white/5
                p-2
                transition
                hover:bg-white/10
              "
            >
              <Menu size={21} />
            </button>

          </div>

        </header>


        {/* Content */}

        <main className="min-h-0 flex-1 overflow-y-auto bg-[#f8f6f2] p-3">
          <Outlet />
        </main>


        {/* Bottom Navigation */}

        <nav className="safe-bottom grid grid-cols-5 border-t border-[#172033]/10 bg-white">

          {TABS.map(([p, label, Icon]) => (
            <NavLink
              key={p}
              to={to(p)}
              end={p === ''}
              className={({ isActive }) =>
                `
                flex flex-col items-center
                gap-1 py-2
                text-[10px] font-bold
                transition
                ${
                  isActive
                    ? 'text-[#c59d5f]'
                    : 'text-slate-400'
                }
                `
              }
            >
              <Icon size={19} />
              {label}
            </NavLink>
          ))}


          <button
            onClick={() => setMenu(true)}
            className="
              flex flex-col items-center
              gap-1 py-2
              text-[10px] font-bold
              text-slate-400
            "
          >
            <Menu size={19} />
            More
          </button>

        </nav>


        {/* Mobile Menu */}

        {menu && (
          <Modal
            title="Admin Menu"
            onClose={() => setMenu(false)}
          >

            <div className="mb-4 rounded-2xl bg-[#172033] p-4 text-white">

              <div className="text-[10px] font-bold uppercase tracking-widest text-[#c59d5f]">
                Administration
              </div>

              <div className="mt-1 text-base font-extrabold">
                {shopName}
              </div>

              <div className="mt-1 text-xs text-white/50">
                Manage your store
              </div>

            </div>


            <div className="grid grid-cols-2 gap-2">

              {NAV.map(([p, label, Icon]) => (
                <NavLink
                  key={p}
                  to={to(p)}
                  end={p === ''}
                  onClick={() => setMenu(false)}
                  className={({ isActive }) =>
                    `
                    flex items-center gap-2
                    rounded-xl border p-3
                    text-sm font-bold
                    transition
                    ${
                      isActive
                        ? 'border-[#c59d5f] bg-[#fffaf1] text-[#172033]'
                        : 'border-[#172033]/10 bg-white text-slate-600'
                    }
                    `
                  }
                >
                  <Icon size={17} />
                  {label}
                </NavLink>
              ))}

            </div>


            {/* Billing */}

            <div className="mt-4 rounded-2xl bg-[#172033] p-2">

              <div className="px-3 pb-2 pt-2 text-[10px] font-bold uppercase tracking-widest text-white/35">
                Billing
              </div>

              <NavLink
                to="/billing"
                onClick={() => setMenu(false)}
                className="
                  flex items-center gap-3
                  rounded-xl px-3 py-3
                  text-sm font-bold
                  text-white
                  hover:bg-white/10
                "
              >
                <ShoppingCart
                  size={18}
                  className="text-[#c59d5f]"
                />
                Billing Counter
              </NavLink>

              <NavLink
                to="/billing/history"
                onClick={() => setMenu(false)}
                className="
                  flex items-center gap-3
                  rounded-xl px-3 py-3
                  text-sm font-bold
                  text-white
                  hover:bg-white/10
                "
              >
                <History
                  size={18}
                  className="text-[#c59d5f]"
                />
                Billing History
              </NavLink>

            </div>


            <div className="mt-4 overflow-hidden rounded-2xl bg-[#172033]">
              <AccountSection
                user={user}
                logout={logout}
                inFrame={inFrame}
              />
            </div>

          </Modal>
        )}

      </div>
    )
  }


  /* ==========================================================
     DESKTOP ADMIN
  ========================================================== */

  return (
    <div className="flex h-full bg-[#f8f6f2]">

      {/* SIDEBAR */}

      <aside className="flex w-[260px] shrink-0 flex-col bg-[#172033] text-white">

        {/* Brand */}

        <div className="relative overflow-hidden border-b border-white/10 px-5 py-5">

          <div
            className="pointer-events-none absolute inset-0 opacity-[0.035]"
            style={textileStyle}
          />

          <div className="relative">

            <div className="mb-1 flex items-center gap-2">

              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#c59d5f] text-[#172033]">
                <Store size={16} />
              </div>

              <div className="text-[10px] font-bold uppercase tracking-widest text-white/45">
                Admin portal
              </div>

            </div>

            <div className="mt-2 text-lg font-extrabold leading-tight">
              {shopName}
            </div>

            <div className="mt-1 text-[11px] text-white/40">
              Store management system
            </div>

          </div>

        </div>


        {/* Main Navigation */}

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">

          <div className="px-2 pb-2 pt-1 text-[10px] font-bold uppercase tracking-widest text-white/30">
            Administration
          </div>


          {NAV.map(([p, label, Icon]) => (
            <SidebarItem
              key={p}
              to={to(p)}
              label={label}
              Icon={Icon}
              end={p === ''}
            />
          ))}


          {/* Billing Section */}

          <div className="my-4 border-t border-white/10 pt-4">

            <div className="mb-2 px-2 text-[10px] font-bold uppercase tracking-widest text-[#c59d5f]/70">
              Billing
            </div>


            <SidebarItem
              to="/billing"
              label="Billing Counter"
              Icon={ShoppingCart}
              end
              gold
            />


            <SidebarItem
              to="/billing/history"
              label="Billing History"
              Icon={History}
              gold
            />

          </div>

        </nav>


        {/* Account */}

        <AccountSection
          user={user}
          logout={logout}
          inFrame={inFrame}
        />

      </aside>


      {/* CONTENT */}

      <main className="min-w-0 flex-1 overflow-y-auto bg-[#f8f6f2]">

        <div className="mx-auto max-w-7xl p-4 sm:p-6">

          <Outlet />

        </div>

      </main>

    </div>
  )
}


/* ============================================================
   BILLING LAYOUT
============================================================ */

export function BillingLayout() {
  const {
    user,
    logout,
    isAdmin,
  } = useAuth()

  const mobile = useMobile()


  /* ==========================================================
     ADMIN BILLING
     
     Admin gets:
       Sidebar
       Billing header
       Billing content
  ========================================================== */

  if (isAdmin) {
    return (
      <LayoutProvider>

        <div className="flex h-full bg-[#f8f6f2]">

          {/* ==================================================
              ADMIN SIDEBAR
          ================================================== */}

          <aside className="flex w-[260px] shrink-0 flex-col bg-[#172033] text-white">

            {/* Brand */}

            <div className="relative overflow-hidden border-b border-white/10 px-5 py-5">

              <div
                className="pointer-events-none absolute inset-0 opacity-[0.035]"
                style={textileStyle}
              />

              <div className="relative">

                <div className="mb-1 flex items-center gap-2">

                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#c59d5f] text-[#172033]">
                    <Store size={16} />
                  </div>

                  <div className="text-[10px] font-bold uppercase tracking-widest text-white/45">
                    Admin portal
                  </div>

                </div>

                <div className="mt-2 text-lg font-extrabold leading-tight">
                  {shopName}
                </div>

                <div className="mt-1 text-[11px] text-white/40">
                  Billing & store management
                </div>

              </div>

            </div>


            {/* Navigation */}

            <nav className="flex-1 space-y-1 overflow-y-auto p-3">

              <div className="px-2 pb-2 pt-1 text-[10px] font-bold uppercase tracking-widest text-white/30">
                Administration
              </div>


              <SidebarItem
                to="/admin"
                label="Dashboard"
                Icon={LayoutDashboard}
              />


              <SidebarItem
                to="/admin/products"
                label="Products & stock"
                Icon={Package}
              />


              <SidebarItem
                to="/admin/sales"
                label="Bills"
                Icon={Receipt}
              />


              <SidebarItem
                to="/admin/returns"
                label="Returns"
                Icon={Undo2}
              />


              <SidebarItem
                to="/admin/suppliers"
                label="Suppliers"
                Icon={Truck}
              />


              <SidebarItem
                to="/admin/purchases"
                label="Purchases"
                Icon={ClipboardList}
              />


              <SidebarItem
                to="/admin/customers"
                label="Customers"
                Icon={Users}
              />


              <SidebarItem
                to="/admin/staff"
                label="Staff"
                Icon={UserCog}
              />


              <SidebarItem
                to="/admin/reports"
                label="Reports & ledger"
                Icon={BarChart3}
              />


              {/* Billing */}

              <div className="my-4 border-t border-white/10 pt-4">

                <div className="mb-2 px-2 text-[10px] font-bold uppercase tracking-widest text-[#c59d5f]/70">
                  Billing
                </div>


                <SidebarItem
                  to="/billing"
                  label="Billing Counter"
                  Icon={ShoppingCart}
                  end
                  gold
                />


                <SidebarItem
                  to="/billing/history"
                  label="Billing History"
                  Icon={History}
                  gold
                />

              </div>

            </nav>


            {/* Admin Account */}

            <AccountSection
              user={user}
              logout={logout}
            />

          </aside>


          {/* ==================================================
              BILLING AREA
          ================================================== */}

          <main className="min-w-0 flex-1 overflow-hidden">

            <div className="flex h-full flex-col">


              {/* Billing Header */}

              <header className="relative shrink-0 overflow-hidden border-b border-[#172033]/10 bg-white px-4 py-3 sm:px-6">

                <div className="pointer-events-none absolute right-0 top-0 h-full w-64 opacity-[0.025]">
                  <div
                    className="h-full w-full"
                    style={textileStyle}
                  />
                </div>


                <div className="relative flex items-center justify-between gap-3">

                  <div className="flex min-w-0 items-center gap-3">

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#172033] text-[#c59d5f] shadow-sm">
                      <ShoppingCart size={19} />
                    </div>


                    <div className="min-w-0">

                      <div className="truncate text-base font-extrabold text-[#172033]">
                        Billing Counter
                      </div>

                      <div className="hidden text-[11px] text-slate-400 sm:block">
                        Create bills and manage customer transactions
                      </div>

                    </div>

                  </div>


                  <div className="flex shrink-0 items-center gap-2">

                    <div className="hidden rounded-xl bg-[#f8f6f2] px-3 py-2 sm:block">

                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Admin
                      </div>

                      <div className="text-xs font-extrabold text-[#172033]">
                        {user.first_name || user.username}
                      </div>

                    </div>


                    <Link
                      to="/admin"
                      className="
                        hidden items-center gap-1.5
                        rounded-xl
                        border border-[#172033]/10
                        bg-white
                        px-3 py-2
                        text-xs font-bold
                        text-[#172033]
                        transition
                        hover:border-[#c59d5f]
                        hover:bg-[#fffaf1]
                        sm:flex
                      "
                    >
                      <LayoutDashboard size={14} />
                      Admin
                    </Link>


                    <button
                      onClick={logout}
                      aria-label="Sign out"
                      className="
                        flex h-9 w-9
                        items-center justify-center
                        rounded-xl
                        border border-[#172033]/10
                        bg-white
                        text-slate-500
                        transition
                        hover:border-red-200
                        hover:bg-red-50
                        hover:text-red-500
                      "
                    >
                      <LogOut size={17} />
                    </button>

                  </div>

                </div>

              </header>


              {/* Billing Content */}

              <main className="min-h-0 flex-1">

                <Outlet />

              </main>

            </div>

          </main>

        </div>

      </LayoutProvider>
    )
  }


  /* ==========================================================
     STAFF BILLING LAYOUT
  ========================================================== */

  const link = ({ isActive }) =>
    `
    rounded-xl px-3 py-2
    text-sm font-bold
    transition
    ${
      isActive
        ? 'bg-[#c59d5f] text-[#172033] shadow-sm'
        : 'text-white/75 hover:bg-white/10 hover:text-white'
    }
    `


  return (
    <LayoutProvider>

      <div className="flex h-full flex-col bg-[#f8f6f2]">


        {/* Staff Header */}

        <header className="relative overflow-hidden bg-[#172033] px-3 py-3 text-white sm:px-5">

          <div
            className="pointer-events-none absolute inset-0 opacity-[0.035]"
            style={textileStyle}
          />


          <div className="relative flex flex-wrap items-center justify-between gap-2">

            <div className="flex items-center gap-3">

              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#c59d5f] text-[#172033]">
                <ShoppingCart size={17} />
              </div>


              <div>

                <div className="text-sm font-extrabold">
                  {shopName}
                </div>

                <div className="hidden text-[10px] text-white/45 sm:block">
                  Billing counter
                </div>

              </div>


              <nav className="ml-1 flex gap-1">

                <NavLink
                  to="/billing"
                  end
                  className={link}
                >
                  New bill
                </NavLink>


                <NavLink
                  to="/billing/history"
                  className={link}
                >
                  My bills
                </NavLink>

              </nav>

            </div>


            <div className="flex items-center gap-1">

              <span className="hidden px-2 text-xs font-semibold text-white/65 sm:inline">
                {user.first_name || user.username}
              </span>


              <button
                onClick={logout}
                aria-label="Sign out"
                className="
                  rounded-xl
                  p-2
                  text-white/70
                  transition
                  hover:bg-white/10
                  hover:text-white
                "
              >
                <LogOut size={18} />
              </button>

            </div>

          </div>

        </header>


        {/* Content */}

        <main className="min-h-0 flex-1">

          <Outlet />

        </main>

      </div>

    </LayoutProvider>
  )
}