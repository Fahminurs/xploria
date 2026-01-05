// Theme Toggle
const themeToggle = document.getElementById('toggle_checkbox');
const body = document.body;

// Check for saved theme preference
const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
  body.classList.toggle('dark', savedTheme === 'dark');
  themeToggle.checked = savedTheme === 'dark';
}

themeToggle.addEventListener('change', () => {
  body.classList.toggle('dark');
  localStorage.setItem('theme', body.classList.contains('dark') ? 'dark' : 'light');
});

// Mobile Menu
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const mobileMenu = document.querySelector('.mobile-menu');

mobileMenuBtn.addEventListener('click', () => {
  mobileMenu.classList.toggle('active');
});

// Close mobile menu wh
// en clicking outside
document.addEventListener('click', (e) => {
  if (!mobileMenu.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
    mobileMenu.classList.remove('active');
  }
});

// Language switching functionality
let currentLang = 'en'; // Default language
const languageBtn = document.getElementById('languageBtn');
const languageOptions = document.querySelectorAll('.language-option');
const dropdown = document.querySelector('.language-dropdown');

// Function to update the language display
function updateLanguageDisplay() {
  const languageText = document.querySelector('.language-text');
  languageText.textContent = currentLang.toUpperCase();
}

// Function to translate the page content
function translatePage() {
  const elements = document.querySelectorAll('[data-translate]');
  elements.forEach(element => {
    const key = element.getAttribute('data-translate');
    if (translations[currentLang][key]) {
      element.textContent = translations[currentLang][key];
    }
  });
}

// Function to handle language switching
function switchLanguage(lang) {
  currentLang = lang;
  localStorage.setItem('preferredLanguage', lang);
  updateLanguageDisplay();
  translatePage();

  // Update document direction for RTL support
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.lang = lang;
}

// Initialize language from localStorage or default to English
const savedLang = localStorage.getItem('preferredLanguage') || 'en';
switchLanguage(savedLang);

// Add click event listeners to language options
languageOptions.forEach(option => {
  option.addEventListener('click', () => {
    const lang = option.getAttribute('data-lang');
    switchLanguage(lang);
    dropdown.style.display = 'none';
  });
});

// Toggle language dropdown
languageBtn.addEventListener('click', () => {
  dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
});

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
  if (!languageBtn.contains(e.target) && !dropdown.contains(e.target)) {
    dropdown.style.display = 'none';
  }
});

// Products Scroll with smooth animation
const productsScroll = document.querySelector('.products-scroll');
const scrollLeftBtn = document.querySelector('.scroll-btn-left');
const scrollRightBtn = document.querySelector('.scroll-btn-right');

// Fungsi untuk scroll smooth
function smoothScroll(element, change) {
  const start = element.scrollLeft;
  const target = start + change;
  const duration = 500; // ms
  const startTime = performance.now();

  function animation(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Easing function untuk smooth effect
    const easeInOutCubic = progress => {
      return progress < 0.5
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;
    };

    element.scrollLeft = start + (target - start) * easeInOutCubic(progress);

    if (progress < 1) {
      requestAnimationFrame(animation);
    }
  }

  requestAnimationFrame(animation);
}

// Event listeners untuk tombol scroll
scrollLeftBtn.addEventListener('click', () => {
  smoothScroll(productsScroll, -300);
});

scrollRightBtn.addEventListener('click', () => {
  smoothScroll(productsScroll, 300);
});

// Tambahkan efek drag scroll
let isScrolling = false;
let startX;
let scrollLeft;

productsScroll.addEventListener('mousedown', (e) => {
  isScrolling = true;
  productsScroll.classList.add('scrolling');
  startX = e.pageX - productsScroll.offsetLeft;
  scrollLeft = productsScroll.scrollLeft;
});

productsScroll.addEventListener('mouseleave', () => {
  isScrolling = false;
  productsScroll.classList.remove('scrolling');
});

productsScroll.addEventListener('mouseup', () => {
  isScrolling = false;
  productsScroll.classList.remove('scrolling');
});

