import { render, screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { App } from '../src/App';
import { server } from './msw';

describe('App', () => {
  it('HU-001 AC1 shows the API status through the proxy', async () => {
    render(<App />);
    expect(await screen.findByText(/API: ok/)).toBeInTheDocument();
    expect(screen.getByText(/simulated/)).toBeInTheDocument();
  });

  it('shows an error when the API is unreachable', async () => {
    server.use(http.get('*/api/health', () => HttpResponse.error()));
    render(<App />);
    expect(await screen.findByText(/API: sin conexión/)).toBeInTheDocument();
  });
});
