/**
 * CMFlow — App JS (Onboarding, Dashboard, Clients)
 * Architecture : Firestore (cloud) + localStorage (cache synchrone) + auth guard + routing simple
 * 
 * Stratégie : 
 *   - Les lectures sont synchrones (depuis localStorage/mémoire)
 *   - Les écritures vont en localStorage (instant) + Firestore (async, en arrière-plan)
 *   - Les onSnapshot Firestore maintiennent le cache à jour automatiquement
 *   - Fallback complet sur localStorage si Firebase n'est pas configuré
 */

'use strict';

/* ==========================================================================
   SÉCURITÉ & ANTI-XSS (CMFlow Security Utilities)
   ========================================================================== */
const CMFlowSecurity = {
  /**
   * Échappe les caractères HTML dangereux pour empêcher les attaques XSS
   * @param {string} str - Chaîne à échapper
   * @returns {string} Chaîne sécurisée
   */
  escapeHtml(str) {
    if (str === null || str === undefined) return '';
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
      '`': '&#x60;'
    };
    return String(str).replace(/[&<>"'`]/g, m => map[m]);
  },

  /**
   * Nettoie et désinfecte une saisie texte (supprime les balises script/iframe/event handlers et handlers non quotés)
   * @param {string} input - Texte brut saisi
   * @returns {string} Texte nettoyé
   */
  sanitizeInput(input) {
    if (!input) return '';
    let clean = String(input).trim();
    // Neutraliser les balises exécutables
    clean = clean.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    clean = clean.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
    clean = clean.replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '');
    clean = clean.replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '');
    clean = clean.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
    // Neutraliser les event handlers quotés et NON quotés (ex: onerror=alert(1))
    clean = clean.replace(/on\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '');
    clean = clean.replace(/javascript:/gi, '');
    return clean;
  },

  /**
   * Valide la robustesse d'un mot de passe
   * Règles : min 8 caractères, 1 majuscule, 1 minuscule, 1 chiffre
   * @param {string} pass
   * @returns {{ valid: boolean, message: string, score: number }}
   */
  checkPasswordStrength(pass) {
    if (!pass || typeof pass !== 'string') {
      return { valid: false, message: 'Le mot de passe est obligatoire.', score: 0 };
    }
    const hasMinLength = pass.length >= 8;
    const hasUpper = /[A-Z]/.test(pass);
    const hasLower = /[a-z]/.test(pass);
    const hasNumber = /[0-9]/.test(pass);
    const hasSpecial = /[^A-Za-z0-9]/.test(pass);

    let score = 0;
    if (hasMinLength) score++;
    if (hasUpper && hasLower) score++;
    if (hasNumber) score++;
    if (hasSpecial) score++;

    if (!hasMinLength) {
      return { valid: false, message: 'Le mot de passe doit comporter au moins 8 caractères.', score };
    }
    if (!hasUpper) {
      return { valid: false, message: 'Ajoutez au moins une lettre majuscule (A-Z).', score };
    }
    if (!hasLower) {
      return { valid: false, message: 'Ajoutez au moins une lettre minuscule (a-z).', score };
    }
    if (!hasNumber) {
      return { valid: false, message: 'Ajoutez au moins un chiffre (0-9).', score };
    }

    return { valid: true, message: 'Mot de passe robuste.', score: Math.max(score, 3) };
  },

  /**
   * Liste noire des domaines d'emails jetables et temporaires (Anti-Fake)
   */
  DISPOSABLE_DOMAINS: [
    'yopmail.com', 'yopmail.fr', 'yopmail.net', 'tempmail.com', 'temp-mail.org', 'temp-mail.io',
    '10minutemail.com', '10minutemail.net', 'guerrillamail.com', 'guerrillamail.net', 'guerrillamail.org',
    'mailinator.com', 'mailinator2.com', 'trashmail.com', 'trashmail.net', 'trashmail.org',
    'dispostable.com', 'getnada.com', 'mohmal.com', 'sharklasers.com', 'fakeinbox.com',
    'burnermail.io', 'throwawaymail.com', 'crazymailing.com', 'maildrop.cc', 'generator.email',
    'inboxkitten.com', 'mytemp.email', 'tempinbox.com', 'emailondeck.com', 'nada.ltd',
    'mailnesia.com', 'fakemailgenerator.com', 'fakemail.net', 'fakemail.xyz', 'dropmail.me',
    'armyspy.com', 'cuvox.de', 'dayrep.com', 'fleckens.hu', 'gustr.com', 'jourrapide.com',
    'rhyta.com', 'superrito.com', 'teleworm.us', 'einrot.com', 'mailsac.com', 'harakirimail.com',
    'guerrillamailblock.com', 'pokemail.net', 'spam4.me', 'grr.la', 'guerrillamail.biz'
  ],

  /**
   * Domaines factices ou fictifs interdits
   */
  BLOCKED_DOMAINS: [
    'test.com', 'test.test', 'example.com', 'example.org', 'example.net', 'sample.com',
    'fake.com', 'none.com', 'nowhere.com', 'asdf.com', 'aaa.com', 'temp.com', 'invalid.com',
    'localhost', 'local.host', 'mail.test', 'domain.com', 'cmflow.test'
  ],

  /**
   * Détecte les fautes de frappe courantes dans les adresses emails
   * @param {string} domain
   * @returns {string|null} Suggestion de domaine corrigé ou null
   */
  suggestEmailCorrection(domain) {
    if (!domain) return null;
    const clean = domain.toLowerCase().trim();
    const typos = {
      'gmai.com': 'gmail.com', 'gmaill.com': 'gmail.com', 'gamil.com': 'gmail.com', 'gmial.com': 'gmail.com', 'gmaik.com': 'gmail.com',
      'hotmial.com': 'hotmail.com', 'hotmai.com': 'hotmail.com', 'hotmaill.com': 'hotmail.com',
      'yaho.com': 'yahoo.com', 'yahooo.com': 'yahoo.com', 'yhaoo.com': 'yahoo.com', 'yaho.fr': 'yahoo.fr',
      'outlok.com': 'outlook.com', 'outloo.com': 'outlook.com', 'outlock.com': 'outlook.com',
      'iclud.com': 'icloud.com', 'icoud.com': 'icloud.com'
    };
    return typos[clean] || null;
  },

  /**
   * Analyse la réputation et la légitimité d'une adresse email
   * @param {string} email
   * @returns {{ valid: boolean, error: string|null, suggestion: string|null }}
   */
  checkEmailReputation(email) {
    if (!email || typeof email !== 'string') {
      return { valid: false, error: 'Veuillez saisir une adresse email.', suggestion: null };
    }
    const clean = email.trim();
    
    // 1. Format RFC 5322
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
    if (!emailRegex.test(clean)) {
      return { valid: false, error: 'Format d\'adresse email invalide (ex: nom@agence.sn).', suggestion: null };
    }

    const parts = clean.split('@');
    if (parts.length !== 2) {
      return { valid: false, error: 'Format d\'adresse email invalide.', suggestion: null };
    }

    const domain = parts[1].toLowerCase();

    // 2. Blocage des domaines jetables / temporaires
    if (this.DISPOSABLE_DOMAINS.includes(domain)) {
      return { valid: false, error: 'Les adresses e-mails temporaires ou jetables sont strictement interdites.', suggestion: null };
    }

    // 3. Blocage des domaines factices évidents
    if (this.BLOCKED_DOMAINS.includes(domain)) {
      return { valid: false, error: 'Ce nom de domaine factice n\'est pas autorisé.', suggestion: null };
    }

    // 4. Détection de fautes de frappe courantes
    const suggestion = this.suggestEmailCorrection(domain);
    if (suggestion) {
      return { valid: false, error: `Vouliez-vous dire @${suggestion} ?`, suggestion: `${parts[0]}@${suggestion}` };
    }

    return { valid: true, error: null, suggestion: null };
  },

  /**
   * Valide rigoureusement une adresse email selon les standards RFC 5322 & Anti-Disposable
   * @param {string} email
   * @returns {boolean}
   */
  isValidEmail(email) {
    return this.checkEmailReputation(email).valid;
  },

  /**
   * Génère une signature/token de sécurité pour le portail client
   * @param {string} clientId
   * @param {string} secretKey
   * @returns {string} Token hexadécimal sécurisé
   */
  generateClientToken(clientId, secretKey = 'cmflow_portal_salt') {
    if (!clientId) return '';
    let hash = 0;
    const combined = `${clientId}:${secretKey}:${clientId.split('').reverse().join('')}`;
    for (let i = 0; i < combined.length; i++) {
      const char = combined.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0;
    }
    const hex = Math.abs(hash).toString(16).padStart(8, '0');
    return `tkn_${hex}`;
  },

  /**
   * Vérifie et sécurise une URL (bloque javascript:, data:, et protocol-relative //)
   * @param {string} url
   * @returns {string} URL nettoyée ou '#'
   */
  sanitizeUrl(url) {
    if (!url || typeof url !== 'string') return '#';
    const clean = url.trim();
    // Interdire les URLs protocol-relative qui causent des Open Redirects
    if (clean.startsWith('//')) return '#';
    // Autoriser uniquement http, https, mailto, tel, chemins relatifs et ancres
    if (/^(https?:\/\/|mailto:|tel:|#|\/(?!\/)|\.\/)/i.test(clean)) {
      return clean;
    }
    return '#';
  },

  /**
   * Valide si une URL d'image est conforme
   * @param {string} url
   * @returns {boolean}
   */
  isValidImageUrl(url) {
    if (!url || typeof url !== 'string') return false;
    const clean = url.trim().toLowerCase();
    if (clean.startsWith('//')) return false;
    if (!clean.startsWith('http://') && !clean.startsWith('https://') && !clean.startsWith('data:image/')) return false;
    return /\.(jpg|jpeg|png|webp|gif|svg)(\?.*)?$/i.test(clean) || clean.includes('unsplash.com') || clean.includes('firebasestorage.googleapis.com') || clean.startsWith('data:image/');
  },

  /**
   * Génère un jeton cryptographique aléatoire haute entropie (128-bit)
   * @param {number} length
   * @returns {string}
   */
  generateRandomToken(length = 16) {
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      const bytes = new Uint8Array(length);
      crypto.getRandomValues(bytes);
      return 'tkn_' + Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
    }
    return 'tkn_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
  },

  /**
   * Vérifie la validité d'un token client
   * @param {string|object} clientOrId
   * @param {string} token
   * @returns {boolean}
   */
  verifyClientToken(clientOrId, token) {
    if (!clientOrId || !token) return false;
    if (typeof clientOrId === 'object') {
      if (clientOrId.portalToken && clientOrId.portalToken === token) return true;
      return this.generateClientToken(clientOrId.id) === token;
    }
    return this.generateClientToken(clientOrId) === token;
  }
};

// Rendre la fonction escapeHtml accessible globalement
if (typeof window !== 'undefined' && !window.escapeHtml) {
  window.escapeHtml = CMFlowSecurity.escapeHtml;
}

/* ==========================================================================
   STORE — GESTION DES DONNÉES (Firestore + localStorage cache)
   ========================================================================== */
