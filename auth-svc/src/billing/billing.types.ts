
import { Roles } from '../../generated/prisma/client';

export interface AuthUser {
  id: string;
  org_id: string;
  role: Roles;
}
