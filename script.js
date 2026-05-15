// ═══════════════════════════════════════════
// CONFIG
// ═══════════════════════════════════════════
const SUPABASE_URL =
  'https://spflyyqvawiiuazchyht.supabase.co';

const SUPABASE_ANON_KEY =
  'sb_publishable__4QG6YPTKjHGOUaNJSNdYg_7aI3UC8-';

const LYNK_URL =
  'https://lynk.id/r4hm4wati/18d2eg4nl2gy/checkout';


// ═══════════════════════════════════════════
// CHECK SUPABASE
// ═══════════════════════════════════════════
if (!window.supabase) {

  alert(
    'Supabase gagal dimuat. Pastikan CDN supabase sudah ada di HTML.'
  );
}


// ═══════════════════════════════════════════
// SUPABASE INIT
// ═══════════════════════════════════════════
const { createClient } = supabase;

const sb = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  }
);


// ═══════════════════════════════════════════
// AUTH STATE LISTENER
// ═══════════════════════════════════════════
sb.auth.onAuthStateChange(
  async (event, session) => {

    console.log(
      'AUTH EVENT:',
      event
    );

    console.log(
      'AUTH SESSION:',
      session
    );

    // LOGIN BERHASIL
    if (
      event === 'SIGNED_IN' &&
      session?.user
    ) {

      currentUser =
        session.user;

      await loadUserData();

      showApp();
    }

    // LOGOUT
    if (
      event === 'SIGNED_OUT'
    ) {

      currentUser = null;

      goScreen('s-login');
    }
  }
);


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
// GOOGLE LOGIN
// ═══════════════════════════════════════════
async function doGoogleLogin() {

  console.log(
    'Google login clicked'
  );

  try {

    const {
      data,
      error
    } =
      await sb.auth.signInWithOAuth({

        provider: 'google',

        options: {

          redirectTo:
            window.location.origin
        }
      });

    console.log(
      'OAuth result:',
      data
    );

    if (error) {

      console.log(
        'OAuth error:',
        error
      );

      alert(error.message);
    }

  } catch (err) {

    console.log(
      'Google login crash:',
      err
    );

    alert(
      'Terjadi error saat login Google'
    );
  }
}


// ═══════════════════════════════════════════
// LOGIN EMAIL
// ═══════════════════════════════════════════
async function doLogin() {

  console.log(
    'Login email clicked'
  );

  const email = document
    .getElementById(
      'login-email'
    )
    ?.value.trim();

  const pass =
    document.getElementById(
      'login-pass'
    )
    ?.value;

  if (!email || !pass) {

    showErr(
      'Isi email dan kata sandi dulu ya'
    );

    return;
  }

  const loginBtn =
    document.getElementById(
      'login-btn'
    );

  if (loginBtn) {

    loginBtn.textContent =
      'Memproses...';

    loginBtn.disabled = true;
  }

  const {
    data,
    error
  } =
    await sb.auth.signInWithPassword({

      email,
      password: pass
    });

  if (error) {

    console.log(error);

    showErr(

      error.message ===
      'Invalid login credentials'

        ? 'Email atau kata sandi salah'

        : error.message
    );

    if (loginBtn) {

      loginBtn.textContent =
        'Masuk →';

      loginBtn.disabled = false;
    }

    return;
  }

  currentUser = data.user;

  await loadUserData();

  showApp();
}


// ═══════════════════════════════════════════
// REGISTER
// ═══════════════════════════════════════════
async function doRegister() {

  console.log(
    'Register clicked'
  );

  const email = document
    .getElementById(
      'login-email'
    )
    ?.value.trim();

  const pass =
    document.getElementById(
      'login-pass'
    )
    ?.value;

  if (!email || !pass) {

    showErr(
      'Isi email dan kata sandi dulu ya'
    );

    return;
  }

  if (pass.length < 6) {

    showErr(
      'Kata sandi minimal 6 karakter'
    );

    return;
  }

  const loginBtn =
    document.getElementById(
      'login-btn'
    );

  if (loginBtn) {

    loginBtn.textContent =
      'Mendaftarkan...';

    loginBtn.disabled = true;
  }

  const {
    data,
    error
  } =
    await sb.auth.signUp({

      email,
      password: pass
    });

  if (error) {

    console.log(error);

    showErr(error.message);

    if (loginBtn) {

      loginBtn.textContent =
        'Masuk →';

      loginBtn.disabled = false;
    }

    return;
  }

  currentUser = data.user;

  showToast(
    'Akun berhasil dibuat'
  );

  await loadUserData();

  showApp();
}


