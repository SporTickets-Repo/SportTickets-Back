import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role, User } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const request = context
      .switchToHttp()
      .getRequest<{ user?: User; headers: Record<string, string> }>();

    if (!request.user) {
      return false;
    }

    const token = request.headers.authorization;
    if (!token) {
      return false;
    }

    const userRole = request.user.role;

    const hasRole =
      requiredRoles.includes(userRole) || userRole === Role.MASTER;

    if (!hasRole) {
      throw new ForbiddenException(
        'Access Denied: User does not have the necessary permissions.',
      );
    }

    return hasRole;
  }
}
