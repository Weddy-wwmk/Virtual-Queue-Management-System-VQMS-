from services.appointment_service import get_appointment, create_appointment,get_appointment_by_service_and_date,get_appointment_by_patientid_servicename_appointment_date
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt
from services.patient_service import get_patient

from datetime import datetime, timezone

from services.twilio_sms import send_appointment_reminder

appointment_bp = Blueprint("appointment", __name__)

@appointment_bp.route("/create", methods=["POST"])
@jwt_required()
def create_new_appointment():
    data = request.json

    claims = get_jwt()

    if claims["role"] not in ["DOCTOR"]:
        return jsonify({"error": "Forbidden"}), 403

    appointment_date = datetime.strptime(
        data["appointmentDate"], "%Y-%m-%dT%H:%M:%S.%fZ"
    )
    appointment_date = appointment_date.replace(tzinfo=timezone.utc)
    appointment_date = appointment_date.astimezone()
    patient = get_patient(data["phoneNo"])

    if not patient:
        return jsonify({"message": "Sorry, Patient not found.Kindly use the walking option at the hosiptal"}), 404

    existing_appointment = get_appointment_by_patientid_servicename_appointment_date(patient.id,data["serviceName"],appointment_date)

    if existing_appointment:
        return jsonify({"message": "Appointment already exists for this patient on the given date"}), 200
       

    appointment = create_appointment(
        patient_id= patient.id,
        service_name=data["serviceName"],
        appointment_date=appointment_date
    )

    send_appointment_reminder(patient.phone_number, appointment.appointment_date)

    return jsonify({
        "message": "Appointment created successfully",
        "id": appointment.id,
        "patient_id": appointment.patient_id,
        "service_name": appointment.service_name,
        "date": appointment.appointment_date.isoformat()
    }), 201