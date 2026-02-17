import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { fetchTenantBootstrapApi } from '../lib/authApi';

const TenantContext = createContext();

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within TenantProvider');
  }
  return context;
};

const LEGACY_TENANT_STORAGE_KEY = 'clinic_selected_tenant';
const TENANT_STORAGE_KEY_PREFIX = 'clinic_selected_tenant_by_user:';

const getScopedTenantStorageKey = (userId) => `${TENANT_STORAGE_KEY_PREFIX}${userId}`;

const parseSavedSelection = (raw) => {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return parsed?.organizationId && parsed?.clinicId ? parsed : null;
  } catch {
    return null;
  }
};

export function TenantProvider({ children }) {
  const { session, isAuthenticated } = useAuth();
  const [selectedOrganizationId, setSelectedOrganizationId] = useState(null);
  const [selectedClinicId, setSelectedClinicId] = useState(null);
  const [organizations, setOrganizations] = useState([]);
  const [clinics, setClinics] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load tenant data when session changes
  useEffect(() => {
    const loadTenants = async () => {
      setIsLoading(true);

      try {
        const data = await fetchTenantBootstrapApi();
        const accessibleOrgs = Array.isArray(data.organizations) ? data.organizations : [];
        const accessibleClinics = Array.isArray(data.clinics) ? data.clinics : [];
        setOrganizations(accessibleOrgs);
        setClinics(accessibleClinics);

        const scopedKey = session?.userId ? getScopedTenantStorageKey(session.userId) : null;
        const savedSelection =
          parseSavedSelection(scopedKey ? localStorage.getItem(scopedKey) : null) ||
          parseSavedSelection(sessionStorage.getItem(LEGACY_TENANT_STORAGE_KEY));

        if (savedSelection) {
          const orgStillAccessible = accessibleOrgs.some((o) => o.id === savedSelection.organizationId);
          const clinicStillAccessible = accessibleClinics.some((c) => c.id === savedSelection.clinicId);

          if (orgStillAccessible && clinicStillAccessible) {
            setSelectedOrganizationId(savedSelection.organizationId);
            setSelectedClinicId(savedSelection.clinicId);
          } else {
            setDefaultSelection(accessibleOrgs, accessibleClinics, session);
          }
        } else {
          setDefaultSelection(accessibleOrgs, accessibleClinics, session);
        }
      } catch {
        setOrganizations([]);
        setClinics([]);
        setSelectedOrganizationId(null);
        setSelectedClinicId(null);
      } finally {
        setIsLoading(false);
      }
    };

    if (!isAuthenticated || !session) {
      sessionStorage.removeItem(LEGACY_TENANT_STORAGE_KEY);
      setOrganizations([]);
      setClinics([]);
      setSelectedOrganizationId(null);
      setSelectedClinicId(null);
      setIsLoading(false);
      return;
    }

    loadTenants();
  }, [session, isAuthenticated]);

  const setDefaultSelection = (accessibleOrgs, accessibleClinics, userSession) => {
    // Always reset to avoid stale selection carrying across org/session changes.
    setSelectedOrganizationId(null);
    setSelectedClinicId(null);

    if (accessibleOrgs.length > 0) {
      setSelectedOrganizationId(accessibleOrgs[0].id);
    }
    
    // For staff, use first assigned clinic
    if (userSession.role === 'staff' && userSession.clinicIds.length > 0) {
      setSelectedClinicId(userSession.clinicIds[0]);
    } else if (accessibleClinics.length > 0) {
      setSelectedClinicId(accessibleClinics[0].id);
    }
  };

  // Persist selection changes
  useEffect(() => {
    if (selectedOrganizationId && selectedClinicId) {
      const payload = JSON.stringify({
        organizationId: selectedOrganizationId,
        clinicId: selectedClinicId,
      });

      sessionStorage.setItem(LEGACY_TENANT_STORAGE_KEY, payload);
      if (session?.userId) {
        localStorage.setItem(getScopedTenantStorageKey(session.userId), payload);
      }
    }
  }, [selectedOrganizationId, selectedClinicId, session?.userId]);

  const selectOrganization = useCallback((orgId) => {
    setSelectedOrganizationId(orgId);
    
    // Auto-select first available clinic in this org
    const clinicsInOrg = clinics.filter(c => c.organizationId === orgId);
    if (clinicsInOrg.length > 0) {
      // Check if current user can access any of these clinics
      const accessibleClinic = clinicsInOrg.find(c => {
        if (session.role === 'super_admin') return true;
        if (session.role === 'admin') return true; // Admin can access all org clinics
        return session.clinicIds.includes(c.id);
      });
      
      if (accessibleClinic) {
        setSelectedClinicId(accessibleClinic.id);
      }
    }
  }, [clinics, session]);

  const selectClinic = useCallback((clinicId) => {
    // Validate user can access this clinic
    const canAccess = session?.role === 'super_admin' || 
                      session?.role === 'admin' ||
                      session?.clinicIds?.includes(clinicId);
    
    if (canAccess) {
      setSelectedClinicId(clinicId);
      
      // Update organization to match clinic
      const clinic = clinics.find(c => c.id === clinicId);
      if (clinic && clinic.organizationId !== selectedOrganizationId) {
        setSelectedOrganizationId(clinic.organizationId);
      }
    }
  }, [clinics, selectedOrganizationId, session]);

  const getSelectedOrganization = useCallback(() => {
    return organizations.find(o => o.id === selectedOrganizationId);
  }, [organizations, selectedOrganizationId]);

  const getSelectedClinic = useCallback(() => {
    return clinics.find(c => c.id === selectedClinicId);
  }, [clinics, selectedClinicId]);

  const getClinicsBySelectedOrg = useCallback(() => {
    if (!selectedOrganizationId) return [];
    
    // Filter by organization and user access
    return clinics.filter(c => {
      if (c.organizationId !== selectedOrganizationId) return false;
      if (session?.role === 'super_admin') return true;
      if (session?.role === 'admin') return true;
      return session?.clinicIds?.includes(c.id);
    });
  }, [clinics, selectedOrganizationId, session]);

  const value = {
    // Selection state
    selectedOrganizationId,
    selectedClinicId,
    
    // Data
    organizations,
    clinics,
    
    // Selected entities
    selectedOrganization: getSelectedOrganization(),
    selectedClinic: getSelectedClinic(),
    
    // Actions
    selectOrganization,
    selectClinic,
    
    // Utilities
    getClinicsBySelectedOrg,
    isLoading,
  };

  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
}
