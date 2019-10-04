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
                    // console.log('+++++ ' + currentDate);
                    // console.log('++++++ today +++++' + todayDate)

                    if (docs.extra == 'ctt') {   // mom be able to re-counting
                        console.log(req.params.lineId + ' checkToday : true');
                        res.status(200).json({
                            add: true
                        });
                    }
                    else if (docs.counting[(docs.counting.length) - 1].status == '1st' || docs.counting[(docs.counting.length) - 1].status == '2nd' || docs.counting[(docs.counting.length) - 1].status == '3rd' || docs.counting[(docs.counting.length) - 1].status == 'open') {
                        console.log(req.params.lineId + ' checkToday : true');
                        res.status(200).json({
                            add: true
                        });
                    }
                    else {
                        console.log(req.params.lineId + ' checkToday : false');
                        res.status(401).json({
                            add: false,
                        });

                        / push messsage to line */
                        const client = new line.Client({
                            channelAccessToken: 'SCtu4U76N1oEXS3Ahq1EX9nBNkrtbKGdn8so1vbUZaBIXfTlxGqMldJ3Ego3GscxKGUB7MlfR3DHtTbg6hrYPGU9reSTBcCSiChuKmDCMx4FTtIPXzivaYUi3I6Yk1u/yF5k85Le0IUFrkBNxaETxFGUYhWQfeY8sLGRXgo3xvw='
                        });
                        const message = [
                            {
                                type: 'text',
                                text: 'วันนี้คุณแม่นับลูกดิ้นแล้ว ลูกดิ้นดีค่ะ 👍 สามารถกลับมานับใหม่ได้ในวันพรุ่งนี้นะคะ รออยู่นะ 🙋‍♀️ '
                            },
                            // {
                            //     type: "sticker",
                            //     packageId: 3,
                            //     stickerId: 181
                            // }
                        ];
                        client.pushMessage(req.params.lineId, message)
                            .then(() => {
                                console.log(req.params.lineId + ' checkToday : push counted message done!')
                            })
                            .catch((err) => {
                                console.log(err);
                            });
                    }
                }
                else {
                    console.log(req.params.lineId + ' checkToday : true');
                    res.status(200).json({
                        add: true
                    });
                }
            }

        }).catch(err => {
            console.log(err)
            res.status(200).json({
                account: false,
                message: 'line id not found.',
            });
        });
});

module.exports = router;


// router.get("/:lineId", (req, res, next) => {
//     const lineId = req.params.lineId;

//     Account.find({ line_id: lineId }, function (err, docs) {

//         if (docs == "") {
//             console.log('can create new account!');
//             res.status(200).send('true');
//         }
//         else {
//             res.status(200).send('false');          // that account is exists return false string
//         }

//     });

// });

// module.exports = router;