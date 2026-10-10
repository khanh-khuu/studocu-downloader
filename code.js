(function() {
    'use strict';

    const SELECTORS = [
        '[class*="PremiumBannerBlobWrapper"]',
        '[class*="InlineBanner_inline-banner"]',
        '[class*="PremiumPageClarificationBanner"]',
        '[class*="PremiumBannerHeader"]',
        '[class*="PremiumBannerBenefitsList"]',
        '[class*="PremiumBannerButtons"]',
        '[data-test-selector="modal-document-viewer-preview-message"]',
        '[data-test-selector="preview-banner-upgrade-first-cta"]',
        '[data-test-selector="preview-banner-upload-second-cta"]',
        '.banner-wrapper',
        '._95f5f1767857',
        '._3273140306b6',
        // Premium badge/tag/label selectors
        '[class*="PremiumBadge"]',
        '[class*="premium-badge"]',
        '[class*="premiumBadge"]',
        '[class*="PremiumLabel"]',
        '[class*="premiumLabel"]',
        '[class*="premium-label"]',
        '[class*="PremiumTag"]',
        '[class*="premiumTag"]',
        '[class*="premium-tag"]',
        '[class*="premium_tag"]',
        '[class*="premium_badge"]',
        '[class*="PremiumIcon"]',
        '[class*="premiumIcon"]',
        '[class*="premium-icon"]',
    ];

    function removeAll() {
        SELECTORS.forEach(selector => {
            try {
                document.querySelectorAll(selector).forEach(el => el.remove());
            } catch(e) {}
        });
    }

    // Run immediately
    removeAll();

    // Poll every 500ms for 10 seconds to catch late-loading banners
    let attempts = 0;
    const interval = setInterval(() => {
        removeAll();
        if (++attempts >= 20) clearInterval(interval);
    }, 500);

    // Run on page load events
    window.addEventListener('load', removeAll);

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', removeAll);
    } else {
        removeAll();
    }

    // Watch for dynamically added banners
    const observer = new MutationObserver(mutations => {
        let shouldRemove = false;
        for (const mutation of mutations) {
            if (mutation.type === 'childList') {
                for (const node of mutation.addedNodes) {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        const isRelevant = SELECTORS.some(sel => {
                            try {
                                return node.matches(sel) || node.querySelector(sel);
                            } catch(e) { return false; }
                        });
                        if (isRelevant) {
                            shouldRemove = true;
                            break;
                        }
                    }
                }
            }
            if (shouldRemove) break;
        }
        if (shouldRemove) {
            setTimeout(removeAll, 50);
        }
    });

    if (document.body) {
        observer.observe(document.body, { childList: true, subtree: true });
    }
})();


