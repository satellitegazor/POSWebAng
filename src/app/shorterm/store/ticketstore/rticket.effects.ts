import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { select, State, Store } from "@ngrx/store";
import { EMPTY, from, of } from "rxjs";
import { catchError, concatMap, exhaustMap, map, mergeMap, take, tap, withLatestFrom } from 'rxjs/operators';
import { RovApiService } from "../../short-term.service";
import { Action } from "@ngrx/store";
import { saveRovTicketForGuestCheck, saveRovTicketForGuestCheckFailed, saveRovTicketForGuestCheckSuccess, saveCompleteRovTicketSplit, saveCompleteRovTicketSplitFailed, saveCompleteRovTicketSplitSuccess, saveRovTenderObj, saveRovTenderObjFailed, saveRovTenderObjSuccess, saveRovTicketDetail, saveRovTicketDetailFailed, saveRovTicketDetailSuccess, inactiveRovTicketDetail, inactiveRovTicketDetailFailed, inactiveRovTicketDetailSuccess, saveRovPinpadResponse, saveRovPinpadResponseFailed, saveRovPinpadResponseSuccess, loadRovTicket, loadRovTicketFail, loadRovTicketSuccess, loadRovInProgressTenders, loadRovInProgressTendersFail, loadRovInProgressTendersSuccess, deleteDeclinedTenderFromStore } from "./rticket.action";
import { RovSaleTranDataInterface } from "./rticket.state";
import { getRTktObjSelector } from './rticket.selector';
import { CPOSAppType } from "../../../services-misc/util.service"
import { TenderStatusType, TranStatusType } from "../../../models/ticket.tender"
import { PosApiService } from "../../../longterm/services/pos-api-service";
//"src/app/models/ticket.tender";


@Injectable()
export class RovTicketObjectEffects {
    constructor(private action$: Actions, 
        private rovApiSvc: RovApiService, 
        private ltcApiSvc: PosApiService,
        private store: Store<RovSaleTranDataInterface>) {    }

    saveTicketForGuestCheckEffect$ = createEffect(() => {
        return this.action$.pipe(
            ofType(saveRovTicketForGuestCheck),
            mergeMap((action) => {

                return this.rovApiSvc.saveSplitPayments(action.tktObj).pipe(
                    map(rslt => {
                        return saveRovTicketForGuestCheckSuccess({rslt});
                    }),
                    catchError((errResp) => {
                        const errMessage = errResp + "Unable to save ticket data. Please logoff and logon again";
                        return of(saveRovTicketForGuestCheckFailed(errResp));
                    })                        
                )
            })
        )
    });

    saveCompleteTicketSplitEffect$ = createEffect(() => {
        return this.action$.pipe(
            ofType(saveCompleteRovTicketSplit),
            mergeMap((action) => {

                return this.rovApiSvc.saveSplitPayments(action.tktObj).pipe(
                    map(rslt => {
                        return saveCompleteRovTicketSplitSuccess({rslt});
                    }),
                    catchError((errResp) => {
                        const errMessage = errResp + "Unable to save ticket data. Please logoff and logon again";
                        return of(saveCompleteRovTicketSplitFailed(errResp));
                    })                        
                )
            })
        )
    });
    saveTenderEffect$ = createEffect(() => {
        return this.action$.pipe(
            ofType(saveRovTenderObj),
            mergeMap((action) => {

                return this.rovApiSvc.saveROVTenderObj(action.tndrObj).pipe(
                    map(data => {
                        //console.log("saveTenderObj success ");
                        return saveRovTenderObjSuccess({data, tndrObj: action.tndrObj});
                    }),
                    catchError((errResp) => {
                        const errMessage = errResp + "Unable to save ticket data. Please logoff and logon again";
                        return of(saveRovTenderObjFailed(errResp));
                    })                        
                )
            })
        )
    });

    saveTicketDetailEffect$ = createEffect(() => {
        return this.action$.pipe(
            ofType(saveRovTicketDetail),
            mergeMap((action) => {
                return this.ltcApiSvc.saveTicketDetail(action.uid, action.appType, action.request).pipe(
                    map(data => {
                        return saveRovTicketDetailSuccess({ data, request: action.request });
                    }),
                    catchError((error) => {
                        return of(saveRovTicketDetailFailed({ error }));
                    })
                );
            })
        );
    });

    inactiveTicketDetailEffect$ = createEffect(() => {
        return this.action$.pipe(
            ofType(inactiveRovTicketDetail),
            mergeMap((action) => {
                return this.ltcApiSvc.inactiveTicketDetail(action.uid, action.request).pipe(
                    map(data => {
                        return inactiveRovTicketDetailSuccess({ data, request: action.request });
                    }),
                    catchError((error) => {
                        return of(inactiveRovTicketDetailFailed({ error }));
                    })
                );
            })
        );
    });

