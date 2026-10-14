import React, { useEffect, useRef, useState } from 'react';
import { useOverlay } from '../../hooks/useOverlay';
import { formatearPrecio, precioANumero } from '../../utils/formato';
import { obtenerImagen } from '../../assets/images';

// Variantes fijas de la Torta Panqueque Naranja 
const VARIANTES_ESPECIALES = [
  {
    label: 'Torta completa',
    img: 'menu/Torta_Panqueque_Naranja',
    title: 'Torta Panqueque Naranja',
    price: '$16.900', old: '$20.000',
    desc: 'Deliciosa torta completa de capas de panqueques suaves rellena de crema pastelera, mermelada casera de naranja y frutas frescas.',
    tags: 'Casera,Más vendido,Naranja', cal: '450', time: '15', rating: '4.9', reviews: '156'
  },
  {
    label: 'Trozo',
    img: 'menu/Trozo_torta_panqueque_naranja',
    title: 'Trozo de Panqueque Naranja',
    price: '$2.000', old: '$3.200',
    desc: 'Una deliciosa porción individual de nuestra torta de panqueques con crema pastelera y mermelada casera de naranja.',
    tags: 'Porción,Favorita,Naranja', cal: '150', time: '5', rating: '4.9', reviews: '89'
  }
];

/**
 * Calcula las variantes "Torta completa" / "Trozo" de un producto.
 * El trozo cuesta aprox. un 20% de la torta (mínimo $500), tiene 1/4 de las
 * calorías y el 40% del tiempo de preparación 
 */
export function calcularVariantes(base) {
  if (base.specialVariants) return VARIANTES_ESPECIALES;
  const precio = precioANumero(base.price);
  const anterior = precioANumero(base.old);
  const precioTrozo = Math.max(500, Math.round((precio * 0.2) / 100) * 100);
  const anteriorTrozo = anterior ? Math.round((anterior * 0.2) / 100) * 100 : 0;
  return [
    {
      label: 'Torta completa',
      img: base.img, title: base.title, price: base.price, old: base.old || '',
      desc: base.desc, tags: base.tags || '', cal: base.cal, time: base.time, rating: base.rating, reviews: base.reviews
    },
    {
      label: 'Trozo',
      img: base.img,
      title: 'Trozo de ' + base.title,
      price: formatearPrecio(precioTrozo),
      old: anteriorTrozo ? formatearPrecio(anteriorTrozo) : '',
      desc: 'Porción individual de ' + base.desc,
      tags: (base.tags || '') + ',Porción',
      cal: String(Math.max(80, Math.round(parseInt(base.cal, 10) * 0.25))),
      time: String(Math.max(5, Math.round(parseInt(base.time, 10) * 0.4))),
      rating: base.rating,
      reviews: String(Math.max(1, Math.round(parseInt(base.reviews, 10) * 0.55)))
    }
  ];
}

export function tieneVariantes(base) {
  const categoriaConVariantes = ['tortas', 'tartaletas'].includes(base.cat.trim().toLowerCase());
  return Boolean(base.hasVariants) || categoriaConVariantes;
}

// Popup con el detalle de un producto. base: datos de la tarjeta; datos: datos de la variante elegida
export default function PopupProducto({ abierto, onCerrar, base, datos, onElegirVariante, onAgregar }) {
  const [cantidad, setCantidad] = useState(1);
  const [eligioVariante, setEligioVariante] = useState(false);
  const [agregado, setAgregado] = useState(false);
  const timer = useRef(null);

  useOverlay(abierto, onCerrar);

  // Cada vez que se abre: cantidad 1 y botón "Añadir al carrito" normal
  useEffect(() => {
    if (!abierto) return;
    setCantidad(1);
    setEligioVariante(false);
    setAgregado(false);
  }, [abierto, base]);

  useEffect(() => () => clearTimeout(timer.current), []);

  const variantes = base ? calcularVariantes(base) : [];
  const mostrarVariantes = base ? tieneVariantes(base) : false;
  const rating = datos ? parseFloat(datos.rating) : 0;
  const llenas = Math.round(rating);

  const agregar = () => {
    onAgregar({
      id: datos.img + '|' + datos.title,
      nombre: datos.title,
      precio: precioANumero(datos.price),
      imagen: datos.img
    }, cantidad);
    setAgregado(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      onCerrar();
      setAgregado(false);
    }, 1000);
  };

  return (
    <div id="menuPop" className={abierto ? 'open' : ''} onClick={(e) => { if (e.target === e.currentTarget) onCerrar(); }}>
      <div className="mpbox">
        <button className="mpclose" id="mpClose" onClick={onCerrar}><i className="fas fa-times"></i></button>
        <div className="mpimg"><img id="mpImg" src={datos ? obtenerImagen(datos.img) : undefined} alt={eligioVariante && datos ? datos.title : ''} /></div>
        {datos && (
          <div className="mpbody">
            <div id="mpCat">{datos.cat}</div>
            <div id="mpTitle">{datos.title}</div>
            <div id="mpStars">
              {Array.from({ length: llenas }, (_, i) => <i key={i} className="fas fa-star"></i>)}
              {!eligioVariante && '☆'.repeat(Math.max(0, 5 - llenas))}
              {' '}<span style={{ color: '#bbb', fontSize: '.78rem' }}>{datos.rating} ({datos.reviews} reseñas)</span>
            </div>
            <div id="mpDesc">{datos.desc}</div>
            <div className="mpvariants" id="mpVariants" role="group" aria-label="Elegir presentación de la torta" style={{ display: mostrarVariantes ? 'flex' : 'none' }}>
              <span className="mpvariants-label">Elige tu presentación</span>
              {variantes.map((v) => (
                <button
                  key={v.label}
                  className={`mvariant${v.title === datos.title ? ' active' : ''}`}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEligioVariante(true);
                    onElegirVariante(v);
                  }}
                >
                  {v.label}
                </button>
              ))}
            </div>
            <div id="mpPrice">
              {datos.price}
              {(datos.old || eligioVariante) && (
                <small style={{ color: '#ccc', textDecoration: 'line-through', marginLeft: '8px', fontSize: '1rem' }}>{datos.old}</small>
              )}
            </div>
            <div className="mpmeta" id="mpMeta">
              <div className="mpm"><div className="mpmv">{datos.cal} kcal</div><div className="mpml">Calorías</div></div>
              <div className="mpm"><div className="mpmv">{datos.time} min</div><div className="mpml">Preparación</div></div>
              <div className="mpm"><div className="mpmv">{rating}/5</div><div className="mpml">Valoración</div></div>
            </div>
            <div className="mpqty">
              <button className="mpqbtn" id="mpMinus" onClick={() => setCantidad((c) => (c > 1 ? c - 1 : c))}>-</button>
              <span className="mpqnum" id="mpQnum">{cantidad}</span>
              <button className="mpqbtn" id="mpPlus" onClick={() => setCantidad((c) => c + 1)}>+</button>
              <span className="text-sm-alt2 text-gray-muted ms-9">porcion</span>
            </div>
            <div className="mptags" id="mpTags">
              {(datos.tags || '').split(',').filter(Boolean).map((t, i) => <span key={i} className="mptag">{t.trim()}</span>)}
            </div>
            <button
              className="mpaddcart"
              id="mpAddCart"
              style={agregado ? { background: 'linear-gradient(135deg,var(--green),#1a4a35)' } : undefined}
              onClick={agregar}
            >
              {agregado
                ? <><i className="fas fa-check"></i> Añadido al carrito</>
                : <><i className="fas fa-shopping-cart"></i> Añadir al carrito</>}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
