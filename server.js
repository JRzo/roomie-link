const express = require("express");
const app = express();
const morgan = require("morgan");
const mongoose = require("mongoose");
const MongoClient = require("mongodb").MongoClient;
const passport = require("passport");
const cookieParser = require("cookie-parser");
const path = require('path');
const bodyParser = require("body-parser");
// To create a session middleware with the given options
const session = require("express-session");
let flash = require('flash')
const port = process.env.PORT || 5000;


let configDB = require("./config/database.js");
let db;

// Middleware
app.set('views', path.join(__dirname, 'views')); 
app.set("view engine", "ejs");
app.use(morgan("dev")); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.json()); // get information from html forms
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"))

mongoose.connect(configDB.url, (err, database) => {
    if (err) return console.log(err)
    db = database
    require("./app/routes.js")(app, passport, db);
  }); // connect to our database
  

require('./config/passport')(passport)

// require for passport

app.use(session({
    secret: "roommate",
    resave:true,
    saveUninitialized:true
}))

app.use(passport.initialize()); //persistent login sessions
app.use(passport.session()); // persistent login sessions
app.use(flash()); //use connect-flash for flash messages stored in session

app.listen(port);
console.log('The magic happens on port ' + port);
