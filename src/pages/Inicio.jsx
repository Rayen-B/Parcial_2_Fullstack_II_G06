import React, { useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import AOS from 'aos';
import { useTienda } from '../context/TiendaContext';
import LightboxImagen from '../components/molecules/LightboxImagen';
import CarruselTestimonios from '../components/organisms/CarruselTestimonios';
import Hero from '../components/secciones/Hero';
import Categorias from '../components/secciones/Categorias';
import Nosotros from '../components/secciones/Nosotros';
import MenuSeccion from '../components/secciones/MenuSeccion';
import OfertaEspecial from '../components/secciones/OfertaEspecial';
import Galeria from '../components/secciones/Galeria';
import Historia from '../components/secciones/Historia';
import Chefs from '../components/secciones/Chefs';
import Horarios from '../components/secciones/Horarios';
import Reservacion from '../components/secciones/Reservacion';
import Blog from '../components/secciones/Blog';
import Boletin from '../components/secciones/Boletin';
import Contacto from '../components/secciones/Contacto';
import images from '../assets/images';

// Página principal de la tienda
export default function Inicio() {
  const location = useLocation();
  const { filtro, filtrarMenu } = useTienda();
  const [historiaAbierta, setHistoriaAbierta] = useState(false);

  // Animaciones al hacer scroll
  useEffect(() => {
    AOS.init({ duration: 680, once: true, offset: 55 });
    AOS.refreshHard();
  }, []);

  useEffect(() => {
    if (!location.hash) return undefined;
    const t = setTimeout(() => {
      const destino = document.querySelector(location.hash);
      if (destino) window.scrollTo({ top: destino.offsetTop - 78, behavior: 'smooth' });
    }, 100);
    return () => clearTimeout(t);
  }, [location.hash]);

  // Tarjetas de categoría: bajan al menú y luego aplican el filtro
  const elegirCategoria = (cat) => {
    window.scrollTo({ top: document.getElementById('menu').offsetTop - 80, behavior: 'smooth' });
    setTimeout(() => filtrarMenu(cat), 480);
  };

  const cerrarHistoria = useCallback(() => setHistoriaAbierta(false), []);

  return (
    <>
      <Hero onVerHistoria={() => setHistoriaAbierta(true)} />
      <Categorias filtroActivo={filtro} onElegir={elegirCategoria} />
      <Nosotros />
      <MenuSeccion />
      <OfertaEspecial />
      <Galeria />
      <Historia />
      <Chefs />
      <Horarios />
      <CarruselTestimonios />
      <Reservacion />
      <Blog />
      <Boletin />
      <Contacto />
      <LightboxImagen src={images['Historia']} abierto={historiaAbierta} onCerrar={cerrarHistoria} />
    </>
  );
}