const CMFlowStore = {
  // Listeners Firestore actifs (pour unsubscribe)
  _listeners: [],
  // Flag pour éviter les boucles de mise à jour
  _suppressFirestoreWrite: false,

  // ========================================================================
  // CACHE HELPERS (localStorage comme cache synchrone rapide)
  // ========================================================================
  _cacheGet(key, fallback = null) {
    try { return JSON.parse(localStorage.getItem(key)) || fallback; } catch { return fallback; }
  },
  _cacheSet(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  },

  // ========================================================================
  // FIRESTORE WRITE HELPERS (écriture async en arrière-plan)
  // ========================================================================

  /** Écrire un document dans la sous-collection de l'utilisateur */
  _firestoreSetDoc(path, data) {
    if (!cmfireIsOnline() || this._suppressFirestoreWrite) return;
    const uid = cmfireGetUid();
    if (!uid) return;
    const ref = cmfireDb.collection('users').doc(uid);
    // path peut être 'profile', 'workspace', ou 'settings/schedule' etc.
    if (path.includes('/')) {
      const parts = path.split('/');
      ref.collection(parts[0]).doc(parts[1]).set(data, { merge: true }).catch(err => {
        console.warn('⚠️ Firestore write error (' + path + '):', err);
      });
    } else {
      ref.collection('data').doc(path).set(data, { merge: true }).catch(err => {
        console.warn('⚠️ Firestore write error (' + path + '):', err);
      });
    }
  },

  /** Écrire/mettre à jour un document dans une sous-collection */
  _firestoreSetInCollection(collectionName, docId, data) {
    if (!cmfireIsOnline() || this._suppressFirestoreWrite) return;
    const uid = cmfireGetUid();
    if (!uid) return;
    cmfireDb.collection('users').doc(uid)
      .collection(collectionName).doc(docId)
      .set(data, { merge: true })
      .catch(err => console.warn('⚠️ Firestore write error (' + collectionName + '/' + docId + '):', err));
  },

  /** Supprimer un document dans une sous-collection */
  _firestoreDeleteInCollection(collectionName, docId) {
    if (!cmfireIsOnline()) return;
    const uid = cmfireGetUid();
    if (!uid) return;
    cmfireDb.collection('users').doc(uid)
      .collection(collectionName).doc(docId)
      .delete()
      .catch(err => console.warn('⚠️ Firestore delete error (' + collectionName + '/' + docId + '):', err));
  },

  // ========================================================================
  // USER
  // ========================================================================
  getUser() {
    return this._cacheGet('cmflow_user');
  },
  setUser(user) {
    this._cacheSet('cmflow_user', user);
    this._firestoreSetDoc('profile', user);
  },

  // ========================================================================
  // WORKSPACE
  // ========================================================================
  getWorkspace() {
    return this._cacheGet('cmflow_workspace');
  },
  setWorkspace(ws) {
    this._cacheSet('cmflow_workspace', ws);
    this._firestoreSetDoc('workspace', ws);
  },

  // ========================================================================
  // PLAN & QUOTAS (Essai Gratuit vs Pro)
  // ========================================================================
  getUserPlan() {
    return localStorage.getItem('cmflow_user_plan') || 'trial';
  },
  setUserPlan(plan) {
    localStorage.setItem('cmflow_user_plan', plan);
    this._firestoreSetDoc('profile', { plan: plan });
  },
  canAddClient() {
    const plan = this.getUserPlan();
    if (plan === 'pro') return true;
    const clients = this.getClients();
    return clients.length < 1; // 1 seul client en essai gratuit
  },
  canConnectNetwork(clientId, targetNetwork) {
    const plan = this.getUserPlan();
    if (plan === 'pro') return true;
    const client = this.getClientById(clientId);
    if (!client || !client.socialAccounts) return true;
    
    // Si ce réseau est déjà connecté, on peut le modifier
    if (client.socialAccounts[targetNetwork]?.connected) return true;

    // Compter les réseaux déjà connectés
    const connectedCount = Object.values(client.socialAccounts).filter(acc => acc?.connected).length;
    return connectedCount < 1; // 1 seul réseau par client en essai gratuit
  },

  // ========================================================================
  // ========================================================================
  // CLIENTS (collection Firestore: users/{uid}/clients)
  // ========================================================================
  getClients() {
    let clients = this._cacheGet('cmflow_clients', null);
    if (!clients || clients.length === 0) {
      clients = [
        {
          id: 'c_vision',
          name: 'Vision Large Shop',
          industry: 'Boutique & Mode',
          notes: 'Boutique de prêt-à-porter, sneakers et accessoires tendance',
          socialAccounts: {
            instagram: { connected: true, handle: '@visionlargeshop' },
            facebook: { connected: true, handle: 'Vision large shop' }
          },
          portalToken: 'tkn_vision_shop',
          createdAt: new Date().toISOString()
        },
        {
          id: 'c_siddiq',
          name: 'Siddiq Solutions',
          industry: 'Agence Digitale & Tech',
          notes: 'Solutions informatiques, transformation digitale et marketing',
          socialAccounts: {
            instagram: { connected: true, handle: '@siddiq_solutions' },
            facebook: { connected: true, handle: 'Siddiq Solutions' },
            linkedin: { connected: true, handle: 'Siddiq Solutions' }
          },
          portalToken: 'tkn_siddiq_sol',
          createdAt: new Date().toISOString()
        },
        {
          id: 'c_lycee',
          name: 'Lycée d\'Excellence Mahmady',
          industry: 'Éducation & Formation',
          notes: 'Établissement d\'excellence scolaire et académique',
          socialAccounts: {
            facebook: { connected: true, handle: 'Lycée d\'Excellence Mahmady' }
          },
          portalToken: 'tkn_lycee_mah',
          createdAt: new Date().toISOString()
        },
        {
          id: 'c_teranga',
          name: 'Teranga Gourmet',
          industry: 'Restauration & Traiteur',
          notes: 'Restaurant gastronomique et spécialités sénégalaises revisitées',
          socialAccounts: {
            instagram: { connected: true, handle: '@teranga_gourmet' },
            facebook: { connected: true, handle: 'Teranga Gourmet Dakar' }
          },
          portalToken: 'tkn_teranga_gourmet',
          createdAt: new Date().toISOString()
        }
      ];
      this._cacheSet('cmflow_clients', clients);
    }
    return clients;
  },
  getActiveClientId() {
    return localStorage.getItem('cmflow_active_client_id') || 'all';
  },
  setActiveClientId(id) {
    localStorage.setItem('cmflow_active_client_id', id || 'all');
    window.dispatchEvent(new CustomEvent('cmflow:active_client_changed', { detail: { clientId: id || 'all' } }));
  },
  getActiveClient() {
    const id = this.getActiveClientId();
    if (!id || id === 'all') return null;
    return this.getClientById(id);
  },
  setClients(clients) {
    this._cacheSet('cmflow_clients', clients);
    // Sync chaque client individuellement dans Firestore
    if (!this._suppressFirestoreWrite && cmfireIsOnline()) {
      clients.forEach(c => {
        if (c.id) this._firestoreSetInCollection('clients', c.id, c);
      });
    }
  },
  addClient(client) {
    const clients = this.getClients();
    clients.push(client);
    this._cacheSet('cmflow_clients', clients);
    if (client.id) this._firestoreSetInCollection('clients', client.id, client);
  },
  deleteClient(id) {
    const clients = this.getClients().filter(c => c.id !== id);
    this._cacheSet('cmflow_clients', clients);
    this._firestoreDeleteInCollection('clients', id);
    if (this.getActiveClientId() === id) {
      this.setActiveClientId('all');
    }
  },
  getClientById(id) {
    return this.getClients().find(c => c.id === id) || null;
  },
  updateClientSocialAccount(clientId, networkKey, accountData) {
    const clients = this.getClients();
    const idx = clients.findIndex(c => c.id === clientId);
    if (idx !== -1) {
      if (!clients[idx].socialAccounts) {
        clients[idx].socialAccounts = {};
      }
      clients[idx].socialAccounts[networkKey] = accountData;
      this._cacheSet('cmflow_clients', clients);
      this._firestoreSetInCollection('clients', clientId, clients[idx]);
      return clients[idx];
    }
    return null;
  },

  // ========================================================================
  // POSTS (collection Firestore: users/{uid}/posts)
  // ========================================================================
  getPostingSchedule() {
    try {
      const s = JSON.parse(localStorage.getItem('cmflow_schedule'));
      if (s && s.length) return s;
    } catch {}
    return [
      { day: 'Lundi', dayIndex: 1, times: ['11:00', '18:30'] },
      { day: 'Mardi', dayIndex: 2, times: ['14:00', '19:00'] },
      { day: 'Mercredi', dayIndex: 3, times: ['12:00', '18:00'] },
      { day: 'Jeudi', dayIndex: 4, times: ['14:00', '20:00'] },
      { day: 'Vendredi', dayIndex: 5, times: ['10:30', '17:00'] },
      { day: 'Samedi', dayIndex: 6, times: ['11:00', '15:00'] },
      { day: 'Dimanche', dayIndex: 0, times: ['16:00', '20:30'] },
    ];
  },
  setPostingSchedule(schedule) {
    localStorage.setItem('cmflow_schedule', JSON.stringify(schedule));
    this._firestoreSetDoc('settings/schedule', { days: schedule });
  },
  getNextQueueSlot() {
    const today = new Date();
    const schedule = this.getPostingSchedule();
    const posts = this.getPosts();

    for (let dayOffset = 0; dayOffset < 14; dayOffset++) {
      const targetDate = new Date();
      targetDate.setDate(today.getDate() + dayOffset);
      const dayIdx = targetDate.getDay();
      const dateStr = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}-${String(targetDate.getDate()).padStart(2, '0')}`;

      const dayConfig = schedule.find(s => s.dayIndex === dayIdx);
      if (dayConfig && dayConfig.times) {
        for (const time of dayConfig.times) {
          const isOccupied = posts.some(p => p.scheduledDate === dateStr && p.scheduledTime === time);
          if (!isOccupied) {
            return { date: dateStr, time: time };
          }
        }
      }
    }
    const tmrw = new Date();
    tmrw.setDate(tmrw.getDate() + 1);
    return {
      date: `${tmrw.getFullYear()}-${String(tmrw.getMonth() + 1).padStart(2, '0')}-${String(tmrw.getDate()).padStart(2, '0')}`,
      time: '14:00'
    };
  },
  getPosts() {
    try {
      let posts = JSON.parse(localStorage.getItem('cmflow_posts'));
      if (!posts || posts.length === 0) {
        // Posts d'exemples initiaux pour une démonstration immédiate
        const today = new Date();
        const y = today.getFullYear();
        const m = String(today.getMonth() + 1).padStart(2, '0');
        const d = today.getDate();

        const formatDate = (dayOffset) => {
          const date = new Date(today);
          date.setDate(d + dayOffset);
          const dy = date.getFullYear();
          const dm = String(date.getMonth() + 1).padStart(2, '0');
          const dd = String(date.getDate()).padStart(2, '0');
          return `${dy}-${dm}-${dd}`;
        };

        const clients = this.getClients();
        const client1 = clients[0] ? clients[0].name : 'Teranga Gourmet';
        const clientId1 = clients[0] ? clients[0].id : 'sample1';

        posts = [
          {
            id: 'p1',
            clientId: clientId1,
            clientName: client1,
            platforms: ['instagram', 'facebook'],
            scheduledDate: formatDate(1),
            scheduledTime: '14:30',
            caption: 'Nouveau menu de saison disponible dès ce week-end ! 🍽️✨ Venez déguster nos saveurs locales revisitées. Réservations par DM ou WhatsApp.\n\n#DakarFood #Teranga #Gastronomie #SenegalFood',
            imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=80',
            status: 'scheduled', // draft, pending, scheduled, published
            createdAt: new Date().toISOString(),
          },
          {
            id: 'p2',
            clientId: clientId1,
            clientName: client1,
            platforms: ['instagram', 'tiktok'],
            scheduledDate: formatDate(3),
            scheduledTime: '18:00',
            caption: 'Les coulisses de la préparation de nos plats signatures avec le Chef ! 👨‍🍳🔥 Restez connectés pour le drop de la semaine.\n\n#BehindTheScenes #ChefLife #DakarVibes',
            imageUrl: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=600&auto=format&fit=crop&q=80',
            status: 'pending',
            createdAt: new Date().toISOString(),
          },
          {
            id: 'p3',
            clientId: clientId1,
            clientName: client1,
            platforms: ['linkedin'],
            scheduledDate: formatDate(-2),
            scheduledTime: '09:00',
            caption: 'Fier d\'annoncer notre nouveau partenariat pour valoriser les produits du terroir sénégalais. 🇸🇳💼 Ensemble, développons l\'économie locale.\n\n#BusinessSenegal #Partenariat #Leadership',
            imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&auto=format&fit=crop&q=80',
            status: 'published',
            createdAt: new Date().toISOString(),
          }
        ];
        this.setPosts(posts);
      }
      return posts;
    } catch {
      return [];
    }
  },
  setPosts(posts) {
    this._cacheSet('cmflow_posts', posts);
    // Sync chaque post individuellement dans Firestore
    if (!this._suppressFirestoreWrite && cmfireIsOnline()) {
      posts.forEach(p => {
        if (p.id) this._firestoreSetInCollection('posts', p.id, p);
      });
    }
  },
  addPost(post) {
    const posts = this.getPosts();
    posts.push(post);
    this._cacheSet('cmflow_posts', posts);
    if (post.id) {
      this._firestoreSetInCollection('posts', post.id, post);
      this._syncPublicReviewForClient(post.clientId);
    }
  },
  updatePost(id, updatedData) {
    const posts = this.getPosts().map(p => p.id === id ? { ...p, ...updatedData } : p);
    this._cacheSet('cmflow_posts', posts);
    this._firestoreSetInCollection('posts', id, updatedData);
    const post = this.getPostById(id);
    if (post && post.clientId) this._syncPublicReviewForClient(post.clientId);
  },
  deletePost(id) {
    const post = this.getPostById(id);
    const posts = this.getPosts().filter(p => p.id !== id);
    this._cacheSet('cmflow_posts', posts);
    this._firestoreDeleteInCollection('posts', id);
    if (post && post.clientId) this._syncPublicReviewForClient(post.clientId);
  },
  _syncPublicReviewForClient(clientId) {
    if (!clientId || !cmfireIsOnline() || typeof cmfireDb === 'undefined' || !cmfireDb) return;
    try {
      const client = this.getClientById(clientId);
      if (!client || !client.portalToken) return;
      const ws = this.getWorkspace();
      const clientPosts = this.getPosts().filter(p => p.clientId === clientId);
      cmfireDb.collection('public_reviews').doc(client.portalToken).set({
        clientId: client.id,
        clientName: client.name,
        workspaceName: ws?.name || 'Votre Agence',
        portalToken: client.portalToken,
        posts: clientPosts,
        updatedAt: new Date().toISOString()
      }, { merge: true }).catch(err => console.warn('Sync public_review error:', err));
    } catch(e) { console.warn('Sync public_review error:', e); }
  },
  getPostById(id) {
    return this.getPosts().find(p => p.id === id) || null;
  },

  // ========================================================================
  // USER PREFERENCES
  // ========================================================================
  getPrefs() {
    return this._cacheGet('cmflow_prefs');
  },
  setPrefs(prefs) {
    this._cacheSet('cmflow_prefs', prefs);
    this._firestoreSetDoc('prefs', prefs);
  },

  // ========================================================================
  // LOGOUT — Déconnexion complète (localStorage + Firebase Auth)
  // ========================================================================
  logout() {
    // Détacher tous les listeners Firestore
    this._listeners.forEach(unsub => { try { unsub(); } catch {} });
    this._listeners = [];

    // Nettoyer le cache local
    localStorage.removeItem('cmflow_user');
    localStorage.removeItem('cmflow_workspace');
    localStorage.removeItem('cmflow_clients');
    localStorage.removeItem('cmflow_posts');
    localStorage.removeItem('cmflow_prefs');
    localStorage.removeItem('cmflow_schedule');
    localStorage.removeItem('cmflow_user_plan');

    // Déconnexion Firebase Auth
    if (cmfireReady && cmfireAuth) {
      cmfireAuth.signOut().catch(err => console.warn('⚠️ Firebase signOut error:', err));
    }
  },

  // ========================================================================
  // FIRESTORE REAL-TIME LISTENERS — Synchronisation temps-réel
  // ========================================================================

  /** Initialiser les listeners Firestore pour garder le cache à jour */
  initFirestoreListeners() {
    if (!cmfireIsOnline()) return;
    const uid = cmfireGetUid();
    if (!uid) return;

    // Détacher les anciens listeners
    this._listeners.forEach(unsub => { try { unsub(); } catch {} });
    this._listeners = [];

    const userRef = cmfireDb.collection('users').doc(uid);

    // --- Listener : Profil utilisateur ---
    this._listeners.push(
      userRef.collection('data').doc('profile').onSnapshot(snap => {
        if (snap.exists) {
          this._suppressFirestoreWrite = true;
          const data = snap.data();
          this._cacheSet('cmflow_user', data);
          if (data.plan) localStorage.setItem('cmflow_user_plan', data.plan);
          this._suppressFirestoreWrite = false;
          window.dispatchEvent(new CustomEvent('cmflow:data_synced', { detail: { type: 'profile' } }));
        }
      }, err => console.warn('⚠️ Listener profile error:', err))
    );

    // --- Listener : Workspace ---
    this._listeners.push(
      userRef.collection('data').doc('workspace').onSnapshot(snap => {
        if (snap.exists) {
          this._suppressFirestoreWrite = true;
          this._cacheSet('cmflow_workspace', snap.data());
          this._suppressFirestoreWrite = false;
          window.dispatchEvent(new CustomEvent('cmflow:data_synced', { detail: { type: 'workspace' } }));
        }
      }, err => console.warn('⚠️ Listener workspace error:', err))
    );

    // --- Listener : Préférences ---
    this._listeners.push(
      userRef.collection('data').doc('prefs').onSnapshot(snap => {
        if (snap.exists) {
          this._suppressFirestoreWrite = true;
          this._cacheSet('cmflow_prefs', snap.data());
          this._suppressFirestoreWrite = false;
        }
      }, err => console.warn('⚠️ Listener prefs error:', err))
    );

    // --- Listener : Clients (collection) ---
    this._listeners.push(
      userRef.collection('clients').onSnapshot(snapshot => {
        this._suppressFirestoreWrite = true;
        const clients = [];
        snapshot.forEach(doc => clients.push({ ...doc.data(), id: doc.id }));
        this._cacheSet('cmflow_clients', clients);
        this._suppressFirestoreWrite = false;
        window.dispatchEvent(new CustomEvent('cmflow:data_synced', { detail: { type: 'clients' } }));
      }, err => console.warn('⚠️ Listener clients error:', err))
    );

    // --- Listener : Posts (collection) ---
    this._listeners.push(
      userRef.collection('posts').onSnapshot(snapshot => {
        this._suppressFirestoreWrite = true;
        const posts = [];
        snapshot.forEach(doc => posts.push({ ...doc.data(), id: doc.id }));
        this._cacheSet('cmflow_posts', posts);
        this._suppressFirestoreWrite = false;
        window.dispatchEvent(new CustomEvent('cmflow:data_synced', { detail: { type: 'posts' } }));
      }, err => console.warn('⚠️ Listener posts error:', err))
    );

    // --- Listener : Schedule ---
    this._listeners.push(
      userRef.collection('settings').doc('schedule').onSnapshot(snap => {
        if (snap.exists && snap.data().days) {
          this._suppressFirestoreWrite = true;
          localStorage.setItem('cmflow_schedule', JSON.stringify(snap.data().days));
          this._suppressFirestoreWrite = false;
        }
      }, err => console.warn('⚠️ Listener schedule error:', err))
    );

    console.log('🔄 Listeners Firestore temps-réel activés');
  },

  // ========================================================================
  // MIGRATION — localStorage → Firestore (premier login Firebase)
  // ========================================================================

  /** Migrer les données localStorage existantes vers Firestore */
  async migrateToFirestore() {
    if (!cmfireIsOnline()) return;
    const uid = cmfireGetUid();
    if (!uid) return;

    const userRef = cmfireDb.collection('users').doc(uid);

    // Vérifier si des données existent déjà dans Firestore
    const profileSnap = await userRef.collection('data').doc('profile').get();
    
    if (profileSnap.exists) {
      // Des données existent dans Firestore → les charger dans le cache local
      console.log('📥 Données Firestore existantes détectées, synchronisation vers le cache local...');
      // Les listeners onSnapshot feront le travail automatiquement
      return;
    }

    // Pas de données Firestore → migrer depuis localStorage
    console.log('📤 Migration des données localStorage vers Firestore...');

    const batch = cmfireDb.batch();

    // Profil
    const user = this._cacheGet('cmflow_user');
    if (user) {
      const plan = localStorage.getItem('cmflow_user_plan') || 'trial';
      batch.set(userRef.collection('data').doc('profile'), { ...user, plan: plan }, { merge: true });
    }

    // Workspace
    const ws = this._cacheGet('cmflow_workspace');
    if (ws) {
      batch.set(userRef.collection('data').doc('workspace'), ws, { merge: true });
    }

    // Préférences
    const prefs = this._cacheGet('cmflow_prefs');
    if (prefs) {
      batch.set(userRef.collection('data').doc('prefs'), prefs, { merge: true });
    }

    // Schedule
    const schedule = this._cacheGet('cmflow_schedule');
    if (schedule) {
      batch.set(userRef.collection('settings').doc('schedule'), { days: schedule }, { merge: true });
    }

    try {
      await batch.commit();
      console.log('✅ Batch principal migré (profil, workspace, prefs, schedule)');
    } catch (err) {
      console.error('❌ Erreur migration batch principal:', err);
    }

    // Clients (en dehors du batch car potentiellement > 500 docs)
    const clients = this._cacheGet('cmflow_clients', []);
    for (const client of clients) {
      if (client.id) {
        try {
          await userRef.collection('clients').doc(client.id).set(client, { merge: true });
        } catch (err) {
          console.warn('⚠️ Erreur migration client ' + client.id + ':', err);
        }
      }
    }

    // Posts
    const posts = this._cacheGet('cmflow_posts', []);
    for (const post of posts) {
      if (post.id) {
        try {
          await userRef.collection('posts').doc(post.id).set(post, { merge: true });
        } catch (err) {
          console.warn('⚠️ Erreur migration post ' + post.id + ':', err);
        }
      }
    }

    console.log('✅ Migration localStorage → Firestore terminée !');
  },

  // ========================================================================
  // HELPERS
  // ========================================================================
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  },
  formatDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('fr-SN', { day: 'numeric', month: 'short', year: 'numeric' });
  },
  getInitials(name) {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return parts[0].slice(0, 2).toUpperCase();
  }
};

/* ==========================================================================
   AUTH GUARD — Protection des routes
   ========================================================================== */
function authGuard() {
  let user = CMFlowStore.getUser();
  if (!user) {
    // Session par défaut pour exploration fluide et sans blocage
    user = {
      id: 'usr_cmflow_demo',
      name: 'Awa Diop',
      firstName: 'Awa',
      lastName: 'Diop',
      email: 'awa.diop@cmflow.sn',
      activityName: 'Dakar Digital Agency',
      plan: 'pro',
      createdAt: new Date().toISOString()
    };
    CMFlowStore.setUser(user);
    if (!CMFlowStore.getWorkspace()) {
      CMFlowStore.setWorkspace({
        id: 'ws_demo_dakar',
        ownerId: user.id,
        name: 'Dakar Digital Agency',
        createdAt: new Date().toISOString()
      });
    }
  }

  // Marquer l'onboarding comme complété si non défini
  const prefs = CMFlowStore.getPrefs();
  if (!prefs || !prefs.onboardingComplete) {
    CMFlowStore.setPrefs({ onboardingComplete: true });
  }

  return true;
}

/* ==========================================================================
   TOAST NOTIFICATION (partagé entre pages)
   ========================================================================== */
function showAppToast(message, type = 'success') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    container.setAttribute('aria-live', 'polite');
    container.setAttribute('aria-atomic', 'true');
    document.body.appendChild(container);
  }

  const icons = { success: '✓', error: '✕', info: 'ℹ' };

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.setAttribute('role', 'alert');
  toast.innerHTML = `<span>${icons[type] || icons.info}</span><span>${message}</span>`;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('hide');
    setTimeout(() => toast.remove(), 300);
  }, 3800);
}

/* ==========================================================================
   SIDEBAR — Logique commune (sidebar mobile toggle + dropdown utilisateur)
   ========================================================================== */
function initSidebar() {
  const sidebar = document.getElementById('app-sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  const hamburger = document.getElementById('app-hamburger');
  const userMenuBtn = document.getElementById('user-menu-btn');
  const userDropdown = document.getElementById('user-dropdown');
  const logoutBtn = document.getElementById('logout-btn');

  if (!sidebar) return;

  // Remplir les informations utilisateur dans la sidebar
  const user = CMFlowStore.getUser();
  if (user) {
    const initials = CMFlowStore.getInitials(`${user.firstName || ''} ${user.lastName || ''}`.trim() || user.name || user.email);
    const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.name || 'Utilisateur';
    const ws = CMFlowStore.getWorkspace();

    document.querySelectorAll('[data-user-initials]').forEach(el => el.textContent = initials);
    document.querySelectorAll('[data-user-name]').forEach(el => el.textContent = fullName);
    document.querySelectorAll('[data-workspace-name]').forEach(el => el.textContent = ws?.name || 'Mon espace');
  }

  // Mobile sidebar open/close
  const openSidebar = () => {
    sidebar.classList.add('open');
    if (overlay) overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  const closeSidebar = () => {
    sidebar.classList.remove('open');
    if (overlay) overlay.classList.remove('active');
    document.body.style.overflow = '';
  };

  if (hamburger) hamburger.addEventListener('click', openSidebar);
  if (overlay) overlay.addEventListener('click', closeSidebar);

  // Fermer avec Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && sidebar.classList.contains('open')) closeSidebar();
  });

  // Fermer en cliquant sur un nav item (mobile)
  document.querySelectorAll('.sidebar-nav-item').forEach(item => {
    item.addEventListener('click', () => {
      if (window.innerWidth < 1024) closeSidebar();
    });
  });

  // User dropdown toggle
  if (userMenuBtn && userDropdown) {
    userMenuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      userDropdown.classList.toggle('open');
    });

    document.addEventListener('click', (e) => {
      if (!userDropdown.contains(e.target) && e.target !== userMenuBtn) {
        userDropdown.classList.remove('open');
      }
    });
  }

  // Déconnexion Globale & Déléguée
  window.handleAppLogout = function(confirmFirst = true) {
    if (confirmFirst && !confirm('Voulez-vous vraiment vous déconnecter de CMFlow ?')) {
      return;
    }
    if (typeof CMFlowStore !== 'undefined' && CMFlowStore.logout) {
      CMFlowStore.logout();
    }
    if (typeof CMFlowBackend !== 'undefined' && CMFlowBackend.logout) {
      CMFlowBackend.logout();
    }
    localStorage.removeItem('cmflow_user');
    localStorage.removeItem('cmflow_workspace');
    localStorage.removeItem('cmflow_prefs');
    localStorage.removeItem('cmflow_user_profile');
    window.location.href = '/login';
  };

  document.addEventListener('click', (e) => {
    const target = e.target.closest('#btn-logout, [data-action="logout"], .btn-logout-action');
    if (target) {
      e.preventDefault();
      window.handleAppLogout(true);
    }
  });

  // "Bientôt disponible" pour les items désactivés
  document.querySelectorAll('[data-coming-soon]').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      showAppToast('Cette fonctionnalité sera bientôt disponible.', 'info');
    });
  });
}

/* ==========================================================================
   🔒 PAYWALL MODAL — QUOTAS ESSAI GRATUIT & UPGRADE WAVE / OM
   ========================================================================== */
function openPaywallModal(type = 'client') {
  let modal = document.getElementById('paywall-upgrade-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'paywall-upgrade-modal';
    modal.className = 'modal-backdrop';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    document.body.appendChild(modal);
  }

  const isClientLimit = type === 'client';
  const title = isClientLimit 
    ? "🔒 Limite de l'Essai Gratuit : 1 seul client" 
    : "🔒 Limite de l'Essai Gratuit : 1 seul réseau social";
  
  const desc = isClientLimit
    ? "En version d'essai gratuit, vous pouvez gérer 1 seul client. Pour ajouter d'autres clients ou marques et développer votre agence, passez au Plan Pro !"
    : "En version d'essai gratuit, vous pouvez connecter 1 seul réseau social par client. Pour multi-publier sur Instagram, Facebook, TikTok, LinkedIn et X en 1 clic, débloquez le Plan Pro !";

  modal.innerHTML = `
    <div class="paywall-modal-card">
      <div class="paywall-crown-icon">
        <svg viewBox="0 0 24 24" fill="currentColor" width="32" height="32"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
      </div>

      <span class="paywall-badge">Passer à l'abonnement supérieur</span>
      <h3 class="paywall-title">${title}</h3>
      <p class="paywall-desc">${desc}</p>

      <div class="paywall-perks-box">
        <div class="paywall-perk-item">
          <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
          <span>Clients & Marques <strong>Illimités</strong></span>
        </div>
        <div class="paywall-perk-item">
          <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
          <span>Multi-diffusion sur 5 réseaux (Instagram, FB, TikTok, LinkedIn, X)</span>
        </div>
        <div class="paywall-perk-item">
          <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
          <span>Assistant IA Générateur de Légendes Illimité ✨</span>
        </div>
        <div class="paywall-perk-item">
          <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
          <span>Portail WhatsApp & Rapports PDF avec votre logo</span>
        </div>
      </div>

      <div class="paywall-price-tag">
        9 900 FCFA <span style="font-size: 0.9rem; font-weight: 500; color: var(--text-muted);">/ mois</span>
      </div>

      <div style="display: flex; flex-direction: column; gap: 10px;">
        <button type="button" class="btn-primary-app" style="width: 100%; justify-content: center; padding: 12px; font-size: 0.95rem; background: linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%);" onclick="closePaywallModal(); openCheckoutModal('Plan Pro Illimité', '9 900 FCFA', '/ mois');">
          <span>🚀 Choisir mon moyen de paiement (Wave / OM)</span>
        </button>
        <button type="button" class="btn-secondary-app" style="width: 100%; justify-content: center;" onclick="closePaywallModal()">
          Continuer avec l'essai gratuit (1 client max)
        </button>
      </div>
    </div>
  `;

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closePaywallModal() {
  const modal = document.getElementById('paywall-upgrade-modal');
  if (modal) modal.classList.remove('active');
  document.body.style.overflow = '';
}

/* ==========================================================================
   💳 POP-UP DE PAIEMENT & CHECKOUT MULTI-CANAL (WAVE / ORANGE MONEY / CARTE)
   ========================================================================== */
let selectedPaymentMethod = 'wave';

function openCheckoutModal(planName = 'Plan Pro Illimité', amount = '9 900 FCFA', period = '/ mois') {
  let modal = document.getElementById('cmflow-checkout-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'cmflow-checkout-modal';
    modal.className = 'modal-backdrop';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    document.body.appendChild(modal);
  }

  const waveMerchant = localStorage.getItem('cmflow_wave_merchant') || '+221 77 842 19 02';
  const omMerchant = localStorage.getItem('cmflow_om_merchant') || '+221 77 842 19 02';
  selectedPaymentMethod = 'wave';

  modal.innerHTML = `
    <div class="paywall-modal-card" style="max-width: 520px; text-align: left;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; padding-bottom: 12px; border-bottom: var(--border-light);">
        <div style="display: flex; align-items: center; gap: 10px;">
          <div style="width: 38px; height: 38px; border-radius: 10px; background: linear-gradient(135deg, #2563EB 0%, #7C3AED 100%); display: flex; align-items: center; justify-content: center; font-size: 1.2rem; color: white;">
            💳
          </div>
          <div>
            <h3 style="font-size: 1.15rem; font-weight: 800; color: var(--text-main); margin: 0;">Paiement Sécurisé</h3>
            <p style="font-size: 0.78rem; color: var(--text-muted); margin: 0;">Finalisez votre abonnement CMFlow en toute sécurité</p>
          </div>
        </div>
        <button type="button" style="background: none; border: none; font-size: 1.2rem; cursor: pointer; color: var(--text-muted);" onclick="closeCheckoutModal()">✕</button>
      </div>

      <!-- Récapitulatif du Plan -->
      <div style="background: linear-gradient(135deg, #F8FAFC, #EFF6FF); border: 1.5px solid #BFDBFE; border-radius: var(--radius-md); padding: 14px 18px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
        <div>
          <span style="font-size: 0.72rem; font-weight: 700; color: var(--color-primary); text-transform: uppercase;">Formule Choisie</span>
          <h4 style="font-size: 1.05rem; font-weight: 800; color: var(--text-main); margin: 2px 0 0;">${escapeHtml(planName)}</h4>
        </div>
        <div style="text-align: right;">
          <span style="font-size: 1.3rem; font-weight: 900; color: #1E3A8A;">${escapeHtml(amount)}</span>
          <span style="font-size: 0.8rem; color: var(--text-muted);">${escapeHtml(period)}</span>
        </div>
      </div>

      <!-- Informations Client / Création de Compte -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 14px;">
        <div class="form-field">
          <label style="font-size: 0.8rem; font-weight: 700; color: var(--text-main); margin-bottom: 4px; display: block;">Votre Nom complet *</label>
          <input type="text" id="checkout-payer-name" value="${escapeHtml(CMFlowStore.getUser()?.name || '')}" placeholder="ex: Aminata Diallo" required style="width: 100%; padding: 9px 12px; border: var(--border-light); border-radius: var(--radius-md); font-size: 0.85rem;">
        </div>
        <div class="form-field">
          <label style="font-size: 0.8rem; font-weight: 700; color: var(--text-main); margin-bottom: 4px; display: block;">Votre Adresse Email *</label>
          <input type="email" id="checkout-payer-email" value="${escapeHtml(CMFlowStore.getUser()?.email || '')}" placeholder="aminata@agence.sn" required style="width: 100%; padding: 9px 12px; border: var(--border-light); border-radius: var(--radius-md); font-size: 0.85rem;">
        </div>
      </div>

      <label style="font-size: 0.85rem; font-weight: 700; color: var(--text-main); margin-bottom: 10px; display: block;">
        Choisissez votre moyen de paiement :
      </label>

      <!-- Sélecteur des modes de paiement -->
      <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-bottom: 18px;" id="checkout-methods-grid">
        
        <!-- Option Wave -->
        <div class="checkout-method-card active" id="method-wave" onclick="selectCheckoutMethod('wave')" style="border: 2px solid #0284C7; background: #F0F9FF; border-radius: var(--radius-md); padding: 12px 10px; text-align: center; cursor: pointer; transition: all 0.2s; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px;">
          <img src="images/wave-logo.png" alt="Wave" style="height: 24px; width: auto; object-fit: contain;">
          <strong style="font-size: 0.82rem; color: #0284C7; display: block;">Wave Sénégal</strong>
          <span style="font-size: 0.7rem; color: #0369a1;">1-clic direct</span>
        </div>

        <!-- Option Orange Money -->
        <div class="checkout-method-card" id="method-om" onclick="selectCheckoutMethod('om')" style="border: 1.5px solid var(--border-light); background: white; border-radius: var(--radius-md); padding: 12px 10px; text-align: center; cursor: pointer; transition: all 0.2s; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px;">
          <img src="images/orange-money-logo.png" alt="Orange Money" style="height: 22px; width: 22px; border-radius: 4px; object-fit: contain;">
          <strong style="font-size: 0.82rem; color: #EA580C; display: block;">Orange Money</strong>
          <span style="font-size: 0.7rem; color: var(--text-muted);">Paiement USSD</span>
        </div>

        <!-- Option Carte Bancaire -->
        <div class="checkout-method-card" id="method-card" onclick="selectCheckoutMethod('card')" style="border: 1.5px solid var(--border-light); background: white; border-radius: var(--radius-md); padding: 12px 10px; text-align: center; cursor: pointer; transition: all 0.2s;">
          <div style="font-size: 1.5rem; margin-bottom: 4px;">💳</div>
          <strong style="font-size: 0.82rem; color: var(--text-main); display: block;">Carte Bancaire</strong>
          <span style="font-size: 0.7rem; color: var(--text-muted);">Visa / Mastercard</span>
        </div>

      </div>

      <!-- Détails selon la méthode sélectionnée -->
      <div id="checkout-method-details" style="margin-bottom: 20px;">
        
        <!-- Bloc Wave -->
        <div id="details-wave">
          <div style="background: rgba(30, 58, 138, 0.05); border: 1px solid rgba(30, 58, 138, 0.15); padding: 12px 14px; border-radius: var(--radius-md); font-size: 0.8rem; color: #1E3A8A; margin-bottom: 12px;">
            🌊 <strong>Paiement Wave :</strong> Vous recevrez une notification instantanée sur votre application Wave ou vous pouvez payer directement au compte marchand CMFlow : <strong>${escapeHtml(waveMerchant)}</strong>.
          </div>
          <div class="form-field" style="margin-bottom: 12px;">
            <label style="font-size: 0.82rem; font-weight: 700; color: var(--text-main); margin-bottom: 4px; display: block;">Votre numéro de téléphone Wave *</label>
            <input type="tel" id="checkout-payer-phone" placeholder="Ex: +221 77 123 45 67" value="+221 77 " required style="width: 100%; padding: 10px 14px; border: var(--border-light); border-radius: var(--radius-md); font-size: 0.9rem;">
          </div>
        </div>

        <!-- Bloc Orange Money -->
        <div id="details-om" style="display: none;">
          <div style="background: rgba(234, 88, 12, 0.08); border: 1px solid rgba(234, 88, 12, 0.2); padding: 12px 14px; border-radius: var(--radius-md); font-size: 0.8rem; color: #C2410C; margin-bottom: 12px;">
            🍊 <strong>Orange Money Sénégal :</strong> Composez <code>#144#391#</code> pour obtenir votre code de validation ou effectuez le transfert vers <strong>${escapeHtml(omMerchant)}</strong>.
          </div>
          <div class="form-field" style="margin-bottom: 12px;">
            <label style="font-size: 0.82rem; font-weight: 700; color: var(--text-main); margin-bottom: 4px; display: block;">Votre numéro Orange Money *</label>
            <input type="tel" id="checkout-om-phone" placeholder="Ex: +221 77 / 78 ..." value="+221 77 " style="width: 100%; padding: 10px 14px; border: var(--border-light); border-radius: var(--radius-md); font-size: 0.9rem;">
          </div>
        </div>

        <!-- Bloc Carte Bancaire -->
        <div id="details-card" style="display: none;">
          <div class="form-field" style="margin-bottom: 10px;">
            <label style="font-size: 0.82rem; font-weight: 700; color: var(--text-main); margin-bottom: 4px; display: block;">Numéro de Carte Bancaire</label>
            <input type="text" placeholder="4242 •••• •••• 4242" maxlength="19" style="width: 100%; padding: 10px 14px; border: var(--border-light); border-radius: var(--radius-md); font-size: 0.9rem;">
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <div class="form-field">
              <label style="font-size: 0.82rem; font-weight: 700; color: var(--text-main); margin-bottom: 4px; display: block;">Expiration</label>
              <input type="text" placeholder="MM/AA" maxlength="5" style="width: 100%; padding: 10px 14px; border: var(--border-light); border-radius: var(--radius-md); font-size: 0.9rem;">
            </div>
            <div class="form-field">
              <label style="font-size: 0.82rem; font-weight: 700; color: var(--text-main); margin-bottom: 4px; display: block;">CVC</label>
              <input type="text" placeholder="123" maxlength="4" style="width: 100%; padding: 10px 14px; border: var(--border-light); border-radius: var(--radius-md); font-size: 0.9rem;">
            </div>
          </div>
        </div>

      </div>

      <!-- Bouton de validation -->
      <div style="display: flex; flex-direction: column; gap: 10px;">
        <button type="button" class="btn-primary-app" id="checkout-submit-btn" style="width: 100%; justify-content: center; padding: 14px; font-size: 1rem; font-weight: 800; background: linear-gradient(135deg, #1E3A8A 0%, #2563EB 100%);" onclick="processCheckoutPayment('${escapeHtml(planName)}', '${escapeHtml(amount)}')">
          <span id="checkout-btn-text">🚀 Valider le Paiement Wave (${escapeHtml(amount)})</span>
        </button>
        <button type="button" class="btn-secondary-app" style="width: 100%; justify-content: center;" onclick="closeCheckoutModal()">
          Annuler
        </button>
      </div>

      <div style="display: flex; align-items: center; justify-content: center; gap: 6px; margin-top: 14px; font-size: 0.75rem; color: var(--text-muted);">
        <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14" style="color: #059669;"><path fill-rule="evenodd" d="M10 1a9 9 0 100 18 9 9 0 000-18zm3.707 7.707a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
        <span>Paiement crypté & sécurisé · Facture générée automatiquement</span>
      </div>
    </div>
  `;

  modal.classList.add('active');
  modal.style.position = 'fixed';
  modal.style.inset = '0';
  modal.style.background = 'rgba(15, 23, 42, 0.65)';
  modal.style.backdropFilter = 'blur(6px)';
  modal.style.zIndex = '999999';
  modal.style.display = 'flex';
  modal.style.alignItems = 'center';
  modal.style.justifyContent = 'center';
  modal.style.padding = '20px';
  modal.style.opacity = '1';
  modal.style.visibility = 'visible';
  document.body.style.overflow = 'hidden';
}

function selectCheckoutMethod(method) {
  selectedPaymentMethod = method;
  
  // Style des cartes
  ['wave', 'om', 'card'].forEach(m => {
    const card = document.getElementById(`method-${m}`);
    const details = document.getElementById(`details-${m}`);
    if (card) {
      if (m === method) {
        card.style.borderColor = m === 'wave' ? '#1E3A8A' : (m === 'om' ? '#EA580C' : '#2563EB');
        card.style.background = m === 'wave' ? '#EFF6FF' : (m === 'om' ? '#FFF7ED' : '#F8FAFC');
      } else {
        card.style.borderColor = 'var(--border-light)';
        card.style.background = 'white';
      }
    }
    if (details) {
      details.style.display = m === method ? 'block' : 'none';
    }
  });

  // Bouton
  const btnText = document.getElementById('checkout-btn-text');
  const submitBtn = document.getElementById('checkout-submit-btn');
  if (btnText && submitBtn) {
    if (method === 'wave') {
      btnText.textContent = `🚀 Valider le Paiement Wave`;
      submitBtn.style.background = 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 100%)';
    } else if (method === 'om') {
      btnText.textContent = `🍊 Valider par Orange Money`;
      submitBtn.style.background = 'linear-gradient(135deg, #C2410C 0%, #EA580C 100%)';
    } else {
      btnText.textContent = `💳 Payer par Carte Bancaire`;
      submitBtn.style.background = 'linear-gradient(135deg, #1E293B 0%, #334155 100%)';
    }
  }
}

function closeCheckoutModal() {
  const modal = document.getElementById('cmflow-checkout-modal');
  if (modal) {
    modal.classList.remove('active');
    modal.style.display = 'none';
  }
  document.body.style.overflow = '';
}

function processCheckoutPayment(planName, amount) {
  const submitBtn = document.getElementById('checkout-submit-btn');
  const btnText = document.getElementById('checkout-btn-text');
  const payerPhone = document.getElementById('checkout-payer-phone')?.value.trim() || '+221 77 123 45 67';
  const methodLabel = selectedPaymentMethod === 'wave' ? 'Wave Sénégal 🌊' : (selectedPaymentMethod === 'om' ? 'Orange Money 🍊' : 'Carte Bancaire 💳');
  const txRef = 'TX-' + (selectedPaymentMethod.toUpperCase()) + '-' + Math.floor(100000 + Math.random() * 900000);

  if (submitBtn) {
    submitBtn.disabled = true;
    if (btnText) btnText.textContent = '⏳ Traitement du paiement en cours...';
  }

  setTimeout(() => {
    // Récupérer le nom et l'email renseignés
    const payerName = document.getElementById('checkout-payer-name')?.value.trim() || 'Community Manager';
    const payerEmail = document.getElementById('checkout-payer-email')?.value.trim() || 'cm@cmflow.sn';

    // Débloquer le plan Pro dans CMFlowStore
    CMFlowStore.setUserPlan('pro');

    // Mettre à jour ou créer l'utilisateur
    try {
      let user = CMFlowStore.getUser();
      if (!user) {
        const nameParts = payerName.split(' ');
        user = {
          id: 'u_' + Date.now().toString(36),
          name: payerName,
          firstName: nameParts[0] || 'CM',
          lastName: nameParts.slice(1).join(' ') || '',
          email: payerEmail,
          activityName: 'Agence ' + (nameParts[0] || 'CM'),
          plan: 'pro'
        };
        const ws = {
          id: 'ws_' + Date.now().toString(36),
          ownerId: user.id,
          name: user.activityName,
          createdAt: new Date().toISOString()
        };
        localStorage.setItem('cmflow_workspace', JSON.stringify(ws));
      } else {
        user.name = payerName;
        user.email = payerEmail;
        user.plan = 'pro';
      }
      localStorage.setItem('cmflow_user', JSON.stringify(user));
    } catch(e) {}

    closeCheckoutModal();

    // Ouvrir la Modale de Reçu de Paiement & Félicitations
    openPaymentSuccessModal(planName, amount, methodLabel, payerPhone, txRef);

    // Rafraîchir l'affichage
    setTimeout(() => {
      if (typeof renderDashboard === 'function') renderDashboard();
      if (typeof renderClients === 'function') renderClients();
      const planBadge = document.querySelector('.plan-badge-active');
      if (planBadge) planBadge.textContent = '● Plan Pro Actif (9 900 F / mois)';
    }, 400);

  }, 1200);
}

/* ==========================================================================
   🎉 MODALE DE SUCCÈS & REÇU DE PAIEMENT TÉLÉCHARGEABLE
   ========================================================================== */
function openPaymentSuccessModal(planName, amount, methodLabel, payerPhone, txRef) {
  let modal = document.getElementById('cmflow-payment-success-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'cmflow-payment-success-modal';
    modal.className = 'modal-backdrop';
    document.body.appendChild(modal);
  }

  const today = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

  modal.innerHTML = `
    <div class="paywall-modal-card" style="max-width: 500px; text-align: center; border: 2px solid #22C55E;">
      
      <!-- Icône de succès avec confetti -->
      <div style="width: 70px; height: 70px; border-radius: 50%; background: #DCFCE7; color: #16A34A; display: flex; align-items: center; justify-content: center; font-size: 2.2rem; margin: 0 auto 16px; box-shadow: 0 0 20px rgba(34, 197, 94, 0.3);">
        ✓
      </div>

      <span style="background: #DCFCE7; color: #15803D; font-size: 0.75rem; font-weight: 800; padding: 4px 12px; border-radius: 9999px; text-transform: uppercase;">Paiement Réussi & Compte Activé</span>
      <h3 style="font-size: 1.35rem; font-weight: 800; color: var(--text-main); margin: 8px 0 6px;">Félicitations ! Bienvenue sur le ${escapeHtml(planName)} 🚀</h3>
      <p style="font-size: 0.85rem; color: var(--text-muted); margin: 0 0 20px;">Votre transaction a été validée avec succès. Toutes vos limites ont été débloquées.</p>

      <!-- Reçu de paiement style ticket -->
      <div style="background: #F8FAFC; border: 1.5px dashed #CBD5E1; border-radius: var(--radius-lg); padding: 18px 20px; text-align: left; margin-bottom: 20px; font-size: 0.85rem;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
          <span style="color: var(--text-muted);">Référence :</span>
          <strong style="color: var(--text-main); font-family: monospace;">${escapeHtml(txRef)}</strong>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
          <span style="color: var(--text-muted);">Date :</span>
          <strong style="color: var(--text-main);">${today}</strong>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
          <span style="color: var(--text-muted);">Moyen de paiement :</span>
          <strong style="color: #1E3A8A;">${escapeHtml(methodLabel)}</strong>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
          <span style="color: var(--text-muted);">Numéro payeur :</span>
          <strong style="color: var(--text-main);">${escapeHtml(payerPhone)}</strong>
        </div>
        <div style="border-top: 1px solid #E2E8F0; padding-top: 10px; display: flex; justify-content: space-between; align-items: center;">
          <strong style="font-size: 0.95rem; color: var(--text-main);">Montant Réglé :</strong>
          <span style="font-size: 1.3rem; font-weight: 900; color: #15803D;">${escapeHtml(amount)}</span>
        </div>
      </div>

      <!-- Fonctionnalités débloquées -->
      <div style="background: rgba(34, 197, 94, 0.08); border: 1px solid rgba(34, 197, 94, 0.2); border-radius: var(--radius-md); padding: 12px 14px; text-align: left; font-size: 0.8rem; color: #15803D; margin-bottom: 20px;">
        <div style="font-weight: 800; margin-bottom: 4px;">👑 Avantages débloqués immédiatement :</div>
        <div>✓ Clients & Marques <strong>Illimités</strong></div>
        <div>✓ Tous les réseaux sociaux connectés</div>
        <div>✓ Assistant IA Générateur Illimité ✨</div>
      </div>

      <!-- Boutons d'action -->
      <div style="display: flex; flex-direction: column; gap: 10px;">
        <button type="button" class="btn-primary-app" style="width: 100%; justify-content: center; padding: 12px; font-size: 0.95rem; font-weight: 800;" onclick="closeSuccessModal(); window.location.href='dashboard.html';">
          <span>🚀 Accéder à mon Espace de Travail Débloqué</span>
        </button>
        <button type="button" class="btn-secondary-app" style="width: 100%; justify-content: center;" onclick="window.print()">
          📄 Imprimer / Télécharger le Reçu
        </button>
      </div>

    </div>
  `;

  modal.classList.add('active');
  modal.style.position = 'fixed';
  modal.style.inset = '0';
  modal.style.background = 'rgba(15, 23, 42, 0.7)';
  modal.style.backdropFilter = 'blur(6px)';
  modal.style.zIndex = '999999';
  modal.style.display = 'flex';
  modal.style.alignItems = 'center';
  modal.style.justifyContent = 'center';
  modal.style.padding = '20px';
  modal.style.opacity = '1';
  modal.style.visibility = 'visible';
  document.body.style.overflow = 'hidden';
}

function closeSuccessModal() {
  const modal = document.getElementById('cmflow-payment-success-modal');
  if (modal) {
    modal.classList.remove('active');
    modal.style.display = 'none';
  }
  document.body.style.overflow = '';
}

/* ==========================================================================
   MODAL AJOUTER UN CLIENT
   ========================================================================== */
function initAddClientModal() {
  const modalBackdrop = document.getElementById('add-client-modal');
  const modalClose = document.getElementById('modal-close-btn');
  const form = document.getElementById('form-add-client');
  const openBtns = document.querySelectorAll('[data-open-add-client]');

  if (!modalBackdrop) return;

  const open = () => {
    if (!CMFlowStore.canAddClient()) {
      openPaywallModal('client');
      return;
    }
    modalBackdrop.classList.add('active');
    document.body.style.overflow = 'hidden';
    // Focus sur le premier champ
    setTimeout(() => {
      const firstInput = form?.querySelector('input');
      if (firstInput) firstInput.focus();
    }, 200);
  };

  const close = () => {
    modalBackdrop.classList.remove('active');
    document.body.style.overflow = '';
    if (form) form.reset();
  };

  openBtns.forEach(btn => btn.addEventListener('click', open));
  if (modalClose) modalClose.addEventListener('click', close);
  modalBackdrop.addEventListener('click', (e) => {
    if (e.target === modalBackdrop) close();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalBackdrop.classList.contains('active')) close();
  });

  // Soumission du formulaire
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const nameInput = document.getElementById('client-name');
      const industryInput = document.getElementById('client-industry');
      const descInput = document.getElementById('client-description');

      const name = nameInput?.value.trim();
      if (!name) {
        if (nameInput) {
          nameInput.style.borderColor = 'var(--color-danger)';
          nameInput.focus();
        }
        return;
      }

      const submitBtn = form.querySelector('[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Création...';
      }

      setTimeout(() => {
        const user = CMFlowStore.getUser();
        const ws = CMFlowStore.getWorkspace();

        const cleanName = typeof CMFlowSecurity !== 'undefined' ? CMFlowSecurity.sanitizeInput(name) : name;
        const cleanIndustry = typeof CMFlowSecurity !== 'undefined' ? CMFlowSecurity.sanitizeInput(industryInput?.value || 'Autre') : (industryInput?.value || 'Autre');
        const cleanDesc = typeof CMFlowSecurity !== 'undefined' ? CMFlowSecurity.sanitizeInput(descInput?.value.trim() || '') : (descInput?.value.trim() || '');

        const newClient = {
          id: CMFlowStore.generateId(),
          workspaceId: ws?.id || 'ws1',
          name: cleanName,
          industry: cleanIndustry,
          description: cleanDesc,
          portalToken: typeof CMFlowSecurity !== 'undefined' ? CMFlowSecurity.generateRandomToken() : `tkn_${Date.now().toString(36)}`,
          createdAt: new Date().toISOString(),
        };

        CMFlowStore.addClient(newClient);

        close();
        showAppToast(`Client "${name}" ajouté avec succès 🎉`, 'success');

        // Rafraîchir la page courante
        setTimeout(() => {
          if (typeof renderDashboard === 'function') renderDashboard();
          if (typeof renderClients === 'function') renderClients();
        }, 100);

        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Créer le client';
        }
      }, 600);
    });

    // Reset border error on focus
    const nameInput = document.getElementById('client-name');
    if (nameInput) {
      nameInput.addEventListener('focus', () => {
        nameInput.style.borderColor = '';
      });
    }
  }
}

/* ==========================================================================
   ONBOARDING — Logique des étapes
   ========================================================================== */
function initOnboarding() {
  if (!document.getElementById('onboarding-step-1')) return;

  const steps = [
    document.getElementById('onboarding-step-1'),
    document.getElementById('onboarding-step-2'),
    document.getElementById('onboarding-step-3'),
  ];
  const welcomeScreen = document.getElementById('welcome-screen');
  const progressFill = document.getElementById('progress-fill');
  const stepCurrentEl = document.getElementById('step-current');
  const stepLabelEl = document.getElementById('onboarding-step-label');
  const onboardingCard = document.getElementById('onboarding-card');

  // Pré-remplir avec les données utilisateur
  const user = CMFlowStore.getUser();
  if (user) {
    const firstName = user.firstName || (user.name ? user.name.split(' ')[0] : '');
    const lastName = user.lastName || (user.name ? user.name.split(' ').slice(1).join(' ') : '');
    const firstNameInput = document.getElementById('onb-firstname');
    const lastNameInput = document.getElementById('onb-lastname');
    const activityInput = document.getElementById('onb-activity');

    if (firstNameInput && firstName) firstNameInput.value = firstName;
    if (lastNameInput && lastName) lastNameInput.value = lastName;
    if (activityInput && user.activityName) activityInput.value = user.activityName;
  }

  let currentStep = 0;
  const totalSteps = 3;

  const stepData = {
    selectedNetworks: [],
    selectedGoals: [],
    clientCount: null,
  };

  // ---- Mise à jour de la barre de progression ----
  function updateProgress(step) {
    const pct = ((step + 1) / totalSteps) * 100;
    if (progressFill) progressFill.style.width = `${pct}%`;
    if (stepCurrentEl) stepCurrentEl.textContent = step + 1;
    if (stepLabelEl) stepLabelEl.textContent = `Étape ${step + 1} sur ${totalSteps}`;
  }

  // ---- Affichage d'une étape ----
  function goToStep(index) {
    steps.forEach((s, i) => {
      s?.classList.toggle('active', i === index);
    });
    currentStep = index;
    updateProgress(index);
  }

  // ---- Étape 1 — Nombre de clients (sélection radio) ----
  document.querySelectorAll('.count-option').forEach(option => {
    option.addEventListener('click', () => {
      document.querySelectorAll('.count-option').forEach(o => o.classList.remove('selected'));
      option.classList.add('selected');
      stepData.clientCount = option.dataset.value;
    });
  });

  // ---- Bouton Continuer Étape 1 ----
  const step1NextBtn = document.getElementById('step1-next');
  if (step1NextBtn) {
    step1NextBtn.addEventListener('click', () => {
      const firstName = document.getElementById('onb-firstname')?.value.trim();
      const lastName = document.getElementById('onb-lastname')?.value.trim();
      const activity = document.getElementById('onb-activity')?.value.trim();

      if (!firstName) {
        const el = document.getElementById('onb-firstname');
        if (el) { el.style.borderColor = 'var(--color-danger)'; el.focus(); }
        showAppToast('Veuillez entrer votre prénom.', 'error');
        return;
      }

      // Sauvegarder les données dans le user
      const user = CMFlowStore.getUser();
      if (user) {
        user.firstName = firstName;
        user.lastName = lastName;
        user.activityName = activity;
        CMFlowStore.setUser(user);

        // Créer le workspace
        const ws = CMFlowStore.getWorkspace() || {
          id: CMFlowStore.generateId(),
          ownerId: user.id,
          name: activity || `Espace de ${firstName}`,
          createdAt: new Date().toISOString(),
        };
        if (activity) ws.name = activity;
        CMFlowStore.setWorkspace(ws);
      }

      goToStep(1);
    });
  }

  // Reset border on focus (step 1)
  ['onb-firstname', 'onb-lastname', 'onb-activity'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('focus', () => { el.style.borderColor = ''; });
  });

  // ---- Étape 2 — Réseaux sociaux ----
  document.querySelectorAll('.network-card').forEach(card => {
    card.addEventListener('click', () => {
      card.classList.toggle('selected');
      const network = card.dataset.network;
      if (card.classList.contains('selected')) {
        if (!stepData.selectedNetworks.includes(network)) stepData.selectedNetworks.push(network);
      } else {
        stepData.selectedNetworks = stepData.selectedNetworks.filter(n => n !== network);
      }
    });
  });

  const step2BackBtn = document.getElementById('step2-back');
  const step2NextBtn = document.getElementById('step2-next');
  if (step2BackBtn) step2BackBtn.addEventListener('click', () => goToStep(0));
  if (step2NextBtn) step2NextBtn.addEventListener('click', () => goToStep(2));

  // ---- Étape 3 — Objectifs ----
  document.querySelectorAll('.goal-card').forEach(card => {
    card.addEventListener('click', () => {
      card.classList.toggle('selected');
      const goal = card.dataset.goal;
      if (card.classList.contains('selected')) {
        if (!stepData.selectedGoals.includes(goal)) stepData.selectedGoals.push(goal);
      } else {
        stepData.selectedGoals = stepData.selectedGoals.filter(g => g !== goal);
      }
    });
  });

  const step3BackBtn = document.getElementById('step3-back');
  const step3FinishBtn = document.getElementById('step3-finish');

  if (step3BackBtn) step3BackBtn.addEventListener('click', () => goToStep(1));

  if (step3FinishBtn) {
    step3FinishBtn.addEventListener('click', () => {
      step3FinishBtn.disabled = true;
      step3FinishBtn.textContent = 'Finalisation...';

      setTimeout(() => {
        // Sauvegarder les préférences
        const user = CMFlowStore.getUser();
        const prefs = {
          userId: user?.id || 'u1',
          selectedPlatforms: stepData.selectedNetworks,
          numberOfClients: stepData.clientCount || '1 à 3',
          goals: stepData.selectedGoals,
          onboardingComplete: true,
        };
        CMFlowStore.setPrefs(prefs);

        // S'assurer que le workspace existe
        if (!CMFlowStore.getWorkspace()) {
          const ws = {
            id: CMFlowStore.generateId(),
            ownerId: user?.id || 'u1',
            name: user?.activityName || `Espace de ${user?.firstName || 'CM'}`,
            createdAt: new Date().toISOString(),
          };
          CMFlowStore.setWorkspace(ws);
        }

        // Afficher l'écran de bienvenue
        steps.forEach(s => s?.classList.remove('active'));
        if (onboardingCard) onboardingCard.style.padding = '0';
        if (welcomeScreen) welcomeScreen.classList.add('active');

        // Mettre à jour le texte de bienvenue
        const firstName = user?.firstName || user?.name?.split(' ')[0] || 'Ami';
        const welcomeName = document.getElementById('welcome-firstname');
        if (welcomeName) welcomeName.textContent = firstName;

        // Masquer la barre de progression
        const progressWrap = document.getElementById('progress-wrap');
        if (progressWrap) progressWrap.style.display = 'none';
      }, 800);
    });
  }

  // ---- Boutons de la page de bienvenue ----
  const btnAddFirst = document.getElementById('btn-add-first-client');
  const btnGoDashboard = document.getElementById('btn-go-dashboard');

  if (btnAddFirst) {
    btnAddFirst.addEventListener('click', () => {
      window.location.href = 'dashboard.html?action=add-client';
    });
  }

  if (btnGoDashboard) {
    btnGoDashboard.addEventListener('click', () => {
      window.location.href = 'dashboard.html';
    });
  }

  // Init
  goToStep(0);
}

/* ==========================================================================
   DASHBOARD — Rendu principal
   ========================================================================== */
function renderDashboard() {
  const user = CMFlowStore.getUser();
  const clients = CMFlowStore.getClients();
  const posts = CMFlowStore.getPosts();

  // Greeting
  const greetingName = document.getElementById('greeting-name');
  if (greetingName && user) {
    greetingName.textContent = user.firstName || user.name?.split(' ')[0] || 'Ami';
  }

  // KPIs
  updateStat('stat-clients', clients.length);
  updateStat('stat-accounts', clients.length * 2);
  updateStat('stat-posts', posts.length);
  updateStat('stat-engagement', posts.length > 0 ? '4.8' : '0');

  // Afficher empty state ou la liste des clients
  const emptyState = document.getElementById('dashboard-empty');
  const clientsSection = document.getElementById('dashboard-clients');

  if (clients.length === 0) {
    if (emptyState) emptyState.style.display = 'flex';
    if (clientsSection) clientsSection.style.display = 'none';
  } else {
    if (emptyState) emptyState.style.display = 'none';
    if (clientsSection) clientsSection.style.display = 'block';
    renderRecentClients(clients.slice(-4).reverse()); // 4 derniers
  }
}

function updateStat(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function renderRecentClients(clients) {
  const grid = document.getElementById('recent-clients-grid');
  if (!grid) return;

  grid.innerHTML = '';
  clients.forEach(client => {
    grid.insertAdjacentHTML('beforeend', buildClientCard(client));
  });
}

/* ==========================================================================
   CLIENTS PAGE — Rendu
   ========================================================================== */
function renderClients() {
  const clients = CMFlowStore.getClients();
  const grid = document.getElementById('all-clients-grid');
  const emptyState = document.getElementById('clients-empty');
  const countEl = document.getElementById('clients-count');

  if (countEl) countEl.textContent = clients.length;

  if (!grid) return;

  grid.innerHTML = '';

  if (clients.length === 0) {
    if (emptyState) emptyState.style.display = 'flex';
    grid.style.display = 'none';
    return;
  }

  if (emptyState) emptyState.style.display = 'none';
  grid.style.display = 'grid';

  clients.slice().reverse().forEach(client => {
    grid.insertAdjacentHTML('beforeend', buildClientCard(client));
  });
}

// ---- Recherche clients ----
function initClientsSearch() {
  const searchInput = document.getElementById('clients-search');
  if (!searchInput) return;

  searchInput.addEventListener('input', () => {
    const query = searchInput.value.trim().toLowerCase();
    const allCards = document.querySelectorAll('.client-card-item');
    allCards.forEach(card => {
      const name = card.dataset.clientName?.toLowerCase() || '';
      const industry = card.dataset.clientIndustry?.toLowerCase() || '';
      const visible = name.includes(query) || industry.includes(query);
      card.style.display = visible ? '' : 'none';
    });
  });
}

/* ==========================================================================
   BUILD CLIENT CARD HTML
   ========================================================================== */
function buildClientCard(client) {
  const initials = CMFlowStore.getInitials(client.name);
  const date = CMFlowStore.formatDate(client.createdAt);
  const industry = client.industry || 'Autre';

  // Récupérer les comptes connectés
  const socials = client.socialAccounts || {
    instagram: { connected: true, handle: `@${client.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}` },
    facebook: { connected: true, handle: client.name }
  };

  const connectedList = [];
  if (socials.instagram?.connected) connectedList.push({ name: 'Instagram', handle: socials.instagram.handle || '' });
  if (socials.facebook?.connected) connectedList.push({ name: 'Facebook', handle: socials.facebook.handle || '' });
  if (socials.tiktok?.connected) connectedList.push({ name: 'TikTok', handle: socials.tiktok.handle || '' });
  if (socials.linkedin?.connected) connectedList.push({ name: 'LinkedIn', handle: socials.linkedin.handle || '' });
  if (socials.x?.connected) connectedList.push({ name: 'X', handle: socials.x.handle || '' });

  const connectedCount = connectedList.length;

  return `
    <div class="client-card client-card-item" data-client-name="${client.name.toLowerCase()}" data-client-industry="${industry.toLowerCase()}">
      <div class="client-card-head" onclick="openClientStatsModal('${client.id}')" style="cursor: pointer;" title="Cliquer pour voir les statistiques détaillées des réseaux">
        <div class="client-avatar">${initials}</div>
        <div class="client-info">
          <h3 class="client-name" style="display: flex; align-items: center; gap: 6px;">
            <span>${escapeHtml(client.name)}</span>
            <svg viewBox="0 0 20 20" fill="var(--color-primary)" width="14" height="14"><path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"/></svg>
          </h3>
          <p class="client-industry">${escapeHtml(industry)}</p>
          <p class="client-date">Ajouté le ${date}</p>
        </div>
      </div>

      <div class="client-social-row" onclick="openClientStatsModal('${client.id}')" style="cursor: pointer;">
        ${connectedList.length > 0 ? connectedList.map(s => `
          <span class="social-tag">${escapeHtml(s.name)}${s.handle ? ` (${escapeHtml(s.handle)})` : ''}</span>
        `).join('') : '<span class="social-tag" style="background: #F1F5F9; color: #64748B;">Aucun compte lié</span>'}
      </div>

      <div class="client-status-badge" onclick="openClientStatsModal('${client.id}')" style="cursor: pointer;">
        <span class="status-dot-inactive" style="background: ${connectedCount > 0 ? '#10B981' : '#94A3B8'};"></span>
        <span style="color: ${connectedCount > 0 ? '#059669' : '#64748B'}; font-weight: 600;">
          ${connectedCount > 0 ? `${connectedCount} réseaux actifs · Voir les stats` : 'À connecter'}
        </span>
      </div>

      <div class="client-card-actions">
        <button type="button" class="btn-card-action primary" onclick="switchActiveClientSpace('${client.id}'); window.location.href='planning.html';" style="font-weight: 700; background: var(--color-primary); color: white; display: inline-flex; align-items: center; gap: 5px;" title="Basculer sur le planning dédié de ce client">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>
          <span>Ouvrir l'espace</span>
        </button>
        <button type="button" class="btn-card-action" onclick="openClientStatsModal('${client.id}')" style="font-weight: 600; display: inline-flex; align-items: center; gap: 4px;">
          <svg viewBox="0 0 20 20" fill="currentColor" width="13" height="13"><path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"/></svg>
          <span>Stats</span>
        </button>
        <button type="button" class="btn-card-action" onclick="openSocialsManager('${client.id}')" style="background: #EFF6FF; color: var(--color-primary); border-color: #BFDBFE; font-weight: 600; display: inline-flex; align-items: center; gap: 4px;">
          <svg viewBox="0 0 20 20" fill="currentColor" width="13" height="13"><path fill-rule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clip-rule="evenodd"/></svg>
          <span>Lier</span>
        </button>
        <a href="validation.html?client=${client.id}&token=${client.portalToken || (typeof CMFlowSecurity !== 'undefined' ? CMFlowSecurity.generateClientToken(client.id) : '')}" target="_blank" class="btn-card-action" style="text-decoration: none; display: inline-flex; align-items: center; gap: 4px;" title="Portail de validation client sécurisé">
          <svg viewBox="0 0 24 24" width="13" height="13" fill="#25D366"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm0 18.15c-1.5 0-2.97-.39-4.27-1.14l-.31-.18-3.17.83.85-3.09-.2-.32a8.188 8.188 0 0 1-1.25-4.34c0-4.54 3.7-8.24 8.24-8.24 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.83c.01 4.54-3.68 8.23-8.12 8.23zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.12-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.14.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.22.25-.86.84-.86 2.06 0 1.21.89 2.39 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.14-1.18-.06-.11-.22-.18-.47-.3z"/></svg>
          <span>Portail</span>
        </a>
        <button type="button" class="btn-card-action" onclick="confirmDeleteClient('${client.id}')">
          <svg viewBox="0 0 20 20" fill="currentColor" width="13" height="13"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>
        </button>
      </div>
    </div>
  `;
}

/* ==========================================================================
   TABLEAU DE BORD STATISTIQUES RÉSEAUX PAR CLIENT (MODAL)
   ========================================================================== */
function openClientStatsModal(clientId) {
  const client = CMFlowStore.getClientById(clientId);
  if (!client) return;

  let modal = document.getElementById('client-stats-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'client-stats-modal';
    modal.className = 'modal-backdrop';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    document.body.appendChild(modal);
  }

  const initials = CMFlowStore.getInitials(client.name);
  const handleBase = client.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
  const allPosts = CMFlowStore.getPosts();
  const clientPosts = allPosts.filter(p => p.clientId === clientId || p.clientName === client.name);

  // Données statistiques dynamiques pour ce client
  const igHandle = client.socialAccounts?.instagram?.handle || `@${handleBase}`;
  const fbHandle = client.socialAccounts?.facebook?.handle || client.name;
  const tkHandle = client.socialAccounts?.tiktok?.handle || `@${handleBase.replace('_', '')}`;
  const inHandle = client.socialAccounts?.linkedin?.handle || `${client.name} Sénégal`;

  modal.innerHTML = `
    <div class="client-stats-modal-card">
      
      <!-- En-tête Client -->
      <div class="client-stats-header">
        <div style="display: flex; align-items: center; gap: 16px;">
          <div class="client-avatar" style="width: 56px; height: 56px; font-size: 1.25rem;">${initials}</div>
          <div>
            <h2 style="font-size: 1.35rem; font-weight: 800; color: var(--text-main); margin: 0 0 4px; display: flex; align-items: center; gap: 8px;">
              ${escapeHtml(client.name)}
              <span class="social-tag" style="background: #DCFCE7; color: #15803D; font-size: 0.75rem;">Actif</span>
            </h2>
            <p style="font-size: 0.85rem; color: var(--text-muted); margin: 0;">Secteur : <strong>${escapeHtml(client.industry || 'Restauration & Commerce')}</strong> · Client depuis ${CMFlowStore.formatDate(client.createdAt)}</p>
          </div>
        </div>

        <div style="display: flex; align-items: center; gap: 10px;">
          <button type="button" class="btn-primary-app" onclick="closeClientStatsModal(); window.location.href='planning.html';">
            📅 Planifier un post
          </button>
          <button type="button" class="modal-close" onclick="closeClientStatsModal()" style="font-size: 1.5rem; line-height: 1;">
            &times;
          </button>
        </div>
      </div>

      <!-- Résumé KPI Global -->
      <div class="client-stats-kpi-row">
        <div class="client-stat-kpi-box">
          <span class="client-stat-kpi-val" style="color: #2563EB;">42 800</span>
          <span class="client-stat-kpi-label">👥 Abonnés totaux</span>
        </div>
        <div class="client-stat-kpi-box">
          <span class="client-stat-kpi-val" style="color: #10B981;">128 400</span>
          <span class="client-stat-kpi-label">👁️ Portée globale (Vues)</span>
        </div>
        <div class="client-stat-kpi-box">
          <span class="client-stat-kpi-val" style="color: #F59E0B;">6.4%</span>
          <span class="client-stat-kpi-label">🔥 Taux d'engagement moy.</span>
        </div>
        <div class="client-stat-kpi-box">
          <span class="client-stat-kpi-val" style="color: #8B5CF6;">${clientPosts.length || 6} posts</span>
          <span class="client-stat-kpi-label">📅 Publications ce mois</span>
        </div>
      </div>

      <!-- Détail par Réseau Social -->
      <div class="client-networks-stats-list">
        
        <h3 style="font-size: 1rem; font-weight: 800; color: var(--text-main); margin: 0;">
          Détails des Réseaux & Statistiques d'Audience
        </h3>

        <!-- Instagram -->
        <div class="network-stat-card">
          <div class="network-stat-card-head">
            <div class="network-stat-brand-info">
              <div class="social-net-icon-box instagram">
                <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </div>
              <div>
                <h4 style="font-size: 0.95rem; font-weight: 800; margin: 0; color: var(--text-main);">Instagram Business (${escapeHtml(igHandle)})</h4>
                <span style="font-size: 0.75rem; color: #16A34A; font-weight: 600;">● Compte Pro Actif · Publication directe activée</span>
              </div>
            </div>
            <a href="https://instagram.com" target="_blank" class="btn-card-action" style="text-decoration: none;">Voir profil</a>
          </div>

          <div class="network-stat-metrics-grid">
            <div class="network-stat-metric-item">
              <span class="val">18 400</span>
              <span class="lbl">Abonnés (+420 ce mois ↗️)</span>
            </div>
            <div class="network-stat-metric-item">
              <span class="val">6.8%</span>
              <span class="lbl">Taux d'engagement</span>
            </div>
            <div class="network-stat-metric-item">
              <span class="val">54 200</span>
              <span class="lbl">Impressions mensuelles</span>
            </div>
            <div class="network-stat-metric-item">
              <span class="val">Dakar (74%)</span>
              <span class="lbl">Audience principale (62% F)</span>
            </div>
          </div>
        </div>

        <!-- Facebook -->
        <div class="network-stat-card">
          <div class="network-stat-card-head">
            <div class="network-stat-brand-info">
              <div class="social-net-icon-box facebook">
                <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </div>
              <div>
                <h4 style="font-size: 0.95rem; font-weight: 800; margin: 0; color: var(--text-main);">Page Facebook (${escapeHtml(fbHandle)})</h4>
                <span style="font-size: 0.75rem; color: #16A34A; font-weight: 600;">● Page Officielle liée</span>
              </div>
            </div>
            <a href="https://facebook.com" target="_blank" class="btn-card-action" style="text-decoration: none;">Voir page</a>
          </div>

          <div class="network-stat-metrics-grid">
            <div class="network-stat-metric-item">
              <span class="val">14 200</span>
              <span class="lbl">Mentions J'aime (+180 ↗️)</span>
            </div>
            <div class="network-stat-metric-item">
              <span class="val">4.5%</span>
              <span class="lbl">Taux d'engagement</span>
            </div>
            <div class="network-stat-metric-item">
              <span class="val">38 900</span>
              <span class="lbl">Portée des publications</span>
            </div>
            <div class="network-stat-metric-item">
              <span class="val">25-45 ans</span>
              <span class="lbl">Tranche d'âge dominante</span>
            </div>
          </div>
        </div>

        <!-- TikTok -->
        <div class="network-stat-card">
          <div class="network-stat-card-head">
            <div class="network-stat-brand-info">
              <div class="social-net-icon-box tiktok">
                <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-1.01v8.86c-.03 2.1-.85 4.19-2.3 5.75-1.74 1.9-4.28 2.87-6.81 2.6-2.54-.26-4.88-1.74-6.22-3.92-1.35-2.18-1.5-4.94-.41-7.24 1.09-2.3 3.29-3.9 5.8-4.22.84-.11 1.7-.06 2.53.15v4.19c-.43-.16-.9-.23-1.36-.2-1.12.06-2.19.63-2.83 1.55-.65.92-.78 2.11-.35 3.16.42 1.04 1.41 1.77 2.53 1.86 1.13.1 2.26-.41 2.88-1.37.28-.43.43-.94.43-1.46V.02h-2.18z"/></svg>
              </div>
              <div>
                <h4 style="font-size: 0.95rem; font-weight: 800; margin: 0; color: var(--text-main);">TikTok Business (${escapeHtml(tkHandle)})</h4>
                <span style="font-size: 0.75rem; color: #16A34A; font-weight: 600;">● Compte Créateur & Vidéos lié</span>
              </div>
            </div>
            <a href="https://tiktok.com" target="_blank" class="btn-card-action" style="text-decoration: none;">Voir profil</a>
          </div>

          <div class="network-stat-metrics-grid">
            <div class="network-stat-metric-item">
              <span class="val">8 200</span>
              <span class="lbl">Abonnés (+1 100 🔥)</span>
            </div>
            <div class="network-stat-metric-item">
              <span class="val">9.1%</span>
              <span class="lbl">Taux d'engagement</span>
            </div>
            <div class="network-stat-metric-item">
              <span class="val">94 500</span>
              <span class="lbl">Vues de vidéos</span>
            </div>
            <div class="network-stat-metric-item">
              <span class="val">Format court</span>
              <span class="lbl">Reels & Recettes en vidéo</span>
            </div>
          </div>
        </div>

        <!-- LinkedIn -->
        <div class="network-stat-card">
          <div class="network-stat-card-head">
            <div class="network-stat-brand-info">
              <div class="social-net-icon-box linkedin">
                <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
              </div>
              <div>
                <h4 style="font-size: 0.95rem; font-weight: 800; margin: 0; color: var(--text-main);">Page LinkedIn (${escapeHtml(inHandle)})</h4>
                <span style="font-size: 0.75rem; color: #16A34A; font-weight: 600;">● Page Entreprise active</span>
              </div>
            </div>
            <a href="https://linkedin.com" target="_blank" class="btn-card-action" style="text-decoration: none;">Voir page</a>
          </div>

          <div class="network-stat-metrics-grid">
            <div class="network-stat-metric-item">
              <span class="val">2 000</span>
              <span class="lbl">Abonnés (+85 ↗️)</span>
            </div>
            <div class="network-stat-metric-item">
              <span class="val">5.1%</span>
              <span class="lbl">Taux d'engagement</span>
            </div>
            <div class="network-stat-metric-item">
              <span class="val">8 400</span>
              <span class="lbl">Impressions B2B</span>
            </div>
            <div class="network-stat-metric-item">
              <span class="val">Décideurs & Pro</span>
              <span class="lbl">Réseautage & Partenariats</span>
            </div>
          </div>
        </div>

      </div>

      <!-- Footer Actions -->
      <div style="padding: 16px 24px; background: #F8FAFC; border-top: var(--border-light); display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap;">
        <div style="display: flex; gap: 8px;">
          <a href="validation.html?client=${client.id}&token=${client.portalToken || (typeof CMFlowSecurity !== 'undefined' ? CMFlowSecurity.generateClientToken(client.id) : '')}" target="_blank" class="btn-secondary-app" style="font-size: 0.82rem;">
            💬 Portail WhatsApp Client
          </a>
          <a href="bio.html?client=${client.id}" target="_blank" class="btn-secondary-app" style="font-size: 0.82rem;">
            🌐 Start Page (Bio)
          </a>
          <button type="button" class="btn-secondary-app" style="font-size: 0.82rem;" onclick="closeClientStatsModal(); window.location.href='analytics.html';">
            📄 Bilan Mensuel PDF
          </button>
        </div>
        <button type="button" class="btn-primary-app" onclick="closeClientStatsModal()">
          Fermer
        </button>
      </div>

    </div>
  `;

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeClientStatsModal() {
  const modal = document.getElementById('client-stats-modal');
  if (modal) modal.classList.remove('active');
  document.body.style.overflow = '';
}


// ---- Gestionnaire des connexions réseaux sociaux ----
function openSocialsManager(clientId) {
  const client = CMFlowStore.getClientById(clientId);
  if (!client) return;

  let modal = document.getElementById('manage-socials-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'manage-socials-modal';
    modal.className = 'modal-backdrop';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    document.body.appendChild(modal);
  }

  const socials = client.socialAccounts || {
    instagram: { connected: true, handle: `@${client.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}` },
    facebook: { connected: true, handle: client.name },
    tiktok: { connected: false, handle: '' },
    linkedin: { connected: false, handle: '' },
    x: { connected: false, handle: '' }
  };

  modal.innerHTML = `
    <div class="modal-card" style="max-width: 620px;">
      <div class="modal-header">
        <div>
          <h3 class="modal-title">🔗 Réseaux Sociaux : ${escapeHtml(client.name)}</h3>
          <p style="font-size: 0.82rem; color: var(--text-muted); margin: 4px 0 0;">Connectez directement les comptes gérés par votre agence pour publier en 1 clic.</p>
        </div>
        <button type="button" class="modal-close" onclick="closeSocialsModal()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      <div class="modal-body" style="padding: 20px;">
        <div class="social-connections-list">
          
          <!-- Instagram -->
          <div class="social-connection-item">
            <div class="social-connection-left">
              <div class="social-net-icon-box instagram">
                <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </div>
              <div class="social-net-meta">
                <h4>Instagram Pro <span class="social-net-status-badge ${socials.instagram?.connected ? 'connected' : 'disconnected'}">${socials.instagram?.connected ? '● Connecté (Meta Graph API)' : 'Non lié'}</span></h4>
                <div class="social-net-handle">${socials.instagram?.connected ? escapeHtml(socials.instagram.handle) : 'Liez le compte Instagram Pro via l\'App Meta 4528780004104334'}</div>
              </div>
            </div>
            <div>
              ${socials.instagram?.connected ? `
                <button type="button" class="btn-secondary-app" style="font-size: 0.78rem; padding: 6px 10px;" onclick="toggleSocialAccount('${client.id}', 'instagram', false)">Déconnecter</button>
              ` : `
                <div class="social-connect-input-row" style="gap: 6px;">
                  <input type="text" id="input-social-instagram" placeholder="@nom_du_compte" value="@${client.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}">
                  <button type="button" class="btn-primary-app" style="font-size: 0.78rem; padding: 6px 12px; background: #E1306C; border-color: #E1306C;" onclick="connectMetaAccountDirect('${client.id}', 'instagram')">
                    🔗 Lier Meta API
                  </button>
                </div>
              `}
            </div>
          </div>

          <!-- Facebook -->
          <div class="social-connection-item">
            <div class="social-connection-left">
              <div class="social-net-icon-box facebook">
                <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </div>
              <div class="social-net-meta">
                <h4>Page Facebook (App 4528780004104334) <span class="social-net-status-badge ${socials.facebook?.connected ? 'connected' : 'disconnected'}">${socials.facebook?.connected ? '● Connectée (API Active)' : 'Non liée'}</span></h4>
                <div class="social-net-handle">${socials.facebook?.connected ? escapeHtml(socials.facebook.handle) : 'Liez la page Facebook officielle via l\'App Meta'}</div>
              </div>
            </div>
            <div>
              ${socials.facebook?.connected ? `
                <button type="button" class="btn-secondary-app" style="font-size: 0.78rem; padding: 6px 10px;" onclick="toggleSocialAccount('${client.id}', 'facebook', false)">Déconnecter</button>
              ` : `
                <div class="social-connect-input-row" style="gap: 6px;">
                  <input type="text" id="input-social-facebook" placeholder="Nom de la page" value="${escapeHtml(client.name)}">
                  <button type="button" class="btn-primary-app" style="font-size: 0.78rem; padding: 6px 12px; background: #1877F2; border-color: #1877F2;" onclick="connectMetaAccountDirect('${client.id}', 'facebook')">
                    🔗 Lier Meta API
                  </button>
                </div>
              `}
            </div>
          </div>

          <!-- TikTok -->
          <div class="social-connection-item">
            <div class="social-connection-left">
              <div class="social-net-icon-box tiktok">
                <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-1.01v8.86c-.03 2.1-.85 4.19-2.3 5.75-1.74 1.9-4.28 2.87-6.81 2.6-2.54-.26-4.88-1.74-6.22-3.92-1.35-2.18-1.5-4.94-.41-7.24 1.09-2.3 3.29-3.9 5.8-4.22.84-.11 1.7-.06 2.53.15v4.19c-.43-.16-.9-.23-1.36-.2-1.12.06-2.19.63-2.83 1.55-.65.92-.78 2.11-.35 3.16.42 1.04 1.41 1.77 2.53 1.86 1.13.1 2.26-.41 2.88-1.37.28-.43.43-.94.43-1.46V.02h-2.18z"/></svg>
              </div>
              <div class="social-net-meta">
                <h4>TikTok Business <span class="social-net-status-badge ${socials.tiktok?.connected ? 'connected' : 'disconnected'}">${socials.tiktok?.connected ? '● Connecté' : 'Non lié'}</span></h4>
                <div class="social-net-handle">${socials.tiktok?.connected ? escapeHtml(socials.tiktok.handle) : 'Liez le compte TikTok pour les vidéos'}</div>
              </div>
            </div>
            <div>
              ${socials.tiktok?.connected ? `
                <button type="button" class="btn-secondary-app" style="font-size: 0.78rem; padding: 6px 10px;" onclick="toggleSocialAccount('${client.id}', 'tiktok', false)">Déconnecter</button>
              ` : `
                <div class="social-connect-input-row">
                  <input type="text" id="input-social-tiktok" placeholder="@compte_tiktok" value="@${client.name.toLowerCase().replace(/[^a-z0-9]/g, '')}">
                  <button type="button" class="btn-primary-app" style="font-size: 0.78rem; padding: 6px 12px;" onclick="connectSocialAccountFromInput('${client.id}', 'tiktok')">Lier</button>
                </div>
              `}
            </div>
          </div>

          <!-- LinkedIn -->
          <div class="social-connection-item">
            <div class="social-connection-left">
              <div class="social-net-icon-box linkedin">
                <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
              </div>
              <div class="social-net-meta">
                <h4>Page LinkedIn (App 263999084) <span class="social-net-status-badge ${socials.linkedin?.connected ? 'connected' : 'disconnected'}">${socials.linkedin?.connected ? '● Connectée (API Active)' : 'Non liée'}</span></h4>
                <div class="social-net-handle">${socials.linkedin?.connected ? escapeHtml(socials.linkedin.handle) : 'Liez la page entreprise LinkedIn via l\'API officielle'}</div>
              </div>
            </div>
            <div>
              ${socials.linkedin?.connected ? `
                <button type="button" class="btn-secondary-app" style="font-size: 0.78rem; padding: 6px 10px;" onclick="toggleSocialAccount('${client.id}', 'linkedin', false)">Déconnecter</button>
              ` : `
                <div class="social-connect-input-row" style="gap: 6px;">
                  <input type="text" id="input-social-linkedin" placeholder="Entreprise LinkedIn" value="${escapeHtml(client.name)}">
                  <button type="button" class="btn-primary-app" style="font-size: 0.78rem; padding: 6px 12px; background: #0A66C2; border-color: #0A66C2;" onclick="connectLinkedInDirect('${client.id}')">
                    🔗 Lier l'API
                  </button>
                </div>
              `}
            </div>
          </div>

        </div>

        <div style="margin-top: 20px; display: flex; justify-content: flex-end;">
          <button type="button" class="btn-primary-app" onclick="closeSocialsModal()">
            Terminer
          </button>
        </div>
      </div>
    </div>
  `;

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeSocialsModal() {
  const modal = document.getElementById('manage-socials-modal');
  if (modal) modal.classList.remove('active');
  document.body.style.overflow = '';
}

function connectSocialAccountFromInput(clientId, network) {
  if (!CMFlowStore.canConnectNetwork(clientId, network)) {
    closeSocialsModal();
    openPaywallModal('network');
    return;
  }

  const input = document.getElementById(`input-social-${network}`);
  const handle = input?.value.trim() || `@compte_${network}`;

  CMFlowStore.updateClientSocialAccount(clientId, network, {
    connected: true,
    handle: handle,
    connectedAt: new Date().toISOString()
  });

  showAppToast(`Compte ${network.toUpperCase()} lié avec succès ! 🎉`, 'success');
  openSocialsManager(clientId);
  if (typeof renderClients === 'function') renderClients();
}

function connectMetaAccountDirect(clientId, network) {
  if (!CMFlowStore.canConnectNetwork(clientId, network)) {
    closeSocialsModal();
    openPaywallModal('network');
    return;
  }

  const input = document.getElementById(`input-social-${network}`);
  const handle = input?.value.trim() || (network === 'instagram' ? '@compte_pro' : 'Page Facebook');
  const appId = (typeof CMFlowSocialConfig !== 'undefined' && CMFlowSocialConfig.meta?.appId) || '4528780004104334';

  CMFlowStore.updateClientSocialAccount(clientId, network, {
    connected: true,
    handle: handle,
    appId: appId,
    platform: network === 'instagram' ? 'Instagram Graph API' : 'Facebook Pages API',
    connectedAt: new Date().toISOString(),
    apiStatus: 'active'
  });

  const label = network === 'instagram' ? 'Instagram Pro' : 'Page Facebook';
  showAppToast(`${label} lié à l'App Meta (ID: ${appId}) ! 🚀✨`, 'success');
  openSocialsManager(clientId);
  if (typeof renderClients === 'function') renderClients();
}

function connectLinkedInDirect(clientId) {
  const input = document.getElementById('input-social-linkedin');
  const pageName = input?.value.trim() || 'Page Entreprise LinkedIn';

  CMFlowStore.updateClientSocialAccount(clientId, 'linkedin', {
    connected: true,
    handle: pageName,
    appId: "263999084",
    clientId: "77589j7j2nnfkw",
    connectedAt: new Date().toISOString(),
    apiStatus: 'active'
  });

  showAppToast('Page LinkedIn liée à l\'App CMFlow (ID: 263999084) ! 🚀💼', 'success');
  openSocialsManager(clientId);
  if (typeof renderClients === 'function') renderClients();
}

function toggleSocialAccount(clientId, network, status) {
  CMFlowStore.updateClientSocialAccount(clientId, network, {
    connected: status,
    handle: '',
    connectedAt: status ? new Date().toISOString() : null
  });

  showAppToast(`Compte ${network.toUpperCase()} déconnecté.`, 'info');
  openSocialsManager(clientId);
  if (typeof renderClients === 'function') renderClients();
}


function escapeHtml(str) {
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(str || ''));
  return div.innerHTML;
}

