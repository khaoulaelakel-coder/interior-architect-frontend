import { SharedService } from './../../../services/navigation/shared.service';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { routes } from '../../../app.routes';
import { Router, RouterModule } from '@angular/router';
@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {

  // Import the SharedService to manage the title
  constructor(
    private SharedService: SharedService,
    private router: Router

  ) { }


  setSelectedTitle(title: string) {
    console.log('Navbar - setSelectedTitle called with:', title);
    this.SharedService.setparentTitle(title);
  }


  // Define the sidebar state
  isSidebarOpen = true;

  menus =
    [

      {
        title: "Dashboard",
        icon: "fa-solid fa-house",
        style: '#cbd5e1',
        route: "/admin/dashboard",
      },

      {
        title: "Education",
        icon: ' fa-solid fa-book-open',
        style: '#cbd5e1',
        subItems:
          [
            { title: "Add education", route: "/admin/add/education" },
            { title: "List education", route: "/admin/list/education" },
          ],
        isOpen: false,
      },

      {
        title: "Experience",
        icon: 'fa-solid fa-briefcase',
        style: '#cbd5e1',
        subItems:
          [
            { title: "Add experience", route: "/admin/add/experience" },
            { title: "List experience", route: "/admin/list/experience" },
          ],
        isOpen: false,
      },

      {
        title: "Projects",
        icon: 'fa-solid fa-folder',
        style: '#cbd5e1',
        subItems:
          [
            { title: "Add project", route: "/admin/add/project" },
            { title: "List project", route: "/admin/list/project" },
          ],
        isOpen: false,
      },

      {
        title: "Skills",
        icon: 'fa-solid fa-pen-fancy',
        style: '#cbd5e1',
        subItems:
          [
            { title: "Add skills", route: "/admin/add/skills" },
            { title: "List skills", route: "/admin/list/skills" },
          ],
        isOpen: false,
      },

      {
        title: "categories",
        icon: 'fa-solid fa-tags',
        style: '#cbd5e1',
        subItems:
          [
            { title: "Add categories", route: "/admin/add/categories" },
            { title: "List categories", route: "/admin/list/categories" },
          ],
        isOpen: false,
      },

      {
        title: "CV Management",
        icon: 'fa-solid fa-file-pdf',
        style: '#cbd5e1',
        subItems:
          [
            { title: "Add CV", route: "/admin/add/cv" },
            { title: "List CVs", route: "/admin/list/cvs" },
          ],
        isOpen: false,
      },

      {
        title: "Contact",
        icon: 'fa-solid fa-address-book',
        style: '#cbd5e1',
        route: "/admin/contact",
        isOpen: false,
      }
    ]

  activeMenuTitle: string | null = null;

  togglesidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  toggleSubMenu(menuTitle: string) {
    console.log('Navbar - toggleSubMenu called with:', menuTitle);
    this.activeMenuTitle = this.activeMenuTitle === menuTitle ? null : menuTitle;
  }

  isSubMenuOpen(menuTitle: string): boolean {
    return this.activeMenuTitle === menuTitle;
  }
}
