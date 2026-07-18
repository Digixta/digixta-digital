function contactForm() {
    return {
        form: { name: '', email: '', phone: '', subject: '', message: '' },
        loading: false,
        status: '',
        statusType: '',

        async submitForm(){
            this.loading = true;
            this.status = '';
            this.statusType = '';

            try{
                const response = await fetch('https://digixtabackend.vercel.app/send-email', {
                    method: 'POST',
                    headers:{ 'Content-Type': 'application/json' },
                    body: JSON.stringify(this.form)
                });

                const result = await response.json();

                if (result.success) {
                    this.status = 'Message sent successfully! We\'ll get back to you soon.';
                    this.statusType = 'success';
                    this.form = { name: '', email: '', phone: '', subject: '', message: '' };
                } else {
                    this.status = result.message || 'Failed to send message.';
                    this.statusType = 'error';
                }
            } catch (error) {
                console.error('Error submitting form:', error);
                this.status = 'Error sending message. Please try again later.';
                this.statusType = 'error';
            } finally {
                this.loading = false;
            }
        }
    }
}

// Initialize AOS (Animate On Scroll)
document.addEventListener('DOMContentLoaded', function() {
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 700,
            easing: 'ease-out-cubic',
            once: true,
            offset: 80,
            delay: 50,
        });
    }
});



const splash = document.getElementById('splash-screen');
const skipBtn = document.getElementById('skip-btn');
const progressBar = document.getElementById('progress-bar');

let splashTimeout;

// Auto hide after 5 seconds
function hideSplash() {
  splash.style.opacity = '0';
  setTimeout(() => {
    splash.style.display = 'none';
  }, 800);
}

// Show Skip Button after 5 seconds
setTimeout(() => {
  skipBtn.classList.add('show');
}, 5000);

// Skip Button Click
skipBtn.addEventListener('click', hideSplash);

// Auto hide after 10 seconds total (if user doesn't click)
setTimeout(() => {
  if (splash.style.display !== 'none') hideSplash();
}, 10000);
