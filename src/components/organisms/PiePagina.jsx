import React from 'react';

const ENLACES_RAPIDOS = [
  { href: '#hero', texto: 'Inicio' },
  { href: '#about', texto: 'Sobre nosotros' },
  { href: '#menu', texto: 'Nuestro menú' },
  { href: '#reservation', texto: 'Reservacion' },
  { href: '#blog', texto: 'Blog' },
  { href: '#contact-section', texto: 'Contacto' }
];

const CATEGORIAS_MENU = ['Tortas', 'Infusiones & bebestibles', 'Sándwiches', 'Tartaletas', 'Postres'];

const CONTACTO = [
  { icono: 'fa-map-marker-alt', titulo: 'Dirección', texto: 'Av. Papita Dulce, Santiago, Chile' },
  { icono: 'fa-phone-alt', titulo: 'Teléfono', texto: '+56 9 1234 5678' },
  { icono: 'fa-envelope', titulo: 'Correo electrónico', texto: 'papitadulce@gmail.com' },
  { icono: 'fa-clock', titulo: 'Horario', texto: 'Mar - Sab: 09 AM - 11 PM' }
];

export default function PiePagina() {
  return (
    <footer>
      <div className="container">
        <div className="row g-5">
          <div className="col-lg-4">
            <div className="fnm">Papita<span>Dulce</span></div>
            <p className="fdesc">Reunimos los mejores sabores del mundo en una experiencia rápida, amable y asequible. Cada comida está elaborada con amor.</p>
            <div className="fsoc">
              <a href="#"><i className="fab fa-facebook-f"></i></a>
              <a href="#"><i className="fab fa-instagram"></i></a>
              <a href="#"><i className="fab fa-twitter"></i></a>
              <a href="#"><i className="fab fa-youtube"></i></a>
              <a href="#"><i className="fab fa-tiktok"></i></a>
            </div>
          </div>
          <div className="col-sm-6 col-lg-2">
            <div className="ftit">Enlaces rápidos</div>
            <ul className="flinks ps-0">
              {ENLACES_RAPIDOS.map((e) => (
                <li key={e.href}><a href={e.href}><i className="fas fa-chevron-right"></i>{e.texto}</a></li>
              ))}
            </ul>
          </div>
          <div className="col-sm-6 col-lg-2">
            <div className="ftit">Nuestro menú</div>
            <ul className="flinks ps-0">
              {CATEGORIAS_MENU.map((c) => (
                <li key={c}><a href="#menu"><i className="fas fa-chevron-right"></i>{c}</a></li>
              ))}
            </ul>
          </div>
          <div className="col-lg-4">
            <div className="ftit">Contáctanos</div>
            {CONTACTO.map((c) => (
              <div className="fci" key={c.titulo}>
                <div className="fciico"><i className={`fas ${c.icono}`}></i></div>
                <div className="fciinfo"><strong>{c.titulo}</strong>{c.texto}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="fbot">
        <div className="container">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
            <p>&copy; 2026 <span>Papita Dulce</span>. Todos los derechos reservados. Hecho con <span><i className="fas fa-heart"></i></span></p>
            <div><a href="#">Política de privacidad</a><a href="#">Terminos</a><a href="#">Cookies</a></div>
          </div>
        </div>
      </div>
    </footer>
  );
}
