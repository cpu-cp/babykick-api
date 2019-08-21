/**
 *  POST
 *  timer for build and push image
 *   
 *  Created by CPU on 20/8/19
 */

const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const line = require('@line/bot-sdk');

const puppeteer = require('puppeteer');
const fsOld = require('fs');
const fs = require('fs-extra');
const hbs = require('handlebars');
const path = require('path');
const pdf = require('pdf-poppler');
const moment = require('moment');

const dataCollection = require("../models/dataModel");
const buildImageWeek = require('./buildImageWeek');

router.post("/", (req, res, next) => {


    var data = {
        message: "hello"
    }

    setTimeout(function () {
        buildImageWeek.buildImage(data);
        console.log('time out yeah!!!!')
    }, 3000);  // don't forget to change ms to 518400000 ms 

    res.json({
        status: true
    })
 
});

module.exports = router;



//var ImageBuilder = require('./imageBuilder');
// ImageBuilder.build(slip);
// var timestamp = Number(new Date());
//     var slip = {
//         _id: timestamp,
//         cash: input.cash,
//         change: input.change,
//         date_time: input.date_time,
//         items_data: items,
//         pos_no: input.pos_no,
//         store: {
//             branch: input.store.branch,
//             name: input.store.name,
//             reg_id: input.store.reg_id,
//             tax_id: input.store.tax_id,
//             tele: input.store.tele
//         },
//         total_item: input.total_item,
//         total_price: input.total_price
//     }