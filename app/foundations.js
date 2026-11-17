export const beginnerStages = [
  { label: 'Les lettres', picture: 'a', spoken: 'On regarde une seule lettre. Puis on retrouve la même.', description: 'Reconnaître une lettre parmi deux choix.' },
  { label: 'Les sons', picture: 'a ♪', spoken: 'On écoute un son. Puis on retrouve sa lettre.', description: 'Associer les sons des voyelles à leurs lettres.' },
  { label: 'Les syllabes', picture: 'ma', spoken: 'On écoute une petite syllabe. Puis on la retrouve.', description: 'Reconnaître des syllabes simples : ma, mi, la et li.' },
  { label: 'On assemble', picture: 'ma + mi', spoken: 'On met deux syllabes ensemble pour former un petit mot.', description: 'Assembler deux syllabes familières, sans geste précis.' }
];
const visual = (letter, distractor, index) => ({
  id: `f0-${index + 1}`, type: 'letter_match', instruction: 'Regarde la lettre. Retrouve la même.', text: letter,
  options: index % 2 ? [distractor, letter] : [letter, distractor], answer: index % 2,
  hint: 'Regarde la forme de la lettre en grand. Cherche exactement la même forme.', visualAids: false, foundation: true
});
const listen = (stage, target, distractor, index) => ({
  id: `f${stage}-${index + 1}`, type: stage === 1 ? 'vowel_sound' : 'simple_syllable',
  instruction: stage === 1 ? 'Écoute le son. Touche sa lettre.' : 'Écoute la syllabe. Retrouve-la.', text: '', listen: target,
  options: index % 2 ? [distractor, target] : [target, distractor], answer: index % 2,
  hint: stage === 1 ? `Écoute encore : ${target}. La lettre entourée fait ce son.` : `Écoute encore : ${target}. Regarde la syllabe entourée.`,
  visualAids: false, foundation: true
});
export const beginnerBanks = [
  [['a','o'],['i','m'],['o','s'],['u','a'],['m','i'],['l','o'],['s','u'],['f','a']].map(([a,b],i) => visual(a,b,i)),
  [['a','i'],['i','o'],['o','u'],['u','a'],['a','o'],['i','u'],['o','a'],['u','i']].map(([a,b],i) => listen(1,a,b,i)),
  [['ma','mi'],['mi','ma'],['la','li'],['li','la'],['mo','ma'],['lo','la'],['mu','mi'],['lu','li']].map(([a,b],i) => listen(2,a,b,i)),
  [
    { parts: ['pa','pa'], word: 'papa', other: 'pi' },
    { parts: ['pa','pi'], word: 'papi', other: 'ma' },
    { parts: ['a','mi'], word: 'ami', other: 'la' },
    { parts: ['la','ma'], word: 'lama', other: 'mi' },
    { parts: ['mo','to'], word: 'moto', other: 'ta' },
    { parts: ['mi','di'], word: 'midi', other: 'mi' },
    { parts: ['vé','lo'], word: 'vélo', other: 'li' },
    { parts: ['bé','bé'], word: 'bébé', other: 'mo' }
  ].map((item, index) => ({
    id: `f3-${index + 1}`, type: 'syllable_assembly', instruction: 'Écoute le mot. Ajoute la syllabe qui manque.',
    text: `${item.parts[0]} + …`, options: index % 2 ? [item.other,item.parts[1]] : [item.parts[1],item.other], answer: index % 2,
    listen: item.word, hint: `${item.parts[0]}, puis ${item.parts[1]}. Ensemble : ${item.word}.`,
    modelParts: item.parts, visualAids: false, foundation: true
  }))
];


// Vary the gesture while keeping the same letters and the same difficulty.
for (const index of [2, 5]) {
  const question = beginnerBanks[0][index];
  question.mechanic = 'pairs';
  question.pairs = [...question.options];
  question.pairOrder = [1, 0];
  question.text = '';
  question.instruction = 'Touche une lettre à gauche. Puis touche la même à droite.';
  question.hint = 'Regarde la lettre choisie à gauche. Retrouve la même forme à droite.';
}
for (const index of [2, 3, 6, 7]) {
  const question = beginnerBanks[2][index];
  question.mechanic = 'build';
  question.unit = 'letters';
  question.parts = [...question.listen];
  question.tiles = [...question.parts].reverse();
  question.text = question.parts.join(' + ');
  question.instruction = 'Écoute la syllabe. Touche les lettres dans le même ordre que le modèle.';
  question.hint = 'Commence par la première lettre du modèle. Puis ajoute la deuxième.';
  question.requiresAudio = false;
}
for (const question of beginnerBanks[3]) {
  question.mechanic = 'build';
  question.unit = 'syllables';
  question.parts = [...question.modelParts];
  question.tiles = [...question.parts].reverse();
  question.text = '';
  question.instruction = 'Écoute le mot. Touche les syllabes dans l’ordre pour le construire.';
  question.hint = question.parts.join(', puis ') + '. Ensemble : ' + question.listen + '.';
}


