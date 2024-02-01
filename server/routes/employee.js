/**
 * Title: employee.js
 * Author: Jocelyn Dupuis
 * Date: 1/18/2024
 * Description: Route handling
 */

//test API with url: [::1]:3000/api/employees/1007
"use strict";

//imports express framework and creates a router
const express = require("express");
const router = express.Router();

//imports mongo function
const { mongo } = require("../utils/mongo");
const Ajv = require('ajv'); //Another JavaScript Validator
const { ObjectId } = require('mongodb');

const ajv = new Ajv();

//ajv schema validation
//defined task schema with valid properties
const taskSchema = {
  type: 'object',
  properties: {
    text: { type: 'string'}
  },
  required: ['text'],
  additionalProperties: false
}

//task schema for validation
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
          _id: { type: 'string'},
          text: { type: 'string'}
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
 *     summary: Find employee by ID
 *     description: Finds employee details by providing their ID
 *     parameters:
 *       - in: path
 *         name: empId
 *         required: true
 *         description: Employee ID
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: Successful response with the employee ID.
 *       '400':
 *         description: Bad request, invalid employee ID.
 *       '404':
 *         description: Employee not found.
 *       '500':
 *         description: Internal server error.
 */


//route for handling GET requests
router.get("/:empId", (req, res, next) => {
  try {
    let { empId } = req.params;
    empId = parseInt(empId, 10);

    if (isNaN(empId)) {
      const err = new Error("Employee ID must be a number.");
      err.status = 400;
      console.log("err", err);
      next(err);
      return; // exit out of the if statement
    }

    mongo(async db => {
      const employee = await db.collection("employees").findOne({empId}); //findOne returns a single document

      if (!employee) {
        const err = new Error("Unable to find employee with empId " + empId);
        err.status = 404;
        console.log("err", err);
        next(err);
        return; // exit out ot the if statement
      }
      //if no errors sends JSON to client
      res.send(employee); //send the employee record as a JSON response object
    });

    //catches all other errors
  } catch (err) {
    console.error("Error: ", err);
    next(err);
  }
})

/**
 * findAllTasks
 * @swagger
 * /api/employees/{empId}/tasks:
 *   get:
 *     summary: Finds all tasks with employee ID
 *     description: Retrieves tasks with employee ID
 *     parameters:
 *       - in: path
 *         name: empId
 *         required: true
 *         description: Employee ID
 *         schema:
 *           type: integer
 *       - in: path
 *         name: tasks
 *         required: true
 *         description: tasks
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Successful response with the employee data.
 *       '400':
 *         description: Bad request.
 *       '404':
 *         description: Task not found.
 *       '500':
 *         description: Internal server error.
 */


