import test from 'node:test';
import assert from 'node:assert/strict';
import {audioBrowser,audioPageUrl,chromeIntent,copyAudioLink,renderAudioAccess} from '../app/audio-access.js';

test('le guidage est affiché dans les navigateurs intégrés et lorsque la voix manque',()=>{
 for(const agent of ['Android [FBAN/Orca-Android;FBAV/123]','Android Instagram','iPhone TikTok','Android; wv'])assert.equal(audioBrowser(agent).embedded,true);
 const normal='Mozilla/5.0 (Linux; Android 14) Chrome/130 Mobile Safari/537.36';
 assert.equal(audioBrowser(normal).embedded,false);
 assert.equal(renderAudioAccess({userAgent:normal,href:'https://www.azyl.it/'}),'');
 const html=renderAudioAccess({userAgent:'Android FBAN/Orca',href:'https://www.azyl.it/'});
 assert.match(html,/menu ••• ou ⋮/);assert.match(html,/Copier le lien/);assert.match(html,/intent:\/\//);
 assert.match(renderAudioAccess({userAgent:normal,canSpeak:false}),/ne permet pas de lire/);
 assert.doesNotMatch(renderAudioAccess({userAgent:'iPhone Instagram',href:'https://www.azyl.it/'}),/intent:\/\//);
});

test('la sortie Chrome est manuelle, conserve le chemin et ne permet pas une injection d’intent',()=>{
 assert.equal(audioPageUrl('javascript:alert(1)'), '');
 assert.equal(chromeIntent('javascript:alert(1)'), '');
 const intent=chromeIntent('https://www.azyl.it/demarche/?x=1;package=bad#ignored');
 assert.match(intent,/intent:\/\/www.azyl.it\/demarche\/\?x=1%3Bpackage=bad#Intent/);
 assert.equal((intent.match(/;package=/g)||[]).length,1);
 assert.match(intent,/package=com.android.chrome/);
 const html=renderAudioAccess({userAgent:'Android FBAV',href:'https://www.azyl.it/?a="<b>'});
 assert.doesNotMatch(html,/<b>/);
});

test('la copie donne le lien exact et signale explicitement les refus du presse-papiers',async()=>{
 let copied;
 assert.equal(await copyAudioLink({writeText:value=>{copied=value;}},'https://www.azyl.it/?page=2'),true);
 assert.equal(copied,'https://www.azyl.it/?page=2');
 assert.equal(await copyAudioLink(null,'https://www.azyl.it/'),false);
 assert.equal(await copyAudioLink({writeText:()=>Promise.reject(new Error('denied'))},'https://www.azyl.it/'),false);
});
