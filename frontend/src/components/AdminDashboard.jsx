import React, { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  BarChart3,
  BookOpen,
  FileText,
  MessageSquare,
  Users,
  ShieldAlert,
  LogOut,
  Moon,
  Sun,
  Upload,
  Trash2,
  Save,
  CheckCircle2,
  XCircle,
  Menu,
  Shield,
  Loader2,
  Pencil,
  Settings,
  ChevronRight,
  TrendingUp,
  Activity,
  Sparkles,
  X,
} from "lucide-react";
import {
  getAdminStats,
  getAdminArticles,
  deleteAdminArticle,
  resetAdminArticles,
  adminUploadPDF,
  updateAdminArticle,
  getAssistantConfig,
  updateAssistantConfig,
  getAdminUsers,
  deleteAdminUser,
} from "../services/api";

/* ============================================================
   INLINE STYLES (injected once)
   ============================================================ */
const ADMIN_STYLES = `
  @keyframes adminFadeUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes adminSlideIn {
    from { opacity: 0; transform: translateX(-12px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes adminPulseGlow {
    0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.15); }
    50%      { box-shadow: 0 0 40px rgba(59, 130, 246, 0.25); }
  }
  @keyframes adminGradientMove {
    0%   { background-position: 0% 50%; }
    50%  { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  @keyframes shimmer {
    0%   { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
  .admin-fade-up { animation: adminFadeUp 0.5s ease-out both; }
  .admin-fade-up-1 { animation: adminFadeUp 0.5s 0.05s ease-out both; }
  .admin-fade-up-2 { animation: adminFadeUp 0.5s 0.1s ease-out both; }
  .admin-fade-up-3 { animation: adminFadeUp 0.5s 0.15s ease-out both; }
  .admin-fade-up-4 { animation: adminFadeUp 0.5s 0.2s ease-out both; }
  .admin-slide-in { animation: adminSlideIn 0.4s ease-out both; }

  .admin-sidebar-gradient {
    background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%);
  }
  .admin-sidebar-gradient-light {
    background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
  }

  .admin-stat-card {
    position: relative;
    overflow: hidden;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .admin-stat-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 40px rgba(0,0,0,0.08);
  }
  .admin-stat-card::after {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 120px;
    height: 120px;
    border-radius: 50%;
    opacity: 0.06;
    transform: translate(30%, -30%);
  }

  .admin-nav-item {
    position: relative;
    transition: all 0.2s ease;
  }
  .admin-nav-item::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 3px;
    height: 0;
    border-radius: 0 4px 4px 0;
    background: #3b82f6;
    transition: height 0.25s ease;
  }
  .admin-nav-item.active::before {
    height: 60%;
  }

  .admin-table-row {
    transition: all 0.15s ease;
  }
  .admin-table-row:hover {
    background: rgba(59, 130, 246, 0.04) !important;
  }

  .admin-glass {
    backdrop-filter: blur(16px) saturate(180%);
    -webkit-backdrop-filter: blur(16px) saturate(180%);
  }

  .admin-scrollbar::-webkit-scrollbar {
    width: 5px;
  }
  .admin-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  .admin-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(148, 163, 184, 0.3);
    border-radius: 10px;
  }
  .admin-scrollbar::-webkit-scrollbar-thumb:hover {
    background: rgba(148, 163, 184, 0.5);
  }
`;

const TABS = [
  { id: "stats", icon: BarChart3, label: "Statistiques", desc: "Vue d'ensemble" },
  { id: "config", icon: Settings, label: "Configuration IA", desc: "Prompt & paramètres" },
  { id: "articles", icon: BookOpen, label: "Gestion des lois", desc: "Import & édition" },
  { id: "users", icon: Users, label: "Utilisateurs", desc: "Gestion des comptes" },
];

/* ============================================================
   MAIN COMPONENT
   ============================================================ */
