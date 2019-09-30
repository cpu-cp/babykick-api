/**
 *  @POST
 *  for save new account to mongoDB 
 *  reset everything at 3.00 am
 *  completed
 * 
 *
 *  body required
 *     line_id: string
 *     mom_age: string
 *     ges_age_week: number
 *   
 * 
 *  Created by CPU on 7/8/19
 */

const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const line = require('@line/bot-sdk');
const cron = require('node-cron');

const dataCollection = require('../models/dataModel');

router.post("/", (req, res, next) => {

    var lineId = req.body.line_id;

    //check input 
    if (lineId == null || lineId == "") {
        res.json({
            status: 'error',
            message: 'please enter line id'
        });
        return null;
    }

    var userData = new dataCollection({
        _id: new mongoose.Types.ObjectId(),
        line_id: req.body.line_id,
        mom_age: req.body.mom_age,
        ges_age_week: req.body.ges_age_week,
        week_current: 0,
        timer_status: 'timeout',
        sdk_status: 'enable',
        extra: 'disable',
        count_type: 'any',
    });

    //check if account is exists
    dataCollection.find({ line_id: req.body.line_id })
        .exec()
        .then(docs => {
            if (docs == "") {
                console.log('this line id does not exist');

                userData.save()
                    .then(result => {
                        console.log(result);

                        pushMessage('register');
                        resetAutomatic();

                        res.status(201).json({
                            user: result
                        });
                    })
                    .catch(err => {
                        console.log(err);
                        res.status(500).json({
                            error: err
                        });
                    });
            }
            else {
                res.json({
                    status: '0000',
                    message: 'this line id already exists'
                });
            }
        }).catch(err => {
            console.log(err)
            res.json({
                message: 'line id not found.',
            });
        });


    function resetAutomatic() {
        cron.schedule('0 3 * * *', () => {  // 0 14
            console.log('resetAutimatic id ' + req.body.line_id);

            dataCollection.findOne({ line_id: req.body.line_id })
                .exec()
                .then(docs => {

                    var countingLength = docs.counting.length;

                    if (countingLength > 0) {
                        var _did = docs.counting[countingLength - 1]._did;
                        if (docs.count_type == 'ctt' && docs.timer_status == 'running') {
                            if (docs.counting[countingLength - 1].ctt_amount >= 10) {
                                pushMessage('ctt_good');
                                dataCollection.updateOne({ line_id: req.body.line_id, 'counting._did': _did }, {
                                    $set: {
                                        timer_status: "timeout",
                                        sdk_status: 'enable',
                                        extra: 'disable',
                                        count_type: 'any',
                                        'counting.$.status': 'close',
                                        'counting.$.result': 'ลูกดิ้นดี'
                                    }
                                }, function (err, docs) {
                                    console.log(err);
                                });
                                console.log('reset successful : ctt : good result')
                            }
                            else {
                                pushMessage('ctt_bad');
                                dataCollection.updateOne({ line_id: req.body.line_id, 'counting._did': _did }, {
                                    $set: {
                                        timer_status: "timeout",
                                        sdk_status: 'enable',
                                        extra: 'disable',
                                        count_type: 'any',
                                        'counting.$.status': 'close',
                                        'counting.$.result': 'มีความเสี่ยง'
                                    }
                                }, function (err, docs) {
                                    console.log(err);
                                });
                                console.log('reset successful : ctt : bad result')
                            }
                        }
                        else if (docs.count_type == 'sdk') {
                            dataCollection.updateOne({ line_id: req.body.line_id, 'counting._did': _did }, {
                                $set: {
                                    timer_status: "timeout",
                                    sdk_status: 'enable',
                                    extra: 'disable',
                                    count_type: 'any',
                                    'counting.$.status': 'close'
                                }
                            }, function (err, docs) {
                                console.log(err);
                            });
                            console.log('reset successful : sdk')
                        }

                    }
                    else {
                        dataCollection.updateOne({ line_id: req.body.line_id }, {
                            $set: {
                                timer_status: "timeout",
                                sdk_status: 'enable',
                                extra: 'disable',
                                count_type: 'any'
                            }
                        }, function (err, docs) {
                            console.log(err);
                        });
                        console.log('reset successful')
                    }

                })
                .catch(err => {
                    console.log(err);
                });
        }, {
                scheduled: true,
                timezone: "Asia/Bangkok"
            });
    }

    function pushMessage(state) {
        if (state == 'register') {
            / push messsage to line */
            const client = new line.Client({
                channelAccessToken: 'SCtu4U76N1oEXS3Ahq1EX9nBNkrtbKGdn8so1vbUZaBIXfTlxGqMldJ3Ego3GscxKGUB7MlfR3DHtTbg6hrYPGU9reSTBcCSiChuKmDCMx4FTtIPXzivaYUi3I6Yk1u/yF5k85Le0IUFrkBNxaETxFGUYhWQfeY8sLGRXgo3xvw='
            });
            const message = [
                {
                    type: 'text',
                    text: 'สวัสดีค่ะคุณแม่ \nตอนนี้ลูกน้อยของคุณแม่มีอายุ ' + req.body.ges_age_week + ' สัปดาห์'
                },
                {
                    type: 'text',
                    text: 'คุณแม่สามารถอ่านคำแนะนำในแต่ละไตรมาส ได้ดังนี้'
                },
                {
                    type: 'text',
                    text: '🌟ไตรมาสที่ 1 (1-12 สัปดาห์) \nเรื่องที่คุณแม่จะต้องให้ความสำคัญ คือ \n\t📍โภชนาการ \n\t📍การออกกำลังกาย \n\t📍เพศสัมพันธ์ขณะตั้งครรภ์ \n\t📍สัญญาณอันตราย \n\n🌟ไตรมาสที่ 2 (12-24 สัปดาห์) \nเรื่องที่คุณแม่จะต้องให้ความสำคัญคือ \n\t📍โภชนาการ \n\t📍การออกกำลังกาย \n\t📍การนอนหลับพักผ่อน \n\t📍เพศสัมพันธ์ขณะตั้งครรภ์ \n\t📍สัญญาณอันตราย \n\n🌟ไตรมาสที่ 3 (24 สัปดาห์ขึ้นไป) \nเรื่องที่คุณแม่จะต้องให้ความสำคัญคือ \n\t📍โภชนาการ \n\t📍การออกกำลังกาย \n\t📍การนับลูกดิ้น \n\t📍การเตรียมตัวคลอด '
                },
                // {
                //     type: "sticker",
                //     packageId: 3,
                //     stickerId: 247
                // }
            ];
            client.pushMessage(req.body.line_id, message)
                .then(() => {
                    console.log('push message done!')
                })
                .catch((err) => {
                    console.log(err);
                });
        }

        else if (state == 'ctt_good') {
            / push message to line */
            const client = new line.Client({
                channelAccessToken: 'SCtu4U76N1oEXS3Ahq1EX9nBNkrtbKGdn8so1vbUZaBIXfTlxGqMldJ3Ego3GscxKGUB7MlfR3DHtTbg6hrYPGU9reSTBcCSiChuKmDCMx4FTtIPXzivaYUi3I6Yk1u/yF5k85Le0IUFrkBNxaETxFGUYhWQfeY8sLGRXgo3xvw='
            });
            const message = [
                {
                    type: 'text',
                    text: '👍เยี่ยมมากค่ะคุณแม่ ลูกดิ้นดี 👶🏻😁'
                },
                {
                    type: 'text',
                    text: 'วันนี้คุณแม่นับลูกดิ้นเรียบร้อยแล้ว กลับมานับใหม่พรุ่งนี้นะคะ'
                }
            ]
            client.pushMessage(req.body.line_id, message)
                .then(() => {
                    console.log('push message ctt_good done!')
                })
                .catch((err) => {
                    console.log(err);  
                });
        }
        else if (state == 'ctt_bad') {
            / push message to line */
            const client = new line.Client({
                channelAccessToken: 'SCtu4U76N1oEXS3Ahq1EX9nBNkrtbKGdn8so1vbUZaBIXfTlxGqMldJ3Ego3GscxKGUB7MlfR3DHtTbg6hrYPGU9reSTBcCSiChuKmDCMx4FTtIPXzivaYUi3I6Yk1u/yF5k85Le0IUFrkBNxaETxFGUYhWQfeY8sLGRXgo3xvw='
            });
            const message = [
                {
                    type: 'text',
                    text: '⚠ วันนี้หมดเวลาการนับลูกดิ้นแล้ว แต่ลูกน้อยยังดิ้นไม่ถึง 10 ครั้งเลย ▶ ซึ่งถือเป็นสัญญาณที่บ่งบอกว่าลูกน้อยมีภาวะสุขภาพไม่ดี '
                }, {
                    type: 'text',
                    text: '❗ คุณแม่ควรรีบไปโรงพยาบาลโดยเร็วที่สุด เพื่อให้แพทย์ตรวจเช็คสุขภาพของลูกน้อยในครรภ์ หรือโทร 1669 ❗'
                },
            ]
            client.pushMessage(req.body.line_id, message)
                .then(() => {
                    console.log('push message ctt_bad done!')
                })
                .catch((err) => {
                    console.log(err); 
                });
        }
    }

});

module.exports = router;
