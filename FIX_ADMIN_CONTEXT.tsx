// ====================================================================
// FIX ADMIN CONTEXT - Replace the problematic function call
// Copy this code and replace the refreshAdminStatus function in AdminContext.tsx
// ====================================================================

const refreshAdminStatus = async () => {
  if (!user) {
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
    console.log('🔐 ADMIN - Checking admin status for user:', user.id);
    
    // Use direct query instead of the problematic function
    const { data: userData, error: userError } = await supabase
      .from('user_profiles')
      .select('is_admin, is_super_admin, is_senior_admin')
      .eq('user_id', user.id)
      .single();
    
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






