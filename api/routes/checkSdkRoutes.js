/**
 *  @POST
 *  check present time for use sdk
 *  04.00 - 10.00
 * 
 *  params require
 *      /check/sdk/<line_id>
 * 
 *  Created by CPU on 10/9/19
 */

const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const line = require('@line/bot-sdk');

const dataCollection = require('../models/dataModel');

router.post("/:lineId", (req, res, next) => {

    let today = new Date(Date.now());
    let todayTime = today.toLocaleTimeString('en-TH', { hour12: false });
    var sdk;

    console.log(todayTime)
    console.log(todayTime.slice(0, 2))

    switch (parseInt(todayTime.slice(0, 2))) {
        case 04:
            sdk = true;
            break;
        case 05:
            sdk = true;
            break;
        case 06:
            sdk = true;
            break;
        case 07:
            sdk = true;
            break;
        case 08:
            sdk = true;
            break;
        case 09:
            sdk = true;
            break;
    }

    if (sdk == true) {           // if request in 4.00-8.00
        res.json({
            sdk: true
        });
    }
    else {
        res.json({
            sdk: false
        });
    }

});

module.exports = router;


