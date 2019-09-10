/**
 *  @POST
 *  timer for count to ten (round 2) in 6 hr
 *  push message to line when time out
 *  
 * 
 * 
 *  body required
 *      line_id : string
 *   
 * 
 *  Created by CPU on 9/9/19
 */

const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const line = require('@line/bot-sdk');

const dataCollection = require("../models/dataModel");

router.post("/", (req, res, next) => {

    dataCollection.findOne({ line_id: req.body.line_id }, function (err, docs) {

        if (docs == null || docs == "") {
            res.json({
                status: 'error',
                message: 'line id is invalid',
            });
        }
        else {
            var countingLength = docs.counting.length;
            var week = Math.ceil(countingLength / 7);
            var day = countingLength % 7;
            var _did = (week.toString() + 'w' + day.toString() + 'd').toString();

            var d = new Date();         // for now
            var timestamp = Date.now(); // for now

            var hr = (7 + d.getHours()) % 24;
            var min = d.getMinutes();
            var sec = d.getSeconds();
            var endHr = (19 + d.getHours()) % 24;

            if (hr < 10) hr = '0' + hr;                // add string '0' in front of number 
            if (min < 10) min = '0' + min;
            if (sec < 10) sec = '0' + sec;

            // var date = d.getDay() + '/' + d.getMonth() + '/' + d.getFullYear();
            var date = new Date(Date.now());
            var time = hr.toString() + ':' + min.toString() + ':' + sec.toString();
            var end_time = endHr.toString() + ':' + min.toString() + ':' + min.toString();

            timerNewCount(_did, date, time, timestamp, end_time);
        }
    });

    function timerNewCount(_did, date, time, timestamp, end_time) {
        dataCollection.findOne({ line_id: req.body.line_id }, function (err, docs) {
            var countingLength = docs.counting.length;
            var latestCounting = countingLength - 1;
            var _did = docs.counting[latestCounting]._did;

            dataCollection.updateOne({ line_id: req.body.line_id, 'counting._did': _did }, {
                $set: {
                    timer_status: "running",
                    'counting.$.status': 'open',
                    'counting.$.time': time,
                    'counting.$.timestamp': timestamp,
                    'counting.$.ctt_amount': 0,
                }
            }, function (err, docs) {
                console.log(err)
                console.log('count CTT again');
                res.json({
                    status: 'success',
                    _did: _did,
                    date: date,
                    time: time,
                    timestamp: timestamp,
                    end_time: end_time
                });
            });
        });
    }

    
    // when 6 hr already
    setTimeout(function () {

        dataCollection.findOne({ line_id: req.body.line_id }, function (err, docs) {

            var countingLength = docs.counting.length;
            var latestCounting = countingLength - 1;
            var _did = docs.counting[latestCounting]._did;

            // check if user's count amount is 10, push message to line already
            if (docs.timer_status == 'timeout' && docs.counting[countingLength - 1].status == 'close') {
                console.log('set time out : you have been time out and close an array already')
            }
            else {
                dataCollection.updateOne({ line_id: req.body.line_id, 'counting._did': _did }, {
                    $set: {
                        timer_status: "timeout",
                        'counting.$.status': 'close'
                    }
                }, function (err, docs) {
                    console.log(err)
                });


                / push message to line */
                const client = new line.Client({
                    channelAccessToken: 'SCtu4U76N1oEXS3Ahq1EX9nBNkrtbKGdn8so1vbUZaBIXfTlxGqMldJ3Ego3GscxKGUB7MlfR3DHtTbg6hrYPGU9reSTBcCSiChuKmDCMx4FTtIPXzivaYUi3I6Yk1u/yF5k85Le0IUFrkBNxaETxFGUYhWQfeY8sLGRXgo3xvw='
                });
                const message = [
                    {
                        type: 'text',
                        text: 'ครบ 6 ชั่วโมงแล้วค่ะ'
                    },
                    {
                        type: 'text',
                        text: 'ลูกของคุณแม่ดิ้นไม่ครบ 10 ครั้งทั้งสองรอบ ❗ \nเพื่อความปลอดภัยของคุณแม่และลูกน้อย กรุณาติดต่อที่หมายเลข 📞1669 ค่ะ'
                    },
                ]
                client.pushMessage(req.body.line_id, message)
                    .then(() => {
                        console.log('push message done!')
                    })
                    .catch((err) => {
                        console.log(err);   // error when use fake line id 
                    });
                console.log('timer ctt round 2 time out!!')
            }
        });

    }, 30000);   // 43200000 = 12 hr , 21000 = 20 sec , 63000 = 1 min

});

module.exports = router;