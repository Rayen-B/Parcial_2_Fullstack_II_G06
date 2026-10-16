// Código de ejemplo de la documentación (React IV – Pruebas Unitarias, diapositivas 11, 14 y 25)

export function sumar(a, b) {
  if (typeof a !== 'number' || typeof b !== 'number') {
    throw new Error('Ambos argumentos deben ser números');
  }
  return a + b;
}

export function dividir(a, b) {
  if (b === 0) throw new Error('División por cero');
  return a / b;
}
