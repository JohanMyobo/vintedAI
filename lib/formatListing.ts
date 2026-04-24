export interface Listing {
  id?: string | null
  titre: string
  description: string
  marque: string
  categorie: string
  taille: string
  etat: string
  couleur: string
  prix_suggere: number
  personalised?: boolean
}

export function formatForClipboard(listing: Listing): string {
  return [
    listing.titre,
    '',
    listing.description,
    '',
    `📦 État : ${listing.etat}`,
    `👗 Taille : ${listing.taille}`,
    `🏷️ Marque : ${listing.marque}`,
    `🎨 Couleur : ${listing.couleur}`,
    `💶 Prix : ${listing.prix_suggere}€`,
  ].join('\n')
}
