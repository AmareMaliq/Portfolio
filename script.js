// navbar fixed
window.onscroll = function () {
  const header = document.querySelector('header');
  const fixedNav = header.offsetTop;
  const toTop = document.querySelector('#to-top');

  if (window.pageYOffset > fixedNav) {
    header.classList.add('navbar-fixed');
    toTop.classList.remove('to-top-hidden');
  } else {
    header.classList.remove('navbar-fixed');
    toTop.classList.add('to-top-hidden');
  }
};

// klik diluar hamburger
window.addEventListener('click', function (e) {
  if (e.target != hamburger && e.target != navMenu) {
    hamburger.classList.remove('hamburger-active');
    navMenu.classList.add('nav-closed');
  }
});

// Hamburger
const hamburger = document.querySelector('#hamburger');
const navMenu = document.querySelector('#nav-menu');
hamburger.addEventListener('click', function () {
  hamburger.classList.toggle('hamburger-active');
  navMenu.classList.toggle('nav-closed');
});

// custom cursor
document.addEventListener('DOMContentLoaded', function () {
  const cursorOuter = document.querySelector('[data-cursor-outer]');
  const cursorInner = document.querySelector('[data-cursor-inner]');
  const links = document.querySelectorAll(['h1', 'h2']);

  document.addEventListener('mousemove', (event) => {
    const { clientX, clientY } = event;

    if (cursorOuter) {
      // Update posisi elemen kursor
      cursorOuter.style.left = `${clientX}px`;
      cursorOuter.style.top = `${clientY}px`;
      // cursorInner.style.left = `${clientX}px`;
      // cursorInner.style.top = `${clientY}px`;
      // chasing cursor animation
      // cursorInner.animate(
      //   {
      //     left: `${clientX}px`,
      //     top: `${clientY}px`,
      //   },
      //   { duration: 250, fill: 'forwards' }
      // );

      links.forEach((link) => {
        link.addEventListener('mouseenter', () => {
          cursorOuter.classList.add('hover');
          // cursorInner.classList.add('hover');
        });
        link.addEventListener('mouseleave', () => {
          cursorOuter.classList.remove('hover');
          // cursorInner.classList.remove('hover');
        });
      });
    }
  });
});

// Your final script.js

// Ikon
const sunIcon = document.querySelector('.sun');
const moonIcon = document.querySelector('.moon');

// Fungsi untuk mengatur tampilan ikon berdasarkan tema saat ini
const updateIconVisibility = () => {
  if (document.documentElement.classList.contains('dark')) {
    moonIcon.classList.remove('hidden');
    sunIcon.classList.add('hidden');
  } else {
    moonIcon.classList.add('hidden');
    sunIcon.classList.remove('hidden');
  }
};

// Lock so a second tap mid-animation can't skip/restart the transition
// (that's what makes the toggle feel "broken" when tapped twice on mobile).
let isThemeSwitching = false;

// Fungsi utama untuk mengganti tema dengan animasi
const themeSwitch = (event) => {
  if (isThemeSwitching) return;

  const x = event.clientX;
  const y = event.clientY;

  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  const applyThemeClass = () => {
    if (document.documentElement.classList.contains('dark')) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }
    // Swap the icon in the SAME update as the theme class, not after the
    // animation ends. This way the "old" view-transition snapshot has the
    // old icon and the "new" one already has the new icon, so the icon
    // swap is part of the smooth circle reveal instead of an abrupt pop
    // once the animation is over (that pop is what read as "flickering").
    updateIconVisibility();
  };

  if (!document.startViewTransition || prefersReducedMotion) {
    // Fallback for browsers that don't support View Transitions, and for
    // users who've asked the OS for reduced motion.
    applyThemeClass();
    return;
  }

  isThemeSwitching = true;
  const wasDark = document.documentElement.classList.contains('dark');

  const cleanUp = () => {
    // Safety net: some browsers can abort a view transition before it ever
    // runs our update callback (backgrounded tab, another transition
    // in-flight, etc). If that happens the theme wouldn't actually have
    // changed even though the user tapped the button - force it through
    // so the toggle never just "does nothing".
    const isDarkNow = document.documentElement.classList.contains('dark');
    if (isDarkNow === wasDark) {
      applyThemeClass();
    }
    isThemeSwitching = false;
  };

  let transition;
  try {
    transition = document.startViewTransition(applyThemeClass);
  } catch (err) {
    cleanUp();
    return;
  }

  // We turn the browser's own default view-transition animation off (see
  // ::view-transition-old/new(root) { animation: none !important } in
  // input.css) and drive the reveal ourselves. That means transition.finished
  // resolves almost immediately - it isn't watching our custom animation.
  // Drive cleanup off our own animation's `finished` instead so the lock/
  // icon-fallback logic in cleanUp() isn't racing the actual reveal.
  //
  // `transition.ready` itself can also just never settle in some browsers
  // (observed in automated/headless testing, but cheap to guard against
  // everywhere) - if that happens the whole chain below never runs and the
  // toggle would be stuck forever with the lock held. So the entire
  // ready → animate → finished sequence is raced against one overall
  // timeout, and cleanUp() always runs one way or the other.
  const withTimeout = (promise, ms) =>
    Promise.race([promise, new Promise((resolve) => setTimeout(resolve, ms))]);

  const sequence = transition.ready.then(() => {
    // visualViewport reflects the actual on-screen viewport on mobile
    // (address bar collapsing/expanding etc.) more reliably than
    // window.innerWidth/innerHeight.
    const viewportWidth = window.visualViewport?.width ?? window.innerWidth;
    const viewportHeight = window.visualViewport?.height ?? window.innerHeight;

    const radius = Math.hypot(
      Math.max(x, viewportWidth - x),
      Math.max(y, viewportHeight - y)
    );

    // Always grow the incoming ("new") state from the click point over the
    // outgoing one - same animation regardless of light→dark or dark→light,
    // matching the static old=1/new=9999 stacking in input.css. See the
    // comment there for why a direction-agnostic reveal is what fixed the
    // flicker for good.
    const anim = document.documentElement.animate(
      {
        clipPath: [
          `circle(0px at ${x}px ${y}px)`,
          `circle(${radius}px at ${x}px ${y}px)`,
        ],
      },
      {
        duration: 550,
        easing: 'cubic-bezier(0.65, 0, 0.35, 1)',
        pseudoElement: '::view-transition-new(root)',
      }
    );

    return anim.finished;
  });

  withTimeout(sequence, 2000)
    .catch(() => {
      // If the browser can't get the transition ready (backgrounded tab,
      // etc.), don't leave the UI stuck - cleanUp() (below) still runs.
    })
    .finally(cleanUp);
};

