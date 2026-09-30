import { Printer } from 'lucide-react'
import { dt, inr, num } from './ui'

const SHOP = {
  name: import.meta.env.VITE_SHOP_NAME || 'Loomhouse Textiles',
  address: import.meta.env.VITE_SHOP_ADDRESS || 'MG Road, Kochi, Kerala',
  phone: import.meta.env.VITE_SHOP_PHONE || '0484 000 0000',
  gstin: import.meta.env.VITE_SHOP_GSTIN || '32ABCDE1234F1Z5',
}

// Plain CSS (not Tailwind) so the same markup prints correctly from a bare popup window.
export const RECEIPT_CSS = `
.rc{font-family:ui-monospace,Menlo,Consolas,monospace;font-size:12px;color:#000;width:300px;margin:0 auto;padding:12px;background:#fff}
.rc h3{margin:0;text-align:center;font-size:16px}
.rc .c{text-align:center}.rc .m{color:#444;font-size:11px}
.rc hr{border:0;border-top:1px dashed #000;margin:8px 0}
.rc table{width:100%;border-collapse:collapse}.rc td,.rc th{padding:2px 0;vertical-align:top}
.rc th{text-align:left;border-bottom:1px solid #000}.rc .r{text-align:right}
.rc .row{display:flex;justify-content:space-between}.rc .b{font-weight:700;font-size:14px}
@media print{body{margin:0}.rc{width:72mm;padding:2mm}}`

export function Receipt({ sale }) {
  const cgst = Number(sale.tax_amount) / 2
  return (
    <div id="receipt" className="rc">
      <style>{RECEIPT_CSS}</style>
      <h3>{SHOP.name}</h3>
      <div className="c m">{SHOP.address}<br />Ph {SHOP.phone} · GSTIN {SHOP.gstin}</div>
      <hr />
      <div className="row"><span>Bill</span><b>{sale.invoice_no}</b></div>
      <div className="row"><span>Date</span><span>{dt(sale.created_at)}</span></div>
      <div className="row"><span>Cashier</span><span>{sale.staff_name}</span></div>
      <div className="row"><span>Customer</span><span>{sale.customer_name || 'Walk-in'}</span></div>
      <hr />
      <table>
        <thead><tr><th>Item</th><th className="r">Qty</th><th className="r">Rate</th><th className="r">Amount</th></tr></thead>
        <tbody>
          {sale.items.map((i) => (
            <tr key={i.id}>
              <td>{i.name}</td><td className="r">{num(i.quantity)}</td>
              <td className="r">{num(i.unit_price)}</td><td className="r">{num(i.line_subtotal)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <hr />
      <div className="row"><span>Subtotal</span><span>{inr(sale.subtotal)}</span></div>
      {Number(sale.discount) > 0 && <div className="row"><span>Discount</span><span>-{inr(sale.discount)}</span></div>}
      <div className="row"><span>CGST</span><span>{inr(cgst)}</span></div>
      <div className="row"><span>SGST</span><span>{inr(cgst)}</span></div>
      <hr />
      <div className="row b"><span>TOTAL</span><span>{inr(sale.total)}</span></div>
      <div className="row"><span>Paid by {sale.payment_method.toUpperCase()}</span><span>{inr(sale.amount_received)}</span></div>
      {Number(sale.change_due) > 0 && <div className="row"><span>Change</span><span>{inr(sale.change_due)}</span></div>}
      <hr />
      <div className="c m">Thank you for shopping with us.<br />Exchange within 7 days with this bill.</div>
    </div>
  )
}

export function printReceipt(sale) {
  const node = document.getElementById('receipt')
  if (!node) return
  const w = window.open('', '_blank', 'width=380,height=640')
  if (!w) { window.print(); return }
  w.document.write(`<!doctype html><html><head><title>${sale.invoice_no}</title></head><body>${node.outerHTML}</body></html>`)
  w.document.close()
  w.focus()
  setTimeout(() => { w.print(); w.close() }, 250)
}

export function PrintButton({ sale }) {
  return <button className="btn-primary" onClick={() => printReceipt(sale)}><Printer size={16} /> Print bill</button>
}
