const User = require('../models/user');
const jwt = require('jsonwebtoken');
const { mail } = require('../services/mail');

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