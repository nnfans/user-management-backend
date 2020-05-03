import { EntityRepository, Repository, getRepository, In } from 'typeorm';
import { RoleEntity } from './role.entity';
import {
  ConflictException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { PermissionEntity } from '../permission/permission.entity';

const logger = new Logger('RoleRepository');

@EntityRepository(RoleEntity)
export class RoleRepository extends Repository<RoleEntity> {
  listRoles(): Promise<RoleEntity[]> {
    return this.find({ cache: 60000 });
  }

  async findRoleById(id: number): Promise<RoleEntity> {
    return this.findOne({
      where: { id, cache: 600000 },
    });
  }

  async findRolesById(ids: number[]): Promise<RoleEntity[]> {
    return this.find({
      where: { id: In(ids), cache: 600000 },
    });
  }

  async findRoleByName(name: string): Promise<RoleEntity> {
    return this.findOne({
      where: { name, cache: 600000 },
    });
  }

  async findRolesByName(names: string[]): Promise<RoleEntity[]> {
    const roles = await this.find({
      where: { name: In(names), cache: 600000 },
    }).catch(function (error) {
      logger.error(error);
      throw new InternalServerErrorException();
    });

    return roles;
  }

  saveRole(role: RoleEntity): Promise<RoleEntity> {
    return this.save(role).catch((error) => {
      if (error.number === 2627) {
        throw new ConflictException('Role name already exists');
      }
      throw new InternalServerErrorException();
    });
  }

  async attachPermissionsToRole(
    role: RoleEntity,
    permissions: PermissionEntity[]
  ) {
    role.permissions = permissions;
    this.save(role);
  }
}
