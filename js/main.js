/**
 * Main JavaScript for Heitor Oliveira Portfolio
 * Mobile-first, accessible, performance-optimized
 */

(function () {
    'use strict';

    // ================================
    // DOM ELEMENTS
    // ================================
    const header = document.getElementById('header');
    const nav = document.getElementById('nav');
    const navToggle = document.getElementById('navToggle');
    const navOverlay = document.getElementById('navOverlay');
    const navLinks = Array.from(document.querySelectorAll('.nav__link'));
    const quickNav = document.getElementById('quickNav');
    const contactForm = document.getElementById('contactForm');
    const sections = document.querySelectorAll('section[id]');
    const revealElements = document.querySelectorAll('.reveal');
    const metricNumbers = document.querySelectorAll('.metric__number');
    const skillBars = document.querySelectorAll('.skill__progress');

    // ================================
    // MOBILE MENU
    // ================================
    function lockScroll() {
        document.body.classList.add('menu-open');
        document.documentElement.style.overflowY = 'hidden';
        document.body.style.overflowY = 'hidden';
    }

    function unlockScroll() {
        document.body.classList.remove('menu-open');
        document.documentElement.style.overflowY = '';
        document.body.style.overflowY = '';
    }

    function openMenu() {
        if (!nav || !navOverlay || !navToggle) {
            return;
        }
        nav.classList.add('open');
        navOverlay.classList.add('active');
        navToggle.classList.add('active');
        navToggle.setAttribute('aria-expanded', 'true');
        navToggle.setAttribute('aria-label', 'Fechar menu');
        lockScroll();
    }

    function closeMenu() {
        if (!nav || !navOverlay || !navToggle) {
            unlockScroll();
            return;
        }
        try {
            nav.classList.remove('open');
            navOverlay.classList.remove('active');
            navToggle.classList.remove('active');
            navToggle.setAttribute('aria-expanded', 'false');
            navToggle.setAttribute('aria-label', 'Abrir menu');
        } finally {
            unlockScroll();
        }
    }

    function toggleMenu() {
        if (nav.classList.contains('open')) {
            closeMenu();
        } else {
            openMenu();
        }
    }

    // Event Listeners for Menu
    if (navToggle) {
        navToggle.addEventListener('click', toggleMenu);
    }

    if (navOverlay) {
        navOverlay.addEventListener('click', closeMenu);
    }

    // Close menu with ESC key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && nav.classList.contains('open')) {
            closeMenu();
        }
    });

    // Close menu when clicking nav links
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            closeMenu();
        });
    });

    // ================================
    // SMOOTH SCROLL
    // ================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                const headerHeight = header.offsetHeight;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerHeight;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    function normalizePath(pathname) {
        const trimmed = pathname.replace(/\/+$/, '');
        return trimmed || '/';
    }

    function getCurrentPath() {
        return normalizePath(new URL(window.location.href).pathname);
    }

    function getLinkUrl(link) {
        try {
            return new URL(link.href, window.location.href);
        } catch (error) {
            return null;
        }
    }

    const currentPath = getCurrentPath();
    const inPageLinkTargets = navLinks
        .map((link) => {
            const linkUrl = getLinkUrl(link);
            if (!linkUrl) {
                return null;
            }
            const linkPath = normalizePath(linkUrl.pathname);
            if (!linkUrl.hash || linkPath !== currentPath) {
                return null;
            }
            return {
                link,
                targetId: linkUrl.hash.slice(1)
            };
        })
        .filter(Boolean);

    function updateActiveLinkByPath() {
        if (!navLinks.length) return;

        const currentUrl = new URL(window.location.href);
        const cleanPath = normalizePath(currentUrl.pathname);

        navLinks.forEach(link => {
            const linkUrl = getLinkUrl(link);
            if (!linkUrl) return;

            const linkPath = normalizePath(linkUrl.pathname);
            const isSameOrigin = linkUrl.origin === currentUrl.origin;
            const isInPageAnchor = linkUrl.hash && linkPath === cleanPath;

            if (isInPageAnchor) {
                return;
            }

            link.classList.toggle('active', isSameOrigin && linkPath === cleanPath);
        });
    }

    // ================================
    // ACTIVE LINK ON SCROLL
    // ================================
    function updateActiveLink() {
        if (!inPageLinkTargets.length) return;
        const scrollPosition = window.scrollY + (header ? header.offsetHeight : 0) + 100;
        let activeSectionId = '';

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                activeSectionId = sectionId;
            }
        });

        if (!activeSectionId) return;

        inPageLinkTargets.forEach(({ link, targetId }) => {
            link.classList.toggle('active', targetId === activeSectionId);
        });
    }

    // ================================
    // HEADER SCROLL STATE
    // ================================
    function updateHeaderState() {
        if (!header) return;

        // Add scrolled class when past 100px
        if (window.scrollY > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }

    // ================================
    // QUICK NAV VISIBILITY
    // ================================
    function updateQuickNavVisibility() {
        if (!quickNav) return;

        if (window.scrollY > 400) {
            quickNav.classList.add('visible');
        } else {
            quickNav.classList.remove('visible');
        }
    }

    // ================================
    // REVEAL ANIMATIONS (Intersection Observer)
    // ================================
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    });

    revealElements.forEach(el => {
        revealObserver.observe(el);
    });

    // ================================
    // COUNTER ANIMATION
    // ================================
    function animateCounter(element) {
        const target = parseInt(element.getAttribute('data-target'));
        const duration = 2000; // 2 seconds
        const startTime = performance.now();

        function updateCounter(currentTime) {
            const elapsedTime = currentTime - startTime;
            const progress = Math.min(elapsedTime / duration, 1);

            // Easing function (ease-out-cubic)
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            const currentValue = Math.floor(easeProgress * target);

            element.textContent = currentValue;

            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            } else {
                element.textContent = target;
            }
        }

        requestAnimationFrame(updateCounter);
    }

    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                counterObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.5
    });

    metricNumbers.forEach(counter => {
        counterObserver.observe(counter);
    });

    // ================================
    // SKILL BARS ANIMATION
    // ================================
    const skillObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const progress = entry.target.getAttribute('data-progress');
                entry.target.style.width = `${progress}%`;
                skillObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.5
    });

    skillBars.forEach(bar => {
        skillObserver.observe(bar);
    });

    // ================================
    // FORM VALIDATION
    // ================================
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    function validatePhone(phone) {
        const re = /^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/;
        return re.test(phone);
    }

    function getInputPattern(input) {
        const pattern = input.getAttribute('pattern');
        if (!pattern) return null;

        try {
            return new RegExp(pattern);
        } catch (error) {
            return null;
        }
    }

    function showError(input, message) {
        const formGroup = input.closest('.form-group');
        const errorElement = formGroup.querySelector('.form-error');

        input.classList.add('error');
        errorElement.textContent = message;
    }

    function clearError(input) {
        const formGroup = input.closest('.form-group');
        const errorElement = formGroup.querySelector('.form-error');

        input.classList.remove('error');
        errorElement.textContent = '';
    }

    function validateField(input) {
        const value = input.value.trim();
        const type = input.type;
        const name = input.name;

        clearError(input);

        if (!value) {
            if (name === 'name') {
                showError(input, 'Por favor, informe seu nome.');
                return false;
            }
            return true;
        }

        const pattern = getInputPattern(input);
        if (pattern && !pattern.test(value)) {
            showError(input, input.getAttribute('data-error') || 'Valor invalido.');
            return false;
        }

        if (!pattern) {
            if (name === 'whatsapp' && !validatePhone(value)) {
                showError(input, 'Informe um WhatsApp valido.');
                return false;
            }

            if (type === 'email' && !validateEmail(value)) {
                showError(input, 'Informe um e-mail valido.');
                return false;
            }
        }

        return true;
    }

    if (contactForm) {
        const inputs = contactForm.querySelectorAll('.form-input');
        const steps = contactForm.querySelectorAll('.form-step');
        const progressText = contactForm.querySelector('.form-progress__text');
        const progressFill = contactForm.querySelector('.form-progress__fill');
        const formStatus = contactForm.querySelector('.form-status');
        const nextBtn = contactForm.querySelector('.form-next');
        const backBtn = contactForm.querySelector('.form-back');
        const submitBtn = contactForm.querySelector('.form-submit');
        const nameInput = contactForm.querySelector('#name');
        const whatsappInput = contactForm.querySelector('#whatsapp');
        const emailInput = contactForm.querySelector('#email');
        const servicesGroup = contactForm.querySelector('.form-options');
        const thanksName = contactForm.querySelector('.form-thanks__name');
        let currentStep = 0;
        let isSubmitting = false;
        const nextBtnLabel = nextBtn ? nextBtn.textContent : '';

        function updateThanksName() {
            if (!thanksName || !nameInput) return;
            const value = nameInput.value.trim();
            thanksName.textContent = value || 'amigo';
        }

        function setFormStatus(message) {
            if (!formStatus) return;
            formStatus.textContent = message || '';
        }

        function validateServices() {
            if (!servicesGroup) return true;

            const checked = servicesGroup.querySelectorAll('input[type=\"checkbox\"]:checked').length > 0;
            const errorElement = servicesGroup.closest('.form-group').querySelector('.form-error');

            if (!checked) {
                errorElement.textContent = 'Selecione pelo menos um servico.';
                return false;
            }

            errorElement.textContent = '';
            return true;
        }

        async function submitForm() {
            const action = contactForm.getAttribute('action') || 'contact.php';
            const method = (contactForm.getAttribute('method') || 'post').toUpperCase();
            const payload = new FormData(contactForm);

            try {
                const response = await fetch(action, {
                    method,
                    body: payload,
                    headers: {
                        'Accept': 'application/json'
                    }
                });
                const data = await response.json().catch(() => ({}));

                if (!response.ok || !data.ok) {
                    setFormStatus(data.message || 'Nao foi possivel enviar. Tente novamente.');
                    return false;
                }

                setFormStatus('');
                return true;
            } catch (error) {
                setFormStatus('Nao foi possivel enviar. Tente novamente.');
                return false;
            }
        }

        function clearMissingContactErrors() {
            [whatsappInput, emailInput].forEach(input => {
                if (!input) return;
                const formGroup = input.closest('.form-group');
                const errorElement = formGroup.querySelector('.form-error');

                if (errorElement && errorElement.textContent === 'Informe WhatsApp ou e-mail.') {
                    input.classList.remove('error');
                    errorElement.textContent = '';
                }
            });
        }

        function validateContactStep(step) {
            if (!step || !step.classList.contains('form-contact')) return true;

            const whatsappValue = whatsappInput ? whatsappInput.value.trim() : '';
            const emailValue = emailInput ? emailInput.value.trim() : '';

            if (!whatsappValue && !emailValue) {
                if (whatsappInput) {
                    showError(whatsappInput, 'Informe WhatsApp ou e-mail.');
                }
                if (emailInput) {
                    showError(emailInput, 'Informe WhatsApp ou e-mail.');
                }
                return false;
            }

            clearMissingContactErrors();
            return true;
        }

        function updateFormStep() {
            if (!steps.length) return;

            steps.forEach((step, index) => {
                const isActive = index === currentStep;
                step.classList.toggle('active', isActive);
                step.setAttribute('aria-hidden', isActive ? 'false' : 'true');
            });

            const totalSteps = steps.length;
            const progressValue = Math.round(((currentStep + 1) / totalSteps) * 100);

            if (progressText) {
                progressText.textContent = `Passo ${currentStep + 1} de ${totalSteps}`;
            }

            if (progressFill) {
                progressFill.style.width = `${progressValue}%`;
            }

            if (backBtn) {
                backBtn.hidden = currentStep === 0;
            }

            if (nextBtn) {
                nextBtn.hidden = currentStep >= totalSteps - 1;
            }

            if (submitBtn) {
                submitBtn.hidden = currentStep < totalSteps - 1;
            }

            updateThanksName();
        }

        function validateStep(stepIndex) {
            const step = steps[stepIndex];
            if (!step) return true;

            let isValid = true;
            const stepInputs = step.querySelectorAll('.form-input');

            stepInputs.forEach(input => {
                if (!validateField(input)) {
                    isValid = false;
                }
            });

            if (step.querySelector('.form-options')) {
                if (!validateServices()) {
                    isValid = false;
                }
            }

            if (!validateContactStep(step)) {
                isValid = false;
            }

            return isValid;
        }

        async function handleNextStep() {
            if (!validateStep(currentStep)) return;

            const lastInputStep = steps.length - 2;

            if (currentStep === lastInputStep) {
                if (isSubmitting) return;
                isSubmitting = true;
                if (nextBtn) {
                    nextBtn.disabled = true;
                    nextBtn.textContent = 'Enviando...';
                }

                const sent = await submitForm();

                isSubmitting = false;
                if (nextBtn) {
                    nextBtn.disabled = false;
                    nextBtn.textContent = nextBtnLabel;
                }

                if (!sent) {
                    return;
                }
            }

            currentStep = Math.min(currentStep + 1, steps.length - 1);
            updateFormStep();
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                handleNextStep();
            });
        }

        if (backBtn) {
            backBtn.addEventListener('click', () => {
                currentStep = Math.max(currentStep - 1, 0);
                updateFormStep();
            });
        }

        // Real-time validation on blur
        inputs.forEach(input => {
            input.addEventListener('blur', () => {
                validateField(input);
            });

            input.addEventListener('input', () => {
                if (input.classList.contains('error')) {
                    validateField(input);
                }
                if (formStatus && formStatus.textContent) {
                    setFormStatus('');
                }
            });
        });

        const handleContactInput = () => {
            const hasContactValue = (whatsappInput && whatsappInput.value.trim())
                || (emailInput && emailInput.value.trim());

            if (hasContactValue) {
                clearMissingContactErrors();
                setFormStatus('');
            }
        };

        if (whatsappInput) {
            whatsappInput.addEventListener('input', handleContactInput);
        }

        if (emailInput) {
            emailInput.addEventListener('input', handleContactInput);
        }

        if (servicesGroup) {
            servicesGroup.querySelectorAll('input[type=\"checkbox\"]').forEach(input => {
                input.addEventListener('change', validateServices);
            });
        }

        if (nameInput) {
            nameInput.addEventListener('input', updateThanksName);
        }

        // Form submission
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            handleNextStep();
        });

        updateFormStep();
    }

    // ================================
    // SCROLL EVENTS (Throttled)
    // ================================
    let ticking = false;

    function onScroll() {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                updateActiveLink();
                updateQuickNavVisibility();
                updateHeaderState();
                ticking = false;
            });
            ticking = true;
        }
    }

    window.addEventListener('scroll', onScroll, { passive: true });

    // ================================
    // INITIALIZATION
    // ================================
    function init() {
        closeMenu();
        updateActiveLinkByPath();
        updateActiveLink();
        updateQuickNavVisibility();
        updateHeaderState();

        // Add loaded class for potential page transition effects
        document.body.classList.add('loaded');
    }

    // Run on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    window.addEventListener('pageshow', () => {
        closeMenu();
    });

})();
