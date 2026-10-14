import React from 'react';
import { Table, Button } from 'react-bootstrap';
import InsigniaEstado from '../atoms/InsigniaEstado';

export default function TablaUsuariosAdmin({ usuarios, onEditar, onEliminar }) {
  return (
    <Table responsive hover align="middle" className="border rounded-3 overflow-hidden shadow-sm">
      <thead className="bg-light">
        <tr>
          <th>RUN</th>
          <th>Nombre Completo</th>
          <th>Correo</th>
          <th>Rol</th>
          <th>Ubicación</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {usuarios.map((usr) => (
          <tr key={usr.run}>
            <td className="fw-bold">{usr.run}</td>
            <td>{usr.nombre} {usr.apellidos || ''}</td>
            <td>{usr.correo}</td>
            <td>
              <InsigniaEstado estado={usr.rol || 'Cliente'} />
            </td>
            <td>
              <small className="text-muted">
                {usr.comuna || 'Santiago'}, {usr.region || 'Metropolitana'}
              </small>
            </td>
            <td>
              <div className="d-flex gap-2">
                <Button variant="outline-primary" size="sm" onClick={() => onEditar(usr)}>
                  <i className="fas fa-edit"></i>
                </Button>
                <Button variant="outline-danger" size="sm" onClick={() => onEliminar(usr.run)}>
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
