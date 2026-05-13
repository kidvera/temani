// ═══════════════════════════════════════════
// CONFIG — GANTI DENGAN NILAI KAMU
// ═══════════════════════════════════════════
const SUPABASE_URL = 'https://spflyyqvawiiuazchyht.supabase.co/rest/v1/';
const SUPABASE_ANON_KEY = 'sb_secret_yAJ0blCdDAolXDeGEbNneA_U1Z7zwfO';
const LYNK_URL = 'http://lynk.id/r4hm4wati/18d2eg4nl2gy/checkout'; // ganti dengan link Lynk.id kamu

 
// ═══════════════════════════════════════════
// SUPABASE INIT
// ═══════════════════════════════════════════
const { createClient } = supabase;
const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
 
// ═══════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════
let currentUser = null;
let currentChild = null;
let selectedAge = null;
let answers = [];
let currentQ = 0;
let scores = {};
let isPremium = false;
 
// ═══════════════════════════════════════════
// SOAL — 30 pertanyaan, 5 per pusat
// ═══════════════════════════════════════════
const PUSAT = [
  { id:'taktil',        label:'Sistem Taktil',        icon:'🖐️', cls:'b-taktil',        color:'var(--peach-light)',  txt:'var(--peach)' },
  { id:'vestibular',    label:'Sistem Vestibular',    icon:'🌀', cls:'b-vestibular',    color:'var(--sky-light)',    txt:'var(--sky)' },
  { id:'proprioseptif', label:'Proprioseptif',        icon:'💪', cls:'b-proprioseptif', color:'var(--lav-light)',    txt:'var(--lav)' },
  { id:'auditori',      label:'Sistem Auditori',      icon:'👂', cls:'b-auditori',      color:'var(--sun-light)',    txt:'#b8860a' },
  { id:'visual',        label:'Sistem Visual',        icon:'👁️', cls:'b-visual',        color:'var(--rose-light)',   txt:'var(--rose)' },
  { id:'interoeptif',   label:'Interoeptif',          icon:'❤️', cls:'b-interoeptif',   color:'var(--sage-light)',   txt:'var(--sage-dark)' },
];
 
