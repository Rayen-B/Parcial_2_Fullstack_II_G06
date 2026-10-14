import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useTienda } from '../../context/TiendaContext';
import { useOverlay } from '../../hooks/useOverlay';
import { formatearPrecio } from '../../utils/formato';
import { pasaLuhn, tarjetaVencida } from '../../utils/pago';
import { obtenerOrdenes, guardarOrdenes } from '../../services/storage';
import images from '../../assets/images';

const METODO_HINTS = {
  tarjeta: 'Completa los datos de tu tarjeta.',
  transferencia: 'Realiza la transferencia y confírmala aquí.',
  efectivo: 'Revisa el monto a pagar en efectivo.'
};

const PASOS = [
  { n: 1, texto: 'Tus datos' },
  { n: 2, texto: 'Método de pago' },
  { n: 3, texto: 'Confirmar' }
];

const DATOS_VACIOS = { nombre: '', correo: '', telefono: '', direccion: '', tarjeta: '', vencimiento: '', cvv: '', transferencia: false };
const HINT_PASO1 = 'Datos de contacto para tu pedido.';

// Validación de los datos de contacto/entrega. Devuelve el mensaje de error o null.
export function validarDatosContacto(datos, entrega) {
  if (datos.nombre.trim().length < 3) return 'Ingresa tu nombre completo.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.correo.trim())) return 'Ingresa un correo electrónico válido.';
  if (!/^[+0-9 ]{8,15}$/.test(datos.telefono.trim())) return 'Ingresa un teléfono de contacto válido.';
  if (entrega === 'despacho' && datos.direccion.trim().length < 5) return 'Ingresa la dirección de despacho.';
  return null;
}

// Validación de los datos del método de pago elegido. Devuelve el mensaje de error o null.
export function validarDatosPago(datos, metodo) {
  if (metodo === 'tarjeta') {
    const tarjeta = datos.tarjeta.replace(/\s/g, '');
    const vencimiento = datos.vencimiento.trim();
    if (!/^\d{16}$/.test(tarjeta) || !pasaLuhn(tarjeta)) return 'El número de tarjeta no es válido.';
    if (!/^\d{2}\/\d{2}$/.test(vencimiento) || tarjetaVencida(vencimiento)) return 'La fecha de vencimiento no es válida o la tarjeta está vencida.';
    if (!/^\d{3,4}$/.test(datos.cvv.trim())) return 'El CVV no es válido.';
  } else if (metodo === 'transferencia' && !datos.transferencia) {
    return 'Confirma que realizaste la transferencia para continuar.';
  }
  return null;
}

// Notificación de pago confirmado: toast en pantalla + notificación nativa si el navegador lo permite
function notificacionNativa(correo, numero, totalTexto) {
  if (!('Notification' in window)) return;
  const lanzar = () => new Notification('Papita Dulce · Pago confirmado', {
    body: 'Pedido ' + numero + ' por ' + totalTexto + '. Confirmación enviada a ' + correo + '.',
    icon: images['logopapita']
  });
  if (Notification.permission === 'granted') lanzar();
  else if (Notification.permission !== 'denied') {
    Notification.requestPermission().then((permiso) => { if (permiso === 'granted') lanzar(); });
  }
}

