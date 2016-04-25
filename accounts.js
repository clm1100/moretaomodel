/* jshint -W079 */
/* jshint -W020 */

'use strict';
var _ = require('lodash');

module.exports = function(utils, db) {
  // Model Account 账户
  var AccountSchema = new db.Schema({
    user: { type:db.ObjectId, ref:'User' },
    points: { type: Number, default:0 }
  }, db.schemaOptions);

  AccountSchema.index({ user:1 }, { unique:true });

  global.Account = db.mongoose.model('Account', AccountSchema);
};
