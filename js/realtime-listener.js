/**
 * CMFlow — Écouteur de Notifications & Webhooks en Temps Réel (HTML/Vanilla JS)
 * Gère les notifications sonores, les Toasts Dribbble en haut à droite,
 * et la synchronisation inter-onglets lors des validations et retouches clients.
 */

(function () {
  'use strict';

  // Préférence de son mémorisée
  let soundEnabled = true;
  try {
    const saved = localStorage.getItem('cmflow_sound_enabled');
    if (saved !== null) {
      soundEnabled = saved === 'true';
    }
  } catch (e) {}

  /**
   * Synthétiseur de son Web Audio API (aucun fichier MP3 requis)
   */
  function playRealtimeChime(type) {
    if (!soundEnabled) return;
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;

      const ctx = new AudioContextClass();
      const now = ctx.currentTime;

      if (type === 'APPROVED' || type === 'POST_APPROVED') {
        // Accord majeur lumineux (Do - Mi - Sol)
        const freqs = [523.25, 659.25, 783.99];
        freqs.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.08);

          gain.gain.setValueAtTime(0, now + idx * 0.08);
          gain.gain.linearRampToValueAtTime(0.12, now + idx * 0.08 + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.45);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now + idx * 0.08);
          osc.stop(now + idx * 0.08 + 0.5);
        });
      } else {
        // Double tonalité douce d'avertissement
        const freqs = [440, 392];
        freqs.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + idx * 0.12);

          gain.gain.setValueAtTime(0, now + idx * 0.12);
          gain.gain.linearRampToValueAtTime(0.1, now + idx * 0.12 + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.35);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now + idx * 0.12);
          osc.stop(now + idx * 0.12 + 0.4);
        });
      }
    } catch (err) {
      console.debug('Web Audio not allowed without interaction:', err);
    }
  }

  /**
   * Crée le conteneur flottant de notifications en haut à droite
   */
  function ensureNotificationContainer() {
    let container = document.getElementById('cmflow-realtime-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'cmflow-realtime-toast-container';
      container.className = 'fixed top-5 right-5 z-[9999] max-w-sm w-full space-y-3 pointer-events-none';
      document.body.appendChild(container);
    }
    return container;
  }

  /**
   * Affiche un Toast Dribbble / Linear enrichi en temps réel
   */
  function displayRealtimeToast(data) {
    const container = ensureNotificationContainer();
    const action = data.action || (data.type === 'POST_APPROVED' ? 'APPROVED' : 'CHANGES_REQUESTED');
    const isApproved = action === 'APPROVED' || action === 'POST_APPROVED';

    const toast = document.createElement('div');
    toast.className =
      'pointer-events-auto bg-white/95 backdrop-blur-xl border border-slate-200/90 rounded-2xl shadow-[0_12px_40px_-8px_rgba(15,23,42,0.15)] p-4 overflow-hidden relative transition-all duration-300 transform translate-x-12 opacity-0';

    const iconHtml = isApproved
      ? '<div class="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200/80 ring-4 ring-emerald-50/50 flex items-center justify-center shrink-0 shadow-xs"><svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg></div>'
      : '<div class="w-10 h-10 rounded-xl bg-orange-50 text-[#F94F06] border border-orange-200/80 ring-4 ring-orange-50/50 flex items-center justify-center shrink-0 shadow-xs"><svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg></div>';

    const badgeClass = isApproved
      ? 'bg-emerald-100/80 text-emerald-800'
      : 'bg-orange-100/80 text-orange-900';

    const badgeText = isApproved ? 'Publication Validée !' : 'Demande de Retouche';
    const clientName = data.workspaceName || 'Client';
    const detailText = data.comment ? `"${data.comment}"` : (data.postCaption || 'Planning validé par le client 🚀');

    toast.innerHTML = `
      <div class="absolute bottom-0 left-0 h-1 ${isApproved ? 'bg-emerald-500' : 'bg-[#F94F06]'}" style="width: 100%; transition: width 6s linear;"></div>
      <div class="flex items-start gap-3.5">
        ${iconHtml}
        <div class="flex-1 min-w-0 pr-1">
          <div class="flex items-center justify-between gap-1 mb-0.5">
            <span class="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${badgeClass}">
              ${badgeText}
            </span>
            <span class="text-[10px] text-slate-400 font-medium">À l'instant</span>
          </div>
          <h4 class="text-xs font-bold text-slate-900 truncate">${clientName}</h4>
          <p class="text-xs text-slate-600 line-clamp-2 mt-1 ${data.comment ? 'italic bg-slate-50 p-1.5 rounded-lg border border-slate-100' : ''}">
            ${detailText}
          </p>
        </div>
        <button type="button" class="btn-dismiss-toast text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>
    `;

    container.appendChild(toast);

    // Animation d'entrée
    requestAnimationFrame(() => {
      toast.classList.remove('translate-x-12', 'opacity-0');
      toast.classList.add('translate-x-0', 'opacity-100');
    });

    // Jouer le son
    playRealtimeChime(action);

    // Gestion de fermeture manuelle
    const dismissBtn = toast.querySelector('.btn-dismiss-toast');
    if (dismissBtn) {
      dismissBtn.addEventListener('click', () => {
        toast.classList.add('opacity-0', 'translate-x-12');
        setTimeout(() => toast.remove(), 300);
      });
    }

    // Auto-dismiss après 6 secondes
    setTimeout(() => {
      if (toast && toast.parentNode) {
        toast.classList.add('opacity-0', 'translate-x-12');
        setTimeout(() => toast.remove(), 300);
      }
    }, 6000);
  }

  // Écouteur Firestore onSnapshot si Firebase est initialisé
  function initFirestoreListener() {
    if (typeof firebase !== 'undefined' && firebase.firestore) {
      try {
        const db = firebase.firestore();
        let isFirst = true;

        db.collection('activityLogs')
          .orderBy('timestamp', 'desc')
          .limit(1)
          .onSnapshot(
            function (snapshot) {
              if (isFirst) {
                isFirst = false;
                return;
              }
              snapshot.docChanges().forEach(function (change) {
                if (change.type === 'added') {
                  const data = change.doc.data();
                  displayRealtimeToast(data);
                }
              });
            },
            function (err) {
              console.debug('Firestore live listener offline:', err);
            }
          );
      } catch (e) {
        console.debug('Firestore init error:', e);
      }
    }
  }

  // Écouteur d'événements inter-onglets (Cross-Tab LocalStorage)
  window.addEventListener('storage', function (e) {
    if (e.key === 'cmflow_realtime_activity' && e.newValue) {
      try {
        const data = JSON.parse(e.newValue);
        displayRealtimeToast(data);
      } catch (err) {}
    }
  });

  // Déclenchement local dans le même onglet
  window.addEventListener('cmflow:activity', function (e) {
    if (e.detail) {
      displayRealtimeToast(e.detail);
    }
  });

  // Fonction utilitaire globale pour émettre une notification
  window.CMFlowRealtime = {
    trigger: function (data) {
      try {
        localStorage.setItem('cmflow_realtime_activity', JSON.stringify({ ...data, _t: Date.now() }));
      } catch (e) {}
      displayRealtimeToast(data);
    },
    toggleSound: function () {
      soundEnabled = !soundEnabled;
      try {
        localStorage.setItem('cmflow_sound_enabled', String(soundEnabled));
      } catch (e) {}
      return soundEnabled;
    },
    isSoundEnabled: function () {
      return soundEnabled;
    },
  };

  document.addEventListener('DOMContentLoaded', function () {
    initFirestoreListener();
  });
})();
