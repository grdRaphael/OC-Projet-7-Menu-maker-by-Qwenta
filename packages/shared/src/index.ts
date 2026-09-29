// Point d'entrée des règles partagées (MM-01).
// L'interface et le serveur importeront tout depuis '@menu-maker/shared'.
export * from './rules/auth.ts'; //       e-mail, jeton du lien de connexion
export * from './rules/common.ts'; //     identifiant, texte simple
export * from './rules/errors.ts'; //     format unique des erreurs de l'API
export * from './rules/image.ts'; //      photos et logo : formats, 2 Mo
export * from './rules/menu.ts'; //       menu, catégorie, plat, règle « prêt »
export * from './rules/price.ts'; //      prix : euros saisis → centimes
export * from './rules/resources.ts'; //  forme des réponses de l'API
export * from './rules/restaurant.ts'; // profil du restaurant
export * from './rules/theme.ts'; //      police, couleur, mise en page, contraste
