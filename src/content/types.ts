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
  'benefits', 'homeBenefitsTitle', 'homeBenefitsDescription', 'reset', 'resetConfirm', 'storageWarning', 'storageRecovery', 'storageReset',
  'canSwim', 'safePool', 'loading', 'retry', 'configurationError', 'skipToContent',
  'sessions', 'weekOf', 'thisWeek', 'thisMonth', 'earned', 'nextAchievement',
  'rest', 'pause', 'history', 'sessionAbandoned', 'notAvailable',
  'sports', 'profileAccessibleName', 'editSituation', 'previewBadge', 'exploreSituations', 'exitPreview',
  'intention', 'intentionNotice', 'intentionEmpty', 'imageUnavailable', 'scriptedDisclosure',
  'futureAI', 'cancel', 'resetFailed', 'chooseRequired', 'previous', 'reviewNext', 'locationIllustration', 'recentActivity', 'activityEmpty', 'weeklyCount', 'activityCount', 'durationOption',
  'illustrativeProgress', 'illustrativePoints', 'exampleBase', 'savedJourneyPoints', 'illustrativeExplanation', 'previewPoints', 'benefitsDisclaimer', 'benefitsEmpty', 'benefitRemaining', 'benefitReached', 'viewAllBenefits', 'savedJourney', 'savedJourneyPointsLabel', 'scenarioSimulated', 'previewExplanation',
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
  imageAsset: string; imageAlt: string; medium: Medium; imageId: string | null; imageStatus: 'unavailable' | 'verified';
}
export interface Plan {
  id: string; sportId: SportId; profileId: ProfileId; level: string; name: string;
  description: string; duration: string; durationOptions: number[]; environment: string; prerequisites: string[];
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
  onboarding: { startLabel: string; title: string; instructions: string; continueLabel: string; validationLabel: string; editTitle: string; editInstructions: string; choices: { id: ProfileId; label: string }[] };
  previewScenarios: PreviewScenario[];
  chats: ScriptedChat[];
  destinations: Destination[];
  images: ImageAssignment[];
  profiles: Profile[]; sports: Sport[]; exercises: Exercise[]; plans: Plan[]; classes: ClassListing[];
  rules: {
    pointsPerCompletion: number;
    challenges: { id: string; title: string; description: string; metric: Metric; period: 'week' | 'month'; target: number }[];
    badges: { id: string; title: string; description: string; metric: Metric; threshold: number }[];
    benefits: { id: string; title: string; description: string; photo: { path: string; alt: string }; disclaimer: string; pointsThreshold: number; redeemable: false }[];
  };
  scenarios: {
    referenceDate: string; defaultProfileId: 'first';
    profiles: { id: string; profileId: ProfileId; history: { id: string; sportId: SportId; planId: string; activityDate: string }[] }[];
  };
}

export interface PreviewScenario {
  id: string; title: string; disclosure: string; guidance: string; referenceDate: string;
  recommendationSituationId: ProfileId; kind: 'journey' | 'notice';
  history: { id: string; sportId: SportId; planId: string; activityDate: string }[];
  chatId?: string; notice?: string; activationLabel?: string;
}
export interface ScriptedChat {
  id: string; scenarioId: string; introduction: string; disclosure: string;
  answers: { id: string; label: string; response: string; destinationId: string }[];
}
export type Destination = { id: string; sportId: SportId; label: string } & (
  { kind: 'class'; classId: string; planId?: never } |
  { kind: 'plan'; planId: string; classId?: never } |
  { kind: 'sport'; classId?: never; planId?: never });
export interface ImageAssignment {
  id: string; path: string | null; alt: string; subject: { kind: 'exercise' | 'sport'; id: string };
  sourceUrl: string | null; attribution: string; provenance: string;
  licenseStatus: 'unverified' | 'verified'; evidence: string | null;
}
