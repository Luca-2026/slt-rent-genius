import Image from 'next/image'
import { ExternalLink } from 'lucide-react'

const minibaggerData = [
  {
    weight: '1 t',
    model: 'Bobcat E10Z',
    image: 'https://www.slt-rental.de/assets/bobcat-e10z-1-BIztT504.jpg',
    suitable: 'Gartentor-Projekte, Indoor-Abbruch',
    passage: '71 cm',
    depth: '1,82 m',
    url: 'https://www.slt-rental.de/mieten/krefeld/erdbewegung',
  },
  {
    weight: '2 t',
    model: 'XCMG XE20E',
    image: 'https://www.slt-rental.de/assets/xcmg-xe20e-1-BLCFSuTW.jpg',
    suitable: 'Kleingarten, Pool, Drainagen',
    passage: '98 cm',
    depth: '2,39 m',
    url: 'https://www.slt-rental.de/mieten/krefeld/erdbewegung',
  },
  {
    weight: '2,7 t',
    model: 'XCMG XE27E',
    image: 'https://www.slt-rental.de/assets/xcmg-xe27e-1-rowubIr-.jpg',
    suitable: 'Standard-Gartenbau, Fundamente',
    passage: '1,50 m',
    depth: '2,80 m',
    url: 'https://www.slt-rental.de/mieten/krefeld/erdbewegung',
  },
  {
    weight: '3,5 t',
    model: 'Bobcat E35z',
    image: 'https://www.slt-rental.de/assets/bobcat-e35z-1-Dlcw6I8U.webp',
    suitable: 'Profi-Tiefbau, Leitungsbau',
    passage: '–',
    depth: '3,12 m',
    url: 'https://www.slt-rental.de/mieten/krefeld/erdbewegung',
  },
  {
    weight: '5 t',
    model: 'Bobcat E50z',
    image: 'https://www.slt-rental.de/assets/bobcat-e50z-1-BERvbZde.webp',
    suitable: 'Großbaustellen, Erdbewegung',
    passage: '–',
    depth: '3,52 m',
    url: 'https://www.slt-rental.de/mieten/krefeld/erdbewegung',
  },
]

export function MinibaggerOverviewSection() {
  return (
    <section id="minibagger" className="py-16 lg:py-24 bg-background">
      <div className="section-container">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-headline mb-4">
            Welcher Minibagger für welches Projekt?
          </h2>
          <p className="text-lg text-body max-w-3xl mx-auto">
            Die richtige Baggergröße entscheidet über Effizienz und Kosten. 
            Hier finden Sie auf einen Blick, welcher Minibagger zu Ihrem Vorhaben passt.
          </p>
        </div>

        {/* Desktop Table */}
        <div className="hidden lg:block overflow-hidden rounded-xl border border-border">
          <table className="w-full">
            <thead className="bg-primary text-primary-foreground">
              <tr>
                <th className="text-left px-6 py-4 font-semibold">Einsatzgewicht</th>
                <th className="text-left px-6 py-4 font-semibold">Modell</th>
                <th className="text-left px-6 py-4 font-semibold">Geeignet für</th>
                <th className="text-left px-6 py-4 font-semibold">Durchgang ab</th>
                <th className="text-left px-6 py-4 font-semibold">Grabtiefe</th>
                <th className="text-left px-6 py-4 font-semibold"></th>
              </tr>
            </thead>
            <tbody>
              {minibaggerData.map((bagger, index) => (
                <tr
                  key={bagger.model}
                  className={index % 2 === 0 ? 'bg-surface-light' : 'bg-background'}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-12 relative rounded overflow-hidden bg-muted">
                        <Image
                          src={bagger.image}
                          alt={`${bagger.model} Minibagger`}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <span className="font-bold text-lg text-headline">{bagger.weight}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-headline">{bagger.model}</td>
                  <td className="px-6 py-4 text-body">{bagger.suitable}</td>
                  <td className="px-6 py-4 text-body">{bagger.passage}</td>
                  <td className="px-6 py-4 text-body">{bagger.depth}</td>
                  <td className="px-6 py-4">
                    <a
                      href={bagger.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-primary font-medium hover:underline"
                    >
                      Details
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="lg:hidden space-y-4">
          {minibaggerData.map((bagger) => (
            <div key={bagger.model} className="content-card p-4">
              <div className="flex gap-4">
                <div className="w-24 h-20 relative rounded overflow-hidden bg-muted flex-shrink-0">
                  <Image
                    src={bagger.image}
                    alt={`${bagger.model} Minibagger`}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-xl text-primary">{bagger.weight}</span>
                    <span className="text-sm text-body">·</span>
                    <span className="font-medium text-headline">{bagger.model}</span>
                  </div>
                  <p className="text-sm text-body mb-2">{bagger.suitable}</p>
                  <div className="flex gap-4 text-xs text-body mb-3">
                    <span>Durchgang: {bagger.passage}</span>
                    <span>Grabtiefe: {bagger.depth}</span>
                  </div>
                  <a
                    href={bagger.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-primary font-medium"
                  >
                    Details auf slt-rental.de
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
