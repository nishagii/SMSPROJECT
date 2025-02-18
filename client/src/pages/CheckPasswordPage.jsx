import React, { useEffect, useState } from 'react'
//import { IoClose } from "react-icons/io5";
import { Link, useLocation, useNavigate } from 'react-router-dom';
//import uploadFile from '../helpers/uploadFile';
import axios from 'axios'
import toast from 'react-hot-toast';
//import { PiUserCircle } from "react-icons/pi";
import Avatar from '../components/Avatar';
import { useDispatch } from 'react-redux';
import { setToken } from '../redux/userSlice';

const CheckPasswordPage = () => {
  const [data,setData] = useState({
    password : "",
    userId : ""
    
  })
  const navigate = useNavigate()
  const location = useLocation()
  const dispath = useDispatch()


  useEffect(() =>{
    if(!location?.state?.name){
      navigate("/email")
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[])

  const handleOnChange = (e)=>{
    const { name, value} = e.target

    setData((preve)=>{
      return{
          ...preve,
          [name] : value
      }
    })
  }



  const handleSubmit = async(e)=>{
    e.preventDefault()
    e.stopPropagation()

    const URL = 'http://localhost:5010/api/password'


    try {
        const response = await axios({
          method: 'POST',
          url : URL,
          data : {
            userId : location?.state?._id,
            password : data.password
            
          },
          withCredentials : true
        })

        toast.success(response.data.message)

        if(response.data.success){
          dispath(setToken(response?.data?.token))
          localStorage.setItem('token',response?.data?.token)
            setData({
            
              password : "",
             
            })

            navigate('/')

        }
    } catch (error) {
        toast.error(error?.response?.data?.message)
    }
  
  }


  return (
    <div className="flex justify-center items-center h-screen">
      <div className="bg-white w-full max-w-md rounded p-4 shadow-lg">
        <div className="flex justify-center items-center flex-col mb-4">
          <Avatar
            width={70}
            height={70}
            name={location?.state?.name}
            imageUrl={location?.state?.profile_pic}
          />
          <h2 className="font-semibold text-lg mt-1">{location?.state?.name}</h2>
        </div>
  
        <form className="grid gap-4 mt-2 p-2" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-1">
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Enter your password"
              className="bg-slate-100 px-2 py-1 focus:outline-primary"
              value={data.password}
              onChange={handleOnChange}
              required
            />
          </div>
  
          <button className="bg-primary text-lg px-4 py-1 hover:bg-secondary rounded mt-2 font-bold text-white">
            Login
          </button>
        </form>
  
        <p className="my-3 text-center">
          <Link to="/forgot-password" className="hover:text-primary font-semibold">
            Forgot password?
          </Link>
        </p>
      </div>
    </div>
  );
  
}  

export default CheckPasswordPage

