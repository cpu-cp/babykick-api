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
    dataCollection.findOne({ line_id: lineId })
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


                if (docs.timer_status == 'running') {

                    res.json(docs.counting[(docs.counting.length) - 1]);

                    if (docs.counting[countingLength - 1].status == '1st') {
                        if (docs.counting[countingLength - 1].sdk_first_meal == 0) {
                            minimumCount()
                        }
                        else {
                            onFirstMeal('1st', 'running', _did);
                        }
                    }
                    else if (docs.counting[countingLength - 1].status == '2nd') {
                        if (docs.counting[countingLength - 1].sdk_second_meal == 0) {
                            minimumCount()
                        }
                        else {
                            onSecondMeal('2nd', 'running', _did);
                        }
                    }
                    else if (docs.counting[countingLength - 1].status == '3rd') {
                        if (docs.counting[countingLength - 1].sdk_third_meal == 0) {
                            minimumCount()
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
        }).catch(err => {
            console.log(err)
            res.json({
                message: 'line id not found.',
            });
        });


    function onFirstMeal(meal, timerStatus, _did) {
        dataCollection.findOneAndUpdate({ line_id: lineId, 'counting._did': _did },
            {
                $inc: {
                    'counting.$.sdk_first_meal': -1,
                    'counting.$.sdk_all_meal': -1
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
                console.log('decrease sdk_first_meal successful!')
                // res.json(docs);
            }
        );
    }

    function onSecondMeal(meal, timerStatus, _did) {
        dataCollection.findOneAndUpdate({ line_id: lineId, 'counting._did': _did },
            {
                $inc: {
                    'counting.$.sdk_second_meal': -1,
                    'counting.$.sdk_all_meal': -1
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
                console.log('decrease sdk_second_meal successful!');
                // res.json(docs);
            }
        );

    }

    function onThirdMeal(meal, timerStatus, _did) {
        dataCollection.findOneAndUpdate({ line_id: lineId, 'counting._did': _did },
            {
                $inc: {
                    'counting.$.sdk_third_meal': -1,
                    'counting.$.sdk_all_meal': -1
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
                console.log('decrease sdk_third_meal successful!');
                // res.json(docs);
            }
        );
    }


    function minimumCount() {
        console.log('not change, zero is minimun value');
    }

});




router.post("/extra/:lineId", (req, res, next) => {

    lineId = req.params.lineId;

    // check current week and day 
    dataCollection.findOne({ line_id: lineId })
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


                if (docs.timer_status == 'running') {

                    res.json(docs.counting[(docs.counting.length) - 1]);

                    if (docs.counting[countingLength - 1].status == '3rd') {
                        if (docs.counting[countingLength - 1].sdk_third_meal == 0) {
                            minimumCount()
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
        }).catch(err => {
            console.log(err)
            res.json({
                message: 'line id not found.',
            });
        });

    function onThirdMeal(meal, timerStatus, _did) {
        dataCollection.findOneAndUpdate({ line_id: lineId, 'counting._did': _did },
            {
                $inc: {
                    'counting.$.sdk_third_meal': -1,
                    'counting.$.sdk_all_meal': -1
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
                console.log('decrease sdk_third_meal successful!');
                // res.json(docs);
            }
        );
    }


    function minimumCount() {
        console.log('not change, zero is minimun value');
    }

});

module.exports = router;
