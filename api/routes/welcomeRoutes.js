const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const dataCollection = require("../models/dataModel");

router.get("/", (req, res, next) => {

    res.json({
      message: 'Hello'
  })
});

module.exports = router;