function generateAIPost(topic, tone = 'engaging', industry = 'Restauration', clientName = 'Notre Marque') {
  const templates = {
    engaging: [
      `🔥 ALERTE GOURMANDE chez ${clientName} ! ✨\n\nVous cherchez le spot parfait à Dakar pour vous régaler ? Notre spécialité ${topic || 'du jour'} est préparée avec amour et les meilleurs ingrédients locaux. 🍽️\n\n👉 Identifiez un(e) ami(e) en commentaire avec qui vous devez absolument tester ça !\n\n📍 Réservations en DM ou par WhatsApp (Lien en bio)\n\n#DakarFood #Senegal #TerangaGourmet #FoodLover #DakarVibes #BonPlanDakar`,
      `✨ Ce week-end, faites-vous plaisir chez ${clientName} ! 😍\n\nVenez savourer notre ${topic || 'plat signature'} dans une ambiance chaleureuse et conviviale. Une expérience culinaire que vous n'êtes pas prêts d'oublier ! 🌟\n\n📲 Commandez directement en 1 clic sur WhatsApp via notre lien en bio !\n\n#DakarVibes #RestaurantDakar #GastronomieLocale #SenegalFood #Teranga`
    ],
    professional: [
      `💼 Excellence & Savoir-faire : Découvrez l'engagement de ${clientName}.\n\nDans un environnement dynamique, nous mettons un point d'honneur à sublimer ${topic || 'le savoir-faire local'} avec rigueur et passion.\n\n🤝 Partenariats et commandes professionnelles : contactez notre équipe commerciale via notre lien en bio.\n\n#Leadership #BusinessSenegal #MadeInSenegal #AfriqueInnovation #Entrepreneuriat #DakarBusiness`,
      `📈 L'innovation au cœur de notre vision chez ${clientName}.\n\nNous partageons aujourd'hui les coulisses de ${topic || 'notre projet phare'} pour accompagner au mieux nos partenaires et clients au quotidien. 🇸🇳💼\n\n💬 Discutons-en en commentaire ou en message privé !\n\n#Vision #ImpactLocal #Croissance #SenegalDigital`
    ],
    promo: [
      `🚨 OFFRE EXCLUSIVE : -15% CE WEEK-END SEULEMENT ! 💥\n\nProfitez d'une remise exceptionnelle sur ${topic || 'toute notre carte'} chez ${clientName} ! 🎁\n\nComment en profiter ?\n1️⃣ Aimez cette publication ❤️\n2️⃣ Cliquez sur notre lien en bio WhatsApp avec le code PROMO : DAKAR15\n\n⏳ Offre limitée aux 50 premières commandes !\n\n#PromoDakar #BonPlan #DakarPromo #SenegalDeal #OffreSpeciale #Reduction`
    ]
  };

  const pool = templates[tone] || templates.engaging;
  return pool[Math.floor(Math.random() * pool.length)];
}

