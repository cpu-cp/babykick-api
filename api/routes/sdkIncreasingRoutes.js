/**
 *  @POST
 *  for sadovsky
 *  check current week/day
 * 
 *  Created by CPU on 10/9/19
 */

const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const line = require('@line/bot-sdk');
const cron = require('node-cron');

const dataCollection = require("../models/dataModel");

router.post("/:lineId", (req, res, next) => {

    lineId = req.params.lineId;

    // check current week and day 
    dataCollection.findOne({ line_id: lineId }, function (err, docs) {

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

            var getDate = new Date(Date.now()).getDate();
            var getMonth = new Date(Date.now()).getMonth() + 1;
            let sScheduleLunch = '0 12 ' + getDate + ' ' + getMonth + ' *';
            let sScheduleDinner = '0 18 ' + getDate + ' ' + getMonth + ' *';

            if (docs.timer_status == 'running') {

                res.json(docs.counting[(docs.counting.length) - 1]);

                if (docs.counting[countingLength - 1].status == '1st') {
                    if (docs.counting[countingLength - 1].sdk_first_meal == 2) {
                        onFirstMeal('1st', 'timeout', _did, sScheduleLunch);
                    }
                    else {
                        onFirstMeal('1st', 'running', _did, sScheduleLunch);
                    }
                }
                else if (docs.counting[countingLength - 1].status == '2nd') {
                    if (docs.counting[countingLength - 1].sdk_second_meal == 2) {
                        onSecondMeal('2nd', 'timeout', _did, sScheduleDinner);
                    }
                    else {
                        onSecondMeal('2nd', 'running', _did, sScheduleDinner);
                    }
                }
                else if (docs.counting[countingLength - 1].status == '3rd') {
                    if (docs.counting[countingLength - 1].sdk_third_meal == 2) {
                        onThirdMeal('3rd', 'timeout', _did);
                    }
                    else {
                        onThirdMeal('3rd', 'running', _did);
                    }
                }
            }
            else {
                console.log('now status is time out')
                res.json({ timer_status: 'timeout' })
            }
        }
    });


    function onFirstMeal(meal, timerStatus, _did, sScheduleLunch) {
        if (timerStatus == 'timeout') {

            / push message to line */
            const client = new line.Client({
                channelAccessToken: 'SCtu4U76N1oEXS3Ahq1EX9nBNkrtbKGdn8so1vbUZaBIXfTlxGqMldJ3Ego3GscxKGUB7MlfR3DHtTbg6hrYPGU9reSTBcCSiChuKmDCMx4FTtIPXzivaYUi3I6Yk1u/yF5k85Le0IUFrkBNxaETxFGUYhWQfeY8sLGRXgo3xvw='
            });
            const message = [
                {
                    type: 'text',
                    text: 'ยินดีด้วยค่ะ \nมื้อเช้าวันนี้ลูกดิ้นดีครบ 3 ครั้ง 🌄'
                },
                {
                    type: 'text',
                    text: 'ตอนเที่ยงอย่าลืมมานับต่อนะคะ'
                }
            ]
            client.pushMessage(lineId, message)
                .then(() => {
                    console.log('push message inc 1st done!')
                })
                .catch((err) => {
                    console.log(err);   // error when use fake line id 
                });


            console.log(sScheduleLunch);

            cron.schedule(sScheduleLunch, () => {
                console.log('Runing a job  at Asia/Bangkok timezone');

                / push message to line */
                const client = new line.Client({
                    channelAccessToken: 'SCtu4U76N1oEXS3Ahq1EX9nBNkrtbKGdn8so1vbUZaBIXfTlxGqMldJ3Ego3GscxKGUB7MlfR3DHtTbg6hrYPGU9reSTBcCSiChuKmDCMx4FTtIPXzivaYUi3I6Yk1u/yF5k85Le0IUFrkBNxaETxFGUYhWQfeY8sLGRXgo3xvw='
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

        dataCollection.findOneAndUpdate({ line_id: lineId, 'counting._did': _did },
            {
                $inc: {
                    'counting.$.sdk_first_meal': 1
                },
                $set: {
                    timer_status: timerStatus
                }
            },
            {
                modifiedCount: 1
            },
            function (err, docs, res) {
                console.log(err);
                console.log('increase sdk_first_meal successful!')
                // res.json(docs);
            }
        );
    }

    function onSecondMeal(meal, timerStatus, _did, sScheduleDinner) {
        if (timerStatus == 'timeout') {
            / push message to line */
            const client = new line.Client({
                channelAccessToken: 'SCtu4U76N1oEXS3Ahq1EX9nBNkrtbKGdn8so1vbUZaBIXfTlxGqMldJ3Ego3GscxKGUB7MlfR3DHtTbg6hrYPGU9reSTBcCSiChuKmDCMx4FTtIPXzivaYUi3I6Yk1u/yF5k85Le0IUFrkBNxaETxFGUYhWQfeY8sLGRXgo3xvw='
            });
            const message = [
                {
                    type: 'text',
                    text: 'ยินดีด้วยค่ะ \nมื้อเที่ยงวันนี้ลูกดิ้นดีครบ 3 ครั้ง ☀'
                },
                {
                    type: 'text',
                    text: 'ตอนเย็นอย่าลืมมานับต่อนะคะ'
                }
            ]
            client.pushMessage(lineId, message)
                .then(() => {
                    console.log('push message inc 2nd done!')
                })
                .catch((err) => {
                    console.log(err);   // error when use fake line id 
                });

            cron.schedule(sScheduleDinner, () => {
                console.log('Runing a job  at Asia/Bangkok timezone');

                / push message to line */
                const client = new line.Client({
                    channelAccessToken: 'SCtu4U76N1oEXS3Ahq1EX9nBNkrtbKGdn8so1vbUZaBIXfTlxGqMldJ3Ego3GscxKGUB7MlfR3DHtTbg6hrYPGU9reSTBcCSiChuKmDCMx4FTtIPXzivaYUi3I6Yk1u/yF5k85Le0IUFrkBNxaETxFGUYhWQfeY8sLGRXgo3xvw='
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

        dataCollection.findOneAndUpdate({ line_id: lineId, 'counting._did': _did },
            {
                $inc: {
                    'counting.$.sdk_second_meal': 1
                },
                $set: {
                    timer_status: timerStatus
                }
            },
            {
                modifiedCount: 1
            },
            function (err, docs, res) {
                console.log(err);
                console.log('increase sdk_second_meal successful!');
                // res.json(docs);
            }
        );

    }

    function onThirdMeal(meal, timerStatus, _did, getDate, getMonth) {
        if (timerStatus == 'running') {
            dataCollection.findOneAndUpdate({ line_id: lineId, 'counting._did': _did },
                {
                    $inc: {
                        'counting.$.sdk_third_meal': 1
                    },
                    $set: {
                        timer_status: timerStatus
                    }
                },
                {
                    modifiedCount: 1
                },
                function (err, docs, res) {
                    console.log(err);
                    console.log('increase sdk_third_meal successful!');
                    // res.json(docs);
                }
            );
        }
        else {
            dataCollection.findOneAndUpdate({ line_id: lineId, 'counting._did': _did },
                {
                    $inc: {
                        'counting.$.sdk_third_meal': 1
                    },
                    $set: {
                        'counting.$.status': 'close',
                        timer_status: timerStatus,
                        sdk_status: 'enable',
                        extra: 'disable'
                    }
                },
                {
                    modifiedCount: 1
                },
                function (err, docs, res) {
                    console.log(err);
                    console.log('increase sdk_third_meal successful!');
                    // res.json(docs);
                }
            );

            / push message to line */
            const client = new line.Client({
                channelAccessToken: 'SCtu4U76N1oEXS3Ahq1EX9nBNkrtbKGdn8so1vbUZaBIXfTlxGqMldJ3Ego3GscxKGUB7MlfR3DHtTbg6hrYPGU9reSTBcCSiChuKmDCMx4FTtIPXzivaYUi3I6Yk1u/yF5k85Le0IUFrkBNxaETxFGUYhWQfeY8sLGRXgo3xvw='
            });
            const message = [
                {
                    type: 'text',
                    text: 'ยินดีด้วยค่ะ \nมื้อเย็นวันนี้ลูกดิ้นดีครบ 3 ครั้ง 🌅'
                },
                {
                    type: 'text',
                    text: 'พรุ่งนี้อย่าลืมแวะมานับใหม่น้า'
                }
            ]
            client.pushMessage(lineId, message)
                .then(() => {
                    console.log('push message 3rd done!')
                })
                .catch((err) => {
                    console.log(err);   // error when use fake line id 
                });
        }

    }

});



router.post("/extra/:lineId", (req, res, next) => {

    lineId = req.params.lineId;

    // check current week and day 
    dataCollection.findOne({ line_id: lineId }, function (err, docs) {

        if (docs == null || docs == "") {
            res.json({
                status: 'error',
                message: 'line id is invalid',
            });
        }
        else {
            if (docs.timer_status == 'running') {

                res.json(docs.counting[(docs.counting.length) - 1]);

                var week = Math.ceil((docs.counting.length) / 7);
                var day = (docs.counting.length) % 7;

                var currentDay;
                var currentWeek;
                var _did = (week.toString() + 'w' + day.toString() + 'd').toString();

                if (docs.counting[(docs.counting.length) - 1].status == '3rd') {
                    if (docs.counting[(docs.counting.length) - 1].sdk_third_meal == 2) {
                        onThirdMeal('3rd', 'timeout', _did);
                    }
                    else {
                        onThirdMeal('3rd', 'running', _did);
                    }
                }
            }
            else {
                console.log('now status is time out')
                res.json({ timer_status: 'timeout' })
            }
        }
    });

    function onThirdMeal(meal, timerStatus, _did) {
        if (timerStatus == 'running') {
            dataCollection.findOneAndUpdate({ line_id: lineId, 'counting._did': _did },
                {
                    $inc: {
                        'counting.$.sdk_third_meal': 1
                    },
                    $set: {
                        timer_status: timerStatus
                    }
                },
                {
                    modifiedCount: 1
                },
                function (err, docs, res) {
                    console.log(err);
                    console.log('increase sdk_third_meal successful!');
                    // res.json(docs);
                }
            );
        }
        else {
            dataCollection.findOneAndUpdate({ line_id: lineId, 'counting._did': _did },
                {
                    $inc: {
                        'counting.$.sdk_third_meal': 1
                    },
                    $set: {
                        'counting.$.status': 'close',
                        timer_status: timerStatus,
                        sdk_status: 'enable',
                        extra: 'disable'
                    }
                },
                {
                    modifiedCount: 1
                },
                function (err, docs, res) {
                    console.log(err);
                    console.log('increase sdk_third_meal successful!');
                    // res.json(docs);
                }
            );

            / push message to line */
            const client = new line.Client({
                channelAccessToken: 'SCtu4U76N1oEXS3Ahq1EX9nBNkrtbKGdn8so1vbUZaBIXfTlxGqMldJ3Ego3GscxKGUB7MlfR3DHtTbg6hrYPGU9reSTBcCSiChuKmDCMx4FTtIPXzivaYUi3I6Yk1u/yF5k85Le0IUFrkBNxaETxFGUYhWQfeY8sLGRXgo3xvw='
            });
            const message = [
                {
                    type: 'text',
                    text: 'ยินดีด้วยค่ะ \nมื้อเย็นวันนี้ลูกดิ้นดีครบ 3 ครั้ง 🌅'
                },
                {
                    type: 'text',
                    text: 'พรุ่งนี้อย่าลืมแวะมานับใหม่น้า'
                }
            ]
            client.pushMessage(lineId, message)
                .then(() => {
                    console.log('push message 3rd done!')
                })
                .catch((err) => {
                    console.log(err);   // error when use fake line id 
                });
        }
    }

});
module.exports = router;