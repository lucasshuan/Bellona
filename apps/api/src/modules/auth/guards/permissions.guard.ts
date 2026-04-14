import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { PermissionKey } from '@ares/core';
import { PERMISSIONS_KEY } from '../decorators/required-permissions.decorator';
import type { GraphqlRequestContext } from '../auth.types';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<
      PermissionKey[]
    >(PERMISSIONS_KEY, [context.getHandler(), context.getClass()]);

    if (!requiredPermissions) {
      return true;
    }

    const ctx = GqlExecutionContext.create(context);
    const { req } = ctx.getContext<GraphqlRequestContext>();
    const user = req.user;

    if (!user) {
      return false;
    }

    if (user.isAdmin) {
      return true;
    }

    return requiredPermissions.every((permission) =>
      user.permissions?.includes(permission),
    );
  }
}
