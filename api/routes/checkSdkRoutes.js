/**
 *  @POST
 *  check present time for use sdk
 *  can set state to ctt (gotoCtt)
 *  04.00 - 10.00
 * 
 *  params require
 *      /check/sdk/<line_id>
 * 
 *  Created by CPU on 10/9/19
 */

const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const line = require('@line/bot-sdk');

const dataCollection = require('../models/dataModel');

router.post("/:lineId", (req, res, next) => {

    let today = new Date(Date.now());
    let time = today.toLocaleTimeString('en-TH', { hour12: false });
    // let time = '00:00:00'
    var availableTime = false;
    var ctt = false;

    // console.log(time)
    // console.log(time.slice(0, 2))

    dataCollection.findOne({ line_id: req.params.lineId })
        .exec()
        .then(docs => {

            var countingLength = docs.counting.length;
            // console.log(countingLength)

            if (countingLength > 0) {
                // console.log('have array')

                if (docs.timer_status == 'timeout') {

                    if (docs.counting[countingLength - 1].status == 'close') {    // start morning
                        checkAvailableTime('close', time, 'timeout');
                    }
                    else if (docs.counting[countingLength - 1].status == '1st') {   // start lunch
                        checkAvailableTime('1st', time, 'timeout');
                    }
                    else if (docs.counting[countingLength - 1].status == '2nd') {   // start dinner
                        checkAvailableTime('2nd', time, 'timeout');
                    }
                    else if (docs.counting[countingLength - 1].status == 'open') {
                        availableTime = false
                        console.log('whyy!? open?? this is the route for sdk, not ctt');
                    }
                }
                else {

                    if (docs.counting[countingLength - 1].status == '1st') {        // continue mornig
                        checkAvailableTimeRunning('1st', time, 'running')
                    }
                    else if (docs.counting[countingLength - 1].status == '2nd') {   // continue lunch
                        checkAvailableTimeRunnning('2nd', time, 'running')
                    }
                    else if (docs.counting[countingLength - 1].status == '3rd') {   // continue dinner
                        checkAvailableTimeRunning('3rd', time, 'running')
                    }
                    else if (docs.counting[countingLength - 1].status == 'extra') { // continue extra
                        availableTime = true;
                    }
                    else if (docs.counting[countingLength - 1].status == 'open') {
                        availableTime = false;
                        console.log('whyy!? open?? this is the route for sdk, not ctt');
                    }
                }

            }
            else {
                checkAvailableTime('close', time, 'timeout');
                // console.log('no array')
            }


            if (availableTime == false) {
                if (ctt == false) {
                    pushMessage('unavailable');
                    res.status(401).json({
                        sdk: false,
                        sdk_status: 'enable',
                        time: time,
                        message: 'see you again lunch or dinner'
                    });
                }
                else if (ctt == true) {
                    pushMessage('goto_ctt');
                    res.status(401).json({
                        sdk: false,
                        sdk_status: 'disable',
                        time: time,
                        message: 'you have to go to ctt'
                    });
                }
            }
            else {
                res.status(200).json({
                    sdk: true,
                    sdk_status: 'enable',
                    time: time
                });
            }

        }).catch(err => {
            console.log(err)
            res.status(200).json({
                account: false,
                message: 'line id not found.',
            });
        });


    function pushMessage(state) {
        if (state == 'unavailable') {
            / push message to line */
            const client = new line.Client({
                channelAccessToken: 'SCtu4U76N1oEXS3Ahq1EX9nBNkrtbKGdn8so1vbUZaBIXfTlxGqMldJ3Ego3GscxKGUB7MlfR3DHtTbg6hrYPGU9reSTBcCSiChuKmDCMx4FTtIPXzivaYUi3I6Yk1u/yF5k85Le0IUFrkBNxaETxFGUYhWQfeY8sLGRXgo3xvw='
            });
            const message = [
                {
                    type: 'text',
                    text: 'ยังไม่ถึงเวลาการใช้ Sadovsky \n\tมื้อเช้า 4:00-10:00 \n\tมื้อเที่ยง 11:30-14:00 \n\tมื้อเย็น 17:00-21:00'
                },
            ]
            client.pushMessage(req.params.lineId, message)
                .then(() => {
                    console.log(req.params.lineId + ' checkSdk : push message unavailable done!')
                })
                .catch((err) => {
                    console.log(err);   // error when use fake line id 
                });
        }
        else if (state == 'goto_ctt') {
            / push message to line */
            const client = new line.Client({
                channelAccessToken: 'SCtu4U76N1oEXS3Ahq1EX9nBNkrtbKGdn8so1vbUZaBIXfTlxGqMldJ3Ego3GscxKGUB7MlfR3DHtTbg6hrYPGU9reSTBcCSiChuKmDCMx4FTtIPXzivaYUi3I6Yk1u/yF5k85Le0IUFrkBNxaETxFGUYhWQfeY8sLGRXgo3xvw='
            });
            const message = [
                {
                    type: 'text',
                    text: 'เลยกำหนดเวลาการนับ Sadovsky คุณแม่ต้องนับโดยใช้วิธี Count to ten นะคะ 😁'
                },
            ]
            client.pushMessage(req.params.lineId, message)
                .then(() => {
                    console.log(req.params.lineId + ' checkSdk : push message go to ctt done!')
                })
                .catch((err) => {
                    console.log(err);   // error when use fake line id 
                });
        }

    }


    function gotoCtt(state) {
        if (state == 'close') {     // wouldn't delete array
            dataCollection.findOne({ line_id: req.params.lineId })
                .exec()
                .then(docs => {
                    dataCollection.updateOne({ line_id: req.params.lineId }, {
                        $set: {
                            timer_status: "timeout",
                            sdk_status: 'disable',
                            extra: 'disable',
                            count_type: 'ctt'
                        }
                    }, function (err, docs) {
                        console.log(err);
                    });
                }).catch(err => {
                    console.log(err)
                });
        }
        else {                    // would delete array and then create replace array
            dataCollection.findOne({ line_id: req.params.lineId })
                .exec()
                .then(docs => {

                    var _did = docs.counting[(docs.counting.length) - 1]._did;

                    dataCollection.updateOne({ line_id: req.params.lineId, 'counting._did': _did }, {
                        $set: {
                            timer_status: "timeout",
                            sdk_status: 'disable',
                            extra: 'ctt',
                            count_type: 'ctt',
                            'counting.$.status': 'close'
                        }
                    }, function (err, docs) {
                        console.log(err);
                    });
                }).catch(err => {
                    console.log(err)
                });
        }

    }

    // close
    function checkAvailableTime(status, time, state) {

        if (status == 'close') {    // 4.00-10.00
            switch (parseInt(time.slice(0, 2))) {
                case 04:
                    availableTime = true;
                    break;
                case 05:
                    availableTime = true;
                    break;
                case 06:
                    availableTime = true;
                    break;
                case 07:
                    availableTime = true;
                    break;
                case 08:
                    availableTime = true;
                    break;
                case 09:
                    availableTime = true;
                    break;
            }

            // greater than 10.00 go to ctt
            if (parseInt(time.slice(0, 2)) >= 10 && parseInt(time.slice(0, 2)) < 24 && state == 'timeout') {
                ctt = true;
                gotoCtt('close');
            }
            // if (parseInt(time.slice(0, 2)) >= 0 && parseInt(time.slice(0, 2)) < 4 && state == 'timeout') {
            //     ctt = false;
            //     console.log('unavailable msg')
            // }
        }
        else if (status == '1st') {   // 11.30-14.00
            switch (parseInt(time.slice(0, 2))) {
                case 11:
                    if (parseInt(time.slice(3, 5)) >= 30 && parseInt(time.slice(3, 5)) <= 59) {
                        availableTime = true;
                    }
                    break;
                case 12:
                    availableTime = true;
                    break;
                case 13:
                    availableTime = true;
                    break;
            }

            // greater than 14.00 go to ctt
            if (parseInt(time.slice(0, 2)) >= 14 && parseInt(time.slice(0, 2)) < 24 && state == 'timeout') {
                ctt = true;
                gotoCtt('1st');
            }
        }
        else if (status == '2nd') {     // 17.00-21.00
            switch (parseInt(time.slice(0, 2))) {
                case 17:
                    availableTime = true;
                    break;
                case 18:
                    availableTime = true;
                    break;
                case 19:
                    availableTime = true;
                    break;
                case 20:
                    availableTime = true;
                    break;
            }

            // greater than 21.00 go to ctt
            if (parseInt(time.slice(0, 2)) >= 21 && parseInt(time.slice(0, 2)) < 24 && state == 'timeout') {
                ctt = true;
                gotoCtt('2nd');
            }
        }

        console.log(req.params.lineId + ' checkSdk : availableTime = ' + availableTime);
    }



    //running
    function checkAvailableTimeRunning(status, time, state) {
        if (status == '1st') {    // 4.00-10.00
            switch (parseInt(time.slice(0, 2))) {
                case 04:
                    availableTime = true;
                    break;
                case 05:
                    availableTime = true;
                    break;
                case 06:
                    availableTime = true;
                    break;
                case 07:
                    availableTime = true;
                    break;
                case 08:
                    availableTime = true;
                    break;
                case 09:
                    availableTime = true;
                    break;
            }

            // greater than 10.00 go to ctt
            if (parseInt(time.slice(0, 2)) >= 10 && parseInt(time.slice(0, 2)) < 24 && state == 'timeout') {
                ctt = true;
                gotoCtt('close');
            }
        }
        else if (status == '2nd') {   // 11.30-14.00
            switch (parseInt(time.slice(0, 2))) {
                case 11:
                    if (parseInt(time.slice(3, 5)) >= 30 && parseInt(time.slice(3, 5)) <= 59) {
                        availableTime = true;
                    }
                    break;
                case 12:
                    availableTime = true;
                    break;
                case 13:
                    availableTime = true;
                    break;
            }

            // greater than 14.00 go to ctt
            if (parseInt(time.slice(0, 2)) >= 14 && parseInt(time.slice(0, 2)) < 24 && state == 'timeout') {
                ctt = true;
                gotoCtt('1st');
            }
        }
        else if (status == '3rd') {     // 17.00-21.00
            switch (parseInt(time.slice(0, 2))) {
                case 17:
                    availableTime = true;
                    break;
                case 18:
                    availableTime = true;
                    break;
                case 19:
                    availableTime = true;
                    break;
                case 20:
                    availableTime = true;
                    break;
            }

            // greater than 21.00 go to ctt
            if (parseInt(time.slice(0, 2)) >= 21 && parseInt(time.slice(0, 2)) < 24 && state == 'timeout') {
                ctt = true;
                gotoCtt('2nd');
            }
        }
        console.log(req.params.lineId + ' checkSdk : availableTime = ' + availableTime);
    }

});

module.exports = router;