/**
 *  @POST
 *  timer for count to ten in 12 hr
 *  push message to line when time out
 * 
 * 
 *  body required
 *      line_id : string
 *      time: string
 *   
 * 
 *  Created by CPU on 13/8/19
 */

const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const line = require('@line/bot-sdk');

const dataCollection = require("../models/dataModel");

router.post("/", (req, res, next) => {

    dataCollection.updateOne({ line_id: req.body.line_id }, {
        $set: {
            timer_status: "running",
        },

    }, function (err, docs) {
        console.log(err)
    });
    res.status(200).json({ success: 'start timer' });

    console.log('timer is running');


    // when 12 hr already
    setTimeout(function () {

        dataCollection.findOne({ line_id: req.body.line_id }, function (err, docs) {

            var countingLength = docs.counting.length;
            var latestCounting = countingLength - 1;
            var _did = docs.counting[latestCounting]._did;

            dataCollection.updateOne({ line_id: req.body.line_id, 'counting._did': _did }, {
                $set: {
                    timer_status: "timeout",
                    'counting.$.status': 'close'
                }
            }, function (err, docs) {
                console.log(err)
            });

            // push message to line
            const client = new line.Client({
                channelAccessToken: 'SCtu4U76N1oEXS3Ahq1EX9nBNkrtbKGdn8so1vbUZaBIXfTlxGqMldJ3Ego3GscxKGUB7MlfR3DHtTbg6hrYPGU9reSTBcCSiChuKmDCMx4FTtIPXzivaYUi3I6Yk1u/yF5k85Le0IUFrkBNxaETxFGUYhWQfeY8sLGRXgo3xvw='
            });

            const message = {
                type: 'text',
                text: 'ครบ 12 ชั่วโมงแล้วค่ะ การนับลูกดิ้นแบบ Count to ten วันนี้สิ้นสุดแล้ว แวะมานับใหม่วันพรุ่งนี้นะคะ'
            };

            client.pushMessage(req.body.line_id, message)
                .then(() => {
                    console.log('push message done!')
                })
                .catch((err) => {
                    console.log(err);   // error when use fake line id 
                });

            console.log('1 min ==> time out!!')
        });

    }, 3000);   // 43200000 = 12 hr , 21000 = 20 sec , 63000 = 1 min

});

module.exports = router;