    savePinpadResponseEffect$ = createEffect(() => {
        return this.action$.pipe(
            ofType(saveRovPinpadResponse),
            withLatestFrom(this.store.pipe(select(getTktObjSelector))),
            exhaustMap(([action, tktObj]) => {
                if (tktObj && tktObj.vMTndr) {
                    return this.rovApiSvc.saveFDMSTenderObj(tktObj.vMTndr[0], tktObj.transactionID, CPOSAppType.LongTerm, tktObj.individualUID).pipe(
                        map(resp => {
                            console.log("savePinpadResponse success ");
                            return saveRovPinpadResponseSuccess({respObj: resp.data});
                        }),
                        catchError((errResp) => {
                            const errMessage = errResp + "Unable to save pinpad response. Please logoff and logon again";
                            return of(saveRovPinpadResponseFailed(errResp));
                        })
                    );
                } else {
                    return of(saveRovPinpadResponseFailed({msg: "No valid ticket object found to save pinpad response."}));
                }
            })
        );
    });
    // Effect to trigger ticket load when inProgTranId > 0
    loadTicketEffect$ = createEffect(() => {
        return this.action$.pipe(
            ofType(loadRovTicket),
            mergeMap(action =>
                this.rovApiSvc.getSingleTransaction(action.indivId, action.tranId, false, 0, false, false).pipe(
                    map(singleTranObj => loadRovTicketSuccess({ tktObj: singleTranObj.ticket })),
                    catchError(error => of(loadRovTicketFail({ errMessage: error.message || 'Unable to load in-progress ticket. Please logoff and logon again' })))
                )
            )
        )
    });

    loadInProgressTendersAfterLoadTicket$ = createEffect(() => {
        return this.action$.pipe(
            ofType(loadRovTicketSuccess),
            withLatestFrom(this.store.pipe(select(getTktObjSelector))),
            mergeMap(([action, tktObj]) => {
                const tranId = action.tktObj?.transactionID ?? 0;
                const uid = tktObj?.individualUID ?? 0;
                const tranStatus = tktObj?.tranStatus ?? 0;

                if (!tranId || !uid || tranStatus !== TranStatusType.InProgress) {
                    return EMPTY;
                }

                return this.rovApiSvc.getInProgressTenders(tranId, CPOSAppType.LongTerm, TenderStatusType.InProgress, uid).pipe(
                    
                    map(result => 
                        loadRovInProgressTendersSuccess({ tenders: result?.tenders ?? result?.tenders ?? [] })),
                    catchError(error => of(loadRovInProgressTendersFail({ errMessage: error.message || 'Unable to load in-progress tenders. Please logoff and logon again' })))
                );
            })
        )
    });

    loadInProgressTendersEffect$ = createEffect(() => {
        return this.action$.pipe(
            ofType(loadRovInProgressTenders),
            mergeMap(action => {
                if (!action.tranId || !action.uid) {
                    return EMPTY;
                }

                return this.rovApiSvc.getInProgressTenders(action.tranId, action.appType, action.tenderStatus, action.uid).pipe(
                    map(result => loadRovInProgressTendersSuccess({ tenders: result?.tenders ?? result?.tenders ?? [] })),
                    catchError(error => of(loadRovInProgressTendersFail({ errMessage: error.message || 'Unable to load in-progress tenders. Please logoff and logon again' })))
                );
            })
        )
    });

    removeCancelledTenderAfterSave$ = createEffect(() => {
        return this.action$.pipe(
            ofType(saveRovTenderObjSuccess),
            mergeMap(action => {
                const tndr = action.tndrObj;
                if (!tndr
                    || tndr.tenderStatus !== TenderStatusType.Cancelled
                    || !['XC', 'XR', 'MS', 'MR', 'GC'].includes(tndr.tenderTypeCode ?? '')
                    || !tndr.rrn) {
                    return EMPTY;
                }
                return of(deleteDeclinedTenderFromStore({ rrn: tndr.rrn }));
            })
        );
    });

    persistCancelledTendersOnLoad$ = createEffect(() => {
        return this.action$.pipe(
            ofType(loadRovInProgressTendersSuccess),
            withLatestFrom(this.store.pipe(select(getTktObjSelector))),
            mergeMap(([action, tktObj]) => {

                const cancelledTenderTypeCodes = new Set(['XC', 'XR', 'MS', 'MR', 'GC'].map(type => (type)));
                const normalizeAuthNbr = (authNbr?: string | null) => (authNbr ?? '').trim();

                const tendersToCancel = (action.tenders ?? []).filter(tndr => {
                    const isAuthMissing = normalizeAuthNbr(tndr.authNbr).length === 0;
                    return tndr.tenderTypeCode == 'GC' || (cancelledTenderTypeCodes.has(tndr.tenderTypeCode) && isAuthMissing);
                });

                if (tendersToCancel.length === 0) {
                    return EMPTY;
                }

                const fallbackUserId = tktObj?.individualUID ? String(tktObj.individualUID) : '';

                return from(
                    tendersToCancel.map(tndr =>
                        saveRovTenderObj({
                            tndrObj: {
                                ...tndr,
                                tenderStatus: TenderStatusType.Cancelled,
                                tndMaintUserId: (tndr.tndMaintUserId ?? '').toString() || fallbackUserId,
                                tndMaintTimestamp: new Date(Date.now())
                            }
                        })
                    )
                );
            })
        );
    });
}