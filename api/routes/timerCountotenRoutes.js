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


            var date = d.getDay() + '/' + d.getMonth() + '/' + d.getFullYear();
            var time = hr.toString() + ':' + min.toString() + ':' + sec.toString();
            var end_time = endHr.toString() + ':' + min.toString() + ':' + min.toString();


            if (countingLength == 0) {                          // if there isn't counting data before
                firstDay('1', '1', date, time, timestamp, end_time);
            }
            else {                                              // if there is counting data 
                if (day == 0) {
                    currentWeek = (week + 1).toString();
                    newDay(currentWeek, '1', date, time, timestamp, end_time);
                }
                else {
                    currentDay = (day + 1).toString();
                    newDay(week.toString(), currentDay, date, time, timestamp, end_time);
                }
            }
        }
    });


    function firstDay(currentWeek, currentDay, date, time, timestamp, end_time) {
        dataCollection.updateOne({ line_id: req.body.line_id }, {
            $push: {
                counting: {
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
            console.log('add first day successful!');
            res.json({
                status: 'success',
                date: date,
                time: time,
                timestamp: timestamp,
                end_time: end_time
            });
        });
    }


    function newDay(currentWeek, currentDay, date, time, timestamp, end_time) {
        dataCollection.updateOne({ line_id: req.body.line_id }, {
            $push: {
                counting: {
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
            console.log('add new day successful!');
            res.json({
                status: 'success',
                date: date,
                time: time,
                timestamp: timestamp,
                end_time: end_time
            });
        });
    }


    dataCollection.updateOne({ line_id: req.body.line_id }, {
        $set: {
            timer_status: "running",
        },

    }, function (err, docs) {
        console.log(err)
    });
    // res.status(200).json({ success: 'start timer' });

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

            / push message to line */
            // const client = new line.Client({
            //     channelAccessToken: 'SCtu4U76N1oEXS3Ahq1EX9nBNkrtbKGdn8so1vbUZaBIXfTlxGqMldJ3Ego3GscxKGUB7MlfR3DHtTbg6hrYPGU9reSTBcCSiChuKmDCMx4FTtIPXzivaYUi3I6Yk1u/yF5k85Le0IUFrkBNxaETxFGUYhWQfeY8sLGRXgo3xvw='
            // });

            // const message = {
            //     type: 'text',
            //     text: 'ครบ 12 ชั่วโมงแล้วค่ะ การนับลูกดิ้นแบบ Count to ten วันนี้สิ้นสุดแล้ว แวะมานับใหม่วันพรุ่งนี้นะคะ'
            // };

            // client.pushMessage(req.body.line_id, message)
            //     .then(() => {
            //         console.log('push message done!')
            //     })
            //     .catch((err) => {
            //         console.log(err);   // error when use fake line id 
            //     });

            console.log('1 min ==> time out!!')
        });

    }, 21000);   // 43200000 = 12 hr , 21000 = 20 sec , 63000 = 1 min

});

module.exports = router;





/  old version */

// const express = require("express");
// const router = express.Router();
// const mongoose = require("mongoose");
// const line = require('@line/bot-sdk');

// const dataCollection = require("../models/dataModel");

// router.post("/", (req, res, next) => {

//     dataCollection.updateOne({ line_id: req.body.line_id }, {
//         $set: {
//             timer_status: "running",
//         },

//     }, function (err, docs) {
//         console.log(err)
//     });
//     res.status(200).json({ success: 'start timer' });

//     console.log('timer is running');


//     // when 12 hr already
//     setTimeout(function () {

//         dataCollection.findOne({ line_id: req.body.line_id }, function (err, docs) {

//             var countingLength = docs.counting.length;
//             var latestCounting = countingLength - 1;
//             var _did = docs.counting[latestCounting]._did;

//             dataCollection.updateOne({ line_id: req.body.line_id, 'counting._did': _did }, {
//                 $set: {
//                     timer_status: "timeout",
//                     'counting.$.status': 'close'
//                 }
//             }, function (err, docs) {
//                 console.log(err)
//             });

//             // push message to line
//             const client = new line.Client({
//                 channelAccessToken: 'SCtu4U76N1oEXS3Ahq1EX9nBNkrtbKGdn8so1vbUZaBIXfTlxGqMldJ3Ego3GscxKGUB7MlfR3DHtTbg6hrYPGU9reSTBcCSiChuKmDCMx4FTtIPXzivaYUi3I6Yk1u/yF5k85Le0IUFrkBNxaETxFGUYhWQfeY8sLGRXgo3xvw='
//             });

//             const message = {
//                 type: 'text',
//                 text: 'ครบ 12 ชั่วโมงแล้วค่ะ การนับลูกดิ้นแบบ Count to ten วันนี้สิ้นสุดแล้ว แวะมานับใหม่วันพรุ่งนี้นะคะ'
//             };

//             client.pushMessage(req.body.line_id, message)
//                 .then(() => {
//                     console.log('push message done!')
//                 })
//                 .catch((err) => {
//                     console.log(err);   // error when use fake line id 
//                 });

//             console.log('1 min ==> time out!!')
//         });

//     }, 3000);   // 43200000 = 12 hr , 21000 = 20 sec , 63000 = 1 min

// });

// module.exports = router;

