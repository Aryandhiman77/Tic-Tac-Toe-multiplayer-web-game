const express = require('express')
const Router = express.Router();
const {userLogin,userRegister,logoutUser,refreshTokens,forgotPass} = require('../src/controllers/User.Controller')
const {RegistrationValidations,LoginValidations}  = require('./validations/Auth.validations')
const {sendFriendRequest,acceptFriendRequest,rejectFriendRequest,getFriendsList,getFriendRequest,searchFriendById,getIncomingRequests} = require('../src/controllers/Friends.Controller')
const checkLoginMiddleware = require('./middlewares/Login.Middleware')
// const {FriendRequestValidations} = require('./validations/Friend.validations');



// =========== handle user Login , registration , logout ================

// { username, email, password }
Router.post('/auth/register',RegistrationValidations,userRegister)

// { email , password }
Router.post('/auth/login',LoginValidations,userLogin) 

// { email }
Router.post('/auth/fgtpwd',LoginValidations,forgotPass);

// refresh token 
Router.post('/auth/ref',refreshTokens)

// refresh token 
Router.post('/auth/logout',logoutUser)



// ==========================friends handler======================
Router.use(checkLoginMiddleware)
// { friendid }
Router.post('/friend/send',sendFriendRequest)
// { friendid }
Router.post('/friend/accept',acceptFriendRequest)
// { friendid }
Router.post('/friend/reject',rejectFriendRequest)
// { friendid }
Router.post('/friend/list',getFriendsList)

Router.post('/friend/req',getFriendRequest)
// { friendid }
Router.post('/friend/search',searchFriendById)
//incoming friendrequests
Router.post('/friend/increq',getIncomingRequests)




module.exports = Router;