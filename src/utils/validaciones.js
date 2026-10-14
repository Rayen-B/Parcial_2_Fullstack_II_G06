
// Validar RUN chileno con Dígito Verificador (Módulo 11)
export function validarRUN(run) {
    if (!run || run.trim() === '') {
        return { valido: false, mensaje: "El RUN es requerido" };
    }
    const runTrim = run.trim();

    if (/[\.\-]/.test(runTrim)) {
        return { valido: false, mensaje: "El RUN debe ingresarse sin puntos ni guión (ej: 19011022K)" };
    }
    const runLimpio = runTrim.toUpperCase();
    if (runLimpio.length < 7 || runLimpio.length > 9) {
        return { valido: false, mensaje: "El RUN debe tener entre 7 y 9 caracteres (sin puntos ni guión)" };
    }
    const cuerpo = runLimpio.slice(0, -1);
    const dv = runLimpio.slice(-1);
    if (!/^\d+$/.test(cuerpo)) {
        return { valido: false, mensaje: "El cuerpo del RUN debe contener solo números" };
    }

    let suma = 0;
    let multiplo = 2;
    for (let i = cuerpo.length - 1; i >= 0; i--) {
        suma += parseInt(cuerpo[i]) * multiplo;
        multiplo = multiplo < 7 ? multiplo + 1 : 2;
    }

    const dvEsperadoCalculado = 11 - (suma % 11);
    let dvEsperado = '';
    if (dvEsperadoCalculado === 11) dvEsperado = '0';
    else if (dvEsperadoCalculado === 10) dvEsperado = 'K';
    else dvEsperado = dvEsperadoCalculado.toString();

    if (dv !== dvEsperado) {
        return { valido: false, mensaje: `RUN inválido. El dígito verificador no corresponde (esperado: ${dvEsperado})` };
    }
    return { valido: true, mensaje: "RUN válido" };
}

// Validar Correo Electrónico (RFC2822)
export function validarEmail(email) {
    if (!email || email.trim() === '') return { valido: false, mensaje: "El correo es requerido" };
    if (email.length > 100) return { valido: false, mensaje: "Máximo 100 caracteres" };

    const rfc2822Regex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    if (!rfc2822Regex.test(email.trim())) {
        return { valido: false, mensaje: "Formato de correo no válido (ej: usuario@correo.com)" };
    }

    return { valido: true, mensaje: "Correo válido" };
}

// Validar Contraseña (4 a 10 caracteres, alfanumérica con caracteres especiales)
export function validarPassword(pass) {
    if (!pass) return { valido: false, mensaje: "La contraseña es requerida" };
    if (pass.length < 4 || pass.length > 10) return { valido: false, mensaje: "Debe tener entre 4 y 10 caracteres" };

    const tieneLetra = /[a-zA-Z]/.test(pass);
    const tieneNumero = /\d/.test(pass);
    const tieneEspecial = /[^a-zA-Z0-9]/.test(pass);

    if (!tieneLetra || !tieneNumero || !tieneEspecial) {
        return { valido: false, mensaje: "Debe ser alfanumérica y contener al menos 1 símbolo (ej: @, $, #, !)" };
    }

    return { valido: true, mensaje: "Contraseña válida" };
}

// Validar Código de Producto
export function validarCodigoProducto(codigo) {
    if (!codigo || codigo.trim() === '') return { valido: false, mensaje: "El código es requerido" };
    if (codigo.trim().length < 3) return { valido: false, mensaje: "Mínimo 3 caracteres" };
    return { valido: true, mensaje: "Código válido" };
}

// Validar Precio
export function validarPrecio(precio) {
    if (precio === '' || precio === null || isNaN(precio)) return { valido: false, mensaje: "El precio es requerido" };
    const num = parseFloat(precio);
    if (num < 0) return { valido: false, mensaje: "El precio no puede ser negativo" };
    return { valido: true, mensaje: num === 0 ? "Producto gratuito" : "Precio válido" };
}

// Validar Stock
export function validarStock(stock) {
    if (stock === '' || stock === null || isNaN(stock)) return { valido: false, mensaje: "El stock es requerido" };
    const num = Number(stock);
    if (!Number.isInteger(num)) return { valido: false, mensaje: "Debe ser un número entero" };
    if (num < 0) return { valido: false, mensaje: "El stock no puede ser negativo" };
    return { valido: true, mensaje: "Stock válido" };
}

// Algoritmo de Luhn para números de tarjeta de crédito
export function validarTarjetaLuhn(numeroTarjeta) {
    const limpio = String(numeroTarjeta).replace(/\D/g, '');
    if (!limpio || limpio.length < 13 || limpio.length > 19) {
        return { valido: false, mensaje: "El número de tarjeta debe tener entre 13 y 19 dígitos" };
    }
    let suma = 0;
    let esSegundo = false;
    for (let i = limpio.length - 1; i >= 0; i--) {
        let d = parseInt(limpio.charAt(i), 10);
        if (esSegundo) {
            d = d * 2;
            if (d > 9) d -= 9;
        }
        suma += d;
        esSegundo = !esSegundo;
    }
    if (suma % 10 !== 0) {
        return { valido: false, mensaje: "Número de tarjeta inválido" };
    }
    return { valido: true, mensaje: "Tarjeta válida" };
}

// Validar Teléfono Móvil/Fijo Chileno
export function validarTelefono(telefono) {
    if (!telefono || telefono.trim() === '') {
        return { valido: false, mensaje: "El número de teléfono es requerido" };
    }
    const limpio = telefono.trim().replace(/\s+/g, '');
    const regexTel = /^(\+?56)?9?\d{8}$/;
    if (!regexTel.test(limpio) && limpio.length < 8) {
        return { valido: false, mensaje: "Ingrese un número válido (ej: +56 9 1234 5678 o 912345678)" };
    }
    return { valido: true, mensaje: "Teléfono válido" };
}

// Validar Texto Requerido
export function validarTexto(valor, nombreCampo = "Este campo", minLen = 2) {
    if (!valor || valor.trim() === '') {
        return { valido: false, mensaje: `${nombreCampo} es requerido` };
    }
    if (valor.trim().length < minLen) {
        return { valido: false, mensaje: `${nombreCampo} debe tener al menos ${minLen} caracteres` };
    }
    return { valido: true, mensaje: "Válido" };
}

// Validar Fecha de Reserva (Igual o posterior a la fecha actual)
export function validarFecha(fechaStr) {
    if (!fechaStr) {
        return { valido: false, mensaje: "La fecha es requerida" };
    }
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const fechaSeleccionada = new Date(fechaStr + 'T00:00:00');
    if (isNaN(fechaSeleccionada.getTime())) {
        return { valido: false, mensaje: "Formato de fecha inválido" };
    }
    if (fechaSeleccionada < hoy) {
        return { valido: false, mensaje: "La fecha debe ser igual o posterior a hoy" };
    }
    return { valido: true, mensaje: "Fecha válida" };
}

