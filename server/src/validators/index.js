const { validationResult } = require('express-validator');

exports.runValidation = (req,res,next)=>{
    // console.log('Req middleware',req.body);
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(422).json({
            error: errors.array()[0].msg
        })
    }

    next();
}