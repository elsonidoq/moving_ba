import { uiKeys, type Content } from './types';
import { verifiedImages, validateImageRegistry } from './images';

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
    if (exercise.imageAsset !== '') fail(`${path}.imageAsset`, 'la ilustración general no representa un ejercicio exacto; usá imageId o el estado no disponible.');
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
    if ((profile.id === 'first' && history.length !== 0) || (profile.id !== 'first' && history.length === 0)) fail(`scenarios.${scenario.id}`, 'la primera vez requiere historial vacío; los otros perfiles requieren antecedentes de ejemplo.');
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
  validateExtensions(root, exercises, plans, classes, sports);
  return input as Content;
}

const onboardingLabels = ['No estoy entrenando y quiero empezar.', 'Entrenaba antes y quiero volver.', 'Ya estoy entrenando.'];
const scenarioTitles = ['Entrenamiento sostenido', 'Volver después de una pausa', 'Dejó de entrenar y de usar la app', 'Pensaba asistir a una clase, pero no fue'];
const cases = {
  'missed-class': [
    ['interruption', 'Me surgió algo', ['class']],
    ['schedule', 'El horario o el lugar no me sirven', ['class']],
    ['dislike', 'No me gustó la actividad', ['sport']],
    ['discomfort', 'No me sentí cómodo/a con el docente o la clase', ['class', 'plan']],
    ['skip', 'Prefiero no responder', ['sport', 'plan']],
  ],
  inactive: [
    ['class', 'Volver con una clase', ['class']],
    ['short-solo', 'Entrenar algo corto por mi cuenta', ['plan']],
    ['other-sport', 'Probar otra actividad', ['sport']],
    ['skip', 'Prefiero no responder', ['sport', 'plan']],
  ],
} as const;
function validateExtensions(root: RecordValue, exercises: RecordValue[], plans: RecordValue[], classes: RecordValue[], sports: RecordValue[]) {
  const onboarding = object(root.onboarding, 'onboarding');
  fields(onboarding, ['startLabel', 'title', 'instructions', 'continueLabel', 'validationLabel', 'editTitle', 'editInstructions'], 'onboarding');
  const choices = entities(onboarding.choices, 'onboarding.choices');
  exactIds(choices, profileIds, 'onboarding.choices');
  profileIds.forEach((id, i) => {
    if (reference(choices, id, 'onboarding.choices').label !== onboardingLabels[i]) fail(`onboarding.choices.${id}.label`, 'se requiere la opción exacta de situación.');
  });
  const destinations = entities(root.destinations, 'destinations');
  if (destinations.length !== 9) fail('destinations', 'se requieren nueve destinos.');
  for (const d of destinations) {
    const path = `destinations.${d.id}`;
    fields(d, ['label'], path);
    choice(d.kind, ['class', 'plan', 'sport'], `${path}.kind`);
    choice(d.sportId, sportIds, `${path}.sportId`);
    const allowed = ['id', 'kind', 'sportId', 'label', ...(d.kind === 'class' ? ['classId'] : d.kind === 'plan' ? ['planId'] : [])];
    if (Object.keys(d).some(key => !allowed.includes(key))) fail(path, 'el destino contiene campos contradictorios.');
    if (d.kind !== 'sport') {
      const target = reference(d.kind === 'class' ? classes : plans, d[d.kind === 'class' ? 'classId' : 'planId'], path);
      if (target.sportId !== d.sportId || (d.kind === 'plan' && target.medium !== 'dry-land')) fail(path, 'el destino no corresponde al deporte o medio seguro.');
    }
  }
  const scenarios = entities(root.previewScenarios, 'previewScenarios');
  exactIds(scenarios, ['sustained', 'return', 'inactive', 'missed-class'], 'previewScenarios');
  const chats = entities(root.chats, 'chats');
  exactIds(chats, ['inactive-chat', 'missed-class-chat'], 'chats');
  const usedDestinations = new Set<unknown>();
  for (const [i, id] of ['sustained', 'return', 'inactive', 'missed-class'].entries()) {
    const scenario = reference(scenarios, id, 'previewScenarios');
    const path = `previewScenarios.${id}`;
    fields(scenario, ['title', 'disclosure', 'guidance'], path);
    if (scenario.title !== scenarioTitles[i]) fail(`${path}.title`, 'se requiere el nombre exacto del escenario.');
    const referenceDate = date(scenario.referenceDate, `${path}.referenceDate`);
    choice(scenario.recommendationSituationId, profileIds, `${path}.recommendationSituationId`);
    const kind = i < 2 ? 'journey' : 'notice';
    choice(scenario.kind, [kind], `${path}.kind`);
    const history = list(scenario.history, `${path}.history`, false);
    const dates: string[] = [];
    if (history.length) for (const h of entities(history, `${path}.history`)) {
      const hp = `${path}.history.${h.id}`;
      choice(h.sportId, sportIds, `${hp}.sportId`);
      const plan = reference(plans, h.planId, `${hp}.planId`);
      if (plan.sportId !== h.sportId || plan.profileId !== scenario.recommendationSituationId) fail(hp, 'el plan no corresponde al deporte o situación.');
      const day = date(h.activityDate, `${hp}.activityDate`);
      if (day > referenceDate) fail(hp, 'el antecedente no puede ser posterior a la referencia.');
      dates.push(day);
    }
    if (id === 'sustained' && new Set(dates.map(weekKey)).size < 2) fail(path, 'se requieren semanas diferentes de práctica.');
    if (id === 'return' && dates.some(day => day >= referenceDate)) fail(path, 'la vuelta requiere una pausa.');
    if (kind === 'journey') {
      if (['chatId', 'notice', 'activationLabel'].some(key => key in scenario)) fail(path, 'un recorrido no puede declarar un aviso.');
      continue;
    }
    fields(scenario, ['notice', 'activationLabel'], path);
    const chat = reference(chats, scenario.chatId, `${path}.chatId`);
    if (chat.id !== `${id}-chat` || chat.scenarioId !== id) fail(path, 'el chat corresponde a otro escenario.');
    fields(chat, ['introduction', 'disclosure'], `chats.${chat.id}`);
    const answers = entities(chat.answers, `chats.${chat.id}.answers`);
    const expected = cases[id as keyof typeof cases];
    exactIds(answers, expected.map(c => c[0]), `chats.${chat.id}.answers`);
    for (const [answerId, label, kinds] of expected) {
      const a = reference(answers, answerId, `chats.${chat.id}.answers`);
      const ap = `chats.${chat.id}.answers.${answerId}`;
      fields(a, ['label', 'response'], ap);
      if (a.label !== label) fail(`${ap}.label`, 'se requiere la respuesta predefinida exacta.');
      const d = reference(destinations, a.destinationId, `${ap}.destinationId`);
      choice(d.kind, kinds, `${ap}.destinationId.kind`);
      if (usedDestinations.has(d.id)) fail(ap, 'cada caso requiere su propio destino.');
      usedDestinations.add(d.id);
      if (d.kind === 'plan' && reference(plans, d.planId, ap).profileId !== scenario.recommendationSituationId) fail(ap, 'el plan no corresponde a la situación del escenario.');
    }
  }
  validateImageRegistry(exercises.map(e => String(e.id)), sports.map(s => String(s.id)));
  const images = list(root.images, 'images', false).length ? entities(root.images, 'images') : [];
  for (const image of images) {
    const path = `images.${image.id}`;
    fields(image, ['alt', 'attribution', 'provenance'], path);
    const subject = object(image.subject, `${path}.subject`);
    choice(subject.kind, ['exercise', 'sport'], `${path}.subject.kind`);
    reference(subject.kind === 'exercise' ? exercises : sports, subject.id, `${path}.subject.id`);
    choice(image.licenseStatus, ['unverified', 'verified'], `${path}.licenseStatus`);
    if (image.sourceUrl !== null) {
      const url = text(image.sourceUrl, `${path}.sourceUrl`);
      if (!/^https?:\/\/[^\s]+$/.test(url)) fail(`${path}.sourceUrl`, 'se requiere una URL de procedencia válida, solo como metadato.');
    }
    if (image.evidence !== null) text(image.evidence, `${path}.evidence`);
    if (image.path !== null) {
      const local = text(image.path, `${path}.path`);
      const approval = verifiedImages[local];
      if (!/^\/assets\/[a-zA-Z0-9/_-]+\.(?:jpg|jpeg|png|webp)$/.test(local) || local.includes('..') || !approval) fail(`${path}.path`, 'ruta local no autorizada o no canónica.');
      if (image.licenseStatus !== 'verified' || approval.subjectKind !== subject.kind || !approval.subjectIds.includes(String(subject.id)) || approval.evidence !== image.evidence) fail(path, 'falta verificación independiente de licencia y sujeto exacto.');
    } else if (image.licenseStatus === 'verified') fail(path, 'no se puede declarar verificada una imagen sin ruta autorizada.');
  }
  for (const e of exercises) {
    const path = `exercises.${e.id}`;
    choice(e.imageStatus, ['unavailable', 'verified'], `${path}.imageStatus`);
    if (e.imageId === null) {
      if (e.imageStatus !== 'unavailable') fail(path, 'una imagen ausente debe figurar como no disponible.');
      continue;
    }
    const image = reference(images, e.imageId, `${path}.imageId`);
    const subject = object(image.subject, path);
    if (subject.kind !== 'exercise' || subject.id !== e.id) fail(path, 'la imagen debe representar este ejercicio exacto, no un deporte general.');
    if (e.imageStatus !== (image.path !== null && image.licenseStatus === 'verified' ? 'verified' : 'unavailable')) fail(path, 'el estado de la imagen no corresponde a su verificación.');
  }
}
