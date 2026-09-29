import { useState } from 'react';
import { Button } from '../components/Button.tsx';
import { Modal } from '../components/Modal.tsx';

/**
 * VITRINE DES COMPOSANTS — MM-02, sous-tâche 3.
 * Adresse : /composants, disponible UNIQUEMENT en développement (voir routes.tsx).
 * Elle sert à essayer à la main le bouton et la modale, notamment au clavier.
 */
export function ComponentsDemo() {
  const [open, setOpen] = useState(false); //       la modale est-elle ouverte ?
  const [loading, setLoading] = useState(false); // le bouton « 2 secondes » est-il en cours ?

  return (
    <main style={{ maxWidth: 900, margin: '0 auto', padding: 48 }}>
      <h1>Composants de base</h1>
      <p>Page de développement : essayez chaque élément à la souris, puis uniquement au clavier (Tab, Entrée, Échap).</p>

      <h2>Boutons</h2>
      <p style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <Button>Principal</Button>
        <Button variant="secondary">Secondaire</Button>
        <Button variant="ghost">Discret</Button>
        <Button variant="danger">Supprimer</Button>
        <Button
          loading={loading}
          onClick={() => {
            // Simule une action de 2 secondes (un enregistrement, par exemple).
            setLoading(true);
            setTimeout(() => setLoading(false), 2000);
          }}
        >
          {loading ? 'Enregistrement…' : 'Action de 2 secondes'}
        </Button>
      </p>

      <h2>Modale</h2>
      <Button onClick={() => setOpen(true)}>Ouvrir la modale</Button>
      <Modal
        open={open}
        onOpenChange={setOpen}
        title="Ajouter une catégorie"
        description="Exemple de modale (Radix Dialog)."
      >
        <p>Tabulez : le focus reste dans la fenêtre. Échap la ferme et le focus revient sur « Ouvrir la modale ».</p>
        <Button onClick={() => setOpen(false)}>Valider</Button>
      </Modal>
    </main>
  );
}
