import { describe, it, expect } from 'vitest';
import { sumar, dividir } from '../ejemplos-documentacion/utils';

// ---- Diapositivas 9 a 14 y 25-26 de "React IV – Pruebas Unitarias" ----

describe('sumar()', () => {
  it('debería retornar la suma de dos números', () => {
    expect(sumar(2, 3)).toBe(5);
  });

  it('debería sumar números negativos', () => {
    expect(sumar(-2, -3)).toBe(-5);
  });

  it('debería sumar decimales', () => {
    expect(sumar(0.5, 0.25)).toBe(0.75);
  });

  it('debería lanzar error si se pasan strings', () => {
    expect(() => sumar('dos', 'tres')).toThrow('Ambos argumentos deben ser números');
  });

  it('debería lanzar error si falta un argumento', () => {
    expect(() => sumar(5)).toThrow('Ambos argumentos deben ser números');
  });

  it('debería lanzar error si se pasan valores null o undefined', () => {
    expect(() => sumar(null, undefined)).toThrow('Ambos argumentos deben ser números');
  });

  it('no debería concatenar un número con un string', () => {
    expect(() => sumar(2, '3')).toThrow();
  });
});

describe('dividir()', () => {
  it('divide dos números correctamente', () => {
    expect(dividir(10, 2)).toBe(5);
  });

  it('lanza error si se divide por cero', () => {
    expect(() => dividir(5, 0)).toThrow('División por cero');
  });

  it('permite dividir cero por un número', () => {
    expect(dividir(0, 5)).toBe(0);
  });

  it('el resultado de una división inexacta no es entero', () => {
    expect(dividir(1, 3)).toBeLessThan(1);
    expect(dividir(1, 3)).toBeGreaterThan(0);
  });
});

describe('Métodos de expect() (diapositivas 12 y 13)', () => {
  it('debería realizar múltiples comprobaciones', () => {
    const nombre = 'Juan';
    const edad = 30;
    expect(nombre).toBe('Juan');
    expect(edad).toBeGreaterThan(18);
    expect(typeof edad).toBe('number');
  });

  it('toEqual compara objetos por contenido', () => {
    expect({ a: 1 }).toEqual({ a: 1 });
  });

  it('not.toBe espera que el valor NO sea igual', () => {
    expect(3).not.toBe(4);
  });

  it('toBeTruthy y toBeFalsy distinguen verdadero de falso', () => {
    expect(true).toBeTruthy();
    expect(0).toBeFalsy();
  });

  it('toBeNull, toBeDefined y toBeUndefined', () => {
    const variable = 'algo';
    expect(null).toBeNull();
    expect(variable).toBeDefined();
    expect(undefined).toBeUndefined();
  });

  it('toContain busca dentro de arrays y strings', () => {
    expect(['a', 'b']).toContain('a');
    expect('Hola mundo').toContain('mundo');
  });

  it('toMatch usa una expresión regular', () => {
    expect('Hola mundo').toMatch(/mundo/);
  });
});