// Skor jawaban: posisi 0 = paling normal (4 poin), posisi 3 = paling bermasalah (1 poin)
const SOAL = [
  // TAKTIL (0-4)
  { pusat:0, q:'Apakah anak nyaman saat dipeluk atau disentuh orang yang dikenal?', ctx:'💡 Perhatikan reaksi saat memeluk, mengelus rambut, atau saat bermain fisik bersama', opts:['Ya, anak menikmati dan aktif meminta pelukan','Kadang mau kadang tidak, tergantung suasana hati','Lebih sering menghindari atau tampak tidak nyaman','Selalu menolak, kaku, atau langsung menjauh saat disentuh'] },
  { pusat:0, q:'Bagaimana reaksi anak terhadap tekstur pakaian tertentu?', ctx:'💡 Contoh: label baju, kain kasar, baju ketat, kaus kaki yang tidak pas', opts:['Tidak pernah mengeluh, nyaman dengan semua jenis pakaian','Sesekali mengeluh tapi tetap mau memakainya','Sering protes dan butuh waktu lama untuk pakai baju','Sangat sensitif, sering menolak banyak jenis pakaian'] },
  { pusat:0, q:'Bagaimana reaksi anak saat tangannya terkena sesuatu yang kotor?', ctx:'💡 Misalnya cat, lumpur, makanan lengket, atau pasir basah', opts:['Santai saja, langsung lanjut bermain','Kadang tidak nyaman tapi masih bisa bermain','Sering mengeluh dan langsung ingin membersihkan','Menolak sama sekali, menangis atau marah'] },
  { pusat:0, q:'Apakah anak mencari kontak fisik secara berlebihan?', ctx:'💡 Contoh: sering memeluk sangat kuat, menempel terus, mendorong orang lain', opts:['Seimbang, memeluk sewajarnya','Kadang mencari tambahan tapi masih wajar','Sering memeluk kuat atau menempel berlebihan','Selalu mencari kontak fisik intens bahkan saat tidak tepat'] },
  { pusat:0, q:'Bagaimana reaksi anak terhadap sentuhan ringan tak terduga?', ctx:'💡 Contoh: angin sepoi, rambut menyentuh kulit, atau disentuh dari belakang', opts:['Tidak terganggu, tetap beraktivitas normal','Sesekali kaget tapi cepat kembali tenang','Sering bereaksi berlebihan seperti teriak atau kaget','Sangat terganggu dan sulit menenangkan diri'] },
  // VESTIBULAR (5-9)
  { pusat:1, q:'Bagaimana anak bereaksi saat diayun atau berputar?', ctx:'💡 Perhatikan saat naik ayunan, digendong berputar, atau bermain merry-go-round', opts:['Menikmati dan minta lagi setelah selesai','Netral, tidak terlalu suka maupun menghindari','Kadang takut atau enggan mencoba','Selalu menolak atau menangis saat diayun/diputar'] },
  { pusat:1, q:'Apakah anak sering mencari stimulasi gerak berlebihan?', ctx:'💡 Contoh: lompat terus-menerus, berputar sendiri, jungkir balik, tidak bisa diam', opts:['Bergerak sesuai kebutuhan, tidak berlebihan','Kadang aktif berlebih tapi masih terkontrol','Sering mencari gerak intens dan sulit dihentikan','Hampir tidak bisa berhenti bergerak sepanjang hari'] },
  { pusat:1, q:'Bagaimana keseimbangan anak saat berdiri satu kaki atau berjalan di permukaan tidak rata?', ctx:'💡 Perhatikan saat berjalan di batu, naik tangga, atau bermain di taman bermain', opts:['Seimbang dengan baik, jarang jatuh','Kadang goyah tapi bisa menyesuaikan','Sering kehilangan keseimbangan atau menghindari tantangan','Selalu kesulitan, sangat mudah jatuh'] },
  { pusat:1, q:'Bagaimana reaksi anak saat posisi kepalanya berubah tiba-tiba?', ctx:'💡 Contoh: tiba-tiba dibalik posisinya, membungkuk cepat, atau head rush', opts:['Tidak masalah, langsung beradaptasi','Kadang terasa pusing tapi cepat pulih','Sering mengeluh pusing atau mual','Selalu terganggu, sangat sensitif terhadap perubahan posisi'] },
  { pusat:1, q:'Apakah anak menikmati aktivitas seperti perosotan, trampolin, atau bermain di taman?', ctx:'💡 Perhatikan antusias atau penolakan saat diajak ke playground', opts:['Sangat antusias dan bersemangat','Mau mencoba tapi tidak terlalu bersemangat','Perlu banyak dorongan untuk mencoba','Selalu menolak atau takut bermain di peralatan taman'] },
  // PROPRIOSEPTIF (10-14)
  { pusat:2, q:'Apakah anak sering tampak tidak menyadari kekuatan yang dikeluarkan?', ctx:'💡 Contoh: menulis terlalu keras, memegang barang sampai patah, atau memeluk terlalu kuat', opts:['Mengontrol kekuatan dengan baik sesuai situasi','Kadang terlalu keras tapi tidak disengaja','Sering tidak bisa mengontrol kekuatan yang dikeluarkan','Hampir selalu kesulitan mengatur kekuatan'] },
  { pusat:2, q:'Bagaimana koordinasi gerakan anak secara keseluruhan?', ctx:'💡 Perhatikan saat berlari, menangkap bola, atau menaiki tangga', opts:['Koordinasi baik, gerakan terlihat terkoordinasi','Kadang canggung tapi masih bisa melakukan','Sering terlihat kurang koordinasi atau kaku','Sangat kesulitan dengan gerakan yang membutuhkan koordinasi'] },
  { pusat:2, q:'Apakah anak suka aktivitas yang memberikan tekanan pada tubuh?', ctx:'💡 Contoh: bermain lompat, mendorong benda berat, bergelantungan, atau bergulat', opts:['Menyukai dan mencari aktivitas seperti ini secara wajar','Kadang suka, kadang tidak','Jarang tertarik pada aktivitas tekanan tubuh','Selalu menghindari aktivitas yang melibatkan tekanan fisik'] },
  { pusat:2, q:'Bagaimana postur tubuh anak saat duduk atau berdiri dalam waktu lama?', ctx:'💡 Perhatikan saat duduk di meja, menonton TV, atau menunggu', opts:['Postur tegak dan sadar posisi tubuhnya','Kadang membungkuk tapi bisa diingatkan','Sering terlihat lemas atau tidak sadar posisi tubuh','Selalu kesulitan mempertahankan postur bahkan dalam waktu singkat'] },
  { pusat:2, q:'Apakah anak menyadari posisi anggota tubuhnya tanpa harus melihat?', ctx:'💡 Contoh: bisa memakai sepatu tanpa melihat, tahu posisi tangan saat di belakang punggung', opts:['Sangat sadar, bisa melakukan banyak hal tanpa melihat tubuhnya','Cukup sadar untuk aktivitas sehari-hari','Kadang bingung posisi tubuhnya sendiri','Sering salah atau perlu selalu melihat anggota tubuhnya'] },
  // AUDITORI (15-19)
  { pusat:3, q:'Bagaimana reaksi anak terhadap suara keras yang tiba-tiba?', ctx:'💡 Contoh: suara petir, kembang api, blender, atau klakson', opts:['Kaget sebentar lalu langsung beradaptasi','Sedikit terkejut tapi cepat tenang kembali','Sering panik atau sangat terganggu','Sangat takut, menangis atau menutup telinga lama'] },
  { pusat:3, q:'Apakah anak mudah mengikuti instruksi lisan?', ctx:'💡 Perhatikan saat diberi perintah seperti "ambil buku merah di atas meja"', opts:['Memahami dan langsung merespons dengan baik','Perlu diulang 1-2 kali tapi akhirnya mengerti','Sering perlu diulang berkali-kali atau minta contoh','Hampir selalu kesulitan mengikuti instruksi lisan'] },
  { pusat:3, q:'Bagaimana konsentrasi anak saat ada suara latar belakang?', ctx:'💡 Contoh: bermain saat TV menyala, belajar saat ada keributan di luar', opts:['Bisa tetap fokus meski ada suara latar','Sedikit terganggu tapi masih bisa konsentrasi','Sering kehilangan fokus karena suara sekitar','Tidak bisa berkonsentrasi sama sekali jika ada kebisingan'] },
  { pusat:3, q:'Apakah anak menikmati musik, lagu, atau menyanyi?', ctx:'💡 Perhatikan reaksi saat mendengar musik, lagu favorit, atau diajak bernyanyi bersama', opts:['Sangat menikmati, aktif ikut bernyanyi atau menari','Menikmati secara biasa, tidak berlebihan','Kurang tertarik atau mudah bosan dengan musik','Menghindari atau terganggu dengan suara musik'] },
  { pusat:3, q:'Apakah anak mudah mengenali dan membedakan suara-suara?', ctx:'💡 Contoh: mengenali suara anggota keluarga dari jauh, membedakan suara binatang', opts:['Sangat peka, mudah mengenali banyak suara','Cukup baik dalam mengenali suara umum','Kadang kesulitan membedakan suara yang mirip','Sering kesulitan mengenali bahkan suara yang familiar'] },
  // VISUAL (20-24)
  { pusat:4, q:'Bagaimana reaksi anak terhadap cahaya terang atau silau?', ctx:'💡 Contoh: keluar di siang hari terik, lampu ruangan yang sangat terang, atau kilat', opts:['Tidak terganggu, beradaptasi dengan baik','Sesekali memicingkan mata tapi tetap beraktivitas','Sering mengeluh silau atau menghindari cahaya terang','Sangat sensitif, sering menangis atau tidak bisa membuka mata'] },
  { pusat:4, q:'Apakah anak mudah terdistraksi oleh gerakan atau benda visual?', ctx:'💡 Contoh: tidak bisa fokus karena ada orang lalu-lalang, atau teralih oleh layar TV', opts:['Bisa fokus meski ada distraksi visual','Kadang teralih tapi bisa kembali fokus','Sering kehilangan fokus karena stimulus visual','Hampir tidak bisa fokus jika ada gerakan di sekitarnya'] },
  { pusat:4, q:'Bagaimana kemampuan anak mengikuti sesuatu dengan matanya?', ctx:'💡 Perhatikan saat mengikuti bola yang dilempar, atau membaca tulisan', opts:['Tracking sangat baik, mata mengikuti dengan lancar','Cukup baik untuk aktivitas sehari-hari','Kadang kesulitan mengikuti objek bergerak','Sering kehilangan jejak atau tidak bisa mengikuti dengan mata'] },
  { pusat:4, q:'Apakah anak kesulitan membedakan kiri dan kanan, atau posisi benda?', ctx:'💡 Contoh: sering salah kiri-kanan, kesulitan memahami "di atas/bawah/depan/belakang"', opts:['Paham dengan baik konsep arah dan posisi','Kadang tertukar tapi bisa dikoreksi','Sering bingung dengan konsep arah dan posisi','Selalu kesulitan bahkan dengan konsep spasial sederhana'] },
  { pusat:4, q:'Bagaimana kemampuan anak membedakan detail visual?', ctx:'💡 Contoh: menemukan perbedaan dua gambar mirip, puzzle, atau mengenali wajah', opts:['Sangat detail dan teliti secara visual','Cukup baik dalam mengenali detail','Kadang kesulitan melihat perbedaan yang jelas','Sering melewatkan detail yang seharusnya mudah terlihat'] },
  // INTEROEPTIF (25-29)
  { pusat:5, q:'Apakah anak bisa mengenali rasa lapar atau kenyang dengan baik?', ctx:'💡 Perhatikan apakah anak bilang lapar sebelum kelaparan, atau tahu kapan berhenti makan', opts:['Selalu tahu kapan lapar dan kapan kenyang','Cukup baik mengenali sinyal lapar-kenyang','Kadang lupa bilang lapar atau makan berlebihan','Sering tidak menyadari lapar sampai sangat lapar atau makan tanpa kontrol'] },
  { pusat:5, q:'Apakah anak bisa merasakan dan mengungkapkan rasa sakit?', ctx:'💡 Perhatikan apakah anak bilang sakit saat terluka, atau sebaliknya bereaksi berlebihan', opts:['Bisa merasakan dan mengungkapkan rasa sakit dengan proporsional','Cukup baik, sesekali melebih-lebihkan atau meremehkan','Sering tidak menyadari luka kecil atau bereaksi berlebihan','Sangat kesulitan mengenali atau mengungkapkan rasa sakit'] },
  { pusat:5, q:'Bagaimana anak mengelola rasa lelah atau kebutuhan istirahat?', ctx:'💡 Perhatikan apakah anak tahu kapan tubuhnya lelah dan minta istirahat', opts:['Menyadari kelelahan dan mau istirahat secara mandiri','Perlu diingatkan tapi merespons dengan baik','Sering menolak istirahat meski sudah sangat lelah','Tidak pernah mau istirahat atau sebaliknya sering mengeluh lelah berlebihan'] },
  { pusat:5, q:'Apakah anak peka terhadap detak jantung atau napasnya sendiri?', ctx:'💡 Perhatikan apakah anak sadar nafasnya sesak saat lelah, atau jantung berdegup kencang', opts:['Peka dan bisa mendeskripsikan sensasi tubuhnya','Cukup sadar terhadap sinyal tubuhnya','Kadang tidak menyadari perubahan fisik yang jelas','Hampir tidak pernah sadar terhadap sensasi dalam tubuhnya'] },
  { pusat:5, q:'Bagaimana anak merespons kebutuhan ke toilet?', ctx:'💡 Perhatikan apakah anak bisa menahan dan pergi ke toilet tepat waktu', opts:['Menyadari kebutuhan lebih awal dan pergi tepat waktu','Kadang mepet tapi masih terkontrol','Sering baru bilang saat sudah tidak tahan','Sering kecelakaan atau tidak menyadari kebutuhan sampai terlambat'] },
];
 
