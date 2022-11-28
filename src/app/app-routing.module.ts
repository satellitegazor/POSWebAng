import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ModuleWithProviders } from '@angular/core';
import { AppModule } from './app.module';
 
const appRoutes: Routes = [
    { path: '', loadChildren: () => import('./logon/logon.module').then(mod => mod.LogonModule) },
    { path: 'vlogon', loadChildren: () => import('./logon/logon.module').then(mod => mod.LogonModule)  },
    { path: 'rlogon', loadChildren: () => import('./logon/logon.module').then(mod => mod.LogonModule) },
    { path: 'salestran', loadChildren: () => import('./saletran/saletran.module').then(mod => mod.SalesTranModule) },
];

export const ModuleRouting: ModuleWithProviders<AppModule> = RouterModule.forRoot(appRoutes);
