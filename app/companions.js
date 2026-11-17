// Distinct vector silhouettes, available without downloads or an external image service.
const faces = (skin = '#efbb91') => `<ellipse cx="160" cy="124" rx="48" ry="51" fill="${skin}"/><path d="M141 119v7m38-7v7" stroke="#303d45" stroke-width="6" stroke-linecap="round"/><path d="M150 144q10 10 20 0" fill="none" stroke="#754a45" stroke-width="4" stroke-linecap="round"/><ellipse cx="130" cy="136" rx="8" ry="4" fill="#eaa398"/><ellipse cx="190" cy="136" rx="8" ry="4" fill="#eaa398"/>`;
const art = {
  unicorn: `<path d="M222 215q73-49 58 12-4 21-28 25 19-23-5-14l-27 17" fill="#b790c7"/><path d="M110 233v68q8 15 24 0l9-60m48 0 2 60q11 15 25 0l10-80" fill="#fffaf4" stroke="#bba8c9" stroke-width="4"/><path d="M108 295h26v15h-26zm85 0h25v15h-25z" fill="#b790c7"/><ellipse cx="169" cy="217" rx="67" ry="48" fill="#fffaf4" stroke="#bba8c9" stroke-width="4"/><path d="M107 208q-31-63 1-112 25-32 65-15 22 11 24 43l-20 100" fill="#fffaf4" stroke="#bba8c9" stroke-width="4"/><path d="M164 92q41 8 43 49-23-18-14 12 16 37-9 63-15-29-5-50-19 11-21-13" fill="#b790c7"/><path d="m124 83 20-55 8 62" fill="#ebc46b" stroke="#b89349" stroke-width="3"/><path d="m108 101-7-43q31 4 31 32" fill="#fffaf4" stroke="#bba8c9" stroke-width="4"/><path d="m110 89-3-18 14 16" fill="#e9b9ce"/><path d="M117 111q-44 3-47 33 2 34 44 31 27-1 34-25" fill="#fffaf4" stroke="#bba8c9" stroke-width="4"/><ellipse cx="83" cy="148" rx="4" ry="5" fill="#7c6b8b"/><path d="M131 115q9 10 18-1" fill="none" stroke="#493e55" stroke-width="4" stroke-linecap="round"/><path d="M92 163q9 5 17 0" fill="none" stroke="#a57b91" stroke-width="3" stroke-linecap="round"/><path d="m175 205 7-12 7 12 12 5-12 6-7 12-7-12-12-6z" fill="#ebc46b"/>`,
  knight: `<path d="M115 172q-37 41-41 118l52-14 74 18 41-6q-7-78-43-116" fill="#6e9ba6"/><path d="m130 266-7 45h30l9-44m19 0 8 44h31l-17-47" fill="#7f969d" stroke="#526b75" stroke-width="4"/><path d="M114 183q-25 10-25 56l29 9m84-65q27 12 27 51l-26 12" fill="#bdccd0" stroke="#526b75" stroke-width="4"/><rect x="112" y="165" width="96" height="111" rx="25" fill="#d3dfe0" stroke="#526b75" stroke-width="4"/><path d="M160 179v78m-40-27h80" stroke="#9aadb0" stroke-width="4"/>${faces('#dfab80')}<path d="M104 110V93q1-51 56-52 56 2 57 52v20l-21-17q-37-14-71 0z" fill="#c9d9dc" stroke="#526b75" stroke-width="4"/><path d="M160 45V24q35-5 46 22-22-7-46 9" fill="#d1a957"/><path d="M104 110v35l14 20 9-58m89 2v34l-15 23-8-59" fill="#a9c0c5" stroke="#526b75" stroke-width="4"/><path d="m92 208 48 8v53q-22 27-46 29-26-17-30-44v-36z" fill="#3c7486" stroke="#d5b86c" stroke-width="5"/><path d="m102 235 5 10 11 2-8 8 2 11-10-5-10 5 2-11-8-8 11-2z" fill="#f0d58a"/>`,
  princess: `<path d="M102 130q-11-61 33-77 44-17 76 20 15 23 8 61l14 70-136 4z" fill="#633f42"/><path d="M127 185 84 303q74 31 152 0l-43-118" fill="#be7187" stroke="#8a4d69" stroke-width="4"/><path d="m160 218-28 96q29 9 56 0z" fill="#edd3cc"/><path d="M119 178q-28 12-30 57l27 9m85-66q27 12 30 57l-27 9" fill="#db9daf"/><path d="M122 172q37-17 76 0l-6 53q-33 16-65 0z" fill="#db9daf" stroke="#8a4d69" stroke-width="3"/>${faces('#b87857')}<path d="M109 104q4-50 53-48 47 1 50 48-40-1-61-26-16 23-42 26" fill="#633f42"/><path d="m126 64-8-36 27 17 16-27 17 27 26-17-8 36z" fill="#e6bd62" stroke="#b08c42" stroke-width="3"/><circle cx="161" cy="48" r="6" fill="#8a4d69"/><path d="M109 227q23-7 50 7 27-14 51-7v47q-29-6-51 8-26-14-50-8z" fill="#fff7e4" stroke="#9c7247" stroke-width="4"/><path d="M159 235v46m-39-41 25 4m-25 9 25 4m27-13 25-4m-25 17 25-4" stroke="#b99a70" stroke-width="3"/>`,
  pirate: `<path d="m128 265-10 47h32l12-44m17 0 9 44h33l-19-49" fill="#394d5a"/><path d="M111 180q-24 15-28 54l25 15m96-69q24 14 29 56l-25 13" fill="#efc39b"/><rect x="111" y="170" width="97" height="104" rx="26" fill="#fff5df" stroke="#755444" stroke-width="3"/><path d="M115 202h88m-89 24h90m-84 24h78" stroke="#bf7354" stroke-width="12"/><path d="M113 175h22v94h-22m73-94h20v94h-20" fill="#3e5963"/>${faces('#efc39b')}<path d="M110 91q4-42 50-42 41 1 54 42" fill="#7b4c32"/><path d="M86 95q5-37 37-34 36-58 72 0 34-5 40 34-77 28-149 0" fill="#3b535d" stroke="#263d45" stroke-width="4"/><path d="M93 94q66 21 134 0" fill="none" stroke="#d7af60" stroke-width="5"/><path d="M157 62v15m-7-7h15" stroke="#f5e7c4" stroke-width="5" stroke-linecap="round"/><path d="m112 103 96 24" stroke="#4b4141" stroke-width="5"/><path d="M168 115h24v13q-12 18-24 0z" fill="#364953"/><path d="M103 163q14-11 28 0l-14 25-17-5" fill="#c27653"/><circle cx="218" cy="250" r="26" fill="#edd496" stroke="#94723b" stroke-width="4"/><path d="m218 233 8 17-8 17-8-17z" fill="#426775"/>`
};
export function companionArt(companion, big = false, mood = 'neutral') {
  const state = ['neutral', 'guide', 'support', 'cheer'].includes(mood) ? mood : 'neutral';
  let character = art[companion.id] || art.unicorn;
  if (state === 'cheer') {
    character = character.replace('M141 119v7m38-7v7', 'M134 123q7-12 14 0m24 0q7-12 14 0')
      .replace('d="M150 144q10 10 20 0" fill="none"', 'd="M147 141q13 25 27 0Z" fill="#754a45"')
      .replace('d="M92 163q9 5 17 0" fill="none"', 'd="M90 160q11 17 22 0Z" fill="#a57b91"');
  }
  const cues = {
    neutral: '',
    guide: '<g fill="none" stroke="#6b8773" stroke-width="4" stroke-linecap="round"><path d="M240 52h43q12 0 12 12v31q0 12-12 12h-26l-17 12v-12q-12 0-12-12V64q0-12 12-12Z" fill="#fffaf4"/><path d="M246 75v12m12-20v28m12-24v20m12-14v8"/></g>',
    support: '<path d="M238 69c-18-20-42 9-22 28l22 19 22-19c20-19-4-48-22-28Z" fill="#e6c6bc" stroke="#ab7c72" stroke-width="3"/>',
    cheer: '<g fill="#dfb65d"><path d="m66 54 7 17 18 1-14 12 4 18-15-10-15 10 4-18-14-12 18-1Z"/><path d="m255 69 6 13 14 2-10 10 2 14-12-7-12 7 2-14-10-10 14-2Z"/></g>'
  };
  return `<svg class="hero-art ${big ? 'big' : ''} companion-${state}" viewBox="0 0 320 350" role="img" aria-label="${companion.name}, ${companion.title.toLowerCase()}"><ellipse cx="160" cy="327" rx="80" ry="12" fill="currentColor" opacity=".08"/><g class="companion-character">${character}</g>${cues[state]}</svg>`;
}
export function navigationPicture(kind) {
  const paths = {
    'game-choice': '<rect x="8" y="19" width="37" height="57" rx="8"/><rect x="54" y="25" width="38" height="57" rx="8"/><text x="26" y="57" fill="currentColor" stroke="none" font-size="30" font-family="sans-serif" text-anchor="middle">a</text><text x="73" y="60" fill="currentColor" stroke="none" font-size="21" font-family="sans-serif" text-anchor="middle">ma</text>',
    challenge: '<path d="M15 80V60h23V42h23V24h24v56zM70 24V10m0 0h15l-5 6H70"/>',
    difficulty: '<path d="M17 32h28M59 68h28M73 54v28"/>',
    success: '<circle cx="50" cy="50" r="35"/><path d="m29 50 14 14 29-29"/>',
    retry: '<path d="M77 36a32 32 0 1 0 1 30M77 16v23H54"/>',
    sounds: '<path d="M53 65c0-15 20-15 20-32 0-23-36-27-43-6m9 20c0-18 23-21 22-11-1 8-13 8-13 20M28 33c-9 15-1 20-2 31 0 10 13 16 20 8"/>',
    words: '<rect x="17" y="24" width="66" height="54" rx="12"/><path d="m31 62 10-24 10 24m-16-9h12m16-16v25m0-15c20-7 19 20 0 13"/>',
    clues: '<circle cx="44" cy="42" r="22"/><path d="m61 59 21 22M35 43l7 7 12-15"/>',
    stories: '<path d="M50 29c-11-9-24-12-36-7v52c13-5 25-2 36 7 11-9 23-12 36-7V22c-12-5-25-2-36 7zm0 0v52M25 37l14 4m-14 9 14 4m22-13 14-4m-14 17 14-4"/>',
    play: '<path d="m36 22 43 28-43 28z" fill="currentColor" stroke-linejoin="round"/>',
    home: '<path d="m15 45 35-29 35 29M24 39v43h19V60h14v22h19V39"/>',
    help: '<path d="M34 57c-22-25-7-43 16-43s38 18 16 43l-5 9H39zM40 77h20m-17 9h14M50 3v-9M16 13l-8-7m76 7 8-7"/>',
    arrow: '<path d="M15 50h66M57 24l26 26-26 26"/>',
    pause: '<path d="M35 24v52m30-52v52"/>',
    sound: '<path d="m48 23-20 16H14v23h14l20 16zm14 12q19 15 0 30m14-43q30 28 0 56"/>'
  };
  return `<svg class="nav-picture" viewBox="0 0 100 100" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">${paths[kind] || paths.stories}</svg>`;
}
