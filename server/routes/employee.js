/**
 * Title: employee.js
 * Author: Jocelyn Dupuis
 * Date: 1/18/2024
 * Description: Route handling
 */

"use strict";

// Import statements.
const express = require("express");
const router= express.Router();
const { mongo } = require("../utils/mongo")
const { ObjectId } = require('mongodb');
const Ajv = require('ajv');
const ajv = new Ajv();

// ajv schema validation for the employee document.
const taskSchema = {
  type: 'object',
  properties: {
    text: { type: 'string'}
  },
  required: ['text'],
  additionalProperties: false
}

// Task schema for validation
const tasksSchema = {
  type: 'object',
  required: ['todo', 'done'],
  additionalProperties: false,
  properties: {
    todo: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          text: { type: 'string' }
        },
        required: ['_id', 'text'],
        additionalProperties: false
      }
    },
    done: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          text: { type: 'string' }
        },
        required: ['_id', 'text'],
        additionalProperties: false
      }
    }
  }
}



/**
 * findEmployeeById
 * @swagger
 * /api/employees/{empId}:
 *   get:
 *     summary: Get an employee by ID
 *     description: Retrieve employee details by providing their ID.
 *     parameters:
 *       - in: path
 *         name: empId
 *         required: true
 *         description: Employee ID
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: Successful response with the employee data.
 *       '400':
 *         description: Bad request, invalid employee ID.
 *       '404':
 *         description: Employee not found.
 *       '500':
 *         description: Internal server error.
 */

// Define a route for handling GET requests to '/api/employees/:empId'.
router.get("/:empId", (req, res, next) => {
  try {
    // Extract the 'empId' parameter from the request parameters.
    let { empId } = req.params;
    // Parse the 'empId' as an integer (base 10).
    empId = parseInt(empId, 10);

    // Check if 'empId' is not a valid number.
    if (isNaN(empId)) {
      // If not a number, handle the error.
      const err = new Error("Employee ID must be a number.");
      err.status = 400;
      console.log("err", err);
      next(err);
      return; // exit out of the if statement
    }

    // Use the 'mongo' function to interact with the MongoDB database.
    mongo(async db => {
      // Find one document in the 'employees' collection by employee id number.
      const employee = await db.collection("employees").findOne({empId}); // findOne returns a single document.

      // If employee id is not found, handle error.
      if (!employee) {
        const err = new Error("employee not found.");
        err.status = 404;
        console.log("err", err);
        next(err);
        return; // exit out of the if statement
      }

      res.send(employee); // send the employee record as a JSON response object.
    })

  } catch (err) {
    // Handle any unexpected errors by logging them and passing them to the next middleware.
    console.error("Error: ", err);
    next(err);
  }
})


/**
 * findAllTasks
 * @swagger
 * /api/employees/{empId}/tasks:
 *   get:
 *     summary: Finds all tasks by employee ID
 *     description: Retrieves tasks by the employee ID
 *     parameters:
 *       - in: path
 *         name: empId
 *         required: true
 *         description: Employee ID
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: Successful response with the employee data.
 *       '400':
 *         description: Bad request, invalid employee ID.
 *       '404':
 *         description: Task not found for the specified ID.
 *       '500':
 *         description: Internal server error.
 */


// Find all tasks API by empId.
router.get('/:empId/tasks', (req, res, next) => {
  try {
    let {empId} = req.params;
    empId = parseInt(empId, 10); // Parse the empId to an integer.

    if (isNaN(empId)) {
      const err = new Error('input must be a number');
      err.status = 400;
      console.error('err', err);
      next(err);
      return
    }


    mongo(async db => {
      // Find employee by empId, projecting only necessary fields.
      const employee = await db.collection('employees').findOne(
        { empId },
        { projection: { empId: 1, todo: 1, done: 1}}
      )

      console.log('employee', employee);

      // If employee not found, handle 404 error.
      if (!employee) {
        const err = new Error('Unable to find employee for empId' + empId);
        err.status = 404;
        console.error('err', err);
        next(err);
        return;
      }

      // Send the employee data in the response.
      res.send(employee);

    }, next)

  } catch (err) {
    // Handle any unexpected errors by logging them and passing them to the next middleware.
    console.error('err', err);
    next(err);
  }
})



/**
 * createTask
 * @swagger
 * /api/employees/{empId}/tasks:
 *   post:
 *     summary: Creates a task for employee
 *     description: Create a task for employee ID.
 *     parameters:
 *       - in: path
 *         name: empId
 *         required: true
 *         description: Employee ID
 *         schema:
 *           type: integer
 *     requestBody:
 *       description: Task information
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               text:
 *                 type: string
 *     responses:
 *       '201':
 *         description: Task created.
 *       '400':
 *         description: Bad request, invalid input.
 *       '404':
 *         description: Employee not found for the specified ID.
 *       '500':
 *         description: Internal server error.
 */


// Create task API
router.post('/:empId/tasks', (req, res, next) => {
  try {
    let { empId } = req.params // gets Id
    empId = parseInt(empId, 10);

    // empId validation
    if (isNaN(empId)) {
      const err = new Error('input must be a number');
      err.status = 400;
      console.error('err', err);
      next(err);
      return;
    }

    // req.body validation using Ajv.
    const { text } = req.body;
    const validator = ajv.compile(taskSchema);
    const isValid = validator({ text });

    // Checks if the task entry is valid.
    if (!isValid) {
      const err = new Error('Bad Request');
      err.status = 400;
      err.errors = validator.errors;
      console.error('err', err);
      next(err);
      return;
    }

    // Query database to find record.
    mongo(async db => {
      // Find the employee by empId.
      const employee = await db.collection('employees').findOne({ empId });

      // If employee doesn't exist, throw 404.
      if (!employee) {
        const err = new Error('Unable to find employee empId' + empId);
        err.status = 404;
        console.error('err', err);
        next(err);
        return;
      }

      // Create a new task with a unique ID.
      const task = {
        _id: new ObjectId(),
        text
      }

      // Update the employee's todo list with the new task.
      const result = await db.collection('employees').updateOne(
        { empId },
        { $push: { todo: task}}
      )

      // Check if the task creation was successful.
      if (!result.modifiedCount) {
        const err = new Error('Unable to create task for empId' + empId);
        err.status = 500;
        console.error('err', err);
        next(err);
        return;
      }

      // Send a success response with the task ID.
      res.status(201).send({ id: task._id })
    }, next)
  } catch (err) {
    // Handle any unexpected errors.
    console.error('err', err)
    next(err);
  }
})



