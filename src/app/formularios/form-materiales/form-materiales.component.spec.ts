import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormMaterialesComponent } from './form-materiales.component';

describe('FormMaterialesComponent', () => {
  let component: FormMaterialesComponent;
  let fixture: ComponentFixture<FormMaterialesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormMaterialesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormMaterialesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
