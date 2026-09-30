import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { Loader2, X } from 'lucide-react'
import { api, errMsg } from './api'

/* ---------- layout mode: real phone, narrow window, or the /m preview frame ---------- */
const LayoutCtx = createContext(false)
export function LayoutProvider({ forced = false, children }) {
  const [narrow, setNarrow] = useState(() => window.innerWidth < 768)
  useEffect(() => {
    const f = () => setNarrow(window.innerWidth < 768)
    window.addEventListener('resize', f)
    return () => window.removeEventListener('resize', f)
  }, [])
  return <LayoutCtx.Provider value={forced || narrow}>{children}</LayoutCtx.Provider>
}
export const useMobile = () => useContext(LayoutCtx)

/* ---------- formatting ---------- */
const inrFmt = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2 })
export const inr = (n) => inrFmt.format(Number(n || 0))
export const num = (n) => {
  const v = Number(n || 0)
  return Number.isInteger(v) ? String(v) : v.toFixed(2).replace(/0+$/, '').replace(/\.$/, '')
}
export const dt = (s) => new Date(s).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
export const dOnly = (s) => new Date(s).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
export const isoToday = (offset = 0) => {
  const d = new Date()
  d.setDate(d.getDate() + offset)
  return d.toLocaleDateString('en-CA')
}
export const cap = (s = '') => s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, ' ')

/* ---------- data hooks ---------- */
export function useFetch(url, params = {}) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const key = url + JSON.stringify(params)
  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const r = await api.get(url, { params })
      setData(r.data)
    } catch (e) {
      setError(errMsg(e))
    } finally {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])
  useEffect(() => { load() }, [load])
  return { data, loading, error, reload: load, setData }
}

export function useDebounced(value, ms = 300) {
  const [v, setV] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms)
    return () => clearTimeout(t)
  }, [value, ms])
  return v
}

/* ---------- toast ---------- */
const ToastCtx = createContext(() => {})
export const useToast = () => useContext(ToastCtx)
export function ToastProvider({ children }) {
  const [t, setT] = useState(null)
  const show = useCallback((msg, type = 'ok') => {
    setT({ msg, type })
    setTimeout(() => setT(null), 3500)
  }, [])
  return (
    <ToastCtx.Provider value={show}>
      {children}
      {t && (
        <div role="status" className={`fixed left-1/2 top-4 z-[100] max-w-[90vw] -translate-x-1/2 rounded-md px-4 py-2.5 text-sm font-semibold text-white shadow-lg ${t.type === 'err' ? 'bg-madder-500' : 'bg-peacock-600'}`}>
          {t.msg}
        </div>
      )}
    </ToastCtx.Provider>
  )
}

/* ---------- primitives ---------- */
export function Spinner({ className = '' }) {
  return <Loader2 className={`animate-spin text-brand-500 ${className}`} size={20} />
}

export function Loading({ error, retry }) {
  if (error) {
    return (
      <div className="p-6 text-center text-sm text-madder-600">
        {error}
        {retry && <div className="mt-2"><button className="btn-ghost" onClick={retry}>Try again</button></div>}
      </div>
    )
  }
  return <div className="flex justify-center p-10"><Spinner /></div>
}

export function Empty({ children }) {
  return <div className="p-8 text-center text-sm text-slate-500">{children}</div>
}

export function Badge({ tone = 'slate', children }) {
  const tones = {
    slate: 'bg-slate-100 text-slate-700', green: 'bg-peacock-50 text-peacock-600',
    red: 'bg-madder-50 text-madder-600', amber: 'bg-amber-100 text-amber-800', blue: 'bg-brand-100 text-brand-700',
  }
  return <span className={`inline-block whitespace-nowrap rounded px-2 py-0.5 text-xs font-semibold ${tones[tone]}`}>{children}</span>
}

export function PageHeader({ title, children }) {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
      <h1 className="text-xl font-extrabold tracking-tight">{title}</h1>
      <div className="flex flex-wrap items-center gap-2">{children}</div>
    </div>
  )
}

export function Field({ label, children, hint }) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-slate-500">{hint}</span>}
    </label>
  )
}

