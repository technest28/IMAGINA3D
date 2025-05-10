import { Routes } from '@angular/router';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { LoginComponent } from './login/login.component';
import { RegistroComponent } from './registro/registro.component';
import { NavComponent } from './nav/nav.component';
import { ContrasenaComponent } from './contrasena/contrasena.component';
import { FooterComponent } from './footer/footer.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ModeloComponent } from './modelo/modelo.component';
import { InventarioComponent } from './inventario/inventario.component';
import { NotificacionesComponent } from './notificaciones/notificaciones.component';
import { UsuariosComponent } from './usuarios/usuarios.component';
import { PedidosComponent } from './pedidos/pedidos.component';
import { EgresosComponent } from './egresos/egresos.component';
import { VentasComponent } from './ventas/ventas.component';
import { MaterialesComponent } from './materiales/materiales.component';
import { CategoriasComponent } from './categorias/categorias.component';
// import { authGuard } from './auth.guard';

export const routes: Routes = [
  { path: 'landing-page', component: LandingPageComponent },
  { path: 'login', component: LoginComponent },
  { path: 'registro', component: RegistroComponent },
  { path: 'nav', component: NavComponent },
  { path: 'recuperar-contrasena', component: ContrasenaComponent },
  { path: 'footer', component: FooterComponent },
  {
    path: 'dashboard',
    component: DashboardComponent,
    // canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'usuarios', pathMatch: 'full' },
      { path: 'modelo', component: ModeloComponent },
      { path: 'inventario', component: InventarioComponent },
      { path: 'notificaciones', component: NotificacionesComponent },
      { path: 'usuarios', component: UsuariosComponent },
      { path: 'pedidos', component: PedidosComponent },
      { path: 'egresos', component: EgresosComponent },
      { path: 'ventas', component: VentasComponent },
      { path: 'materiales', component: MaterialesComponent },
      { path: 'categorias', component: CategoriasComponent }
    ]
  },
  { path: '', redirectTo: '/landing-page', pathMatch: 'full' },
  { path: '**', redirectTo: '/landing-page' }
];
