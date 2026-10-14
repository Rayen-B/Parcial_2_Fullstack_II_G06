import React, { useEffect, useState } from 'react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useTienda } from '../../context/TiendaContext';
import images from '../../assets/images';

const ENLACES = [
  { href: '#hero', texto: 'Inicio' },
  { href: '#about', texto: 'Nosotros' },
  { href: '#menu', texto: 'Menú' },
  { href: '#chefs', texto: 'Equipo' },
  { href: '#reservation', texto: 'Reservacion' },
  { href: '#testimonials', texto: 'Reseñas' },
  { href: '#contact-section', texto: 'Contacto' }
];

export default function BarraNavegacion() {
  const { totalCantidad, mostrarModalCarrito } = useCart();
  const { usuario, mostrarModalAuth, setMostrarModalAuth } = useAuth();
  const { setBuscadorAbierto, abrirCarrito } = useTienda();

  const [conScroll, setConScroll] = useState(false);
  const [seccionActiva, setSeccionActiva] = useState('hero');

  // al hacer scroll la navbar cambia de estilo y se marca
  // como activo el link de la sección que se está viendo
  useEffect(() => {
    const onScroll = () => {
      setConScroll(window.scrollY > 60);
      document.querySelectorAll('section[id]').forEach((sec) => {
        const top = sec.offsetTop - 110;
        const bot = top + sec.offsetHeight;
        if (window.scrollY >= top && window.scrollY < bot) setSeccionActiva(sec.id);
      });
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav className={`navbar navbar-expand-lg${conScroll ? ' scrolled' : ''}`} id="nav">
      <div className="container">
        <a className="navbar-brand" href="#">
          <div className="blogo">
            <div className="bico">
              <img src={images['logopapita']} alt="Papita Dulce logo" />
            </div>
            <div>
              <div className="bname">Papita<span>Dulce</span></div>
              <div className="bsub">Pasteleria &amp; Cafeteria</div>
            </div>
          </div>
        </a>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navmenu" aria-label="Abrir menú">
          <i className="fas fa-bars"></i>
        </button>
        <div className="collapse navbar-collapse" id="navmenu">
          <ul className="navbar-nav mx-auto">
            {ENLACES.map((enlace) => (
              <li className="nav-item" key={enlace.href}>
                <a className={`nav-link${seccionActiva === enlace.href.slice(1) ? ' active' : ''}`} href={enlace.href}>
                  {enlace.texto}
                </a>
              </li>
            ))}
          </ul>
          <div className="d-flex align-items-center gap-1">
            <button id="navSearchBtn" title="Buscar" type="button" onClick={() => setBuscadorAbierto(true)}>
              <i className="fas fa-search"></i>
            </button>
            <button
              id="accountToggle"
              className={`account-toggle${usuario ? ' is-logged-in' : ''}`}
              type="button"
              aria-label="Abrir mi cuenta"
              aria-controls="accountPanel"
              aria-expanded={mostrarModalAuth}
              title={usuario ? 'Sesión iniciada como ' + usuario.correo : undefined}
              onClick={() => setMostrarModalAuth(true)}
            >
              <i className="fas fa-user"></i>
              <span>{usuario ? usuario.nombre.split(' ')[0] : 'Mi cuenta'}</span>
            </button>
            <button
              id="cartToggle"
              className="nav-link nav-cta"
              type="button"
              aria-label="Abrir carrito"
              aria-controls="cartPanel"
              aria-expanded={mostrarModalCarrito}
              onClick={abrirCarrito}
            >
              <i className="fas fa-shopping-bag me-1"></i>Carrito{' '}
              <span id="cartCount" aria-label="Productos en el carrito">{totalCantidad}</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
