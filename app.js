"use strict";
var express = require("express");
var app = express();
var path = require("path");
var bodyParser = require("body-parser");
var morgan = require("morgan");
var handlebars = require("express-handlebars");
var session = require("express-session");
var config = require("./config");
var routes = require("./routes");
var flash = require("connect-flash");
var expressValidator = require("express-validator");

// set up the view engine and options for handlebars
app.set("views", path.join(__dirname, "views"));
app.engine("handlebars", handlebars({
  defaultLayout: "layout",
  min: true
}));
app.set("view engine", "handlebars");

// set up bodyParser and morgan middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(morgan("dev"));

// set static folders
app.use(express.static(path.join(__dirname, "public")));

// set up express-session (straight from documentation)
app.use(session({
  secret: config.mySecret, // used to sign the session ID cookie
  saveUninitialized: true, // forces a session to be saved to the store
  resave: true // forces the session to be saved back to the store
}));

// set up connect-flash
app.use(flash());

// set up global variables
app.use(function(req, res, next) {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.errors = req.flash("errors");
  next();
});

// set up express-validator
app.use(expressValidator({
  // define custom validators
  errorFormatter: function(param, msg, value) {
    var namespace = param.split("."),
        root = namespace.shift(),
        formParam = root;
    while(namespace.length) {
      formParam += "[" + namespace.shift() + "]";
    }
    return {
      param: formParam,
      msg: msg,
      value: value
    };
  }
}));

app.use("/", routes);
app.listen(config.port);
