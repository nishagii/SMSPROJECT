import React from 'react'
import Navbar from './Components/Navbar/Navbar.jsx';
import Hero from './Components/Hero/Hero.jsx';
import About from './Components/About/About.jsx';
import Footer from './Components/Footer/Footer.jsx';
import Carousels from './Components/Carousels/Carousels.jsx';



const Home = () => {
  return (
    <div>
        <Navbar />
        <Hero />
        <Carousels />     
        <About />
        <Footer />
    </div>
  )
}

export default Home