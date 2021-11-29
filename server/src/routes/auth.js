const express = require('express');
const router = express.Router();
const {signup,signin,accountActivation} = require('../controllers/auth');
const { runValidation } = require('../validators');
const { userSignupValidator,userSigninValidator } = require('../validators/auth');


router.post('/signup',userSignupValidator,runValidation,signup);
router.post('/signin',userSigninValidator,runValidation,signin);
router.post('/account-activation',accountActivation);

module.exports = router;