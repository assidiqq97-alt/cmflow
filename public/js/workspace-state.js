/**
 * CMFlow - Dynamic Multi-Client Workspace Manager (Vanilla JS for static site)
 * Synchronized with React WorkspaceContext
 */

const CMFlowWorkspaces = [
  {
    id: 'teranga-gourmet',
    name: 'Teranga Gourmet',
    slug: 'teranga_gourmet',
    country: 'Sénégal',
    flag: '🇸🇳',
    industry: 'Haute Gastronomie & Traiteur Événementiel',
    category: 'Haute Gastronomie & Traiteur',
    avatar: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&auto=format&fit=crop&q=80',
    logo: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&auto=format&fit=crop&q=80',
    plan: 'Scale',
    whatsappNumber: '+221 77 842 19 02',
    whatsapp: '+221 77 842 19 02',
    approvalRate: 98,
    monthlyGoal: 24,
    brandKit: {
      colors: { primary: '#F94F06', secondary: '#0F172A', accent: '#10B981' },
      typography: 'Plus Jakarta Sans',
      hashtags: ['#TerangaGourmet', '#DakarFood', '#CuisineSenegalaise', '#ThiebRoyal']
    },
    globalMetrics: {
      totalAudience: '53.7K',
      audienceChange: '+1.8K ce mois (+3.4%)',
      totalImpressions: '164.4K',
      impressionsChange: '+22.4% vs M-1',
      engagementRate: '5.8%',
      engagementStatus: 'Performant',
      completedPosts: 24,
      validationRate: '100% validés WhatsApp'
    }
  },
  {
    id: 'sira-cosmetiques',
    name: 'Sira Cosmétiques Bio',
    slug: 'sira_cosmetiques',
    country: 'Côte d\'Ivoire',
    flag: '🇨🇮',
    industry: 'Skincare Bio, Beauté & Soins Capillaires',
    category: 'Skincare & Beauté Naturelle',
    avatar: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=200&auto=format&fit=crop&q=80',
    logo: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=200&auto=format&fit=crop&q=80',
    plan: 'Pro',
    whatsappNumber: '+225 07 48 92 10 33',
    whatsapp: '+225 07 48 92 10 33',
    approvalRate: 95,
    monthlyGoal: 32,
    brandKit: {
      colors: { primary: '#EC4899', secondary: '#8B5CF6', accent: '#10B981' },
      typography: 'Outfit',
      hashtags: ['#SiraCosmetiques', '#BeauteAfricaine', '#SkincareBio']
    },
    globalMetrics: {
      totalAudience: '89.4K',
      audienceChange: '+6.4K ce mois (+7.7%)',
      totalImpressions: '312.8K',
      impressionsChange: '+41.2% vs M-1',
      engagementRate: '7.4%',
      engagementStatus: 'Exceptionnel',
      completedPosts: 32,
      validationRate: '98% validés WhatsApp'
    }
  },
  {
    id: 'dakar-tech-hub',
    name: 'Dakar Tech Hub',
    slug: 'dakar_tech_hub',
    country: 'Sénégal',
    flag: '🇸🇳',
    industry: 'Incubateur FinTech & Capital Risque B2B',
    category: 'Incubateur & SaaS FinTech',
    avatar: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=200&auto=format&fit=crop&q=80',
    logo: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=200&auto=format&fit=crop&q=80',
    plan: 'Enterprise',
    whatsappNumber: '+221 78 112 45 88',
    whatsapp: '+221 78 112 45 88',
    approvalRate: 100,
    monthlyGoal: 16,
    brandKit: {
      colors: { primary: '#0284C7', secondary: '#0F172A', accent: '#F59E0B' },
      typography: 'Inter',
      hashtags: ['#DakarTech', '#AfricanStartups', '#FintechDakar']
    },
    globalMetrics: {
      totalAudience: '26.2K',
      audienceChange: '+1.1K ce mois (+4.4%)',
      totalImpressions: '94.5K',
      impressionsChange: '+18.7% vs M-1',
      engagementRate: '4.9%',
      engagementStatus: 'B2B Élite',
      completedPosts: 16,
      validationRate: '100% validés WhatsApp'
    }
  }
];

