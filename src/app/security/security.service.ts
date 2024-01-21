/**
 * Title: security.service.ts
 * Author: Jocelyn Dupuis
 * Date: 01/18/2024
 * Description: ts file for security service
 */

//import statements
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class SecurityService {

  constructor(private http: HttpClient) { }

  findEmployeeById(empId: number) {
    return this.http.get('/api/employees/' + empId); //returns the employee object matching the empId
  }
}
