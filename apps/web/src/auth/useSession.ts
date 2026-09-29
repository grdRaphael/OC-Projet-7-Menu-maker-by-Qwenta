import { useCallback, useEffect, useState } from 'react';

/**
 * « QUI EST CONNECTÉ ? » — MM-02, sous-tâche 1.
 *
 * Demande au serveur : GET /api/v1/me (route décrite dans le contrat).
 * Quatre situations possibles :
 *   - loading      : la question est posée, on attend la réponse ;
 *   - connected    : le serveur a répondu 200, avec le compte ;
 *   - disconnected : le serveur a répondu 401, personne n'est connecté ;
 *   - unavailable  : pas de réponse exploitable (serveur arrêté, réseau…).
 *
 * « unavailable » est séparé de « disconnected » exprès : si le serveur est en
 * panne, on ne fait pas croire au restaurateur qu'il a été déconnecté.
 *
 * Plus tard (données distantes), cette logique passera par TanStack Query,
 * qui ajoute le cache et les nouvelles tentatives ; le principe restera le même.
 */
export type Session =
  | { status: 'loading' }
  | { status: 'connected'; email: string }
  | { status: 'disconnected' }
  | { status: 'unavailable'; message: string };

export function useSession(): Session & { retry: () => void } {
  const [session, setSession] = useState<Session>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0); // augmenter ce compteur relance la demande

  useEffect(() => {
    let cancelled = false; // si la page change pendant l'attente, on ignore la réponse
    fetch('/api/v1/me', { credentials: 'same-origin' })
      .then(async (response) => {
        if (cancelled) return;
        if (response.status === 401) return setSession({ status: 'disconnected' });
        // 502, 503, 504 : un intermédiaire (le proxy de Vite, plus tard l'hébergeur)
        // signale que le serveur est injoignable ou trop lent.
        if ([502, 503, 504].includes(response.status)) {
          return setSession({ status: 'unavailable', message: 'Le serveur ne répond pas.' });
        }
        if (!response.ok) {
          return setSession({ status: 'unavailable', message: `Le serveur a répondu une erreur (${response.status}).` });
        }
        const me = (await response.json()) as { user: { email: string } };
        setSession({ status: 'connected', email: me.user.email });
      })
      .catch(() => {
        if (!cancelled) setSession({ status: 'unavailable', message: 'Le serveur ne répond pas.' });
      });
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  const retry = useCallback(() => {
    setSession({ status: 'loading' });
    setAttempt((n) => n + 1);
  }, []);

  return { ...session, retry };
}
