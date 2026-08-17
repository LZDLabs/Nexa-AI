const SUPABASE_URL = 'https://lboorssxoqiprovnczmg.supabase.co';
const SUPABASE_KEY = 'sb_publishable_-XDmQLLpjFb-Vi0CoHOnXA_qtX9wkDV';
const { createClient } = window.supabase;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const startButton = document.getElementById('startButton');
const heroButton = document.getElementById('heroButton');
const authBackdrop = document.getElementById('authBackdrop');
const dashboardBackdrop = document.getElementById('dashboardBackdrop');
const closeAuth = document.getElementById('closeAuth');
const closeDashboard = document.getElementById('closeDashboard');
const authForm = document.getElementById('authForm');
const authTitle = document.getElementById('authTitle');
const authSubtitle = document.getElementById('authSubtitle');
const authSubmit = document.getElementById('authSubmit');
const authMessage = document.getElementById('authMessage');
const switchAuth = document.getElementById('switchAuth');
const nameField = document.getElementById('nameField');
const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const userEmail = document.getElementById('userEmail');
const userPlan = document.getElementById('userPlan');
const userCredits = document.getElementById('userCredits');
const signOutButton = document.getElementById('signOut');

let isSignIn = false;

function openAuth() { authBackdrop.hidden = false; authMessage.textContent = ''; emailInput.focus(); }
function closeAuthModal() { authBackdrop.hidden = true; }
function openDashboard() { dashboardBackdrop.hidden = false; }
function closeDashboardModal() { dashboardBackdrop.hidden = true; }

function setAuthMode(signIn) {
  isSignIn = signIn;
  authTitle.textContent = isSignIn ? 'Welcome back.' : 'Create your account';
  authSubtitle.textContent = isSignIn ? 'Sign in to continue building.' : 'Start building with 100 free credits.';
  nameField.hidden = isSignIn;
  nameInput.required = !isSignIn;
  passwordInput.autocomplete = isSignIn ? 'current-password' : 'new-password';
  authSubmit.innerHTML = isSignIn ? 'Sign in <span>→</span>' : 'Create account <span>→</span>';
  switchAuth.textContent = isSignIn ? 'New to NEXA? Create an account' : 'Already have an account? Sign in';
  authMessage.textContent = '';
}

async function loadProfile(user) {
  const { data, error } = await supabase.from('profiles').select('plan, credits, display_name').eq('id', user.id).maybeSingle();
  if (error) { console.error(error); return; }
  userEmail.textContent = user.email || '';
  userPlan.textContent = data?.plan ? data.plan.charAt(0).toUpperCase() + data.plan.slice(1) : 'Free';
  userCredits.textContent = data?.credits ?? 100;
}

async function handleAuth(event) {
  event.preventDefault();
  authSubmit.disabled = true;
  authMessage.textContent = 'Connecting...';
  try {
    if (isSignIn) {
      const { data, error } = await supabase.auth.signInWithPassword({ email: emailInput.value.trim(), password: passwordInput.value });
      if (error) throw error;
      await loadProfile(data.user);
      closeAuthModal(); openDashboard();
    } else {
      const { data, error } = await supabase.auth.signUp({ email: emailInput.value.trim(), password: passwordInput.value, options: { data: { display_name: nameInput.value.trim() } } });
      if (error) throw error;
      if (data.session && data.user) {
        await loadProfile(data.user);
        closeAuthModal(); openDashboard();
      } else {
        authMessage.textContent = 'Account created. Check your email to confirm your account, then sign in.';
        setAuthMode(true);
      }
    }
  } catch (error) {
    authMessage.textContent = error.message || 'Something went wrong. Try again.';
  } finally { authSubmit.disabled = false; }
}

async function showCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  if (user) { await loadProfile(user); openDashboard(); }
}

startButton.addEventListener('click', async () => { const { data: { user } } = await supabase.auth.getUser(); if (user) openDashboard(); else openAuth(); });
heroButton.addEventListener('click', async () => { const { data: { user } } = await supabase.auth.getUser(); if (user) openDashboard(); else openAuth(); });
closeAuth.addEventListener('click', closeAuthModal);
closeDashboard.addEventListener('click', closeDashboardModal);
switchAuth.addEventListener('click', () => setAuthMode(!isSignIn));
authForm.addEventListener('submit', handleAuth);
signOutButton.addEventListener('click', async () => { await supabase.auth.signOut(); closeDashboardModal(); });
authBackdrop.addEventListener('click', (event) => { if (event.target === authBackdrop) closeAuthModal(); });
dashboardBackdrop.addEventListener('click', (event) => { if (event.target === dashboardBackdrop) closeDashboardModal(); });
supabase.auth.onAuthStateChange((event) => { if (event === 'SIGNED_OUT') closeDashboardModal(); });
showCurrentUser();
