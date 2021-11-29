const mongoose = require('mongoose');
const { Schema } = mongoose;
const crypto = require('crypto');
const { match } = require('assert');

const userSchema = new Schema({
    name:{
        type:String,
        trim:true,
        required:true,
        max:32
    },
    email:{
        type:String,
        trim:true,
        required:true,
        lowercase:true,
        unique:true
    },
    hashed_password:{
        type:String,
        required:true,        
    },
    salt: String,
    role:{
        type:String,
        default:'subscriber'
    },
    resetPasswordLink:{
        data:String,
        default:''
    },
},{timestamps:true});

userSchema.virtual('password')
    .set(function(password) {
        this._password = password;
        this.salt = this.makeSalt();
        this.hashed_password = this.encryptPassword(password);
    })
    .get(function() {
        return this._password;
    });

userSchema.methods = {
    authenticate: function(plainText){
        return this.encryptPassword(plainText) === this.hashed_password;
    },
    encryptPassword : function(password){
        if(!password) return '';
        try{
            return crypto.createHmac('sha1',this.salt).update(password).digest('hex');
        } catch(e){
            return e;
        }
    },
    makeSalt: function(){
        return Math.round(new Date().valueOf() * Math.random()) + '';
    }
}

module.exports = mongoose.model('User',userSchema);