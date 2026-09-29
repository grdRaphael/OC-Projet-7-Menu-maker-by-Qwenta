import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

/**
 * VITE — l'outil qui fait tourner l'interface pendant le développement.
 * Il traduit TypeScript et JSX pour le navigateur, et recharge la page
 * automatiquement à chaque fichier enregistré.
 *
 * Adresse : http://localhost:5180 (port choisi pour ne pas gêner l'ancienne
 * version, qui utilise 5173).
 */
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5180,
    strictPort: true, // si le port est pris, on préfère une erreur claire à un autre port au hasard
    // « Proxy » : chaque appel à /api/... sera transmis au serveur Fastify
    // (port 3100, créé dans MM-03). Pour le navigateur, interface et API ont
    // ainsi la même adresse, ce qui simplifie le cookie de connexion.
    proxy: { '/api': 'http://127.0.0.1:3100' },
  },
});
