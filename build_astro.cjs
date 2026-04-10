const fs = require('fs');

let t = fs.readFileSync('temp_mockup.html', 'utf-8');

const replacement = `
    <section class="panel home" id="home">
      <div class="earth-base" aria-hidden="true" style="position:absolute; left:-6%; right:-6%; bottom:-80px; height:220px; border-radius:50% 50% 0 0; background:radial-gradient(110% 120% at 50% 6%, rgba(205,154,102,.25) 0%, rgba(162,112,70,.30) 55%, rgba(120,79,48,.35) 100%); z-index:1;"></div>
      <div class="home-inner-3col" style="position:relative; z-index:2; min-height:calc(100vh - 110px); display:grid; grid-template-columns:1fr minmax(320px, 460px) 1fr; gap:30px; align-items:center; justify-items:center; padding:32px 34px 80px;">
        <div class="home-left" style="height: clamp(200px, 30vh, 360px); width:100%; display:flex; align-items:center; justify-content:center;">
          <img src="/images/left-handwrite.png" alt="isishey 手写" style="width:100%; height:100%; object-fit:contain;" />
        </div>
        <div class="home-center" style="width:100%; max-width:420px; display:flex; align-items:center; justify-content:center;">
          <img src="/images/center-card.png" alt="康淑琪简介" style="width:100%; height:auto; object-fit:contain; border-radius:34px; box-shadow:0 18px 35px rgba(0,0,0,.05);" />
        </div>
        <div class="home-right" style="height: clamp(200px, 30vh, 360px); width:100%; display:flex; align-items:center; justify-content:center;">
          <img src="/images/right-flower.png" alt="两朵小花" style="width:100%; height:100%; object-fit:contain;" />
        </div>
      </div>
    </section>
`;

t = t.replace(/<section class="panel home"[^>]*>[\s\S]*?<\/section>/, replacement);

const astroContent = '---\n---\n\n' + 
  t.replace('<<REMOVED_BASE64>>', '/images/logo-flower.jpg')
   .replace('<<REMOVED_BASE64>>', '/images/avatar.jpg')
   .replace('<<REMOVED_BASE64>>', '/images/about-img.jpg');

fs.writeFileSync('src/pages/index.astro', astroContent);
