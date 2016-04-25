/* jshint -W079 */
/* jshint -W020 */

'use strict';
var _ = require('lodash');
var thunk = require('thunks')();

module.exports = function(utils, db) {
  // Model Address 用户地址
  var AddressSchema = new db.Schema({
    user: { type: db.ObjectId, ref: 'User', required: true },
    to: { type:String, trim:true, required: true },
    phone: { type:String, trim:true, required: true },
    province: { type: Number, required: true },
    city: { type: Number, required: true },
    district: { type: Number, required: true },
    street: { type: Number },
    addr: { type: String, trim:true, required: true },
    zip: { type: String, trim:true, required: true },
    desc: { type: String, trim:true },
    is_default: { type: Boolean, default: false, required: true }
  }, db.schemaOptions);

  AddressSchema.pre('save', function(next) {
    var address = this;

    if(!address.to || !address.phone || !address.addr || !address.zip || !address.province || !address.city || !address.district) {
      next();
    } else {
      thunk.all([
        thunk(function(cb) {
          var list = [address.province, address.city, address.district, address.street];
          Region.find({ code:{ $in:list } }).sort({ code:1 }).exec(function(err, regions) { cb(err, regions);});
        }),
        thunk(function(cb) {
          if(address.user && address.is_default === true) {
            Address.update({ user:address.user, _id:{ $ne:address.id } }, { $set:{ is_default:false } }, { multi:true }, function(err) {
              cb(null, null);
            });
          } else cb(null, null);
        })
      ])(function(error, results) {
        var regions = results[0];
        var province = _.isEmpty(regions[0]) ? '' : regions[0].name;
        var city = _.isEmpty(regions[1]) ? '' : regions[1].name;
        var district = _.isEmpty(regions[2]) ? '' : regions[2].name;
        var street = (regions.length < 3 || !regions[3]) ? '' : regions[3].name;
        address.desc = city + district + street + address.addr;

        next();
      });
    }
  });

  AddressSchema.index({ user: 1 });
  AddressSchema.index({ is_default: -1 });

  global.Address = db.mongoose.model('Address', AddressSchema);
};
