import React, { useState, useEffect } from 'react';
import { Modal } from 'react-bootstrap';
import AdminLayout from '../../components/organisms/AdminLayout';
import { obtenerOrdenes } from '../../services/storage';

// Insignia e ícono según el estado de la orden (tabla)
const ESTADOS = {
  Enviado: { clase: 'badge-soft-success', icono: 'ti ti-truck me-1' },
  Pendiente: { clase: 'badge-soft-warning', icono: 'ti ti-clock me-1' },
  Cancelado: { clase: 'badge-soft-danger', icono: 'ti ti-x me-1' },
  Procesando: { clase: 'badge-soft-info', icono: 'ti ti-loader me-1' }
};

// En el modal la insignia solo muestra el texto
export function claseEstadoModal(estado) {
  if (estado === 'Enviado') return 'badge-soft-success';
  if (estado === 'Pendiente') return 'badge-soft-warning';
  if (estado === 'Cancelado') return 'badge-soft-danger';
  return 'badge-soft-info';
}

const montoTexto = (ord) => ord.montoTotal || `$${(ord.total || 0).toLocaleString('es-CL')}`;

// Busca en el texto de la fila y en los productos comprados
export function filtrarOrdenes(ordenes, busqueda) {
  const query = busqueda.toLowerCase().trim();
  if (!query) return ordenes;
  return ordenes.filter((o) => {
    const texto = [o.fecha, o.numero || `#${o.id}`, o.cliente, o.correo, o.estado, montoTexto(o), 'Ver', o.items].join(' ').toLowerCase();
    return texto.includes(query);
  });
}

