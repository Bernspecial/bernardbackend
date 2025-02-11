/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/
/* ***********************
 * Require Statements
 *************************/

const express = require("express");
const bodyParser = require("body-parser")
const env = require("dotenv").config();
const app = express();
const path = require('path');
const multer = require('multer');
const static = require("./routes/static");
const account = require('./routes/accountRoute');
const session = require("express-session")
const pool = require('./database/')
const inventoryRoute = require("./routes/inventoryRoute")
const errorRoute = require("./routes/errorRoute");
const baseController = require("./controllers/baseController")
const utilities = require("./utilities/index")
const expressLayouts = require("express-ejs-layouts");
const cookieParser = require("cookie-parser");
// const inventory = require("./routes/addClassification")


/* ***********************
 * Middleware
 * ************************/
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

app.use(session({
  store: new (require('connect-pg-simple')(session))({
    createTableIfMissing: true,
    pool,
  }),
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  name: 'sessionId',
}))

// this is the middleware to detect if the user is logged in or out.
app.use((req, res, next) => {
  res.locals.user = req.session.user || null; // Make user data available in views
  next(); // Call the next middleware or route handler
});


// Express Messages Middleware
app.use(require('connect-flash')())
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res)
  next()
})


// View Engine and Templates
app.set("view engine", "ejs");
app.use(expressLayouts);
app.set("layout", "./layouts/layout"); // not at views root

app.use(cookieParser())
app.use(utilities.checkJWTToken)



/* ***********************
 * Routes
 *************************/
app.use("/inv", inventoryRoute)
app.use(static);
app.use(errorRoute);

// Index route
// app.get("/", function (req, res) {
//   res.render("index", { title: "Home" })
// });

app.get("/", utilities.handleErrors(baseController.buildHome))

// Use the account routes
app.use('/account', account);
// app.use("/inventory", inventory);

// File Not Found Route - must be last route in list
app.use(async (req, res, next) => {
  next({ status: 404, message: 'Sorry, we appear to have lost that page.' })
})

/* ***********************
* Express Error Handler
* Place after all other middleware
*************************/
app.use(async (err, req, res, next) => {
  let nav = await utilities.getNav()
  console.error(`Error at: "${req.originalUrl}": ${err.message}`)
  if (err.status == 404) { message = err.message } else { message = 'Oh no! There was a crash. Maybe try a different route?' }
  res.render("errors/error", {
    title: err.status || 'Server Error',
    message,
    nav
  })
})



/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/
const port = process.env.PORT
const host = process.env.HOST

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`)
});
