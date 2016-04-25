/* jshint -W079 */
/* jshint -W020 */

'use strict';
var _ = require('lodash');

module.exports = function(utils, db) {
  // Model PublishTask 定期发布
  var PublishTaskSchema = new db.Schema({
    t:{ type: String, trim:true },
    cid: { type: String, trim:true },
    type: Number,
    time: Date
  }, db.schemaOptions);

  global.PublishTask = db.mongoose.model('PublishTask', PublishTaskSchema);

  global.PublishTaskTypes = {
    topic: { t:'攻略', v:0 },
    commodity: { t:'商品', v:1 },
    activity: { t:'资讯', v:2 },
    ad: { t:'广告', v:3 }
  };
};
