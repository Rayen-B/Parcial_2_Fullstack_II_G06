import React, { useCallback, useEffect, useState } from 'react';
import TarjetaProducto from '../molecules/TarjetaProducto';
import PopupProducto from '../organisms/PopupProducto';
import { useTienda } from '../../context/TiendaContext';
import { MENU_TIENDA } from '../../data/menu';

const FILTROS = [
  { f: 'all', texto: 'Todo' },
  { f: 'tortas', texto: 'Tortas' },
  { f: 'bebestibles', texto: 'Infusiones & Bebestibles' },
  { f: 'sandwiches', texto: 'Sándwiches' },
  { f: 'tartaletas', texto: 'Tartaletas' },
  { f: 'postres', texto: 'Postres' }
];

// ¿La tarjeta debe verse con el filtro/búsqueda actual?
export function productoVisible(producto, datos, filtro, busqueda) {
  if (busqueda !== null) {
    const texto = [datos.title, datos.cat, datos.desc, datos.tags].join(' ').toLowerCase();
    return !busqueda || texto.includes(busqueda);
  }
  return filtro === 'all' || producto.wrapCat === filtro;
}

export default function MenuSeccion({ productos = MENU_TIENDA }) {
  const { filtro, busqueda, versionFiltro, filtrarMenu, agregarProducto } = useTienda();

  // Datos actuales de cada tarjeta (cambian si se elige la variante "Trozo" en el popup)
  const [datosTarjetas, setDatosTarjetas] = useState(productos);
  const [favoritos, setFavoritos] = useState(() => productos.map(() => null));
  const [popupIndice, setPopupIndice] = useState(null);
  const [popupAbierto, setPopupAbierto] = useState(false);
  const [animacion, setAnimacion] = useState('ninguna'); // 'ninguna' | 'inicio' | 'fin'

  // Al cambiar el filtro, las tarjetas visibles aparecen con un pequeño fade + desplazamiento
  useEffect(() => {
    if (versionFiltro === 0) return undefined;
    setAnimacion('inicio');
    const t = setTimeout(() => setAnimacion('fin'), 60);
    return () => clearTimeout(t);
  }, [versionFiltro]);

  const estiloAnimacion = () => {
    if (animacion === 'inicio') {
      const base = { opacity: 0, transform: 'translateY(16px)' };
      return versionFiltro > 1 ? { ...base, transition: 'opacity .38s,transform .38s' } : base;
    }
    if (animacion === 'fin') return { transition: 'opacity .38s,transform .38s', opacity: 1, transform: 'translateY(0)' };
    return undefined;
  };

  const cerrarPopup = useCallback(() => setPopupAbierto(false), []);

  const elegirVariante = (variante) => {
    setDatosTarjetas((prev) => prev.map((d, i) => (i === popupIndice ? { ...d, ...variante } : d)));
  };

  const toggleFavorito = (indice) => {
    setFavoritos((prev) => prev.map((f, i) => (i === indice ? !f : f)));
  };

  return (
    <>
      <section id="menu">
        <div className="container">
          <div className="text-center mb-5" data-aos="fade-up">
            <span className="slbl">Hecho con amor</span>
            <h2 className="stitle">El Menú de <span>Papita</span></h2>
            <div className="sline"></div>
          </div>
          <div className="text-center mb-4" data-aos="fade-up">
            {FILTROS.map((b, i) => (
              <React.Fragment key={b.f}>
                {i > 0 && ' '}
                <button className={`filtbtn${filtro === b.f ? ' active' : ''}`} data-f={b.f} onClick={() => filtrarMenu(b.f)}>{b.texto}</button>
              </React.Fragment>
            ))}
          </div>
          <div className="row g-4" id="mgrid">
            {productos.map((producto, i) => {
              const visible = productoVisible(producto, datosTarjetas[i], filtro, busqueda);
              return (
                <div
                  key={i}
                  className={`col-sm-6 col-lg-4 mwrap${visible ? '' : ' gone'}`}
                  data-c={producto.wrapCat}
                  data-aos="fade-up"
                  data-aos-delay={producto.aosDelay || undefined}
                  style={visible ? estiloAnimacion() : undefined}
                >
                  <TarjetaProducto
                    producto={producto}
                    favorito={favoritos[i]}
                    onToggleFavorito={() => toggleFavorito(i)}
                    onAbrir={() => {
                      setPopupIndice(i);
                      setPopupAbierto(true);
                    }}
                  />
                </div>
              );
            })}
          </div>
          <div className="text-center mt-5"><a href="#menu" className="btn-red" data-menu-action="show-all"><i className="fas fa-th-large"></i>Ver menú completo</a></div>
        </div>
      </section>

      <PopupProducto
        abierto={popupAbierto}
        onCerrar={cerrarPopup}
        base={popupIndice !== null ? productos[popupIndice] : null}
        datos={popupIndice !== null ? datosTarjetas[popupIndice] : null}
        onElegirVariante={elegirVariante}
        onAgregar={agregarProducto}
      />
    </>
  );
}
