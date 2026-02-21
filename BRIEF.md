# Brief projet – Recherche de décès en France

## 1. Objectif du projet

- Construire une application web de recherche de décès en France, similaire à **deces.en.france**, destinée à servir de vrai projet utile + portfolio technique.[file:1]  
- Utiliser en priorité l’**API publique matchID** (décès INSEE) pour éviter d’héberger soi‑même les ~25–28 millions d’enregistrements dès le début.[file:1]  
- Pouvoir ensuite faire évoluer le projet vers des solutions plus lourdes (import MySQL, recherche FULLTEXT, etc.) pour monter en compétence et enrichir le portfolio.[file:1]  

## 2. Contexte données et API matchID

- matchID expose les données de décès INSEE depuis 1970, avec mise à jour mensuelle.[file:1]  
- L’API permet la recherche par nom, prénom, date et lieu de naissance, ainsi que d’autres critères, avec fuzzy matching / tolérance aux fautes.[file:1]  
- L’API est publique et gratuite, avec possibilité d’augmenter les quotas via un token, et le projet est open‑source sur GitHub.[file:1]  

## 3. Hébergement : O2switch (Offre Unique Cloud + 8 lunes)

- Offre utilisée : **Offre Unique Cloud O2switch** avec 8 « lunes » (multi‑environnements) pour environ 26,78 € TTC les 12 mois la première année.[file:1]  
- Chaque lune dispose de ressources importantes (threads CPU, RAM, stockage NVMe), ce qui permet d’héberger plusieurs applis (PHP, Node, etc.) de façon isolée.[file:1]  
- Technologies supportées sur O2switch :  
  - PHP (plusieurs versions, dont PHP 8.3), Laravel, Symfony, WordPress, etc.[file:1]  
  - Node.js (via Phusion Passenger / outil “Node.js App” dans cPanel), avec npm/yarn disponibles en SSH.[file:1]  
  - Python (Flask, Django) et Ruby on Rails.[file:1]  
  - MySQL/MariaDB illimités, PostgreSQL également disponible, accès distant possible.[file:1]  
- Limitations importantes :  
  - Pas d’Elasticsearch / OpenSearch (trop gourmands en RAM, besoin de root).[file:1]  
  - Pas de Docker ni de gros services persistants type Redis/Kafka/RabbitMQ.[file:1]  
  - Ressources partagées : il faut éviter les process Node trop gourmands / WebSockets massifs.[file:1]  

## 4. Approches techniques envisagées

Trois grandes approches ont été discutées :[file:1]  

1. **Wrapper simple de l’API matchID (Option 1)**  
   - Tu crées une interface web propre qui appelle l’API matchID, sans stocker localement les 25–28 M de lignes.[file:1]  
   - Avantages : mise en ligne très rapide, zéro import massif, parfait pour avoir quelque chose d’utile/visible dès le début.[file:1]  

2. **Approche hybride (Option 2)**  
   - Utiliser matchID pour la recherche, mais ajouter ta propre base (MySQL) pour la valeur ajoutée : stats, graphiques, favoris, exports, alertes, etc.[file:1]  
   - L’appli devient plus qu’un simple clone de deces.matchid.io.[file:1]  

3. **Auto‑hébergement complet (Option 3)**  
   - Importer l’ensemble des données INSEE dans une base MySQL chez O2switch, et implémenter ta propre recherche FULLTEXT.[file:1]  
   - Intéressant pour le portfolio technique (gros volume de données, indexation, perfs), mais plus lourd à mettre en place et à maintenir.[file:1]  

## 5. Stack choisie actuellement : Option 1 (wrapper matchID en Node.js/Express)

On a décidé de commencer **concrètement** par l’Option 1, pour avoir vite quelque chose en ligne.[file:1]  

- Backend :  
  - **Node.js + Express** tournant sur O2switch via Passenger.[file:1]  
  - Rôle principal : agir comme **proxy** entre le frontend et l’API matchID, en gérant les requêtes de recherche côté serveur.[file:1]  
  - Client HTTP : **node-fetch@2** au lieu d’axios (plus léger, compatible CommonJS, moins de surface de vulnérabilité).[file:1]  

