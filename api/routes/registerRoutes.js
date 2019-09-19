/**
 *  @POST
 *  for save new account to mongoDB 
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
    });

    //check if account is exists
    dataCollection.find({ line_id: req.body.line_id })
        .exec()
        .then(docs => {

            if (docs == "") {
                console.log('this line id does not exist');

                userData.save().then(result => {
                    console.log(result);
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
                        text: '🌟ไตรมาสที่ 1 (1-12 สัปดาห์) \nเรื่องที่คุณแม่จะต้องให้ความสำคัญ คือ \n\t📍โภชนาการ \n\t📍การออกกำลังกาย \n\t📍เพศสัมพันธ์ขณะตั้งครรภ์ \n\t📍สัญญาณอันตราย \n🌟ไตรมาสที่ 2 (12-24 สัปดาห์) \nเรื่องที่คุณแม่จะต้องให้ความสำคัญคือ \n\t📍โภชนาการ \n\t📍การออกกำลังกาย \n\t📍การนอนหลับพักผ่อน \n\t📍เพศสัมพันธ์ขณะตั้งครรภ์ \n\t📍สัญญาณอันตราย \n🌟ไตรมาสที่ 3 (24 สัปดาห์ขึ้นไป) \nเรื่องที่คุณแม่จะต้องให้ความสำคัญคือ \n\t📍โภชนาการ \n\t📍การออกกำลังกาย \n\t📍การนับลูกดิ้น \n\t📍การเตรียมตัวคลอด '
                    },
                    {
                        type: "sticker",
                        packageId: 3,
                        stickerId: 247
                    }
                ];

                client.pushMessage(req.body.line_id, message)
                    .then(() => {
                        console.log('push message done!')
                    })
                    .catch((err) => {
                        console.log(err);
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

});

module.exports = router;

// '\u2763\ufe0f ไตรมาสที่ 1 (1-12 สัปดาห์) เรื่องที่คุณแม่จะต้องให้ความสำคัญ คือ\n\ud83c\udf71 โภชนาการ\n\ud83c\udfc3\u200d\u2640\ufe0f การออกกำลังกาย\n\ud83d\udc6b เพศสัมพันธ์ขณะตั้งครรภ์\n\ud83d\ude45\u200d\u2640\ufe0f สัญญาณอันตราย'

// 🌟ไตรมาสที่ 2 (12-24 สัปดาห์)
// เรื่องที่คุณแม่จะต้องให้ความสำคัญคือ
//        📍โภชนาการ
//        📍การออกกำลังกาย
//        📍การนอนหลับพักผ่อน
//        📍เพศสัมพันธ์ขณะตั้งครรภ์
//        📍สัญญาณอันตราย
// 🌟ไตรมาสที่ 3 (24 สัปดาห์ขึ้นไป)
// เรื่องที่คุณแม่จะต้องให้ความสำคัญคือ
//        📍โภชนาการ
//        📍การออกกำลังกาย
//        📍การนับลูกดิ้น
//        📍การเตรียมตัวคลอด 