// Event Listeners
sunIcon.addEventListener('click', (event) => {
  themeSwitch(event);
});
moonIcon.addEventListener('click', (event) => {
  themeSwitch(event);
});

// Keyboard support (Enter/Space) since these toggles are role="button"
[sunIcon, moonIcon].forEach((icon) => {
  icon.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      const rect = icon.getBoundingClientRect();
      themeSwitch({
        clientX: rect.left + rect.width / 2,
        clientY: rect.top + rect.height / 2,
      });
    }
  });
});

// Set the correct icon on initial page load
updateIconVisibility();

//Autotyping
var AutoTyping = (function (e) {
  var t = {};
  function r(n) {
    if (t[n]) return t[n].exports;
    var i = (t[n] = { i: n, l: !1, exports: {} });
    return e[n].call(i.exports, i, i.exports, r), (i.l = !0), i.exports;
  }
  return (
    (r.m = e),
    (r.c = t),
    (r.d = function (e, t, n) {
      r.o(e, t) || Object.defineProperty(e, t, { enumerable: !0, get: n });
    }),
    (r.r = function (e) {
      'undefined' != typeof Symbol &&
        Symbol.toStringTag &&
        Object.defineProperty(e, Symbol.toStringTag, { value: 'Module' }),
        Object.defineProperty(e, '__esModule', { value: !0 });
    }),
    (r.t = function (e, t) {
      if ((1 & t && (e = r(e)), 8 & t)) return e;
      if (4 & t && 'object' == typeof e && e && e.__esModule) return e;
      var n = Object.create(null);
      if (
        (r.r(n),
        Object.defineProperty(n, 'default', { enumerable: !0, value: e }),
        2 & t && 'string' != typeof e)
      )
        for (var i in e)
          r.d(
            n,
            i,
            function (t) {
              return e[t];
            }.bind(null, i)
          );
      return n;
    }),
    (r.n = function (e) {
      var t =
        e && e.__esModule
          ? function () {
              return e.default;
            }
          : function () {
              return e;
            };
      return r.d(t, 'a', t), t;
    }),
    (r.o = function (e, t) {
      return Object.prototype.hasOwnProperty.call(e, t);
    }),
    (r.p = ''),
    r((r.s = 0))
  );
})([
  function (e, t, r) {
    'use strict';
    r.r(t);
    t.default = class {
      constructor(
        e,
        t,
        {
          typeSpeed: r = 150,
          deleteSpeed: n = 150,
          waitBeforeDelete: i = 1e3,
          waitBetweenWords: o = 1e3,
          writeWhole: l = !1,
        } = {}
      ) {
        (this.selector = e),
          (this.text = t),
          (this.typeSpeed = r),
          (this.deleteSpeed = n),
          (this.waitBeforeDelete = i),
          (this.waitBetweenWords = o),
          (this.writeWhole = l),
          (this.el = document.querySelector(e));
      }
      async start() {
        this.el;
        for (let e = 0; e < this.text.length; e++) {
          const t = this.text[e];
          let r = t.split('');
          this.writeWhole && (r = [t]),
            await this.writeText(r),
            e == this.text.length - 1 && (e = -1);
        }
      }
      writeText(e) {
        let t = this;
        return new Promise((r) => {
          const n = this.el;
          let i = !1,
            o = setInterval(() => {
              let l = e.shift();
              i && ((i = !1), (l = ' ' + l)),
                (i = ' ' == l),
                (n.innerText += l),
                0 == e.length &&
                  (clearInterval(o),
                  setTimeout(() => {
                    let e = setInterval(() => {
                      const i = n.innerText;
                      t.writeWhole
                        ? (n.innerText = '')
                        : (n.innerText = i.substr(0, i.length - 1)),
                        0 == n.innerText.length &&
                          (clearInterval(e),
                          setTimeout(() => r(), this.waitBetweenWords));
                    }, this.deleteSpeed);
                  }, this.waitBeforeDelete));
            }, this.typeSpeed);
        });
      }
    };
  },
]).default;

const exampleText = [
  'Web Developer',
  'Software Developer',
  'Frontend Developer',
  'Backend Developer',
];
const exampleTyping = new AutoTyping('.typingText', exampleText, {
  typeSpeed: 100,
  deleteSpeed: 100,
  waitBeforeDelete: 2000,
  waitBetweenWords: 500,
});
exampleTyping.start();
