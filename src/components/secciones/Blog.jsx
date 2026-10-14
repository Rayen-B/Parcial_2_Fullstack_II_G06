import React from 'react';
import images from '../../assets/images';

const ARTICULOS = [
  { img: images['menu/Torta_Panqueque_Naranja'], dia: '14', mes: 'Mar', tag: 'Secreto de reposteria', titulo: '¿Pastelería sin culpas? Cómo logramos el equilibrio entre lo dulce y lo fresco.', autor: 'Casimiro Mirón', comentarios: 24, delay: 0 },
  { img: images['menu/Sandwich1'], dia: '28', mes: 'Feb', tag: 'Ciencia de los alimentos', titulo: '¿Se está volviendo más saludable la comida rápida? Esto es lo que descubrimos.', autor: 'Pepe Nillo', comentarios: 18, delay: 80 },
  { img: images['menu/Postre2'], dia: '05', mes: 'Jun', tag: 'Recetas', titulo: 'Innovadora receta casera de crujientes merengues', autor: 'Chef Elena Tilla', comentarios: 32, delay: 160 }
];

export default function Blog() {
  return (
    <section id="blog">
      <div className="container">
        <div className="text-center mb-5" data-aos="fade-up">
          <span className="slbl">Noticias &amp; Actualizaciones</span>
          <h2 className="stitle">Nuestros últimos <span>artículos</span> del blog</h2>
          <div className="sline"></div>
        </div>
        <div className="row g-4">
          {ARTICULOS.map((a) => (
            <div className="col-md-6 col-lg-4" data-aos="fade-up" data-aos-delay={a.delay} key={a.titulo}>
              <div className="blcard">
                <div className="blimg">
                  <img src={a.img} alt="" />
                  <div className="bldatebdg"><span className="bd">{a.dia}</span><span className="bm">{a.mes}</span></div>
                </div>
                <div className="blbody">
                  <div className="bltag">{a.tag}</div>
                  <div className="bltit"><a href="#">{a.titulo}</a></div>
                  <div className="blmeta"><span><i className="fas fa-user"></i>{a.autor}</span><span><i className="fas fa-comment"></i>{a.comentarios} comentarios</span></div>
                  <a href="#" className="blmore">Leer más <i className="fas fa-arrow-right"></i></a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
