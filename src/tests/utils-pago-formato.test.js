import { describe, it, expect } from 'vitest';
import { formatearVencimiento, tarjetaVencida, simularPago, TARJETA_RECHAZADA } from '../utils/pago';
import { formatearPrecio, precioANumero } from '../utils/formato';

describe('utils/formato', () => {
  it('formatea el precio en pesos chilenos', () => expect(formatearPrecio(16900)).toBe('$16.900'));
  it('convierte texto a número', () => expect(precioANumero('$16.900')).toBe(16900));
  it('devuelve 0 con texto vacío', () => expect(precioANumero('')).toBe(0));
});

describe('utils/pago', () => {
  it('aplica el formato MM/AA al vencimiento sin aceptar más de cuatro dígitos', () => {
    expect(formatearVencimiento('12')).toBe('12/');
    expect(formatearVencimiento('1230')).toBe('12/30');
    expect(formatearVencimiento('12/30')).toBe('12/30');
    expect(formatearVencimiento('123045')).toBe('12/30');
    expect(formatearVencimiento('12', true)).toBe('12');
  });
  it('detecta tarjeta vencida', () => expect(tarjetaVencida('01/20')).toBe(true));
  it('detecta tarjeta vigente', () => expect(tarjetaVencida('12/99')).toBe(false));
  it('mes inválido cuenta como vencida', () => expect(tarjetaVencida('13/30')).toBe(true));
  it('la tarjeta de prueba es rechazada', () => expect(simularPago({ metodoPago: 'tarjeta', numTarjeta: TARJETA_RECHAZADA }).aprobado).toBe(false));
  it('otras tarjetas son aprobadas', () => expect(simularPago({ metodoPago: 'tarjeta', numTarjeta: '4532015112830366' }).aprobado).toBe(true));
  it('efectivo siempre se aprueba', () => expect(simularPago({ metodoPago: 'efectivo' }).aprobado).toBe(true));
});
