/**
 *  GET
 *  show all data
 *
 *  Created by CPU on 23/8/19
 */

const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const dataCollection = require("../models/dataModel");

router.get("/", (req, res, next) => {
  dataCollection.find()
    .exec()
    .then(docs => {
      console.log(docs);
      res.status(200).json(docs);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
});

module.exports = router;
