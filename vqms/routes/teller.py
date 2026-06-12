from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt,create_access_token
from models import db, QueueTicket, StaffUser
from services.queue_service import update_ticket_status, get_ticket_by_number 

teller_bp = Blueprint("teller", __name__)
auth_bp = Blueprint("auth", __name__)

@teller_bp.route("/serve", methods=["POST"])
@jwt_required()
def serve_patient():
    claims = get_jwt()

    if claims["role"] not in ["TELLER", "DOCTOR"]:
        return jsonify({"error": "Forbidden"}), 403

    data = request.json

    ticket = get_ticket_by_number(data["queue_number"])

    update_ticket_status(ticket.id,"IN_SERVICE")

    db.session.commit()

    return jsonify({"message": "Patient assigned room"})


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.json

    user = StaffUser.query.filter_by(username=data["username"]).first()

    if not user or not user.check_password(data["password"]):
        return jsonify({"error": "Invalid credentials"}), 401

    access_token = create_access_token(
        identity=str(user.id),
        additional_claims={"role": user.role_type}
    )

    return jsonify({"access_token": access_token,
                    "message": "Login successful",
                    "role": user.role_type},)

@auth_bp.route("/create-user", methods=["POST"])
def create_staff_user():

    data = request.json
    username = data["username"]
    password = data["password"]
    role_type = data.get("role_type", "TELLER")

    user = StaffUser.query.filter_by(username=username).first()

    if user:
        return jsonify({"error": "Username already exists"}), 400


    user = StaffUser(
        username=username,
        role_type=role_type
    )
    user.set_password(password)
    db.session.add(user)
    db.session.commit()

    return jsonify({"message": "User created successfully",
                    "username": username,
                    "role_type": role_type
                     })
