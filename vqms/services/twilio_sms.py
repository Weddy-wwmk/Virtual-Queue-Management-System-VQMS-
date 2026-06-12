import os
from twilio.rest import Client

TWILIO_SID = os.environ.get("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.environ.get("TWILIO_AUTH_TOKEN")

client = Client(TWILIO_SID, TWILIO_AUTH_TOKEN)

def send_sms(to, message):
    print(f"Sending SMS to {to}: {message}")
    message = client.messages.create(
        from_='whatsapp:+14155238886',
        body=message,
        to='whatsapp:'+ to
    )

def send_appointment_reminder(to, appointment_time):
    date = appointment_time.strftime("%d/%m")
    time = appointment_time.strftime("%I:%M %p")
    print(f"Sending appointment reminder to {to} for date {date} at time {time}")
    message = client.messages.create(
        from_='whatsapp:+14155238886',
        content_sid='HXb5b62575e6e4ff6129ad7c8efe1f983e',
        content_variables='{"1":"'+date+'","2":"'+time+'"}',
        to='whatsapp:' + to
    )




