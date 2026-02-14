import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { mockAuthStore } from '../lib/mockAuthStore';
import { getAccessibleOrganizations, getAccessibleClinics } from '../lib/tenantScope';

const TenantContext = createContext();

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within TenantProvider');
  }
  return context;
};

const TENANT_STORAGE_KEY = 'clinic_selected_tenant';

export function TenantProvider({ children }) {
  const { session, isAuthenticated } = useAuth();
  const [selectedOrganizationId, setSelectedOrganizationId] = useState(null);
  const [selectedClinicId, setSelectedClinicId] = useState(null);
  const [organizations, setOrganizations] = useState([]);
  const [clinics, setClinics] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load tenant data when session changes
  useEffect(() => {
    if (!isAuthenticated || !session) {
      setOrganizations([]);
      setClinics([]);
      setSelectedOrganizationId(null);
      setSelectedClinicId(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    
    // Load all data from mock store
    const allOrgs = mockAuthStore.getOrganizations();
    const allClinics = mockAuthStore.getClinics();
    
    // Filter by user access
    const accessibleOrgs = getAccessibleOrganizations(session, allOrgs);
    const accessibleClinics = getAccessibleClinics(session, allClinics);
    
    setOrganizations(accessibleOrgs);
    setClinics(accessibleClinics);

    // Try to restore previous selection from storage
    const saved = sessionStorage.getItem(TENANT_STORAGE_KEY);
    let savedSelection = null;
    
    try {
      savedSelection = saved ? JSON.parse(saved) : null;
    } catch {
      savedSelection = null;
    }

    if (savedSelection) {
      // Validate saved selection is still accessible
      const orgStillAccessible = accessibleOrgs.some(o => o.id === savedSelection.organizationId);
      const clinicStillAccessible = accessibleClinics.some(c => c.id === savedSelection.clinicId);
      
      if (orgStillAccessible && clinicStillAccessible) {
        setSelectedOrganizationId(savedSelection.organizationId);
        setSelectedClinicId(savedSelection.clinicId);
      } else {
        // Fall back to defaults
        setDefaultSelection(accessibleOrgs, accessibleClinics, session);
      }
    } else {
      // Set default selection
      setDefaultSelection(accessibleOrgs, accessibleClinics, session);
    }
    
    setIsLoading(false);
  }, [session, isAuthenticated]);

  const setDefaultSelection = (accessibleOrgs, accessibleClinics, userSession) => {
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
      sessionStorage.setItem(
        TENANT_STORAGE_KEY,
        JSON.stringify({
          organizationId: selectedOrganizationId,
          clinicId: selectedClinicId,
        })
      );
    }
  }, [selectedOrganizationId, selectedClinicId]);

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
