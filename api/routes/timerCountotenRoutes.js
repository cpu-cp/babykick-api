/**
 *  @POST
 *  timer for count to ten in 12 hr
 *  push message to line when time out
 *  create new array
 * 
 * 
 *  body required
 *      line_id : string
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

    function ISO8601_week_no(dt) {
        var tdt = new Date(dt.valueOf());
        var dayn = (dt.getDay() + 6) % 7;
        tdt.setDate(tdt.getDate() - dayn + 3);
        var firstThursday = tdt.valueOf();
        tdt.setMonth(0, 1);
        if (tdt.getDay() !== 4) {
            tdt.setMonth(0, 1 + ((4 - tdt.getDay()) + 7) % 7);
        }
        return 1 + Math.ceil((firstThursday - tdt) / 604800000);
    }

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

                var countingLength = docs.counting.length;
                var week = Math.ceil(countingLength / 7);
                var day = countingLength % 7;

                var currentDay;
                var currentWeek;
                var _did = (week.toString() + 'w' + day.toString() + 'd').toString();
                var timestamp = Date.now(); // for now

                var date = new Date(Date.now());
                let time = date.toLocaleTimeString('en-TH', { hour12: false });
                var end_time = 'null'

                Date.prototype.getWeek = function () {
                    var dt = new Date(this.getFullYear(), 0, 1);
                    return Math.ceil((((this - dt) / 86400000) + dt.getDay() + 1) / 7);
                };
                // var week_by_date = date.getWeek();
                var week_by_date = ISO8601_week_no(date);

                / check if user re-counting. a _did would not change */
                if (docs.extra == 'ctt') {
                    // remove previous array
                    var _dids = docs.counting[(docs.counting.length) - 1]._did;

                    dataCollection.updateOne({ line_id: req.body.line_id, /*'counting._did': _dids */ }, {
                        $set: {
                            extra: "disable",   //change ctt to disable
                        },
                        $pull: {
                            counting: {
                                _did: _dids
                            }
                        }
                    }, function (err, docs) {
                        console.log(err)
                        console.log(req.body.line_id + ' timeCttRoutes : remove array');
                    });

                    currentWeek = week.toString();
                    currentDay = day.toString();
                }
                else {
                    currentWeek = (week + 1).toString();        // if normal counting, _did will change
                    currentDay = (day + 1).toString();
                }


                / create new array */
                if (countingLength == 0) {                          // if there isn't counting data before
                    firstDay('1', '1', date, time, timestamp, end_time, week_by_date);
                    timer();
                }
                else {                                              // if there is counting data 
                    if (day == 0) {
                        newDay(currentWeek, '1', date, time, timestamp, end_time, week_by_date);
                        timer();
                    }
                    else {
                        newDay(week.toString(), currentDay, date, time, timestamp, end_time, week_by_date);
                        timer();
                    }
                }
            }

        }).catch(err => {
            console.log(err)
            res.json({
                message: 'line id not found.',
            });
        });


    function firstDay(currentWeek, currentDay, date, time, timestamp, end_time, week_by_date) {
        dataCollection.updateOne({ line_id: req.body.line_id }, {
            $set: {
                count_type: 'ctt',
                sdk_status: 'disable'
            },
            $push: {
                counting: {
                    week_by_date: week_by_date,
                    week: currentWeek,
                    day: currentDay,
                    _did: currentWeek + 'w' + currentDay + 'd',
                    date: date,
                    time: time,
                    timestamp: timestamp,
                    count_type: 'CTT',
                    ctt_amount: 0,
                    result: 'มีความเสี่ยง',
                    status: 'open'
                }
            }
        }, function (err, docs) {
            console.log(err)
            console.log(req.body.line_id + ' timeCttRoutes : add first day successful!');
            res.json({
                status: 'success',
                date: date,
                time: time,
                timestamp: timestamp,
                end_time: end_time
            });
        });
    }


    function newDay(currentWeek, currentDay, date, time, timestamp, end_time, week_by_date) {
        dataCollection.updateOne({ line_id: req.body.line_id }, {
            $set: {
                count_type: 'ctt',
                sdk_status: 'disable'
            },
            $push: {
                counting: {
                    week_by_date: week_by_date,
                    week: currentWeek,
                    day: currentDay,
                    _did: currentWeek + 'w' + currentDay + 'd',
                    date: date,
                    time: time,
                    timestamp: timestamp,
                    count_type: 'CTT',
                    ctt_amount: 0,
                    status: 'open'
                }
            }
        }, function (err, docs) {
            console.log(err)
            console.log(req.body.line_id + ' timeCttRoutes : add new day successful!');
            res.json({
                status: 'success',
                date: date,
                time: time,
                timestamp: timestamp,
                end_time: end_time
            });
        });
    }


    function timer() {
        dataCollection.updateOne({ line_id: req.body.line_id }, {
            $set: {
                timer_status: "running",
            },

        }, function (err, docs) {
            console.log(err)
        });
        // res.status(200).json({ success: 'start timer' });

        // console.log('timer is running');


        // when 6 hr already
        setTimeout(function () {
            dataCollection.findOne({ line_id: req.body.line_id })
                .exec()
                .then(docs => {
                    var countingLength = docs.counting.length;
                    var latestCounting = countingLength - 1;
                    var _did = docs.counting[latestCounting]._did;

                    // check if user's count amount is 10, push message to line already
                    if (docs.timer_status == 'timeout' && docs.counting[countingLength - 1].status == 'close') {
                        console.log(req.body.line_id + ' timeCttRoutes : set time out : you have been time out and close an array already')
                    }
                    else if (docs.timer_status == 'running' && docs.counting[countingLength - 1].status == 'open') {
                        / push message to line */
                        const client = new line.Client({
                            channelAccessToken: 'SCtu4U76N1oEXS3Ahq1EX9nBNkrtbKGdn8so1vbUZaBIXfTlxGqMldJ3Ego3GscxKGUB7MlfR3DHtTbg6hrYPGU9reSTBcCSiChuKmDCMx4FTtIPXzivaYUi3I6Yk1u/yF5k85Le0IUFrkBNxaETxFGUYhWQfeY8sLGRXgo3xvw='
                        });
                        const message = [
                            {
                                type: 'text',
                                text: '6 ชั่วโมงแล้วนะคะ มากระตุ้นปลุกลูกให้ดิ้นกันเถอะค่ะคุณแม่'
                            },
                            {
                                type: 'text',
                                text: '✳️ วิธีกระตุ้นปลุกลูก 👶🏻😀 \n\t📍ขยับตัว เปลี่ยนท่าทาง 🚶‍♀️ \n\t📍รับประทานอาหารว่างหรือดื่มน้ำเย็น แล้วรอสัก 2 – 3 นาที 🍉🍍 \n\t📍นวดเบาๆ หรือลูบท้อง 🤰🏻 \n\t📍ใช้ไฟฉายส่องที่หน้าท้อง🔦'
                            },
                        ]
                        client.pushMessage(req.body.line_id, message)
                            .then(() => {
                                console.log(req.body.line_id + ' timeCttRoutes : push 6hr message done!')
                            })
                            .catch((err) => {
                                console.log(err);   // error when use fake line id 
                            });
                    }
                }).catch(err => {
                    console.log(err)
                    res.status(200).json({
                        account: false,
                        message: 'line id not found.',
                    });
                });

            setTimeout(function () {
                dataCollection.findOne({ line_id: req.body.line_id })
                    .exec()
                    .then(docs => {
                        var countingLength = docs.counting.length;
                        var latestCounting = countingLength - 1;
                        var _did = docs.counting[latestCounting]._did;

                        // check if user's count amount is 10, push message to line already
                        if (docs.timer_status == 'timeout' && docs.counting[countingLength - 1].status == 'close') {
                            console.log(req.body.line_id + ' timeCttRoutes : set time out : you have been time out and close an array already')
                        }
                        else if (docs.timer_status == 'running' && docs.counting[countingLength - 1].status == 'open') {
                            dataCollection.updateOne({ line_id: req.body.line_id, 'counting._did': _did }, {
                                $set: {
                                    timer_status: "timeout",
                                    sdk_status: 'enable',
                                    count_type: 'any',
                                    'counting.$.status': 'close',
                                    'counting.$.result': 'มีความเสี่ยง'
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
                                    text: '⚠ วันนี้คุณแม่นับลูกดิ้นครบ 12 ชั่วโมงแล้ว แต่ลูกน้อยยังดิ้นไม่ถึง 10 ครั้งเลย ▶ ซึ่งถือเป็นสัญญาณที่บ่งบอกว่าลูกน้อยมีภาวะสุขภาพไม่ดี '
                                }, {
                                    type: 'text',
                                    text: '❗ คุณแม่ควรรีบไปโรงพยาบาลโดยเร็วที่สุด เพื่อให้แพทย์ตรวจเช็คสุขภาพของลูกน้อยในครรภ์ หรือโทร 1669 ❗'
                                },
                                {
                                    type: "flex",
                                    altText: "สายด่วน 1669",
                                    contents: {
                                        type: "bubble",
                                        body: {
                                            type: "box",
                                            layout: "vertical",
                                            contents: [
                                                {
                                                    type: "button",
                                                    style: "primary",
                                                    height: "sm",
                                                    action: {
                                                        type: "uri",
                                                        label: "🚑สายด่วน 1669",
                                                        uri: "tel:1669"
                                                    },
                                                    color: "#FF3535"
                                                }
                                            ]
                                        }
                                    }
                                }
                            ]

                            client.pushMessage(req.body.line_id, message)
                                .then(() => {
                                    console.log(req.body.line_id + ' timeCttRoutes : push 12hr failed message done!')
                                })
                                .catch((err) => {
                                    console.log(err);   // error when use fake line id 
                                });
                        }
                    }).catch(err => {
                        console.log(err)
                        res.status(200).json({
                            account: false,
                            message: 'line id not found.',
                        });
                    });

            }, 21600000);

        }, 21600000);   // 43200000 = 12 hr , 21000 = 20 sec , 63000 = 1 min , 21600000 = 6 hr

    }
});