productsScroll.addEventListener('mousemove', (e) => {
  if (!isScrolling) return;
  e.preventDefault();
  const x = e.pageX - productsScroll.offsetLeft;
  const walk = (x - startX) * 2;
  productsScroll.scrollLeft = scrollLeft - walk;
});

// Tambahkan touch support untuk mobile
productsScroll.addEventListener('touchstart', (e) => {
  isScrolling = true;
  productsScroll.classList.add('scrolling');
  startX = e.touches[0].pageX - productsScroll.offsetLeft;
  scrollLeft = productsScroll.scrollLeft;
});

productsScroll.addEventListener('touchend', () => {
  isScrolling = false;
  productsScroll.classList.remove('scrolling');
});

productsScroll.addEventListener('touchmove', (e) => {
  if (!isScrolling) return;
  e.preventDefault();
  const x = e.touches[0].pageX - productsScroll.offsetLeft;
  const walk = (x - startX) * 2;
  productsScroll.scrollLeft = scrollLeft - walk;
});

// Drag and Drop Game
const shapes = document.querySelectorAll('.shape');
const dropZones = document.querySelectorAll('.drop-zone');
const gameArea = document.getElementById('game-area');
const successMessage = document.getElementById('success-message');
const playAgainBtn = document.getElementById('play-again');
let matchedPairs = 0;

function resetGame() {
  matchedPairs = 0;
  dropZones.forEach(zone => {
    zone.classList.remove('matched');
    // Reset shadow colors back to default gray
    const circle = zone.querySelector('.shape-circle');
    if (circle) circle.style.backgroundColor = '#D1D5DB';
    const square = zone.querySelector('.shape-square');
    if (square) square.style.backgroundColor = '#D1D5DB';
    const triangle = zone.querySelector('.shape-triangle');
    if (triangle) triangle.style.borderBottomColor = '#D1D5DB';
    const starPoly = zone.querySelector('svg polygon');
    if (starPoly) starPoly.style.fill = '#D1D5DB';
  });
  shapes.forEach(shape => {
    shape.classList.remove('hidden');
  });
  successMessage.style.display = 'none';
}

playAgainBtn.addEventListener('click', resetGame);

shapes.forEach(shape => {
  shape.addEventListener('dragstart', (e) => {
    e.dataTransfer.setData('text/plain', shape.dataset.shape);
    shape.classList.add('dragging');
  });

  shape.addEventListener('dragend', () => {
    shape.classList.remove('dragging');
  });
});

dropZones.forEach(zone => {
  zone.addEventListener('dragover', (e) => {
    e.preventDefault();
    if (!zone.classList.contains('matched')) {
      zone.classList.add('drag-over');
    }
  });

  zone.addEventListener('dragleave', () => {
    zone.classList.remove('drag-over');
  });

  zone.addEventListener('drop', (e) => {
    e.preventDefault();
    zone.classList.remove('drag-over');

    const shapeType = e.dataTransfer.getData('text/plain');
    const shape = document.querySelector(`#shape-${shapeType}`);

    if (zone.dataset.shape === shapeType && !zone.classList.contains('matched')) {
      // Apply the dragged shape's color to the shadow in the drop zone
      let draggedColor = '';
      if (shapeType === 'circle' || shapeType === 'square') {
        draggedColor = getComputedStyle(shape).backgroundColor;
      } else if (shapeType === 'triangle') {
        draggedColor = getComputedStyle(shape).borderBottomColor;
      } else if (shapeType === 'star') {
        const starPoly = shape.querySelector('svg polygon');
        draggedColor = starPoly ? (getComputedStyle(starPoly).fill || starPoly.getAttribute('fill')) : '';
      }

      if (shapeType === 'circle') {
        const target = zone.querySelector('.shape-circle');
        if (target && draggedColor) target.style.backgroundColor = draggedColor;
      } else if (shapeType === 'square') {
        const target = zone.querySelector('.shape-square');
        if (target && draggedColor) target.style.backgroundColor = draggedColor;
      } else if (shapeType === 'triangle') {
        const target = zone.querySelector('.shape-triangle');
        if (target && draggedColor) target.style.borderBottomColor = draggedColor;
      } else if (shapeType === 'star') {
        const targetPoly = zone.querySelector('svg polygon');
        if (targetPoly && draggedColor) targetPoly.style.fill = draggedColor;
      }

      zone.classList.add('matched');
      shape.classList.add('hidden');
      matchedPairs++;

      if (matchedPairs === shapes.length) {
        setTimeout(() => {
          successMessage.style.display = 'block';
        }, 500);
      }
    }
  });
});

