// Stock de productos: vitrina (ya hechos) + lo que se puede preparar con los insumos
export const FACTOR_TROZO = 1 / 4; // un trozo es 1/4 de torta

const redondear = (n) => Math.round(n * 1000) / 1000;

// Porción de una línea del carrito (los carritos antiguos no guardan el factor, solo la variante)
export const factorDeItem = (item) => item.factor || (item.variante === 'trozo' ? FACTOR_TROZO : 1);

const tieneReceta = (producto) => Array.isArray(producto.receta) && producto.receta.length > 0;

// Unidades que se pueden preparar con los insumos (factor 1 = completa, 1/4 = trozo)
export function calcularPreparables(receta, insumos, factor = 1) {
  if (!Array.isArray(receta) || receta.length === 0) return 0;
  return Math.min(...receta.map(({ insumoId, cantidad }) => {
    const insumo = insumos.find((i) => i.id === insumoId);
    const porUnidad = Number(cantidad) * factor;
    if (!insumo || porUnidad <= 0) return insumo ? Infinity : 0;
    return Math.floor(redondear(insumo.stock / porUnidad));
  }));
}

export function stockVitrina(producto) {
  return Math.max(0, Number(producto.stock) || 0);
}

export function disponibleProducto(producto, insumos) {
  return stockVitrina(producto) + calcularPreparables(producto.receta, insumos);
}

export function esProductoCritico(producto, insumos) {
  return disponibleProducto(producto, insumos) <= (Number(producto.stockCritico) || 0);
}

// Cantidad que se puede vender de un producto en la presentación indicada
export function disponiblePorFactor(producto, insumos, factor = 1) {
  return factor === 1 ? disponibleProducto(producto, insumos) : calcularPreparables(producto.receta, insumos, factor);
}

// Descuenta una venta: las unidades completas salen primero de la vitrina y el resto se prepara
// con los insumos; los trozos siempre se preparan. items: [{ codigo, factor, cantidad, nombre }]
export function descontarVenta(productos, insumos, items) {
  const nuevosProductos = productos.map((p) => ({ ...p }));
  const nuevosInsumos = insumos.map((i) => ({ ...i }));

  for (const item of items) {
    const producto = nuevosProductos.find((p) => p.codigo === item.codigo);
    if (!producto) continue;
    const factor = factorDeItem(item);
    let porPreparar = item.cantidad;

    if (factor === 1) {
      const desdeVitrina = Math.min(stockVitrina(producto), porPreparar);
      producto.stock = stockVitrina(producto) - desdeVitrina;
      porPreparar -= desdeVitrina;
    }
    if (porPreparar <= 0) continue;

    if (!tieneReceta(producto) || calcularPreparables(producto.receta, nuevosInsumos, factor) < porPreparar) {
      return { ok: false, faltante: item.nombre || producto.nombre };
    }
    producto.receta.forEach(({ insumoId, cantidad }) => {
      const insumo = nuevosInsumos.find((i) => i.id === insumoId);
      insumo.stock = Math.max(0, redondear(insumo.stock - Number(cantidad) * factor * porPreparar));
    });
  }
  return { ok: true, productos: nuevosProductos, insumos: nuevosInsumos };
}

// Cuántas unidades más se pueden agregar de un producto, considerando lo que ya está en el carrito
export function maximoAgregable(producto, factor, carrito, productos, insumos) {
  if (!producto) return Infinity;
  const resultado = descontarVenta(productos, insumos, carrito);
  if (!resultado.ok) return 0;
  const restante = resultado.productos.find((p) => p.codigo === producto.codigo) || producto;
  return disponiblePorFactor(restante, resultado.insumos, factor);
}
