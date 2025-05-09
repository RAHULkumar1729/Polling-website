const { response } = require("express");
const Poll = require("../models/Poll.js")
const User = require("../models/User.js")


//Create a new poll
async function createPoll(req,res) {
    let {question,type,options,creatorId} = req.body

    if(!question || !type || !creatorId){
        return res.status(400).json({message:"Question , type and creatorId are required"})
    }

    try {
        let processedOptions = [];
        switch(type){
            case "single-choice":
                if(!options || options.length<2){
                    return res.status(400).json({message:"Single-choice Polls must have at least two options."})
                }
                processedOptions= options.map((option)=>({optionText :option}))
                break;
            case "open-ended":    
                processedOptions = [];  //no Option needed for open-ended
                break;
            case "rating": 
                 processedOptions=[1,2,3,4,5].map((value)=>({optionText:value.toString()}))
                 break;
            case "yes/no":
                processedOptions= ["Yes","No"].map((option)=>({optionText:option}))
                break;
            case "image-based":
                if(!options || options.length<2){
                    return res.status(400).json({message:"Image based Polls must have atleats 2 image URLs"})
                }  
                processedOptions=options.map((url=>({optionText:url})))
                break;

             default:
                 return res.status(400).json({message:"Invalid Poll type"})
            }

                 const newPoll = await Poll.create({
                    question,
                    type,
                    options:processedOptions,
                    creator:creatorId,

                }) 

                res.status(201).json(newPoll)
        
    } catch (error) {
        res.status(500).json({message:"Error creating Polls ",error:error.message})
        
    }

    
}

//get all  polls
async function getAllPolls(req,res) {

let {type,creatorId,page =1,limit=10} = req.query;
let filter ={}
let userId = req.user._id

if(type){
    filter.type= type;
}
if(creatorId){
    filter.creator = creatorId
}

try {
    //Calculate pagination parameter
    const pageNumber = parseInt(page,10);
    const pageSize = parseInt(limit,10);
    const skip = (pageNumber-1)*pageSize;

    //fetch Poll with pagination

    const polls = await Poll.find(filter)
    .populate("creator", "fullName username email profileImageUrl")
    .populate({
        path:"responses.voterId",
        select:"username profileImageUrl fullName "
    })
    .skip(skip)
    .limit(pageSize)
    .sort({createdAt:-1})

    //Add 'userhasVoted' flag for each poll

    const updatedPolls = polls.map((poll)=>{
        const userhasVoted = poll.voters.some((voterId)=>
        voterId.equals(userId))
        return{
            ...poll.toObject(),
            userhasVoted,
        }
    })

    //get total count of polls  for pagination metadata
    const totalPolls = await Poll.countDocuments(filter)

    const stats  = await Poll.aggregate([
        {
            $group:{
                _id:"$type",
                count:{$sum:1},
            }
        },
        {
            $project:{
                type:"$_id",
                count:1,
                _id:0,

            }
        }
    ])


    //Esnure all counts are included in stats , even those with zero counts 
    const allTyps=[
        {type:"single-choice" , label:"Single Choice "},
        {type:"yes/no" , label:"Yes/No "},
        {type:"rating" , label:"Rating"},
        {type:"image-based" , label:"Image Based"},
        {type:"open-ended" , label:"Open Ended"}
    ]

    const statswithDefault = allTyps.map((pollType)=>{
        const stat = stats.find((item)=>item.type===pollType.type)
        return{ 
            label:pollType.label,
            type:pollType.type,
            count:stat? stat.count : 0
        }
    })
    .sort((a,b)=>b.count-a.count)


    res.status(200).json({
        polls:updatedPolls,
        currentPage:pageNumber,
        totalPages: Math.ceil(totalPolls/pageSize),
        totalPolls,
        stats:statswithDefault

    })
    
} catch (error) {
    res.status(500).json({message:"Error in getting all polls,",error:error.message})
    
}
    
}

//get all voted pols
async function getVotedPolls(req,res) {
    const {page =1 , limit =10}= req.query;
    const userId = req.user._id

    try {
    // Calculate pagination parameter 
     const pageNumber = parseInt(page,10)
     const pageSize = parseInt(limit,10)
     const skip = (pageNumber-1)*pageSize
     
     //Fetch poll where the user has voted
     const polls =await Poll.find({voters:userId})  //filter by polls where the user'id exists in the voters arryas
     .populate("creator", "fullName username email profileImageUrl")
     .populate({
         path:"responses.voterId",
         select:"username profileImageUrl fullName "
     })
     .skip(skip)
     .limit(pageSize)
     .sort({createdAt:-1})

     //Add "userhasVoted" option in each poll
     const updatedPolls = polls.map((poll)=>{
        const userhasVoted = poll.voters.some((voterId)=>
        voterId.equals(userId))
        return{
            ...poll.toObject(),
            userhasVoted,
              }
           })
        
        //get total count of polls  for pagination metadata
    const totalVotedPolls = await Poll.countDocuments({voters:userId})
      

    res.status(200).json({
        polls:updatedPolls,
        currentPage: pageNumber,
        totalPages: Math.ceil(totalVotedPolls / pageSize),
        totalVotedPolls,
    })
     
       
        } catch (error) {
        res.status(500).json({message:"Error getting voted poll", error: error.message})
        
    }
}

