/**
 *  @POST
 *  push message to line when close web
 *  @completed
 * 
 *  body require
 *      line_id: string,
 *      status_web: 'exit'
 * 
 *  Created by CPU on 9/9/19
 */

const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const line = require('@line/bot-sdk');

const dataCollection = require('../models/dataModel');

router.post("/", (req, res, next) => {

    if (req.body.status_web == 'exit') {
        res.status(200).json({ message: 'web is closed' });

        dataCollection.findOne({ line_id: req.body.line_id })
            .exec()
            .then(docs => {
                if (docs.counting[(docs.counting.length) - 1].count_type == 'CTT') {
                    / push message to line */
                    const client = new line.Client({
                        channelAccessToken: 'U/6mbMtkbHi+PGkWqm50UCz4tpPV2pVgMRKyLM5ewyp4QhDIqv+wiyFuKR4Vof8Gh09nAGnpbOUhuk3mrkGULX68GRZ/L3rTT/txU6+eqMWE/7DUuzKTOUH1jayB7XPCJGtXQGxQgSxjkHr1+aAV4gdB04t89/1O/w1cDnyilFU='
                    });
                    const message = [
                        {
                            type: 'text',
                            text: 'คุณแม่ยังนับไม่ครบเลย อย่าลืมกลับมานับต่อนะคะ'
                        },
                        {
                            type: "flex",
                            altText: "นับลูกดิ้นแบบ Count to ten ต่อ",
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
                                                label: "นับลูกดิ้นแบบ Count to ten ต่อ",
                                                uri: "line://app/1606482498-mYZjO7zo"
                                            },
                                            color: "#dd8cc9"
                                        }
                                    ]
                                }
                            }
                        }
                    ]
                    client.pushMessage(req.body.line_id, message)
                        .then(() => {
                            console.log('push message verify done!')
                        })
                        .catch((err) => {
                            console.log(err);   // error when use fake line id 
                        });
                }
                else {
                    / push message to line */
                    const client = new line.Client({
                        channelAccessToken: 'U/6mbMtkbHi+PGkWqm50UCz4tpPV2pVgMRKyLM5ewyp4QhDIqv+wiyFuKR4Vof8Gh09nAGnpbOUhuk3mrkGULX68GRZ/L3rTT/txU6+eqMWE/7DUuzKTOUH1jayB7XPCJGtXQGxQgSxjkHr1+aAV4gdB04t89/1O/w1cDnyilFU='
                    });
                    const message = [
                        {
                            type: 'text',
                            text: 'คุณแม่ยังนับไม่ครบเลย อย่าลืมกลับมานับต่อนะคะ'
                        },
                        {
                            type: "flex",
                            altText: "นับลูกดิ้นแบบ Sadovsky ต่อ",
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
                                                label: "นับลูกดิ้นแบบ Sadovsky ต่อ",
                                                uri: "line://app/1606482498-lJ8JkE6d"
                                            },
                                            color: "#dd8cc9"
                                        }
                                    ]
                                }
                            }
                        }
                    ]

                    client.pushMessage(req.body.line_id, message)
                        .then(() => {
                            console.log('push message verify done!')
                        })
                        .catch((err) => {
                            console.log(err);   // error when use fake line id 
                        });
                }
            }).catch(err => {
                console.log(err)
                res.json({
                    message: 'error',
                });
            });


    }
    else {
        res.status(200).json({ message: 'web is openning' });          // that account is exists return false string
    }

});

module.exports = router;


