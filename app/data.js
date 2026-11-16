import { beginnerBanks } from './foundations.js';
export const heroes = [
  { id: 'unicorn', name: 'Lumi', title: 'La licorne', color: '#79548d', pale: '#f1eaf4', symbol: '✦', message: 'Un petit mot, une grande découverte !' },
  { id: 'knight', name: 'Arthur', title: 'Le chevalier', color: '#346b7c', pale: '#e6eff1', symbol: '◆', message: 'On essaie ensemble, à ton rythme.' },
  { id: 'princess', name: 'Alma', title: 'La princesse', color: '#98546e', pale: '#f7e9ed', symbol: '♛', message: 'Chaque histoire commence avec toi.' },
  { id: 'pirate', name: 'Malo', title: 'Le pirate', color: '#9b593c', pale: '#f6ece1', symbol: '⚓', message: 'Chaque mot est un petit trésor !' }
];
export const levels = [
  { name: 'Apprenti Décodeur', label: 'Les lettres, pas à pas', icon: '✦', description: 'Je commence par reconnaître une lettre, puis les sons et les syllabes, à mon rythme.' },
  { name: 'Explorateur de Phrases', label: 'Les mots prennent vie', icon: '➜', description: 'Je reconnais les mots et je lis de petites phrases.' },
  { name: 'Détective des Mots', label: 'Les secrets des mots', icon: '⌕', description: 'Je découvre les accords et les familles de mots.' },
  { name: 'Maître des Histoires', label: 'Le sens des histoires', icon: '❝', description: 'Je comprends les récits et je mène l’enquête.' }
];
// Contenus de démonstration : validation pédagogique et enregistrements de phonèmes à produire.
const q = (id, type, instruction, text, options, answer, hint, extra = {}) => ({ id, type, instruction, text, options, answer, hint, ...extra });
export const banks = [
  beginnerBanks[0],
  [
    q('n2-1', 'Les mots familiers', 'Quel mot complète la phrase ?', 'Je lis un livre tous les …', ['jours', 'jardins', 'jouets'], 0, 'On dit « tous les jours ». '),
    q('n2-2', 'Le mot entendu', 'Retrouve le mot que tu entends.', '', ['toujours', 'bonjour', 'beaucoup'], 2, 'Le mot se termine par « coup ».', { listen: 'beaucoup', visualAids: false }),
    q('n2-3', 'Les mots se séparent', 'Quelle phrase est bien séparée ?', 'Lechatdort.', ['Le ch at dort.', 'Le chat dort.', 'Lechat dort.'], 1, 'Il y a trois mots : le, chat et dort.', { visualAids: false }),
    q('n2-4', 'Les mots familiers', 'Quel mot complète la phrase ?', '… matin, le soleil brille.', ['Demain', 'Merci', 'Sous'], 0, 'Cherche un mot qui indique un moment.'),
    q('n2-5', 'Le mot entendu', 'Retrouve le mot que tu entends.', '', ['madame', 'maison', 'monsieur'], 2, 'On peut dire « Bonjour monsieur ».', { listen: 'monsieur', visualAids: false }),
    q('n2-6', 'Les mots se séparent', 'Quelle phrase est bien séparée ?', 'Lunaboitdel’eau.', ['Luna boit de l’eau.', 'Lu na boit de l’eau.', 'Luna boit del’eau.'], 0, 'Le prénom Luna reste entier.', { visualAids: false }),
    q('n2-7', 'Petite lecture', 'Où est le chat ?', 'Le chat dort sur le tapis. Il est bien au chaud.', ['Dans le jardin', 'Sur le tapis', 'Sous le lit'], 1, 'Relis la première phrase.', { ruler: true }),
    q('n2-8', 'Petite lecture', 'Que fait Mila ?', 'Mila ouvre son livre. Elle lit une histoire à son frère.', ['Elle dessine', 'Elle court', 'Elle lit'], 2, 'Le mot « lit » te donne un indice.', { ruler: true })
  ],
  [
    q('n3-1', 'Les accords', 'Choisis le mot qui convient.', 'Les petits … jouent.', ['chat', 'chats', 'chatte'], 1, '« Les » indique plusieurs chats.', { visualAids: false }),
    q('n3-2', 'La famille des mots', 'Quel mot appartient à la famille de jardin ?', 'jardin', ['jardinier', 'jamais', 'jambon'], 0, 'Ce mot désigne une personne qui travaille dans un jardin.', { syllables: ['jar', 'din'] }),
    q('n3-3', 'Les accords', 'Choisis le mot qui convient.', 'Une … fleur pousse.', ['petit', 'petits', 'petite'], 2, 'Fleur est un nom féminin.', { visualAids: false }),
    q('n3-4', 'Les préfixes', 'Quel mot signifie faire encore une lecture ?', 'lire', ['délire', 'relire', 'élire'], 1, 'Le début « re- » signifie ici « encore ». '),
    q('n3-5', 'La famille des mots', 'Quel est l’intrus dans cette famille ?', '', ['terre', 'terrain', 'terrible'], 2, 'Deux de ces mots parlent de la terre.'),
    q('n3-6', 'Les accords', 'Choisis le mot qui convient.', 'Les oiseaux …', ['chantent', 'chante', 'chantes'], 0, 'Il y a plusieurs oiseaux : ils chantent.', { visualAids: false }),
    q('n3-7', 'Les suffixes', 'Quel mot désigne une petite maison ?', 'maison', ['maisonnée', 'maisonnette', 'maçon'], 1, 'Le suffixe « -ette » peut indiquer une petite taille.'),
    q('n3-8', 'Les préfixes', 'Quel mot signifie le contraire de possible ?', 'possible', ['repossible', 'dépossible', 'impossible'], 2, 'On ajoute « im- » au début de possible.')
  ],
  [
    q('n4-1', 'Les indices du récit', 'Où se trouve probablement Lina ?', 'Lina met son bonnet de bain. Elle avance vers le grand bassin.', ['À la piscine', 'À la bibliothèque', 'Au cinéma'], 0, 'Un bassin et un bonnet de bain servent à nager.', { ruler: true }),
    q('n4-2', 'Qui est-ce ?', 'Qui est désigné par « Elle » ?', 'Léo prête son vélo à Maya. Elle le remercie.', ['Léo', 'Maya', 'Le vélo'], 1, '« Elle » désigne la personne qui reçoit le vélo.', { ruler: true }),
    q('n4-3', 'Le fil de l’histoire', 'Que fait Sami en premier ?', 'Sami prend une graine. Il la plante, puis il arrose la terre.', ['Il arrose', 'Il plante', 'Il prend une graine'], 2, 'Cherche la première action du récit.', { ruler: true }),
    q('n4-4', 'Le bon mot', 'Quel mot complète le récit ?', 'La pluie commence. Noé ouvre son … pour rester au sec.', ['parapluie', 'cahier', 'panier'], 0, 'Cet objet protège de la pluie.', { ruler: true }),
    q('n4-5', 'Les émotions', 'Comment se sent probablement Zoé ?', 'Zoé retrouve son doudou perdu. Elle sourit et le serre contre elle.', ['En colère', 'Heureuse', 'Effrayée'], 1, 'Son sourire te donne un indice.', { ruler: true }),
    q('n4-6', 'Qui est-ce ?', 'Que désigne « le » ?', 'Adam trouve un livre. Il le pose sur la table.', ['Adam', 'La table', 'Le livre'], 2, 'C’est l’objet qu’Adam pose.', { ruler: true }),
    q('n4-7', 'Les indices du récit', 'Pourquoi Inès souffle-t-elle sur sa soupe ?', 'La soupe fume dans le bol. Inès souffle avant de goûter.', ['Elle est trop chaude', 'Elle est trop froide', 'Le bol est vide'], 0, 'La vapeur montre que la soupe est chaude.', { ruler: true }),
    q('n4-8', 'Le fil de l’histoire', 'Que se passe-t-il à la fin ?', 'Le papillon sort de sa chrysalide. Il déplie ses ailes, puis il s’envole.', ['Il déplie ses ailes', 'Il s’envole', 'Il sort de sa chrysalide'], 1, 'Le mot « puis » annonce la dernière action.', { ruler: true })
  ]
];
export const calibration = [beginnerBanks[0][0], beginnerBanks[1][0], beginnerBanks[2][0], beginnerBanks[3][0], banks[1][6]];
export function questionsFor(level, stage = 0) { return level === 0 ? beginnerBanks[stage] : banks[level]; }
export function questionById(id) { return [...beginnerBanks.flat(), ...banks.slice(1).flat()].find(question => question.id === id); }
