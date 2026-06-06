import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SbmLtcBalDueTktsPageComponent } from './sbm-ltc-bal-due-tkts-page.component';

describe('SbmLtcBalDueTktsPageComponent', () => {
  let component: SbmLtcBalDueTktsPageComponent;
  let fixture: ComponentFixture<SbmLtcBalDueTktsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SbmLtcBalDueTktsPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SbmLtcBalDueTktsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
