/**
 *  @POST
 *  push message to line and response count type which user can use 
 * 
 *  params require
 *      /push/onlyctt/<line_id>
 *      /push/onlysdk/<line_id>
 * 
 *  Created by CPU on 11/9/19
 */

const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const line = require('@line/bot-sdk');

const dataCollection = require('../models/dataModel');

router.post("/onlyctt/:lineId", (req, res, next) => {

    / push messsage to line */
    const client = new line.Client({
        channelAccessToken: 'U/6mbMtkbHi+PGkWqm50UCz4tpPV2pVgMRKyLM5ewyp4QhDIqv+wiyFuKR4Vof8Gh09nAGnpbOUhuk3mrkGULX68GRZ/L3rTT/txU6+eqMWE/7DUuzKTOUH1jayB7XPCJGtXQGxQgSxjkHr1+aAV4gdB04t89/1O/w1cDnyilFU='
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




router.post("/onlysdk/:lineId", (req, res, next) => {

    / push messsage to line */
    const client = new line.Client({
        channelAccessToken: 'U/6mbMtkbHi+PGkWqm50UCz4tpPV2pVgMRKyLM5ewyp4QhDIqv+wiyFuKR4Vof8Gh09nAGnpbOUhuk3mrkGULX68GRZ/L3rTT/txU6+eqMWE/7DUuzKTOUH1jayB7XPCJGtXQGxQgSxjkHr1+aAV4gdB04t89/1O/w1cDnyilFU='
    });
    const message = [
        {
            type: 'text',
            text: 'ตอนนี้คุณแม่นับได้แค่แบบ Sadovsky ค่ะ'
        }
    ];
    client.pushMessage(req.params.lineId, message)
        .then(() => {
            console.log('push only sdk : push message done!')
        })
        .catch((err) => {
            console.log(err);
        });

    res.status(200).json({
        message: 'success'
    });
});

module.exports = router;


