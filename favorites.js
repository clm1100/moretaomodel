/* jshint -W079 */
/* jshint -W020 */

'use strict';
var _ = require('lodash');

module.exports = function(utils, db) {
  var FavoriteSchema = new db.Schema({
    user: { type:db.ObjectId, ref:'User' },
    t: { type:String, trim:true, default:'默认' },
    commodities: [{ type:db.ObjectId, ref:'Commodity' }],
    is_open: { type: Boolean, default: true },
    at: { type: Date, default: Date.now }
  }, db.schemaOptions);

  FavoriteSchema.index({ user: 1 });
  FavoriteSchema.index({ is_open: 1 });
  FavoriteSchema.index({ at: -1 });

  FavoriteSchema.plugin(db.deep, { populate: {
    commodities: { select:deepSelectsForCommodity },
    'commodities.user': { select:deepSelectsForUser }
  } });
  global.Favorite = db.mongoose.model('Favorite', FavoriteSchema);
};
