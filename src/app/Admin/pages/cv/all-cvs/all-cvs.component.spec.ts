import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllCvsComponent } from './all-cvs.component';

describe('AllCvsComponent', () => {
  let component: AllCvsComponent;
  let fixture: ComponentFixture<AllCvsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllCvsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AllCvsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
