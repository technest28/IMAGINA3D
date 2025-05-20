import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormVentasComponent } from './form-ventas.component';

describe('FormVentasComponent', () => {
  let component: FormVentasComponent;
  let fixture: ComponentFixture<FormVentasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormVentasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormVentasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
