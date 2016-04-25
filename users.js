/* jshint -W079 */
/* jshint -W020 */

'use strict';
var _ = require('lodash');
var bcrypt = require('bcryptjs');
var thunk = require('thunks')();

module.exports = function(utils, db) {
  global.deepSelectsForUser = 'mobile nickname city provider avatar wechat.headimgurl weibo.profile_image_url qq.profile_image_url icon';

  // Model User 用户
  var UserSchema = new db.Schema({
    mobile: { type: String, trim:true },
    nickname: { type: String, trim:true, get: function(n) {
      if(n && n.match(/^1[\d]{10}$/)) return n.replace(n.substr(3, 5), '*****');
      else return n;
    } },
    pass: { type: String, trim:true },
    confirm_pass: { type: String, trim:true },
    encrypted_password: { type: String, trim:true },
    email: { type: String, trim:true, required: true },
    at: { type: Date, default: Date.now },
    sign_in_count: Number,
    last_sign_in_at: Date,
    last_sign_in_ip: { type: String, trim:true },
    avatar: { type: String, trim:true },
    signature: { type: String, trim:true },
    sex: Number,
    birthday: Date,
    country: { type: String, trim:true },
    province: { type: String, trim:true },
    city: { type: String, trim:true },
    provider: { type: String, trim:true },
    public: { type: Boolean, required: true, default:true },
    wechat: {
      // 用户是否订阅该公众号标识，值为0时，代表此用户没有关注该公众号，拉取不到其余信息。
      subscribe: Number,
      // 用户的标识，对当前公众号唯一
      openid: { type: String, trim:true },
      // 用户的语言，简体中文为zh_CN
      language: { type: String, trim:true },
      // 用户头像，最后一个数值代表正方形头像大小（有0、46、64、96、132数值可选，0代表640*640正方形头像），用户没有头像时该项为空。若用户更换头像，原有头像URL将失效。
      headimgurl: { type: String, trim:true },
      // 用户关注时间，为时间戳。如果用户曾多次关注，则取最后关注时间
      subscribe_time: { type: String, trim:true },
      // 只有在用户将公众号绑定到微信开放平台帐号后，才会出现该字段。详见：获取用户个人信息（UnionID机制）
      unionid: { type: String, trim:true }
    },
    weibo: {
      // 微博的 ID
      id: Number,
      // 微博的名称
      name: { type: String, trim:true },
      // 微博头像
      profile_image_url: { type: String, trim:true }
    },
    qq: {
      // QQ 的 ID
      id: { type: String, trim:true },
      // 微博的名称
      name: { type: String, trim:true },
      // 微博头像
      profile_image_url: { type: String, trim:true }
    }
  }, db.schemaOptions);

  UserSchema.index({ mobile: 1 }, { unique: true });
  UserSchema.index({ nickname: 1 }, { unique: true });

  UserSchema.virtual('avatar_content').get(function() {
    if(!_.isEmpty(this.avatar)) return cloudUrl + 'user/avatar/' + this.avatar + '!content';
    if(this.provider === 'wechat' && !_.isEmpty(this.wechat.headimgurl)) return this.wechat.headimgurl;
    if(this.provider === 'weibo' && !_.isEmpty(this.weibo.profile_image_url)) return this.weibo.profile_image_url;
    if(this.provider === 'qq' && !(_.isEmpty(this.qq.profile_image_url))) return this.qq.profile_image_url;

    return '/images/default-avatar.jpg';
  });

  UserSchema.virtual('icon').get(function() {
    if(!(_.isEmpty(this.avatar))) return cloudUrl + 'user/avatar/' + this.avatar + '!thumb';
    if(this.provider === 'wechat' && !(_.isEmpty(this.wechat.headimgurl))) return this.wechat.headimgurl;
    if(this.provider === 'weibo' && !(_.isEmpty(this.weibo.profile_image_url))) return this.weibo.profile_image_url;
    if(this.provider === 'qq' && !(_.isEmpty(this.qq.profile_image_url))) return this.qq.profile_image_url;

    return '/images/default-avatar.jpg';
  });

  UserSchema.virtual('sex_to_s').get(function() {
    if(this.sex === 0) return '女';
    if(this.sex === 1) return '男';
    return '未知';
  });

  UserSchema.post('validate', function(user, next) {
    if(!_.isEmpty(user.pass) && !_.isEmpty(user.confirm_pass)) {
      if(user.pass !== user.confirm_pass) {
        next(new Error('Password and the confirm password does not match'));
      }
    }

    next();
  });

  UserSchema.pre('save', function(next) {
    if(!_.isEmpty(this.pass)) {
      var salt = bcrypt.genSaltSync(10);
      this.encrypted_password = bcrypt.hashSync(this.pass, salt);
      this.pass = undefined;
      this.confirm_pass = undefined;

      next();
    } else next();
  });

  UserSchema.pre('remove', function(next) {
    var user = this;

    thunk.all([
      thunk(function(cb) { Message.remove({ $or:[{ to:user.id }, { from:user.id }] }, function(err) { cb(err, null); }); }),
      thunk(function(cb) { Zan.remove({ user:user.id }, function(err) { cb(err, null); }); }),
      thunk(function(cb) { Comment.remove({ user:user.id }, function(err) { cb(err, null); }); }),
      thunk(function(cb) { Favorite.remove({ user:user.id }, function(err) { cb(err, null); }); })
    ])(function(error, results) { next(); });
  });

  UserSchema.methods.checkPassword = function(password) {
    return bcrypt.compareSync(password, this.encrypted_password);
  };

  UserSchema.statics.followed = function(me, follower, cb) {
    Follow.count({ user_id:follower, fan_id:me }).exec(function(err, count) { return cb(err, count > 0); });
  };

  UserSchema.statics.getFollowers = function(id, cb) {
    var ids = [];
    var users = [];
    Follow.find({ fan_id:id }).populate('user_id fan_id').exec(function(err, items) {
      _.each(items, function(item) {
        if(item.user_id) {
          ids.push(item.user_id.id);
          users.push(item.user_id);
        }
      });
      return cb(err, { ids:ids, items:users });
    });
  };

  UserSchema.statics.getFans = function(id, cb) {
    var ids = [];
    var users = [];
    Follow.find({ user_id:id }).populate('user_id fan_id').exec(function(err, items) {
      _.each(items, function(item) {
        if(item.fan_id) {
          ids.push(item.fan_id.id);
          users.push(item.fan_id);
        }
      });
      return cb(err, { ids:ids, items:users });
    });
  };

  UserSchema.statics.getFollowersCount = function(id, cb) {
    Follow.count({ fan_id:id }).populate('user_id fan_id').exec(function(err, count) { return cb(err, count); });
  };

  UserSchema.statics.getFansCount = function(id, cb) {
    Follow.count({ user_id:id }).exec(function(err, count) { return cb(err, count); });
  };

  global.User = db.mongoose.model('User', UserSchema);
};