// ═══════════════════════════════════════════
// LOGOUT
// ═══════════════════════════════════════════
async function doLogout() {

  await sb.auth.signOut();

  currentUser = null;

  currentChild = null;

  scores = {};

  document
    .getElementById(
      'bnav'
    )
    ?.classList.remove(
      'show'
    );

  goScreen('s-login');
}


// ═══════════════════════════════════════════
// CHECK SESSION
// ═══════════════════════════════════════════
async function initApp() {

  console.log(
    'App init'
  );

  try {

    const {
      data: { session }
    } =
      await sb.auth.getSession();

    console.log(
      'Session:',
      session
    );

    if (session?.user) {

      currentUser =
        session.user;

      await loadUserData();

      showApp();

    } else {

      goScreen(
        's-login'
      );
    }

  } catch (err) {

    console.log(
      'Init error:',
      err
    );

    goScreen(
      's-login'
    );
  }
}


// ═══════════════════════════════════════════
// LOAD USER DATA
// ═══════════════════════════════════════════
async function loadUserData() {

  if (!currentUser) return;

  try {

    const { data } =
      await sb
        .from('children')
        .select('*')
        .eq(
          'user_id',
          currentUser.id
        )
        .order(
          'created_at',
          {
            ascending: false
          }
        )
        .limit(1);

    if (
      data &&
      data.length > 0
    ) {

      currentChild =
        data[0];

      const {
        data: results
      } =
        await sb
          .from(
            'sensory_results'
          )
          .select('*')
          .eq(
            'child_id',
            currentChild.id
          )
          .order(
            'created_at',
            {
              ascending: false
            }
          )
          .limit(1);

      if (
        results &&
        results.length > 0
      ) {

        scores =
          results[0].scores || {};
      }
    }

    const {
      data: profile
    } =
      await sb
        .from('profiles')
        .select(
          'is_premium'
        )
        .eq(
          'id',
          currentUser.id
        )
        .single();

    if (profile) {

      isPremium =
        profile.is_premium || false;
    }

  } catch (e) {

    console.log(
      'Load data error:',
      e
    );
  }
}


// ═══════════════════════════════════════════
// SAVE CHILD
// ═══════════════════════════════════════════
async function saveChild(
  name,
  age
) {

  const {
    data,
    error
  } =
    await sb
      .from('children')
      .upsert({

        user_id:
          currentUser.id,

        name,

        age_range: age

      })
      .select()
      .single();

  if (
    !error &&
    data
  ) {

    currentChild = data;
  }
}


// ═══════════════════════════════════════════
// SAVE RESULTS
// ═══════════════════════════════════════════
async function saveResults(
  scrs
) {

  scores = scrs;

  await sb
    .from(
      'sensory_results'
    )
    .insert({

      child_id:
        currentChild.id,

      user_id:
        currentUser.id,

      scores: scrs,

      created_at:
        new Date().toISOString()
    });
}


// ═══════════════════════════════════════════
// UTILS
// ═══════════════════════════════════════════
function openLynk() {

  window.open(
    LYNK_URL,
    '_blank'
  );
}

function showErr(msg) {

  console.log(
    'ERROR:',
    msg
  );

  const el =
    document.getElementById(
      'login-err'
    );

  if (!el) {

    alert(msg);

    return;
  }

  el.textContent = msg;

  el.style.display =
    'block';

  setTimeout(() => {

    el.style.display =
      'none';

  }, 4000);
}

function showToast(msg) {

  const t =
    document.getElementById(
      'toast'
    );

  if (!t) return;

  t.textContent = msg;

  t.classList.add(
    'show'
  );

  setTimeout(() => {

    t.classList.remove(
      'show'
    );

  }, 3000);
}


// ═══════════════════════════════════════════
// FORCE BUTTON CHECK
// ═══════════════════════════════════════════
document.addEventListener(
  'DOMContentLoaded',
  () => {

    console.log(
      'DOM loaded'
    );

    initApp();

    const gbtn =
      document.getElementById(
        'google-btn'
      );

    if (gbtn) {

      gbtn.addEventListener(
        'click',
        doGoogleLogin
      );

      console.log(
        'Google button connected'
      );

    } else {

      console.log(
        'google-btn NOT FOUND'
      );
    }
  }
);
