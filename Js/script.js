const BUSINESS_WHATSAPP_NUMBER = '573102819958';
const BUSINESS_ADDRESS = 'Tv. 33 #50 Sur-15, Colombia';
const BUSINESS_CONTACT_NAME = 'Alejandro Paniza';
const OPENING_HOUR = 9;
const WEEKDAY_LAST_START_HOUR = 17;
const SATURDAY_LAST_START_HOUR = 14;
const APPOINTMENTS_STORAGE_KEY = 'marcimotos-appointments-v1';

const menuToggle = document.querySelector('.menu-toggle');
const mainNav = document.querySelector('.main-nav');
const monthLabel = document.getElementById('calendar-month');
const calendarDays = document.getElementById('calendar-days');
const slotHeading = document.getElementById('slot-heading');
const slotList = document.getElementById('slot-list');
const appointmentDate = document.getElementById('appointment-date');
const appointmentTime = document.getElementById('appointment-time');
const form = document.getElementById('appointment-form');
const formMessage = document.getElementById('form-message');
const serviceSelect = document.getElementById('service');
const serviceDetailField = document.getElementById('other-service-field');
const serviceDetailInput = document.getElementById('service-detail');
const previousMonth = document.getElementById('previous-month');
const nextMonth = document.getElementById('next-month');

const now = new Date();
let displayedMonth = new Date(now.getFullYear(), now.getMonth(), 1);
let selectedDate = '';
let occupiedSlots = new Set();
const hasBusinessWhatsApp = /^\d{10,15}$/.test(BUSINESS_WHATSAPP_NUMBER);

function readSavedAppointments() {
    const storedAppointments = localStorage.getItem(APPOINTMENTS_STORAGE_KEY);
    if (!storedAppointments) return [];
    const appointments = JSON.parse(storedAppointments);
    if (!Array.isArray(appointments)) throw new Error('La agenda local no tiene un formato válido.');
    return appointments;
}

function updateServiceDetailField() {
    const needsDetails = serviceSelect.value === 'Otro servicio';
    serviceDetailField.hidden = !needsDetails;
    serviceDetailInput.required = needsDetails;
    if (!needsDetails) serviceDetailInput.value = '';
}

serviceSelect.addEventListener('change', updateServiceDetailField);

if (BUSINESS_ADDRESS.trim()) {
    const addressQuery = encodeURIComponent(BUSINESS_ADDRESS.trim());
    const map = document.getElementById('location-map');
    const mapPlaceholder = document.getElementById('map-placeholder');
    const mapLink = document.getElementById('maps-link');
    document.getElementById('contact-address').textContent = BUSINESS_ADDRESS.trim();
    map.src = `https://maps.google.com/maps?q=${addressQuery}&output=embed`;
    map.hidden = false;
    mapPlaceholder.hidden = true;
    mapLink.href = `https://www.google.com/maps/search/?api=1&query=${addressQuery}`;
    mapLink.hidden = false;
}

if (hasBusinessWhatsApp) {
    const contactLink = document.getElementById('contact-whatsapp');
    const contactPhone = document.getElementById('contact-phone');
    contactLink.href = `https://wa.me/${BUSINESS_WHATSAPP_NUMBER}`;
    contactLink.hidden = false;
    contactLink.target = '_blank';
    contactLink.rel = 'noopener noreferrer';
    contactPhone.textContent = `+${BUSINESS_WHATSAPP_NUMBER}`;
    contactPhone.href = `tel:+${BUSINESS_WHATSAPP_NUMBER}`;
}

menuToggle.addEventListener('click', () => {
    const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', String(!isOpen));
    menuToggle.setAttribute('aria-label', isOpen ? 'Abrir menú' : 'Cerrar menú');
    mainNav.classList.toggle('is-open', !isOpen);
});

mainNav.addEventListener('click', (event) => {
    if (event.target.closest('a')) {
        mainNav.classList.remove('is-open');
        menuToggle.setAttribute('aria-expanded', 'false');
        menuToggle.setAttribute('aria-label', 'Abrir menú');
    }
});

function dateKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function isPastSlot(date, hour) {
    const [year, month, day] = date.split('-').map(Number);
    return new Date(year, month - 1, day, hour) <= new Date();
}

