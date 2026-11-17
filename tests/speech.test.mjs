import test from 'node:test';
import assert from 'node:assert/strict';
import {createPraiseVariation,frenchUtterance} from '../app/speech.js';
test('quatre intonations de félicitation modérées, sans répétition immédiate',()=>{
 const choose=createPraiseVariation();let previous;
 for(let i=0;i<100;i++){
  const variation=choose();
  assert.notDeepEqual(variation,previous);
  assert.ok(variation.pitch>1 && variation.pitch<=1.14);
  assert.ok(variation.rate>=0.99 && variation.rate<=1.08);
  previous=variation;
 }
 const fixed=createPraiseVariation(()=>0);
 assert.notDeepEqual(fixed(),fixed());
 const normal=frenchUtterance('ma',class{constructor(text){this.text=text;}},[]);
 assert.equal(normal.pitch,1);assert.equal(normal.rate,0.97);
});
