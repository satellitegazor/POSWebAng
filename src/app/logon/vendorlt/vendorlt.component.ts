import { Component, OnInit } from '@angular/core';
import { GlobalConstants } from '../../global/global.constants';
import { LogonSvc } from '../logonsvc.service';
import { AbbrLocationsModel, VLogonModel } from '../models/vlogon.model';
import { Router } from "@angular/router";
import { LogonDataService } from '../../global/logon-data-service.service';
import { LocalStorageService } from '../../global/local-storage.service';
import { SalesTranService } from 'src/app/longterm/saletran/services/sales-tran.service';
import { AlertService } from 'src/app/alertmsg/alert-message/alert-message.service';
import { AlertOptions } from 'src/app/alertmsg/alert-message/alert-message.model';
import { LocationConfigState } from 'src/app/longterm/saletran/store/locationconfigstore/locationconfig.state';
import { props, Store } from '@ngrx/store';
import { setLocationConfig } from 'src/app/longterm/saletran/store/locationconfigstore/locationconfig.action';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ResetPinDlgComponent } from './reset-pin-dlg/reset-pin-dlg.component';
import { MandateTrainingComponent } from './mandate-training/mandate-training.component';
import { ToastService } from 'src/app/services/toast.service';
import { HttpClient } from '@angular/common/http';

@Component({
    selector: 'app-logon-vendorlt',
    templateUrl: './vendorlt.component.html',
    styleUrls: ['./vendorlt.component.css'],
    standalone: false
})
export class VendorLTComponent implements OnInit {

    exchangenum: string = '';
    vendornum: string = '';
    lpin: string = '';
    selectedLocationId = 0;
    isSelected: string = '';
    LocationList: AbbrLocationsModel[] = [];
    successMsgDisplay: string = 'none';
    errorMsgDisplay: string = 'none';
    receiptPrinterName: string = 'Star Micronics Printer';
    verifoneAPIUrl: string = 'http://localhost:8000/cposwebsvc/pinpad/';
    

    constructor(private logonSvc: LogonSvc, 
        private router: Router,
        private _logonDataSvc: LogonDataService, 
        private _localStorageSvc: LocalStorageService, 
        private _saleTranSvc: SalesTranService,
        private _toastSvc: ToastService,
        private _locConfigStore: Store<LocationConfigState>,
        private _modalService: NgbModal,
        private _httpClient: HttpClient ) { }
    cookieVal = '';
    ngOnInit() {

        this.exchangenum = this._localStorageSvc.getItemData('contract_exchange_number');
        this.vendornum = this._localStorageSvc.getItemData('contract_vendor_number');
        
        if (this.exchangenum != null && this.vendornum != null) {
            this.GetLocations();
        }
    }

    DoLogon(event: any) {
        let selectedLocId: number = this.selectedLocationId;
        let location = this.LocationList.filter(k => k.locationUID == selectedLocId)[0];
        let locModel = new VLogonModel();
        locModel.exchangeNumber = location.exchangeNumber;
        locModel.facilityNumber = location.locationUID.toString();
        locModel.facilityName = location.facilityName;
        locModel.vendorNumber = this.vendornum;
        locModel.pin = this.lpin;
        locModel.locationUID = +selectedLocId;
        locModel.cliTimeVar = GlobalConstants.GetClientTimeVariance();
        locModel.guid = GlobalConstants.POST_GUID;
        locModel.contractType = true;
        locModel.individualUID = 0;
        locModel.loggingOut = false;
        locModel.newPIN = "";
        locModel.verifyPIN = "";
        locModel.pageID = 0;
        locModel.privActConfmComplete = false;
        locModel.showPrivTrngConfrm = 0;
        locModel.regionId = "conus";

        this.logonSvc.logonUser(locModel).subscribe(data => {
            if(data == null) {
                return;
            }
            //debugger;

            if (!data.results.success) {
                this.errorMsgDisplay = 'block';
                this.successMsgDisplay = 'none';
                this._toastSvc.error('Vendor Logon unsuccessful');
                return; 
            }
            else {
                this.errorMsgDisplay = 'none';
                this.successMsgDisplay = 'block';
                this._toastSvc.success('Vendor Logon successful, moving on to Sale Transaction...');
            }

            let selectedLocId: number = this.selectedLocationId;
            let location = this.LocationList.filter(k => k.locationUID == selectedLocId)[0];

            this._localStorageSvc.setItemData('contract_vendor_number', this.vendornum);
            this._localStorageSvc.setItemData('contract_exchange_number', location.exchangeNumber);
            this._localStorageSvc.setItemData('location_facility_number', location.facilityNumber);
            this._localStorageSvc.setItemData('location_ddlContract_Type', true.toString());
            this._localStorageSvc.setItemData('location_facility_name', location.facilityName);
 
            let cstart: Date = new Date(Date.parse(data.contractStart));
            let today: Date = new Date();
            this._localStorageSvc.setItemData('isFutureContract', (cstart > today ? true: false).toString());
            this._localStorageSvc.setItemData('jwtToken', data.tokenString);

            this._localStorageSvc.setItemData('apptype', 'longterm')
            //console.log('vendorlt sending data to subject');
            this._logonDataSvc.setLTVendorLogonData(data);

            this._saleTranSvc.getTenderTypes(1, 100).subscribe(data => {
                this._logonDataSvc.setTenderTypes(data);
            });
            this._saleTranSvc.getLocationConfig(+data.locationUID, +data.individualUID).subscribe(data => {

                this._logonDataSvc.setLocationConfig(data);
                this._locConfigStore.dispatch(setLocationConfig({ locationConfig: data }));

            });
            locModel.individualUID = +data.individualUID;

            if(data.resetPIN == 1) {
                const modalRef = this._modalService.open(ResetPinDlgComponent, { backdrop: 'static', keyboard: false, centered: true });
                modalRef.result.then((result) => {
                    if(result && result.newPin) {
                        //console.log('vendorlt reset pin dialog closed with new pin');
                        locModel.newPIN = result.newPin;
                        locModel.verifyPIN = result.newPin;

                        setTimeout(() => {
                            this.logonSvc.saveAssociatePIN(locModel).subscribe(pinData => {   
                                //console.log('vendorlt navigating to SalesCart');
                                this.router.navigate(['/salestran']);
                            });
                        }, 500);
                    }
                }, (reason) => {
                    //console.log('vendorlt reset pin dialog dismissed');
                });
                return;
            }
            if(data.resetPIN == 0 && data.showPrivTrngConfrm == 1) {
                const modalRef = this._modalService.open(MandateTrainingComponent, { backdrop: 'static', keyboard: false, centered: true });
                modalRef.componentInstance.vendorName = data.associateName;
                modalRef.componentInstance.businessDate = new Date;
                modalRef.result.then((result: any) => {
                    locModel.pageID  = 2;
                    locModel.privActConfmComplete = true;
                    this.logonSvc.logonUser(locModel).subscribe(() => {   
                        this.router.navigate(['/salestran']);
                    });
                    
                    //console.log('vendorlt mandate training dialog closed');
                }, (reason: any) => {
                    //console.log('vendorlt mandate training dialog dismissed');
                });
                return;
            }
            //console.log('vendorlt navigating to SalesCart');
            this.router.navigate(['/salestran']);


        });
    }

