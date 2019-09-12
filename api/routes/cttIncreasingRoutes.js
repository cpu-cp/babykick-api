/**
 *  @POST
 *  for count to ten
 *  check current week/day
 *  pretty complete
 * 
 * 
 *  params required
 *      /ctt/increasing/<line_id>
 * 
 * 
 *  Created by CPU on 11/8/19
 */

const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const line = require('@line/bot-sdk');

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
                res.json(docs.counting)
                var countingLength = docs.counting.length;
                var week = Math.ceil(countingLength / 7);
                var day = countingLength % 7;

                var currentDay;
                var currentWeek;
                var _did = (week.toString() + 'w' + day.toString() + 'd').toString();

                if (countingLength == 0) {                      // if there isn't history data
                    console.log('empty array');
                    newDay('1', '1', 'date');
                }
                else if (countingLength >= 1) {
                    console.log('there is counting data');

                    if (docs.timer_status == 'running') {
                        console.log('timer is running');
                        console.log('array status is ' + docs.counting[countingLength - 1].status);

                        if (docs.counting[countingLength - 1].status == 'open') {
                            console.log('ctt amount is ' + docs.counting[countingLength - 1].ctt_amount)

                            if (docs.counting[countingLength - 1].ctt_amount == 9) {
                                onDay('close', _did);
                                setResult(_did);
                            }
                            else {
                                console.log(_did);
                                onDay('open', _did);
                            }
                        }
                        else {  // if status is close
                            console.log('now status is close')
                        }

                    }
                    else {
                        console.log('now status is time out')
                        // push message to line 'time out'
                    }
                }
            }
        }).catch(err => {
            console.log(err)
            res.json({
                message: 'line id not found.',
            });
        });


    function newDay(currentWeek, currentDay, date) {
        dataCollection.updateOne({ line_id: lineId }, {
            $push: {
                counting: {
                    week: currentWeek,
                    day: currentDay,
                    _did: currentWeek + 'w' + currentDay + 'd',
                    date: date,
                    count_type: 'CTT',
                    ctt_amount: 1,
                    status: 'open'
                }
            }
        }, function (err, docs) {
            console.log(err)
        });
        console.log('add new day successfully!');
    }

    function onDay(status, _did) {
        if (status == 'close') {

            dataCollection.findOneAndUpdate({ line_id: lineId, 'counting._did': _did },
                {
                    $set: {
                        timer_status: 'timeout'
                    }
                },
                function (err, docs) {
                    console.log(err);
                    console.log('today complete!!');
                }
            );

            / push message to line */
            const client = new line.Client({
                channelAccessToken: 'SCtu4U76N1oEXS3Ahq1EX9nBNkrtbKGdn8so1vbUZaBIXfTlxGqMldJ3Ego3GscxKGUB7MlfR3DHtTbg6hrYPGU9reSTBcCSiChuKmDCMx4FTtIPXzivaYUi3I6Yk1u/yF5k85Le0IUFrkBNxaETxFGUYhWQfeY8sLGRXgo3xvw='
            });
            const message = [
                {
                    type: 'text',
                    text: 'ยินดีด้วยค่ะ วันนี้ลูกดิ้นดีนะคะ'
                },
                {
                    type: 'text',
                    text: 'พรุ่งนี้อย่าลืมแวะมานับใหม่น้า'
                },
                {
                    type: "sticker",
                    packageId: 3,
                    stickerId: 184
                }
            ]
            client.pushMessage(lineId, message)
                .then(() => {
                    console.log('push message done!')
                })
                .catch((err) => {
                    console.log(err);   // error when use fake line id 
                });
        }

        dataCollection.findOneAndUpdate({ line_id: lineId, 'counting._did': _did },
            {
                $inc: {
                    'counting.$.ctt_amount': 1
                },
                $set: {
                    'counting.$.status': status
                }
            },
            // {
            //     arrayFilters: [{ 'd._did': _did }]
            // },
            function (err, docs) {
                console.log(err);
            }
        );
        console.log('increase ctt amount successfully!');
    }


    function setResult(_did) {
        dataCollection.findOneAndUpdate({ line_id: lineId, 'counting._did': _did },
            {
                $set: {
                    'counting.$.result': 'ลูกดิ้นดี'
                }
            },
            function (err, docs) {
                console.log(err);
                console.log('ctt inc : set result complete');
            }
        );
    }

});

module.exports = router;