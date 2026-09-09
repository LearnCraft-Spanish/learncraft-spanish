/**
 * Generates a frozen, expanded static bar from the Audio Quiz Redesign handoff.
 *
 * Why not drive the live DC prototype?
 * - The prototype animates (100ms setInterval advances fill + countdown).
 * - It has only 4 frames for a much larger state matrix.
 * - Its `_ds/` design-system bundle is not shipped with the handoff.
 *
 * This script templates the same markup/tokens as the handoff README and
 * emits one static `[data-screen-label]` frame per capture state. Every
 * frame's first child is the blue app header so capture-bar's chrome strip
 * stays consistent (mobile header height shared across all mobile frames;
 * desktop likewise).
 *
 * Usage: node .gauntlet/bars/audio-quiz/generate.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, 'index.html');

const SPANISH = ['Lo ', 'sabré', ' cuando ellos lo sepan.'];
const ENGLISH = ['I will know it when they know it.', '', ''];
const VOCAB = [
  {
    t: 'lo',
    word: 'lo',
    gloss: 'Direct object pronoun — "it".',
    pos: 'Pronoun',
    cat: 'Object pronouns',
    lessons: ['Lesson 24 · Direct objects', 'Lesson 31 · Pronoun order'],
  },
  {
    t: 'sabré',
    word: 'saber (sabré)',
    gloss: 'Future of saber — "I will know".',
    pos: 'Verb',
    cat: 'Irregular future',
    lessons: ['Lesson 88 · Future tense', 'Lesson 92 · Irregular stems'],
  },
  {
    t: 'cuando',
    word: 'cuando',
    gloss: 'Time conjunction — triggers subjunctive for future events.',
    pos: 'Conjunction',
    cat: 'Subjunctive triggers',
    lessons: ['Lesson 104 · Cuando + subjunctive'],
  },
  {
    t: 'ellos',
    word: 'ellos',
    gloss: 'Third person plural subject pronoun.',
    pos: 'Pronoun',
    cat: 'Subject pronouns',
    lessons: ['Lesson 3 · Subject pronouns'],
  },
  {
    t: 'sepan',
    word: 'saber (sepan)',
    gloss: 'Present subjunctive of saber, third plural.',
    pos: 'Verb',
    cat: 'Subjunctive',
    lessons: [
      'Lesson 101 · Present subjunctive',
      'Lesson 104 · Cuando + subjunctive',
    ],
  },
];

/** @typedef {'speaking' | 'listening'} QuizType */
/** @typedef {0|1|2|3} Step */

/**
 * @param {object} opts
 * @param {QuizType} opts.type
 * @param {boolean} opts.auto
 * @param {Step} opts.step
 * @param {boolean} opts.playing
 * @param {number} opts.fill
 * @param {number} opts.idx
 * @param {boolean} opts.help
 * @param {boolean} opts.added
 * @param {string|null} opts.word
 */
function view(opts) {
  const sp = opts.type === 'speaking';
  const names = sp
    ? ['Question', 'Guess', 'Audio answer', 'Written answer']
    : ['Question', 'Guess', 'Spanish answer', 'English answer'];
  const isSpanish = (sp && opts.step === 3) || (!sp && opts.step === 2);
  const isEnglish = (sp && opts.step === 0) || (!sp && opts.step === 3);
  const isGuess = opts.step === 1;
  const isListen = (sp && opts.step === 2) || (!sp && opts.step === 0);
  const txt = isSpanish ? SPANISH : ENGLISH;
  const primaryAuto = [
    'Skip to guess',
    sp ? 'Play Spanish' : 'Show Spanish',
    sp ? 'Play again' : 'Show English',
    opts.idx >= 20 ? 'Finish' : 'Next card',
  ];
  const primaryOff = [
    sp ? 'Play Spanish' : 'Show Spanish',
    sp ? 'Play Spanish' : 'Show Spanish',
    sp ? 'Play again' : 'Show English',
    opts.idx >= 20 ? 'Finish' : 'Next card',
  ];
  return {
    sp,
    names,
    isSpanish,
    isEnglish,
    isGuess,
    isListen,
    txt,
    primary: (opts.auto ? primaryAuto : primaryOff)[opts.step],
    quizName: sp
      ? 'Speaking quiz · my flashcards'
      : 'Listening quiz · my flashcards',
    posLabel: `${opts.idx} / 20`,
    pct: `${Math.round((opts.idx / 20) * 100)}%`,
    fillPct: opts.auto ? `${opts.fill}%` : '0%',
    playIcon: opts.playing ? 'ti-player-pause' : 'ti-player-play',
    cardCursor: opts.auto ? 'default' : 'pointer',
    isAnswer: opts.step === 3,
    isSentence: !isGuess && !isListen,
    isInstr: isGuess || isListen,
    instrTitle: isGuess
      ? 'Make a Guess!'
      : sp && opts.step === 0
        ? 'English audio playing'
        : 'Spanish audio playing',
    helpOpen: opts.step === 3 && opts.help,
    helpLabel: opts.help ? 'Hide help' : 'Get help',
    helpIcon: opts.help ? 'ti-x' : 'ti-book',
    addLabel: opts.added ? 'In my flashcards' : 'Add to my flashcards',
    addIcon: opts.added ? 'ti-check' : 'ti-plus',
    addBg: opts.added ? 'rgba(68,154,194,0.12)' : 'transparent',
    addBd: opts.added ? 'rgba(68,154,194,0.12)' : 'rgba(60,60,60,0.25)',
    addFg: opts.added ? '#449AC2' : '#3C3C3C',
    replayLabel: sp ? 'Replay English' : 'Replay Spanish',
    word: opts.word,
    auto: opts.auto,
    playing: opts.playing,
  };
}

