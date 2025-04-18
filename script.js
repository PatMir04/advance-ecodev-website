// Wait for the HTML document to be fully loaded before running scripts
document.addEventListener('DOMContentLoaded', function() {

    // --- Intersection Observer for Scroll Animations ---
    // Selects elements with 'animate-on-scroll' class and adds 'is-visible'
    // when they enter the viewport, triggering CSS transitions.
    // ==========================================================
    const scrollObserverOptions = {
        root: null, // relative to document viewport
        rootMargin: '0px',
        threshold: 0.1 // trigger when 10% of the element is visible
    };

    const scrollObserverCallback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target); // Stop observing once visible
            }
        });
    };

    const scrollObserver = new IntersectionObserver(scrollObserverCallback, scrollObserverOptions);
    const elementsToAnimate = document.querySelectorAll('.animate-on-scroll');
    elementsToAnimate.forEach(el => scrollObserver.observe(el));


    // --- Animated Counter for Impact Metrics ---
    // Selects number elements in the '#impact-metrics' section and counts
    // them up from 0 to their 'data-target' value when the section is visible.
    // =============================================================
    const metricsSection = document.getElementById('impact-metrics');
    let counterAnimated = false; // Flag to ensure animation runs only once

    if (metricsSection) { // Only proceed if the metrics section exists
        const counterObserverOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.4 // Trigger when 40% of the section is visible
        };

        const counterObserverCallback = (entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !counterAnimated) {
                    counterAnimated = true;
                    const counters = metricsSection.querySelectorAll('.metric-number');

                    counters.forEach(counter => {
                        counter.innerText = '0';
                        const target = +counter.getAttribute('data-target');
                        const duration = 1500;

                        if (target === 0) { counter.innerText = '0'; return; }
                        if (duration <= 0) { counter.innerText = target; return; }

                        const increment = target / (duration / 16.67);
                        let current = 0;

                        const updateCounter = () => {
                            current += increment;
                            if (current < target) {
                                counter.innerText = Math.ceil(current);
                                requestAnimationFrame(updateCounter);
                            } else {
                                counter.innerText = target;
                            }
                        };
                        requestAnimationFrame(updateCounter);
                    });
                    observer.unobserve(entry.target); // Unobserve after running
                }
            });
        };

        const counterObserver = new IntersectionObserver(counterObserverCallback, counterObserverOptions);
        counterObserver.observe(metricsSection);
    }


    // --- Expertise Item Flip Card with Resize ---
    // Adds click/keyboard functionality to '.expertise-item.card' elements.
    // Toggles '.expanded' class to trigger CSS flip.
    // Calculates and applies height for the back face content dynamically.
    // ============================================================
    const expertiseItemsFlip = document.querySelectorAll('.expertise-item.card');

    expertiseItemsFlip.forEach(item => {
        const cardInner = item.querySelector('.card-inner');
        const cardFront = item.querySelector('.card-front');
        const cardBack = item.querySelector('.card-back');

        // Ensure necessary card structure exists
        if (!cardInner || !cardFront || !cardBack) {
            console.error('Card structure missing inside an expertise-item:', item);
            return; // Skip this item
        }

        // Function to handle toggling expansion and height
        const toggleExpansion = (currentItem) => {
            const isExpanding = !currentItem.classList.contains('expanded');

            // Close other items first
            expertiseItemsFlip.forEach(otherItem => {
                if (otherItem !== currentItem && otherItem.classList.contains('expanded')) {
                    otherItem.classList.remove('expanded');
                    const otherCardInner = otherItem.querySelector('.card-inner');
                    const otherFrontHeight = otherItem.querySelector('.card-front')?.offsetHeight;
                    if (otherCardInner && otherFrontHeight) {
                        // Set height explicitly for smooth collapse animation
                        otherCardInner.style.height = `${otherFrontHeight}px`;
                        // Optionally remove height style after transition if needed for resize responsiveness
                         setTimeout(() => {
                            if (!otherItem.classList.contains('expanded')) { // Check if still collapsed
                                otherCardInner.style.height = '';
                            }
                        }, 600); // Match CSS transition duration (or slightly longer)
                    } else if (otherCardInner) {
                        otherCardInner.style.height = ''; // Fallback reset
                    }
                }
            });

            // Set target height BEFORE toggling class for expand
            if (isExpanding) {
                 // Need to calculate target height based on back content
                 // Temporarily make back measurable (this is tricky, might cause flicker)
                 // A simpler approach might involve pre-calculating or estimating.
                 // Let's try measuring scrollHeight directly, might work if CSS is right.
                const backContentHeight = cardBack.scrollHeight; // Includes padding
                const frontHeight = cardFront.offsetHeight;
                const targetHeight = Math.max(backContentHeight, frontHeight); // Use the larger height

                 // Set height on card-inner BEFORE adding class to transition TO this height
                cardInner.style.height = `${targetHeight}px`;
            }

            // Toggle the class on the current item AFTER setting target height (for expand)
            currentItem.classList.toggle('expanded');

            // Set height AFTER removing class (for collapse)
            if (!isExpanding) {
                // Set height back to front face height immediately for collapse transition
                const frontHeight = cardFront.offsetHeight;
                cardInner.style.height = `${frontHeight}px`;
                 // Optionally remove height style after transition
                 setTimeout(() => {
                    // Check if still collapsed before removing height
                     if (!currentItem.classList.contains('expanded')) {
                        cardInner.style.height = ''; // Let content determine height again
                     }
                 }, 600); // Match CSS transition duration
            }
        }; // End toggleExpansion function

        // --- Click Event Listener ---
        item.addEventListener('click', function(event) {
            let targetElement = event.target;
            let isLinkClick = false;

            while (targetElement && targetElement !== this) {
                if (targetElement.tagName === 'A') {
                     if (targetElement.classList.contains('details-link') && this.classList.contains('expanded')) {
                         isLinkClick = false;
                     } else {
                         isLinkClick = true;
                     }
                    break;
                }
                 if (targetElement.tagName === 'H3' && !this.classList.contains('expanded')) {
                    isLinkClick = true;
                    break;
                }
                targetElement = targetElement.parentNode;
            }

            if (!isLinkClick) {
                toggleExpansion(this);
            }
        });

        // --- Keyboard Event Listener ---
        item.addEventListener('keydown', function(event) {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                toggleExpansion(this);
            }
        });

        // --- Set Initial Height ---
        const setInitialHeight = () => {
            // Ensure element is in DOM and visible enough to have height
            if (cardFront.offsetHeight > 0) {
                 // Set initial height only if not already expanded and no inline height is set
                if (!item.classList.contains('expanded') && !cardInner.style.height) {
                     cardInner.style.height = `${cardFront.offsetHeight}px`;
                }
            } else {
                // Retry if offsetHeight is 0 initially (e.g. display:none parent)
                setTimeout(setInitialHeight, 100);
            }
        }
        // Use requestAnimationFrame for better timing if available
        if (typeof requestAnimationFrame === 'function') {
            requestAnimationFrame(setInitialHeight);
        } else {
             window.addEventListener('load', setInitialHeight); // Fallback
        }


    }); // End forEach expertiseItemsFlip


    // --- Auto-Update Copyright Year ---
    // ============================================================
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

}); // End DOMContentLoaded Listener
