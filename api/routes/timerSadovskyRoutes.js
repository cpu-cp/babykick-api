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
const cron = require('node-cron');

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

                / push message to line */
                const client = new line.Client({
                    channelAccessToken: 'U/6mbMtkbHi+PGkWqm50UCz4tpPV2pVgMRKyLM5ewyp4QhDIqv+wiyFuKR4Vof8Gh09nAGnpbOUhuk3mrkGULX68GRZ/L3rTT/txU6+eqMWE/7DUuzKTOUH1jayB7XPCJGtXQGxQgSxjkHr1+aAV4gdB04t89/1O/w1cDnyilFU='
                });
                const message = [
                    {
                        type: 'text',
                        text: 'คุณแม่ต้องลงทะเบียนก่อนใช้งานการนับลูกดิ้นนะคะ'
                    },
                    {
                        type: "flex",
                        altText: "ลงทะเบียนคุณแม่",
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
                                            label: "ลงทะเบียนคุณแม่",
                                            uri: "line://app/1606482498-VJdOoZXR"
                                        },
                                        color: "#dd8cc9"
                                    }
                                ]
                            }
                        }
                    }
                ]
                client.pushMessage(req.body.line_id, message)
                    .then(() => {
                        console.log('push message go to ctt done!')
                    })
                    .catch((err) => {
                        console.log(err);   // error when use fake line id 
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

                Date.prototype.getWeek = function () {
                    var dt = new Date(this.getFullYear(), 0, 1);
                    return Math.ceil((((this - dt) / 86400000) + dt.getDay() + 1) / 7);
                };
                var week_by_date = date.getWeek();

                if (docs.timer_status == 'timeout' && docs.sdk_status == 'enable') {
                    if (countingLength == 0) {                                  // if there isn't counting data before
                        try {
                            newDay('1', '1', date, time, timestamp, end_time, week_by_date);
                        } catch (e) {
                            console.log(e);
                        }
                    }
                    else {

                        if (docs.counting[countingLength - 1].status == 'close') {      // previos array is close, start new counting array
                            if (day == 0) {                             //start new week
                                currentWeek = (week + 1).toString();
                                try {
                                    newDay(currentWeek, '1', date, time, timestamp, end_time, week_by_date);
                                } catch (e) {
                                    console.log(e);
                                }
                            }
                            else {
                                currentDay = (day + 1).toString();      // start new day
                                try {
                                    newDay(week.toString(), currentDay, date, time, timestamp, end_time, week_by_date);
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
                    res.json({
                        status: 0000,
                        timer_status: docs.timer_status,
                        sdk_status: docs.sdk_status,
                        message: 'can not run timer sdk, status have to be timeout and enable'
                    });
                }

            }
        }).catch(err => {
            console.log(err)
            res.json({
                message: 'line id not found.',
            });
        });


    function newDay(currentWeek, currentDay, date, time, timestamp, end_time, week_by_date) {

        closeAutomatic();
        dataCollection.updateOne({ line_id: req.body.line_id }, {
            $set: {
                timer_status: "running",
                count_type: 'sdk',
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
                    count_type: 'SDK',
                    sdk_first_meal: 0,
                    sdk_second_meal: 0,
                    sdk_third_meal: 0,
                    sdk_all_meal: 0,
                    result: '',
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
                if (docs.counting[countingLength - 1].sdk_all_meal == 10) {   // amount = 10
                    console.log('set time out : you have been time out and close an array already')
                }
                if (docs.counting[countingLength - 1].sdk_first_meal >= 3) { 
                    dataCollection.findOneAndUpdate({ line_id: req.body.line_id, 'counting._did': _did }, {
                        $set: {
                            timer_status: "timeout",
                            sdk_status: "enable",
                            extra: 'disable',
                        },
                    }, function (err, docs) {
                        console.log(err)
                        console.log('1st meal time out >> greater than or equal to 3, see u in 2nd meal')
                    });

                    / push message to line */
                    const client = new line.Client({
                        channelAccessToken: 'U/6mbMtkbHi+PGkWqm50UCz4tpPV2pVgMRKyLM5ewyp4QhDIqv+wiyFuKR4Vof8Gh09nAGnpbOUhuk3mrkGULX68GRZ/L3rTT/txU6+eqMWE/7DUuzKTOUH1jayB7XPCJGtXQGxQgSxjkHr1+aAV4gdB04t89/1O/w1cDnyilFU='
                    });
                    const message = [
                        {
                            type: 'text',
                            text: '👍เยี่ยมมากค่ะคุณแม่ ลูกดิ้นดี 👶🏻😁'
                        },
                        {
                            type: 'text',
                            text: 'คุณแม่อย่าลืมกลับมานับต่อหลังรับประทานมื้อเที่ยงนะคะ 🍽'
                        },
                        {
                            type: "sticker",
                            packageId: 3,
                            stickerId: 184
                        }
                    ]
                    client.pushMessage(lineId, message)
                        .then(() => {
                            console.log('push message 1st done!')
                        })
                        .catch((err) => {
                            console.log(err);   // error when use fake line id 
                        });

                    var getDate = new Date(Date.now()).getDate();
                    var getMonth = new Date(Date.now()).getMonth() + 1;
                    let sScheduleLunch = '0 12 ' + getDate + ' ' + getMonth + ' *';

                    cron.schedule(sScheduleLunch, () => {
                        console.log('Runing a job  at Asia/Bangkok timezone');

                        / push message to line */
                        const client = new line.Client({
                            channelAccessToken: 'U/6mbMtkbHi+PGkWqm50UCz4tpPV2pVgMRKyLM5ewyp4QhDIqv+wiyFuKR4Vof8Gh09nAGnpbOUhuk3mrkGULX68GRZ/L3rTT/txU6+eqMWE/7DUuzKTOUH1jayB7XPCJGtXQGxQgSxjkHr1+aAV4gdB04t89/1O/w1cDnyilFU='
                        });
                        const message = [
                            {
                                type: 'text',
                                text: 'เที่ยงแล้ว อย่าลืมมานับ Sadovsky ต่อนะคะ'
                            },
                        ]
                        client.pushMessage(lineId, message)
                            .then(() => {
                                console.log('corn : push lunch message done!')
                            })
                            .catch((err) => {
                                console.log(err);   // error when use fake line id 
                            });
                    }, {
                            scheduled: true,
                            timezone: "Asia/Bangkok"
                        });
                }
                else { // amount != 3, go to ctt
                    dataCollection.findOneAndUpdate({ line_id: req.body.line_id, 'counting._did': _did }, {
                        $set: {
                            timer_status: "timeout",
                            sdk_status: "disable",
                            extra: 'ctt',
                            count_type: 'ctt',
                            'counting.$.result': 'มีความเสี่ยง',
                        },
                    }, function (err, docs) {
                        console.log(err)
                        console.log('1st meal time out! please go to ctt')
                    });

                    / push message to line */
                    const client = new line.Client({
                        channelAccessToken: 'U/6mbMtkbHi+PGkWqm50UCz4tpPV2pVgMRKyLM5ewyp4QhDIqv+wiyFuKR4Vof8Gh09nAGnpbOUhuk3mrkGULX68GRZ/L3rTT/txU6+eqMWE/7DUuzKTOUH1jayB7XPCJGtXQGxQgSxjkHr1+aAV4gdB04t89/1O/w1cDnyilFU='
                    });
                    const message = [
                        {
                            type: 'text',
                            text: '🌞 เช้านี้นับครบ 1 ชั่วโมงแล้ว 🕤 แต่ลูกคุณแม่ดิ้นไม่ครบ 3 ครั้ง 😞'
                        },
                        {
                            type: 'text',
                            text: '📢 แนะนำให้คุณแม่กลับไปกระตุ้นปลุกลูกแล้วมาเริ่มนับใหม่ โดยใช้วิธี Count to ten นะคะ 😁😁'
                        },
                        {
                            type: 'text',
                            text: '✳️ วิธีกระตุ้นปลุกลูก 👶🏻😀 \n📍ขยับตัว เปลี่ยนท่าทาง 🚶‍♀️ \n📍รับประทานอาหารว่างหรือดื่มน้ำเย็น แล้วรอสัก 2 – 3 นาที 🍉🍍 \n📍นวดเบาๆ หรือลูบท้อง 🤰🏻 \n📍ใช้ไฟฉายส่องที่หน้าท้อง🔦"'
                        },
                        {
                            type: "sticker",
                            packageId: 3,
                            stickerId: 190
                        }
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
        }, 60000); / <----------------------------------------- set time */
    }


    function newMeal(meal, _did, date, time, timestamp, end_time) {
        console.log('start sdk ' + meal);

        dataCollection.findOne({ line_id: req.body.line_id }, function (err, docs) {
            dataCollection.updateOne({ line_id: req.body.line_id, 'counting._did': _did }, {
                $set: {
                    timer_status: 'running',
                    'counting.$.status': meal,
                    'counting.$.time': time
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

                    if (docs.counting[(docs.counting.length) - 1].sdk_all_meal == 10) {   // amount = 3 already
                        console.log('set time out : you have been time out and close an array already')
                    }
                    else if (docs.counting[(docs.counting.length) - 1].sdk_second_meal >= 3) {
                        dataCollection.findOneAndUpdate({ line_id: req.body.line_id, 'counting._did': _did }, {
                            $set: {
                                timer_status: "timeout",
                                sdk_status: "enable",
                                extra: 'disable',
                            },
                        }, function (err, docs) {
                            console.log(err)
                            console.log('2st meal time out >> greater than or equal to 3, see u in 3nd meal')
                        });

                        / push message to line */
                        const client = new line.Client({
                            channelAccessToken: 'U/6mbMtkbHi+PGkWqm50UCz4tpPV2pVgMRKyLM5ewyp4QhDIqv+wiyFuKR4Vof8Gh09nAGnpbOUhuk3mrkGULX68GRZ/L3rTT/txU6+eqMWE/7DUuzKTOUH1jayB7XPCJGtXQGxQgSxjkHr1+aAV4gdB04t89/1O/w1cDnyilFU='
                        });
                        const message = [
                            {
                                type: 'text',
                                text: '👍เยี่ยมมากค่ะคุณแม่ ลูกดิ้นดี 👶🏻😁'
                            },
                            {
                                type: 'text',
                                text: 'คุณแม่อย่าลืมกลับมานับต่อหลังรับประทานมื้อเย็นนะคะ 🍽'
                            },
                            {
                                type: "sticker",
                                packageId: 3,
                                stickerId: 184
                            }
                        ]
                        client.pushMessage(lineId, message)
                            .then(() => {
                                console.log('push message 2nd done!')
                            })
                            .catch((err) => {
                                console.log(err);   // error when use fake line id 
                            });

                        var getDate = new Date(Date.now()).getDate();
                        var getMonth = new Date(Date.now()).getMonth() + 1;
                        let sScheduleDinner = '0 18 ' + getDate + ' ' + getMonth + ' *';

                        cron.schedule(sScheduleDinner, () => {
                            console.log('Runing a job  at Asia/Bangkok timezone');

                            / push message to line */
                            const client = new line.Client({
                                channelAccessToken: 'U/6mbMtkbHi+PGkWqm50UCz4tpPV2pVgMRKyLM5ewyp4QhDIqv+wiyFuKR4Vof8Gh09nAGnpbOUhuk3mrkGULX68GRZ/L3rTT/txU6+eqMWE/7DUuzKTOUH1jayB7XPCJGtXQGxQgSxjkHr1+aAV4gdB04t89/1O/w1cDnyilFU='
                            });
                            const message = [
                                {
                                    type: 'text',
                                    text: 'เย็นแล้ว อย่าลืมมานับ Sadovsky ต่อนะคะ'
                                },
                            ]
                            client.pushMessage(lineId, message)
                                .then(() => {
                                    console.log('corn : push dinner message done!')
                                })
                                .catch((err) => {
                                    console.log(err);   // error when use fake line id 
                                });
                        }, {
                                scheduled: true,
                                timezone: "Asia/Bangkok"
                            });
                    }
                    else { // amount != 3, go to ctt
                        dataCollection.findOneAndUpdate({ line_id: req.body.line_id, 'counting._did': _dids }, {
                            $set: {
                                timer_status: "timeout",
                                sdk_status: "disable",
                                extra: 'ctt',
                                'counting.$.result': 'มีความเสี่ยง',
                            },
                        }, function (err, docs) {
                            console.log(err)
                            console.log('2nd meal time out! please go to ctt')
                        });

                        / push message to line */
                        const client = new line.Client({
                            channelAccessToken: 'U/6mbMtkbHi+PGkWqm50UCz4tpPV2pVgMRKyLM5ewyp4QhDIqv+wiyFuKR4Vof8Gh09nAGnpbOUhuk3mrkGULX68GRZ/L3rTT/txU6+eqMWE/7DUuzKTOUH1jayB7XPCJGtXQGxQgSxjkHr1+aAV4gdB04t89/1O/w1cDnyilFU='
                        });
                        const message = [
                            {
                                type: 'text',
                                text: '🌞 เที่ยงนี้นับครบ 1 ชั่วโมงแล้ว 🕤 แต่ลูกคุณแม่ดิ้นไม่ครบ 3 ครั้ง 😞'
                            },
                            {
                                type: 'text',
                                text: '📢 แนะนำให้คุณแม่กลับไปกระตุ้นปลุกลูกแล้วมาเริ่มนับใหม่ โดยใช้วิธี Count to ten นะคะ 😁😁'
                            },
                            {
                                type: 'text',
                                text: '✳️ วิธีกระตุ้นปลุกลูก 👶🏻😀 \n📍ขยับตัว เปลี่ยนท่าทาง 🚶‍♀️ \n📍รับประทานอาหารว่างหรือดื่มน้ำเย็น แล้วรอสัก 2 – 3 นาที 🍉🍍 \n📍นวดเบาๆ หรือลูบท้อง 🤰🏻 \n📍ใช้ไฟฉายส่องที่หน้าท้อง🔦"'
                            },
                            {
                                type: "sticker",
                                packageId: 3,
                                stickerId: 190
                            }
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
            else if (meal == '3rd') {                  // else 3rd
                dataCollection.findOne({ line_id: req.body.line_id }, function (err, docs) {
                    var _dids = docs.counting[(docs.counting.length) - 1]._did;

                    if (docs.counting[(docs.counting.length) - 1].sdk_all_meal == 10) {   // amount = 10 already
                        console.log('set time out : you have been time out and close an array already')
                    }
                    else { // amount != 10, go to extra
                        dataCollection.findOneAndUpdate({ line_id: req.body.line_id, 'counting._did': _dids }, {
                            $set: {
                                timer_status: "timeout",
                                sdk_status: "enable",
                                extra: 'enable',
                                count_type: 'sdk',
                                'counting.$.result': 'มีความเสี่ยง',
                            },
                        }, function (err, docs) {
                            console.log(err)
                            console.log('3rd meal time out! please go to extra')
                        });

                        / push message to line */
                        const client = new line.Client({
                            channelAccessToken: 'U/6mbMtkbHi+PGkWqm50UCz4tpPV2pVgMRKyLM5ewyp4QhDIqv+wiyFuKR4Vof8Gh09nAGnpbOUhuk3mrkGULX68GRZ/L3rTT/txU6+eqMWE/7DUuzKTOUH1jayB7XPCJGtXQGxQgSxjkHr1+aAV4gdB04t89/1O/w1cDnyilFU='
                        });
                        const message = [
                            {
                                type: 'text',
                                text: '🌞 เย็นนี้นับครบ 1 ชั่วโมงแล้ว 🕛 แต่ลูกคุณแม่ดิ้นไม่ครบ 3 ครั้ง 😞'
                            },
                            {
                                type: 'text',
                                text: 'คุณแม่นับต่ออีก 1 ชั่วโมงนะคะ'
                            },
                            {
                                type: "sticker",
                                packageId: 3,
                                stickerId: 184
                            },
                            {
                                type: "flex",
                                altText: "นับลูกดิ้นมื้อเย็นต่อ",
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
                                                    label: "นับลูกดิ้นมื้อเย็นต่อ",
                                                    uri: "line://app/1606482498-bD3NV1ly"
                                                },
                                                color: "#dd8cc9"
                                            }
                                        ]
                                    }
                                }
                            }
                        ]
                        client.pushMessage(req.body.line_id, message)
                            .then(() => {
                                console.log('push message go to extra done!')
                            })
                            .catch((err) => {
                                console.log(err);   // error when use fake line id 
                            });
                    }
                });
            }
        }, 60000); / <----------------------------------------- set time */
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
                        extra: 'disable',
                        count_type: 'any',
                        'counting.$.status': 'close'
                    }
                }, function (err, docs) {
                    console.log(err);
                    console.log('close automatic success');
                });
            });
        }, 900000); / <----------------------------------------- pls come back to set time to 18 hr */
    }

});

