from models import db, Patient
import re


def get_patient(phone_no):
    phone_no = format_kenyan_phone(phone_no);
    patient = Patient.query.filter_by(phone_number=phone_no).first()
    return patient;

def create_patient(full_name,phone_no):
    phone_no = format_kenyan_phone(phone_no);  
    patient = Patient(
        full_name=full_name,
        phone_number=phone_no
    )

    db.session.add(patient)
    db.session.commit()

    return patient;

def format_kenyan_phone(phone: str) -> str:
    if not phone:
        raise ValueError("Phone number is required")

    phone = re.sub(r"[^\d]", "", phone)

    if phone.startswith("0"):
        phone = "254" + phone[1:]

    elif phone.startswith(("7", "1")):
        phone = "254" + phone

    elif phone.startswith("254"):
        pass
    else:
        raise ValueError("Invalid Kenyan phone number")

    if len(phone) != 12:
        raise ValueError("Invalid Kenyan phone number length")

    return "+" + phone
      