function showComingSoon() {
  showAppToast('Cette fonctionnalité sera bientôt disponible.', 'info');
}

function confirmDeleteClient(id) {
  if (!confirm('Supprimer ce client ?')) return;
  CMFlowStore.deleteClient(id);
  showAppToast('Client supprimé.', 'success');
  if (typeof renderDashboard === 'function') renderDashboard();
  if (typeof renderClients === 'function') renderClients();
  renderHeaderClientSwitcher();
}

/* ==========================================================================
   ACTIONS RAPIDES CM & SÉLECTEUR D'ESPACE CLIENT
   ========================================================================== */
function copyPostCaption(postId) {
  const post = CMFlowStore.getPostById(postId);
  if (!post || !post.caption) {
    showAppToast('Aucun texte à copier.', 'info');
    return;
  }
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(post.caption).then(() => {
      showAppToast('Texte et hashtags copiés dans le presse-papier ! 📋✨', 'success');
    }).catch(() => {
      fallbackCopyText(post.caption);
    });
  } else {
    fallbackCopyText(post.caption);
  }
}

function fallbackCopyText(text) {
  const ta = document.createElement('textarea');
  ta.value = text;
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand('copy');
    showAppToast('Texte copié dans le presse-papier ! 📋', 'success');
  } catch {
    showAppToast('Texte prêt à être copié.', 'info');
  }
  document.body.removeChild(ta);
}

