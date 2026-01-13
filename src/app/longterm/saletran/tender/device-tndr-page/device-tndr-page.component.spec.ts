import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeviceTndrPageComponent } from './device-tndr-page.component';

describe('TenderPageComponent', () => {
  let component: DeviceTndrPageComponent;
  let fixture: ComponentFixture<DeviceTndrPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DeviceTndrPageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeviceTndrPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
