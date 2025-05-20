import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormInventarioComponent } from './form-inventario.component';

describe('FormInventarioComponent', () => {
  let component: FormInventarioComponent;
  let fixture: ComponentFixture<FormInventarioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormInventarioComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormInventarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
