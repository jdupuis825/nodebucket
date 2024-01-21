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

/**
 * @swagger
 * /api/employees/{empId}:
 *   get:
 *     summary: Get an employee by ID
 *     description: Retrieves employee details by providing their ID.
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

  } catch (err) {
    console.error("Error: ", err);
    next(err);
  }
})

//exports
module.exports = router;