// ═══════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════
document.addEventListener(
  'DOMContentLoaded',
  async () => {

    console.log('APP START');

    // cek session setelah redirect google
    const {
      data: { session },
      error
    } = await sb.auth.getSession();

    console.log('SESSION:', session);
    console.log('ERROR:', error);

    if (session?.user) {

      currentUser = session.user;

      console.log(
        'LOGIN BERHASIL:',
        currentUser.email
      );

      await loadUserData();

      showApp();

    } else {

      console.log(
        'BELUM LOGIN'
      );

      goScreen('s-login');
    }

    // force tombol google aktif
    const googleBtn =
      document.getElementById(
        'google-login-btn'
      );

    if (googleBtn) {

      googleBtn.style.pointerEvents =
        'auto';

      googleBtn.style.opacity = '1';

      googleBtn.disabled = false;

      googleBtn.addEventListener(
        'click',
        async (e) => {

          e.preventDefault();

          console.log(
            'GOOGLE BUTTON CLICKED'
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
                    'https://temani-cqctsekqe-kidveras-projects.vercel.app'

                }
              });

            console.log(
              'OAUTH DATA:',
              data
            );

            console.log(
              'OAUTH ERROR:',
              error
            );

            if (error) {

              showErr(error.message);
            }

          } catch (err) {

            console.log(
              'GOOGLE LOGIN ERROR:',
              err
            );

            showErr(
              'Google login gagal'
            );
          }
        }
      );
    }
  }
);
