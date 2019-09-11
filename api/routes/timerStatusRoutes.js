/**
 *  @GET
 *  send timer status
 *  completed
 * 
 *
 *  body required
 *     line_id: string
 *   
 * 
 *  Created by CPU on 1/9/19.
 */

const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const dataCollection = require('../models/dataModel');

router.post("/", (req, res, next) => {

    var lineId = req.body.line_id;

    //check input 
    if (lineId == null || lineId == "") {
        res.json({
            status: 'error',
            message: 'please enter line id'
        });
        return null;
    }

    //send response
    dataCollection.findOne({ line_id: req.body.line_id })
        .exec()
        .then(docs => {
            res.json({
                timer_status: docs.timer_status,
                sdk_status: docs.sdk_status,
                extra: docs.extra,
            });
        }).catch(err => {
            console.log(err)
            res.json({
                message: 'line id not found.',
            });
        });
});

module.exports = router;

// return Promise.reject(err);