    OnChangeExchangeNum(event: any) {
        this.LocationList = [];
        this.vendornum = '';
    }

    OnChangeVendorNum(event: any) {
        this.LocationList = [];
        if (this.vendornum.length === 0) {
            return;
        }

        this.GetLocations();
    }

    private GetLocations() {

        this.logonSvc.GetLocations(this.vendornum).subscribe({
            next: data => {
                this.LocationList = data.locations.filter((fac: { exchangeNumber: string; }) => fac.exchangeNumber === this.exchangenum) 
                if (this.LocationList.length > 0) {
                    const ary = this.LocationList.filter((loc) => loc.facilityName == this._localStorageSvc.getItemData('location_facility_name'));
                    this.selectedLocationId = ary.length > 0 ? ary[0].locationUID : this.LocationList[0].locationUID;
                   
                } else {
                    alert('No locations found for given Vendor, Exchange Number.');
                }
            },
            error: err => {
                alert('No locations found for given Vendor, Exchange Number.');
                //console.log(err);
            }
        })
    }

    onLocationChange(event: any, val: string) {
        this.selectedLocationId = +val;
    }

    testReceiptPrinter() {
        this._toastSvc.info('Testing Receipt Printer...');
        console.log('Testing Receipt Printer');
        
        // Create test receipt output
        const receiptContent = this.createTestReceiptOutput();
        
        // Prepare the request model
        const printerModel = {
            printer: this.receiptPrinterName,
            receipt: receiptContent
        };
        
        const serviceUrl = 'https://localhost/MobileTheaterPrintUtility/ReceiptPrinterService.svc/PrintReceipt';
        
        // Call the receipt printer service
        this._httpClient.post<any>(serviceUrl, printerModel).subscribe({
            next: (response) => {
                if (response && response.Success) {
                    this._toastSvc.success('Receipt Printer test successful.');
                    console.log('Receipt Printer test successful');
                    
                    // Update printer name if returned from service
                    if (response.PrinterName && response.PrinterName.length > 0) {
                        this.receiptPrinterName = response.PrinterName;
                    }
                    
                    if (response.OutOfPaper) {
                        setTimeout(() => {
                            this._toastSvc.error('Receipt printer is out of paper.');
                        }, 1000);
                    } else if (response.NearlyOutOfPaper) {
                        setTimeout(() => {
                            this._toastSvc.warning('Receipt printer is nearly out of paper.');
                        }, 1000);
                    }
                } else {
                    this._toastSvc.error('Receipt Printer test failed. Please verify if the Receipt Printer is connected to the docking station.');
                    console.log('Receipt Printer test failed');
                }
            },
            error: (error) => {
                this._toastSvc.error('Receipt Printer test failed. Please verify if the Receipt Printer is connected to the docking station.');
                console.error('Receipt Printer error:', error);
            }
        });
    }

