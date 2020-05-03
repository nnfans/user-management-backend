import { RoleEntity } from './role.entity';

export interface RolesRO {
  meta: {
    count: number;
    total: number;
  };
  data: RoleEntity[];
}
