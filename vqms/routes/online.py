from flask import Blueprint, request, jsonify
from routes import appointment
from services.queue_service import get_expected_queue_postion_and_time, get_or_create_queue, generate_ticket, get_tickets_by_queue_and_patient
from services.appointment_service import get_appointment, get_appointment_by_patient_id_and_appointment_date
from services.patient_service import get_patient
from datetime import date

from services.twilio_sms import send_sms

online_bp = Blueprint("online", __name__)

@online_bp.route("/join", methods=["POST"])
def join_online_queue():
    data = request.json

    patient = get_patient(data["phoneNo"])

    if not patient:
        return jsonify({"message": "Sorry, Patient not found.Kindly use the walking option at the hosiptal or contact your doctor"}), 404
    
    appointment = get_appointment_by_patient_id_and_appointment_date(patient.id, date.today())

    if not appointment:
        return jsonify({"message": "Sorry, No appointment found.Kindly use the walking option at the hosiptal or contact your doctor"}), 404

    if date.today() != appointment.appointment_date.date():
        return jsonify({"message": "Sorry, No appointment for today.Kindly use the walking option at the hosiptal or contact your doctor"}), 400

    queue = get_or_create_queue(appointment.service_name)

    ticket = get_tickets_by_queue_and_patient(queue, patient.id)

    if ticket:
        return jsonify({
            "message": "You are already in the queue, kindly use the check queue status option to check your position and estimated wait time",
        }), 400

    ticket = generate_ticket(queue.id, patient.id, "ONLINE")

    send_sms(patient.phone_number, f"You have successfully joined the queue for {queue.service_name}. Your queue number is {ticket.queue_number}. Estimated wait time is {ticket.estimated_wait_minutes} minutes. We will send you a reminder when your queue number is coming up.")


    return jsonify({
        "queue_number": ticket.queue_number,
        "position": ticket.position,
        "estimated_wait": ticket.estimated_wait_minutes,
        "expected_appointment_time" : ticket.expected_appointment_time.isoformat()
    })

@online_bp.route("/check-queue/<string:phone_no>", methods=["GET"])
def check_online_queue(phone_no):
    patient = get_patient(phone_no)

    print("Patient found:", patient)

    if not patient:
        return jsonify({"message": "Sorry, Patient not found.Kindly use the walking option at the hosiptal or contact your doctor"}), 404

    appointment = get_appointment_by_patient_id_and_appointment_date(patient.id, date.today())

    print("Appointment found:", appointment)

    if not appointment:
        return jsonify({"message": "Sorry, No appointment found.Kindly use the walking option at the hosiptal or contact your doctor"}), 404
    
    print("Appointment date:",date.today() ,appointment.appointment_date)

    if date.today() != appointment.appointment_date.date():
        return jsonify({"message": "Sorry, No appointment for today.Kindly use the walking option at the hosiptal or contact your doctor"}), 400

    postionAndTime = get_expected_queue_postion_and_time(appointment.service_name)

    return jsonify({
        "position": postionAndTime["position"],
        "estimated_wait": postionAndTime["est_wait"]
    })

    
