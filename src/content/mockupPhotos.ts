import type { SportId } from './types';

interface MockupPhoto { readonly src: string; readonly alt: string }
/** Owner-approved non-exercise photos. Exercise assignments remain in runtime JSON. */
export const mockupPhotos = {
  city_hero: { src: "/assets/photos/city_hero.jpg", alt: "Ciudad y parques de Buenos Aires" },
  city_park: { src: "/assets/photos/city_park.jpg", alt: "Parque de Buenos Aires con edificios" },
  cali_card: { src: "/assets/photos/cali_card.jpg", alt: "Persona entrenando en barras de parque" },
  cali_hero: { src: "/assets/photos/cali_hero.jpg", alt: "Atleta haciendo dominadas en barra exterior" },
  cali_class_a: { src: "/assets/photos/cali_class_a.jpg", alt: "Grupo de personas haciendo ejercicio funcional al aire libre" },
  cali_class_b: { src: "/assets/photos/cali_class_b.jpg", alt: "Grupo de entrenamiento al aire libre con equipamiento" },
  yoga_card: { src: "/assets/photos/yoga_card.jpg", alt: "Mujer practicando yoga en parque" },
  yoga_hero: { src: "/assets/photos/yoga_hero.jpg", alt: "Mujer haciendo yoga y meditación en parque" },
  yoga_class_a: { src: "/assets/photos/yoga_class_a.jpg", alt: "Grupo de yoga al aire libre en parque" },
  yoga_class_b: { src: "/assets/photos/yoga_class_b.jpg", alt: "Otra clase grupal de yoga en parque con árboles" },
  swim_card: { src: "/assets/photos/swim_card.jpg", alt: "Nadadora haciendo crol en piscina cubierta" },
  swim_hero: { src: "/assets/photos/swim_hero.jpg", alt: "Nadador realizando estilo libre en pileta" },
  swim_class_a: { src: "/assets/photos/swim_class_a.jpg", alt: "Personas nadando largos en pileta" },
  swim_class_b: { src: "/assets/photos/swim_class_b.jpg", alt: "Grupo de nadadores entrenando en pileta" },
} as const satisfies Record<string, MockupPhoto>;

/** Separately approved welcome photo; the original mockup photo set is unchanged. */
export const welcomePhoto: MockupPhoto = {
  src: "/assets/photos/welcome_obelisk.jpg",
  alt: "Obelisco y avenida 9 de Julio en Buenos Aires",
};

export const sportPhotos: Record<SportId, { card: MockupPhoto; hero: MockupPhoto }> = {
  calisthenics: { card: mockupPhotos.cali_card, hero: mockupPhotos.cali_hero },
  yoga: { card: mockupPhotos.yoga_card, hero: mockupPhotos.yoga_hero },
  swimming: { card: mockupPhotos.swim_card, hero: mockupPhotos.swim_hero },
};

export const classPhotos: Record<string, MockupPhoto> = {
  "cal-free": mockupPhotos.cali_class_a,
  "cal-paid": mockupPhotos.cali_class_b,
  "yoga-free": mockupPhotos.yoga_class_a,
  "yoga-paid": mockupPhotos.yoga_class_b,
  "swim-free": mockupPhotos.swim_class_b,
  "swim-paid": mockupPhotos.swim_class_a,
};
