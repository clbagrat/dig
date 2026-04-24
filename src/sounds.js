// ── Sound System ────────────────────────────────────────────────────────────────
// Loads .ogg files from /res/ directory, plays via Web Audio API.

let audioCtx = null;
/** @type {Map<string, AudioBuffer>} */
const bufferCache = new Map();
/** @type {Map<string, number>} */
const failedIds = new Map();
/** @type {Map<string, string>} */
const resolvedExtById = new Map();
const preloadIds = [];
let muted = true;
let masterVolume = 1.0;
let preloadStarted = false;
let preloadFinished = false;
const FAILED_RETRY_MS = 2500;
const SOUND_EXTENSIONS = ["ogg", "wav"];

// ── Sound catalog ───────────────────────────────────────────────────────────────

export const SFX = {
  // 1. Бурение и добыча
  drill_strike:    { id: "drill_strike",    cat: "mining",      desc: "Удар бура по породе", full: "Короткий металлический удар бура о породу. Звучит при каждом цикле бурения. Должен быть коротким и не раздражать при частом повторении. Вариативность через pitch shift." },
  drill_strike_metal: { id: "drill_strike_metal", cat: "mining", desc: "Удар бура по металлу", full: "Жёсткий звонкий удар по металлической жиле или запертой металлической двери. Более высокий и твёрдый, чем обычный drill_strike." },
  drill_strike_ore: { id: "drill_strike_ore", cat: "mining", desc: "Удар бура по золотой жиле", full: "Удар бура по тайлу с золотом. Каменный удар с лёгким металлическим и ценным призвуком, но без полного звука разрушения руды." },
  drill_strike_thorns: { id: "drill_strike_thorns", cat: "mining", desc: "Удар бура по шипам", full: "Короткий резкий лязг по шипастому тайлу. Должен звучать опаснее и колючее обычного удара по камню." },
  block_break:     { id: "block_break",     cat: "mining",      desc: "Разрушение каменного блока", full: "Хруст/разрушение каменного блока. Звучит при полном разрушении ячейки. Ощущение рассыпающейся породы." },
  block_break_ore: { id: "block_break_ore", cat: "mining",      desc: "Разрушение рудного/золотого блока", full: "Разрушение рудного/золотого блока. Более звонкий и «ценный» звук, чем обычный block_break. Лёгкий металлический отзвук." },
  weak_spot_hit:   { id: "weak_spot_hit",   cat: "mining",      desc: "Попадание по слабому месту", full: "Попадание по слабому месту блока. Усиленный, сочный удар с ощущением критического попадания. Короткий высокочастотный акцент." },
  contour_close:   { id: "contour_close",   cat: "mining",      desc: "Замыкание контура бурения", full: "Замыкание контура бурения. Мягкий «вжух» — ощущение завершения петли. Удовлетворяющий тональный звук." },
  loop_field:      { id: "loop_field",      cat: "mining",      desc: "Активация поля петли", full: "Активация поля петли (массовое разрушение блоков внутри контура). Нарастающий гул, переходящий в хлопок. Масштабнее обычного break." },

  // 2. Ресурсы и подбор
  xp_pickup:       { id: "xp_pickup",       cat: "pickup",      desc: "Подбор кристалла опыта", full: "Подбор кристалла опыта. Лёгкий мелодичный звон, как стеклянный колокольчик. Приятный и не навязчивый при частом повторении." },
  gold_pickup:     { id: "gold_pickup",     cat: "pickup",      desc: "Подбор золотой руды", full: "Подбор золотой руды. Монетный звон/дзинь. Классический звук подбора валюты. Чуть тяжелее, чем xp_pickup." },
  fuel_pickup:     { id: "fuel_pickup",     cat: "pickup",      desc: "Подбор бака топлива", full: "Подбор бака топлива. Жидкостный «буль» или звук заправки. Ощущение наполнения бака." },
  perk_pickup:     { id: "perk_pickup",     cat: "pickup",      desc: "Подбор перка на тайле", full: "Подбор перка на тайле (бомба, бак, HP+, броня). Короткий бонусный джингл — ощущение получения усиления." },
  crystal_pickup:  { id: "crystal_pickup",  cat: "pickup",      desc: "Подбор кристалла рецепта", full: "Подбор кристалла рецепта (правильный цвет). Чистый кристальный тон. Более «магический», чем xp_pickup." },
  crystal_wrong:   { id: "crystal_wrong",   cat: "pickup",      desc: "Неправильный кристалл (стан)", full: "Подбор неправильного кристалла (вызывает стан). Диссонансный, резкий звук ошибки. Электрический разряд или скрежет." },
  key_pickup:      { id: "key_pickup",      cat: "pickup",      desc: "Подбор ключа от сейфа", full: "Подбор ключа от сейфа. Металлический звон ключей. Чёткий и узнаваемый." },
  artifact_pickup: { id: "artifact_pickup", cat: "pickup",      desc: "Подбор артефакта", full: "Подбор артефакта. Значимый, весомый звук — низкий гонг или глубокий тон. Ощущение редкой находки." },
  micro_bonus:     { id: "micro_bonus",     cat: "pickup",      desc: "Микро-бонус", full: "Подбор микро-бонуса при раскрытии скрытого тайла. Тихий, быстрый «пинг». Не должен перетягивать внимание." },

  // 3. Взрывы
  explosion:       { id: "explosion",       cat: "explosion",   desc: "Стандартный взрыв", full: "Стандартный взрыв. Глубокий «бум» с низкочастотной составляющей. Основа для всех взрывных эффектов." },
  chain_explosion: { id: "chain_explosion", cat: "explosion",   desc: "Цепной взрыв", full: "Цепной взрыв (серия последовательных взрывов). Серия быстрых взрывов с нарастающей интенсивностью, или тот же explosion с вариацией pitch." },
  rocket_launch:   { id: "rocket_launch",   cat: "explosion",   desc: "Запуск ракетного снаряда", full: "Запуск ракетного снаряда. Шипящий свист уходящего снаряда. Короткий «пшш-вжж»." },
  rocket_detonate: { id: "rocket_detonate", cat: "explosion",   desc: "Подрыв ракеты", full: "Подрыв ракеты при достижении цели. Резкий хлопок, переходящий в explosion. Чуть острее базового взрыва." },
  remote_bomb:     { id: "remote_bomb",     cat: "explosion",   desc: "Сапёрный заряд", full: "Срабатывание сапёрного заряда. Электронный «бип-бип-бум» — сигнал активации, переходящий во взрыв." },

  // 4. Урон и здоровье
  player_hit:      { id: "player_hit",      cat: "damage",      desc: "Игрок получает урон", full: "Игрок получает урон. Тупой удар + лёгкий металлический скрежет (повреждение бура). Неприятный, но не отталкивающий." },
  player_heal:     { id: "player_heal",     cat: "damage",      desc: "Восстановление HP", full: "Восстановление HP. Мягкий восходящий тон, ощущение регенерации. Короткий и приятный." },
  player_death:    { id: "player_death",    cat: "damage",      desc: "Бур разрушен (смерть)", full: "Бур полностью разрушен, игра окончена. Тяжёлый механический слом — скрежет, разрушение металла, затухание. Финальный, драматичный." },
  stun:            { id: "stun",            cat: "damage",      desc: "Стан игрока", full: "Стан игрока (оглушение). Звенящий гул в голове, как после удара. Электрический разряд или тонкий писк." },
  artifact_drop:   { id: "artifact_drop",   cat: "damage",      desc: "Артефакт выпал при уроне", full: "Артефакт выпал из инвентаря при получении урона. Тяжёлый звон падения ценного предмета. Привлекает внимание — «ты потерял что-то важное»." },

  // 5. Нагрев
  heat_warning:    { id: "heat_warning",    cat: "heat",        desc: "Критический нагрев (~80%)", full: "Бур достигает критического нагрева (~80%). Нарастающий тревожный писк/сигнал. Предупреждение." },
  heat_overload:   { id: "heat_overload",   cat: "heat",        desc: "Перегрев бура", full: "Перегрев бура — принудительный стан. Громкий механический перегрев: шипение пара + аварийный сигнал. Ощущение «двигатель заглох»." },
  drill_overdrive: { id: "drill_overdrive", cat: "heat",        desc: "Активация овердрайва", full: "Активация овердрайва (временное ускорение). Разгон турбины — нарастающий механический вой. Ощущение мощи и скорости." },

  // 6. Опасности
  gas_release:     { id: "gas_release",     cat: "hazard",      desc: "Вскрытие газового кармана", full: "Вскрытие газового кармана. Резкий выброс воздуха — «пшшш». Ощущение разгерметизации." },
  gas_hiss:        { id: "gas_hiss",        cat: "hazard",      desc: "Шипение газа (фоновое)", full: "Фоновое шипение при нахождении в газовом облаке. Тихий, продолжительный шипящий шум. Атмосферная опасность." },
  steam_burst:     { id: "steam_burst",     cat: "hazard",      desc: "Вскрытие парового кармана", full: "Вскрытие парового кармана. Мощный выброс пара — свист + шипение. Горячее и опасное." },
  steam_hiss:      { id: "steam_hiss",      cat: "hazard",      desc: "Контакт с паровой струёй", full: "Контакт с паровой струёй. Шипение горячего пара при касании. Короткий обжигающий звук." },
  spike_trigger:   { id: "spike_trigger",   cat: "hazard",      desc: "Активация шипов", full: "Активация шипов / цепная реакция шипов. Резкий металлический лязг — выстреливающие шипы. Быстрый и опасный." },
  boulder_roll:    { id: "boulder_roll",    cat: "hazard",      desc: "Валун катится", full: "Валун начинает катиться. Тяжёлый каменный грохот перекатывания. Зацикленный или длительный." },
  boulder_impact:  { id: "boulder_impact",  cat: "hazard",      desc: "Валун врезается", full: "Валун врезается в препятствие или разрушается. Тяжёлый удар камня — глухой «бам» с осколками." },
  worm_spawn:      { id: "worm_spawn",      cat: "hazard",      desc: "Появление червя", full: "Появление червя из гнезда. Органический, мерзкий звук — хлюпанье/шевеление. Ощущение опасности." },
  worm_attack:     { id: "worm_attack",     cat: "hazard",      desc: "Атака червя", full: "Атака червя по игроку. Быстрый бросок + хлёсткий удар. Агрессивный, органический." },

  // 7. Навигация
  beacon_activate: { id: "beacon_activate", cat: "navigation",  desc: "Активация маяка", full: "Активация маяка (ключевое событие прогрессии). Мощный, торжественный звук — гудок маяка + восходящий аккорд. Ощущение достижения. Один из самых запоминающихся звуков в игре." },
  radar_pickup:    { id: "radar_pickup",    cat: "navigation",  desc: "Подбор радара", full: "Подбор радара (временный индикатор направления). Электронный «блип» — включение прибора. Короткий технологичный звук." },
  safe_door_open:  { id: "safe_door_open",  cat: "navigation",  desc: "Открытие двери сейфа", full: "Открытие двери сейфа ключом. Тяжёлый механизм — щелчок замка + скрип/скольжение тяжёлой двери." },
  depth_announce:  { id: "depth_announce",  cat: "navigation",  desc: "Новый уровень глубины", full: "Достижение нового уровня глубины. Глубокий, атмосферный гонг или басовый тон. Ощущение «ты зашёл ещё глубже»." },

  // 8. Прогрессия
  level_up:        { id: "level_up",        cat: "progression", desc: "Повышение уровня", full: "Повышение уровня игрока. Яркий, позитивный фанфары/джингл. Короткий (1-2 сек), но праздничный. Восходящая мелодия." },
  recipe_complete: { id: "recipe_complete", cat: "progression", desc: "Завершение рецепта кристаллов", full: "Завершение рецепта из кристаллов. Магический звон завершения — все кристаллы «сложились». Гармоничный аккорд." },
  base_found:      { id: "base_found",      cat: "progression", desc: "База найдена (победа)", full: "Нахождение базы (победа в раунде). Самый торжественный звук в игре. Полноценный победный джингл (2-3 сек). Фанфары + облегчение." },
  gold_perk_unlock:{ id: "gold_perk_unlock",cat: "progression", desc: "Разблокировка золотого перка", full: "Разблокировка золотого перка. Звон монет + бонусный аккорд. Ощущение «ты заработал что-то особенное»." },

  // 9. Магазин
  shop_open:       { id: "shop_open",       cat: "shop",        desc: "Открытие магазина", full: "Открытие магазина. Скрип/звон открывающейся витрины. Приветливый, коммерческий звук." },
  shop_close:      { id: "shop_close",      cat: "shop",        desc: "Закрытие магазина", full: "Закрытие магазина. Мягкий звук закрытия — короткий «тук». Ненавязчивый." },
  purchase:        { id: "purchase",        cat: "shop",        desc: "Покупка предмета", full: "Покупка предмета. Звон монет/кассы — классический звук транзакции. Подтверждение покупки." },
  recycle:         { id: "recycle",         cat: "shop",        desc: "Переработка предмета", full: "Переработка предмета (продажа обратно). Механический хруст/измельчение + возврат монет. Ощущение утилизации." },
  reroll:          { id: "reroll",          cat: "shop",        desc: "Обновление ассортимента", full: "Обновление ассортимента магазина. Звук перетасовки/рулетки — быстрое мелькание вариантов." },
  equipment_merge: { id: "equipment_merge", cat: "shop",        desc: "Слияние экипировки", full: "Слияние/улучшение экипировки. Нарастающий тон + удовлетворяющий «клик» объединения. Ощущение апгрейда." },
  synergy_found:   { id: "synergy_found",   cat: "shop",        desc: "Обнаружена синергия", full: "Обнаружение синергии между предметами. Гармоничный аккорд — два звука сливающихся в один. Ощущение «вещи работают вместе»." },

  // 10. UI
  button_click:    { id: "button_click",    cat: "ui",          desc: "Нажатие на кнопку", full: "Нажатие на любую кнопку интерфейса. Мягкий тактильный клик. Короткий, нейтральный. Не должен раздражать." },
  modal_open:      { id: "modal_open",      cat: "ui",          desc: "Открытие модального окна", full: "Открытие модального окна (уровень, перк, артефакт). Мягкий «вуш» появления. Лёгкий и ненавязчивый." },
  modal_close:     { id: "modal_close",     cat: "ui",          desc: "Закрытие модального окна", full: "Закрытие модального окна. Обратный «вуш» — затухание. Ещё мягче, чем open." },
  perk_choose:     { id: "perk_choose",     cat: "ui",          desc: "Выбор перка", full: "Выбор перка из предложенных вариантов. Подтверждающий тон — «выбор сделан». Короткий позитивный аккорд." },
  reward_choose:   { id: "reward_choose",   cat: "ui",          desc: "Выбор награды за уровень", full: "Выбор награды за уровень. Похож на perk_choose, но чуть более значимый. Лёгкий фанфар подтверждения." },
  toast_popup:     { id: "toast_popup",     cat: "ui",          desc: "Появление уведомления", full: "Появление всплывающего уведомления (тоста). Тихий «поп» или «бульк». Фоновый, не отвлекающий." },

  // 11. Специальные
  overflow_surge:  { id: "overflow_surge",  cat: "special",     desc: "Сброс избытка топлива", full: "Сброс избытка топлива (механика переполнения). Жидкостный выплеск + энергетический разряд. Ощущение высвобождения энергии." },
  fuel_emergency:  { id: "fuel_emergency",  cat: "special",     desc: "Аварийный режим топлива", full: "Аварийный режим — здоровье расходуется вместо топлива. Тревожный пульсирующий сигнал. Красная тревога. Должен побуждать к действию." },
  overheal_boost:  { id: "overheal_boost",  cat: "special",     desc: "Буст от перелечения", full: "Активация буста от перелечения. Мягкий энергетический подъём. Ощущение «переполнения силой»." },
  crystal_catalyst:{ id: "crystal_catalyst",cat: "special",     desc: "Кристаллический катализатор", full: "Кристаллический катализатор. Магический резонанс — вибрирующий кристальный тон." },
};

