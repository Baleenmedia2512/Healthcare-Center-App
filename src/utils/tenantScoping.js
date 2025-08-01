/**
 * Tenant Scoping Utility
 * 
 * Provides helper functions for applying tenant scoping to database queries
 */

/**
 * Get tenant scope filter for Prisma queries based on user session
 * @param {Object} session - User session with role and tenant information
 * @param {Object} options - Additional options for filtering
 * @returns {Object} Prisma compatible where clause object
 */
export function getTenantScopeFilter(session, options = {}) {
  const { includePatientFilter = false, includeUserFilter = false } = options;
  
  if (!session || !session.user) {
    throw new Error('Invalid session: User session is required for tenant scoping');
  }
  
  const { role, id, clinicId, branchId } = session.user;
  
  // Base filter
  const filter = {};
  
  // Apply scoping based on role
  switch (role) {
    case 'superadmin':
      // Superadmin has access to everything - no filters needed
      break;
      
    case 'clinicadmin':
      // Clinic admin has access to their clinic only
      if (clinicId) {
        if (includeUserFilter) {
          filter.clinicId = clinicId;
        }
        
        if (includePatientFilter) {
          filter.branch = {
            clinicId: clinicId
          };
        }
      }
      break;
      
    case 'branchadmin':
      // Branch admin has access to their branch only
      if (branchId) {
        if (includeUserFilter) {
          filter.branchId = branchId;
        }
        
        if (includePatientFilter) {
          filter.branchId = branchId;
        }
      }
      break;
      
    case 'doctor':
    default:
      // Doctor only sees their own records
      if (includeUserFilter) {
        filter.id = id;
      }
      
      if (includePatientFilter) {
        filter.userId = id;
        
        // Additionally scope to branch if available
        if (branchId) {
          filter.branchId = branchId;
        }
      }
      break;
  }
  
  return filter;
}

/**
 * Apply tenant scope to Prisma parameters
 * @param {Object} prismaParams - Existing Prisma query parameters
 * @param {Object} session - User session with role and tenant information
 * @param {Object} options - Additional options for filtering
 * @returns {Object} Updated Prisma parameters with tenant scoping
 */
export function applyTenantScope(prismaParams, session, options = {}) {
  const scopeFilter = getTenantScopeFilter(session, options);
  
  // If there are no filters to apply, return original params
  if (Object.keys(scopeFilter).length === 0) {
    return prismaParams;
  }
  
  // Create a deep copy of the params
  const scopedParams = { ...prismaParams };
  
  // Initialize the where clause if it doesn't exist
  if (!scopedParams.where) {
    scopedParams.where = {};
  }
  
  // Merge the scope filter with the existing where clause
  scopedParams.where = {
    ...scopedParams.where,
    ...scopeFilter
  };
  
  return scopedParams;
}

/**
 * Check if the current user has access to a specific tenant resource
 * @param {Object} session - User session with role and tenant information
 * @param {Object} resource - Resource object with tenant identifiers
 * @returns {boolean} Whether the user has access to the resource
 */
export function hasAccessToResource(session, resource) {
  if (!session?.user || !resource) return false;
  
  const { role, clinicId, branchId } = session.user;
  
  // SuperAdmin has access to everything
  if (role === 'superadmin') return true;
  
  // For resources with branchId (e.g., patients)
  if (resource.branchId) {
    // For branch specific roles
    if (role === 'branchadmin' || role === 'doctor') {
      return resource.branchId === branchId;
    }
    
    // For clinic admin, check if the branch belongs to their clinic
    if (role === 'clinicadmin' && resource.branch?.clinicId) {
      return resource.branch.clinicId === clinicId;
    }
  }
  
  // For resources with clinicId (e.g., branches)
  if (resource.clinicId) {
    if (role === 'clinicadmin') {
      return resource.clinicId === clinicId;
    }
  }
  
  // For user resources
  if (role === 'doctor' && resource.userId) {
    return resource.userId === session.user.id;
  }
  
  // Default deny
  return false;
}
