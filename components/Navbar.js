import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="text-2xl font-serif text-slate-900 tracking-wider">
            LITERIE <span className="font-light text-slate-500">DZ</span>
          </Link>
          
          {/* Desktop Links */}
          <div className="hidden md:flex space-x-8 items-center">
            <Link href="/" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition">Accueil</Link>
            <Link href="/shop" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition">Nos Collections</Link>
            <Link href="/about" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition">À Propos</Link>
          </div>

          {/* Cart / Action */}
          <div className="flex items-center">
            <button className="bg-slate-900 text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-slate-800 transition shadow-md">
              Panier (0)
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}