export default function AdminOrdenes() {
  const [ordenes, setOrdenes] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [ordenModal, setOrdenModal] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);

  const verOrden = (ord) => {
    setOrdenModal(ord);
    setMostrarModal(true);
  };
  const cerrarModal = () => setMostrarModal(false);

  useEffect(() => {
    setOrdenes(obtenerOrdenes());
  }, []);

  const ordenesFiltradas = filtrarOrdenes(ordenes, busqueda);
  const query = busqueda.toLowerCase().trim();

  const acciones = (
    <button className="btn btn-outline-secondary btn-sm" onClick={() => window.print()}>
      <i className="ti ti-printer me-1"></i> Imprimir Reporte
    </button>
  );

  return (
    <AdminLayout tituloPagina="Órdenes de Compra" tituloDocumento="Administrador - Órdenes" acciones={acciones}>
      {/* Tabla de Órdenes */}
      <div className="card shadow-sm">
        <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center flex-wrap gap-2">
          <h6 className="mb-0 fw-bold text-principal"><i className="ti ti-file-invoice me-1"></i> Historial de Órdenes</h6>
          <div className="d-flex gap-2">
            <input
              type="text"
              id="buscador-ordenes"
              className="form-control form-control-sm input-buscar"
              placeholder="Buscar orden o cliente..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
        </div>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>N° de Orden</th>
                <th>Cliente</th>
                <th>Estado</th>
                <th>Monto Total</th>
                <th className="text-end">Detalle</th>
              </tr>
            </thead>
            <tbody>
              {ordenesFiltradas.map((ord) => {
                const estado = ESTADOS[ord.estado] || ESTADOS.Procesando;
                return (
                  <tr key={ord.id || ord.numero}>
                    <td data-label="Fecha">{ord.fecha}</td>
                    <td className="fw-bold font-monospace text-secundario" data-label="N° de Orden">{ord.numero || `#${ord.id}`}</td>
                    <td data-label="Cliente">
                      <div className="d-flex flex-column text-end">
                        <div className="fw-semibold">{ord.cliente}</div>
                        <small className="text-muted">{ord.correo}</small>
                      </div>
                    </td>
                    <td data-label="Estado"><span className={estado.clase}><i className={estado.icono}></i> {ord.estado}</span></td>
                    <td className="fw-bold" data-label="Monto Total">{montoTexto(ord)}</td>
                    <td className="text-end" data-label="Detalle">
                      <button type="button" className="btn btn-outline-info btn-sm btn-ver-orden" onClick={() => verOrden(ord)}>
                        <i className="ti ti-eye"></i> Ver
                      </button>
                    </td>
                  </tr>
                );
              })}
              {ordenesFiltradas.length === 0 && (
                <tr className="fila-sin-resultados">
                  <td colSpan="6" className="text-center py-4 text-muted">
                    <i className="ti ti-alert-circle me-1"></i> No se encontraron órdenes coincidentes con "<b>{query}</b>".
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="card-footer bg-white d-flex justify-content-between align-items-center py-3">
          <small className="text-muted">Mostrando {ordenesFiltradas.length} de {ordenes.length} órdenes registradas</small>
          <nav>
            <ul className="pagination pagination-sm mb-0" style={query ? { display: 'none' } : undefined}>
              <li className="page-item disabled"><a className="page-link" href="#" onClick={(e) => e.preventDefault()}>«</a></li>
              <li className="page-item active"><a className="page-link" href="#" onClick={(e) => e.preventDefault()}>1</a></li>
              <li className="page-item"><a className="page-link" href="#" onClick={(e) => e.preventDefault()}>»</a></li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Modal Mostrar Orden */}
      <Modal show={mostrarModal} onHide={cerrarModal} centered contentClassName="border-0 shadow" aria-labelledby="modalMostrarOrdenLabel">
        {ordenModal && (
          <>
            <div className="modal-header bg-white border-bottom">
              <h5 className="modal-title fw-bold text-principal" id="modalMostrarOrdenLabel">
                <i className="ti ti-file-invoice me-1 text-secundario"></i> Detalle de la Orden
              </h5>
              <button type="button" className="btn-close" aria-label="Cerrar" onClick={cerrarModal}></button>
            </div>
            <div className="modal-body p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <span className="text-muted small d-block">Número de Pedido</span>
                  <span id="modal-ord-id" className="fw-bold font-monospace text-secundario fs-5">{(ordenModal.numero || ordenModal.id).replace(/^#/, '')}</span>
                </div>
                <span id="modal-ord-estado" className={claseEstadoModal(ordenModal.estado)}>{ordenModal.estado}</span>
              </div>
              <div className="p-3 bg-light rounded-3 mb-3 small">
                <div className="mb-2">
                  <span className="text-muted">Cliente:</span>{' '}
                  <b id="modal-ord-cliente" className="ms-1 text-principal">{ordenModal.cliente}</b>
                </div>
                <div className="mb-2">
                  <span className="text-muted">Correo:</span>{' '}
                  <span id="modal-ord-correo" className="ms-1">{ordenModal.correo}</span>
                </div>
                <div>
                  <span className="text-muted">Fecha de Compra:</span>{' '}
                  <span id="modal-ord-fecha" className="ms-1">{ordenModal.fecha}</span>
                </div>
              </div>
              <h6 className="fw-bold text-principal mb-2 small text-uppercase">Productos Comprados</h6>
              <div className="list-group list-group-flush border rounded-3 mb-3 small" id="modal-ord-items">
                {(ordenModal.items || '').split(';').map((item, idx) => (
                  <div key={idx} className="list-group-item d-flex justify-content-between align-items-center py-2">
                    <span><i className="ti ti-cake me-2 text-secundario"></i> {item.trim()}</span>
                    <span className="badge bg-light text-dark">Confirmado</span>
                  </div>
                ))}
              </div>
              <div className="d-flex justify-content-between align-items-center pt-2 border-top">
                <span className="fw-bold text-muted">Total a Pagar:</span>
                <span id="modal-ord-total" className="fw-bold fs-5 text-principal">{montoTexto(ordenModal)}</span>
              </div>
            </div>
            <div className="modal-footer bg-light border-0 py-2">
              <button type="button" className="btn btn-secondary btn-sm" onClick={cerrarModal}>Cerrar</button>
            </div>
          </>
        )}
      </Modal>
    </AdminLayout>
  );
}
