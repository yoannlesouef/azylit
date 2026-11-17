import test from 'node:test';
import assert from 'node:assert/strict';
import { createNavigationHistory } from '../app/navigation.js';
test('retour et avance restaurent la navigation, sans copier la progression',()=>{
 const entries=[],listeners={};let index=-1;const restored=[];
 const browser={addEventListener:(name,fn)=>listeners[name]=fn,history:{
  replaceState(state){entries[index<0?++index:index]=structuredClone(state);},
  pushState(state){entries.splice(index+1);entries[++index]=structuredClone(state);},
  back(){if(index>0)listeners.popstate({state:entries[--index]});}
 }};
 const nav=createNavigationHistory(browser,snapshot=>{restored.push(snapshot);nav.sync(snapshot.screen,snapshot);});
 nav.sync('home',{screen:'home'});
 nav.sync('letters',{screen:'letters',page:0});nav.sync('letters',{screen:'letters',page:2});
 nav.sync('words',{screen:'words',word:'maman'});
 assert.equal(entries.length,3);assert.equal(nav.back(),true);
 assert.deepEqual(restored.at(-1),{screen:'letters',page:2});
 listeners.popstate({state:entries[++index]});assert.equal(restored.at(-1).word,'maman');
 assert.equal(entries.length,3);nav.back();nav.back();assert.equal(nav.back(),false);
});
