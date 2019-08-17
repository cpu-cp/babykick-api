/**
 *  POST : timer for count to ten in 12 hr 
 *   
 * 
 *  Created by CPU on 13/8/19
 */

/*
  body required
  line_id : string
  time: string
 */
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
// const line = require('@line/bot-sdk');

const dataCollection = require("../models/dataModel");

router.post("/", (req, res, next) => {

    id = new mongoose.Types.ObjectId()
    
    dataCollection.updateOne({ line_id: req.body.line_id }, {
        $set: {
            timer_status: "running",
        }
    }, function (err, docs) {
        console.log(err)
    });
    res.status(200).json({ success: true });


    // when 12 hr already
    setTimeout(function () {

        dataCollection.findOne({ line_id: req.body.line_id }, function (err, docs) {
            var countingLength = docs.counting.length;
            var latestCounting = countingLength - 1;
            var _did = docs.counting[latestCounting]._did;

            dataCollection.updateOne({ line_id: req.body.line_id, 'counting._did': _did}, {
                $set: {
                    timer_status: "time out",
                    'counting.$.status': 'close'
                }
            }, function (err, docs) {
                console.log(err)
            });
            
            // // push message to line
            // const client = new line.Client({
            //     channelAccessToken: 'oUYxZKfsKSZMBXokqW9RIKV50MYQ3KOrGFeqyPWjucgyOjO5LVGVaLkJnIeOLZbhZMcaDOsMvskqeJ6U5tBuCCf0Fdi5aCUSOkREPMQr4IJ0w77In6WCCpIqbTUsK2RbL/Ch2IUFQsnRdW3R6f7XCwdB04t89/1O/w1cDnyilFU='
            // });
    
            // const message = {
            //     type: 'text',
            //     text: 'ครบ 12 ชั่วโมง การนับลูกดิ้นแบบ Count to ten วันนี้สิ้นสุดแล้วค่ะ'
            // };
    
            // client.pushMessage(line_id, message)
            //     .then(() => {
            //         console.log('push message done!')
            //     })
            //     .catch((err) => {
            //         console.log(err);
            //     });

            console.log('20 sec!')
        });

    }, 21000);   // 43200000 = 12 hr

});

module.exports = router;