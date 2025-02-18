import React, { useEffect, useRef, useState } from 'react'
import Avatar from './Avatar'
import uploadFile from '../helpers/uploadFile'
import Divider from './Divider'
import axios from 'axios'
import taost from 'react-hot-toast'
import { useDispatch } from 'react-redux'
import { setUser } from '../redux/userSlice'



const EditUserDetails = ({onClose,user}) => {
    const [data,setData] = useState({
        
        name : user?.user,
        profile_pic : user?.profile_pic
    })
    const uploadPhotoRef = useRef()
    const dispatch = useDispatch()

    useEffect(() => {
        if (user) {
            const { socketConnection, ...cleanUser } = user;
            console.log(user) // Remove socketConnection
            setData(prev => ({
                ...prev,
                ...cleanUser
            }));
        }
    }, [user]);

    const handleOnChange = (e)=>{
        const { name, value } = e.target

        setData((preve)=>{
            return{
                ...preve,
                [name] : value
            }
        })
    }

    const handleOpenUploadPhoto = (e)=>{
        e.preventDefault()
        e.stopPropagation()

        uploadPhotoRef.current.click()
    }
    const handleUploadPhoto = async(e)=>{
        const file = e.target.files[0]

        const uploadPhoto = await uploadFile(file)

        setData((preve)=>{
        return{
            ...preve,
            profile_pic : uploadPhoto?.url
        }
        })
    }

    const handleSubmit = async(e)=>{
        e.preventDefault()
        e.stopPropagation()
        try {
            const URL = 'http://localhost:5010/api/update-user'

            const { socketConnection, ...sanitizedData } = data;

            const response = await axios.post(URL, sanitizedData, { withCredentials: true });

            console.log('response',response)
            taost.success(response?.data?.message)
            
            if(response.data.success){
                dispatch(setUser(response.data.data))
                onClose()
            }
         
        } catch (error) {
            console.log(error)
            taost.error()
        }
    }
  return (
    <div className='fixed top-0 bottom-0 left-0 right-0 bg-gray-700 bg-opacity-40 flex justify-center items-center z-10'>
        <div className='bg-white py-6  px-8 m-1 rounded w-full max-w-sm'>
            {/* <h2 className='font-semibold text-center'>Profile Details</h2> */}
            <h2 className='text-lg font-semibold text-center  '>Edit user details</h2>

            <form className='grid gap-3 mt-3' onSubmit={handleSubmit}>
                <div className='flex flex-col gap-1'>
                    <label htmlFor='name'>Name:</label>
                    <input
                        type='text'
                        name='name'
                        id='name'
                        value={data.name}
                        onChange={handleOnChange}
                        className='w-full py-1 px-2 focus:outline-primary border-0.5'
                    />
                </div>

                <div>
                    <div>Photo:</div>
                    <div className='my-1 flex items-center gap-4'>
                        <Avatar
                            width={50}
                            height={50}
                            imageUrl={data?.profile_pic}
                            name={data?.name}
                        />
                        <label htmlFor='profile_pic'>
                        <button className='font-semibold bg-green-600 text-white px-4 py-2 rounded-[10px] hover:bg-green-500 hover:scale-[1.03] transition duration-300' onClick={handleOpenUploadPhoto}>Change Photo</button>
                        <input
                            type='file'
                            id='profile_pic'
                            className='hidden'
                            onChange={handleUploadPhoto}
                            ref={uploadPhotoRef}
                        />
                        </label>
                    </div>
                </div>

                <Divider/>    
                <div className='flex gap-10 w-full justify-center '>
                <button onClick={handleSubmit} className='border-none bg-primary text-white border pl-6 pr-6 py-1 rounded hover:bg-secondary hover:scale-[1.03]'>Save</button>
                <button onClick={onClose} className='border-primary border bg-primary text-white px-4 py-1 rounded hover:bg-primary hover:scale-[1.03] '>Cancel</button> 
                </div>
            </form>
        </div>
    </div>
  )
}

export default React.memo(EditUserDetails)