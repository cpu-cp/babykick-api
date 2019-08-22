/**
 *  POST : for save new account to mongoDB 
 *       : completed
 *   
 * 
 *  Created by CPU on 7/8/19
 */

/**
 * body required
 *     line_id: string
 *     mom_age: string
 *     ges_age_week: number
 */

const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const dataCollection = require('../models/dataModel');

router.post("/", (req, res, next) => {

    var line = req.body.line_id;

    //check input 
    if (line == null || line == "") {
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
    });


    //check if account is exists
    dataCollection.find({ line_id: req.body.line_id }, function (err, docs) {

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

            //push message to line 
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
                    text: '\u2763\ufe0f ไตรมาสที่ 1 (1-12 สัปดาห์) เรื่องที่คุณแม่จะต้องให้ความสำคัญ คือ' + '\n' + 
                    '\t \ud83c\udf71 โภชนาการ' + '\n' + 
                    '\t \ud83c\udfc3\u200d\u2640\ufe0f การออกกำลังกาย' + '\n' + 
                    '\t \ud83d\udc6b เพศสัมพันธ์ขณะตั้งครรภ์' + '\n' + 
                    '\t \ud83d\ude45\u200d\u2640\ufe0f สัญญาณอันตราย'
                },
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
                message: 'this line id already exists',
            });
        }

    });

});

module.exports = router;