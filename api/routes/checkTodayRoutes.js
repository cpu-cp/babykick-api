/**
 *  @POST
 *  check counting array that there is same date in array or not
 *  1 counting per day
 * 
 *  params require
 *      /check/today/<line_id>
 * 
 *  Created by CPU on 10/9/19
 */

const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const line = require('@line/bot-sdk');

const dataCollection = require('../models/dataModel');

router.post("/:lineId", (req, res, next) => {

    let today = new Date(Date.now());

    dataCollection.findOne({ line_id: req.params.lineId })
        .exec()
        .then(docs => {

            if (docs.counting.length == 0) {
                res.status(200).json({
                    add: true
                });
            }
            else {
                current = docs.counting[(docs.counting.length) - 1].date;
                let todayDate = today.toLocaleDateString();
                let currentDate = current.toLocaleDateString();

                if (todayDate == currentDate) {
                    console.log('+++++ ' + currentDate);
                    console.log('++++++ today +++++' + todayDate)

                    if (docs.extra == 'ctt') {   // mom be able to re-counting
                        res.status(200).json({
                            add: true
                        });
                    }
                    else {
                        res.status(401).json({
                            add: false,
                        });

                        / push messsage to line */
                        const client = new line.Client({
                            channelAccessToken: 'U/6mbMtkbHi+PGkWqm50UCz4tpPV2pVgMRKyLM5ewyp4QhDIqv+wiyFuKR4Vof8Gh09nAGnpbOUhuk3mrkGULX68GRZ/L3rTT/txU6+eqMWE/7DUuzKTOUH1jayB7XPCJGtXQGxQgSxjkHr1+aAV4gdB04t89/1O/w1cDnyilFU='
                        });
                        const message = [
                            {
                                type: 'text',
                                text: 'วันนี้คุณแม่นับลูกดิ้นแล้วค่ะ'
                            },
                            {
                                type: "sticker",
                                packageId: 3,
                                stickerId: 181
                            }
                        ];
                        client.pushMessage(req.params.lineId, message)
                            .then(() => {
                                console.log('check today : push message done!')
                            })
                            .catch((err) => {
                                console.log(err);
                            });
                    }
                }
                else {
                    res.status(200).json({
                        add: true
                    });
                }
            }

        }).catch(err => {
            console.log(err)
            res.json({
                message: 'line id not found.',
            });
        });
});

module.exports = router;


