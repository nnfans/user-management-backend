import {
  Controller,
  Get,
  Post,
  Body,
  ValidationPipe,
  Patch,
  UsePipes,
} from '@nestjs/common';
import { PermissionsRO } from './permission.interface';
import { PermissionService } from './permission.service';
import { CreatePermissionDto, AttachPermissionDto } from './dto';
import { PermissionEntity } from './permission.entity';
import { Permissions } from '../auth/permissions.decorator';

@Controller('permissions')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Get()
  @Permissions('list-permissions')
  listAll(): Promise<PermissionsRO> {
    return this.permissionService.findAll();
  }

  @Post()
  @Permissions('create-permission')
  createPermission(
    @Body()
    permissionDto: CreatePermissionDto
  ): Promise<PermissionEntity> {
    return this.permissionService.createPermission(permissionDto);
  }

  @Patch('attach-to-role')
  @Permissions('attach-permissions-to-role')
  @UsePipes(new ValidationPipe())
  async attachRolesToUser(
    @Body() attachPermissionDto: AttachPermissionDto
  ): Promise<void> {
    await this.permissionService.attachPermissionsToRole(attachPermissionDto);
  }
}
