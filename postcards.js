/* jshint -W079 */
/* jshint -W020 */

'use strict';
var _ = require('lodash');

module.exports = function(utils, db) {
  // Model Postcard 明信片
  var PostcardSchema = new db.Schema({
    t: { type: String, trim:true },
    start: Date,
    end: Date,
    plans: {}
  }, db.schemaOptions);

  global.Postcard = db.mongoose.model('Postcard', PostcardSchema);

  // Model PostcardRecord 明信片发送记录
  var PostcardRecordSchema = new db.Schema({
    card: { type: db.ObjectId, ref: 'Postcard' },
    plan: { type: String, trim:true },
    user: { type: db.ObjectId, ref: 'User' },
    name: { type: String, trim:true },
    phone: Number,
    address: { type: String, trim:true },
    zipcode: { type: String, trim:true },
    msg: { type: String, trim:true },
    at: { type: Date, default: Date.now }
  }, db.schemaOptions);

  global.PostcardRecord = db.mongoose.model('PostcardRecord', PostcardRecordSchema);

  global.PostcardRecordStatus = {
    start: { t: '已接受', v: 1 },
    sent: { t: '已发送', v: 2 },
    received: { t: '已收到', v: 3 },
    end: { t: '已结束', v: 4 }
  };
};
