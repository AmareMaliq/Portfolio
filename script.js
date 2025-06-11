// navbar fixed
window.onscroll = function () {
  const header = document.querySelector('header');
  const fixedNav = header.offsetTop;
  const toTop = document.querySelector('#to-top');

  if (window.pageYOffset > fixedNav) {
    header.classList.add('navbar-fixed');
    toTop.classList.remove('hidden');
    toTop.classList.add('flex');
  } else {
    header.classList.remove('navbar-fixed');
    toTop.classList.remove('flex');
    toTop.classList.add('hidden');
  }
};

// klik diluar hamburger
window.addEventListener('click', function (e) {
  if (e.target != hamburger && e.target != navMenu) {
    hamburger.classList.remove('hamburger-active');
    navMenu.classList.add('hidden');
  }
});

// Hamburger
const hamburger = document.querySelector('#hamburger');
const navMenu = document.querySelector('#nav-menu');
hamburger.addEventListener('click', function () {
  hamburger.classList.toggle('hamburger-active');
  navMenu.classList.toggle('hidden');
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

// Fungsi untuk toggle ikon
const iconToggle = () => {
  moonIcon.classList.toggle('hidden');
  sunIcon.classList.toggle('hidden');
};

// Fungsi utama untuk mengganti tema dengan animasi
const themeSwitch = (event) => {
  const x = event.clientX;
  const y = event.clientY;

  if (!document.startViewTransition) {
    // Fallback for browsers that don't support View Transitions
    if (document.documentElement.classList.contains('dark')) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }
    iconToggle();
    return;
  }

  // Add a temporary class to signal the transition direction to CSS
  if (!document.documentElement.classList.contains('dark')) {
    document.documentElement.classList.add('transitioning-to-dark');
  }

  const transition = document.startViewTransition(() => {
    if (document.documentElement.classList.contains('dark')) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }
  });

  transition.ready.then(() => {
    const radius = Math.max(
      Math.hypot(x, y),
      Math.hypot(window.innerWidth - x, y),
      Math.hypot(x, window.innerHeight - y),
      Math.hypot(window.innerWidth - x, window.innerHeight - y)
    );

    const isDark = document.documentElement.classList.contains('dark');

    if (isDark) {
      // Animate the circle expanding for the Light-to-Dark transition
      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${radius}px at ${x}px ${y}px)`,
          ],
        },
        {
          duration: 500,
          easing: 'ease-in-out',
          pseudoElement: '::view-transition-new(root)',
        }
      );
    } else {
      // Animate the circle shrinking for the Dark-to-Light transition
      document.documentElement.animate(
        {
          clipPath: [
            `circle(${radius}px at ${x}px ${y}px)`,
            `circle(0px at ${x}px ${y}px)`,
          ],
        },
        {
          duration: 500,
          easing: 'ease-in-out',
          pseudoElement: '::view-transition-old(root)',
        }
      );
    }
  });

  transition.finished.then(() => {
    // Toggle the icon only AFTER the animation is complete
    iconToggle();
    // Clean up the temporary class
    document.documentElement.classList.remove('transitioning-to-dark');
  });
};

// Event Listeners
sunIcon.addEventListener('click', (event) => {
  themeSwitch(event);
});
moonIcon.addEventListener('click', (event) => {
  themeSwitch(event);
});

// Set the correct icon on initial page load
updateIconVisibility();
