/* jshint -W079 */
/* jshint -W020 */

'use strict';
var _ = require('lodash');

module.exports = function(utils, db) {
  var ComplaintSchema = new db.Schema({
    user: { type:db.ObjectId, ref:'User' },
    commodity: { type:db.ObjectId, ref:'Commodity' },
    reason: { type:String, trim:true },
    processed: { type:Boolean, default:false },
    at: { type:Date, default:Date.now }
  }, db.schemaOptions);

  ComplaintSchema.index({ user: 1 });
  ComplaintSchema.index({ commodity: 1 });

  global.Complaint = db.mongoose.model('Complaint', ComplaintSchema);
};
