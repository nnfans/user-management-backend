import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PermissionRepository } from './permission.repository';
import { PermissionEntity } from './permission.entity';
import { PermissionsRO } from './permission.interface';
import { CreatePermissionDto, AttachPermissionDto } from './dto';
import { RoleRepository } from '../role/role.repository';
import { RoleEntity } from '../role/role.entity';

@Injectable()
export class PermissionService {
  constructor(
    @InjectRepository(PermissionRepository)
    private readonly permissionRepository: PermissionRepository,
    @InjectRepository(RoleRepository)
    private readonly roleRepository: RoleRepository
  ) {}

  async findAll(): Promise<PermissionsRO> {
    const permissions = await this.permissionRepository.listPermissions();
    const permissionRO: PermissionsRO = {
      meta: {
        count: permissions.length,
        total: await this.permissionRepository.count(),
      },
      data: permissions,
    };

    return permissionRO;
  }

  async createPermission(
    permissionDto: CreatePermissionDto
  ): Promise<PermissionEntity> {
    const { name, description } = permissionDto;
    const permission = new PermissionEntity();
    permission.name = name;
    permission.description = description;

    return this.permissionRepository.savePermission(permission);
  }

  async attachPermissionsToRole({
    role: roleParam,
    permissions,
  }: AttachPermissionDto) {
    let role: RoleEntity;

    if (typeof roleParam === 'string') {
      role = await this.roleRepository.findRoleByName(roleParam);
    } else {
      role = await this.roleRepository.findRoleById(roleParam);
    }

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    let permissionEntity: PermissionEntity[] = [];
    let permissionEntityId: PermissionEntity[] = [];
    let permissionEntityName: PermissionEntity[] = [];

    // Filter only roleIds (number)
    const permissionIds = permissions
      .map((permission) => parseInt(permission))
      .filter((permission) => !isNaN(permission));

    // Get role name (string)
    const permissionNames = permissions.filter((permission) =>
      isNaN(parseInt(permission))
    );

    if (permissionIds.length > 0) {
      permissionEntityId = await this.permissionRepository.findPermissionsById(
        permissionIds
      );
    }

    if (permissionNames.length > 0) {
      permissionEntityName = await this.permissionRepository.findPermissionsByName(
        permissionNames
      );
    }

    permissionEntity = [...permissionEntityId, ...permissionEntityName];

    if (permissionEntity.length < 1) {
      throw new NotFoundException('Permissions not found');
    }

    await this.roleRepository.attachPermissionsToRole(role, permissionEntity);
  }
}
