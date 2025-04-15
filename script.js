document.addEventListener('DOMContentLoaded', function() {

    // --- Intersection Observer for Scroll Animations ---
    const observerOptions = {
        root: null, // relative to document viewport
        rootMargin: '0px',
        threshold: 0.1 // trigger when 10% of the element is visible
    };

    const observerCallback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target); // Stop observing once visible
            }
        });
    };

    const scrollObserver = new IntersectionObserver(observerCallback, observerOptions);

    const elementsToAnimate = document.querySelectorAll('.animate-on-scroll');
    elementsToAnimate.forEach(el => scrollObserver.observe(el));


    // --- Animated Counter for Impact Metrics ---
    const metricsSection = document.getElementById('impact-metrics');
    let counterAnimated = false; // Flag to ensure animation runs only once

    const counterObserverOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.4 // Trigger when 40% of the section is visible
    };

    const counterObserverCallback = (entries, observer) => {
        entries.forEach(entry => {
            // Check if the section is intersecting and animation hasn't run
            if (entry.isIntersecting && !counterAnimated) {
                counterAnimated = true; // Set flag
                const counters = metricsSection.querySelectorAll('.metric-number');

                counters.forEach(counter => {
                    counter.innerText = '0'; // Ensure it starts at 0
                    const target = +counter.getAttribute('data-target'); // Get target number
                    const duration = 1500; // Animation duration in ms
                    const increment = target / (duration / 16); // Calculate increment (~60fps)

                    let current = 0;

                    const updateCounter = () => {
                        current += increment;
                        if (current < target) {
                            counter.innerText = Math.ceil(current);
                            requestAnimationFrame(updateCounter); // Efficient animation loop
                        } else {
                            counter.innerText = target; // Ensure final target is exact
                             // Add '+' back if needed, e.g., check original label or a data attribute
                             // if (counter.dataset.suffix === '+') { counter.innerText += '+'; }
                             // Currently handled by label adjustment in HTML
                        }
                    };
                    requestAnimationFrame(updateCounter);
                });
                observer.unobserve(entry.target); // Stop observing metrics section
            }
        });
    };

    const counterObserver = new IntersectionObserver(counterObserverCallback, counterObserverOptions);

    // Start observing the metrics section if it exists
    if (metricsSection) {
        counterObserver.observe(metricsSection);
    }

}); // End DOMContentLoaded
