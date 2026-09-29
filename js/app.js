(() => {
  const state={plays:5,prizes:0,x:50,attempt:0,busy:false};
  const monsterDefs=[
    ['turquesa','#4fe7e4','👁️'],['rojo','#ff4b78','😬'],['verde','#7ce35f','👀'],['pulpo','#a55cff','🐙'],['amarillo','#ffc742','😮'],['morado','#a97aff','😱'],['celeste','#66c8ff','🙂']
  ];
  const field=document.getElementById('monsterField');
  const claw=document.getElementById('claw');
  const status=document.getElementById('status');
  const plays=document.getElementById('plays');
  const prizes=document.getElementById('prizes');
  const pedagogy=document.getElementById('pedagogy');
  const pedagogyTitle=document.getElementById('pedagogyTitle');
  const flash=document.getElementById('flash');

  monsterDefs.forEach(([name,color,face],i)=>{
    const m=document.createElement('div');m.className='monster';m.dataset.id=i;m.dataset.name=name;m.style.setProperty('--c',color);
    m.innerHTML=`<span class="monster-face">${face}</span><span class="monster-label">${name.toUpperCase()}</span>`;
    field.appendChild(m);
  });

  function render(){plays.textContent=state.plays;prizes.textContent=state.prizes;claw.style.left=`${state.x}%`}
  function say(text){window.LumaPuppet?.speak(text,{rate:1.03,pitch:1.12})}
  function setStatus(text,voice=false){status.textContent=text;if(voice)say(text)}
  function move(delta){if(state.busy)return;state.x=Math.max(4,Math.min(96,state.x+delta));render()}
  document.getElementById('leftBtn').onclick=()=>move(-9);
  document.getElementById('rightBtn').onclick=()=>move(9);

  const joy=document.getElementById('joystickZone');
  let dragging=false,startX=0,startState=0;
  joy.addEventListener('pointerdown',e=>{dragging=true;startX=e.clientX;startState=state.x;joy.setPointerCapture(e.pointerId)});
  joy.addEventListener('pointermove',e=>{if(!dragging||state.busy)return;const dx=e.clientX-startX;state.x=Math.max(4,Math.min(96,startState+dx/joy.clientWidth*100));render()});
  joy.addEventListener('pointerup',()=>dragging=false);

  function nearestMonster(){
    const candidates=[...document.querySelectorAll('.monster:not(.gone)')];
    if(!candidates.length)return null;
    const box=document.getElementById('machineWindow').getBoundingClientRect();
    const clawX=box.left+box.width*(state.x/100);
    return candidates.map(m=>{const r=m.getBoundingClientRect();return {m,d:Math.abs((r.left+r.width/2)-clawX)}}).sort((a,b)=>a.d-b.d)[0]?.m;
  }

  async function attemptCatch(){
    if(state.busy||state.plays<=0)return;
    state.busy=true;state.plays--;state.attempt++;render();
    claw.style.top='48%';await wait(520);claw.classList.add('closed');await wait(260);
    const target=nearestMonster();
    const success=state.attempt%3===0 && target;
    if(success){await capture(target)}else{await miss(target)}
    claw.style.top='0';claw.classList.remove('closed');await wait(500);state.busy=false;
    if(state.plays<=0 && state.prizes===0)setStatus('Fin de las jugadas. Puedes reiniciar la experiencia recargando la página.',true);
  }

  async function miss(target){
    flash.classList.add('on');setTimeout(()=>flash.classList.remove('on'),460);
    if(target){target.animate([{transform:'translateX(0)'},{transform:'translateX(-8px)'},{transform:'translateX(8px)'},{transform:'translateX(0)'}],{duration:420});}
    setStatus(state.attempt%3===1?'Casi. La garra no pudo sujetarlo.':'Se escapó. Observa, ajusta y vuelve a intentar.',true);
    await wait(520);
  }

  async function capture(target){
    const r=target.getBoundingClientRect();target.classList.add('caught');target.style.left=`${r.left}px`;target.style.top=`${r.top}px`;target.style.margin='0';
    const cr=claw.getBoundingClientRect();target.style.left=`${cr.left-5}px`;target.style.top=`${cr.bottom-25}px`;await wait(420);
    setStatus(`¡Has atrapado al monstruo ${target.dataset.name}!`,true);
    target.animate([{transform:'rotate(-8deg)'},{transform:'rotate(9deg)'},{transform:'rotate(-5deg)'},{transform:'rotate(0)'}],{duration:700});
    await wait(720);
    target.style.left=`${window.innerWidth-120}px`;target.style.top=`${window.innerHeight-160}px`;await wait(420);target.classList.add('gone');
    state.prizes++;render();
    pedagogyTitle.textContent=`Has atrapado al monstruo ${target.dataset.name}`;
    pedagogy.hidden=false;
  }
  document.getElementById('catchBtn').onclick=attemptCatch;
  document.addEventListener('keydown',e=>{if(e.key==='ArrowLeft')move(-8);if(e.key==='ArrowRight')move(8);if(e.key===' '||e.key==='Enter')attemptCatch()});
  document.querySelectorAll('[data-reflection]').forEach(b=>b.onclick=()=>b.classList.toggle('selected'));
  document.getElementById('continueBtn').onclick=()=>{pedagogy.hidden=true;setStatus('Muy bien. Puedes seguir jugando.');};
  function wait(ms){return new Promise(r=>setTimeout(r,ms))}
  render();
})();
