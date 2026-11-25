// Exact word associations only: never infer a picture from a substring or syllable.
const groups = {
  '🐋':['baleine'], '🧳':['bagage'], '🐏':['bélier'], '🚲':['bicyclette'],
  '🦬':['bison'], '👙':['bikini'], '💐':['bouquet'], '🍾':['bouteille'],
  '🧵':['bobine','ficelle'], '🧶':['pelote','tricot'], '🥐':['brioche'],
  '🐟':['brochet','anchois','saumon'], '🚌':['autocar'],
  '🚗':['automobile'], '🐤':['canari'], '🚚':['camion'], '🥕':['carotte'],
  '🏡':['chalet','pavillon'], '🛒':['chariot'], '👔':['chemise','cravate'],
  '🐛':['chenille'], '🪂':['parachutiste','parachutisme','parachutage','parachuter'],
  '🐷':['cochon'], '🐚':['coquillage'], '👑':['couronne'], '🐸':['crapaud'],
  '✏️':['crayon'], '🦗':['criquet'], '🌋':['cratère'], '🌷':['crocus','tulipe'],
  '✂️':['découper'], '🦕':['dinosaure'], '✉️':['enveloppe'],
  '🪵':['fagot','rondin','bâton'], '🌿':['fougère'], '🍴':['fourchette'],
  '🚐':['fourgon','roulotte'], '🚀':['fusée'], '🥧':['galette'], '🌌':['galaxie','nébuleuse'],
  '🧊':['gelée','geler'], '💊':['gélule'], '🦍':['gorille'],
  '🐜':['insecte'], '🪻':['jacinthe','lavande'], '🧥':['jaquette'],
  '🃏':['joker'], '🥋':['judo','karatéka'], '🐎':['jument','galop'],
  '🛶':['kayak'], '🎤':['karaoké'], '🥝':['kiwi'], '🦎':['lézard'],
  '🦄':['licorne'], '🚂':['locomotive'], '🐺':['louveteau'],
  '👓':['lunette'], '🤒':['malade'], '🧙':['magicien'], '👷':['maçon','ouvrier'],
  '🐧':['manchot'], '🍊':['mandarine'], '🍈':['melon'], '🌦️':['météo'],
  '🫁':['poumon'], '🤧':['mouchoir'], '🐴':['mulet','poney','poulain'],
  '🏊':['nager'], '🪺':['nicher','nichée'], '🐣':['oisillon','oiselet'],
  '🧸':['nounours','peluche','joujou'], '🧺':['panier'],
  '🌶️':['piment'], '🕊️':['pigeon'], '🐦':['pinson'], '🖌️':['pinceau'],
  '🪐':['planète'], '🗄️':['placard'],
  '🧪':['potion'], '🥦':['légume','végétal','potager'], '🦝':['raton'],
  '🎾':['raquette'], '🦊':['renard'], '⏰':['réveil'], '😊':['sourire'],
  '🏞️':['rivière','rivage'], '🚰':['robinet'], '🌹':['rosier'],
  '🍪':['macaron'], '🌰':['marron'], '🎀':['ruban'],
  '💎':['rubis','topaze'], '🧼':['savon'], '👋':['saluer'], '🛟':['secours','secourir'],
  '🤫':['silence'], '✍️':['signature','autographe'], '🎼':['sonate'],
  '👞':['soulier','sabot'], '🖼️':['tableau'],
  '🛼':['patin'], '🛝':['toboggan'], '🦜':['toucan'],
  '🏆':['trophée'], '🐄':['vachette'], '🏖️':['vacances'], '🚘':['véhicule'],
  '🛞':['volant'], '⛵':['voilier'], '🧑‍⚕️':['vétérinaire'],
  '🔪':['couteau'], '🧣':['foulard'], '🪙':['jeton'], '🧒':['gamin']
};
// Remove misleading approximations, including abstract concepts represented as objects.
const omit = new Set(['puni','punition','limon','jamais','joli','poli','sali','modèle','critique','chinois','séparation','vérité','santé','vouloir','fragile','bilan','nouveau','figure','midi','talon','caramel','nougat','coulis','farine','rideau','tapis','plateau','potiron','poupée','coton']);
const pictures = new Map(Object.entries(groups).flatMap(([emoji,words])=>words.map(word=>[word,emoji])));
export const drawnWords = new Set(['radis','bonnet','coussin','moulin','boudin','culotte','pyjama','tuba','bureau','béret']);
export function wordEmoji(text, original = '🔊') {
  return drawnWords.has(text) || omit.has(text) ? '🔊' : pictures.get(text) || original;
}
export function wordPicture(word) {
  if(drawnWords.has(word.text))return `<svg class="word-drawing" viewBox="0 0 100 80" aria-hidden="true"><use href="/word-pictures.svg#${word.text}"></use></svg>`;
  return word.emoji;
}
