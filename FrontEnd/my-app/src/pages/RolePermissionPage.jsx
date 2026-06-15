import React, { useState, useEffect, useCallback } from "react";
import { FiPlus, FiEdit2, FiTrash2 } from "react-icons/fi";
import toast from "react-hot-toast";
import { getRoles, createRole, updateRole, deleteRole } from "../api/role_api";
import {
  ModalCard, FormField, TextInput, ActionButton,
  PageHeader, Spinner, StatCard,
} from "../components/SharedUI";

const MODULES = ["Dashboard", "Products", "Customer Products", "Ticket", "SLA Config", "Setting"];

// ─── Permission Checkbox Row ──────────────────────────────────────────────────
function PermRow({ module, perms, onChange, readOnly }) {
  const check = (key) => (
    <label style={{ display: "flex", alignItems: "center", gap: 5, cursor: readOnly ? "default" : "pointer", userSelect: "none" }}>
      <input
        type="checkbox"
        checked={!!perms[key]}
        onChange={() => !readOnly && onChange(module, key, !perms[key])}
        disabled={readOnly}
        style={{ accentColor: "#B91C1C", width: 15, height: 15 }}
      />
      <span style={{ fontSize: 13, color: "#374151" }}>
        {key.charAt(0).toUpperCase() + key.slice(1)}
      </span>
    </label>
  );

  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>{module}</div>
      <div style={{ display: "flex", gap: 18 }}>
        {check("view")}
        {check("edit")}
        {check("delete")}
      </div>
    </div>
  );
}

// ─── Default permissions builder ──────────────────────────────────────────────
function defaultPerms() {
  const p = {};
  MODULES.forEach((m) => { p[m] = { view: true, edit: false, delete: false }; });
  return p;
}

function roleToPerms(role) {
  const p = defaultPerms();
  if (!role?.permissions) return p;
  role.permissions.forEach(({ module, canView, canEdit, canDelete }) => {
    p[module] = { view: canView, edit: canEdit, delete: canDelete };
  });
  return p;
}

function permsToPayload(perms) {
  const out = {};
  MODULES.forEach((m) => {
    out[m] = { view: !!perms[m]?.view, edit: !!perms[m]?.edit, delete: !!perms[m]?.delete };
  });
  return out;
}

// ─── Role Modal (Add / Edit) ──────────────────────────────────────────────────
function RoleModal({ mode, role, onClose, onSaved }) {
  const isEdit = mode === "edit";
  const [roleName, setRoleName] = useState(role?.name || "");
  const [perms, setPerms] = useState(isEdit ? roleToPerms(role) : defaultPerms());
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const handlePerm = (module, key, val) => {
    setPerms((prev) => ({ ...prev, [module]: { ...prev[module], [key]: val } }));
  };

  const handleSave = async () => {
    if (!roleName.trim()) { setErr("Role name is required"); return; }
    setLoading(true);
    try {
      const payload = {
        ...(isEdit ? { roleName } : { roleName }),
        permissions: permsToPayload(perms),
      };
      if (isEdit) {
        await updateRole(role.id, payload);
        toast.success("Role updated");
      } else {
        await createRole(payload);
        toast.success("Role created");
      }
      onSaved();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to save role");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalCard title={isEdit ? "Edit Role" : "Add  Role"} onClose={onClose} width={480}>
      <FormField label="Role Name" required>
        <TextInput
          value={roleName}
          onChange={(e) => { setRoleName(e.target.value); setErr(""); }}
          placeholder="e.g. L1 support"
        />
        {err && <span style={{ color: "#ef4444", fontSize: 11 }}>{err}</span>}
      </FormField>

      <div style={{
        border: "1.5px solid #e5e7eb", borderRadius: 10, padding: "16px 20px", marginTop: 8,
      }}>
        {MODULES.map((m) => (
          <PermRow key={m} module={m} perms={perms[m] || {}} onChange={handlePerm} />
        ))}
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 20 }}>
        <ActionButton variant="secondary" onClick={onClose}>Cancel</ActionButton>
        <ActionButton onClick={handleSave} disabled={loading}>
          {loading ? "Saving…" : "Save"}
        </ActionButton>
      </div>
    </ModalCard>
  );
}

