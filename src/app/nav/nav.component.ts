import { NgClass } from '@angular/common';
import { Component, HostListener } from '@angular/core';

@Component({
  selector: 'app-nav',
  imports: [ NgClass ],
  templateUrl: './nav.component.html',
  styleUrl: './nav.component.css'
})
export class NavComponent {

  navbarOpened: boolean = false; // Indica si el menú está abierto
  scrolled: boolean = false; // Indica si el usuario hizo scroll

  constructor() { }

  // Alternar el estado del menú hamburguesa
  toggleNavbar() {
    this.navbarOpened = !this.navbarOpened;
  }

  // Detectar el scroll y cambiar el estado
  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.scrolled = window.pageYOffset > 0;
  }
}
