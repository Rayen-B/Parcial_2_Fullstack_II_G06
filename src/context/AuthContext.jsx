import React, { createContext, useContext, useState, useEffect } from 'react';
import { obtenerSesionActiva, guardarSesionActiva, obtenerUsuarios, guardarUsuarios } from '../services/storage';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(() => obtenerSesionActiva());
  const [usuariosDB, setUsuariosDB] = useState(() => obtenerUsuarios());
  const [mostrarModalAuth, setMostrarModalAuth] = useState(false);

  useEffect(() => {
    guardarSesionActiva(usuario);
  }, [usuario]);

  useEffect(() => {
    guardarUsuarios(usuariosDB);
  }, [usuariosDB]);

  const iniciarSesion = (correo, password) => {
    const correoNormalizado = String(correo || '').trim().toLowerCase();
    const usr = usuariosDB.find(
      (u) => u.correo.toLowerCase() === correoNormalizado && u.password === password
    );
    if (usr) {
      setUsuario(usr);
      return { exito: true, usuario: usr };
    }
    return { exito: false, mensaje: "Correo o contraseña incorrectos." };
  };

  // Recuperación de contraseña: verifica que el correo esté registrado
  const solicitarRecuperacion = (correo) => {
    const correoNormalizado = String(correo || '').trim().toLowerCase();
    const usr = usuariosDB.find((u) => u.correo.toLowerCase() === correoNormalizado);
    if (!usr) {
      return { exito: false, mensaje: 'No encontramos una cuenta con ese correo.' };
    }
    return {
      exito: true,
      mensaje: 'Se enviara un correo a '+  usr.correo 
    };
  };

  const cerrarSesion = () => {
    setUsuario(null);
  };

  // "Probar Rol": cambia el rol del usuario con sesión iniciada

  const cambiarRolActivo = (nuevoRol) => {
    setUsuario((actual) => (actual ? { ...actual, rol: nuevoRol } : actual));
  };

  // Registra un cliente nuevo (no inicia sesión automáticamente)
  const registrarUsuario = (nuevoUsr) => {
    const correo = String(nuevoUsr.correo || '').trim().toLowerCase();
    if (!correo || !nuevoUsr.password || !nuevoUsr.nombre) {
      return { exito: false, mensaje: 'Completa todos los campos obligatorios.' };
    }
    if (usuariosDB.some((u) => u.correo.toLowerCase() === correo)) {
      return { exito: false, mensaje: 'Ya existe una cuenta registrada con ese correo.' };
    }
    if (nuevoUsr.run && usuariosDB.some((u) => u.run && u.run.toUpperCase() === nuevoUsr.run.toUpperCase())) {
      return { exito: false, mensaje: 'El RUN ingresado ya se encuentra registrado.' };
    }
    const usuarioCompleto = { ...nuevoUsr, correo, nombre: nuevoUsr.nombre.trim(), rol: nuevoUsr.rol || 'Cliente' };
    setUsuariosDB([...usuariosDB, usuarioCompleto]);
    return { exito: true, usuario: usuarioCompleto, mensaje: 'Cuenta creada correctamente. Ya puedes iniciar sesión.' };
  };

  return (
    <AuthContext.Provider
      value={{
        usuario,
        usuariosDB,
        setUsuariosDB,
        iniciarSesion,
        cerrarSesion,
        cambiarRolActivo,
        registrarUsuario,
        solicitarRecuperacion,
        mostrarModalAuth,
        setMostrarModalAuth
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
