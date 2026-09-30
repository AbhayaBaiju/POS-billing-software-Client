import { useState } from 'react'
import {
  Plus,
  Tags,
  Trash2,
  Package,
  Search,
  SlidersHorizontal,
  X,
  Boxes,
} from 'lucide-react'
import { api, errMsg } from '../../api'
import {
  Badge,
  Field,
  Loading,
  Modal,
  PageHeader,
  inr,
  num,
  useDebounced,
  useFetch,
  useToast,
} from '../../ui'

const blank = {
  name: '',
  sku: '',
  barcode: '',
  category: '',
  supplier: '',
  size: '',
  color: '',
  unit: 'pcs',
  cost_price: '',
  selling_price: '',
  tax_percent: '5',
  opening_stock: '',
  low_stock_threshold: '5',
  is_active: true,
}

export default function Products() {
  const toast = useToast()

  const [q, setQ] = useState('')
  const [cat, setCat] = useState('')
  const [low, setLow] = useState(false)

  const dq = useDebounced(q)

  const {
    data: rows,
    loading,
    error,
    reload,
  } = useFetch('/products/', {
    search: dq,
    category: cat || undefined,
    low_stock: low ? 1 : undefined,
  })

  const {
    data: cats,
    reload: reloadCats,
  } = useFetch('/categories/')

  const { data: sups } = useFetch('/suppliers/')

  const [edit, setEdit] = useState(null)
  const [showCats, setShowCats] = useState(false)

  const products = rows || []

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
              <Package size={15} />
              Inventory
            </div>

            <h1 className="text-2xl font-extrabold tracking-tight md:text-3xl">
              Products & Stock
            </h1>

            <p className="mt-1 text-sm text-white/65">
              Manage products, pricing, stock and categories.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              className="flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-white/15"
              onClick={() => setShowCats(true)}
            >
              <Tags size={16} />
              Categories
            </button>

            <button
              className="flex items-center justify-center gap-2 rounded-xl bg-[#c59d5f] px-4 py-2.5 text-sm font-extrabold text-[#172033] shadow-lg shadow-black/10 transition hover:bg-[#d3ad72]"
              onClick={() => setEdit({ ...blank })}
            >
              <Plus size={17} />
              Add product
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-5 rounded-2xl border border-[#172033]/8 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-2 text-sm font-extrabold text-[#172033]">
          <SlidersHorizontal size={16} className="text-[#c59d5f]" />
          Product filters
        </div>

        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          {/* Search */}
          <div className="relative flex-1">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              className="w-full rounded-xl border border-slate-200 bg-[#f8f6f2] py-2.5 pl-10 pr-4 text-sm font-medium outline-none transition placeholder:text-slate-400 focus:border-[#c59d5f] focus:bg-white focus:ring-2 focus:ring-[#c59d5f]/15"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search name, SKU, barcode"
            />
          </div>

          {/* Category */}
          <select
            className="rounded-xl border border-slate-200 bg-[#f8f6f2] px-3 py-2.5 text-sm font-semibold text-[#172033] outline-none transition focus:border-[#c59d5f] focus:bg-white focus:ring-2 focus:ring-[#c59d5f]/15 md:w-52"
            value={cat}
            onChange={(e) => setCat(e.target.value)}
            aria-label="Category"
          >
            <option value="">All categories</option>

            {cats?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Low stock */}
          <label className="flex min-h-[42px] cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-[#f8f6f2] px-3 text-sm font-bold text-[#172033]">
            <input
              type="checkbox"
              checked={low}
              onChange={(e) => setLow(e.target.checked)}
              className="h-4 w-4 accent-[#c59d5f]"
            />
            Low stock only
          </label>
        </div>
      </div>

      {/* Product count */}
      {!loading && !error && (
        <div className="mb-3 flex items-center justify-between px-1">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-600">
            <Boxes size={16} className="text-[#c59d5f]" />
            {products.length} product{products.length !== 1 ? 's' : ''}
          </div>

          {(q || cat || low) && (
            <button
              className="flex items-center gap-1 text-xs font-bold text-[#172033] hover:text-[#c59d5f]"
              onClick={() => {
                setQ('')
                setCat('')
                setLow(false)
              }}
            >
              <X size={14} />
              Clear filters
            </button>
          )}
        </div>
      )}

      {/* Products */}
      {loading || error ? (
        <Loading error={error} retry={reload} />
      ) : products.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#172033] text-[#c59d5f]">
            <Package size={25} />
          </div>

          <h3 className="font-extrabold text-[#172033]">
            No products found
          </h3>

          <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">
            No products match your current filters. Add your first product to
            start billing.
          </p>

          <button
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#172033] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#24314b]"
            onClick={() => setEdit({ ...blank })}
          >
            <Plus size={16} />
            Add product
          </button>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-hidden rounded-2xl border border-[#172033]/8 bg-white shadow-sm md:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px]">
                <thead>
                  <tr className="border-b border-white/10 bg-[#172033] text-left text-xs font-bold uppercase tracking-wider text-white/75">
                    <th className="px-5 py-3.5">Product</th>
                    <th className="px-4 py-3.5">Category</th>
                    <th className="px-4 py-3.5">Stock</th>
                    <th className="px-4 py-3.5 text-right">Cost</th>
                    <th className="px-4 py-3.5 text-right">Price</th>
                    <th className="px-5 py-3.5">Status</th>
                  </tr>
                </thead>

                <tbody>
                  {products.map((p) => (
                    <tr
                      key={p.id}
                      onClick={() =>
                        setEdit({
                          ...p,
                          category: p.category ?? '',
                          supplier: p.supplier ?? '',
                        })
                      }
                      className="cursor-pointer border-b border-slate-100 transition last:border-0 hover:bg-[#f8f6f2]"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#172033] text-[#c59d5f]">
                            <Package size={18} />
                          </div>

                          <div className="min-w-0">
                            <div className="truncate font-extrabold text-[#172033]">
                              {p.name}
                            </div>

                            <div className="mt-0.5 text-xs font-medium text-slate-500">
                              {p.sku}
                              {p.size && ` · ${p.size}`}
                              {p.color && ` · ${p.color}`}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4 text-sm font-semibold text-slate-600">
                        {p.category_name || '—'}
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2 text-sm font-bold text-[#172033]">
                          {num(p.stock)} {p.unit}

                          {p.low_stock && (
                            <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-red-600">
                              Low
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-4 text-right text-sm font-semibold text-slate-600">
                        {inr(p.cost_price)}
                      </td>

                      <td className="px-4 py-4 text-right text-sm font-extrabold text-[#172033]">
                        {inr(p.selling_price)}
                      </td>

                      <td className="px-5 py-4">
                        {p.is_active ? (
                          <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-extrabold text-emerald-700">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-extrabold text-slate-500">
                            Hidden
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile cards */}
          <div className="space-y-3 md:hidden">
            {products.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() =>
                  setEdit({
                    ...p,
                    category: p.category ?? '',
                    supplier: p.supplier ?? '',
                  })
                }
                className="w-full rounded-2xl border border-[#172033]/8 bg-white p-4 text-left shadow-sm transition active:scale-[0.99]"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#172033] text-[#c59d5f]">
                    <Package size={19} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="truncate font-extrabold text-[#172033]">
                          {p.name}
                        </h3>

                        <p className="mt-0.5 text-xs font-medium text-slate-500">
                          {p.sku}
                          {p.size && ` · ${p.size}`}
                          {p.color && ` · ${p.color}`}
                        </p>
                      </div>

                      {p.is_active ? (
                        <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-extrabold text-emerald-700">
                          Active
                        </span>
                      ) : (
                        <span className="shrink-0 rounded-full bg-slate-100 px-2 py-1 text-[10px] font-extrabold text-slate-500">
                          Hidden
                        </span>
                      )}
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-3">
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                          Stock
                        </div>

                        <div className="mt-0.5 text-sm font-extrabold text-[#172033]">
                          {num(p.stock)} {p.unit}

                          {p.low_stock && (
                            <span className="ml-1.5 rounded-full bg-red-50 px-1.5 py-0.5 text-[9px] font-extrabold text-red-600">
                              LOW
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                          Selling price
                        </div>

                        <div className="mt-0.5 text-sm font-extrabold text-[#172033]">
                          {inr(p.selling_price)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </>
      )}

      {/* Product modal */}
      {edit && (
        <ProductForm
          product={edit}
          cats={cats || []}
          sups={sups || []}
          onClose={() => setEdit(null)}
          onSaved={(msg) => {
            setEdit(null)
            reload()
            toast(msg)
          }}
        />
      )}

      {/* Categories modal */}
      {showCats && (
        <Categories
          cats={cats || []}
          onClose={() => {
            setShowCats(false)
            reload()
          }}
          onChange={reloadCats}
        />
      )}
    </div>
  )
}

function ProductForm({
  product,
  cats,
  sups,
  onClose,
  onSaved,
}) {
  const isNew = !product.id
  const toast = useToast()

  const [f, setF] = useState(product)
  const [busy, setBusy] = useState(false)
  const [adj, setAdj] = useState({
    change: '',
    note: '',
  })

  const set = (k) => (e) =>
    setF({
      ...f,
      [k]:
        e.target.type === 'checkbox'
          ? e.target.checked
          : e.target.value,
    })

  const save = async () => {
    setBusy(true)

    try {
      const body = {
        ...f,
        category: f.category || null,
        supplier: f.supplier || null,
      }

      if (!isNew) delete body.opening_stock

      if (isNew && !body.opening_stock) {
        delete body.opening_stock
      }

      if (isNew) {
        await api.post('/products/', body)
      } else {
        await api.put(`/products/${f.id}/`, body)
      }

      onSaved(isNew ? 'Product added' : 'Product saved')
    } catch (e) {
      toast(errMsg(e), 'err')
    } finally {
      setBusy(false)
    }
  }

  const remove = async () => {
    if (
      !window.confirm(
        `Remove ${f.name}? Products with sales history are hidden instead of deleted.`,
      )
    ) {
      return
    }

    try {
      const r = await api.delete(`/products/${f.id}/`)
      onSaved(r.data?.detail || 'Product deleted')
    } catch (e) {
      toast(errMsg(e), 'err')
    }
  }

  const adjust = async () => {
    try {
      await api.post(`/products/${f.id}/adjust-stock/`, adj)
      onSaved('Stock updated')
    } catch (e) {
      toast(errMsg(e), 'err')
    }
  }

  return (
    <Modal
      title={isNew ? 'Add product' : 'Edit product'}
      onClose={onClose}
      wide
      footer={
        <>
          {!isNew && (
            <button
              className="mr-auto flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold text-red-600 transition hover:bg-red-50"
              onClick={remove}
            >
              <Trash2 size={16} />
              Delete
            </button>
          )}

          <button
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-[#172033] transition hover:bg-[#f8f6f2]"
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            className="rounded-xl bg-[#172033] px-4 py-2 text-sm font-extrabold text-white transition hover:bg-[#24314b] disabled:cursor-not-allowed disabled:opacity-50"
            onClick={save}
            disabled={busy}
          >
            {busy ? 'Saving…' : 'Save product'}
          </button>
        </>
      }
    >
      <div className="rounded-2xl bg-[#f8f6f2] p-3 md:p-4">
        <div className="mb-4 flex items-center gap-3 rounded-xl bg-[#172033] p-4 text-white">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#c59d5f] text-[#172033]">
            <Package size={19} />
          </div>

          <div>
            <div className="text-sm font-extrabold">
              {isNew ? 'New product' : 'Product details'}
            </div>

            <div className="text-xs text-white/60">
              Product information and pricing
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="md:col-span-2">
            <Field label="Product name">
              <input
                className="input"
                value={f.name}
                onChange={set('name')}
                autoFocus
              />
            </Field>
          </div>

          <Field label="SKU">
            <input
              className="input"
              value={f.sku}
              onChange={set('sku')}
            />
          </Field>

          <Field label="Barcode">
            <input
              className="input"
              value={f.barcode}
              onChange={set('barcode')}
            />
          </Field>

          <Field label="Category">
            <select
              className="input"
              value={f.category}
              onChange={set('category')}
            >
              <option value="">None</option>

              {cats.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Supplier">
            <select
              className="input"
              value={f.supplier}
              onChange={set('supplier')}
            >
              <option value="">None</option>

              {sups.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Size">
            <input
              className="input"
              value={f.size}
              onChange={set('size')}
              placeholder="M, 42, 2.5 m…"
            />
          </Field>

          <Field label="Colour">
            <input
              className="input"
              value={f.color}
              onChange={set('color')}
            />
          </Field>

          <Field label="Sold by">
            <select
              className="input"
              value={f.unit}
              onChange={set('unit')}
            >
              <option value="pcs">Piece</option>
              <option value="mtr">Metre</option>
            </select>
          </Field>

          <Field label="GST %">
            <input
              className="input"
              type="number"
              min="0"
              step="0.01"
              value={f.tax_percent}
              onChange={set('tax_percent')}
            />
          </Field>

          <Field label="Cost price (₹)">
            <input
              className="input"
              type="number"
              min="0"
              step="0.01"
              value={f.cost_price}
              onChange={set('cost_price')}
            />
          </Field>

          <Field label="Selling price, before GST (₹)">
            <input
              className="input"
              type="number"
              min="0"
              step="0.01"
              value={f.selling_price}
              onChange={set('selling_price')}
            />
          </Field>

          {isNew && (
            <Field label="Opening stock">
              <input
                className="input"
                type="number"
                min="0"
                step="0.01"
                value={f.opening_stock}
                onChange={set('opening_stock')}
              />
            </Field>
          )}

          <Field label="Reorder level">
            <input
              className="input"
              type="number"
              min="0"
              step="0.01"
              value={f.low_stock_threshold}
              onChange={set('low_stock_threshold')}
            />
          </Field>

          <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-bold text-[#172033] md:col-span-2">
            <input
              type="checkbox"
              checked={f.is_active}
              onChange={set('is_active')}
              className="h-4 w-4 accent-[#c59d5f]"
            />

            Available for billing
          </label>
        </div>
      </div>

      {/* Stock adjustment */}
      {!isNew && (
        <div className="mt-4 rounded-2xl border border-[#c59d5f]/30 bg-[#fffaf1] p-4">
          <div className="mb-1 flex items-center justify-between">
            <div className="text-sm font-extrabold text-[#172033]">
              Stock adjustment
            </div>

            <div className="rounded-full bg-[#172033] px-2.5 py-1 text-xs font-bold text-[#c59d5f]">
              {num(product.stock)} {product.unit}
            </div>
          </div>

          <p className="mb-3 text-xs leading-relaxed text-slate-500">
            Use a negative number for damaged or lost goods. New stock from
            suppliers is added through Purchases.
          </p>

          <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
            <input
              className="input bg-white"
              type="number"
              step="0.01"
              placeholder="+/- qty"
              value={adj.change}
              onChange={(e) =>
                setAdj({
                  ...adj,
                  change: e.target.value,
                })
              }
              aria-label="Quantity change"
            />

            <input
              className="input bg-white"
              placeholder="Reason"
              value={adj.note}
              onChange={(e) =>
                setAdj({
                  ...adj,
                  note: e.target.value,
                })
              }
              aria-label="Reason"
            />

            <button
              className="rounded-xl bg-[#172033] px-4 py-2 text-sm font-extrabold text-white transition hover:bg-[#24314b] disabled:cursor-not-allowed disabled:opacity-50"
              onClick={adjust}
              disabled={!adj.change}
            >
              Adjust stock
            </button>
          </div>
        </div>
      )}
    </Modal>
  )
}

function Categories({
  cats,
  onClose,
  onChange,
}) {
  const toast = useToast()
  const [name, setName] = useState('')

  const add = async () => {
    try {
      await api.post('/categories/', { name })
      setName('')
      onChange()
    } catch (e) {
      toast(errMsg(e), 'err')
    }
  }

  const del = async (c) => {
    if (
      !window.confirm(
        `Delete "${c.name}"? Its products stay, uncategorised.`,
      )
    ) {
      return
    }

    try {
      await api.delete(`/categories/${c.id}/`)
      onChange()
    } catch (e) {
      toast(errMsg(e), 'err')
    }
  }

  return (
    <Modal title="Categories" onClose={onClose}>
      <div className="rounded-2xl bg-[#f8f6f2] p-4">
        <div className="mb-4 flex items-center gap-3 rounded-xl bg-[#172033] p-3 text-white">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#c59d5f] text-[#172033]">
            <Tags size={17} />
          </div>

          <div>
            <div className="text-sm font-extrabold">
              Product categories
            </div>

            <div className="text-xs text-white/60">
              Organise your inventory
            </div>
          </div>
        </div>

        <div className="mb-4 flex gap-2">
          <input
            className="input bg-white"
            placeholder="New category"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) =>
              e.key === 'Enter' && name && add()
            }
          />

          <button
            className="rounded-xl bg-[#172033] px-4 py-2 text-sm font-extrabold text-white transition hover:bg-[#24314b] disabled:cursor-not-allowed disabled:opacity-50"
            onClick={add}
            disabled={!name}
          >
            Add
          </button>
        </div>

        <ul className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          {cats.length === 0 ? (
            <li className="px-4 py-8 text-center text-sm text-slate-500">
              No categories yet.
            </li>
          ) : (
            cats.map((c) => (
              <li
                key={c.id}
                className="flex items-center justify-between border-b border-slate-100 px-4 py-3 text-sm last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#172033] text-[#c59d5f]">
                    <Tags size={14} />
                  </div>

                  <span className="font-bold text-[#172033]">
                    {c.name}
                  </span>

                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-500">
                    {c.product_count}
                  </span>
                </div>

                <button
                  onClick={() => del(c)}
                  aria-label={`Delete ${c.name}`}
                  className="rounded-lg p-2 text-red-500 transition hover:bg-red-50"
                >
                  <Trash2 size={16} />
                </button>
              </li>
            ))
          )}
        </ul>
      </div>
    </Modal>
  )
}