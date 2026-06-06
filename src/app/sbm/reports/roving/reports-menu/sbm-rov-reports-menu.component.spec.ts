import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SbmRovReportsMenuComponent } from './sbm-rov-reports-menu.component';

describe('SbmRovReportsMenuComponent', () => {
  let component: SbmRovReportsMenuComponent;
  let fixture: ComponentFixture<SbmRovReportsMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SbmRovReportsMenuComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SbmRovReportsMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
