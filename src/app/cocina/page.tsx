import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import CocinaClient from '@/components/recipe/CocinaClient'

export default function CocinaPage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <CocinaClient />
      </main>
      <Footer />
    </>
  )
}
