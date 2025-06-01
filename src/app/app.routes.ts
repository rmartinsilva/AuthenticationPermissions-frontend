import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard'; // Importar o AuthGuard
import { permissionGuard } from './guards/permission.guard'; // Importar PermissionGuard

export const routes: Routes = [
  {
    path: 'painel/login', // Rota atualizada
    // Carregamento dinâmico (lazy loading) do componente standalone
    loadComponent: () => import('./painel/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'painel',
    loadComponent: () => import('./templates/painel-layout/painel-layout.component').then(m => m.PainelLayoutComponent),
    canActivate: [authGuard], // Proteger esta rota e suas filhas
    children: [
      {
        path: 'dashboard', // Rota /painel/dashboard
        loadComponent: () => import('./painel/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'usuarios', // Rota PAI para usuários
        canActivate: [permissionGuard], // Protege todas as rotas filhas de usuários
        data: { permissions: ['view_usuarios'] }, // Permissão necessária para acessar a seção
        children: [
          {
            path: '', // Rota /painel/usuarios -> Lista
            loadComponent: () => import('./painel/usuarios/usuario-list/usuario-list.component').then(m => m.UsuarioListComponent),
            pathMatch: 'full' // Garante que só casa com /painel/usuarios exato
          },
          {
            path: 'novo', // Rota /painel/usuarios/novo -> Formulário (novo)
            loadComponent: () => import('./painel/usuarios/usuario-form/usuario-form.component').then(m => m.UsuarioFormComponent),
            canActivate: [permissionGuard],
            data: { permissions: ['create_usuarios'] }
            // TODO: Adicionar canActivate com permissão 'add_usuarios' se necessário
          },
          {
            path: 'editar/:id', // Rota /painel/usuarios/editar/:id -> Formulário (editar)
            loadComponent: () => import('./painel/usuarios/usuario-form/usuario-form.component').then(m => m.UsuarioFormComponent),
            canActivate: [permissionGuard],
            data: { permissions: ['update_usuarios'] }
            // TODO: Adicionar canActivate com permissão 'edit_usuarios' se necessário
          }
        ]
      },
      {
        path: 'grupos', // Rota PAI para grupos
        canActivate: [permissionGuard],
        data: { permissions: ['view_grupos'] }, // Permissão para ver a lista de grupos
        children: [
          {
            path: '', // Rota /painel/grupos -> Lista
            loadComponent: () => import('./painel/grupos/grupo-list/grupo-list.component').then(m => m.GrupoListComponent),
            pathMatch: 'full'
          },
          {
            path: 'novo', // Rota /painel/grupos/new -> Formulário (novo)
            loadComponent: () => import('./painel/grupos/grupo-form/grupo-form.component').then(m => m.GrupoFormComponent),
            canActivate: [permissionGuard],
            data: { permissions: ['create_grupos'] } // Permissão para criar grupos
          },
          {
            path: 'editar/:id', // Rota /painel/grupos/edit/:id -> Formulário (editar)
            loadComponent: () => import('./painel/grupos/grupo-form/grupo-form.component').then(m => m.GrupoFormComponent),
            canActivate: [permissionGuard],
            data: { permissions: ['update_grupos'] } // Alterado para update_grupos
          }
        ]
      },
      {
        path: 'acessos', // Rota PAI para acessos
        canActivate: [permissionGuard],
        data: { permissions: ['view_acessos'] }, // Permissão para ver a lista de acessos
        children: [
          {
            path: '', // Rota /painel/acessos -> Lista
            loadComponent: () => import('./painel/acessos/acesso-list/acesso-list.component').then(m => m.AcessoListComponent),
            pathMatch: 'full'
          },
          {
            path: 'novo', // Rota /painel/acessos/novo -> Formulário (novo)
            loadComponent: () => import('./painel/acessos/acesso-form/acesso-form.component').then(m => m.AcessoFormComponent),
            canActivate: [permissionGuard],
            data: { permissions: ['create_acessos'] } // Permissão para criar acessos
          },
          {
            path: 'editar/:id', // Rota /painel/acessos/editar/:id -> Formulário (editar)
            loadComponent: () => import('./painel/acessos/acesso-form/acesso-form.component').then(m => m.AcessoFormComponent),
            canActivate: [permissionGuard],
            data: { permissions: ['update_acessos'] } // Permissão para editar acessos
          }
        ]
      },
      {
        path: 'permissoes-grupo',
        loadComponent: () => import('./painel/permissoes-grupo/permissoes-grupo.component').then(m => m.PermissoesGrupoComponent),
        canActivate: [permissionGuard],
        data: { permissions: ['view_acesso_grupo'] } 
      },
      {
        path: 'home', // Rota /painel/home
        redirectTo: 'dashboard', // Redireciona para dashboard por enquanto
        pathMatch: 'full'
      },
      {
        path: '', // Rota /painel (raiz do painel)
        redirectTo: 'dashboard', // Redireciona para dashboard
        pathMatch: 'full'
      }
      // Adicionar outras rotas filhas do painel aqui
    ]
  },
  // TODO: Adicionar outras rotas aqui (ex: rota padrão, rotas protegidas)
  // Exemplo rota padrão (agora redirecionaria para painel/login):
  { path: '', redirectTo: 'painel/login', pathMatch: 'full' },
  // Exemplo rota protegida (requer um AuthGuard):
  // {
  //   path: 'painel',
  //   loadChildren: () => import('./painel/painel.routes').then(m => m.PAINEL_ROUTES), // Se painel for um módulo com rotas filhas
  //   canActivate: [AuthGuard] // Ou a função do guard diretamente
  // }
  // Rota Curinga (opcional, para página 404)
  { path: '**', redirectTo: 'painel/login' }
];
