/**
 * Title: signin.component.ts
 * Author: Jocelyn Dupuis
 * Date: 01/18/2024
 * Description: ts file for signin component
 */

//import statements
import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { SecurityService } from '../security.service';

//exports session user interface
export interface SessionUser {
  empId: number;
  firstName: string;
  lastName: string;
}

//signin component
@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.css']
})

export class SigninComponent {
  //variables created
  errorMessage: string;
  sessionUser: SessionUser;
  isLoading: boolean = false;

  //form builder creates signin form that and accepts numerical values
  signinForm = this.fb.group({
    empId: [null, Validators.compose([Validators.required, Validators.pattern('^[0-9]*$')])]
  });

  //constructor created that passes the following
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private cookieService: CookieService,
    private securityService: SecurityService,
    private fb: FormBuilder
  ) {
    this.sessionUser = {} as SessionUser; //default value set
    this.errorMessage = ''; //default value set
  }

  //function for user to signin
  signin() {
    //set isLoading to true and get Id from form
    this.isLoading = true;
    console.log("signinForm", this.signinForm.value);
    const empId = this.signinForm.controls['empId'].value;

    //if ID is not valid an error message is displayed
    if (!empId || isNaN(parseInt(empId, 10))) {
      this.errorMessage = 'The employee ID is invalid. Please enter a number.';
      this.isLoading = false;
      return;
    }

    //subscribe to security service
    this.securityService.findEmployeeById(empId).subscribe({
      next: (employee: any) => {
        console.log('employee', employee);

        //session user to the logged employee
        this.sessionUser = employee;
        //gives user two session cookies to name and Id
        this.cookieService.set('session_user', empId, 1);
        this.cookieService.set('session_name', `${employee.firstName} ${employee.lastName}`, 1);

        //returns url
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/';

        this.isLoading = false;

        this.router.navigate([returnUrl]);
      },
      error: (err) => {
        this.isLoading = false;

        if (err.error.message) {
          this.errorMessage = err.error.message;
          return;
        }

        //sets value of error message
        this.errorMessage = err.message;
      }
    });
  }
}