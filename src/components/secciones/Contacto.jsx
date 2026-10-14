import React, { useRef } from 'react';
import ErrorCampo from '../atoms/ErrorCampo';
import { useFormulario } from '../../hooks/useFormulario';
import { validarTexto, validarEmail, validarTelefono } from '../../utils/validaciones';

const ASUNTOS = ['Consulta general', 'Catering & Eventos', 'Comentario', 'Asociación', 'Medios & Prensa'];

export function validarContacto(v) {
  const errores = {};
  const nombre = validarTexto(v.nombre, 'El nombre', 3);
  if (!nombre.valido) errores.nombre = nombre.mensaje;
  const correo = validarEmail(v.correo);
  if (!correo.valido) errores.correo = correo.mensaje;
  // El teléfono es opcional: solo se valida si se escribió algo
  if (v.telefono.trim()) {
    const telefono = validarTelefono(v.telefono);
    if (!telefono.valido) errores.telefono = telefono.mensaje;
  }
  const mensaje = validarTexto(v.mensaje, 'El mensaje', 10);
  if (!mensaje.valido) errores.mensaje = mensaje.mensaje;
  return errores;
}

export default function Contacto() {
  const exitoRef = useRef(null);
  const { valores, errores, enviando, enviado, cambiar, enviar } = useFormulario(
    { nombre: '', correo: '', telefono: '', asunto: ASUNTOS[0], mensaje: '' },
    validarContacto
  );

  const claseCampo = (campo) => `fctrl${errores[campo] ? ' is-invalid' : ''}`;

  return (
    <section id="contact-section">
      <div className="container">
        <div className="text-center mb-5" data-aos="fade-up">
          <span className="slbl">Ponte en contacto</span>
          <h2 className="stitle">Contactos</h2>
          <div className="sline"></div>
          <p className="sdesc mx-auto max-w-480">¿Tienes una pregunta, comentarios o quieres planificar un evento especial? Nos encantaría saber de ti.</p>
        </div>

        <div className="row g-4">
          <div className="col-lg-4" data-aos="fade-right">
            <div className="ctdark">
              <h4>¡Hablemos!</h4>
              <p className="ctsub">Por lo general, respondemos en un plazo de 2 horas durante el horario laboral.</p>
              <div className="ctitem">
                <div className="cticon"><i className="fas fa-map-marker-alt"></i></div>
                <div className="ctinfo"><strong>Dirección</strong><span>Av. Papita Dulce,<br />Santiago, Chile</span></div>
              </div>
              <div className="ctitem">
                <div className="cticon"><i className="fas fa-phone-alt"></i></div>
                <div className="ctinfo"><strong>Teléfono</strong><span>+56 9 1234 5678</span></div>
              </div>
              <div className="ctitem">
                <div className="cticon"><i className="fas fa-envelope"></i></div>
                <div className="ctinfo"><strong>Correo electrónico</strong><span>papitadulce@gmail.com</span></div>
              </div>
              <div className="ctitem">
                <div className="cticon"><i className="fas fa-clock"></i></div>
                <div className="ctinfo"><strong>Horario laboral</strong><span>Mar - Sab: 9 AM - 11 PM</span></div>
              </div>
              <div className="ctsocrow">
                <a href="#"><i className="fab fa-facebook-f"></i></a>
                <a href="#"><i className="fab fa-instagram"></i></a>
                <a href="#"><i className="fab fa-twitter"></i></a>
                <a href="#"><i className="fab fa-youtube"></i></a>
              </div>
            </div>
          </div>
          <div className="col-lg-8" data-aos="fade-left">
            <div className="fcard">
              <div className="row g-3">
                <div className="col-sm-6">
                  <label className="flbl">Nombre *</label>
                  <input type="text" name="nombre" className={claseCampo('nombre')} placeholder="Papita Dulce" value={valores.nombre} onChange={cambiar} />
                  <ErrorCampo mensaje={errores.nombre} />
                </div>
                <div className="col-sm-6">
                  <label className="flbl">Correo electrónico *</label>
                  <input type="email" name="correo" className={claseCampo('correo')} placeholder="papitadulce@gmail.com" value={valores.correo} onChange={cambiar} />
                  <ErrorCampo mensaje={errores.correo} />
                </div>
                <div className="col-sm-6">
                  <label className="flbl">Numero telefónico</label>
                  <input type="tel" name="telefono" className={claseCampo('telefono')} placeholder="+56 9 1234 5678" value={valores.telefono} onChange={cambiar} />
                  <ErrorCampo mensaje={errores.telefono} />
                </div>
                <div className="col-sm-6">
                  <label className="flbl">Asunto *</label>
                  <select name="asunto" className="fctrl" value={valores.asunto} onChange={cambiar}>
                    {ASUNTOS.map((op) => <option key={op}>{op}</option>)}
                  </select>
                </div>
                <div className="col-12">
                  <label className="flbl">Mensaje *</label>
                  <textarea name="mensaje" className={claseCampo('mensaje')} rows="5" placeholder="Escribe tu mensaje aquí..." value={valores.mensaje} onChange={cambiar}></textarea>
                  <ErrorCampo mensaje={errores.mensaje} />
                </div>
                <div className="col-12">
                  <button
                    className="btn-red"
                    id="ctcBtn"
                    disabled={enviando}
                    onClick={() => enviar(() => exitoRef.current && exitoRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' }))}
                  >
                    {enviando
                      ? <><i className="fas fa-spinner fa-spin"></i> Enviando...</>
                      : <><i className="fas fa-paper-plane"></i>Enviar Mensaje</>}
                  </button>
                </div>
              </div>
              <div className="sucmsg" id="ctcOk" ref={exitoRef} style={enviado ? { display: 'block' } : undefined}>
                <i className="fas fa-check-circle"></i>
                <p>¡Mensaje enviado! Responderemos en un plazo de 2 horas.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
