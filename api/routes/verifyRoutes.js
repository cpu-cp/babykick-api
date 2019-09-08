/**
 *  @POST
 *  check if line account is exists
 * 
 *  body require
 *      line_id: string
 * 
 *  Created by CPU on 24/6/19
 */

const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const dataCollection = require('../models/dataModel');

router.post("/", (req, res, next) => {

    dataCollection.find({ line_id: req.body.line_id }, function (err, docs) {

        if (docs == "") {
            console.log('can create new account!');
            res.status(200).send('true');
        }
        else {
            res.status(401).send('false');          // that account is exists return false string
        }

    });

});

module.exports = router;