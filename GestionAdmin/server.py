import json
import re
import threading
from datetime import date, datetime, time
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlparse
from uuid import uuid4


ROOT = Path(__file__).resolve().parent.parent
PRIVATE_DATA = Path(__file__).resolve().parent / "data"
STORE = PRIVATE_DATA / "appointments.json"
OPENING_HOUR = 9
WEEKDAY_LAST_START_HOUR = 17
SATURDAY_LAST_START_HOUR = 14
VALID_SERVICES = {
    "Mantenimiento general",
    "Cambio de aceite y filtros",
    "Frenos y suspensión",
    "Cadena y transmisión",
    "Sistema eléctrico y encendido",
    "Diagnóstico y revisión general",
    "Otro servicio",
}
store_lock = threading.Lock()


def read_appointments():
    if not STORE.exists():
        return []
    with STORE.open(encoding="utf-8") as file:
        return json.load(file)


def write_appointments(appointments):
    STORE.parent.mkdir(parents=True, exist_ok=True)
    temporary_store = STORE.with_suffix(".tmp")
    with temporary_store.open("w", encoding="utf-8") as file:
        json.dump(appointments, file, ensure_ascii=False, indent=2)
    temporary_store.replace(STORE)


class WorkshopHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def send_json(self, status, payload):
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def translate_path(self, path):
        translated = Path(super().translate_path(path)).resolve()
        private_directory = PRIVATE_DATA.resolve()
        if translated == private_directory or private_directory in translated.parents:
            return str(ROOT / "__private_data_not_found__")
        return str(translated)

    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path != "/api/appointments":
            return super().do_GET()

        month = parse_qs(parsed.query).get("month", [""])[0]
        if not re.fullmatch(r"\d{4}-\d{2}", month):
            return self.send_json(400, {"error": "Indica un mes válido."})
        with store_lock:
            appointments = read_appointments()
        public_appointments = [
            {"date": appointment["date"], "time": appointment["time"]}
            for appointment in appointments
            if appointment["date"].startswith(month)
        ]
        self.send_json(200, public_appointments)

    def do_POST(self):
        if urlparse(self.path).path != "/api/appointments":
            return self.send_json(404, {"error": "Ruta no encontrada."})

        try:
            content_length = int(self.headers.get("Content-Length", "0"))
            if content_length < 1 or content_length > 8192:
                return self.send_json(400, {"error": "La solicitud no es válida."})
            booking = json.loads(self.rfile.read(content_length))
            name = booking.get("name", "").strip()
            phone = booking.get("phone", "").strip()
            service = booking.get("service", "")
            service_detail = booking.get("service_detail", "")
            booking_date = date.fromisoformat(booking.get("date", ""))
            time_value = booking.get("time", "")
            if not isinstance(time_value, str) or not re.fullmatch(r"(?:[01]\d|2[0-3]):[0-5]\d", time_value):
                return self.send_json(400, {"error": "Indica una hora válida en formato HH:MM."})
            booking_time = time.fromisoformat(time_value)
        except (ValueError, TypeError, AttributeError, json.JSONDecodeError):
            return self.send_json(400, {"error": "Revisa los datos de la reserva."})

        if not name or len(name) > 80 or not phone or len(phone) > 24:
            return self.send_json(400, {"error": "Ingresa un nombre y teléfono válidos."})
        if service == "Otro servicio":
            if not isinstance(service_detail, str) or not service_detail.strip() or len(service_detail.strip()) > 120:
                return self.send_json(400, {"error": "Especifica el servicio que necesita tu moto (máximo 120 caracteres)."})
            service = f"Otro servicio: {service_detail.strip()}"
        elif not isinstance(service, str) or service not in VALID_SERVICES:
            return self.send_json(400, {"error": "Selecciona un servicio válido."})
        if booking_date.weekday() == 6 or booking_date < date.today():
            return self.send_json(400, {"error": "Elige un día futuro de lunes a sábado."})
        last_start_hour = SATURDAY_LAST_START_HOUR if booking_date.weekday() == 5 else WEEKDAY_LAST_START_HOUR
        if booking_time.minute != 0 or booking_time.second != 0 or not OPENING_HOUR <= booking_time.hour <= last_start_hour:
            closing_hour = last_start_hour + 1
            return self.send_json(400, {"error": f"Elige un turno entre las 09:00 y las {closing_hour:02d}:00 para ese día."})
        if datetime.combine(booking_date, booking_time) <= datetime.now():
            return self.send_json(400, {"error": "Ese horario ya pasó. Elige otro turno."})

        with store_lock:
            appointments = read_appointments()
            if any(item["date"] == booking_date.isoformat() and item["time"] == booking_time.strftime("%H:%M") for item in appointments):
                return self.send_json(409, {"error": "Ese horario ya fue reservado."})
            saved_booking = {
                "id": str(uuid4()),
                "name": name,
                "phone": phone,
                "service": service,
                "date": booking_date.isoformat(),
                "time": booking_time.strftime("%H:%M"),
                "created_at": datetime.now().isoformat(timespec="seconds"),
            }
            appointments.append(saved_booking)
            write_appointments(appointments)

        self.send_json(201, {"date": saved_booking["date"], "time": saved_booking["time"]})


if __name__ == "__main__":
    address = ("127.0.0.1", 8000)
    print(f"Marci Motos disponible en http://{address[0]}:{address[1]}")
    ThreadingHTTPServer(address, WorkshopHandler).serve_forever()