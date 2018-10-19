"use strict";

require('dotenv').config();

const PORT        = process.env.PORT || 8080;
const ENV         = process.env.ENV || "development";
const express     = require("express");
const bodyParser  = require("body-parser");
const sass        = require("node-sass-middleware");
const app         = express();

const knexConfig  = require("./knexfile");
const knex        = require("knex")(knexConfig[ENV]);
const morgan      = require('morgan');
const knexLogger  = require('knex-logger');

const cookieSession = require('cookie-session');
const methodOverride = require('method-override');


// Seperated Routes for each Resource
const pollsRoutes = require("./routes/pollsRoutes.js");

// Load the logger first so all (static) HTTP requests are logged to STDOUT
// 'dev' = Concise output colored by response status for development use.
//         The :status token will be colored red for server error codes, yellow for client error codes, cyan for redirection codes, and uncolored for all other codes.
app.use(morgan('dev'));

// Enables encrypted cookies
app.use(cookieSession({
  name: 'session',
  keys: ['keydonut', 'keyeclair'],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

// Allows use of put and delete methods
app.use(methodOverride('_method'));

// Log knex SQL queries to STDOUT as well
app.use(knexLogger(knex));

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/styles", sass({
  src: __dirname + "/styles",
  dest: __dirname + "/public/styles",
  debug: true,
  outputStyle: 'expanded'
}));
app.use(express.static("public"));

// Mount all resource routes
app.use("/polls", pollsRoutes(knex));

// Home page
app.get("/", (req, res) => {
  res.render("index");
});

// Endpoint for thank you page
app.get("/thanks", (req, res) => {
  let templateVars = {pollID : req.body.pollID, creator_name : req.body.creator_name}
  res.render("thank_you", templateVars);
});

// Endpoint for error page
app.get("/error", (req, res) => {
  res.render("error");
});

//The catch-all 404 Route
app.get('*', function(req, res){
  let templateVars = {  errorCode: 404, errorMessage: "The page you're looking for does not exist!" }
  res.render('error', templateVars);
});

app.listen(PORT, () => {
  console.log("Example app listening on port " + PORT);
});
