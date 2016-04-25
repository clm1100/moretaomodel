/* jshint -W079 */
/* jshint -W020 */

'use strict';
var _ = require('lodash');

module.exports = function(utils, db) {
  // Model Checkin 签到
  var CheckinSchema = new db.Schema({
    user: { type:db.ObjectId, ref:'User' },
    serial: {type: Number, default: 0 },
    date: [Date],
    at: Date
  }, db.schemaOptions);

  global.Checkin = db.mongoose.model('Checkin', CheckinSchema);

  global.Score = {
    '1': 10,
    '2': 20
  }

};
