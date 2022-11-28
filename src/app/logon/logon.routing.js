"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogonRoutingModule = exports.routes = void 0;
var vendorlt_component_1 = require("./vendorlt/vendorlt.component");
var vendorst_component_1 = require("./vendorst/vendorst.component");
var sbm_component_1 = require("./sbm/sbm.component");
var router_1 = require("@angular/router");
exports.routes = [
    { path: '', component: vendorlt_component_1.VendorLTComponent },
    { path: 'vlogon', component: vendorlt_component_1.VendorLTComponent },
    { path: 'rlogon', component: vendorst_component_1.VendorSTComponent },
    { path: 'logon', component: sbm_component_1.SbmComponent },
];

/*export const routing: ModuleWithProviders = RouterModule.forChild(routes)*/
//const routes: Routes = [
//    { path: '', loadChildren: './logon/logon.module#LogonModule' },
//    { path: 'vlogon', loadChildren: './logon/logon.module#LogonModule' },
//    { path: 'rlogon', loadChildren: './logon/logon.module#LogonModule' },
//];
//@NgModule({
//    imports: [RouterModule.forRoot(routes)],
//    exports: [RouterModule]
//})
exports.LogonRoutingModule = router_1.RouterModule.forChild(exports.routes);
//# sourceMappingURL=logon.routing.js.map