import { useState } from 'react'
import {
  Plus,
  Search,
  Truck,
  Wallet,
  FileText,
  Building2,
  CreditCard,
} from 'lucide-react'
import { api, errMsg } from '../../api'
import {
  Badge,
  DataList,
  Field,
  Loading,
  Modal,
  PageHeader,
  SearchInput,
  dOnly,
  inr,
  useDebounced,
  useFetch,
  useToast,
} from '../../ui'

const blank = {
  name: '',
  contact_person: '',
  phone: '',
  email: '',
  gst_number: '',
  address: '',
  is_active: true,
}

export default function Suppliers() {
  const [q, setQ] = useState('')
  const dq = useDebounced(q)

  const {
    data: rows,
    loading,
    error,
    reload,
  } = useFetch('/suppliers/', {
    search: dq,
  })

  const [open, setOpen] = useState(null)
  const [form, setForm] = useState(null)

  const columns = [
    {
      label: 'Supplier',
      primary: true,
      render: (s) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#f8f6f2] text-[#c59d5f]">
            <Building2 size={17} />
          </div>

          <div>
            <div className="font-extrabold text-[#172033]">
              {s.name}
            </div>

            <div className="text-xs font-normal text-slate-500">
              {s.contact_person}

              {s.phone &&
                ` · ${s.phone}`}
            </div>
          </div>
        </div>
      ),
    },

    {
      label: 'GSTIN',
      render: (s) => (
        <span className="text-sm text-slate-600">
          {s.gst_number || '—'}
        </span>
      ),
    },

    {
      label: 'Purchased',
      right: true,
      render: (s) => (
        <span className="font-semibold text-slate-700">
          {inr(s.purchase_total)}
        </span>
      ),
    },

    {
      label: 'Paid',
      right: true,
      render: (s) => (
        <span className="font-semibold text-slate-700">
          {inr(s.paid_total)}
        </span>
      ),
    },

    {
      label: 'We owe',
      right: true,
      trailing: true,
      render: (s) => (
        <span
          className={
            Number(s.balance) > 0
              ? 'font-extrabold text-red-600'
              : 'font-extrabold text-[#172033]'
          }
        >
          {inr(s.balance)}
        </span>
      ),
    },

    {
      label: 'Status',
      render: (s) =>
        s.is_active ? (
          <Badge tone="green">
            Active
          </Badge>
        ) : (
          <Badge>
            Inactive
          </Badge>
        ),
    },
  ]

  return (
    <>
      <PageHeader title="Suppliers">
        <button
          className="btn-primary flex items-center gap-2"
          onClick={() =>
            setForm({ ...blank })
          }
        >
          <Plus size={16} />
          Add supplier
        </button>
      </PageHeader>

      {/* Header banner */}
      <div className="relative mb-4 overflow-hidden rounded-2xl bg-[#172033] p-5 text-white shadow-lg shadow-[#172033]/10">
        <div className="pointer-events-none absolute right-0 top-0 h-32 w-32 rounded-full bg-[#c59d5f]/10 blur-2xl" />

        <div className="relative flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#c59d5f] text-[#172033]">
            <Truck size={20} />
          </div>

          <div>
            <h2 className="text-base font-extrabold">
              Supplier management
            </h2>

            <p className="mt-0.5 text-xs text-white/60">
              Manage suppliers, purchases, outstanding
              balances and payments.
            </p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="mb-4 rounded-2xl border border-[#172033]/8 bg-white p-4 shadow-sm">
        <div className="mb-2 flex items-center gap-2">
          <Search
            size={15}
            className="text-[#c59d5f]"
          />

          <span className="text-sm font-extrabold text-[#172033]">
            Find supplier
          </span>
        </div>

        <SearchInput
          value={q}
          onChange={setQ}
          placeholder="Search supplier"
        />
      </div>

      {/* Supplier list */}
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
            empty="No suppliers yet."
          />
        </div>
      )}

      {/* Supplier details */}
      {open && (
        <SupplierDetail
          supplier={open}
          onClose={() => setOpen(null)}
          onEdit={() => {
            setForm(open)
            setOpen(null)
          }}
          onChanged={reload}
        />
      )}

      {/* Supplier form */}
      {form && (
        <SupplierForm
          supplier={form}
          onClose={() => setForm(null)}
          onSaved={() => {
            setForm(null)
            reload()
          }}
        />
      )}
    </>
  )
}

