import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import AppEjemplo from '../ejemplos-documentacion/AppEjemplo';
import Header, { Footer } from '../ejemplos-documentacion/Header';

// ---- "React II – React Router + Bootstrap" (diapositivas 9, 10, 13 y 14) ----

describe('Exportaciones de Header.jsx (default + auxiliar)', () => {
  it('Header se importa como export default', () => {
    expect(Header).toBeDefined();
    expect(typeof Header).toBe('function');
  });

  it('Footer se importa como export nombrado', () => {
    expect(Footer).toBeDefined();
    expect(typeof Footer).toBe('function');
  });
});

describe('Header', () => {
  it('muestra los tres enlaces de navegación', () => {
    render(<MemoryRouter><Header /></MemoryRouter>);
    expect(screen.getByRole('link', { name: 'Inicio' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Acerca' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Contacto' })).toBeTruthy();
  });

  it('usa clases de Bootstrap con className (no class)', () => {
    const { container } = render(<MemoryRouter><Header /></MemoryRouter>);
    expect(container.querySelector('nav').className).toContain('navbar');
  });

  it('los enlaces apuntan a las rutas correctas', () => {
    render(<MemoryRouter><Header /></MemoryRouter>);
    expect(screen.getByRole('link', { name: 'Acerca' }).getAttribute('href')).toBe('/about');
    expect(screen.getByRole('link', { name: 'Contacto' }).getAttribute('href')).toBe('/contact');
  });
});

describe('App con Header y Footer compartidos', () => {
  it('en / muestra Home con Header y Footer', () => {
    render(<MemoryRouter initialEntries={['/']}><AppEjemplo /></MemoryRouter>);
    expect(screen.getByText('Mi Sitio')).toBeTruthy();
    expect(screen.getByText('Inicio', { selector: 'h1' })).toBeTruthy();
    expect(screen.getByText('Pie de página')).toBeTruthy();
  });

  it('en /contact muestra Contact y mantiene Header y Footer', () => {
    render(<MemoryRouter initialEntries={['/contact']}><AppEjemplo /></MemoryRouter>);
    expect(screen.getByText('Página Contact')).toBeTruthy();
    expect(screen.getByText('Mi Sitio')).toBeTruthy();
    expect(screen.getByText('Pie de página')).toBeTruthy();
  });

  it('al hacer clic en "Acerca" cambia el contenido central sin recargar', () => {
    render(<MemoryRouter initialEntries={['/']}><AppEjemplo /></MemoryRouter>);
    fireEvent.click(screen.getByRole('link', { name: 'Acerca' }));
    expect(screen.getByText('Página About')).toBeTruthy();
    expect(screen.queryByText('Página Contact')).toBeNull();
    expect(screen.getByText('Pie de página')).toBeTruthy();
  });
});