// STEM Categories
const stemCategories = document.querySelectorAll('.stem-category');
const stemProjects = document.querySelectorAll('.stem-project-card');
const mainImage = document.getElementById('stem-main-image');
const mainTitle = document.getElementById('stem-main-title');
const mainDesc = document.getElementById('stem-main-description');

// Content for each category
const categoryContent = {
  aicoding: {
    en: {
      title: "AI Coding Mastery",
      description: "Learn the fundamentals of science through engaging experiments. This program covers various topics from physics, chemistry, and biology that will help students understand scientific concepts in a fun and interactive way.",
      buttonText: "Explore AI Coding Projects",
      relatedSubjects: ["Math", "Physics", "Computer Science"],
      image: "/image/DroneTech Mastery.png"
    },
    id: {
      title: "Penguasaan Pemrograman AI",
      description: "Pelajari dasar-dasar sains melalui eksperimen yang menarik. Program ini mencakup berbagai topik dari fisika, kimia, dan biologi yang akan membantu siswa memahami konsep sains dengan cara yang menyenangkan dan interaktif.",
      buttonText: "Jelajahi Proyek Pemrograman AI",
      relatedSubjects: ["Matematika", "Fisika", "Ilmu Komputer"],
      image: "/image/DroneTech Mastery.png"
    },
    zh: {
      title: "AI编程精通",
      description: "通过引人入胜的实验学习科学基础知识。该计划涵盖物理、化学和生物学的各种主题，将帮助学生以有趣和互动的方式理解科学概念。",
      buttonText: "探索AI编程项目",
      relatedSubjects: ["数学", "物理", "计算机科学"],
      image: "/image/DroneTech Mastery.png"
    },
    ar: {
      title: "إتقان برمجة الذكاء الاصطناعي",
      description: "تعلم أساسيات العلوم من خلال تجارب ممتعة. يغطي هذا البرنامج مواضيع متنوعة من الفيزياء والكيمياء والأحياء التي ستساعد الطلاب على فهم المفاهيم العلمية بطريقة ممتعة وتفاعلية.",
      buttonText: "استكشف مشاريع برمجة الذكاء الاصطناعي",
      relatedSubjects: ["الرياضيات", "الفيزياء", "علوم الحاسوب"],
      image: "/image/DroneTech Mastery.png"
    }
  },
  iotdeveloper: {
    en: {
      title: "IoT Development",
      description: "Discover the world of Internet of Things! Learn to build and program connected devices, from sensors to smart systems, and create your own IoT solutions.",
      buttonText: "Explore IoT Projects",
      relatedSubjects: ["Physics", "Computer Science", "Economic-Enterpreneurship"],
      image: "/image/MicroSmart Home.png"
    },
    id: {
      title: "Pengembangan IoT",
      description: "Jelajahi dunia Internet of Things! Belajar membangun dan memprogram perangkat terhubung, dari sensor hingga sistem pintar, dan buat solusi IoT Anda sendiri.",
      buttonText: "Jelajahi Proyek IoT",
      relatedSubjects: ["Fisika", "Ilmu Komputer", "Ekonomi-Kewirausahaan"],
      image: "/image/MicroSmart Home.png"
    },
    zh: {
      title: "物联网开发",
      description: "探索物联网世界！学习构建和编程连接设备，从传感器到智能系统，创建您自己的物联网解决方案。",
      buttonText: "探索物联网项目",
      relatedSubjects: ["物理", "计算机科学", "经济-创业"],
      image: "/image/MicroSmart Home.png"
    },
    ar: {
      title: "تطوير إنترنت الأشياء",
      description: "اكتشف عالم إنترنت الأشياء! تعلم بناء وبرمجة الأجهزة المتصلة، من أجهزة الاستشعار إلى الأنظمة الذكية، وأنشئ حلول إنترنت الأشياء الخاصة بك.",
      buttonText: "استكشف مشاريع إنترنت الأشياء",
      relatedSubjects: ["الفيزياء", "علوم الحاسوب", "الاقتصاد-ريادة الأعمال"],
      image: "/image/MicroSmart Home.png"
    }
  },
  robotics: {
    en: {
      title: "Robotics Engineering",
      description: "Master the art of robotics! From basic mechanics to advanced programming, learn to build and control robots that can perform various tasks.",
      buttonText: "Explore Robotics Projects",
      relatedSubjects: ["Physics", "Math", "Computer Science"],
      image: "/image/SmartAI Robotics.png"
    },
    id: {
      title: "Teknik Robotika",
      description: "Kuasai seni robotika! Dari mekanika dasar hingga pemrograman lanjutan, belajar membangun dan mengontrol robot yang dapat melakukan berbagai tugas.",
      buttonText: "Jelajahi Proyek Robotika",
      relatedSubjects: ["Fisika", "Matematika", "Ilmu Komputer"],
      image: "/image/SmartAI Robotics.png"
    },
    zh: {
      title: "机器人工程",
      description: "掌握机器人技术！从基础机械到高级编程，学习构建和控制能够执行各种任务的机器人。",
      buttonText: "探索机器人项目",
      relatedSubjects: ["物理", "数学", "计算机科学"],
      image: "/image/SmartAI Robotics.png"
    },
    ar: {
      title: "هندسة الروبوتات",
      description: "أتقن فن الروبوتات! من الميكانيكا الأساسية إلى البرمجة المتقدمة، تعلم بناء وتشغيل الروبوتات التي يمكنها أداء مهام متنوعة.",
      buttonText: "استكشف مشاريع الروبوتات",
      relatedSubjects: ["الفيزياء", "الرياضيات", "علوم الحاسوب"],
      image: "/image/SmartAI Robotics.png"
    }
  },
  webbase: {
    en: {
      title: "Web Development",
      description: "Learn modern web development! Master HTML, CSS, JavaScript, and frameworks to create responsive and interactive web applications.",
      buttonText: "Explore Web Projects",
      relatedSubjects: ["Computer Science", "Math", "Economic-Enterpreneurship"],
      image: "/image/SmartVehicle Mastery.png"
    },
    id: {
      title: "Pengembangan Web",
      description: "Pelajari pengembangan web modern! Kuasai HTML, CSS, JavaScript, dan framework untuk membuat aplikasi web yang responsif dan interaktif.",
      buttonText: "Jelajahi Proyek Web",
      relatedSubjects: ["Ilmu Komputer", "Matematika", "Ekonomi-Kewirausahaan"],
      image: "/image/SmartVehicle Mastery.png"
    },
    zh: {
      title: "Web开发",
      description: "学习现代Web开发！掌握HTML、CSS、JavaScript和框架，创建响应式和交互式Web应用程序。",
      buttonText: "探索Web项目",
      relatedSubjects: ["计算机科学", "数学", "经济-创业"],
      image: "/image/SmartVehicle Mastery.png"
    },
    ar: {
      title: "تطوير الويب",
      description: "تعلم تطوير الويب الحديث! أتقن HTML وCSS وJavaScript والأطر لإنشاء تطبيقات ويب متجاوبة وتفاعلية.",
      buttonText: "استكشف مشاريع الويب",
      relatedSubjects: ["علوم الحاسوب", "الرياضيات", "الاقتصاد-ريادة الأعمال"],
      image: "/image/SmartVehicle Mastery.png"
    }
  },
  basic: {
    en: {
      title: "Basic Programming",
      description: "Start your programming journey! Learn fundamental concepts, algorithms, and problem-solving skills that form the foundation of computer science.",
      buttonText: "Explore Basic Projects",
      relatedSubjects: ["Math", "Computer Science", "Physics"],
      image: "/image/SmartVehicle Mastery.png"
    },
    id: {
      title: "Pemrograman Dasar",
      description: "Mulai perjalanan pemrograman Anda! Pelajari konsep dasar, algoritma, dan keterampilan pemecahan masalah yang membentuk dasar ilmu komputer.",
      buttonText: "Jelajahi Proyek Dasar",
      relatedSubjects: ["Matematika", "Ilmu Komputer", "Fisika"],
      image: "/image/SmartVehicle Mastery.png"
    },
    zh: {
      title: "基础编程",
      description: "开启您的编程之旅！学习计算机科学基础的基本概念、算法和问题解决技能。",
      buttonText: "探索基础项目",
      relatedSubjects: ["数学", "计算机科学", "物理"],
      image: "/image/SmartVehicle Mastery.png"
    },
    ar: {
      title: "البرمجة الأساسية",
      description: "ابدأ رحلة البرمجة الخاصة بك! تعلم المفاهيم الأساسية والخوارزميات ومهارات حل المشكلات التي تشكل أساس علوم الحاسوب.",
      buttonText: "استكشف المشاريع الأساسية",
      relatedSubjects: ["الرياضيات", "علوم الحاسوب", "الفيزياء"],
      image: "/image/SmartVehicle Mastery.png"
    }
  }
};