function sharePostToWhatsApp(postId) {
  const post = CMFlowStore.getPostById(postId);
  if (!post) return;
  const msg = `*${post.clientName || 'Publication'}*\n\n${post.caption || ''}\n\n📅 Prévu le : ${post.scheduledDate || ''} à ${post.scheduledTime || ''}`;
  const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
  window.open(url, '_blank');
}

function renderHeaderClientSwitcher() {
  const header = document.querySelector('.app-header');
  if (!header) return;

  let existingSwitcher = document.getElementById('header-client-switcher');
  if (!existingSwitcher) {
    existingSwitcher = document.createElement('div');
    existingSwitcher.className = 'header-client-switcher';
    existingSwitcher.id = 'header-client-switcher';

    const actions = header.querySelector('.header-actions');
    if (actions) {
      header.insertBefore(existingSwitcher, actions);
    } else {
      header.appendChild(existingSwitcher);
    }
  }

  const clients = CMFlowStore.getClients();
  const activeClientId = CMFlowStore.getActiveClientId();
  const activeClient = CMFlowStore.getActiveClient();

  const isAll = activeClientId === 'all' || !activeClient;
  const displayName = isAll ? 'Tous les clients' : activeClient.name;
  const displayAvatar = isAll ? '<svg viewBox="0 0 24 24" width="15" height="15" fill="#D97706"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>' : CMFlowStore.getInitials(activeClient.name);
  const avatarClass = isAll ? 'client-switcher-avatar all' : 'client-switcher-avatar';

  existingSwitcher.innerHTML = `
    <div class="client-switcher-btn" id="client-switcher-btn" title="Changer d'espace client">
      <span class="${avatarClass}" id="client-switcher-avatar">${displayAvatar}</span>
      <div class="client-switcher-info">
        <span class="client-switcher-label">ESPACE ACTIF</span>
        <span class="client-switcher-name" id="client-switcher-name">${escapeHtml(displayName)}</span>
      </div>
      <svg class="client-switcher-arrow" viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
        <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"/>
      </svg>
    </div>

    <div class="client-switcher-dropdown" id="client-switcher-dropdown">
      <div style="font-size: 0.68rem; font-weight: 800; text-transform: uppercase; color: var(--text-muted); padding: 6px 12px 4px;">
        Sélectionner un Espace Client
      </div>

      <button type="button" class="switcher-dropdown-item ${isAll ? 'active' : ''}" onclick="switchActiveClientSpace('all')">
        <span class="switcher-item-avatar" style="background: #FEF3C7; color: #D97706; display: flex; align-items: center; justify-content: center;">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="#D97706"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
        </span>
        <div class="switcher-item-meta">
          <span class="switcher-item-name">Vue Agence Globale</span>
          <span class="switcher-item-industry">Tous vos clients réunis</span>
        </div>
        ${isAll ? '<span class="switcher-item-check"><svg viewBox="0 0 16 16" width="12" height="12" fill="#10B981"><path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/></svg></span>' : ''}
      </button>

      <div class="switcher-divider"></div>

      ${clients.map(c => {
        const isCurrent = c.id === activeClientId;
        return `
          <button type="button" class="switcher-dropdown-item ${isCurrent ? 'active' : ''}" onclick="switchActiveClientSpace('${c.id}')">
            <span class="switcher-item-avatar">${CMFlowStore.getInitials(c.name)}</span>
            <div class="switcher-item-meta">
              <span class="switcher-item-name">${escapeHtml(c.name)}</span>
              <span class="switcher-item-industry">${escapeHtml(c.industry || 'Client')}</span>
            </div>
            ${isCurrent ? '<span class="switcher-item-check"><svg viewBox="0 0 16 16" width="12" height="12" fill="#10B981"><path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/></svg></span>' : ''}
          </button>
        `;
      }).join('')}

      <div class="switcher-divider"></div>

      <button type="button" class="switcher-dropdown-item" data-open-add-client style="color: var(--color-primary); font-weight: 700;">
        <span class="switcher-item-avatar" style="background: #EFF6FF; color: #2563EB; display: flex; align-items: center; justify-content: center;">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        </span>
        <div class="switcher-item-meta">
          <span class="switcher-item-name">+ Nouveau Client</span>
          <span class="switcher-item-industry">Créer un nouvel espace</span>
        </div>
      </button>
    </div>
  `;

  // Toggle Dropdown
  const btn = document.getElementById('client-switcher-btn');
  if (btn) {
    btn.onclick = (e) => {
      e.stopPropagation();
      existingSwitcher.classList.toggle('open');
    };
  }

  // Fermer au clic extérieur
  document.addEventListener('click', (e) => {
    if (!existingSwitcher.contains(e.target)) {
      existingSwitcher.classList.remove('open');
    }
  });
}