- Frontend :  
  - **HTML/CSS/JS statiques** servis depuis un dossier `public/` (ou équivalent).[file:1]  
  - Initialement, EJS avait été envisagé, mais **abandonné** à cause de vulnérabilités dans la chaîne de dépendances (minimatch/filelist/jake) détectées par `npm audit`.[file:1]  
  - Les vues seront de simples fichiers `index.html` et `detail.html` avec du JavaScript côté client pour appeler ton backend (routes `/search`, `/personne/:id`, etc.).[file:1]  

- Environnement de dev :  
  - Tu travailles en local avec **VS Code + terminal**, Node installé, et tu déploies ensuite sur O2switch (via Git ou FTP + SSH).[file:1]  
  - Tu n’as pas encore de nom de domaine perso ; on part sur un sous‑domaine O2switch pour commencer.[file:1]  

## 6. Plan global (progressif)

Le plan de progression discuté :[file:1]  

1. **Option 1 – Wrapper matchID (Jour 1–2)**  
   - Site fonctionnel très rapide en s’appuyant uniquement sur l’API matchID, sans base de données locale.[file:1]  
   - Objectif : avoir quelque chose **en ligne** très vite pour te motiver.[file:1]  

2. **Option 2 – Hybride (Semaine 2)**  
   - Ajouter ta propre base MySQL pour les fonctionnalités avancées (stats, favoris, exports, etc.) tout en continuant d’utiliser matchID pour la recherche brute.[file:1]  

3. **Option 3 – Auto‑hébergé complet (Semaine 3–4)**  
   - Importer les CSV INSEE dans ta base MySQL chez O2switch (des millions de lignes), mettre en place FULLTEXT, optimiser les index et les requêtes.[file:1]  

## 7. État d’avancement actuel

À l’instant où on a décidé de créer ce BRIEF.md, on en était là :[file:1]  

- Choix validé : **Option 1 wrapper matchID** en Node.js/Express + frontend HTML/JS statique.[file:1]  
- Nettoyage des dépendances :  
  - `ejs` et `axios` ont été désinstallés pour éviter les vulnérabilités remontées par `npm audit`.[file:1]  
  - Installation de `node-fetch@2` comme unique client HTTP côté serveur.[file:1]  
- Architecture cible immédiate :  
  - Un serveur Express minimal (`server.js`) qui :  
    - sert les fichiers statiques du dossier `public/` ;[file:1]  
    - expose une route `/search` qui appelle l’API matchID ;[file:1]  
    - expose une route `/personne/:id` pour récupérer le détail d’un enregistrement via matchID.[file:1]  
- Prochaine étape demandée :  
  - Générer tous les fichiers manquants dans cet ordre :  
    1. `.gitignore`  
    2. `.env`  
    3. `server.js`  
    4. `index.html`  
    5. `detail.html`  
    6. `public/css/style.css`  
    7. `public/js/search.js`  
    8. `public/js/detail.js`[file:1]  
  - Tester en local (`node server.js`, puis http://localhost:3000) avant de passer au déploiement sur O2switch.[file:1]  

## 8. Comment utiliser ce brief dans une nouvelle conversation

Quand tu démarres une nouvelle conversation avec l’IA :[file:1]  

1. Colle **intégralement** ce BRIEF.md au début.[file:1]  
2. Ajoute une phrase du type :  
   > « Voici le brief de mon projet. On repart sur l’Option 1 (wrapper matchID en Node/Express). Génère-moi maintenant tous les fichiers manquants dans l’ordre indiqué puis aide-moi à les tester en local. »[file:1]  
3. L’IA pourra reprendre directement à l’étape de génération des fichiers (`.gitignore`, `.env`, `server.js`, `index.html`, etc.), sans que tu aies à réexpliquer tout le contexte.[file:1]
