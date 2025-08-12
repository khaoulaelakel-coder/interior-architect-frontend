import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class adminGuard implements CanActivate {

  constructor(private auth: AuthService, private router: Router) { }

  canActivate(): boolean {
    console.log('Admin Guard - Checking authentication...');

    if (this.auth.isLoggedIn()) {
      console.log('Admin Guard - User is authenticated, allowing access');
      return true;
    }

    console.log('Admin Guard - User not authenticated, redirecting to login');
    this.router.navigate(['/admin/login']);
    return false;
  }
}