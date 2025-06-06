import React from 'react';
import UI_ELEMENT from '../../assets/images/ui-element.png'
import CARD_1 from '../../assets/images/auth-card-1.png'
import CARD_2 from '../../assets/images/auth-card-2.png'
import CARD_3 from '../../assets/images/auth-card-3.png'
const AuthLayout = ({children}) => {
  return (
    <div className='flex'>
        <div className='w-screen h-screen md:w-1/2 px-12 pt-8 pb-12'>
            <h2 className='text-lg font-medium text-black'>Pollify</h2>
            {children}
        </div>
        <div className='hidden md:block w-1/2 h-screen bg-sky-50 bg-cover bg-no-reapt bg-center overflow-hidden relative'>
            <img src={UI_ELEMENT} className='w-[50%] absolute right-0 top-14 bg-transparent'/>
            <img src={UI_ELEMENT} className='w-[55%] rotate-180 absolute left-0 -bottom-[15%] bg-transparent'/>

            <img src={CARD_1} className='w-64 lg:w-72 absolute top-[4%] left-[10%] shadow-lg shadow-blue-400/15' />
            <img src={CARD_2} className='w-64 lg:w-72 relative top-[30%] left-[34%] shadow-lg shadow-blue-400/15'/>
            <img src={CARD_3} className='w-64 lg:w-72 relative top-[40%] left-[54%] shadow-lg shadow-blue-400/15'/>
        </div>
    </div>
  )
}

export default AuthLayout