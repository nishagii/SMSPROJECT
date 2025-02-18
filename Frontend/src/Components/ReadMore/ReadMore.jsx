import React from 'react'
import { useState } from 'react'
import './ReadMore.css'

function ReadMore({shortContent,longContent}) {
    const [collapse,setCollapse] = useState(false)

    const handleToggle = () => {
        setCollapse(!collapse); // Toggle the collapse state
    };

  return (
    <div className='content-read'>
            <p>
                {shortContent}
            </p>
            <span className={`long-text ${collapse ? "expanded" : ""}`}>
                {longContent}
            </span>
            
            <div className='btn-wrap'>
                <button onClick={handleToggle} className='more-btn'>
                    {collapse ? 'Read less' : 'Read more'}
                </button>
            </div>
            
        </div>
  )
}

export default ReadMore