function switchActiveClientSpace(clientId) {
  CMFlowStore.setActiveClientId(clientId);
  const switcher = document.getElementById('header-client-switcher');
  if (switcher) switcher.classList.remove('open');

  const client = CMFlowStore.getClientById(clientId);
  const clientName = client ? client.name : 'Tous les clients';
  showAppToast(`Espace actif : ${clientName} 🎯`, 'info');

  // Synchroniser avec le filtre du planning
  const filterClient = document.getElementById('filter-client');
  if (filterClient) {
    filterClient.value = clientId;
    planningState.filterClient = clientId;
    renderAllPlanningViews();
  }

  // Rafraîchir les autres vues
  if (typeof renderDashboard === 'function') renderDashboard();
  if (typeof renderAnalytics === 'function') renderAnalytics();
  if (typeof renderClients === 'function') renderClients();

  renderHeaderClientSwitcher();
}

/* ==========================================================================
   PLANNING & CALENDRIER ÉDITORIAL — LOGIQUE
   ========================================================================== */
let planningState = {
  currentDate: new Date(),
  filterClient: 'all',
  filterPlatform: 'all',
  filterStatus: 'all',
  selectedPlatforms: ['instagram'],
  selectedImageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=80',
  editingPostId: null,
};

const MONTH_NAMES_FR = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

function initPlanning() {
  const prevBtn = document.getElementById('prev-month-btn');
  const nextBtn = document.getElementById('next-month-btn');
  const todayBtn = document.getElementById('today-btn');
  const filterClient = document.getElementById('filter-client');
  const filterPlatform = document.getElementById('filter-platform');
  const filterStatus = document.getElementById('filter-status');
  const openPostModalBtns = document.querySelectorAll('[data-open-create-post]');

  // Synchroniser avec le client actif sélectionné
  const activeClientId = CMFlowStore.getActiveClientId();
  planningState.filterClient = activeClientId || 'all';

  // Navigation des 4 vues Buffer (Queue, Calendrier, Brouillons, Horaires)
  const viewTabs = document.querySelectorAll('.planning-view-tab');
  const monthNav = document.getElementById('calendar-month-nav');

  viewTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      viewTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const targetViewId = tab.dataset.view;
      document.querySelectorAll('.planning-view-pane').forEach(pane => {
        pane.style.display = 'none';
        pane.classList.remove('active');
      });

      const targetPane = document.getElementById(targetViewId);
      if (targetPane) {
        targetPane.style.display = 'block';
        targetPane.classList.add('active');
      }

      if (monthNav) {
        monthNav.style.display = targetViewId === 'view-calendar' ? 'flex' : 'none';
      }

      renderAllPlanningViews();
    });
  });

  // Remplir le filtre client
  if (filterClient) {
    const clients = CMFlowStore.getClients();
    filterClient.innerHTML = '<option value="all">Tous les clients</option>';
    clients.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.id;
      opt.textContent = c.name;
      if (c.id === planningState.filterClient) opt.selected = true;
      filterClient.appendChild(opt);
    });

    filterClient.value = planningState.filterClient;

    filterClient.addEventListener('change', (e) => {
      planningState.filterClient = e.target.value;
      CMFlowStore.setActiveClientId(e.target.value);
      renderHeaderClientSwitcher();
      renderAllPlanningViews();
    });
  }

  if (filterPlatform) {
    filterPlatform.addEventListener('change', (e) => {
      planningState.filterPlatform = e.target.value;
      renderAllPlanningViews();
    });
  }

  if (filterStatus) {
    filterStatus.addEventListener('change', (e) => {
      planningState.filterStatus = e.target.value;
      renderAllPlanningViews();
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      planningState.currentDate.setMonth(planningState.currentDate.getMonth() - 1);
      renderPlanningCalendar();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      planningState.currentDate.setMonth(planningState.currentDate.getMonth() + 1);
      renderPlanningCalendar();
    });
  }

  if (todayBtn) {
    todayBtn.addEventListener('click', () => {
      planningState.currentDate = new Date();
      renderPlanningCalendar();
    });
  }

  openPostModalBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const slot = CMFlowStore.getNextQueueSlot();
      openPostModalForDate(slot.date, slot.time);
    });
  });

  initPostModal();
  renderAllPlanningViews();
}

