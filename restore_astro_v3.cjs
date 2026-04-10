const fs = require('fs');

let t = fs.readFileSync('temp_mockup.html', 'utf-8');

// Replace topbar branding CSS
const oldBrandCSS = `  .brand-mark { width:40px; height:40px; border-radius:50%; overflow:hidden; background: radial-gradient(circle at 35% 35%, #fff7bd 0%, #f0cd2e 38%, #d4a40f 100%); border:1px solid rgba(0,0,0,.05); box-shadow: inset 0 0 0 6px rgba(255,255,255,.30), 0 6px 14px rgba(206,175,66,.25); display:grid; place-items:center; }
  .brand-mark img { width:100%; height:100%; object-fit:cover; border-radius:50%; mix-blend-mode:multiply; filter:saturate(.95) contrast(1.03); }`;

const newBrandCSS = `  .brand-mark { width:40px; height:40px; display:grid; place-items:center; }
  .brand-mark img { width:100%; height:100%; object-fit:contain; display:block; }`;

t = t.replace(oldBrandCSS, newBrandCSS);

const additionalStyles = `
  /* 首页第一屏 3列全新结构 */
  .home { position:relative; min-height:calc(100vh - 110px); background:linear-gradient(180deg, color-mix(in srgb, var(--bg) 95%, white 5%), var(--bg)); overflow:hidden; }
  .earth-base { position:absolute; left:-6%; right:-6%; bottom:-60px; height:180px; border-radius:50% 50% 0 0; background:radial-gradient(110% 120% at 50% 6%, rgba(205,154,102,.10) 0%, rgba(162,112,70,.12) 55%, rgba(120,79,48,.15) 100%); z-index:1; }
  .home-inner-3col { position:relative; z-index:2; min-height:calc(100vh - 110px); display:grid; grid-template-columns:1.2fr minmax(320px, 440px) 1.2fr; gap:30px; align-items:center; justify-items:center; padding:32px 34px 80px; }
  
  .home-left, .home-right { height: clamp(250px, 40vh, 450px); width:100%; display:flex; align-items:center; justify-content:center; background: transparent; }
  .home-left { transform: scale(1.2); }
  .home-right { transform: scale(1.2); }
  
  .home-center { width:100%; max-width:420px; display:flex; align-items:center; justify-content:center; }
  
  /* 图片已单独去底，取消 mix-blend-mode 保证原图色彩与清晰度 */
  .home-left img, .home-right img { width:100%; height:auto; max-height:100%; object-fit:contain; display:block; background: transparent; }
  .home-right img { filter: saturate(0.7) brightness(1.05) opacity(0.9); }
  
  .profile-card-new { width:100%; border-radius:34px; background:color-mix(in srgb, var(--paper) 90%, transparent); border:1px solid rgba(255,255,255,.4); padding:32px 24px; box-shadow:0 8px 24px rgba(0,0,0,.03); backdrop-filter: blur(12px); text-align:center; }
  .profile-card-new .avatar { width:160px; height:160px; margin:0 auto 20px; border-radius:50%; background:#f7f2e5; overflow:hidden; border:6px solid rgba(255,255,255,.76); box-shadow:0 8px 24px rgba(0,0,0,.05); }
  .profile-card-new .avatar img { width:100%; height:100%; object-fit:contain; display:block; }
  .profile-card-new h2 { margin:0 0 12px; font-size:26px; }
  .profile-card-new p { margin:0 0 24px; line-height:1.75; color:var(--sub); font-size:15px; }
  .profile-links-new { display:flex; justify-content:center; gap:16px; flex-wrap:wrap; }
  .profile-links-new a { display:flex; align-items:center; justify-content:center; width:44px; height:44px; border-radius:50%; background:color-mix(in srgb, var(--paper) 92%, transparent); border:1px solid var(--line); color:var(--text); transition:.2s ease; }
  .profile-links-new a:hover { transform:translateY(-2px); background:color-mix(in srgb, var(--paper) 100%, transparent); }
  .profile-links-new svg { width:20px; height:20px; stroke:currentColor; fill:none; stroke-width:1.9; stroke-linecap:round; stroke-linejoin:round; }
  .profile-links-new .fill svg { fill:currentColor; stroke:none; }

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
          <article class="profile-card-new">
            <div class="avatar"><img src="/images/center-card.png" alt="头像" /></div>
            <h2>isishey</h2>
            <p>记录学习、项目、代码片段，以及日常生活中随时蹦出来的奇怪念头与感受。</p>
            <div class="profile-links-new">
              <a href="#" aria-label="Email"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18v12H3z"></path><path d="M4 7l8 6 8-6"></path></svg></a>
              <a href="#" class="fill" aria-label="GitHub"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.21.68-.48v-1.69c-2.78.6-3.37-1.18-3.37-1.18-.46-1.15-1.1-1.45-1.1-1.45-.91-.62.06-.61.06-.61 1 .07 1.53 1.03 1.53 1.03.9 1.53 2.35 1.09 2.92.83.09-.65.35-1.1.63-1.35-2.22-.25-4.56-1.11-4.56-4.93 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.03A9.53 9.53 0 0 1 12 6.8c.85 0 1.71.11 2.51.33 1.91-1.3 2.75-1.03 2.75-1.03.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.83-2.35 4.67-4.58 4.92.36.31.68.91.68 1.84v2.72c0 .27.18.58.69.48A10 10 0 0 0 12 2z"></path></svg></a>
              <a href="#" aria-label="Instagram"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"></rect><circle cx="12" cy="12" r="4"></circle><circle cx="17.2" cy="6.8" r="1"></circle></svg></a>
              <a href="#" aria-label="Bilibili / Notes"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="4"></rect><path d="M10 9l5 3-5 3z"></path></svg></a>
            </div>
          </article>
        </div>
        
        <!-- 右侧小花 -->
        <div class="home-right">
          <img src="/images/flowers.png" alt="两朵黄色小花" />
        </div>
      </div>
    </section>
`;

t = t.replace(/<section class="panel home"[^>]*>[\s\S]*?<\/section>/, replacement);

const astroContent = '---\n---\n\n' + 
  t.replace('<<REMOVED_BASE64>>', '/images/logo.png')
   .replace('<<REMOVED_BASE64>>', '/images/avatar.jpg')
   .replace('<<REMOVED_BASE64>>', '/images/about-img.jpg');

fs.writeFileSync('src/pages/index.astro', astroContent, 'utf-8');
console.log('Successfully restored');