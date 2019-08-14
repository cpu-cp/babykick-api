var mongoose = require('mongoose');
var Schema = mongoose.Schema;


// var counttotenSchema = new Schema({
//     _id_count_to_ten: { type: String },
//     time: { type: String },
//     kick_amount: { type: Number },
//     status: { type: String },
// });

// var sadofkySchema = new Schema({
//     morning: [{
//         time: { type: String },
//         kick_amount: { type: Number },
//     }],

// });

// var weeksHistorySchema = new Schema({
//     week: { type: String },
//     days: [{
//         day: { type: String },
//         count_to_ten: counttotenSchema ,
//         sadofky: sadofkySchema,
//     }]

// });

var counttotenSchema = new Schema({
    _id_count_to_ten: { type: String },
    time: { type: String },
    kick_amount: { type: Number },
    status: { type: String },
});

var sadofkySchema = new Schema({
    morning: [{
        time: { type: String },
        kick_amount: { type: Number },
    }],

});

var weeksHistorySchema = new Schema({
    week: { type: String },
    days: [{
        day: { type: String },
        _did: {type: String},
        count_type: {type: String},
        ctt_amount: {type: Number},
        sdk_morning: {type: Number},
        sdk_lunch: {type: Number},
        sdk_dinner: {type: Number},
    }]

});

/////////  Main schema //////////
var userSchema = new Schema({
    _id: {
        type: String
    },
    line_id: {
        type: String
    },
    mom_age: {
        type: String
    },
    ges_age_week: {
        type: Number
    },
    timer_status: {
        type: String
    },
    history: [weeksHistorySchema],
});

module.exports = mongoose.model('User', userSchema);


// var weekHistorySchema = new Schema({
//     type_transfer:{
//         type: String
//     },
//     customer_transfer: {
//         type: String
//     },
//     business_transfer: {
//         type: String
//     },
//     date_time: {
//         type: String
//     },
//     amount_transfer: {
//         type: Number
//     },
// });