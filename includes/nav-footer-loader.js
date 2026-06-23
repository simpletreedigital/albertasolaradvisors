(function () {
  function boot() {
    var xhr1 = new XMLHttpRequest();
    var xhr2 = new XMLHttpRequest();
    var nav = '', footer = '', done = 0;

    function inject() {
      done++;
      if (done < 2) return;
      // inject nav
      var tmp = document.createElement('div');
      tmp.innerHTML = nav;
      var navEl = tmp.firstChild;
      document.body.insertBefore(navEl, document.body.firstChild);
      // inject footer
      var tmp2 = document.createElement('div');
      tmp2.innerHTML = footer;
      document.body.appendChild(tmp2.firstChild);
      // active link
      var links = document.querySelectorAll('.gnav-link, .gnav-drop-link');
      var path = window.location.pathname.replace(/\/$/, '');
      links.forEach(function (a) {
        var hp = (a.getAttribute('href') || '').replace(/\/$/, '');
        if (hp && hp === path) a.classList.add('active');
      });
      // burger
      var burger = document.getElementById('gnav-burger');
      var mob = document.getElementById('gnav-mobile');
      if (burger && mob) {
        burger.addEventListener('click', function () {
          var open = mob.classList.toggle('open');
          burger.setAttribute('aria-expanded', String(open));
        });
      }
      // close mobile on link click
      document.querySelectorAll('#gnav-mobile a').forEach(function (a) {
        a.addEventListener('click', function () {
          if (mob) mob.classList.remove('open');
        });
      });
    }

    xhr1.open('GET', '/includes/nav.html', true);
    xhr1.onload = function () { nav = xhr1.responseText; inject(); };
    xhr1.send();

    xhr2.open('GET', '/includes/footer.html', true);
    xhr2.onload = function () { footer = xhr2.responseText; inject(); };
    xhr2.send();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