// A second set at the same structural difficulty keeps later missions fresh.
const letterVariants = [['a','u'],['i','s'],['o','m'],['u','l'],['m','a'],['l','s'],['s','i'],['f','o']];
for (const [index, [letter, distractor]] of letterVariants.entries()) {
  const question = visual(letter, distractor, index);
  question.id = `f0-${index + 9}`;
  if ([2,5].includes(index)) Object.assign(question, { mechanic:'pairs', pairs:[...question.options], pairOrder:[1,0], text:'', instruction:'Touche une lettre à gauche. Puis touche la même à droite.', hint:'Regarde la lettre choisie à gauche. Retrouve la même forme à droite.' });
  beginnerBanks[0].push(question);
}
for (const [index, [target,distractor]] of [['a','u'],['i','a'],['o','i'],['u','o'],['a','i'],['i','o'],['o','u'],['u','a']].entries()) {
  beginnerBanks[1].push({ ...listen(1,target,distractor,index), id:`f1-${index + 9}` });
}
for (const [index, [target,distractor]] of [['ma','la'],['mi','li'],['la','ma'],['li','mi'],['mo','lo'],['lo','mo'],['mu','lu'],['lu','mu']].entries()) {
  const question = { ...listen(2,target,distractor,index), id:`f2-${index + 9}` };
  if ([2,3,6,7].includes(index)) Object.assign(question, { mechanic:'build', unit:'letters', parts:[...target], tiles:[...target].reverse(), text:[...target].join(' + '), instruction:'Écoute la syllabe. Touche les lettres dans le même ordre que le modèle.', hint:'Commence par la première lettre du modèle. Puis ajoute la deuxième.', requiresAudio:false });
  beginnerBanks[2].push(question);
}
for (const [index, parts] of [['po','lo'],['lo','to'],['po','li'],['ra','vi'],['jo','li'],['sa','li'],['pu','ni'],['fi','ni']].entries()) {
  const word = parts.join('');
  beginnerBanks[3].push({ id:`f3-${index + 9}`, type:'syllable_assembly', instruction:'Écoute le mot. Touche les syllabes dans l’ordre pour le construire.', text:'', options:[parts[1],parts[0]], answer:0, listen:word, hint:parts.join(', puis ') + '. Ensemble : ' + word + '.', modelParts:[...parts], parts:[...parts], tiles:[...parts].reverse(), unit:'syllables', mechanic:'build', visualAids:false, foundation:true });
}

// Keep f3-1…f3-16 stable so existing saved missions still resume exactly.
// Two explicitly annotated spoken syllables, two cards and the same visible model.
const extraAssemblyWords = [
  ['bo','bo'], ['do','do'], ['tu','tu'], ['mé','mé'], ['pé','pé'],
  ['ma','mie'], ['a','mie'], ['sa','lut'], ['me','nu'], ['te','nu'],
  ['ve','nu'], ['ge','lé'], ['le','vé'], ['la','vé'], ['rô','ti'],
  ['rou','lé'], ['do','ré'], ['ti','ré'], ['no','té'], ['vo','té'],
  ['zé','ro'], ['ké','pi'], ['ki','wi'], ['ju','do'], ['ca','fé'],
  ['dé','fi'], ['é','té'], ['é','pi'], ['é','pée'], ['a','vis'],
  ['dé','jà'], ['bâ','ti'], ['pa','ri'], ['pa','ré'], ['ta','pi'],
  ['ma','ri'], ['râ','pé'], ['ri','dé'], ['fa','né'], ['fu','mé'],
  ['pa','vé'], ['tê','tu'], ['ta','tou'], ['hi','bou']
];
for (const [index,parts] of extraAssemblyWords.entries()) {
  const word = parts.join('');
  beginnerBanks[3].push({
    id:`f3-${index + 17}`, type:'syllable_assembly',
    instruction:'Écoute le mot. Touche les syllabes dans l’ordre pour le construire.',
    text:'', options:[parts[1],parts[0]], answer:0, listen:word,
    hint:parts.join(', puis ') + '. Ensemble : ' + word + '.',
    modelParts:[...parts], parts:[...parts], tiles:[...parts].reverse(),
    unit:'syllables', mechanic:'build', visualAids:false, foundation:true
  });
}

// More simple consonant-vowel syllables, retaining four choices and four builds per mission.
const extraSimpleSyllables = ['ba','bi','bo','bu','pa','pi','po','pu','ta','ti','to','tu','ra','ri','ro','ru','sa','si','so','su','va','vi','fa','fu'];
for (const [index,target] of extraSimpleSyllables.entries()) {
  const vowels = 'aiou';
  const distractor = target[0] + vowels[(vowels.indexOf(target[1])+1)%vowels.length];
  const question = {...listen(2,target,distractor,index),id:`f2-${index+17}`};
  if ([2,3,6,7].includes(index%8)) Object.assign(question,{
    mechanic:'build',unit:'letters',parts:[...target],tiles:[...target].reverse(),
    text:[...target].join(' + '),
    instruction:'Écoute la syllabe. Touche les lettres dans le même ordre que le modèle.',
    hint:'Commence par la première lettre du modèle. Puis ajoute la deuxième.',requiresAudio:false
  });
  beginnerBanks[2].push(question);
}