/**
 * updateTask
 * @swagger
 * /api/employees/{empId}/tasks:
 *   put:
 *     summary: Update tasks for an employee
 *     description: Update task
 *     parameters:
 *       - in: path
 *         name: empId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Employee ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - todo
 *               - done
 *             properties:
 *               todo:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     text:
 *                       type: string
 *               done:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     text:
 *                       type: string
 *     responses:
 *       '204':
 *         description: Tasks updated successfully
 *       '400':
 *         description: Bad Request
 *       '404':
 *         description: Employee not found
 *       '500':
 *         description: Internal Server Error
 */

// Update tasks API
router.put('/:empId/tasks', (req, res, next) => {
  try {
    let { empId } = req.params; // Destructure 'empId' from request parameters.
    empId = parseInt(empId, 10); // Parse empId to ensure it is an integer
    console.log('empId', empId); // Log empId to the console

    // Check if 'empId' is not a valid number; if not,
    // generate a 400 error response and pass it to the error handler.
    if (isNaN(empId)) {
      const err = new Error('input must be a number');
      err.status = 400;
      console.error('err', err);
      next(err);
      return;
    }

    // Create a validator function based on the defined 'tasksSchema'.
    const validator = ajv.compile(tasksSchema);
    // Use the validator to check if the request body adheres to the specified schema.
    const isValid = validator(req.body);

    // Check if the request body is not valid according to the specified schema.
    if (!isValid) {
      const err = new Error('Bad Request');
      err.status = 400;
      err.errors = validator.errors;
      console.error('err', err);
      next(err);
      return; // return to exit the function
    }

    mongo(async db => {
      // Find the employee in the database based on 'empId'.
      const employee = await db.collection('employees').findOne({ empId });
      // if the employee is not found, generate a 404 error response.
      if (!employee) {
        const err = new Error('Unable to find employee with empId ' + empId);
        err.status = 404;
        console.error('err', err);
        next(err);
        return;
      }
      console.log(employee);

      console.log("EmpId", empId);
      console.log("toto", req.body.todo);
      console.log("done", req.body.done);
      // Update the employee's tasks in the database.
      const result = await db.collection('employees').updateOne(
        { empId },
        { $set: { todo: req.body.todo, done: req.body.done }}
      )

      // If the record was not updated, return a 500 status code.
      if (!result.modifiedCount) {
        const err = new Error('Unable to update tasks for empId ' + empId);
        err.status = 500;
        console.error('err', err);
        next(err);
        return;
      }

      // Send a success response with a 204 status code.
      res.status(204).send();
    }, next);
  } catch (err) {
    console.log('err', err);
    next(err);
  }
});


/**
  * deleteTask
  * @swagger
  * /api/employees/{empId}/tasks/{taskId}:
  *   delete:
  *     summary: Delete a task for an employee
  *     description: Delete Task
  *     parameters:
  *       - in: path
  *         name: empId
  *         required: true
  *         schema:
  *           type: integer
  *         description: Employee ID
  *       - in: path
  *         name: taskId
  *         required: true
  *         schema:
  *           type: string
  *         description: Task ID
  *     responses:
  *       '204':
  *         description: Task deleted successfully
  *       '400':
  *         description: Bad Request
  *       '404':
  *         description: Employee or task not found
  *       '500':
  *         description: Internal Server Error
  */

// Delete tasks API
router.delete('/:empId/tasks/:taskId', (req, res, next) => {
  try {
    // Destructure empId and TaskId from request parameters
    let { empId, taskId } = req.params;
    // Parse 'empId' to ensure it is an integer
    empId = parseInt(empId, 10);

    // If the 'empId' is not a valid number, generate a 404 error response
    // and pass it to the error handler.
    if (isNaN(empId)) {
      const err = new Error('input must be a number');
      err.status = 400;
      console.error('err', err);
      next(err);
      return;
    }

    mongo(async db => {
      // Find the employee by empId.
      let employee = await db.collection('employees').findOne({ empId });

      // If the employee is not found, generate a 404 error response.
      if (!employee) {
        const err = new Error('Unable to find employee with empId ' + empId);
        err.status = 404;
        console.err('err', err);
        next(err);
        return;
      }

      // Ensures that the 'todo' and 'done' arrays exist for the employee.
      if (!employee.todo) employee.todo = [];

      // Filter the 'todo' and 'done' arrays to remove the task with the specified taskId.
      const todo = employee.todo.filter(task => task._id.toString() !== taskId.toString());
      const done = employee.done.filter(task => task._id.toString() !== taskId.toString());

      // Update the 'todo' and 'done' fields for the employee with the specified 'empId'
      // in the MongoDB 'employees' collection.
      const result = await db.collection('employees').updateOne(
        { empId },
        { $set: { todo: todo, done: done }}
      )

      // Send a success response with a 204 status code.
      res.status(204).send();
    }, next);
  } catch (err) {
    console.error('err', err);
    next(err);
  }
});

// Export the router for use in other modules.
module.exports = router;