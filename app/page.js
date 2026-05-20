"use client";

import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import React, { useEffect, useState } from "react";

const firebaseConfig = {
  apiKey: "AIzaSyC0RudSPDw47_gh7127Jn4z6FX-slbitzM",
  authDomain: "lidra-c49b7.firebaseapp.com",
  projectId: "lidra-c49b7",
  storageBucket: "lidra-c49b7.firebasestorage.app",
  messagingSenderId: "251589029215",
  appId: "1:251589029215:web:3e9100188e1393cfbe5aea"
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ==========================================
// WILAYAS (noms seulement — prix viennent de Firestore)
// Collection Firestore : "livraison"
// Document ID = nom de la wilaya (ex: "09 - Blida")
// Champ requis : frais (number, en DA)
// ==========================================
const WILAYAS = [
  "01 - Adrar", "02 - Chlef", "03 - Laghouat", "04 - Oum El Bouaghi",
  "05 - Batna", "06 - Béjaïa", "07 - Biskra", "08 - Béchar",
  "09 - Blida", "10 - Bouira", "11 - Tamanrasset", "12 - Tébessa",
  "13 - Tlemcen", "14 - Tiaret", "15 - Tizi Ouzou", "16 - Alger",
  "17 - Djelfa", "18 - Jijel", "19 - Sétif", "20 - Saïda",
  "21 - Skikda", "22 - Sidi Bel Abbès", "23 - Annaba", "24 - Guelma",
  "25 - Constantine", "26 - Médéa", "27 - Mostaganem", "28 - M'Sila",
  "29 - Mascara", "30 - Ouargla", "31 - Oran", "32 - El Bayadh",
  "33 - Illizi", "34 - Bordj Bou Arréridj", "35 - Boumerdès", "36 - El Tarf",
  "37 - Tindouf", "38 - Tissemsilt", "39 - El Oued", "40 - Khenchela",
  "41 - Souk Ahras", "42 - Tipaza", "43 - Mila", "44 - Aïn Defla",
  "45 - Naâma", "46 - Aïn Témouchent", "47 - Ghardaïa", "48 - Relizane",
  "49 - Timimoun", "50 - Bordj Badji Mokhtar", "51 - Ouled Djellal",
  "52 - Béni Abbès", "53 - In Salah", "54 - In Guezzam",
  "55 - Touggourt", "56 - Djanet", "57 - El M'Ghair", "58 - El Menia",
];

const DEFAULT_FRAIS = 500; // DA — fallback si wilaya absente de Firestore

// ==========================================
// 1. NAVBAR
// ==========================================
function Navbar({ cartCount, onCartOpen }) {
  return (
    <nav className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <a href="#" className="text-2xl font-serif text-slate-900 tracking-wider">
            LITERIE <span className="font-light text-slate-500">DZ</span>
          </a>
          <div className="hidden md:flex space-x-8 items-center">
            <a href="#" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition">Accueil</a>
            <a href="#collections" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition">Nos Collections</a>
            <a href="#" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition">À Propos</a>
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
                  <p className="text-sm text-stone-600 font-semibold">
                    {(item.prix * item.quantite).toLocaleString("fr-DZ")} DA
                  </p>
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
              <span>Sous-total</span>
              <span>{subtotal.toLocaleString("fr-DZ")} DA</span>
            </div>
            <div className="flex justify-between mb-3 text-sm text-slate-400 italic">
              <span>Livraison</span>
              <span>calculée à l'étape suivante</span>
            </div>
            <button
              onClick={onCheckout}
              className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-medium hover:bg-slate-800 transition"
            >
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
  const [form, setForm] = useState({ nom: "", telephone: "", wilaya: "", adresse: "", notes: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Look up delivery price from Firestore data (fallback to DEFAULT_FRAIS)
  const fraisLivraison = form.wilaya
    ? (livraisonPrices[form.wilaya] ?? DEFAULT_FRAIS)
    : 0;
  const total = subtotal + fraisLivraison;

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nom || !form.telephone || !form.wilaya || !form.adresse) {
      setError("Veuillez remplir tous les champs obligatoires.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await addDoc(collection(db, "commandes"), {
        client: {
          nom: form.nom,
          telephone: form.telephone,
          wilaya: form.wilaya,
          adresse: form.adresse,
          notes: form.notes,
        },
        articles: cart.map((item) => ({
          id: item.id,
          nom: item.nom,
          prix: item.prix,
          quantite: item.quantite,
        })),
        subtotal,
        fraisLivraison,
        total,
        statut: "en_attente",
        createdAt: serverTimestamp(),
      });
      onOrderPlaced();
    } catch (err) {
      setError("Erreur lors de la commande. Veuillez réessayer.");
      console.error(err);
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

          {/* Nom */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Nom complet <span className="text-red-400">*</span>
            </label>
            <input
              type="text" name="nom" value={form.nom} onChange={handleChange}
              placeholder="Ex: Ahmed Benali"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          {/* Téléphone */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Numéro de téléphone <span className="text-red-400">*</span>
            </label>
            <input
              type="tel" name="telephone" value={form.telephone} onChange={handleChange}
              placeholder="Ex: 0555 123 456"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          {/* Wilaya — prix affiché dynamiquement depuis Firestore */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Wilaya <span className="text-red-400">*</span>
            </label>
            <select
              name="wilaya" value={form.wilaya} onChange={handleChange}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
            >
              <option value="">Sélectionnez votre wilaya</option>
              {WILAYAS.map((w) => {
                const prix = livraisonPrices[w] ?? DEFAULT_FRAIS;
                return (
                  <option key={w} value={w}>
                    {w} — {prix.toLocaleString("fr-DZ")} DA livraison
                  </option>
                );
              })}
            </select>

            {/* Prix de livraison affiché sous le select dès sélection */}
            {form.wilaya && (
              <div className="mt-2 flex items-center justify-between bg-stone-50 rounded-xl px-4 py-3">
                <span className="text-sm text-slate-500">Frais de livraison</span>
                <span className="text-sm font-semibold text-slate-800">
                  {fraisLivraison.toLocaleString("fr-DZ")} DA
                </span>
              </div>
            )}
          </div>

          {/* Adresse */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Adresse complète <span className="text-red-400">*</span>
            </label>
            <textarea
              name="adresse" value={form.adresse} onChange={handleChange}
              placeholder="Numéro, rue, quartier, commune..."
              rows={3}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 resize-none"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Notes (optionnel)</label>
            <input
              type="text" name="notes" value={form.notes} onChange={handleChange}
              placeholder="Instructions spéciales pour la livraison..."
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          {/* Résumé */}
          <div className="bg-stone-50 rounded-xl p-4 space-y-2">
            <p className="text-sm font-medium text-slate-700 mb-2">Résumé de la commande</p>
            {cart.map((item) => (
              <div key={item.id} className="flex justify-between text-sm text-slate-600">
                <span>{item.nom} × {item.quantite}</span>
                <span>{(item.prix * item.quantite).toLocaleString("fr-DZ")} DA</span>
              </div>
            ))}
            <div className="border-t border-stone-200 pt-2 mt-2 space-y-1">
              <div className="flex justify-between text-sm text-slate-500">
                <span>Sous-total</span>
                <span>{subtotal.toLocaleString("fr-DZ")} DA</span>
              </div>
              <div className="flex justify-between text-sm text-slate-500">
                <span>Frais de livraison</span>
                <span>
                  {form.wilaya
                    ? `${fraisLivraison.toLocaleString("fr-DZ")} DA`
                    : <span className="italic text-slate-400">— sélectionnez une wilaya</span>
                  }
                </span>
              </div>
              <div className="flex justify-between font-semibold text-slate-900 pt-2 border-t border-stone-200">
                <span>Total</span>
                <span>{total.toLocaleString("fr-DZ")} DA</span>
              </div>
            </div>
            <p className="text-xs text-slate-400 text-center pt-1">Paiement à la livraison (COD)</p>
          </div>

          <button
            type="submit" disabled={loading}
            className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-medium hover:bg-slate-800 transition disabled:opacity-60"
          >
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
        <p className="text-sm text-slate-500 mb-6">
          Merci pour votre commande. Nous vous contacterons bientôt pour confirmer la livraison.
        </p>
        <button onClick={onClose} className="w-full bg-slate-900 text-white py-3 rounded-xl font-medium hover:bg-slate-800 transition">
          Continuer les achats
        </button>
      </div>
    </div>
  );
}

// ==========================================
// 7. MAIN APP
// ==========================================
export default function App() {
  const [products, setProducts] = useState([]);
  const [livraisonPrices, setLivraisonPrices] = useState({});
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [orderOpen, setOrderOpen] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch products and delivery prices in parallel
        const [productsSnap, livraisonSnap] = await Promise.all([
          getDocs(collection(db, "draps")),
          getDocs(collection(db, "livraison")),
        ]);

        setProducts(productsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));

        // Build a map: { "09 - Blida": 500, "16 - Alger": 400, ... }
        const prices = {};
        livraisonSnap.docs.forEach((doc) => {
          prices[doc.id] = doc.data().frais ?? DEFAULT_FRAIS;
        });
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

  const handleOrderPlaced = () => {
    setCart([]);
    setOrderOpen(false);
    setCartOpen(false);
    setOrderSuccess(true);
  };

  const cartCount = cart.reduce((sum, i) => sum + i.quantite, 0);

  return (
    <div className="min-h-screen bg-stone-50 font-sans">
      <Navbar cartCount={cartCount} onCartOpen={() => setCartOpen(true)} />
      <Hero />

      <section id="collections" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-serif text-slate-900 sm:text-4xl">Nos Collections Populaires</h2>
          <p className="mt-4 text-slate-600 max-w-2xl mx-auto">
            Fabriqués avec soin, nos draps vous garantissent une douceur durable lavage après lavage.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-20 text-slate-400">Chargement des produits...</div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 text-slate-400">Aucun produit disponible pour le moment.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} onAddToCart={addToCart} />
            ))}
          </div>
        )}
      </section>

      {cartOpen && (
        <CartDrawer
          cart={cart}
          onClose={() => setCartOpen(false)}
          onUpdateQty={updateQty}
          onRemove={removeItem}
          onCheckout={() => { setCartOpen(false); setOrderOpen(true); }}
        />
      )}

      {orderOpen && (
        <OrderModal
          cart={cart}
          livraisonPrices={livraisonPrices}
          onClose={() => setOrderOpen(false)}
          onOrderPlaced={handleOrderPlaced}
        />
      )}

      {orderSuccess && <OrderSuccess onClose={() => setOrderSuccess(false)} />}
    </div>
  );
}