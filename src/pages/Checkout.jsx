import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Alert, ListGroup } from 'react-bootstrap';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import EtiquetaPrecio from '../components/atoms/EtiquetaPrecio';
import { validarRUN, validarEmail, validarTarjetaLuhn } from '../utils/validaciones';
import { regionesYComunas } from '../utils/regiones';
import { guardarOrdenes, obtenerOrdenes } from '../services/storage';
import { useNavigate } from 'react-router-dom';

export default function Checkout() {
  const { carrito, totalPrecio, vaciarCarrito } = useCart();
  const { usuario } = useAuth();
  const navigate = useNavigate();

  const [nombre, setNombre] = useState(usuario ? `${usuario.nombre} ${usuario.apellidos || ''}` : '');
  const [run, setRun] = useState(usuario ? usuario.run : '');
  const [correo, setCorreo] = useState(usuario ? usuario.correo : '');
  const [telefono, setTelefono] = useState('');

  const [metodoEntrega, setMetodoEntrega] = useState('despacho');
  const [region, setRegion] = useState(usuario?.region || 'Región Metropolitana de Santiago');
  const [comuna, setComuna] = useState(usuario?.comuna || 'Santiago');
  const [direccion, setDireccion] = useState(usuario?.direccion || '');

  const [metodoPago, setMetodoPago] = useState('tarjeta');
  const [numTarjeta, setNumTarjeta] = useState('');
  const [vencimiento, setVencimiento] = useState('');
  const [cvv, setCvv] = useState('');

  const [errorMsg, setErrorMsg] = useState('');
  const [errores, setErrores] = useState({});
  const [pedidoExitoso, setPedidoExitoso] = useState(null);

  const comunasDisponibles = regionesYComunas.find((r) => r.region === region)?.comunas || [];

  if (carrito.length === 0 && !pedidoExitoso) {
    return (
      <Container className="py-5 text-center">
        <h4 className="stitle mb-3">No tienes productos en el carrito para pagar</h4>
        <button onClick={() => navigate('/')} className="btn-red">
          <i className="fas fa-utensils me-1"></i> Volver a la tienda
        </button>
      </Container>
    );
  }

  const handleSubmitPedido = (e) => {
    e.preventDefault();
    setErrorMsg('');
    const newErrores = {};

    // Validar Datos Personales
    if (!nombre || nombre.trim().length < 3) {
      newErrores.nombre = 'El nombre completo debe tener al menos 3 caracteres';
    }

    const resRun = validarRUN(run);
    if (!resRun.valido) newErrores.run = resRun.mensaje;

    const resCorreo = validarEmail(correo);
    if (!resCorreo.valido) newErrores.correo = resCorreo.mensaje;

    if (!telefono || telefono.trim().length < 8) {
      newErrores.telefono = 'Ingrese un número de teléfono celular válido (+569...)';
    }

    // Validar Despacho
    if (metodoEntrega === 'despacho' && (!direccion || direccion.trim().length < 5)) {
      newErrores.direccion = 'Ingrese una dirección completa (mínimo 5 caracteres)';
    }

    // Validar Pago si es tarjeta
    if (metodoPago === 'tarjeta') {
      const resTarjeta = validarTarjetaLuhn(numTarjeta);
      if (!resTarjeta.valido) newErrores.numTarjeta = resTarjeta.mensaje;

      if (!vencimiento || vencimiento.trim().length < 4) {
        newErrores.vencimiento = 'Ingrese una fecha válida (MM/AA)';
      }

      if (!cvv || cvv.trim().length < 3) {
        newErrores.cvv = 'Código CVV inválido (mínimo 3 números)';
      }
    }

    setErrores(newErrores);
    if (Object.keys(newErrores).length > 0) {
      setErrorMsg('Por favor corrige los campos indicados en rojo para continuar.');
      return;
    }

    // Crear la orden de compra
    const numOrden = 'ORD-' + Math.floor(100000 + Math.random() * 900000);
    const nuevaOrden = {
      id: numOrden,
      fecha: new Date().toLocaleDateString('es-CL'),
      cliente: { nombre, run, correo, telefono },
      entrega: { metodo: metodoEntrega, region, comuna, direccion },
      pago: { metodo: metodoPago },
      items: carrito,
      total: totalPrecio,
      estado: 'Pendiente'
    };

    const ordenesAnteriores = obtenerOrdenes();
    guardarOrdenes([...ordenesAnteriores, nuevaOrden]);

    setPedidoExitoso(nuevaOrden);
    vaciarCarrito();
  };

  if (pedidoExitoso) {
    return (
      <Container className="py-5">
        <Card className="text-center p-5 border-0 shadow-lg rounded-4 max-w-lg mx-auto" style={{ background: '#fff6ef' }}>
          <div className="mb-3" style={{ color: '#2d6a4f' }}>
            <i className="fas fa-check-circle fa-5x"></i>
          </div>
          <h2 className="stitle mb-2">¡Compra Confirmada!</h2>
          <p className="text-muted lead">
            Tu número de pedido es <span className="fw-bold" style={{ color: '#894530' }}>{pedidoExitoso.id}</span>
          </p>
          <p className="text-muted">
            Hemos enviado el comprobante y detalle de entrega a <strong>{pedidoExitoso.cliente.correo}</strong>.
          </p>
          <div className="mt-4">
            <button onClick={() => navigate('/')} className="btn-red px-5 py-3">
              Volver al Inicio
            </button>
          </div>
        </Card>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <span className="slbl">Proceso de Pago</span>
      <h2 className="stitle mb-4" style={{ textAlign: 'left' }}>Finalizar <span>Compra</span></h2>
      {errorMsg && <Alert variant="danger" className="rounded-3 mb-4">{errorMsg}</Alert>}

      <Form onSubmit={handleSubmitPedido}>
        <Row className="gy-4">
          <Col lg={7}>
            {/* DATOS DE CONTACTO */}
            <Card className="border-0 shadow-sm rounded-4 p-4 mb-4" style={{ background: '#ffffff', border: '1px solid #fae7da' }}>
              <h5 className="fw-bold mb-3" style={{ color: '#894530', fontFamily: 'Playfair Display, serif' }}>
                <i className="fas fa-user me-2 text-secondary"></i>1. Datos de Contacto
              </h5>
              <Row className="g-3">
                <Col md={6}>
                  <Form.Label className="flbl">Nombre Completo *</Form.Label>
                  <Form.Control
                    type="text"
                    className={`fctrl ${errores.nombre ? 'border-danger is-invalid' : ''}`}
                    value={nombre}
                    onChange={(e) => {
                      setNombre(e.target.value);
                      if (errores.nombre) setErrores((prev) => ({ ...prev, nombre: null }));
                    }}
                  />
                  {errores.nombre && <div className="text-danger small mt-1"><i className="fas fa-exclamation-circle me-1"></i>{errores.nombre}</div>}
                </Col>
                <Col md={6}>
                  <Form.Label className="flbl">RUN (sin puntos ni guión) *</Form.Label>
                  <Form.Control
                    type="text"
                    className={`fctrl ${errores.run ? 'border-danger is-invalid' : ''}`}
                    placeholder="19011022K"
                    value={run}
                    onChange={(e) => {
                      setRun(e.target.value);
                      if (errores.run) setErrores((prev) => ({ ...prev, run: null }));
                    }}
                  />
                  {errores.run && <div className="text-danger small mt-1"><i className="fas fa-exclamation-circle me-1"></i>{errores.run}</div>}
                </Col>
                <Col md={6}>
                  <Form.Label className="flbl">Correo Electrónico *</Form.Label>
                  <Form.Control
                    type="email"
                    className={`fctrl ${errores.correo ? 'border-danger is-invalid' : ''}`}
                    value={correo}
                    onChange={(e) => {
                      setCorreo(e.target.value);
                      if (errores.correo) setErrores((prev) => ({ ...prev, correo: null }));
                    }}
                  />
                  {errores.correo && <div className="text-danger small mt-1"><i className="fas fa-exclamation-circle me-1"></i>{errores.correo}</div>}
                </Col>
                <Col md={6}>
                  <Form.Label className="flbl">Teléfono Celular *</Form.Label>
                  <Form.Control
                    type="tel"
                    className={`fctrl ${errores.telefono ? 'border-danger is-invalid' : ''}`}
                    placeholder="+56 9 1234 5678"
                    value={telefono}
                    onChange={(e) => {
                      setTelefono(e.target.value);
                      if (errores.telefono) setErrores((prev) => ({ ...prev, telefono: null }));
                    }}
                  />
                  {errores.telefono && <div className="text-danger small mt-1"><i className="fas fa-exclamation-circle me-1"></i>{errores.telefono}</div>}
                </Col>
              </Row>
            </Card>

            {/* MÉTODO DE ENTREGA */}
            <Card className="border-0 shadow-sm rounded-4 p-4 mb-4" style={{ background: '#ffffff', border: '1px solid #fae7da' }}>
              <h5 className="fw-bold mb-3" style={{ color: '#894530', fontFamily: 'Playfair Display, serif' }}>
                <i className="fas fa-truck me-2 text-secondary"></i>2. Método de Entrega
              </h5>
              <Form.Group className="mb-3">
                <div className="d-flex gap-4">
                  <Form.Check
                    type="radio"
                    id="despacho"
                    label="Despacho a Domicilio"
                    name="entrega"
                    checked={metodoEntrega === 'despacho'}
                    onChange={() => setMetodoEntrega('despacho')}
                  />
                  <Form.Check
                    type="radio"
                    id="retiro"
                    label="Retiro en Tienda (Gratis)"
                    name="entrega"
                    checked={metodoEntrega === 'retiro'}
                    onChange={() => setMetodoEntrega('retiro')}
                  />
                </div>
              </Form.Group>

              {metodoEntrega === 'despacho' && (
                <Row className="g-3">
                  <Col md={6}>
                    <Form.Label className="flbl">Región</Form.Label>
                    <Form.Select
                      className="fctrl"
                      value={region}
                      onChange={(e) => {
                        setRegion(e.target.value);
                        const comunas = regionesYComunas.find((r) => r.region === e.target.value)?.comunas || [];
                        setComuna(comunas[0] || '');
                      }}
                    >
                      {regionesYComunas.map((r) => (
                        <option key={r.region} value={r.region}>{r.region}</option>
                      ))}
                    </Form.Select>
                  </Col>
                  <Col md={6}>
                    <Form.Label className="flbl">Comuna</Form.Label>
                    <Form.Select className="fctrl" value={comuna} onChange={(e) => setComuna(e.target.value)}>
                      {comunasDisponibles.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </Form.Select>
                  </Col>
                  <Col md={12}>
                    <Form.Label className="flbl">Dirección de Entrega *</Form.Label>
                    <Form.Control
                      type="text"
                      className={`fctrl ${errores.direccion ? 'border-danger is-invalid' : ''}`}
                      placeholder="Calle, número, depto / casa"
                      value={direccion}
                      onChange={(e) => {
                        setDireccion(e.target.value);
                        if (errores.direccion) setErrores((prev) => ({ ...prev, direccion: null }));
                      }}
                    />
                    {errores.direccion && <div className="text-danger small mt-1"><i className="fas fa-exclamation-circle me-1"></i>{errores.direccion}</div>}
                  </Col>
                </Row>
              )}
            </Card>

            {/* MÉTODO DE PAGO */}
            <Card className="border-0 shadow-sm rounded-4 p-4" style={{ background: '#ffffff', border: '1px solid #fae7da' }}>
              <h5 className="fw-bold mb-3" style={{ color: '#894530', fontFamily: 'Playfair Display, serif' }}>
                <i className="fas fa-credit-card me-2 text-secondary"></i>3. Método de Pago
              </h5>
              <Form.Group className="mb-3">
                <Form.Select className="fctrl" value={metodoPago} onChange={(e) => setMetodoPago(e.target.value)}>
                  <option value="tarjeta">Tarjeta de Crédito / Débito</option>
                  <option value="transferencia">Transferencia Bancaria</option>
                  <option value="efectivo">Efectivo contra entrega</option>
                </Form.Select>
              </Form.Group>

              {metodoPago === 'tarjeta' && (
                <Row className="g-3">
                  <Col md={12}>
                    <Form.Label className="flbl">Número de Tarjeta</Form.Label>
                    <Form.Control
                      type="text"
                      className={`fctrl ${errores.numTarjeta ? 'border-danger is-invalid' : ''}`}
                      placeholder="4532 1234 5678 9010"
                      value={numTarjeta}
                      onChange={(e) => {
                        setNumTarjeta(e.target.value);
                        if (errores.numTarjeta) setErrores((prev) => ({ ...prev, numTarjeta: null }));
                      }}
                    />
                    {errores.numTarjeta && <div className="text-danger small mt-1"><i className="fas fa-exclamation-circle me-1"></i>{errores.numTarjeta}</div>}
                  </Col>
                  <Col md={6}>
                    <Form.Label className="flbl">Vencimiento (MM/AA)</Form.Label>
                    <Form.Control
                      type="text"
                      className={`fctrl ${errores.vencimiento ? 'border-danger is-invalid' : ''}`}
                      placeholder="12/28"
                      value={vencimiento}
                      onChange={(e) => {
                        setVencimiento(e.target.value);
                        if (errores.vencimiento) setErrores((prev) => ({ ...prev, vencimiento: null }));
                      }}
                    />
                    {errores.vencimiento && <div className="text-danger small mt-1"><i className="fas fa-exclamation-circle me-1"></i>{errores.vencimiento}</div>}
                  </Col>
                  <Col md={6}>
                    <Form.Label className="flbl">Código CVV</Form.Label>
                    <Form.Control
                      type="password"
                      className={`fctrl ${errores.cvv ? 'border-danger is-invalid' : ''}`}
                      placeholder="123"
                      value={cvv}
                      onChange={(e) => {
                        setCvv(e.target.value);
                        if (errores.cvv) setErrores((prev) => ({ ...prev, cvv: null }));
                      }}
                    />
                    {errores.cvv && <div className="text-danger small mt-1"><i className="fas fa-exclamation-circle me-1"></i>{errores.cvv}</div>}
                  </Col>
                </Row>
              )}
            </Card>
          </Col>

          <Col lg={5}>
            <Card className="border-0 shadow-sm rounded-4 p-4 sticky-top" style={{ top: '110px', zIndex: 10, background: '#fff6ef', border: '1px solid #fae7da' }}>
              <h5 className="fw-bold mb-3" style={{ color: '#42414a', fontFamily: 'Playfair Display, serif' }}>
                Resumen de Tu Pedido
              </h5>
              <ListGroup variant="flush" className="mb-3 bg-transparent">
                {carrito.map((item) => (
                  <ListGroup.Item key={`${item.id}-${item.variante}`} className="px-0 bg-transparent border-bottom d-flex justify-content-between align-items-center">
                    <div>
                      <div className="fw-bold">{item.nombre} x {item.cantidad}</div>
                      <small className="text-muted">{item.variante === 'trozo' ? 'Trozo' : 'Entera'}</small>
                    </div>
                    <EtiquetaPrecio monto={item.precio * item.cantidad} style={{ color: '#894530' }} />
                  </ListGroup.Item>
                ))}
              </ListGroup>

              <div className="d-flex justify-content-between align-items-center border-top pt-3 mb-4">
                <span className="fs-5 fw-bold text-dark">Total a Pagar:</span>
                <EtiquetaPrecio monto={totalPrecio} className="fs-3 fw-bold" style={{ color: '#894530' }} />
              </div>

              <button type="submit" className="btn-red w-100 justify-content-center py-3 fs-6">
                <i className="fas fa-lock me-2"></i>Confirmar y Pagar
              </button>
            </Card>
          </Col>
        </Row>
      </Form>
    </Container>
  );
}
