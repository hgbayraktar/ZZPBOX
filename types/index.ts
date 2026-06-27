export interface Klant {
  id: string;
  bedrijfsnaam: string;
  contactpersoon?: string;
  email?: string;
  kvkNummer?: string;
  btwNummer?: string;
  straat?: string;
  huisnummer?: string;
  postcode?: string;
  plaats?: string;
  telefoon?: string;
}

export interface FactuurRegel {
  id: string;
  omschrijving: string;
  aantal: string;
  prijs: string;
  btw: string;
  eenheid: string;
}

export interface Factuur {
  id: string;
  factuurNummer: string;
  klantNaam: string;
  klantEmail?: string;
  klantAdres?: string;
  klantKvk?: string;
  klantBtw?: string;
  datum: string;        // ISO: YYYY-MM-DD
  vervaldatum: string;  // ISO: YYYY-MM-DD
  regels: FactuurRegel[];
  status: 'concept' | 'verzonden' | 'betaald' | 'creditnota';
  soort: 'factuur' | 'creditnota';
  notities?: string;
  origineelFactuurNummer?: string | null;
  aangemaaktOp?: string;
}

export interface OfferteRegel {
  id: string;
  omschrijving: string;
  aantal: string;
  prijs: string;
  btw: string;
  eenheid: string;
}

export interface Offerte {
  id: string;
  offerteNummer: string;
  klantNaam: string;
  klantEmail?: string;
  klantAdres?: string;
  klantKvk?: string;
  klantBtw?: string;
  datum: string;     // ISO: YYYY-MM-DD
  geldigTot: string; // ISO: YYYY-MM-DD
  regels: OfferteRegel[];
  status: 'concept' | 'verzonden' | 'geaccepteerd' | 'verlopen';
  notities?: string;
  aangemaaktOp?: string;
}

export interface UrenRegistratie {
  id: string;
  datum: string;       // ISO: YYYY-MM-DD
  klantId?: string | null;
  klantNaam?: string;
  omschrijving: string;
  startTijd: string;   // ISO datetime string
  eindTijd: string;    // ISO datetime string
  duurMinuten: number;
  status: 'geregistreerd' | 'gefactureerd';
  factuurNummer?: string;
  aangemaaktOp?: string;
}

export interface Transactie {
  id: string;
  omschrijving: string;
  bedrag: string;
  soort: 'inkomst' | 'uitgave';
  categorie: string;
  datum: string;        // ISO: YYYY-MM-DD
  btwTarief?: string;
  btwBedrag?: string;
  factuurNummer?: string;
  aangemaaktOp?: string;
}

export interface Categorie {
  id: string;
  naam: string;
  soort: 'inkomst' | 'uitgave';
  icoon?: string;
  kleur?: string;
  bovenliggend?: string;
  volgorde?: number;
  aangemaaktOp?: string;
}

export interface Product {
  id: string;
  naam: string;
  prijs: string;
  btw: string;
  eenheid: string;
  omschrijving?: string;
  aangemaaktOp?: string;
}

export interface Bedrijf {
  bedrijfsnaam?: string;
  naamEigenaar?: string;
  email?: string;
  telefoon?: string;
  website?: string;
  straat?: string;
  huisnummer?: string;
  postcode?: string;
  plaats?: string;
  kvkNummer?: string;
  btwNummer?: string;
  iban?: string;
  banknaam?: string;
}
