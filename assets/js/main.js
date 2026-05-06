/* ==========================================================================
   Utility
   ========================================================================== */
async function fetchJSON(path) {
    const res = await fetch(path);
    if (!res.ok) throw new Error(`Failed to load ${path}`);
    return res.json();
}

/* ==========================================================================
   Scroll Progress Bar
   ========================================================================== */
function initScrollProgress() {
    const bar = document.getElementById('scrollProgress');
    if (!bar) return;
    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        bar.style.width = `${(scrollTop / docHeight) * 100}%`;
    }, { passive: true });
}

/* ==========================================================================
   Back to Top
   ========================================================================== */
function initBackToTop() {
    const btn = document.getElementById('backToTop');
    if (!btn) return;
    window.addEventListener('scroll', () => {
        btn.classList.toggle('visible', window.pageYOffset > 500);
    }, { passive: true });
    btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

/* ==========================================================================
   Navbar: Glass Effect + Active Links
   ========================================================================== */
function initNavbar() {
    const navbar = document.getElementById('navbar');
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
        navMenu.addEventListener('click', (e) => {
            if (e.target.classList.contains('nav-link')) {
                navMenu.classList.remove('active');
            }
        });
    }

    window.addEventListener('scroll', () => {
        if (navbar) navbar.classList.toggle('scrolled', window.pageYOffset > 60);
        highlightActiveNav();
    }, { passive: true });
}

function highlightActiveNav() {
    const sections = document.querySelectorAll('section[id]');
    const scrollY = window.pageYOffset + 120;
    sections.forEach(section => {
        const link = document.querySelector(`.nav-link[href="#${section.id}"]`);
        if (!link) return;
        const inView = scrollY >= section.offsetTop && scrollY < section.offsetTop + section.offsetHeight;
        link.classList.toggle('active', inView);
    });
}

/* ==========================================================================
   Smooth Scroll
   ========================================================================== */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            const target = document.querySelector(anchor.getAttribute('href'));
            if (!target) return;
            e.preventDefault();
            window.scrollTo({ top: target.offsetTop - 70, behavior: 'smooth' });
        });
    });
}

/* ==========================================================================
   Intersection Observer Reveal
   ========================================================================== */
function initReveal() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.reveal, .reveal-left').forEach(el => observer.observe(el));
}

/* ==========================================================================
   Count-Up Animation for Stats
   ========================================================================== */
function countUp(el, target, suffix, duration = 1600) {
    const isFloat = target % 1 !== 0;
    const start = performance.now();
    const step = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = isFloat ? (eased * target).toFixed(1) : Math.floor(eased * target);
        el.textContent = current + suffix;
        if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
}

function initStatCounters() {
    const statItems = document.querySelectorAll('.stat-item');
    if (!statItems.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const h3 = entry.target.querySelector('h3');
            if (!h3 || h3.dataset.counted) return;
            h3.dataset.counted = 'true';

            const raw = h3.textContent.trim();
            const match = raw.match(/^([\d.]+)(.*)$/);
            if (!match) return;

            const num = parseFloat(match[1]);
            const suffix = match[2] || '';
            countUp(h3, num, suffix);
            observer.unobserve(entry.target);
        });
    }, { threshold: 0.4 });

    statItems.forEach(el => observer.observe(el));
}

/* ==========================================================================
   Load Site Config
   ========================================================================== */
async function loadSiteConfig() {
    try {
        const config = await fetchJSON('data/site-config.json');
        document.title = config.meta.title;
        document.querySelector('meta[name="description"]')?.setAttribute('content', config.meta.description);
        document.querySelector('meta[name="author"]')?.setAttribute('content', config.meta.author);
        document.querySelector('meta[name="keywords"]')?.setAttribute('content', config.meta.keywords);
    } catch (e) { console.error(e); }
}

/* ==========================================================================
   Load Navigation
   ========================================================================== */
async function loadNavigation() {
    try {
        const nav = await fetchJSON('data/navigation.json');

        const brand = document.querySelector('.nav-brand .brand-mark');
        if (brand) {
            brand.textContent = nav.brand.name;
            brand.setAttribute('href', nav.brand.href);
        }

        const menu = document.getElementById('navMenu');
        if (menu) {
            menu.innerHTML = nav.menuItems.map(item =>
                `<li><a href="${item.href}" class="nav-link">${item.label}</a></li>`
            ).join('');
        }
    } catch (e) { console.error(e); }
}

