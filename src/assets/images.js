// Importa todas las imágenes de assets/images. La clave es la ruta sin extensión: images['menu/Torta_Trufa']
const modulos = import.meta.glob('./images/**/*.{png,jpg,jpeg,webp,jfif,svg}', {
  eager: true,
  import: 'default'
});

const images = {};
for (const ruta in modulos) {
  const clave = ruta
    .replace('./images/', '')    // quitar la carpeta base
    .replace(/\.[^/.]+$/, '');   // quitar la extensión
  images[clave] = modulos[ruta];
}

export default images;

// Devuelve la URL de una imagen a partir de su clave o de una ruta guardada
export function obtenerImagen(ruta) {
  if (!ruta) return images['favicon_io/Logo_Papita_Dulce'];
  if (/^(data:|https?:|blob:)/.test(ruta)) return ruta;
  const clave = ruta
    .replace(/^(\.\.\/|\/)+/, '')
    .replace(/^(papitadulce\/img\/|assets\/images\/|img\/)/, '')
    .replace(/\.[^/.]+$/, '');
  return images[clave] || images[ruta] || ruta;
}
