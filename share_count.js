/* jshint -W079 */
/* jshint -W020 */

'use strict';
var _ = require('lodash');

module.exports = function(utils, db) {
  // Model Ad 广告
  var ShareCountSchema = new db.Schema({
    user: { type: db.ObjectId, ref: 'User' },
    clicker:{ type: db.ObjectId, ref: 'User' },
    cid: { type: String, trim:true },
    type: { type:Number },
    openid:{ type:String, trim:true }
  }, db.schemaOptions);

  global.ShareCount = db.mongoose.model('ShareCount', ShareCountSchema);

  global.ShareCountTypes = {
    other: { t: '其他', v: 0 },
    topic: { t: '原创', v: 1 },
    commodity:{ t: '商品', v: 2 },
    activity: { t: '资讯', v: 3 }
  };
};
