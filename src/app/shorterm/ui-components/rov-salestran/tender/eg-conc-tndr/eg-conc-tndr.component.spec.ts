import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EgConcTndrComponent } from './eg-conc-tndr.component';

describe('EgConcTndrComponent', () => {
  let component: EgConcTndrComponent;
  let fixture: ComponentFixture<EgConcTndrComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EgConcTndrComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EgConcTndrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
