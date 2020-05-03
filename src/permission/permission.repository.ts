import { EntityRepository, Repository, In } from 'typeorm';
import { PermissionEntity } from './permission.entity';
import {
  ConflictException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';

const logger = new Logger('PermissionRepository');

@EntityRepository(PermissionEntity)
export class PermissionRepository extends Repository<PermissionEntity> {
  listPermissions(): Promise<PermissionEntity[]> {
    return this.find({ cache: 60000 });
  }

  async findPermissionById(id: number): Promise<PermissionEntity> {
    return this.findOne({
      where: { id, cache: 600000 },
    });
  }

  async findPermissionsById(ids: number[]): Promise<PermissionEntity[]> {
    return this.find({
      where: { id: In(ids), cache: 600000 },
    });
  }

  async findPermissionByName(name: string): Promise<PermissionEntity> {
    return this.findOne({
      where: { name, cache: 600000 },
    });
  }

  async findPermissionsByName(names: string[]): Promise<PermissionEntity[]> {
    const permissions = await this.find({
      where: { name: In(names), cache: 600000 },
    }).catch(function (error) {
      logger.error(error);
      throw new InternalServerErrorException();
    });

    return permissions;
  }

  savePermission(permission: PermissionEntity): Promise<PermissionEntity> {
    return this.save(permission).catch((error) => {
      if (error.number === 2627) {
        throw new ConflictException('Permission name already exists');
      }
      throw new InternalServerErrorException();
    });
  }
}
