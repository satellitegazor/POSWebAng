import { async, ComponentFixture, TestBed } from '@angular/core/testing';
 
import { SbmComponent } from './sbm.component';

describe('SbmComponent', () => {
  let component: SbmComponent;
  let fixture: ComponentFixture<SbmComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SbmComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SbmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
