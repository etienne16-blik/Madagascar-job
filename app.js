(() => {
 const cfg=window.MADA_CONFIG||{};
 const $=id=>document.getElementById(id);
 const note=t=>$('notice').textContent=t;
 if(!window.supabase||!cfg.SUPABASE_URL||cfg.SUPABASE_URL.includes('VOTRE-PROJET')||!cfg.SUPABASE_ANON_KEY||cfg.SUPABASE_ANON_KEY.includes('VOTRE_')){
   note('Configuration requise : renseignez js/config.js avec URL et clé anon publique Supabase.');
   return;
 }
 const db=window.supabase.createClient(cfg.SUPABASE_URL,cfg.SUPABASE_ANON_KEY);
 let user=null;
 const money=n=>Number(n||0).toLocaleString('fr-FR')+' Ar';
 async function refresh(){
  const {data:{user:u}}=await db.auth.getUser(); user=u;
  $('auth').classList.toggle('hidden',!!user);$('dashboard').classList.toggle('hidden',!user);$('logout').classList.toggle('hidden',!user);
  if(!user){$('session-state').textContent='Connectez-vous pour accéder à votre espace.';return;}
  $('session-state').textContent=user.email||'Connecté';
  const {data:p,error}=await db.from('profiles').select('balance,referral_code').eq('id',user.id).single();
  if(error){note(error.message);return;}
  $('balance').textContent=money(p.balance);$('ref-code').textContent=p.referral_code||'—';
  const today=new Date().toLocaleDateString('en-CA');
  const {data:c}=await db.from('task_completions').select('id,status').eq('user_id',user.id).eq('completed_on',today).neq('status','rejected');
  $('done').textContent=(c||[]).length+' / 5';
  const {data:tx}=await db.from('wallet_transactions').select('amount').eq('user_id',user.id).eq('kind','earning');
  $('earned').textContent=money((tx||[]).reduce((a,x)=>a+Number(x.amount||0),0));
  await loadTasks();
 }
 async function auth(mode){
  const email=$('email').value.trim(),password=$('password').value;
  if(!email||password.length<6){note('Saisissez un e-mail et un mot de passe d’au moins 6 caractères.');return;}
  let r;
  if(mode==='signup') r=await db.auth.signUp({email,password,options:{data:{full_name:$('name').value.trim(),account_type:$('account-type').value}}});
  else r=await db.auth.signInWithPassword({email,password});
  if(r.error)note(r.error.message);else{note(mode==='signup'?'Compte créé. Vérifiez votre e-mail si la confirmation est activée.':'Connexion réussie.');await refresh();}
 }
 $('signup').onclick=()=>auth('signup');$('login').onclick=()=>auth('login');
 $('logout').onclick=async()=>{await db.auth.signOut();note('Déconnexion effectuée.');await refresh();};
 async function loadTasks(){
  const box=$('task-list');box.textContent='Chargement…';
  const {data,error}=await db.from('tasks').select('id,title,description,reward,type').eq('active',true).order('id');
  if(error){box.textContent=error.message;return;}
  box.innerHTML='';
  (data||[]).forEach(t=>{
   const el=document.createElement('div');el.className='task';
   const title=document.createElement('b');title.textContent=t.title||'Mission';
   const desc=document.createElement('p');desc.className='muted';desc.textContent=(t.description||'')+' · '+money(t.reward);
   const btn=document.createElement('button');btn.textContent='Soumettre';
   btn.onclick=async()=>{const proof=prompt(t.type==='social'?'Collez le lien de votre publication :':'Décrivez brièvement votre preuve :');if(proof===null)return;
    const {data,error}=await db.rpc('submit_task',{p_task:t.id,p_proof:proof,p_path:null});
    note(error?error.message:'Mission envoyée pour validation. Référence : '+data);};
   el.append(title,desc,btn);box.append(el);
  });
  if(!data?.length)box.textContent='Aucune mission active pour le moment.';
 }
 $('withdraw').onclick=async()=>{
  const amount=Number($('withdraw-amount').value),method=$('withdraw-method').value,phone=$('withdraw-phone').value.trim();
  const {data,error}=await db.rpc('request_withdrawal',{p_amount:amount,p_method:method,p_phone:phone});
  note(error?error.message:'Demande de retrait enregistrée, en attente de validation. Référence : '+data);await refresh();
 };
 $('copy-code').onclick=async()=>{await navigator.clipboard.writeText($('ref-code').textContent);note('Code copié.');};
 $('apply-ref').onclick=async()=>{const {error}=await db.rpc('apply_referral_code',{p_code:$('ref-input').value.trim()});note(error?error.message:'Code de parrainage appliqué.');await refresh();};
 db.auth.onAuthStateChange(()=>setTimeout(refresh,0));refresh();
})();