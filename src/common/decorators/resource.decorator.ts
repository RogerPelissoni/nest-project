import { SetMetadata } from '@nestjs/common';

export const RESOURCE_KEY = 'RESOURCE_KEY';
export const Resource = (resource: string) => SetMetadata(RESOURCE_KEY, resource);
