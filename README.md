# 🚀 CMFlow — Le Cockpit Tout-en-Un pour Community Managers en Afrique Francophone

<p align="center">
  <strong>Gagnez 15h par mois sur la gestion multi-clients, la planification de contenu et la validation client sans mot de passe.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Status-Production%20Ready-success?style=for-the-badge" alt="Status">
  <img src="https://img.shields.io/badge/Stack-HTML5%20%7C%20CSS3%20%7C%20Vanilla%20JS-blue?style=for-the-badge" alt="Stack">
  <img src="https://img.shields.io/badge/Paiement-Wave%20%7C%20Orange%20Money%20%7C%20CB-orange?style=for-the-badge" alt="Paiement">
  <img src="https://img.shields.io/badge/Devise-FCFA%20(XOF)-darkgreen?style=for-the-badge" alt="Devise">
</p>

---

## 🌟 Pourquoi CMFlow ?

Les outils américains comme Hootsuite, Buffer ou Sprout Social coûtent plus de 60 000 FCFA/mois, exigent une carte bancaire internationale, et ne résolvent pas la plus grande douleur des Community Managers : **la validation des publications par les clients via WhatsApp**.

**CMFlow résout ce problème avec 3 piliers majeurs :**
1. **Portail de Validation Client en 1 Clic** : Un simple lien sans mot de passe envoyé au client pour valider ou demander des retouches.
2. **Calendrier Éditorial Multi-Clients & Mockup Live** : Planifiez sur Instagram, Facebook, TikTok, LinkedIn et X avec un simulateur visuel en direct.
3. **Générateur de Rapports PDF Mensuels** : Exportez des bilans d'activité A4 professionnels en 1 clic pour justifier votre valeur auprès de vos clients.

---

## 📱 Arborescence & Modules de l'Application

| Fichier | Description | Fonctionnalités clés |
| :--- | :--- | :--- |
| [`index.html`](index.html) | **Landing Page Marketing** | Présentation, calculatrice de ROI, grille tarifaire en FCFA (Wave/OM), modales d'inscription et de connexion. |
| [`onboarding.html`](onboarding.html) | **Wizard de Démarrage** | Parcours d'accueil en 3 étapes : profil, nombre de clients gérés, réseaux actifs et objectifs. |
| [`dashboard.html`](dashboard.html) | **Tableau de Bord Cockpit** | Vue synthétique des KPIs (clients, posts du mois, taux d'approbation), raccourcis et clients récents. |
| [`clients.html`](clients.html) | **CRM Multi-Marques** | Répertoire de clients, recherche instantanée par nom ou secteur, liens de validation directs et suppression. |
| [`planning.html`](planning.html) | **Planning & Calendrier** | Calendrier mensuel interactif, filtres multi-critères, modale de création avec prévisualisation Instagram Live. |
| [`validation.html`](validation.html) | **Portail Validation Client** | Vue publique autonome sans authentification pour approbation en 1 clic et demandes de modifications. |
| [`analytics.html`](analytics.html) | **Analytics & Bilans PDF** | Courbes de portée et interactions, répartition par réseau, podium top posts et export d'impression `@media print`. |
| [`settings.html`](settings.html) | **Paramètres & Profil** | Configuration du profil CM, nom de l'agence, réseaux par défaut, facturation Wave/Orange Money et sécurité. |

---

## ⚡ Architecture Technique

```text
SAAS CM FLOW/
├── index.html            # Landing page marketing & authentification
├── onboarding.html       # Assistant de bienvenue interactif
├── dashboard.html        # Cockpit central CM
├── clients.html          # CRM et gestionnaire multi-clients
├── planning.html         # Calendrier éditorial et programmateur
├── validation.html       # Portail client sécurisé (sans mot de passe)
├── analytics.html        # Module de statistiques & générateur PDF
├── settings.html         # Paramètres, profil agence et facturation
├── css/
│   ├── style.css         # Système de design global (tokens, typographie, thèmes)
│   └── dashboard.css     # Styles avancés (planning, mockup, portail, analytics, print)
└── js/
    ├── app.js            # Moteur applicatif, store, routeur, calendrier et filtres
    ├── backend.js        # Adaptateur Cloud Firebase & synchronisation temps réel
    └── script.js         # Moteur de conversion et authentification de la landing page
```

---

## 🛠️ Démarrage Local Rapide

Aucune installation complexe requise. Tout fonctionne en **Vanilla Web Standards (zéro dépendance lourde)** :

1. **Cloner le projet** :
   ```bash
   git clone https://github.com/sidiqq97/cmflow1.git
   cd cmflow1
   ```

2. **Lancer dans le navigateur** :
   - Ouvrez simplement `index.html` dans Google Chrome, Edge, Safari ou Firefox.
   - Ou lancez un serveur local léger :
     ```bash
     npx -y serve .
     ```

---

## 🚀 Roadmap V2

- [x] Portail client autonome sans mot de passe
- [x] Calendrier éditorial avec aperçu Instagram en direct
- [x] Générateur de rapports statistiques exportables en PDF
- [x] Module de paramètres et personnalisation d'agence
- [ ] Moteur de copywriting avec l'API Google Gemini gratuite
- [ ] Passerelle de paiement réelle Wave / Orange Money (PayTech / CinetPay)

---

## 📄 Licence & Droits

Propriété exclusive de **CMFlow Social Suite** — Développé pour les créateurs de contenu et Community Managers d'Afrique et d'ailleurs.
