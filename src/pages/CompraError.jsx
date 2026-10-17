import React from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { useSeo } from '../hooks/useSeo';
import ResumenOrden from '../components/organisms/ResumenOrden';
import { obtenerOrden } from '../services/db';

// Vista /compra/error/:id cuando el pago fue rechazado. El carrito se conserva para reintentar.
export default function CompraError() {
  const { id } = useParams();
  const { state } = useLocation();
  const orden = obtenerOrden(id);
  useSeo({ titulo: orden ? 'No se pudo realizar el pago' : 'Orden no encontrada', noindex: true });

  if (!orden) {
    return <section className="container text-center"><h1 className="stitle">Orden no encontrada</h1><Link to="/productos" className="btn-red">Volver a la tienda</Link></section>;
  }

  return (
    <section>
      <div className="container" style={{ maxWidth: 820 }}>
        <div className="p-4 bg-white rounded-4 shadow-sm">
          <h1 className="h3 fw-bold text-danger"><i className="fas fa-times-circle me-2"></i>No se pudo realizar el pago. Nro {orden.numero}</h1>
          <p className="text-muted" role="alert">{state?.motivo || 'El pago no pudo ser procesado.'} Tu carrito sigue guardado.</p>
          <div className="d-flex flex-wrap gap-2 mb-3">
            <Link to="/checkout" className="btn btn-success">VOLVER A REALIZAR EL PAGO</Link>
            <Link to="/productos" className="btn btn-outline-secondary"><i className="fas fa-arrow-left me-1" aria-hidden="true"></i>Volver a la tienda</Link>
          </div>
          <ResumenOrden orden={orden} />
        </div>
      </div>
    </section>
  );
}
