from flask import Blueprint, request, jsonify
from models import db, Patient
from routes import appointment
from services.queue_service import get_patient_queue, update_ticket_status,generate_ticket,get_ticket_by_number
from services.patient_service import get_patient
from services.appointment_service import get_appointment_by_patient_id_and_appointment_date, update_appointment_status
from datetime import datetime
from services.room_service import update_room_status
from datetime import date

queue_bp = Blueprint("queue", __name__)

@queue_bp.route("status/<string:phone_no>", methods=["GET"])
def get_queue_status(phone_no) :

    patient = get_patient(phone_no)

    if not patient:
        return jsonify({"error": "Patient not found"}), 404

    ticket = get_patient_queue(patient.id)

    if not ticket:
        return jsonify({"error": "Ticket not found"}), 404

    wait_minutes = None

    msg = "Appointment on schedule"

    return jsonify({
        "message" : msg,
        "patient_name": patient.full_name,
        "queue_number": ticket.queue_number,
        "position": ticket.position,
        "status": ticket.status,
        "estimated_wait": wait_minutes,
        "expected_appointment_time" : ticket.expected_appointment_time.isoformat(),
        "room_number": ticket.room_number
    })        


@queue_bp.route("update_status", methods=["POST"])
def post_update_status() :

    data = request.json

    ticket = get_ticket_by_number(data["queueNumber"])

    if not ticket:
        return jsonify({"message": "Ticket not found"}), 404

    update_ticket_status(ticket.id,data["status"])

    appointment = get_appointment_by_patient_id_and_appointment_date(ticket.patient_id, date.today())

    if appointment :
        update_appointment_status(appointment.id,True)

    if(data["status"] == "COMPLETED") :
        update_room_status(ticket.room_number,"EMPTY")
      
    return jsonify({"message": "Ticket status updated"})


@queue_bp.route("get_queue_info/<string:queue_number>", methods=["GET"])
def get_queue_info(queue_number):
    ticket = get_ticket_by_number(queue_number)
    if not ticket:
        return jsonify({"error": "Ticket not found"}), 404

    return jsonify({
        "queue_number": ticket.queue_number,
        "patient_id": ticket.patient_id,
        "position": ticket.position,
        "status": ticket.status,
        "estimated_wait_minutes": ticket.estimated_wait_minutes,
        "expected_appointment_time": ticket.expected_appointment_time.isoformat() if ticket.expected_appointment_time else None,
        "room_number": ticket.room_number
    })



@queue_bp.route("reschedule", methods=["POST"])
def post_reshedule() :

    data = request.json

    ticket = get_ticket_by_number(data["queueNumber"])

    if not ticket:
        return jsonify({"error": "Ticket not found"}), 404


    update_ticket_status(ticket.id,"MISSED")
    wait_minutes = None

    msg = "Appointment on schedule"

    if ticket.expected_appointment_time :
        delta = ticket.expected_appointment_time - datetime.now()
        wait_minutes = int(delta.total_seconds() / 60)
        if wait_minutes < 0 or ticket.status == "MISSED" :
            ticket = generate_ticket(ticket.queue_id,ticket.patient_id,ticket.visit_type)
            msg = "Previous appointment missed, new ticket generated"

    if ticket.room_number :
        update_room_status(ticket.room_number,"EMPTY")


    return jsonify({
        "message" : msg,
        "queue_number": ticket.queue_number,
        "position": ticket.position,
        "status": ticket.status,
        "estimated_wait": wait_minutes,
        "expected_appointment_time" : ticket.expected_appointment_time.isoformat(),
        "room_number": ticket.room_number
    }) 