// ─── Role Card ────────────────────────────────────────────────────────────────
function RoleCard({ role, onEdit, onDelete }) {
  return (
    <div style={{
      background: "#fff", borderRadius: 12,
      boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
      overflow: "hidden", border: "1px solid #f3f4f6",
    }}>
      {/* Card header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "16px 20px", borderBottom: "1px solid #f3f4f6",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: "50%",
            background: "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16,
          }}>👤</div>
          <span style={{ fontWeight: 700, fontSize: 16, color: "#111827" }}>{role.name}</span>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={() => onEdit(role)} style={iconBtn("#374151")}>
            <FiEdit2 size={15} />
          </button>
          <button onClick={() => onDelete(role)} style={iconBtn("#ef4444")}>
            <FiTrash2 size={15} />
          </button>
        </div>
      </div>

      {/* Permission grid */}
      <div style={{ padding: "16px 20px" }}>
        {MODULES.map((module) => {
          const perm = role.permissions?.find((p) => p.module === module) || {};
          return (
            <div key={module} style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>{module}</div>
              <div style={{ display: "flex", gap: 16 }}>
                {[
                  { label: "View", val: perm.canView },
                  { label: "Edit", val: perm.canEdit },
                  { label: "Delete", val: perm.canDelete },
                ].map(({ label, val }) => (
                  <label key={label} style={{ display: "flex", alignItems: "center", gap: 5, cursor: "default" }}>
                    <input type="checkbox" checked={!!val} readOnly
                      style={{ accentColor: "#B91C1C", width: 14, height: 14 }} />
                    <span style={{ fontSize: 12, color: "#6b7280" }}>{label}</span>
                  </label>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Delete Confirm ───────────────────────────────────────────────────────────
function DeleteRoleModal({ role, onClose, onDeleted }) {
  const [loading, setLoading] = useState(false);
  const handle = async () => {
    setLoading(true);
    try {
      await deleteRole(role.id);
      toast.success("Role deleted");
      onDeleted();
    } catch {
      toast.error("Failed to delete role");
    } finally {
      setLoading(false);
    }
  };
  return (
    <ModalCard title="Confirm Delete" onClose={onClose} width={400}>
      <p style={{ color: "#374151", marginBottom: 20 }}>
        Delete role <strong>{role.name}</strong>? Users assigned to this role will lose their permissions.
      </p>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
        <ActionButton variant="secondary" onClick={onClose}>Cancel</ActionButton>
        <ActionButton variant="danger" onClick={handle} disabled={loading}>
          {loading ? "Deleting…" : "Delete"}
        </ActionButton>
      </div>
    </ModalCard>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function RolePermissionPage() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getRoles();
      setRoles(res.data || []);
    } catch {
      toast.error("Failed to load roles");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const close = () => setModal(null);
  const saved = () => { close(); load(); };

  return (
    <div style={{ padding: "28px 32px", minHeight: "100vh", background: "#f3f4f6" }}>
      {/* ── Header ── */}
      <PageHeader icon="👤" title="Role Permission" subtitle="Define access rights per role">
        <StatCard count={roles.length} label="Roles" color="#fca5a5" />
        <button
          onClick={() => setModal({ type: "add" })}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            background: "#fff", border: "1.5px solid #d1d5db",
            borderRadius: 8, padding: "8px 16px", fontWeight: 600,
            fontSize: 14, cursor: "pointer", color: "#374151",
          }}
        >
          <FiPlus size={15} /> Add
        </button>
      </PageHeader>

      {/* ── Role Cards Grid ── */}
      {loading ? <Spinner /> : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
          gap: 24,
        }}>
          {roles.map((role) => (
            <RoleCard
              key={role.id}
              role={role}
              onEdit={(r) => setModal({ type: "edit", role: r })}
              onDelete={(r) => setModal({ type: "delete", role: r })}
            />
          ))}
          {roles.length === 0 && (
            <div style={{
              gridColumn: "1/-1", textAlign: "center",
              padding: "60px 0", color: "#9ca3af",
            }}>
              No roles yet. Click <strong>+ Add</strong> to create one.
            </div>
          )}
        </div>
      )}

      {/* ── Modals ── */}
      {modal?.type === "add" && <RoleModal mode="add" onClose={close} onSaved={saved} />}
      {modal?.type === "edit" && <RoleModal mode="edit" role={modal.role} onClose={close} onSaved={saved} />}
      {modal?.type === "delete" && <DeleteRoleModal role={modal.role} onClose={close} onDeleted={saved} />}
    </div>
  );
}

// ─── Style helpers ────────────────────────────────────────────────────────────
function iconBtn(color) {
  return {
    background: "none", border: "1px solid #e5e7eb",
    borderRadius: 6, padding: "5px 8px", cursor: "pointer",
    color, display: "flex", alignItems: "center",
  };
}
