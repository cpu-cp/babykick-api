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
                channelAccessToken: 'U/6mbMtkbHi+PGkWqm50UCz4tpPV2pVgMRKyLM5ewyp4QhDIqv+wiyFuKR4Vof8Gh09nAGnpbOUhuk3mrkGULX68GRZ/L3rTT/txU6+eqMWE/7DUuzKTOUH1jayB7XPCJGtXQGxQgSxjkHr1+aAV4gdB04t89/1O/w1cDnyilFU='
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