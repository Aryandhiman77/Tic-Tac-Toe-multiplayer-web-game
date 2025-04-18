const express = require('express')
const Router = express.Router();
const {userLogin,userRegister,logoutUser,refreshToken} = require('../src/controllers/User.Controller')
const {RegistrationValidations,LoginValidations}  = require('./validations/Auth.validations')



// =========== handle user Login & signup & logout ================

// { email , password }
Router.post('/auth/login',LoginValidations,userLogin) 

// { username, email, password }
Router.post('/auth/register',RegistrationValidations,userRegister)

// refresh token 
Router.post('/auth/ref',refreshToken)

// refresh token 
Router.post('/auth/logout',logoutUser)




module.exports = Router;