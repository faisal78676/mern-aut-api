const User = require('../models/user');
const jwt = require('jsonwebtoken');
const { mail } = require('../services/mail');
const expressJwt = require('express-jwt');
const _ = require('lodash');
const {OAuth2Client} = require('google-auth-library');

// exports.signup = (req,res)=>{
//     const {name,email,password} = req.body;
//     User.findOne({email}).exec((err,user)=>{
//         if(user){
//             return res.status(400).json({
//                 error:'Email is taken'
//             });
//         }
//     });

//     let newUser = new User({name,email,password});
//     newUser.save((err,success)=>{
//         if(err){
//             console.log('Sigup Error',err);
//             return res.status(400).json({error:err});
//         }
//         return res.status(200).json({message:'Signup success! Please Signin'});
//     });

    
// }

exports.signup =  (req,res)=>{
    const {name,email,password} = req.body;
        User.findOne({email}).exec((err,user)=>{
            if(user){
                return res.status(400).json({
                    error:'Email is taken'
                });
            }
            const token = jwt.sign({name,email,password},process.env.JWT_ACCOUNT_ACTIVATION,{expiresIn:'10m'})
            mail({email,subject:'Account Activation Link',htmlBody:`
                <p>Please use the following link to activate account</p>
                <p>${process.env.CLIENT_URL}/auth/activate/${token}</p>
            `}).then(()=>{
                res.status(200).json({msg:`Email has been sent to ${email}. Follow the instruction to activate your account`});
            });
            
            
        });
}

exports.accountActivation = (req,res)=>{
    const {token} = req.body;
    if(token){
        jwt.verify(token,process.env.JWT_ACCOUNT_ACTIVATION,(err,decode)=>{
            if(err){
                console.log('Account Activation Error');
                return res.status(401).json({error:'Expired link.Signup again'})
            }

            const {name,email,password} = jwt.decode(token);

            const user = new User({name,email,password});

            user.save((err,user)=>{
                if(err){
                    console.log('save user in account activation error',err);
                    return res.status(401).json({error:'Error saving user in database. try signup again'})
                }
                return res.status(200).json({message:'Signup Success. please signin'})

            });
        });
    } else {
        return res.status(401).json({message:'Something went wrong'});
    }
}

exports.signin =  (req,res)=>{
    console.log('singin controller');
        const {email,password} = req.body;
    User.findOne({email}).exec((err,user)=>{
        if(err || !user){
            return res.status(400).json({
                error:'User with that email does not exist.Please Signup'
            });
        }

        if(!user.authenticate(password)){
            return res.status(400).json({
                error:'Email and password do not match'
            })
        }

        const token = jwt.sign({_id:user._id},process.env.JWT_SECRET,{expiresIn: '7d'});
        const {_id,name,email,role} = user;
        return res.json({
            token,user:{_id,name,email,role}
        })
    });
}

exports.requireSignIn = expressJwt({
    secret:process.env.JWT_SECRET,algorithms: ['HS256'] 
})

exports.adminMiddleware = (req,res,next)=>{
    User.findById({_id:req.user._id}).exec((err,user)=>{
        if(err || !user){
            return res.status(400).json({
                error:'User not Found'
            });
        }

        if(user.role !=='admin'){
            return res.status(400).json({
                error:'Admin resource. access denied '
            })
        }

        user.profile = user;
        next();
    })
}

exports.forgotPassword = (req,res)=>{
    const {email} = req.body;
    User.findOne({email}).exec((err,user)=>{
        if(err || !user){
            return res.status(400).json({
                error:'User with that email does not exist.'
            });
        }

        const token = jwt.sign({_id:user._id},process.env.JWT_RESET_PASSWORD,{expiresIn:'10m'})

        return user.updateOne({resetPasswordLink:token},(err,success)=>{
            if(err){
                return res.status(400).json({
                    error:'Database connection error on user password forgot password'
                })
            } else {
                mail({email,subject:'Password Reset link',htmlBody:`<p>Please use the following link to reset your password</p><p>${process.env.CLIENT_URL}/auth/reset-password/${token}</p>`})
                .then(()=>{
                    res.status(200).json({msg:`Email has been sent to ${email}. Follow the instruction to activate your account`});
                });
            }
        });
            
    });
}

exports.resetPassword = (req,res)=>{
    const { resetPasswordLink,newPassword} = req.body;

    if(resetPasswordLink){
        jwt.verify(resetPasswordLink,process.env.JWT_RESET_PASSWORD,function(err,decoded){
            if(err){
                return res.status(400).json({
                    error:'Expire Link.Try again'
                })
            }

            User.findOne({resetPasswordLink},(err,user)=>{
                if(err || !user){
                    return res.status(400).json({
                        error:'Something went wrong.try again'+err
                    })
                }

                const updateFields = {
                    password:newPassword,
                    resetPasswordLink:''
                }

                user = _.extend(user,updateFields);

                user.save((err,result)=>{
                    if(err){
                        return res.status(400).json({
                            error:'Error Resetting password'
                        })
                    }

                    res.status(200).json({
                        message:'Now you can login with your new password'
                    })
                })
            });
        });
    }
}

const client = new OAuth2Client(process.env.GOOGLE_CLEINT_ID);
exports.googleLogin =(req,res)=>{

    const {idToken} = req.body;
    // console.log('server idToken',idToken);
    client.verifyIdToken({idToken,audience:process.env.GOOGLE_CLEINT_ID}).then( resp=>{
        const {email_verified,name,email} = resp.payload
        if(email_verified){
            User.findOne({email}).exec((err,user)=>{
                if(user){
                    const token = jwt.sign({_id:user._id},process.env.JWT_SECRET,{expiresIn:'10m'});
                    const {_id,email,name,role} = user;
                    return res.json({
                        token,user:{
                            _id,email,name,role
                        }
                    })
                } else {
                    let password = email + process.env.JWT_SECRET;
                    user = new User({name,email,password});
                    user.save((err,data)=>{
                        if(err){
                            return res.status(400).json({
                                error:'User Signup Failed with google'
                            })
                        } 
                            const token = jwt.sign({_id:user._id},process.env.JWT_SECRET,{expiresIn:'10m'});
                            const {_id,email,name,role} = user;
                            return res.json({
                                token,user:{
                                    _id,email,name,role
                                }
                            })
                        
                    })
                }
            });
        } else{
            return res.status(400).json({
                error:'Google login failed.try again'
            })
        }
    });

}