// ═══════════════════════════════════════════
// AKTIVITAS DATA
// ═══════════════════════════════════════════
const AKTIVITAS = [
  { nama:'Jalan sensorik barefoot', pusat:'taktil', durasi:'10 menit', level:1, ico:'🚶', clr:'ic-g', tags:['tag-sage','Taktil'], desc:'Ajak anak berjalan tanpa alas kaki di berbagai tekstur — rumput, kerikil halus, karpet, atau pasir. Mulai dari tekstur yang lembut dulu, tingkatkan bertahap. Ini stimulasi taktil level 1 yang sangat efektif.' },
  { nama:'Sensory bin tekstur', pusat:'taktil', durasi:'15 menit', level:1, ico:'📦', clr:'ic-p', tags:['tag-sage','Taktil'], desc:'Isi wadah dengan beras, pasir, atau biji-bijian. Biarkan anak mengaduk dengan tangan. Tambahkan benda kecil yang harus ditemukan. Tingkatkan ke tekstur lebih menantang seperti cat jari.' },
  { nama:'Pelukan sandwich', pusat:'proprioseptif', durasi:'5 menit', level:1, ico:'🤗', clr:'ic-p', tags:['tag-peach','Proprioseptif'], desc:'Tekan tubuh anak lembut di antara dua bantal. Beri tekanan ringan dari kedua sisi selama 3-5 detik, lalu lepas. Ulangi 5-7 kali. Sangat menenangkan untuk anak sensory seeking.' },
  { nama:'Tarik tambang', pusat:'vestibular', durasi:'15 menit', level:1, ico:'⚖️', clr:'ic-s', tags:['tag-sky','Vestibular'], desc:'Gunakan handuk atau tali sebagai tambang. Latih keseimbangan dan resistensi tubuh. Lakukan sebelum kegiatan yang butuh fokus. Tingkatkan intensitas bertahap.' },
  { nama:'Ayunan ritmikal', pusat:'vestibular', durasi:'10 menit', level:1, ico:'🎠', clr:'ic-s', tags:['tag-sky','Vestibular'], desc:'Ayun anak pelan dengan ritme stabil. Mulai lambat, bisa ditingkatkan sesuai toleransi. Hindari gerakan tiba-tiba. Sangat efektif untuk regulasi sistem vestibular.' },
  { nama:'Heavy work — dorong kursi', pusat:'proprioseptif', durasi:'5 menit', level:2, ico:'🪑', clr:'ic-p', tags:['tag-peach','Proprioseptif'], desc:'Minta anak mendorong kursi kayu melintasi ruangan. Bisa juga mengangkat buku tebal atau tas berisi benda. Lakukan 10 repetisi, 2x sehari untuk input proprioseptif yang dalam.' },
  { nama:'Drum mainan', pusat:'auditori', durasi:'10 menit', level:1, ico:'🥁', clr:'ic-g', tags:['tag-lav','Auditori'], desc:'Ajak anak bermain drum atau perkusi sederhana. Mulai dengan ritme pelan, tingkatkan tempo bertahap. Sambil bermain, sebut pola ritme dengan kata-kata untuk stimulasi auditori sekaligus bahasa.' },
  { nama:'Puzzle & maze visual', pusat:'visual', durasi:'15 menit', level:1, ico:'🧩', clr:'ic-s', tags:['tag-sky','Visual'], desc:'Puzzle gambar atau maze sederhana melatih tracking visual dan koordinasi mata-tangan. Pilih tingkat kesulitan yang sesuai. Tingkatkan detail dan ukuran yang lebih kecil secara bertahap.' },
  { nama:'Napas balon', pusat:'interoeptif', durasi:'5 menit', level:1, ico:'🎈', clr:'ic-g', tags:['tag-sage','Interoeptif'], desc:'Ajarkan anak meniup balon sambil merasakan napasnya. Tanya: "Rasanya gimana di perut saat menarik napas dalam?" Ini melatih kesadaran interoeptif terhadap sensasi dalam tubuh.' },
  { nama:'Cat jari & finger painting', pusat:'taktil', durasi:'20 menit', level:2, ico:'🎨', clr:'ic-p', tags:['tag-sage','Taktil'], desc:'Mulai dengan kuas, baru pelan-pelan ajak sentuh cat langsung. Jangan paksa. Kenalkan satu tekstur baru per sesi. Setelah nyaman, tambahkan tekstur lain seperti spons atau kertas kasar.' },
];
 
