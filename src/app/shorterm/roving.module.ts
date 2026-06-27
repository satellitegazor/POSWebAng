import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RovingRoutingModule } from './roving-routing.module';
import { ROV_TKT_OBJ_STATE } from './store/ticketstore/rticket.selector';
import { StoreModule } from '@ngrx/store';
import { RovTktObjReducer } from './store/ticketstore/rticket.reducer';
import { GetEventConfigReducer } from './store/roveventconfigstore/roveventconfig.reducer';
import { ROV_EVENT_CONFIG_STATE } from './store/roveventconfigstore/roveventconfig.selector';
import { RovTicketObjectEffects } from './store/ticketstore/rticket.effects';
import { EffectsModule } from '@ngrx/effects';
import { EventConfigEffects } from './store/roveventconfigstore/roveventconfig.effect';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RovingRoutingModule,
    StoreModule.forFeature(ROV_TKT_OBJ_STATE, RovTktObjReducer),
    StoreModule.forFeature(ROV_EVENT_CONFIG_STATE, GetEventConfigReducer),
    EffectsModule.forFeature([RovTicketObjectEffects]),
    EffectsModule.forFeature([EventConfigEffects]),
  ]
})
export class RovingModule { }
