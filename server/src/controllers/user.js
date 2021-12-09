const User = require('../models/user');

exports.read = (req,res) =>{
    const userId = req.params.id;
    if(userId !== req.user._id){
        return res.status(400).json({
            error:'Invalid Credentials'
        })
    }
    User.findById(userId).exec((err,user)=>{
        if(err || !user){
            return res.status(400).json({error:'user not found'});
        }

        user.hashed_password = undefined;
        user.salt = undefined;
        res.json(user);
    })
}

exports.update = (req,res)=>{
    const {name,password} = req.body;
    const {id} = req.params;
    if(id !== req.user._id){
        return res.status(400).json({
            error:'Invalide Creadential Update'
        })
    }
    
    User.findOne({_id:req.user._id},(err,user)=>{
        if(err || !user){
            return res.status(400).json({
                error:'User not Found'
            })
        }

        if(!name){
            return res.status(400).json({
                error:'Name is Required'
            })
        } else {
            user.name = name;
        }

        if(password){
            if(password.length<6){
                return res.status(400).json({
                    error:'Password should be min 6 char long'
                })
            } else {
                user.password = password;
            }    
        } 
        user.save((err,updatedUser)=>{
            if(err){
                return res.status(400).json({
                    error:'User Update failed'
                })
            }

            updatedUser.hashed_password = undefined;
            updatedUser.salt = undefined;
            res.json(updatedUser);
        })
    })
}