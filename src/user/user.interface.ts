import { PermissionEntity } from '../permission/permission.entity';

export interface UserData {
  id: number;
  email: string;
  name: string;
  passwordMustChange: boolean;
  isSuperUser: boolean;
  permissions: PermissionEntity[];
}

export interface UserRO {
  user: UserData;
}
