import React, { useState, useEffect, useCallback } from "react";
import { FiPlus, FiEdit2, FiTrash2 } from "react-icons/fi";
import toast from "react-hot-toast";
import { getUsers, createUser, updateUser, deleteUser } from "../api/user_api";
import { getRoles } from "../api/role_api";
import {
  StatusBadge,
  StatCard,
  ModalCard,
  FormField,
  TextInput,
  SelectInput,
  ActionButton,
  PageHeader,
  formatDate,
  Spinner,
} from "../components/SharedUI";
import { FilterBar } from "../components/ui/SharedComponents";

// ─── Add / Edit Modal ─────────────────────────────────────────────────────────
function UserModal({ mode, user, roles, onClose, onSaved }) {
  const isEdit = mode === "edit";
  const [form, setForm] = useState({
    username: user?.username || "",
    email: user?.email || "",
    phone: user?.phone || "",
    roleId: user?.roleId || "",
    status: user?.active !== false ? "active" : "inactive",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const set = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const validate = () => {
    const errs = {};
    if (!isEdit && !form.username.trim()) errs.username = "Required";
    if (!form.email.trim()) errs.email = "Required";
    if (!form.phone.trim()) errs.phone = "Required";
    if (!form.roleId) errs.roleId = "Required";
    if (!form.status) errs.status = "Required";
    return errs;
  };

  const handleSave = async () => {
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setLoading(true);
    try {
      const payload = {
        email: form.email,
        phone: form.phone,
        roleId: Number(form.roleId),
        status: form.status,
        ...(form.password && { password: form.password }),
        ...(!isEdit && { username: form.username }),
      };
      if (isEdit) {
        await updateUser(user.id, payload);
        toast.success("User updated successfully");
      } else {
        await createUser(payload);
        toast.success("User created successfully");
      }
      onSaved();
    } catch (err) {
      const msg =
        err?.response?.data?.message || err.message || "Failed to save user";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const fieldErr = (f) =>
    errors[f] ? (
      <span
        style={{
          color: "#ef4444",
          fontSize: 11,
          marginTop: 3,
          display: "block",
        }}
      >
        {errors[f]}
      </span>
    ) : null;

  return (
    <ModalCard title={isEdit ? "Edit User" : "Add  User"} onClose={onClose}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "0 20px",
        }}
      >
        {/* Username */}
        <FormField label="User Name" required>
          <TextInput
            value={form.username}
            onChange={set("username")}
            placeholder="e.g. zzfert"
            disabled={isEdit}
          />
          {fieldErr("username")}
        </FormField>

        {/* Email */}
        <FormField label="Email" required>
          <TextInput
            value={form.email}
            onChange={set("email")}
            placeholder="e.g. zahwan@ptap.co.id"
            type="email"
          />
          {fieldErr("email")}
        </FormField>

        {/* Phone */}
        <FormField label="Phone Number" required>
          <TextInput
            value={form.phone}
            onChange={set("phone")}
            placeholder="e.g. +62 812834748"
          />
          {fieldErr("phone")}
        </FormField>

        {/* Role */}
        <FormField label="Role" required>
          <div style={{ position: "relative" }}>
            <SelectInput value={form.roleId} onChange={set("roleId")}>
              <option value="">Select Role . . .</option>
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </SelectInput>
            <span
              style={{
                position: "absolute",
                right: 12,
                top: "50%",
                transform: "translateY(-50%)",
                pointerEvents: "none",
                color: "#6b7280",
              }}
            >
              ▾
            </span>
          </div>
          {fieldErr("roleId")}
        </FormField>

        {/* Status */}
        <FormField label="Status" required>
          <div style={{ position: "relative" }}>
            <SelectInput value={form.status} onChange={set("status")}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </SelectInput>
            <span
              style={{
                position: "absolute",
                right: 12,
                top: "50%",
                transform: "translateY(-50%)",
                pointerEvents: "none",
                color: "#6b7280",
              }}
            >
              ▾
            </span>
          </div>
          {fieldErr("status")}
        </FormField>

        {/* Password (full width) */}
        <div style={{ gridColumn: "1/-1" }}>
          <FormField
            label={isEdit ? "New Password (leave blank to keep)" : "Password"}
          >
            <TextInput
              value={form.password}
              onChange={set("password")}
              type="password"
              placeholder="••••••••"
            />
          </FormField>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: 12,
          marginTop: 8,
        }}
      >
        <ActionButton variant="secondary" onClick={onClose}>
          Cancel
        </ActionButton>
        <ActionButton onClick={handleSave} disabled={loading}>
          {loading ? "Saving…" : "Save"}
        </ActionButton>
      </div>
    </ModalCard>
  );
}

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────
function DeleteModal({ user, onClose, onDeleted }) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await deleteUser(user.id);
      toast.success("User deactivated");
      onDeleted();
    } catch {
      toast.error("Failed to delete user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalCard title="Confirm Delete" onClose={onClose} width={420}>
      <p style={{ color: "#374151", marginBottom: 20 }}>
        Are you sure you want to deactivate <strong>{user.name}</strong>? This
        action will set the user as inactive.
      </p>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
        <ActionButton variant="secondary" onClick={onClose}>
          Cancel
        </ActionButton>
        <ActionButton
          variant="danger"
          onClick={handleDelete}
          disabled={loading}
        >
          {loading ? "Deleting…" : "Delete"}
        </ActionButton>
      </div>
    </ModalCard>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function UserManagementPage() {
  const [data, setData] = useState(null);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [modal, setModal] = useState(null); // null | {type:'add'|'edit'|'delete', user?}
  const [selected, setSelected] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState("");

  const SIZE = 10;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [userRes, roleRes] = await Promise.all([
        getUsers(page, SIZE),
        getRoles(),
      ]);
      setData(userRes.data);
      setRoles(roleRes.data || []);
    } catch (err) {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    load();
  }, [load]);

  const toggleSelect = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (!data?.data) return;
    if (selected.size === data.data.length) setSelected(new Set());
    else setSelected(new Set(data.data.map((u) => u.id)));
  };

  const handleSaved = () => {
    setModal(null);
    load();
  };
  const closeModal = () => setModal(null);

  const summary = data?.summary;
  const allUsers = data?.data || [];
  const users = searchQuery.trim()
    ? allUsers.filter((u) =>
        (u.email || "")
          .toLowerCase()
          .includes(searchQuery.trim().toLowerCase()),
      )
    : allUsers;
  const totalPages = data?.totalPages || 1;

  return (
    <div
      style={{
        padding: "28px 32px",
        minHeight: "100vh",
        background: "#f3f4f6",
      }}
    >
      {/* ── Page Header ── */}
      <PageHeader
        icon="👤"
        title="User Management"
        subtitle="Manage admin and support users"
      >
        {summary && (
          <>
            <StatCard count={summary.total} label="Total" color="#f87171" />
            <StatCard count={summary.online} label="Online" color="#22c55e" />
            <StatCard
              count={summary.inactive}
              label="Inactive"
              color="#ef4444"
            />
            <StatCard count={summary.pending} label="Pending" color="#9ca3af" />
          </>
        )}
        <button
          onClick={() => setModal({ type: "add" })}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: "#fff",
            border: "1.5px solid #d1d5db",
            borderRadius: 8,
            padding: "8px 16px",
            fontWeight: 600,
            fontSize: 14,
            cursor: "pointer",
            color: "#374151",
          }}
        >
          <FiPlus size={15} /> Add
        </button>
      </PageHeader>

      {/* ── Filter Bar ── */}
      <FilterBar
        search={searchQuery}
        onSearch={setSearchQuery}
        placeholder="Search User..."
        onReset={() => setSearchQuery("")}
      />

      {/* ── User List Table ── */}
      <div
        style={{
          marginTop: "25px",
          background: "#fff",
          borderRadius: 14,
          boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
          overflow: "hidden",
        }}
      >
        {/* Table Header Row */}
        <div
          style={{
            padding: "18px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid #f3f4f6",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 18 }}>👤</span>
            <span style={{ fontWeight: 700, fontSize: 16, color: "#111827" }}>
              User List
            </span>
          </div>
          <button
            onClick={() => setModal({ type: "add" })}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "#fff",
              border: "1.5px solid #d1d5db",
              borderRadius: 8,
              padding: "7px 14px",
              fontWeight: 600,
              fontSize: 13,
              cursor: "pointer",
              color: "#374151",
            }}
          >
            <FiPlus size={14} /> Add
          </button>
        </div>

        {loading ? (
          <Spinner />
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#B91C1C" }}>
                  <th style={thStyle}>
                    <input
                      type="checkbox"
                      checked={
                        selected.size === users.length && users.length > 0
                      }
                      onChange={toggleAll}
                      style={{ cursor: "pointer" }}
                    />
                  </th>
                  {[
                    "User ID",
                    "User",
                    "Role",
                    "Last Login",
                    "Created At",
                    "Status",
                    "",
                  ].map((h) => (
                    <th key={h} style={thStyle}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((user, idx) => (
                  <tr
                    key={user.id}
                    style={{
                      background: idx % 2 === 0 ? "#fff" : "#fafafa",
                      borderBottom: "1px solid #f3f4f6",
                      transition: "background 0.1s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "#fef2f2")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background =
                        idx % 2 === 0 ? "#fff" : "#fafafa")
                    }
                  >
                    <td style={tdStyle}>
                      <input
                        type="checkbox"
                        checked={selected.has(user.id)}
                        onChange={() => toggleSelect(user.id)}
                      />
                    </td>
                    <td style={{ ...tdStyle, color: "#6b7280", fontSize: 13 }}>
                      {user.userId}
                    </td>
                    <td style={tdStyle}>
                      <div style={{ fontSize: 12, color: "#9ca3af" }}>
                        {user.email}
                      </div>
                    </td>
                    <td style={{ ...tdStyle, fontSize: 13 }}>
                      {user.role || "—"}
                    </td>
                    <td style={{ ...tdStyle, fontSize: 13 }}>
                      <span
                        style={{
                          color: getLoginColor(user.lastLogin, user.status),
                          fontWeight: 500,
                        }}
                      >
                        {formatDate(user.lastLogin)}
                      </span>
                    </td>
                    <td style={{ ...tdStyle, fontSize: 13, color: "#374151" }}>
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString("en-US", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })
                        : "—"}
                    </td>
                    <td style={tdStyle}>
                      <StatusBadge status={user.status} />
                    </td>
                    <td style={{ ...tdStyle, whiteSpace: "nowrap" }}>
                      <button
                        onClick={() => setModal({ type: "edit", user })}
                        style={iconBtnStyle}
                        title="Edit"
                      >
                        <FiEdit2 size={15} />
                      </button>
                      <button
                        onClick={() => setModal({ type: "delete", user })}
                        style={{ ...iconBtnStyle, color: "#ef4444" }}
                        title="Delete"
                      >
                        <FiTrash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      style={{
                        textAlign: "center",
                        padding: "40px",
                        color: "#9ca3af",
                      }}
                    >
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Pagination ── */}
        {!loading && (
          <div
            style={{
              padding: "14px 24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderTop: "1px solid #f3f4f6",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                fontSize: 13,
                color: "#6b7280",
              }}
            >
              <span>Rows per page</span>
              <div
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: 6,
                  padding: "4px 10px",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <span>{SIZE}</span>
                <span>▾</span>
              </div>
            </div>
            <div style={{ fontSize: 13, color: "#6b7280" }}>
              Showing {page * SIZE + 1}–
              {Math.min((page + 1) * SIZE, data?.totalElements || 0)} of{" "}
              {data?.totalElements || 0} entries
            </div>
            <div style={{ display: "flex", gap: 4 }}>
              {[
                { label: "«", action: () => setPage(0), disabled: page === 0 },
                {
                  label: "‹",
                  action: () => setPage((p) => Math.max(0, p - 1)),
                  disabled: page === 0,
                },
                { label: page + 1, active: true },
                {
                  label: "›",
                  action: () => setPage((p) => Math.min(totalPages - 1, p + 1)),
                  disabled: page >= totalPages - 1,
                },
                {
                  label: "»",
                  action: () => setPage(totalPages - 1),
                  disabled: page >= totalPages - 1,
                },
              ].map((btn, i) => (
                <button
                  key={i}
                  onClick={btn.action}
                  disabled={btn.disabled}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 6,
                    border: "1px solid #e5e7eb",
                    background: btn.active ? "#B91C1C" : "#fff",
                    color: btn.active
                      ? "#fff"
                      : btn.disabled
                        ? "#d1d5db"
                        : "#374151",
                    cursor: btn.disabled ? "not-allowed" : "pointer",
                    fontWeight: btn.active ? 700 : 400,
                    fontSize: 13,
                  }}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      {modal?.type === "add" && (
        <UserModal
          mode="add"
          roles={roles}
          onClose={closeModal}
          onSaved={handleSaved}
        />
      )}
      {modal?.type === "edit" && (
        <UserModal
          mode="edit"
          user={modal.user}
          roles={roles}
          onClose={closeModal}
          onSaved={handleSaved}
        />
      )}
      {modal?.type === "delete" && (
        <DeleteModal
          user={modal.user}
          onClose={closeModal}
          onDeleted={handleSaved}
        />
      )}
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const thStyle = {
  color: "#fff",
  fontWeight: 600,
  fontSize: 13,
  padding: "12px 16px",
  textAlign: "left",
  whiteSpace: "nowrap",
};
const tdStyle = {
  padding: "13px 16px",
  fontSize: 14,
  verticalAlign: "middle",
};
const iconBtnStyle = {
  background: "none",
  border: "none",
  cursor: "pointer",
  color: "#374151",
  padding: "4px 6px",
  borderRadius: 6,
  fontSize: 14,
  transition: "background 0.1s",
};

function getLoginColor(lastLogin, status) {
  if (!lastLogin) return "#9ca3af";
  if (status === "Online") return "#22c55e";
  if (status === "Inactive") return "#ef4444";
  return "#374151";
}
