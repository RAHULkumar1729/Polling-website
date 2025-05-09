import React from 'react'
const PollOptionVoteResult = ({label,optionVotes,totalVotes})=>{
    //calculate progress directly
    const progress = 
    totalVotes > 0 ? Math.round((optionVotes/totalVotes)*100):0;
    return(
        <div className='w-full bg-slate-200/80 rounded-md h-6 relative mb-3'>
            <div
                className='bg-sky-900/10 h-6 rounded-md'
                style={{width:`${progress}%`}}
            ></div>
            <span className='absolute inset-0 flex items-center justify-between text-gray-800 text-[12px] font-medium mx-4'>
                {label} <span className='text-[11px] text-slate-500' >{progress}%</span>
            </span>
        </div>
    )
}
const ImagePollResult=({imgUrl,optionVotes,totalVotes})=>{
    return (
        <div>
            <div
             className='w-full bg-gray-800 flex items-center gap-2 mb-4 rounded-md overflow-hideen'
            >
                <img src={imgUrl} alt="" className='w-full h-36 object-contain'/>

            </div>
            <PollOptionVoteResult optionVotes={optionVotes} totalVotes={totalVotes}/>
        </div>
    )
}
const PollingResultContent = ({
    type,
    options,
    voters,
    responses
}) => {
    switch(type){
        case "single-choice":
        case "yes/no":
        case "rating":
            return (
                <>
                  {options.map((option, index) => (
                    <PollOptionVoteResult
                      key={option._id || index}
                      label={`${option.optionText} ${type === "rating" ? "star" : ""}`}
                      optionVotes={option.votes}
                      totalVotes={voters || 0}
                    />
                  ))}
                </>
              );
        case "image-based":
            return(
                <div className='grid frid-cols-2 gap-4'>
                    {options.map((option,index)=>{
                        <ImagePollResult
                         key={option._id}
                         imgUrl={option.optionText || ""}
                         optionVoters={option.votes}
                         totalVotes={voters || 0}
                />

                    })}
                </div>
            )
        default:
            return null;
    }
}

export default PollingResultContent