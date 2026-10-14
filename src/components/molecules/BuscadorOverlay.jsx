import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTienda } from '../../context/TiendaContext';
import { useOverlay } from '../../hooks/useOverlay';
import images from '../../assets/images';

const CATEGORIAS = [
  { cat: 'all', img: images['imgc1'], alt: 'Todas las preparaciones', texto: 'Todo' },
  { cat: 'tortas', img: images['menu/Torta_Panqueque_Naranja'], alt: 'Tortas caseras', texto: 'Tortas' },
  { cat: 'bebestibles', img: images['menu/Bebestibles'], alt: 'Infusiones y bebestibles', texto: 'Infusiones & bebestibles' },
  { cat: 'sandwiches', img: images['menu/Sandwich1'], alt: 'Sándwiches', texto: 'Sándwiches' },
  { cat: 'tartaletas', img: images['menu/tartaleta1'], alt: 'Tartaletas', texto: 'Tartaletas' },
  { cat: 'postres', img: images['menu/postre1'], alt: 'Postres', texto: 'Postres' }
];

const TENDENCIAS = [
  'Torta panqueque naranja',
  'Torta de selva negra',
  'limonada jengibre menta',
  'Jugo de mango',
  'Galletas de chocolate',
  'Empolvados'
];

// Lleva la vista a la sección del menú (si no estamos en el inicio, navega primero).
function useIrAlMenu() {
  const navigate = useNavigate();
  const location = useLocation();
  return () => {
    const menu = document.getElementById('menu');
    if (location.pathname === '/' && menu) {
      menu.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      navigate('/#menu');
    }
  };
}

export default function BuscadorOverlay() {
  const { buscadorAbierto, setBuscadorAbierto, filtrarMenu, buscarMenu } = useTienda();
  const [texto, setTexto] = useState('');
  const [catActiva, setCatActiva] = useState('all');
  const inputRef = useRef(null);
  const irAlMenu = useIrAlMenu();

  const cerrar = useCallback(() => setBuscadorAbierto(false), [setBuscadorAbierto]);
  useOverlay(buscadorAbierto, cerrar);

  // Al abrir, el foco va al campo de búsqueda
  useEffect(() => {
    if (!buscadorAbierto) return undefined;
    const t = setTimeout(() => inputRef.current && inputRef.current.focus(), 220);
    return () => clearTimeout(t);
  }, [buscadorAbierto]);

  const elegirCategoria = (cat) => {
    setCatActiva(cat);
    cerrar();
    setTimeout(() => {
      filtrarMenu(cat);
      irAlMenu();
    }, 300);
  };

  const buscar = () => {
    buscarMenu(texto);
    cerrar();
    irAlMenu();
  };

  return (
    <div id="searchOv" className={buscadorAbierto ? 'open' : ''} onClick={(e) => { if (e.target === e.currentTarget) cerrar(); }}>
      <button className="sovclose" id="searchClose" type="button" onClick={cerrar}>
        <i className="fas fa-times"></i>
      </button>
      <div className="sovbox">
        <h4>¿Qué se te antoja hoy?</h4>
        <div className="sovinput">
          <input
            ref={inputRef}
            type="text"
            id="searchInput"
            placeholder="Busca tortas, jugos, postres..."
            autoComplete="off"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') buscar(); }}
          />
          <button id="searchSubmit" type="button" aria-label="Buscar" onClick={buscar}>
            <i className="fas fa-search"></i>
          </button>
        </div>
        <div className="sovcats">
          {CATEGORIAS.map((c) => (
            <div key={c.cat} className={`sovcat${catActiva === c.cat ? ' active' : ''}`} data-cat={c.cat} onClick={() => elegirCategoria(c.cat)}>
              <img src={c.img} alt={c.alt} />{c.texto}
            </div>
          ))}
        </div>
        <div className="sovtrend">
          <p><i className="fas fa-fire me-1 text-secondary"></i>Búsquedas en tendencia</p>
          
          {TENDENCIAS.map((t) => (
            <React.Fragment key={t}>
              {' '}
              <span
                className="ttag"
                onClick={() => {
                  setTexto(t);
                  inputRef.current && inputRef.current.focus();
                }}
              >
                {t}
              </span>
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
