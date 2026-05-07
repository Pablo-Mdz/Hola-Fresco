import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-fresh-100 bg-fresh-50">
      <div className="container-app py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">🥬</span>
            <span className="font-display font-semibold text-fresh-700">Hola Fresco</span>
          </div>
          <p className="text-sm text-earth-700 text-center">
            Recetas fáciles, rápidas y saludables. Cocina con alegría.
          </p>
          <div className="flex items-center gap-4 text-sm text-earth-700">
            <Link href="/recipes" className="hover:text-fresh-600 transition-colors">Recetas</Link>
            <Link href="/cocina" className="hover:text-fresh-600 transition-colors">Mi Cocina</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
