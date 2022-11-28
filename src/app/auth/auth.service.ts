import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { VLogonModel } from '../logon/models/vlogon.model';
import { GlobalConstants } from '../global/global.constants';
const httpOptions = {
  headers: new HttpHeaders({'Content-Type': 'application/json'})
};

@Injectable(
  {providedIn: 'root'}
)
export class AuthService {
  constructor(private http: HttpClient) {}

  login(model: VLogonModel): Observable<any> {

    const httpHeaders = {'__RequestVerificationToken':'xa4NAiz4y2pBLXeK-paUczLPb6Y1NPR4Ttqh2O0vyYd_KH-TpsRrMd7LLAN_6HXG-EiJMomM4toUOAn-e46XNHXlOZ5hUxhCgaLKwWn9Ng7k6bos4lQXImGd7_KNGqXiFsKW2hn6zdsTOMBf5dpLm8rFxZJr_1yqAdIHbHzfNCs1',
    '__RequestVerificationToken_L2FsdGFscGhhL2V1cm9wZS9sdGNwb3M1': 'ANbgtQY_eFe7cRShzsNhzfqaZylz1dTqahhi3Ln5lFsnWdnP6YnVf7Yp6OSFu4waZZ2zHdN1VrQlJ1liHp08u1ih56zTVgoLQpoIt6k4Z2Zm0JUH4JyCPA2oLwf3ItcYP2ZJPOGOQH9BT2PcU0xdGQ2; __RequestVerificationToken_L2FsdGJldGEvY29udXMvbHRjcG9z0=SyuZXd2aX5IzYJoFC6E4ar_BEkAmORKt4ipt9FqpoCdocUS8SFAWbU6k73Iud60X1XOpSpo3VUZRMk9-d0nC9laTmbtvdnmLhRG06ywFJqv_pxobUSdm0_tqPmDvebtKAzRc232dK7c6Fs87ueF2cg2'
    };

      return this.http.post<any>(GlobalConstants.CPOS_SVCS_URL, model, {'headers': httpHeaders });
  }
}

function CPOS_SVCS_URL<T>(CPOS_SVCS_URL: any, model: VLogonModel, arg2: { headers: { __RequestVerificationToken: string; __RequestVerificationToken_L2FsdGFscGhhL2V1cm9wZS9sdGNwb3M1: string; }; }): Observable<any> {
    throw new Error('Function not implemented.');
}