/* ==========================================================================
   Load Hero
   ========================================================================== */
async function loadHero() {
    try {
        const hero = await fetchJSON('data/hero.json');

        const greeting = document.getElementById('heroGreeting');
        const name     = document.getElementById('heroName');
        const title    = document.getElementById('heroTitle');
        const summary  = document.getElementById('heroSummary');

        if (greeting) greeting.textContent = hero.greeting;
        if (name)     name.textContent = hero.name;
        if (title)    title.textContent = hero.title;
        if (summary)  summary.innerHTML = hero.summary;

        const highlights = document.getElementById('heroHighlights');
        if (highlights && hero.highlights) {
            highlights.innerHTML = hero.highlights.map(h =>
                `<div class="highlight-item">
                    <i class="${h.icon}"></i>
                    <span>${h.text}</span>
                </div>`
            ).join('');
        }

        const cta = document.getElementById('heroCTA');
        if (cta && hero.cta?.buttons) {
            cta.innerHTML = hero.cta.buttons.map(btn =>
                `<a href="${btn.href}" class="btn btn-${btn.type}"${btn.external ? ' target="_blank"' : ''}>${btn.text}</a>`
            ).join('');
        }

        const social = document.getElementById('heroSocial');
        if (social && hero.socialLinks) {
            social.innerHTML = hero.socialLinks.map(s =>
                `<a href="${s.url}" target="_blank" rel="noopener" aria-label="${s.platform}">
                    <i class="${s.icon}"></i>
                </a>`
            ).join('');
        }
    } catch (e) { console.error(e); }
}

/* ==========================================================================
   Load About
   ========================================================================== */
async function loadAbout() {
    try {
        const data = await fetchJSON('data/about.json');

        const title = document.querySelector('#about .section-title');
        if (title) title.textContent = data.sectionTitle;

        const text = document.getElementById('aboutText');
        if (text) {
            text.innerHTML = data.paragraphs.map(p => `<p>${p}</p>`).join('');
        }

        const stats = document.getElementById('aboutStats');
        if (stats) {
            stats.className = 'about-stats reveal-stagger';
            stats.innerHTML = data.statistics.map(s =>
                `<div class="stat-item reveal">
                    <h3>${s.value}</h3>
                    <p>${s.label}</p>
                </div>`
            ).join('');
        }
    } catch (e) { console.error(e); }
}

/* ==========================================================================
   Load Experience
   ========================================================================== */
async function loadExperience() {
    try {
        const data = await fetchJSON('data/experience.json');

        const title = document.querySelector('#experience .section-title');
        if (title) title.textContent = data.sectionTitle;

        const timeline = document.getElementById('experienceTimeline');
        if (!timeline) return;

        (data.experiences || []).forEach((exp, i) => {
            if (exp._instructions) return;
            const el = document.createElement('div');
            el.className = 'timeline-item reveal';
            el.style.transitionDelay = `${i * 0.1}s`;

            const bullets = exp.responsibilities?.length
                ? `<ul>${exp.responsibilities.map(r => `<li>${r}</li>`).join('')}</ul>`
                : '';

            const logoHTML = exp.logo
                ? `<img
                      class="company-logo"
                      src="${exp.logo}"
                      alt="${exp.company} logo"
                      onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"
                   />
                   <div class="company-logo-fallback" style="display:none;background:${exp.logoColor}18;color:${exp.logoColor}">
                     ${exp.logoInitial || exp.company[0]}
                   </div>`
                : `<div class="company-logo-fallback" style="background:${(exp.logoColor||'#29D9C2')}18;color:${exp.logoColor||'#29D9C2'}">
                     ${exp.logoInitial || exp.company[0]}
                   </div>`;

            el.innerHTML = `
                <div class="timeline-content">
                    <div class="timeline-header">
                        <div class="timeline-logo-wrap">
                            ${logoHTML}
                        </div>
                        <div class="timeline-meta">
                            <h3 class="timeline-title">${exp.title}</h3>
                            <p class="timeline-company">${exp.company}</p>
                        </div>
                        <span class="timeline-period">${exp.period}</span>
                    </div>
                    <div class="timeline-description">
                        ${bullets}
                    </div>
                </div>`;
            timeline.appendChild(el);
        });
    } catch (e) { console.error(e); }
}

/* ==========================================================================
   Load Skills
   ========================================================================== */
