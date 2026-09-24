# Portfolio — Jérémie Masikoti

Code source du site portfolio de **Jérémie Masikoti**, ingénieur en informatique (IA & Data Science) à Kinshasa.

🌐 **Site en ligne : [jeremie-masikoti.netlify.app](https://jeremie-masikoti.netlify.app)**

Site statique, sans framework ni dépendance : HTML, CSS et JavaScript.

## Fonctionnalités

- Mise en page responsive (téléphone, tablette, ordinateur) avec menu mobile
- Thème clair et sombre automatique, selon les réglages de l'appareil
- Animations JavaScript sur canvas : réseau de neurones, démonstration de détection de texte généré par IA, miniatures animées des projets
- Page dédiée à l'article scientifique, avec les balises lues par Google Scholar
- Référencement : données structurées schema.org (`Person`, `ScholarlyArticle`), `sitemap.xml`, `robots.txt` et `llms.txt` pour les assistants IA

## Structure

```
index.html                                  page principale
css/style.css                               styles (couleurs, mise en page, responsive)
js/script.js                                animations et interactions
articles/detection-segments-generes-ia/     page de l'article
sitemap.xml · robots.txt · llms.txt         référencement
```

## Voir le site en local

```bash
python -m http.server 8000
```

Puis ouvrir http://localhost:8000

## Déploiement

Le site est hébergé sur Netlify :

```bash
npx netlify-cli deploy --prod --dir .
```

## Auteur

**Jérémie Masikoti** · [LinkedIn](https://www.linkedin.com/in/j%C3%A9r%C3%A9mie-masikoti-41a917293/) · [ORCID](https://orcid.org/0009-0005-4453-9758) · [GitHub](https://github.com/Vermoge)
