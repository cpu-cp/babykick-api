/**
 *  @POST
 *  check button type clicked 
 * 
 *  body require
 *      line_id: string
 *      btn_type: string
 * 
 *  Created by CPU on 22/9/19
 */

const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const line = require('@line/bot-sdk');

const dataCollection = require('../models/dataModel');

router.post("/", (req, res, next) => {

    dataCollection.findOne({ line_id: req.body.line_id })
        .exec()
        .then(docs => {

            if (req.body.btn_type == docs.count_type) {
                console.log(req.body.line_id + ' checkButton : match = true')
                res.status(200).json({
                    match: true,
                    message: 'you can click ' + req.body.btn_type
                });
            }
            else {
                if (docs.count_type == 'any') {
                    console.log(req.body.line_id + ' checkButton : match = true')
                    res.status(200).json({
                        match: true,
                        message: 'user can click any button'
                    });
                }
                else {
                    console.log(req.body.line_id + ' checkButton : match = false')
                    res.status(200).json({
                        match: false,
                        message: 'you can not click ' + req.body.btn_type
                    });

                    let type;
                    if (docs.count_type == 'ctt') {
                        text = 'คุณแม่กำลังนับลูกดิ้น กดไม่ได้นะ'
                        type = 'Count to ten';
                    }
                    else {
                        text = 'คุณแม่กำลังนับลูกดิ้น กดไม่ได้นะ'
                        type = 'Sadovsky';
                    }

                    let msg = text + '\nตอนนี้คุณแม่นับได้แค่แบบ ' + type + ' ค่ะ';

                    / push messsage to line */
                    const client = new line.Client({
                        channelAccessToken: 'SCtu4U76N1oEXS3Ahq1EX9nBNkrtbKGdn8so1vbUZaBIXfTlxGqMldJ3Ego3GscxKGUB7MlfR3DHtTbg6hrYPGU9reSTBcCSiChuKmDCMx4FTtIPXzivaYUi3I6Yk1u/yF5k85Le0IUFrkBNxaETxFGUYhWQfeY8sLGRXgo3xvw='
                    });
                    const message = [
                        {
                            type: 'text',
                            text: msg
                        }
                    ];
                    client.pushMessage(req.body.line_id, message)
                        .then(() => {
                            console.log(req.body.line_id + ' checkButton : push message <dont match> done!')
                        })
                        .catch((err) => {
                            console.log(err);
                        });
                }
            }

        }).catch(err => {
            console.log(err)
            res.status(401).json({
                account: false,
                message: 'line id not found.',
            });
        });
});

module.exports = router;