// STEM Category Switching
document.addEventListener('DOMContentLoaded', function () {
  const stemCategories = document.querySelectorAll('.stem-category');
  const stemContent = document.querySelector('.stem-content');

  // Show aicoding content by default
  updateContent('aicoding');

  stemCategories.forEach(category => {
    category.addEventListener('click', function () {
      // Remove active class from all categories
      stemCategories.forEach(cat => cat.classList.remove('active'));

      // Add active class to clicked category
      this.classList.add('active');

      const selectedCategory = this.getAttribute('data-category');
      updateContent(selectedCategory);
    });
  });

  function updateContent(category) {
    const content = categoryContent[category][currentLang];
    if (!content) return;

    // Add fade out effect
    stemContent.style.opacity = '0';

    setTimeout(() => {
      // Create subject tags HTML
      const subjectTags = content.relatedSubjects.map(subject => 
        `<span class="subject-tag short-stack-regular">${subject}</span>`
      ).join('');

      // Update content
      stemContent.innerHTML = `
        <div class="stem-project-card" data-category="${category}">
          <div class="stem-project-image">
            <img src="${content.image}" alt="${content.title}" class="project-img">
          </div>
          <div class="stem-project-details">
            <h3 class="stem-project-title short-stack-bold">${content.title}</h3>
            <p class="stem-project-description short-stack-regular">${content.description}</p>
            <div class="subject-tags">
              ${subjectTags}
            </div>
            <a href="#" class="btn btn-primary">${content.buttonText}</a>
          </div>
        </div>
      `;

      // Add fade in effect
      stemContent.style.opacity = '1';
    }, 300);
  }

  // Update STEM content when language changes
  const originalTranslatePage = translatePage;
  translatePage = function() {
    originalTranslatePage();
    const activeCategory = document.querySelector('.stem-category.active');
    if (activeCategory) {
      updateContent(activeCategory.getAttribute('data-category'));
    }
  };
});

// Contact Form
const contactForm = document.querySelector('.contact-form');
const formSuccess = document.querySelector('.form-success');
const formSubmit = document.querySelector('.form-submit');
const formSpinner = document.querySelector('.spinner');

contactForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  // Show loading state
  formSubmit.disabled = true;
  formSpinner.style.display = 'inline-block';

  // Simulate form submission
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Hide form and show success message
  contactForm.style.display = 'none';
  formSuccess.style.display = 'flex';

  // Reset form
  contactForm.reset();
  formSubmit.disabled = false;
  formSpinner.style.display = 'none';
}); 