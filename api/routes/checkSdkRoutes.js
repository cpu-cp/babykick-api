/**
 *  @POST
 *  check present time for use sdk
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
    // let time = '21:00:00'
    var availableTime = false;

    console.log(time)
    console.log(time.slice(0, 2))

    dataCollection.findOne({ line_id: req.params.lineId })
        .exec()
        .then(docs => {

            var countingLength = docs.counting.length;

            if (docs.counting.lenght > 0) {
                console.log('have array')

                if (docs.timer_status == 'timeout') {
                    
                    if (docs.counting[countingLength - 1].status == 'close') {    // start morning
                        checkAvailableTime('close', time);
                    }
                    else if (docs.counting[countingLength - 1].status == '1st') {   // start lunch
                        checkAvailableTime('1st', time);
                    }
                    else if (docs.counting[countingLength - 1].status == '2nd') {   // start dinner
                        checkAvailableTime('2nd', time);
                    }
                    else if (docs.counting[countingLength - 1].status == 'open') {
                        availableTime = false
                        console.log('whyy!? open?? this is the route for sdk, not ctt');
                    }
                }
                else {
                    if (docs.counting[countingLength - 1].status == '1st') {        // continue mornig
                        checkAvailableTime('close', time)
                    }
                    else if (docs.counting[countingLength - 1].status == '2nd') {   // continue lunch
                        checkAvailableTime('1st', time)
                    }
                    else if (docs.counting[countingLength - 1].status == '3nd') {   // continue dinner
                        checkAvailableTime('2nd', time)
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
                checkAvailableTime('close', time);
                console.log('no array')
            }


            if (availableTime == false) {
                pushMessage();
                res.status(401).json({
                    sdk: false,
                    time: time
                });
            }
            else {
                res.status(200).json({
                    sdk: true,
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


    function pushMessage() {
        / push message to line */
        const client = new line.Client({
            channelAccessToken: 'SCtu4U76N1oEXS3Ahq1EX9nBNkrtbKGdn8so1vbUZaBIXfTlxGqMldJ3Ego3GscxKGUB7MlfR3DHtTbg6hrYPGU9reSTBcCSiChuKmDCMx4FTtIPXzivaYUi3I6Yk1u/yF5k85Le0IUFrkBNxaETxFGUYhWQfeY8sLGRXgo3xvw='
        });
        const message = [
            {
                type: 'text',
                text: 'ยังไม่ถึงเวลาการใช้ Sadovsky หรือ เลยกำหนดเวลา \n\tมื้อเช้า 4:00-10:00 \n\tมื้อเที่ยง 11:30-14:00 \n\tมื้อเย็น 17:00-21:00'
            },
        ]
        client.pushMessage(req.params.lineId, message)
            .then(() => {
                console.log('push message unavailable done!')
            })
            .catch((err) => {
                console.log(err);   // error when use fake line id 
            });
    }


    function gotoCtt() {
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


    function checkAvailableTime(status, time) {
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
            if (parseInt(time.slice(0, 2)) >= 10 && parseInt(time.slice(0, 2)) < 24) {
                // gotoCtt();
            }
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
            if (parseInt(time.slice(0, 2)) >= 14 && parseInt(time.slice(0, 2)) < 24) {
                // gotoCtt();
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
            if (parseInt(time.slice(0, 2)) >= 21 && parseInt(time.slice(0, 2)) < 24) {
                // gotoCtt();
            }
        }

        console.log('availableTime = ' + availableTime);
    }

});

module.exports = router;




// switch (parseInt(todayTime.slice(0, 2))) {
//     case 04:
//         sdk = true;
//         break;
//     case 05:
//         sdk = true;
//         break;
//     case 06:
//         sdk = true;
//         break;
//     case 07:
//         sdk = true;
//         break;
//     case 08:
//         sdk = true;
//         break;
//     case 09:
//         sdk = true;
//         break;
// }

// if (sdk == true) {           // if request in 4.00-8.00
//     res.json({
//         sdk: true
//     });
// }
// else {
//     res.json({
//         sdk: false
//     });
// }
