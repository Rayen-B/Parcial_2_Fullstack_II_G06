import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Row, Col, Form, Card } from 'react-bootstrap';
import { obtenerProductos } from '../services/storage';
import EtiquetaPrecio from '../components/atoms/EtiquetaPrecio';
import InsigniaEstado from '../components/atoms/InsigniaEstado';
import { useCart } from '../context/CartContext';
import images from '../assets/images';
import { obtenerImagen } from '../assets/images';

export default function DetalleProducto() {
  const { id } = useParams();
  const { agregarAlCarrito } = useCart();
  const [producto, setProducto] = useState(null);
  const [variante, setVariante] = useState('entera');
  const [cantidad, setCantidad] = useState(1);

  useEffect(() => {
    const productos = obtenerProductos();
    const prodEncontrado = productos.find((p) => p.id === id || p.codigo === id);
    setProducto(prodEncontrado);
  }, [id]);

  if (!producto) {
    return (
      <Container className="py-5 text-center">
        <h4 className="stitle mb-3">Producto no encontrado</h4>
        <Link to="/" className="btn-red">
          <i className="fas fa-utensils me-1"></i> Volver a la tienda
        </Link>
      </Container>
    );
  }

  const esTorta = producto.categoria === 'Tortas';
  const precioUnitario = esTorta && variante === 'trozo' ? Math.round(producto.precio * 0.25) : producto.precio;
  const precioTotal = precioUnitario * cantidad;

  return (
    <Container className="py-5">
      <Link to="/" className="btn-red btn-sm mb-4 d-inline-flex align-items-center gap-1">
        <i className="fas fa-arrow-left"></i> Volver al Catálogo
      </Link>

      <Row className="gy-4 align-items-center">
        <Col md={6}>
          <img
            src={obtenerImagen(producto.imagen)}
            alt={producto.nombre}
            className="img-fluid rounded-4 shadow-sm w-100"
            style={{ maxHeight: '450px', objectFit: 'cover' }}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = images['imgc1'];
            }}
          />
        </Col>
        <Col md={6}>
          <span className="slbl mb-2">{producto.categoria}</span>
          <h1 className="stitle text-start mb-3" style={{ fontSize: '2.5rem' }}>{producto.nombre}</h1>
          <p className="sdesc mb-4" style={{ margin: 0 }}>{producto.descripcion}</p>

          <div className="mb-4">
            <InsigniaEstado stock={producto.stock} stockCritico={producto.stockCritico} />
          </div>

          <Card className="border-0 rounded-4 p-4 mb-4" style={{ background: '#fff6ef', border: '1px solid #fae7da' }}>
            {esTorta && (
              <Form.Group className="mb-3">
                <Form.Label className="flbl">Variante de Producto</Form.Label>
                <Form.Select className="fctrl" value={variante} onChange={(e) => setVariante(e.target.value)}>
                  <option value="entera">Torta Completa ({new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(producto.precio)})</option>
                  <option value="trozo">Trozo individual ({new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(Math.round(producto.precio * 0.25))})</option>
                </Form.Select>
              </Form.Group>
            )}

            <Form.Group className="mb-3">
              <Form.Label className="flbl">Cantidad</Form.Label>
              <div className="d-flex align-items-center gap-3">
                <button type="button" className="btn-red btn-sm px-3" onClick={() => setCantidad(Math.max(1, cantidad - 1))}>
                  -
                </button>
                <span className="fw-bold fs-5">{cantidad}</span>
                <button type="button" className="btn-red btn-sm px-3" onClick={() => setCantidad(cantidad + 1)}>
                  +
                </button>
              </div>
            </Form.Group>

            <div className="d-flex justify-content-between align-items-center border-top pt-3 mt-3">
              <span className="fw-bold text-muted">Subtotal:</span>
              <EtiquetaPrecio monto={precioTotal} className="fs-3 fw-bold" style={{ color: '#894530' }} />
            </div>
          </Card>

          <button
            type="button"
            className="btn-red w-100 justify-content-center py-3 fs-6"
            disabled={producto.stock <= 0}
            onClick={() => agregarAlCarrito(producto, variante, cantidad)}
          >
            <i className="fas fa-shopping-bag me-2"></i> Agregar al Carrito
          </button>
        </Col>
      </Row>
    </Container>
  );
}