preloadIds.push(...Object.keys(SFX));

// ── Audio Context ───────────────────────────────────────────────────────────────

function ensureContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

async function decodeBuffer(id, { ignoreRetryWindow = false } = {}) {
  if (bufferCache.has(id)) return bufferCache.get(id);
  const lastFailedAt = failedIds.get(id);
  if (!ignoreRetryWindow && lastFailedAt && Date.now() - lastFailedAt < FAILED_RETRY_MS) return null;
  try {
    const extensions = resolvedExtById.has(id)
      ? [resolvedExtById.get(id), ...SOUND_EXTENSIONS.filter((ext) => ext !== resolvedExtById.get(id))]
      : SOUND_EXTENSIONS;

    for (const ext of extensions) {
      const resp = await fetch(`/res/${id}.${ext}`);
      if (!resp.ok) {
        continue;
      }
      const raw = await resp.arrayBuffer();
      const ctx = ensureContext();
      const buf = await ctx.decodeAudioData(raw);
      failedIds.delete(id);
      resolvedExtById.set(id, ext);
      bufferCache.set(id, buf);
      return buf;
    }

    failedIds.set(id, Date.now());
    return null;
  } catch {
    failedIds.set(id, Date.now());
    return null;
  }
}

function waitForPreloadSlot() {
  return new Promise((resolve) => {
    const run = () => resolve();
    if (typeof window !== "undefined" && typeof window.requestIdleCallback === "function") {
      window.requestIdleCallback(run, { timeout: 180 });
    } else {
      window.setTimeout(run, 0);
    }
  });
}

