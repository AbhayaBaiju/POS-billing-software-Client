import { useMemo, useState } from 'react'
import {
  CheckCircle2,
  Minus,
  Plus,
  ShoppingCart,
  Trash2,
  UserPlus,
  X,
  Search,
  ReceiptText,
  CreditCard,
  UserRound,
  Banknote,
} from 'lucide-react'
import { api, errMsg } from '../../api'
import { useAuth } from '../../auth'
import { PrintButton, Receipt } from '../../receipt'
import {
  Empty,
  Field,
  Loading,
  Modal,
  SearchInput,
  inr,
  num,
  useDebounced,
  useFetch,
  useMobile,
  useToast,
} from '../../ui'

const STAFF_MAX_DISCOUNT = 10
const r2 = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100

function price(lines, discInput, discType) {
  const sub = r2(
    lines.reduce(
      (s, l) => s + r2(l.product.selling_price * l.qty),
      0
    )
  )

  let disc =
    discType === 'pct'
      ? r2((sub * Number(discInput || 0)) / 100)
      : r2(discInput || 0)

  disc = Math.min(disc, sub)

  const tax = r2(
    lines.reduce((s, l) => {
      const ls = r2(l.product.selling_price * l.qty)
      const share = sub ? (disc * ls) / sub : 0

      return (
        s +
        r2(((ls - share) * l.product.tax_percent) / 100)
      )
    }, 0)
  )

  return {
    sub,
    disc,
    tax,
    total: r2(sub - disc + tax),
  }
}