export default function AdminDashboard({ user, onLogout, isLightMode, onToggleTheme }) {
  const [activeTab, setActiveTab] = useState("stats");
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  return (
    <>
      <style>{ADMIN_STYLES}</style>
      <div className="flex h-screen w-full overflow-hidden" style={{ background: "var(--bg)", color: "var(--text)" }}>
        {/* ——— Sidebar ——— */}
        <aside
          className={`shrink-0 flex flex-col transition-all duration-300 overflow-hidden z-40 ${
            isLightMode ? "admin-sidebar-gradient-light" : "admin-sidebar-gradient"
          }`}
          style={{
            width: sidebarOpen ? 272 : 0,
            borderRight: sidebarOpen ? `1px solid ${isLightMode ? "#e2e8f0" : "#334155"}` : "none",
          }}
        >
          {/* Logo */}
          <div className="p-5 flex items-center gap-4" style={{ borderBottom: `1px solid ${isLightMode ? "#e2e8f0" : "#334155"}` }}>
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center shadow-lg"
              style={{
                background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                color: "#fff",
              }}
            >
              <Shield className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold tracking-[0.15em] uppercase" style={{ color: isLightMode ? "#3b82f6" : "#60a5fa" }}>
                Admin Panel
              </span>
              <span className="text-[11px] truncate max-w-[160px] mt-0.5" style={{ color: isLightMode ? "#94a3b8" : "#64748b" }}>
                {user?.email}
              </span>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 py-5 px-3 flex flex-col gap-1 admin-scrollbar overflow-y-auto">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`admin-nav-item ${isActive ? "active" : ""} flex items-center gap-3 px-4 py-3 rounded-xl border-none cursor-pointer text-left w-full`}
                  style={{
                    background: isActive
                      ? isLightMode ? "rgba(59, 130, 246, 0.08)" : "rgba(59, 130, 246, 0.12)"
                      : "transparent",
                    color: isActive
                      ? isLightMode ? "#2563eb" : "#60a5fa"
                      : isLightMode ? "#64748b" : "#94a3b8",
                  }}
                >
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                    style={{
                      background: isActive
                        ? isLightMode ? "rgba(59, 130, 246, 0.12)" : "rgba(59, 130, 246, 0.18)"
                        : "transparent",
                    }}
                  >
                    <Icon className="w-[18px] h-[18px]" strokeWidth={isActive ? 2.2 : 1.8} />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[13px] font-semibold truncate">{tab.label}</span>
                    <span className="text-[11px] truncate" style={{ color: isLightMode ? "#94a3b8" : "#475569", opacity: isActive ? 1 : 0.7 }}>
                      {tab.desc}
                    </span>
                  </div>
                  {isActive && (
                    <ChevronRight className="w-4 h-4 ml-auto shrink-0" style={{ color: isLightMode ? "#3b82f6" : "#60a5fa" }} />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Bottom */}
          <div className="p-4 flex flex-col gap-2" style={{ borderTop: `1px solid ${isLightMode ? "#e2e8f0" : "#334155"}` }}>
            <button
              onClick={onToggleTheme}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border-none cursor-pointer text-[13px] font-medium transition-all"
              style={{
                background: isLightMode ? "#e2e8f0" : "#1e293b",
                color: isLightMode ? "#475569" : "#94a3b8",
              }}
            >
              {isLightMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              {isLightMode ? "Mode sombre" : "Mode clair"}
            </button>
            <button
              onClick={() => setShowLogoutModal(true)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border-none cursor-pointer text-[13px] font-medium transition-all"
              style={{ background: "rgba(239, 68, 68, 0.08)", color: "#ef4444" }}
            >
              <LogOut className="w-4 h-4" /> Déconnexion
            </button>
          </div>
        </aside>

        {/* ——— Mobile overlay ——— */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm transition-opacity"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* ——— Main content ——— */}
        <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
          {/* Header */}
          <header
            className="h-16 shrink-0 px-6 flex items-center gap-4 z-10"
            style={{
              borderBottom: `1px solid var(--border)`,
              background: "var(--surface)",
            }}
          >
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg border-none cursor-pointer transition-colors"
              style={{ background: "transparent", color: "var(--muted)" }}
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 flex-1">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: "rgba(59, 130, 246, 0.1)", color: "#3b82f6" }}
              >
                {React.createElement(TABS.find((t) => t.id === activeTab)?.icon || BarChart3, {
                  className: "w-4 h-4",
                })}
              </div>
              <div>
                <h1 className="text-base font-bold m-0 leading-tight" style={{ color: "var(--text)" }}>
                  {TABS.find((t) => t.id === activeTab)?.label}
                </h1>
                <p className="text-[11px] m-0" style={{ color: "var(--muted)" }}>
                  {TABS.find((t) => t.id === activeTab)?.desc}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-medium"
                style={{ background: "rgba(16, 185, 129, 0.1)", color: "#10b981" }}
              >
                <Activity className="w-3 h-3" />
                Système actif
              </div>
            </div>
          </header>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 admin-scrollbar" style={{ background: "var(--bg)" }}>
            <div className="max-w-7xl mx-auto">
              {activeTab === "stats" && <StatsTab />}
              {activeTab === "config" && <ConfigTab />}
              {activeTab === "articles" && <ArticlesTab />}
              {activeTab === "users" && <UsersTab />}
            </div>
          </div>
        </main>

        {/* Logout Modal */}
        {showLogoutModal && createPortal(
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[2000] flex items-center justify-center p-4"
            onClick={() => setShowLogoutModal(false)}
            style={{ animation: "adminFadeUp 0.2s ease-out" }}
          >
            <div
              className="rounded-2xl w-full max-w-[400px] p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
              style={{ background: "var(--surface)", animation: "adminFadeUp 0.3s ease-out" }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(239, 68, 68, 0.1)" }}>
                  <LogOut className="w-5 h-5 text-red-500" />
                </div>
                <h2 className="text-lg font-bold m-0" style={{ color: "var(--text)" }}>Déconnexion</h2>
              </div>
              <p className="text-sm mb-6 leading-relaxed" style={{ color: "var(--muted)" }}>
                Êtes-vous sûr de vouloir vous déconnecter du compte{" "}
                <strong style={{ color: "var(--text)" }}>{user?.email || "Admin"}</strong> ?
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  className="px-4 py-2.5 border-none rounded-xl font-medium cursor-pointer transition-all text-sm"
                  onClick={() => setShowLogoutModal(false)}
                  style={{ background: "var(--surface2)", color: "var(--text)" }}
                >
                  Annuler
                </button>
                <button
                  className="px-4 py-2.5 border-none rounded-xl font-medium cursor-pointer transition-all text-sm text-white"
                  onClick={() => { setShowLogoutModal(false); onLogout(); }}
                  style={{ background: "linear-gradient(135deg, #ef4444, #dc2626)" }}
                >
                  Se déconnecter
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
      </div>
    </>
  );
}

/* ============================================================
   STAT CARD (premium)
   ============================================================ */
function StatCard({ icon: Icon, label, value, color, delay = 0 }) {
  return (
    <div
      className="admin-stat-card rounded-2xl p-5 flex items-center gap-4 border"
      style={{
        background: "var(--surface)",
        borderColor: "var(--border)",
        animation: `adminFadeUp 0.5s ${delay}s ease-out both`,
      }}
    >
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: `${color}12`, color }}
      >
        <Icon className="w-6 h-6" strokeWidth={2} />
      </div>
      <div className="min-w-0">
        <div className="text-2xl font-extrabold tracking-tight leading-none mb-1" style={{ color: "var(--text)" }}>
          {typeof value === "number" ? value.toLocaleString("fr-FR") : value}
        </div>
        <div className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--muted)" }}>{label}</div>
      </div>
      {/* Decorative accent */}
      <div className="ml-auto shrink-0 hidden sm:block" style={{ color: `${color}30` }}>
        <TrendingUp className="w-8 h-8" />
      </div>
    </div>
  );
}

/* ============================================================
   SECTION HEADER helper
   ============================================================ */
function SectionHeader({ icon: Icon, title, subtitle, color = "#3b82f6", children }) {
  return (
    <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${color}12`, color }}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base font-bold m-0 leading-tight" style={{ color: "var(--text)" }}>{title}</h3>
          {subtitle && <p className="text-[11px] m-0 mt-0.5" style={{ color: "var(--muted)" }}>{subtitle}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}

/* ============================================================
   STATS TAB
   ============================================================ */
function StatsTab() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminStats()
      .then(setStats)
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;
  if (!stats) return <p style={{ color: "var(--muted)" }}>Erreur de chargement.</p>;

  const cards = [
    { icon: Users, label: "Utilisateurs", value: stats.total_users, color: "#3b82f6" },
    { icon: CheckCircle2, label: "Vérifiés", value: stats.verified_users, color: "#10b981" },
    { icon: MessageSquare, label: "Conversations", value: stats.total_conversations, color: "#8b5cf6" },
    { icon: BarChart3, label: "Messages", value: stats.total_messages, color: "#f59e0b" },
    { icon: BookOpen, label: "Articles", value: stats.total_articles, color: "#ef4444" },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {cards.map((c, i) => (
          <StatCard key={c.label} {...c} delay={i * 0.06} />
        ))}
      </div>

      {/* Recent Users */}
      <div
        className="rounded-2xl border p-5 admin-fade-up-2"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}
      >
        <SectionHeader icon={Users} title="Derniers inscrits" subtitle="Les 5 dernières inscriptions" color="#3b82f6" />

        {(stats.recent_users || []).length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-14 h-14 mx-auto mb-3 opacity-10" />
            <p className="text-sm" style={{ color: "var(--muted)" }}>Aucun utilisateur inscrit.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border" style={{ borderColor: "var(--border)" }}>
            <table className="w-full text-sm" style={{ borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--bg)" }}>
                  <th className="text-left py-3 px-4 font-semibold text-xs uppercase tracking-wider" style={{ color: "var(--muted)" }}>Email</th>
                  <th className="text-left py-3 px-4 font-semibold text-xs uppercase tracking-wider" style={{ color: "var(--muted)" }}>Nom complet</th>
                  <th className="text-center py-3 px-4 font-semibold text-xs uppercase tracking-wider" style={{ color: "var(--muted)" }}>Statut</th>
                </tr>
              </thead>
              <tbody>
                {stats.recent_users.slice(0, 5).map((u) => (
                  <tr key={u.id} className="admin-table-row" style={{ borderBottom: "1px solid var(--border)" }}>
                    <td className="py-3 px-4 font-medium" style={{ color: "var(--text)" }}>{u.email}</td>
                    <td className="py-3 px-4" style={{ color: "var(--text)" }}>{u.first_name} {u.last_name}</td>
                    <td className="py-3 px-4 text-center">
                      {u.is_verified ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold" style={{ background: "rgba(16, 185, 129, 0.1)", color: "#10b981" }}>
                          <CheckCircle2 className="w-3 h-3" /> Vérifié
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold" style={{ background: "rgba(245, 158, 11, 0.1)", color: "#f59e0b" }}>
                          <XCircle className="w-3 h-3" /> En attente
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   ARTICLES TAB
   ============================================================ */
function ArticlesTab() {
  const [total, setTotal] = useState(0);
  const [articles, setArticles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState("");
  const [uploadLoiVersion, setUploadLoiVersion] = useState("12-90");

  const [editingArticle, setEditingArticle] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [savingArticle, setSavingArticle] = useState(false);

  const [filterLoi, setFilterLoi] = useState("");

  const loadArticles = useCallback(() => {
    getAdminArticles(500, 0, filterLoi)
      .then((d) => { setTotal(d.total); setArticles(d.articles || []); })
      .catch(console.error);
  }, [filterLoi]);

  useEffect(() => { loadArticles(); }, [loadArticles]);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadMsg("");
    try {
      const res = await adminUploadPDF(file, uploadLoiVersion);
      setUploadMsg(`✅ ${res.message}`);
      setTimeout(loadArticles, 3000);
    } catch (err) {
      setUploadMsg(`❌ ${err.message}`);
    }
    setUploading(false);
  };

  const handleResetAll = async () => {
    if (!window.confirm("⚠️ Supprimer TOUS les articles ? Cette action est irréversible.")) return;
    try {
      await resetAdminArticles();
      loadArticles();
    } catch (err) {
      alert(err.message);
    }
  };

  const openEdit = (article) => {
    setEditingArticle(article);
    setEditTitle(article.titre || "");
    setEditContent(article.contenu || "");
  };

  const saveEdit = async () => {
    setSavingArticle(true);
    try {
      await updateAdminArticle(editingArticle.id, editTitle, editContent);
      setEditingArticle(null);
      loadArticles();
    } catch (err) {
      alert(err.message);
    }
    setSavingArticle(false);
  };

  const handleDeleteArticle = async (id) => {
    if (!window.confirm("Supprimer cet article ?")) return;
    try {
      await deleteAdminArticle(id);
      loadArticles();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="flex flex-col gap-6 admin-fade-up">
      {/* Upload Card */}
      <div
        className="rounded-2xl border p-6 flex flex-col gap-4"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}
      >
        <SectionHeader icon={Upload} title="Importer un PDF de loi" subtitle="Extraction OCR automatique des articles" color="#8b5cf6" />

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={uploadLoiVersion}
            onChange={(e) => setUploadLoiVersion(e.target.value)}
            className="px-4 py-2.5 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            style={{ background: "var(--surface2)", borderColor: "var(--border)", color: "var(--text)" }}
          >
            <option value="12-90">Loi 12-90 (Urbanisme)</option>
            <option value="25-90">Loi 25-90 (Lotissements)</option>
          </select>

          <label
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold cursor-pointer transition-all hover:opacity-90 shadow-sm text-white"
            style={{ background: "linear-gradient(135deg, #8b5cf6, #6d28d9)" }}
          >
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            {uploading ? "Traitement OCR..." : "Choisir un fichier PDF"}
            <input type="file" accept=".pdf" onChange={handleUpload} disabled={uploading} className="hidden" />
          </label>

          <button
            onClick={handleResetAll}
            disabled={total === 0}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-none text-sm font-medium cursor-pointer transition-all disabled:opacity-40"
            style={{ background: "rgba(239, 68, 68, 0.08)", color: "#ef4444" }}
          >
            <Trash2 className="w-4 h-4" /> Vider ({total})
          </button>
        </div>

        {uploadMsg && (
          <div className={`p-3 rounded-xl text-sm flex items-center gap-2 ${uploadMsg.startsWith('✅') ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}
            style={{ background: uploadMsg.startsWith('✅') ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)' }}>
            {uploadMsg}
          </div>
        )}
      </div>

      {/* Articles Table */}
      {articles.length > 0 && (
        <div
          className="rounded-2xl border overflow-hidden admin-fade-up-1"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}
        >
          <div className="p-4 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border)" }}>
            <SectionHeader icon={BookOpen} title={`Textes de loi (${total})`} color="#3b82f6" />
            <select
              value={filterLoi}
              onChange={(e) => setFilterLoi(e.target.value)}
              className="px-3 py-1.5 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              style={{ background: "var(--surface2)", borderColor: "var(--border)", color: "var(--text)" }}
            >
              <option value="">Toutes les lois</option>
              <option value="12-90">Loi 12-90</option>
              <option value="25-90">Loi 25-90</option>
            </select>
          </div>
          <div className="overflow-x-auto max-h-[480px] admin-scrollbar">
            <table className="w-full text-sm" style={{ borderCollapse: "collapse" }}>
              <thead className="sticky top-0 z-10" style={{ background: "var(--surface)" }}>
                <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--bg)" }}>
                  <th className="text-left py-3 px-5 font-semibold text-xs uppercase tracking-wider" style={{ color: "var(--muted)", width: "80px" }}>Loi</th>
                  <th className="text-left py-3 px-5 font-semibold text-xs uppercase tracking-wider" style={{ color: "var(--muted)", width: "80px" }}>Article</th>
                  <th className="text-left py-3 px-5 font-semibold text-xs uppercase tracking-wider" style={{ color: "var(--muted)" }}>Titre</th>
                  <th className="text-right py-3 px-5 font-semibold text-xs uppercase tracking-wider" style={{ color: "var(--muted)", width: "100px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {articles.map((a) => (
                  <tr key={a.id} className="admin-table-row" style={{ borderBottom: "1px solid var(--border)" }}>
                    <td className="py-3 px-5">
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-bold" style={{ background: "rgba(59, 130, 246, 0.1)", color: "#3b82f6" }}>
                        {a.loi_version}
                      </span>
                    </td>
                    <td className="py-3 px-5 font-bold text-sm" style={{ color: "var(--text)" }}>Art. {a.article_number}</td>
                    <td className="py-3 px-5 truncate max-w-[250px]" style={{ color: "var(--text)" }}>{a.titre || "Sans titre"}</td>
                    <td className="py-3 px-5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(a)}
                          className="p-1.5 rounded-lg border-none cursor-pointer transition-colors"
                          style={{ background: "rgba(59, 130, 246, 0.08)", color: "#3b82f6" }}
                          title="Éditer"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteArticle(a.id)}
                          className="p-1.5 rounded-lg border-none cursor-pointer transition-colors"
                          style={{ background: "rgba(239, 68, 68, 0.08)", color: "#ef4444" }}
                          title="Supprimer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingArticle && createPortal(
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[2000] flex items-center justify-center p-4"
             onClick={() => setEditingArticle(null)}
             style={{ animation: "adminFadeUp 0.2s ease-out" }}>
          <div className="rounded-2xl w-full max-w-3xl flex flex-col max-h-[90vh] shadow-2xl"
               onClick={(e) => e.stopPropagation()}
               style={{ background: "var(--surface)", animation: "adminFadeUp 0.3s ease-out" }}>

            <div className="p-5 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border)" }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(59, 130, 246, 0.1)" }}>
                  <Pencil className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <h2 className="text-base font-bold m-0" style={{ color: "var(--text)" }}>Édition — Article {editingArticle.article_number}</h2>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md mt-0.5 inline-block" style={{ background: "rgba(59, 130, 246, 0.1)", color: "#3b82f6" }}>
                    Loi {editingArticle.loi_version}
                  </span>
                </div>
              </div>
              <button onClick={() => setEditingArticle(null)} className="p-2 border-none bg-transparent cursor-pointer rounded-lg transition-colors" style={{ color: "var(--muted)" }}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-4 admin-scrollbar">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--muted)" }}>Titre de l'article</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full rounded-xl border p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  style={{ background: "var(--surface2)", borderColor: "var(--border)", color: "var(--text)" }}
                  dir="rtl"
                />
              </div>
              <div className="flex flex-col gap-2 flex-1 min-h-[250px]">
                <label className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--muted)" }}>Contenu (Texte OCR)</label>
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full flex-1 rounded-xl border p-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none transition-all"
                  style={{ background: "var(--surface2)", borderColor: "var(--border)", color: "var(--text)" }}
                  dir="rtl"
                />
                <p className="text-[11px] m-0" style={{ color: "var(--muted)" }}>Corrigez les erreurs OCR pour améliorer la recherche IA.</p>
              </div>
            </div>

            <div className="p-5 flex justify-end gap-3" style={{ borderTop: "1px solid var(--border)" }}>
              <button
                className="px-5 py-2.5 rounded-xl border-none text-sm font-medium cursor-pointer transition-all"
                style={{ background: "var(--surface2)", color: "var(--text)" }}
                onClick={() => setEditingArticle(null)}
              >
                Annuler
              </button>
              <button
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl border-none text-sm font-bold cursor-pointer transition-all text-white shadow-sm"
                style={{ background: "linear-gradient(135deg, #3b82f6, #2563eb)" }}
                onClick={saveEdit}
                disabled={savingArticle}
              >
                {savingArticle ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {savingArticle ? "Sauvegarde..." : "Enregistrer"}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

/* ============================================================
   CONFIG TAB
   ============================================================ */
function ConfigTab() {
  const [config, setConfig] = useState({ system_prompt: "", temperature: 0.15 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    getAssistantConfig()
      .then(setConfig)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMsg("");
    try {
      await updateAssistantConfig(config.system_prompt, config.temperature);
      setMsg("✅ Configuration sauvegardée avec succès.");
      setTimeout(() => setMsg(""), 3000);
    } catch (err) {
      setMsg(`❌ ${err.message}`);
    }
    setSaving(false);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="flex flex-col gap-6 admin-fade-up">
      <div
        className="rounded-2xl border p-6 flex flex-col gap-6"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}
      >
        <SectionHeader icon={Sparkles} title="Configuration de l'Assistant" subtitle="Paramétrez le comportement de l'IA" color="#8b5cf6" />

        {/* Temperature */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--muted)" }}>
              Température (Créativité)
            </label>
            <span
              className="text-sm font-bold px-3 py-1 rounded-lg"
              style={{ background: "rgba(139, 92, 246, 0.1)", color: "#8b5cf6" }}
            >
              {config.temperature}
            </span>
          </div>
          <input
            type="range"
            min="0" max="1" step="0.05"
            value={config.temperature}
            onChange={(e) => setConfig({ ...config, temperature: parseFloat(e.target.value) })}
            className="w-full max-w-lg accent-violet-500"
            style={{ accentColor: "#8b5cf6" }}
          />
          <div className="flex justify-between text-[11px] max-w-lg" style={{ color: "var(--muted)" }}>
            <span>0.0 — Factuel (recommandé)</span>
            <span>1.0 — Créatif</span>
          </div>
        </div>

        {/* System Prompt */}
        <div className="flex flex-col gap-2 mt-2">
          <label className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--muted)" }}>
            Instructions système (System Prompt)
          </label>
          <textarea
            value={config.system_prompt}
            onChange={(e) => setConfig({ ...config, system_prompt: e.target.value })}
            rows={15}
            className="w-full rounded-xl border p-4 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all font-mono leading-relaxed"
            style={{
              background: "var(--surface2)", borderColor: "var(--border)",
              color: "var(--text)"
            }}
            placeholder="Écrivez le prompt système..."
          />
          <p className="text-[11px] m-0" style={{ color: "var(--muted)" }}>
            Ces instructions définissent le comportement global de l'IA (format des réponses, ton, règles).
          </p>
        </div>

        {/* Save */}
        <div className="flex items-center justify-between mt-2 pt-5" style={{ borderTop: "1px solid var(--border)" }}>
          <div className="text-sm font-medium">
            {msg && (
              <span className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm"
                style={{
                  background: msg.startsWith("✅") ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)",
                  color: msg.startsWith("✅") ? "#10b981" : "#ef4444",
                }}>
                {msg}
              </span>
            )}
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl border-none text-sm font-bold cursor-pointer transition-all hover:opacity-90 disabled:opacity-50 shadow-sm text-white"
            style={{ background: "linear-gradient(135deg, #8b5cf6, #6d28d9)" }}
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? "Sauvegarde..." : "Enregistrer"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   USERS TAB
   ============================================================ */
function UsersTab() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const fetchUsers = useCallback(() => {
    setLoading(true);
    getAdminUsers(100, 0)
      .then((d) => { setUsers(d.users); setTotal(d.total); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleDeleteUser = (user) => {
    setUserToDelete(user);
    setDeleteError("");
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;
    setIsDeleting(true);
    setDeleteError("");
    try {
      await deleteAdminUser(userToDelete.id);
      setUsers(prev => prev.filter(u => u.id !== userToDelete.id));
      setTotal(t => t - 1);
      setUserToDelete(null);
    } catch (err) {
      setDeleteError(err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="admin-fade-up">
      <div
        className="rounded-2xl border overflow-hidden"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}
      >
        <div className="p-5" style={{ borderBottom: "1px solid var(--border)" }}>
          <SectionHeader icon={Users} title={`Utilisateurs (${total})`} subtitle="Gestion et modération des comptes" color="#3b82f6" />
        </div>

        {users.length === 0 ? (
          <div className="text-center py-16">
            <Users className="w-14 h-14 mx-auto mb-3 opacity-10" />
            <p className="text-sm" style={{ color: "var(--muted)" }}>Aucun utilisateur inscrit.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm" style={{ borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--bg)" }}>
                  <th className="text-left py-3 px-5 font-semibold text-xs uppercase tracking-wider" style={{ color: "var(--muted)", width: "60px" }}>ID</th>
                  <th className="text-left py-3 px-5 font-semibold text-xs uppercase tracking-wider" style={{ color: "var(--muted)" }}>Utilisateur</th>
                  <th className="text-center py-3 px-5 font-semibold text-xs uppercase tracking-wider" style={{ color: "var(--muted)", width: "100px" }}>Statut</th>
                  <th className="text-left py-3 px-5 font-semibold text-xs uppercase tracking-wider" style={{ color: "var(--muted)" }}>Inscription</th>
                  <th className="text-left py-3 px-5 font-semibold text-xs uppercase tracking-wider" style={{ color: "var(--muted)" }}>Connexion</th>
                  <th className="text-right py-3 px-5 font-semibold text-xs uppercase tracking-wider" style={{ color: "var(--muted)", width: "80px" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="admin-table-row" style={{ borderBottom: "1px solid var(--border)" }}>
                    <td className="py-3 px-5 font-medium text-xs" style={{ color: "var(--muted)" }}>#{u.id}</td>
                    <td className="py-3 px-5">
                      <div className="font-semibold text-sm" style={{ color: "var(--text)" }}>{u.first_name} {u.last_name}</div>
                      <div className="text-[11px] mt-0.5" style={{ color: "var(--muted)" }}>{u.email}</div>
                    </td>
                    <td className="py-3 px-5 text-center">
                      {u.is_verified ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold" style={{ background: "rgba(16, 185, 129, 0.1)", color: "#10b981" }}>
                          <CheckCircle2 className="w-3 h-3" /> Vérifié
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold" style={{ background: "rgba(245, 158, 11, 0.1)", color: "#f59e0b" }}>
                          <XCircle className="w-3 h-3" /> En attente
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-5 text-xs" style={{ color: "var(--muted)" }}>
                      {u.created_at ? new Date(u.created_at).toLocaleDateString("fr-FR") : "—"}
                    </td>
                    <td className="py-3 px-5 text-xs" style={{ color: "var(--muted)" }}>
                      {u.last_login ? new Date(u.last_login).toLocaleDateString("fr-FR") : <span className="italic opacity-50">Jamais</span>}
                    </td>
                    <td className="py-3 px-5 text-right">
                      <button
                        onClick={() => handleDeleteUser(u)}
                        className="p-1.5 rounded-lg border-none cursor-pointer transition-colors"
                        style={{ background: "rgba(239, 68, 68, 0.08)", color: "#ef4444" }}
                        title="Supprimer cet utilisateur"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Delete Modal */}
        {userToDelete && createPortal(
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[2000] flex items-center justify-center p-4"
            onClick={() => !isDeleting && setUserToDelete(null)}
            style={{ animation: "adminFadeUp 0.2s ease-out" }}
          >
            <div
              className="rounded-2xl w-full max-w-[420px] p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
              style={{ background: "var(--surface)", animation: "adminFadeUp 0.3s ease-out" }}
              dir="ltr"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(239, 68, 68, 0.1)" }}>
                  <Trash2 className="w-5 h-5 text-red-500" />
                </div>
                <h2 className="text-lg font-bold m-0" style={{ color: "var(--text)" }}>Supprimer l'utilisateur</h2>
              </div>
              <p className="text-sm mb-5 leading-relaxed" style={{ color: "var(--muted)" }}>
                Êtes-vous sûr de vouloir supprimer l'utilisateur{" "}
                <strong style={{ color: "var(--text)" }}>{userToDelete.email}</strong> ?
                <br />
                <span className="text-xs text-red-400 mt-1 inline-block">Cette action supprimera également tout son historique.</span>
              </p>
              {deleteError && (
                <p className="text-[13px] mb-4 px-3 py-2 rounded-lg" style={{ background: "rgba(239, 68, 68, 0.08)", color: "#ef4444" }}>{deleteError}</p>
              )}
              <div className="flex gap-3 justify-end">
                <button
                  className="px-4 py-2.5 border-none rounded-xl font-medium cursor-pointer transition-all text-sm disabled:opacity-50"
                  onClick={() => setUserToDelete(null)}
                  disabled={isDeleting}
                  style={{ background: "var(--surface2)", color: "var(--text)" }}
                >
                  Annuler
                </button>
                <button
                  className="flex items-center gap-2 px-4 py-2.5 border-none rounded-xl font-medium cursor-pointer transition-all text-sm text-white disabled:opacity-50"
                  onClick={confirmDeleteUser}
                  disabled={isDeleting}
                  style={{ background: "linear-gradient(135deg, #ef4444, #dc2626)" }}
                >
                  {isDeleting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isDeleting ? "Suppression..." : "Supprimer"}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
      </div>
    </div>
  );
}

/* ============================================================
   LOADING SPINNER
   ============================================================ */
function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-16 w-full h-full">
      <div className="flex flex-col items-center gap-4" style={{ color: "var(--muted)" }}>
        <div className="relative">
          <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
          <div className="absolute inset-0 rounded-full" style={{ animation: "adminPulseGlow 2s ease-in-out infinite" }} />
        </div>
        <span className="text-sm font-medium tracking-wide">Chargement des données...</span>
      </div>
    </div>
  );
}
