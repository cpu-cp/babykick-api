/**
 *  @POST
 *  reset automatic every day at 3.00 am 
 * 
 * 
 *  Created by CPU on 14/10/19
 */

const express = require("express");
const router = express.Router();
const cron = require("node-cron");
const line = require('@line/bot-sdk');

const dataCollection = require('../models/dataModel');

router.post("/", async (req, res, next) => {

    cron.schedule('42 3 * * *', async () => {

    var arr = [];
    const finalResults = await new Promise((resolve, reject) => {
        dataCollection.find({}, {
            _id: 0, message: 0, mom_age: 0, ges_age_week: 0, week_current: 0, timer_status: 0, sdk_status: 0, extra: 0, count_type: 0, counting: 0, __v: 0
        }, function (err, docs) {
            resolve(docs)
        });
    });

    // push docs value to array
    for (var i = 0; i < finalResults.length; i++) {
        var a = finalResults[i].line_id;
        arr.push(a);
    }

    // loop for reset state
    for (var i = 0; i < finalResults.length; i++) {
        console.log('reset automatic id ' + arr[i]);

        await dataCollection.findOne({ line_id: arr[i] })
            .exec()
            .then(docs => {

                var countingLength = docs.counting.length;

                if (countingLength > 0) {
                    var _did = docs.counting[countingLength - 1]._did;
                    if (docs.count_type == 'ctt' && docs.timer_status == 'running') {
                        if (docs.counting[countingLength - 1].ctt_amount >= 10) {
                            pushMessage('ctt_good', arr[i]);
                            dataCollection.updateOne({ line_id: arr[i], 'counting._did': _did }, {
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
                            console.log(arr[i], ' reset successful : ctt : good result')
                        }
                        else {
                            pushMessage('ctt_bad', arr[i]);
                            dataCollection.updateOne({ line_id: arr[i], 'counting._did': _did }, {
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
                            console.log(arr[i], ' reset successful : ctt : bad result')
                        }
                    }
                    else if (docs.count_type == 'sdk') {
                        dataCollection.updateOne({ line_id: arr[i], 'counting._did': _did }, {
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
                        console.log(arr[i], ' reset successful : sdk')
                    }

                }
                else {
                    dataCollection.updateOne({ line_id: arr[i] }, {
                        $set: {
                            timer_status: "timeout",
                            sdk_status: 'enable',
                            extra: 'disable',
                            count_type: 'any'
                        }
                    }, function (err, docs) {
                        console.log(err);
                    });
                    console.log(arr[i] + ' reset successful')
                }

            })
            .catch(err => {
                console.log(err);
            });
    }


    function pushMessage(state, line_id) {
        if (state == 'ctt_good') {
            // console.log('ctt good')
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
            client.pushMessage(line_id, message)
                .then(() => {
                    console.log('push message ctt_good done!')
                })
                .catch((err) => {
                    console.log(err);
                });
        }
        else if (state == 'ctt_bad') {
            // console.log('ctt bad')
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
                {
                    type: "flex",
                    altText: "สายด่วน 1669",
                    contents: {
                        type: "bubble",
                        body: {
                            type: "box",
                            layout: "vertical",
                            contents: [
                                {
                                    type: "button",
                                    style: "primary",
                                    height: "sm",
                                    action: {
                                        type: "uri",
                                        label: "🚑สายด่วน 1669",
                                        uri: "tel:1669"
                                    },
                                    color: "#FF3535"
                                }
                            ]
                        }
                    }
                }
            ]
            client.pushMessage(line_id, message)
                .then(() => {
                    console.log('push message ctt_bad done!')
                })
                .catch((err) => {
                    console.log(err);
                });
        }
    }

    }, {
            scheduled: true,
            timezone: "Asia/Bangkok"
        });

    res.status(200).json({
        message: 'succesful'
    })

});

module.exports = router;