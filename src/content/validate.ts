import { uiKeys, type Content } from './types';

type RecordValue = Record<string, unknown>;
const assets = ['/assets/calisthenics.svg', '/assets/yoga.svg', '/assets/swimming.svg'];
const profileIds = ['first', 'returning', 'regular'];
const sportIds = ['calisthenics', 'yoga', 'swimming'];
function fail(path: string, message: string): never {
  throw new Error(`Configuración: ${path}: ${message}`);
}
function object(value: unknown, path: string): RecordValue {
  if (!value || typeof value !== 'object' || Array.isArray(value)) fail(path, 'falta un objeto válido.');
  return value as RecordValue;
}
function text(value: unknown, path: string): string {
  if (typeof value !== 'string' || !value.trim() || /[<>]/.test(value)) fail(path, 'falta texto válido, sin etiquetas HTML.');
  return value;
}
function fields(value: RecordValue, keys: readonly string[], path: string) {
  for (const key of keys) text(value[key], `${path}.${key}`);
}
function list(value: unknown, path: string, nonempty = true): unknown[] {
  if (!Array.isArray(value) || (nonempty && value.length === 0)) fail(path, 'falta una lista con contenido.');
  return value;
}
function texts(value: unknown, path: string) {
  list(value, path).forEach((item, index) => text(item, `${path}[${index}]`));
}
function choice(value: unknown, values: readonly unknown[], path: string) {
  if (!values.includes(value)) fail(path, 'valor no admitido o referencia que no existe.');
}
function integer(value: unknown, minimum: number, path: string) {
  if (typeof value !== 'number' || !Number.isFinite(value) || !Number.isInteger(value) || value < minimum) fail(path, `se requiere un número entero de al menos ${minimum}.`);
}
function entities(value: unknown, path: string): RecordValue[] {
  const seen = new Set<string>();
  return list(value, path).map((entry, index) => {
    const item = object(entry, `${path}[${index}]`);
    const id = text(item.id, `${path}[${index}].id`);
    if (!/^[a-z][a-z0-9-]*$/.test(id) || id.trim() !== id) fail(path, `el ID «${id}» no es válido.`);
    if (seen.has(id)) fail(path, `el ID «${id}» está duplicado.`);
    seen.add(id);
    return item;
  });
}
function exactIds(items: RecordValue[], expected: string[], path: string) {
  if (items.length !== expected.length || expected.some(id => !items.some(item => item.id === id))) fail(path, `se requieren exactamente los IDs ${expected.join(', ')}.`);
}
function reference(items: RecordValue[], id: unknown, path: string): RecordValue {
  const found = items.find(item => item.id === id);
  if (!found) fail(path, `la referencia «${String(id)}» no existe.`);
  return found;
}
function date(value: unknown, path: string): string {
  const result = text(value, path);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(result) || !Number.isFinite(Date.parse(result)) || new Date(result).toISOString().slice(0, 10) !== result) fail(path, `la fecha «${result}» no es válida; usá AAAA-MM-DD.`);
  return result;
}
function weekKey(value: string): string {
  const day = new Date(value + 'T12:00:00Z');
  day.setUTCDate(day.getUTCDate() - (day.getUTCDay() + 6) % 7);
  return day.toISOString().slice(0, 10);
}

