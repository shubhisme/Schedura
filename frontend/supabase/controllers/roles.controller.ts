import { supabase } from "../supabase";


/**
 * Add a new role to the roles table
 * @param orgid - Organization ID (reference to organisations table)
 * @param name - Role name
 * @param privileges - Privileges value (bitwise combination)
 * @returns The created role or error
 */
export const addRole = async (
  orgid: string,
  name: string,
  privileges: number
) => {
  try {
    const { data, error } = await supabase
      .from('roles')
      .insert([
        {
          orgid,
          name,
          priviledges: privileges, // Note: using 'priviledges' to match your schema spelling
        },
      ])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error adding role:', error);
    return { success: false, error };
  }
};

/**
 * Get all roles for an organization
 * @param orgid - Organization ID
 * @returns Array of roles or error
 */
export const getRolesByOrg = async (orgid: string) => {
  try {
    const { data, error } = await supabase
      .from('roles')
      .select('*')
      .eq('orgid', orgid);

    if (error) {
      throw error;
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error fetching roles:', error);
    return { success: false, error };
  }
};

/**
 * Update a role
 * @param roleId - Role ID
 * @param updates - Object containing fields to update
 * @returns Updated role or error
 */
export const updateRole = async (
  roleId: string,
  updates: { name?: string; priviledges?: number }
) => {
  try {
    const { data, error } = await supabase
      .from('roles')
      .update(updates)
      .eq('id', roleId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error updating role:', error);
    return { success: false, error };
  }
};

/**
 * Delete a role
 * @param roleId - Role ID
 * @returns Success status or error
 */
export const deleteRole = async (roleId: string) => {
  try {
    const { error } = await supabase.from('roles').delete().eq('id', roleId);

    if (error) {
      throw error;
    }

    return { success: true };
  } catch (error) {
    console.error('Error deleting role:', error);
    return { success: false, error };
  }
};

/**
 * Check if a role has a specific privilege
 * @param privileges - The privileges number from the role
 * @param privilegeValue - The privilege value to check (e.g., 1, 2, 4, 8, etc.)
 * @returns boolean indicating if the privilege exists
 */
export const hasPrivilege = (privileges: number, privilegeValue: number): boolean => {
  return (privileges & privilegeValue) === privilegeValue;
};

/**
 * Example usage in the modal:
 * 
 * import { addRole } from './controllers/rolesController';
 * 
 * const handleSubmit = async () => {
 *   const privilegeValue = calculatePrivilegeValue();
 *   const result = await addRole(orgid, roleName, privilegeValue);
 *   
 *   if (result.success) {
 *     console.log('Role created:', result.data);
 *     // Reset form and close modal
 *     setRoleName('');
 *     setSelectedPrivileges([]);
 *     setVisible(false);
 *   } else {
 *     console.error('Failed to create role:', result.error);
 *     // Show error message to user
 *   }
 * };
 */