function isBookableDate(date) {
    return date.getDay() !== 0 && dateKey(date) >= dateKey(new Date());
}

function lastStartHourForDate(date) {
    return date.getDay() === 6 ? SATURDAY_LAST_START_HOUR : WEEKDAY_LAST_START_HOUR;
}

function loadMonth() {
    const monthKey = `${displayedMonth.getFullYear()}-${String(displayedMonth.getMonth() + 1).padStart(2, '0')}`;
    monthLabel.textContent = new Intl.DateTimeFormat('es', { month: 'long', year: 'numeric' }).format(displayedMonth);
    calendarDays.replaceChildren();
    slotList.replaceChildren();
    selectedDate = '';
    appointmentDate.value = '';
    appointmentTime.value = '';
    slotHeading.textContent = 'Elige una fecha para ver los horarios';

    try {
        const appointments = readSavedAppointments().filter((appointment) => appointment.date.startsWith(monthKey));
        occupiedSlots = new Set(appointments.map(({ date, time }) => `${date}T${time}`));
        renderCalendar();
    } catch {
        const errorMessage = document.createElement('p');
        errorMessage.className = 'calendar-error';
        errorMessage.textContent = 'No se pudo leer la agenda guardada en este navegador. Revisa que el almacenamiento esté permitido.';
        calendarDays.replaceChildren(errorMessage);
    }
}

window.addEventListener('storage', (event) => {
    if (event.key === APPOINTMENTS_STORAGE_KEY) loadMonth();
});

