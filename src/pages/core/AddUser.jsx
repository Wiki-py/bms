import React from "react";
import { useNavigate } from "react-router-dom";

const adduser = () =>{
    const navigate = useNavigate();
    return(
        <div className="max-w-lg mx-auto my-4 sm:my-6 md:my-8 p-4 sm:p-6 bg-white border border-gray-200 rounded-lg shadow-md">
            <div>
                <h1 className="align-enter font-bold font-xl text-center text-blue-500">Add User</h1>
            </div>
            <div className="flex justify-center items-center mt-5 border-grey-500 p-5 rounded-lg shadow-lg">
                <form action="" className="flex flex-col gap-2 sm:gap-3 w-full">
                    <div className="mb-3 justify-center items-center flex flex-col">
                        <label htmlFor="" className="mb-1 sm:mb-2 font-semibold text-gray-700 text-sm sm:text-base">User Name</label>
                        <input type="text" placeholder='Enter Name' className="p-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"/>
                    </div>
                    <div className="mb-3 justify-center items-center flex flex-col">
                        <label htmlFor="" className="mb-1 sm:mb-2 font-semibold text-gray-700 text-sm sm:text-base">User Email</label>
                        <input type="email" placeholder='yourname@example.com' className="p-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"/>
                    </div>
                     <div className="mb-4 flex flex-col items-center justify-center w-full max-w-md mx-auto">
                    <label
                      htmlFor="passport-upload"
                      className="mb-2 text-sm font-semibold text-gray-700 sm:text-base"
                    >
                      User Passport
                    </label>
                    <div className="relative w-full">
                      <input
                        id="passport-upload"
                        type="file"
                        accept="image/jpeg,image/png"
                        className="w-full px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg 
                                  file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 
                                  file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 
                                  hover:file:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 
                                  disabled:opacity-50"
                        aria-describedby="file-error"
                      />
                    </div>
                  </div>
                    <div className="mb-3 justify-center items-center flex flex-col">
                        <label htmlFor="" className="mb-1 sm:mb-2 font-semibold text-gray-700 text-sm sm:text-base">Phone</label>
                        <input type="text" placeholder='Enter Name' className="w-full p-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"/>
                    </div>
                    <div className="mb-3 justify-center items-center flex flex-col">
                        <label htmlFor="" className="mb-1 sm:mb-2 font-semibold text-gray-700 text-sm sm:text-base">User Password</label>
                        <input type="password" placeholder='Password' className="p-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"/>
                    </div>
                    <div className="mb-3 justify-center items-center flex flex-col">
                        <label htmlFor="" className="mb-1 sm:mb-2 font-semibold text-gray-700 text-sm sm:text-base">Repeat Password</label>
                        <input type="password" placeholder='Password Again' className="p-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"/>
                    </div>
                </form>
                
            </div>
            <div className="flex justify-center items-center">
            <button onClick={() => navigate('/Users')} className="bg-blue-500 hover:bg-blue-600 rounded-lg p-2 m-4 text-white font-bold">Back to Users</button>
            <button onClick={() => navigate('/Users')} className="bg-green-500 hover:bg-green-600 rounded-lg p-2 m-4 text-white font-bold">Add User</button>
            </div>
        </div>
    )
}
export default adduser;