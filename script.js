// Wait for the HTML document to be fully loaded before running scripts
document.addEventListener('DOMContentLoaded', function() {

    // --- Intersection Observer for Scroll Animations ---
    // Selects elements with 'animate-on-scroll' class and adds 'is-visible'
    // when they enter the viewport, triggering CSS transitions.
    // ==========================================================
    const observerOptions = {
        root: null, // relative to document viewport
        rootMargin: '0px',
        threshold: 0.1 // trigger when 10% of the element is visible
    };

    const observerCallback = (entries, observer) => {
        entries.forEach(entry => {
            // When element comes into view
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible'); // Add class to trigger animation
                observer.unobserve(entry.target); // Stop watching this element once animated
            }
        });
    };

    // Create the observer
    const scrollObserver = new IntersectionObserver(observerCallback, observerOptions);

    // Find all elements to animate
    const elementsToAnimate = document.querySelectorAll('.animate-on-scroll');
    // Observe each element
    elementsToAnimate.forEach(el => scrollObserver.observe(el));


    // --- Animated Counter for Impact Metrics ---
    // Selects number elements in the '#impact-metrics' section and counts
    // them up from 0 to their 'data-target' value when the section is visible.
    // =============================================================
    const metricsSection = document.getElementById('impact-metrics');
    let counterAnimated = false; // Flag to ensure animation runs only once per page load

    // Options for observing the metrics section
    const counterObserverOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.4 // Trigger when 40% of the section is visible for better timing
    };

    // Callback function for the counter observer
    const counterObserverCallback = (entries, observer) => {
        entries.forEach(entry => {
            // Check if the metrics section is in view and animation hasn't run yet
            if (entry.isIntersecting && !counterAnimated) {
                counterAnimated = true; // Mark animation as started
                const counters = metricsSection.querySelectorAll('.metric-number');

                counters.forEach(counter => {
                    counter.innerText = '0'; // Start display at 0
                    const target = +counter.getAttribute('data-target'); // Get target number from data attribute
                    const duration = 1500; // Animation duration in milliseconds (1.5 seconds)

                    // Avoid division by zero if duration is too short or target is 0
                    if (target === 0) {
                        counter.innerText = '0';
                        return;
                    }
                    if (duration <= 0) {
                        counter.innerText = target;
                        return;
                    }

                    // Calculate increment per frame (aiming for ~60fps)
                    const increment = target / (duration / 16.67); // Rough estimate

                    let current = 0;

                    // Function to update the counter value smoothly
                    const updateCounter = () => {
                        current += increment;
                        if (current < target) {
                            counter.innerText = Math.ceil(current); // Update displayed number
                            requestAnimationFrame(updateCounter); // Continue animation loop
                        } else {
                            counter.innerText = target; // Ensure final target value is precise
                            // Optional: Add back suffix like '+' if needed based on another data attribute
                            // if (counter.dataset.suffix) { counter.innerText += counter.dataset.suffix; }
                        }
                    };
                    requestAnimationFrame(updateCounter); // Start the animation loop
                });

                observer.unobserve(entry.target); // Stop observing metrics section once animated
            }
        });
    };

    // Create the observer for the counter
    const counterObserver = new IntersectionObserver(counterObserverCallback, counterObserverOptions);

    // Start observing the metrics section only if it exists on the page
    if (metricsSection) {
        counterObserver.observe(metricsSection);
    }


    // --- Expertise Item Expand/Collapse ---
    // Adds click functionality to '.expertise-item' elements. Clicking the item
    // (but not the main link) toggles visibility of '.expertise-details'.
    // ============================================================
    const expertiseItems = document.querySelectorAll('.expertise-item');

    expertiseItems.forEach(item => {
        // Make item focusable for keyboard navigation
        item.setAttribute('tabindex', '0');

        // --- Click Event Listener ---
        item.addEventListener('click', function(event) {
            let targetElement = event.target;
            let isLinkClick = false;

            // Check if the click originated from the H3 or A tag within this item
            while (targetElement && targetElement !== this) {
                if (targetElement.tagName === 'A' || targetElement.tagName === 'H3') {
                    isLinkClick = true;
                    break;
                }
                targetElement = targetElement.parentNode;
            }

            // Only toggle if the click was NOT on the main link area
            if (!isLinkClick) {
                // Close any other items that might be open
                expertiseItems.forEach(otherItem => {
                    if (otherItem !== this && otherItem.classList.contains('expanded')) {
                        otherItem.classList.remove('expanded');
                    }
                });
                // Toggle the 'expanded' class on the clicked item
                this.classList.toggle('expanded');
            }
            // If it was a link click, the default browser navigation will handle it
        });

        // --- Keyboard Event Listener (Accessibility) ---
        item.addEventListener('keydown', function(event) {
            // Check if Enter or Space key was pressed while item is focused
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault(); // Prevent default action (e.g., space scrolling)

                // Close any other items that might be open
                expertiseItems.forEach(otherItem => {
                    if (otherItem !== this && otherItem.classList.contains('expanded')) {
                        otherItem.classList.remove('expanded');
                    }
                });
                // Toggle the 'expanded' class on the focused item
                this.classList.toggle('expanded');
            }
        });
    });


    // --- Auto-Update Copyright Year ---
    // Finds element with id="current-year" and sets its text to the current year.
    // ============================================================
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

}); // End DOMContentLoaded Listener
