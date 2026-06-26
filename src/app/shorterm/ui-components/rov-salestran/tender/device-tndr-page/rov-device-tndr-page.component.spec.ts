import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RovDeviceTndrPageComponent } from './rov-device-tndr-page.component';

describe('TenderPageComponent', () => {
  let component: RovDeviceTndrPageComponent;
  let fixture: ComponentFixture<RovDeviceTndrPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RovDeviceTndrPageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RovDeviceTndrPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
