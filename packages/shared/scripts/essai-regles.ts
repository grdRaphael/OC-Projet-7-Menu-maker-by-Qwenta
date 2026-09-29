/**
 * ESSAI DE TOUTES LES RÈGLES — MM-01, sous-tâche 1.
 *
 * Lancer :  npm run essai:regles
 *
 * Pour chaque donnée (e-mail, plat, catégorie…), on essaie des valeurs
 * correctes et incorrectes, et on affiche le résultat ou les messages
 * d'erreur, exactement comme l'interface les montrera. Rien n'est enregistré.
 */
import type { z } from 'zod';
import {
  categorySchema,
  checkImageFile,
  contrastRatio,
  DISH_PHOTO_MAX_BYTES,
  dishFormSchema,
  dishSchema,
  emailSchema,
  menuReadinessProblems,
  menuSchema,
  menuThemeSchema,
  MIN_TEXT_CONTRAST,
  restaurantProfileSchema,
} from '../src/index.ts';

/** Affiche une valeur de façon compacte sur une ligne (les textes très longs sont abrégés). */
const show = (value: unknown) =>
  JSON.stringify(value, (_key, v: unknown) =>
    typeof v === 'string' && v.length > 40 ? `${v.slice(0, 12)}… (${v.length} caractères)` : v,
  );

/**
 * Essaie une règle Zod sur plusieurs valeurs.
 * Pour une erreur, on affiche chaque champ fautif et son message
 * (c'est ce qui permettra d'afficher l'erreur SOUS le bon champ du formulaire).
 */
function essayer(titre: string, regle: z.ZodType, valeurs: unknown[]): void {
  console.log(`\n■ ${titre}`);
  for (const valeur of valeurs) {
    const resultat = regle.safeParse(valeur);
    if (resultat.success) {
      console.log(`  ✅ ${show(valeur)}\n       → enregistré comme ${show(resultat.data)}`);
    } else {
      console.log(`  ❌ ${show(valeur)}`);
      for (const issue of resultat.error.issues) {
        const champ = issue.path.length > 0 ? issue.path.join('.') : '(valeur)';
        console.log(`       ${champ} : ${issue.message}`);
      }
    }
  }
}

console.log('Essai des règles des données (MM-01)');

essayer('Adresse e-mail', emailSchema, ['  Chef@Restaurant.FR ', 'chef@', '']);

essayer('Plat enregistré (prix en centimes)', dishSchema, [
  { name: ' Moussaka ', priceCents: 1450 }, // description et photo absentes : valeurs par défaut
  { name: '', priceCents: -5 }, // deux erreurs en même temps
  { name: 'Baklava', priceCents: 5.5, description: 'x'.repeat(301) },
]);

essayer('Plat saisi dans le formulaire (prix en euros)', dishFormSchema, [
  { name: 'Souvlaki', description: 'Pita, tzatziki', price: '9,50' },
  { name: 'Souvlaki', description: '', price: 'neuf euros' },
]);

essayer('Catégorie', categorySchema, [{ name: 'Desserts' }, { name: '   ' }, { name: 'x'.repeat(61) }]);

essayer('Thème du menu', menuThemeSchema, [
  { fontKey: 'georgia', color: '#1f3a5f', layoutKey: 'deux-colonnes' },
  { fontKey: 'comic-sans', color: 'rouge', layoutKey: 'trois-colonnes' },
]);

essayer('Menu', menuSchema, [
  { fontKey: 'epilogue', color: '#000000', layoutKey: 'une-colonne' }, // sans nom : autorisé
  { name: 'Carte du soir', status: 'publié', fontKey: 'epilogue', color: '#000000', layoutKey: 'une-colonne' },
]);

essayer('Profil du restaurant', restaurantProfileSchema, [{ name: 'La Petite Taverne' }, { name: '' }]);

// ---------- Règles qui ne sont pas des schémas Zod ----------

console.log('\n■ Photo de plat (contrôle dans le navigateur)');
for (const fichier of [
  { nom: 'moussaka.jpg', size: 800_000, type: 'image/jpeg' },
  { nom: 'photo-geante.png', size: DISH_PHOTO_MAX_BYTES + 1, type: 'image/png' },
  { nom: 'animation.gif', size: 50_000, type: 'image/gif' },
]) {
  const verdict = checkImageFile(fichier);
  console.log(`  ${verdict.ok ? '✅' : '❌'} ${fichier.nom}${verdict.ok ? '' : ` → ${verdict.message}`}`);
}

console.log('\n■ Règle « prêt » (un brouillon peut être incomplet)');
const menusEssai: [string, { categories: { name: string; dishes: unknown[] }[] }][] = [
  ['menu vide', { categories: [] }],
  ['une catégorie sans plat', { categories: [{ name: 'Desserts', dishes: [] }] }],
  ['complet', { categories: [{ name: 'Desserts', dishes: [{ name: 'Baklava' }] }] }],
];
for (const [description, menu] of menusEssai) {
  const problemes = menuReadinessProblems(menu);
  const titre = problemes.length === 0 ? '✅ prêt' : '❌ pas prêt';
  console.log(`  ${titre} (${description})${problemes.map((p) => `\n       ${p}`).join('')}`);
}

console.log('\n■ Contraste de la couleur choisie sur la feuille blanche (seuil 4,5)');
for (const couleur of ['#000000', '#1F3A5F', '#8BC7B1']) {
  const ratio = contrastRatio(couleur, '#FFFFFF');
  const verdict = ratio >= MIN_TEXT_CONTRAST ? '✅ lisible' : '⚠️  trop pâle, avertir le restaurateur';
  console.log(`  ${couleur} → ${ratio.toFixed(1).replace('.', ',')} : ${verdict}`);
}

console.log('');
