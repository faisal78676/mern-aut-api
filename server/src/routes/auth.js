const express = require('express');
const router = express.Router();
const {signup,signin,accountActivation,forgotPassword,resetPassword,googleLogin} = require('../controllers/auth');
const { runValidation } = require('../validators');
const { userSignupValidator,userSigninValidator,forgotPasswordValidator,resetPasswordValidator } = require('../validators/auth');


router.post('/signup',userSignupValidator,runValidation,signup);
router.post('/signin',userSigninValidator,runValidation,signin);
router.post('/account-activation',accountActivation);

router.put('/forgot-password',forgotPasswordValidator,runValidation,forgotPassword);
router.put('/reset-password',resetPasswordValidator,runValidation,resetPassword);
router.post('/google-login',googleLogin)
module.exports = router;