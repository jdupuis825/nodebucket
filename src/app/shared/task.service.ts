/**
 * Title: task.service.ts
 * Author: Jocelyn Dupuis
 * Date: 01/18/2024
 * Description: ts file for task service
 */

//import statements
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Item } from './item.interface';

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

  /**
   * @description deleteTask function to delete a task for an employee by empId and taskId
   * @param empId
   * @param taskId
   * @returns status code 204 (no content)
   */
  deleteTask(empId: number, taskId: string) {
    console.log('/api/employees/' + empId + '/tasks/' + taskId) //log the task id to the console
    return this.http.delete('/api/employees/' + empId + '/tasks/' + taskId) //make a delete request to API
  }

  /**
   * @description updateTask function to update a task for an employee by empId
   * @param empId
   * @param todo list of tasks to do
   * @param done list of tasks done
   * @returns status code 204 (no content)
   */
  updateTask(empId: number, todo: Item[], done: Item[]) {
    return this.http.put('/api/employees/' + empId + '/tasks', {
      todo,
      done
    })
  }
}
