import React, { useEffect, useState } from 'react';
import './Carousels.css';
import img1 from '../../assets/1.webp';
import img2 from '../../assets/2.jpg';
import img3 from '../../assets/3.jpg';
import img4 from '../../assets/4.webp';

const Carousels = () => {
  const [counter, setCounter] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setCounter((prevCounter) => (prevCounter >= 4 ? 1 : prevCounter + 1));
    }, 5000);

    return () => clearInterval(interval);
  }, []);
  const handleManualClick = (index) => {
    setCounter(index);
  }

  return (
    <div className="caro">
      <div className="slider">
        <div className="slides">
          
          <input type="radio" name="radio-btn" id="radio1" checked={counter === 1}  />
          <input type="radio" name="radio-btn" id="radio2" checked={counter === 2}  />
          <input type="radio" name="radio-btn" id="radio3" checked={counter === 3}  />
          <input type="radio" name="radio-btn" id="radio4" checked={counter === 4}  />

         
          <div className='slide first'>
            <img src={img1} alt="Slide 1" />
          </div>
          <div className="slide">
            <img src={img2} alt="Slide 2" />
          </div>
          <div className="slide">
            <img src={img3} alt="Slide 3" />
          </div>
          <div className="slide">
            <img src={img4} alt="Slide 4" />
          </div>

          
          <div className="navigate-auto">
            <div className="auto-btn1"></div>
            <div className="auto-btn2"></div>
            <div className="auto-btn3"></div>
            <div className="auto-btn4"></div>
          </div>
        </div>   

        
        <div className="navigate-manual">
          <label htmlFor="radio1" className="manual-btn" onClick={() =>handleManualClick(1)}></label>
          <label htmlFor="radio2" className="manual-btn" onClick={() =>handleManualClick(2)}></label>
          <label htmlFor="radio3" className="manual-btn" onClick={() =>handleManualClick(3)}></label>
          <label htmlFor="radio4" className="manual-btn" onClick={() =>handleManualClick(4)}></label>
        </div>
      </div>
    </div>
  );
};

export default Carousels;
