/**
 * Title: task.service.ts
 * Author: Jocelyn Dupuis
 * Date: 01/18/2024
 * Description: ts file for task service
 */

//import statements
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
//exports
export class TaskService {

  constructor(private http: HttpClient) { }

  //getTasks
  getTasks(empId: number) {
    return this.http.get('/api/employees/' + empId + '/tasks'); //http://localhost:3000/api/employees/1/tasks
  }

  //createTask
  addTask(empId: number, text: string) {
    return this.http.post('/api/employees/' + empId + '/tasks', { text }); //http://localhost:3000/api/employees/1/tasks
  }
}