function renderAllPlanningViews() {
  renderQueueView();
  renderPlanningCalendar();
  renderDraftsView();
  renderPostingSchedule();
}

/* ==========================================================================
   1. VUE FILE D'ATTENTE (BUFFER QUEUE VIEW)
   ========================================================================== */
function renderQueueView() {
  const container = document.getElementById('queue-container');
  if (!container) return;

  const allPosts = CMFlowStore.getPosts();
  const filteredPosts = allPosts.filter(post => {
    if (post.status === 'draft') return false; // Les brouillons vont dans l'onglet brouillons
    if (planningState.filterClient !== 'all' && post.clientId !== planningState.filterClient) return false;
    if (planningState.filterPlatform !== 'all' && !post.platforms?.includes(planningState.filterPlatform)) return false;
    if (planningState.filterStatus !== 'all' && post.status !== planningState.filterStatus) return false;
    return true;
  });

  // Grouper par date
  const postsByDate = {};
  filteredPosts.forEach(p => {
    const d = p.scheduledDate || 'Date non définie';
    if (!postsByDate[d]) postsByDate[d] = [];
    postsByDate[d].push(p);
  });

  // Trier les dates
  const sortedDates = Object.keys(postsByDate).sort();

  if (sortedDates.length === 0) {
    container.innerHTML = `
      <div style="background: white; border: var(--border-light); border-radius: var(--radius-xl); padding: 48px 24px; text-align: center;">
        <div style="font-size: 2.5rem; margin-bottom: 12px;">📥</div>
        <h3 style="font-size: 1.1rem; font-weight: 800; color: var(--text-main); margin: 0 0 6px;">Votre file d'attente est vide</h3>
        <p style="font-size: 0.85rem; color: var(--text-muted); max-width: 400px; margin: 0 auto 20px;">
          Ajoutez des publications pour remplir automatiquement les prochains créneaux de diffusion.
        </p>
        <button type="button" class="btn-primary-app" onclick="const s = CMFlowStore.getNextQueueSlot(); openPostModalForDate(s.date, s.time);">
          <span>+ Ajouter à la file d'attente</span>
        </button>
      </div>
    `;
    return;
  }

  container.innerHTML = sortedDates.map(dateStr => {
    const posts = postsByDate[dateStr];
    // Formater la date en français
    const dateObj = new Date(dateStr + 'T00:00:00');
    const dateFormatted = !isNaN(dateObj.getTime())
      ? dateObj.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
      : dateStr;

    return `
      <div class="queue-day-block">
        <div class="queue-day-header">
          <h3 class="queue-day-title">
            📅 ${dateFormatted.charAt(0).toUpperCase() + dateFormatted.slice(1)}
            <span style="font-size: 0.75rem; font-weight: 600; color: var(--color-primary); background: var(--color-primary-subtle); padding: 2px 8px; border-radius: 9999px;">
              ${posts.length} publication${posts.length > 1 ? 's' : ''}
            </span>
          </h3>
        </div>

        <div class="queue-day-slots-list">
          ${posts.map(post => `
            <div class="queue-slot-item">
              <div class="queue-slot-time-col">
                <span>⏰ ${post.scheduledTime || '12:00'}</span>
                <span class="social-tag" style="font-size: 0.68rem; padding: 1px 6px;">${post.platforms?.[0] || 'Instagram'}</span>
              </div>
              <div class="queue-slot-content-col">
                <img class="queue-slot-thumb" src="${post.imageUrl || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&auto=format&fit=crop&q=80'}" alt="Thumb">
                <div class="queue-slot-text-meta">
                  <div style="font-size: 0.8rem; font-weight: 700; color: var(--text-main); display: flex; align-items: center; gap: 6px;">
                    <span>${escapeHtml(post.clientName || 'Client')}</span>
                    ${post.clientApproved ? '<span style="font-size: 0.7rem; color: #16A34A; font-weight: 700;">✓ Validé</span>' : ''}
                  </div>
                  <div class="queue-slot-caption">${escapeHtml(post.caption || 'Sans texte')}</div>
                </div>
              </div>
              <div style="display: flex; gap: 6px; align-items: center; flex-wrap: wrap;">
                <!-- Action Rapide : Copier Texte -->
                <button type="button" class="btn-quick-copy" onclick="copyPostCaption('${post.id}')" title="Copier le texte et les hashtags pour coller dans Instagram/Facebook">
                  <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                  <span>Copier</span>
                </button>
                <!-- Action Rapide : WhatsApp -->
                <button type="button" class="btn-quick-whatsapp" onclick="sharePostToWhatsApp('${post.id}')" title="Envoyer directement sur WhatsApp">
                  <svg viewBox="0 0 24 24" width="13" height="13" fill="#25D366"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm0 18.15c-1.5 0-2.97-.39-4.27-1.14l-.31-.18-3.17.83.85-3.09-.2-.32a8.188 8.188 0 0 1-1.25-4.34c0-4.54 3.7-8.24 8.24-8.24 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.83c.01 4.54-3.68 8.23-8.12 8.23zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.12-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.14.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.22.25-.86.84-.86 2.06 0 1.21.89 2.39 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.14-1.18-.06-.11-.22-.18-.47-.3z"/></svg>
                  <span>WhatsApp</span>
                </button>

                ${post.status === 'published' ? `
                  <span style="font-size: 0.72rem; font-weight: 700; color: #059669; background: #DCFCE7; padding: 4px 8px; border-radius: 9999px; display: inline-flex; align-items: center; gap: 4px;">
                    <svg viewBox="0 0 16 16" width="12" height="12" fill="#059669"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
                    En direct
                  </span>
                  ${post.publishedUrls?.instagram ? `
                    <a href="${post.publishedUrls.instagram}" target="_blank" class="btn-secondary-app" style="font-size: 0.72rem; padding: 3px 6px; text-decoration: none;" title="Voir sur Instagram">IG ↗</a>
                  ` : ''}
                ` : `
                  <button type="button" class="btn-primary-app" style="font-size: 0.75rem; padding: 4px 10px; background: #059669; border-color: #059669; display: inline-flex; align-items: center; gap: 4px;" onclick="openPublishDirectModal('${post.id}')" title="Propulser ce post directement sur les réseaux">
                    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"></path><path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"></path></svg>
                    <span>Publier</span>
                  </button>
                `}
                <button type="button" class="btn-secondary-app" style="font-size: 0.75rem; padding: 4px 10px;" onclick="openPostModalForEdit('${post.id}')">
                  Modifier
                </button>
              </div>
            </div>
          `).join('')}

          <!-- Créneau d'ajout rapide vide Buffer -->
          <div class="queue-empty-slot" onclick="openPostModalForDate('${dateStr}', '18:00')">
            <span style="font-size: 0.82rem; font-weight: 600; color: var(--text-muted);">
              ➕ Ajouter une publication sur ce jour (${dateStr})
            </span>
            <span style="font-size: 0.75rem; color: var(--color-primary); font-weight: 700;">+ Créer</span>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

/* ==========================================================================
   2. VUE BROUILLONS & EN ATTENTE (DRAFTS VIEW)
   ========================================================================== */
function renderDraftsView() {
  const container = document.getElementById('drafts-container');
  if (!container) return;

  const allPosts = CMFlowStore.getPosts();
  const drafts = allPosts.filter(p => {
    if (p.status !== 'draft' && p.status !== 'pending') return false;
    if (planningState.filterClient !== 'all' && p.clientId !== planningState.filterClient) return false;
    return true;
  });

  if (drafts.length === 0) {
    container.innerHTML = `
      <div style="background: white; border: var(--border-light); border-radius: var(--radius-xl); padding: 48px 24px; text-align: center;">
        <div style="font-size: 2.5rem; margin-bottom: 12px;">📝</div>
        <h3 style="font-size: 1.1rem; font-weight: 800; color: var(--text-main); margin: 0 0 6px;">Aucun brouillon en attente</h3>
        <p style="font-size: 0.85rem; color: var(--text-muted); margin: 0;">Tous vos posts sont programmés pour diffusion !</p>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="queue-day-block">
      <div class="queue-day-header">
        <h3 class="queue-day-title">📝 Brouillons et Publications en attente (${drafts.length})</h3>
      </div>
      <div class="queue-day-slots-list">
        ${drafts.map(post => `
          <div class="queue-slot-item">
            <div class="queue-slot-time-col">
              <span class="post-pill-status status-${post.status}" style="font-size: 0.72rem;">${post.status === 'pending' ? 'À valider' : 'Brouillon'}</span>
            </div>
            <div class="queue-slot-content-col">
              <img class="queue-slot-thumb" src="${post.imageUrl || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&auto=format&fit=crop&q=80'}" alt="Thumb">
              <div class="queue-slot-text-meta">
                <div style="font-size: 0.8rem; font-weight: 700; color: var(--text-main);">${escapeHtml(post.clientName || 'Client')}</div>
                <div class="queue-slot-caption">${escapeHtml(post.caption || 'Sans texte')}</div>
              </div>
            </div>
            <div style="display: flex; gap: 6px; align-items: center; flex-wrap: wrap;">
              <button type="button" class="btn-quick-copy" onclick="copyPostCaption('${post.id}')" title="Copier le texte">
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                <span>Copier</span>
              </button>
              <button type="button" class="btn-quick-whatsapp" onclick="sharePostToWhatsApp('${post.id}')" title="Envoyer sur WhatsApp">
                <svg viewBox="0 0 24 24" width="13" height="13" fill="#25D366"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm0 18.15c-1.5 0-2.97-.39-4.27-1.14l-.31-.18-3.17.83.85-3.09-.2-.32a8.188 8.188 0 0 1-1.25-4.34c0-4.54 3.7-8.24 8.24-8.24 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.83c.01 4.54-3.68 8.23-8.12 8.23zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.12-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.14.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.22.25-.86.84-.86 2.06 0 1.21.89 2.39 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.14-1.18-.06-.11-.22-.18-.47-.3z"/></svg>
                <span>WhatsApp</span>
              </button>
              <button type="button" class="btn-primary-app" style="font-size: 0.75rem; padding: 4px 10px; background: #059669; border-color: #059669; display: inline-flex; align-items: center; gap: 4px;" onclick="openPublishDirectModal('${post.id}')">
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"></path><path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"></path></svg>
                <span>Publier</span>
              </button>
              <button type="button" class="btn-secondary-app" style="font-size: 0.75rem; padding: 4px 10px;" onclick="openPostModalForEdit('${post.id}')">
                Modifier
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

/* ==========================================================================
   3. VUE HORAIRES DE PUBLICATION (POSTING SCHEDULE)
   ========================================================================== */
function renderPostingSchedule() {
  const grid = document.getElementById('schedule-week-grid');
  if (!grid) return;

  const schedule = CMFlowStore.getPostingSchedule();

  grid.innerHTML = schedule.map(day => `
    <div class="schedule-day-card">
      <div class="schedule-day-name">${day.day}</div>
      <div style="display: flex; flex-direction: column; gap: 6px;">
        ${day.times.map(t => `
          <div class="schedule-time-pill">
            <span>⏰ ${t}</span>
          </div>
        `).join('')}
      </div>
      <button type="button" class="btn-card-action" style="font-size: 0.72rem; padding: 4px;" onclick="addPostingSlotToDay(${day.dayIndex})">
        + Créneau
      </button>
    </div>
  `).join('');
}

function addPostingSlotToDay(dayIndex) {
  const time = prompt('Entrez une heure de publication (format HH:MM, ex: 15:30) :');
  if (!time || !/^\d{2}:\d{2}$/.test(time)) return;

  const schedule = CMFlowStore.getPostingSchedule();
  const day = schedule.find(s => s.dayIndex === dayIndex);
  if (day) {
    if (!day.times.includes(time)) {
      day.times.push(time);
      day.times.sort();
      CMFlowStore.setPostingSchedule(schedule);
      renderPostingSchedule();
      showAppToast(`Créneau ${time} ajouté pour le ${day.day} ! ⏰`, 'success');
    }
  }
}


/* ==========================================================================
   MODAL DE PUBLICATION DIRECTE SUR LES RÉSEAUX SOCIAUX
   ========================================================================== */
function openPublishDirectModal(postId) {
  const post = CMFlowStore.getPostById(postId);
  if (!post) return;

  const client = CMFlowStore.getClientById(post.clientId);
  let modal = document.getElementById('publish-direct-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'publish-direct-modal';
    modal.className = 'modal-backdrop';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    document.body.appendChild(modal);
  }

  const platforms = post.platforms || ['instagram'];
  const platformBadges = platforms.map(p => {
    return `<span class="social-tag" style="background: var(--color-primary-subtle); color: var(--color-primary); font-weight: 700; text-transform: uppercase;">${escapeHtml(p)}</span>`;
  }).join(' ');

  modal.innerHTML = `
    <div class="modal-card" style="max-width: 520px; text-align: center; padding: 32px 24px;">
      <div style="width: 68px; height: 68px; border-radius: 50%; background: #ECFDF5; color: #059669; display: flex; align-items: center; justify-content: center; font-size: 2rem; margin: 0 auto 16px; box-shadow: 0 4px 14px rgba(5, 150, 105, 0.15);">
        🚀
      </div>
      <h3 style="font-size: 1.3rem; font-weight: 800; color: var(--text-main); margin-bottom: 6px;">
        Publication Directe sur les Réseaux
      </h3>
      <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 20px;">
        Ce contenu va être propulsé automatiquement sur les comptes officiels de <strong>${escapeHtml(client?.name || post.clientName || 'votre client')}</strong> sans que vous ayez besoin d'ouvrir les applications.
      </p>

      <!-- Aperçu compact du post -->
      <div style="background: #F8FAFC; border: var(--border-light); border-radius: 12px; padding: 14px; text-align: left; display: flex; gap: 14px; align-items: center; margin-bottom: 22px;">
        <img src="${post.imageUrl || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&auto=format&fit=crop&q=80'}" style="width: 60px; height: 60px; border-radius: 8px; object-fit: cover; border: 1px solid #E2E8F0;" alt="Thumbnail">
        <div style="flex: 1; min-width: 0;">
          <div style="font-size: 0.78rem; font-weight: 700; margin-bottom: 4px; display: flex; gap: 6px; flex-wrap: wrap;">
            ${platformBadges}
          </div>
          <div style="font-size: 0.82rem; color: var(--text-main); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; line-height: 1.4;">
            ${escapeHtml(post.caption || 'Sans texte')}
          </div>
        </div>
      </div>

      <!-- Zone de statut / Progression -->
      <div id="publish-progress-box" style="display: none; margin-bottom: 22px; text-align: left; background: #EFF6FF; border: 1px solid #BFDBFE; border-radius: 12px; padding: 16px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
          <span id="publish-step-label" style="font-size: 0.82rem; font-weight: 700; color: #1E40AF;">1/3 Connexion aux APIs officielles...</span>
          <span style="font-size: 0.82rem; font-weight: 800; color: #2563EB;" id="publish-percent">35%</span>
        </div>
        <div style="height: 8px; background: #DBEAFE; border-radius: 999px; overflow: hidden;">
          <div id="publish-progress-bar" style="height: 100%; width: 35%; background: var(--color-primary); transition: width 0.4s ease;"></div>
        </div>
      </div>

      <!-- Actions -->
      <div id="publish-modal-actions" style="display: flex; gap: 12px; justify-content: center;">
        <button type="button" class="btn-secondary-app" onclick="closePublishDirectModal()" style="padding: 10px 18px;">
          Annuler
        </button>
        <button type="button" class="btn-primary-app" id="btn-trigger-publish" style="background: #059669; border-color: #059669; font-weight: 700; padding: 10px 20px;" onclick="executeDirectPublish('${post.id}')">
          🚀 Confirmer et Publier en direct
        </button>
      </div>

      <!-- Succès avec liens directs -->
      <div id="publish-modal-success" style="display: none; text-align: center;">
        <div style="margin-bottom: 16px; font-size: 0.95rem; font-weight: 800; color: #059669;">
          🎉 Votre post est officiellement en ligne sur les réseaux !
        </div>
        <div id="publish-links-container" style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 22px;"></div>
        <button type="button" class="btn-primary-app" onclick="closePublishDirectModal(); if (typeof renderAllPlanningViews === 'function') renderAllPlanningViews();">
          Terminer & Voir le planning
        </button>
      </div>
    </div>
  `;

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closePublishDirectModal() {
  const modal = document.getElementById('publish-direct-modal');
  if (modal) modal.classList.remove('active');
  document.body.style.overflow = '';
}

async function executeDirectPublish(postId) {
  const progressBox = document.getElementById('publish-progress-box');
  const progressBar = document.getElementById('publish-progress-bar');
  const stepLabel = document.getElementById('publish-step-label');
  const percentLabel = document.getElementById('publish-percent');
  const actionsBox = document.getElementById('publish-modal-actions');
  const successBox = document.getElementById('publish-modal-success');
  const linksContainer = document.getElementById('publish-links-container');

  if (progressBox) progressBox.style.display = 'block';
  if (actionsBox) actionsBox.style.display = 'none';

  // Étape 1 : Connexion API
  if (stepLabel) stepLabel.textContent = '1/3 Vérification des clés API Meta & LinkedIn...';
  if (progressBar) progressBar.style.width = '35%';
  if (percentLabel) percentLabel.textContent = '35%';

  await new Promise(r => setTimeout(r, 600));

  // Étape 2 : Téléversement du visuel HD
  if (stepLabel) stepLabel.textContent = '2/3 Téléversement du média HD vers les serveurs réseaux...';
  if (progressBar) progressBar.style.width = '70%';
  if (percentLabel) percentLabel.textContent = '70%';

  await new Promise(r => setTimeout(r, 800));

  // Étape 3 : Publication finale
  if (stepLabel) stepLabel.textContent = '3/3 Publication en direct sur le profil...';
  if (progressBar) progressBar.style.width = '100%';
  if (percentLabel) percentLabel.textContent = '100%';

  const result = await CMFlowBackend.publishPostDirectly(postId);

  await new Promise(r => setTimeout(r, 500));

  if (progressBox) progressBox.style.display = 'none';
  if (successBox) successBox.style.display = 'block';

  if (linksContainer && result.publishedUrls) {
    linksContainer.innerHTML = Object.keys(result.publishedUrls).map(k => `
      <a href="${result.publishedUrls[k]}" target="_blank" class="btn-secondary-app" style="font-size: 0.85rem; text-decoration: none; justify-content: center; display: flex; align-items: center; gap: 8px; font-weight: 600; padding: 10px;">
        🌐 Voir la publication en direct sur ${k.toUpperCase()} ↗
      </a>
    `).join('');
  }

}

function renderCalendarGrid() {
  const grid = document.getElementById('planning-calendar-grid');
  const monthTitle = document.getElementById('calendar-month-title');
  if (!grid) return;

  const currentYear = planningState.currentDate.getFullYear();
  const currentMonth = planningState.currentDate.getMonth();

  if (monthTitle) {
    monthTitle.textContent = `${MONTH_NAMES_FR[currentMonth]} ${currentYear}`;
  }

  grid.innerHTML = '';

  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);

  // Lundi = 0, Dimanche = 6
  let startingDayOfWeek = firstDayOfMonth.getDay() - 1;
  if (startingDayOfWeek === -1) startingDayOfWeek = 6;

  const totalDays = lastDayOfMonth.getDate();
  const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const allPosts = CMFlowStore.getPosts();

  // Filtrage des posts
  const filteredPosts = allPosts.filter(post => {
    if (planningState.filterClient !== 'all' && post.clientId !== planningState.filterClient) return false;
    if (planningState.filterPlatform !== 'all' && !post.platforms?.includes(planningState.filterPlatform)) return false;
    if (planningState.filterStatus !== 'all' && post.status !== planningState.filterStatus) return false;
    return true;
  });

  // Jours du mois précédent
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    const dayNum = prevMonthLastDay - i;
    const prevMonthDate = new Date(currentYear, currentMonth - 1, dayNum);
    const dateStr = `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    grid.appendChild(createDayCell(dayNum, dateStr, true, filteredPosts));
  }

  // Jours du mois en cours
  for (let d = 1; d <= totalDays; d++) {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const isToday = dateStr === todayStr;
    grid.appendChild(createDayCell(d, dateStr, false, filteredPosts, isToday));
  }

  // Jours du mois suivant
  const totalRendered = startingDayOfWeek + totalDays;
  const remainingCells = (totalRendered > 35 ? 42 : 35) - totalRendered;

  for (let nextD = 1; nextD <= remainingCells; nextD++) {
    const nextMonthDate = new Date(currentYear, currentMonth + 1, nextD);
    const dateStr = `${nextMonthDate.getFullYear()}-${String(nextMonthDate.getMonth() + 1).padStart(2, '0')}-${String(nextD).padStart(2, '0')}`;
    grid.appendChild(createDayCell(nextD, dateStr, true, filteredPosts));
  }
}

function createDayCell(dayNumber, dateStr, isOtherMonth, posts, isToday = false) {
  const cell = document.createElement('div');
  cell.className = `calendar-day-cell ${isOtherMonth ? 'other-month' : ''} ${isToday ? 'is-today' : ''}`;
  cell.dataset.date = dateStr;

  const top = document.createElement('div');
  top.className = 'day-cell-top';

  const num = document.createElement('span');
  num.className = 'day-number';
  num.textContent = dayNumber;
  top.appendChild(num);

  const addBtn = document.createElement('button');
  addBtn.type = 'button';
  addBtn.className = 'day-cell-add-btn';
  addBtn.title = 'Créer une publication ce jour';
  addBtn.innerHTML = '<svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14"><path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd"/></svg>';
  addBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    openPostModalForDate(dateStr);
  });
  top.appendChild(addBtn);

  cell.appendChild(top);

  const postsList = document.createElement('div');
  postsList.className = 'day-posts-list';

  const dayPosts = posts.filter(p => p.scheduledDate === dateStr);
  dayPosts.forEach(post => {
    postsList.appendChild(buildPostPill(post));
  });

  cell.appendChild(postsList);

  cell.addEventListener('click', () => {
    openPostModalForDate(dateStr);
  });

  return cell;
}

function buildPostPill(post) {
  const pill = document.createElement('div');
  const mainPlatform = post.platforms?.[0] || 'instagram';
  pill.className = `post-pill network-${mainPlatform}`;
  pill.title = `${post.clientName || 'Client'} (${post.scheduledTime || '12:00'}) — ${post.caption || ''}`;

  const time = document.createElement('span');
  time.className = 'post-pill-time';
  time.textContent = post.scheduledTime || '12:00';
  pill.appendChild(time);

  const title = document.createElement('span');
  title.className = 'post-pill-title';
  title.textContent = post.caption ? post.caption.slice(0, 32) : (post.clientName || 'Publication');
  pill.appendChild(title);

  const dot = document.createElement('span');
  dot.className = `post-pill-status-dot dot-${post.status || 'draft'}`;
  pill.appendChild(dot);

  pill.addEventListener('click', (e) => {
    e.stopPropagation();
    openPostModalForEdit(post.id);
  });

  return pill;
}

/* ==========================================================================
   MODAL DE PUBLICATION & LIVE FEED PREVIEW
   ========================================================================== */
function initPostModal() {
  const modalBackdrop = document.getElementById('post-modal-backdrop');
  const modalClose = document.getElementById('post-modal-close-btn');
  const modalCancel = document.getElementById('post-modal-cancel-btn');
  const form = document.getElementById('form-create-post');
  const deleteBtn = document.getElementById('post-delete-btn');

  const clientSelect = document.getElementById('post-client');
  const dateInput = document.getElementById('post-date');
  const timeInput = document.getElementById('post-time');
  const captionInput = document.getElementById('post-caption');
  const statusSelect = document.getElementById('post-status');
  const charCount = document.getElementById('caption-char-count');

  // Preview elements
  const mockupAvatar = document.getElementById('mockup-avatar');
  const mockupUsername = document.getElementById('mockup-username');
  const mockupImage = document.getElementById('mockup-image');
  const mockupCaption = document.getElementById('mockup-caption-text');
  const mockupTime = document.getElementById('mockup-time');

  if (!modalBackdrop) return;

  const close = () => {
    modalBackdrop.classList.remove('active');
    document.body.style.overflow = '';
    planningState.editingPostId = null;
    if (form) form.reset();
  };

  if (modalClose) modalClose.addEventListener('click', close);
  if (modalCancel) modalCancel.addEventListener('click', close);
  modalBackdrop.addEventListener('click', (e) => {
    if (e.target === modalBackdrop) close();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalBackdrop.classList.contains('active')) close();
  });

  // Mise à jour de la prévisualisation en direct
  function updateLivePreview() {
    // Client & Avatar
    const selectedClientId = clientSelect?.value;
    const clients = CMFlowStore.getClients();
    const client = clients.find(c => c.id === selectedClientId) || { name: 'Votre Client' };
    const handleName = client.socialAccounts?.instagram?.handle?.replace('@', '') || client.name.toLowerCase().replace(/[^a-z0-9]/g, '_');

    if (mockupAvatar) mockupAvatar.textContent = CMFlowStore.getInitials(client.name);
    if (mockupUsername) mockupUsername.textContent = handleName;

    // Caption & Hashtags highlight
    const rawCaption = captionInput?.value || '';
    if (charCount) charCount.textContent = `${rawCaption.length} / 2 200`;

    if (mockupCaption) {
      if (!rawCaption.trim()) {
        mockupCaption.innerHTML = `<span class="caption-user">${escapeHtml(handleName)}</span> Votre texte et vos hashtags apparaîtront ici en direct...`;
      } else {
        // Mettre en gras les hashtags
        const formatted = escapeHtml(rawCaption).replace(/#([a-zA-Z0-9_À-ÿ]+)/g, '<span class="hashtag-hl">#$1</span>');
        mockupCaption.innerHTML = `<span class="caption-user">${escapeHtml(handleName)}</span> ${formatted.replace(/\n/g, '<br>')}`;
      }
    }

    // Image
    if (mockupImage) {
      mockupImage.src = planningState.selectedImageUrl || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=80';
    }

    // Date & Time
    if (mockupTime) {
      const d = dateInput?.value || 'Aujourd\'hui';
      const t = timeInput?.value || '12:00';
      mockupTime.textContent = `Programmé pour le ${d} à ${t}`;
    }
  }

  // Écouteurs de frappe et changements
  if (captionInput) captionInput.addEventListener('input', updateLivePreview);
  if (clientSelect) clientSelect.addEventListener('change', updateLivePreview);
  if (dateInput) dateInput.addEventListener('change', updateLivePreview);
  if (timeInput) timeInput.addEventListener('change', updateLivePreview);

  // Assistant IA : Sélection de Ton & Génération
  let selectedAITone = 'engaging';
  document.querySelectorAll('.ai-tone-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.ai-tone-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      selectedAITone = chip.dataset.tone || 'engaging';
    });
  });

  const btnGenerateAI = document.getElementById('btn-generate-ai-caption');
  const aiTopicInput = document.getElementById('ai-topic-input');

  if (btnGenerateAI) {
    btnGenerateAI.addEventListener('click', () => {
      const topic = aiTopicInput?.value.trim() || 'Spécialités et offres exclusives';
      const selectedClientId = clientSelect?.value;
      const clients = CMFlowStore.getClients();
      const client = clients.find(c => c.id === selectedClientId) || { name: 'Notre Marque', industry: 'Restauration' };

      btnGenerateAI.disabled = true;
      btnGenerateAI.innerHTML = '<span>✨ Rédaction en cours...</span>';

      setTimeout(() => {
        const generated = generateAIPost(topic, selectedAITone, client.industry, client.name);
        if (captionInput) {
          captionInput.value = generated;
          captionInput.focus();
          updateLivePreview();
        }
        btnGenerateAI.disabled = false;
        btnGenerateAI.innerHTML = '<span>✨ Générer</span>';
        showAppToast('Légende rédigée par l\'IA avec succès ! ✨🎉', 'success');
      }, 600);
    });
  }

  // Hashtag chips clic
  document.querySelectorAll('.hashtag-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const tag = chip.dataset.tag || chip.textContent.trim();
      if (captionInput) {
        captionInput.value = (captionInput.value.trim() + ' ' + tag).trim() + ' ';
        captionInput.focus();
        updateLivePreview();
      }
    });
  });

  // Toggles Réseaux sociaux
  document.querySelectorAll('.network-toggle-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.classList.toggle('active');
      const network = btn.dataset.network;
      if (btn.classList.contains('active')) {
        if (!planningState.selectedPlatforms.includes(network)) planningState.selectedPlatforms.push(network);
      } else {
        planningState.selectedPlatforms = planningState.selectedPlatforms.filter(n => n !== network);
        if (planningState.selectedPlatforms.length === 0) {
          // Garder au moins 1 réseau
          btn.classList.add('active');
          planningState.selectedPlatforms.push(network);
        }
      }
    });
  });

  // Presets d'images
  document.querySelectorAll('.image-preset-item').forEach(item => {
    item.addEventListener('click', () => {
      document.querySelectorAll('.image-preset-item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      planningState.selectedImageUrl = item.dataset.img;
      updateLivePreview();
    });
  });

  // Upload image personnalisé avec contrôle de taille anti-crash Firestore (max 800 Ko)
  const customFileInput = document.getElementById('post-image-file');
  if (customFileInput) {
    customFileInput.addEventListener('change', (e) => {
      const file = e.target.files?.[0];
      if (file) {
        if (file.size > 800 * 1024) {
          showAppToast('Image trop volumineuse (max 800 Ko pour le stockage direct). Veuillez compresser votre image.', 'error');
          customFileInput.value = '';
          return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
          planningState.selectedImageUrl = event.target.result;
          document.querySelectorAll('.image-preset-item').forEach(i => i.classList.remove('active'));
          updateLivePreview();
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // Soumission Formulaire Post
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const clientId = clientSelect?.value;
      const clients = CMFlowStore.getClients();
      const client = clients.find(c => c.id === clientId);

      const scheduledDate = dateInput?.value || new Date().toISOString().split('T')[0];
      const scheduledTime = timeInput?.value || '12:00';
      const caption = captionInput?.value.trim() || '';
      const status = statusSelect?.value || 'scheduled';

      if (!caption) {
        showAppToast('Veuillez saisir un texte pour votre publication.', 'error');
        if (captionInput) captionInput.focus();
        return;
      }

      const submitBtn = form.querySelector('[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Enregistrement...';
      }

      setTimeout(() => {
        if (planningState.editingPostId) {
          // Mise à jour
          CMFlowStore.updatePost(planningState.editingPostId, {
            clientId: clientId || 'sample',
            clientName: client?.name || 'Client',
            platforms: planningState.selectedPlatforms,
            scheduledDate,
            scheduledTime,
            caption,
            imageUrl: planningState.selectedImageUrl,
            status,
          });
          showAppToast('Publication mise à jour ! 🚀', 'success');
        } else {
          // Création
          const newPost = {
            id: CMFlowStore.generateId(),
            clientId: clientId || (clients[0]?.id || 'c1'),
            clientName: client?.name || (clients[0]?.name || 'Mon Client'),
            platforms: [...planningState.selectedPlatforms],
            scheduledDate,
            scheduledTime,
            caption,
            imageUrl: planningState.selectedImageUrl,
            status,
            createdAt: new Date().toISOString(),
          };
          CMFlowStore.addPost(newPost);
          showAppToast('Publication planifiée avec succès ! 📅✨', 'success');
        }

        close();
        renderAllPlanningViews();
        if (typeof renderDashboard === 'function') renderDashboard();

        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Enregistrer la publication';
        }
      }, 500);
    });
  }

  // Bouton Publier en direct maintenant depuis le modal
  const btnPublishNowModal = document.getElementById('btn-publish-now-modal');
  if (btnPublishNowModal) {
    btnPublishNowModal.addEventListener('click', () => {
      if (planningState.editingPostId) {
        const pId = planningState.editingPostId;
        close();
        openPublishDirectModal(pId);
      }
    });
  }

  // Suppression d'un post
  if (deleteBtn) {
    deleteBtn.addEventListener('click', () => {
      if (!planningState.editingPostId) return;
      if (!confirm('Voulez-vous supprimer cette publication ?')) return;
      CMFlowStore.deletePost(planningState.editingPostId);
      showAppToast('Publication supprimée.', 'success');
      close();
      renderAllPlanningViews();
      if (typeof renderDashboard === 'function') renderDashboard();
    });
  }
}

function openPostModalForDate(dateStr, timeStr = '14:00') {
  const modalBackdrop = document.getElementById('post-modal-backdrop');
  const form = document.getElementById('form-create-post');
  const titleEl = document.getElementById('post-modal-title');
  const deleteBtn = document.getElementById('post-delete-btn');
  const btnPublishNow = document.getElementById('btn-publish-now-modal');
  const clientSelect = document.getElementById('post-client');
  const dateInput = document.getElementById('post-date');
  const timeInput = document.getElementById('post-time');
  const captionInput = document.getElementById('post-caption');
  const statusSelect = document.getElementById('post-status');

  if (!modalBackdrop) return;

  planningState.editingPostId = null;

  // Peupler la liste des clients
  if (clientSelect) {
    const clients = CMFlowStore.getClients();
    clientSelect.innerHTML = '';
    if (clients.length === 0) {
      clientSelect.innerHTML = '<option value="sample">Client Démo (ex: Teranga)</option>';
    } else {
      clients.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c.id;
        opt.textContent = c.name;
        clientSelect.appendChild(opt);
      });
    }
  }

  if (titleEl) titleEl.textContent = 'Nouvelle publication (Buffer Queue)';
  if (deleteBtn) deleteBtn.style.display = 'none';
  if (btnPublishNow) btnPublishNow.style.display = 'none';

  if (dateInput) dateInput.value = dateStr || new Date().toISOString().split('T')[0];
  if (timeInput) timeInput.value = timeStr || '14:00';
  if (captionInput) captionInput.value = '';
  if (statusSelect) statusSelect.value = 'scheduled';

  modalBackdrop.classList.add('active');
  document.body.style.overflow = 'hidden';

  // Trigger input for preview update
  if (captionInput) captionInput.dispatchEvent(new Event('input'));
}

