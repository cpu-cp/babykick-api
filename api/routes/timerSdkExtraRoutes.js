/**
 *  @POST
 *  timer for sadovsky (round 2) in 1 hr
 *  push message to line when time out
 *  @trycatch
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

    dataCollection.findOne({ line_id: req.body.line_id })
        .exec()
        .then(docs => {

            if (docs == null || docs == "") {
                res.json({
                    status: 'error',
                    message: 'line id is invalid',
                });
            }
            else {
                if (docs.extra == 'enable') {

                    var currentDay;
                    var currentWeek;
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

                    if (countingLength == 0) {
                        try {
                            extraCount('1', '1', _did, date, time, timestamp, end_time);
                        } catch (e) {
                            console.log(e);
                        }
                    }
                    else {                                              // if there is counting data 
                        if (day == 0) {
                            currentWeek = (week + 1).toString();
                            try {
                                extraCount(currentWeek, '1', _did, date, time, timestamp, end_time);
                            } catch (e) {
                                console.log(e);
                            }
                        }
                        else {
                            currentDay = (day + 1).toString();
                            try {
                                extraCount(week.toString(), currentDay, _did, date, time, timestamp, end_time);
                            } catch (e) {
                                console.log(e);
                            }
                        }
                    }

                }
                else {
                    res.status(401).json({
                        message: 'now you can not use extra',
                        extra: false
                    });
                }
            }
        }).catch(err => {
            console.log(err)
            res.json({
                message: 'line id not found.',
            });
        });

    // set current array to new value
    function extraCount(currentWeek, currentDay, _did, date, time, timestamp, end_time) {
        dataCollection.findOne({ line_id: req.body.line_id }, function (err, docs) {
            dataCollection.updateOne({ line_id: req.body.line_id, 'counting._did': _did }, {
                $set: {
                    timer_status: "running",
                    count_type: 'sdk',
                }
            }, function (err, docs) {
                console.log(err)
                console.log('update sdk again');
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

        // when 1 hr already
        try {
            setTimeout(function () {
                dataCollection.findOne({ line_id: req.body.line_id }, function (err, docs) {

                    // check if user's count amount is 3, push message to line already
                    if (docs.timer_status == 'timeout' && docs.counting[(docs.counting.length) - 1].status == 'close') {
                        console.log('set time out : you have been time out and close an array already')
                    }
                    else {
                        dataCollection.updateOne({ line_id: req.body.line_id, 'counting._did': _did }, {
                            $set: {
                                timer_status: "timeout",
                                sdk_status: "disable",
                                extra: "disable",
                                count_type: 'any',
                                'counting.$.status': "close",
                                'counting.$.result': "มีความเสี่ยง",
                            }
                        }, function (err, docs) {
                            console.log(err)
                            console.log('whyyyyy')
                        });

                        / push message to line */
                        const client = new line.Client({
                            channelAccessToken: 'SCtu4U76N1oEXS3Ahq1EX9nBNkrtbKGdn8so1vbUZaBIXfTlxGqMldJ3Ego3GscxKGUB7MlfR3DHtTbg6hrYPGU9reSTBcCSiChuKmDCMx4FTtIPXzivaYUi3I6Yk1u/yF5k85Le0IUFrkBNxaETxFGUYhWQfeY8sLGRXgo3xvw='
                        });
                        const message = [
                            {
                                type: 'text',
                                text: 'ครบ 1 ชั่วโมงแล้วค่ะ แต่ลูกของคุณแม่ดิ้นไม่ครบ 3 ครั้ง'
                            },
                            {
                                type: 'text',
                                text: 'เพื่อความปลอดภัยของคุณแม่และลูกน้อย กรุณาติดต่อที่หมายเลข 📞1669 ค่ะ'
                            },
                            {
                                type: "sticker",
                                packageId: 3,
                                stickerId: 184
                            }
                        ]
                        client.pushMessage(req.body.line_id, message)
                            .then(() => {
                                console.log('push message done!')
                            })
                            .catch((err) => {
                                console.log(err);   // error when use fake line id 
                            });
                    }
                });
            }, 60000);   // 43200000 = 12 hr , 21000 = 20 sec , 63000 = 1 min

        } catch (e) {
            console.log(e);
        }
    }

});

module.exports = router;
