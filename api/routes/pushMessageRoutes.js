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
            console.log(req.params.lineId + 'pushMessage : push message <only ctt> done!')
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
        channelAccessToken: 'SCtu4U76N1oEXS3Ahq1EX9nBNkrtbKGdn8so1vbUZaBIXfTlxGqMldJ3Ego3GscxKGUB7MlfR3DHtTbg6hrYPGU9reSTBcCSiChuKmDCMx4FTtIPXzivaYUi3I6Yk1u/yF5k85Le0IUFrkBNxaETxFGUYhWQfeY8sLGRXgo3xvw='
    });
    const message = [
        {
            type: 'text',
            text: 'ตอนนี้คุณแม่นับได้แค่แบบ Sadovsky ค่ะ'
        }
    ];
    client.pushMessage(req.params.lineId, message)
        .then(() => {
            console.log(req.params.lineId + 'pushMessage : push message <only sdk> done!')
        })
        .catch((err) => {
            console.log(err);
        });

    res.status(200).json({
        message: 'success'
    });
});


router.post("/verify/:lineId", (req, res, next) => {

    / push message to line */
    const client = new line.Client({
        channelAccessToken: 'SCtu4U76N1oEXS3Ahq1EX9nBNkrtbKGdn8so1vbUZaBIXfTlxGqMldJ3Ego3GscxKGUB7MlfR3DHtTbg6hrYPGU9reSTBcCSiChuKmDCMx4FTtIPXzivaYUi3I6Yk1u/yF5k85Le0IUFrkBNxaETxFGUYhWQfeY8sLGRXgo3xvw='
    });
    const message = [
        {
            type: 'text',
            text: 'คุณแม่ต้องลงทะเบียนก่อนใช้งานการนับลูกดิ้นนะคะ'
        },
        {
            type: "flex",
            altText: "ลงทะเบียนคุณแม่",
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
                                label: "ลงทะเบียนคุณแม่",
                                uri: "line://app/1606482498-VJdOoZXR"
                            },
                            color: "#dd8cc9"
                        }
                    ]
                }
            }
        }
    ]
    client.pushMessage(req.params.lineId, message)
        .then(() => {
            console.log(req.params.lineId + 'pushMessage : go to register done!')
        })
        .catch((err) => {
            console.log(err);
        });

    res.status(200).json({
        message: 'success'
    });
});

module.exports = router;


