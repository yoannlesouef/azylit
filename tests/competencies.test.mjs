import test from 'node:test';
import assert from 'node:assert/strict';
import {competencies,primaryCompetency,competenceCoverage} from '../content/competencies.mjs';
test('chaque exercice a un objectif principal et les prérequis ne sont ni absents ni cycliques',()=>{
 const report=competenceCoverage();assert.equal(report.total,180);assert.deepEqual(report.unmapped,[]);
 const ids=report.skills.flatMap(skill=>skill.exerciseIds);assert.equal(new Set(ids).size,180);
 const map=new Map(competencies.map(skill=>[skill.id,skill]));assert.equal(map.size,competencies.length);
 function visit(id,path=[]){assert.ok(map.has(id),id);assert.ok(!path.includes(id),id);for(const next of map.get(id).prerequisites)visit(next,[...path,id]);}
 for(const skill of competencies){visit(skill.id);assert.equal(skill.professionalReview,'pending');}
 assert.equal(primaryCompetency({type:'unknown'}),null);
});
test('les lacunes et les tâches guidées ne sont pas présentées comme une maîtrise',()=>{
 const {skills}=competenceCoverage();const get=id=>skills.find(skill=>skill.id===id);
 assert.equal(get('guided-word-build').exerciseIds.length,60);
 assert.equal(get('guided-letter-build').exerciseIds.length,20);
 assert.equal(get('syllable-listen').exerciseIds.length,20);
 for(const id of ['independent-blending','consonant-sound','oral-fluency','sound-odd-one-out','interactive-chronology'])assert.equal(get(id).exerciseIds.length,0);
});
