// Editorial draft for level 2. Not imported by the child game or used to score learners.
// Phonetic notation is metadata for review, never a text-to-speech input.
const sound=(id,value,graphemes,examples,block,note='',kind='phoneme')=>({id,phoneticValue:value,graphemes,examples,block,note,kind,contentReview:'pending',audio:{file:null,sha256:null,source:null,rights:null,reviewer:null,reviewedAt:null,locale:'fr-FR',pronunciationReview:'pending',deviceCheck:'pending'},ttsFallback:null});
export const soundBlocks=[
 {id:'vowels-current',label:'Consolider a, i, o et u',prerequisites:[],status:'prototype-partial'},
 {id:'vowels-next',label:'Préparer é, è et e',prerequisites:['vowels-current'],status:'draft'},
 {id:'consonants-pilot',label:'Premier pilote de consonnes : l, r, f et j',prerequisites:['vowels-current'],status:'draft'},
 {id:'consonants-more',label:'Étendre à m, n, v et s',prerequisites:['consonants-pilot'],status:'draft'},
 {id:'stops',label:'Introduire p, t, b, d, k et g',prerequisites:['consonants-more'],status:'draft'},
 {id:'later-sounds',label:'Préparer les autres sons et graphèmes',prerequisites:['vowels-next','stops'],status:'draft'}
];
export const soundCurriculum=[
 sound('a','a',['a'],['ami','papa'],'vowels-current'),
 sound('i','i',['i'],['ici','midi'],'vowels-current'),
 sound('o','o',['o'],['vélo','moto'],'vowels-current','Prévoir séparément la variation ouverte /ɔ/ et ses contextes ; o n’a pas une prononciation unique.'),
 sound('u','y',['u'],['lune','tutu'],'vowels-current','Le symbole phonétique /y/ ne désigne pas le nom de la lettre y.'),
 sound('e-closed','e',['é'],['été','bébé'],'vowels-next'),
 sound('e-open','ɛ',['è'],['père','mère'],'vowels-next'),
 sound('schwa','ə',['e'],['le','cheval'],'vowels-next','Le schwa peut ne pas être prononcé selon le contexte et la variété de français ; choix des exemples à vérifier.'),
 sound('l','l',['l'],['lune','lama'],'consonants-pilot'),
 sound('r','ʁ',['r'],['rue','radis'],'consonants-pilot','Prévoir les variations de réalisation ; ne pas pénaliser une variété de français.'),
 sound('f','f',['f'],['fée','farine'],'consonants-pilot'),
 sound('j','ʒ',['j'],['jupe','joli'],'consonants-pilot','Le nom ji ne remplace pas le phonème.'),
 sound('m','m',['m'],['moto','maman'],'consonants-more'),
 sound('n','n',['n'],['niche','navire'],'consonants-more'),
 sound('v','v',['v'],['vélo','valise'],'consonants-more'),
 sound('s','s',['s'],['sac','sapin'],'consonants-more','Le s entre voyelles et les autres graphies du son sont des contextes distincts, à introduire ensuite.'),
 sound('p','p',['p'],['papa','papi'],'stops','Consonne brève : ne pas ajouter de voyelle et ne pas prolonger artificiellement.'),
 sound('t','t',['t'],['tapis','toupie'],'stops','Consonne brève : ne pas ajouter de voyelle.'),
 sound('b','b',['b'],['bébé','bateau'],'stops','Le nom bé ne remplace pas le phonème.'),
 sound('d','d',['d'],['dodo','dé'],'stops','Le nom dé ne remplace pas le phonème.'),
 sound('k','k',['k'],['kiwi','képi'],'stops','Les graphies c et qu sont à enseigner ensuite, avec leur contexte.'),
 sound('g-hard','ɡ',['g'],['gare','gomme'],'stops','D’abord g devant a, o, u ; distinguer ensuite g devant e, i et le groupe gu.'),
 sound('z','z',['z'],['zéro','zébu'],'later-sounds'),
 sound('ch','ʃ',['ch'],['chat','cheval'],'later-sounds','Groupe de lettres fréquent ; les exceptions sont hors du premier pilote.'),
 sound('gn','ɲ',['gn'],['agneau','montagne'],'later-sounds'),
 sound('ou','u',['ou'],['roue','mouton'],'later-sounds'),
 sound('on','ɔ̃',['on'],['ballon','mouton'],'later-sounds'),
 sound('an','ɑ̃',['an'],['maman','pantalon'],'later-sounds'),
 sound('in','ɛ̃',['in'],['lapin','sapin'],'later-sounds'),
 sound('un','œ̃',['un'],['un','brun'],'later-sounds','La distinction avec /ɛ̃/ varie selon les locuteurs ; ne pas en faire un critère de difficulté sans relecture.'),
 sound('eu','ø',['eu'],['feu','jeu'],'later-sounds','La valeur /œ/ dans d’autres mots doit être distinguée.'),
 sound('oi','wa',['oi'],['oiseau','voiture'],'later-sounds','Séquence de sons : ne pas la présenter comme un phonème unique.','phoneme-sequence')
];
// Every alphabet letter is accounted for; some require context instead of an isolated-sound card.
export const letterSoundCoverage=[
 ['a',['a'],'direct','Autres graphèmes contenant a à aborder séparément.'],
 ['b',['b'],'direct','Son bref, différent du nom bé.'],
 ['c',['k','s'],'context','c devant a/o/u ; c devant e/i ; ç et ch à distinguer.'],
 ['d',['d'],'direct','Son bref, différent du nom dé.'],
 ['e',['schwa','e-closed','e-open'],'context','Selon accent, entourage et position ; e muet à distinguer.'],
 ['f',['f'],'direct','ph sera une autre graphie, introduite ensuite.'],
 ['g',['g-hard','j'],'context','g devant a/o/u ; g devant e/i ; gu à distinguer.'],
 ['h',[],'context','Pas de carte de phonème h isolé dans le premier parcours ; h muet/aspiré et groupes ch/ph à expliquer en contexte.'],
 ['i',['i'],'direct','Les groupes de lettres et semi-voyelles nécessitent un autre contexte.'],
 ['j',['j'],'direct','Son différent du nom ji.'],
 ['k',['k'],'direct','Comparer plus tard les graphies k/c/qu.'],
 ['l',['l'],'direct','Les groupes comme ill nécessitent un autre contexte.'],
 ['m',['m'],'direct','Les voyelles nasales avec m se traitent séparément.'],
 ['n',['n'],'direct','Les voyelles nasales avec n se traitent séparément.'],
 ['o',['o'],'context','Valeurs /o/ et /ɔ/ ; groupes on/ou/oi à distinguer.'],
 ['p',['p'],'direct','Son bref ; lettres muettes et ph en contexte.'],
 ['q',['k'],'context','Enseigner notamment qu ; ne pas prononcer systématiquement q puis u.'],
 ['r',['r'],'direct','Réalisation variable selon les locuteurs.'],
 ['s',['s','z'],'context','s initial et s entre voyelles ; ss et finales à distinguer.'],
 ['t',['t'],'direct','Son bref ; tion et finales ne relèvent pas de la première étape.'],
 ['u',['u'],'context','Son /y/ puis groupes ou/gu/qu et semi-voyelles en contexte.'],
 ['v',['v'],'direct','Distinguer le son du nom vé.'],
 ['w',['v'],'context','Son /v/ ou /w/ selon les mots ; /w/ à compléter avant ces exercices.'],
 ['x',[],'context','Souvent /ks/ ou /ɡz/, parfois muet ; pas un phonème unique à inventer.'],
 ['y',['i'],'context','Valeurs /i/ et /j/ selon les mots ; /j/ à compléter avant ces exercices.'],
 ['z',['z'],'direct','Distinguer le son du nom zède et les finales muettes.']
].map(([letter,soundIds,mode,note])=>({letter,soundIds,mode,note,status:'draft'}));
export const pilotSoundExercises=[
 ['l','a'],['r','i'],['f','o'],['j','u']
].flatMap(([target,distractor])=>[false,true].map(reverse=>({
 id:`draft-sound-${target}-${reverse?2:1}`,targetSoundId:target,
 choices:(reverse?[distractor,target]:[target,distractor]).map(id=>({grapheme:soundCurriculum.find(item=>item.id===id).graphemes[0],soundId:id})),
 answer:reverse?1:0,instruction:'Écoute, puis touche la lettre.',audioMode:'recorded-sound',ttsFallback:null,live:false,
 help:['réécoute','exemple distinct','modèle après demande d’aide'],review:'pending'
})));
export function audioReadiness(entry){
 const audio=entry.audio,issues=[];
 if(entry.contentReview!=='approved')issues.push('contenu non relu');
 if(!audio.file || !/^\/audio\/sounds\/fr-fr\/[a-z0-9-]+\.mp3$/.test(audio.file))issues.push('fichier audio absent ou chemin invalide');
 if(!audio.source || !audio.rights)issues.push('provenance ou droits non renseignés');
 if(!audio.reviewer || !audio.reviewedAt || !Number.isFinite(Date.parse(audio.reviewedAt)))issues.push('relecture non documentée');
 if(audio.locale!=='fr-FR')issues.push('langue non vérifiée');
 if(audio.pronunciationReview!=='approved')issues.push('prononciation non validée');
 if(audio.deviceCheck!=='passed')issues.push('écoute sur appareils non vérifiée');
 return {metadataReady:issues.length===0,issues};
}
