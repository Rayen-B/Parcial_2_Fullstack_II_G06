// Validación tipo Luhn para el número de tarjeta
export function pasaLuhn(numero) {
  let suma = 0;
  let alternar = false;
  for (let i = numero.length - 1; i >= 0; i--) {
    let digito = parseInt(numero.charAt(i), 10);
    if (alternar) {
      digito *= 2;
      if (digito > 9) digito -= 9;
    }
    suma += digito;
    alternar = !alternar;
  }
  return suma % 10 === 0;
}

// Revisa si la fecha de vencimiento (formato "MM/AA") ya pasó
export function tarjetaVencida(vencimiento, hoy = new Date()) {
  const [mesTxt, anioTxt] = vencimiento.split('/');
  const mes = parseInt(mesTxt, 10);
  const anio = parseInt('20' + anioTxt, 10);
  if (mes < 1 || mes > 12) return true;
  const finMes = new Date(anio, mes, 0, 23, 59, 59);
  return finMes < hoy;
}
