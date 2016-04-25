/* jshint -W079 */
/* jshint -W020 */

'use strict';
var _ = require('lodash');
var bcrypt = require('bcryptjs');

module.exports = function(utils, db) {
  // Model Admin 管理员
  var AdminSchema = new db.Schema({
    nickname: { type: String, trim:true, required: true },
    mobile: { type: String, trim:true, required: true },
    email: { type: String, trim:true },
    pass: { type: String, trim:true },
    confirm_pass: { type: String, trim:true },
    encrypted_password: { type: String, trim:true },
    last_sign_in_at: Date,
    last_sign_in_ip: { type: String, trim:true }
  }, db.schemaOptions);

  AdminSchema.index({ nickname: 1 }, { unique: true });

  AdminSchema.post('validate', function(user, next) {
    if(!_.isEmpty(user.pass) && !_.isEmpty(user.confirm_pass)) {
      if(user.pass !== user.confirm_pass) {
        next(new Error('Password and the confirm password does not match'));
      }
    }

    next();
  });

  AdminSchema.pre('save', function(next) {
    if(!_.isEmpty(this.pass)) {
      var salt = bcrypt.genSaltSync(10);
      this.encrypted_password = bcrypt.hashSync(this.pass, salt);
      this.pass = undefined;
      this.confirm_pass = undefined;

      next();
    } else next();
  });

  AdminSchema.methods.checkPassword = function(password) {
    return bcrypt.compareSync(password, this.encrypted_password);
  };

  global.Admin = db.mongoose.model('Admin', AdminSchema);
};
