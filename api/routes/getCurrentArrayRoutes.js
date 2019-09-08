/**
 *  @POST
 *  show current array
 *
 *  Created by CPU on 9/9/19
 */

const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const dataCollection = require("../models/dataModel");

router.post("/", (req, res, next) => {
  dataCollection.findOne({ line_id: req.body.line_id })
    .exec()
    .then(docs => {
      console.log(docs.counting[(docs.counting.length) - 1]);
      res.status(200).json(docs.counting[(docs.counting.length) - 1]);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
});

module.exports = router;
