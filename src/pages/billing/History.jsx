import { useState } from 'react'
import {
  CalendarDays,
  FileText,
  Search,
  History as HistoryIcon,
  ReceiptText,
} from 'lucide-react'
import { useAuth } from '../../auth'
import {
  Loading,
  SearchInput,
  Stat,
  inr,
  isoToday,
  useDebounced,
  useFetch,
  useMobile,
} from '../../ui'
import { BillDetail, BillsTable } from '../admin/Sales'

export default function History() {
  const { isAdmin } = useAuth()
  const mobile = useMobile()

  const [q, setQ] = useState('')
  const [day, setDay] = useState(isoToday())
  const dq = useDebounced(q)

  const {
    data: rows,
    loading,
    error,
    reload,
  } = useFetch('/sales/', {
    search: dq,
    date_from: day || undefined,
    date_to: day || undefined,
  })

  const [open, setOpen] = useState(null)

  const total =
    rows?.reduce(
      (s, r) => s + Number(r.total),
      0
    ) || 0

  return (
    <div className="h-full overflow-y-auto bg-[#f8f6f2]">
      <div className="mx-auto max-w-6xl p-3 sm:p-5">

        {/* Header */}
        <div className="relative mb-5 overflow-hidden rounded-2xl bg-[#172033] p-5 text-white shadow-lg">
          {/* Textile pattern */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.04]"
            style={{
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
            }}
          />

          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[#c59d5f]/10 blur-3xl" />

          <div className="relative flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#c59d5f] text-[#172033] shadow-md">
              <HistoryIcon size={23} />
            </div>

            <div>
              <h1 className="text-xl font-extrabold sm:text-2xl">
                Billing History
              </h1>

              <p className="mt-1 text-xs text-white/60 sm:text-sm">
                View previous bills, customers and transaction details.
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-4 rounded-2xl border border-[#172033]/8 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <Search
              size={16}
              className="text-[#c59d5f]"
            />

            <h2 className="text-sm font-extrabold text-[#172033]">
              Find a bill
            </h2>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="min-w-0 flex-1">
              <SearchInput
                value={q}
                onChange={setQ}
                placeholder="Bill no. or customer"
              />
            </div>

            <label className="block text-xs font-bold text-slate-500">
              <span className="mb-1 flex items-center gap-1.5">
                <CalendarDays
                  size={13}
                  className="text-[#c59d5f]"
                />
                Day
              </span>

              <input
                className="input w-full sm:w-auto"
                type="date"
                value={day}
                max={isoToday()}
                onChange={(e) =>
                  setDay(e.target.value)
                }
              />
            </label>

            {day && (
              <button
                className="btn-ghost h-[42px]"
                onClick={() => setDay('')}
              >
                All days
              </button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div
          className={`mb-4 grid gap-3 ${
            mobile
              ? 'grid-cols-2'
              : 'grid-cols-2'
          }`}
        >
          <HistoryStat
            icon={<FileText size={18} />}
            label="Bills"
            value={rows?.length ?? '–'}
          />

          <HistoryStat
            icon={<ReceiptText size={18} />}
            label="Billed amount"
            value={inr(total)}
            accent
          />
        </div>

        {/* Bills */}
        <div className="overflow-hidden rounded-2xl border border-[#172033]/8 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-[#172033]/8 px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f8f6f2] text-[#c59d5f]">
                <ReceiptText size={15} />
              </div>

              <div>
                <h2 className="text-sm font-extrabold text-[#172033]">
                  Bills
                </h2>

                <p className="text-[11px] text-slate-400">
                  {day
                    ? `Transactions for ${day}`
                    : 'All available transactions'}
                </p>
              </div>
            </div>

            {rows && (
              <span className="rounded-full bg-[#f8f6f2] px-2.5 py-1 text-[11px] font-bold text-[#172033]">
                {rows.length} record
                {rows.length !== 1
                  ? 's'
                  : ''}
              </span>
            )}
          </div>

          {loading || error ? (
            <div className="p-4">
              <Loading
                error={error}
                retry={reload}
              />
            </div>
          ) : rows?.length === 0 ? (
            <div className="p-10 text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f8f6f2] text-[#c59d5f]">
                <ReceiptText size={25} />
              </div>

              <div className="text-sm font-extrabold text-[#172033]">
                No bills found
              </div>

              <p className="mt-1 text-xs text-slate-500">
                Try another date, bill number or customer name.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <BillsTable
                rows={rows}
                onOpen={setOpen}
                showStaff={isAdmin}
              />
            </div>
          )}
        </div>

        {/* Bill Details */}
        {open && (
          <BillDetail
            sale={open}
            onClose={() => setOpen(null)}
            canReturn={false}
            onChanged={reload}
          />
        )}
      </div>
    </div>
  )
}

function HistoryStat({
  icon,
  label,
  value,
  accent = false,
}) {
  return (
    <div
      className={`
        relative overflow-hidden rounded-2xl
        border p-4 shadow-sm
        ${
          accent
            ? 'border-[#c59d5f]/20 bg-[#fffaf1]'
            : 'border-[#172033]/8 bg-white'
        }
      `}
    >
      <div className="flex items-center gap-3">
        <div
          className={`
            flex h-10 w-10 shrink-0 items-center
            justify-center rounded-xl
            ${
              accent
                ? 'bg-[#172033] text-[#c59d5f]'
                : 'bg-[#f8f6f2] text-[#c59d5f]'
            }
          `}
        >
          {icon}
        </div>

        <div className="min-w-0">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            {label}
          </div>

          <div className="mt-0.5 truncate text-lg font-extrabold text-[#172033] sm:text-xl">
            {value}
          </div>
        </div>
      </div>

      {accent && (
        <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[#c59d5f]/10 blur-2xl" />
      )}
    </div>
  )
}