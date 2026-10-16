// Revisa si la fecha de vencimiento (formato "MM/AA") ya pasó
export function tarjetaVencida(vencimiento, hoy = new Date()) {
  const [mesTxt, anioTxt] = String(vencimiento).split('/');
  const mes = parseInt(mesTxt, 10);
  const anio = parseInt('20' + anioTxt, 10);
  if (!mes || mes < 1 || mes > 12 || Number.isNaN(anio)) return true;
  const finMes = new Date(anio, mes, 0, 23, 59, 59);
  return finMes < hoy;
}

export function formatearVencimiento(valor, eliminar = false) {
  const digitos = String(valor || '').replace(/\D/g, '').slice(0, 4);
  if (digitos.length < 2) return digitos;
  if (digitos.length === 2) return eliminar ? digitos : `${digitos}/`;
  return `${digitos.slice(0, 2)}/${digitos.slice(2)}`;
}

// Número de tarjeta de prueba que el "banco" simulado siempre rechaza (4000 0000 0000 0002, pasa Luhn)
export const TARJETA_RECHAZADA = '4000000000000002';

// Simula la respuesta de la pasarela de pago. Solo la tarjeta de prueba de rechazo falla.
export function simularPago({ metodoPago, numTarjeta = '' }) {
  if (metodoPago === 'tarjeta' && numTarjeta.replace(/\D/g, '') === TARJETA_RECHAZADA) {
    return { aprobado: false, motivo: 'Tu banco rechazó la transacción. Revisa los datos o prueba con otra tarjeta.' };
  }
  return { aprobado: true, motivo: '' };
}