async function loadSkills() {
    try {
        const data = await fetchJSON('data/skills.json');

        const title = document.querySelector('#skills .section-title');
        if (title) title.textContent = data.sectionTitle;

        const grid = document.getElementById('skillsGrid');
        if (!grid) return;

        grid.className = 'skills-grid reveal-stagger';
        grid.innerHTML = (data.categories || [])
            .filter(c => !c._instructions)
            .map(cat => `
                <div class="skill-category reveal">
                    <h3><i class="${cat.icon}"></i>${cat.category}</h3>
                    <div class="skill-list">
                        ${cat.skills.map(s => `<span class="skill-tag">${s}</span>`).join('')}
                    </div>
                </div>`)
            .join('');
    } catch (e) { console.error(e); }
}

/* ==========================================================================
   Load Projects
   ========================================================================== */
async function loadProjects() {
    try {
        const data = await fetchJSON('data/projects.json');

        const title = document.querySelector('#projects .section-title');
        if (title) title.textContent = data.sectionTitle;

        const grid = document.getElementById('projectsGrid');
        if (!grid) return;

        grid.className = 'projects-grid reveal-stagger';
        grid.innerHTML = (data.projects || [])
            .filter(p => !p._instructions)
            .map(project => {
                const gradient = project.gradient || 'linear-gradient(135deg, #154D57, #29D9C2)';
                const icon = project.icon || 'fas fa-code';
                const badges = (project.technologies || [])
                    .map(t => `<span class="tech-badge">${t}</span>`).join('');
                const impactHTML = (project.impact || []).map(m => `
                    <div class="project-impact-item">
                        <i class="${m.icon}"></i>
                        <span class="project-impact-value">${m.value}</span>
                        <span class="project-impact-label">${m.label}</span>
                    </div>`).join('');
                const links = [];
                if (project.github) {
                    links.push(`<a href="${project.github}" target="_blank" rel="noopener" class="project-link">
                        <i class="fab fa-github"></i> View on GitHub
                    </a>`);
                }
                if (project.demo && project.demo !== project.github) {
                    links.push(`<a href="${project.demo}" target="_blank" rel="noopener" class="project-link">
                        <i class="fas fa-external-link-alt"></i> Live Demo
                    </a>`);
                }
                return `
                <div class="project-card reveal">
                    <div class="project-banner" style="background:${gradient}">
                        <i class="${icon} project-banner-icon-bg"></i>
                        <div class="project-banner-icon"><i class="${icon}"></i></div>
                        ${project.subtitle ? `<span class="project-banner-tag">${project.subtitle}</span>` : ''}
                    </div>
                    ${impactHTML ? `<div class="project-impact">${impactHTML}</div>` : ''}
                    <div class="project-content">
                        <h3 class="project-title">${project.title}</h3>
                        ${project.subtitle ? `<p class="project-subtitle">${project.subtitle}</p>` : ''}
                        <p class="project-description">${project.description}</p>
                        <div class="project-tech">${badges}</div>
                        <div class="project-links">${links.join('')}</div>
                    </div>
                </div>`;
            }).join('');
    } catch (e) { console.error(e); }
}

/* ==========================================================================
   Load Education
   ========================================================================== */
async function loadEducation() {
    try {
        const data = await fetchJSON('data/education.json');

        const title = document.querySelector('#education .section-title');
        if (title) title.textContent = data.sectionTitle;

        const certTitle = document.querySelector('#education .cert-section-title');
        if (certTitle) certTitle.textContent = data.certificationsTitle || 'Certifications';

        const eduGrid = document.getElementById('educationGrid');
        if (eduGrid) {
            eduGrid.innerHTML = (data.education || [])
                .filter(e => !e._instructions)
                .map(edu => `
                    <div class="education-item reveal-left">
                        <div>
                            <h3 class="education-degree">${edu.degree}</h3>
                            <p class="education-school">${edu.school}</p>
                            ${edu.details ? `<p class="education-details">${edu.details}</p>` : ''}
                        </div>
                        <span class="education-period">${edu.period}</span>
                    </div>`)
                .join('');
        }

        const certGrid = document.getElementById('certGrid');
        if (certGrid) {
            certGrid.className = 'cert-grid reveal-stagger';
            certGrid.innerHTML = (data.certifications || []).map(cert => {
                const color = cert.color || '#29D9C2';
                return `
                    <div class="cert-item reveal" style="--cert-accent: ${color}">
                        <div class="cert-icon" style="color:${color}; background:${color}18">
                            <i class="${cert.icon || 'fas fa-certificate'}"></i>
                        </div>
                        <div>
                            <p class="cert-name">${cert.name}</p>
                            <p class="cert-issuer">${cert.issuer}</p>
                        </div>
                    </div>`;
            }).join('');
        }
    } catch (e) { console.error(e); }
}

