import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RovReportsMenuComponent } from './rov-reports-menu.component';

describe('ReportsMenuComponent', () => {
  let component: RovReportsMenuComponent;
  let fixture: ComponentFixture<RovReportsMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RovReportsMenuComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RovReportsMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