export default function Billing() {
  const mobile = useMobile()
  const toast = useToast()
  const { isAdmin } = useAuth()

  const [q, setQ] = useState('')
  const [cat, setCat] = useState('')
  const dq = useDebounced(q, 250)

  const {
    data: products,
    loading,
    error,
    reload,
  } = useFetch('/products/', {
    search: dq,
    category: cat || undefined,
  })

  const { data: cats } = useFetch('/categories/')

  const [cart, setCart] = useState([])
  const [sheet, setSheet] = useState(false)
  const [done, setDone] = useState(null)

  const add = (p) => {
    if (Number(p.stock) <= 0) {
      return toast(`${p.name} is out of stock`, 'err')
    }

    setCart((c) => {
      const ex = c.find((l) => l.product.id === p.id)

      if (ex) {
        return c.map((l) =>
          l.product.id === p.id
            ? {
                ...l,
                qty: Math.min(
                  Number(p.stock),
                  Number(l.qty) + 1
                ),
              }
            : l
        )
      }

      return [...c, { product: p, qty: 1 }]
    })
  }

  const setQty = (id, qty) =>
    setCart((c) =>
      c.map((l) =>
        l.product.id === id
          ? { ...l, qty }
          : l
      )
    )

  const remove = (id) =>
    setCart((c) =>
      c.filter((l) => l.product.id !== id)
    )

  const scan = (e) => {
    if (e.key !== 'Enter' || !q.trim() || !products) return

    const exact = products.find(
      (p) =>
        p.barcode === q.trim() ||
        p.sku.toLowerCase() === q.trim().toLowerCase()
    )

    const hit =
      exact ||
      (products.length === 1 ? products[0] : null)

    if (hit) {
      add(hit)
      setQ('')
    }
  }

  const count = cart.length
  const quick = price(cart, 0, 'amt')

  const cartPanel = (
    <Cart
      cart={cart}
      setQty={setQty}
      remove={remove}
      isAdmin={isAdmin}
      onDone={(sale) => {
        setDone(sale)
        setCart([])
        setSheet(false)
        reload()
      }}
    />
  )

  return (
    <div
      className={`h-full ${
        mobile
          ? 'flex flex-col bg-[#f8f6f2]'
          : 'grid grid-cols-[1fr_420px] bg-[#f8f6f2]'
      }`}
    >
      {/* PRODUCTS */}
      <section className="flex min-h-0 flex-col">
        {/* Header */}
        <div className="relative overflow-hidden bg-[#172033] px-4 py-4 text-white shadow-md">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.045]"
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

          <div className="relative flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#c59d5f] text-[#172033] shadow-lg">
              <ReceiptText size={21} />
            </div>

            <div>
              <h1 className="text-lg font-extrabold">
                Billing Counter
              </h1>
              <p className="text-xs text-white/60">
                Select products and create a new bill
              </p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="border-b border-[#172033]/10 bg-white p-4">
          <div className="mb-2 flex items-center gap-2">
            <Search size={15} className="text-[#c59d5f]" />
            <span className="text-sm font-extrabold text-[#172033]">
              Find product
            </span>
          </div>

          <div onKeyDown={scan}>
            <SearchInput
              value={q}
              onChange={setQ}
              placeholder="Scan barcode, SKU or search product"
            />
          </div>

          {/* Categories */}
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            <Chip
              active={cat === ''}
              onClick={() => setCat('')}
            >
              All
            </Chip>

            {cats?.map((c) => (
              <Chip
                key={c.id}
                active={String(cat) === String(c.id)}
                onClick={() => setCat(c.id)}
              >
                {c.name}
              </Chip>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          {loading || error ? (
            <Loading error={error} retry={reload} />
          ) : products.length === 0 ? (
            <div className="rounded-2xl border border-[#172033]/10 bg-white p-10 text-center shadow-sm">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f8f6f2] text-[#c59d5f]">
                <Search size={24} />
              </div>

              <div className="text-sm font-extrabold text-[#172033]">
                No products found
              </div>

              <p className="mt-1 text-xs text-slate-500">
                Try another product name, SKU or category.
              </p>
            </div>
          ) : (
            <div
              className={`grid gap-3 ${
                mobile
                  ? 'grid-cols-2'
                  : 'grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
              }`}
            >
              {products.map((p) => {
                const out = Number(p.stock) <= 0

                const inCart = cart.find(
                  (l) => l.product.id === p.id
                )

                return (
                  <button
                    key={p.id}
                    onClick={() => add(p)}
                    disabled={out}
                    className={`
                      group relative overflow-hidden rounded-2xl
                      border bg-white p-3 text-left
                      shadow-sm transition-all duration-200
                      ${
                        out
                          ? 'cursor-not-allowed opacity-50'
                          : 'hover:-translate-y-0.5 hover:border-[#c59d5f] hover:shadow-md active:scale-[0.98]'
                      }
                      ${
                        inCart
                          ? 'border-[#c59d5f] ring-1 ring-[#c59d5f]/30'
                          : 'border-[#172033]/8'
                      }
                    `}
                  >
                    {inCart && (
                      <div className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#c59d5f] text-[#172033]">
                        <CheckCircle2 size={14} />
                      </div>
                    )}

                    <div className="mb-3 flex h-16 items-center justify-center rounded-xl bg-[#f8f6f2] text-[#172033]">
                      <ShoppingCart
                        size={25}
                        className="text-[#c59d5f] transition-transform group-hover:scale-110"
                      />
                    </div>

                    <div className="line-clamp-2 min-h-[2.5rem] text-sm font-extrabold leading-tight text-[#172033]">
                      {p.name}
                    </div>

                    <div className="mt-1 truncate text-xs text-slate-500">
                      {[p.size, p.color]
                        .filter(Boolean)
                        .join(' · ') || p.sku}
                    </div>

                    <div className="mt-3 flex items-end justify-between gap-2">
                      <div className="font-extrabold text-[#172033]">
                        {inr(p.selling_price)}
                        <span className="ml-0.5 text-[10px] font-medium text-slate-400">
                          {p.unit === 'mtr' ? '/m' : ''}
                        </span>
                      </div>

                      <div
                        className={`text-[11px] font-bold ${
                          p.low_stock
                            ? 'text-red-500'
                            : 'text-slate-500'
                        }`}
                      >
                        {out
                          ? 'Out'
                          : `${num(p.stock)} left`}
                      </div>
                    </div>

                    {inCart && (
                      <div className="mt-2 rounded-lg bg-[#fffaf1] px-2 py-1 text-xs font-bold text-[#9a753c]">
                        In bill × {num(inCart.qty)}
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Mobile cart button */}
        {mobile && (
          <div className="safe-bottom border-t border-[#172033]/10 bg-white p-3 shadow-[0_-6px_20px_rgba(23,32,51,0.06)]">
            <button
              className="btn-primary w-full !py-3.5"
              disabled={!count}
              onClick={() => setSheet(true)}
            >
              <ShoppingCart size={18} />

              {count
                ? `${count} item${
                    count > 1 ? 's' : ''
                  } · ${inr(
                    quick.total
                  )} · Review & pay`
                : 'Tap products to start a bill'}
            </button>
          </div>
        )}
      </section>

      {/* DESKTOP CART */}
      {!mobile && (
        <aside className="min-h-0 border-l border-[#172033]/10 bg-white">
          {cartPanel}
        </aside>
      )}

      {/* MOBILE CART */}
      {mobile && sheet && (
        <Modal
          title="Current bill"
          onClose={() => setSheet(false)}
        >
          {cartPanel}
        </Modal>
      )}

      {/* SUCCESS */}
      {done && (
        <Modal
          title="Bill created"
          onClose={() => setDone(null)}
          footer={
            <>
              <button
                className="btn-ghost"
                onClick={() => setDone(null)}
              >
                New bill
              </button>

              <PrintButton sale={done} />
            </>
          }
        >
          <div className="mb-4 overflow-hidden rounded-2xl bg-[#172033] p-5 text-center text-white">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#c59d5f] text-[#172033]">
              <CheckCircle2 size={25} />
            </div>

            <div className="text-base font-extrabold">
              Payment received
            </div>

            <div className="mt-1 text-xs text-white/60">
              The bill has been created successfully.
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-[#172033]/10">
            <Receipt sale={done} />
          </div>
        </Modal>
      )}
    </div>
  )
}

function Chip({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`
        shrink-0 rounded-full border px-3.5 py-1.5
        text-xs font-bold transition
        ${
          active
            ? 'border-[#172033] bg-[#172033] text-white shadow-sm'
            : 'border-[#172033]/10 bg-[#f8f6f2] text-slate-600 hover:border-[#c59d5f] hover:text-[#172033]'
        }
      `}
    >
      {children}
    </button>
  )
}

function Cart({
  cart,
  setQty,
  remove,
  onDone,
  isAdmin,
}) {
  const toast = useToast()

  const [customer, setCustomer] = useState(null)
  const [pickCustomer, setPickCustomer] =
    useState(false)

  const [discInput, setDiscInput] = useState('')
  const [discType, setDiscType] = useState('amt')
  const [method, setMethod] = useState('cash')
  const [received, setReceived] = useState('')
  const [busy, setBusy] = useState(false)

  const p = useMemo(
    () => price(cart, discInput, discType),
    [cart, discInput, discType]
  )

  const discPct = p.sub
    ? (p.disc / p.sub) * 100
    : 0

  const overLimit =
    !isAdmin &&
    discPct > STAFF_MAX_DISCOUNT + 0.001

  const cashShort =
    method === 'cash' &&
    received !== '' &&
    Number(received) < p.total

  const change =
    method === 'cash' && received !== ''
      ? Math.max(
          0,
          r2(Number(received) - p.total)
        )
      : 0

  const checkout = async () => {
    setBusy(true)

    try {
      const { data } = await api.post('/sales/', {
        customer: customer?.id ?? null,
        items: cart.map((l) => ({
          product: l.product.id,
          quantity: l.qty,
        })),
        discount: p.disc,
        payment_method: method,
        ...(method === 'cash' &&
        received !== ''
          ? { amount_received: received }
          : {}),
      })

      onDone(data)
    } catch (e) {
      toast(errMsg(e), 'err')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex h-full flex-col bg-white">
      {/* Cart Header */}
      <div className="relative overflow-hidden border-b border-[#172033]/10 bg-[#172033] px-4 py-4 text-white">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: `
              repeating-linear-gradient(
                45deg,
                #c59d5f 0,
                #c59d5f 1px,
                transparent 1px,
                transparent 8px
              )
            `,
          }}
        />

        <div className="relative flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#c59d5f] text-[#172033]">
              <ShoppingCart size={18} />
            </div>

            <div>
              <h2 className="text-base font-extrabold">
                Current Bill
              </h2>

              <p className="text-[11px] text-white/55">
                {cart.length
                  ? `${cart.length} item${
                      cart.length > 1
                        ? 's'
                        : ''
                    } selected`
                  : 'No products selected'}
              </p>
            </div>
          </div>

          <button
            className="rounded-xl border border-white/15 bg-white/10 px-2.5 py-2 text-xs font-bold text-white transition hover:bg-white/15"
            onClick={() =>
              setPickCustomer(true)
            }
          >
            <UserPlus size={14} />

            <span className="ml-1">
              {customer
                ? customer.name
                : 'Walk-in'}
            </span>
          </button>
        </div>
      </div>

      {/* Cart Items */}
      <div className="min-h-0 flex-1 overflow-y-auto bg-[#faf9f7]">
        {cart.length === 0 ? (
          <div className="flex h-full min-h-[260px] items-center justify-center p-6">
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-[#c59d5f] shadow-sm">
                <ShoppingCart size={28} />
              </div>

              <div className="text-sm font-extrabold text-[#172033]">
                Your bill is empty
              </div>

              <p className="mt-1 text-xs text-slate-500">
                Select products from the billing counter.
              </p>
            </div>
          </div>
        ) : (
          <ul className="divide-y divide-[#172033]/8">
            {cart.map((l) => (
              <li
                key={l.product.id}
                className="bg-white px-4 py-3 transition hover:bg-[#fffdf9]"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-extrabold text-[#172033]">
                      {l.product.name}
                    </div>

                    <div className="mt-0.5 text-xs text-slate-500">
                      {inr(
                        l.product.selling_price
                      )}{' '}
                      · GST{' '}
                      {num(
                        l.product.tax_percent
                      )}
                      %
                    </div>
                  </div>

                  <button
                    aria-label={`Remove ${l.product.name}`}
                    onClick={() =>
                      remove(l.product.id)
                    }
                    className="rounded-lg p-1.5 text-red-500 transition hover:bg-red-50"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <button
                      aria-label="Decrease"
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#172033]/10 bg-[#f8f6f2] text-[#172033] transition hover:border-[#c59d5f] hover:bg-[#fffaf1]"
                      onClick={() =>
                        Number(l.qty) <= 1
                          ? remove(
                              l.product.id
                            )
                          : setQty(
                              l.product.id,
                              r2(
                                Number(l.qty) -
                                  1
                              )
                            )
                      }
                    >
                      {Number(l.qty) <= 1 ? (
                        <Trash2 size={14} />
                      ) : (
                        <Minus size={14} />
                      )}
                    </button>

                    <input
                      aria-label="Quantity"
                      className="input !w-16 !rounded-lg !border-[#172033]/10 !bg-white !px-1 !py-1.5 text-center font-bold"
                      type="number"
                      min="0"
                      step={
                        l.product.unit ===
                        'mtr'
                          ? '0.01'
                          : '1'
                      }
                      max={l.product.stock}
                      value={l.qty}
                      onChange={(e) =>
                        setQty(
                          l.product.id,
                          e.target.value === ''
                            ? ''
                            : Math.min(
                                Number(
                                  e.target.value
                                ),
                                Number(
                                  l.product
                                    .stock
                                )
                              )
                        )
                      }
                    />

                    <button
                      aria-label="Increase"
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#172033]/10 bg-[#f8f6f2] text-[#172033] transition hover:border-[#c59d5f] hover:bg-[#fffaf1] disabled:opacity-40"
                      disabled={
                        Number(l.qty) >=
                        Number(
                          l.product.stock
                        )
                      }
                      onClick={() =>
                        setQty(
                          l.product.id,
                          r2(
                            Number(l.qty) +
                              1
                          )
                        )
                      }
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  <div className="text-sm font-extrabold text-[#172033]">
                    {inr(
                      r2(
                        l.product
                          .selling_price *
                          (l.qty || 0)
                      )
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Checkout */}
      <div className="safe-bottom space-y-3 border-t border-[#172033]/10 bg-white p-4">
        {/* Discount */}
        <div className="rounded-xl border border-[#172033]/8 bg-[#f8f6f2] p-3">
          <div className="mb-2 flex items-center gap-2">
            <span className="text-xs font-extrabold text-[#172033]">
              Discount
            </span>

            <span className="text-[10px] text-slate-400">
              Optional
            </span>
          </div>

          <div className="flex items-center gap-2">
            <input
              className="input !w-24 !bg-white"
              type="number"
              min="0"
              step="0.01"
              placeholder="0"
              value={discInput}
              onChange={(e) =>
                setDiscInput(e.target.value)
              }
              aria-label="Discount"
            />

            <div className="flex overflow-hidden rounded-lg border border-[#172033]/10 bg-white text-xs font-bold">
              {[
                ['amt', '₹'],
                ['pct', '%'],
              ].map(([k, l]) => (
                <button
                  key={k}
                  onClick={() =>
                    setDiscType(k)
                  }
                  className={`px-3 py-2 ${
                    discType === k
                      ? 'bg-[#172033] text-white'
                      : 'text-slate-600 hover:bg-[#f8f6f2]'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          {overLimit && (
            <p className="mt-2 rounded-lg bg-red-50 px-2.5 py-2 text-xs font-semibold text-red-600">
              Staff can discount up to{' '}
              {STAFF_MAX_DISCOUNT}%. Ask an
              admin to approve more.
            </p>
          )}
        </div>

        {/* Summary */}
        <div className="rounded-xl bg-[#f8f6f2] p-3">
          <dl className="space-y-1.5 text-sm">
            <div className="flex justify-between text-slate-600">
              <dt>Subtotal</dt>
              <dd>{inr(p.sub)}</dd>
            </div>

            {p.disc > 0 && (
              <div className="flex justify-between text-[#9a753c]">
                <dt>Discount</dt>
                <dd>-{inr(p.disc)}</dd>
              </div>
            )}

            <div className="flex justify-between text-slate-600">
              <dt>GST</dt>
              <dd>{inr(p.tax)}</dd>
            </div>

            <div className="mt-2 flex justify-between border-t border-[#172033]/10 pt-2 text-lg font-extrabold text-[#172033]">
              <dt>Total</dt>
              <dd>{inr(p.total)}</dd>
            </div>
          </dl>
        </div>

        {/* Payment method */}
        <div>
          <div className="mb-2 flex items-center gap-2">
            <CreditCard
              size={15}
              className="text-[#c59d5f]"
            />
            <span className="text-xs font-extrabold text-[#172033]">
              Payment method
            </span>
          </div>

          <div
            className="grid grid-cols-3 gap-2"
            role="radiogroup"
            aria-label="Payment method"
          >
            {[
              ['cash', 'Cash'],
              ['card', 'Card'],
              ['upi', 'UPI'],
            ].map(([k, l]) => (
              <button
                key={k}
                role="radio"
                aria-checked={method === k}
                onClick={() => setMethod(k)}
                className={`
                  rounded-xl border py-2.5
                  text-xs font-extrabold transition
                  ${
                    method === k
                      ? 'border-[#c59d5f] bg-[#fffaf1] text-[#172033] shadow-sm'
                      : 'border-[#172033]/10 bg-white text-slate-600 hover:border-[#c59d5f]/50'
                  }
                `}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* Cash */}
        {method === 'cash' && (
          <div className="rounded-xl border border-[#172033]/8 bg-[#f8f6f2] p-3">
            <div className="mb-2 flex items-center gap-2">
              <Banknote
                size={15}
                className="text-[#c59d5f]"
              />
              <span className="text-xs font-extrabold text-[#172033]">
                Cash received
              </span>
            </div>

            <div className="flex items-center gap-2">
              <input
                className="input !bg-white"
                type="number"
                min="0"
                step="0.01"
                placeholder="Cash received"
                value={received}
                onChange={(e) =>
                  setReceived(e.target.value)
                }
                aria-label="Cash received"
              />

              <button
                className="btn-ghost shrink-0 !px-2.5 !py-2 !text-xs"
                onClick={() =>
                  setReceived(
                    String(p.total)
                  )
                }
              >
                Exact
              </button>

              {[500, 2000].map((n) => (
                <button
                  key={n}
                  className="btn-ghost hidden shrink-0 !px-2.5 !py-2 !text-xs sm:block"
                  onClick={() =>
                    setReceived(String(n))
                  }
                >
                  {n}
                </button>
              ))}
            </div>

            {received !== '' && (
              <div
                className={`mt-2 rounded-lg px-2.5 py-2 text-sm font-bold ${
                  cashShort
                    ? 'bg-red-50 text-red-600'
                    : 'bg-green-50 text-green-600'
                }`}
              >
                {cashShort
                  ? `Short by ${inr(
                      r2(
                        p.total -
                          received
                      )
                    )}`
                  : `Give back ${inr(
                      change
                    )}`}
              </div>
            )}
          </div>
        )}

        {/* Charge */}
        <button
          className="btn-accent w-full !rounded-xl !py-3.5 text-base shadow-md"
          disabled={
            busy ||
            cart.length === 0 ||
            cart.some(
              (l) => !Number(l.qty)
            ) ||
            cashShort ||
            overLimit
          }
          onClick={checkout}
        >
          {busy ? (
            'Creating bill…'
          ) : (
            <>
              <ShoppingCart size={18} />
              Charge {inr(p.total)}
            </>
          )}
        </button>
      </div>

      {pickCustomer && (
        <CustomerPicker
          onClose={() =>
            setPickCustomer(false)
          }
          onPick={(c) => {
            setCustomer(c)
            setPickCustomer(false)
          }}
        />
      )}
    </div>
  )
}

function CustomerPicker({ onClose, onPick }) {
  const toast = useToast()

  const [q, setQ] = useState('')
  const dq = useDebounced(q)

  const { data: rows } = useFetch(
    '/customers/',
    { search: dq }
  )

  const [adding, setAdding] = useState(false)
  const [nc, setNc] = useState({
    name: '',
    phone: '',
  })

  const create = async () => {
    try {
      const { data } = await api.post(
        '/customers/',
        nc
      )

      onPick(data)
    } catch (e) {
      toast(errMsg(e), 'err')
    }
  }

  return (
    <Modal
      title="Select customer"
      onClose={onClose}
    >
      {adding ? (
        <div className="space-y-4">
          <div className="rounded-2xl bg-[#172033] p-4 text-white">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#c59d5f] text-[#172033]">
                <UserRound size={18} />
              </div>

              <div>
                <div className="text-sm font-extrabold">
                  New customer
                </div>
                <div className="text-xs text-white/60">
                  Add customer details
                </div>
              </div>
            </div>
          </div>

          <Field label="Name">
            <input
              className="input"
              autoFocus
              value={nc.name}
              onChange={(e) =>
                setNc({
                  ...nc,
                  name: e.target.value,
                })
              }
            />
          </Field>

          <Field label="Phone">
            <input
              className="input"
              value={nc.phone}
              onChange={(e) =>
                setNc({
                  ...nc,
                  phone: e.target.value,
                })
              }
            />
          </Field>

          <div className="flex justify-end gap-2">
            <button
              className="btn-ghost"
              onClick={() =>
                setAdding(false)
              }
            >
              Back
            </button>

            <button
              className="btn-primary"
              onClick={create}
              disabled={!nc.name}
            >
              Save & use
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-4 flex gap-2">
            <SearchInput
              value={q}
              onChange={setQ}
              placeholder="Search name or phone"
            />

            <button
              className="btn-primary shrink-0"
              onClick={() =>
                setAdding(true)
              }
            >
              <Plus size={16} />
              New
            </button>
          </div>

          <button
            className="mb-2 flex w-full items-center gap-3 rounded-xl border border-[#c59d5f]/25 bg-[#fffaf1] p-3 text-left text-sm font-bold text-[#172033] transition hover:border-[#c59d5f]"
            onClick={() => onPick(null)}
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#172033] text-[#c59d5f]">
              <UserRound size={16} />
            </div>

            <div>
              <div>Walk-in customer</div>
              <div className="text-xs font-normal text-slate-500">
                No customer account attached
              </div>
            </div>
          </button>

          <div className="max-h-72 overflow-y-auto rounded-xl border border-[#172033]/8 bg-white">
            {rows?.slice(0, 20).map((c) => (
              <button
                key={c.id}
                className="flex w-full items-center gap-3 border-b border-[#172033]/6 p-3 text-left text-sm transition last:border-0 hover:bg-[#fffaf1]"
                onClick={() => onPick(c)}
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f8f6f2] text-[#c59d5f]">
                  <UserRound size={16} />
                </div>

                <div className="min-w-0">
                  <div className="truncate font-extrabold text-[#172033]">
                    {c.name}
                  </div>

                  <div className="text-xs text-slate-500">
                    {c.phone}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </Modal>
  )
}