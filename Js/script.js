// Menú responsive
const toggleMenu = document.getElementById('toggle-menu');
const navbarMenu = document.querySelector('.navbar-menu');

toggleMenu.addEventListener('click', () => {
    navbarMenu.classList.toggle('active'); // Alterna visibilidad
});

// Animaciones al scroll
window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        const sectionTop = section.getBoundingClientRect().top;
        if (sectionTop < window.innerHeight - 100) {
            section.style.opacity = '1';
            section.style.transform = 'translateY(0)';
            section.style.transition = 'all 0.5s ease'; // Animación fade-in
        }
    });
});

// Validación y envío del formulario
const form = document.getElementById('appointment-form');

form.addEventListener('submit', (e) => {
    e.preventDefault(); // Evita envío tradicional
    
    const name = document.getElementById('name').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const service = document.getElementById('service').value;
    const date = document.getElementById('date').value;
    const time = document.getElementById('time').value;
    
    if (name && phone && service && date && time) {
        // Simula envío a WhatsApp
        const message = `Hola, soy ${name}. Quiero agendar una cita para ${service} el ${date} a las ${time}. Contacta al ${phone}.`;
        const whatsappURL = `https://wa.me/123456789?text=${encodeURIComponent(message)}`; // Reemplaza con tu número
        window.open(whatsappURL, '_blank');
        form.reset(); // Limpia el formulario
    } else {
        alert('Por favor, completa todos los campos.'); // Validación simple
    }
});