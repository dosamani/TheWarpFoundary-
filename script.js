document.getElementById('year').textContent = new Date().getFullYear();
const form = document.getElementById('signup');
const thanks = document.getElementById('thanks');
form.addEventListener('submit', (e)=>{ e.preventDefault(); thanks.hidden = false; form.reset(); });

// Mobile nav toggle
const btn = document.getElementById