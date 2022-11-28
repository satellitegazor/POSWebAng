"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GlobalConstants = void 0;
var GlobalConstants = /** @class */ (function () {
    function GlobalConstants() {
    }
    GlobalConstants.GetClientTimeVariance = function () {
        var now = new Date();
        var nowStr = (now.getMonth() + 1).toString() + '/' + now.getDate().toString() + '/' + now.getFullYear().toString() + ' ' + now.getHours().toString() + ':' + (now.getMinutes()).toString() + ':' + now.getSeconds().toString();
        var d2 = new Date(nowStr);
        now = new Date(Date.parse((new Date(nowStr)).toLocaleString("en-US", { timeZone: "America/Los_Angeles" })));
        var minutes = Math.floor((d2.getTime() - now.getTime()) / 60000);
        return minutes;
    };
    GlobalConstants.GET_GUID = '74D6B861-C792-493A-90C7-232B4BCA1441';
    GlobalConstants.PUT_GUID = '348D6A33-9C41-46E1-A18A-919B0E419CD4';
    GlobalConstants.POST_GUID = '22C1662C-ACAB-48DE-9DF1-246144BEFC2D';
    GlobalConstants.DELETE_GUID = 'A07C27C6-7943-4109-BD0D-61056147ACA7';
    GlobalConstants.CPOS_SVCS_URL = 'https://localhost:44328';
    return GlobalConstants;
}());
exports.GlobalConstants = GlobalConstants;
//# sourceMappingURL=global.constants.js.map 