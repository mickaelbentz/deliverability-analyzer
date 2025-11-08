# Email Deliverability Checker

Un analyseur complet pour vérifier la qualité et la déliverabilité de vos emails HTML.

## Démo

**[Essayer l'application](https://mickaelbentz.github.io/deliverabiliy-analyzer/)**

## Fonctionnalités

### Analyse complète sur 5 catégories

1. **Structure HTML** (6 critères)
   - Validation DOCTYPE et balises essentielles
   - Utilisation de tableaux (standard emails)
   - CSS inline vs CSS externe
   - Largeur optimale (600-650px)

2. **Contenu et Spam** (5 critères)
   - Détection de 25+ mots spam
   - Ratio texte/HTML optimal
   - Utilisation excessive de majuscules
   - Points d'exclamation
   - Longueur du contenu

3. **Images et Médias** (4 critères)
   - Attributs alt sur toutes les images
   - Dimensions spécifiées (width/height)
   - Nombre d'images approprié
   - Hébergement des images (URLs absolues)

4. **Liens et CTA** (4 critères)
   - Protocole HTTPS sécurisé
   - Nombre de liens optimal
   - Lien de désinscription obligatoire
   - Texte descriptif des liens

5. **Performance** (4 critères)
   - Taille du fichier (<100KB recommandé)
   - Nombre de requêtes externes
   - Absence de JavaScript
   - Absence de formulaires

### Système de notation

- **Score global sur 100** avec indicateur visuel
- **23 critères analysés** au total
- **Recommandations prioritaires** classées par importance (High/Medium/Low)
- **Explications détaillées** pour chaque vérification

## Utilisation

1. Ouvrez l'application
2. Glissez-déposez votre fichier HTML d'email ou cliquez pour parcourir
3. Cliquez sur "Analyser"
4. Consultez votre score et les recommandations

## Technologies

- **HTML5** - Structure
- **CSS3** - Design moderne et responsive
- **JavaScript Vanilla** - Analyse côté client (aucune donnée envoyée à un serveur)

## Confidentialité

L'application fonctionne **100% côté client**. Vos emails ne sont jamais envoyés à un serveur externe. Toute l'analyse se fait localement dans votre navigateur.

## Installation locale

```bash
git clone https://github.com/mickaelbentz/deliverabiliy-analyzer.git
cd deliverabiliy-analyzer
open index.html
```

## Bonnes pratiques emails

Quelques rappels pour optimiser la déliverabilité :

- ✅ Utilisez des tableaux pour la mise en page
- ✅ CSS inline plutôt qu'externe
- ✅ Ajoutez des attributs alt sur toutes les images
- ✅ Hébergez les images en ligne (pas de pièces jointes)
- ✅ Largeur max 600-650px
- ✅ Incluez toujours un lien de désinscription
- ✅ Ratio texte/HTML > 20%
- ✅ Évitez les mots spam
- ✅ Utilisez HTTPS pour tous les liens
- ✅ Gardez le fichier < 100KB

## Licence

MIT

## Auteur

Mickaël Bentz
