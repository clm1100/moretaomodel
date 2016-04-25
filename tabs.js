/* jshint -W079 */
/* jshint -W020 */

'use strict';
var _ = require('lodash');

module.exports = function(utils, db) {
  // Model Tab Tab 页
  var TabSchema = new db.Schema({
    t: { type: String, trim:true },
    start: Date,
    end: Date,
    type: { type: Number, default: 1 },
    ref:{ type: String, trim:true },
    ads: [{ type:db.ObjectId, ref: 'Ad' }],
    position: { type: Number, required: true, default: 0 }
  }, db.schemaOptions);

  TabSchema.index({ type: 1 });
  TabSchema.index({ position: 1 });

  global.Tab = db.mongoose.model('Tab', TabSchema);

  global.TabTypes = {
    other: { t:'其他', v:0 },
    category: { t:'分类', v:1 },
    tag: { t:'标签', v:2 },
    topic: { t:'专题', v:3 },
    search: { t:'搜索', v:4 }
  };
};
