export class GlobalConstants {
    public static GET_GUID = '74D6B861-C792-493A-90C7-232B4BCA1441';
    public static PUT_GUID = '348D6A33-9C41-46E1-A18A-919B0E419CD4';
    public static POST_GUID = '22C1662C-ACAB-48DE-9DF1-246144BEFC2D';
    public static DELETE_GUID = 'A07C27C6-7943-4109-BD0D-61056147ACA7';
    public static CPOS_SVCS_URL = 'https://localhost:44328';

    public static GetClientTimeVariance(): number {
        var now = new Date();
        var nowStr = (now.getMonth() + 1).toString() + '/' + now.getDate().toString() + '/' + now.getFullYear().toString() + ' ' + now.getHours().toString() + ':' + (now.getMinutes()).toString() + ':' + now.getSeconds().toString()
        var d2 = new Date(nowStr);
        
        now = new Date(Date.parse((new Date(nowStr)).toLocaleString("en-US", { timeZone: "America/Chicago" })));
        var minutes = Math.floor((d2.getTime() - now.getTime()) / 60000);
        
        return minutes;
    }
}

export enum CouponType {
    exchCpnItem,
    vndCpnItem,
    exchCpnTran
}

export enum BusinessFunctionCode {
    BUSFNC_ALT = 'BUSFNC_ALT',
    BUSFNC_LNDRYCLN = 'BUSFNC_LNDRYCLN',
    BUSFNC_LNDRYCLN_WALT = 'BUSFNC_LNDRYCLN_WALT',
    BUSFNC_CASH_CARRY = 'BUSFNC_CASH_CARRY',
    BUSFNC_REPIR_CNTR = 'BUSFNC_REPIR_CNTR',
    BUSFNC_PHOTO_STDIO = 'BUSFNC_PHOTO_STDIO',
    BUSFNC_AUTO_ENHNC = 'BUSFNC_AUTO_ENHNC',
    BUSFNC_SPCLT_SHOP = 'BUSFNC_SPCLT_SHOP',
    BUSFNC_PSVCS_W_TIPS = 'BUSFNC_PSVCS_W_TIPS',
    BUSFNC_NONAME_BRAND_FSTFUD = 'BUSFNC_NONAME_BRAND_FSTFUD'
}