// ═══════════════════════════════════════════
// AUTH
// ═══════════════════════════════════════════
async function initApp() {
  // Check if Supabase is configured
  if (SUPABASE_URL === 'https://YOUR_PROJECT.supabase.co') {
    // Demo mode — skip auth
    currentUser = { id: 'demo', email: 'demo@temanitung.app', user_metadata: { full_name: 'Bunda Demo' } };
    showDemoMode();
    return;
  }
  const { data: { session } } = await sb.auth.getSession();
  if (session) {
    currentUser = session.user;
    await loadUserData();
    showApp();
  } else {
    goScreen('s-login');
  }
}
 
function showDemoMode() {
  goScreen('s-onboard');
}
 
async function doLogin() {
  const email = document.getElementById('login-email').value.trim();
  const pass = document.getElementById('login-pass').value;
  if (!email || !pass) { showErr('Isi email dan kata sandi dulu ya'); return; }
  document.getElementById('login-btn').textContent = 'Memproses...';
  document.getElementById('login-btn').disabled = true;
  const { data, error } = await sb.auth.signInWithPassword({ email, password: pass });
  if (error) {
    showErr(error.message === 'Invalid login credentials' ? 'Email atau kata sandi salah' : error.message);
    document.getElementById('login-btn').textContent = 'Masuk →';
    document.getElementById('login-btn').disabled = false;
    return;
  }
  currentUser = data.user;
  await loadUserData();
  showApp();
}
 
async function doRegister() {
  const email = document.getElementById('login-email').value.trim();
  const pass = document.getElementById('login-pass').value;
  if (!email || !pass) { showErr('Isi email dan kata sandi dulu ya'); return; }
  if (pass.length < 6) { showErr('Kata sandi minimal 6 karakter'); return; }
  document.getElementById('login-btn').textContent = 'Mendaftarkan...';
  document.getElementById('login-btn').disabled = true;
  const { data, error } = await sb.auth.signUp({ email, password: pass });
  if (error) {
    showErr(error.message);
    document.getElementById('login-btn').textContent = 'Masuk →';
    document.getElementById('login-btn').disabled = false;
    return;
  }
  currentUser = data.user;
  showApp();
}
 
async function doGoogleLogin() {
  await sb.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.href } });
}
 
async function doLogout() {
  await sb.auth.signOut();
  currentUser = null;
  currentChild = null;
  scores = {};
  document.getElementById('bnav').classList.remove('show');
  goScreen('s-login');
}
 
// ═══════════════════════════════════════════
// DATA
// ═══════════════════════════════════════════
async function loadUserData() {
  if (!currentUser || SUPABASE_URL.includes('YOUR_PROJECT')) return;
  try {
    const { data } = await sb.from('children').select('*').eq('user_id', currentUser.id).order('created_at', { ascending: false }).limit(1);
    if (data && data.length > 0) {
      currentChild = data[0];
      const { data: results } = await sb.from('sensory_results').select('*').eq('child_id', currentChild.id).order('created_at', { ascending: false }).limit(1);
      if (results && results.length > 0) scores = results[0].scores || {};
    }
    const { data: profile } = await sb.from('profiles').select('is_premium').eq('id', currentUser.id).single();
    if (profile) isPremium = profile.is_premium || false;
  } catch(e) { console.log('Load data error:', e); }
}
 
async function saveChild(name, age) {
  if (SUPABASE_URL.includes('YOUR_PROJECT')) {
    currentChild = { id: 'demo-child', name, age_range: age };
    return;
  }
  const { data, error } = await sb.from('children').upsert({ user_id: currentUser.id, name, age_range: age }).select().single();
  if (!error && data) currentChild = data;
}
 
async function saveResults(scrs) {
  if (SUPABASE_URL.includes('YOUR_PROJECT')) { scores = scrs; return; }
  scores = scrs;
  await sb.from('sensory_results').insert({ child_id: currentChild.id, user_id: currentUser.id, scores: scrs, created_at: new Date().toISOString() });
}
 
