import { useState } from 'react'
import { Undo2, ReceiptText, Search, SlidersHorizontal } from 'lucide-react'
import { Receipt, PrintButton } from '../../receipt'
import {
  Badge,
  DataList,
  Loading,
  Modal,
  PageHeader,
  SearchInput,
  cap,
  dt,
  inr,
  payTone,
  statusTone,
  useDebounced,
  useFetch,
} from '../../ui'
import ReturnForm from './ReturnForm'

export function BillsTable({ rows, onOpen, showStaff }) {
  const columns = [
    {
      label: 'Bill',
      primary: true,
      render: (s) => (
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#f8f6f2] text-[#c59d5f]">
            <ReceiptText size={16} />
          </div>

          <div>
            <div className="font-extrabold text-[#172033]">
              {s.invoice_no}
            </div>
            <div className="text-xs text-slate-400">
              Transaction #{s.id}
            </div>
          </div>
        </div>
      ),
    },

    {
      label: 'Date',
      render: (s) => (
        <span className="text-sm text-slate-600">
          {dt(s.created_at)}
        </span>
      ),
    },

    {
      label: 'Customer',
      render: (s) => (
        <span className="text-sm font-medium text-slate-700">
          {s.customer_name || 'Walk-in'}
        </span>
      ),
    },

    ...(showStaff
      ? [
          {
            label: 'Cashier',
            render: (s) => (
              <span className="text-sm text-slate-600">
                {s.staff_name || '—'}
              </span>
            ),
          },
        ]
      : []),

    {
      label: 'Payment',
      render: (s) => (
        <Badge tone={payTone[s.payment_method]}>
          {cap(s.payment_method)}
        </Badge>
      ),
    },

    {
      label: 'Status',
      render: (s) => (
        <Badge tone={statusTone[s.status]}>
          {cap(s.status)}
        </Badge>
      ),
    },

    {
      label: 'Total',
      right: true,
      trailing: true,
      render: (s) => (
        <span className="font-extrabold text-[#172033]">
          {inr(s.total)}
        </span>
      ),
    },
  ]

  return (
    <div className="overflow-hidden rounded-2xl border border-[#172033]/8 bg-white shadow-sm">
      <DataList
        rows={rows}
        columns={columns}
        onRowClick={onOpen}
        empty="No bills found for these filters."
      />
    </div>
  )
}

export function BillDetail({
  sale,
  onClose,
  canReturn,
  onChanged,
}) {
  const [returning, setReturning] = useState(false)

  return (
    <>
      <Modal
        title={sale.invoice_no}
        onClose={onClose}
        footer={
          <>
            {canReturn &&
              sale.status !== 'returned' && (
                <button
                  className="btn-ghost mr-auto flex items-center gap-2"
                  onClick={() => setReturning(true)}
                >
                  <Undo2 size={16} />
                  Return items
                </button>
              )}

            <PrintButton sale={sale} />
          </>
        }
      >
        <div className="overflow-hidden rounded-2xl border border-[#172033]/8 bg-[#f8f6f2]">
          <div className="border-b border-[#172033]/8 bg-[#172033] px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#c59d5f] text-[#172033]">
                <ReceiptText size={17} />
              </div>

              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#c59d5f]">
                  Sales receipt
                </div>

                <div className="text-sm font-extrabold text-white">
                  {sale.invoice_no}
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto p-3">
            <Receipt sale={sale} />
          </div>
        </div>

        {Number(sale.refunded_total) > 0 && (
          <div className="mt-3 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-center text-sm font-semibold text-red-600">
            Refunded so far:{' '}
            {inr(sale.refunded_total)}
          </div>
        )}
      </Modal>

      {returning && (
        <Modal
          title="Return items"
          onClose={() => setReturning(false)}
          wide
        >
          <ReturnForm
            sale={sale}
            onDone={() => {
              setReturning(false)
              onChanged()
            }}
          />
        </Modal>
      )}
    </>
  )
}

export default function Sales() {
  const [q, setQ] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [pm, setPm] = useState('')
  const [staff, setStaff] = useState('')

  const dq = useDebounced(q)

  const {
    data: rows,
    loading,
    error,
    reload,
  } = useFetch('/sales/', {
    search: dq,
    date_from: from || undefined,
    date_to: to || undefined,
    payment_method: pm || undefined,
    staff: staff || undefined,
  })

  const { data: users } = useFetch('/staff/')
  const [open, setOpen] = useState(null)

  return (
    <>
      <PageHeader title="Bills & transactions" />

      {/* Header banner */}
      <div className="relative mb-4 overflow-hidden rounded-2xl bg-[#172033] p-5 text-white shadow-lg shadow-[#172033]/10">
        <div className="pointer-events-none absolute right-0 top-0 h-32 w-32 rounded-full bg-[#c59d5f]/10 blur-2xl" />

        <div className="relative flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#c59d5f] text-[#172033]">
            <ReceiptText size={20} />
          </div>

          <div>
            <h2 className="text-base font-extrabold">
              Sales history
            </h2>

            <p className="mt-0.5 text-xs text-white/60">
              Search bills, review transactions and process
              customer returns.
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="relative mb-4 overflow-hidden rounded-2xl border border-[#172033]/8 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f8f6f2] text-[#c59d5f]">
            <SlidersHorizontal size={15} />
          </div>

          <div className="text-sm font-extrabold text-[#172033]">
            Filter transactions
          </div>
        </div>

        <div className="flex flex-wrap items-end gap-3">
          <div className="w-full sm:w-auto sm:min-w-[240px]">
            <SearchInput
              value={q}
              onChange={setQ}
              placeholder="Bill no., customer, phone"
            />
          </div>

          <label className="text-xs font-bold text-slate-600">
            From
            <input
              className="input mt-1"
              type="date"
              value={from}
              onChange={(e) =>
                setFrom(e.target.value)
              }
            />
          </label>

          <label className="text-xs font-bold text-slate-600">
            To
            <input
              className="input mt-1"
              type="date"
              value={to}
              onChange={(e) =>
                setTo(e.target.value)
              }
            />
          </label>

          <select
            className="input !w-auto"
            value={pm}
            onChange={(e) =>
              setPm(e.target.value)
            }
            aria-label="Payment method"
          >
            <option value="">All payments</option>
            <option value="cash">Cash</option>
            <option value="card">Card</option>
            <option value="upi">UPI</option>
          </select>

          <select
            className="input !w-auto"
            value={staff}
            onChange={(e) =>
              setStaff(e.target.value)
            }
            aria-label="Cashier"
          >
            <option value="">All cashiers</option>

            {users?.map((u) => (
              <option
                key={u.id}
                value={u.id}
              >
                {u.username}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Sales */}
      {loading || error ? (
        <Loading
          error={error}
          retry={reload}
        />
      ) : (
        <BillsTable
          rows={rows}
          onOpen={setOpen}
          showStaff
        />
      )}

      {/* Footer information */}
      <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
        <Search size={13} />
        Showing the latest 200 matching bills.
      </div>

      {/* Bill details */}
      {open && (
        <BillDetail
          sale={open}
          canReturn
          onClose={() => setOpen(null)}
          onChanged={() => {
            setOpen(null)
            reload()
          }}
        />
      )}
    </>
  )
}