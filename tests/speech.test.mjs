import test from 'node:test';
import assert from 'node:assert/strict';
import {createPraiseVariation,frenchUtterance} from '../app/speech.js';
test('quatre intonations de félicitation modérées, sans répétition immédiate',()=>{
 const choose=createPraiseVariation();let previous;
 for(let i=0;i<100;i++){
  const variation=choose();
  assert.notDeepEqual(variation,previous);
  assert.ok(variation.pitch>1 && variation.pitch<=1.10);
  assert.ok(variation.rate>=0.79 && variation.rate<=0.85);
  previous=variation;
 }
 const fixed=createPraiseVariation(()=>0);
 assert.notDeepEqual(fixed(),fixed());
 const normal=frenchUtterance('ma',class{constructor(text){this.text=text;}},[]);
 assert.equal(normal.pitch,1);assert.equal(normal.rate,0.8);
});

test('la voix naturelle disponible passe avant une voix compacte et le choix français reste prioritaire',async()=>{
 const {preferredFrenchVoice,voiceKey}=await import('../app/speech.js');
 const compact={name:'French Compact',lang:'fr-FR',voiceURI:'compact'};
 const natural={name:'Amélie Enhanced',lang:'fr_CA',voiceURI:'natural-ca'};
 const french={name:'Denise Natural',lang:'fr-FR',voiceURI:'natural-fr'};
 const child={name:'Voix enfant Natural',lang:'fr-FR',voiceURI:'child-fr'};
 const english={name:'Child Premium',lang:'en-US',voiceURI:'child-en'};
 assert.equal(preferredFrenchVoice([compact,natural]),natural);
 assert.equal(preferredFrenchVoice([natural,french]),french);
 assert.equal(preferredFrenchVoice([french,child,english]),child);
 assert.equal(preferredFrenchVoice([compact,french],voiceKey(compact)),compact);
 assert.equal(preferredFrenchVoice([compact,french],'missing'),french);
 assert.equal(preferredFrenchVoice([english,french],'child-en'),french);
});

test('le rythme choisi persiste sans changer la hauteur de la cible ni accélérer Bravo',async()=>{
 const {parseProfile,freshProfile}=await import('../app/state.js');
 assert.equal(parseProfile(JSON.stringify({settings:{}})).settings.speechRate,0.8);
 assert.equal(parseProfile(JSON.stringify({settings:{speechRate:10,speechVoice:{bad:true}}})).settings.speechRate,0.8);
 for(const rate of [0.7,0.8,0.9]){
  const profile=freshProfile();profile.settings.speechRate=rate;profile.settings.speechVoice='chosen';
  const restored=parseProfile(JSON.stringify(profile));
  assert.equal(restored.settings.speechVoice,'chosen');assert.equal(restored.settings.speechRate,rate);
  const target=frenchUtterance('ma',class{constructor(text){this.text=text;}},[],restored.settings);
  assert.equal(target.text,'ma');assert.equal(target.rate,rate);assert.equal(target.pitch,1);
  const praise=createPraiseVariation(()=>0)(rate);assert.ok(praise.rate>=rate*0.98);assert.ok(praise.rate<=Math.min(0.95,rate*1.06));
 }
});
test('la synthèse distingue fu de fou sans modifier les mots qui contiennent fu', () => {
  class Utterance { constructor(text) { this.text = text; } }
  assert.equal(frenchUtterance('fu', Utterance, []).text, 'fut');
  assert.equal(frenchUtterance('fou', Utterance, []).text, 'fou');
  assert.equal(frenchUtterance('fumée', Utterance, []).text, 'fumée');
  assert.equal(frenchUtterance('to', Utterance, []).text, 'tôt');
  assert.equal(frenchUtterance('tou', Utterance, []).text, 'tou');
  assert.equal(frenchUtterance('tomate', Utterance, []).text, 'tomate');
});