(function() {
    'use strict';

    // ========== Banner & Premium Element Selectors ==========
    const BANNER_SELECTORS = [
        '.banner-wrapper',
        '[class*="InlineBanner_inline-banner"]',
        '[class*="PremiumBannerBlobWrapper"]',
        '[class*="PremiumPageClarificationBanner"]',
        '[class*="PremiumBannerHeader"]',
        '[class*="PremiumBannerBenefitsList"]',
        '[class*="PremiumBannerButtons"]',
        '[data-test-selector="modal-document-viewer-preview-message"]',
        '[data-test-selector="preview-banner-upgrade-first-cta"]',
        '[data-test-selector="preview-banner-upload-second-cta"]',
        '._95f5f1767857',
        '._3273140306b6',
        '._8690b6fc16a3',
        '._4d5ecd011027',
        '[class*="premium-banner-wrapper"]',
        '[class*="ViewerContainer_premium"]',
    ];

    // ========== Premium Badge Selectors ==========
    const PREMIUM_BADGE_SELECTORS = [
        '[class*="PremiumBadge"]',
        '[class*="premium-badge"]',
        '[class*="premiumBadge"]',
        '[class*="PremiumLabel"]',
        '[class*="premiumLabel"]',
        '[class*="premium-label"]',
        '[class*="PremiumTag"]',
        '[class*="premiumTag"]',
        '[class*="premium-tag"]',
        '[class*="premium_tag"]',
        '[class*="premium_badge"]',
        '[class*="PremiumIcon"]',
        '[class*="premiumIcon"]',
        '[class*="premium-icon"]',
        '[data-test-selector*="premium-badge"]',
        '[data-test-selector*="premium-tag"]',
        '[data-test-selector*="premium-label"]',
    ];

    // ========== Ad & AI-Toolbar Selectors ==========
    const AD_SELECTORS = [
        '[class*="AdsContainer"]',
        'r89-standalone',
        '[id^="r89-"]',
        '[id*="r89-"]',
        'iframe[id^="google_ads_iframe"]',
        'div[id^="google_ads_iframe"]',
        '[id^="div-gpt-ad"]',
        '[id*="gpt-ad"]',
        '[id*="adagio"]',
        '[class*="adagio"]',
        '[class*="Advertisement"]',
        '[class*="advertisement"]',
    ];

    const AI_TOOLBAR_SELECTORS = [
        '[class*="AIToolbar"]',
    ];

    function removeAdsAndAI() {
        AD_SELECTORS.forEach(selector => {
            try {
                document.querySelectorAll(selector).forEach(el => {
                    el.style.setProperty('display', 'none', 'important');
                    el.style.setProperty('visibility', 'hidden', 'important');
                });
            } catch(e) {}
        });
        AI_TOOLBAR_SELECTORS.forEach(selector => {
            try {
                document.querySelectorAll(selector).forEach(el => {
                    el.style.setProperty('display', 'none', 'important');
                    el.style.setProperty('visibility', 'hidden', 'important');
                });
            } catch(e) {}
        });
    }

    // ========== Document Access Data (cached) ==========
    let _docAccessData = null;

    function getDocumentAccessData() {
        if (_docAccessData) return _docAccessData;
        try {
            const nextDataEl = document.querySelector('#__NEXT_DATA__');
            if (!nextDataEl) return null;
            const data = JSON.parse(nextDataEl.textContent);
            const da = data.props?.pageProps?.documentAccess;
            if (da && da.objectKey && da.signedQueryParams) {
                const doc = data.props?.pageProps?.document;
                _docAccessData = {
                    objectKey: da.objectKey,
                    pngParams: da.signedQueryParams.png || '',
                    blurredPageParams: da.signedQueryParams.blurredPage || '',
                    hasBlurredPages: da.hasBlurredPages || false,
                    pageCount: doc ? (doc.pageCount || 0) : 0,
                };
                return _docAccessData;
            }
        } catch(e) {}
        return null;
    }

    // ========== Lazy Load & Image Fix ==========

    let _lazyLoadDone = false;

    function triggerLazyLoadAndFixImages() {
        if (_lazyLoadDone) return;
        const accessData = getDocumentAccessData();
        if (!accessData || !accessData.pngParams) return;

        const pfs = document.querySelectorAll('.pf');
        if (pfs.length === 0) return;
        _lazyLoadDone = true;

        console.log('StudocuHack: Triggering lazy load for ' + pfs.length + ' pages');

        let scrollIdx = 0;
        const previewEnd = Math.min(7, pfs.length); 

        function scrollNext() {
            if (scrollIdx >= previewEnd) {
                setTimeout(fixAllPageImages, 1500);
                return;
            }
            pfs[scrollIdx].scrollIntoView({ behavior: 'instant' });
            scrollIdx++;
            setTimeout(scrollNext, 300);
        }

        const scrollContainer = document.getElementById('viewer-wrapper') ||
                                document.getElementById('document-wrapper') ||
                                document.scrollingElement || document.documentElement;
        const savedScrollTop = scrollContainer.scrollTop;

        scrollNext();

        function fixAllPageImages() {
            scrollContainer.scrollTop = savedScrollTop;

            const pngBase = 'https://doc-assets.studocu.com/' +
                accessData.objectKey + '/html/bg';
            const pngSuffix = '.png' + accessData.pngParams;

            pfs.forEach((pf, idx) => {
                const pageNum = idx + 1;
                const imgs = pf.querySelectorAll('img');
                const hasText = pf.querySelectorAll('span').length > 0;
                const hasContent = pf.innerHTML.length > 300;

                if (imgs.length > 0) {
                    imgs.forEach(img => {
                        if (img.naturalWidth === 0 && !img.complete) {
                            img.loading = 'eager';
                            const currentSrc = img.src;
                            if (currentSrc && currentSrc.includes('/html/bg')) {
                                img.src = '';
                                img.src = currentSrc;
                            } else {
                                img.src = pngBase + pageNum.toString(16) + pngSuffix;
                            }
                            img.dataset.shFixed = 'true';
                        }
                    });
                }

                if (!hasContent && imgs.length === 0) {
                    injectPageImage(pf, pageNum, pngBase, pngSuffix);
                }
            });

            console.log('StudocuHack: Image fix complete');
        }
    }

    function injectPageImage(pf, pageNum, pngBase, pngSuffix) {
        const testImg = new Image();
        const hexNum = pageNum.toString(16);
        const imgUrl = pngBase + hexNum + pngSuffix;

        testImg.onload = function() {
            const pageContent = pf.querySelector('.page-content') ||
                                pf.querySelector('[class*="page-content"]');

            if (pageContent) {
                pageContent.innerHTML = '';
                const img = document.createElement('img');
                img.src = imgUrl;
                img.className = 'bi x0 y0 w1 h1';
                img.alt = '';
                img.style.cssText = 'width:100%;height:auto;opacity:1;filter:none;visibility:visible;';
                img.loading = 'eager';
                img.dataset.shInjected = 'true';
                pageContent.appendChild(img);
                pageContent.style.display = 'block';
                pageContent.style.visibility = 'visible';
            } else {
                const wrapper = document.createElement('div');
                wrapper.className = 'page-content nofilter';
                wrapper.style.cssText = 'display:block;visibility:visible;filter:none;opacity:1;';
                const img = document.createElement('img');
                img.src = imgUrl;
                img.className = 'bi x0 y0 w1 h1';
                img.alt = '';
                img.style.cssText = 'width:100%;height:auto;opacity:1;filter:none;visibility:visible;';
                img.loading = 'eager';
                img.dataset.shInjected = 'true';
                wrapper.appendChild(img);

                const existingChildren = pf.querySelectorAll('div');
                existingChildren.forEach(child => {
                    if (child.innerHTML.trim().length < 50) {
                        child.remove();
                    }
                });
                pf.appendChild(wrapper);
            }

            pf.style.display = '';
            pf.style.visibility = 'visible';
            pf.style.opacity = '1';
            console.log('StudocuHack: Injected image for page ' + pageNum);
        };

        testImg.onerror = function() {
            // Image not accessible
        };

        testImg.src = imgUrl;
    }

    // ========== Core Functions ==========

    function removeBanners() {
        BANNER_SELECTORS.forEach(selector => {
            try {
                document.querySelectorAll(selector).forEach(el => el.remove());
            } catch(e) {}
        });

        const modal = document.querySelector('#modal-overlay');
        if (modal) modal.style.display = 'none';
    }

    function unblurImages() {
        const accessData = getDocumentAccessData();
        if (!accessData || !accessData.pngParams) return;

        document.querySelectorAll('.pf img').forEach(img => {
            if (img.dataset.shUnblurred) return;

            const src = img.src || img.getAttribute('src') || '';
            if (src.includes('/pages/blurred/') || src.includes('/blurred/page')) {
                const match = src.match(/page(\d+)\./);
                if (match) {
                    const pageNum = parseInt(match[1]);
                    const clearUrl = 'https://doc-assets.studocu.com/' +
                        accessData.objectKey + '/html/bg' + pageNum.toString(16) + '.png' +
                        accessData.pngParams;

                    const testImg = new Image();
                    testImg.onload = function() {
                        img.src = clearUrl;
                        img.style.filter = 'none';
                        img.style.opacity = '1';
                        img.dataset.shUnblurred = 'true';
                    };
                    testImg.onerror = function() {
                        img.style.filter = 'none';
                        img.style.opacity = '1';
                    };
                    testImg.src = clearUrl;
                }
            }
        });

        document.querySelectorAll('.pf img[data-src*="blurred"], .pf img[srcset*="blurred"]').forEach(img => {
            if (img.dataset.shUnblurred) return;
            const dataSrc = img.dataset.src || '';
            const match = dataSrc.match(/page(\d+)\./);
            if (match) {
                const pageNum = parseInt(match[1]);
                const clearUrl = 'https://doc-assets.studocu.com/' +
                    accessData.objectKey + '/html/bg' + pageNum.toString(16) + '.png' +
                    accessData.pngParams;
                img.dataset.src = clearUrl;
                img.removeAttribute('srcset');
                img.dataset.shUnblurred = 'true';
            }
        });
    }

    function removeBlur() {
        document.querySelectorAll('.pf').forEach(pf => {
            pf.style.filter = 'none';
            pf.style.webkitFilter = 'none';
            pf.style.opacity = '1';
            pf.style.userSelect = 'auto';
            pf.style.pointerEvents = 'auto';
            pf.style.clipPath = 'none';
            pf.style.webkitClipPath = 'none';
            pf.classList.add('nofilter');
            Array.from(pf.classList).forEach(cls => {
                if (cls.includes('blurred') || cls.includes('Blurred')) {
                    pf.classList.remove(cls);
                }
            });
        });

        document.querySelectorAll('.page-content').forEach(page => {
            page.style.filter = 'none';
            page.style.webkitFilter = 'none';
            page.style.opacity = '1';
            page.style.userSelect = 'auto';
            page.style.pointerEvents = 'auto';
            page.style.visibility = 'visible';
            page.style.clipPath = 'none';
            page.style.webkitClipPath = 'none';
            page.style.maskImage = 'none';
            page.style.webkitMaskImage = 'none';
            page.style.color = '';
            page.classList.add('nofilter');

            Array.from(page.classList).forEach(cls => {
                if (cls.includes('blurred') || cls.includes('Blurred')) {
                    page.classList.remove(cls);
                }
            });

            let ancestor = page.parentElement;
            let depth = 0;
            while (ancestor && ancestor.id !== 'page-container' && ancestor !== document.body && depth < 10) {
                const cs = getComputedStyle(ancestor);
                if (cs.filter !== 'none' || cs.opacity !== '1') {
                    ancestor.style.filter = 'none';
                    ancestor.style.webkitFilter = 'none';
                    ancestor.style.opacity = '1';
                }
                Array.from(ancestor.classList).forEach(cls => {
                    if (cls.includes('blurred') || cls.includes('Blurred')) {
                        ancestor.classList.remove(cls);
                    }
                });
                ancestor = ancestor.parentElement;
                depth++;
            }

            page.querySelectorAll('img').forEach(img => {
                img.style.width = '100%';
                img.style.height = 'auto';
                img.style.opacity = '1';
                img.style.filter = 'none';
                img.style.visibility = 'visible';
            });

            if (page.parentNode) {
                Array.from(page.parentNode.children).forEach(sibling => {
                    if (sibling !== page && sibling.className) {
                        const cn = typeof sibling.className === 'string' ? sibling.className : '';
                        if (cn.includes('PremiumPageClarification') ||
                            cn.includes('blurred') ||
                            cn.includes('Blurred') ||
                            cn.includes('premium-banner') ||
                            cn.includes('BlurredPage')) {
                            sibling.remove();
                        }
                    }
                });
            }
        });

        document.querySelectorAll('[class*="blurred-image-wrapper"], [class*="BlurredImage"], [class*="blurred-page"]').forEach(el => {
            el.style.filter = 'none';
            el.style.opacity = '1';
            el.style.visibility = 'visible';
            Array.from(el.classList).forEach(cls => {
                if (cls.includes('blurred') || cls.includes('Blurred')) {
                    el.classList.remove(cls);
                }
            });
        });

        document.querySelectorAll('.blurred-container').forEach(container => {
            container.classList.remove('blurred-container');
        });

        document.querySelectorAll('#modal-overlay, [class*="PremiumOverlay"], [class*="premium-overlay"]').forEach(el => {
            el.style.display = 'none';
        });

        unblurImages();
    }

    function removeStudocuDownloadButtons() {
        document.querySelectorAll('[data-test-selector="document-viewer-download-button-topbar"]').forEach(el => {
            if (!el.classList.contains('download-button-1') && !el.querySelector('.download-button-1')) {
                el.remove();
            }
        });

        document.querySelectorAll('button[class*="Button_button"], a[class*="Button_button"]').forEach(el => {
            if (el.classList.contains('download-button-1')) return;
            const text = el.textContent.trim().toLowerCase();
            if (text === 'scarica' || text === 'download') {
                el.remove();
            }
        });

        document.querySelectorAll('div.hidden-on-mobile, div.hidden-from-tablet').forEach(container => {
            container.querySelectorAll('button, a').forEach(el => {
                if (el.classList.contains('download-button-1')) return;
                const text = el.textContent.trim().toLowerCase();
                if (text === 'scarica' || text === 'download') {
                    el.remove();
                }
            });
        });
    }

    function removePremiumButton() {
        try {
            const premiumButton = document.querySelector('#header-position-handle')?.childNodes[0]?.childNodes[1]?.childNodes[0]?.childNodes[1];
            if (premiumButton) premiumButton.remove();
        } catch(e) {}

        document.querySelectorAll('a, button').forEach(el => {
            const text = el.textContent.trim().toLowerCase();
            if (text === 'upgrade' || text === 'get premium' || text === 'go premium') {
                const parent = el.closest('[class*="header"], [class*="Header"], #header-position-handle');
                if (parent) el.remove();
            }
        });
    }

    // ========== React State Patching ==========

    function patchReactBlurState() {
        document.querySelectorAll('.pf').forEach(pf => {
            try {
                const fiberKey = Object.keys(pf).find(k => k.startsWith('__reactFiber$') || k.startsWith('__reactInternalInstance'));
                if (!fiberKey) return;
                let fiber = pf[fiberKey];
                let depth = 0;
                while (fiber && depth < 10) {
                    if (fiber.memoizedProps && 'isBlurred' in fiber.memoizedProps) {
                        fiber.memoizedProps.isBlurred = false;
                        fiber.memoizedProps.hasBlurredImage = false;
                        break;
                    }
                    fiber = fiber.return;
                    depth++;
                }
            } catch(e) {}
        });
    }

    function patchNextData() {
        try {
            const nextDataEl = document.querySelector('#__NEXT_DATA__');
            if (!nextDataEl) return;
            const data = JSON.parse(nextDataEl.textContent);
            if (data.props?.pageProps?.documentAccess) {
                data.props.pageProps.documentAccess.hasBlurredPages = false;
            }
            nextDataEl.textContent = JSON.stringify(data);
        } catch(e) {}
    }

    function removeRecommendations() {
        try {
            const recommendations = document.querySelector('#viewer-recommendations');
            if (recommendations && recommendations.parentNode) {
                recommendations.parentNode.remove();
            }
        } catch(e) {}
    }

    function removePremiumBadges() {
        PREMIUM_BADGE_SELECTORS.forEach(selector => {
            try {
                document.querySelectorAll(selector).forEach(el => el.remove());
            } catch(e) {}
        });

        document.querySelectorAll('h1, [class*="Title"], [class*="title"], [class*="DocumentTitle"], [class*="documentTitle"]').forEach(titleEl => {
            const parent = titleEl.parentElement;
            if (!parent) return;
            parent.querySelectorAll('span, div, a, badge, label').forEach(el => {
                const text = el.textContent.trim();
                if (text === 'Premium' || text === 'PREMIUM') {
                    if (el.offsetHeight < 60 || el.getBoundingClientRect().width < 200) {
                        el.remove();
                    }
                }
            });
        });

        document.querySelectorAll('span, div').forEach(el => {
            if (el.children.length <= 1 && el.textContent.trim() === 'Premium') {
                const rect = el.getBoundingClientRect();
                if (rect.width > 0 && rect.width < 200 && rect.height > 0 && rect.height < 50) {
                    const isInBanner = el.closest('[class*="PremiumBanner"], [class*="PremiumPageClarification"], [class*="InlineBanner"]');
                    if (!isInBanner) {
                        el.remove();
                    }
                }
            }
        });
    }

    // ========== Logo & Branding ==========

    function updateLogos() {
        const logoSelectors = [
            '[aria-label="StudeerSnel Logo"]',
            '[aria-label="StuDocu Logo"]',
            '[aria-label="Studocu Logo"]',
        ];

        logoSelectors.forEach(selector => {
            document.querySelectorAll(selector).forEach(logo => {
                if (logo.closest('.studocuhack-logo-replaced')) return;
                const wrapper = document.createElement('div');
                wrapper.classList.add('studocuhack-logo-replaced');
                wrapper.style.cssText = 'display:inline-flex;align-items:center;gap:0;cursor:pointer;';
                wrapper.innerHTML = '<svg width="24" height="24" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" style="flex-shrink:0"><rect width="32" height="32" rx="6" fill="#4D8BF5"/><text x="16" y="23" text-anchor="middle" font-family="Arial Black,Arial,sans-serif" font-weight="900" font-size="20" fill="white">S</text></svg>'
                    + '<span style="margin-left:6px;font-weight:800;font-size:15px;white-space:nowrap;"><span style="color:inherit">STUDOCU</span><span style="color:#4D8BF5">DOWNLOADER</span></span>';
                wrapper.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                });
                const parent = logo.parentElement;
                if (parent) parent.replaceChild(wrapper, logo);
            });
        });
    }

    // ========== Main Execution ==========

    let debounceTimer = null;
    function debouncedCleanup() {
        if (debounceTimer) return;
        debounceTimer = setTimeout(() => {
            debounceTimer = null;
            removeBanners();
            removeBlur();
            removePremiumBadges();
            removeStudocuDownloadButtons();
            removeAdsAndAI();
        }, 50);
    }

    function runAll() {
        removeBanners();
        removeBlur();
        removePremiumButton();
        removePremiumBadges();
        removeStudocuDownloadButtons();
        removeRecommendations();
        removeAdsAndAI();
        updateLogos();
        patchReactBlurState();
    }

    runAll();

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            patchNextData();
            runAll();
        });
    } else {
        patchNextData();
    }

    window.addEventListener('load', runAll);

    const observer = new MutationObserver(mutations => {
        let hasNewBlurredContent = false;
        for (const mutation of mutations) {
            if (mutation.type === 'childList') {
                for (const node of mutation.addedNodes) {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        if (node.tagName === 'IMG' && (node.src || '').includes('blurred')) {
                            hasNewBlurredContent = true;
                            break;
                        }
                        if (node.querySelector && node.querySelector('img[src*="blurred"]')) {
                            hasNewBlurredContent = true;
                            break;
                        }
                        const cn = node.className?.toString?.() || '';
                        if (cn.includes('blurred') || cn.includes('Blurred') || cn.includes('PremiumBanner') || cn.includes('premium-banner')) {
                            hasNewBlurredContent = true;
                            break;
                        }
                    }
                }
            }
            if (mutation.type === 'attributes' && mutation.attributeName === 'src') {
                const target = mutation.target;
                if (target.tagName === 'IMG' && (target.src || '').includes('blurred')) {
                    hasNewBlurredContent = true;
                }
            }
            if (hasNewBlurredContent) break;
        }

        if (hasNewBlurredContent) {
            removeBlur();
            patchReactBlurState();
        }
        debouncedCleanup();
    });

    const observeTarget = document.body || document.documentElement;
    if (observeTarget) {
        observer.observe(observeTarget, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['src', 'class', 'style'],
        });
    }

    let scrollDebounce = null;
    const scrollHandler = () => {
        if (scrollDebounce) return;
        scrollDebounce = setTimeout(() => {
            scrollDebounce = null;
            removeBlur();
            patchReactBlurState();
        }, 100);
    };

    const viewerWrapper = document.getElementById('viewer-wrapper');
    const documentWrapper = document.getElementById('document-wrapper');

    if (viewerWrapper) viewerWrapper.addEventListener('scroll', scrollHandler, { passive: true });
    if (documentWrapper) documentWrapper.addEventListener('scroll', scrollHandler, { passive: true });
    window.addEventListener('scroll', scrollHandler, { passive: true });

    document.addEventListener('DOMContentLoaded', () => {
        const vw = document.getElementById('viewer-wrapper');
        const dw = document.getElementById('document-wrapper');
        if (vw) vw.addEventListener('scroll', scrollHandler, { passive: true });
        if (dw) dw.addEventListener('scroll', scrollHandler, { passive: true });
    });

    const toggleButton = document.querySelector('[data-test-selector="content-sidebar-toggle"]');
    if (toggleButton) {
        toggleButton.addEventListener('click', updateLogos);
    }

    let periodicCount = 0;
    const periodicCheck = setInterval(() => {
        removeBlur();
        patchReactBlurState();
        periodicCount++;
        if (periodicCount >= 15) {
            clearInterval(periodicCheck);
            setInterval(() => {
                removeBlur();
                patchReactBlurState();
            }, 5000);
        }
    }, 2000);
})();


