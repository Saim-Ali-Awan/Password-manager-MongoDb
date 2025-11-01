// src/App.jsx
import { useState } from 'react';
import Navbar from './components/Navbar';
import Lottie from 'lottie-react';
import { AiFillSave } from 'react-icons/ai';
import Manager from './components/Manager';

function App() {
  const [count, setCount] = useState(0);

  return (
    <>

     <Navbar/>
    <Manager/>
         <div className='mt-3 border-t-[2px] border-[var(--secondary)] h-14 text-center p-3'>
        <p className='text-lg  bg-clip-text text-[var(--primary)]'>Created with <b>Love</b> and <b>effort</b> by <span className='text-xl'>
          <b>Saim Ali</b></span> </p>
      </div>
    </>
  );
}

export default App;