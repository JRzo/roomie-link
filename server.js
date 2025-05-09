const express = require("express");
const app = express();
const logger = require("morgan");
const mongoose = require("mongoose");

const methodOverride = require('method-override');
const MongoClient = require("mongodb").MongoClient;
const passport = require("passport");
const cookieParser = require("cookie-parser");
const path = require('path');
const bodyParser = require("body-parser");

// To create a session middleware with the given options
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);
const connectDB = require("./config/database.js");
// is a database tool that loads data from either a binary databaase dump created by mongodumb or the standard input into a mongoDB instance
let flash = require('flash')
const port = process.env.PORT || 5000;


// Routes for it
const mainRoutes = require("./routes/main");
const postRoutes = require('./routes/posts');
const userRoutes = require('./routes/users.js')

// Use the .env file in config folder
require("dotenv").config({path: './config/.env'})
require('./config/passport')(passport)

connectDB();

// Middleware
app.set('views', path.join(__dirname, 'views')); 
app.set("view engine", "ejs");
// Body parsering
app.use(bodyParser.json()); // get information from html forms
app.use(bodyParser.urlencoded({ extended: true }));
// Static Folder
app.use(express.static("public"))

// Logging
app.use(logger('dev')) // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)

// To Override the methods
app.use(methodOverride(function (req, res) {
  if (req.body && typeof req.body === 'object' && '_method' in req.body) {
    // look in urlencoded POST bodies and delete it
    var method = req.body._method
    delete req.body._method
    return method
  }
}))


// require for passport

app.use(
  session({
    secret: "roommate",
    resave:false,
    saveUninitialized: false,
    store: new MongoStore({mongooseConnection: mongoose.connection})
}))

// Passport Middle ware
app.use(passport.initialize()); //persistent login sessions
app.use(passport.session()); // persistent login sessions
app.use(flash()); //use connect-flash for flash messages stored in session
// Setting up the routes
app.use('/', mainRoutes);
app.use('/post', postRoutes);
app.use('/d', userRoutes)

app.listen(port, () =>{
  console.log('The magic happens on port ' + port);
});
