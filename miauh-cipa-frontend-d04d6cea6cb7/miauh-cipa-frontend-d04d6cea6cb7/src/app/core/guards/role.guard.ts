import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { RolUsuario } from '../models/usuario.models';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route) => {
    const auth = inject(AuthService);
    const router = inject(Router);
    const roles = (route.data?.['roles'] ?? []) as RolUsuario[];

    if (!auth.isAuthenticated()) {
        return router.createUrlTree(['/login']);
    }

    if (!roles.length || auth.hasAnyRole(roles)) {
        return true;
    }

    return router.createUrlTree(['/dashboard']);
};
