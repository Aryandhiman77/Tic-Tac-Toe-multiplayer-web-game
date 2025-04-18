const mongoose = require('mongoose')
const userSchema = new mongoose.Schema ({
    username:{
        type:String,
        required:true
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
        enum:["active","inactive"]
    },
    refreshToken:{
        type:String,
    },
    profile:{
        type:String,
        default:'/defaultProfile/profile.jpg'
    }
})

const User = mongoose.model('user',userSchema)
module.exports = User