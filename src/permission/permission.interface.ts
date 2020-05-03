import { PermissionEntity } from './permission.entity';

export interface PermissionsRO {
  meta: {
    count: number;
    total: number;
  };
  data: PermissionEntity[];
}
