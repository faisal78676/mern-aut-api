const express = require('express');
const { requireSignIn,adminMiddleware } = require('../controllers/auth');
const router = express.Router();
const {read,update} = require('../controllers/user');



router.get('/user/:id',requireSignIn,read);
router.put('/user/update/:id',requireSignIn,update);
router.put('/admin/update/:id',requireSignIn,adminMiddleware,update);


module.exports = router;