    private createTestReceiptOutput(): string {
        const lines: string[] = [];
        const width = 40;
        
        // Header
        lines.push(this.centerText('*** Sample Receipt ***', width));
        lines.push(this.repeatChar('-', width));
        
        // Content
        lines.push(this.padRight('Item 1', width));
        lines.push(this.padRight('Qty: 1  Price: $10.00', width));
        lines.push('');
        lines.push(this.padRight('Item 2', width));
        lines.push(this.padRight('Qty: 2  Price: $20.00', width));
        lines.push('');
        
        // Total
        lines.push(this.repeatChar('-', width));
        lines.push(this.alignRight('Subtotal: $30.00', width));
        lines.push(this.alignRight('Tax: $2.40', width));
        lines.push(this.alignRight('Total: $32.40', width));
        lines.push(this.repeatChar('-', width));
        lines.push(this.centerText('Thank You!', width));
        
        return lines.join('\n') + '\n<cr>';
    }

    private centerText(text: string, width: number): string {
        const padding = Math.floor((width - text.length) / 2);
        return Array(Math.max(0, padding)).join(' ') + text;
    }

    private padRight(text: string, width: number): string {
        return text + Array(Math.max(0, width - text.length + 1)).join(' ');
    }

    private alignRight(text: string, width: number): string {
        const padding = Math.max(0, width - text.length);
        return Array(padding).join(' ') + text;
    }

    private repeatChar(char: string, count: number): string {
        return Array(Math.max(0, count + 1)).join(char);
    }

    testTagPrinter() {
        this._toastSvc.info('Testing Tag Printer...');
        console.log('Testing Tag Printer');
        
        // Create test tag output
        const tagWidth = 42;
        const tagContent = this.createTestTagOutput(tagWidth);
        
        // Prepare the request model
        const printerModel = {
            printer: "Star SP700 Cutter (SP742)",
            tagCount: 2,
            receipt: tagContent
        };
        
        const serviceUrl = 'https://localhost/MobileTheaterPrintUtility/ReceiptPrinterService.svc/PrintTagAll';
        
        // Call the tag printer service
        this._httpClient.post<any>(serviceUrl, printerModel).subscribe({
            next: (response) => {
                if (response && response.Success) {
                    this._toastSvc.success('Tag Printer test successful.');
                    console.log('Tag Printer test successful');
                    
                    if (response.OutOfPaper) {
                        setTimeout(() => {
                            this._toastSvc.error('Tag printer is out of paper.');
                        }, 1000);
                    } else if (response.NearlyOutOfPaper) {
                        setTimeout(() => {
                            this._toastSvc.warning('Tag printer is nearly out of paper.');
                        }, 1000);
                    }
                } else {
                    this._toastSvc.error('Tag Printer test failed. Please verify if the Tag Printer is connected to the docking station.');
                    console.log('Tag Printer test failed');
                }
            },
            error: (error) => {
                this._toastSvc.error('Tag Printer test failed. Unable to connect to the printing service.');
                console.error('Tag Printer error:', error);
            }
        });
    }

    private createTestTagOutput(tagWidth: number): string {
        const part = '*** Sample Tag ***';
        const padding = Math.floor((tagWidth - part.length) / 2);
        const line = Array(padding).join(' ') + part + Array(tagWidth - padding - part.length).join(' ');
        return line + '<cr>';
    }

    testPinpad() {
        this._toastSvc.info('Testing Pinpad...');
        console.log('Testing Pinpad');
        this.pingVerifone(true);
    }

    testSignaturePad() {
        this._toastSvc.info('Testing Signature Pad...');
        console.log('Testing Signature Pad');
        // Add signature pad test logic here
    }

    private pingVerifone(displayResult: boolean = false) {
        setTimeout(() => {
            const heartbeatUrl = this.verifoneAPIUrl + 'HeartBeat?val=hello';
            
            this._httpClient.get<any>(heartbeatUrl).subscribe({
                next: (response) => {
                    if (!response.IsSuccess) {
                        this._toastSvc.error(response.ResultData);
                        console.error('Pinpad error:', response.ResultData);
                    } else {
                        if (displayResult) {
                            this._toastSvc.success(
                                'Connection Test to Pin Pad successful. Pin Pad Serial Number: ' + response.ResultData
                            );
                            console.log('Pinpad connection successful. Serial:', response.ResultData);
                        }
                        
                        // End Verifone session after 500ms
                        setTimeout(() => {
                            this.endVerifoneSession();
                        }, 500);
                    }
                },
                error: (error) => {
                    this._toastSvc.error(
                        'Pin Pad device cannot connect, please try again. If the issue continues contact the local SBM or call the helpdesk. [E56]'
                    );
                    console.error('Pinpad connection error:', error);
                }
            });
        }, 1000);
    }

    private endVerifoneSession() {
        // End the Verifone session
        // This method can be used to clean up pinpad resources
        console.log('Verifone session ended');
    }
}