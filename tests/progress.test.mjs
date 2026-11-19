import test from 'node:test';
import assert from 'node:assert/strict';
import {summarizeProgress,renderProgressSummary} from '../app/progress.js';
import {questionsFor} from '../app/data.js';
const event=(exerciseId,result,day,extra={})=>({exerciseId,result,completedAt:`2026-11-${day}T10:00:00Z`,...extra});
test('le bilan sépare les objectifs guidés et les aides, sans statut de maîtrise',()=>{
 const entries=[event('f2-1','assisted','17'),event('f2-1','independent','19'),event('f2-2','assisted','18'),event('f2-3','independent','18'),event('f3-1','independent','19')];
 const original=structuredClone(entries),report=summarizeProgress(entries);
 const listen=report.rows.find(row=>row.id==='syllable-listen');
 assert.equal(listen.independent,1);assert.equal(listen.assisted,2);assert.equal(listen.distinctExercises,2);
 assert.deepEqual(listen.recentSupport,['mi']);
 assert.ok(report.rows.some(row=>row.id==='guided-letter-build'));assert.ok(report.rows.some(row=>row.id==='guided-word-build'));
 assert.deepEqual(entries,original);
 const html=renderProgressSummary(report);assert.match(html,/modèle visible/);assert.match(html,/plusieurs enfants/);
 assert.ok(!html.includes('data-action='));assert.ok(!html.includes('data-setting='));
 assert.equal(summarizeProgress([]).rows.length,0);assert.equal(renderProgressSummary(summarizeProgress([])),'');
});
test('les exercices alternatifs sont classés selon la tâche réelle et les anciennes dates ne remplacent pas la dernière observation',()=>{
 const entries=[event('f0-1','independent','19',{level:3}),event('f0-1','assisted','17'),event('missing','assisted','18')];
 const report=summarizeProgress(entries);assert.equal(report.unmapped,1);
 assert.equal(report.rows.length,1);assert.equal(report.rows[0].id,'letter-shape');assert.deepEqual(report.rows[0].recentSupport,[]);
 assert.equal(report.rows[0].lastCompletedAt,'2026-11-19T10:00:00Z');
});
test('chaque exercice jouable peut contribuer au bilan local',()=>{
 const questions=[...[0,1,2,3].map(stage=>questionsFor(0,stage)),...[1,2,3].map(level=>questionsFor(level))].flat();
 const report=summarizeProgress(questions.map(question=>event(question.id,'independent','19')));
 assert.equal(report.unmapped,0);assert.equal(report.rows.reduce((sum,row)=>sum+row.completed,0),364);
 assert.ok(report.rows.every(row=>row.assisted===0 && row.recentSupport.length===0));
});
