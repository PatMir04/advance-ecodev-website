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
                    if (otherCardInner) {
                         // Set height explicitly for smooth collapse animation
                        otherCardInner.style.height = otherFrontHeight ? `${otherFrontHeight}px` : '';
                        // Remove height style after transition duration to allow natural height flow
                        setTimeout(() => {
                            if (!otherItem.classList.contains('expanded')) { // Check if still collapsed
                                otherCardInner.style.height = '';
                            }
                        }, 600); // Match CSS transition duration + buffer
                    }
                }
            });

             // --- Adjust Height ---
             if (isExpanding) {
                // Calculate height needed for the back face AFTER flip starts
                // We set it slightly after the class is added to ensure measurements are correct
                currentItem.classList.add('expanded'); // Add class first

                 requestAnimationFrame(() => { // Use rAF for timing
                     const backContentHeight = cardBack.scrollHeight; // Height of content including padding
                     const frontHeight = cardFront.offsetHeight;
                     const targetHeight = Math.max(backContentHeight, frontHeight); // Use the larger height
                     cardInner.style.height = `${targetHeight}px`; // Apply target height
                 });

            } else {
                 // Collapse: Set target height back to front face height BEFORE removing class
                const frontHeight = cardFront.offsetHeight;
                cardInner.style.height = `${frontHeight}px`;

                 // Remove the expanded class - the transition back to frontHeight will start
                 currentItem.classList.remove('expanded');

                 // After the transition, remove the inline height style
                 setTimeout(() => {
                    if (!currentItem.classList.contains('expanded')) { // Check if still collapsed
                         cardInner.style.height = ''; // Reset to allow natural height
                    }
                 }, 600); // Match CSS flip/resize speed
            }

        }; // End toggleExpansion function

        // --- Click Event Listener ---
        item.addEventListener('click', function(event) {
            let targetElement = event.target;
            let isLinkClick = false;

            while (targetElement && targetElement !== this) {
                if (targetElement.tagName === 'A') {
                     if (targetElement.classList.contains('details-link') && this.classList.contains('expanded')) {
                         isLinkClick = false; // Allow details link on back
                     } else {
                         isLinkClick = true; // Assume front link or details link when not expanded
                     }
                    break;
                }
                 if (targetElement.tagName === 'H3' && !this.classList.contains('expanded')) {
                    isLinkClick = true; // Click on H3 on front
                    break;
                }
                targetElement = targetElement.parentNode;
            }

            if (!isLinkClick) {
                toggleExpansion(this);
            }
            // If isLinkClick is true, let the browser handle navigation
        });

        // --- Keyboard Event Listener ---
        item.addEventListener('keydown', function(event) {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                toggleExpansion(this);
            }
        });

        // --- Set Initial Height ---
        // Ensure the card-inner starts with the height of the front face
        const setInitialHeight = () => {
            if (cardFront.offsetHeight > 0) {
                // Set initial height only if not already expanded and no inline height is set
                if (!item.classList.contains('expanded') && !cardInner.style.height) {
                     cardInner.style.height = `${cardFront.offsetHeight}px`;
                }
            } else {
                // Retry if offsetHeight is 0 initially (e.g. display:none parent, slow loading)
                setTimeout(setInitialHeight, 150); // Slightly longer delay
            }
        }
         // Use requestAnimationFrame for better timing after layout
        if (typeof requestAnimationFrame === 'function') {
             requestAnimationFrame(() => {
                setTimeout(setInitialHeight, 50); // Add tiny delay within rAF too
             });
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