// ═══════════════════════════════════════════
// ONBOARDING
// ═══════════════════════════════════════════
function selectAge(el, age) {
  document.querySelectorAll('.age-card').forEach(c => c.classList.remove('sel'));
  el.classList.add('sel');
  selectedAge = age;
  const nameVal = document.getElementById('child-name').value.trim();
  document.getElementById('onb-next').disabled = !nameVal;
}
 
document.getElementById('child-name').addEventListener('input', function() {
  document.getElementById('onb-next').disabled = !this.value.trim() || !selectedAge;
});
 
async function startObservasi() {
  const name = document.getElementById('child-name').value.trim();
  if (!name || !selectedAge) return;
  await saveChild(name, selectedAge);
  answers = new Array(30).fill(null);
  currentQ = 0;
  renderQuestion();
  document.getElementById('obs-child-label').textContent = 'Observasi ' + name;
  goScreen('s-obs');
}
 
// ═══════════════════════════════════════════
// OBSERVASI
// ═══════════════════════════════════════════
function renderQuestion() {
  const q = SOAL[currentQ];
  const p = PUSAT[q.pusat];
  const total = SOAL.length;
  const pct = Math.round(((currentQ) / total) * 100);
 
  document.getElementById('obs-fill').style.width = Math.max(3, pct) + '%';
  document.getElementById('obs-ctr').textContent = (currentQ + 1) + ' / ' + total;
  document.getElementById('q-num').textContent = 'Pertanyaan ' + (currentQ + 1) + ' dari ' + total;
  document.getElementById('q-text').textContent = q.q;
  document.getElementById('q-ctx').textContent = q.ctx;
 
  const badge = document.getElementById('obs-badge');
  badge.className = 'pusat-badge ' + p.cls;
  badge.textContent = p.icon + ' ' + p.label;
 
  const optsEl = document.getElementById('obs-opts');
  optsEl.innerHTML = q.opts.map((o, i) => `
    <div class="obs-opt ${answers[currentQ] === i ? 'sel' : ''}" onclick="selectOpt(${i})">
      <div class="opt-radio"><div class="opt-radio-dot"></div></div>
      <span class="opt-txt">${o}</span>
    </div>
  `).join('');
 
  const nextBtn = document.getElementById('obs-next');
  nextBtn.disabled = answers[currentQ] === null;
  nextBtn.textContent = currentQ === total - 1 ? 'Lihat hasil →' : 'Lanjut →';
}
 
function selectOpt(i) {
  answers[currentQ] = i;
  document.querySelectorAll('.obs-opt').forEach((el, idx) => el.classList.toggle('sel', idx === i));
  document.getElementById('obs-next').disabled = false;
}
 
function obsBack() {
  if (currentQ > 0) { currentQ--; renderQuestion(); }
  else goScreen('s-onboard');
}
 
async function obsNext() {
  if (answers[currentQ] === null) return;
  if (currentQ < SOAL.length - 1) {
    currentQ++;
    renderQuestion();
  } else {
    // Hitung skor
    const scrs = {};
    PUSAT.forEach((p, pi) => {
      const soalPusat = SOAL.filter(s => s.pusat === pi);
      const vals = soalPusat.map((s, si) => {
        const globalIdx = SOAL.indexOf(s);
        const ans = answers[globalIdx] !== null ? answers[globalIdx] : 0;
        return 4 - ans; // 0=terbaik→4poin, 3=terburuk→1poin
      });
      const avg = vals.reduce((a,b) => a+b, 0) / vals.length;
      scrs[p.id] = Math.round(((avg - 1) / 3) * 100);
    });
    await saveResults(scrs);
    renderHasil();
    goScreen('s-hasil');
  }
}
 
