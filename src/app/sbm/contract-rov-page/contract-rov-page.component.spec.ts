import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { convertToParamMap, ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { ContractRovPageComponent } from './contract-rov-page.component';
import { SbmWebApiService } from '../services/sbm-web-api.service';

describe('ContractRovPageComponent', () => {
  let component: ContractRovPageComponent;
  let fixture: ComponentFixture<ContractRovPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ContractRovPageComponent],
      imports: [FormsModule],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            queryParamMap: of(convertToParamMap({}))
          }
        },
        {
          provide: SbmWebApiService,
          useValue: {
            loadROVContract: jasmine.createSpy('loadROVContract')
          }
        }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContractRovPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
