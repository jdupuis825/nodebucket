/**
 * Title: security.module.ts
 * Author: Jocelyn Dupuis
 * Date: 01/18/2023
 * Description: ts file for security module
 */

// imports statements
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

import { SecurityRoutingModule } from './security-routing.module';
import { SecurityComponent } from './security.component';
import { SigninComponent } from './signin/signin.component';
import { PageNotFoundComponent } from '../page-not-found/page-not-found.component';

@NgModule({
  //declarations
  declarations: [
    SecurityComponent,
    SigninComponent,
    PageNotFoundComponent
  ],
  //imports array
  imports: [
    CommonModule,
    SecurityRoutingModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule
  ]
})
//exports
export class SecurityModule { }
