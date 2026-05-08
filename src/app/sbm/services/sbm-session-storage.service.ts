import { LogonResultsModel } from '../../models/mobile.client.identity';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SbmStorageService {
  private readonly keys = {
    results: 'sbm_results',
    userPrincipal: 'sbm_userPrincipal',
    userPrincipal_roles: 'sbm_userPrincipal_roles',
    userPrincipal_mobIdentity: 'sbm_userPrincipal_mobIdentity',
    employeeId: 'sbm_employeeId',
    firstName: 'sbm_firstName',
    middleInitial: 'sbm_middleInitial',
    lastName: 'sbm_lastName',
    suffix: 'sbm_suffix',
    fullName: 'sbm_fullName',
    employeeTitle: 'sbm_employeeTitle',
    emailAddress: 'sbm_emailAddress',
    personnelCategoryCode: 'sbm_personnelCategoryCode',
    dutyFacilityNumber: 'sbm_dutyFacilityNumber',
    authenticationType: 'sbm_authenticationType',
    isAuthenticated: 'sbm_isAuthenticated',
    name: 'sbm_name',
    principalCacheKey: 'sbm_principalCacheKey',
    isLnUser: 'sbm_isLnUser',
    isNonAafes: 'sbm_isNonAafes',
    userIdentity: 'sbm_userIdentity',
    userRoles: 'sbm_userRoles',
    isAuthorized: 'sbm_isAuthorized',
    posTerminalId: 'sbm_posTerminalId',
  };

  public saveLogonResults(result: LogonResultsModel) {
    sessionStorage.setItem(this.keys.results, JSON.stringify(result.results));
    // Store userPrincipal as a whole
    sessionStorage.setItem(this.keys.userPrincipal, JSON.stringify(result.userPrincipal));
    // Store userPrincipal.roles
    sessionStorage.setItem(this.keys.userPrincipal_roles, JSON.stringify(result.userPrincipal?.roles));
    // Store userPrincipal.mobIdentity as a whole
    sessionStorage.setItem(this.keys.userPrincipal_mobIdentity, JSON.stringify(result.userPrincipal?.mobIdentity));
    // Store each attribute of mobIdentity individually
    const mobId = result.userIdentity;
    if (mobId) {
      sessionStorage.setItem(this.keys.employeeId, String(mobId.employeeID));
      sessionStorage.setItem(this.keys.firstName, mobId.firstName);
      sessionStorage.setItem(this.keys.middleInitial, mobId.middleInitial);
      sessionStorage.setItem(this.keys.lastName, mobId.lastName);
      sessionStorage.setItem(this.keys.suffix, mobId.suffix);
      sessionStorage.setItem(this.keys.fullName, mobId.fullName);
      sessionStorage.setItem(this.keys.employeeTitle, mobId.employeeTitle);
      sessionStorage.setItem(this.keys.emailAddress, mobId.emailAddress);
      sessionStorage.setItem(this.keys.personnelCategoryCode, mobId.personnelCategoryCode);
      sessionStorage.setItem(this.keys.dutyFacilityNumber, mobId.dutyFacilityNumber);
      sessionStorage.setItem(this.keys.isAuthenticated, String(mobId.isAuthenticated));
      sessionStorage.setItem(this.keys.name, mobId.name);
      sessionStorage.setItem(this.keys.principalCacheKey, mobId.principalCacheKey);
      sessionStorage.setItem(this.keys.isLnUser, String(mobId.isLnUser));
    }
    sessionStorage.setItem(this.keys.userIdentity, JSON.stringify(result.userIdentity));
    sessionStorage.setItem(this.keys.userRoles, JSON.stringify(result.userRoles));
    sessionStorage.setItem(this.keys.isAuthorized, String(result.isAuthorized));
    sessionStorage.setItem(this.keys.posTerminalId, result.posTerminalId ? result.posTerminalId : '');
  }

  getResults() {
    const val = sessionStorage.getItem(this.keys.results);
    return val ? JSON.parse(val) : undefined;
  }

  getUserPrincipal() {
    const val = sessionStorage.getItem(this.keys.userPrincipal);
    return val ? JSON.parse(val) : undefined;
  }

  getUserIdentity() {
    const val = sessionStorage.getItem(this.keys.userIdentity);
    return val ? JSON.parse(val) : undefined;
  }

  getUserRoles(): string[] | undefined {
    const val = sessionStorage.getItem(this.keys.userRoles);
    return val ? JSON.parse(val) : undefined;
  }

  getIsAuthorized(): boolean {
    const val = sessionStorage.getItem(this.keys.isAuthorized);
    return val ? JSON.parse(val) : false;
  }

  getPosTerminalId(): string | undefined {
    const val = sessionStorage.getItem(this.keys.posTerminalId);
    return val ? JSON.parse(val) : undefined;
  }

  clearLogonData() {
    Object.values(this.keys).forEach(key => sessionStorage.removeItem(key));
  }
}
