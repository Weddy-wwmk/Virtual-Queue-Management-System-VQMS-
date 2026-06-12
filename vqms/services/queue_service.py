from models import db, Queue, QueueTicket
from datetime import date, timedelta

AVERAGE_SERVICE_TIME = 3

def get_or_create_queue(service_name):
    queue = Queue.query.filter_by(
        service_name=service_name,
        queue_date=date.today()
    ).first()

    if not queue:
        queue = Queue(service_name=service_name)
        db.session.add(queue)
        db.session.commit()

    return queue


def generate_ticket(queue_id, patient_id, visit_type):

    queue = Queue.query.get(queue_id)

    if not queue:
        raise ValueError("Invalid queue_id")

    ticket = (
                db.session.query(QueueTicket)
                .join(Queue)
                .filter(
                    QueueTicket.patient_id == patient_id,
                    Queue.service_name == queue.service_name,
                    Queue.queue_date == date.today(),
                    QueueTicket.status.notin_(["MISSED", "CANCELLED","COMPLETED"])
                ).first())
    
    print(f"Existing ticket for patient {patient_id} in queue {queue_id}: {ticket}")

    if not ticket :

        all_query_ticket =  (
                db.session.query(QueueTicket)
                .join(Queue)
                .filter(
                    QueueTicket.queue_id == queue_id
                ).order_by(QueueTicket.created_at.desc()).all())
        
        all_pending_tickets = [t for t in all_query_ticket if t.status not in ["MISSED", "CANCELLED","COMPLETED"]]

        position = (len(all_pending_tickets) + 1) if all_pending_tickets else 1
        est_wait = position * AVERAGE_SERVICE_TIME

        ticket_number_position = len(all_query_ticket) + 1

        queue_number = f"{queue.service_name[:3].upper()}-{date.today()}-{ticket_number_position:03}"

        ticket = QueueTicket(
            queue_id=queue.id,
            patient_id=patient_id,
            position=position,
            estimated_wait_minutes=est_wait,
            queue_number=queue_number,
            visit_type=visit_type
        )

        db.session.add(ticket)
        db.session.commit()

    return ticket;

def get_patient_queue(patient_id):
    ticket = QueueTicket.query.filter_by(patient_id=patient_id).order_by(QueueTicket.created_at.desc()).first()
    return ticket;


def update_ticket_status(id,status):

    ticket = (
                db.session.query(QueueTicket)
                .join(Queue)
                .filter(
                    QueueTicket.id == id,
                    QueueTicket.status.notin_(["MISSED", "CANCELLED","COMPLETED"])
                ).first())

    if ticket :
        ticket.status = status

        db.session.commit()

    return ticket;

def get_ticket_by_number(queue_number):
    ticket = QueueTicket.query.filter_by(queue_number=queue_number).order_by(QueueTicket.created_at.desc()).first()
    return ticket;

def get_expected_queue_postion_and_time(service_name):

    queue = get_or_create_queue(service_name)

    if not queue:
        return {"position": 1, "est_wait": 0}   
    
    all_query_ticket =  (
                db.session.query(QueueTicket)
                .join(Queue)
                .filter(
                    QueueTicket.queue_id == queue.id
                ).order_by(QueueTicket.created_at.desc()).all())
        
    all_pending_tickets = [t for t in all_query_ticket if t.status not in ["MISSED", "CANCELLED","COMPLETED"]]   

 
    position = (len(all_pending_tickets) + 1) if all_pending_tickets else 1
    est_wait = position * AVERAGE_SERVICE_TIME

    return {"position": position, "est_wait": est_wait};


def update_appointment_room(queue_ticket_id, room_number):
    ticket = QueueTicket.query.get(queue_ticket_id)
    if ticket:
        ticket.room_number = room_number
        db.session.commit()
        return ticket
    return None

def update_appointment_appointment_date_by_10mins(queue_ticket_id):
    ticket = QueueTicket.query.get(queue_ticket_id)
    if ticket:
        ticket.expected_appointment_time = ticket.expected_appointment_time + timedelta(minutes=10)
        db.session.commit()
        return ticket
    return None


def get_tickets_by_queue_and_patient(queue,patient_id):
    
    ticket = (
            db.session.query(QueueTicket)
            .join(Queue)
            .filter(
                QueueTicket.patient_id == patient_id,
                Queue.service_name == queue.service_name,
                Queue.queue_date == date.today(),
                QueueTicket.status.notin_(["MISSED", "CANCELLED","COMPLETED"])
    ).first())

    return ticket;
