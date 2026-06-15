"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogonRoutingModule = exports.routes = void 0;
var vendorlt_component_1 = require("./vendorlt/vendorlt.component");
var router_1 = require("@angular/router");
exports.routes = [
    { path: '', component: vendorlt_component_1.VendorLTComponent },
    { path: 'vlogon', component: vendorlt_component_1.VendorLTComponent },
];
exports.LogonRoutingModule = router_1.RouterModule.forChild(exports.routes);
