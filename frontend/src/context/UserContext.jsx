import React, { createContext, useState } from 'react'
export const UserContext = createContext();

export const UserProvider = ({children}) => {
  const [user,setUser] = useState(null);
  //Funtion to update user data
  const updateUser = (userData) =>{
    setUser(userData);
  };

  //Function to clear user data (e.g.. on logout)
  const clearUser = () =>{
    setUser(null);
  };


  //update user Stats
  const updateUserStats = (key,value)=>{
    setUser((prev)=>({
      ...prev,
      [key]:value

    }))
  }
  //update totalPollsVotes count lacally
  const onUserVoted=()=>{
    const totalPollsVotes = user.totalPollsVotes || 0;
    updateUserStats("totalPollsVoters",totalPollsVotes+1);
  };


  //Update totalPollscreated count locally
  const onPollCreateOrDelete = (type="create") =>{
         const totalPollsCreated = user.totalPollsCreated || 0;
         updateUserStats(
          "totalPollsCreated",
          type== "create"? totalPollsCreated+1: totalPollsCreated-1
         )
  }
  // function onPollCreateOrDelete(actionType) {
  //   let currentCount = user.totalPollsCreated || 0;
    
  //   if (actionType === "create") {
  //     currentCount += 1;
  //   } else {
  //     currentCount -= 1;
  //   }
    
  //   updateUserStats("totalPollsCreated", currentCount);
  // }
  //Add or Remove poll id from bookmarkedPolls
  const toggleBookmarkId = (id)=>{
    const bookmarks = user.bookmarkedPolls || [];
    const index = bookmarks.indexOf(id);
    if(index === -1){
      //Add the ID if it's not in the array
      setUser((prev)=>({
        ...prev,
        bookmarkedPolls: [...bookmarks, id],
        totalPollsBookmarked: prev.totalPollsBookmarked + 1,
      }));
    }
    else{
      //Remove the Id if it's already in the array
      setUser((prev)=>({
        ...prev,
        bookmarkedPolls: bookmarks.filter((item)=>item !== id),
        totalPollsBookmarked:prev.totalPollsBookmarked-1,
      }));
    }
  }

  return (
    <UserContext.Provider
        value={{
            user,
            updateUser,
            clearUser,
            onPollCreateOrDelete,
            onUserVoted,
            toggleBookmarkId
        }}
    >{children}</UserContext.Provider>
  )
}

export default UserProvider;