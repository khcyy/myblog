const fs = require('fs');

let t = fs.readFileSync('temp_mockup.html', 'utf-8');

const additionalStyles = `
  /* 首页第一屏 3列全新结构 */
  .home { position:relative; min-height:calc(100vh - 110px); background:linear-gradient(180deg, color-mix(in srgb, var(--bg) 93%, white 7%), var(--bg)); overflow:hidden; }
  .earth-base { position:absolute; left:-6%; right:-6%; bottom:-80px; height:220px; border-radius:50% 50% 0 0; background:radial-gradient(110% 120% at 50% 6%, rgba(205,154,102,.25) 0%, rgba(162,112,70,.30) 55%, rgba(120,79,48,.35) 100%); z-index:1; }
  .home-inner-3col { position:relative; z-index:2; min-height:calc(100vh - 110px); display:grid; grid-template-columns:1fr minmax(320px, 460px) 1fr; gap:30px; align-items:center; justify-items:center; padding:32px 34px 80px; }
  .home-left, .home-right { height: clamp(200px, 30vh, 360px); width:100%; display:flex; align-items:center; justify-content:center; }
  .home-center { width:100%; max-width:420px; display:flex; align-items:center; justify-content:center; }
  .home-left img, .home-right img { width:100%; height:100%; object-fit:contain; }
  .home-center img { width:100%; height:auto; object-fit:contain; border-radius:34px; box-shadow:0 18px 35px rgba(0,0,0,.05); }

  @media (max-width: 1200px) {
    .home-inner-3col { grid-template-columns:1fr; }
  }
`;

t = t.replace('</style>', additionalStyles + '</style>');

const replacement = `
    <section class="panel home" id="home">
      <!-- 保留的底部大地装饰 -->
      <div class="earth-base" aria-hidden="true"></div>
      
      <!-- 全新三栏结构 -->
      <div class="home-inner-3col">
        <!-- 左侧手写图 -->
        <div class="home-left">
          <img src="/images/left-handwrite.png" alt="isishey 手写字样" />
        </div>
        
        <!-- 中间卡片 -->
        <div class="home-center">
          <img src="/images/center-card.png" alt="康淑琪简介" />
        </div>
        
        <!-- 右侧小花 -->
        <div class="home-right">
          <img src="/images/right-flower.png" alt="两朵黄色小花" />
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
