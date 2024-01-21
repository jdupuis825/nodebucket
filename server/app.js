/**
 * Title: employee.js
 * Author: Jocelyn Dupuis
 * Date: 1/18/2024
 * Description: Route handling
 */

//require statements
const express = require('express')
const createServer = require('http-errors')
const path = require('path')
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const employeeRoute = require("./routes/employee");

//title and version number
const options = {
  definition: {
      openapi: "3.0.0",
      info: {
          title: "Nodebucket API",
          version: "1.0.0",
      },
  },
  //set API to the routes folder
  apis: ['server/routes/*.js'],
};

//openapi specifications variable using swaggerJsdoc
const openapiSpecification = swaggerJsdoc(options);

// Creates express app
const app = express()

//wires openapiSpecification to the app
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapiSpecification));


//configures app
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, '../dist/nodebucket')))
app.use('/', express.static(path.join(__dirname, '../dist/nodebucket')))

app.use("/api/employees", employeeRoute)

//error handler: 404 errors
app.use(function(req, res, next) {
  next(createServer(404)) // forward to error handler
})

//error handler: all other errors
app.use(function(err, req, res, next) {
  res.status(err.status || 500) // set response status code

  //sends response to client in JSON format with a message and stack trace
  res.json({
    type: 'error',
    status: err.status,
    message: err.message,
    stack: req.app.get('env') === 'development' ? err.stack : undefined
  })
})

//exports the Express application
module.exports = app