function SupplierForm({
  supplier,
  onClose,
  onSaved,
}) {
  const toast = useToast()
  const [f, setF] = useState(supplier)

  const set = (k) => (e) =>
    setF({
      ...f,
      [k]:
        e.target.type === 'checkbox'
          ? e.target.checked
          : e.target.value,
    })

  const save = async () => {
    try {
      if (f.id) {
        await api.put(
          `/suppliers/${f.id}/`,
          f,
        )
      } else {
        await api.post('/suppliers/', f)
      }

      toast('Supplier saved')
      onSaved()
    } catch (e) {
      toast(errMsg(e), 'err')
    }
  }

  const remove = async () => {
    if (
      !window.confirm(
        `Remove ${f.name}?`,
      )
    ) {
      return
    }

    try {
      const r = await api.delete(
        `/suppliers/${f.id}/`,
      )

      toast(
        r.data?.detail ||
          'Supplier removed',
      )

      onSaved()
    } catch (e) {
      toast(errMsg(e), 'err')
    }
  }

  return (
    <Modal
      title={
        f.id
          ? 'Edit supplier'
          : 'Add supplier'
      }
      onClose={onClose}
      wide
      footer={
        <>
          {f.id && (
            <button
              className="btn-ghost mr-auto !text-red-600"
              onClick={remove}
            >
              Delete
            </button>
          )}

          <button
            className="btn-ghost"
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            className="btn-primary"
            onClick={save}
            disabled={!f.name}
          >
            Save
          </button>
        </>
      }
    >
      <div className="relative overflow-hidden rounded-2xl bg-[#f8f6f2] p-4">
        {/* Textile pattern */}
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
          {/* Form heading */}
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#172033] text-[#c59d5f]">
              <Building2 size={18} />
            </div>

            <div>
              <div className="text-sm font-extrabold text-[#172033]">
                Supplier details
              </div>

              <div className="text-xs text-slate-500">
                Add business and contact information.
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Field label="Business name">
                <input
                  className="input bg-white"
                  value={f.name}
                  onChange={set('name')}
                />
              </Field>
            </div>

            <Field label="Contact person">
              <input
                className="input bg-white"
                value={f.contact_person}
                onChange={set(
                  'contact_person',
                )}
              />
            </Field>

            <Field label="Phone">
              <input
                className="input bg-white"
                value={f.phone}
                onChange={set('phone')}
              />
            </Field>

            <Field label="Email">
              <input
                className="input bg-white"
                type="email"
                value={f.email}
                onChange={set('email')}
              />
            </Field>

            <Field label="GSTIN">
              <input
                className="input bg-white"
                value={f.gst_number}
                onChange={set(
                  'gst_number',
                )}
              />
            </Field>

            <div className="sm:col-span-2">
              <Field label="Address">
                <textarea
                  className="input bg-white"
                  rows={3}
                  value={f.address}
                  onChange={set('address')}
                />
              </Field>
            </div>

            <label className="flex items-center gap-3 rounded-xl border border-[#c59d5f]/20 bg-[#fffaf1] p-3 text-sm font-semibold sm:col-span-2">
              <input
                type="checkbox"
                checked={f.is_active}
                onChange={set('is_active')}
                className="h-4 w-4 accent-[#c59d5f]"
              />

              <div>
                <div className="font-extrabold text-[#172033]">
                  Active supplier
                </div>

                <div className="text-xs font-normal text-slate-500">
                  Keep this supplier available for
                  purchases.
                </div>
              </div>
            </label>
          </div>
        </div>
      </div>
    </Modal>
  )
}

