from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from services.appointment_service import analyze_appointments

analytics_bp = Blueprint("analytics", __name__)

@analytics_bp.route("/get", methods=["GET"])
@jwt_required()
def get_analytics():
   return analyze_appointments();    