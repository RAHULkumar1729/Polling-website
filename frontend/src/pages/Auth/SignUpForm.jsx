import React,{useState} from 'react'
import AuthLayout from '../../components/layout/AuthLayout'
import { useNavigate,Link } from 'react-router-dom'
import ProfilePhotoSelector from '../../components/input/ProfilePhotoSelector'
import AuthInput from '../../components/input/AuthInput'
import { validateEmail } from '../../utils/helper'
import axiosInstance from '../../utils/axiosinstance'
import { API_PATH } from '../../utils/apiPaths'

const SignUpForm = () => {
  const [profilePic,setProfilePic] = useState(null)
  const [fullName,setFullName] = useState("")
  const [email,setEmail] = useState("")
  const [username,setusername] = useState("")
  const [password,setPassword] = useState("")
  const [error,setError] = useState(null)

  const navigate = useNavigate();

  // Handle sign up form submit
  const hadleSignUp = async(e)=>{
        e.preventDefault();
        let profileImageUrl = ""
        if(!fullName){
          setError("Please enter the full name");
          return;
        }
        if(!validateEmail(email)){
          setError("Please enter a valid email address.");
          return;
        }
        if(!username){
          setError("Please enter the username");
          return;
        }
        setError("");
        //Sigin API
        try{
          //upload image if present
          if(profilePic){
            const imgUploadRes = await uploadImage(profilePic);
            profileImageUrl = imgUploadRes.imageUrl || "";
          }
          const response = await axiosInstance.post(API_PATH.AUTH.REGISTER, {
            fullName,
            username,
            email,
            password,
            profileImageUrl
          });
          const {token,user} = response.data;
        }catch(error){
          if(error.response && error.response.data.message){
            setError(error.response.data.message);
          }else{
            setError("Something went wrong .Please try again");
          }
        }
  }
  return (
    <AuthLayout>
       <div className='lg:w-[100%] h-auto md:h-full mt-10 md:mt-0 flex flex-col justify-center'>Sign Up form
        <h3 className='text-xl font-semibold text-black'>Create an Account</h3>
        <p className='text-x5 text-slate-700 mt-[5px] mb-6'>
          Join us today by entering your details below.
        </p>
        <form onSubmit={hadleSignUp}>
          <ProfilePhotoSelector image={profilePic} setImage={setProfilePic}/>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <AuthInput
              value={fullName}
              onChange={({ target})=>setFullName(target.value)}
              label="full Name"
              placeholder="rahul"
              type="text"
            />
            <AuthInput
            value={email}
            onChange={({target})=>setEmail(target.value)}
            label="Email Address"
            placeholder="john@example.com"
            type="text"
          />
          <AuthInput
            value={username}
            onChange={({target})=>setusername(target.value)}
            label="Username"
            placeholder="@"
            type="text"
          />

            <AuthInput
              value={password}
              onChange={({target})=>setPassword(target.value)}
              label="Password"
              placeholder="Min 8 characters"
              type="password"
            />
          </div>

          {error && <p className="text-red-500 text-xs pb-2.5">{error}</p>}
          <button type="submit" className="btn-primary">
            CREATE ACCOUNT
          </button>

          <p className="text-[13px] text-slate-800 mt-3">
            Already have an account?{" "}
            <Link className="font-medium text-primary uderline" to="/login">
             Login
            </Link>
          </p>
        </form>
      </div>
    </AuthLayout>
  )
}

export default SignUpForm