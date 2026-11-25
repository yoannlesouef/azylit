import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {wordEmoji,wordPicture,drawnWords} from '../app/word-pictures.js';
import {wordsForSyllable} from '../app/discovery-data.js';
import {createDiscoveryState,renderDiscovery,updateDiscovery} from '../app/discovery.js';

test('les images trompeuses sont remplacées et les notions abstraites gardent le repère d’écoute',()=>{
 assert.equal(wordEmoji('puni','🧸'),'🔊');
 assert.equal(wordEmoji('limon','🍋'),'🔊');
 assert.equal(wordEmoji('couteau','🍴'),'🔪');
 assert.equal(wordEmoji('carotte'),'🥕');
 const ma=wordsForSyllable('ma');assert.equal(ma.find(w=>w.text==='magicien').emoji,'🧙');
 assert.equal(ma.find(w=>w.text==='malade').emoji,'🤒');
 const state=updateDiscovery(createDiscoveryState(),'syllable','ra').state;
 const html=renderDiscovery(state);
 assert.match(html,/word-pictures.svg#radis/);
 assert.match(html,/<mark>ra<\/mark>dis/);
});

test('chaque dessin utilisé par une carte correspond à un symbole présent dans le fichier livré',async()=>{
 const svg=await readFile(new URL('../app/word-pictures.svg',import.meta.url),'utf8');
 for(const text of drawnWords){
  assert.ok(svg.includes(`id="${text}"`));
  assert.ok(wordPicture({text}).includes(`#${text}`));
 }
});
