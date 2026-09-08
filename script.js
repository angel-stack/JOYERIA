const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('nav-glass');
      navbar.style.padding = '1rem 0';
    } else {
      navbar.classList.remove('nav-glass');
      navbar.style.padding = '1.5rem 0';
    }
  });

  const revealElements = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.15 });
  revealElements.forEach(el => observer.observe(el));

  let cart = [];
  const cartCountEl = document.getElementById('cartCount');
  const cartItemsEl = document.getElementById('cartItems');
  const cartTotalEl = document.getElementById('cartTotal');
  const cartSidebar = document.getElementById('cartSidebar');
  const closeCartBtn = document.getElementById('closeCart');
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toastMsg');

  function showToast(msg) {
    toastMsg.textContent = msg;
    toast.style.transform = 'translateY(0)';
    toast.style.opacity = '1';
    setTimeout(() => {
      toast.style.transform = 'translateY(6rem)';
      toast.style.opacity = '0';
    }, 2500);
  }


function crearBotonWhatsApp() {
  if (document.getElementById("btn-wa-flotante")) return;

  const botonFlotante = document.createElement("a");
  botonFlotante.id = "btn-wa-flotante";
  botonFlotante.href = "https://wa.link/0w7a68";
  botonFlotante.target = "_blank";
  botonFlotante.rel = "noopener noreferrer";
  botonFlotante.className = "fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold py-3 px-5 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-105 no-underline";
  
  botonFlotante.innerHTML = `
    <svg class="w-6 h-6 fill-current text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
      <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984 0 1.762.459 3.48 1.332 5.001L2 22l5.163-1.347a9.97 9.97 0 004.848 1.258h.004c5.506 0 9.99-4.478 9.99-9.985 0-2.667-1.038-5.176-2.925-7.062A9.924 9.924 0 0012.012 2zm0 18.326h-.003a8.3 8.3 0 01-4.234-1.164l-.304-.181-3.146.821.839-3.052-.198-.316a8.293 8.293 0 01-1.272-4.448c0-4.577 3.724-8.3 8.303-8.3a8.243 8.243 0 015.867 2.433 8.243 8.243 0 012.428 5.867c0 4.578-3.724 8.301-8.28 8.301zm4.551-6.223c-.25-.125-1.478-.729-1.707-.812-.229-.083-.396-.125-.563.125-.166.25-.646.812-.792.979-.146.166-.292.187-.542.062a6.852 6.852 0 01-2.013-1.24 7.56 7.56 0 01-1.393-1.737c-.146-.25-.016-.385.109-.509.112-.112.25-.292.375-.438.125-.146.166-.25.25-.417.083-.166.042-.312-.021-.437-.063-.125-.563-1.354-.771-1.854-.203-.487-.41-.421-.563-.428l-.48-.007c-.166 0-.437.062-.666.312s-.875.854-.875 2.083c0 1.229.896 2.417 1.02 2.584.125.166 1.761 2.688 4.267 3.771.596.257 1.061.411 1.424.526.598.19 1.142.163 1.572.099.48-.071 1.478-.604 1.687-1.187.208-.583.208-1.083.146-1.187-.063-.104-.229-.166-.479-.291z"/>
    </svg>
    <span>Pedir por WhatsApp</span>
  `;

  document.body.appendChild(botonFlotante);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", crearBotonWhatsApp);
} else {
  crearBotonWhatsApp();
}