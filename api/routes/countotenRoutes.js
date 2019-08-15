/**
 *  POST : for count to ten
 *       : check current week/day
 * 
 *  Created by CPU on 11/8/19
 */

const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const userCollection = require("../models/userModel");

router.post("/:lineId", (req, res, next) => {

    lineId = req.params.lineId;

    // check current week and day 
    userCollection.findOne({ line_id: lineId }, function (err, docs) {

        if (docs == null || docs == "") {
            res.json({
                status: 'error',
                message: 'line id is invalid',
            });
        }
        else {
            res.json(docs.history)
            var weekLength = docs.history.length;
            var currentWeek = weekLength.toString();
            var currentDay;

            if (weekLength == 0) {             // if there isn't week data
                console.log('empty array');
                newWeek('1', '1', '1w1d');
            }
            else if (weekLength >= 1) {             // there is week data
                console.log('there is week data');
                console.log(docs.history[weekLength - 1]);

                if (docs.timer_status == "running") {       // check timer
                    console.log('timer is running');
                    console.log('total of day ' + docs.history[weekLength - 1].days.length);
                    currentDay = docs.history[weekLength - 1].days.length.toString();
                    var _did = currentWeek + 'w' + currentDay + 'd';
                    console.log(_did);
                    onDay(_did.toString());
                }
                else {                                      // if time out, start new day or week
                    if (docs.history[weekLength - 1].days.length == 7) {        // start new week
                        var _did = (weekLength + 1).toString() + 'w' + '1d';
                        newWeek((weekLength + 1).toString(), '1');
                    }
                    else {
                        var dayLength = docs.history[weekLength - 1].days.length;   // start new day                                            // start new day
                        newDay(currentWeek, (dayLength + 1).toString());
                    }
                }
            }
        }


    });

    function newWeek(week, day, _did) {
        userCollection.updateOne({ line_id: lineId }, {
            $push: {
                history: {
                    week: week,
                    days: {
                        day: day,
                        _did: _did,
                        count_type: "CTT",
                        ctt_amount: 1
                    }
                }
            }
        }, function (err, docs) {
            console.log(err)
        });
        console.log('add first week successful!');
    }

    function newDay(currentWeek, day) {
        userCollection.updateOne({ week: currentWeek }, {
            $push: {
                days: {
                    day: day,
                    _did: currentWeek + 'w' + day + 'd',
                    count_type: "CTT",
                    ctt_amount: 1
                }
            }
        }, function (err, docs) {
            console.log(err)
        });
        console.log('add first day successful!');
    }


    function onDay(_did) {
        userCollection.findOneAndUpdate({ line_id: lineId, 'history.days._did': _did }, {
            $inc: {
                'history.$[].days.$[d].ctt_amount': 1
            }
        }, {
            arrayFilters: [
                { 'd._did': _did }
            ]
            }, function (err, docs) {
                console.log(err);
                if (docs == null || docs == "") {
                    res.json({
                        message: '_did id is invalid',
                    });
                }
                else {
                    // res.json(docs)
                    console.log(docs)
                }
            });

    }

});

module.exports = router;