// ═══════════════════════════════════════════
// HASIL
// ═══════════════════════════════════════════
function renderHasil() {
  const name = currentChild ? currentChild.name : 'Anak';
  document.getElementById('hasil-name').textContent = name;
  document.getElementById('hasil-date').textContent = 'Usia ' + (currentChild ? currentChild.age_range : '—') + ' · ' + new Date().toLocaleDateString('id-ID', {day:'numeric',month:'long',year:'numeric'});
 
  const sorted = Object.entries(scores).sort((a,b) => a[1]-b[1]);
  const prioritasId = sorted[0] ? sorted[0][0] : 'taktil';
  const prioritas = PUSAT.find(p => p.id === prioritasId);
 
  const getClass = v => v >= 70 ? {fill:'f-high',pct:'p-high'} : v >= 45 ? {fill:'f-mid',pct:'p-mid'} : {fill:'f-low',pct:'p-low'};
  const getStatus = (id, v) => {
    if (v >= 70) return { cls:'s-ok', txt:'Respons normal — berkembang dengan baik' };
    if (v >= 45) return { cls:'s-mid', txt: v < 55 ? 'Cenderung hiporesponsif — perlu stimulasi tambahan' : 'Sedikit sensitif — perhatikan kondisi tertentu' };
    return { cls:'s-alert', txt:'Cenderung hiperresponsif — butuh pendampingan khusus' };
  };
 
  const html = `
    <div class="skor-card">
      <div class="skor-title">Skor per sistem sensorik</div>
      ${PUSAT.map(p => {
        const v = scores[p.id] || 50;
        const c = getClass(v);
        return `<div class="skor-row">
          <span class="skor-lbl">${p.icon} ${p.label.replace('Sistem ','').replace('Proprioseptif','Proprioseptif').substring(0,11)}</span>
          <div class="skor-track"><div class="skor-fill ${c.fill}" style="width:${v}%"></div></div>
          <span class="skor-pct ${c.pct}">${v}%</span>
        </div>`;
      }).join('')}
    </div>
 
    <div class="label-xs">Prioritas utama · gratis</div>
    <div class="ins-card">
      <div class="ins-ico" style="background:${prioritas.color}; color:${prioritas.txt}">${prioritas.icon}</div>
      <div class="ins-body">
        <div class="ins-n">${prioritas.label}</div>
        <div class="ins-status ${getStatus(prioritasId, scores[prioritasId]||50).cls}">${getStatus(prioritasId, scores[prioritasId]||50).txt}</div>
        <div class="ins-desc">${getInsightDesc(prioritasId, scores[prioritasId]||50)}</div>
      </div>
    </div>
 
    <div class="kek-card">
      <div class="kek-t">💛 Kekuatan ${name}</div>
      ${getKekuatan(scores).map(k => `<div class="kek-i"><span>✨</span><span>${k}</span></div>`).join('')}
    </div>
 
    ${!isPremium ? `
      <div class="label-xs">5 sistem lainnya</div>
      <div class="ins-card locked">
        <div class="ins-ico" style="background:var(--sky-light)">🌀</div>
        <div class="ins-body">
          <div class="ins-n">Vestibular — Keseimbangan</div>
          <div class="ins-status s-mid">Perlu stimulasi tambahan</div>
          <div class="ins-desc">Insight lengkap tersedia di paket premium...</div>
        </div>
      </div>
      <div class="paywall">
        <div class="pw-em">🔓</div>
        <div class="pw-t">Lihat profil lengkap ${name}</div>
        <div class="pw-s">Panduan personal untuk semua 6 sistem sensorik</div>
        <div class="pw-feats">
          <div class="pw-feat">Insight 5 sistem sensorik lainnya</div>
          <div class="pw-feat">Planner aktivitas harian personal</div>
          <div class="pw-feat">Panduan saat anak meltdown</div>
          <div class="pw-feat">Video stimulasi berjenjang</div>
          <div class="pw-feat">Laporan untuk dokter/terapis</div>
        </div>
        <button class="btn btn-primary" onclick="openLynk()">Mulai Langganan · Rp49.000/bln</button>
        <div class="pw-note">Batalkan kapan saja · tanpa kontrak</div>
      </div>
    ` : `
      <div class="label-xs">Semua sistem sensorik</div>
      ${PUSAT.filter(p => p.id !== prioritasId).map(p => {
        const v = scores[p.id] || 50;
        const st = getStatus(p.id, v);
        return `<div class="ins-card">
          <div class="ins-ico" style="background:${p.color}">${p.icon}</div>
          <div class="ins-body">
            <div class="ins-n">${p.label}</div>
            <div class="ins-status ${st.cls}">${st.txt}</div>
            <div class="ins-desc">${getInsightDesc(p.id, v)}</div>
          </div>
        </div>`;
      }).join('')}
    `}
 
    <button class="btn btn-primary" onclick="navTo('beranda')">Ke beranda →</button>
    <div style="height:16px"></div>
  `;
  document.getElementById('hasil-body').innerHTML = html;
}
 
function getInsightDesc(id, v) {
  const descs = {
    taktil: v >= 70 ? 'Sistem sentuhan anak berkembang dengan baik. Tetap berikan variasi pengalaman taktil untuk mempertahankan perkembangan.' : v >= 45 ? 'Anak membutuhkan lebih banyak input taktil. Kegiatan seperti sensory bin dan finger painting sangat direkomendasikan.' : 'Anak mudah terganggu oleh tekstur atau sentuhan tak terduga. Desensitisasi bertahap sangat diperlukan.',
    vestibular: v >= 70 ? 'Keseimbangan dan koordinasi gerak anak sudah baik. Pertahankan dengan aktivitas fisik rutin.' : v >= 45 ? 'Anak perlu lebih banyak stimulasi gerak dan keseimbangan. Ayunan dan aktivitas berlari sangat membantu.' : 'Anak sangat sensitif terhadap gerakan. Hindari gerakan mendadak dan kenalkan secara bertahap.',
    proprioseptif: v >= 70 ? 'Kesadaran tubuh anak berkembang baik. Koordinasi dan kontrol kekuatan sudah sesuai usianya.' : v >= 45 ? 'Anak butuh input proprioseptif lebih. Aktivitas "heavy work" seperti mendorong benda sangat efektif.' : 'Anak kesulitan merasakan posisi dan kekuatan tubuhnya. Deep pressure dan heavy work diprioritaskan.',
    auditori: v >= 70 ? 'Pemrosesan suara anak sangat baik. Terus kenalkan musik dan permainan suara yang beragam.' : v >= 45 ? 'Anak perlu stimulasi auditori lebih terstruktur. Musik ritmikal dan permainan suara sangat membantu.' : 'Anak mudah terganggu atau kewalahan oleh suara. Siapkan lingkungan yang lebih tenang saat belajar.',
    visual: v >= 70 ? 'Pemrosesan visual anak sangat baik. Tracking mata dan diskriminasi visual berkembang baik.' : v >= 45 ? 'Beberapa aspek visual perlu dilatih. Puzzle dan aktivitas tracking visual sangat direkomendasikan.' : 'Anak mudah overwhelmed secara visual. Kurangi stimulus visual yang berlebihan di lingkungan belajar.',
    interoeptif: v >= 70 ? 'Kesadaran interoeptif anak berkembang baik. Anak bisa mengenali sinyal tubuhnya dengan baik.' : v >= 45 ? 'Anak perlu dibantu mengenali sinyal tubuhnya. Latihan napas dan body scan sederhana sangat membantu.' : 'Anak kesulitan mengenali sinyal dari dalam tubuhnya. Latihan mindfulness sederhana sangat diperlukan.',
  };
  return descs[id] || 'Perlu observasi lebih lanjut.';
}
 
function getKekuatan(s) {
  const kek = [];
  if ((s.auditori||50) >= 65) kek.push('Kemampuan mendengar dan fokus auditori yang baik');
  if ((s.visual||50) >= 65) kek.push('Pemrosesan visual dan perhatian terhadap detail yang tajam');
  if ((s.proprioseptif||50) >= 65) kek.push('Koordinasi dan kesadaran tubuh yang berkembang baik');
  if ((s.vestibular||50) >= 65) kek.push('Keseimbangan dan koordinasi gerak yang baik');
  if ((s.taktil||50) >= 65) kek.push('Toleransi sentuhan dan eksplorasi fisik yang baik');
  if ((s.interoeptif||50) >= 65) kek.push('Kesadaran dan kepekaan terhadap sinyal tubuh sendiri');
  if (kek.length === 0) kek.push('Sedang dalam proses perkembangan yang unik', 'Memiliki potensi yang bisa dikembangkan dengan stimulasi tepat');
  return kek.slice(0, 3);
}
 