export function Stat({ label, value, sub, tone }) {
  return (
    <div className="card p-3.5">
      <div className="text-xs font-semibold text-slate-500">{label}</div>
      <div className={`mt-1 text-xl font-extrabold ${tone === 'red' ? 'text-madder-500' : ''}`}>{value}</div>
      {sub && <div className="mt-0.5 text-xs text-slate-500">{sub}</div>}
    </div>
  )
}

export function Tabs({ tabs, value, onChange }) {
  return (
    <div className="mb-4 flex gap-1 overflow-x-auto rounded-lg bg-slate-200/70 p-1">
      {tabs.map(([k, l]) => (
        <button key={k} onClick={() => onChange(k)}
          className={`flex-1 whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-semibold ${value === k ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-600'}`}>
          {l}
        </button>
      ))}
    </div>
  )
}

export function Modal({ title, onClose, children, wide, footer }) {
  const mobile = useMobile()
  useEffect(() => {
    const f = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', f)
    return () => window.removeEventListener('keydown', f)
  }, [onClose])
  return (
    <div className={`fixed inset-0 z-50 flex justify-center bg-ink/50 ${mobile ? 'items-end' : 'items-center p-4'}`}
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div role="dialog" aria-label={title}
        className={`flex w-full flex-col bg-white shadow-xl ${mobile ? 'max-h-[92%] rounded-t-2xl' : `max-h-[90vh] rounded-xl ${wide ? 'max-w-3xl' : 'max-w-lg'}`}`}>
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <h2 className="text-base font-extrabold">{title}</h2>
          <button onClick={onClose} aria-label="Close" className="rounded p-1 text-slate-500 hover:bg-slate-100"><X size={18} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">{children}</div>
        {footer && <div className="safe-bottom flex flex-wrap justify-end gap-2 border-t border-slate-200 px-4 py-3">{footer}</div>}
      </div>
    </div>
  )
}

/* Table on wide screens, stacked cards on phones. */
export function DataList({ rows, columns, onRowClick, empty = 'Nothing here yet.' }) {
  const mobile = useMobile()
  if (!rows?.length) return <div className="card"><Empty>{empty}</Empty></div>
  const cell = (c, r) => (c.render ? c.render(r) : r[c.key])
  if (mobile) {
    const primary = columns.find((c) => c.primary) || columns[0]
    const trailing = columns.find((c) => c.trailing)
    const rest = columns.filter((c) => c !== primary && c !== trailing)
    return (
      <div className="space-y-2">
        {rows.map((r, i) => (
          <div key={r.id ?? i} onClick={() => onRowClick?.(r)} className={`card p-3 ${onRowClick ? 'cursor-pointer active:bg-slate-50' : ''}`}>
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 font-bold">{cell(primary, r)}</div>
              {trailing && <div className="shrink-0 font-bold">{cell(trailing, r)}</div>}
            </div>
            <div className="mt-1.5 grid grid-cols-2 gap-x-3 gap-y-1">
              {rest.map((c) => (
                <div key={c.label} className="min-w-0 text-xs">
                  <span className="text-slate-500">{c.label}: </span>
                  <span className="font-semibold">{cell(c, r)}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }
  return (
    <div className="card overflow-x-auto">
      <table className="w-full">
        <thead className="border-b border-slate-200 bg-slate-50">
          <tr>{columns.map((c) => <th key={c.label} className={`th ${c.right ? 'text-right' : ''}`}>{c.label}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((r, i) => (
            <tr key={r.id ?? i} onClick={() => onRowClick?.(r)} className={onRowClick ? 'cursor-pointer hover:bg-brand-50/50' : ''}>
              {columns.map((c) => <td key={c.label} className={`td ${c.right ? 'text-right' : ''}`}>{cell(c, r)}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function SearchInput({ value, onChange, placeholder = 'Search' }) {
  return <input className="input min-w-0 flex-1 sm:max-w-xs" type="search" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} aria-label={placeholder} />
}

export function downloadCsv(name, header, rows) {
  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`
  const csv = [header, ...rows].map((r) => r.map(esc).join(',')).join('\n')
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
  a.download = name
  a.click()
  URL.revokeObjectURL(a.href)
}

export const payTone = { cash: 'green', card: 'blue', upi: 'amber' }
export const statusTone = { completed: 'green', partially_returned: 'amber', returned: 'red' }
