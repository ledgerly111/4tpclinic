// Tenant Scope Utilities
// Functions to filter records by organization/clinic based on user role

/**
 * Filter records by tenant scope based on current user
 * @param {Array} records - Array of records to filter (must have organizationId and optionally clinicId)
 * @param {Object} session - Current user session
 * @param {string} selectedClinicId - Currently selected clinic ID (optional)
 * @returns {Array} Filtered records
 */
export function filterByTenantScope(records, session, selectedClinicId = null) {
  if (!session) return [];

  const { role, organizationId, clinicIds } = session;

  switch (role) {
    case 'super_admin':
      // Super admin can see all records, optionally filtered by selected clinic
      if (selectedClinicId) {
        return records.filter((r) => r.clinicId === selectedClinicId);
      }
      return records;

    case 'admin':
      // Admin can only see records from their organization
      let adminRecords = records.filter((r) => r.organizationId === organizationId);
      // Optionally filter by selected clinic
      if (selectedClinicId) {
        adminRecords = adminRecords.filter((r) => r.clinicId === selectedClinicId);
      }
      return adminRecords;

    case 'staff':
      // Staff can only see records from their assigned clinics
      return records.filter((r) => 
        r.organizationId === organizationId && clinicIds.includes(r.clinicId)
      );

    default:
      return [];
  }
}

/**
 * Check if user can access a specific organization
 */
export function canAccessOrganization(session, orgId) {
  if (!session) return false;
  
  switch (session.role) {
    case 'super_admin':
      return true;
    case 'admin':
    case 'staff':
      return session.organizationId === orgId;
    default:
      return false;
  }
}

/**
 * Check if user can access a specific clinic
 */
export function canAccessClinic(session, clinicId, userClinicIds) {
  if (!session) return false;
  
  switch (session.role) {
    case 'super_admin':
      return true;
    case 'admin':
      return userClinicIds.includes(clinicId);
    case 'staff':
      return session.clinicIds.includes(clinicId);
    default:
      return false;
  }
}

/**
 * Get accessible organizations for current user
 */
export function getAccessibleOrganizations(session, allOrganizations) {
  if (!session) return [];
  
  switch (session.role) {
    case 'super_admin':
      return allOrganizations;
    case 'admin':
    case 'staff':
      return allOrganizations.filter((o) => o.id === session.organizationId);
    default:
      return [];
  }
}

/**
 * Get accessible clinics for current user
 */
export function getAccessibleClinics(session, allClinics) {
  if (!session) return [];
  
  switch (session.role) {
    case 'super_admin':
      return allClinics;
    case 'admin':
      return allClinics.filter((c) => c.organizationId === session.organizationId);
    case 'staff':
      return allClinics.filter((c) => session.clinicIds.includes(c.id));
    default:
      return [];
  }
}

/**
 * Add tenant context to a new record before saving
 */
export function addTenantContext(record, session, selectedClinicId = null) {
  if (!session) throw new Error('No active session');

  return {
    ...record,
    organizationId: session.organizationId,
    clinicId: selectedClinicId || (session.clinicIds.length === 1 ? session.clinicIds[0] : null),
    createdBy: session.userId,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Check if user can perform action on a record
 */
export function canModifyRecord(session, record) {
  if (!session || !record) return false;

  switch (session.role) {
    case 'super_admin':
      return true;
    case 'admin':
      return record.organizationId === session.organizationId;
    case 'staff':
      return (
        record.organizationId === session.organizationId &&
        session.clinicIds.includes(record.clinicId) &&
        record.createdBy === session.userId
      );
    default:
      return false;
  }
}

/**
 * Role hierarchy for permission checking
 */
export const ROLE_HIERARCHY = {
  super_admin: 3,
  admin: 2,
  staff: 1,
};

/**
 * Check if user has required role or higher
 */
export function hasRequiredRole(session, requiredRole) {
  if (!session) return false;
  const userLevel = ROLE_HIERARCHY[session.role] || 0;
  const requiredLevel = ROLE_HIERARCHY[requiredRole] || 0;
  return userLevel >= requiredLevel;
}
