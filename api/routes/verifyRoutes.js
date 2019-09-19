/**
 *  @POST
 *  check if line account is exists
 *  @completed
 * 
 *  body require
 *      line_id: string
 * 
 *  Created by CPU on 9/9/19
 */

const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const line = require('@line/bot-sdk');

const dataCollection = require('../models/dataModel');

router.post("/", (req, res, next) => {

    dataCollection.find({ line_id: req.body.line_id }, function (err, docs) {

        if (docs == "" | docs == null) {
            console.log('can create new account!');
            res.status(200).send('true');
        }
        else {
            res.status(401).send('false');          // that account is exists return false string

            / push message to line */
            const client = new line.Client({
                channelAccessToken: 'SCtu4U76N1oEXS3Ahq1EX9nBNkrtbKGdn8so1vbUZaBIXfTlxGqMldJ3Ego3GscxKGUB7MlfR3DHtTbg6hrYPGU9reSTBcCSiChuKmDCMx4FTtIPXzivaYUi3I6Yk1u/yF5k85Le0IUFrkBNxaETxFGUYhWQfeY8sLGRXgo3xvw='
            });
            const message = {
                type: 'text',
                text: 'คุณแม่ทำการลงทะเบียนเรียบร้อยแล้วค่ะ สามารถเรียกใช้งานฟังก์ชันต่าง ๆ ได้ที่เมนูด้านล่างนะคะ'
            };
            client.pushMessage(req.body.line_id, message)
                .then(() => {
                    console.log('push message veify done!')
                })
                .catch((err) => {
                    console.log(err);   // error when use fake line id 
                });
        }

    });

});

module.exports = router;