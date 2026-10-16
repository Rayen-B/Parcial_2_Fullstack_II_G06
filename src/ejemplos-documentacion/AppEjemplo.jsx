import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header, { Footer } from './Header';
import Home from './Home';
import About from './About';
import Contact from './Contact';

// Ejemplo de la documentación (React II, diapositiva 9): Header y Footer fijos, solo cambia el centro.
export default function AppEjemplo() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
      <Footer />
    </>
  );
}
