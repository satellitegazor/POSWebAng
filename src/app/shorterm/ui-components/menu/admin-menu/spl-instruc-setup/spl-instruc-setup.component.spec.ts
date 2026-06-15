import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SplInstrucSetupComponent } from './spl-instruc-setup.component';

describe('SplInstrucSetupComponent', () => {
  let component: SplInstrucSetupComponent;
  let fixture: ComponentFixture<SplInstrucSetupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SplInstrucSetupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SplInstrucSetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
