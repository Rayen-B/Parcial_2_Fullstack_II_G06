import React from 'react';
import { Link } from 'react-router-dom';

// Ejemplo de la documentación (React II, diapositivas 10, 13 y 14):
// un componente por defecto (Header) y uno secundario (Footer) exportados desde el mismo archivo.
function Header() {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/">Mi Sitio</Link>
        <Link to="/">Inicio</Link>
        <Link to="/about">Acerca</Link>
        <Link to="/contact">Contacto</Link>
      </div>
    </nav>
  );
}

export function Footer() {
  return <footer>Pie de página</footer>;
}

export default Header;
