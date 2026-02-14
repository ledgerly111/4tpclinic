// Mock Auth Store - Frontend-only simulation
// This can be replaced with real backend API calls later

const STORAGE_KEY = 'clinic_auth_data';
const SESSION_KEY = 'clinic_session';
const STORAGE_VERSION_KEY = 'clinic_auth_data_version';
const STORAGE_VERSION = '2';

// Initial seed data
const seedData = {
  organizations: [],
  clinics: [],
  users: [
    {
      id: 'user_super_1',
      role: 'super_admin',
      organizationId: null,
      clinicIds: [],
      username: 'aadhila003@gmail.com',
      email: 'aadhila003@gmail.com',
      password: 'aadhil8089385071',
      fullName: 'Aadhila Super Admin',
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z',
    },
  ],
};

// Initialize storage with seed data if empty
function initializeStorage() {
  const existingVersion = localStorage.getItem(STORAGE_VERSION_KEY);
  const existing = localStorage.getItem(STORAGE_KEY);
  if (!existing || existingVersion !== STORAGE_VERSION) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seedData));
    localStorage.setItem(STORAGE_VERSION_KEY, STORAGE_VERSION);
    sessionStorage.removeItem(SESSION_KEY);
  }
}

// Get all data from storage
function getData() {
  initializeStorage();
  return JSON.parse(localStorage.getItem(STORAGE_KEY));
}

// Save data to storage
function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// Generate unique ID
function generateId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function assertUserUnique(data, username, email) {
  const normalizedUsername = String(username || '').trim().toLowerCase();
  const normalizedEmail = String(email || '').trim().toLowerCase();
  const duplicate = data.users.find(
    (u) =>
      u.username.toLowerCase() === normalizedUsername ||
      u.email.toLowerCase() === normalizedEmail
  );

  if (duplicate) {
    throw new Error('Username or email already exists.');
  }
}

// Auth Store API
export const mockAuthStore = {
  // Authentication
  login(username, password) {
    const data = getData();
    const user = data.users.find(
      (u) => (u.username === username || u.email === username) && u.password === password && u.isActive
    );
    
    if (user) {
      const session = {
        userId: user.id,
        role: user.role,
        organizationId: user.organizationId,
        clinicIds: user.clinicIds,
        fullName: user.fullName,
        email: user.email,
        loginAt: new Date().toISOString(),
      };
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
      return { success: true, user: session };
    }
    return { success: false, error: 'Invalid credentials' };
  },

  logout() {
    sessionStorage.removeItem(SESSION_KEY);
    return { success: true };
  },

  getSession() {
    const session = sessionStorage.getItem(SESSION_KEY);
    return session ? JSON.parse(session) : null;
  },

  isAuthenticated() {
    return !!this.getSession();
  },

  // Organizations
  getOrganizations() {
    return getData().organizations;
  },

  getOrganizationById(id) {
    return getData().organizations.find((o) => o.id === id);
  },

  createOrganization(orgData) {
    const data = getData();
    const newOrg = {
      id: generateId('org'),
      name: orgData.name,
      adminUserId: null, // Will be set after admin creation
      createdAt: new Date().toISOString(),
    };
    data.organizations.push(newOrg);
    saveData(data);
    return newOrg;
  },

  // Clinics
  getClinics() {
    return getData().clinics;
  },

  getClinicsByOrganization(orgId) {
    return getData().clinics.filter((c) => c.organizationId === orgId);
  },

  getClinicById(id) {
    return getData().clinics.find((c) => c.id === id);
  },

  createClinic(clinicData) {
    const data = getData();
    const code = String(clinicData.code || '').trim().toUpperCase();
    const duplicateCode = data.clinics.find(
      (c) => c.organizationId === clinicData.organizationId && c.code.toUpperCase() === code
    );
    if (duplicateCode) {
      throw new Error('Clinic code already exists in this organization.');
    }

    const newClinic = {
      id: generateId('clinic'),
      organizationId: clinicData.organizationId,
      name: clinicData.name,
      code,
      createdAt: new Date().toISOString(),
    };
    data.clinics.push(newClinic);
    saveData(data);
    return newClinic;
  },

  // Users
  getUsers() {
    return getData().users;
  },

  getUsersByOrganization(orgId) {
    return getData().users.filter((u) => u.organizationId === orgId);
  },

  getUserById(id) {
    return getData().users.find((u) => u.id === id);
  },

  createUser(userData) {
    const data = getData();
    assertUserUnique(data, userData.username, userData.email);
    const newUser = {
      id: generateId('user'),
      role: userData.role,
      organizationId: userData.organizationId,
      clinicIds: userData.clinicIds || [],
      username: userData.username,
      email: userData.email,
      password: userData.password,
      fullName: userData.fullName,
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    data.users.push(newUser);
    saveData(data);
    return newUser;
  },

  updateUser(userId, updates) {
    const data = getData();
    const index = data.users.findIndex((u) => u.id === userId);
    if (index !== -1) {
      data.users[index] = { ...data.users[index], ...updates };
      saveData(data);
      return data.users[index];
    }
    return null;
  },

  resetPassword(userId, newPassword) {
    return this.updateUser(userId, { password: newPassword });
  },

  // Super admin: Create organization with admin
  createOrganizationWithAdmin(orgName, adminData) {
    const data = getData();
    assertUserUnique(data, adminData.username, adminData.email);
    
    // Create organization
    const newOrg = {
      id: generateId('org'),
      name: orgName,
      adminUserId: null,
      createdAt: new Date().toISOString(),
    };
    data.organizations.push(newOrg);
    
    // Create admin user
    const newAdmin = {
      id: generateId('user'),
      role: 'admin',
      organizationId: newOrg.id,
      clinicIds: [],
      username: adminData.username,
      email: adminData.email,
      password: adminData.password,
      fullName: adminData.fullName,
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    data.users.push(newAdmin);
    
    // Update org with admin ID
    newOrg.adminUserId = newAdmin.id;
    
    saveData(data);
    return { organization: newOrg, admin: newAdmin };
  },

  createAdminForOrganization(organizationId, adminData) {
    const data = getData();
    const organization = data.organizations.find((org) => org.id === organizationId);
    if (!organization) {
      throw new Error('Organization not found.');
    }

    assertUserUnique(data, adminData.username, adminData.email);

    const newAdmin = {
      id: generateId('user'),
      role: 'admin',
      organizationId,
      clinicIds: [],
      username: adminData.username,
      email: adminData.email,
      password: adminData.password,
      fullName: adminData.fullName,
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    data.users.push(newAdmin);

    if (!organization.adminUserId) {
      organization.adminUserId = newAdmin.id;
    }

    saveData(data);
    return newAdmin;
  },

  // Clear all data (for testing)
  clearAll() {
    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(SESSION_KEY);
    initializeStorage();
  },
};

// Initialize on module load
initializeStorage();
