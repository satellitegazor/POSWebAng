import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ModuleWithProviders } from '@angular/core';
import { AppModule } from './app.module';
 
const appRoutes: Routes = [
    { path: 'sbm', loadChildren: () => import('./sbm/sbm-module/sbm-module-routing.module').then(mod => mod.SBM_ROUTES) },
    { path: 'rov', loadChildren: () => import('./shorterm/roving-routing.module').then(mod => mod.ROV_ROUTES) },
    { path: 'vlogon', loadChildren: () => import('./logon/logon.module').then(mod => mod.LogonModule)  },
    { path: 'rov', loadChildren: () => import('./shorterm/roving.module').then(mod => mod.RovingModule) },
    { path: 'ltc', loadChildren: () => import('./longterm/long-term-route.module').then(mod => mod.LongTermRouteModule) },
    { path: 'reportsmenu', loadComponent: () => import('./longterm/menu/reports-menu/reports-menu.component').then(mod => mod.ReportsMenuComponent) },
    { path: 'salestranrpt', loadComponent: () => import('./longterm/reports/salestranrpt/sales-tran-rpt-page/sales-tran-rpt-page.component').then(mod => mod.SalesTranRptPageComponent) },
    { path: 'misc', loadChildren: () => import('./misc-module/misc.module').then(mod => mod.MiscModule) },
    { path: 'lrcpt', loadChildren: () => import('./rcpt/rcpt.module').then(mod => mod.RcptModule) },
    { path: 'itembtnmenu', loadChildren: () => import('./longterm/long-term.module').then(mod => mod.LongTermModule) },
    { path: '', loadChildren: () => import('./longterm/long-term-route.module').then(mod => mod.LongTermRouteModule) },
];

export const ModuleRouting: ModuleWithProviders<AppModule> = RouterModule.forRoot(appRoutes);