// ═══════════════════════════════════════════
// BERANDA
// ═══════════════════════════════════════════
function renderBeranda() {
  const name = currentUser ? (currentUser.user_metadata?.full_name || currentUser.email?.split('@')[0] || 'Bunda') : 'Bunda';
  const h = new Date().getHours();
  const greet = h < 11 ? 'Selamat pagi' : h < 15 ? 'Selamat siang' : h < 18 ? 'Selamat sore' : 'Selamat malam';
  document.getElementById('beranda-name').textContent = name;
  document.getElementById('beranda-time').textContent = new Date().toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'});
 
  const childName = currentChild ? currentChild.name : null;
  document.getElementById('beranda-sub').textContent = childName
    ? `${childName} butuh perhatian di ${getWeakAreas(scores).length} area hari ini`
    : 'Mulai dengan observasi sensorik anak';
 
  // Chips
  const chipsHtml = childName
    ? `<div class="chip on"><div class="chip-av" style="background:var(--sage)">${childName.slice(0,2).toUpperCase()}</div><span class="chip-nm">${childName}</span></div>
       <div class="chip" onclick="goScreen('s-onboard')"><div class="chip-av" style="background:var(--text3)">+</div><span class="chip-nm">Tambah anak</span></div>`
    : `<div class="chip on" onclick="goScreen('s-onboard')"><div class="chip-av" style="background:var(--peach)">+</div><span class="chip-nm">Tambah anak pertama</span></div>`;
  document.getElementById('chips-row').innerHTML = chipsHtml;
 
  if (!childName || Object.keys(scores).length === 0) {
    document.getElementById('beranda-body').innerHTML = `
      <div class="card card-p" style="text-align:center;padding:32px 20px">
        <div style="font-size:40px;margin-bottom:12px">🌱</div>
        <div style="font-family:'Nunito',sans-serif;font-size:16px;font-weight:800;color:var(--text);margin-bottom:6px">Mulai observasi sensorik</div>
        <div style="font-size:13px;color:var(--text2);line-height:1.6;margin-bottom:20px">Kenali profil sensorik unik anak untuk pendampingan yang lebih tepat</div>
        <button class="btn btn-primary" onclick="goScreen('s-onboard')">Mulai sekarang →</button>
      </div>
    `;
    return;
  }
 
  const weakAreas = getWeakAreas(scores);
  const sorted = Object.entries(scores).sort((a,b) => a[1]-b[1]);
  const topWeak = sorted.slice(0,2).map(([id]) => PUSAT.find(p=>p.id===id));
 
  const aktHariIni = AKTIVITAS
    .filter(a => weakAreas.includes(a.pusat))
    .slice(0, 3);
 
  document.getElementById('beranda-body').innerHTML = `
    <div class="hero-card">
      <div class="hc-lbl">Profil sensorik ${childName}</div>
      <div class="hc-t">${topWeak.map(p=>p.label.replace('Sistem ','')).join(' & ')} perlu perhatian</div>
      <div class="hc-chips">
        ${PUSAT.map(p => `<div class="hc-chip ${(scores[p.id]||50) < 60 ? 'al' : ''}">${(scores[p.id]||50) >= 60 ? '✅' : '⚠'} ${p.icon}</div>`).join('')}
      </div>
    </div>
 
    <div>
      <div class="sec-row"><span class="sec-t">Sistem sensorik</span><span class="sec-lnk" onclick="goScreen('s-hasil')">Lihat detail →</span></div>
      <div class="ins-row">
        ${PUSAT.map(p => {
          const v = scores[p.id]||50;
          return `<div class="ins-mini" onclick="goScreen('s-hasil')">
            <div class="im-ic">${p.icon}</div>
            <div class="im-n">${p.label.replace('Sistem ','').substring(0,12)}</div>
            <div class="im-d">${v>=70?'Baik':v>=45?'Perlu stimulasi':'Prioritas'}</div>
            <div class="im-dot ${v>=70?'d-ok':v>=45?'d-mid':'d-warn'}"></div>
          </div>`;
        }).join('')}
      </div>
    </div>
 
    <div>
      <div class="sec-row"><span class="sec-t">Aktivitas hari ini</span><span class="sec-lnk" onclick="navTo('aktivitas')">Semua →</span></div>
      <div class="act-list">
        ${aktHariIni.length > 0 ? aktHariIni.map((a, i) => `
          <div class="act-row">
            <div class="act-ico ${a.clr}">${a.ico}</div>
            <div style="flex:1">
              <div class="act-n">${a.nama}</div>
              <div class="act-m">${PUSAT.find(p=>p.id===a.pusat)?.label.replace('Sistem ','')} · ${a.durasi}</div>
            </div>
            ${isPremium
              ? `<div class="chk ${i===0?'done':''}" onclick="this.classList.toggle('done');this.textContent=this.classList.contains('done')?'✓':'';">${i===0?'✓':''}</div>`
              : i===0
                ? `<div class="chk done" onclick="this.classList.toggle('done');this.textContent=this.classList.contains('done')?'✓':'';">✓</div>`
                : `<span class="act-lock" onclick="openLynk()">🔒</span>`
            }
          </div>
        `).join('') : `<div style="font-size:13px;color:var(--text2);text-align:center;padding:16px">Belum ada rekomendasi aktivitas</div>`}
      </div>
    </div>
 
    <div class="sukses">
      <div class="suk-t">⭐ 3 sukses kecil hari ini</div>
      ${['Mau mencoba tekstur baru','Duduk fokus 5 menit','Bermain tenang bersama orang tua'].map((t,i) => `
        <div class="suk-i" onclick="toggleSukses(this)">
          <div class="suk-b ${i===0?'on':'}'}">${i===0?'✓':''}</div>
          <div class="suk-tx ${i===0?'done':''}">${t}</div>
        </div>
      `).join('')}
    </div>
 
    ${!isPremium ? `
      <div class="hero-card" style="cursor:pointer" onclick="openLynk()">
        <div class="hc-lbl">Upgrade ke Premium</div>
        <div class="hc-t">Buka semua fitur & aktivitas</div>
        <div style="margin-top:10px;padding:10px 16px;background:rgba(255,255,255,.2);border-radius:10px;font-size:13px;font-family:'Nunito',sans-serif;font-weight:700;color:#fff;text-align:center">Mulai Rp49.000/bulan →</div>
      </div>
    ` : ''}
    <div style="height:8px"></div>
  `;
}
 
