import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useOverlay } from '../../hooks/useOverlay';
import { REGIONES_CHILE } from '../../data/regionesChile';

// Reglas de contraseña del registro
export function evaluarReglasPassword(password) {
  return {
    length: password.length >= 8,
    uppercase: /[A-ZÁÉÍÓÚÑ]/.test(password),
    number: /\d/.test(password),
    special: /[^A-Za-zÁÉÍÓÚÑáéíóúñ0-9]/.test(password)
  };
}

const REGLAS = [
  { id: 'length', texto: '8 caracteres como mínimo' },
  { id: 'uppercase', texto: 'Una letra mayúscula' },
  { id: 'number', texto: 'Un número' },
  { id: 'special', texto: 'Un carácter especial' }
];

const REGISTRO_VACIO = { nombre: '', correo: '', password: '', confirmar: '', region: '', comuna: '' };

// Panel "Mi cuenta"
export default function ModalAutenticacion() {
  const { usuario, iniciarSesion, cerrarSesion, registrarUsuario, solicitarRecuperacion, mostrarModalAuth, setMostrarModalAuth } = useAuth();
  const navigate = useNavigate();

  const [vista, setVista] = useState('login'); // 'login' | 'register' | 'recovery'
  const [mensaje, setMensaje] = useState({ texto: '', esError: false });
  const [login, setLogin] = useState({ correo: '', password: '' });
  const [registro, setRegistro] = useState(REGISTRO_VACIO);
  const [correoRecuperacion, setCorreoRecuperacion] = useState('');
  const timers = useRef([]);

  const cerrar = useCallback(() => setMostrarModalAuth(false), [setMostrarModalAuth]);
  useOverlay(mostrarModalAuth, cerrar);

  const esperar = (fn, ms) => timers.current.push(setTimeout(fn, ms));
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const mostrarVista = (v) => {
    setVista(v);
    setMensaje({ texto: '', esError: false });
  };

  // Al abrir el panel siempre parte en "Iniciar sesión"
  useEffect(() => {
    if (mostrarModalAuth) mostrarVista('login');
  }, [mostrarModalAuth]);

  const reglas = evaluarReglasPassword(registro.password);
  const esPersonal = usuario && (usuario.rol === 'Administrador' || usuario.rol === 'Vendedor');

  const enviarLogin = (e) => {
    e.preventDefault();
    const resultado = iniciarSesion(login.correo, login.password);
    if (!resultado.exito) {
      setMensaje({ texto: resultado.mensaje, esError: true });
      return;
    }
    setMensaje({ texto: '¡Bienvenido/a, ' + resultado.usuario.nombre + '!', esError: false });
    setLogin({ correo: '', password: '' });
    esperar(() => {
      cerrar();
      const rol = resultado.usuario.rol;
      if (rol === 'Administrador' || rol === 'Vendedor') navigate('/admin');
    }, 700);
  };

  const enviarRegistro = (e) => {
    e.preventDefault();
    if (!e.currentTarget.checkValidity()) {
      setMensaje({ texto: 'Completa los campos con datos válidos.', esError: true });
      return;
    }
    if (registro.password !== registro.confirmar) {
      setMensaje({ texto: 'Las contraseñas no coinciden.', esError: true });
      return;
    }
    if (!Object.values(reglas).every(Boolean)) {
      setMensaje({ texto: 'La contraseña no cumple todos los requisitos.', esError: true });
      return;
    }
    const resultado = registrarUsuario({
      nombre: registro.nombre.trim(),
      correo: registro.correo.trim(),
      password: registro.password,
      region: registro.region,
      comuna: registro.comuna
    });
    setMensaje({ texto: resultado.mensaje, esError: !resultado.exito });
    if (resultado.exito) {
      setRegistro(REGISTRO_VACIO);
      esperar(() => mostrarVista('login'), 900);
    }
  };

  const enviarRecuperacion = (e) => {
    e.preventDefault();
    const resultado = solicitarRecuperacion(correoRecuperacion);
    setMensaje({ texto: resultado.mensaje, esError: !resultado.exito });
  };

  const salir = () => {
    cerrarSesion();
    setMensaje({ texto: 'Sesión cerrada.', esError: false });
  };

  const cambiarRegistro = (campo) => (e) => {
    const valor = e.target.value;
    setRegistro((prev) => (campo === 'region' ? { ...prev, region: valor, comuna: '' } : { ...prev, [campo]: valor }));
  };

  return (
    <div
      id="accountPanel"
      className={mostrarModalAuth ? 'open' : ''}
      aria-hidden={!mostrarModalAuth}
      onClick={(e) => { if (e.target === e.currentTarget) cerrar(); }}
    >
      <div className="accountbox" role="dialog" aria-modal="true" aria-labelledby="accountTitle">
        <button className="accountclose" id="accountClose" type="button" aria-label="Cerrar mi cuenta" onClick={cerrar}>
          <i className="fas fa-times"></i>
        </button>
        <div className="account-brand"><i className="fas fa-user-circle"></i><span>Papita Dulce</span></div>
        <h2 id="accountTitle">Bienvenido/a</h2>
        <p className="accountintro">Administra tu cuenta para guardar tus datos y revisar tus pedidos.</p>

        <div className="account-session" id="accountSession" style={{ display: usuario ? 'block' : 'none' }}>
          <p><i className="fas fa-user-check"></i> Sesión iniciada como <strong id="accountSessionEmail">{usuario ? usuario.correo : ''}</strong></p>
          {esPersonal && (
            <button className="account-link" type="button" onClick={() => { cerrar(); navigate('/admin'); }}>
              <i className="fas fa-user-shield"></i> Ir al panel de administración
            </button>
          )}
          <button className="account-link" id="accountLogout" type="button" onClick={salir}>
            <i className="fas fa-sign-out-alt"></i> Cerrar sesión
          </button>
        </div>

        <div className="account-tabs" id="accountTabs" role="tablist" style={{ display: usuario ? 'none' : 'flex' }}>
          <button className={`account-tab${vista === 'login' ? ' active' : ''}`} type="button" onClick={() => mostrarVista('login')}>Iniciar sesión</button>
          <button className={`account-tab${vista === 'register' ? ' active' : ''}`} type="button" onClick={() => mostrarVista('register')}>Registrarse</button>
        </div>

        <form className={`account-view${!usuario && vista === 'login' ? ' active' : ''}`} id="loginView" noValidate onSubmit={enviarLogin}>
          <label htmlFor="loginEmail">Correo electrónico</label>
          <input id="loginEmail" type="email" placeholder="tu@email.com" required value={login.correo} onChange={(e) => setLogin({ ...login, correo: e.target.value })} />
          <label htmlFor="loginPassword">Contraseña</label>
          <input id="loginPassword" type="password" placeholder="Tu contraseña" required value={login.password} onChange={(e) => setLogin({ ...login, password: e.target.value })} />
          <button className="account-submit" type="submit"><i className="fas fa-sign-in-alt"></i>Iniciar sesión</button>
          <button className="account-link" id="forgotPassword" type="button" onClick={() => mostrarVista('recovery')}>¿Olvidaste tu contraseña?</button>
        </form>

        <form className={`account-view${!usuario && vista === 'register' ? ' active' : ''}`} id="registerView" noValidate onSubmit={enviarRegistro}>
          <label htmlFor="registerName">Nombre completo</label>
          <input id="registerName" type="text" placeholder="Tu nombre" required value={registro.nombre} onChange={cambiarRegistro('nombre')} />
          <label htmlFor="registerEmail">Correo electrónico</label>
          <input id="registerEmail" type="email" placeholder="tu@email.com" required value={registro.correo} onChange={cambiarRegistro('correo')} />
          <label htmlFor="registerPassword">Contraseña</label>
          <input id="registerPassword" type="password" placeholder="Crea una contraseña segura" required value={registro.password} onChange={cambiarRegistro('password')} />
          <ul className="password-rules" id="passwordRules">
            {REGLAS.map((r) => (
              <li key={r.id} data-rule={r.id} className={reglas[r.id] ? 'valid' : undefined}><i className="fas fa-circle"></i>{r.texto}</li>
            ))}
          </ul>
          <label htmlFor="registerConfirm">Confirmar contraseña</label>
          <input id="registerConfirm" type="password" placeholder="Repite tu contraseña" required value={registro.confirmar} onChange={cambiarRegistro('confirmar')} />
          <div className="account-fields-row">
            <div>
              <label htmlFor="registerRegion">Región</label>
              <select id="registerRegion" required value={registro.region} onChange={cambiarRegistro('region')}>
                <option value="">Selecciona tu región</option>
                {Object.keys(REGIONES_CHILE).map((region) => <option key={region} value={region}>{region}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="registerCommune">Comuna</label>
              <select id="registerCommune" required disabled={!registro.region} value={registro.comuna} onChange={cambiarRegistro('comuna')}>
                <option value="">{registro.region ? 'Selecciona tu comuna' : 'Primero elige una región'}</option>
                {(REGIONES_CHILE[registro.region] || []).map((comuna) => <option key={comuna} value={comuna}>{comuna}</option>)}
              </select>
            </div>
          </div>
          <button className="account-submit" type="submit"><i className="fas fa-user-plus"></i>Crear cuenta</button>
        </form>

        <form className={`account-view${!usuario && vista === 'recovery' ? ' active' : ''}`} id="recoveryView" noValidate onSubmit={enviarRecuperacion}>
          <button className="account-link account-back" id="backToLogin" type="button" onClick={() => mostrarVista('login')}>
            <i className="fas fa-arrow-left"></i> Volver a iniciar sesión
          </button>
          <h4>Recuperar contraseña</h4>
          <p className="accounthelp">Te enviaremos instrucciones para recuperar el acceso.</p>
          <label htmlFor="recoveryEmail">Correo electrónico</label>
          <input id="recoveryEmail" type="email" placeholder="tu@email.com" required value={correoRecuperacion} onChange={(e) => setCorreoRecuperacion(e.target.value)} />
          <button className="account-submit" type="submit"><i className="fas fa-envelope"></i>Enviar instrucciones</button>
        </form>

        <p className="accountmessage" id="accountMessage" role="status" style={mensaje.texto ? { color: mensaje.esError ? 'var(--primary)' : 'var(--green)' } : undefined}>
          {mensaje.texto}
        </p>
      </div>
    </div>
  );
}
