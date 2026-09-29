(function(){
  const luma = document.getElementById('luma');
  const button = document.getElementById('speakLuma');
  const textEl = document.getElementById('lumaText');
  let pulse = null;

  function animateMouth(on){
    if(!luma) return;
    if(pulse) clearInterval(pulse);
    luma.classList.remove('speaking');
    if(on){
      pulse=setInterval(()=>luma.classList.toggle('speaking'),110);
    }
  }

  function speak(text, opts={}){
    if(!('speechSynthesis' in window)) return;
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = opts.lang || 'es-ES';
    utterance.rate = opts.rate || 0.96;
    utterance.pitch = opts.pitch || 1.08;
    utterance.onstart=()=>animateMouth(true);
    utterance.onend=()=>animateMouth(false);
    utterance.onerror=()=>animateMouth(false);
    speechSynthesis.speak(utterance);
  }

  window.LumaPuppet={speak,stop(){speechSynthesis?.cancel();animateMouth(false)}};
  button?.addEventListener('click',()=>speak(textEl.textContent.trim()));
})();
