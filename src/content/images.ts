export interface VerifiedImage { subjectKind: 'exercise' | 'sport'; subjectIds: readonly string[]; evidence: string }
export type ImageRegistry = Readonly<Record<string, VerifiedImage>>;
/** Exact subjects reviewed against owner-approved bundled JPEG bytes; no category or wildcard authority. */
export const verifiedImages: ImageRegistry = Object.freeze({
  "/assets/photos/cali_incline.jpg": {
    "subjectKind": "exercise",
    "subjectIds": [
      "cal-first-row",
      "cal-returning-row",
      "cal-regular-row"
    ],
    "evidence": "/assets/photos/provenance.json#cali_incline"
  },
  "/assets/photos/cali_plank.jpg": {
    "subjectKind": "exercise",
    "subjectIds": [
      "cal-regular-side"
    ],
    "evidence": "/assets/photos/provenance.json#cali_plank"
  },
  "/assets/photos/cali_squat.jpg": {
    "subjectKind": "exercise",
    "subjectIds": [
      "cal-first-squat",
      "cal-returning-squat"
    ],
    "evidence": "/assets/photos/provenance.json#cali_squat"
  },
  "/assets/photos/cali_warmup.jpg": {
    "subjectKind": "exercise",
    "subjectIds": [
      "cal-first-shoulders",
      "cal-returning-shoulders",
      "cal-regular-shoulders"
    ],
    "evidence": "/assets/photos/provenance.json#cali_warmup"
  },
  "/assets/photos/swim_backstroke.jpg": {
    "subjectKind": "exercise",
    "subjectIds": [
      "swim-water-first-technique",
      "swim-water-returning-technique",
      "swim-water-regular-technique"
    ],
    "evidence": "/assets/photos/provenance.json#swim_backstroke"
  },
  "/assets/photos/swim_cooldown.jpg": {
    "subjectKind": "exercise",
    "subjectIds": [
      "swim-water-first-rest",
      "swim-water-returning-rest",
      "swim-water-regular-rest"
    ],
    "evidence": "/assets/photos/provenance.json#swim_cooldown"
  },
  "/assets/photos/swim_freestyle.jpg": {
    "subjectKind": "exercise",
    "subjectIds": [
      "swim-water-first-warmup",
      "swim-water-returning-warmup",
      "swim-water-regular-warmup"
    ],
    "evidence": "/assets/photos/provenance.json#swim_freestyle"
  },
  "/assets/photos/swim_warmup.jpg": {
    "subjectKind": "exercise",
    "subjectIds": [
      "swim-dry-first-shoulders",
      "swim-dry-first-breath",
      "swim-dry-first-coordination",
      "swim-dry-returning-shoulders",
      "swim-dry-returning-breath",
      "swim-dry-returning-coordination",
      "swim-dry-regular-shoulders",
      "swim-dry-regular-breath",
      "swim-dry-regular-coordination"
    ],
    "evidence": "/assets/photos/provenance.json#swim_warmup"
  },
  "/assets/photos/yoga_breathe.jpg": {
    "subjectKind": "exercise",
    "subjectIds": [
      "yoga-first-breath",
      "yoga-returning-breath"
    ],
    "evidence": "/assets/photos/provenance.json#yoga_breathe"
  },
  "/assets/photos/yoga_child.jpg": {
    "subjectKind": "exercise",
    "subjectIds": [
      "yoga-first-rest",
      "yoga-returning-rest"
    ],
    "evidence": "/assets/photos/provenance.json#yoga_child"
  },
  "/assets/photos/yoga_downward.jpg": {
    "subjectKind": "exercise",
    "subjectIds": [
      "yoga-regular-standing"
    ],
    "evidence": "/assets/photos/provenance.json#yoga_downward"
  },
  "/assets/photos/yoga_relax.jpg": {
    "subjectKind": "exercise",
    "subjectIds": [
      "yoga-regular-close"
    ],
    "evidence": "/assets/photos/provenance.json#yoga_relax"
  },
  "/assets/photos/yoga_sidebend.jpg": {
    "subjectKind": "exercise",
    "subjectIds": [
      "yoga-first-mobility",
      "yoga-returning-mobility",
      "yoga-regular-balance"
    ],
    "evidence": "/assets/photos/provenance.json#yoga_sidebend"
  }
});
export function validateImageRegistry(exerciseIds: readonly string[], sportIds: readonly string[], registry: ImageRegistry = verifiedImages): void {
  for (const [path,approval] of Object.entries(registry)) {
    const ids = approval.subjectIds;
    const available = approval.subjectKind === 'exercise' ? exerciseIds : sportIds;
    if (!Array.isArray(ids) || !ids.length || new Set(ids).size !== ids.length || ids.some(id => !available.includes(id))) {
      throw new Error(`Configuración: images.registry.${path}.subjectIds: se requieren sujetos exactos existentes, únicos y no vacíos.`);
    }
  }
}
