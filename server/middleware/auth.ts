import { Request, Response, NextFunction } from 'express';
import { AuthService, AuthenticatedContext } from '../services/authService';
import { OrganizationRole } from '../db/types';

export interface AuthenticatedRequest extends Request {
  auth?: AuthenticatedContext;
}

const ROLE_HIERARCHY: Record<OrganizationRole, number> = {
  OWNER: 4,
  ADMIN: 3,
  MEMBER: 2,
  VIEWER: 1
};

export const extractToken = (req: Request): string | null => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7).trim();
  }
  if (req.cookies && req.cookies.session_token) {
    return req.cookies.session_token;
  }
  return null;
};

/**
 * Middleware validating that request contains a valid, unexpired session
 * and resolves the user's verified organization context.
 */
export const requireAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const token = extractToken(req);
  if (!token) {
    return res.status(401).json({ error: 'Authentication required. Please sign in.' });
  }

  const context = AuthService.validateSession(token);
  if (!context) {
    return res.status(401).json({ error: 'Session expired or invalid. Please sign in again.' });
  }

  req.auth = context;
  next();
};

/**
 * Middleware requiring platform SUPER_ADMIN access (e.g. for /admin endpoints)
 */
export const requireSuperAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.auth) {
    return res.status(401).json({ error: 'Authentication required.' });
  }

  if (req.auth.user.platform_role !== 'SUPER_ADMIN') {
    return res.status(403).json({ error: 'Access denied: Requires platform Super Admin privileges.' });
  }

  next();
};

/**
 * Middleware requiring active organization membership
 */
export const requireOrganization = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.auth || !req.auth.organization) {
    return res.status(400).json({ error: 'No active organization resolved for this session.' });
  }

  if (req.auth.organization.status === 'suspended' && req.auth.user.platform_role !== 'SUPER_ADMIN') {
    return res.status(403).json({ error: 'This organization is suspended. Please contact platform support.' });
  }

  next();
};

/**
 * Middleware requiring a minimum organization role (OWNER, ADMIN, MEMBER, VIEWER)
 */
export const requireRole = (minRole: OrganizationRole) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.auth) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    // Platform Super Admins always bypass organization role checks
    if (req.auth.user.platform_role === 'SUPER_ADMIN') {
      return next();
    }

    if (!req.auth.role) {
      return res.status(403).json({ error: 'Access denied: You are not a member of this organization.' });
    }

    const currentLevel = ROLE_HIERARCHY[req.auth.role] || 0;
    const requiredLevel = ROLE_HIERARCHY[minRole] || 0;

    if (currentLevel < requiredLevel) {
      return res.status(403).json({ 
        error: `Access denied: Requires ${minRole} privileges. Your role is ${req.auth.role}.` 
      });
    }

    next();
  };
};
