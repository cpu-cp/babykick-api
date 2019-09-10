/**
 *  @POST
 *  timer for sadovsky, 3 meals
 *  push message to line when time out
 *  @trycatch
 *   
 *  body required
 *      line_id : string
 * 
 *  Created by CPU on 17/8/19
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

            var currentDay;
            var currentWeek;
            var _did = (week.toString() + 'w' + day.toString() + 'd').toString();

            var d = new Date(); // for now
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

            if (docs.timer_status == 'timeout' && docs.sdk_status == 'enable') {
                if (countingLength == 0) {                                  // if there isn't counting data before
                    try {
                        newDay('1', '1', date, time, timestamp, end_time);
                    } catch (e) {
                        console.log(e);
                    }
                }
                else {

                    if (docs.counting[countingLength - 1].status == 'close') {      // previos array is close, start new counting array
                        if (day == 0) {                             //start new week
                            currentWeek = (week + 1).toString();
                            try {
                                newDay(currentWeek, '1', date, time, timestamp, end_time);
                            } catch (e) {
                                console.log(e);
                            }
                        }
                        else {
                            currentDay = (day + 1).toString();      // start new day
                            try {
                                newDay(week.toString(), currentDay, date, time, timestamp, end_time);
                            } catch (e) {
                                console.log(e);
                            }
                        }
                    }
                    else if (docs.counting[countingLength - 1].status == '1st') {
                        try {
                            newMeal('2nd', _did, date, time, timestamp, end_time);
                        } catch (e) {
                            console.log(e);
                        }
                    }
                    else if (docs.counting[countingLength - 1].status == '2nd') {
                        try {
                            newMeal('3rd', _did, date, time, timestamp, end_time);
                        } catch (e) {
                            console.log(e);
                        }
                    }
                    else {
                        console.log(docs.counting[countingLength - 1].status);
                    }

                }
            }
            else {
                res.json({message: 'please wait, each meal have to done before'});
            }

        }
    });


    function newDay(currentWeek, currentDay, date, time, timestamp, end_time) {

        closeAutomatic();
        dataCollection.updateOne({ line_id: req.body.line_id }, {
            $set: {
                timer_status: "running",
            },
            $push: {
                counting: {
                    week: currentWeek,
                    day: currentDay,
                    _did: currentWeek + 'w' + currentDay + 'd',
                    date: date,
                    time: time,
                    timestamp: timestamp,
                    count_type: 'SDK',
                    sdk_first_meal: 0,
                    sdk_second_meal: 0,
                    sdk_third_meal: 0,
                    status: '1st'
                }
            }
        }, function (err, docs) {
            console.log(err)
            console.log('add new day successfully!');
            res.json({
                status: 'success',
                meal: '1st',
                date: date,
                time: time,
                timestamp: timestamp,
                end_time: end_time
            });
        });

        setTimeout(function () {
            dataCollection.findOne({ line_id: req.body.line_id }, function (err, docs) {
                var countingLength = docs.counting.length;
                var latestCounting = countingLength - 1;
                var _did = docs.counting[latestCounting]._did;

                // check if user's count amount is 10, push message to line already
                if (docs.counting[countingLength - 1].sdk_first_meal == 3) {   // amount = 3
                    console.log('set time out : you have been time out and close an array already')
                }
                else { // amount != 3, go to ctt
                    dataCollection.updateOne({ line_id: req.body.line_id }, {
                        $set: {
                            timer_status: "timeout",
                            sdk_status: "unenable"
                        },
                    }, function (err, docs) {
                        console.log(err)
                        console.log('1st meal time out! please go to ctt')
                    });

                    / push message to line */
                    const client = new line.Client({
                        channelAccessToken: 'SCtu4U76N1oEXS3Ahq1EX9nBNkrtbKGdn8so1vbUZaBIXfTlxGqMldJ3Ego3GscxKGUB7MlfR3DHtTbg6hrYPGU9reSTBcCSiChuKmDCMx4FTtIPXzivaYUi3I6Yk1u/yF5k85Le0IUFrkBNxaETxFGUYhWQfeY8sLGRXgo3xvw='
                    });
                    const message = [
                        {
                            type: 'text',
                            text: 'เช้านี้ครบ 1 ชั่วโมงแล้วค่ะ แต่ลูกของคุณแม่ดิ้นไม่ครบ 3 ครั้ง 😢'
                        },
                        {
                            type: 'text',
                            text: 'แนะนำให้คุณแม่กลับไปนวดลูกก่อน แล้วมาเริ่มนับใหม่โดยใช้แบบ \"Count to ten\" นะคะ'
                        },
                    ]
                    client.pushMessage(req.body.line_id, message)
                        .then(() => {
                            console.log('push message go to ctt done!')
                        })
                        .catch((err) => {
                            console.log(err);   // error when use fake line id 
                        });
                }
            });
        }, 20000); / <----------------------------------------- set time */
    }


    function newMeal(meal, _did, date, time, timestamp, end_time) {
        console.log('start sdk ' + meal);

        dataCollection.findOne({ line_id: req.body.line_id }, function (err, docs) {
            dataCollection.updateOne({ line_id: req.body.line_id, 'counting._did': _did }, {
                $set: {
                    timer_status: 'running',
                    'counting.$.status': meal
                }
            }, function (err, docs) {
                console.log(err);
                res.json({
                    status: 'success',
                    meal: meal,
                    date: date,
                    time: time,
                    timestamp: timestamp,
                    end_time: end_time
                });
            });
        });

        setTimeout(function () {
            if (meal == '2nd') {
                dataCollection.findOne({ line_id: req.body.line_id }, function (err, docs) {
                    var _dids = docs.counting[(docs.counting.length) - 1]._did;

                    if (docs.counting[(docs.counting.length) - 1].sdk_second_meal == 3) {   // amount = 3 already
                        console.log('set time out : you have been time out and close an array already')
                    }
                    else { // amount != 3, go to ctt
                        dataCollection.updateOne({ line_id: req.body.line_id }, {
                            $set: {
                                timer_status: "timeout",
                                sdk_status: "unenable",
                                extra: 'unenable',
                            },
                        }, function (err, docs) {
                            console.log(err)
                            console.log('2nd meal time out! please go to ctt')
                        });

                        / push message to line */
                        const client = new line.Client({
                            channelAccessToken: 'SCtu4U76N1oEXS3Ahq1EX9nBNkrtbKGdn8so1vbUZaBIXfTlxGqMldJ3Ego3GscxKGUB7MlfR3DHtTbg6hrYPGU9reSTBcCSiChuKmDCMx4FTtIPXzivaYUi3I6Yk1u/yF5k85Le0IUFrkBNxaETxFGUYhWQfeY8sLGRXgo3xvw='
                        });
                        const message = [
                            {
                                type: 'text',
                                text: 'เที่ยงนี้ครบ 1 ชั่วโมงแล้วค่ะ แต่ลูกของคุณแม่ดิ้นไม่ครบ 3 ครั้ง 😢'
                            },
                            {
                                type: 'text',
                                text: 'แนะนำให้คุณแม่กลับไปนวดลูกก่อน แล้วมาเริ่มนับใหม่โดยใช้แบบ \"Count to ten\" นะคะ'
                            },
                        ]
                        client.pushMessage(req.body.line_id, message)
                            .then(() => {
                                console.log('push message go to ctt done!')
                            })
                            .catch((err) => {
                                console.log(err);   // error when use fake line id 
                            });
                    }
                });
            }
            else {                  // else 3rd
                dataCollection.findOne({ line_id: req.body.line_id }, function (err, docs) {

                    if (docs.counting[(docs.counting.length) - 1].sdk_third_meal == 3) {   // amount = 3 already
                        console.log('set time out : you have been time out and close an array already')
                    }
                    else { // amount != 3, go to ctt
                        dataCollection.updateOne({ line_id: req.body.line_id }, {
                            $set: {
                                timer_status: "timeout",
                                sdk_status: "enable",
                                extra: 'enable'
                            },
                        }, function (err, docs) {
                            console.log(err)
                            console.log('3rd meal time out! please go to ctt')
                        });

                        / push message to line */
                        const client = new line.Client({
                            channelAccessToken: 'SCtu4U76N1oEXS3Ahq1EX9nBNkrtbKGdn8so1vbUZaBIXfTlxGqMldJ3Ego3GscxKGUB7MlfR3DHtTbg6hrYPGU9reSTBcCSiChuKmDCMx4FTtIPXzivaYUi3I6Yk1u/yF5k85Le0IUFrkBNxaETxFGUYhWQfeY8sLGRXgo3xvw='
                        });
                        const message = [
                            {
                                type: 'text',
                                text: 'เย็นนี้ครบ 1 ชั่วโมงแล้วค่ะ แต่ลูกของคุณแม่ดิ้นไม่ครบ 3 ครั้ง 😢'
                            },
                            {
                                type: 'text',
                                text: 'แนะนำให้คุณแม่กลับไปนวดลูกก่อน แล้วกลับมาลองนับแบบ Sadovsky ของมื้อเย็นใหม่อีกครั้งนะคะ'
                            },
                        ]
                        client.pushMessage(req.body.line_id, message)
                            .then(() => {
                                console.log('push message go to ctt done!')
                            })
                            .catch((err) => {
                                console.log(err);   // error when use fake line id 
                            });
                    }
                });
            }
        }, 20000); / <----------------------------------------- set time */
    }


    /* close daily counting every 18 hr */
    function closeAutomatic() {
        setTimeout(function () {
            dataCollection.findOne({ line_id: req.body.line_id }, function (err, docs) {
                var _did = docs.counting[(docs.counting.length) - 1]._did;

                dataCollection.updateOne({ line_id: req.body.line_id, 'counting._did': _did }, {
                    $set: {
                        timer_status: "timeout",
                        sdk_status: 'enable',
                        extra: 'unenable',
                        'counting.$.status': 'close'
                    }
                }, function (err, docs) {
                    console.log(err);
                    console.log('close automatic success');
                });
            });
        }, 500000); / <----------------------------------------- pls come back to set time to 18 hr */
    }

});

module.exports = router;