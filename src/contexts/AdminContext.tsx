import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { adminService, AdminRole, AdminPermissions } from '../services/adminService';
import { supabase } from '../lib/supabase';

interface AdminContextType {
  isAdmin: boolean;
  isLoading: boolean;
  adminRoles: AdminRole[];
  permissions: AdminPermissions;
  hasPermission: (permission: keyof AdminPermissions) => boolean;
  refreshAdminStatus: () => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};

export const AdminProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [adminRoles, setAdminRoles] = useState<AdminRole[]>([]);
  const [permissions, setPermissions] = useState<AdminPermissions>({
    user_management: false,
    device_unlock: false,
    system_settings: false,
    analytics: false,
    admin_management: false,
    audit_logs: false
  });

  const refreshAdminStatus = async () => {
    if (!user) {
      console.log('🔐 ADMIN - No user, setting to non-admin');
      setIsAdmin(false);
      setAdminRoles([]);
      setPermissions({
        user_management: false,
        device_unlock: false,
        system_settings: false,
        analytics: false,
        admin_management: false,
        audit_logs: false
      });
      setIsLoading(false);
      return;
    }

    try {
      console.log('🔐 ADMIN - Checking admin status for user:', user.id, 'email:', user.email);
      
      // FORCE ADMIN ACCESS FOR YOUR EMAIL ONLY
      const isYourEmail = user.email === 'techascendconsulting1@gmail.com';
      console.log('🔐 ADMIN - Is your email?', isYourEmail);
      
      if (isYourEmail) {
        console.log('🔐 ADMIN - FORCED ADMIN ACCESS for', user.email);
        setIsAdmin(true);
        setAdminRoles([]);
        setPermissions({
          user_management: true,
          device_unlock: true,
          system_settings: true,
          analytics: true,
          admin_management: true,
          audit_logs: true
        });
        setIsLoading(false);
        return;
      }
      
      // Use the new simple function for other users
      const { data: userData, error: userError } = await supabase
        .rpc('get_user_profile_simple');
      
      if (userError) {
        console.error('🔐 ADMIN - Error getting user details:', userError);
        setIsLoading(false);
        return;
      }
      
      console.log('🔐 ADMIN - User details:', userData);
      
      const isAdminUser = userData?.is_admin || userData?.is_super_admin || userData?.is_senior_admin;
      const roles = []; // We'll use the direct flags instead of the old role system
      console.log('🔐 ADMIN - Is admin user:', isAdminUser);
      
      setIsAdmin(isAdminUser);
      setAdminRoles(roles);
      
      // Calculate combined permissions based on admin level
      const combinedPermissions: AdminPermissions = {
        user_management: isAdminUser,
        device_unlock: isAdminUser,
        system_settings: userData?.is_super_admin || false,
        analytics: isAdminUser,
        admin_management: userData?.is_super_admin || userData?.is_senior_admin || false,
        audit_logs: isAdminUser
      };

      setPermissions(combinedPermissions);
      console.log('🔐 ADMIN - Combined permissions:', combinedPermissions);
      
    } catch (error) {
      console.error('🔐 ADMIN - Error checking admin status:', error);
      setIsAdmin(false);
      setAdminRoles([]);
      setPermissions({
        user_management: false,
        device_unlock: false,
        system_settings: false,
        analytics: false,
        admin_management: false,
        audit_logs: false
      });
    } finally {
      setIsLoading(false);
    }
  };

  const hasPermission = (permission: keyof AdminPermissions): boolean => {
    return permissions[permission];
  };

  useEffect(() => {
    refreshAdminStatus();
  }, [user]);

  const value = {
    isAdmin,
    isLoading,
    adminRoles,
    permissions,
    hasPermission,
    refreshAdminStatus
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};
