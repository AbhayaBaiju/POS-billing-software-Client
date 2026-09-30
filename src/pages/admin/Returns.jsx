import { useState } from 'react'
import {
  Plus,
  RotateCcw,
  Search,
  ReceiptText,
  CalendarDays,
  Wallet,
  UserRound,
} from 'lucide-react'
import { api, errMsg } from '../../api'
import {
  Badge,
  DataList,
  Field,
  Loading,
  Modal,
  PageHeader,
  cap,
  dt,
  inr,
  num,
  useFetch,
  useToast,
} from '../../ui'
import ReturnForm from './ReturnForm'

export default function Returns() {
  const toast = useToast()
  const {
    data: rows,
    loading,
    error,
    reload,
  } = useFetch('/returns/')

  const [open, setOpen] = useState(null)
  const [newOpen, setNewOpen] = useState(false)
  const [inv, setInv] = useState('')
  const [sale, setSale] = useState(null)

  const find = async () => {
    try {
      const { data } = await api.get('/sales/', {
        params: {
          search: inv.trim(),
        },
      })

      if (!data.length) {
        return toast(
          'No bill found with that number',
          'err',
        )
      }

      setSale(data[0])
    } catch (e) {
      toast(errMsg(e), 'err')
    }
  }

  const closeNew = () => {
    setNewOpen(false)
    setSale(null)
    setInv('')
  }

  const columns = [
    {
      label: 'Bill',
      primary: true,
      render: (r) => (
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#f8f6f2] text-[#c59d5f]">
            <ReceiptText size={16} />
          </div>

          <div>
            <div className="font-extrabold text-[#172033]">
              {r.invoice_no}
            </div>

            <div className="text-xs text-slate-400">
              Return #{r.id}
            </div>
          </div>
        </div>
      ),
    },

    {
      label: 'Date',
      render: (r) => (
        <div className="flex items-center gap-1.5 text-sm">
          <CalendarDays
            size={14}
            className="text-[#c59d5f]"
          />
          {dt(r.created_at)}
        </div>
      ),
    },

    {
      label: 'Reason',
      render: (r) => (
        <span className="text-sm text-slate-600">
          {r.reason || '—'}
        </span>
      ),
    },

    {
      label: 'Refund via',
      render: (r) => (
        <Badge>
          {cap(r.refund_method)}
        </Badge>
      ),
    },

    {
      label: 'Handled by',
      render: (r) => (
        <div className="flex items-center gap-1.5 text-sm">
          <UserRound
            size={14}
            className="text-slate-400"
          />
          {r.processed_by_name || '—'}
        </div>
      ),
    },

    {
      label: 'Refund',
      right: true,
      trailing: true,
      render: (r) => (
        <span className="font-extrabold text-[#172033]">
          {inr(r.refund_amount)}
        </span>
      ),
    },
  ]

  return (
    <>
      {/* Header */}
      <PageHeader title="Returns">
        <button
          className="btn-primary flex items-center gap-2"
          onClick={() => setNewOpen(true)}
        >
          <Plus size={16} />
          New return
        </button>
      </PageHeader>

      {/* Intro banner */}
      <div className="relative mb-4 overflow-hidden rounded-2xl bg-[#172033] p-5 text-white shadow-lg shadow-[#172033]/10">
        <div className="pointer-events-none absolute right-0 top-0 h-32 w-32 rounded-full bg-[#c59d5f]/10 blur-2xl" />

        <div className="relative flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#c59d5f] text-[#172033]">
            <RotateCcw size={20} />
          </div>

          <div>
            <h2 className="text-base font-extrabold">
              Sales returns
            </h2>

            <p className="mt-0.5 text-xs text-white/60">
              Review returned items, refund methods and
              processed return transactions.
            </p>
          </div>
        </div>
      </div>

      {/* Return list */}
      {loading || error ? (
        <Loading
          error={error}
          retry={reload}
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[#172033]/8 bg-white shadow-sm">
          <DataList
            rows={rows}
            columns={columns}
            onRowClick={setOpen}
            empty="No returns recorded."
          />
        </div>
      )}

      {/* Return details */}
      {open && (
        <Modal
          title={`Return · ${open.invoice_no}`}
          onClose={() => setOpen(null)}
        >
          <div className="space-y-4">
            {/* Summary */}
            <div className="rounded-2xl bg-[#172033] p-4 text-white">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#c59d5f] text-[#172033]">
                  <RotateCcw size={18} />
                </div>

                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-[#c59d5f]">
                    Return
                  </div>

                  <div className="font-extrabold">
                    {open.invoice_no}
                  </div>
                </div>
              </div>
            </div>

            {/* Returned items */}
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm font-extrabold text-[#172033]">
                <ReceiptText
                  size={16}
                  className="text-[#c59d5f]"
                />
                Returned items
              </div>

              <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white">
                <ul className="divide-y divide-slate-100 text-sm">
                  {open.items.map((i) => (
                    <li
                      key={i.id}
                      className="flex items-center justify-between gap-3 p-3"
                    >
                      <div className="min-w-0">
                        <div className="truncate font-semibold text-[#172033]">
                          {i.name}
                        </div>

                        <div className="mt-0.5 text-xs text-slate-500">
                          Quantity × {num(i.quantity)}
                        </div>
                      </div>

                      <b className="shrink-0 text-[#172033]">
                        {inr(i.amount)}
                      </b>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Return information */}
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl bg-[#f8f6f2] p-3">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Refund method
                </div>

                <div className="mt-1 flex items-center gap-2 text-sm font-extrabold text-[#172033]">
                  <Wallet
                    size={15}
                    className="text-[#c59d5f]"
                  />
                  {cap(open.refund_method)}
                </div>
              </div>

              <div className="rounded-xl bg-[#f8f6f2] p-3">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Returned on
                </div>

                <div className="mt-1 flex items-center gap-2 text-sm font-extrabold text-[#172033]">
                  <CalendarDays
                    size={15}
                    className="text-[#c59d5f]"
                  />
                  {dt(open.created_at)}
                </div>
              </div>
            </div>

            {/* Reason */}
            <div className="rounded-xl border border-[#c59d5f]/20 bg-[#fffaf1] p-3">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#c59d5f]">
                Reason
              </div>

              <p className="mt-1 text-sm text-slate-600">
                {open.reason ||
                  'No reason noted'}
              </p>
            </div>

            {/* Refund amount */}
            <div className="flex items-center justify-between rounded-2xl bg-[#172033] px-4 py-3 text-white">
              <span className="text-sm text-white/60">
                Total refunded
              </span>

              <span className="text-xl font-extrabold text-[#c59d5f]">
                {inr(open.refund_amount)}
              </span>
            </div>
          </div>
        </Modal>
      )}

      {/* New return */}
      {newOpen && (
        <Modal
          title="New return"
          onClose={closeNew}
          wide
        >
          {!sale ? (
            <div className="relative overflow-hidden rounded-2xl bg-[#f8f6f2] p-5">
              {/* Decorative pattern */}
              <div className="pointer-events-none absolute inset-0 opacity-[0.035]">
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

              <div className="relative">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#172033] text-[#c59d5f]">
                    <Search size={19} />
                  </div>

                  <div>
                    <h3 className="text-base font-extrabold text-[#172033]">
                      Find the bill
                    </h3>

                    <p className="text-xs text-slate-500">
                      Enter the invoice number to start
                      a return.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
                  <div className="flex-1">
                    <Field label="Bill number">
                      <input
                        className="input bg-white"
                        autoFocus
                        placeholder="INV-260930-00012"
                        value={inv}
                        onChange={(e) =>
                          setInv(e.target.value)
                        }
                        onKeyDown={(e) =>
                          e.key === 'Enter' &&
                          inv &&
                          find()
                        }
                      />
                    </Field>
                  </div>

                  <button
                    className="btn-primary flex items-center justify-center gap-2 sm:mb-0.5"
                    onClick={find}
                    disabled={!inv}
                  >
                    <Search size={16} />
                    Find bill
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <ReturnForm
              sale={sale}
              onDone={() => {
                closeNew()
                reload()
              }}
            />
          )}
        </Modal>
      )}
    </>
  )
}