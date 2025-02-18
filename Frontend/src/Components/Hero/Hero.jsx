import React from 'react';
import './Hero.css';


const Hero = () => {
  return (
    <div className='hero root'>
      <div className="hero-content">
        <section id="home">
        <h1>Why Mentoring?</h1>
        <div className="hero-txt">
          <p className='fixed-txt'>
            Mentoring is a transformative experience that offers personalized
            guidance and support, helping individuals overcome academic challenges
            and make informed career decisions. It fosters skill development, providing
            practical insights into communication, problem-solving, and leadership, all
            of which are essential for future success. Through mentorship, students gain
            valuable career advice, while mentors offer real-world perspectives, helping
            mentees set clear goals and stay focused. Beyond academic and career growth,
            mentoring also creates opportunities for networking and building meaningful
            connections in various fields. Most importantly, it boosts confidence, 
            empowering students to pursue their aspirations with clarity and determination.
          </p>
        </div>

        <p className="extra-text">
        Mentoring is a transformative experience that provides personalized guidance,helping
         individuals navigate academic challenges and make informed career choices. It fosters
         essential skills in communication, problem-solving, and leadership. Through mentorship,
         students receive valuable career advice and real-world perspectives, enabling them to
         set clear goals. Additionally, mentoring creates networking opportunities and boosts
         confidence, empowering students to pursue their aspirations with clarity and determination.
          </p>
        </section>

      </div>
    </div>
  );
};

export default Hero;
