export const PAGE_PERMISSION_KEYS = ['dashboard', 'patients', 'appointments', 'inventory', 'services', 'billing', 'reports'];
export const EDIT_PERMISSION_KEYS = ['edit_patients', 'edit_appointments', 'edit_inventory', 'edit_services', 'edit_billing'];

export const DEFAULT_STAFF_PERMISSIONS = {
  pages: {
    dashboard: true,
    patients: true,
    appointments: true,
    inventory: false,
    services: false,
    billing: false,
    reports: false,
  },
  edits: {
    edit_patients: false,
    edit_appointments: false,
    edit_inventory: false,
    edit_services: false,
    edit_billing: false,
  },
};

export const FULL_ACCESS_PERMISSIONS = {
  pages: Object.fromEntries(PAGE_PERMISSION_KEYS.map((key) => [key, true])),
  edits: Object.fromEntries(EDIT_PERMISSION_KEYS.map((key) => [key, true])),
};

export function getEffectivePermissions(session) {
  if (!session) {
    return {
      pages: Object.fromEntries(PAGE_PERMISSION_KEYS.map((key) => [key, false])),
      edits: Object.fromEntries(EDIT_PERMISSION_KEYS.map((key) => [key, false])),
    };
  }

  if (session.role !== 'staff') {
    return FULL_ACCESS_PERMISSIONS;
  }

  return {
    pages: {
      ...DEFAULT_STAFF_PERMISSIONS.pages,
      ...(session.permissions?.pages || {}),
    },
    edits: {
      ...DEFAULT_STAFF_PERMISSIONS.edits,
      ...(session.permissions?.edits || {}),
    },
  };
}

export function hasPageAccess(session, pageKey) {
  if (!pageKey) return true;
  return Boolean(getEffectivePermissions(session).pages[pageKey]);
}

export function hasEditAccess(session, editKey) {
  if (!editKey) return true;
  return Boolean(getEffectivePermissions(session).edits[editKey]);
}