function getWeakAreas(s) {
  return Object.entries(s).filter(([,v]) => v < 65).map(([id]) => id);
}
 
function toggleSukses(el) {
  const b = el.querySelector('.suk-b');
  const t = el.querySelector('.suk-tx');
  b.classList.toggle('on');
  b.textContent = b.classList.contains('on') ? '✓' : '';
  t.classList.toggle('done');
}
 
// ═══════════════════════════════════════════
// AKTIVITAS
// ═══════════════════════════════════════════
let currentFilter = 'semua';
 
function renderAktivitas() {
  const childName = currentChild ? currentChild.name : null;
  document.getElementById('akt-sub').textContent = childName
    ? `Rekomendasi untuk ${childName} · ${isPremium ? 'Premium' : 'Gratis — 1 aktivitas'}`
    : 'Panduan kegiatan stimulasi sensorik';
 
  renderAktList();
}
 
function filterAkt(btn, filter) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('on'));
  btn.classList.add('on');
  currentFilter = filter;
  renderAktList();
}
 
function renderAktList() {
  const filtered = currentFilter === 'semua' ? AKTIVITAS : AKTIVITAS.filter(a => a.pusat === currentFilter);
 
  const html = !isPremium ? `
    <div class="premium-gate">
      <div class="pg-em">🎯</div>
      <div class="pg-t">Aktivitas Premium</div>
      <div class="pg-s">Dapatkan akses ke semua aktivitas stimulasi yang dipersonalisasi sesuai profil sensorik anak</div>
      <div class="pg-price">Rp49.000</div>
      <div class="pg-per">per bulan · batalkan kapan saja</div>
      <button class="btn-white" onclick="openLynk()">Mulai Langganan →</button>
    </div>
    <div class="label-xs" style="margin-bottom:10px">Preview aktivitas</div>
    ${filtered.slice(0,2).map(renderAktCard).join('')}
    ${filtered.slice(2).map(a => renderAktCardLocked(a)).join('')}
  ` : filtered.map(renderAktCard).join('');
 
  document.getElementById('akt-body').innerHTML = html;
}
 
function renderAktCard(a) {
  const p = PUSAT.find(p => p.id === a.pusat);
  return `
    <div class="akt-card">
      <div class="akt-top">
        <div class="akt-ico-big ${a.clr}">${a.ico}</div>
        <div>
          <div class="akt-name">${a.nama}</div>
          <div class="akt-tags">
            <span class="tag ${a.tags[0]}">${p?.label.replace('Sistem ','')}</span>
            <span class="tag tag-sky">${a.durasi}</span>
            <span class="tag tag-lav">Level ${a.level}</span>
          </div>
        </div>
      </div>
      <div class="akt-desc">${a.desc}</div>
    </div>
  `;
}
 
function renderAktCardLocked(a) {
  const p = PUSAT.find(p => p.id === a.pusat);
  return `
    <div class="akt-card" style="opacity:.5;filter:blur(2px);pointer-events:none">
      <div class="akt-top">
        <div class="akt-ico-big ${a.clr}">🔒</div>
        <div>
          <div class="akt-name">${a.nama}</div>
          <div class="akt-tags">
            <span class="tag ${a.tags[0]}">${p?.label.replace('Sistem ','')}</span>
            <span class="tag tag-sky">${a.durasi}</span>
          </div>
        </div>
      </div>
    </div>
  `;
}
 
// ═══════════════════════════════════════════
// PROFIL
// ═══════════════════════════════════════════
function renderProfil() {
  const name = currentUser ? (currentUser.user_metadata?.full_name || currentUser.email?.split('@')[0] || '—') : '—';
  const email = currentUser ? currentUser.email : '—';
  document.getElementById('profil-name').textContent = name;
  document.getElementById('profil-email').textContent = email;
  const planEl = document.getElementById('profil-plan');
  planEl.textContent = isPremium ? '⭐ Paket Premium' : 'Paket Gratis';
  planEl.className = 'plan-chip ' + (isPremium ? 'plan-pro' : 'plan-free');
}
 
// ═══════════════════════════════════════════
// NAVIGATION
// ═══════════════════════════════════════════
const SCREENS_WITH_NAV = ['s-beranda','s-aktivitas','s-hasil','s-profil'];
 
function goScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
 
  const showNav = SCREENS_WITH_NAV.includes(id);
  document.getElementById('bnav').classList.toggle('show', showNav);
 
  if (id === 's-beranda') renderBeranda();
  if (id === 's-aktivitas') renderAktivitas();
  if (id === 's-hasil') renderHasil();
  if (id === 's-profil') renderProfil();
}
 
function showApp() {
  document.getElementById('bnav').classList.add('show');
  if (currentChild && Object.keys(scores).length > 0) {
    goScreen('s-beranda');
  } else {
    goScreen('s-onboard');
  }
}
 
function navTo(tab) {
  const map = { beranda:'s-beranda', aktivitas:'s-aktivitas', hasil:'s-hasil', profil:'s-profil' };
  goScreen(map[tab]);
  document.querySelectorAll('.bnav-i').forEach((el, i) => {
    el.classList.toggle('on', ['beranda','aktivitas','hasil','profil'][i] === tab);
  });
}
 
// ═══════════════════════════════════════════
// UTILS
// ═══════════════════════════════════════════
function openLynk() {
  window.open(LYNK_URL, '_blank');
}
 
function showErr(msg) {
  const el = document.getElementById('login-err');
  el.textContent = msg;
  el.style.display = 'block';
  setTimeout(() => el.style.display = 'none', 4000);
}
 
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}
 
// ═══════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════
document.addEventListener('DOMContentLoaded', initApp);
