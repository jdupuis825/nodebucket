/**
 * Title: nav.component.ts
 * Author: Professor Krasso
 * Date: 8/5/23
 */

// imports statements
import { Component } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';

export interface AppUser {
  fullName: string;
}

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
//exports
export class NavComponent {
  appUser: AppUser
  isLoggedIn: boolean;

  constructor(private cookieService: CookieService) {
    this.appUser = {} as AppUser;
    this.isLoggedIn = this.cookieService.get('session_user') ? true : false;

    if (this.isLoggedIn) {
      this.appUser = {
        fullName: this.cookieService.get('session_name')
      }
      console.log(this.appUser.fullName)
    }
  }

  //sign out function
  signout() {
    console.log('Signing out...');
    this.cookieService.deleteAll();
    window.location.href = '/';
  }
}
