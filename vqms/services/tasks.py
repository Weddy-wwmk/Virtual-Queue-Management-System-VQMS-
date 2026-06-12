from apscheduler.schedulers.background import BackgroundScheduler
from models import db, QueueTicket
from  services.twilio_sms import send_sms
from  services.sms_service import should_notify,should_room_notify
from services.appointment_service import get_today_appointments 
from urllib.parse import quote
import os

scheduler = BackgroundScheduler(daemon=True)

def notify_waiting_patients(app):
    with app.app_context():
        print("------------------------Background job running: notify_waiting_patients-----------------------------")
        tickets = QueueTicket.query.filter_by(status="WAITING").all()

        if(tickets is None or len(tickets) == 0):
            print("No waiting tickets found.")
            print("-------------------Finished notifying patient for ticket----------------------------------")
            return

        for ticket in tickets:
            if should_notify(ticket):
                print("Notifying patient for ticket:", ticket.queue_number)
                send_sms(ticket.patient.phone_number, f"Queue {ticket.queue_number} is coming up at {ticket.expected_appointment_time.strftime('%H:%M')}. Ensure you are ready.")
                ticket.status = "NOTIFIED"
                db.session.commit()
                print("-------------------Finished notifying patient for ticket----------------------------------")


           
def notify_room_assignment(app):
    with app.app_context():
        print("------------------------Background job running: notify_room_assignment-----------------------------")
        tickets = QueueTicket.query.filter_by(status="NOTIFIED").all()

        print("Notified tickets:", tickets)

        if(tickets is None or len(tickets) == 0):
            print("No notified tickets found.")
            print("-------------------Finished notifying patient for ticket----------------------------------")
            return

        for ticket in tickets:
            if should_room_notify(ticket):
                print("Notifying patient of room assignment for ticket:", ticket.queue_number)
                send_sms(ticket.patient.phone_number, f"Queue {ticket.queue_number}, please proceed to room {ticket.room_number}.")
                ticket.status = "ROOM_ASSIGNED"
                db.session.commit()
                print("-------------------Finished notifying patient of room assignment for ticket----------------------------------")

def should_appointment_notify(app):
    with app.app_context():
        print("------------------------Background job running: should_appointment_notify-----------------------------")
        appointments = get_today_appointments()
        print("Today's appointments:", appointments)
        for appointment in appointments:
            phone = quote(appointment.patient.phone_number)
            print(f"Notifying patient {appointment.patient_id} about upcoming appointment at {appointment.appointment_date}")
            url = os.getenv("FRONT_END_URL") + "/queue/check?phone=" + phone
            send_sms(appointment.patient.phone_number, f"Reminder: You have an appointment scheduled at {appointment.appointment_date.strftime('%H:%M')}. Please click the link to check and join your queue status\n {url}")
            appointment.sms_sent = True
            db.session.commit()
            print("--------------------Finished checking appointment for notification----------------------------------")
    

def start_scheduler(app):
    if scheduler.running:
        return

    scheduler.add_job(
        func=notify_waiting_patients,
        args=[app],           
        trigger="interval",
        minutes=2
    )
    scheduler.add_job(
        func=notify_room_assignment,
        args=[app],           
        trigger="interval",
        minutes=1
    )

    scheduler.add_job(
        func=should_appointment_notify,
        args=[app],           
        trigger="interval",
        minutes=2,
    )

    scheduler.start()
