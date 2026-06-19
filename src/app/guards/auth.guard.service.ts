import { Injectable } from "@angular/core";

import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from "@angular/router";

@Injectable()
export class AuthGuard implements CanActivate {

    constructor(private router: Router) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {

        if (localStorage.getItem('jwtToken')) {
            return true;
        }

        let userType = localStorage.getItem("userType");
        switch (userType) {
            case "vendorlt":
                default:
                this.router.navigate(['/vlogon']); 
                break;
            case "vendorst":
                this.router.navigate(['/rov/rlogon']);
                break;
            case "sbm":
                this.router.navigate(['/sbm/logon']);
                break;
        }

        // this.router.navigate(['/vlogon'], {
        //     queryParams: {returnUrl: state.url}
        // });
        return false;
    }
}