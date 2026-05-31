"use client";

import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, addDoc, serverTimestamp, updateDoc, doc } from "firebase/firestore";
import React, { useEffect, useState } from "react";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ==========================================
// EMAILJS CONFIG — set in .env.local
// NEXT_PUBLIC_EMAILJS_SERVICE_ID
// NEXT_PUBLIC_EMAILJS_TEMPLATE_ID
// NEXT_PUBLIC_EMAILJS_PUBLIC_KEY
// ==========================================
const EMAILJS_SERVICE_ID  = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID  || "";
const EMAILJS_TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || "";
const EMAILJS_PUBLIC_KEY  = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY  || "";

async function sendOrderEmail({ client, articles, subtotal, fraisLivraison, total }) {
  if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) return;
  const itemsList = articles
    .map((a) => `• ${a.nom} × ${a.quantite} = ${(a.prix * a.quantite).toLocaleString("fr-DZ")} DA`)
    .join("\n");
  await fetch("https://api.emailjs.com/api/v1.0/email/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      service_id: EMAILJS_SERVICE_ID,
      template_id: EMAILJS_TEMPLATE_ID,
      user_id: EMAILJS_PUBLIC_KEY,
      template_params: {
        to_email: "tahartahar9e@gmail.com",
        client_nom: client.nom,
        client_telephone: client.telephone,
        client_wilaya: client.wilaya,
        client_adresse: client.adresse,
        client_notes: client.notes || "—",
        type_livraison: client.typeLivraison === "domicile" ? "À domicile" : "Point relais",
        articles_list: itemsList,
        subtotal: `${subtotal.toLocaleString("fr-DZ")} DA`,
        frais_livraison: `${fraisLivraison.toLocaleString("fr-DZ")} DA`,
        total: `${total.toLocaleString("fr-DZ")} DA`,
      },
    }),
  });
}

// ==========================================
// WILAYAS + HELPERS
// ==========================================
const WILAYAS = [
  "01 - Adrar","02 - Chlef","03 - Laghouat","04 - Oum El Bouaghi",
  "05 - Batna","06 - Béjaïa","07 - Biskra","08 - Béchar",
  "09 - Blida","10 - Bouira","11 - Tamanrasset","12 - Tébessa",
  "13 - Tlemcen","14 - Tiaret","15 - Tizi Ouzou","16 - Alger",
  "17 - Djelfa","18 - Jijel","19 - Sétif","20 - Saïda",
  "21 - Skikda","22 - Sidi Bel Abbès","23 - Annaba","24 - Guelma",
  "25 - Constantine","26 - Médéa","27 - Mostaganem","28 - M'Sila",
  "29 - Mascara","30 - Ouargla","31 - Oran","32 - El Bayadh",
  "33 - Illizi","34 - Bordj Bou Arréridj","35 - Boumerdès","36 - El Tarf",
  "37 - Tindouf","38 - Tissemsilt","39 - El Oued","40 - Khenchela",
  "41 - Souk Ahras","42 - Tipaza","43 - Mila","44 - Aïn Defla",
  "45 - Naâma","46 - Aïn Témouchent","47 - Ghardaïa","48 - Relizane",
  "49 - Timimoun","50 - Bordj Badji Mokhtar","51 - Ouled Djellal",
  "52 - Béni Abbès","53 - In Salah","54 - In Guezzam",
  "55 - Touggourt","56 - Djanet","57 - El M'Ghair","58 - El Menia",
];
const DEFAULT_PRICES = { domicile: 600, relais: 400 };
function safePrices(raw) {
  return {
    domicile: typeof raw?.domicile === "number" ? raw.domicile : DEFAULT_PRICES.domicile,
    relais:   typeof raw?.relais   === "number" ? raw.relais   : DEFAULT_PRICES.relais,
  };
}

// ==========================================
// ADMIN PASSWORD (change this!)
// ==========================================
const ADMIN_PASSWORD = "couveria2024";

