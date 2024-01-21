/**
 * Title: auth.guard.ts
 * Author: Jocelyn Dupuis
 * Date: 01/18/2023
 * Description: ts file for auth guard
 */

//import statements
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';

//exports and creates auth guard
export const authGuard: CanActivateFn = (route, state) => {
  //cookie variable
  const cookie = inject(CookieService); //inject CookieService

  //user logged in if has an authentication cookie
  if (cookie.get('session_user')) {
    //if user has cookie a message displayed that they are logged in
    console.log('You are logged in and have a valid session cookie set!')
    return true;
  } else {
    //if user doesn't have an auth cookie a message is displayed that they must be logged in to view task management page
    console.log('You must be logged in to access this page!')
    //routes user to sign in page
    const router = inject(Router)
    router.navigate(['/security/signin'], { queryParams: { returnUrl: state.url }})
    return false; //returns false
  }
};
