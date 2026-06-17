import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RovDeptListComponent } from './rov-deptlist.component';

describe('DeptlistComponent', () => {
  let component: RovDeptListComponent;
  let fixture: ComponentFixture<RovDeptListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RovDeptListComponent ]
    })
    .compileComponents();
  }));
 
  beforeEach(() => {
    fixture = TestBed.createComponent(RovDeptListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
