/**
 *  @POST
 *  push message to line if timer_status is 'timeout' && sdk_status is 'disble'
 * 
 *  params require
 *      /push/onlyctt/<line_id>
 * 
 *  Created by CPU on 11/9/19
 */

const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const line = require('@line/bot-sdk');

const dataCollection = require('../models/dataModel');

router.post("/:lineId", (req, res, next) => {

    / push messsage to line */
    const client = new line.Client({
        channelAccessToken: 'SCtu4U76N1oEXS3Ahq1EX9nBNkrtbKGdn8so1vbUZaBIXfTlxGqMldJ3Ego3GscxKGUB7MlfR3DHtTbg6hrYPGU9reSTBcCSiChuKmDCMx4FTtIPXzivaYUi3I6Yk1u/yF5k85Le0IUFrkBNxaETxFGUYhWQfeY8sLGRXgo3xvw='
    });
    const message = [
        {
            type: 'text',
            text: 'ตอนนี้คุณแม่นับได้แค่แบบ Count to ten ค่ะ'
        }
    ];
    client.pushMessage(req.params.lineId, message)
        .then(() => {
            console.log('push only ctt : push message done!')
        })
        .catch((err) => {
            console.log(err);
        });

    res.status(200).json({
        message: 'success'
    });
});

module.exports = router;


