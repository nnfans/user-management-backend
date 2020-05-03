import { Controller, Get, Post, Body, UsePipes, Patch } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { RoleService } from './role.service';
import { RolesRO } from './role.interface';
import { RoleEntity } from './role.entity';
import { ValidationPipe } from '../shared/pipes/validation.pipe';
import { AttachRoleDto } from './dto';
import { Permissions } from '../auth/permissions.decorator';

@Controller('roles')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}
  @Get()
  @Permissions('list-roles')
  listAll(): Promise<RolesRO> {
    return this.roleService.findAll();
  }

  @Post()
  @Permissions('create-role')
  createRole(
    @Body()
    roleDto: CreateRoleDto
  ): Promise<RoleEntity> {
    return this.roleService.createRole(roleDto);
  }

  @Patch('attach-to-user')
  @Permissions('attach-roles-to-user')
  @UsePipes(new ValidationPipe())
  async attachRolesToUser(@Body() attachRoleDto: AttachRoleDto): Promise<void> {
    await this.roleService.attachRolesToUser(attachRoleDto);
  }
}