/* ==========================================================================
   Load Contact
   ========================================================================== */
async function loadContact() {
    try {
        const data = await fetchJSON('data/contact.json');

        const title = document.querySelector('#contact .section-title');
        if (title) title.textContent = data.sectionTitle;

        const intro = document.getElementById('contactIntro');
        if (intro && data.intro) intro.textContent = data.intro;

        const info = document.getElementById('contactInfo');
        if (info) {
            info.innerHTML = data.contactInfo.map(item => {
                const value = item.href
                    ? `<a href="${item.href}">${item.value}</a>`
                    : `<p>${item.value}</p>`;
                return `
                    <div class="contact-item">
                        <i class="${item.icon}"></i>
                        <div>
                            <h3>${item.label}</h3>
                            ${value}
                        </div>
                    </div>`;
            }).join('');
        }

        const formContainer = document.getElementById('contactFormContainer');
        if (formContainer) {
            const fields = (data.form.fields || []).map(f => {
                if (f.type === 'textarea') {
                    return `<div class="form-group">
                        <textarea id="${f.id}" name="${f.id}" rows="${f.rows}" placeholder="${f.placeholder}"${f.required ? ' required' : ''}></textarea>
                    </div>`;
                }
                return `<div class="form-group">
                    <input type="${f.type}" id="${f.id}" name="${f.id}" placeholder="${f.placeholder}"${f.required ? ' required' : ''} />
                </div>`;
            }).join('');

            formContainer.innerHTML = `
                <form class="contact-form" id="contactForm">
                    ${fields}
                    <button type="submit" class="btn btn-primary">${data.form.submitButton.text}</button>
                </form>
                <div class="form-success" id="formSuccess">
                    <i class="fas fa-check-circle"></i>
                    <strong style="color:var(--on-dark); display:block; margin-bottom:0.5rem;">Message sent!</strong>
                    <p>${data.form.successMessage}</p>
                </div>`;

            const form = document.getElementById('contactForm');
            if (form) {
                form.addEventListener('submit', (e) => {
                    e.preventDefault();
                    const name    = form.querySelector('#name')?.value || '';
                    const email   = form.querySelector('#email')?.value || '';
                    const subject = form.querySelector('#subject')?.value || 'Portfolio Inquiry';
                    const message = form.querySelector('#message')?.value || '';

                    const mailto = `mailto:shashank.thimmegowda97@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`)}`;
                    window.location.href = mailto;

                    form.style.display = 'none';
                    const success = document.getElementById('formSuccess');
                    if (success) success.style.display = 'block';
                });
            }
        }
    } catch (e) { console.error(e); }
}

/* ==========================================================================
   Load Footer
   ========================================================================== */
async function loadFooter() {
    try {
        const data = await fetchJSON('data/footer.json');

        const copy = document.getElementById('footerCopyright');
        if (copy) copy.textContent = `© ${data.copyright.year} ${data.copyright.name}. ${data.copyright.text}`;

        const links = document.getElementById('footerLinks');
        if (links) {
            links.innerHTML = (data.links || []).map(l =>
                `<a href="${l.url}" target="_blank" rel="noopener">${l.text}</a>`
            ).join('');
        }
    } catch (e) { console.error(e); }
}

/* ==========================================================================
   Boot
   ========================================================================== */
document.addEventListener('DOMContentLoaded', async () => {
    // Init UI behaviours immediately
    initScrollProgress();
    initBackToTop();
    initNavbar();
    initSmoothScroll();

    // Load all content
    await Promise.all([
        loadSiteConfig(),
        loadNavigation(),
        loadHero(),
        loadAbout(),
        loadExperience(),
        loadSkills(),
        loadProjects(),
        loadEducation(),
        loadContact(),
        loadFooter(),
    ]);

    // Start reveal observers after content is in the DOM
    requestAnimationFrame(() => {
        initReveal();
        initStatCounters();
    });
});
