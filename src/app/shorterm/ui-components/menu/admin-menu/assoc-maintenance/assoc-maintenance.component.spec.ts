import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssocMaintenanceComponent } from './assoc-maintenance.component';

describe('AssocMaintenanceComponent', () => {
  let component: AssocMaintenanceComponent;
  let fixture: ComponentFixture<AssocMaintenanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssocMaintenanceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssocMaintenanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
