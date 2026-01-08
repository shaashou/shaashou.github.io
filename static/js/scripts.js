const content_dir = 'contents/'
const config_file = 'config.yml'
const section_names = ['home', 'awards', 'experience', 'publications'];


window.addEventListener('DOMContentLoaded', event => {

    // Activate Bootstrap scrollspy on the main nav element
    const mainNav = document.body.querySelector('#mainNav');
    if (mainNav) {
        new bootstrap.ScrollSpy(document.body, {
            target: '#mainNav',
            offset: 74,
        });
    };

    // Collapse responsive navbar when toggler is visible
    const navbarToggler = document.body.querySelector('.navbar-toggler');
    const responsiveNavItems = [].slice.call(
        document.querySelectorAll('#navbarResponsive .nav-link')
    );
    responsiveNavItems.map(function (responsiveNavItem) {
        responsiveNavItem.addEventListener('click', () => {
            if (window.getComputedStyle(navbarToggler).display !== 'none') {
                navbarToggler.click();
            }
        });
    });


    // Yaml
    fetch(content_dir + config_file)
        .then(response => response.text())
        .then(text => {
            const yml = jsyaml.load(text);
            Object.keys(yml).forEach(key => {
                try {
                    document.getElementById(key).innerHTML = yml[key];
                } catch {
                    console.log("Unknown id and value: " + key + "," + yml[key].toString())
                }

            })
        })
        .catch(error => console.log(error));


    // Marked
    marked.use({ mangle: false, headerIds: false })
    section_names.forEach((name, idx) => {
        fetch(content_dir + name + '.md')
            .then(response => response.text())
            .then(markdown => {
                const html = marked.parse(markdown);
                document.getElementById(name + '-md').innerHTML = html;
            }).then(() => {
                // MathJax
                MathJax.typeset();
                
                // Auto-play videos after content is loaded
                const videos = document.querySelectorAll('video[autoplay]');
                videos.forEach(video => {
                    // Ensure required attributes for autoplay
                    video.muted = true;
                    video.playsInline = true;
                    
                    // Try to play immediately
                    const playPromise = video.play();
                    
                    if (playPromise !== undefined) {
                        playPromise.then(() => {
                            console.log('Video autoplay started successfully');
                        }).catch(err => {
                            console.log('Autoplay prevented, will retry on user interaction:', err);
                            
                            // Fallback: play on any user interaction
                            const playOnInteraction = () => {
                                video.play().then(() => {
                                    console.log('Video started after user interaction');
                                    document.removeEventListener('click', playOnInteraction);
                                    document.removeEventListener('scroll', playOnInteraction);
                                    document.removeEventListener('touchstart', playOnInteraction);
                                }).catch(e => console.log('Play failed:', e));
                            };
                            
                            document.addEventListener('click', playOnInteraction, { once: true });
                            document.addEventListener('scroll', playOnInteraction, { once: true });
                            document.addEventListener('touchstart', playOnInteraction, { once: true });
                        });
                    }
                });
            })
            .catch(error => console.log(error));
    })

}); 
