import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { select, State, Store } from "@ngrx/store";
import { EMPTY, from, of } from "rxjs";
import { catchError, concatMap, exhaustMap, map, mergeMap, take, tap, withLatestFrom } from 'rxjs/operators';
import { RovApiService } from "../../short-term.service";
import { Action } from "@ngrx/store";
import { saveRTicketForGuestCheck, saveRTicketForGuestCheckFailed, saveRTicketForGuestCheckSuccess, saveCompleteTicketSplit, saveCompleteTicketSplitFailed, saveCompleteTicketSplitSuccess, saveTenderObj, saveTenderObjFailed, saveTenderObjSuccess, saveTicketDetail, saveTicketDetailFailed, saveTicketDetailSuccess, inactiveTicketDetail, inactiveTicketDetailFailed, inactiveTicketDetailSuccess, savePinpadResponse, savePinpadResponseFailed, savePinpadResponseSuccess, loadTicket, loadTicketFail, loadTicketSuccess, loadInProgressTenders, loadInProgressTendersFail, loadInProgressTendersSuccess, deleteDeclinedTenderFromStore } from "./rticket.action";
import { saleTranDataInterface } from "./rticket.state";
import { getRTktObjSelector } from './rticket.selector';
import { CPOSAppType } from "../../../services-misc/util.service"
import { TenderStatusType, TranStatusType } from "../../../models/ticket.tender"
//"src/app/models/ticket.tender";


@Injectable()
export class TicketObjectEffects {
    constructor(private action$: Actions, private rovApiSvc: RovApiService, private store: Store<saleTranDataInterface>) {    }

    saveTicketForGuestCheckEffect$ = createEffect(() => {
        return this.action$.pipe(
            ofType(saveRTicketForGuestCheck),
            mergeMap((action) => {

                return this.rovApiSvc.saveRTicketForGuestCheck(action.tktObj).pipe(
                    map(rslt => {
                        return saveRTicketForGuestCheckSuccess({rslt});
                    }),
                    catchError((errResp) => {
                        const errMessage = errResp + "Unable to save ticket data. Please logoff and logon again";
                        return of(saveRTicketForGuestCheckFailed(errResp));
                    })                        
                )
            })
        )
    });

    saveCompleteTicketSplitEffect$ = createEffect(() => {
        return this.action$.pipe(
            ofType(saveCompleteTicketSplit),
            mergeMap((action) => {

                return this.rovApiSvc.saveCompleteTicketSplit(action.tktObj).pipe(
                    map(rslt => {
                        return saveCompleteTicketSplitSuccess({rslt});
                    }),
                    catchError((errResp) => {
                        const errMessage = errResp + "Unable to save ticket data. Please logoff and logon again";
                        return of(saveCompleteTicketSplitFailed(errResp));
                    })                        
                )
            })
        )
    });
    saveTenderEffect$ = createEffect(() => {
        return this.action$.pipe(
            ofType(saveTenderObj),
            mergeMap((action) => {

                return this.rovApiSvc.saveTenderObj(action.tndrObj).pipe(
                    map(data => {
                        //console.log("saveTenderObj success ");
                        return saveTenderObjSuccess({data, tndrObj: action.tndrObj});
                    }),
                    catchError((errResp) => {
                        const errMessage = errResp + "Unable to save ticket data. Please logoff and logon again";
                        return of(saveTenderObjFailed(errResp));
                    })                        
                )
            })
        )
    });

    saveTicketDetailEffect$ = createEffect(() => {
        return this.action$.pipe(
            ofType(saveTicketDetail),
            mergeMap((action) => {
                return this.rovApiSvc.saveTicketDetail(action.uid, action.appType, action.request).pipe(
                    map(data => {
                        return saveTicketDetailSuccess({ data, request: action.request });
                    }),
                    catchError((error) => {
                        return of(saveTicketDetailFailed({ error }));
                    })
                );
            })
        );
    });

    inactiveTicketDetailEffect$ = createEffect(() => {
        return this.action$.pipe(
            ofType(inactiveTicketDetail),
            mergeMap((action) => {
                return this.rovApiSvc.inactiveTicketDetail(action.uid, action.request).pipe(
                    map(data => {
                        return inactiveTicketDetailSuccess({ data, request: action.request });
                    }),
                    catchError((error) => {
                        return of(inactiveTicketDetailFailed({ error }));
                    })
                );
            })
        );
    });

    savePinpadResponseEffect$ = createEffect(() => {
        return this.action$.pipe(
            ofType(savePinpadResponse),
            withLatestFrom(this.store.pipe(select(getTktObjSelector))),
            exhaustMap(([action, tktObj]) => {
                if (tktObj && tktObj.vMTndr) {
                    return this.rovApiSvc.saveFDMSTenderObj(tktObj.vMTndr[0], tktObj.transactionID, CPOSAppType.LongTerm, tktObj.individualUID).pipe(
                        map(resp => {
                            console.log("savePinpadResponse success ");
                            return savePinpadResponseSuccess({respObj: resp.data});
                        }),
                        catchError((errResp) => {
                            const errMessage = errResp + "Unable to save pinpad response. Please logoff and logon again";
                            return of(savePinpadResponseFailed(errResp));
                        })
                    );
                } else {
                    return of(savePinpadResponseFailed({msg: "No valid ticket object found to save pinpad response."}));
                }
            })
        );
    });
    // Effect to trigger ticket load when inProgTranId > 0
    loadTicketEffect$ = createEffect(() => {
        return this.action$.pipe(
            ofType(loadTicket),
            mergeMap(action =>
                this.rovApiSvc.getSingleTransaction(action.indivId, action.tranId, false, 0, false, false).pipe(
                    map(singleTranObj => loadTicketSuccess({ tktObj: singleTranObj.ticket })),
                    catchError(error => of(loadTicketFail({ errMessage: error.message || 'Unable to load in-progress ticket. Please logoff and logon again' })))
                )
            )
        )
    });

    loadInProgressTendersAfterLoadTicket$ = createEffect(() => {
        return this.action$.pipe(
            ofType(loadTicketSuccess),
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
                        loadInProgressTendersSuccess({ tenders: result?.tenders ?? result?.tenders ?? [] })),
                    catchError(error => of(loadInProgressTendersFail({ errMessage: error.message || 'Unable to load in-progress tenders. Please logoff and logon again' })))
                );
            })
        )
    });

    loadInProgressTendersEffect$ = createEffect(() => {
        return this.action$.pipe(
            ofType(loadInProgressTenders),
            mergeMap(action => {
                if (!action.tranId || !action.uid) {
                    return EMPTY;
                }

                return this.rovApiSvc.getInProgressTenders(action.tranId, action.appType, action.tenderStatus, action.uid).pipe(
                    map(result => loadInProgressTendersSuccess({ tenders: result?.tenders ?? result?.tenders ?? [] })),
                    catchError(error => of(loadInProgressTendersFail({ errMessage: error.message || 'Unable to load in-progress tenders. Please logoff and logon again' })))
                );
            })
        )
    });

    removeCancelledTenderAfterSave$ = createEffect(() => {
        return this.action$.pipe(
            ofType(saveTenderObjSuccess),
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
            ofType(loadInProgressTendersSuccess),
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
                        saveTenderObj({
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