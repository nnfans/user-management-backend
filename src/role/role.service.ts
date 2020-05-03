import { Injectable, NotFoundException } from '@nestjs/common';
import { RoleRepository } from './role.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { RolesRO } from './role.interface';
import { RoleEntity } from './role.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UserRepository } from '../user/user.repository';
import { AttachRoleDto } from './dto';
import { In } from 'typeorm';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(RoleRepository)
    private readonly roleRepository: RoleRepository,
    @InjectRepository(UserRepository)
    private readonly userRepository: UserRepository
  ) {}

  async findAll(): Promise<RolesRO> {
    const permissions = await this.roleRepository.listRoles();
    const permissionRO: RolesRO = {
      meta: {
        count: permissions.length,
        total: await this.roleRepository.count(),
      },
      data: permissions,
    };

    return permissionRO;
  }

  async createRole(roleDto: CreateRoleDto): Promise<RoleEntity> {
    const { name, description } = roleDto;
    const role = new RoleEntity();
    role.name = name;
    role.description = description;

    return this.roleRepository.saveRole(role);
  }

  async attachRolesToUser({ roles, userId }: AttachRoleDto) {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    let roleEntity: RoleEntity[] = [];
    let roleEntityId: RoleEntity[] = [];
    let roleEntityName: RoleEntity[] = [];

    // Get role ids (number)
    const roleIds = roles
      .map((role) => parseInt(role))
      .filter((role) => !isNaN(role));

    // Get role names (string)
    const roleNames = roles.filter((role) => isNaN(parseInt(role)));

    // Fetch roles by id
    if (roleIds.length > 0) {
      roleEntityId = await this.roleRepository.findRolesById(roleIds);
    }

    // Fetch roles by name
    if (roleNames.length > 0) {
      roleEntityName = await this.roleRepository.findRolesByName(roleNames);
    }

    // Merge role entity
    roleEntity = [...roleEntityId, ...roleEntityName];

    if (roleEntity.length < 1) {
      throw new NotFoundException('Roles not found');
    }

    await this.userRepository.attachRolesToUser(user, roleEntity);
  }
}
