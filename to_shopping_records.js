/* jshint -W079 */
/* jshint -W020 */

'use strict';
var _ = require('lodash');

module.exports = function(utils, db) {
  // Model ToShoppingRecord 电商跳转记录
  var ToShoppingRecordSchema = new db.Schema({
    uid:{ type: String, trim:true },
    cid:{ type: String, trim:true },
    url:{ type: String, trim:true },
    at:{ type: Date, default: Date.now }
  }, db.schemaOptions);

  global.ToShoppingRecord = db.mongoose.model('ToShoppingRecord', ToShoppingRecordSchema);
};
