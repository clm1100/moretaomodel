/* jshint -W020 */

'use strict';
var _ = require('lodash');

module.exports = function(utils, db) {
  var HobbySchema = new db.Schema({
    user:{ type:db.ObjectId, ref:'User' },
    tags:[{ type:db.ObjectId, ref: 'Tag' }],
    keys:[{ type:String, trim:true }]
  }, db.schemaOptions);

  HobbySchema.index({ user:1 }, { unique:true });

  global.Hobby = db.mongoose.model('Hobby', HobbySchema);
};
