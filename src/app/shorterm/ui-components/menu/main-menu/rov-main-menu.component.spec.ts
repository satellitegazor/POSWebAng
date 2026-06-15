import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RovMainMenuComponent } from './rov-main-menu.component';

describe('MainMenuComponent', () => {
  let component: RovMainMenuComponent;
  let fixture: ComponentFixture<RovMainMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RovMainMenuComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RovMainMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
