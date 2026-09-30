import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth'
import { errMsg } from '../api'

const shopName =
  import.meta.env.VITE_SHOP_NAME || 'Loomhouse Textiles'

export default function Login() {
  const { user, login } = useAuth()
  const nav = useNavigate()

  const [f, setF] = useState({
    username: '',
    password: '',
  })

  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const [showPassword, setShowPassword] = useState(false)


  /* -------------------------------------------------------
     ALREADY LOGGED IN
     Admin -> Admin Dashboard
     Staff -> Billing
  ------------------------------------------------------- */

  if (user) {
    return (
      <Navigate
        to={user.role === 'admin' ? '/admin' : '/billing'}
        replace
      />
    )
  }


  /* -------------------------------------------------------
     LOGIN
  ------------------------------------------------------- */

  const submit = async (e) => {
    e.preventDefault()

    setBusy(true)
    setErr('')

    try {
      const u = await login(
        f.username.trim(),
        f.password
      )

      /*
        IMPORTANT:
        Admin ALWAYS goes to /admin.
        Staff ALWAYS goes to /billing.
      */

      if (u.role === 'admin') {
        nav('/admin', { replace: true })
      } else {
        nav('/billing', { replace: true })
      }

    } catch (e2) {
      setErr(errMsg(e2))
    } finally {
      setBusy(false)
    }
  }


  /* -------------------------------------------------------
     DEMO ADMIN
  ------------------------------------------------------- */

  const fillAdmin = () => {
    setF({
      username: 'admin',
      password: 'admin123',
    })

    setErr('')
  }


  /* -------------------------------------------------------
     DEMO STAFF
  ------------------------------------------------------- */

  const fillStaff = () => {
    setF({
      username: 'staff',
      password: 'staff123',
    })

    setErr('')
  }


  return (
    <div className="min-h-screen bg-[#f8f6f2]">

      <div className="grid min-h-screen lg:grid-cols-2">

        {/* =====================================================
            LEFT SIDE - BRAND SECTION
        ====================================================== */}

        <div className="relative hidden overflow-hidden bg-[#172033] lg:flex">

          {/* Decorative circles */}

          <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-[#c59d5f]/10" />

          <div className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-[#c59d5f]/10" />


          {/* Textile pattern */}

          <div className="absolute inset-0 opacity-[0.06]">
            <div
              className="h-full w-full"
              style={{
                backgroundImage: `
                  linear-gradient(45deg, #fff 25%, transparent 25%),
                  linear-gradient(-45deg, #fff 25%, transparent 25%),
                  linear-gradient(45deg, transparent 75%, #fff 75%),
                  linear-gradient(-45deg, transparent 75%, #fff 75%)
                `,
                backgroundSize: '40px 40px',
                backgroundPosition:
                  '0 0, 0 20px, 20px -20px, -20px 0px',
              }}
            />
          </div>


          {/* Left content */}

          <div className="relative z-10 flex w-full flex-col justify-between p-12 xl:p-16">

            {/* Brand */}

            <div>

              {/* Logo */}

              <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#c59d5f] text-xl font-black text-white shadow-xl">
                LT
              </div>


              {/* Small heading */}

              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-[#c59d5f]">
                Textile Management
              </p>


              {/* Main heading */}

              <h1 className="max-w-lg text-5xl font-black leading-[1.05] text-white xl:text-6xl">
                Manage your
                <span className="block text-[#c59d5f]">
                  shop with ease.
                </span>
              </h1>


              {/* Description */}

              <p className="mt-6 max-w-md text-base leading-7 text-slate-300">
                A simple and powerful workspace for billing,
                inventory, products and day-to-day shop
                operations.
              </p>

            </div>


            {/* Bottom information */}

            <div>

              {/* Stats */}

              <div className="mb-8 grid max-w-lg grid-cols-3 gap-4">

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                  <div className="text-2xl font-bold text-white">
                    24/7
                  </div>

                  <div className="mt-1 text-xs text-slate-400">
                    Access
                  </div>
                </div>


                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                  <div className="text-2xl font-bold text-white">
                    POS
                  </div>

                  <div className="mt-1 text-xs text-slate-400">
                    Billing
                  </div>
                </div>


                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                  <div className="text-2xl font-bold text-white">
                    Stock
                  </div>

                  <div className="mt-1 text-xs text-slate-400">
                    Control
                  </div>
                </div>

              </div>


              {/* Shop name */}

              <div className="flex items-center gap-3 text-sm text-slate-400">

                <div className="h-px w-8 bg-[#c59d5f]" />

                {shopName}

              </div>

            </div>

          </div>

        </div>


        {/* =====================================================
            RIGHT SIDE - LOGIN
        ====================================================== */}

        <div className="flex items-center justify-center px-5 py-10 sm:px-8">

          <div className="w-full max-w-md">


            {/* =================================================
                MOBILE BRAND
            ================================================== */}

            <div className="mb-8 lg:hidden">

              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#172033] text-xl font-black text-white shadow-lg">
                LT
              </div>

              <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#b2874f]">
                Textile Management
              </p>

              <h1 className="mt-2 text-3xl font-black text-[#172033]">
                {shopName}
              </h1>

            </div>


            {/* =================================================
                LOGIN CARD
            ================================================== */}

            <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-[0_20px_60px_rgba(23,32,51,0.10)] sm:p-9">


              {/* Header */}

              <div className="mb-8">

                {/* Login icon */}

                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-[#172033] text-lg text-white">
                  →
                </div>

                <h2 className="text-3xl font-black tracking-tight text-[#172033]">
                  Welcome back
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Sign in to continue to your shop management
                  dashboard.
                </p>

              </div>


              {/* =================================================
                  FORM
              ================================================== */}

              <form onSubmit={submit}>

                <div className="space-y-5">


                  {/* USERNAME */}

                  <div>

                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Username
                    </label>

                    <div className="relative">

                      {/* User icon */}

                      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">

                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M20 21a8 8 0 0 0-16 0" />

                          <circle
                            cx="12"
                            cy="7"
                            r="4"
                          />
                        </svg>

                      </span>


                      <input
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#c59d5f] focus:bg-white focus:ring-4 focus:ring-[#c59d5f]/10"
                        autoFocus
                        autoCapitalize="none"
                        autoComplete="username"
                        placeholder="Enter your username"
                        value={f.username}
                        onChange={(e) => {
                          setF({
                            ...f,
                            username: e.target.value,
                          })

                          setErr('')
                        }}
                        required
                      />

                    </div>

                  </div>


                  {/* PASSWORD */}

                  <div>

                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Password
                    </label>

                    <div className="relative">

                      {/* Lock icon */}

                      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">

                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <rect
                            x="3"
                            y="11"
                            width="18"
                            height="10"
                            rx="2"
                          />

                          <path d="M7 11V7a5 5 0 0 1 10 0v4" />

                        </svg>

                      </span>


                      <input
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-16 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#c59d5f] focus:bg-white focus:ring-4 focus:ring-[#c59d5f]/10"
                        type={
                          showPassword
                            ? 'text'
                            : 'password'
                        }
                        autoComplete="current-password"
                        placeholder="Enter your password"
                        value={f.password}
                        onChange={(e) => {
                          setF({
                            ...f,
                            password: e.target.value,
                          })

                          setErr('')
                        }}
                        required
                      />


                      {/* Show / Hide */}

                      <button
                        type="button"
                        onClick={() =>
                          setShowPassword(
                            !showPassword
                          )
                        }
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 transition hover:text-[#172033]"
                      >
                        {showPassword
                          ? 'Hide'
                          : 'Show'}
                      </button>

                    </div>

                  </div>

                </div>


                {/* =================================================
                    ERROR MESSAGE
                ================================================== */}

                {err && (
                  <div
                    role="alert"
                    className="mt-5 flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600"
                  >

                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-100 font-bold">
                      !
                    </span>

                    <span className="leading-5">
                      {err}
                    </span>

                  </div>
                )}


                {/* =================================================
                    LOGIN BUTTON
                ================================================== */}

                <button
                  type="submit"
                  className="mt-6 flex w-full items-center justify-center rounded-xl bg-[#172033] px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#172033]/20 transition duration-200 hover:-translate-y-0.5 hover:bg-[#222e45] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                  disabled={busy}
                >

                  {busy ? (
                    <>
                      {/* Spinner */}

                      <svg
                        className="mr-2 h-4 w-4 animate-spin"
                        viewBox="0 0 24 24"
                        fill="none"
                      >

                        <circle
                          className="opacity-30"
                          cx="12"
                          cy="12"
                          r="9"
                          stroke="currentColor"
                          strokeWidth="3"
                        />

                        <path
                          d="M21 12a9 9 0 0 1-9 9"
                          stroke="currentColor"
                          strokeWidth="3"
                        />

                      </svg>

                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign in

                      <span className="ml-2 text-base">
                        →
                      </span>
                    </>
                  )}

                </button>

              </form>


              {/* =================================================
                  DEMO ACCOUNTS
              ================================================== */}

              <div className="mt-7">

                {/* Divider */}

                <div className="mb-4 flex items-center gap-3">

                  <div className="h-px flex-1 bg-slate-200" />

                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Demo accounts
                  </span>

                  <div className="h-px flex-1 bg-slate-200" />

                </div>


                {/* Account buttons */}

                <div className="grid grid-cols-2 gap-3">


                  {/* ADMIN */}

                  <button
                    type="button"
                    onClick={fillAdmin}
                    className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-left transition duration-200 hover:-translate-y-0.5 hover:border-[#c59d5f] hover:bg-[#c59d5f]/5"
                  >

                    <div className="flex items-center gap-2">

                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#172033] text-[10px] font-bold text-white">
                        A
                      </div>

                      <div className="text-xs font-bold text-[#172033]">
                        Admin
                      </div>

                    </div>

                    <div className="mt-2 text-[11px] text-slate-500">
                      admin / admin123
                    </div>

                  </button>


                  {/* STAFF */}

                  <button
                    type="button"
                    onClick={fillStaff}
                    className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-left transition duration-200 hover:-translate-y-0.5 hover:border-[#c59d5f] hover:bg-[#c59d5f]/5"
                  >

                    <div className="flex items-center gap-2">

                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#c59d5f] text-[10px] font-bold text-white">
                        S
                      </div>

                      <div className="text-xs font-bold text-[#172033]">
                        Staff
                      </div>

                    </div>

                    <div className="mt-2 text-[11px] text-slate-500">
                      staff / staff123
                    </div>

                  </button>

                </div>

              </div>

            </div>


            {/* Footer */}

            <p className="mt-6 text-center text-xs text-slate-400">
              Secure shop management system
            </p>

          </div>

        </div>

      </div>

    </div>
  )
}