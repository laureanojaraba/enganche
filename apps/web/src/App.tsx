import { useEffect, useState } from 'react';
import { apiResponse, HealthStatus } from '@ladiez/shared';

type State = { kind: 'loading' } | { kind: 'ok'; health: HealthStatus } | { kind: 'error' };

// Pantalla provisional de HU-001: comprueba que la web llega a la API por el proxy.
// Los textos pasarán a i18n en HU-021.
export function App() {
  const [state, setState] = useState<State>({ kind: 'loading' });

  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/health', { signal: controller.signal })
      .then((res) => res.json())
      .then((json) => setState({ kind: 'ok', health: apiResponse(HealthStatus).parse(json).data }))
      .catch((err) => {
        if (!controller.signal.aborted) setState({ kind: 'error' });
        return err;
      });
    return () => controller.abort();
  }, []);

  return (
    <main>
      <h1>ladiez</h1>
      {state.kind === 'loading' && <p>API: comprobando…</p>}
      {state.kind === 'ok' && (
        <p>
          API: {state.health.status} · reloj {state.health.clockMode} · v{state.health.version}
        </p>
      )}
      {state.kind === 'error' && <p role="alert">API: sin conexión</p>}
    </main>
  );
}
