import { useEffect, useRef, useState } from 'react';

// Estado, validación y envío de los formularios de reserva y contacto. validar() devuelve { campo: mensaje }
export function useFormulario(valoresIniciales, validar) {
  const [valores, setValores] = useState(valoresIniciales);
  const [errores, setErrores] = useState({});
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  const cambiar = (e) => {
    const { name, value } = e.target;
    setValores((prev) => ({ ...prev, [name]: value }));
    if (errores[name]) setErrores((prev) => ({ ...prev, [name]: undefined }));
  };

  const enviar = (alTerminar) => {
    const nuevosErrores = validar(valores);
    setErrores(nuevosErrores);
    if (Object.values(nuevosErrores).some(Boolean)) return;
    setEnviando(true);
    timer.current = setTimeout(() => {
      setEnviando(false);
      setEnviado(true);
      if (alTerminar) alTerminar();
    }, 1500);
  };

  return { valores, errores, enviando, enviado, cambiar, enviar };
}