// Status config
const STATUTS = {
  en_attente:  { label: "En attente",  color: "bg-amber-100 text-amber-700 border-amber-200" },
  confirme:    { label: "Confirmé",    color: "bg-blue-100 text-blue-700 border-blue-200" },
  expedie:     { label: "Expédié",     color: "bg-purple-100 text-purple-700 border-purple-200" },
  livre:       { label: "Livré",       color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  annule:      { label: "Annulé",      color: "bg-red-100 text-red-700 border-red-200" },
};

// ==========================================
// ADMIN — LOGIN GATE
// ==========================================
function AdminLogin({ onSuccess }) {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState(false);
  const submit = (e) => {
    e.preventDefault();
    if (pw === ADMIN_PASSWORD) { onSuccess(); }
    else { setErr(true); setPw(""); }
  };
  return (
    <div className="flex flex-col items-center justify-center h-full gap-6 px-8">
      <div className="text-4xl">🔐</div>
      <div className="text-center">
        <h2 className="text-xl font-semibold text-slate-800">Accès Admin</h2>
        <p className="text-sm text-slate-400 mt-1">Entrez le mot de passe pour continuer</p>
      </div>
      <form onSubmit={submit} className="w-full max-w-xs flex flex-col gap-3">
        <input
          type="password"
          value={pw}
          onChange={(e) => { setPw(e.target.value); setErr(false); }}
          placeholder="Mot de passe..."
          className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 ${err ? "border-red-400 bg-red-50" : "border-gray-200"}`}
          autoFocus
        />
        {err && <p className="text-xs text-red-500 text-center">Mot de passe incorrect</p>}
        <button type="submit" className="w-full bg-slate-900 text-white py-3 rounded-xl text-sm font-medium hover:bg-slate-800 transition">
          Accéder →
        </button>
      </form>
    </div>
  );
}

// ==========================================
// ADMIN — ORDERS DASHBOARD
// ==========================================
function AdminDashboard({ onClose }) {
  const [authed, setAuthed] = useState(false);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    if (!authed) return;
    loadOrders();
  }, [authed]);

  async function loadOrders() {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "commandes"));
      const data = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
        createdAt: d.data().createdAt?.toDate?.() ?? null,
      }));
      data.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
      setOrders(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function changeStatus(orderId, newStatut) {
    setUpdatingId(orderId);
    try {
      await updateDoc(doc(db, "commandes", orderId), { statut: newStatut });
      setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, statut: newStatut } : o));
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingId(null);
    }
  }

  const filtered = orders.filter((o) => {
    const matchFilter = filter === "all" || o.statut === filter;
    const q = search.toLowerCase();
    const matchSearch = !q ||
      o.client?.nom?.toLowerCase().includes(q) ||
      o.client?.telephone?.includes(q) ||
      o.client?.wilaya?.toLowerCase().includes(q);
    return matchFilter && matchSearch;
  });

  const counts = Object.fromEntries(
    Object.keys(STATUTS).map((s) => [s, orders.filter((o) => o.statut === s).length])
  );
  const totalRevenue = orders
    .filter((o) => o.statut !== "annule")
    .reduce((sum, o) => sum + (o.total ?? 0), 0);

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-slate-50" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-2xl">📋</span>
          <div>
            <h1 className="text-lg font-semibold text-slate-900">Tableau des commandes</h1>
            <p className="text-xs text-slate-400">Couvéria DZ — Admin</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {authed && (
            <button
              onClick={loadOrders}
              className="text-xs text-slate-500 hover:text-slate-800 border border-slate-200 rounded-lg px-3 py-1.5 transition hover:bg-slate-50"
            >
              ↻ Actualiser
            </button>
          )}
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 transition flex items-center justify-center text-slate-500 text-sm font-medium"
          >
            ✕
          </button>
        </div>
      </div>

      {!authed ? (
        <AdminLogin onSuccess={() => setAuthed(true)} />
      ) : loading ? (
        <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
          Chargement des commandes...
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          {/* Stats bar */}
          <div className="px-6 py-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="col-span-2 sm:col-span-3 lg:col-span-2 bg-slate-900 text-white rounded-2xl px-5 py-4">
              <p className="text-xs text-slate-400 mb-1">Chiffre d'affaires total</p>
              <p className="text-2xl font-semibold">{totalRevenue.toLocaleString("fr-DZ")} <span className="text-sm font-normal text-slate-300">DA</span></p>
              <p className="text-xs text-slate-400 mt-1">{orders.filter(o => o.statut !== "annule").length} commandes actives</p>
            </div>
            {Object.entries(STATUTS).map(([key, cfg]) => (
              <button
                key={key}
                onClick={() => setFilter(filter === key ? "all" : key)}
                className={`rounded-2xl px-4 py-3 text-left border transition ${filter === key ? "ring-2 ring-slate-900" : ""} ${cfg.color}`}
              >
                <p className="text-xl font-bold">{counts[key] ?? 0}</p>
                <p className="text-xs mt-0.5">{cfg.label}</p>
              </button>
            ))}
          </div>

          {/* Search + filter */}
          <div className="px-6 pb-3 flex gap-3 items-center">
            <div className="relative flex-1 max-w-sm">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
              <input
                type="text"
                placeholder="Nom, téléphone, wilaya..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
              />
            </div>
            <span className="text-xs text-slate-400">{filtered.length} résultat{filtered.length !== 1 ? "s" : ""}</span>
          </div>

          {/* Table */}
          <div className="px-6 pb-8">
            {filtered.length === 0 ? (
              <div className="text-center py-16 text-slate-400 text-sm">Aucune commande trouvée.</div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                {/* Table header */}
                <div className="hidden md:grid grid-cols-[1.8fr_1.2fr_1.5fr_1fr_1fr_auto] gap-4 px-5 py-3 bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  <span>Client</span>
                  <span>Téléphone</span>
                  <span>Wilaya</span>
                  <span>Total</span>
                  <span>Statut</span>
                  <span></span>
                </div>

                {filtered.map((order, idx) => {
                  const isExpanded = expanded === order.id;
                  const statut = STATUTS[order.statut] ?? STATUTS.en_attente;
                  const date = order.createdAt
                    ? order.createdAt.toLocaleDateString("fr-DZ", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
                    : "—";

                  return (
                    <div key={order.id} className={`border-b border-slate-100 last:border-0 ${isExpanded ? "bg-slate-50" : "hover:bg-slate-50/60"} transition`}>
                      {/* Main row */}
                      <div
                        className="grid grid-cols-[1fr_auto] md:grid-cols-[1.8fr_1.2fr_1.5fr_1fr_1fr_auto] gap-4 px-5 py-4 cursor-pointer items-center"
                        onClick={() => setExpanded(isExpanded ? null : order.id)}
                      >
                        {/* Client */}
                        <div>
                          <p className="text-sm font-semibold text-slate-800">{order.client?.nom ?? "—"}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{date}</p>
                        </div>
                        {/* Phone — hidden on mobile, shown in expanded */}
                        <div className="hidden md:block">
                          <p className="text-sm text-slate-600">{order.client?.telephone ?? "—"}</p>
                        </div>
                        {/* Wilaya */}
                        <div className="hidden md:block">
                          <p className="text-sm text-slate-600 truncate">{order.client?.wilaya ?? "—"}</p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {order.client?.typeLivraison === "domicile" ? "🏠 Domicile" : "📦 Relais"}
                          </p>
                        </div>
                        {/* Total */}
                        <div className="hidden md:block">
                          <p className="text-sm font-semibold text-slate-800">{(order.total ?? 0).toLocaleString("fr-DZ")} DA</p>
                          <p className="text-xs text-slate-400">{(order.articles ?? []).length} article{(order.articles ?? []).length !== 1 ? "s" : ""}</p>
                        </div>
                        {/* Status */}
                        <div className="hidden md:block">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${statut.color}`}>
                            {statut.label}
                          </span>
                        </div>
                        {/* Expand arrow */}
                        <div className="flex items-center gap-2">
                          {/* Mobile: show total + status */}
                          <div className="md:hidden text-right">
                            <p className="text-sm font-semibold text-slate-800">{(order.total ?? 0).toLocaleString("fr-DZ")} DA</p>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${statut.color}`}>
                              {statut.label}
                            </span>
                          </div>
                          <span className={`text-slate-400 text-xs transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}>▼</span>
                        </div>
                      </div>

                      {/* Expanded detail */}
                      {isExpanded && (
                        <div className="px-5 pb-5 space-y-4 border-t border-slate-100">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                            {/* Client info */}
                            <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-2">
                              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Informations client</p>
                              <Row label="Nom" value={order.client?.nom} />
                              <Row label="Téléphone" value={order.client?.telephone} />
                              <Row label="Wilaya" value={order.client?.wilaya} />
                              <Row label="Adresse" value={order.client?.adresse} />
                              <Row label="Livraison" value={order.client?.typeLivraison === "domicile" ? "🏠 À domicile" : "📦 Point relais"} />
                              {order.client?.notes && <Row label="Notes" value={order.client.notes} />}
                            </div>

                            {/* Articles + totals */}
                            <div className="bg-white rounded-xl border border-slate-200 p-4">
                              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Articles commandés</p>
                              <div className="space-y-2 mb-3">
                                {(order.articles ?? []).map((a, i) => (
                                  <div key={i} className="flex justify-between text-sm">
                                    <span className="text-slate-700">{a.nom} <span className="text-slate-400">× {a.quantite}</span></span>
                                    <span className="font-medium text-slate-800">{(a.prix * a.quantite).toLocaleString("fr-DZ")} DA</span>
                                  </div>
                                ))}
                              </div>
                              <div className="border-t border-slate-100 pt-2 space-y-1">
                                <div className="flex justify-between text-xs text-slate-500">
                                  <span>Sous-total</span>
                                  <span>{(order.subtotal ?? 0).toLocaleString("fr-DZ")} DA</span>
                                </div>
                                <div className="flex justify-between text-xs text-slate-500">
                                  <span>Livraison</span>
                                  <span>{(order.fraisLivraison ?? 0).toLocaleString("fr-DZ")} DA</span>
                                </div>
                                <div className="flex justify-between text-sm font-semibold text-slate-900 pt-1 border-t border-slate-100">
                                  <span>Total</span>
                                  <span>{(order.total ?? 0).toLocaleString("fr-DZ")} DA</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Status changer */}
                          <div className="bg-white rounded-xl border border-slate-200 p-4">
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Changer le statut</p>
                            <div className="flex flex-wrap gap-2">
                              {Object.entries(STATUTS).map(([key, cfg]) => (
                                <button
                                  key={key}
                                  disabled={updatingId === order.id}
                                  onClick={() => changeStatus(order.id, key)}
                                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${
                                    order.statut === key
                                      ? `${cfg.color} ring-2 ring-offset-1 ring-slate-400`
                                      : "border-slate-200 text-slate-500 hover:border-slate-400"
                                  } disabled:opacity-50`}
                                >
                                  {updatingId === order.id && order.statut !== key ? "..." : cfg.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex gap-2 text-sm">
      <span className="text-slate-400 w-20 flex-shrink-0">{label}</span>
      <span className="text-slate-800 font-medium">{value ?? "—"}</span>
    </div>
  );
}

// ==========================================
// 1. NAVBAR
// ==========================================
function Navbar({ cartCount, onCartOpen }) {
  return (
    <nav className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <a href="#" className="text-2xl font-serif text-slate-900 tracking-wider">
            Couvéria <span className="font-light text-slate-500">DZ</span>
          </a>
          <div className="hidden md:flex space-x-8 items-center">
            <a href="#" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition">Accueil</a>
            <a href="#collections" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition">Nos Collections</a>
            <a href="#footer" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition">À Propos</a>
          </div>
          <button
            onClick={onCartOpen}
            className="relative bg-slate-900 text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-slate-800 transition shadow-md"
          >
            🛒 Panier
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-amber-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </nav>
  );
}

// ==========================================
// 2. HERO
// ==========================================
function Hero() {
  return (
    <div className="relative bg-stone-50 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="relative z-10 pb-8 bg-stone-50 sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32 pt-20 px-4 sm:px-6 lg:px-8">
          <main className="mt-10 mx-auto max-w-7xl sm:mt-12 md:mt-16 lg:mt-20 xl:mt-28">
            <div className="sm:text-center lg:text-left">
              <span className="text-sm font-semibold text-stone-500 tracking-wider uppercase mb-2 block">
                Qualité Premium en Algérie
              </span>
              <h1 className="text-4xl tracking-tight font-serif text-slate-900 sm:text-5xl md:text-6xl mb-6">
                <span className="block xl:inline">Le confort ultime</span>{" "}
                <span className="block text-stone-600 xl:inline">pour vos nuits</span>
              </h1>
              <p className="mt-3 text-base text-slate-600 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                Découvrez notre collection de draps en coton percale et satin. Livraison disponible sur les 58 wilayas.
              </p>
              <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                <a
                  href="#collections"
                  className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-full text-white bg-slate-900 hover:bg-slate-800 transition md:py-4 md:text-lg md:px-10"
                >
                  Découvrir la collection
                </a>
              </div>
            </div>
          </main>
        </div>
      </div>
      <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
        <img
          className="h-56 w-full object-cover sm:h-72 md:h-96 lg:w-full lg:h-full"
          src="https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=2000"
          alt="Draps de lit premium"
        />
      </div>
    </div>
  );
}

// ==========================================
// 3. PRODUCT CARD
// ==========================================
function ProductCard({ product, onAddToCart }) {
  return (
    <div className="group relative flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
      <div className="relative h-80 w-full overflow-hidden bg-gray-200">
        <img
          src={product.image}
          alt={product.nom}
          className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
        />
        {product.etiquette && (
          <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 text-xs font-semibold text-slate-800 rounded-full">
            {product.etiquette}
          </span>
        )}
        {!product.enStock && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-white text-slate-900 text-sm font-semibold px-4 py-2 rounded-full">
              Rupture de stock
            </span>
          </div>
        )}
      </div>
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-lg font-medium text-slate-900 font-serif">{product.nom}</h3>
        {product.description && (
          <p className="mt-1 text-sm text-slate-500 line-clamp-2">{product.description}</p>
        )}
        <p className="mt-2 text-xl font-semibold text-stone-700">
          {product.prix.toLocaleString("fr-DZ")} DA
        </p>
        <button
          onClick={() => onAddToCart(product)}
          disabled={!product.enStock}
          className="mt-6 w-full bg-slate-900 text-white py-3 rounded-xl font-medium hover:bg-slate-800 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {product.enStock ? "Ajouter au panier" : "Indisponible"}
        </button>
      </div>
    </div>
  );
}

// ==========================================
// 4. CART DRAWER
// ==========================================
function CartDrawer({ cart, onClose, onUpdateQty, onRemove, onCheckout }) {
  const subtotal = cart.reduce((sum, item) => sum + item.prix * item.quantite, 0);
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white h-full flex flex-col shadow-2xl">
        <div className="flex justify-between items-center px-6 py-5 border-b border-gray-100">
          <h2 className="text-lg font-serif text-slate-900">Votre Panier</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 transition">✕</button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {cart.length === 0 ? (
            <p className="text-center text-slate-400 mt-20 text-sm">Votre panier est vide.</p>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="flex gap-4 items-center">
                <img src={item.image} alt={item.nom} className="w-16 h-16 object-cover rounded-xl flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{item.nom}</p>
                  <p className="text-sm text-stone-600 font-semibold">{(item.prix * item.quantite).toLocaleString("fr-DZ")} DA</p>
                  <div className="flex items-center gap-2 mt-1">
                    <button onClick={() => onUpdateQty(item.id, item.quantite - 1)} className="w-6 h-6 rounded-full border border-gray-200 flex items-center justify-center text-sm hover:bg-gray-100 transition">−</button>
                    <span className="text-sm w-4 text-center">{item.quantite}</span>
                    <button onClick={() => onUpdateQty(item.id, item.quantite + 1)} className="w-6 h-6 rounded-full border border-gray-200 flex items-center justify-center text-sm hover:bg-gray-100 transition">+</button>
                  </div>
                </div>
                <button onClick={() => onRemove(item.id)} className="text-slate-300 hover:text-red-400 transition text-lg">🗑</button>
              </div>
            ))
          )}
        </div>
        {cart.length > 0 && (
          <div className="px-6 py-5 border-t border-gray-100">
            <div className="flex justify-between mb-1 text-sm text-slate-500">
              <span>Sous-total</span><span>{subtotal.toLocaleString("fr-DZ")} DA</span>
            </div>
            <div className="flex justify-between mb-3 text-sm text-slate-400 italic">
              <span>Livraison</span><span>calculée à l'étape suivante</span>
            </div>
            <button onClick={onCheckout} className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-medium hover:bg-slate-800 transition">
              Passer la commande →
            </button>
            <p className="text-center text-xs text-slate-400 mt-3">Paiement à la livraison (COD) · 58 wilayas</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================
// 5. ORDER FORM MODAL
// ==========================================
function OrderModal({ cart, livraisonPrices, onClose, onOrderPlaced }) {
  const subtotal = cart.reduce((sum, item) => sum + item.prix * item.quantite, 0);
  const [form, setForm] = useState({ nom: "", telephone: "", wilaya: "", adresse: "", notes: "", typeLivraison: "domicile" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const wilayaPrices = safePrices(form.wilaya ? livraisonPrices[form.wilaya] : null);
  const fraisLivraison = form.wilaya ? (form.typeLivraison === "domicile" ? wilayaPrices.domicile : wilayaPrices.relais) : 0;
  const total = subtotal + fraisLivraison;
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nom || !form.telephone || !form.wilaya || !form.adresse) {
      setError("Veuillez remplir tous les champs obligatoires."); return;
    }
    setLoading(true); setError("");
    try {
      const articlesSave = cart.map((item) => ({ id: item.id, nom: item.nom, prix: item.prix, quantite: item.quantite }));
      await addDoc(collection(db, "commandes"), {
        client: { nom: form.nom, telephone: form.telephone, wilaya: form.wilaya, adresse: form.adresse, notes: form.notes, typeLivraison: form.typeLivraison },
        articles: articlesSave,
        subtotal, fraisLivraison, total,
        statut: "en_attente",
        createdAt: serverTimestamp(),
      });
      await sendOrderEmail({ client: { ...form }, articles: articlesSave, subtotal, fraisLivraison, total }).catch(console.error);
      onOrderPlaced();
    } catch (err) {
      console.error(err);
      setError("Erreur lors de la commande. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center px-6 py-5 border-b border-gray-100">
          <h2 className="text-lg font-serif text-slate-900">Informations de livraison</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl">{error}</div>}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nom complet <span className="text-red-400">*</span></label>
            <input type="text" name="nom" value={form.nom} onChange={handleChange} placeholder="Ex: Ahmed Benali"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Numéro de téléphone <span className="text-red-400">*</span></label>
            <input type="tel" name="telephone" value={form.telephone} onChange={handleChange} placeholder="Ex: 0555 123 456"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Wilaya <span className="text-red-400">*</span></label>
            <select name="wilaya" value={form.wilaya} onChange={handleChange}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white">
              <option value="">Sélectionnez votre wilaya</option>
              {WILAYAS.map((w) => {
                const p = safePrices(livraisonPrices[w]);
                return <option key={w} value={w}>{w} — Domicile: {p.domicile.toLocaleString("fr-DZ")} DA / Relais: {p.relais.toLocaleString("fr-DZ")} DA</option>;
              })}
            </select>
          </div>
          {form.wilaya && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Mode de livraison <span className="text-red-400">*</span></label>
              <div className="grid grid-cols-2 gap-3">
                <button type="button" onClick={() => setForm({ ...form, typeLivraison: "domicile" })}
                  className={`flex flex-col items-center gap-1.5 px-4 py-4 rounded-xl border-2 transition text-sm font-medium ${form.typeLivraison === "domicile" ? "border-slate-900 bg-slate-900 text-white" : "border-gray-200 text-slate-600 hover:border-slate-400"}`}>
                  <span className="text-xl">🏠</span><span>À domicile</span>
                  <span className={`text-xs font-semibold ${form.typeLivraison === "domicile" ? "text-stone-300" : "text-stone-600"}`}>{wilayaPrices.domicile.toLocaleString("fr-DZ")} DA</span>
                </button>
                <button type="button" onClick={() => setForm({ ...form, typeLivraison: "relais" })}
                  className={`flex flex-col items-center gap-1.5 px-4 py-4 rounded-xl border-2 transition text-sm font-medium ${form.typeLivraison === "relais" ? "border-slate-900 bg-slate-900 text-white" : "border-gray-200 text-slate-600 hover:border-slate-400"}`}>
                  <span className="text-xl">📦</span><span>Point relais</span>
                  <span className={`text-xs font-semibold ${form.typeLivraison === "relais" ? "text-stone-300" : "text-stone-600"}`}>{wilayaPrices.relais.toLocaleString("fr-DZ")} DA</span>
                </button>
              </div>
              <div className="mt-3 flex items-center justify-between bg-stone-50 rounded-xl px-4 py-3">
                <span className="text-sm text-slate-500">Frais de livraison ({form.typeLivraison === "domicile" ? "à domicile" : "point relais"})</span>
                <span className="text-sm font-semibold text-slate-800">{fraisLivraison.toLocaleString("fr-DZ")} DA</span>
              </div>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Adresse complète <span className="text-red-400">*</span></label>
            <textarea name="adresse" value={form.adresse} onChange={handleChange} rows={3}
              placeholder={form.typeLivraison === "relais" ? "Nom ou adresse du point relais le plus proche..." : "Numéro, rue, quartier, commune..."}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Notes (optionnel)</label>
            <input type="text" name="notes" value={form.notes} onChange={handleChange} placeholder="Instructions spéciales pour la livraison..."
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900" />
          </div>
          <div className="bg-stone-50 rounded-xl p-4 space-y-2">
            <p className="text-sm font-medium text-slate-700 mb-2">Résumé de la commande</p>
            {cart.map((item) => (
              <div key={item.id} className="flex justify-between text-sm text-slate-600">
                <span>{item.nom} × {item.quantite}</span>
                <span>{(item.prix * item.quantite).toLocaleString("fr-DZ")} DA</span>
              </div>
            ))}
            <div className="border-t border-stone-200 pt-2 mt-2 space-y-1">
              <div className="flex justify-between text-sm text-slate-500"><span>Sous-total</span><span>{subtotal.toLocaleString("fr-DZ")} DA</span></div>
              <div className="flex justify-between text-sm text-slate-500">
                <span>Frais de livraison{form.wilaya && <span className="ml-1 text-xs text-slate-400">({form.typeLivraison === "domicile" ? "domicile" : "relais"})</span>}</span>
                <span>{form.wilaya ? `${fraisLivraison.toLocaleString("fr-DZ")} DA` : <span className="italic text-slate-400">— sélectionnez une wilaya</span>}</span>
              </div>
              <div className="flex justify-between font-semibold text-slate-900 pt-2 border-t border-stone-200"><span>Total</span><span>{total.toLocaleString("fr-DZ")} DA</span></div>
            </div>
            <p className="text-xs text-slate-400 text-center pt-1">Paiement à la livraison (COD)</p>
          </div>
          <button type="submit" disabled={loading} className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-medium hover:bg-slate-800 transition disabled:opacity-60">
            {loading ? "Envoi en cours..." : "Confirmer la commande"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ==========================================
// 6. SUCCESS SCREEN
// ==========================================
function OrderSuccess({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm text-center px-8 py-10">
        <div className="text-5xl mb-4">✅</div>
        <h2 className="text-xl font-serif text-slate-900 mb-2">Commande confirmée !</h2>
        <p className="text-sm text-slate-500 mb-6">Merci pour votre commande. Nous vous contacterons bientôt pour confirmer la livraison.</p>
        <button onClick={onClose} className="w-full bg-slate-900 text-white py-3 rounded-xl font-medium hover:bg-slate-800 transition">
          Continuer les achats
        </button>
      </div>
    </div>
  );
}

// ==========================================
// 7. FOOTER
// ==========================================
function Footer() {
  return (
    <footer className="relative bg-slate-950 text-white overflow-hidden">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-stone-300 rounded-full blur-3xl"></div>
      </div>
      <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div>
            <h2 className="text-2xl font-serif tracking-wider mb-4">Couvéria <span className="font-light text-stone-400">DZ</span></h2>
            <p className="text-slate-400 text-sm leading-relaxed">Découvrez une expérience de sommeil haut de gamme avec nos draps premium conçus pour allier élégance, douceur et confort durable.</p>
            <div className="flex gap-4 mt-6">
              <a href="https://instagram.com/couveria_dz/" target="_blank" rel="noopener noreferrer" className="w-11 h-11 rounded-full bg-slate-800 hover:bg-pink-600 transition flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M7.75 2C4.574 2 2 4.574 2 7.75v8.5C2 19.426 4.574 22 7.75 22h8.5C19.426 22 22 19.426 22 16.25v-8.5C22 4.574 19.426 2 16.25 2h-8.5zm0 2h8.5A3.75 3.75 0 0 1 20 7.75v8.5A3.75 3.75 0 0 1 16.25 20h-8.5A3.75 3.75 0 0 1 4 16.25v-8.5A3.75 3.75 0 0 1 7.75 4zm8.75 1a1.25 1.25 0 1 0 0 2.5A1.25 1.25 0 0 0 16.5 5zM12 7a5 5 0 1 0 0 10a5 5 0 0 0 0-10zm0 2a3 3 0 1 1 0 6a3 3 0 0 1 0-6z"/></svg>
              </a>
              <a href="https://tiktok.com/@couveria_dz" target="_blank" rel="noopener noreferrer" className="w-11 h-11 rounded-full bg-slate-800 hover:bg-slate-700 transition flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-1.88V15.5a5.5 5.5 0 1 1-5.5-5.5c.27 0 .53.03.79.06v2.71a2.75 2.75 0 1 0 1.96 2.63V2h2.75a4.85 4.85 0 0 0 3.77 4.69v0z"/></svg>
              </a>
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-5">Navigation</h3>
            <ul className="space-y-3 text-sm text-slate-400">
              <li><a href="#" className="hover:text-white transition">Accueil</a></li>
              <li><a href="#collections" className="hover:text-white transition">Collections</a></li>
              <li><a href="#footer" className="hover:text-white transition">À propos</a></li>
              <li><a href="#" className="hover:text-white transition">Conditions générales</a></li>
              <li><a href="#" className="hover:text-white transition">Politique de confidentialité</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-5">Contact</h3>
            <ul className="space-y-4 text-sm text-slate-400">
              <li>📍 Alger, Tizi Ouzou</li>
              <li>📞 +213 554207021</li>
              <li>✉ Y'as pas pour le moment.</li>
              <li>🕒 24h/7</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-5">Restez informé</h3>
            <p className="text-sm text-slate-400 mb-4">Recevez nos nouveautés et offres spéciales.</p>
            <div className="flex flex-col gap-3">
              <input type="email" placeholder="Votre email" className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-stone-400" />
              <button className="bg-white text-slate-900 py-3 rounded-xl font-medium hover:bg-stone-200 transition">S'abonner</button>
            </div>
          </div>
        </div>
        <div className="border-t border-slate-800 my-10"></div>
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-500">© {new Date().getFullYear()} Couvéria DZ. Tous droits réservés.</p>
          <div className="flex gap-6 text-sm text-slate-500">
            <span>Livraison disponible sur les 58 wilayas</span><span>•</span><span>Licence commerciale</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ==========================================
// 8. MAIN APP
// ==========================================
export default function App() {
  const [products, setProducts] = useState([]);
  const [livraisonPrices, setLivraisonPrices] = useState({});
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [orderOpen, setOrderOpen] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const [productsSnap, livraisonSnap] = await Promise.all([
          getDocs(collection(db, "draps")),
          getDocs(collection(db, "livraison")),
        ]);
        setProducts(productsSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
        const prices = {};
        livraisonSnap.docs.forEach((d) => { prices[d.id] = safePrices(d.data()); });
        setLivraisonPrices(prices);
      } catch (err) {
        console.error("Erreur Firestore:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) return prev.map((i) => i.id === product.id ? { ...i, quantite: i.quantite + 1 } : i);
      return [...prev, { ...product, quantite: 1 }];
    });
    setCartOpen(true);
  };
  const updateQty = (id, qty) => {
    if (qty <= 0) { removeItem(id); return; }
    setCart((prev) => prev.map((i) => (i.id === id ? { ...i, quantite: qty } : i)));
  };
  const removeItem = (id) => setCart((prev) => prev.filter((i) => i.id !== id));
  const handleOrderPlaced = () => { setCart([]); setOrderOpen(false); setCartOpen(false); setOrderSuccess(true); };
  const cartCount = cart.reduce((sum, i) => sum + i.quantite, 0);

  return (
    <div className="min-h-screen bg-stone-50 font-sans">
      <Navbar cartCount={cartCount} onCartOpen={() => setCartOpen(true)} />
      <Hero />

      <section id="collections" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-serif text-slate-900 sm:text-4xl">Nos Collections Populaires</h2>
          <p className="mt-4 text-slate-600 max-w-2xl mx-auto">Fabriqués avec soin, nos draps vous garantissent une douceur durable lavage après lavage.</p>
        </div>
        {loading ? (
          <div className="text-center py-20 text-slate-400">Chargement des produits...</div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 text-slate-400">Aucun produit disponible pour le moment.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {products.map((p) => <ProductCard key={p.id} product={p} onAddToCart={addToCart} />)}
          </div>
        )}
      </section>

      {cartOpen && <CartDrawer cart={cart} onClose={() => setCartOpen(false)} onUpdateQty={updateQty} onRemove={removeItem} onCheckout={() => { setCartOpen(false); setOrderOpen(true); }} />}
      {orderOpen && <OrderModal cart={cart} livraisonPrices={livraisonPrices} onClose={() => setOrderOpen(false)} onOrderPlaced={handleOrderPlaced} />}
      {orderSuccess && <OrderSuccess onClose={() => setOrderSuccess(false)} />}
      {adminOpen && <AdminDashboard onClose={() => setAdminOpen(false)} />}

      <section id="footer"><Footer /></section>

      {/* Admin floating button — discreet, bottom-left */}
      <button
        onClick={() => setAdminOpen(true)}
        title="Admin"
        className="fixed bottom-5 left-5 z-40 w-10 h-10 rounded-full bg-slate-800/70 hover:bg-slate-900 text-white text-base flex items-center justify-center shadow-lg backdrop-blur transition hover:scale-110"
      >
        ⚙️
      </button>
    </div>
  );
}