/* jshint -W079 */
/* jshint -W020 */

'use strict';
var _ = require('lodash');

module.exports = function(utils, db) {
  // Model Region 区域
  var RegionSchema = new db.Schema({
    code: { type: Number, required: true },
    name: { type:String, trim:true, required: true },
    parent: { type: Number, required: true },
    level: { type:Number, required: true }
  }, db.schemaOptions);

  RegionSchema.index({ code: 1 });
  RegionSchema.index({ parent: 1 });
  RegionSchema.index({ level: 1 });

  global.Region = db.mongoose.model('Region', RegionSchema);
};
