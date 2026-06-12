from datetime import datetime, timedelta
from tracemalloc import start
from models import Queue, db, Appointment,QueueTicket
from flask import Blueprint, jsonify
from sqlalchemy import func
from datetime import date, timedelta

def get_appointment_by_patientid_servicename_appointment_date(patient_id,service_name,appointment_date):
    appointment = Appointment.query.filter_by(
        patient_id=patient_id,
        service_name=service_name,
        appointment_date=appointment_date,
        is_complete=False
    ).first()

    return appointment;

def get_appointment(patient_id):
    appointment = Appointment.query.filter_by(
        patient_id=patient_id
    ).first()

    return appointment;

def get_appointment_by_patient_id_and_appointment_date(patient_id, appointment_date):
    start = datetime.combine(appointment_date, datetime.min.time())
    end = start + timedelta(days=1)

    appointment = Appointment.query \
        .filter(Appointment.patient_id == patient_id) \
        .filter(Appointment.appointment_date >= start) \
        .filter(Appointment.appointment_date < end) \
        .order_by(Appointment.created_at.desc()) \
        .first()
   
    return appointment;

def create_appointment(patient_id, service_name, appointment_date):

    appointment = Appointment(
        patient_id=patient_id,
        service_name=service_name,
        appointment_date=appointment_date
    )

    db.session.add(appointment)
    db.session.commit()

    return appointment;

def get_appointment_by_service_and_date(service_name, appointment_date):
    appointment = Appointment.query.filter_by(
        service_name=service_name,
        appointment_date=appointment_date
    ).first()

    return appointment;

def get_today_appointments():
    today = date.today()
    start = datetime.combine(today, datetime.min.time())
    end = start + timedelta(days=1)

    appointments = db.session.query(Appointment)\
        .filter(Appointment.appointment_date >= start)\
        .filter(Appointment.appointment_date < end)\
        .filter(Appointment.sms_sent == False)\
        .filter(Appointment.is_complete.is_(False))\
        .all()
    
    return appointments;

def update_appointment_status(id, is_complete):

    appointment = Appointment.query.get(id)

    if appointment :
        appointment.is_complete = is_complete

        db.session.commit()

    return appointment;

def analyze_appointments():
    today = date.today()
    yesterday = today - timedelta(days=1)

    total_appointments = db.session.query(func.count(Appointment.id))\
    .filter(func.date(Appointment.appointment_date)== today)\
    .scalar()

    pending_appointments = db.session.query(func.count(Appointment.id))\
        .filter(Appointment.is_complete == False , func.date(Appointment.appointment_date)  == today)\
        .scalar()

    people_in_queue = db.session.query(func.count(QueueTicket.id))\
        .filter(QueueTicket.status.in_(["WAITING", "NOTIFIED", "CALLED", "IN_SERVICE", "ROOM_ASSIGNED"]) , 
                func.date(QueueTicket.created_at) == today)\
        .scalar()

    today_data = db.session.query(
            Queue.service_name,
            func.count(QueueTicket.id).label("count")
        ).join(
            Queue, Queue.id == QueueTicket.queue_id
        ).filter(
            func.date(QueueTicket.created_at) == today
        ).group_by(
            Queue.service_name
        ).all()

    yesterday_data = db.session.query(
        Queue.service_name,
        func.count(QueueTicket.id).label("count")
        ).join(
            Queue, Queue.id == QueueTicket.queue_id
        ).filter(
            func.date(QueueTicket.created_at) == yesterday
        ).group_by(
            Queue.service_name
        ).all()

    today_dict = {row.service_name: row.count for row in today_data}
    yesterday_dict = {row.service_name: row.count for row in yesterday_data}

    services = set(today_dict.keys()).union(set(yesterday_dict.keys()))

    yesterday_vs_today = []
    for service in services:
        yesterday_vs_today.append({
            "service": service,
            "yesterday": yesterday_dict.get(service, 0),
            "today": today_dict.get(service, 0)
        })

    return jsonify({
        "totalAppointments": total_appointments,
        "pendingAppointments": pending_appointments,
        "peopleInQueue": people_in_queue,
        "yesterdayVsToday": yesterday_vs_today
    })