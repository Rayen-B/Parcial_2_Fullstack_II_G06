import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSeo } from '../hooks/useSeo';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import CampoTexto from '../components/molecules/CampoTexto';
import EncabezadoSeccion from '../components/molecules/EncabezadoSeccion';
import { validarCheckout } from '../utils/validaciones';
import { formatearVencimiento, simularPago } from '../utils/pago';
import { formatearPrecio } from '../utils/formato';
import { regionesYComunas } from '../utils/regiones';
import { crearOrden, descontarStock } from '../services/db';
import { useTienda } from '../context/TiendaContext';
import { factorDeItem } from '../utils/stock';

const textoEntrega = (d) => (d.metodoEntrega === 'despacho' ? `Despacho: ${d.direccion.trim()}, ${d.comuna}, ${d.region}` : 'Retiro en tienda');

// Vista /checkout (paso de pago): datos del cliente, entrega y pago.
// Si hay sesión iniciada, los datos se completan automáticamente.
export default function Checkout() {
  useSeo({ titulo: 'Finalizar compra', descripcion: 'Completa tus datos para pagar tu pedido en Papita Dulce.', noindex: true });
  const { carrito, totalPrecio, vaciarCarrito } = useCart();
  const { usuario } = useAuth();
  const { recargarCatalogo } = useTienda();
  const navigate = useNavigate();

  const [datos, setDatos] = useState(() => ({
    nombre: usuario ? [usuario.nombre, usuario.apellidos].filter(Boolean).join(' ') : '',
    run: usuario?.run || '',
    correo: usuario?.correo || '',
    telefono: '',
    metodoEntrega: 'retiro',
    region: usuario?.region || 'Región Metropolitana de Santiago',
    comuna: usuario?.comuna || 'Santiago',
    direccion: usuario?.direccion || '',
    metodoPago: 'tarjeta',
    numTarjeta: '',
    vencimiento: '',
    cvv: ''
  }));
  const [errores, setErrores] = useState({});
  const [aviso, setAviso] = useState('');

  const comunas = regionesYComunas.find((r) => r.region === datos.region)?.comunas || [];

  const cambiar = (e) => {
    const { name, value } = e.target;
    const valorFormateado = name === 'vencimiento'
      ? formatearVencimiento(value, e.nativeEvent?.inputType?.startsWith('delete'))
      : value;
    setDatos((d) => {
      const nuevos = { ...d, [name]: valorFormateado };
      if (name === 'region') nuevos.comuna = (regionesYComunas.find((r) => r.region === value)?.comunas || [])[0] || '';
      return nuevos;
    });
    if (errores[name]) setErrores((errs) => ({ ...errs, [name]: undefined }));
  };

  const alSalir = (e) => {
    const { name } = e.target;
    setErrores((errs) => ({ ...errs, [name]: validarCheckout(datos)[name] }));
  };

  if (carrito.length === 0) {
    return (
      <section className="container text-center">
        <h1 className="stitle">Tu carrito está vacío</h1>
        <p className="sdesc">Agrega productos para continuar con el pago.</p>
        <Link to="/productos" className="btn-red"><i className="fas fa-utensils"></i>Ver productos</Link>
      </section>
    );
  }

  const pagar = (e) => {
    e.preventDefault();
    if (!usuario) {
      navigate('/login', { state: { from: { pathname: '/checkout' } }, replace: true });
      return;
    }
    const nuevos = validarCheckout(datos);
    setErrores(nuevos);
    if (Object.keys(nuevos).length > 0) {
      setAviso('Corrige los campos marcados en rojo para continuar.');
      return;
    }
    setAviso('');
    const resultadoSolicitado = e.nativeEvent?.submitter?.value;
    const pago = resultadoSolicitado === 'rechazado'
      ? { aprobado: false, motivo: 'El banco rechazó el pago. Revisa los datos o prueba con otro medio de pago.' }
      : resultadoSolicitado === 'aprobado'
        ? { aprobado: true, motivo: '' }
        : simularPago({ metodoPago: datos.metodoPago, numTarjeta: datos.numTarjeta });
    const items = carrito.map((i) => ({ codigo: i.codigo || i.id, nombre: i.nombre, precio: i.precio, cantidad: i.cantidad, variante: i.variante, factor: factorDeItem(i) }));
    // Con el pago aprobado se descuenta el stock (vitrina primero, luego insumos); si ya no alcanza, no se crea la orden
    if (pago.aprobado) {
      const stock = descontarStock(items);
      recargarCatalogo();
      if (!stock.exito) {
        setAviso(stock.mensaje + ' Vuelve al carrito para ajustar tu pedido.');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    }
    const { orden } = crearOrden({
      cliente: datos.nombre.trim(), correo: datos.correo.trim(), telefono: datos.telefono.trim(), run: datos.run.trim(),
      entrega: textoEntrega(datos), tipoEntrega: datos.metodoEntrega, metodoPago: datos.metodoPago, items,
      estado: pago.aprobado ? 'Pendiente' : 'Pago rechazado'
    });
    if (pago.aprobado) {
      vaciarCarrito();
      navigate(`/compra/exitosa/${orden.id}`);
    } else {
      navigate(`/compra/error/${orden.id}`, { state: { motivo: pago.motivo } });
    }
  };

  return (
    <section>
      <div className="container">
        <Link to="/productos" className="checkout-back">
          <i className="fas fa-arrow-left" aria-hidden="true"></i>
          <span>Volver a la tienda</span>
        </Link>
        <EncabezadoSeccion etiqueta="Proceso de pago" titulo={<>Finalizar <span>compra</span></>} />
        {aviso && <div className="alert alert-danger" role="alert">{aviso}</div>}
        <form noValidate onSubmit={pagar} aria-label="Formulario de pago">
          <div className="row gy-4">
            <div className="col-lg-7">
              <fieldset className="checkout-section p-4 bg-white rounded-4 mb-4">
                <legend className="h5 fw-bold">1. Datos de contacto</legend>
                <div className="row">
                  <div className="col-md-6"><CampoTexto id="coNombre" name="nombre" label="Nombre completo" requerido autoComplete="name" value={datos.nombre} onChange={cambiar} onBlur={alSalir} error={errores.nombre} /></div>
                  <div className="col-md-6"><CampoTexto id="coRun" name="run" label="RUN (sin puntos ni guión)" requerido placeholder="123456785" value={datos.run} onChange={cambiar} onBlur={alSalir} error={errores.run} /></div>
                  <div className="col-md-6"><CampoTexto id="coCorreo" name="correo" type="email" label="Correo electrónico" requerido autoComplete="email" value={datos.correo} onChange={cambiar} onBlur={alSalir} error={errores.correo} /></div>
                  <div className="col-md-6"><CampoTexto id="coTelefono" name="telefono" type="tel" label="Teléfono" requerido placeholder="+56 9 1234 5678" autoComplete="tel" value={datos.telefono} onChange={cambiar} onBlur={alSalir} error={errores.telefono} /></div>
                </div>
              </fieldset>

              <fieldset className="checkout-section p-4 bg-white rounded-4 mb-4">
                <legend className="h5 fw-bold">2. Entrega</legend>
                <div className="d-flex gap-4 mb-3">
                  <label><input type="radio" name="metodoEntrega" value="retiro" checked={datos.metodoEntrega === 'retiro'} onChange={cambiar} /> Retiro en tienda (gratis)</label>
                  <label><input type="radio" name="metodoEntrega" value="despacho" checked={datos.metodoEntrega === 'despacho'} onChange={cambiar} /> Despacho a domicilio</label>
                </div>
                {datos.metodoEntrega === 'despacho' && (
                  <div className="row">
                    <div className="col-md-6">
                      <CampoTexto as="select" id="coRegion" name="region" label="Región" requerido value={datos.region} onChange={cambiar} error={errores.region}>
                        {regionesYComunas.map((r) => <option key={r.region} value={r.region}>{r.region}</option>)}
                      </CampoTexto>
                    </div>
                    <div className="col-md-6">
                      <CampoTexto as="select" id="coComuna" name="comuna" label="Comuna" requerido value={datos.comuna} onChange={cambiar} error={errores.comuna}>
                        {comunas.map((c) => <option key={c} value={c}>{c}</option>)}
                      </CampoTexto>
                    </div>
                    <div className="col-12"><CampoTexto id="coDireccion" name="direccion" label="Dirección de entrega" requerido placeholder="Calle, número, depto / casa" value={datos.direccion} onChange={cambiar} onBlur={alSalir} error={errores.direccion} /></div>
                  </div>
                )}
              </fieldset>

              <fieldset className="checkout-section p-4 bg-white rounded-4">
                <legend className="h5 fw-bold">3. Método de pago</legend>
                <div className="payment-method-cards" role="radiogroup" aria-label="Forma de pago">
                  <label className={`payment-method-card${datos.metodoPago === 'tarjeta' ? ' active' : ''}`}>
                    <input type="radio" name="metodoPago" value="tarjeta" checked={datos.metodoPago === 'tarjeta'} onChange={cambiar} />
                    <i className="fas fa-credit-card" aria-hidden="true"></i>
                    <div><strong>Tarjeta de crédito o débito</strong><span>Visa, Mastercard, Redcompra.</span></div>
                    <i className="fas fa-check-circle payment-method-check" aria-hidden="true"></i>
                  </label>
                  <label className={`payment-method-card${datos.metodoPago === 'transferencia' ? ' active' : ''}`}>
                    <input type="radio" name="metodoPago" value="transferencia" checked={datos.metodoPago === 'transferencia'} onChange={cambiar} />
                    <i className="fas fa-university" aria-hidden="true"></i>
                    <div><strong>Transferencia bancaria</strong><span>Paga desde tu banco.</span></div>
                    <i className="fas fa-check-circle payment-method-check" aria-hidden="true"></i>
                  </label>
                  <label className={`payment-method-card${datos.metodoPago === 'efectivo' ? ' active' : ''}`}>
                    <input type="radio" name="metodoPago" value="efectivo" checked={datos.metodoPago === 'efectivo'} onChange={cambiar} />
                    <i className="fas fa-money-bill-wave" aria-hidden="true"></i>
                    <div><strong>Efectivo contra entrega</strong><span>El total se paga al recibir o retirar el pedido.</span></div>
                    <i className="fas fa-check-circle payment-method-check" aria-hidden="true"></i>
                  </label>
                </div>
                {datos.metodoPago === 'tarjeta' && (
                  <div className="row">
                    <div className="col-12"><CampoTexto id="coTarjeta" name="numTarjeta" label="Número de tarjeta" requerido inputMode="numeric" autoComplete="cc-number" placeholder="4532 0151 1283 0366" value={datos.numTarjeta} onChange={cambiar} onBlur={alSalir} error={errores.numTarjeta} /></div>
                    <div className="col-md-6"><CampoTexto id="coVence" name="vencimiento" label="Vencimiento (MM/AA)" requerido placeholder="MM/AA" inputMode="numeric" maxLength={5} autoComplete="cc-exp" value={datos.vencimiento} onChange={cambiar} onBlur={alSalir} error={errores.vencimiento} /></div>
                    <div className="col-md-6"><CampoTexto id="coCvv" name="cvv" type="password" label="CVV" requerido placeholder="123" autoComplete="cc-csc" value={datos.cvv} onChange={cambiar} onBlur={alSalir} error={errores.cvv} /></div>
                  </div>
                )}
                {datos.metodoPago === 'transferencia' && (
                  <div className="payment-info" role="status">
                    <strong><i className="fas fa-info-circle me-2" aria-hidden="true"></i>Datos para transferencia</strong>
                    <ul className="list-unstyled mb-0 mt-2">
                      <li><span className="text-muted">Banco:</span> Banco Papita Dulce</li>
                      <li><span className="text-muted">Cuenta corriente:</span> 00-123-4567-89</li>
                      <li><span className="text-muted">RUT:</span> 76.543.210-3</li>
                      <li><span className="text-muted">Comprobante a:</span> pagos@papitadulce.cl</li>
                    </ul>
                  </div>
                )}
                {datos.metodoPago === 'efectivo' && (
                  <div className="payment-info" role="status">
                    <strong><i className="fas fa-hand-holding-usd me-2" aria-hidden="true"></i>Pago en efectivo</strong>
                    <p className="mb-0">El monto indicado en el resumen se paga al recibir o retirar el pedido. Te recomendamos tener el monto exacto.</p>
                  </div>
                )}
              </fieldset>
            </div>

            <div className="col-lg-5">
              <aside className="checkout-summary p-4 rounded-4 sticky-top" aria-label="Resumen del pedido">
                <h2 className="h5 fw-bold">Resumen de tu pedido</h2>
                <ul className="list-unstyled">
                  {carrito.map((item) => (
                    <li key={`${item.id}-${item.variante}`} className="d-flex justify-content-between border-bottom py-2">
                      <span>{item.nombre} × {item.cantidad}{item.variante === 'trozo' && <small className="text-muted"> (trozo)</small>}</span>
                      <strong>{formatearPrecio(item.precio * item.cantidad)}</strong>
                    </li>
                  ))}
                </ul>
                <div className="d-flex justify-content-between fs-5 fw-bold my-3"><span>Total a pagar</span><span data-testid="total-checkout">{formatearPrecio(totalPrecio)}</span></div>
                <div className="checkout-pay-actions">
                  <button type="submit" name="resultadoPago" value="aprobado" className="btn-red w-100 justify-content-center">
                    <i className="fas fa-lock" aria-hidden="true"></i>
                    {datos.metodoPago === 'tarjeta' ? `Pagar ${formatearPrecio(totalPrecio)}` : datos.metodoPago === 'transferencia' ? 'Confirmar transferencia' : 'Confirmar pedido en efectivo'}
                  </button>
                  <button id="simular-error-pago" type="submit" name="resultadoPago" value="rechazado" className="btn checkout-decline w-100">
                    <i className="fas fa-exclamation-circle me-2" aria-hidden="true"></i>Simular error de pago
                  </button>
                </div>
              </aside>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}
