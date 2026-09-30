import { useState } from 'react'
import {
  Plus,
  Search,
  Users,
  Phone,
  Mail,
  MapPin,
  UserRound,
  Trash2,
  X,
} from 'lucide-react'

import { api, errMsg } from '../../api'

import {
  Field,
  Loading,
  Modal,
  SearchInput,
  inr,
  useDebounced,
  useFetch,
  useToast,
} from '../../ui'


const blank = {
  name: '',
  phone: '',
  email: '',
  address: '',
}


export default function Customers() {

  const toast = useToast()

  const [q, setQ] = useState('')

  const dq = useDebounced(q)

  const {
    data: rows,
    loading,
    error,
    reload,
  } = useFetch(
    '/customers/',
    {
      search: dq,
    }
  )

  const [f, setF] =
    useState(null)


  /* =====================================================
     SAVE
  ====================================================== */

  const save = async () => {

    try {

      if (f.id) {

        await api.put(
          `/customers/${f.id}/`,
          f
        )

      } else {

        await api.post(
          '/customers/',
          f
        )

      }

      toast('Customer saved')

      setF(null)

      reload()

    } catch (e) {

      toast(
        errMsg(e),
        'err'
      )

    }
  }


  /* =====================================================
     DELETE
  ====================================================== */

  const remove = async () => {

    if (
      !window.confirm(
        `Delete ${f.name}? Their past bills stay as walk-in sales.`
      )
    ) {
      return
    }

    try {

      await api.delete(
        `/customers/${f.id}/`
      )

      toast('Customer deleted')

      setF(null)

      reload()

    } catch (e) {

      toast(
        errMsg(e),
        'err'
      )

    }
  }


  return (

    <div className="relative min-h-full overflow-hidden bg-[#f8f6f2]">

      {/* =================================================
          TEXTILE BACKGROUND
      ================================================== */}

      <div className="pointer-events-none absolute inset-0 opacity-[0.035]">

        <div
          className="h-full w-full"
          style={{
            backgroundImage: `
              linear-gradient(45deg, #172033 25%, transparent 25%),
              linear-gradient(-45deg, #172033 25%, transparent 25%),
              linear-gradient(45deg, transparent 75%, #172033 75%),
              linear-gradient(-45deg, transparent 75%, #172033 75%)
            `,
            backgroundSize:
              '40px 40px',
            backgroundPosition:
              '0 0, 0 20px, 20px -20px, -20px 0px',
          }}
        />

      </div>


      {/* =================================================
          CONTENT
      ================================================== */}

      <div className="relative z-10">

        {/* =================================================
            HEADER
        ================================================== */}

        <div className="mb-5 overflow-hidden rounded-2xl bg-[#172033] shadow-xl shadow-[#172033]/10">

          <div className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between md:px-6">

            <div className="flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#c59d5f] text-white shadow-lg">

                <Users
                  size={21}
                />

              </div>


              <div>

                <h1 className="text-lg font-black tracking-tight text-white md:text-xl">
                  Customers
                </h1>

                <p className="mt-0.5 text-xs text-white/50">
                  Manage your customer records
                </p>

              </div>

            </div>


            <button
              className="flex items-center justify-center gap-2 rounded-xl bg-[#c59d5f] px-4 py-2.5 text-xs font-black text-white shadow-lg shadow-[#c59d5f]/20 transition hover:bg-[#b2874f]"
              onClick={() =>
                setF({
                  ...blank,
                })
              }
            >

              <Plus
                size={16}
              />

              Add customer

            </button>

          </div>


          {/* GOLD LINE */}

          <div className="h-1 bg-[#c59d5f]" />

        </div>


        {/* =================================================
            SEARCH + COUNT
        ================================================== */}

        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

          <div className="relative w-full sm:max-w-md">

            <Search
              size={17}
              className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-slate-400"
            />

            <SearchInput
              value={q}
              onChange={setQ}
              placeholder="Search name or phone"
              className="!h-11 !rounded-xl !border-slate-200 !bg-white !pl-10 !shadow-[0_5px_20px_rgba(23,32,51,0.04)] focus:!border-[#c59d5f]"
            />

          </div>


          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm">

            <Users
              size={15}
              className="text-[#b2874f]"
            />

            <span className="text-xs font-bold text-slate-500">
              {rows?.length || 0}
            </span>

            <span className="text-xs text-slate-400">
              customer
              {rows?.length === 1
                ? ''
                : 's'}
            </span>

          </div>

        </div>


        {/* =================================================
            CUSTOMER LIST
        ================================================== */}

        {loading || error ? (

          <Loading
            error={error}
            retry={reload}
          />

        ) : !rows ||
          rows.length === 0 ? (

          <EmptyCustomers
            onAdd={() =>
              setF({
                ...blank,
              })
            }
          />

        ) : (

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_30px_rgba(23,32,51,0.05)]">

            {/* DESKTOP HEADER */}

            <div className="hidden border-b border-slate-100 bg-[#f8f6f2] px-5 py-3 md:grid md:grid-cols-[2fr_1.2fr_0.7fr_1fr] md:gap-4">

              <div className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                Customer
              </div>

              <div className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                Phone
              </div>

              <div className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                Visits
              </div>

              <div className="text-right text-[9px] font-black uppercase tracking-widest text-slate-400">
                Total spent
              </div>

            </div>


            {/* ROWS */}

            <div className="divide-y divide-slate-100">

              {rows.map(
                (c) => (

                  <button
                    key={c.id}
                    onClick={() =>
                      setF(c)
                    }
                    className="group w-full text-left transition hover:bg-[#f8f6f2]"
                  >

                    {/* DESKTOP */}

                    <div className="hidden items-center gap-4 px-5 py-4 md:grid md:grid-cols-[2fr_1.2fr_0.7fr_1fr]">

                      {/* CUSTOMER */}

                      <div className="flex min-w-0 items-center gap-3">

                        <CustomerAvatar
                          name={
                            c.name
                          }
                        />

                        <div className="min-w-0">

                          <div className="truncate text-sm font-extrabold text-[#172033]">
                            {c.name}
                          </div>

                          {c.email && (

                            <div className="mt-0.5 truncate text-[10px] text-slate-400">
                              {c.email}
                            </div>

                          )}

                        </div>

                      </div>


                      {/* PHONE */}

                      <div className="flex items-center gap-2 text-xs text-slate-500">

                        <Phone
                          size={13}
                          className="text-[#b2874f]"
                        />

                        {c.phone ||
                          '—'}

                      </div>


                      {/* VISITS */}

                      <div>

                        <span className="inline-flex rounded-full bg-[#f8f6f2] px-2.5 py-1 text-[10px] font-bold text-[#172033]">

                          {c.visits ||
                            0}{' '}
                          visits

                        </span>

                      </div>


                      {/* TOTAL */}

                      <div className="text-right">

                        <div className="text-sm font-black text-[#172033]">
                          {inr(
                            c.total_spent
                          )}
                        </div>

                      </div>

                    </div>


                    {/* MOBILE */}

                    <div className="flex items-center gap-3 px-4 py-4 md:hidden">

                      <CustomerAvatar
                        name={
                          c.name
                        }
                      />

                      <div className="min-w-0 flex-1">

                        <div className="truncate text-sm font-extrabold text-[#172033]">
                          {c.name}
                        </div>

                        <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-slate-400">

                          {c.phone && (

                            <span className="flex items-center gap-1">

                              <Phone
                                size={11}
                              />

                              {c.phone}

                            </span>

                          )}

                          <span>
                            {c.visits ||
                              0}{' '}
                            visits
                          </span>

                        </div>

                      </div>


                      <div className="text-right">

                        <div className="text-xs font-black text-[#172033]">
                          {inr(
                            c.total_spent
                          )}
                        </div>

                        <div className="mt-1 text-[9px] text-slate-400">
                          spent
                        </div>

                      </div>

                    </div>

                  </button>

                )
              )}

            </div>

          </div>

        )}


        {/* =================================================
            EDIT / ADD MODAL
        ================================================== */}

        {f && (

          <Modal
            title={
              f.id
                ? 'Edit customer'
                : 'Add customer'
            }
            onClose={() =>
              setF(null)
            }
            footer={

              <>

                {f.id && (

                  <button
                    className="mr-auto flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold text-red-500 transition hover:bg-red-50"
                    onClick={remove}
                  >

                    <Trash2
                      size={14}
                    />

                    Delete

                  </button>

                )}


                <button
                  className="btn-ghost"
                  onClick={() =>
                    setF(null)
                  }
                >
                  Cancel
                </button>


                <button
                  className="btn-primary"
                  onClick={save}
                  disabled={
                    !f.name
                  }
                >
                  Save
                </button>

              </>

            }
          >

            {/* CUSTOMER ICON */}

            <div className="mb-5 flex items-center gap-3 rounded-2xl bg-[#f8f6f2] p-4">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#172033] text-white">

                <UserRound
                  size={20}
                />

              </div>

              <div>

                <div className="text-sm font-black text-[#172033]">
                  {f.id
                    ? 'Customer details'
                    : 'New customer'}
                </div>

                <div className="mt-0.5 text-[10px] text-slate-400">
                  {f.id
                    ? 'Update customer information'
                    : 'Enter customer information below'}
                </div>

              </div>

            </div>


            <div className="space-y-4">

              {/* NAME */}

              <Field label="Name">

                <div className="relative">

                  <UserRound
                    size={16}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    className="input !pl-10"
                    autoFocus
                    value={
                      f.name
                    }
                    placeholder="Customer name"
                    onChange={(
                      e
                    ) =>
                      setF({
                        ...f,
                        name: e
                          .target
                          .value,
                      })
                    }
                  />

                </div>

              </Field>


              {/* PHONE */}

              <Field label="Phone">

                <div className="relative">

                  <Phone
                    size={16}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    className="input !pl-10"
                    value={
                      f.phone
                    }
                    placeholder="Phone number"
                    onChange={(
                      e
                    ) =>
                      setF({
                        ...f,
                        phone: e
                          .target
                          .value,
                      })
                    }
                  />

                </div>

              </Field>


              {/* EMAIL */}

              <Field label="Email">

                <div className="relative">

                  <Mail
                    size={16}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    className="input !pl-10"
                    type="email"
                    value={
                      f.email
                    }
                    placeholder="Email address"
                    onChange={(
                      e
                    ) =>
                      setF({
                        ...f,
                        email: e
                          .target
                          .value,
                      })
                    }
                  />

                </div>

              </Field>


              {/* ADDRESS */}

              <Field label="Address">

                <div className="relative">

                  <MapPin
                    size={16}
                    className="pointer-events-none absolute left-3 top-3.5 text-slate-400"
                  />

                  <textarea
                    className="input !min-h-[80px] !pl-10"
                    rows={3}
                    value={
                      f.address
                    }
                    placeholder="Customer address"
                    onChange={(
                      e
                    ) =>
                      setF({
                        ...f,
                        address:
                          e
                            .target
                            .value,
                      })
                    }
                  />

                </div>

              </Field>

            </div>

          </Modal>

        )}

      </div>

    </div>
  )
}


/* =========================================================
   CUSTOMER AVATAR
========================================================= */

function CustomerAvatar({
  name,
}) {

  return (

    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#172033] text-sm font-black text-white shadow-sm">

      {name
        ?.charAt(0)
        ?.toUpperCase() || 'C'}

    </div>

  )
}


/* =========================================================
   EMPTY CUSTOMERS
========================================================= */

function EmptyCustomers({
  onAdd,
}) {

  return (

    <div className="rounded-2xl border border-slate-200 bg-white px-6 py-14 text-center shadow-[0_8px_30px_rgba(23,32,51,0.05)]">

      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#f8f6f2] text-[#172033]">

        <Users
          size={28}
        />

      </div>


      <h2 className="mt-4 text-sm font-black text-[#172033]">
        No customers yet
      </h2>


      <p className="mx-auto mt-1 max-w-xs text-xs leading-5 text-slate-400">
        Add your first customer to
        keep track of visits and
        spending.
      </p>


      <button
        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#172033] px-4 py-2.5 text-xs font-black text-white shadow-lg shadow-[#172033]/10 transition hover:bg-[#222e45]"
        onClick={onAdd}
      >

        <Plus
          size={15}
        />

        Add customer

      </button>

    </div>

  )
}