//get poll by ID
async function getPollById(req,res) {
    const {id} = req.params


    try {
        const poll = await Poll.findById(id).populate("creator", "username email")
        if(!poll){
            return res.status(500).json({message:"Poll not found"})
        }

        res.status(200).json(poll)
    } catch (error) {
        res.status(500).json({message:"Error getting poll by ID", error:error.message})
        
    }
}

//Vote Poll
async function voteOnPoll(req, res) {
    const { id } = req.params;
    const { optionIndex, voterId, responseText } = req.body;

    try {
        const poll = await Poll.findById(id);

        if (!poll) {
            return res.status(400).json({ message: "Poll not found!" });
        }

        if (poll.closed) {
            return res.status(400).json({ message: "Poll is closed." });
        }

        if (poll.voters.includes(voterId)) {
            return res.status(400).json({ message: "User already voted on this poll." });
        }

        if (poll.type === "open-ended") {
            if (!responseText || typeof responseText !== "string") {
                return res.status(400).json({ message: "Response text is required for open-ended polls." });
            }

            poll.responses.push({ voterId, responseText });
        } else {
            if (optionIndex === undefined || optionIndex < 0 || optionIndex >= poll.options.length) {
                return res.status(400).json({ message: "Invalid option index." });
            }

            poll.options[optionIndex].votes += 1;
        }

        poll.voters.push(voterId);
        await poll.save();

        return res.status(200).json(poll);

    } catch (error) {
        return res.status(500).json({ message: "Error voting on poll", error: error.message });
    }
}


//Close Poll
async function closePoll(req,res) {
    const {id} = req.params
    const userId = req.user._id

    try {
        const poll = await Poll.findById(id)

        if(!poll){
            return res.status(404).json({message:"Poll not found"})
        }
        
        if(poll.creator.toString()!=userId){
            return res.status(403).json({message:"You are not authorized to close this poll"})
        }

        poll.closed=true;
        await poll.save();
        return res.status(200).json({ message: "Poll closed successfully", poll });
    } catch (error) {
        res.status(500).json({message:"Error in closing the poll", error:error.message})
        
    }
    
}

//Bookedmarked Poll
async function bookmarkPoll(req, res) {
    const { id } = req.params;  // This should be the poll ID
    const userId = req.user._id;
    
    try {
        
        const user = await User.findById(userId);  

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if Poll is already bookmarked
        const isBookmarked = user.bookmarkedPolls.includes(id);
        
        if (isBookmarked) {
            // Remove Poll from bookmarked
            user.bookmarkedPolls = user.bookmarkedPolls.filter((pollId) => pollId.toString() !== id);
            await user.save();
            return res.status(200).json({
                message: "Poll removed from bookmarked",
                bookmarkedPolls: user.bookmarkedPolls
            });
        }

        // Add poll to bookmarked
        user.bookmarkedPolls.push(id);
        await user.save();
        res.status(200).json({
            message: "Poll bookmarked successfully",
            bookmarkedPolls: user.bookmarkedPolls
        });
    } catch (error) {
        res.status(500).json({ 
            message: "Error in bookmarking the poll", 
            error: error.message 
        });
    }
}
//Delete Poll
async function deletePoll(req, res) {
    const { id } = req.params;
    const userId = req.user._id;

    try {
        const poll = await Poll.findById(id);
        if (!poll) {
            return res.status(404).json({ message: "Poll not found!" });
        }

        if (poll.creator.toString() !== userId.toString()) {  
            return res.status(403).json({ message: "You are not authorized to delete this poll" });
        }

        const deletedPoll = await Poll.findByIdAndDelete(id);
        res.status(200).json({
            message: "Poll deleted successfully",
            deletedPoll: deletedPoll  
        });
        
    } catch (error) {
        res.status(500).json({ 
            message: "Error in deleting the poll",  
            error: error.message 
        }); 
    }
}

//get all the bookedmarked poll
async function getBookmaredkPolls(req,res) {
    const userId = req.user._id


    try {
        const user = await User.findById(userId).populate({
            path:"bookmarkedPolls",
            populate:{
                path:"creator",
                select:"fullName username profileImageUrl"
            }
        })
        if(!user){
            return res.status(404).json({message:"User not found"})
        }
        const bookmarkedPolls = user.bookmarkedPolls;

        //Add userHasVoted flag for each Poll

        const updatedPolls = bookmarkedPolls.map((poll)=>{
            const userhasVoted = poll.voters.some((voterId)=>
            voterId.equals(userId))
            return{
                ...poll.toObject(),
                userhasVoted,
                  }
            })

            res.status(200).json({bookmarkedPolls:updatedPolls})



        
    } catch (error) {
        res.status(500).json({ 
            message: "Error in bookmarking the poll", 
            error: error.message 
        }); 
    }
    
}

module.exports={createPoll,getAllPolls,getVotedPolls,getPollById,voteOnPoll,closePoll,bookmarkPoll,deletePoll,getBookmaredkPolls}


