import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import Boton from '../ejemplos-documentacion/Boton';
import Home from '../ejemplos-documentacion/Home';
import About from '../ejemplos-documentacion/About';

// ---- Diapositivas 15 a 22 de "React IV – Pruebas Unitarias" ----

describe('Boton', () => {
  it('muestra el texto correcto', () => {
    render(<Boton texto="Enviar" />);
    expect(screen.getByText('Enviar')).toBeTruthy();
  });

  it('no muestra un texto distinto al recibido', () => {
    render(<Boton texto="Enviar" />);
    expect(screen.queryByText('Cancelar')).toBeNull();
  });

  it('se renderiza como un botón', () => {
    render(<Boton texto="Enviar" />);
    expect(screen.getByRole('button', { name: 'Enviar' })).toBeTruthy();
  });
});

describe('Home', () => {
  it('muestra el título y el link a About', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );
    expect(screen.getByText('Inicio')).toBeTruthy();
    expect(screen.getByRole('link', { name: /about/i })).toBeTruthy();
  });

  it('el link apunta a la ruta /about', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );
    expect(screen.getByRole('link', { name: /about/i }).getAttribute('href')).toBe('/about');
  });
});

describe('Router básico', () => {
  it('renderiza la ruta correcta', () => {
    render(
      <MemoryRouter initialEntries={['/about']}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByText('Página About')).toBeTruthy();
  });

  it('en la ruta / se muestra Home y no About', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByText('Inicio')).toBeTruthy();
    expect(screen.queryByText('Página About')).toBeNull();
  });

  it('una ruta que no existe no renderiza ninguna página', () => {
    render(
      <MemoryRouter initialEntries={['/no-existe']}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.queryByText('Inicio')).toBeNull();
    expect(screen.queryByText('Página About')).toBeNull();
  });
});
