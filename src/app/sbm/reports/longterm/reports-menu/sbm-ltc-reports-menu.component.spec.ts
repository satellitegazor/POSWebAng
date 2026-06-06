import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SbmLtcReportsMenuComponent } from './sbm-ltc-reports-menu.component';

describe('SbmLtcReportsMenuComponent', () => {
  let component: SbmLtcReportsMenuComponent;
  let fixture: ComponentFixture<SbmLtcReportsMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SbmLtcReportsMenuComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SbmLtcReportsMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
