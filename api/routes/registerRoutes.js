/**
 *  POST : for save new account to mongoDB 
 *       : completed
 *   
 * 
 *  Created by CPU on 7/8/19
 */

 /**
  * body required
  *     line_id: string
  *     mom_age: string
  *     ges_age_week: number
  */

 const express = require("express");
 const router = express.Router();
 const mongoose = require("mongoose");
 
 const dataCollection = require('../models/dataModel');
 
 router.post("/", (req, res, next) => {
     
     var line = req.body.line_id;
 
     //check input 
     if (line == null || line == "") {
         res.json({
             status: 'error',
             message: 'please enter line id'
         });
         return null;
     }
 
     var userData = new dataCollection({
         _id: new mongoose.Types.ObjectId(),
         line_id: req.body.line_id,
         mom_age: req.body.mom_age,
         ges_age_week: req.body.ges_age_week, 
     });
 
 
     //check if account is exists
     dataCollection.find({ line_id: req.body.line_id }, function (err, docs) {
 
         if (docs == "") {
             console.log('this line id does not exist');
 
             userData.save().then(result => {
                 console.log(result);
                 res.status(201).json({
                     user: result
                 });
             })
                 .catch(err => {
                     console.log(err);
                     res.status(500).json({
                         error: err
                     });
                 });
 
         }
         else {
             res.json({
                 status: '0000',
                 message: 'this line id does exists',
             });
         }
 
     });
 
 });
 
 module.exports = router;