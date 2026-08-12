document.getElementById('year').textContent = new Date().getFullYear();

const navToggle = document.getElementById('nav-toggle');
const menu = document.getElementById('menu');

navToggle.addEventListener('click', () => {
  navToggle.classList.toggle('open');
  menu.classList.toggle('open');
});

menu.querySelectorAll('.menu-link').forEach((link) => {
  link.addEventListener('click', () => {
    navToggle.classList.remove('open');
    menu.classList.remove('open');
  });
});

const navLinks = document.querySelectorAll('[data-nav]');
const sections = [...navLinks].map((link) => document.querySelector(link.getAttribute('href')));

function updateActiveNav() {
  const scrollPos = window.scrollY + window.innerHeight * 0.35;
  let currentIndex = 0;
  sections.forEach((sec, i) => {
    if (sec && sec.offsetTop <= scrollPos) currentIndex = i;
  });
  navLinks.forEach((link, i) => link.classList.toggle('active', i === currentIndex));
}
window.addEventListener('scroll', updateActiveNav, { passive: true });
updateActiveNav();

const toTop = document.querySelector('.to-top');
if (toTop) {
  window.addEventListener('scroll', () => {
    toTop.classList.toggle('visible', window.scrollY > 500);
  }, { passive: true });
}

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);
document.querySelectorAll('[data-reveal]').forEach((el) => observer.observe(el));

if (window.VanillaTilt) {
  VanillaTilt.init(document.querySelectorAll('[data-tilt]'), {
    glare: false,
  });
}
