import { AlertTriangle, RefreshCw, TrendingUp, Wallet, Package, ReceiptText, IndianRupee } from 'lucide-react'
import {
  Badge,
  Loading,
  PageHeader,
  Stat,
  cap,
  inr,
  num,
  useFetch,
  useMobile,
} from '../../ui'

export default function Dashboard() {
  const mobile = useMobile()

  const {
    data: d,
    loading,
    error,
    reload,
  } = useFetch('/reports/dashboard/')

  if (loading || error) {
    return <Loading error={error} retry={reload} />
  }

  const max = Math.max(
    1,
    ...d.last7.map((x) =>
      Number(x.amount)
    )
  )

  return (
    <div className="relative min-h-full overflow-hidden bg-[#f8f6f2]">

      {/* =====================================================
          TEXTILE BACKGROUND
      ====================================================== */}

      <div className="pointer-events-none absolute inset-0 opacity-[0.035]">

        <div
          className="h-full w-full"
          style={{
            backgroundImage: `
              linear-gradient(45deg, #172033 25%, transparent 25%),
              linear-gradient(-45deg, #172033 25%, transparent 25%),
              linear-gradient(45deg, transparent 75%, #172033 75%),
              linear-gradient(-45deg, transparent 75%, #172033 75%)
            `,
            backgroundSize: '40px 40px',
            backgroundPosition:
              '0 0, 0 20px, 20px -20px, -20px 0px',
          }}
        />

      </div>


      {/* =====================================================
          MAIN CONTENT
      ====================================================== */}

      <div className="relative z-10">

        {/* =================================================
            HEADER
        ================================================== */}

        <div className="mb-5 overflow-hidden rounded-2xl bg-[#172033] shadow-xl shadow-[#172033]/10">

          <div className="flex items-center justify-between gap-4 px-5 py-5 md:px-6">

            <div className="flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#c59d5f] text-white shadow-lg">

                <ReceiptText size={21} />

              </div>

              <div>

                <h1 className="text-lg font-black tracking-tight text-white md:text-xl">
                  Today at the shop
                </h1>

                <p className="mt-0.5 text-xs text-white/50">
                  Overview of your shop performance
                </p>

              </div>

            </div>


            <button
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-3.5 py-2.5 text-xs font-bold text-white transition hover:bg-white/15"
              onClick={reload}
            >

              <RefreshCw
                size={15}
              />

              <span className="hidden sm:inline">
                Refresh
              </span>

            </button>

          </div>


          {/* GOLD ACCENT */}

          <div className="h-1 bg-[#c59d5f]" />

        </div>


        {/* =================================================
            STAT CARDS
        ================================================== */}

        <div
          className={`grid gap-3 ${
            mobile
              ? 'grid-cols-2'
              : 'grid-cols-2 lg:grid-cols-4'
          }`}
        >

          {/* SALES TODAY */}

          <DashboardStat
            icon={TrendingUp}
            label="Sales today"
            value={inr(d.today.sales)}
            sub={`${d.today.bills} bills`}
          />


          {/* REFUNDS */}

          <DashboardStat
            icon={Wallet}
            label="Refunds today"
            value={inr(d.today.refunds)}
          />


          {/* MONTH SALES */}

          <DashboardStat
            icon={IndianRupee}
            label="Sales this month"
            value={inr(d.month_sales)}
          />


          {/* SUPPLIER PAYABLE */}

          <DashboardStat
            icon={Wallet}
            label="Owed to suppliers"
            value={inr(d.supplier_payables)}
            danger={
              Number(
                d.supplier_payables
              ) > 0
            }
          />


          {/* STOCK VALUE */}

          <DashboardStat
            icon={Package}
            label="Stock value"
            value={inr(d.stock_value)}
            sub="At cost"
          />


          {/* LOW STOCK */}

          <DashboardStat
            icon={AlertTriangle}
            label="Low-stock items"
            value={d.low_stock_count}
            danger={
              d.low_stock_count > 0
            }
          />


          {/* GST */}

          <DashboardStat
            icon={ReceiptText}
            label="GST collected today"
            value={inr(d.today.tax)}
          />

        </div>


        {/* =================================================
            LOWER DASHBOARD
        ================================================== */}

        <div
          className={`mt-4 grid gap-4 ${
            mobile
              ? ''
              : 'lg:grid-cols-3'
          }`}
        >

          {/* =================================================
              LAST 7 DAYS
          ================================================== */}

          <section
            className={`overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_30px_rgba(23,32,51,0.05)] ${
              mobile
                ? ''
                : 'lg:col-span-2'
            }`}
          >

            <div className="border-b border-slate-100 px-5 py-4">

              <div className="flex items-center justify-between">

                <div>

                  <h2 className="text-sm font-black text-[#172033]">
                    Last 7 days
                  </h2>

                  <p className="mt-0.5 text-[10px] text-slate-400">
                    Daily sales performance
                  </p>

                </div>

                <div className="rounded-lg bg-[#f8f6f2] px-2.5 py-1.5 text-[10px] font-bold text-[#b2874f]">
                  SALES
                </div>

              </div>

            </div>


            <div className="p-5">

              <div className="flex h-48 items-end gap-2 md:gap-4">

                {d.last7.map((x) => {

                  const amount =
                    Number(
                      x.amount
                    )

                  const height =
                    (amount / max) *
                    100

                  return (

                    <div
                      key={x.date}
                      className="flex h-full flex-1 flex-col items-center justify-end gap-1.5"
                    >

                      {/* AMOUNT */}

                      <div className="h-4 text-[9px] font-bold text-slate-400">

                        {amount
                          ? Math.round(
                              amount /
                                1000
                            ) + 'k'
                          : ''}

                      </div>


                      {/* BAR */}

                      <div className="flex h-full w-full max-w-[55px] items-end">

                        <div
                          className="w-full rounded-t-xl bg-[#172033] transition-all duration-500"
                          style={{
                            height: `${height}%`,
                            minHeight: 3,
                          }}
                          title={`${x.bills} bills`}
                        />

                      </div>


                      {/* DAY */}

                      <div className="text-[9px] font-bold text-slate-400">

                        {new Date(
                          x.date
                        ).toLocaleDateString(
                          'en-IN',
                          {
                            weekday:
                              'short',
                          }
                        )}

                      </div>

                    </div>

                  )
                })}

              </div>

            </div>

          </section>


          {/* =================================================
              PAYMENT METHODS
          ================================================== */}

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_30px_rgba(23,32,51,0.05)]">

            <div className="border-b border-slate-100 px-5 py-4">

              <h2 className="text-sm font-black text-[#172033]">
                Today by payment method
              </h2>

              <p className="mt-0.5 text-[10px] text-slate-400">
                Payment collection breakdown
              </p>

            </div>


            <div className="p-5">

              {d.today_by_method.length === 0 && (

                <div className="rounded-xl bg-[#f8f6f2] px-4 py-6 text-center">

                  <Wallet
                    size={22}
                    className="mx-auto mb-2 text-slate-300"
                  />

                  <p className="text-xs text-slate-500">
                    No sales yet today.
                  </p>

                </div>

              )}


              <div className="space-y-2">

                {d.today_by_method.map(
                  (m) => (

                    <div
                      key={
                        m.payment_method
                      }
                      className="flex items-center justify-between rounded-xl border border-slate-100 bg-[#f8f6f2] px-3 py-3"
                    >

                      <div>

                        <div className="text-xs font-bold text-[#172033]">
                          {cap(
                            m.payment_method
                          )}
                        </div>

                        <div className="mt-0.5 text-[10px] text-slate-400">
                          {m.bills}{' '}
                          bills
                        </div>

                      </div>


                      <div className="text-sm font-black text-[#172033]">
                        {inr(
                          m.amount
                        )}
                      </div>

                    </div>

                  )
                )}

              </div>

            </div>

          </section>


          {/* =================================================
              BEST SELLERS
          ================================================== */}

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_30px_rgba(23,32,51,0.05)]">

            <div className="border-b border-slate-100 px-5 py-4">

              <h2 className="text-sm font-black text-[#172033]">
                Best sellers
              </h2>

              <p className="mt-0.5 text-[10px] text-slate-400">
                Last 30 days
              </p>

            </div>


            <div className="p-5">

              {d.top_products.length === 0 && (

                <div className="rounded-xl bg-[#f8f6f2] px-4 py-6 text-center">

                  <Package
                    size={22}
                    className="mx-auto mb-2 text-slate-300"
                  />

                  <p className="text-xs text-slate-500">
                    No sales in this period.
                  </p>

                </div>

              )}


              <div className="space-y-1">

                {d.top_products.map(
                  (p, index) => (

                    <div
                      key={p.name}
                      className="flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 transition hover:bg-[#f8f6f2]"
                    >

                      <div className="flex min-w-0 items-center gap-3">

                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#172033] text-[10px] font-black text-white">

                          {index + 1}

                        </div>


                        <span className="truncate text-xs font-bold text-[#172033]">

                          {p.name}

                        </span>

                      </div>


                      <div className="shrink-0 text-right">

                        <div className="text-xs font-black text-[#172033]">

                          {inr(
                            p.revenue
                          )}

                        </div>

                        <div className="text-[9px] text-slate-400">

                          {num(
                            p.qty
                          )}{' '}
                          sold

                        </div>

                      </div>

                    </div>

                  )
                )}

              </div>

            </div>

          </section>


          {/* =================================================
              RUNNING LOW
          ================================================== */}

          <section
            className={`overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_30px_rgba(23,32,51,0.05)] ${
              mobile
                ? ''
                : 'lg:col-span-2'
            }`}
          >

            <div className="border-b border-slate-100 px-5 py-4">

              <div className="flex items-center justify-between">

                <div>

                  <div className="flex items-center gap-2">

                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-500">

                      <AlertTriangle
                        size={16}
                      />

                    </div>

                    <h2 className="text-sm font-black text-[#172033]">
                      Running low
                    </h2>

                  </div>

                  <p className="mt-1 text-[10px] text-slate-400">
                    Products below reorder level
                  </p>

                </div>


                {d.low_stock.length >
                  0 && (

                  <div className="rounded-full bg-red-50 px-2.5 py-1 text-[9px] font-black text-red-500">

                    {d.low_stock.length}{' '}
                    ALERT
                    {d.low_stock.length >
                    1
                      ? 'S'
                      : ''}

                  </div>

                )}

              </div>

            </div>


            <div className="p-5">

              {d.low_stock.length ===
                0 && (

                <div className="rounded-xl bg-green-50 px-4 py-5 text-center">

                  <div className="text-sm font-bold text-green-600">
                    Stock looks good
                  </div>

                  <p className="mt-1 text-[10px] text-green-600/70">
                    Everything is stocked above
                    its reorder level.
                  </p>

                </div>

              )}


              <div className="space-y-2">

                {d.low_stock.map(
                  (p) => (

                    <div
                      key={p.id}
                      className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-[#f8f6f2] px-3 py-3"
                    >

                      <div className="min-w-0">

                        <div className="truncate text-xs font-bold text-[#172033]">
                          {p.name}
                        </div>

                        <div className="mt-0.5 text-[9px] font-semibold text-slate-400">
                          SKU: {p.sku}
                        </div>

                      </div>


                      <Badge
                        tone={
                          Number(
                            p.stock
                          ) === 0
                            ? 'red'
                            : 'amber'
                        }
                      >

                        {num(
                          p.stock
                        )}{' '}
                        {p.unit}{' '}
                        left

                      </Badge>

                    </div>

                  )
                )}

              </div>

            </div>

          </section>

        </div>

      </div>

    </div>
  )
}


