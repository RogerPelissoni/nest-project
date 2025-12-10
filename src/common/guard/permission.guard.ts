import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permission.decorator';
import { PrismaService } from 'src/prisma/prisma.service';
import { RESOURCE_KEY } from '../decorators/resource.decorator';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const permissionType =
      this.reflector.getAllAndOverride<string>(PERMISSIONS_KEY, [context.getHandler(), context.getClass()]) ?? null;

    if (!permissionType) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user?.profile_id) {
      throw new ForbiddenException('Ocorreram problemas durante a operação: perfil de usuário não fornecido');
    }

    const resourceSignature = this.reflector.getAllAndOverride<string>(RESOURCE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const profilePermissions = await this.prisma.profilePermission.findFirst({
      where: {
        profile_id: user.profile_id,
        resource: { signature: resourceSignature },
      },
      select: { permission_level: true },
    });

    const permissionLevel = profilePermissions?.permission_level ?? 0;
    const neededLevel = { read: 1, create: 2, update: 3, delete: 4 }[permissionType] ?? 0;

    if (permissionLevel < neededLevel) {
      throw new ForbiddenException(
        `Acesso negado: perfil não possui permissão '${permissionType}' para o recurso '${resourceSignature}'`,
      );
    }

    return true;
  }
}
