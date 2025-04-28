const mongoose = require('mongoose')
const userSchema = new mongoose.Schema ({
    userid:{
        type:String,
        required:true
    },
    friends: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'   // referring to 'user' model
    }]
    
   
})

const FriendList = mongoose.model('friendList',userSchema)
module.exports = FriendList