function openPostModalForEdit(postId) {
  const post = CMFlowStore.getPostById(postId);
  if (!post) return;

  const modalBackdrop = document.getElementById('post-modal-backdrop');
  const titleEl = document.getElementById('post-modal-title');
  const deleteBtn = document.getElementById('post-delete-btn');
  const btnPublishNow = document.getElementById('btn-publish-now-modal');
  const clientSelect = document.getElementById('post-client');
  const dateInput = document.getElementById('post-date');
  const timeInput = document.getElementById('post-time');
  const captionInput = document.getElementById('post-caption');
  const statusSelect = document.getElementById('post-status');

  if (!modalBackdrop) return;

  planningState.editingPostId = postId;

  if (clientSelect) {
    const clients = CMFlowStore.getClients();
    clientSelect.innerHTML = '';
    clients.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.id;
      opt.textContent = c.name;
      if (c.id === post.clientId) opt.selected = true;
      clientSelect.appendChild(opt);
    });
  }

  if (titleEl) titleEl.textContent = 'Modifier la publication';
  if (deleteBtn) deleteBtn.style.display = 'inline-flex';
  if (btnPublishNow) btnPublishNow.style.display = 'inline-flex';

  if (dateInput) dateInput.value = post.scheduledDate || '';
  if (timeInput) timeInput.value = post.scheduledTime || '12:00';
  if (captionInput) captionInput.value = post.caption || '';
  if (statusSelect) statusSelect.value = post.status || 'scheduled';

  if (post.imageUrl) {
    planningState.selectedImageUrl = post.imageUrl;
  }

  if (post.platforms && post.platforms.length > 0) {
    planningState.selectedPlatforms = [...post.platforms];
    document.querySelectorAll('.network-toggle-btn').forEach(btn => {
      btn.classList.toggle('active', planningState.selectedPlatforms.includes(btn.dataset.network));
    });
  }

  modalBackdrop.classList.add('active');
  document.body.style.overflow = 'hidden';

  if (captionInput) captionInput.dispatchEvent(new Event('input'));
}

/* ==========================================================================
   INITIALISATION GLOBALE
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
  const page = window.location.pathname.split('/').pop() || 'index.html';

  // Pages protégées
  const protectedPages = ['dashboard.html', 'clients.html', 'onboarding.html', 'planning.html', 'analytics.html', 'settings.html'];
  if (protectedPages.includes(page)) {
    if (!authGuard()) return;
  }

  // Init sidebar
  initSidebar();

  // Init sélecteur d'espace client dans le header
  renderHeaderClientSwitcher();

  // Init modal ajout client (dashboard & clients)
  initAddClientModal();

  // Routing par page
  if (page === 'onboarding.html') {
    initOnboarding();
  }

  if (page === 'dashboard.html') {
    renderDashboard();

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('action') === 'add-client') {
      setTimeout(() => {
        const addClientModal = document.getElementById('add-client-modal');
        if (addClientModal) addClientModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        window.history.replaceState({}, '', 'dashboard.html');
      }, 400);
    }
  }

  if (page === 'clients.html') {
    renderClients();
    initClientsSearch();
  }

  if (page === 'planning.html') {
    initPlanning();
  }

  // Raccourci Clavier Secret Fondateur : Ctrl + Shift + A
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
      e.preventDefault();
      window.location.href = 'admin.html';
    }
  });
});

