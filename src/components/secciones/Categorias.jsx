import React from 'react';
import images from '../../assets/images';

const CATEGORIAS = [
  { filtro: 'all', img: images['imgc1'], alt: '', nombre: 'Todas las preparaciones', cantidad: '34 productos', delay: 0 },
  { filtro: 'tortas', img: images['menu/Torta_Panqueque_Naranja'], alt: 'Torta Panqueque Naranja', nombre: 'Tortas caseras', cantidad: '6 productos', delay: 70 },
  { filtro: 'bebestibles', img: images['menu/Bebestibles'], alt: '', nombre: 'Infusiones & bebestibles', cantidad: '10 productos', delay: 140 },
  { filtro: 'sandwiches', img: images['menu/Sandwich1'], alt: '', nombre: 'Sándwiches', cantidad: '5 productos', delay: 210 },
  { filtro: 'tartaletas', img: images['menu/tartaleta1'], alt: '', nombre: 'Tartaletas', cantidad: '5 productos', delay: 280 },
  { filtro: 'postres', img: images['menu/postre1'], alt: '', nombre: 'Postres', cantidad: '8 productos', delay: 350 }
];

export default function Categorias({ filtroActivo, onElegir }) {
  return (
    <section id="category">
      <div className="container">
        <div className="text-center mb-5" data-aos="fade-up">
          <span className="slbl">Lo que preparamos para ti</span>
          <h2 className="stitle">Explora nuestro <span>Menú</span></h2>
          <div className="sline"></div>
          <p className="sdesc mx-auto max-w-480">Desde tortas artesanales y café de especialidad hasta antojos para consentir a tu Papita interior.</p>
        </div>
        <div className="row g-3 justify-content-center">
          {CATEGORIAS.map((c) => (
            <div key={c.filtro} className="col-6 col-sm-4 col-md-3 col-lg-2" data-aos="zoom-in" data-aos-delay={c.delay}>
              <div className={`catcard${filtroActivo === c.filtro ? ' active' : ''}`} data-filter={c.filtro} onClick={() => onElegir(c.filtro)}>
                <img className="catimg" src={c.img} alt={c.alt} />
                <div className="catnm">{c.nombre}</div>
                <div className="catct">{c.cantidad}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
