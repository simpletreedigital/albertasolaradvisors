(function () {
  function boot() {
    var xhr1 = new XMLHttpRequest();
    var xhr2 = new XMLHttpRequest();
    var navHTML = '', footerHTML = '', done = 0;

    function stripScripts(html) {
      // Remove <script>...</script> blocks — we execute them manually
      return html.replace(/<script[\s\S]*?<\/script>/gi, '');
    }

    function execScripts(container) {
      // Re-execute any <script> tags that were in the injected HTML
      var scripts = container.querySelectorAll('script');
      scripts.forEach(function (oldScript) {
        var s = document.createElement('script');
        if (oldScript.src) {
          s.src = oldScript.src;
        } else {
          s.textContent = oldScript.textContent;
        }
        document.head.appendChild(s);
        oldScript.parentNode.removeChild(oldScript);
      });
    }

    function inject() {
      done++;
      if (done < 2) return;

      // ── Inject nav ──
      var navWrap = document.createElement('div');
      navWrap.innerHTML = navHTML;
      var navEl = navWrap.firstElementChild;
      if (navEl) {
        document.body.insertBefore(navEl, document.body.firstChild);
        execScripts(navEl);
      }

      // ── Inject footer ──
      var footerWrap = document.createElement('div');
      footerWrap.innerHTML = footerHTML;
      var footerEl = footerWrap.firstElementChild;
      if (footerEl) {
        document.body.appendChild(footerEl);
        execScripts(footerEl);
      }

      // ── Active link highlighting ──
      var path = window.location.pathname.replace(/\/$/, '');
      document.querySelectorAll('.gnav-link, .gnav-drop-link').forEach(function (a) {
        var hp = (a.getAttribute('href') || '').replace(/\/$/, '');
        if (hp && hp === path) a.classList.add('active');
      });

      // ── Burger toggle (mobile) ──
      var burger = document.getElementById('gnav-burger');
      var mob    = document.getElementById('gnav-mobile');
      if (burger && mob) {
        burger.addEventListener('click', function () {
          var isOpen = mob.classList.toggle('open');
          burger.setAttribute('aria-expanded', String(isOpen));
        });
        document.querySelectorAll('#gnav-mobile a').forEach(function (a) {
          a.addEventListener('click', function () {
            mob.classList.remove('open');
            burger.setAttribute('aria-expanded', 'false');
          });
        });
      }

      // ── Dropdown toggle ──
      // Define globally so onclick="toggleDrop(...)" in nav.html works
      window.toggleDrop = function (id) {
        document.querySelectorAll('.gnav-item').forEach(function (item) {
          if (item.id === id) {
            var isOpen = item.classList.toggle('open');
            var btn = item.querySelector('button[aria-haspopup]');
            if (btn) btn.setAttribute('aria-expanded', String(isOpen));
          } else {
            item.classList.remove('open');
            var btn = item.querySelector('button[aria-haspopup]');
            if (btn) btn.setAttribute('aria-expanded', 'false');
          }
        });
      };

      // Close dropdowns on outside click
      document.addEventListener('click', function (e) {
        if (!e.target.closest('.gnav-item')) {
          document.querySelectorAll('.gnav-item.open').forEach(function (item) {
            item.classList.remove('open');
            var btn = item.querySelector('button[aria-haspopup]');
            if (btn) btn.setAttribute('aria-expanded', 'false');
          });
        }
      });

      // Close on Escape
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
          document.querySelectorAll('.gnav-item.open').forEach(function (item) {
            item.classList.remove('open');
            var btn = item.querySelector('button[aria-haspopup]');
            if (btn) btn.setAttribute('aria-expanded', 'false');
          });
          // Also close survey popup if open
          var overlay = document.getElementById('sv-overlay');
          if (overlay && overlay.classList.contains('open')) {
            overlay.classList.remove('open');
            document.body.style.overflow = '';
          }
        }
      });

      // ── Survey popup (global, available to all pages) ──
      window.openSurvey = function () {
        var overlay = document.getElementById('sv-overlay');
        if (overlay) { overlay.classList.add('open'); document.body.style.overflow = 'hidden'; }
      };
      window.closeSurvey = function () {
        var overlay = document.getElementById('sv-overlay');
        if (overlay) { overlay.classList.remove('open'); document.body.style.overflow = ''; }
      };
      var overlay = document.getElementById('sv-overlay');
      if (overlay) {
        overlay.addEventListener('click', function (e) {
          if (e.target === this) window.closeSurvey();
        });
      }

      // ── Footer year ──
      var yrEl = document.getElementById('gf-year');
      if (yrEl) yrEl.textContent = new Date().getFullYear();
    }

    xhr1.open('GET', '/includes/nav.html', true);
    xhr1.onload = function () { navHTML = xhr1.responseText; inject(); };
    xhr1.onerror = function () { done++; }; // fail gracefully
    xhr1.send();

    xhr2.open('GET', '/includes/footer.html', true);
    xhr2.onload = function () { footerHTML = xhr2.responseText; inject(); };
    xhr2.onerror = function () { done++; };
    xhr2.send();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
