import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";


// Import your client header and footer if you have them, or just placeholders here
import { HeaderComponent } from "../user/components/header/header.component";
import { FooterComponent } from "../user/components/footer/footer.component";

@Component({

  selector: "app-client-layout",
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, FooterComponent],
  template: `
    <div class="flex flex-col min-h-screen">
      <app-header></app-header>
      <main class="flex-grow pt-32 md:pt-28 sm:pt-24">
        <router-outlet></router-outlet>
      </main>
      <app-footer></app-footer>
    </div>
  `,
})

export class clientLayoutComponent { }