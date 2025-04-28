const mongoose = require('mongoose')
const nanoid = require('../../utils/gameIdGenerator')
const userSchema = new mongoose.Schema ({
    username:{
        type:String,
        required:true
    },
    gameid:{
        type:String,
        default:()=>nanoid(),
        unique:true,
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    status:{
        type:String,
        enum:["active","inactive"],
        default:"active"
    },
    refreshToken:{
        type:String,
    },
    profile:{
        type:String,
        default:'/defaultProfile/profile.jpg'
    },
   
})

const User = mongoose.model('user',userSchema)
module.exports = User