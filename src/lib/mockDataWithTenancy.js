// Mock Data with Tenant Context
// This demonstrates how existing data models can be extended with tenant fields
// and how to filter them based on the current user's scope

import { filterByTenantScope, addTenantContext } from './tenantScope';
const TENANT_DATA_VERSION_KEY = 'clinic_tenant_data_version';
const TENANT_DATA_VERSION = '2';

// Example: Extending existing patient data with tenant fields
// In a real app, these would come from your backend with tenant fields already set

// Mock patients with tenant fields (simulating backend data)
let mockPatientsWithTenancy = [];

// Initialize with sample data if empty
function initTenantStorage() {
  const version = localStorage.getItem(TENANT_DATA_VERSION_KEY);
  if (version !== TENANT_DATA_VERSION) {
    localStorage.setItem('clinic_patients_tenant', '[]');
    localStorage.setItem('clinic_appointments_tenant', '[]');
    localStorage.setItem('clinic_invoices_tenant', '[]');
    localStorage.setItem(TENANT_DATA_VERSION_KEY, TENANT_DATA_VERSION);
  }
}

initTenantStorage();
mockPatientsWithTenancy = JSON.parse(localStorage.getItem('clinic_patients_tenant') || '[]');

// Mock appointments with tenant fields
let mockAppointmentsWithTenancy = JSON.parse(localStorage.getItem('clinic_appointments_tenant') || '[]');

// Mock invoices with tenant fields
let mockInvoicesWithTenancy = JSON.parse(localStorage.getItem('clinic_invoices_tenant') || '[]');

/**
 * Example: How to use tenant filtering in your components
 * 
 * import { useAuth } from '../context/AuthContext';
 * import { useTenant } from '../context/TenantContext';
 * import { mockTenantData } from '../lib/mockDataWithTenancy';
 * 
 * function MyComponent() {
 *   const { session } = useAuth();
 *   const { selectedClinicId } = useTenant();
 *   
 *   // Get filtered data based on user role and selected clinic
 *   const patients = mockTenantData.getPatients(session, selectedClinicId);
 *   const appointments = mockTenantData.getAppointments(session, selectedClinicId);
 *   const invoices = mockTenantData.getInvoices(session, selectedClinicId);
 *   
 *   // Create new record with tenant context
 *   const newPatient = mockTenantData.createPatient(
 *     { name: 'New Patient', age: 30 },
 *     session,
 *     selectedClinicId
 *   );
 * }
 */

export const mockTenantData = {
  // Get filtered patients
  getPatients(session, selectedClinicId = null) {
    return filterByTenantScope(mockPatientsWithTenancy, session, selectedClinicId);
  },

  // Get filtered appointments
  getAppointments(session, selectedClinicId = null) {
    return filterByTenantScope(mockAppointmentsWithTenancy, session, selectedClinicId);
  },

  // Get filtered invoices
  getInvoices(session, selectedClinicId = null) {
    return filterByTenantScope(mockInvoicesWithTenancy, session, selectedClinicId);
  },

  // Create patient with tenant context
  createPatient(patientData, session, selectedClinicId = null) {
    const newPatient = addTenantContext(
      { ...patientData, id: `p${Date.now()}` },
      session,
      selectedClinicId
    );
    mockPatientsWithTenancy.push(newPatient);
    localStorage.setItem('clinic_patients_tenant', JSON.stringify(mockPatientsWithTenancy));
    return newPatient;
  },

  // Create appointment with tenant context
  createAppointment(appointmentData, session, selectedClinicId = null) {
    const newAppointment = addTenantContext(
      { ...appointmentData, id: `a${Date.now()}` },
      session,
      selectedClinicId
    );
    mockAppointmentsWithTenancy.push(newAppointment);
    localStorage.setItem('clinic_appointments_tenant', JSON.stringify(mockAppointmentsWithTenancy));
    return newAppointment;
  },

  // Create invoice with tenant context
  createInvoice(invoiceData, session, selectedClinicId = null) {
    const newInvoice = addTenantContext(
      { ...invoiceData, id: `inv${Date.now()}` },
      session,
      selectedClinicId
    );
    mockInvoicesWithTenancy.push(newInvoice);
    localStorage.setItem('clinic_invoices_tenant', JSON.stringify(mockInvoicesWithTenancy));
    return newInvoice;
  },

  // Get statistics for dashboard
  getStats(session, selectedClinicId = null) {
    const patients = this.getPatients(session, selectedClinicId);
    const appointments = this.getAppointments(session, selectedClinicId);
    const invoices = this.getInvoices(session, selectedClinicId);

    return {
      totalPatients: patients.length,
      todayAppointments: appointments.filter(a => a.status === 'scheduled').length,
      completedAppointments: appointments.filter(a => a.status === 'completed').length,
      totalRevenue: invoices
        .filter(i => i.status === 'paid')
        .reduce((sum, i) => sum + i.amount, 0),
      pendingAmount: invoices
        .filter(i => i.status === 'pending')
        .reduce((sum, i) => sum + i.amount, 0),
      overdueAmount: invoices
        .filter(i => i.status === 'overdue')
        .reduce((sum, i) => sum + i.amount, 0),
    };
  },

  // Reset all tenant data (for testing)
  resetAll() {
    localStorage.removeItem('clinic_patients_tenant');
    localStorage.removeItem('clinic_appointments_tenant');
    localStorage.removeItem('clinic_invoices_tenant');
    // Reload to reinitialize
    window.location.reload();
  },
};

// Default export for easy importing
export default mockTenantData;
