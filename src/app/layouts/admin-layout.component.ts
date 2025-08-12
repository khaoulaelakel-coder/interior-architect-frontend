import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';


import { NavbarComponent } from '../Admin/components/navbar/navbar.component';
import { FooterComponent } from '../Admin/components/footer/footer.component';
import { HeaderComponent } from "../Admin/components/header/header.component";

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent, FooterComponent, HeaderComponent],
  template: `
  <div class="flex min-h-screen">
    <!-- Sidebar -->
    <aside class=" min-h-screen">
      <app-navbar></app-navbar>
    </aside>

    <!-- Content Area -->
    <div class="flex flex-col flex-grow">
      <!-- Header (optional) -->
      <app-header></app-header>

      <!-- Page Content -->
      <main class="flex-grow p-4">
        <router-outlet></router-outlet>
      </main>

      <!-- Footer -->
      <app-footer></app-footer>
    </div>
  </div>
`

})

export class AdminLayoutComponent { }