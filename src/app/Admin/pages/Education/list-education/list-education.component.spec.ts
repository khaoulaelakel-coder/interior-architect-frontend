import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListEducationComponent } from './list-education.component';

describe('ListEducationComponent', () => {
  let component: ListEducationComponent;
  let fixture: ComponentFixture<ListEducationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListEducationComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ListEducationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
