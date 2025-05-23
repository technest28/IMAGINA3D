import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormUsuariosComponent } from './form-usuarios.component';

describe('FormUsuariosComponent', () => {
  let component: FormUsuariosComponent;
  let fixture: ComponentFixture<FormUsuariosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormUsuariosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormUsuariosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
