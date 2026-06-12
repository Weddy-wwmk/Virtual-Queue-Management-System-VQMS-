from flask import Blueprint, request, jsonify
from models import db, Patient
from services.queue_service import get_or_create_queue, generate_ticket, get_tickets_by_queue_and_patient
from services.patient_service import get_patient, create_patient
from services.twilio_sms import send_appointment_reminder, send_sms

walkin_bp = Blueprint("walkin", __name__)

@walkin_bp.route("/join", methods=["POST"])
def join_walkin_queue():
    data = request.json

    patient = get_patient(data["phone"])

    if not patient:
      patient = create_patient(data["name"],data["phone"])
       
    queue = get_or_create_queue(data["service"])

    ticket = get_tickets_by_queue_and_patient(queue, patient.id)

    if ticket:
        return jsonify({
            "message": "You are already in the queue, kindly use the check queue status option to check your position and estimated wait time",
        }), 400

    ticket = generate_ticket(queue.id, patient.id, "WALK_IN")

    send_sms(patient.phone_number, f"You have successfully joined the queue for {queue.service_name}. Your queue number is {ticket.queue_number}. Estimated wait time is {ticket.estimated_wait_minutes} minutes. We will send you a reminder when your queue number is coming up.")
    
    return jsonify({
        "queue_number": ticket.queue_number,
        "position": ticket.position,
        "estimated_wait": ticket.estimated_wait_minutes,
        "expected_appointment_time" : ticket.expected_appointment_time.isoformat()
    })