function renderCalendar() {
    const year = displayedMonth.getFullYear();
    const month = displayedMonth.getMonth();
    const offset = (new Date(year, month, 1).getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const fragment = document.createDocumentFragment();

    for (let blank = 0; blank < offset; blank += 1) {
        const spacer = document.createElement('span');
        spacer.setAttribute('aria-hidden', 'true');
        fragment.append(spacer);
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
        const date = new Date(year, month, day);
        const key = dateKey(date);
        const isOpen = isBookableDate(date);
        const lastStartHour = lastStartHourForDate(date);
        const hasAvailability = isOpen && Array.from({ length: lastStartHour - OPENING_HOUR + 1 }, (_, index) => {
            const hour = OPENING_HOUR + index;
            return !occupiedSlots.has(`${key}T${String(hour).padStart(2, '0')}:00`) && !isPastSlot(key, hour);
        }).some(Boolean);
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'calendar-day';
        button.textContent = String(day);
        button.dataset.date = key;
        button.disabled = !isOpen || !hasAvailability;
        button.setAttribute('aria-label', `${new Intl.DateTimeFormat('es', { dateStyle: 'full' }).format(date)}${hasAvailability ? ', disponible' : ', no disponible'}`);
        if (isOpen && hasAvailability) button.classList.add('is-available');
        else if (isOpen) button.classList.add('is-full');
        if (key === selectedDate) button.classList.add('is-selected');
        button.addEventListener('click', () => selectDate(key, button));
        fragment.append(button);
    }

    calendarDays.replaceChildren(fragment);
    previousMonth.disabled = year === now.getFullYear() && month === now.getMonth();
}

function selectDate(date, button) {
    selectedDate = date;
    appointmentDate.value = date;
    appointmentTime.value = '';
    formMessage.textContent = '';
    calendarDays.querySelectorAll('.calendar-day').forEach((day) => day.classList.remove('is-selected'));
    button.classList.add('is-selected');
    slotHeading.textContent = new Intl.DateTimeFormat('es', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date(`${date}T12:00:00`));
    renderSlots();
}

function renderSlots() {
    slotList.replaceChildren();
    const [year, month, day] = selectedDate.split('-').map(Number);
    const lastStartHour = lastStartHourForDate(new Date(year, month - 1, day));
    for (let hour = OPENING_HOUR; hour <= lastStartHour; hour += 1) {
        const time = `${String(hour).padStart(2, '0')}:00`;
        const key = `${selectedDate}T${time}`;
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'slot-button';
        button.textContent = time;
        button.disabled = occupiedSlots.has(key) || isPastSlot(selectedDate, hour);
        button.setAttribute('aria-label', `${time}${button.disabled ? ', reservado' : ', disponible'}`);
        button.addEventListener('click', () => {
            appointmentTime.value = time;
            slotList.querySelectorAll('.slot-button').forEach((slot) => slot.classList.remove('is-selected'));
            button.classList.add('is-selected');
            formMessage.textContent = '';
        });
        slotList.append(button);
    }
}

previousMonth.addEventListener('click', () => {
    displayedMonth = new Date(displayedMonth.getFullYear(), displayedMonth.getMonth() - 1, 1);
    loadMonth();
});

nextMonth.addEventListener('click', () => {
    displayedMonth = new Date(displayedMonth.getFullYear(), displayedMonth.getMonth() + 1, 1);
    loadMonth();
});

form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    if (!appointmentDate.value || !appointmentTime.value) {
        formMessage.textContent = 'Elige primero una fecha y un horario disponible.';
        return;
    }

    let whatsappTab = hasBusinessWhatsApp ? window.open('about:blank', '_blank') : null;

    const booking = {
        name: document.getElementById('name').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        service: serviceSelect.value,
        service_detail: serviceDetailInput.value.trim(),
        date: appointmentDate.value,
        time: appointmentTime.value,
    };
    const submitButton = form.querySelector('.booking-submit');
    submitButton.disabled = true;
    formMessage.textContent = 'Guardando tu turno...';

    try {
        const appointments = readSavedAppointments();
        const appointmentKey = `${booking.date}T${booking.time}`;
        if (appointments.some((appointment) => `${appointment.date}T${appointment.time}` === appointmentKey)) {
            if (whatsappTab) whatsappTab.close();
            formMessage.textContent = 'Ese horario ya está reservado en este navegador. Elige otro turno disponible.';
            occupiedSlots.add(appointmentKey);
            renderCalendar();
            renderSlots();
            return;
        }
        const serviceName = booking.service === 'Otro servicio'
            ? `${booking.service}: ${booking.service_detail}`
            : booking.service;
        appointments.push({ date: booking.date, time: booking.time, service: serviceName });
        localStorage.setItem(APPOINTMENTS_STORAGE_KEY, JSON.stringify(appointments));
        occupiedSlots.add(appointmentKey);
        renderCalendar();
        const readableDate = new Intl.DateTimeFormat('es', { dateStyle: 'long' }).format(new Date(`${booking.date}T12:00:00`));
        const message = [
            'Nueva solicitud de turno - Marci Motos',
            `Atención: ${BUSINESS_CONTACT_NAME}`,
            `Cliente: ${booking.name}`,
            `Teléfono: ${booking.phone}`,
            `Servicio: ${serviceName}`,
            `Fecha: ${readableDate}`,
            `Hora: ${booking.time}`,
        ].join('\n');
        if (hasBusinessWhatsApp) {
            const whatsappUrl = `https://wa.me/${BUSINESS_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
            if (whatsappTab) {
                try {
                    whatsappTab.location.href = whatsappUrl;
                } catch {
                    whatsappTab.close();
                    whatsappTab = null;
                }
            }
            const link = document.createElement('a');
            link.href = whatsappUrl;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            link.textContent = 'Abrir WhatsApp y enviar solicitud ↗';
            const whatsappStatus = 'Solicitud guardada en este navegador. Envía el mensaje y espera la confirmación del taller. ';
            formMessage.replaceChildren(document.createTextNode(whatsappStatus), link);
        } else {
            formMessage.textContent = 'Turno reservado. Configura el número empresarial en Js/script.js para enviar la reserva por WhatsApp.';
        }
        appointmentTime.value = '';
        renderSlots();
        form.reset();
        appointmentDate.value = selectedDate;
        updateServiceDetailField();
    } catch (error) {
        if (whatsappTab) whatsappTab.close();
        formMessage.textContent = error instanceof DOMException && error.name === 'QuotaExceededError'
            ? 'No hay espacio disponible para guardar el turno en este navegador.'
            : 'No se pudo guardar el turno. Revisa que el almacenamiento del navegador esté permitido.';
    } finally {
        submitButton.disabled = false;
    }
});

loadMonth();