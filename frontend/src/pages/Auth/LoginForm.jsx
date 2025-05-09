import React, { useContext } from "react";
import AuthLayout from "../../components/layout/AuthLayout";
import { useNavigate,Link } from "react-router-dom";
import { useState } from "react";
import AuthInput from "../../components/input/AuthInput";
import { validateEmail } from "../../utils/helper";
import axiosInstance from "../../utils/axiosinstance";
import { API_PATH } from "../../utils/apiPaths";
import { UserContext } from "../../context/UserContext";


const LoginForm = () => {
  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");
  const [error,setError] = useState(null);
  const {updateUser} = useContext(UserContext)
  const navigates = useNavigate();

  
  const handleSubmit=async (e)=>{
    e.preventDefault();
    if(!validateEmail(email)){
      setError("Please enter a valid email address.");
      return;
    }
    if(!password){
      setError("Please enter the password");
      return;
    }
    setError("");
    //login API
    try{
      const response = await axiosInstance.post(API_PATH.AUTH.LOGIN,{
        email,
        password,
      });
      const {token,user} = response.data;
      
      if(token){
        localStorage.setItem("token",token);
        updateUser(user);
        navigate("/dashboard");
      }
    }catch(error){
      if(error.response && error.response.data.message){
        setError(error.response.data.message);
      }else{
        setError("Something went wrong .Please try again");
      }

    }

  }

  const navigate = useNavigate();
  return (
    <AuthLayout >
      <div className="lg:w-[70%] h-3/4 md:h-full flex flex-col justify-center">
        <h3 className="text-xl font-semibold text-black">Welcome Back</h3>
        <p className="text-xs text-slate-700 mt-[5px] mb-b">
          Please enter Your details to log in
        </p>

        <form onSubmit={handleSubmit}>
          <AuthInput
            value={email}
            onChange={({target})=>setEmail(target.value)}
            label="Email Address"
            placeholder="john@example.com"
            type="text"
          />

          <AuthInput
            value={password}
            onChange={({target})=>setPassword(target.value)}
            label="Password"
            placeholder="Min 8 characters"
            type="password"
          />

          {error && <p className="text-red-500 text-xs pb-2.5">{error}</p>}
          <button type="submit" className="btn-primary">
            LOGIN
          </button>

          <p className="text-[13px] text-slate-800 mt-3">
            Don't have and account?{" "}
            <Link className="font-medium text-primary uderline" to="/signup">
             SignUp
            </Link>
          </p>
        </form>
      </div>
    </AuthLayout>
  );
};

export default LoginForm;