module.exports = router;


// remove array
                    // dataCollection.findOne({ line_id: req.body.line_id }, function (err, docs) {
                    //     dataCollection.updateOne({ line_id: req.body.line_id, 'counting._did': _did }, {
                    //         $pull: {
                    //             counting: {
                    //                 $elemMatch: { _did: _did }
                    //             }
                    //         }
                    //     }, function (err, docs) {
                    //         console.log(err)
                    //         console.log('remove array');
                    //     });
                    // });



// / push message to line */
                // const client = new line.Client({
                //     channelAccessToken: 'SCtu4U76N1oEXS3Ahq1EX9nBNkrtbKGdn8so1vbUZaBIXfTlxGqMldJ3Ego3GscxKGUB7MlfR3DHtTbg6hrYPGU9reSTBcCSiChuKmDCMx4FTtIPXzivaYUi3I6Yk1u/yF5k85Le0IUFrkBNxaETxFGUYhWQfeY8sLGRXgo3xvw='
                // });
                // const message = [
                //     {
                //         type: 'text',
                //         text: 'คุณแม่ต้องลงทะเบียนก่อนใช้งานการนับลูกดิ้นนะคะ'
                //     },
                //     {
                //         type: "flex",
                //         altText: "ลงทะเบียนคุณแม่",
                //         contents: {
                //             type: "bubble",
                //             body: {
                //                 type: "box",
                //                 layout: "vertical",
                //                 contents: [
                //                     {
                //                         type: "button",
                //                         style: "primary",
                //                         height: "sm",
                //                         action: {
                //                             type: "uri",
                //                             label: "ลงทะเบียนคุณแม่",
                //                             uri: "line://app/1606482498-VJdOoZXR"
                //                         },
                //                         color: "#dd8cc9"
                //                     }
                //                 ]
                //             }
                //         }
                //     }
                // ]
                // client.pushMessage(req.body.line_id, message)
                //     .then(() => {
                //         console.log('push message go to ctt done!')
                //     })
                //     .catch((err) => {
                //         console.log(err);   // error when use fake line id 
                //     });