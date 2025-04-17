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

            // Close other items before opening/closing the current one
            expertiseItemsFlip.forEach(otherItem => {
                if (otherItem !== currentItem && otherItem.classList.contains('expanded')) {
                    otherItem.classList.remove('expanded');
                    const otherCardInner = otherItem.querySelector('.card-inner');
                    const otherFrontHeight = otherItem.querySelector('.card-front')?.offsetHeight;
                    if (otherCardInner && otherFrontHeight) {
                        otherCardInner.style.height = `${otherFrontHeight}px`; // Collapse others to front height
                    } else if (otherCardInner) {
                        otherCardInner.style.height = ''; // Fallback reset
                    }
                }
            });

            // Toggle the class on the current item
            currentItem.classList.toggle('expanded');

            // --- Adjust Height ---
            if (isExpanding) {
                // Calculate height needed for the back face AFTER flip starts or is measurable
                // Use setTimeout to allow CSS transition to start/elements to potentially become measurable
                setTimeout(() => {
                    const backContentHeight = cardBack.scrollHeight; // Includes padding
                    const frontHeight = cardFront.offsetHeight;
                    const targetHeight = Math.max(backContentHeight, frontHeight); // Ensure it's at least front height
                    cardInner.style.height = `${targetHeight}px`;
                 }, 50); // Small delay - adjust if needed

            } else {
                // Collapse: Set height back to front face height immediately for animation
                const frontHeight = cardFront.offsetHeight;
                cardInner.style.height = `${frontHeight}px`;
                // Optionally remove the style completely after transition if needed
                 // setTimeout(() => {
                 //    // Check if it's still collapsed before removing height
                 //    if (!currentItem.classList.contains('expanded')) {
                 //        cardInner.style.height = '';
                 //    }
                 // }, 600); // Match CSS transition duration
            }
        }; // End toggleExpansion function

        // --- Click Event Listener ---
        item.addEventListener('click', function(event) {
            let targetElement = event.target;
            let isLinkClick = false;

            while (targetElement && targetElement !== this) {
                if (targetElement.tagName === 'A') {
                     // Allow details link on back to work without toggling expansion state
                     if (targetElement.classList.contains('details-link') && this.classList.contains('expanded')) {
                         // Let the link work normally without interfering
                         isLinkClick = false; // Treat as non-toggling click
                     } else {
                         isLinkClick = true; // It's the main link on the front or details link before expansion
                     }
                    break;
                }
                 if (targetElement.tagName === 'H3' && !this.classList.contains('expanded')) {
                    isLinkClick = true; // Click on H3 counts as link click only when on front
                    break;
                }
                targetElement = targetElement.parentNode;
            }

            if (!isLinkClick) {
                toggleExpansion(this);
            }
            // If isLinkClick is true, do nothing, let the link navigate
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
            const initialFrontHeight = cardFront.offsetHeight;
             // Only set height if it hasn't been explicitly set (e.g. by being expanded/collapsed already)
            if (initialFrontHeight > 0 && !item.classList.contains('expanded') && !cardInner.style.height) {
                 cardInner.style.height = `${initialFrontHeight}px`;
            }
        }

        // Set height on load and potentially slight delay for images/fonts
        window.addEventListener('load', setInitialHeight);
        setTimeout(setInitialHeight, 200); // Fallback delay
        setInitialHeight(); // Attempt immediate set

    }); // End forEach expertiseItemsFlip


    // --- Auto-Update Copyright Year ---
    // ============================================================
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

}); // End DOMContentLoaded Listener
