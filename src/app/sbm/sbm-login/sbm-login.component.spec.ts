import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SbmLoginComponent } from './sbm-login.component';

describe('SbmLoginComponent', () => {
  let component: SbmLoginComponent;
  let fixture: ComponentFixture<SbmLoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SbmLoginComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SbmLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
