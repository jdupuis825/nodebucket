/**
 * Title: security-routing.module.ts
 * Author: Jocelyn Dupuis
 * Date: 01/18/2023
 * Description: ts file for modules security routing
 */

// imports statements
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SecurityComponent } from './security.component';
import { SigninComponent } from './signin/signin.component';
import { PageNotFoundComponent } from '../page-not-found/page-not-found.component';

//declares routes and path
const routes: Routes = [
  {
    path: '',
    component: SecurityComponent,
    children: [
      {
        path: 'signin',
        component: SigninComponent,
        title: 'Nodebucket: Sign In'
      },
      {
        path: '**',
        component: PageNotFoundComponent,
        title: 'Not Found'
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
//exports
export class SecurityRoutingModule { }
