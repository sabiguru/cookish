/**
 * Access Control List (ACL) middleware
 * Role-based access control for API routes and server actions
 */

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

export type Role = 'USER' | 'CHEF' | 'ADMIN' | 'STAFF';

export interface ACLConfig {
  /**
   * Allowed roles
   */
  roles: Role[];

  /**
   * Require all roles (AND logic) or any role (OR logic)
   * Default: 'any' (OR logic)
   */
  mode?: 'any' | 'all';

  /**
   * Custom authorization check
   */
  customCheck?: (session: any) => boolean | Promise<boolean>;
}

/**
 * Check if user has required role(s)
 */
export function hasRole(userRoles: string[], requiredRoles: Role[], mode: 'any' | 'all' = 'any'): boolean {
  if (!userRoles || userRoles.length === 0) {
    return false;
  }

  if (mode === 'all') {
    return requiredRoles.every(role => userRoles.includes(role));
  }

  return requiredRoles.some(role => userRoles.includes(role));
}

/**
 * Check access for a session
 */
export async function checkAccess(config: ACLConfig): Promise<{
  allowed: boolean;
  session: any;
  reason?: string;
}> {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return {
      allowed: false,
      session: null,
      reason: 'Not authenticated',
    };
  }

  const userRoles = (session.user as any).roles || [];

  // Check roles
  if (!hasRole(userRoles, config.roles, config.mode)) {
    return {
      allowed: false,
      session,
      reason: `Required role(s): ${config.roles.join(', ')}`,
    };
  }

  // Custom check
  if (config.customCheck) {
    const customResult = await config.customCheck(session);
    if (!customResult) {
      return {
        allowed: false,
        session,
        reason: 'Custom authorization check failed',
      };
    }
  }

  return {
    allowed: true,
    session,
  };
}

/**
 * ACL middleware for API routes
 * Returns 401/403 response if unauthorized
 */
export async function withACL(
  request: NextRequest,
  config: ACLConfig
): Promise<{ allowed: true; session: any } | NextResponse> {
  const result = await checkAccess(config);

  if (!result.allowed) {
    if (!result.session) {
      return NextResponse.json(
        { error: 'Unauthorized', message: result.reason },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Forbidden', message: result.reason },
      { status: 403 }
    );
  }

  return {
    allowed: true,
    session: result.session,
  };
}

/**
 * ACL wrapper for server actions
 * Throws error if unauthorized
 */
export async function requireACL(config: ACLConfig): Promise<any> {
  const result = await checkAccess(config);

  if (!result.allowed) {
    throw new Error(result.reason || 'Access denied');
  }

  return result.session;
}

/**
 * Predefined ACL configs
 */
export const ACL = {
  // Public (no auth required) - for reference only
  public: {
    roles: ['USER', 'CHEF', 'ADMIN', 'STAFF'] as Role[],
  },

  // Authenticated users
  authenticated: {
    roles: ['USER', 'CHEF', 'ADMIN', 'STAFF'] as Role[],
  },

  // Regular users
  user: {
    roles: ['USER'] as Role[],
  },

  // Chefs
  chef: {
    roles: ['CHEF'] as Role[],
  },

  // Admin only
  admin: {
    roles: ['ADMIN'] as Role[],
  },

  // Staff (support, operations)
  staff: {
    roles: ['STAFF', 'ADMIN'] as Role[],
  },

  // Admin or Staff
  adminOrStaff: {
    roles: ['ADMIN', 'STAFF'] as Role[],
  },

  // Chef or Admin
  chefOrAdmin: {
    roles: ['CHEF', 'ADMIN'] as Role[],
  },
};

/**
 * Helper to check if user owns a resource
 */
export function isOwner(session: any, resourceUserId: string): boolean {
  return session?.user?.id === resourceUserId;
}

/**
 * Helper to check if user is admin
 */
export function isAdmin(session: any): boolean {
  const roles = (session?.user as any)?.roles || [];
  return roles.includes('ADMIN');
}

/**
 * Helper to check if user is chef
 */
export function isChef(session: any): boolean {
  const roles = (session?.user as any)?.roles || [];
  return roles.includes('CHEF');
}

/**
 * Helper to check if user is staff
 */
export function isStaff(session: any): boolean {
  const roles = (session?.user as any)?.roles || [];
  return roles.includes('STAFF') || roles.includes('ADMIN');
}

/**
 * Combined owner or admin check
 */
export function isOwnerOrAdmin(session: any, resourceUserId: string): boolean {
  return isOwner(session, resourceUserId) || isAdmin(session);
}
