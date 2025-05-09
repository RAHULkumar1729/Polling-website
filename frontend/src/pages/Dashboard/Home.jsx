import React, { useState } from 'react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import useUserAuth from '../../hooks/useUserAuth'
import { useNavigate } from 'react-router-dom'
import HeaderWithFilter from '../../components/layout/HeaderWithFilter'
import axiosInstance from '../../utils/axiosinstance'
import { API_PATH } from '../../utils/apiPaths'
import { useEffect } from 'react'
import PollCard from '../../components/PollCard/PollCard'
import CREATE_ICON from "../../assets/images/my-poll-icon.png"  // chnages i made
import EmptyCard from '../../components/cards/EmptyCard'  //changes i made
import InfiniteScroll from 'react-infinite-scroll-component' // chnages i made
const PAGE_SIZE = 10

const Home = () => {
    useUserAuth()
    const navigate = useNavigate()
    const [allPolls, setAllPolls] = useState([])
    const [stats, setStats] = useState([])
    const [page, setPage] = useState(1)
    const [hasMore, setHasMore] = useState(true)
    const [loading, setLoading] = useState(false)
    const [filterType, setFilterType] = useState("")

    const fetchAllPolls = async (overridgePage = page) => {
        if (loading) return;

        setLoading(true)

        try {
            const response = await axiosInstance.get(`${API_PATH.POLLS.GET_ALL}?page=${overridgePage}&limit=${PAGE_SIZE}&type=${filterType}`)
            
            if (response.data?.polls?.length > 0) {
                setAllPolls((prevPolls) =>
                    overridgePage === 1 ? response.data.polls : [...prevPolls, ...response.data.polls]
                );
                setStats(response.data.stats || [])
                setHasMore(response.data.polls.length === PAGE_SIZE)
            }
            else {
                setHasMore(false)
                if (overridgePage === 1) {
                    setAllPolls([])
                }
            }

        } catch (error) {
            console.log("Something went wrong. Please try again!", error);
        }
        finally {
            setLoading(false)
        }
    }
     
    const loadMorePolls=()=>{
        setPage((prevPage)=>prevPage+1)
    }
    useEffect(() => {
        setPage(1)
        fetchAllPolls(1)
    }, [filterType])

    useEffect(() => {
        if (page !== 1) {
            fetchAllPolls()
        }
    }, [page])

    return (
        <DashboardLayout activeMenu='Dashboard'>
            <div className='my-5 mx-auto'>
                <HeaderWithFilter
                    title="Polls"
                    filterType={filterType}
                    setFilterType={setFilterType}
                />


                   {allPolls.length=== 0 && !loading && (
                                  <EmptyCard
                                  imgSrc = {CREATE_ICON}
                                  message="Welcome! You're the first user of the system, and there are no polls yet. Start by creating the first poll"
                                  btnText ="Create Poll"
                                  onClick = {()=>navigate("/create-poll")}
                                  />
                
                                 
                                )}


                      <InfiniteScroll
                dataLength={allPolls.length}
                next ={loadMorePolls}
                hasMore={hasMore}
                loader={<h4 className='info-text'>Loading...</h4>}
                endMessage={<p className='info-text'>No more polls to display.</p>}
                >

                {allPolls.map((poll) => (
                    <PollCard
                        key={`dashboard_${poll._id}`}
                        pollId={poll._id}
                        question={poll.question}
                        type={poll.type}
                        options={poll.options}
                        voters={poll.voters.length || 0}
                        response={poll.response || []}
                        creatorProfileImg={poll.creator.profileImageUrl || null}
                        creatorName={poll.creator.fullName}
                        creatorUsername={poll.creator.username}
                        userHasVoted={poll.userHasVoted || false}
                        isPollClosed={poll.closed || false}
                        createdAt={poll.createdAt || false}
                    />
                ))}
                </InfiniteScroll>
            </div>
        </DashboardLayout>
    )
}

export default Home