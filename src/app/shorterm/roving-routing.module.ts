import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RovLogonComponent } from './ui-components/logon/rov-logon.component';

const routes: Routes = [
  { path: 'rlogon', component: RovLogonComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RovingRoutingModule { }
