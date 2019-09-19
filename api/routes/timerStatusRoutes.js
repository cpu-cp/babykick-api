/**
 *  @GET
 *  send timer status
 *  completed
 * 
 *
 *  body required
 *     line_id: string
 *   
 * 
 *  Created by CPU on 1/9/19.
 */

const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

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

    //send response
    dataCollection.findOne({ line_id: req.body.line_id })
        .exec()
        .then(docs => {
            res.json({
                timer_status: docs.timer_status,
                sdk_status: docs.sdk_status,
                extra: docs.extra,
                count_type: docs.counting[(docs.counting.length) - 1].count_type
            });
        }).catch(err => {
            console.log(err)
            res.json({
                message: 'line id not found.',
            });
        });


    function pushLine() {
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
                client.pushMessage(req.body.line_id, message)
                    .then(() => {
                        console.log('push message go to ctt done!')
                    })
                    .catch((err) => {
                        console.log(err);   // error when use fake line id 
                    });
    }
});

module.exports = router;

// return Promise.reject(err);
