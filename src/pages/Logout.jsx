import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Logout = () => {
  //const navigate = useNavigate();

  // Automatically redirect to / after 3 seconds
  //useEffect(() => {
    //onLogout(); // Reset authentication state
    //const timer = setTimeout(() => {
      //navigate('/login', { replace: true });
   // }, 3000);
    //return () => clearTimeout(timer); // Cleanup timer
  //}, [navigate, onLogout]);


  return (
    <div className="max-w-md mx-auto my-4 sm:my-6 md:my-8 px-2 sm:px-4 md:px-6">
      <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-4 sm:p-6 md:p-8 text-center">
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">
          You Have Been Logged Out
        </h2>
        <p className="text-xs sm:text-sm md:text-base text-gray-600 mb-4 sm:mb-6">
          You will be redirected to the login page in a few seconds.
        </p>
        <button
          //onClick={handleSupportClick}
          className="text-xs sm:text-sm md:text-base text-blue-600 hover:underline font-medium"
        >
          Contact Support Team
        </button>
      </div>
    </div>
  );
};

export default Logout;