const CMFlowWorkspaceManager = {
  getWorkspaces() {
    return CMFlowWorkspaces;
  },

  getActiveWorkspace() {
    const savedId = localStorage.getItem('cmflow_active_workspace_id');
    const found = CMFlowWorkspaces.find(w => w.id === savedId);
    return found || CMFlowWorkspaces[0];
  },

  setActiveWorkspace(id) {
    const found = CMFlowWorkspaces.find(w => w.id === id);
    if (found) {
      localStorage.setItem('cmflow_active_workspace_id', found.id);
      this.syncUI();
      if (typeof window.onWorkspaceChanged === 'function') {
        window.onWorkspaceChanged(found);
      }
      return found;
    }
    return null;
  },

  syncUI() {
    const ws = this.getActiveWorkspace();

    // Elements dans la sidebar
    document.querySelectorAll('.active-ws-name').forEach(el => el.textContent = ws.name);
    document.querySelectorAll('.active-ws-cat').forEach(el => el.textContent = ws.industry || ws.category);
    document.querySelectorAll('.active-ws-flag').forEach(el => el.textContent = ws.flag);
    document.querySelectorAll('.active-ws-avatar').forEach(el => {
      if (el.tagName === 'IMG') el.src = ws.avatar;
    });

    // Éléments IDs historiques
    const nameEl = document.getElementById('active-client-name');
    if (nameEl) nameEl.textContent = ws.name;
    const catEl = document.getElementById('active-client-cat');
    if (catEl) catEl.textContent = ws.industry || ws.category;
    const flagEl = document.getElementById('active-client-flag');
    if (flagEl) flagEl.textContent = ws.flag;
    const avatarEl = document.getElementById('active-client-avatar');
    if (avatarEl) avatarEl.src = ws.avatar;

    // Mise à jour de la liste déroulante
    const container = document.getElementById('client-list-container') || document.getElementById('workspace-dropdown-list');
    if (container) {
      container.innerHTML = CMFlowWorkspaces.map(w => {
        const isActive = w.id === ws.id;
        return `
          <button type="button" onclick="CMFlowWorkspaceManager.selectAndClose('${w.id}')" class="w-full flex items-center justify-between p-2.5 rounded-2xl cursor-pointer transition-all duration-150 ${isActive ? 'bg-orange-500/20 text-[#F94F06] font-bold border border-orange-500/30' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}">
            <div class="flex items-center gap-2.5 truncate">
              <img src="${w.avatar}" alt="${w.name}" class="w-6 h-6 rounded-lg object-cover">
              <div class="text-left truncate">
                <div class="text-xs truncate flex items-center gap-1">${w.name} <span>${w.flag}</span></div>
                <div class="text-[10px] text-slate-400 truncate">${w.industry || w.category}</div>
              </div>
            </div>
            ${isActive ? '<span class="text-xs font-black">✓</span>' : ''}
          </button>
        `;
      }).join('');
    }
  },

  selectAndClose(id) {
    const ws = this.setActiveWorkspace(id);
    const dropMenu = document.getElementById('client-dropdown-menu') || document.getElementById('workspace-dropdown-menu');
    if (dropMenu) {
      dropMenu.classList.add('hidden');
    }
    if (typeof showToast === 'function') {
      showToast(`Espace commuté sur « ${ws.name} » ${ws.flag}`);
    }
  },

  init() {
    this.syncUI();

    const dropBtn = document.getElementById('client-dropdown-btn') || document.getElementById('workspace-dropdown-btn');
    const dropMenu = document.getElementById('client-dropdown-menu') || document.getElementById('workspace-dropdown-menu');

    if (dropBtn && dropMenu) {
      dropBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        dropMenu.classList.toggle('hidden');
      });

      document.addEventListener('click', (e) => {
        if (!dropMenu.contains(e.target) && !dropBtn.contains(e.target)) {
          dropMenu.classList.add('hidden');
        }
      });
    }

    // Gestion Universelle de la Sidebar Mobile (sur toutes les pages du dashboard)
    const side = document.getElementById('sidebar');
    const sideBack = document.getElementById('sidebar-backdrop');
    const openSide = document.getElementById('open-sidebar-btn');
    const closeSide = document.getElementById('close-sidebar-btn');

    if (openSide && side) {
      openSide.addEventListener('click', (e) => {
        e.stopPropagation();
        side.classList.remove('-translate-x-full');
        if (sideBack) sideBack.classList.remove('hidden');
      });
    }

    if (closeSide && side) {
      closeSide.addEventListener('click', (e) => {
        e.stopPropagation();
        side.classList.add('-translate-x-full');
        if (sideBack) sideBack.classList.add('hidden');
      });
    }

    if (sideBack && side) {
      sideBack.addEventListener('click', () => {
        side.classList.add('-translate-x-full');
        sideBack.classList.add('hidden');
      });
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  CMFlowWorkspaceManager.init();
});