(function() {
    'use strict';

    function escapeHtml(s) {
        return String(s).replace(/[&<>"]/g, function(c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
        });
    }

    function getTitle() {
        return document.querySelector('h1')
            ? document.querySelector('h1').textContent.trim()
            : (document.title || 'document');
    }

    // Resolve the full-resolution page-image URL pattern. Page images are
    // HEX-numbered: .../html/bg{hexPageNum}.png{signedParams}. We reconstruct
    // these ourselves so we never depend on the low-res thumbnail the viewer
    // may have lazy-loaded for a given page.
    function getImagePattern() {
        try {
            var nd = JSON.parse(document.querySelector('#__NEXT_DATA__').textContent);
            var da = nd.props.pageProps.documentAccess;
            if (da && da.objectKey && da.signedQueryParams && da.signedQueryParams.png) {
                return {
                    prefix: 'https://doc-assets.studocu.com/' + da.objectKey + '/html/bg',
                    suffix: '.png' + da.signedQueryParams.png
                };
            }
        } catch (e) {}
        // Fallback: derive from a full-resolution image already in the DOM.
        var imgs = document.querySelectorAll('.pf img');
        for (var i = 0; i < imgs.length; i++) {
            var s = imgs[i].src || '';
            if (s.indexOf('/bg') !== -1 && s.indexOf('doc-assets') !== -1 && imgs[i].naturalWidth > 600) {
                var m = s.match(/(.*?\/bg)[0-9a-f]+(\.png\?.*)/i);
                if (m) return { prefix: m[1], suffix: m[2] };
            }
        }
        return null;
    }

    // A page is "rendered" once it leaves the empty lazy placeholder state:
    // it gains its background image and/or text spans. Empty placeholders are
    // tiny (~200 chars); a loaded image-only page is ~1k; a text page is many k.
    function pageRendered(pf) {
        var hasSpans = pf.querySelectorAll('span').length > 3;
        var img = pf.querySelector('img');
        var imgLoaded = img && img.complete && img.naturalWidth > 0;
        return pf.innerHTML.length > 500 && (hasSpans || imgLoaded);
    }

    // Wait until a single page has finished rendering and its content size has
    // stabilised (so we don't clone a half-rendered text layer).
    function waitForPageReady(pf) {
        return new Promise(function(resolve) {
            var lastLen = -1, stable = 0, tries = 0;
            function check() {
                var len = pf.innerHTML.length;
                if (pageRendered(pf)) {
                    if (len === lastLen) { stable++; } else { stable = 0; lastLen = len; }
                    if (stable >= 2) { resolve(); return; }
                }
                if (tries++ > 30) { resolve(); return; } // ~4.5s safety cap per page
                setTimeout(check, 150);
            }
            check();
        });
    }

    // Studocu's React viewer lazy-loads page text AND unmounts pages that
    // scroll out of view. So we capture each page incrementally: scroll to it,
    // wait until it is fully rendered, then clone it immediately (before it can
    // unmount). Returns an array of cloned `.pf` elements in page order.
    function captureAllPages(onProgress) {
        var pfs = document.querySelectorAll('.pf');
        var container = document.getElementById('viewer-wrapper') ||
                        document.getElementById('document-wrapper') ||
                        document.scrollingElement || document.documentElement;
        var savedTop = container ? container.scrollTop : 0;
        var captured = [];

        return new Promise(function(resolve) {
            var i = 0;
            function next() {
                if (i >= pfs.length) {
                    if (container) container.scrollTop = savedTop;
                    resolve(captured);
                    return;
                }
                var pf = pfs[i];
                pf.scrollIntoView({ behavior: 'instant', block: 'center' });
                waitForPageReady(pf).then(function() {
                    captured.push(pf.cloneNode(true));
                    i++;
                    if (onProgress) onProgress(i, pfs.length);
                    next();
                });
            }
            next();
        });
    }

    // Fetch one image URL and return a data URI (or null on failure).
    function fetchDataUri(url) {
        return fetch(url, { credentials: 'omit' })
            .then(function(r) { return r.ok ? r.blob() : null; })
            .then(function(blob) {
                if (!blob || blob.size === 0) return null;
                return new Promise(function(resolve) {
                    var fr = new FileReader();
                    fr.onload = function() { resolve(fr.result); };
                    fr.onerror = function() { resolve(null); };
                    fr.readAsDataURL(blob);
                });
            })
            .catch(function() { return null; });
    }

    // Replace every doc-assets image src inside `root` with an embedded data URI.
    function embedImages(root, onProgress) {
        var imgs = Array.prototype.slice.call(root.querySelectorAll('img'));
        var targets = imgs.filter(function(img) {
            var s = img.getAttribute('src') || '';
            return s.indexOf('doc-assets') !== -1 || s.indexOf('/bg') !== -1;
        });
        // De-duplicate identical srcs so each image is fetched only once.
        var unique = {};
        targets.forEach(function(img) { unique[img.getAttribute('src')] = true; });
        var urls = Object.keys(unique);
        var map = {};
        var next = 0, done = 0;
        var CONCURRENCY = 6;

        return new Promise(function(resolve) {
            function worker() {
                if (next >= urls.length) return Promise.resolve();
                var url = urls[next++];
                return fetchDataUri(url).then(function(dataUri) {
                    if (dataUri) map[url] = dataUri;
                    done++;
                    if (onProgress) onProgress(done, urls.length);
                    return worker();
                });
            }
            if (urls.length === 0) { resolve(); return; }
            var starters = [];
            for (var c = 0; c < Math.min(CONCURRENCY, urls.length); c++) starters.push(worker());
            Promise.all(starters).then(function() {
                targets.forEach(function(img) {
                    var s = img.getAttribute('src');
                    if (map[s]) {
                        img.setAttribute('src', map[s]);
                        img.removeAttribute('srcset');
                    }
                });
                resolve();
            });
        });
    }

    // Assemble the captured page clones into a fresh `.p2hv` container. The
    // pdf2htmlEX stylesheet scopes its rules under `.p2hv`, so the wrapper must
    // keep that class for fonts/positioning to apply. We also point each page's
    // background image at its full-resolution URL (by page number) so low-res
    // lazy thumbnails are replaced with the real page image.
    function assembleContainer(capturedPages, pattern) {
        var container = document.createElement('div');
        container.className = 'p2hv';

        capturedPages.forEach(function(pf, idx) {
            pf.removeAttribute('style');
            pf.querySelectorAll('.download-button-1, .github-button, [data-studocuhack]').forEach(function(e) { e.remove(); });
            pf.querySelectorAll('[style]').forEach(function(e) {
                var st = e.getAttribute('style') || '';
                if (/display:\s*none/i.test(st)) {
                    e.setAttribute('style', st.replace(/display:\s*none/ig, 'display:block'));
                }
            });
            if (pattern) {
                var bg = pf.querySelector('img.bi') || pf.querySelector('img');
                if (bg) {
                    bg.setAttribute('src', pattern.prefix + (idx + 1).toString(16) + pattern.suffix);
                    bg.removeAttribute('srcset');
                    bg.removeAttribute('data-src');
                }
            }
            container.appendChild(pf);
        });
        return container;
    }

    // Inject the styles for the in-page download overlay + print isolation.
    function injectOverlayStyles() {
        if (document.getElementById('sh-dl-style')) return;
        var style = document.createElement('style');
        style.id = 'sh-dl-style';
        style.textContent =
            '#sh-dl-overlay{position:fixed;inset:0;z-index:2147483647;background:#525659;overflow:auto;}' +
            '#sh-dl-overlay .sh-dl-bar{position:sticky;top:0;z-index:5;display:flex;align-items:center;' +
            'justify-content:space-between;gap:12px;background:#1a1a2e;color:#fff;padding:10px 20px;' +
            "font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;}" +
            '#sh-dl-overlay .sh-dl-bar .t{font-size:14px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}' +
            '#sh-dl-overlay .sh-dl-bar .actions{display:flex;gap:8px;flex-shrink:0;}' +
            '#sh-dl-overlay .sh-dl-bar button{border:0;border-radius:6px;padding:9px 16px;font-size:13px;font-weight:600;cursor:pointer;}' +
            '#sh-dl-overlay .sh-dl-print{background:#4D8BF5;color:#fff;}' +
            '#sh-dl-overlay .sh-dl-close{background:#444;color:#fff;}' +
            '#sh-dl-overlay .sh-dl-loading{display:flex;flex-direction:column;align-items:center;justify-content:center;' +
            'gap:16px;height:78vh;color:#fff;font-family:sans-serif;}' +
            '#sh-dl-overlay .sh-dl-loading .bar{width:320px;height:10px;background:#33334d;border-radius:6px;overflow:hidden;}' +
            '#sh-dl-overlay .sh-dl-loading .fill{height:100%;width:0;background:#4D8BF5;transition:width .2s;}' +
            '#sh-dl-overlay .sh-dl-pages .p2hv{margin:0 auto;}' +
            '#sh-dl-overlay .sh-dl-pages .pf{margin:12px auto !important;background:#fff !important;' +
            'box-shadow:0 2px 8px rgba(0,0,0,.4);display:block !important;filter:none !important;opacity:1 !important;}' +
            '#sh-dl-overlay .sh-dl-pages .page-content,#sh-dl-overlay .sh-dl-pages .pc{' +
            'display:block !important;visibility:visible !important;filter:none !important;opacity:1 !important;}' +
            '#sh-dl-overlay .sh-dl-pages .pf img{filter:none !important;opacity:1 !important;visibility:visible !important;}' +
            '@media print{' +
            'body > *:not(#sh-dl-overlay){display:none !important;}' +
            'html,body{background:#fff !important;height:auto !important;overflow:visible !important;}' +
            '#sh-dl-overlay{position:static !important;inset:auto !important;overflow:visible !important;background:#fff !important;height:auto !important;}' +
            '#sh-dl-overlay .sh-dl-bar{display:none !important;}' +
            '#sh-dl-overlay .sh-dl-pages .pf{margin:0 !important;box-shadow:none !important;page-break-after:always;break-after:page;}' +
            '#sh-dl-overlay .sh-dl-pages .pf:last-child{page-break-after:auto;}' +
            '@page{margin:0;}' +
            '}';
        document.head.appendChild(style);
    }

    // Build the overlay DOM (loading state). Returns handles for updating it.
    // Viết lại tiêu đề và các nút bấm cho thân thiện với người dùng
    function createOverlay(title) {
        var overlay = document.createElement('div');
        overlay.id = 'sh-dl-overlay';

        var bar = document.createElement('div');
        bar.className = 'sh-dl-bar';
        var titleEl = document.createElement('div');
        titleEl.className = 't';
        titleEl.textContent = title;
        var actions = document.createElement('div');
        actions.className = 'actions';
        var printBtn = document.createElement('button');
        printBtn.className = 'sh-dl-print';
        printBtn.textContent = 'In / Lưu dưới dạng PDF';
        printBtn.disabled = true;
        printBtn.style.opacity = '0.5';
        printBtn.addEventListener('click', function() { window.print(); });
        var closeBtn = document.createElement('button');
        closeBtn.className = 'sh-dl-close';
        closeBtn.textContent = 'Đóng';
        closeBtn.addEventListener('click', function() { overlay.remove(); });
        actions.appendChild(printBtn);
        actions.appendChild(closeBtn);
        bar.appendChild(titleEl);
        bar.appendChild(actions);

        var loading = document.createElement('div');
        loading.className = 'sh-dl-loading';
        var msg = document.createElement('div');
        msg.textContent = 'Đang tải toàn bộ trang tài liệu…';
        var barWrap = document.createElement('div');
        barWrap.className = 'bar';
        var fill = document.createElement('div');
        fill.className = 'fill';
        barWrap.appendChild(fill);
        var sub = document.createElement('div');
        sub.style.cssText = 'font-size:13px;opacity:.7;';
        loading.appendChild(msg);
        loading.appendChild(barWrap);
        loading.appendChild(sub);

        var pages = document.createElement('div');
        pages.className = 'sh-dl-pages';

        overlay.appendChild(bar);
        overlay.appendChild(loading);
        overlay.appendChild(pages);

        return { overlay: overlay, fill: fill, sub: sub, loading: loading, pages: pages, printBtn: printBtn };
    }

    function generatePDF() {
        var title = getTitle();
        if (!document.querySelector('.p2hv') || document.querySelectorAll('.pf').length === 0) {
            alert('Studocu Downloader: Không tìm thấy trang tài liệu. Vui lòng cuộn tài liệu xuống một chút để load trang, sau đó bấm tải lại.');
            return;
        }

        injectOverlayStyles();
        var ui = createOverlay(title);
        document.body.appendChild(ui.overlay);

        var pattern = getImagePattern();

        captureAllPages(function(done, total) {
            ui.fill.style.width = Math.round(done / total * 70) + '%';
            ui.sub.textContent = 'Đang chụp trang ' + done + ' / ' + total;
        }).then(function(capturedPages) {
            if (!capturedPages.length) { throw new Error('no pages'); }
            var container = assembleContainer(capturedPages, pattern);
            return embedImages(container, function(done, total) {
                ui.fill.style.width = (70 + Math.round((total ? done / total : 1) * 30)) + '%';
                ui.sub.textContent = 'Đang nhúng ảnh ' + done + ' / ' + total;
            }).then(function() { return container; });
        }).then(function(container) {
            ui.loading.remove();
            ui.pages.appendChild(container);
            ui.printBtn.disabled = false;
            ui.printBtn.style.opacity = '1';
        }).catch(function() {
            ui.sub.textContent = 'Không thể dựng được tài liệu. Vui lòng F5 làm mới trang và thử lại.';
        });
    }

    // ---- Download button injection + click handling ----

    function createButton() {
        var btn = document.createElement('button');
        btn.classList.add('download-button-1');
        btn.setAttribute('data-studocuhack', 'download');
        var icon = document.createElement('span');
        icon.setAttribute('aria-hidden', 'true');
        icon.textContent = '⤓'; 
        icon.style.cssText = 'font-size:16px;line-height:1;';
        var label = document.createElement('span');
        label.classList.add('download-text');
        label.textContent = 'Tải xuống';
        btn.appendChild(icon);
        btn.appendChild(label);
        return btn;
    }

    function refreshButtons() {
        document.querySelectorAll('[data-test-selector="document-viewer-download-button-topbar"]').forEach(function(el) {
            if (!el.querySelector('.download-button-1')) el.remove();
        });
        var c = document.querySelector('#viewer-wrapper');
        if (c && !c.querySelector('.download-button-1')) c.prepend(createButton());
        var d = document.querySelector('#modal-overlay');
        if (d) d.style.display = 'none';
    }

    document.addEventListener('click', function(e) {
        var btn = e.target.closest('[data-studocuhack="download"]');
        if (btn) { e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation(); generatePDF(); }
    }, true);
    document.addEventListener('mousedown', function(e) {
        if (e.target.closest('[data-studocuhack="download"]')) e.stopPropagation();
    }, true);

    var obs = new MutationObserver(refreshButtons);
    function init() {
        var el = document.querySelector('#viewer-wrapper');
        if (el) obs.observe(el, { childList: true, subtree: true });
        refreshButtons();
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
    window.addEventListener('load', init);
})();
