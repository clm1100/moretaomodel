/* jshint -W079 */
/* jshint -W020 */

'use strict';
var _ = require('lodash');

module.exports = function(utils, db) {
  // Model Ad 广告
  var AdSchema = new db.Schema({
    cover: { type: String, trim:true },
    link: { type: String, trim:true },
    d: { type: String, trim:true },
    start: Date,
    end: Date,
    type: { type: Number, default: 1 },
    ref_type: { type: Number, default: 0 },
    ref:{ type: String, trim:true },
    position: { type: Number, required: true, default: 0 }
  }, db.schemaOptions);

  AdSchema.index({ type: 1 });
  AdSchema.index({ position: 1 });

  AdSchema.virtual('cover_original').get(function() {
    return this.cover ? cloudUrl + 'ad/cover/' + this.cover : null;
  });

  AdSchema.virtual('cover_cover').get(function() {
    return this.cover ? cloudUrl + 'ad/cover/' + this.cover + '!cover' : null;
  });

  AdSchema.virtual('cover_thumb').get(function() {
    return this.cover ? cloudUrl + 'ad/cover/' + this.cover + '!thumb' : null;
  });

  global.Ad = db.mongoose.model('Ad', AdSchema);

  global.AdTypes = {
    other: { t:'其他', v:0 },
    banner: { t:'首页横幅', v:1 },
    popup: { t:'首页浮动', v:2 },
    ability: { t:'首页功能', v:3 }
  };

  global.AdRefTypes = {
    other: { t:'其他', v:0 },
    activity: { t:'活动', v:1 },
    topic: { t:'攻略', v:2 },
    commodity: { t:'商品', v:3 },
    postcard: { t:'明信片', v:4 },
    tag: { t:'标签', v:5 },
    keyword: { t:'关键字', v:6 }
  };
};
