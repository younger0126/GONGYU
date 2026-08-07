let player = null;
let idToken = '';
let monster = null;
let autoBattle = true;
let autoTimer = null;

const monsters = [
  {name:'森林史萊姆',icon:'🟢',baseHp:55,gold:12,exp:10},
  {name:'毒菇怪',icon:'🍄',baseHp:72,gold:15,exp:13},
  {name:'森林哥布林',icon:'👺',baseHp:95,gold:20,exp:17},
  {name:'巨木守衛',icon:'🌳',baseHp:135,gold:28,exp:23},
  {name:'翡翠巨狼',icon:'🐺',baseHp:180,gold:38,exp:31}
];

window.addEventListener('load', init);
document.getElementById('startAdventureBtn').addEventListener('click', openBattle);
document.getElementById('backHomeBtn').addEventListener('click', openHome);
document.getElementById('autoBtn').addEventListener('click', toggleAuto);

async function init(){
  try{
    setLoading('正在初始化 LIFF...');
    await liff.init({ liffId: GAME_CONFIG.LIFF_ID });

    if (!liff.isLoggedIn()){
      liff.login({ redirectUri: location.href });
      return;
    }

    idToken = liff.getIDToken();
    const profile = await liff.getProfile();

    setLoading('正在讀取玩家進度...');

    player = await loadPlayer(profile);
    renderPlayer();
    openHome();
  }catch(err){
    showError(err);
  }
}

async function loadPlayer(profile){
  if (GAME_CONFIG.API_URL){
    try{
      const res = await fetch(GAME_CONFIG.API_URL + '?action=load', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({ idToken })
      });
      if (res.ok){
        const data = await res.json();
        if (data && data.player) return normalizePlayer(data.player);
      }
    }catch(e){
      console.warn('API load failed, fallback to localStorage', e);
    }
  }

  const key = 'theheroes:'+profile.userId;
  const saved = JSON.parse(localStorage.getItem(key) || 'null');

  if (saved){
    saved.displayName = profile.displayName;
    saved.pictureUrl = profile.pictureUrl || '';
    return normalizePlayer(saved);
  }

  return normalizePlayer({
    userId: profile.userId,
    displayName: profile.displayName,
    pictureUrl: profile.pictureUrl || '',
    level:1,exp:0,gold:100,gems:10,
    hp:120,maxHp:120,attack:18,defense:5,
    stage:1,monsterIndex:0,totalKills:0
  });
}

function normalizePlayer(p){
  ['level','exp','gold','gems','hp','maxHp','attack','defense','stage','monsterIndex','totalKills'].forEach(k=>p[k]=Number(p[k]||0));
  p.level=Math.max(1,p.level);p.maxHp=Math.max(1,p.maxHp);p.attack=Math.max(1,p.attack);p.stage=Math.max(1,p.stage);
  return p;
}

function renderPlayer(){
  ['avatar','battleAvatar'].forEach(id=>$(id).src=player.pictureUrl||'');
  $('displayName').textContent=player.displayName||'勇者';
  $('battleName').textContent=player.displayName||'勇者';
  $('levelText').textContent='Lv.'+player.level;
  $('battleLevel').textContent='Lv.'+player.level;
  $('expFill').style.width=Math.min(100,(player.exp/expNeeded(player.level))*100)+'%';
  $('gold').textContent=player.gold.toLocaleString();
  $('gems').textContent=player.gems.toLocaleString();
}

function openHome(){
  stopAuto();
  showOnly('homeScreen');
}

function openBattle(){
  showOnly('battleScreen');
  spawnMonster();
  startAuto();
}

function spawnMonster(){
  const idx=Math.max(0,Math.min(4,player.monsterIndex||0));
  const base=monsters[idx];
  const scale=1+(player.stage-1)*.24;
  const maxHp=Math.floor(base.baseHp*scale);
  monster={...base,maxHp,hp:maxHp};

  $('monster').textContent=monster.icon;
  $('monsterName').textContent=monster.name+(idx===4?' · BOSS':'');
  $('stageText').textContent=player.stage+'-'+(idx+1);
  renderMonster();
}

function renderMonster(){
  $('monsterHpFill').style.width=Math.max(0,(monster.hp/monster.maxHp)*100)+'%';
  $('monsterHpText').textContent=Math.max(0,monster.hp)+' / '+monster.maxHp;
}

function skillAttack(mult=1){
  if(!player||!monster||monster.hp<=0)return;
  const crit=Math.random()<.12;
  const variance=.88+Math.random()*.24;
  const dmg=Math.max(1,Math.floor(player.attack*mult*variance*(crit?1.8:1)));

  monster.hp-=dmg;
  $('damageText').textContent=(crit?'💥 CRIT! ':'-')+dmg;
  $('damageText').classList.remove('show');
  void $('damageText').offsetWidth;
  $('damageText').classList.add('show');

  renderMonster();
  if(monster.hp<=0)setTimeout(victory,220);
}

function victory(){
  player.gold += Math.floor(monster.gold*(1+(player.stage-1)*.12));
  player.exp += Math.floor(monster.exp*(1+(player.stage-1)*.10));
  player.totalKills++;
  levelUpCheck();

  player.monsterIndex++;
  if(player.monsterIndex>=5){
    player.monsterIndex=0;
    player.stage++;
  }

  renderPlayer();
  savePlayer();
  setTimeout(spawnMonster,500);
}

function levelUpCheck(){
  while(player.exp>=expNeeded(player.level)){
    player.exp-=expNeeded(player.level);
    player.level++;
    player.maxHp+=22;
    player.hp=player.maxHp;
    player.attack+=5;
    player.defense+=2;
  }
}

function expNeeded(lv){return Math.floor(80*Math.pow(1.18,lv-1));}

function toggleAuto(){
  autoBattle=!autoBattle;
  $('autoBtn').classList.toggle('on',autoBattle);
  $('autoBtn').textContent='● 自動戰鬥 '+(autoBattle?'ON':'OFF');
  if(autoBattle)startAuto();else stopAuto();
}

function startAuto(){
  stopAuto();
  if(autoBattle)autoTimer=setInterval(()=>skillAttack(1),900);
}

function stopAuto(){
  if(autoTimer)clearInterval(autoTimer);
  autoTimer=null;
}

async function savePlayer(){
  const key='theheroes:'+player.userId;
  localStorage.setItem(key, JSON.stringify(player));

  if (!GAME_CONFIG.API_URL || !idToken) return;

  try{
    await fetch(GAME_CONFIG.API_URL + '?action=save', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({ idToken, player })
    });
  }catch(e){
    console.warn('API save failed',e);
  }
}

function setLoading(text){
  $('loadingText').textContent=text;
  showOnly('loadingScreen');
}

function showOnly(id){
  ['loadingScreen','homeScreen','battleScreen','errorScreen'].forEach(x=>$(x).classList.add('hidden'));
  $(id).classList.remove('hidden');
}

function showError(err){
  $('errorText').textContent=(err&&err.message)?err.message:String(err||'未知錯誤');
  showOnly('errorScreen');
}

function $(id){return document.getElementById(id);}
