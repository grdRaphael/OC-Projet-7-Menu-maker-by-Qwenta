/**
 * ESSAI DE LA RÈGLE DU PRIX — MM-01, étape 4.
 *
 * Lancer :  npm run essai:prix
 *
 * Ce script joue le rôle du formulaire : il « tape » plusieurs prix et montre
 * ce que la règle 2 (priceEurosInputSchema) en fait. Il n'enregistre rien.
 * Pour essayer d'autres saisies, ajoutez-les simplement dans la liste ci-dessous.
 */
import { formatCents, priceEurosInputSchema } from '../src/index.ts';

// Les saisies à essayer, comme si un restaurateur les tapait dans le champ « Prix ».
const saisies = [
  '12,50', //       cas normal avec une virgule
  '12.50', //       avec un point : accepté aussi
  '12,5', //        un seul chiffre après la virgule : « 5 » vaut 50 centimes
  ' 8 € ', //       espaces et symbole € : ils sont ignorés
  '9999,99', //     le maximum autorisé
  '', //            champ vide
  '-3', //          prix négatif
  '0', //           zéro : refusé, le prix doit être supérieur à 0
  'douze', //       des lettres
  '12,505', //      trois chiffres après la virgule
  '10000', //       au-dessus du maximum
];

console.log('\nEssai de la règle du prix (saisie en euros → centimes)\n');

for (const saisie of saisies) {
  // safeParse ne « plante » jamais : il répond { success: true, data } ou { success: false, error }.
  const resultat = priceEurosInputSchema.safeParse(saisie);
  const affichage = `« ${saisie} »`.padEnd(12);

  if (resultat.success) {
    // resultat.data contient les centimes, prêts à être enregistrés.
    console.log(`✅ ${affichage} → ${resultat.data} centimes (affiché : ${formatCents(resultat.data)})`);
  } else {
    // On affiche le premier message d'erreur : c'est celui que verra le restaurateur.
    console.log(`❌ ${affichage} → ${resultat.error.issues[0]?.message}`);
  }
}

console.log('');
