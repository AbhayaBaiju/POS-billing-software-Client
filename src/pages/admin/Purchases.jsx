import { useState } from 'react'
import {
  Plus,
  Trash2,
  ShoppingBag,
  Receipt,
  CalendarDays,
  IndianRupee,
  Package,
  X,
} from 'lucide-react'
import { api, errMsg } from '../../api'
import {
  Field,
  Loading,
  Modal,
  inr,
  num,
  dt,
  useFetch,
  useToast,
} from '../../ui'

export default function Purchases() {
  const { data: rows, loading, error, reload } = useFetch('/purchases/')
  const [open, setOpen] = useState(null)
  const [creating, setCreating] = useState(false)

  const purchases = rows || []

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
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-1 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[#c59d5f]">
              <ShoppingBag size={15} />
              Inventory
            </div>

            <h1 className="text-2xl font-extrabold tracking-tight md:text-3xl">
              Purchases
            </h1>

            <p className="mt-1 text-sm text-white/65">
              Record supplier purchases and update your stock.
            </p>
          </div>

          <button
            className="flex items-center justify-center gap-2 rounded-xl bg-[#c59d5f] px-4 py-2.5 text-sm font-extrabold text-[#172033] shadow-lg shadow-black/10 transition hover:bg-[#d3ad72]"
            onClick={() => setCreating(true)}
          >
            <Plus size={17} />
            Record purchase
          </button>
        </div>
      </div>

      {/* Summary */}
      {!loading && !error && (
        <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-[#172033]/8 bg-white p-4 shadow-sm">
            <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-[#172033] text-[#c59d5f]">
              <Receipt size={17} />
            </div>

            <div className="text-xs font-bold uppercase tracking-wide text-slate-400">
              Purchases
            </div>

            <div className="mt-1 text-xl font-extrabold text-[#172033]">
              {purchases.length}
            </div>
          </div>

          <div className="rounded-2xl border border-[#172033]/8 bg-white p-4 shadow-sm">
            <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-[#172033] text-[#c59d5f]">
              <Package size={17} />
            </div>

            <div className="text-xs font-bold uppercase tracking-wide text-slate-400">
              Stock receipts
            </div>

            <div className="mt-1 text-xl font-extrabold text-[#172033]">
              {purchases.reduce(
                (sum, p) => sum + (p.items?.length || 0),
                0,
              )}
            </div>
          </div>

          <div className="col-span-2 rounded-2xl border border-[#172033]/8 bg-white p-4 shadow-sm md:col-span-1">
            <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-[#172033] text-[#c59d5f]">
              <IndianRupee size={17} />
            </div>

            <div className="text-xs font-bold uppercase tracking-wide text-slate-400">
              Total purchases
            </div>

            <div className="mt-1 text-xl font-extrabold text-[#172033]">
              {inr(
                purchases.reduce(
                  (sum, p) => sum + Number(p.total || 0),
                  0,
                ),
              )}
            </div>
          </div>
        </div>
      )}

      {/* Loading / Error */}
      {loading || error ? (
        <Loading error={error} retry={reload} />
      ) : purchases.length === 0 ? (
        /* Empty state */
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#172033] text-[#c59d5f]">
            <ShoppingBag size={25} />
          </div>

          <h3 className="font-extrabold text-[#172033]">
            No purchases yet
          </h3>

          <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">
            Record the stock you receive from suppliers here.
          </p>

          <button
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#172033] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#24314b]"
            onClick={() => setCreating(true)}
          >
            <Plus size={16} />
            Record purchase
          </button>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-hidden rounded-2xl border border-[#172033]/8 bg-white shadow-sm md:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="border-b border-white/10 bg-[#172033] text-left text-xs font-bold uppercase tracking-wider text-white/75">
                    <th className="px-5 py-3.5">Supplier</th>
                    <th className="px-4 py-3.5">Invoice</th>
                    <th className="px-4 py-3.5">Date</th>
                    <th className="px-4 py-3.5 text-right">Total</th>
                    <th className="px-4 py-3.5 text-right">Paid</th>
                    <th className="px-5 py-3.5 text-right">Due</th>
                  </tr>
                </thead>

                <tbody>
                  {purchases.map((p) => (
                    <tr
                      key={p.id}
                      onClick={() => setOpen(p)}
                      className="cursor-pointer border-b border-slate-100 transition last:border-0 hover:bg-[#f8f6f2]"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#172033] text-[#c59d5f]">
                            <ShoppingBag size={17} />
                          </div>

                          <div>
                            <div className="font-extrabold text-[#172033]">
                              {p.supplier_name}
                            </div>

                            <div className="mt-0.5 text-xs text-slate-400">
                              Purchase #{p.id}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4 text-sm font-semibold text-slate-600">
                        {p.invoice_number || `PUR-${p.id}`}
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-600">
                          <CalendarDays size={14} className="text-[#c59d5f]" />
                          {dt(p.created_at)}
                        </div>
                      </td>

                      <td className="px-4 py-4 text-right text-sm font-extrabold text-[#172033]">
                        {inr(p.total)}
                      </td>

                      <td className="px-4 py-4 text-right text-sm font-semibold text-slate-600">
                        {inr(p.paid_amount)}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <span
                          className={`text-sm font-extrabold ${
                            Number(p.balance) > 0
                              ? 'text-red-600'
                              : 'text-emerald-600'
                          }`}
                        >
                          {inr(p.balance)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile cards */}
          <div className="space-y-3 md:hidden">
            {purchases.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setOpen(p)}
                className="w-full rounded-2xl border border-[#172033]/8 bg-white p-4 text-left shadow-sm transition active:scale-[0.99]"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#172033] text-[#c59d5f]">
                    <ShoppingBag size={18} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="truncate font-extrabold text-[#172033]">
                          {p.supplier_name}
                        </h3>

                        <p className="mt-0.5 text-xs font-medium text-slate-500">
                          {p.invoice_number || `PUR-${p.id}`}
                        </p>
                      </div>

                      <span
                        className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-extrabold ${
                          Number(p.balance) > 0
                            ? 'bg-red-50 text-red-600'
                            : 'bg-emerald-50 text-emerald-700'
                        }`}
                      >
                        {Number(p.balance) > 0 ? 'DUE' : 'PAID'}
                      </span>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-3">
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                          Date
                        </div>

                        <div className="mt-0.5 text-xs font-bold text-[#172033]">
                          {dt(p.created_at)}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                          Total
                        </div>

                        <div className="mt-0.5 text-sm font-extrabold text-[#172033]">
                          {inr(p.total)}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between rounded-xl bg-[#f8f6f2] px-3 py-2">
                      <span className="text-xs font-bold text-slate-500">
                        Paid {inr(p.paid_amount)}
                      </span>

                      <span
                        className={`text-xs font-extrabold ${
                          Number(p.balance) > 0
                            ? 'text-red-600'
                            : 'text-emerald-600'
                        }`}
                      >
                        Due {inr(p.balance)}
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </>
      )}

      {/* Purchase details */}
      {open && (
        <Modal
          title={`${open.supplier_name} · ${
            open.invoice_number || `PUR-${open.id}`
          }`}
          onClose={() => setOpen(null)}
        >
          <div className="rounded-2xl bg-[#f8f6f2] p-3">
            <div className="mb-3 flex items-center gap-3 rounded-xl bg-[#172033] p-4 text-white">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#c59d5f] text-[#172033]">
                <Receipt size={18} />
              </div>

              <div className="min-w-0">
                <div className="text-sm font-extrabold">
                  Purchase details
                </div>

                <div className="text-xs text-white/60">
                  {dt(open.created_at)}
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              <ul className="divide-y divide-slate-100 text-sm">
                {open.items?.map((i) => (
                  <li
                    key={i.id}
                    className="flex items-center justify-between gap-3 px-4 py-3"
                  >
                    <div className="min-w-0">
                      <div className="truncate font-bold text-[#172033]">
                        {i.product_name}
                      </div>

                      <div className="mt-0.5 text-xs text-slate-500">
                        {num(i.quantity)} × {inr(i.cost_price)}
                      </div>
                    </div>

                    <b className="shrink-0 text-[#172033]">
                      {inr(i.quantity * i.cost_price)}
                    </b>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-3 space-y-2 rounded-xl border border-[#c59d5f]/30 bg-[#fffaf1] p-4 text-sm">
              <div className="flex justify-between">
                <span className="font-semibold text-slate-500">
                  Total
                </span>

                <b className="text-[#172033]">
                  {inr(open.total)}
                </b>
              </div>

              <div className="flex justify-between">
                <span className="font-semibold text-slate-500">
                  Paid
                </span>

                <b className="text-emerald-600">
                  {inr(open.paid_amount)}
                </b>
              </div>

              <div className="flex justify-between border-t border-[#c59d5f]/20 pt-2">
                <span className="font-bold text-[#172033]">
                  Balance due
                </span>

                <b
                  className={
                    Number(open.balance) > 0
                      ? 'text-red-600'
                      : 'text-emerald-600'
                  }
                >
                  {inr(open.balance)}
                </b>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Create purchase */}
      {creating && (
        <PurchaseForm
          onClose={() => setCreating(false)}
          onSaved={() => {
            setCreating(false)
            reload()
          }}
        />
      )}
    </div>
  )
}

function PurchaseForm({
  onClose,
  onSaved,
}) {
  const toast = useToast()

  const { data: sups } = useFetch('/suppliers/')
  const { data: prods } = useFetch('/products/')

  const [f, setF] = useState({
    supplier: '',
    invoice_number: '',
    paid_amount: '',
  })

  const [items, setItems] = useState([
    {
      product: '',
      quantity: '',
      cost_price: '',
    },
  ])

  const total = items.reduce(
    (s, i) =>
      s +
      Number(i.quantity || 0) *
        Number(i.cost_price || 0),
    0,
  )

  const setItem = (idx, patch) => {
    setItems(
      items.map((it, i) =>
        i === idx
          ? { ...it, ...patch }
          : it,
      ),
    )
  }

  const pick = (idx, id) => {
    const p = prods?.find(
      (x) => String(x.id) === id,
    )

    setItem(idx, {
      product: id,
      cost_price: p ? p.cost_price : '',
    })
  }

  const save = async () => {
    try {
      await api.post('/purchases/', {
        ...f,
        paid_amount: f.paid_amount || 0,
        items: items
          .filter(
            (i) => i.product && i.quantity,
          )
          .map((i) => ({
            product: i.product,
            quantity: i.quantity,
            cost_price: i.cost_price || 0,
          })),
      })

      toast(
        'Purchase recorded and stock updated',
      )

      onSaved()
    } catch (e) {
      toast(errMsg(e), 'err')
    }
  }

  return (
    <Modal
      title="Record purchase"
      onClose={onClose}
      wide
      footer={
        <>
          <div className="mr-auto flex items-center gap-2 text-sm">
            <span className="text-slate-500">
              Total
            </span>

            <b className="text-[#172033]">
              {inr(total)}
            </b>
          </div>

          <button
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-[#172033] transition hover:bg-[#f8f6f2]"
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            className="rounded-xl bg-[#172033] px-4 py-2 text-sm font-extrabold text-white transition hover:bg-[#24314b] disabled:cursor-not-allowed disabled:opacity-50"
            onClick={save}
            disabled={!f.supplier || total <= 0}
          >
            Save & add stock
          </button>
        </>
      }
    >
      <div className="rounded-2xl bg-[#f8f6f2] p-3 md:p-4">
        {/* Form heading */}
        <div className="mb-4 flex items-center gap-3 rounded-xl bg-[#172033] p-4 text-white">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#c59d5f] text-[#172033]">
            <ShoppingBag size={19} />
          </div>

          <div>
            <div className="text-sm font-extrabold">
              New supplier purchase
            </div>

            <div className="text-xs text-white/60">
              Add received stock and payment details
            </div>
          </div>
        </div>

        {/* Supplier details */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="md:col-span-2">
            <Field label="Supplier">
              <select
                className="input bg-white"
                value={f.supplier}
                onChange={(e) =>
                  setF({
                    ...f,
                    supplier: e.target.value,
                  })
                }
              >
                <option value="">
                  Choose…
                </option>

                {sups
                  ?.filter((s) => s.is_active)
                  .map((s) => (
                    <option
                      key={s.id}
                      value={s.id}
                    >
                      {s.name}
                    </option>
                  ))}
              </select>
            </Field>
          </div>

          <Field label="Supplier invoice no.">
            <input
              className="input bg-white"
              value={f.invoice_number}
              onChange={(e) =>
                setF({
                  ...f,
                  invoice_number:
                    e.target.value,
                })
              }
            />
          </Field>

          <Field label="Paid now (₹)">
            <input
              className="input bg-white"
              type="number"
              min="0"
              step="0.01"
              value={f.paid_amount}
              onChange={(e) =>
                setF({
                  ...f,
                  paid_amount:
                    e.target.value,
                })
              }
            />
          </Field>
        </div>

        {/* Items */}
        <div className="mt-5">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-[#172033]">
                Items received
              </h3>

              <p className="mt-0.5 text-xs text-slate-500">
                Add products received from the supplier.
              </p>
            </div>

            <div className="rounded-full bg-[#172033] px-3 py-1 text-xs font-bold text-[#c59d5f]">
              {items.length} line
              {items.length !== 1 ? 's' : ''}
            </div>
          </div>

          <div className="space-y-3">
            {items.map((it, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-slate-200 bg-white p-3"
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase tracking-wide text-slate-400">
                    Item {idx + 1}
                  </span>

                  <button
                    type="button"
                    aria-label="Remove line"
                    className="rounded-lg p-1.5 text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-30"
                    onClick={() =>
                      setItems(
                        items.filter(
                          (_, i) =>
                            i !== idx,
                        ),
                      )
                    }
                    disabled={items.length === 1}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-2 md:grid-cols-[1fr_7rem_8rem]">
                  <select
                    className="input"
                    value={it.product}
                    onChange={(e) =>
                      pick(
                        idx,
                        e.target.value,
                      )
                    }
                    aria-label="Product"
                  >
                    <option value="">
                      Product…
                    </option>

                    {prods?.map((p) => (
                      <option
                        key={p.id}
                        value={p.id}
                      >
                        {p.name}
                      </option>
                    ))}
                  </select>

                  <input
                    className="input"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Qty"
                    value={it.quantity}
                    onChange={(e) =>
                      setItem(idx, {
                        quantity:
                          e.target.value,
                      })
                    }
                    aria-label="Quantity"
                  />

                  <input
                    className="input"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Cost"
                    value={it.cost_price}
                    onChange={(e) =>
                      setItem(idx, {
                        cost_price:
                          e.target.value,
                      })
                    }
                    aria-label="Cost price"
                  />
                </div>

                {it.quantity &&
                  it.cost_price && (
                    <div className="mt-2 flex justify-end text-xs font-bold text-slate-500">
                      Line total:{' '}
                      <span className="ml-1 text-[#172033]">
                        {inr(
                          Number(
                            it.quantity,
                          ) *
                            Number(
                              it.cost_price,
                            ),
                        )}
                      </span>
                    </div>
                  )}
              </div>
            ))}
          </div>

          <button
            className="mt-3 flex items-center gap-2 rounded-xl border border-[#172033]/15 bg-white px-4 py-2.5 text-sm font-bold text-[#172033] transition hover:border-[#c59d5f] hover:bg-[#fffaf1]"
            onClick={() =>
              setItems([
                ...items,
                {
                  product: '',
                  quantity: '',
                  cost_price: '',
                },
              ])
            }
          >
            <Plus size={16} />
            Add line
          </button>
        </div>

        {/* Total */}
        <div className="mt-5 rounded-2xl bg-[#172033] p-4 text-white">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-white/65">
              Purchase total
            </span>

            <span className="text-2xl font-extrabold text-[#c59d5f]">
              {inr(total)}
            </span>
          </div>
        </div>
      </div>
    </Modal>
  )
}