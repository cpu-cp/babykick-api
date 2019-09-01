/**
 *  POST : timer for sadovsky in 9 hr 
 *   
 * 
 *  Created by CPU on 17/8/19
 */

/*
  body required
  line_id : string
  time: string
 */
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
// const line = require('@line/bot-sdk');

const dataCollection = require("../models/dataModel");

router.post("/", (req, res, next) => {

    dataCollection.updateOne({ line_id: req.body.line_id }, {
        $set: {
            timer_status: "1st",
        }
    }, function (err, docs) {
        console.log(err)
    });
    res.status(200).json({ success: true });


    //next, 2st meal
    setTimeout(function () {
        dataCollection.updateOne({ line_id: req.body.line_id }, {
            $set: {
                timer_status: "2nd"
            }
        }, function (err, docs) {
            console.log(err)
        });
        console.log('next, 2st meal!')

        //next, 3nd meal
        setTimeout(function () {
            dataCollection.updateOne({ line_id: req.body.line_id }, {
                $set: {
                    timer_status: "3rd"
                }
            }, function (err, docs) {
                console.log(err)
            });
            console.log('next, 3th meal!')

            //3th meal time out
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
                    console.log('time out!')
                });
            }, 10000);

        }, 10000);

    }, 10000);   // 10800000 = 3 hr

});

module.exports = router;