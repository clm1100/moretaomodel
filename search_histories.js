/* jshint -W079 */
/* jshint -W020 */

'use strict';
var _ = require('lodash');

module.exports = function(utils, db) {
  // Model SearchHistory 搜索历史
  var SearchHistorySchema = new db.Schema({
    t: { type: String, trim:true, index: { unique: true } },
    count: { type: Number, default: 0 }
  }, db.schemaOptions);

  SearchHistorySchema.index({ t: 1 });

  global.SearchHistory = db.mongoose.model('SearchHistory', SearchHistorySchema);
};
