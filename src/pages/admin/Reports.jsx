import { useState } from 'react'
import {
  Download,
  BarChart3,
  BookOpen,
  Package,
  CalendarDays,
  TrendingUp,
  TrendingDown,
  Wallet,
} from 'lucide-react'
import {
  Badge,
  Loading,
  Stat,
  Tabs,
  cap,
  dOnly,
  dt,
  downloadCsv,
  inr,
  isoToday,
  num,
  useFetch,
  useMobile,
} from '../../ui'

export default function Reports() {
  const [tab, setTab] = useState('sales')
  const [from, setFrom] = useState(isoToday(-29))
  const [to, setTo] = useState(isoToday())

  return (
    <div className="min-h-full bg-[#f8f6f2]">
      {/* Textile background */}
      <div className="pointer-events-none fixed inset-0 -z-10 opacity-[0.035]">
        <div
          className="h-full w-full"
          style={{
            backgroundImage: `
              repeating-linear-gradient(
                45deg,
                #172033 0,
                #172033 1px,
                transparent 1px,
                transparent 7px
              ),
              repeating-linear-gradient(
                -45deg,
                #c59d5f 0,
                #c59d5f 1px,
                transparent 1px,
                transparent 7px
              )
            `,
          }}
        />
      </div>

      {/* Header */}
      <div className="mb-5 rounded-2xl bg-[#172033] px-5 py-5 text-white shadow-xl shadow-[#172033]/10 md:px-6">
        <div>
          <div className="mb-1 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[#c59d5f]">
            <BarChart3 size={15} />
            Business overview
          </div>

          <h1 className="text-2xl font-extrabold tracking-tight md:text-3xl">
            Reports & Ledger
          </h1>

          <p className="mt-1 text-sm text-white/65">
            Review sales, cash flow and current stock position.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-4 overflow-x-auto rounded-2xl border border-[#172033]/8 bg-white p-1.5 shadow-sm">
        <Tabs
          tabs={[
            ['sales', 'Sales'],
            ['ledger', 'Ledger'],
            ['stock', 'Stock'],
          ]}
          value={tab}
          onChange={setTab}
        />
      </div>

      {/* Date filters */}
      {tab !== 'stock' && (
        <div className="mb-5 rounded-2xl border border-[#172033]/8 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-2 text-sm font-extrabold text-[#172033]">
            <CalendarDays size={16} className="text-[#c59d5f]" />
            Report period
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <label className="text-xs font-bold text-slate-500">
              From
              <input
                className="input mt-1 bg-[#f8f6f2]"
                type="date"
                value={from}
                max={to}
                onChange={(e) => setFrom(e.target.value)}
              />
            </label>

            <div className="hidden pb-3 text-slate-300 sm:block">→</div>

            <label className="text-xs font-bold text-slate-500">
              To
              <input
                className="input mt-1 bg-[#f8f6f2]"
                type="date"
                value={to}
                min={from}
                onChange={(e) => setTo(e.target.value)}
              />
            </label>
          </div>
        </div>
      )}

      {tab === 'sales' && (
        <SalesReport from={from} to={to} />
      )}

      {tab === 'ledger' && (
        <Ledger from={from} to={to} />
      )}

      {tab === 'stock' && <StockReport />}
    </div>
  )
}

function Table({ head, children }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#172033]/8 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px] text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-[#172033]">
              {head.map(([h, r]) => (
                <th
                  key={h}
                  className={`px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-white/70 ${
                    r ? 'text-right' : ''
                  }`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {children}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function SalesReport({ from, to }) {
  const mobile = useMobile()

  const {
    data: d,
    loading,
    error,
    reload,
  } = useFetch('/reports/sales/', {
    date_from: from,
    date_to: to,
  })

  if (loading || error) {
    return <Loading error={error} retry={reload} />
  }

  const s = d.summary

  return (
    <div className="space-y-5">
      {/* Summary */}
      <div
        className={`grid gap-3 ${
          mobile ? 'grid-cols-2' : 'grid-cols-4'
        }`}
      >
        <Stat
          label="Gross sales"
          value={inr(s.gross_sales)}
          sub={`${s.bills} bills`}
        />

        <Stat
          label="Refunds"
          value={inr(s.refunds)}
        />

        <Stat
          label="Net sales"
          value={inr(s.net_sales)}
        />

        <Stat
          label="Average bill"
          value={inr(s.average_bill)}
        />

        <Stat
          label="Discounts given"
          value={inr(s.discounts)}
        />

        <Stat
          label="GST collected"
          value={inr(s.tax)}
        />
      </div>

      {/* Export */}
      <div className="flex justify-end">
        <button
          className="flex items-center gap-2 rounded-xl border border-[#172033]/10 bg-white px-4 py-2.5 text-sm font-bold text-[#172033] shadow-sm transition hover:border-[#c59d5f] hover:bg-[#fffaf1]"
          onClick={() =>
            downloadCsv(
              `sales_${from}_${to}.csv`,
              [
                'Date',
                'Bills',
                'Discount',
                'GST',
                'Sales',
              ],
              d.daily.map((r) => [
                r.d,
                r.bills,
                r.discount,
                r.tax,
                r.amount,
              ]),
            )
          }
        >
          <Download size={16} className="text-[#c59d5f]" />
          Export daily CSV
        </button>
      </div>

      {/* Daily sales */}
      <section>
        <div className="mb-2 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#172033] text-[#c59d5f]">
            <TrendingUp size={15} />
          </div>

          <h2 className="text-sm font-extrabold text-[#172033]">
            Daily sales
          </h2>
        </div>

        <Table
          head={[
            ['Date'],
            ['Bills', 1],
            ['Discount', 1],
            ['GST', 1],
            ['Sales', 1],
          ]}
        >
          {d.daily.length === 0 && (
            <tr>
              <td
                className="px-4 py-8 text-center text-sm text-slate-500"
                colSpan={5}
              >
                No sales in this period.
              </td>
            </tr>
          )}

          {d.daily.map((r) => (
            <tr
              key={r.d}
              className="transition hover:bg-[#f8f6f2]"
            >
              <td className="px-4 py-3 font-semibold text-[#172033]">
                {dOnly(r.d)}
              </td>

              <td className="px-4 py-3 text-right text-slate-600">
                {r.bills}
              </td>

              <td className="px-4 py-3 text-right text-slate-600">
                {inr(r.discount)}
              </td>

              <td className="px-4 py-3 text-right text-slate-600">
                {inr(r.tax)}
              </td>

              <td className="px-4 py-3 text-right font-extrabold text-[#172033]">
                {inr(r.amount)}
              </td>
            </tr>
          ))}
        </Table>
      </section>

      {/* Payment + cashier */}
      <div
        className={`grid gap-5 ${
          mobile ? '' : 'grid-cols-2'
        }`}
      >
        <div className="space-y-5">
          <section>
            <div className="mb-2 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#172033] text-[#c59d5f]">
                <Wallet size={15} />
              </div>

              <h2 className="text-sm font-extrabold text-[#172033]">
                By payment method
              </h2>
            </div>

            <Table
              head={[
                ['Method'],
                ['Bills', 1],
                ['Amount', 1],
              ]}
            >
              {d.by_payment_method.map((r) => (
                <tr
                  key={r.payment_method}
                  className="transition hover:bg-[#f8f6f2]"
                >
                  <td className="px-4 py-3 font-semibold text-[#172033]">
                    {cap(r.payment_method)}
                  </td>

                  <td className="px-4 py-3 text-right text-slate-600">
                    {r.bills}
                  </td>

                  <td className="px-4 py-3 text-right font-extrabold text-[#172033]">
                    {inr(r.amount)}
                  </td>
                </tr>
              ))}
            </Table>
          </section>

          <section>
            <div className="mb-2 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#172033] text-[#c59d5f]">
                <BookOpen size={15} />
              </div>

              <h2 className="text-sm font-extrabold text-[#172033]">
                By cashier
              </h2>
            </div>

            <Table
              head={[
                ['Cashier'],
                ['Bills', 1],
                ['Amount', 1],
              ]}
            >
              {d.by_staff.map((r) => (
                <tr
                  key={r.staff}
                  className="transition hover:bg-[#f8f6f2]"
                >
                  <td className="px-4 py-3 font-semibold text-[#172033]">
                    {r.staff}
                  </td>

                  <td className="px-4 py-3 text-right text-slate-600">
                    {r.bills}
                  </td>

                  <td className="px-4 py-3 text-right font-extrabold text-[#172033]">
                    {inr(r.amount)}
                  </td>
                </tr>
              ))}
            </Table>
          </section>
        </div>

        {/* Top products */}
        <section>
          <div className="mb-2 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#172033] text-[#c59d5f]">
              <Package size={15} />
            </div>

            <h2 className="text-sm font-extrabold text-[#172033]">
              Top products
            </h2>
          </div>

          <Table
            head={[
              ['Product'],
              ['Qty', 1],
              ['Revenue', 1],
            ]}
          >
            {d.top_products.length === 0 && (
              <tr>
                <td
                  colSpan={3}
                  className="px-4 py-8 text-center text-sm text-slate-500"
                >
                  No products sold in this period.
                </td>
              </tr>
            )}

            {d.top_products.map((r) => (
              <tr
                key={r.sku}
                className="transition hover:bg-[#f8f6f2]"
              >
                <td className="px-4 py-3">
                  <div className="font-bold text-[#172033]">
                    {r.name}
                  </div>

                  <div className="text-xs text-slate-400">
                    {r.sku}
                  </div>
                </td>

                <td className="px-4 py-3 text-right font-semibold text-slate-600">
                  {num(r.qty)}
                </td>

                <td className="px-4 py-3 text-right font-extrabold text-[#172033]">
                  {inr(r.revenue)}
                </td>
              </tr>
            ))}
          </Table>
        </section>
      </div>
    </div>
  )
}

function Ledger({ from, to }) {
  const mobile = useMobile()

  const {
    data: d,
    loading,
    error,
    reload,
  } = useFetch('/reports/ledger/', {
    date_from: from,
    date_to: to,
  })

  if (loading || error) {
    return <Loading error={error} retry={reload} />
  }

  return (
    <div className="space-y-5">
      {/* Summary */}
      <div
        className={`grid gap-3 ${
          mobile ? 'grid-cols-2' : 'grid-cols-4'
        }`}
      >
        <Stat
          label="Opening balance"
          value={inr(d.opening_balance)}
        />

        <Stat
          label="Money in"
          value={inr(d.total_in)}
        />

        <Stat
          label="Money out"
          value={inr(d.total_out)}
        />

        <Stat
          label="Closing balance"
          value={inr(d.closing_balance)}
        />
      </div>

      {/* Explanation */}
      <div className="rounded-2xl border border-[#c59d5f]/25 bg-[#fffaf1] p-4">
        <div className="flex gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#172033] text-[#c59d5f]">
            <Wallet size={16} />
          </div>

          <div>
            <div className="text-sm font-extrabold text-[#172033]">
              Ledger information
            </div>

            <p className="mt-1 text-xs leading-relaxed text-slate-500">
              Money in is every bill (cash, card and UPI).
              Money out is customer refunds and supplier
              payments.
            </p>
          </div>
        </div>
      </div>

      {/* Export */}
      <div className="flex justify-end">
        <button
          className="flex items-center gap-2 rounded-xl border border-[#172033]/10 bg-white px-4 py-2.5 text-sm font-bold text-[#172033] shadow-sm transition hover:border-[#c59d5f] hover:bg-[#fffaf1]"
          onClick={() =>
            downloadCsv(
              `ledger_${from}_${to}.csv`,
              [
                'Date',
                'Type',
                'Reference',
                'Details',
                'In',
                'Out',
                'Balance',
              ],
              d.entries.map((e) => [
                e.date,
                e.type,
                e.ref,
                e.description,
                e.money_in,
                e.money_out,
                e.balance,
              ]),
            )
          }
        >
          <Download
            size={16}
            className="text-[#c59d5f]"
          />
          Export CSV
        </button>
      </div>

      {/* Ledger table */}
      <Table
        head={[
          ['Date'],
          ['Entry'],
          ['Details'],
          ['In', 1],
          ['Out', 1],
          ['Balance', 1],
        ]}
      >
        {d.entries.length === 0 && (
          <tr>
            <td
              className="px-4 py-8 text-center text-sm text-slate-500"
              colSpan={6}
            >
              No transactions in this period.
            </td>
          </tr>
        )}

        {d.entries.map((e, i) => (
          <tr
            key={i}
            className="transition hover:bg-[#f8f6f2]"
          >
            <td className="whitespace-nowrap px-4 py-3 text-sm font-semibold text-[#172033]">
              {dt(e.date)}
            </td>

            <td className="px-4 py-3">
              <div className="flex items-center gap-2">
                <Badge
                  tone={
                    e.type === 'Sale'
                      ? 'green'
                      : 'red'
                  }
                >
                  {e.type}
                </Badge>

                <span className="text-xs text-slate-500">
                  {e.ref}
                </span>
              </div>
            </td>

            <td className="px-4 py-3 text-sm text-slate-600">
              {e.description}
            </td>

            <td className="px-4 py-3 text-right text-sm font-semibold text-emerald-600">
              {Number(e.money_in)
                ? inr(e.money_in)
                : ''}
            </td>

            <td className="px-4 py-3 text-right text-sm font-semibold text-red-600">
              {Number(e.money_out)
                ? inr(e.money_out)
                : ''}
            </td>

            <td className="px-4 py-3 text-right text-sm font-extrabold text-[#172033]">
              {inr(e.balance)}
            </td>
          </tr>
        ))}
      </Table>
    </div>
  )
}

function StockReport() {
  const mobile = useMobile()
  const [low, setLow] = useState(false)

  const {
    data: d,
    loading,
    error,
    reload,
  } = useFetch('/reports/stock/', {
    low_stock: low ? 1 : undefined,
  })

  if (loading || error) {
    return <Loading error={error} retry={reload} />
  }

  return (
    <div className="space-y-5">
      {/* Summary */}
      <div
        className={`grid gap-3 ${
          mobile ? 'grid-cols-2' : 'grid-cols-3'
        }`}
      >
        <Stat
          label="Stock at cost"
          value={inr(d.total_cost_value)}
        />

        <Stat
          label="Stock at selling price"
          value={inr(d.total_retail_value)}
        />

        <Stat
          label="Low-stock items"
          value={d.low_stock_count}
          tone={
            d.low_stock_count
              ? 'red'
              : undefined
          }
        />
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-3 rounded-2xl border border-[#172033]/8 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <label className="flex cursor-pointer items-center gap-2 text-sm font-bold text-[#172033]">
          <input
            type="checkbox"
            checked={low}
            onChange={(e) =>
              setLow(e.target.checked)
            }
            className="h-4 w-4 accent-[#c59d5f]"
          />

          Low stock only
        </label>

        <button
          className="flex items-center justify-center gap-2 rounded-xl border border-[#172033]/10 bg-[#f8f6f2] px-4 py-2.5 text-sm font-bold text-[#172033] transition hover:border-[#c59d5f] hover:bg-[#fffaf1]"
          onClick={() =>
            downloadCsv(
              'stock.csv',
              [
                'SKU',
                'Product',
                'Category',
                'Stock',
                'Unit',
                'Cost value',
                'Retail value',
              ],
              d.items.map((r) => [
                r.sku,
                r.name,
                r.category,
                r.stock,
                r.unit,
                r.cost_value,
                r.retail_value,
              ]),
            )
          }
        >
          <Download
            size={16}
            className="text-[#c59d5f]"
          />
          Export CSV
        </button>
      </div>

      {/* Stock table */}
      <Table
        head={[
          ['Product'],
          ['Category'],
          ['Stock', 1],
          ['At cost', 1],
          ['At price', 1],
        ]}
      >
        {d.items.length === 0 && (
          <tr>
            <td
              colSpan={5}
              className="px-4 py-8 text-center text-sm text-slate-500"
            >
              No stock items found.
            </td>
          </tr>
        )}

        {d.items.map((r) => (
          <tr
            key={r.id}
            className="transition hover:bg-[#f8f6f2]"
          >
            <td className="px-4 py-3">
              <div className="font-bold text-[#172033]">
                {r.name}
              </div>

              <div className="text-xs text-slate-400">
                {r.sku}
              </div>
            </td>

            <td className="px-4 py-3 text-sm font-semibold text-slate-600">
              {r.category}
            </td>

            <td className="px-4 py-3 text-right">
              <div className="flex items-center justify-end gap-1.5 text-sm font-bold text-[#172033]">
                {num(r.stock)} {r.unit}

                {r.low && (
                  <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-extrabold uppercase text-red-600">
                    Low
                  </span>
                )}
              </div>
            </td>

            <td className="px-4 py-3 text-right text-sm font-semibold text-slate-600">
              {inr(r.cost_value)}
            </td>

            <td className="px-4 py-3 text-right text-sm font-extrabold text-[#172033]">
              {inr(r.retail_value)}
            </td>
          </tr>
        ))}
      </Table>
    </div>
  )
}