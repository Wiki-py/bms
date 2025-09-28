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
    <div className='bg-black flex'>
      <div className='grid grid-cols-3'>
        <div className='bg-gray-500 roundes-lg p-4 m-4 '>
          <div>
            <h3 className='text-white font-bold text-lg p-2'>Card title</h3>
          </div>
          <div>
            <img src="./public\icons\logo512.png" alt="Song cover" className='bg-white rounded-md' />
          </div>
          <div>
            <p className='text-white font-bold align-center'>Card details</p>
          </div>
          <button className = "bg-blue-500 text-white p-2 rounded-lg">Download</button>
        </div>
        <div className='bg-gray-500 roundes-lg p-4 m-4 '>
          <div>
            <h3 className='text-white font-bold text-lg p-2'>Card title</h3>
          </div>
          <div>
            <img src="./public\icons\logo512.png" alt="Song cover" className='bg-white rounded-md' />
          </div>
          <div>
            <p className='text-white font-bold align-center'>Card details</p>
          </div>
          <button className = "bg-blue-500 text-white p-2 rounded-lg">Download</button>
        </div>
        
      </div>


      <div>
        <div>
          <input type="search" className='bg-white rounded-lg p-1 m-3' />
        </div>
        <h3 className='text-white'>You may also like</h3>
        <div className='grid grid-cols-2'>
          <div className='bg-gray-500 roundes-lg p-4 m-4 '>
          <div>
            <h3 className='text-white font-bold text-lg p-2'>Card title</h3>
          </div>
          <div>
            <img src="./public\icons\logo512.png" alt="Song cover" className='bg-white rounded-md' />
          </div>
          <div>
            <p className='text-white font-bold align-center'>Card details</p>
          </div>
          <button className = "bg-blue-500 text-white p-2 rounded-lg">Download</button>
        </div>
        </div>
      </div>
    </div>
  );
};

export default Logout;