/* =========================================================
   DASHBOARD STAT
========================================================= */

function DashboardStat({
  icon: Icon,
  label,
  value,
  sub,
  danger = false,
}) {

  return (

    <div
      className={`
        group relative overflow-hidden
        rounded-2xl border bg-white
        p-4
        shadow-[0_8px_25px_rgba(23,32,51,0.05)]
        transition-all duration-200
        hover:-translate-y-0.5
        hover:shadow-[0_12px_30px_rgba(23,32,51,0.09)]
        ${
          danger
            ? 'border-red-200'
            : 'border-slate-200'
        }
      `}
    >

      {/* TOP ACCENT */}

      <div
        className={`absolute left-0 top-0 h-1 w-full ${
          danger
            ? 'bg-red-400'
            : 'bg-[#c59d5f]'
        }`}
      />


      <div className="flex items-start justify-between gap-3">

        <div className="min-w-0">

          <div className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
            {label}
          </div>

          <div
            className={`mt-2 truncate text-lg font-black md:text-xl ${
              danger
                ? 'text-red-500'
                : 'text-[#172033]'
            }`}
          >
            {value}
          </div>

          {sub && (

            <div className="mt-1 text-[10px] font-semibold text-slate-400">
              {sub}
            </div>

          )}

        </div>


        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
            danger
              ? 'bg-red-50 text-red-500'
              : 'bg-[#f8f6f2] text-[#172033]'
          }`}
        >

          <Icon
            size={17}
          />

        </div>

      </div>


      {/* HOVER ACCENT */}

      <div className="pointer-events-none absolute -bottom-8 -right-8 h-20 w-20 rounded-full bg-[#c59d5f]/5 transition-all duration-300 group-hover:scale-150" />

    </div>

  )
}