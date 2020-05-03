import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserEntity } from '../user/user.entity';
import { AuthService } from './auth.service';

const rolesGuardLogger = new Logger('RolesGuard');

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly authService: AuthService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Get roles from context
    const roles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    // Pass to route handler as roles not set
    if (!roles) {
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
      hasRoles = await this.authService.userHasRoles(user, roles);
    } catch (err) {
      rolesGuardLogger.error(err);
    }

    return hasRoles;
  }
}
