export type ProfileId = 'first' | 'returning' | 'regular';
export type SportId = 'calisthenics' | 'yoga' | 'swimming';
export type Medium = 'dry-land' | 'water';
export type Mode = 'solo' | 'classes';

export const uiKeys = [
  'home', 'back', 'profile', 'chooseSport', 'choosePath', 'solo', 'soloDescription',
  'classes', 'classesDescription', 'planPreview', 'classCatalog', 'viewClass', 'steps', 'duration',
  'level', 'environment', 'prerequisites', 'safety', 'free', 'paid', 'price',
  'schedule', 'venue', 'locality', 'requirements', 'receiver', 'contact', 'dryLand',
  'water', 'startWater', 'swimRedirect', 'start', 'completeStep', 'stepProgress', 'success',
  'next', 'interest', 'interestSuccess', 'journey', 'challenges', 'historyEmpty',
  'seedOrigin', 'simulatedOrigin', 'points', 'activeWeeks', 'weeklyGoal', 'badges',
  'benefits', 'reset', 'resetConfirm', 'storageWarning', 'storageRecovery',
  'canSwim', 'safePool', 'loading', 'retry', 'configurationError', 'skipToContent',
  'sessions', 'weekOf', 'thisWeek', 'thisMonth', 'earned', 'nextAchievement',
  'rest', 'pause', 'history', 'sessionAbandoned', 'notAvailable',
] as const;
export type UI = Record<typeof uiKeys[number], string>;
export interface Profile {
  id: ProfileId; title: string; subtitle: string; welcome: string; hero: string;
  cta: string; nextPrompt: string; defaultSportId: SportId; defaultPlanId: string;
  scenarioId: string; weeklyGoal: number;
}
export interface Sport {
  id: SportId; name: string; summary: string; heroAsset: string; heroAlt: string;
  environment: string; facilities: string; tips: string[]; modes: Mode[]; safetyCopy: string;
}
export interface Exercise {
  id: string; sportId: SportId; title: string; quantity: string; technique: string;
  imageAsset: string; imageAlt: string; medium: Medium;
}
export interface Plan {
  id: string; sportId: SportId; profileId: ProfileId; level: string; name: string;
  description: string; duration: string; environment: string; prerequisites: string[];
  safetyCopy: string; medium: Medium; steps: { id: string; exerciseId: string }[];
}
export interface ClassListing {
  id: string; sportId: SportId; title: string; schedule: string; venue: string;
  locality: string; level: string; requirements: string[]; description: string;
  receiver: string; contactCopy: string;
  price: { kind: 'free' | 'paid'; amount: number; currency: 'ARS' }; fictional: true;
}
export type Metric = 'sessions' | 'activeWeeks';
export interface Content {
  schemaVersion: 1;
  branding: { name: string; tagline: string; demoNotice: string };
  ui: UI;
  legal: Record<'illustrativeTraining' | 'professionalReview' | 'fictionalClasses' | 'noOfficialStatus' | 'nonredeemable' | 'noAgreement' | 'locationNotice', string>;
  profiles: Profile[]; sports: Sport[]; exercises: Exercise[]; plans: Plan[]; classes: ClassListing[];
  rules: {
    pointsPerCompletion: number;
    challenges: { id: string; title: string; description: string; metric: Metric; period: 'week' | 'month'; target: number }[];
    badges: { id: string; title: string; description: string; metric: Metric; threshold: number }[];
    benefits: { id: string; title: string; description: string; disclaimer: string; pointsThreshold: number; redeemable: false }[];
  };
  scenarios: {
    referenceDate: string; defaultProfileId: 'first';
    profiles: { id: string; profileId: ProfileId; history: { id: string; sportId: SportId; planId: string; activityDate: string }[] }[];
  };
}