module.exports = router;

// var getDate = new Date(Date.now()).getDate();
// var getMonth = new Date(Date.now()).getMonth() + 1;
// let sScheduleLunch = '0 12 ' + getDate + ' ' + getMonth + ' *';
// let sScheduleDinner = '0 18 ' + getDate + ' ' + getMonth + ' *';

// cron.schedule(sScheduleLunch, () => {
    //     console.log('Runing a job  at Asia/Bangkok timezone');

    //     / push message to line */
    //     const client = new line.Client({
    //         channelAccessToken: 'SCtu4U76N1oEXS3Ahq1EX9nBNkrtbKGdn8so1vbUZaBIXfTlxGqMldJ3Ego3GscxKGUB7MlfR3DHtTbg6hrYPGU9reSTBcCSiChuKmDCMx4FTtIPXzivaYUi3I6Yk1u/yF5k85Le0IUFrkBNxaETxFGUYhWQfeY8sLGRXgo3xvw='
    //     });
    //     const message = [
    //         {
    //             type: 'text',
    //             text: 'เที่ยงแล้ว อย่าลืมมานับ Sadovsky ต่อนะคะ'
    //         },
    //     ]
    //     client.pushMessage(lineId, message)
    //         .then(() => {
    //             console.log('corn : push lunch message done!')
    //         })
    //         .catch((err) => {
    //             console.log(err);   // error when use fake line id 
    //         });
    // }, {
    //         scheduled: true,
    //         timezone: "Asia/Bangkok"
    //     });