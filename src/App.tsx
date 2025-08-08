import React from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Services from './components/Services';
import TalentDevelopment from './components/TalentDevelopment';
import WorkExperience from './components/WorkExperience';
import SuccessStories from './components/SuccessStories';
import Resources from './components/Resources';
import Contact from './components/Contact';
import Footer from './components/Footer';

function App() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Hero />
      <Services />
      <TalentDevelopment />
      <WorkExperience />
      <SuccessStories />
      <Resources />
      <Contact />
      <Footer />
    </div>
  );
}

export default App;