function sentenceHtml(txt) {
  if (!txt[1]) {
    return escapeHtml(txt[0]);
  }
  return `${escapeHtml(txt[0])}<span style="font-weight:900">${escapeHtml(txt[1])}</span>${escapeHtml(txt[2])}`;
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function chipsHtml(selected) {
  return VOCAB.map((w) => {
    const on = selected === w.t;
    const bg = on ? '#449AC2' : 'rgba(68,154,194,0.12)';
    const bd = on ? '#449AC2' : 'transparent';
    const fg = on ? '#FFFFFF' : '#449AC2';
    return `<button type="button" style="padding:10px 14px;border-radius:6px;border:1.5px solid ${bd};background:${bg};color:${fg};font-family:inherit;font-size:16px;font-weight:500;line-height:1.2;cursor:default">${escapeHtml(w.t)}</button>`;
  }).join('');
}

function tipHtml(word, desktop) {
  const w = VOCAB.find((x) => x.t === word);
  if (!w) return '';
  const lessons = w.lessons
    .map(
      (l) =>
        `<div style="font-size:13px;color:rgba(255,255,255,0.80);display:flex;align-items:center;justify-content:space-between;gap:8px;cursor:default">${escapeHtml(l)}<i class="ti ti-chevron-right" style="font-size:16px;color:rgba(255,255,255,0.60)"></i></div>`,
    )
    .join('');
  if (desktop) {
    return `<div style="width:100%;background:#1C2232;border-radius:14px;padding:16px 20px;color:#FFFFFF;display:grid;grid-template-columns:1fr 1fr;gap:20px">
      <div style="display:flex;flex-direction:column;gap:10px">
        <div style="font-size:18px;font-weight:900">${escapeHtml(w.word)}</div>
        <div style="font-size:13px;line-height:1.5;color:rgba(255,255,255,0.80)">${escapeHtml(w.gloss)}</div>
        <div style="font-size:13px;color:rgba(255,255,255,0.80)"><span style="font-weight:900;color:#FFFFFF">${escapeHtml(w.pos)}</span> · ${escapeHtml(w.cat)}</div>
      </div>
      <div style="display:flex;flex-direction:column;gap:4px;padding-left:20px;border-left:0.5px solid rgba(255,255,255,0.22)">
        <div style="font-size:11px;font-weight:900;letter-spacing:0.08em;text-transform:uppercase;color:#B0A96F">Taught in</div>
        ${lessons}
      </div>
    </div>`;
  }
  return `<div style="width:100%;background:#1C2232;border-radius:14px;padding:16px;color:#FFFFFF;display:flex;flex-direction:column;gap:10px">
    <div style="font-size:18px;font-weight:900">${escapeHtml(w.word)}</div>
    <div style="font-size:13px;line-height:1.5;color:rgba(255,255,255,0.80)">${escapeHtml(w.gloss)}</div>
    <div style="font-size:13px;color:rgba(255,255,255,0.80)"><span style="font-weight:900;color:#FFFFFF">${escapeHtml(w.pos)}</span> · ${escapeHtml(w.cat)}</div>
    <div style="display:flex;flex-direction:column;gap:4px;padding-top:10px;border-top:0.5px solid rgba(255,255,255,0.22)">
      <div style="font-size:11px;font-weight:900;letter-spacing:0.08em;text-transform:uppercase;color:#B0A96F">Taught in</div>
      ${lessons}
    </div>
  </div>`;
}

function mobileHeader() {
  return `<div style="background:#449AC2;padding:12px 16px;display:flex;align-items:center;justify-content:space-between;color:#FFFFFF">
    <div style="display:flex;align-items:center;gap:6px;font-size:14px;font-weight:900;cursor:default"><i class="ti ti-chevron-left" style="font-size:20px"></i>Setup</div>
    <div style="display:flex;align-items:center;gap:10px"><img src="assets/wheel-white.svg" alt="" style="width:20px;height:20px;display:block"><span style="font-size:13px;font-weight:500;letter-spacing:0.06em">LEARNCRAFT</span></div>
    <div style="display:flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:999px;background:rgba(255,255,255,0.20);font-size:12px;font-weight:900">MB</div>
  </div>`;
}

function desktopHeader() {
  return `<div style="background:#449AC2;padding:13px 24px;display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:24px;color:#FFFFFF">
    <div style="display:flex;align-items:center;gap:10px"><img src="assets/wheel-white.svg" alt="" style="width:22px;height:22px;display:block"><span style="font-size:14px;font-weight:500;letter-spacing:0.06em">LEARNCRAFT</span></div>
    <div style="display:flex;align-items:center;gap:24px;font-size:14px;font-weight:900;justify-self:center">
      <span style="color:rgba(255,255,255,0.70);padding:6px 0;border-bottom:2px solid transparent">Home</span>
      <span style="color:rgba(255,255,255,0.70);padding:6px 0;border-bottom:2px solid transparent">Flashcard finder</span>
      <span style="color:rgba(255,255,255,0.70);padding:6px 0;border-bottom:2px solid transparent">My flashcards</span>
      <span style="color:#FFFFFF;padding:6px 0;border-bottom:2px solid #FFFFFF">Quiz</span>
    </div>
    <div style="justify-self:end;display:flex;align-items:center;gap:8px;font-size:14px;font-weight:900"><span style="display:flex;align-items:center;justify-content:center;width:26px;height:26px;border-radius:999px;background:rgba(255,255,255,0.20);font-size:12px;font-weight:900">MB</span>Maria B.<i class="ti ti-chevron-down" style="font-size:18px"></i></div>
  </div>`;
}

function bodyContent(v, desktop) {
  if (v.helpOpen) {
    const chipPad = desktop ? '7px 12px' : '10px 14px';
    const chips = VOCAB.map((w) => {
      const on = v.word === w.t;
      return `<button type="button" style="padding:${chipPad};border-radius:6px;border:1.5px solid ${on ? '#449AC2' : 'transparent'};background:${on ? '#449AC2' : 'rgba(68,154,194,0.12)'};color:${on ? '#FFFFFF' : '#449AC2'};font-family:inherit;font-size:16px;font-weight:500;line-height:1.2;cursor:default">${escapeHtml(w.t)}</button>`;
    }).join('');
    const tip = v.word ? tipHtml(v.word, desktop) : '';
    const sentenceSize = desktop
      ? 'font-size:36px;line-height:1.25'
      : 'font-size:26px;line-height:1.35';
    return `<div style="${sentenceSize};text-align:center;text-wrap:pretty">${sentenceHtml(v.txt)}</div>
      <div style="width:100%;display:flex;flex-direction:column;align-items:center;gap:10px">
        <div style="display:flex;flex-wrap:wrap;gap:8px;justify-content:center">${chips}</div>
        ${tip}
      </div>`;
  }
  if (v.isSentence) {
    const sentenceSize = desktop
      ? 'font-size:36px;line-height:1.25'
      : 'font-size:26px;line-height:1.35';
    return `<div style="${sentenceSize};text-align:center;text-wrap:pretty">${sentenceHtml(v.txt)}</div>`;
  }
  const instrSize = desktop
    ? 'font-size:26px;font-weight:900'
    : 'font-size:20px;font-weight:900';
  return `<div style="${instrSize};color:#6F6259;text-align:center">${escapeHtml(v.instrTitle)}</div>`;
}

function mobileFrame(label, opts) {
  const v = view(opts);
  const addBtn = v.isAnswer
    ? `<button type="button" style="display:flex;align-items:center;gap:6px;padding:7px 10px;border-radius:10px;border:1.5px solid ${v.addBd};background:${v.addBg};color:${v.addFg};font-family:inherit;font-size:12px;font-weight:900;cursor:default"><i class="ti ${v.addIcon}" style="font-size:16px"></i>${escapeHtml(v.addLabel)}</button>`
    : '';
  const helpBtn = v.isAnswer
    ? `<button type="button" style="height:40px;padding:0 14px;display:inline-flex;align-items:center;gap:6px;border-radius:10px;border:1.5px solid #449AC2;background:transparent;color:#449AC2;font-family:inherit;font-size:14px;font-weight:900;cursor:default"><i class="ti ${v.helpIcon}" style="font-size:16px"></i>${escapeHtml(v.helpLabel)}</button>`
    : '';
  return `<div style="width:390px;height:780px;background:#F0EDE6;border-radius:20px;border:0.5px solid rgba(60,60,60,0.13);overflow:hidden;display:flex;flex-direction:column;color:#3C3C3C" data-screen-label="${label}">
  ${mobileHeader()}
  <div style="padding:14px 16px 10px;display:flex;flex-direction:column;gap:10px">
    <div style="display:flex;align-items:center;justify-content:space-between;gap:12px">
      <div style="font-size:11px;font-weight:900;letter-spacing:0.08em;text-transform:uppercase;color:#B0A96F">${escapeHtml(v.quizName)}</div>
      <div style="font-size:13px;font-weight:900;color:#6F6259">${escapeHtml(v.posLabel)}</div>
    </div>
    <div style="height:4px;border-radius:999px;background:rgba(60,60,60,0.13);overflow:hidden"><div style="height:100%;width:${v.pct};background:#449AC2;border-radius:999px"></div></div>
  </div>
  <div style="flex:1;padding:0 16px;display:flex;min-height:0">
    <div style="flex:1;position:relative;background:#FFFFFF;border-radius:20px;border:0.5px solid rgba(60,60,60,0.13);padding:16px;display:flex;flex-direction:column;user-select:none;overflow:hidden;cursor:${v.cardCursor}">
      <div style="position:absolute;top:0;left:0;bottom:0;width:${v.fillPct};background:rgba(68,154,194,0.12);border-top-left-radius:20px;border-bottom-left-radius:20px"></div>
      <div style="position:relative;height:36px;flex:none;display:flex;align-items:center;justify-content:flex-end">${addBtn}</div>
      <div style="position:relative;flex:1;min-height:0;overflow-y:auto;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;padding:8px 0;width:100%">${bodyContent(v, false)}</div>
      <div style="position:relative;height:44px;flex:none;display:flex;align-items:center;justify-content:center;gap:8px">
        ${helpBtn}
        <button type="button" style="position:absolute;right:0;display:flex;align-items:center;justify-content:center;width:44px;height:44px;border-radius:999px;border:none;background:rgba(68,154,194,0.12);color:#449AC2;cursor:default"><i class="ti ${v.playIcon}" style="font-size:22px"></i></button>
      </div>
    </div>
  </div>
  <div style="flex:none;padding:12px 16px 16px;display:flex;flex-direction:column;gap:8px">
    <button type="button" style="height:52px;display:flex;align-items:center;justify-content:center;gap:8px;border-radius:10px;border:none;background:#449AC2;color:#FFFFFF;font-family:inherit;font-size:16px;font-weight:900;cursor:default">${escapeHtml(v.primary)}<i class="ti ti-chevron-right" style="font-size:18px"></i></button>
    <div style="display:flex;gap:8px">
      <button type="button" style="flex:1;height:44px;display:flex;align-items:center;justify-content:center;gap:6px;border-radius:10px;border:1.5px solid #449AC2;background:transparent;color:#449AC2;font-family:inherit;font-size:14px;font-weight:900;cursor:default"><i class="ti ti-rotate" style="font-size:16px"></i>${escapeHtml(v.replayLabel)}</button>
    </div>
    <div style="display:flex;gap:8px">
      <button type="button" style="flex:1;height:44px;display:flex;align-items:center;justify-content:center;gap:6px;border-radius:10px;border:1.5px solid rgba(60,60,60,0.25);background:transparent;color:#3C3C3C;font-family:inherit;font-size:14px;font-weight:900;cursor:default"><i class="ti ti-chevron-left" style="font-size:16px"></i>Previous card</button>
      <button type="button" style="flex:1;height:44px;display:flex;align-items:center;justify-content:center;gap:6px;border-radius:10px;border:1.5px solid rgba(60,60,60,0.25);background:transparent;color:#3C3C3C;font-family:inherit;font-size:14px;font-weight:900;cursor:default">Next card<i class="ti ti-chevron-right" style="font-size:16px"></i></button>
    </div>
  </div>
</div>`;
}

function desktopFrame(label, opts) {
  const v = view(opts);
  const addBtn = v.isAnswer
    ? `<button type="button" style="display:flex;align-items:center;gap:6px;padding:8px 12px;border-radius:10px;border:1.5px solid ${v.addBd};background:${v.addBg};color:${v.addFg};font-family:inherit;font-size:13px;font-weight:900;cursor:default"><i class="ti ${v.addIcon}" style="font-size:18px"></i>${escapeHtml(v.addLabel)}</button>`
    : '';
  const helpBtn = v.isAnswer
    ? `<button type="button" style="height:40px;padding:0 14px;display:inline-flex;align-items:center;gap:6px;border-radius:10px;border:1.5px solid #449AC2;background:transparent;color:#449AC2;font-family:inherit;font-size:14px;font-weight:900;cursor:default"><i class="ti ${v.helpIcon}" style="font-size:16px"></i>${escapeHtml(v.helpLabel)}</button>`
    : '';
  return `<div style="width:1240px;height:760px;background:#F0EDE6;border-radius:20px;border:0.5px solid rgba(60,60,60,0.13);overflow:hidden;display:flex;flex-direction:column;color:#3C3C3C" data-screen-label="${label}">
  ${desktopHeader()}
  <div style="flex:1;min-height:0;padding:24px;display:flex;flex-direction:column;align-items:center;gap:20px">
    <div style="width:100%;max-width:860px;display:flex;flex-direction:column;gap:10px">
      <div style="display:flex;align-items:baseline;justify-content:space-between;gap:16px">
        <div style="font-size:11px;font-weight:900;letter-spacing:0.08em;text-transform:uppercase;color:#B0A96F">${escapeHtml(v.quizName)}</div>
        <div style="font-size:16px;font-weight:900;color:#6F6259">${escapeHtml(v.posLabel)}</div>
      </div>
      <div style="height:4px;border-radius:999px;background:rgba(60,60,60,0.13);overflow:hidden"><div style="height:100%;width:${v.pct};background:#449AC2;border-radius:999px"></div></div>
    </div>
    <div style="width:100%;max-width:860px;flex:1;min-height:0;display:flex">
      <div style="flex:1;position:relative;background:#FFFFFF;border-radius:20px;border:0.5px solid rgba(60,60,60,0.13);padding:20px;display:flex;flex-direction:column;user-select:none;overflow:hidden;cursor:${v.cardCursor}">
        <div style="position:absolute;top:0;left:0;bottom:0;width:${v.fillPct};background:rgba(68,154,194,0.12);border-top-left-radius:20px;border-bottom-left-radius:20px"></div>
        <div style="position:relative;height:40px;flex:none;display:flex;align-items:center;justify-content:flex-end">${addBtn}</div>
        <div style="position:relative;flex:1;min-height:0;overflow-y:auto;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;padding:8px 0;width:100%">${bodyContent(v, true)}</div>
        <div style="position:relative;height:44px;flex:none;display:flex;align-items:center;justify-content:center;gap:8px">
          ${helpBtn}
          <button type="button" style="position:absolute;right:0;display:flex;align-items:center;justify-content:center;width:44px;height:44px;border-radius:999px;border:none;background:rgba(68,154,194,0.12);color:#449AC2;cursor:default"><i class="ti ${v.playIcon}" style="font-size:22px"></i></button>
        </div>
      </div>
    </div>
    <div style="width:100%;max-width:860px;flex:none;display:flex;flex-direction:column;gap:8px">
      <div style="display:flex;gap:8px">
        <button type="button" style="width:220px;height:52px;display:flex;align-items:center;justify-content:center;gap:6px;border-radius:10px;border:1.5px solid #449AC2;background:transparent;color:#449AC2;font-family:inherit;font-size:14px;font-weight:900;cursor:default"><i class="ti ti-rotate" style="font-size:16px"></i>${escapeHtml(v.replayLabel)}</button>
        <button type="button" style="flex:1;height:52px;display:flex;align-items:center;justify-content:center;gap:8px;border-radius:10px;border:none;background:#449AC2;color:#FFFFFF;font-family:inherit;font-size:16px;font-weight:900;cursor:default">${escapeHtml(v.primary)}<i class="ti ti-chevron-right" style="font-size:18px"></i></button>
      </div>
      <div style="display:flex;align-items:center;justify-content:space-between;gap:12px">
        <div style="display:flex;gap:8px">
          <button type="button" style="height:40px;padding:0 14px;display:flex;align-items:center;justify-content:center;gap:6px;border-radius:10px;border:1.5px solid rgba(60,60,60,0.25);background:transparent;color:#3C3C3C;font-family:inherit;font-size:14px;font-weight:900;cursor:default"><i class="ti ti-chevron-left" style="font-size:16px"></i>Previous card</button>
          <button type="button" style="height:40px;padding:0 14px;display:flex;align-items:center;justify-content:center;gap:6px;border-radius:10px;border:1.5px solid rgba(60,60,60,0.25);background:transparent;color:#3C3C3C;font-family:inherit;font-size:14px;font-weight:900;cursor:default">Next card<i class="ti ti-chevron-right" style="font-size:16px"></i></button>
        </div>
        <div style="display:flex;align-items:center;gap:8px;font-size:13px;color:#6F6259">
          <span style="display:inline-flex;align-items:center;gap:6px"><kbd style="min-width:26px;height:24px;padding:0 6px;display:inline-flex;align-items:center;justify-content:center;border-radius:6px;border:0.5px solid rgba(60,60,60,0.25);background:#FFFFFF;font-family:inherit;font-size:12px;font-weight:900">space</kbd> play / pause</span>
          <span>·</span>
          <span style="display:inline-flex;align-items:center;gap:6px"><kbd style="min-width:26px;height:24px;padding:0 6px;display:inline-flex;align-items:center;justify-content:center;border-radius:6px;border:0.5px solid rgba(60,60,60,0.25);background:#FFFFFF;font-family:inherit;font-size:12px;font-weight:900">↑</kbd> next step</span>
          <span>·</span>
          <span style="display:inline-flex;align-items:center;gap:6px"><kbd style="min-width:26px;height:24px;padding:0 6px;display:inline-flex;align-items:center;justify-content:center;border-radius:6px;border:0.5px solid rgba(60,60,60,0.25);background:#FFFFFF;font-family:inherit;font-size:12px;font-weight:900">←</kbd><kbd style="min-width:26px;height:24px;padding:0 6px;display:inline-flex;align-items:center;justify-content:center;border-radius:6px;border:0.5px solid rgba(60,60,60,0.25);background:#FFFFFF;font-family:inherit;font-size:12px;font-weight:900">→</kbd> card</span>
        </div>
      </div>
    </div>
  </div>
</div>`;
}

function completeAutoplay() {
  return `<div style="width:390px;height:780px;background:#F0EDE6;border-radius:20px;border:0.5px solid rgba(60,60,60,0.13);overflow:hidden;display:flex;flex-direction:column;color:#3C3C3C" data-screen-label="Audio-complete-autoplay">
  ${mobileHeader()}
  <div style="flex:1;padding:20px 16px;display:flex;flex-direction:column;justify-content:center;gap:16px">
    <div style="background:#FFFFFF;border-radius:14px;padding:20px;display:flex;flex-direction:column;gap:14px">
      <div style="font-size:11px;font-weight:900;letter-spacing:0.08em;text-transform:uppercase;color:#B0A96F">Speaking quiz</div>
      <div style="font-size:22px;font-weight:900;line-height:1.25">20 cards drilled.</div>
      <div style="font-size:15px;line-height:1.6;color:#6F6259;text-wrap:pretty">You worked through lessons 1–111. Nothing is graded in an audio quiz — the deck stays as it was.</div>
      <div style="display:flex;flex-direction:column;gap:8px;padding-top:14px;border-top:0.5px solid rgba(60,60,60,0.13)">
        <div style="display:flex;align-items:center;gap:8px;font-size:15px;font-weight:900;color:#449AC2"><i class="ti ti-clock" style="font-size:18px"></i>Restarting in 14s</div>
        <div style="height:4px;border-radius:999px;background:rgba(60,60,60,0.13);overflow:hidden"><div style="height:100%;width:70%;background:#449AC2;border-radius:999px"></div></div>
      </div>
      <button type="button" style="height:52px;display:flex;align-items:center;justify-content:center;gap:8px;border-radius:10px;border:none;background:#449AC2;color:#FFFFFF;font-family:inherit;font-size:16px;font-weight:900;cursor:default">Restart now</button>
      <button type="button" style="height:44px;display:flex;align-items:center;justify-content:center;border-radius:10px;border:1.5px solid #449AC2;background:transparent;color:#449AC2;font-family:inherit;font-size:15px;font-weight:900;cursor:default">Return to quiz setup</button>
    </div>
    <div style="background:#1C2232;border-radius:14px;padding:16px;color:#FFFFFF;display:flex;flex-direction:column;gap:6px">
      <div style="font-size:11px;font-weight:900;letter-spacing:0.08em;text-transform:uppercase;color:#B0A96F">Skipped this run</div>
      <div style="font-size:14px;line-height:1.5;color:rgba(255,255,255,0.80)">1 card was dropped because its audio would not load. It stays in your deck.</div>
    </div>
  </div>
</div>`;
}

function completeManual() {
  return `<div style="width:390px;height:780px;background:#F0EDE6;border-radius:20px;border:0.5px solid rgba(60,60,60,0.13);overflow:hidden;display:flex;flex-direction:column;color:#3C3C3C" data-screen-label="Audio-complete-manual">
  ${mobileHeader()}
  <div style="flex:1;padding:20px 16px;display:flex;flex-direction:column;justify-content:center;gap:16px">
    <div style="background:#FFFFFF;border-radius:14px;padding:20px;display:flex;flex-direction:column;gap:14px">
      <div style="font-size:11px;font-weight:900;letter-spacing:0.08em;text-transform:uppercase;color:#B0A96F">Listening quiz</div>
      <div style="font-size:22px;font-weight:900;line-height:1.25">20 cards drilled.</div>
      <div style="font-size:15px;line-height:1.6;color:#6F6259;text-wrap:pretty">Autoplay was off, so nothing restarts on its own. Run the same deck again, or change the settings.</div>
      <button type="button" style="height:52px;display:flex;align-items:center;justify-content:center;gap:8px;border-radius:10px;border:none;background:#449AC2;color:#FFFFFF;font-family:inherit;font-size:16px;font-weight:900;cursor:default">Run this deck again</button>
      <button type="button" style="height:44px;display:flex;align-items:center;justify-content:center;border-radius:10px;border:1.5px solid #449AC2;background:transparent;color:#449AC2;font-family:inherit;font-size:15px;font-weight:900;cursor:default">Return to quiz setup</button>
    </div>
    <div style="background:#FFFFFF;border-radius:14px;padding:16px;display:flex;flex-direction:column;gap:10px">
      <div style="font-size:11px;font-weight:900;letter-spacing:0.08em;text-transform:uppercase;color:#B0A96F">Added while quizzing</div>
      <div style="font-size:15px;font-weight:900">3 flashcards</div>
      <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;font-size:14px;color:#6F6259;cursor:default">Review them in my flashcards<i class="ti ti-chevron-right" style="font-size:18px"></i></div>
    </div>
  </div>
</div>`;
}

/** Capture matrix — labels must match specimen states.json. */
const STATES = [
  {
    label: 'Audio-mobile-speaking-auto-question',
    form: 'mobile',
    opts: {
      type: 'speaking',
      auto: true,
      step: 0,
      playing: true,
      fill: 0,
      idx: 12,
      help: false,
      added: false,
      word: null,
    },
  },
  {
    label: 'Audio-mobile-speaking-auto-guess',
    form: 'mobile',
    opts: {
      type: 'speaking',
      auto: true,
      step: 1,
      playing: true,
      fill: 42,
      idx: 12,
      help: false,
      added: false,
      word: null,
    },
  },
  {
    label: 'Audio-mobile-speaking-auto-audio-answer',
    form: 'mobile',
    opts: {
      type: 'speaking',
      auto: true,
      step: 2,
      playing: true,
      fill: 0,
      idx: 12,
      help: false,
      added: false,
      word: null,
    },
  },
  {
    label: 'Audio-mobile-speaking-auto-answer',
    form: 'mobile',
    opts: {
      type: 'speaking',
      auto: true,
      step: 3,
      playing: false,
      fill: 0,
      idx: 12,
      help: false,
      added: false,
      word: null,
    },
  },
  {
    label: 'Audio-mobile-speaking-auto-answer-help',
    form: 'mobile',
    opts: {
      type: 'speaking',
      auto: true,
      step: 3,
      playing: false,
      fill: 0,
      idx: 12,
      help: true,
      added: false,
      word: null,
    },
  },
  {
    label: 'Audio-mobile-speaking-auto-answer-help-word',
    form: 'mobile',
    opts: {
      type: 'speaking',
      auto: true,
      step: 3,
      playing: false,
      fill: 0,
      idx: 12,
      help: true,
      added: false,
      word: 'sepan',
    },
  },
  {
    label: 'Audio-mobile-listening-manual-question',
    form: 'mobile',
    opts: {
      type: 'listening',
      auto: false,
      step: 0,
      playing: true,
      fill: 0,
      idx: 12,
      help: false,
      added: false,
      word: null,
    },
  },
  {
    label: 'Audio-mobile-listening-manual-answer-added',
    form: 'mobile',
    opts: {
      type: 'listening',
      auto: false,
      step: 3,
      playing: false,
      fill: 0,
      idx: 12,
      help: false,
      added: true,
      word: null,
    },
  },
  {
    label: 'Audio-desktop-listening-manual-answer-help-word',
    form: 'desktop',
    opts: {
      type: 'listening',
      auto: false,
      step: 3,
      playing: false,
      fill: 0,
      idx: 12,
      help: true,
      added: true,
      word: 'sepan',
    },
  },
  {
    label: 'Audio-desktop-speaking-auto-guess',
    form: 'desktop',
    opts: {
      type: 'speaking',
      auto: true,
      step: 1,
      playing: true,
      fill: 42,
      idx: 12,
      help: false,
      added: false,
      word: null,
    },
  },
  {
    label: 'Audio-desktop-speaking-answer',
    form: 'desktop',
    opts: {
      type: 'speaking',
      auto: false,
      step: 3,
      playing: false,
      fill: 0,
      idx: 12,
      help: false,
      added: false,
      word: null,
    },
  },
  {
    label: 'Audio-desktop-listening-manual-question',
    form: 'desktop',
    opts: {
      type: 'listening',
      auto: false,
      step: 0,
      playing: true,
      fill: 0,
      idx: 12,
      help: false,
      added: false,
      word: null,
    },
  },
];

const frames = STATES.map((s) =>
  s.form === 'mobile'
    ? mobileFrame(s.label, s.opts)
    : desktopFrame(s.label, s.opts),
);

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Audio Quiz Redesign — frozen gauntlet bar</title>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@3.6.0/dist/tabler-icons.min.css">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@400;500;900&display=swap" rel="stylesheet">
<style>
  body{margin:0;padding:40px;background:#E7E3D9;-webkit-font-smoothing:antialiased;font-family:'Nunito Sans','Helvetica Neue',Helvetica,Arial,sans-serif;color:#3C3C3C}
  *{box-sizing:border-box}
  h1{font-size:18px;font-weight:900;margin:0 0 8px}
  .note{font-size:13px;line-height:1.6;color:#6F6259;max-width:72ch;margin:0 0 24px}
  .row{display:flex;flex-wrap:wrap;gap:40px;align-items:flex-start}
  .cap{font-size:12px;color:#6F6259;text-align:center;margin-top:8px}
</style>
</head>
<body>
<h1>Audio Quiz Redesign — frozen expanded bar</h1>
<p class="note">Generated by <code>generate.mjs</code> from the handoff markup/tokens. Animation frozen. Mid-progress autoplay fill kept at 42% on guess frames. First child of every frame is the blue app header (capture-bar strips it).</p>
<div class="row">
${frames
  .map((f, i) => `<div><div class="cap">${STATES[i].label}</div>${f}</div>`)
  .join('\n')}
${completeAutoplay()}
${completeManual()}
</div>
</body>
</html>
`;

fs.writeFileSync(OUT, html, 'utf8');
console.log(`Wrote ${OUT}`);
console.log(`Frames: ${STATES.length + 2}`);
