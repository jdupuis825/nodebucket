/**
 * Title: task.component.ts
 * Author: Jocelyn Dupuis
 * Date: 01/18/2024
 * Description: ts file for task component
 */

//import statements
import { Component } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { TaskService } from '../shared/task.service';
import { Employee } from '../shared/employee.interface';
import { Item } from '../shared/item.interface';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.css']
})
//exports TaskComponent
export class TasksComponent {
  employee: Employee;
  empId: number;
  todo: Item[];
  done: Item[];
  errorMessage: string;
  successMessage: string;

  newTaskForm: FormGroup = this.fb.group({
    text: [null, Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(50)])]
  });

  constructor(private cookieService: CookieService, private taskService: TaskService, private fb: FormBuilder) {
    this.employee = {} as Employee;
    this.todo = [];
    this.done = [];
    this.errorMessage = '';
    this.successMessage = '';

    this.empId = parseInt(this.cookieService.get('session_user'), 10);

    this.taskService.getTasks(this.empId).subscribe({
      next: (res: any) => {
        console.log('Employee', res);
        this.employee = res;
      },
      error: (err) => {
        console.error('error', err);
        this.errorMessage = err.message;
        this.hideAlert(); //hide alert message
      },
      complete: () => {
        this.employee.todo ? this.todo = this.employee.todo : this.todo = [];
        this.employee.done ? this.done = this.employee.done : this.done = [];

        console.log('todo', this.todo);
        console.log('done', this.done);

      }
    })
  }

  //adds task
  addTask() {
    const text = this.newTaskForm.controls['text'].value;

    this.taskService.addTask(this.empId, text).subscribe({
      next: (task: any) => {
        console.log('Task added with Id', task.id);
        const newTask = {
          _id: task.id,
          text: text
        }

        this.todo.push(newTask); //Add task to todo list
        this.newTaskForm.reset(); //reset form

        this.successMessage = 'Task added successfully!';

        this.hideAlert();
      },
      error: (err) => {
        console.log('error', err);
        this.errorMessage = err.message;
        this.hideAlert(); //hide alert message
      }
    });
  }

  //delete task
  deleteTask(taskId: string) {
    console.log(`Task item: ${taskId}`)

    //confirm dialog
    if (!confirm('Are you sure you want to delete this task?')) {
      return;
    }

    //call the deleteTask() function on the taskService to subscribe to the observable and pass in the empId and taskId
    this.taskService.deleteTask(this.empId, taskId).subscribe({
      //if the task is deleted successfully, remove it from the task array
      next: (res: any) => {
        console.log('Task deleted with id, taskId')

        if (!this.todo) this.todo = [] //if the todo array is null, set it to an empty array
        if (!this.done) this.done = [] //if the done array is null, set it to an empty array

        //we are doing this because we do not know if the task is in the todo or done array
        this.todo = this.todo.filter(t => t._id.toString() !== taskId) //filter the array and remove the deleted task
        this.done = this.done.filter(t => t._id.toString() !== taskId) //filter the array and remove the deleted task

        this.successMessage = 'Task deleted successfully!' //set the success message

        this.hideAlert() //call the hideAlert() function
      },
      //if there is an error, lof it to the console and set the error message
      error: (err) => {
        console.log('error', err)
        this.errorMessage = err.message

        this.hideAlert() //calls the hideAlert() function
      }
    })
  }

  //drop event for the todo and done lists using the cdkDragDrop directive from the drag and drop module
  drop(event: CdkDragDrop<any[]>) {
    if (event.previousContainer === event.container) {
      //if the item is dropped in the same container, move it to the new index
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex)

      console.log('Moved item in array', event.container.data) //log the new array to the console

      //call the updateTaskList() function and pass in the empId, todo and done arrays
      this.updateTaskList(this.empId, this.todo, this.done)
    } else {
      //if the item is dropped in a different container, move it to the new container
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      )

      console.log('Moved item in array', event.container.data) //log the new array to the console

      //call the updateTaskList() function and pass in the empId, todo and done arrays
      this.updateTaskList(this.empId, this.todo, this.done)
    }
  }

  //hides alert after 5 seconds
  hideAlert() {
    setTimeout(() => {
      this.errorMessage = '';
      this.successMessage = '';
    }, 5000)
  }

  /**
   * @description Updates the task list for the employee with the specified empId and passes in the todo and done arrays
   * @param empId
   * @param todo
   * @param done
   * @returns void
  */

  updateTaskList(empId: number, todo: Item[], done: Item[]) {
    this.taskService.updateTask(empId, todo, done).subscribe({
      next: (res: any) => {
        console.log('Task updated successfully')
      },
      error: (err) => {
        console.log('error', err) //log the error message to the console
        this.errorMessage = err.message //set the error message
        this.hideAlert() //call the hideAlert() function
      }
    })
  }
}
