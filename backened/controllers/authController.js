const User = require("../models/User.js")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs");
const { getBookmaredkPolls } = require("./pollController.js");
const Poll = require("../models/Poll.js");

//generate jWT token
const generateToken = (id)=>{
    return jwt.sign({id},process.env.JWT_SECRET);
};

//Register  User
async function registerUser(req,res){
    //console.log("BODY:", req.body);
    const {fullName,username,email,password,profileImageUrl}= req.body

    if(!fullName || !username || !email || !password){
        return res.status(400).json({message:"All fields are required"});
    }
      
    const usernameRegex =/^[a-zA-Z0-9-]+$/;
    if(!usernameRegex.test(username)){
        return res.status(400).json({
            message:"Invalid username. Only alphanumeric characters and hypens are allowed. No spaces are premitted",
        });
    }

    try {
        //check if the emial,username already exists 
        const existingUser =await User.findOne({email})
        if(existingUser){
            return res.status(400).json({message:"Email already in use."})
            
        }

        const existingUsername = await User.findOne({username})
        if(existingUsername){
            return res.status(400).json({message:"Username already exists"})
        } 

        //Create the user
        const user = await User.create({
          fullName,
          username,
          email,
          password,
          profileImageUrl,
        });

        res.status(201).json({
            id:user._id,
            user,
            token:generateToken(user._id),
        });

    } catch (error) {
       return res.status(500).json({message:"Error registering user",error:error.message})
        
    }


}
 
async function loginUser(req,res){
    const {email,password}= req.body


    if(!email || !password){
        return res.status(400).json({message:"All fields are required"});
    }

    try {
        const user= await User.findOne({email});
        if(!user || ! (await user.comparePassword(password))){
            return res.status(400).json({message:"Invalid credentials "})
        }

        //Counts poll created by the user
        const totalPollsCreated = await Poll.countDocuments({creator:user._id})
        
        //Count polls the user has voted in
        const totalPollsVotes = await Poll.countDocuments({voters:user._id})

        //Count poll the user has bookmarked
        const totalPollsBookedmarked = getBookmaredkPolls.length

        res.status(200).json({
            id:user._id,
            user:{
                ...user.toObject(), // user ka sarr detail shown krna
                totalPollsCreated,
                totalPollsVotes,
                totalPollsBookedmarked

            },
            token:generateToken(user._id),
        })
        
    } catch (error) {
        res.status(500).json({message:"Error login user",error:error.message})
        
    }


}

async function getUserInfo(req,res) {
    try {
        let user = await User.findById(req.user.id).select("-password")  //.select("-password") -This tells Mongoose to exclude the password field from the result. The - sign means "don't include this field."
        
        if(!user){
            return res.status(404).json({message:"User not found"})
        }

           //Counts poll created by the user
           const totalPollsCreated = await Poll.countDocuments({creator:user._id})
        
           //Count polls the user has voted in
           const totalPollsVotes = await Poll.countDocuments({voters:user._id})
   
           //Count poll the user has bookmarked
           const totalPollsBookedmarked = getBookmaredkPolls.length


        //Add the new attributes to the response
        const userInfo= {
            ...user.toObject(),
            totalPollsCreated,
            totalPollsVotes,
            totalPollsBookedmarked

        }
        res.status(200).json(userInfo)
    } catch (error) {
        res.status(500).json({message:"Error login user",error:error.message})
    }
    
}

module.exports={registerUser,loginUser,getUserInfo}