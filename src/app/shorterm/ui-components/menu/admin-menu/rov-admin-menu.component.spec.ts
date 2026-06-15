import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RovAdminMenuComponent } from './rov-admin-menu.component';

describe('AdminMenuComponent', () => {
  let component: RovAdminMenuComponent;
  let fixture: ComponentFixture<RovAdminMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RovAdminMenuComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RovAdminMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