/** Validate the public boundary before any screen or derived consumer receives it. */
export function validateContent(input: unknown): Content {
  const root = object(input, 'contenido');
  if (root.schemaVersion !== 1) fail('schemaVersion', 'versión no admitida; se requiere 1.');
  fields(object(root.branding, 'branding'), ['name', 'tagline', 'demoNotice'], 'branding');
  fields(object(root.ui, 'ui'), uiKeys, 'ui');
  fields(object(root.legal, 'legal'), ['illustrativeTraining', 'professionalReview', 'fictionalClasses', 'noOfficialStatus', 'nonredeemable', 'noAgreement', 'locationNotice'], 'legal');
  const profiles = entities(root.profiles, 'profiles');
  const sports = entities(root.sports, 'sports');
  exactIds(profiles, profileIds, 'profiles');
  exactIds(sports, sportIds, 'sports');
  for (const sport of sports) {
    const path = `sports.${sport.id}`;
    fields(sport, ['name', 'summary', 'heroAlt', 'environment', 'facilities', 'safetyCopy'], path);
    choice(sport.heroAsset, assets, `${path}.heroAsset`);
    texts(sport.tips, `${path}.tips`);
    const modes = list(sport.modes, `${path}.modes`);
    if (modes.length !== 2 || !modes.includes('solo') || !modes.includes('classes')) fail(`${path}.modes`, 'se requieren los caminos solo y classes.');
  }
  const exercises = entities(root.exercises, 'exercises');
  for (const exercise of exercises) {
    const path = `exercises.${exercise.id}`;
    fields(exercise, ['title', 'quantity', 'technique', 'imageAlt'], path);
    choice(exercise.imageAsset, assets, `${path}.imageAsset`);
    choice(exercise.sportId, sportIds, `${path}.sportId`);
    choice(exercise.medium, ['dry-land', 'water'], `${path}.medium`);
    if (exercise.medium === 'water' && exercise.sportId !== 'swimming') fail(path, 'un ejercicio en agua debe pertenecer a natación.');
  }
  const plans = entities(root.plans, 'plans');
  for (const plan of plans) {
    const path = `plans.${plan.id}`;
    fields(plan, ['level', 'name', 'description', 'duration', 'environment', 'safetyCopy'], path);
    choice(plan.profileId, profileIds, `${path}.profileId`);
    choice(plan.sportId, sportIds, `${path}.sportId`);
    choice(plan.medium, ['dry-land', 'water'], `${path}.medium`);
    texts(plan.prerequisites, `${path}.prerequisites`);
    if (plan.medium === 'water' && plan.sportId !== 'swimming') fail(path, 'un plan en agua debe pertenecer a natación.');
    for (const step of entities(plan.steps, `${path}.steps`)) {
      const exercise = reference(exercises, step.exerciseId, `${path}.steps.${step.id}.exerciseId`);
      if (exercise.sportId !== plan.sportId) fail(`${path}.steps.${step.id}`, `el ejercicio «${exercise.id}» pertenece a otro deporte.`);
      if (exercise.medium === 'water' && plan.medium !== 'water') fail(`${path}.steps.${step.id}`, `el ejercicio «${exercise.id}» no coincide con el medio seguro del plan.`);
    }
  }
  for (const profile of profiles) {
    const path = `profiles.${profile.id}`;
    fields(profile, ['title', 'subtitle', 'welcome', 'hero', 'cta', 'nextPrompt'], path);
    integer(profile.weeklyGoal, 1, `${path}.weeklyGoal`);
    choice(profile.defaultSportId, sportIds, `${path}.defaultSportId`);
    const plan = reference(plans, profile.defaultPlanId, `${path}.defaultPlanId`);
    if (plan.profileId !== profile.id || plan.sportId !== profile.defaultSportId || plan.medium !== 'dry-land') fail(path, `el plan predeterminado «${plan.id}» no corresponde al perfil, deporte o medio seguro.`);
    for (const sportId of sportIds) {
      if (!plans.some(plan => plan.profileId === profile.id && plan.sportId === sportId && plan.medium === 'dry-land')) fail(path, `falta un plan seguro para «${sportId}».`);
    }
    if (!plans.some(plan => plan.profileId === profile.id && plan.sportId === 'swimming' && plan.medium === 'water')) fail(path, 'falta la variante de natación en agua.');
  }
  const classes = entities(root.classes, 'classes');
  for (const item of classes) {
    const path = `classes.${item.id}`;
    fields(item, ['title', 'schedule', 'venue', 'locality', 'level', 'description', 'receiver', 'contactCopy'], path);
    texts(item.requirements, `${path}.requirements`);
    choice(item.sportId, sportIds, `${path}.sportId`);
    if (item.fictional !== true) fail(path, 'la clase debe ser ficticia.');
    const price = object(item.price, `${path}.price`);
    choice(price.kind, ['free', 'paid'], `${path}.price.kind`);
    choice(price.currency, ['ARS'], `${path}.price.currency`);
    if (typeof price.amount !== 'number' || !Number.isFinite(price.amount) || (price.kind === 'free' ? price.amount !== 0 : price.amount <= 0)) fail(`${path}.price.amount`, 'una clase gratuita cuesta 0; una paga requiere un importe positivo finito.');
  }
  for (const sportId of sportIds) {
    for (const kind of ['free', 'paid']) {
      if (!classes.some(item => item.sportId === sportId && object(item.price, 'price').kind === kind)) fail('classes', `falta una clase «${kind}» para «${sportId}».`);
    }
  }
  const rules = object(root.rules, 'rules');
  integer(rules.pointsPerCompletion, 0, 'rules.pointsPerCompletion');
  for (const [collection, numeric] of [['challenges', 'target'], ['badges', 'threshold'], ['benefits', 'pointsThreshold']] as const) {
    for (const item of entities(rules[collection], `rules.${collection}`)) {
      const path = `rules.${collection}.${item.id}`;
      fields(item, ['title', 'description'], path);
      integer(item[numeric], collection === 'benefits' ? 0 : 1, `${path}.${numeric}`);
      if (collection === 'benefits') {
        text(item.disclaimer, `${path}.disclaimer`);
        if (item.redeemable !== false) fail(path, 'los beneficios no pueden ser canjeables.');
      } else {
        choice(item.metric, ['sessions', 'activeWeeks'], `${path}.metric`);
        if (collection === 'challenges') choice(item.period, ['week', 'month'], `${path}.period`);
      }
    }
  }
  const scenarios = object(root.scenarios, 'scenarios');
  const referenceDate = date(scenarios.referenceDate, 'scenarios.referenceDate');
  if (scenarios.defaultProfileId !== 'first') fail('scenarios.defaultProfileId', 'el perfil inicial debe ser first.');
  const scenariosProfiles = entities(scenarios.profiles, 'scenarios.profiles');
  if (scenariosProfiles.length !== 3) fail('scenarios.profiles', 'se requiere un escenario por perfil.');
  const historyIds = new Set<string>();
  for (const profile of profiles) {
    const scenario = reference(scenariosProfiles, profile.scenarioId, `profiles.${profile.id}.scenarioId`);
    if (scenario.profileId !== profile.id) fail(`scenarios.${scenario.id}`, 'el escenario corresponde a otro perfil.');
    const history = list(scenario.history, `scenarios.${scenario.id}.history`, false);
    if ((profile.id === 'first' && history.length !== 0) || (profile.id !== 'first' && history.length === 0)) fail(`scenarios.${scenario.id}`, 'la primera vez requiere historial vacío; los otros perfiles requieren antecedentes de demostración.');
    const dates: string[] = [];
    if (history.length) for (const item of entities(history, `scenarios.${scenario.id}.history`)) {
      const path = `scenarios.${scenario.id}.history.${item.id}`;
      const id = String(item.id);
      if (historyIds.has(id)) fail(path, 'el ID del antecedente está duplicado entre escenarios.');
      historyIds.add(id);
      choice(item.sportId, sportIds, `${path}.sportId`);
      const plan = reference(plans, item.planId, `${path}.planId`);
      if (plan.sportId !== item.sportId || plan.profileId !== profile.id) fail(path, `el plan «${plan.id}» no corresponde al deporte o perfil del antecedente.`);
      const activityDate = date(item.activityDate, `${path}.activityDate`);
      if (activityDate > referenceDate) fail(path, 'el antecedente no puede ser posterior a la fecha de referencia.');
      dates.push(activityDate);
    }
    if (profile.id === 'returning' && dates.some(day => day === referenceDate)) fail(`scenarios.${scenario.id}`, 'el perfil que retoma debe mostrar una pausa anterior a la fecha de referencia.');
    if (profile.id === 'regular' && new Set(dates.map(weekKey)).size < 2) fail(`scenarios.${scenario.id}`, 'la práctica habitual requiere antecedentes de semanas diferentes.');
  }
  return input as Content;
}
