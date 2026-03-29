// Language management
let currentLang = localStorage.getItem('dmd-lang') || 'ro';

function setLanguage(lang) {
  currentLang = lang;
  localStorage.setItem('dmd-lang', lang);
  document.documentElement.lang = lang;
  updateAllTranslations();
  updateLangButtons();
}

function t(key) {
  const keys = key.split('.');
  let value = translations[currentLang];
  for (const k of keys) {
    if (value && value[k] !== undefined) {
      value = value[k];
    } else {
      return key;
    }
  }
  return value;
}

function updateAllTranslations() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const value = t(key);
    if (value) {
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        el.placeholder = value;
      } else {
        el.textContent = value;
      }
    }
  });

  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    const key = el.getAttribute('data-i18n-html');
    const value = t(key);
    if (value) {
      el.innerHTML = value.replace(/\n/g, '<br>');
    }
  });

  // Update pricing factors list
  const factorsList = document.getElementById('pricing-factors');
  if (factorsList) {
    const factors = t('pricing.factors');
    if (Array.isArray(factors)) {
      factorsList.innerHTML = factors.map(f =>
        `<li class="flex items-center justify-center gap-2 text-slate-300">
          <svg class="w-4 h-4 text-amber-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
          </svg>
          ${f}
        </li>`
      ).join('');
    }
  }
}

function updateLangButtons() {
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === currentLang);
  });
}

// Mobile menu
function toggleMobileMenu() {
  const menu = document.getElementById('mobile-menu');
  const overlay = document.getElementById('menu-overlay');
  menu.classList.toggle('translate-x-full');
  overlay.classList.toggle('hidden');
  document.body.classList.toggle('overflow-hidden');
}

// Smooth scroll
function scrollToSection(id) {
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    // Close mobile menu if open
    const menu = document.getElementById('mobile-menu');
    if (!menu.classList.contains('translate-x-full')) {
      toggleMobileMenu();
    }
  }
}

// Navbar background on scroll
function handleNavScroll() {
  const nav = document.getElementById('navbar');
  if (window.scrollY > 50) {
    nav.classList.add('nav-scrolled');
  } else {
    nav.classList.remove('nav-scrolled');
  }
}

// Scroll animations
function handleScrollAnimations() {
  const elements = document.querySelectorAll('.animate-on-scroll');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animated');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  elements.forEach(el => observer.observe(el));
}

// Counter animation for stats
function animateCounters() {
  const counters = document.querySelectorAll('.counter');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const counter = entry.target;
        const target = parseInt(counter.dataset.target);
        const suffix = counter.dataset.suffix || '';
        const duration = 2000;
        const steps = 60;
        const increment = target / steps;
        let current = 0;
        const timer = setInterval(() => {
          current += increment;
          if (current >= target) {
            current = target;
            clearInterval(timer);
          }
          counter.textContent = Math.floor(current) + suffix;
        }, duration / steps);
        observer.unobserve(counter);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(c => observer.observe(c));
}

// Contact form
function handleContactForm(e) {
  e.preventDefault();
  const form = e.target;
  const formData = new FormData(form);
  const submitBtn = form.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;

  submitBtn.disabled = true;
  submitBtn.textContent = '...';

  fetch('contact.php', {
    method: 'POST',
    body: formData
  })
  .then(response => response.json())
  .then(data => {
    const msg = document.getElementById('form-message');
    if (data.success) {
      msg.textContent = t('contact.form.success');
      msg.className = 'mt-4 p-3 rounded-lg bg-green-900/50 text-green-300 text-sm';
      form.reset();
    } else {
      msg.textContent = t('contact.form.error');
      msg.className = 'mt-4 p-3 rounded-lg bg-red-900/50 text-red-300 text-sm';
    }
    msg.classList.remove('hidden');
  })
  .catch(() => {
    const msg = document.getElementById('form-message');
    // Fallback: open mailto
    const name = formData.get('name');
    const email = formData.get('email');
    const phone = formData.get('phone');
    const company = formData.get('company');
    const message = formData.get('message');
    const subject = encodeURIComponent('Solicitare ofertă - ' + (company || name));
    const body = encodeURIComponent(`Nume: ${name}\nEmail: ${email}\nTelefon: ${phone}\nCompanie: ${company || '-'}\n\n${message}`);
    window.location.href = `mailto:office@dmdsecurity.ro?subject=${subject}&body=${body}`;
    msg.textContent = t('contact.form.success');
    msg.className = 'mt-4 p-3 rounded-lg bg-green-900/50 text-green-300 text-sm';
    msg.classList.remove('hidden');
    form.reset();
  })
  .finally(() => {
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
  });
}

// Init
document.addEventListener('DOMContentLoaded', () => {
  setLanguage(currentLang);
  handleScrollAnimations();
  animateCounters();
  window.addEventListener('scroll', handleNavScroll);

  const form = document.getElementById('contact-form');
  if (form) form.addEventListener('submit', handleContactForm);

  // Lang buttons
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => setLanguage(btn.dataset.lang));
  });

  // Nav links
  document.querySelectorAll('[data-scroll]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      scrollToSection(link.dataset.scroll);
    });
  });
});
