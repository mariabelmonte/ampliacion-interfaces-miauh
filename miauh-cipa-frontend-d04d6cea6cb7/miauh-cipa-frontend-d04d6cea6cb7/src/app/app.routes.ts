import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
    {
        path: 'login',
        loadComponent: () =>
            import('./features/login/pages/landing')
                .then(m => m.Landing)
    },
    {
        path: 'registro',
        redirectTo: 'login',
        pathMatch: 'full'
    },
    {
        path: '',
        loadComponent: () =>
            import('./core/layout/main/main')
                .then(m => m.Main),
        canActivate: [authGuard],
        children: [
            {
                path: '',
                redirectTo: 'dashboard',
                pathMatch: 'full'
            },
            {
                path: 'dashboard',
                loadComponent: () =>
                    import('./features/dashboard/pages/central/central')
                        .then(m => m.Central)
            },
            {
                path: 'animales',
                loadComponent: () =>
                    import('./features/animales/pages/animales/animales')
                        .then(m => m.Animales)
            },
            {
                path: 'perros',
                loadComponent: () =>
                    import('./features/animales/pages/perro/perro')
                        .then(m => m.Perro)
            },
            {
                path: 'gatos',
                loadComponent: () =>
                    import('./features/animales/pages/gato/gatos')
                        .then(m => m.Gato)
            },
            {
                path: 'adoptantes',
                loadComponent: () =>
                    import('./features/adoptantes/pages/adoptantes/adoptantes')
                        .then(m => m.Adoptantes)
            },
            {
                path: 'calendario',
                loadComponent: () =>
                    import('./features/calendario/pages/calendario/calendario')
                        .then(m => m.Calendario)
            },
            {
                path: 'transacciones',
                loadComponent: () =>
                    import('./features/transacciones/pages/transacciones/transacciones')
                        .then(m => m.Transacciones)
            },
            {
                path: 'gestion-usuarios',
                loadComponent: () =>
                    import('./features/gestion-usuarios/pages/gestion-usuarios/gestion-usuarios')
                        .then(m => m.GestionUsuarios),
                canActivate: [roleGuard],
                data: { roles: ['SUPERUSER', 'ADMINISTRATOR'] }
            },
            {
                path: 'gestion-tratamientos',
                loadComponent: () =>
                    import('./features/gestion-usuarios/pages/gestion-tratamientos/gestion-tratamientos')
                        .then(m => m.GestionTratamientos),
                canActivate: [roleGuard],
                data: { roles: ['SUPERUSER'] }
            }
        ]
    },
    {
        path: '**',
        redirectTo: 'dashboard'
    }
];
