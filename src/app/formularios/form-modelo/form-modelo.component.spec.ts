import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormModeloComponent } from './form-modelo.component';

describe('FormModeloComponent', () => {
  let component: FormModeloComponent;
  let fixture: ComponentFixture<FormModeloComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormModeloComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormModeloComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
