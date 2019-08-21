/**
 *  POST
 *  for sadovsky : Decreasing
 *  check current week/day
 * 
 *  Created by CPU on 18/8/19
 */

 // 1hr

const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

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
            res.json(docs.counting)
            var countingLength = docs.counting.length;
            var week = Math.ceil(countingLength / 7);
            var day = countingLength % 7;

            var currentDay;
            var currentWeek;
            var _did = (week.toString() + 'w' + day.toString() + 'd').toString();

            if (countingLength == 0) {             // if there isn't history data
                console.log('empty array');
                newDay('1', '1', 'date');
            }
            else if (countingLength >= 1) {
                console.log('there is counting data');

                if (docs.timer_status == '1st') {
                    console.log('timer is 1st');
                    console.log('array status is ' + docs.counting[countingLength - 1].status);

                    if (docs.counting[countingLength - 1].status == 'open') {
                        if (docs.counting[countingLength - 1].sdk_first_meal == 4) {
                            onFirstMeal('2nd', 'open', _did);
                        }
                        else {
                            onFirstMeal('1st', 'open', _did);
                        }
                    }
                    else {
                        if (day == 0) {   //start new week
                            currentWeek = (week + 1).toString();
                            newDay(currentWeek, '1', 'date')
                        }
                        else {
                            currentDay = (day + 1).toString();
                            newDay(week.toString(), currentDay, 'date')
                        }
                    }

                }
                else if (docs.timer_status == '2nd') {
                    console.log('timer is 2st');
                    if (docs.counting[countingLength - 1].status == 'open') {
                        if (docs.counting[countingLength - 1].sdk_second_meal == 4) {
                            onSecondMeal('3rd', 'open', _did);
                        }
                        else {
                            onSecondMeal('2st', 'open', _did);
                        }
                    }
                    else {
                        if (day == 0) {   //start new week
                            currentWeek = (week + 1).toString();
                            newDay(currentWeek, '1', 'date')
                        }
                        else {
                            currentDay = (day + 1).toString();
                            newDay(week.toString(), currentDay, 'date')
                        }
                    }
                }
                else if (docs.timer_status == '3rd') {
                    console.log('timer is 3st');
                    if (docs.counting[countingLength - 1].status == 'open') {
                        if (docs.counting[countingLength - 1].sdk_third_meal == 4) {
                            onThirdMeal('time out', 'close', _did);
                        }
                        else {
                            onThirdMeal('3rd', 'open', _did);
                        }
                    }
                    else {
                        if (day == 0) {   //start new week
                            currentWeek = (week + 1).toString();
                            newDay(currentWeek, '1', 'date')
                        }
                        else {
                            currentDay = (day + 1).toString();
                            newDay(week.toString(), currentDay, 'date')
                        }
                    }
                }
                else if (docs.timer_status == 'time out') {
                    console.log('now status is time out')
                    // push message to line 'time out'
                }
            }
        }


    });


    function newDay(currentWeek, currentDay, date) {
        dataCollection.updateOne({ line_id: lineId }, {
            $push: {
                counting: {
                    week: currentWeek,
                    day: currentDay,
                    _did: currentWeek + 'w' + currentDay + 'd',
                    date: date,
                    count_type: 'SDK',
                    sdk_first_meal: 1,
                    status: 'open'
                }
            }
        }, function (err, docs) {
            console.log(err)
        });
        console.log('add new day successfully!');
    }

    function onFirstMeal(timerStatus, status, _did) {
        dataCollection.findOneAndUpdate({ line_id: lineId, 'counting._did': _did },
            {
                $inc: {
                    'counting.$.sdk_first_meal': -1
                },
                $set: {
                    'counting.$.status': status,
                    timer_status: timerStatus
                }
            },
            function (err, docs) {
                console.log(err);
                if (docs == null || docs == "") {
                    res.json({
                        message: '_did id is invalid',
                    });
                }
                else {
                    console.log(docs)
                }
            }
        );
        console.log('increase sdk_first_meal successful!');
    }

    function onSecondMeal(timerStatus, status, _did) {
        dataCollection.findOneAndUpdate({ line_id: lineId, 'counting._did': _did },
            {
                $inc: {
                    'counting.$.sdk_second_meal': -1
                },
                $set: {
                    'counting.$.status': status,
                    timer_status: timerStatus
                }
            },
            function (err, docs) {
                console.log(err);
                if (docs == null || docs == "") {
                    res.json({
                        message: '_did id is invalid',
                    });
                }
                else {
                    console.log(docs)
                }
            }
        );
        console.log('increase sdk_second_meal successful!');
    }

    function onThirdMeal(timerStatus, status, _did) {
        dataCollection.findOneAndUpdate({ line_id: lineId, 'counting._did': _did },
            {
                $inc: {
                    'counting.$.sdk_third_meal': -1
                },
                $set: {
                    'counting.$.status': status,
                    timer_status: timerStatus
                }
            },
            function (err, docs) {
                console.log(err);
                if (docs == null || docs == "") {
                    res.json({
                        message: '_did id is invalid',
                    });
                }
                else {
                    console.log(docs)
                }
            }
        );
        console.log('increase sdk_third_meal successful!');
    }

});

module.exports = router;