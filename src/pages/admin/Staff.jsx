import { useState } from 'react'
import {
  Plus,
  UsersRound,
  ShieldCheck,
  UserRound,
} from 'lucide-react'
import { api, errMsg } from '../../api'
import { useAuth } from '../../auth'
import {
  Badge,
  DataList,
  Field,
  Loading,
  Modal,
  PageHeader,
  dOnly,
  useFetch,
  useToast,
} from '../../ui'

const blank = {
  username: '',
  first_name: '',
  last_name: '',
  phone: '',
  email: '',
  role: 'staff',
  password: '',
  is_active: true,
}

export default function Staff() {
  const toast = useToast()
  const { user } = useAuth()

  const {
    data: rows,
    loading,
    error,
    reload,
  } = useFetch('/staff/')

  const [f, setF] = useState(null)

  const save = async () => {
    try {
      const body = { ...f }

      if (!body.password) {
        delete body.password
      }

      if (f.id) {
        await api.patch(`/staff/${f.id}/`, body)
      } else {
        await api.post('/staff/', body)
      }

      toast('Staff account saved')
      setF(null)
      reload()
    } catch (e) {
      toast(errMsg(e), 'err')
    }
  }

  const disable = async () => {
    if (
      !window.confirm(
        `Disable ${f.username}? They will be signed out and can't log in.`,
      )
    ) {
      return
    }

    try {
      await api.delete(`/staff/${f.id}/`)
      toast('Account disabled')
      setF(null)
      reload()
    } catch (e) {
      toast(errMsg(e), 'err')
    }
  }

  const columns = [
    {
      label: 'Name',
      primary: true,
      render: (u) => {
        const fullName = [
          u.first_name,
          u.last_name,
        ]
          .filter(Boolean)
          .join(' ')

        return (
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#f8f6f2] text-[#c59d5f]">
              <UserRound size={17} />
            </div>

            <div>
              <div className="font-extrabold text-[#172033]">
                {fullName || u.username}
              </div>

              <div className="text-xs font-normal text-slate-500">
                @{u.username}
              </div>
            </div>
          </div>
        )
      },
    },

    {
      label: 'Role',
      render: (u) => (
        <Badge
          tone={
            u.role === 'admin'
              ? 'blue'
              : 'slate'
          }
        >
          {u.role === 'admin'
            ? 'Admin'
            : 'Billing staff'}
        </Badge>
      ),
    },

    {
      label: 'Phone',
      render: (u) => (
        <span className="text-sm text-slate-600">
          {u.phone || '—'}
        </span>
      ),
    },

    {
      label: 'Last login',
      render: (u) => (
        <span className="text-sm text-slate-600">
          {u.last_login
            ? dOnly(u.last_login)
            : 'Never'}
        </span>
      ),
    },

    {
      label: 'Status',
      trailing: true,
      render: (u) =>
        u.is_active ? (
          <Badge tone="green">
            Active
          </Badge>
        ) : (
          <Badge tone="red">
            Disabled
          </Badge>
        ),
    },
  ]

  return (
    <>
      <PageHeader title="Staff">
        <button
          className="btn-primary flex items-center gap-2"
          onClick={() => setF({ ...blank })}
        >
          <Plus size={16} />
          Add staff
        </button>
      </PageHeader>

      {/* Header banner */}
      <div className="relative mb-4 overflow-hidden rounded-2xl bg-[#172033] p-5 text-white shadow-lg shadow-[#172033]/10">
        <div className="pointer-events-none absolute right-0 top-0 h-32 w-32 rounded-full bg-[#c59d5f]/10 blur-2xl" />

        <div className="relative flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#c59d5f] text-[#172033]">
            <UsersRound size={20} />
          </div>

          <div>
            <h2 className="text-base font-extrabold">
              Team accounts
            </h2>

            <p className="mt-0.5 text-xs text-white/60">
              Manage billing staff, administrator access
              and sign-in permissions.
            </p>
          </div>
        </div>
      </div>

      {/* Staff list */}
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
            onRowClick={setF}
            empty="No staff accounts found."
          />
        </div>
      )}

      {/* Staff form */}
      {f && (
        <Modal
          title={
            f.id
              ? 'Edit staff'
              : 'Add staff'
          }
          onClose={() => setF(null)}
          wide
          footer={
            <>
              {f.id &&
                f.is_active &&
                f.id !== user.id && (
                  <button
                    className="btn-ghost mr-auto !text-red-600"
                    onClick={disable}
                  >
                    Disable
                  </button>
                )}

              <button
                className="btn-ghost"
                onClick={() => setF(null)}
              >
                Cancel
              </button>

              <button
                className="btn-primary"
                onClick={save}
                disabled={!f.username}
              >
                Save
              </button>
            </>
          }
        >
          <div className="relative overflow-hidden rounded-2xl bg-[#f8f6f2] p-4">
            {/* Decorative textile pattern */}
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
              {/* Form header */}
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#172033] text-[#c59d5f]">
                  {f.id ? (
                    <ShieldCheck size={18} />
                  ) : (
                    <UserRound size={18} />
                  )}
                </div>

                <div>
                  <div className="text-sm font-extrabold text-[#172033]">
                    {f.id
                      ? 'Account details'
                      : 'New team member'}
                  </div>

                  <div className="text-xs text-slate-500">
                    {f.id
                      ? 'Update staff access and account information.'
                      : 'Create a new account for your shop team.'}
                  </div>
                </div>
              </div>

              {/* Fields */}
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="First name">
                  <input
                    className="input bg-white"
                    value={f.first_name}
                    onChange={(e) =>
                      setF({
                        ...f,
                        first_name:
                          e.target.value,
                      })
                    }
                  />
                </Field>

                <Field label="Last name">
                  <input
                    className="input bg-white"
                    value={f.last_name}
                    onChange={(e) =>
                      setF({
                        ...f,
                        last_name:
                          e.target.value,
                      })
                    }
                  />
                </Field>

                <Field label="Username">
                  <input
                    className="input bg-white"
                    autoCapitalize="none"
                    value={f.username}
                    onChange={(e) =>
                      setF({
                        ...f,
                        username:
                          e.target.value,
                      })
                    }
                  />
                </Field>

                <Field label="Phone">
                  <input
                    className="input bg-white"
                    value={f.phone}
                    onChange={(e) =>
                      setF({
                        ...f,
                        phone:
                          e.target.value,
                      })
                    }
                  />
                </Field>

                <Field label="Role">
                  <select
                    className="input bg-white"
                    value={f.role}
                    onChange={(e) =>
                      setF({
                        ...f,
                        role: e.target.value,
                      })
                    }
                    disabled={
                      f.id === user.id
                    }
                  >
                    <option value="staff">
                      Billing staff
                    </option>

                    <option value="admin">
                      Admin
                    </option>
                  </select>
                </Field>

                <Field
                  label={
                    f.id
                      ? 'New password'
                      : 'Password'
                  }
                  hint={
                    f.id
                      ? 'Leave blank to keep the current one'
                      : 'At least 6 characters'
                  }
                >
                  <input
                    className="input bg-white"
                    type="password"
                    autoComplete="new-password"
                    value={f.password}
                    onChange={(e) =>
                      setF({
                        ...f,
                        password:
                          e.target.value,
                      })
                    }
                  />
                </Field>

                <label className="flex items-center gap-3 rounded-xl border border-[#c59d5f]/20 bg-[#fffaf1] p-3 text-sm font-semibold sm:col-span-2">
                  <input
                    type="checkbox"
                    checked={f.is_active}
                    disabled={
                      f.id === user.id
                    }
                    onChange={(e) =>
                      setF({
                        ...f,
                        is_active:
                          e.target.checked,
                      })
                    }
                    className="h-4 w-4 accent-[#c59d5f]"
                  />

                  <div>
                    <div className="font-extrabold text-[#172033]">
                      Can sign in
                    </div>

                    <div className="text-xs font-normal text-slate-500">
                      Allow this staff member to
                      access the billing system.
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </>
  )
}