async function preloadAllSounds() {
  if (preloadStarted) return;
  preloadStarted = true;

  for (const id of preloadIds) {
    const lastFailedAt = failedIds.get(id);
    if (bufferCache.has(id) || (lastFailedAt && Date.now() - lastFailedAt < FAILED_RETRY_MS)) {
      continue;
    }
    await waitForPreloadSlot();
    await decodeBuffer(id);
  }

  preloadFinished = true;
}

// ── Public API ──────────────────────────────────────────────────────────────────

/**
 * Play a sound effect by ID. Non-blocking, fire-and-forget.
 * @param {string} id - one of the SFX keys
 * @param {object} [opts]
 * @param {number} [opts.volume=1] - 0..1
 * @param {number} [opts.pitch=1] - playback rate
 */
export function playSound(id, opts = {}) {
  if (muted) return;
  const vol = (opts.volume ?? 1) * masterVolume;
  const rate = opts.pitch ?? 1;
  if (typeof window !== "undefined" && typeof window.__digShowAudioToast === "function") {
    try {
      window.__digShowAudioToast(id, { volume: vol, pitch: rate });
    } catch {
      // Debug toast must never break audio playback
    }
  }

  decodeBuffer(id, { ignoreRetryWindow: true }).then((buf) => {
    if (!buf) return;
    const ctx = ensureContext();
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.playbackRate.value = rate;
    const gain = ctx.createGain();
    gain.gain.value = vol;
    src.connect(gain).connect(ctx.destination);
    src.start(0);
  }).catch(() => {});
}

/** Invalidate cache for a sound so it re-fetches from /res/ on next play */
export function invalidateSound(id) {
  bufferCache.delete(id);
  failedIds.delete(id);
  resolvedExtById.delete(id);
  preloadFinished = false;
  if (preloadStarted) {
    waitForPreloadSlot().then(() => decodeBuffer(id)).catch(() => {});
  }
}

export function setMuted(v) { muted = !!v; }
export function isMuted() { return muted; }
export function setMasterVolume(v) { masterVolume = Math.max(0, Math.min(1, v)); }
export function getSoundPreloadProgress() {
  const total = preloadIds.length;
  const ready = bufferCache.size + failedIds.size;
  const percent = total > 0 ? Math.round((Math.min(total, ready) / total) * 100) : 100;
  return {
    active: preloadStarted && !preloadFinished,
    ready: Math.min(total, ready),
    total,
    percent,
  };
}

export function initSounds() {
  const unlock = () => {
    ensureContext();
    preloadAllSounds().catch(() => {});
    document.removeEventListener("pointerdown", unlock);
    document.removeEventListener("keydown", unlock);
  };
  document.addEventListener("pointerdown", unlock, { once: false });
  document.addEventListener("keydown", unlock, { once: false });
}
