/* jshint -W079 */
/* jshint -W020 */

'use strict';
var _ = require('lodash');

module.exports = function(utils, db) {
  global.FragmentGroupNames = {
    home_main:'home_main'
  };

  // Model Fragment 页面片段
  var FragmentSchema = new db.Schema({
    group:{ type:String, trim:true, required:true },
    desc:{ type:String, trim:true },
    ads: [{ type:db.ObjectId, ref: 'Ad' }],
    order: { type:Number, default:0 }
  }, db.schemaOptions);

  FragmentSchema.index({ group:1 });
  FragmentSchema.index({ order:1 });

  global.Fragment = db.mongoose.model('Fragment', FragmentSchema);
};
