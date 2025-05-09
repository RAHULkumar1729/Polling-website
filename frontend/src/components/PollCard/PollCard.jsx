// import React from 'react'

// const PollCard = (
//     pollId,
//     question,
//     type,
//     options,
//     voters,
//     response,
//     creatorProfileImg,
//     creatorName,
//     creatorUsername,
//     userHasVoted,
//     isPollClosed,
//     createdAt
// ) => {
//   return (
//     <div>
//         {question}
//     </div>
//   )
// }

// export default PollCard


import React, { useCallback, useContext, useState,useEffect } from 'react'
import { UserContext } from '../../context/UserContext'
import { getPollBookmarked } from '../../utils/helper';
import UserProfileInfo from '../cards/UserProfileInfo';
import PollActions from './PollActions';
import PollContent from './PollContent';
import { data } from 'react-router-dom';
import axiosInstance from '../../utils/axiosinstance';
import { API_PATH } from '../../utils/apiPaths';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PollingResultContent from './PollingResultContent';
const PollCard = ({
    pollId,
    question,
    type,
    options,
    voters,
    responses,
    creatorProfileImg,
    creatorName,
    creatorUsername,
    userHasVoted,
    isMyPoll,
    isPollClosed,
    createdAt
}) => {
       const { user,onUserVoted,toggleBookmarkId } = useContext(UserContext);
       const [selectedOptionIndex,setSelectedOptionIndex] = useState(-1);
       const[rating,setRating] = useState(0)
       const [userResponse,setUserResponse] = useState("");
       const [isVoteComplete,setIsVoteComplete] = useState(userHasVoted);
       const [pollResult,setPollResult] = useState({
        options,
        voters,
        responses,
       });
       const isPollBookmarked = getPollBookmarked(
        pollId,
        user.bookmarkedPolls || []
       );
       const [pollBookmarked,setPollBookmarked] = useState(isPollBookmarked);
       const [pollClosed,setPollClosed] = useState(isPollClosed || false);
       const [pollDeleted,setPollDeleted] = useState(false);

       useEffect(() => {
        getPollDetial();
        }, []);

       //Handles user input based on the poll type
       const handleInput = (value)=>{
        if(type ==='rating') setRating(value);
        else if(type === 'open-ended') setUserResponse(value);
        else setSelectedOptionIndex(value);

       };


       //Generate post data based on the poll type
       const getPostData = useCallback(()=>{
        if(type === "open-ended"){
            return { responseText:userResponse,voterId:user._id};
        }
        if(type === "rating"){
            return {optionIndex:rating -1,voterId:user._id};
        }
        return {optionIndex:selectedOptionIndex,voterId:user._id};
       },[type,userResponse, rating, selectedOptionIndex, user]);

       //get Poll Details by ID
       const getPollDetial = async()=>{
        try{
            const response = await axiosInstance.get(
                API_PATH.POLLS.GET_BY_ID(pollId)
            );
            if(response.data){
                const pollDetails = response.data
                setPollResult({
                    options:pollDetails.options || [],
                    voters:pollDetails.voters.length || 0,
                    response:pollDetails.response || [],
                });
                setIsVoteComplete(hasVoted);
            }
            
        }catch(error){
            console.log(error.response?.data?.message ||"error submitting vote")
        }
       }
       //handle the submission of votes
       const handleVoteSubmit=async()=>{
        try{
            const response = await axiosInstance.post(
                API_PATH.POLLS.VOTE(pollId),
                getPostData()
            );
            getPollDetial()
            setIsVoteComplete(true);
            onUserVoted();
            toast.success("Voted submitted successufully");
        }catch(error){
            console.error(error.response?.data?.message || "Error sunmittiong vote")
        }
       }
       //Toggles the bookmark status of a poll
       const toggleBookmark = async () =>{
        try{
            const response = await axiosInstance.post(
                API_PATH.POLLS.BOOKMARK(pollId)
            );

            toggleBookmarkId(pollId)
            setPollBookmarked((prev) => !prev)
            toast.success("Poll bookmarked succesfully")
        }catch(error){
            const errMsg = error?.response?.data?.message || "Error bookmarking poll";
            console.error(errMsg);
            toast.error(errMsg);
        }
       }

        return (!pollDeleted && (
        <div className='bg-slate-100/50 my-5 p-5 rounded-lg border border-slate-100 mx-auto'>
            <div className='flex items-start justify-between'>
                <UserProfileInfo
                 imgUrl = {creatorProfileImg}
                 fullname = {creatorName}
                 username = {creatorUsername}
                 createdAt = {createdAt}
                />
                <PollActions
                 pollId={pollId}
                 isVoteComplete={isVoteComplete}
                 inputCaptured={
                    !(userResponse || selectedOptionIndex>=0 || rating)
                 }
                 onVoteSubmit = {handleVoteSubmit}
                 isBookmarked={pollBookmarked}
                 toogleBoookmark={toggleBookmark}
                 isMyPoll = {isMyPoll}
                 pollClosed={pollClosed}
                 //will implement later
                 onClosePoll={()=>{}}
                 onDelete={()=>{}}
                />
            </div>

            <div className='ml-14 mt-3'>
                <p className='text-[13px] text-black leading-8'>{question}</p>
                <div className='mt-4'>
                {(isVoteComplete || isPollClosed )? (
                    <PollingResultContent
                     type={type}
                     options={pollResult.options || []}
                     voters = {pollResult.voters}
                     response={pollResult.responses || []}
                    />
                ):
                    (<PollContent
                     type={type}
                     options={options}
                     selectedOptionIndex={selectedOptionIndex}
                     onOptionSelect = {handleInput}
                     rating={rating}
                     onRatingChange={handleInput}
                     userResponse={userResponse}
                     onResponseChange={handleInput}
                    />)
                    }
                </div>
            </div>
        </div>
        )
    )
        
}

export default PollCard