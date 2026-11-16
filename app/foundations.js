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
    { parts: ['pa','pa'], word: 'papa', other: 'ma' },
    { parts: ['pi','le'], word: 'pile', other: 'la' },
    { parts: ['lu','ne'], word: 'lune', other: 'mi' },
    { parts: ['mo','to'], word: 'moto', other: 'ta' },
    { parts: ['la','ma'], word: 'lama', other: 'mi' },
    { parts: ['sa','le'], word: 'sale', other: 'li' },
    { parts: ['mi','me'], word: 'mime', other: 'mo' }
  ].map((item, index) => ({
    id: `f3-${index + 1}`, type: 'syllable_assembly', instruction: 'Écoute le mot. Ajoute la syllabe qui manque.',
    text: `${item.parts[0]} + …`, options: index % 2 ? [item.other,item.parts[1]] : [item.parts[1],item.other], answer: index % 2,
    listen: item.word, hint: `${item.parts[0]}, puis ${item.parts[1]}. Ensemble : ${item.word}.`,
    modelParts: item.parts, visualAids: false, foundation: true
  }))
];