export default function PanelPago() {
  const { carrito, totalPrecio, vaciarCarrito } = useCart();
  const { usuario } = useAuth();
  const { pagoAbierto, setPagoAbierto, abrirCarrito, confirmarPago } = useTienda();

  const [paso, setPaso] = useState(1);
  const [entrega, setEntrega] = useState('retiro');
  const [metodo, setMetodo] = useState('tarjeta');
  const [datos, setDatos] = useState(DATOS_VACIOS);
  const [error, setError] = useState('');
  const [hintPaso1, setHintPaso1] = useState({ texto: HINT_PASO1, esError: false });
  const [procesando, setProcesando] = useState(false);
  const [toast, setToast] = useState(null);
  const formRef = useRef(null);
  const nombreRef = useRef(null);
  const timerToast = useRef(null);
  const timerHint = useRef(null);

  const cerrar = useCallback(() => setPagoAbierto(false), [setPagoAbierto]);
  useOverlay(pagoAbierto, cerrar);

  // Cada vez que se abre: el asistente vuelve al paso 1 con "tarjeta" seleccionada
  // y, si hay sesión iniciada, se completan nombre y correo.
  useEffect(() => {
    if (!pagoAbierto) return;
    setMetodo('tarjeta');
    setError('');
    setPaso(1);
    if (nombreRef.current) nombreRef.current.focus();
  }, [pagoAbierto]);

  useEffect(() => {
    if (!pagoAbierto || !usuario) return;
    setDatos((prev) => ({
      ...prev,
      nombre: prev.nombre || [usuario.nombre, usuario.apellidos].filter(Boolean).join(' '),
      correo: prev.correo || usuario.correo || ''
    }));
  }, [pagoAbierto, usuario]);

  useEffect(() => () => {
    clearTimeout(timerToast.current);
    clearTimeout(timerHint.current);
  }, []);

  const irAPaso = (n) => {
    setPaso(n);
    if (formRef.current) formRef.current.scrollTop = 0;
    if (n === 1 && nombreRef.current) nombreRef.current.focus();
  };

  const cambiar = (campo) => (e) => {
    const valor = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setDatos((prev) => ({ ...prev, [campo]: valor }));
  };

  const siguiente = (destino) => {
    if (paso === 1) {
      const msg = validarDatosContacto(datos, entrega);
      if (msg) {
        setHintPaso1({ texto: msg, esError: true });
        clearTimeout(timerHint.current);
        timerHint.current = setTimeout(() => setHintPaso1({ texto: HINT_PASO1, esError: false }), 2600);
        return;
      }
    }
    irAPaso(destino);
  };

  const elegirMetodo = (m) => {
    setMetodo(m);
    setError('');
    irAPaso(3);
  };

  const volverAlCarrito = () => {
    cerrar();
    abrirCarrito();
  };

  const enviar = (e) => {
    e.preventDefault();
    setError('');
    const msg = validarDatosContacto(datos, entrega) || validarDatosPago(datos, metodo);
    if (msg) {
      setError(msg);
      return;
    }

    const items = carrito.map((item) => ({ title: item.nombre, price: item.precio, quantity: item.cantidad }));
    const total = totalPrecio;
    const numero = 'PD-' + Date.now().toString().slice(-6);
    const totalTexto = formatearPrecio(total);
    const nombre = datos.nombre.trim();
    const correo = datos.correo.trim();
    setProcesando(true);

    setTimeout(() => {
      guardarOrdenes([
        ...obtenerOrdenes(),
        {
          id: numero,
          numero: '#' + numero,
          fecha: new Date().toISOString().slice(0, 10),
          cliente: nombre,
          correo,
          telefono: datos.telefono.trim(),
          entrega: entrega === 'despacho' ? datos.direccion.trim() : 'Retiro en tienda',
          metodoPago: metodo,
          estado: 'Pendiente',
          montoTotal: totalTexto,
          total,
          items: items.map((i) => `${i.quantity}x ${i.title} (${formatearPrecio(i.price * i.quantity)})`).join(', ')
        }
      ]);

      vaciarCarrito();
      cerrar();
      confirmarPago({
        numero,
        nombre,
        correo,
        totalTexto,
        lineas: items.length,
        metodoTexto: { tarjeta: 'tarjeta', transferencia: 'transferencia bancaria', efectivo: 'efectivo' }[metodo],
        entregaTexto: entrega === 'despacho' ? 'Despacho a domicilio' : 'Retiro en tienda'
      });
      setProcesando(false);
      setDatos(DATOS_VACIOS);
      setEntrega('retiro');

      setToast({ numero, totalTexto, correo });
      clearTimeout(timerToast.current);
      timerToast.current = setTimeout(() => setToast(null), 7000);
      notificacionNativa(correo, numero, totalTexto);
    }, 900);
  };

  const totalTexto = formatearPrecio(totalPrecio);

  return (
    <>
      <div id="paymentPanel" className={pagoAbierto ? 'open' : ''} aria-hidden={!pagoAbierto}>
        <form className="paymentform" id="paymentForm" noValidate ref={formRef} onSubmit={enviar}>
          <button className="paymentback" id="paymentBack" type="button" onClick={volverAlCarrito}>
            <i className="fas fa-arrow-left"></i> Volver al carrito
          </button>
          <div className="paymenthead"><span className="slbl">Pago</span><h2>Completar pago</h2></div>
          <div className="paymenttotal"><span>Total a pagar</span><strong id="paymentTotal">{totalTexto}</strong></div>

          <div className="checkout-steps" id="checkoutSteps">
            {PASOS.map((p) => (
              <div key={p.n} className={`checkout-step${p.n === paso ? ' active' : ''}${p.n < paso ? ' done' : ''}`} data-step={p.n}>
                <span className="checkout-step-num">{p.n}</span>{p.texto}
              </div>
            ))}
          </div>

          <div className="payment-order" id="paymentOrderSummary">
            <strong>Detalle de tu compra</strong>
            {carrito.map((item) => (
              <div key={`${item.id}-${item.variante}`}>
                <strong>{item.cantidad} x</strong> {item.nombre} <span>{formatearPrecio(item.precio * item.cantidad)}</span>
              </div>
            ))}
          </div>

          {/* PASO 1: contacto y entrega */}
          <div className={`checkout-panel${paso === 1 ? ' active' : ''}`} data-step-panel="1">
            <p className="paymenthint" style={hintPaso1.esError ? { color: 'var(--primary)' } : undefined}>{hintPaso1.texto}</p>
            <label htmlFor="payName">Nombre completo</label>
            <input id="payName" ref={nombreRef} type="text" autoComplete="name" placeholder="Nombre completo" required value={datos.nombre} onChange={cambiar('nombre')} />
            <label htmlFor="payEmail">Correo electrónico</label>
            <input id="payEmail" type="email" autoComplete="email" placeholder="tu@email.com" required value={datos.correo} onChange={cambiar('correo')} />
            <label htmlFor="payPhone">Teléfono de contacto</label>
            <input id="payPhone" type="tel" inputMode="tel" autoComplete="tel" placeholder="+56 9 1234 5678" required value={datos.telefono} onChange={cambiar('telefono')} />

            <p className="paymenthint" style={{ marginTop: '16px' }}>Método de entrega</p>
            <div className="delivery-tabs" role="tablist">
              <button type="button" className={`delivery-tab${entrega === 'retiro' ? ' active' : ''}`} data-delivery="retiro" onClick={() => setEntrega('retiro')}>
                <i className="fas fa-store"></i> Retiro en tienda
              </button>
              <button type="button" className={`delivery-tab${entrega === 'despacho' ? ' active' : ''}`} data-delivery="despacho" onClick={() => setEntrega('despacho')}>
                <i className="fas fa-motorcycle"></i> Despacho a domicilio
              </button>
            </div>
            <div id="deliveryAddressBox" style={{ display: entrega === 'despacho' ? 'block' : 'none' }}>
              <label htmlFor="payAddress">Dirección de despacho</label>
              <input id="payAddress" type="text" autoComplete="street-address" placeholder="Calle, número, comuna" required={entrega === 'despacho'} value={datos.direccion} onChange={cambiar('direccion')} />
            </div>

            <div className="checkout-nav">
              <span></span>
              <button type="button" className="cartcheckout step-next" onClick={() => siguiente(2)}>Continuar <i className="fas fa-arrow-right"></i></button>
            </div>
          </div>

          {/* PASO 2: método de pago */}
          <div className={`checkout-panel${paso === 2 ? ' active' : ''}`} data-step-panel="2">
            <p className="paymenthint">Elige cómo quieres pagar tu pedido.</p>
            <div className="payment-method-cards" role="tablist">
              <button type="button" className={`payment-method-card${metodo === 'tarjeta' ? ' active' : ''}`} onClick={() => elegirMetodo('tarjeta')}>
                <i className="fas fa-credit-card"></i>
                <div><strong>Tarjeta de crédito o débito</strong><span>Visa, Mastercard, Redcompra</span></div>
                <i className="fas fa-check-circle payment-method-check"></i>
              </button>
              <button type="button" className={`payment-method-card${metodo === 'transferencia' ? ' active' : ''}`} onClick={() => elegirMetodo('transferencia')}>
                <i className="fas fa-university"></i>
                <div><strong>Transferencia bancaria</strong><span>Paga desde tu banco</span></div>
                <i className="fas fa-check-circle payment-method-check"></i>
              </button>
              <button type="button" className={`payment-method-card${metodo === 'efectivo' ? ' active' : ''}`} onClick={() => elegirMetodo('efectivo')}>
                <i className="fas fa-money-bill-wave"></i>
                <div><strong>Efectivo</strong><span>Pagas al retirar o recibir</span></div>
                <i className="fas fa-check-circle payment-method-check"></i>
              </button>
            </div>
            <div className="checkout-nav">
              <button type="button" className="paymentback step-prev" onClick={() => irAPaso(1)}><i className="fas fa-arrow-left"></i> Atrás</button>
              <button type="button" className="cartcheckout step-next" onClick={() => siguiente(3)}>Continuar <i className="fas fa-arrow-right"></i></button>
            </div>
          </div>

          {/* PASO 3: datos según método de pago + confirmación */}
          <div className={`checkout-panel${paso === 3 ? ' active' : ''}`} data-step-panel="3">
            <p className="paymenthint" id="stepDetalleHint">{METODO_HINTS[metodo]}</p>

            <div className="payment-method-panel" id="panelTarjeta" style={{ display: metodo === 'tarjeta' ? 'block' : 'none' }}>
              <label htmlFor="payCard">Número de tarjeta</label>
              <input id="payCard" type="text" inputMode="numeric" autoComplete="cc-number" placeholder="4242 4242 4242 4242" maxLength={19} required={metodo === 'tarjeta'} value={datos.tarjeta} onChange={cambiar('tarjeta')} />
              <div className="paymentrow">
                <div><label htmlFor="payExpiry">Vencimiento</label><input id="payExpiry" type="text" inputMode="numeric" placeholder="MM/AA" maxLength={5} required={metodo === 'tarjeta'} value={datos.vencimiento} onChange={cambiar('vencimiento')} /></div>
                <div><label htmlFor="payCvv">CVV</label><input id="payCvv" type="password" inputMode="numeric" placeholder="123" maxLength={4} required={metodo === 'tarjeta'} value={datos.cvv} onChange={cambiar('cvv')} /></div>
              </div>
            </div>

            <div className="payment-method-panel" id="panelTransferencia" style={{ display: metodo === 'transferencia' ? 'block' : 'none' }}>
              <div className="transfer-details">
                <div><span>Banco</span><strong>Banco Papita Dulce</strong></div>
                <div><span>Tipo de cuenta</span><strong>Cuenta Corriente</strong></div>
                <div><span>Número de cuenta</span><strong>00-123-4567-89</strong></div>
                <div><span>RUT</span><strong>76.543.210-9</strong></div>
                <div><span>Correo para comprobante</span><strong>pagos@papitadulce.cl</strong></div>
              </div>
              <label className="transfer-check">
                <input type="checkbox" id="payTransferConfirm" checked={datos.transferencia} onChange={cambiar('transferencia')} />
                {' '}Confirmo que realicé la transferencia por el monto total y enviaré el comprobante al correo indicado.
              </label>
            </div>

            <div className="payment-method-panel" id="panelEfectivo" style={{ display: metodo === 'efectivo' ? 'block' : 'none' }}>
              <p className="paymenthint"><i className="fas fa-hand-holding-usd"></i> Paga en efectivo al momento de retirar tu pedido en tienda o al recibirlo si elegiste despacho a domicilio. Te recomendamos llevar el monto exacto: <strong id="cashAmountHint">{totalTexto}</strong>.</p>
            </div>

            <p className="paymenterror" id="paymentError" role="alert">{error}</p>

            <div className="checkout-nav">
              <button type="button" className="paymentback step-prev" onClick={() => irAPaso(2)}><i className="fas fa-arrow-left"></i> Atrás</button>
              <button className="cartcheckout" id="paySubmit" type="submit" disabled={procesando}>
                {procesando
                  ? <><i className="fas fa-spinner fa-spin"></i> Procesando...</>
                  : <><i className="fas fa-lock"></i>Confirmar pago</>}
              </button>
            </div>
          </div>

          <div className="payment-success" id="paymentSuccess" role="status" aria-live="polite"></div>
        </form>
      </div>

      {/* NOTIFICACIÓN DE PAGO */}
      <div id="paymentToast" className={`payment-toast${toast ? ' show' : ''}`} role="status" aria-live="polite">
        {toast && (
          <>
            <strong><i className="fas fa-check-circle"></i> Pago confirmado</strong>
            Pedido {toast.numero} por {toast.totalTexto}.<br />
            Confirmación enviada a <span className="toast-email">{toast.correo}</span>.
          </>
        )}
      </div>
    </>
  );
}
