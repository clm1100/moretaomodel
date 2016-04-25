/* jshint -W079 */
/* jshint -W020 */

'use strict';
var _ = require('lodash');

module.exports = function(utils, db) {
  // Model Suggest 用户建议
  var SuggestSchema = new db.Schema({
    user: { type: db.ObjectId, ref: 'User' },
    desc: { type: String, trim:true },
    c: { type: String, trim:true },
    reply: { type: Boolean, default: false },
    at: { type: Date, default: Date.now }
  }, db.schemaOptions);

  SuggestSchema.index({ user: 1 });

  global.Suggest = db.mongoose.model('Suggest', SuggestSchema);
};
