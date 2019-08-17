const express = require("express");
const app = express();
const morgan = require("morgan");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

// define path of each routes
const registerRoutes = require("./api/routes/registerRoutes");
const timerCounttotenRoutes = require("./api/routes/timerCountotenRoutes");
const counttotenRoutes = require("./api/routes/countotenRoutes");
const cttRountes = require("./api/routes/cttRoutes");

// connect to mongoDB
// username is chompusama and password is digio
mongoose.connect(
  "mongodb+srv://chompusama:digio@wallet-nfc-elwkn.mongodb.net/babykick?retryWrites=true&w=majority",
  function(err) {
        if(err) throw err;
        console.log('Connect to MongoDB successful!')
    }
);

app.use(morgan("dev"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
    return res.status(200).json({});
  }
  next();
});

// makes 'uploads' folder to public
// app.use(express.static('uploads'))

// Routes which should handle requests
app.use("/register", registerRoutes);
app.use("/counttoten", counttotenRoutes);
app.use("/timer/counttoten", timerCounttotenRoutes);
app.use("/v2/counttoten", cttRountes);

app.use((req, res, next) => {
  const error = new Error("Not found");
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message
    }
  });
});


module.exports = app;