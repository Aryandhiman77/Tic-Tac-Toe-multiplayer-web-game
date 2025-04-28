const User = require("../db/modals/User.Model");
const Friend = require("../db/modals/Friend.Model");
const mongoose = require("mongoose");
const FriendList = require("../db/modals/FriendList.Model");
const sendFriendRequest = async (req, res) => {
  const { friendid } = req.body;
  const { id } = req.user;

  try {
    const existingRequest = await Friend.findOne({ userid: id, friendid });
    const reqToYourSelf = await User.findOne({gameid:friendid,_id:id});
    if(reqToYourSelf)  return res.status(400).json({ success:false,message: "Cannot request youself." });

    if (existingRequest) {
      return res.status(200).json({ success:true,message: "Friend request already sent" });
    }
    // if(existingRequest.userid === id){
    //     return res.status(400).json({ success:false,message: "Cannot request yourself." });
    // }
    // console.log(existingRequest);

    const newRequest = new Friend({ userid: id, friendid });
    await newRequest.save();

    return res
      .status(200)
      .json({ success:true,message: "Friend request sent successfully" });
  } catch (error) {
    return res.status(500).json({ success:false,message: "Server error", error });
  }
};
const acceptFriendRequest = async (req, res) => {
  const { friendid } = req.body; // friendid = friend's gameid
  const { id: myUserId } = req.user; // your own user id

  try {
    const friendUser = await User.findOne({ gameid: friendid });
    console.log(friendUser);
    if (!friendUser) {
      return res.status(404).json({ success: false, message: "Friend not found" });
    }

    const request = await Friend.findOne({ userid: friendUser._id, friendid:friendUser.gameid, status: "pending" });
    console.log(request);
    if (!request) {
      return res.status(404).json({ success: false, message: "Friend request not found" });
    }

    // Update the friend request status
    request.status = "accepted";
    await request.save();
    
    // Add each other as friends (two-way)
    await Promise.all([
      User.findByIdAndUpdate(myUserId, { $addToSet: { friends: friendUser._id } }),
      User.findByIdAndUpdate(friendUser._id, { $addToSet: { friends: myUserId } })
    ]);

    return res.status(200).json({ success: true, message: "Friend request accepted" });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error", error });
  }
};
const rejectFriendRequest = async (req, res) => {
  const { friendid } = req.body;
//   const { id } = req.user;

  try {
    const {_id:userid} = await User.findOne({gameid: friendid });
    if (!userid) {
      return res.status(404).json({success:false, message: "Friend not found" });
    }
    const request = await Friend.findOne({userid});
    if(!request){
        return res.status(404).json({success:false, message: "Friend request not found" });
    }

    const removeRequest = await Friend.findByIdAndDelete(request._id);
    if(removeRequest){
        return res.status(200).json({success:true, message: "Friend request rejected" });
    }else{
        return res.status(400).json({success:false, message: "Cannot ignore, something went wrong." });
    }
  } catch (error) {
    return res.status(500).json({ success:false,message: "Server error", error });
  }
};
const getFriendsList = async (req, res) => {
  const { id } = req.user;
    
  try {
    const friends = await Friend.find({
      userid: id,
      status: "accepted",
    }).populate("friendid");
    console.log(friends);
    return res.status(200).json({ friends });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error });
  }
};

const getFriendRequest = async (req, res) => {
  const { id } = req.user;

  try {
    const requests = await Friend.aggregate([{$match:{$and:[{userid:new mongoose.Types.ObjectId(id.toString()) },{status:"pending"}]}},
        {$lookup:{from:'users',
        localField:'friendid',
        foreignField:'gameid',
        as:"friendDetails"}}, {
            $unwind: {
              path: "$friendDetails",
              preserveNullAndEmptyArrays: true // if you want to keep friends without user details
            }
          },
      {$project:{friendid:0,userid:0,_id:0,__v:0,friendDetails:{email:0,password:0,__v:0,_id:0}}}
        ])
        console.log(requests);

    return res.status(200).json({ success:true,requests });
  } catch (error) {
    return res.status(500).json({success:false, message: "Server error", error });
  }
};
const getIncomingRequests = async(req,res)=>{
    const { myfriendid } = req.body;
    console.log(myfriendid)
    

    try {
      const requests = await Friend.aggregate([{$match:{friendid:myfriendid}},
        {$lookup:{from:'users',
        localField:'userid',
        foreignField:'_id',
        as:"friendDetails"}}, {
        $unwind: {
          path: "$friendDetails",
          preserveNullAndEmptyArrays: true // if you want to keep friends without user details
        }
      },
      {$project:{friendid:0,userid:0,_id:0,__v:0,friendDetails:{email:0,password:0,__v:0,_id:0,refreshToken:0}}}
        ])
          console.log(requests);
  
      return res.status(200).json({ success:true,requests });
    } catch (error) {
      return res.status(500).json({success:false, message: "Server error", error });
    }
}
const searchFriendById = async (req,res) => {
  const { friendid } = req.body;
  console.log("request friend search");
  try {
    const user = await User.findOne({ gameid: friendid });
    if (!user) return res.status(400).json({ success:false,message: "No user found." });
    return res
      .status(200)
      .json({
        success:true,
        username: user.username,
        userid: user.gameid,
        profile: user.profile,
      });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error });
  }
};

module.exports = {
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  getFriendsList,
  getFriendRequest,
  searchFriendById,
  getIncomingRequests
};
