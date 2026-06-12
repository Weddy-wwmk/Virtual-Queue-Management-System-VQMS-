import os
from flask import Flask, jsonify
from config import Config
from models import db
from routes.walkin import walkin_bp
from routes.online import online_bp
from routes.teller import teller_bp
from routes.teller import auth_bp
from routes.queue import queue_bp
from routes.appointment import appointment_bp
from routes.analytics import analytics_bp
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from extensions import bcrypt, jwt
from dotenv import load_dotenv
from apscheduler.schedulers.background import BackgroundScheduler

app = Flask(__name__)
app.config.from_object(Config)

bcrypt.init_app(app)  
jwt.init_app(app)


CORS(app)


db.init_app(app)

load_dotenv()



app.register_blueprint(walkin_bp, url_prefix="/walkin")
app.register_blueprint(online_bp, url_prefix="/online")
app.register_blueprint(teller_bp, url_prefix="/teller")
app.register_blueprint(auth_bp, url_prefix="/auth")
app.register_blueprint(queue_bp,url_prefix="/queue")
app.register_blueprint(appointment_bp,url_prefix="/appointment")
app.register_blueprint(analytics_bp,url_prefix="/analytics")    

app.config["JWT_SECRET_KEY"] = "6e1a1a5149c449c1fe73422c0fa308b6b4a823ad35e998eb995e543a165cd2e0"

@jwt.invalid_token_loader
def invalid_token_callback(reason):
    return jsonify({"message": "Invalid token", "reason": reason}), 403

@jwt.unauthorized_loader
def missing_token_callback(reason):
    return jsonify({"message": "Missing Authorization Header", "reason": reason}), 403

@jwt.expired_token_loader
def expired_token_callback(jwt_header, jwt_payload):
    return jsonify({"message": "Token expired"}), 401


if __name__ == "__main__":

    if os.environ.get("WERKZEUG_RUN_MAIN") == "true":
        from services.tasks import start_scheduler
        start_scheduler(app)

    app.run(host="0.0.0.0", port=5000, debug=True)

