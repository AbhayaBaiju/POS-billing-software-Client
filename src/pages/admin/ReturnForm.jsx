import { useState } from 'react'
import {
  AlertTriangle,
  RotateCcw,
  PackageCheck,
  Wallet,
} from 'lucide-react'
import { api, errMsg } from '../../api'
import { Field, inr, num, useToast } from '../../ui'

export default function ReturnForm({ sale, onDone }) {
  const toast = useToast()

  const [qty, setQty] = useState({})
  const [reason, setReason] = useState('')
  const [method, setMethod] = useState(
    sale.payment_method === 'cash'
      ? 'cash'
      : sale.payment_method,
  )
  const [restock, setRestock] = useState(true)
  const [busy, setBusy] = useState(false)

  const open = (i) =>
    Number(i.quantity) -
    Number(i.returned_quantity)

  const chosen = sale.items.filter(
    (i) => Number(qty[i.id]) > 0,
  )

  const refund = chosen.reduce(
    (s, i) =>
      s +
      (Number(i.line_total) /
        Number(i.quantity)) *
        Number(qty[i.id]),
    0,
  )

  const submit = async () => {
    setBusy(true)

    try {
      await api.post('/returns/', {
        sale: sale.id,
        reason,
        refund_method: method,
        restock,
        items: chosen.map((i) => ({
          sale_item: i.id,
          quantity: qty[i.id],
        })),
      })

      toast('Return recorded')
      onDone()
    } catch (e) {
      toast(errMsg(e), 'err')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="relative overflow-hidden rounded-2xl bg-[#f8f6f2]">
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

      <div className="relative space-y-4">
        {/* Bill information */}
        <div className="rounded-2xl bg-[#172033] p-4 text-white shadow-lg shadow-[#172033]/10">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#c59d5f] text-[#172033]">
              <RotateCcw size={18} />
            </div>

            <div className="min-w-0">
              <div className="text-xs font-bold uppercase tracking-[0.15em] text-[#c59d5f]">
                Return request
              </div>

              <div className="mt-1 text-base font-extrabold">
                Bill {sale.invoice_no}
              </div>

              <div className="mt-0.5 text-sm text-white/65">
                Customer:{' '}
                <span className="text-white/90">
                  {sale.customer_name || 'Walk-in'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Products */}
        <div>
          <div className="mb-2 flex items-center gap-2">
            <PackageCheck
              size={17}
              className="text-[#c59d5f]"
            />

            <h3 className="text-sm font-extrabold text-[#172033]">
              Items to return
            </h3>
          </div>

          <div className="overflow-hidden rounded-2xl border border-[#172033]/8 bg-white shadow-sm">
            {sale.items.map((i, index) => {
              const available = open(i)
              const selected =
                Number(qty[i.id]) > 0

              return (
                <div
                  key={i.id}
                  className={`flex items-center justify-between gap-3 p-3.5 transition ${
                    index !== sale.items.length - 1
                      ? 'border-b border-slate-100'
                      : ''
                  } ${
                    selected
                      ? 'bg-[#fffaf1]'
                      : 'bg-white'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-extrabold text-[#172033]">
                      {i.name}
                    </div>

                    <div className="mt-1 text-xs leading-relaxed text-slate-500">
                      Bought {num(i.quantity)}
                      {' · '}
                      Returned {num(i.returned_quantity)}
                    </div>

                    <div className="mt-0.5 text-xs font-semibold text-[#c59d5f]">
                      {inr(
                        Number(i.line_total) /
                          Number(i.quantity),
                      )}{' '}
                      each incl. GST
                    </div>

                    {available <= 0 && (
                      <div className="mt-1 text-[11px] font-bold text-red-500">
                        Fully returned
                      </div>
                    )}
                  </div>

                  <div className="shrink-0">
                    <input
                      className={`input !w-20 text-center ${
                        selected
                          ? 'border-[#c59d5f] bg-[#fffaf1]'
                          : ''
                      }`}
                      type="number"
                      min="0"
                      max={available}
                      step="0.01"
                      disabled={available <= 0}
                      value={qty[i.id] ?? ''}
                      placeholder="0"
                      aria-label={`Return quantity for ${i.name}`}
                      onChange={(e) =>
                        setQty({
                          ...qty,
                          [i.id]: e.target.value,
                        })
                      }
                    />

                    {available > 0 && (
                      <div className="mt-1 text-center text-[10px] font-semibold text-slate-400">
                        Max {num(available)}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Refund details */}
        <div className="rounded-2xl border border-[#172033]/8 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <Wallet
              size={17}
              className="text-[#c59d5f]"
            />

            <h3 className="text-sm font-extrabold text-[#172033]">
              Refund details
            </h3>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Refund via">
              <select
                className="input bg-[#f8f6f2]"
                value={method}
                onChange={(e) =>
                  setMethod(e.target.value)
                }
              >
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="upi">UPI</option>
                <option value="credit_note">
                  Credit note
                </option>
              </select>
            </Field>

            <Field label="Reason">
              <input
                className="input bg-[#f8f6f2]"
                value={reason}
                onChange={(e) =>
                  setReason(e.target.value)
                }
                placeholder="Size, defect…"
              />
            </Field>
          </div>
        </div>

        {/* Restock */}
        <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-[#c59d5f]/25 bg-[#fffaf1] p-4">
          <input
            type="checkbox"
            checked={restock}
            onChange={(e) =>
              setRestock(e.target.checked)
            }
            className="mt-0.5 h-4 w-4 shrink-0 accent-[#c59d5f]"
          />

          <div>
            <div className="text-sm font-extrabold text-[#172033]">
              Put items back in stock
            </div>

            <div className="mt-0.5 text-xs leading-relaxed text-slate-500">
              Untick this option for damaged or unusable
              goods.
            </div>
          </div>
        </label>

        {/* Warning when nothing selected */}
        {chosen.length === 0 && (
          <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700">
            <AlertTriangle
              size={15}
              className="mt-0.5 shrink-0"
            />

            <span>
              Select at least one item and enter a return
              quantity before confirming.
            </span>
          </div>
        )}

        {/* Bottom summary */}
        <div className="flex flex-col gap-3 rounded-2xl bg-[#172033] p-4 text-white shadow-xl shadow-[#172033]/15 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-white/55">
              Refund amount
            </div>

            <div className="mt-0.5 text-2xl font-extrabold text-[#c59d5f]">
              {inr(refund)}
            </div>
          </div>

          <button
            className="flex items-center justify-center gap-2 rounded-xl bg-[#c59d5f] px-5 py-3 text-sm font-extrabold text-[#172033] shadow-md transition hover:bg-[#d2ad73] disabled:cursor-not-allowed disabled:opacity-50"
            onClick={submit}
            disabled={
              busy || chosen.length === 0
            }
          >
            <RotateCcw size={16} />

            {busy
              ? 'Saving…'
              : 'Confirm return'}
          </button>
        </div>
      </div>
    </div>
  )
}