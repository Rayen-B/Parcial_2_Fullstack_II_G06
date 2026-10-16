import React from 'react';
import { Link } from 'react-router-dom';

// Ejemplo de la documentación (React IV, diapositiva 20)
export default function Home() {
  return (
    <div>
      <h1>Inicio</h1>
      <Link to="/about">Ir a About</Link>
    </div>
  );
}
