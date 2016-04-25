/* jshint -W079 */
/* jshint -W020 */

'use strict';
var _ = require('lodash');

module.exports = function(utils, db) {
  var CategorySchema = new db.Schema({
    t: { type:String, trim:true, required: true },
    path: { type:String, trim:true },
    parent: { type:db.ObjectId, ref:'Category' }
  }, db.schemaOptions);

  CategorySchema.index({ t:1 });
  CategorySchema.index({ path:1 });
  CategorySchema.index({ parent:1 });

  global.Category = db.mongoose.model('Category', CategorySchema);
};
