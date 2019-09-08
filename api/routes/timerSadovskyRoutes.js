/**
 *  @POST
 *  timer for sadovsky, 3 meals
 *  push message to line when time out
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

            var date = d.getDay() + '/' + d.getMonth() + '/' + d.getFullYear();
            var time = hr.toString() + ':' + min.toString() + ':' + sec.toString();
            var end_time = endHr.toString() + ':' + min.toString() + ':' + min.toString();


            if (countingLength == 0) {                          // if there isn't counting data before
                newDay('1', '1', date, time, timestamp, end_time);
            }
            else {

                if (docs.counting[countingLength - 1].status == 'close') {      // previos array is close, start new counting array
                    if (day == 0) {                             //start new week
                        currentWeek = (week + 1).toString();
                        newDay(currentWeek, '1', date, time, timestamp, end_time);
                    }
                    else {
                        currentDay = (day + 1).toString();      // start new day
                        newDay(week.toString(), currentDay, date, time, timestamp, end_time);
                    }
                }
                else if (docs.counting[countingLength - 1].status == '1st') {
                    newMeal('2nd', _did, date, time, timestamp, end_time);
                }
                else if (docs.counting[countingLength - 1].status == '2nd') {
                    newMeal('3rd', _did, date, time, timestamp, end_time);
                }
                else {
                    console.log(docs.counting[countingLength - 1].status);
                }

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
            dataCollection.updateOne({ line_id: req.body.line_id }, {
                $set: {
                    timer_status: "timeout"
                }
            }, function (err, docs) {
                console.log(err)
                console.log('1st meal time out!')
            });
        }, 20000);                 / <----------------------------------------- set time */
    }


    function newMeal(meal, _did, date, time, timestamp, end_time) {

        dataCollection.findOne({ line_id: req.body.line_id }, function (err, docs) {
            var _did = docs.counting[(docs.counting.length) - 1]._did;
            dataCollection.updateOne({ line_id: req.body.line_id, 'counting._did': _did }, {
                $set: {
                    timer_status: 'running',
                    'counting.$.status': meal
                }
            }, function (err, docs) {
                console.log(err);
                console.log(meal + ' meal time out!');
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
                dataCollection.updateOne({ line_id: req.body.line_id }, {
                    $set: {
                        timer_status: "timeout"
                    }
                }, function (err, docs) {
                    console.log(err)
                    console.log('2nd meal time out!')
                });
            }
            else {                  // else 3rd
                dataCollection.findOne({ line_id: req.body.line_id }, function (err, docs) {
                    var _did = docs.counting[(docs.counting.length) - 1]._did;
                    dataCollection.updateOne({ line_id: req.body.line_id, 'counting._did': _did }, {
                        $set: {
                            timer_status: 'timeout',
                            'counting.$.status': 'close'
                        }
                    }, function (err, docs) {
                        console.log(err);
                        console.log(' 3rd time out!, closed');
                    });
                });
            }
        }, 20000);                  / <----------------------------------------- set time */
    }


    /* close daily counting every 18 hr */
    function closeAutomatic() {

        setTimeout(function () {
            dataCollection.findOne({ line_id: req.body.line_id }, function (err, docs) {
                var _did = docs.counting[(docs.counting.length) - 1]._did;

                dataCollection.updateOne({ line_id: req.body.line_id, 'counting._did': _did }, {
                    $set: {
                        timer_status: "timeout",
                        'counting.$.status': 'close'
                    }
                }, function (err, docs) {
                    console.log(err);
                    console.log('close automatic success');
                });
            });
        }, 100000);              / <----------------------------------------- pls come back to set time to 18 hr */
    }

});

module.exports = router;



/ old version */
// router.post("/", (req, res, next) => {

//     dataCollection.updateOne({ line_id: req.body.line_id }, {
//         $set: {
//             timer_status: "1st",
//         }
//     }, function (err, docs) {
//         console.log(err)
//     });
//     res.status(200).json({ success: true });


//     //next, 2st meal
//     setTimeout(function () {
//         dataCollection.updateOne({ line_id: req.body.line_id }, {
//             $set: {
//                 timer_status: "2nd"
//             }
//         }, function (err, docs) {
//             console.log(err)
//         });
//         console.log('next, 2st meal!')

//         //next, 3nd meal
//         setTimeout(function () {
//             dataCollection.updateOne({ line_id: req.body.line_id }, {
//                 $set: {
//                     timer_status: "3rd"
//                 }
//             }, function (err, docs) {
//                 console.log(err)
//             });
//             console.log('next, 3th meal!')

//             //3th meal time out
//             setTimeout(function () {
//                 dataCollection.findOne({ line_id: req.body.line_id }, function (err, docs) {
//                     var countingLength = docs.counting.length;
//                     var latestCounting = countingLength - 1;
//                     var _did = docs.counting[latestCounting]._did;

//                     dataCollection.updateOne({ line_id: req.body.line_id, 'counting._did': _did }, {
//                         $set: {
//                             timer_status: "timeout",
//                             'counting.$.status': 'close'
//                         }
//                     }, function (err, docs) {
//                         console.log(err)
//                     });
//                     console.log('time out!')
//                 });
//             }, 3000);

//         }, 3000);

//     }, 3000);   // 10800000 = 3 hr

// });

// module.exports = router;