function SupplierDetail({
  supplier,
  onClose,
  onEdit,
  onChanged,
}) {
  const toast = useToast()

  const {
    data: led,
    loading,
    error,
    reload,
  } = useFetch(
    `/suppliers/${supplier.id}/ledger/`,
  )

  const [pay, setPay] = useState({
    amount: '',
    method: 'cash',
    note: '',
  })

  const submit = async () => {
    try {
      await api.post(
        `/suppliers/${supplier.id}/pay/`,
        pay,
      )

      toast('Payment recorded')

      setPay({
        amount: '',
        method: 'cash',
        note: '',
      })

      reload()
      onChanged()
    } catch (e) {
      toast(errMsg(e), 'err')
    }
  }

  return (
    <Modal
      title={supplier.name}
      onClose={onClose}
      wide
      footer={
        <button
          className="btn-ghost"
          onClick={onEdit}
        >
          Edit details
        </button>
      }
    >
      {loading || error ? (
        <Loading
          error={error}
          retry={reload}
        />
      ) : (
        <div className="space-y-4">
          {/* Supplier header */}
          <div className="relative overflow-hidden rounded-2xl bg-[#172033] p-4 text-white">
            <div className="pointer-events-none absolute right-0 top-0 h-24 w-24 rounded-full bg-[#c59d5f]/10 blur-2xl" />

            <div className="relative flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#c59d5f] text-[#172033]">
                <Building2 size={19} />
              </div>

              <div>
                <div className="text-base font-extrabold">
                  {supplier.name}
                </div>

                <div className="text-xs text-white/60">
                  {supplier.contact_person ||
                    'Supplier account'}
                </div>
              </div>
            </div>
          </div>

          {/* Balance */}
          <div className="flex items-center justify-between rounded-2xl border border-[#c59d5f]/20 bg-[#fffaf1] p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#172033] text-[#c59d5f]">
                <Wallet size={18} />
              </div>

              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Balance we owe
                </div>

                <div className="mt-0.5 text-xl font-extrabold text-[#172033]">
                  {inr(led.balance)}
                </div>
              </div>
            </div>
          </div>

          {/* Payment */}
          {Number(led.balance) > 0 && (
            <div className="rounded-2xl border border-[#172033]/8 bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center gap-2">
                <CreditCard
                  size={16}
                  className="text-[#c59d5f]"
                />

                <h3 className="text-sm font-extrabold text-[#172033]">
                  Record payment
                </h3>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                <input
                  className="input bg-[#f8f6f2]"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Amount (₹)"
                  value={pay.amount}
                  onChange={(e) =>
                    setPay({
                      ...pay,
                      amount:
                        e.target.value,
                    })
                  }
                  aria-label="Amount"
                />

                <select
                  className="input bg-[#f8f6f2]"
                  value={pay.method}
                  onChange={(e) =>
                    setPay({
                      ...pay,
                      method:
                        e.target.value,
                    })
                  }
                  aria-label="Method"
                >
                  <option value="cash">
                    Cash
                  </option>
                  <option value="bank">
                    Bank transfer
                  </option>
                  <option value="upi">
                    UPI
                  </option>
                  <option value="cheque">
                    Cheque
                  </option>
                </select>

                <input
                  className="input bg-[#f8f6f2]"
                  placeholder="Note"
                  value={pay.note}
                  onChange={(e) =>
                    setPay({
                      ...pay,
                      note: e.target.value,
                    })
                  }
                  aria-label="Note"
                />

                <button
                  className="btn-primary"
                  onClick={submit}
                  disabled={!pay.amount}
                >
                  Record payment
                </button>

                <p className="text-xs text-slate-500 sm:col-span-2">
                  Payments clear the oldest unpaid
                  purchases first.
                </p>
              </div>
            </div>
          )}

          {/* Ledger */}
          <div>
            <div className="mb-2 flex items-center gap-2">
              <FileText
                size={16}
                className="text-[#c59d5f]"
              />

              <h3 className="text-sm font-extrabold text-[#172033]">
                Ledger
              </h3>
            </div>

            {led.rows.length === 0 ? (
              <div className="rounded-2xl bg-[#f8f6f2] p-5 text-center text-sm text-slate-500">
                No purchases or payments yet.
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-[#172033]/8 bg-white">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-[#172033] text-white">
                      <tr>
                        <th className="px-3 py-2.5 text-left text-xs font-bold">
                          Date
                        </th>

                        <th className="px-3 py-2.5 text-left text-xs font-bold">
                          Entry
                        </th>

                        <th className="px-3 py-2.5 text-right text-xs font-bold">
                          Owed
                        </th>

                        <th className="px-3 py-2.5 text-right text-xs font-bold">
                          Paid
                        </th>

                        <th className="px-3 py-2.5 text-right text-xs font-bold">
                          Balance
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                      {led.rows.map(
                        (r, i) => (
                          <tr
                            key={i}
                            className="transition hover:bg-[#fffaf1]"
                          >
                            <td className="px-3 py-2.5 text-slate-600">
                              {dOnly(r.date)}
                            </td>

                            <td className="px-3 py-2.5">
                              <div className="font-semibold text-[#172033]">
                                {r.type}
                              </div>

                              <span className="text-xs text-slate-500">
                                {r.ref}
                              </span>
                            </td>

                            <td className="px-3 py-2.5 text-right">
                              {Number(r.owed)
                                ? inr(r.owed)
                                : ''}
                            </td>

                            <td className="px-3 py-2.5 text-right">
                              {Number(r.paid)
                                ? inr(r.paid)
                                : ''}
                            </td>

                            <td className="px-3 py-2.5 text-right font-extrabold text-[#172033]">
                              {inr(r.balance)}
                            </td>
                          </tr>
                        ),
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </Modal>
  )
}