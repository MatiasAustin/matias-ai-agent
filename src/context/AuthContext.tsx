import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api, AuthUser, UserOrganizationMembership } from '../api/client';
import { OrganizationRecord, OrganizationRole } from '../../server/db/types';

interface AuthContextType {
  user: AuthUser | null;
  organization: OrganizationRecord | null;
  role: OrganizationRole | null;
  userOrganizations: UserOrganizationMembership[];
  loading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  switchOrg: (orgId: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [organization, setOrganization] = useState<OrganizationRecord | null>(null);
  const [role, setRole] = useState<OrganizationRole | null>(null);
  const [userOrganizations, setUserOrganizations] = useState<UserOrganizationMembership[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCurrentAuth = async () => {
    try {
      const data = await api.getMe();
      setUser(data.user);
      setOrganization(data.organization);
      setRole(data.role);
      setUserOrganizations(data.user_organizations || []);
    } catch {
      setUser(null);
      setOrganization(null);
      setRole(null);
      setUserOrganizations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentAuth();
  }, []);

  const login = async (credentials: { email: string; password: string }) => {
    setLoading(true);
    try {
      const data = await api.login(credentials);
      setUser(data.user);
      setOrganization(data.organization);
      setRole(data.role);
      setUserOrganizations(data.user_organizations || []);
    } finally {
      setLoading(false);
    }
  };

  const switchOrg = async (orgId: string) => {
    setLoading(true);
    try {
      const data = await api.switchOrg(orgId);
      setUser(data.user);
      setOrganization(data.organization);
      setRole(data.role);
      setUserOrganizations(data.user_organizations || []);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } finally {
      setUser(null);
      setOrganization(null);
      setRole(null);
      setUserOrganizations([]);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        organization,
        role,
        userOrganizations,
        loading,
        login,
        switchOrg,
        logout,
        refreshAuth: fetchCurrentAuth
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
