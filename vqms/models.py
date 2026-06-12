from flask_sqlalchemy import SQLAlchemy
from datetime import date
from datetime import datetime, timedelta
from sqlalchemy import event
from extensions import bcrypt

db = SQLAlchemy()

class Patient(db.Model):
    id = db.Column(db.BigInteger, primary_key=True)
    full_name = db.Column(db.String(100))
    phone_number = db.Column(db.String(20))
    created_at = db.Column(db.DateTime, server_default=db.func.now())


class Queue(db.Model):
    id = db.Column(db.BigInteger, primary_key=True)
    service_name = db.Column(db.String(50))
    queue_date = db.Column(db.Date, default=date.today)

    __table_args__ = (
        db.UniqueConstraint("service_name", "queue_date"),
    )


class QueueTicket(db.Model):
    id = db.Column(db.BigInteger, primary_key=True)
    queue_id = db.Column(db.BigInteger, db.ForeignKey("queue.id"))
    patient_id = db.Column(db.BigInteger, db.ForeignKey("patient.id"))

    queue_number = db.Column(db.String(30))
    position = db.Column(db.Integer)
    estimated_wait_minutes = db.Column(db.Integer)

    status = db.Column(db.Enum(
        "WAITING", "NOTIFIED", "CALLED", "IN_SERVICE", "COMPLETED","MISSED","CANCELLED","ROOM_ASSIGNED"
    ), default="WAITING")

    visit_type = db.Column(db.Enum("WALK_IN", "ONLINE"))
    room_number = db.Column(db.String(10))

    created_at = db.Column(db.DateTime, server_default=db.func.now())
    updated_at = db.Column(db.DateTime,
        server_default=db.func.now(),
        onupdate=db.func.now()
    )
    expected_appointment_time = db.Column(db.DateTime)
    patient = db.relationship("Patient", backref="tickets")


@event.listens_for(QueueTicket, "before_insert")
def set_expected_appointment_time(mapper, connection, target):
    """
    Set expected_appointment_time = now + estimated_wait_minutes
    """
    if target.estimated_wait_minutes is not None:
        target.expected_appointment_time = datetime.now() + timedelta(
            minutes=target.estimated_wait_minutes
        )
    else:
        target.expected_appointment_time = datetime.now()    

class StaffUser(db.Model):
    id = db.Column(db.BigInteger, primary_key=True)
    username = db.Column(db.String(50), unique=True)
    password = db.Column(db.String(500))
    role_type = db.Column(db.Enum("TELLER", "ADMIN", "DOCTOR"), default="TELLER")
    created_at = db.Column(db.DateTime, server_default=db.func.now())


    def set_password(self, password):
        self.password = bcrypt.generate_password_hash(
            password[:72]
        ).decode("utf-8")

    def check_password(self, password):
        return bcrypt.check_password_hash(
            self.password,
            password[:72])
    
class Appointment(db.Model):
    id = db.Column(db.BigInteger, primary_key=True)
    patient_id = db.Column(db.BigInteger, db.ForeignKey("patient.id"))
    service_name = db.Column(db.String(50))
    appointment_date = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    sms_sent = db.Column(db.Boolean, default=False)
    is_complete = db.Column(db.Boolean, default=False)
    patient = db.relationship("Patient", backref="appointments")

class Room(db.Model):
    id = db.Column(db.BigInteger, primary_key=True)
    room_no = db.Column(db.String(10), unique=True)
    status = db.Column(db.Enum("EMPTY", "OCCUPIED"), default="EMPTY")

