// The spike probes the canonical catalog (TRD §3).
import { CATALOG, type CatalogCompetition } from '../catalog/competitions';

export type CandidateCompetition = Pick<CatalogCompetition, 'id' | 'name' | 'section'>;

export const COMPETITIONS: CandidateCompetition[] = CATALOG;
