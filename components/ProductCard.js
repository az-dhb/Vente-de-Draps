import Link from 'next/link';


export default function ProductCard({ title, price, imageUrl, tag }) {
  return (
    <div className="group relative flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
      <div className="relative h-80 w-full overflow-hidden bg-gray-200">
        <img
          src={imageUrl}
          alt={title}
          className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
        />
        {tag && (
          <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 text-xs font-semibold text-slate-800 rounded-full">
            {tag}
          </span>
        )}
      </div>
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-lg font-medium text-slate-900 font-serif">{title}</h3>
        <p className="mt-2 text-xl font-semibold text-stone-700">{price} DA</p>
        <button className="mt-6 w-full bg-stone-100 text-slate-900 py-3 rounded-xl font-medium hover:bg-stone-200 transition">
          Ajouter au panier
        </button>
      </div>
    </div>
  );
}