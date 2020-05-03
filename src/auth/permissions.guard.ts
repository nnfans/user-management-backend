import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserEntity } from '../user/user.entity';
import { AuthService } from './auth.service';

const logger = new Logger('PermissionGuard');

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly authService: AuthService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Get permissions from context
    const permissions = this.reflector.getAllAndOverride<string[]>(
      'permissions',
      [context.getHandler(), context.getClass()]
    );

    // Pass to route handler as permissions not set
    if (!permissions) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user: UserEntity = request.user;

    // If not logged in
    if (!user) {
      return false;
    }

    // Bypass check if user is superuser
    if (user.isSuperUser) {
      return true;
    }

    let hasRoles = false;
    try {
      hasRoles = await this.authService.userHasPermissions(user, permissions);
    } catch (err) {
      logger.error(err);
    }

    return hasRoles;
  }
}
