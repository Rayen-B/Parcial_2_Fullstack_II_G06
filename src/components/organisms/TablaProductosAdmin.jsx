import React from 'react';
import { Table, Button, Badge } from 'react-bootstrap';
import EtiquetaPrecio from '../atoms/EtiquetaPrecio';
import InsigniaEstado from '../atoms/InsigniaEstado';
import { obtenerImagen } from '../../assets/images';

export default function TablaProductosAdmin({ productos, onEditar, onEliminar }) {
  return (
    <Table responsive hover align="middle" className="border rounded-3 overflow-hidden shadow-sm">
      <thead className="bg-light">
        <tr>
          <th>Código</th>
          <th>Producto</th>
          <th>Categoría</th>
          <th>Precio</th>
          <th>Stock</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {productos.map((prod) => (
          <tr key={prod.codigo || prod.id}>
            <td className="fw-bold">{prod.codigo}</td>
            <td>
              <div className="d-flex align-items-center gap-2">
                <img
                  src={obtenerImagen(prod.imagen)}
                  alt={prod.nombre}
                  className="rounded-2"
                  style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://placehold.co/100x100?text=Papita';
                  }}
                />
                <div>
                  <div className="fw-bold">{prod.nombre}</div>
                  <small className="text-muted d-block" style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {prod.descripcion}
                  </small>
                </div>
              </div>
            </td>
            <td><Badge bg="secondary">{prod.categoria}</Badge></td>
            <td><EtiquetaPrecio monto={prod.precio} /></td>
            <td>
              <InsigniaEstado stock={prod.stock} stockCritico={prod.stockCritico} />
            </td>
            <td>
              <div className="d-flex gap-2">
                <Button variant="outline-primary" size="sm" onClick={() => onEditar(prod)}>
                  <i className="fas fa-edit"></i>
                </Button>
                <Button variant="outline-danger" size="sm" onClick={() => onEliminar(prod.codigo || prod.id)}>
                  <i className="fas fa-trash"></i>
                </Button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}
