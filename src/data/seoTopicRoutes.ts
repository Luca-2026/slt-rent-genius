import type { SeoRoute } from './seo-routes-rental';

// Existing page topics; no product facts or new pricing claims are introduced.
export const seoTopicRoutes: SeoRoute[] = [
  {
    path: '/hochzeit-technik-mieten', routeType: 'page',
    title: 'Hochzeitstechnik mieten | SLT Rental',
    description: 'Hochzeitstechnik mieten: Beschallung, Licht und Event-Equipment bei SLT Rental in Bonn, Krefeld und Mülheim an der Ruhr anfragen.',
    h1: 'Hochzeitstechnik mieten',
    intro: ['Beschallung, Licht und Event-Equipment für deine Hochzeit.'],
    ogImage: 'https://www.slt-rental.de/images/hochzeit/hochzeit-ringtausch.jpg',
    breadcrumbs: [{ name: 'Start', path: '/' }, { name: 'Hochzeitstechnik', path: '/hochzeit-technik-mieten' }],
    linkSections: [{ heading: 'Event-Equipment', links: [{ name: 'Beschallung in Bonn', path: '/mieten/bonn/beschallung' }, { name: 'Beleuchtung in Krefeld', path: '/mieten/krefeld/beleuchtung' }] }],
  },
  {
    path: '/glasfaserausbau-maschinen-mieten', routeType: 'page',
    title: 'Baumaschinen für Glasfaserausbau mieten | SLT Rental',
    description: 'Baumaschinen für den Glasfaserausbau bei SLT Rental anfragen: Minibagger, Verdichtung und Absperrtechnik in Bonn, Krefeld und Mülheim an der Ruhr.',
    h1: 'Baumaschinen für den Glasfaserausbau mieten',
    intro: ['Maschinen und Equipment für deine Glasfaser-Baustelle.'],
    breadcrumbs: [{ name: 'Start', path: '/' }, { name: 'Glasfaserausbau', path: '/glasfaserausbau-maschinen-mieten' }],
    linkSections: [{ heading: 'Maschinen und Equipment', links: [{ name: 'Erdbewegung in Krefeld', path: '/mieten/krefeld/erdbewegung' }, { name: 'Verdichtung in Bonn', path: '/mieten/bonn/verdichtung' }] }],
  },
];