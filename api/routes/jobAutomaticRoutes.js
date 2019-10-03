/**
 *  @POST
 *  execute job automatic
 *
 * 
 *  Created by CPU on 22/9/19
 */

const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const line = require('@line/bot-sdk');
const cron = require('node-cron');

router.post("/", (req, res, next) => {

    cron.schedule('*/5 * * * *', () => {
        console.log('******** Runing a job  every 5 minutes at Asia/Bangkok timezone ********');
    }, {
            scheduled: true,
            timezone: "Asia/Bangkok"
        });

    res.status(200).json({
        status: 200,
        message: 'successful'
    })

});

module.exports = router;


