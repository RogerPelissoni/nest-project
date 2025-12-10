import { Prisma } from 'prisma/generated/client';

export interface ProfilePermissionRequest {
  profile_permission_id?: number;
  permission_level: number;
  resource_id: number;
}

export interface ProfileCreatePayload extends Omit<Prisma.ProfileCreateInput, 'id'> {
  profile_permissions: ProfilePermissionRequest[];
}

export interface ProfileUpdatePayload extends Prisma.ProfileCreateInput {
  profile_permissions: ProfilePermissionRequest[];
}
