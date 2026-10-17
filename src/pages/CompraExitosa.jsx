import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useSeo } from '../hooks/useSeo';
import ResumenOrden from '../components/organisms/ResumenOrden';
import { obtenerOrden } from '../services/db';

// Vista /compra/exitosa/:id con el resumen de la compra
export default function CompraExitosa() {
  const { id } = useParams();
  const orden = obtenerOrden(id);
  useSeo({ titulo: orden ? 'Compra realizada' : 'Orden no encontrada', noindex: true });
  const [emailEnviado, setEmailEnviado] = useState(false);

  if (!orden) {
    return <section className="container text-center"><h1 className="stitle">Orden no encontrada</h1><Link to="/productos" className="btn-red">Volver a la tienda</Link></section>;
  }

  return (
    <section>
      <div className="container" style={{ maxWidth: 820 }}>
        <div className="p-4 bg-white rounded-4 shadow-sm">
          <h1 className="h3 fw-bold" style={{ color: 'var(--green)' }}><i className="fas fa-check-circle me-2"></i>Se ha realizado la compra. Nro {orden.numero}</h1>
          <p className="text-muted">Gracias por tu compra. Guardamos el comprobante de tu pedido.</p>
          <ResumenOrden orden={orden} />
          <div className="d-flex flex-wrap gap-2 no-print">
            <button type="button" className="btn btn-danger" onClick={() => window.print()}><i className="fas fa-file-pdf me-1"></i>Imprimir boleta en PDF</button>
            <button type="button" className="btn btn-success" onClick={() => setEmailEnviado(true)}><i className="fas fa-envelope me-1"></i>Enviar boleta por email</button>
            <Link to="/productos" className="btn btn-outline-secondary"><i className="fas fa-arrow-left me-1" aria-hidden="true"></i>Seguir comprando</Link>
          </div>
          {emailEnviado && <p className="mt-3 text-success" role="status">Enviamos la boleta a {orden.correo}.</p>}
        </div>
      </div>
    </section>
  );
}