//find all tasks API and empId
router.get('/:empId/tasks', (req, res, next) => {
  try {
    let { empId } = req.params;
    empId = parseInt(empId, 10); //parse the empId to an integer

    if (isNaN(empId)) {
      const err = new Error('input must be a number');
      err.status = 400;
      console.error("err", err);
      next(err);
      return;
    }

    mongo(async db => {
      //pulling task for employee
      const tasks = await db.collection('employees').findOne(
        { empId },
        { projection: { empId: 1, todo: 1, done: 1}}
      )

      console.log('tasks', tasks);

      //checks to see if error
      if (!tasks) {
        const err = new Error('Unable to find task with empId ' + empId);
        err.status = 404;
        console.error("err", err);
        next(err);
        return;
      }
      //if no error sends tasks
      res.send(tasks);

    }, next)

  } catch (err) {
    console.error("err", err);
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
 *         description: Bad request.
 *       '404':
 *         description: Task not found.
 *       '500':
 *         description: Internal server error.
 */


//create task API
router.post('/:empId/tasks', (req, res, next) => {
  try {
    console.log(req.params)
    let { empId } = req.params;
    empId = parseInt(empId, 10);

    //validate if it is a number
    if (isNaN(empId)) {
      const err = new Error('Input must be a number');
      err.status = 400;
      console.error("err", err);
      next(err);
      return;
    }

    //req.body validation
    const { text } = req.body;
    const validator = ajv.compile(taskSchema)
    const isValid = validator({ text })

    //if body isn't valid
    if (!isValid) {
      const err = new Error('Bad request');
      err.status = 400;
      err.errors = validator.errors;
      console.error('err', err);
      next(err);
      return;
    }

    //mongo access to create task
    mongo(async db => {
      const employee = await db.collection('employees').findOne({ empId });

      if (!employee) {
        const err = new Error('Unable to find employee with empId ' + empId);
        err.status = 404;
        console.error('err', err);
        next(err);
        return;
      }

      const task = {
        _id: new ObjectId(),
        text
      }

      const result = await db.collection('employees').updateOne(
        { empId },
        { $push: { todo: task }}
      )

      if (!result.modifiedCount) {
        const err = new Error('Unable to create task for empId ' + empId);
        err.status = 500;
        console.error("err", err);
        next(err);
        return;
      }

      //record created with new task response
      res.status(201).send({ id: task._id });
    }, next)

    //catch any other errors thrown
  } catch (err) {
    console.error('err', err)
    next(err);
  }
})


/**
 * updateTask
 * @swagger
 * /api/employees/{empId}/tasks:
 *   put:
 *     summary: Updates task for employee
 *     description: Updates tasks with valid employee ID
 *     parameters:
 *       - in: path
 *         name: empId
 *         required: true
 *         description: Employee ID
 *         schema:
 *           type: integer
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
 *                      _id:
 *                        type: string
 *                      text:
 *                        type: string
 *     responses:
 *       '204':
 *         description: Task updated successfully.
 *       '400':
 *         description: Bad request.
 *       '404':
 *         description: Unable to update task for empId.
 *       '500':
 *         description: Internal server error.
 */

//updates task api
router.put('/:empId,tasks', (req, res, next) => {
  try {
    let { empId } = req.params;
    empId = parseInt(empId, 10);
    console.log('empId', empId);

    //empId validation
    if (isNaN(empId)) {
      const err = new Error('input must be a number');
      err.status = 400;
      console.error('err', err);
      next(err);
      return;
    }

    const validator = ajv.compile(tasksSchema);
    const isValid = validator(req.body); //validates the request body

    //req.body validation
    if (!isValid) {
      const err = new Error('Bad request');
      err.status = 400;
      err.errors = validator.errors;
      console.error('err', err);
      next(err);
      return; //return to exit the function
    }
    //mongo access to update task
    mongo(async db => {
      const employee = await db.collection('employees').findOne({ empId });

      //if the employee is not found
      if (!employee) {
        const err = new Error('Unable to find employee with empId ' + empId);
        err.status = 404;
        console.error('err', err);
        next(err);
        return;
      }

      //if valid will update the record
      const result = await db.collection('employees').updateOne(
        { empId },
        { $set: { todo: req.body.todo, done: req.body.done }}
      )

      //if the record was not updated will return a 500 status code
      if (!result.modifiedCount) {
        const err = new Error('Unable to update tasks for empId ' + empId);
        err.status = 500;
        console.error('err', err);
        next(err);
        return;
      }

      res.status(204).send();
    }, next);

    //catch all other errors
  } catch (err) {
    console.error('err', err);
    next(err);
  }
});


/**
 * deleteTask
 * @swagger
 * /api/employees/{empId}/tasks/{taskId}:
 *   delete:
 *     summary: Deletes task
 *     description: Deletes tasks from valid logged employee ID
 *     parameters:
 *       - in: path
 *         name: empId
 *         required: true
 *         description: Employee ID
 *         schema:
 *           type: integer
 *       - in: path
 *         name: taskId
 *         required: true
 *         description: Task ID
 *         schema:
 *           type: string
 *     responses:
 *       '204':
 *         description: Task deleted successfully.
 *       '400':
 *         description: Bad request.
 *       '404':
 *         description: Unable to find employee with empId or task with taskId.
 *       '500':
 *         description: Internal server error.
 */

//delete task API
router.delete('/:empId/tasks/:taskId', (req, res, next) => {
  try {
    let { empId, taskId } = req.params;
    empId = parseInt(empId, 10);

    //empId validation
    if (isNaN(empId)) {
      const err = new Error('Input must be a number');
      err.status = 400;
      console.error('err', err);
      next(err);
      return;
    }

    //mongo access to delete task
    mongo(async db => {
      let employee = await db.collection('employees').findOne({ empId });

      //if the employee is not found
      if (!employee) {
        const err = new Error('Unable to find employee with empId ' + empId);
        err.status = 404;
        console.error('err', err);
        next(err);
        return;
      }

      //if employee does not have a todo array create one
      if (!employee.todo) employee.todo = [];
      //if employee does not have a done array create one
      if (!employee.done) employee.done = [];

      //filters the todo array
      const todo = employee.todo.filter(task => task._id.toString() !== taskId.toString());
      //filters the done array
      const done = employee.done.filter(task => task._id.toString() !== taskId.toString());

      //updates the employee record with the new todo and done arrays
      const result = await db.collection('employees').updateOne(
        { empId },
        { $set: { todo: todo, done: done}}
      )

      res.status(204).send();
    }, next);
  } catch (err) {
    console.error('err', err);
    next(err);
  }
});

//exports
module.exports = router;