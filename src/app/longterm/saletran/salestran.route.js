"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SalesTranRoutingModule = exports.routes = void 0;
var router_1 = require("@angular/router");
var sales_cart_component_1 = require("./sales-cart/sales-cart.component");
exports.routes = [
    { path: '', component: sales_cart_component_1.SalesCartComponent },
    { path: 'salestran', component: sales_cart_component_1.SalesCartComponent },
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
exports.SalesTranRoutingModule = router_1.RouterModule.forChild(exports.routes);
//# sourceMappingURL=salestran.route.js.map 