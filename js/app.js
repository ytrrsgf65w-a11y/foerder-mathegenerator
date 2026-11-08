var mods=[];function renderConfig(){document.getElementById("config").innerHTML='Anzahl <select id="count"><option>5</option><option>10</option></select>';}
renderConfig();document.getElementById('moduleType').onchange=renderConfig;
function addModule(){mods.push({type:document.getElementById('moduleType').value,count:parseInt(document.getElementById('count').value)});document.getElementById('modules').innerHTML=mods.map(m=>'<div class="card">'+m.type+' ('+m.count+')</div>').join('');}
function generateWorksheet(){let txt='ARBEITSBLATT

';let sol='
LOESUNGEN

';mods.forEach(function(m){let tasks=[];if(m.type==='addition')tasks=genAddition(m.count);if(m.type==='subtraktion')tasks=genSubtraction(m.count);if(m.type==='multiplikation')tasks=genMultiplication(m.count);if(m.type==='division')tasks=genDivision(m.count);if(m.type==='sachaufgabe')tasks=genWord(m.count);txt+=m.type+'
';sol+=m.type+'
';tasks.forEach((t,i)=>{txt+=(i+1)+') '+t.q+'
';sol+=(i+1)+') '+t.s+'
';});txt+='
';sol+='
';});document.getElementById('preview').textContent=txt+sol;}