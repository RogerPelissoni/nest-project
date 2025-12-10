import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'permissions_required';
export const Permission = (permission: string) => SetMetadata(PERMISSIONS_KEY, permission);
