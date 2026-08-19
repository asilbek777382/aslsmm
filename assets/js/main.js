/* Ochilish harakati — bo'lim ekranga kirganda bir marta.
   `prefers-reduced-motion` yoqilgan bo'lsa umuman ishlamaydi:
   harakat bezak, kerak bo'lsa usiz ham hammasi o'qiladi. */
(function () {
  var items = document.querySelectorAll("[data-reveal]");
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduced || !("IntersectionObserver" in window)) return; // hammasi ko'rinib turaveradi

  // Sinf SHU YERDA qo'yiladi: undan oldin mazmun ko'rinib turadi, ya'ni
  // skript yuklanmasa ham sahifa o'qiladi
  document.documentElement.classList.add("js-reveal");

  // Zaxira: kuzatuvchi biror sababga ko'ra ishlamasa 1.2 soniyadan keyin
  // hammasi baribir ochiladi — sahifa hech qachon bo'sh qolmaydi
  setTimeout(function () {
    items.forEach(function (el) { el.classList.add("in"); });
  }, 1200);

  var seen = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("in");
      seen.unobserve(entry.target); // bir marta — qayta-qayta miltillamasin
    });
  }, { rootMargin: "0px 0px -12% 0px" });

  items.forEach(function (el, i) {
    // Kichik kechikish: bir qatordagi kartalar ketma-ket chiqadi
    el.style.transitionDelay = (i % 4) * 60 + "ms";
    seen.observe(el);
  });
})();

/* Yil — qo'lda yangilab yurmaslik uchun */
(function () {
  var yil = document.getElementById("yil");
  if (yil) yil.textContent = String(new Date().getFullYear());
})();

/* Menyudagi faol havola — sahifa qaysi bo'limda ekanini ko'rsatadi */
(function () {
  var links = Array.prototype.slice.call(document.querySelectorAll('.nav-links a[href^="#"]'));
  if (!links.length || !("IntersectionObserver" in window)) return;

  var map = {};
  links.forEach(function (a) {
    var el = document.querySelector(a.getAttribute("href"));
    if (el) map[el.id] = a;
  });

  var spy = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      var link = map[entry.target.id];
      if (!link) return;
      if (entry.isIntersecting) {
        links.forEach(function (a) { a.classList.remove("is-active"); });
        link.classList.add("is-active");
      }
    });
  }, { rootMargin: "-45% 0px -50% 0px" });

  Object.keys(map).forEach(function (id) {
    var el = document.getElementById(id);
    if (el) spy.observe(el);
  });
})();
