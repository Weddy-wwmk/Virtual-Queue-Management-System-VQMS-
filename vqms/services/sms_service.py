from datetime import datetime, timezone
from services.room_service import get_empty_room,update_room_status
from services.queue_service import update_appointment_appointment_date_by_10mins,update_appointment_room
from services.appointment_service import get_today_appointments

def should_notify(ticket):
    print(f"Checking if should notify for ticket: {ticket.queue_number}")
    if not ticket.expected_appointment_time:
        return False

    remaining_minutes = (ticket.expected_appointment_time - datetime.now()).total_seconds() / 60

    print(f"Ticket {ticket.queue_number} - Remaining minutes: {remaining_minutes}")

    if ticket.visit_type == "WALK_IN":
        return -5 < remaining_minutes <= 1
  
    return -5 < remaining_minutes <= 60

def assign_room_to_ticket(ticket):
    room = get_empty_room()
    print(f"Assigning room to ticket {ticket.queue_number}: Found room {room}")
    if room:
        ticket.room_number = room.room_no
        room.status = "OCCUPIED"
        update_appointment_room(ticket.id, room.room_no) 
        update_room_status(room.room_no, "OCCUPIED")
        return True
    else:
        print("No empty rooms available")
        update_appointment_appointment_date_by_10mins(ticket.id)
        return False
    

def should_room_notify(ticket):
    if not ticket.expected_appointment_time:
        print(f"Ticket {ticket.queue_number} has no expected appointment time.")
        return False

    remaining_minutes = (ticket.expected_appointment_time - datetime.now()).total_seconds() / 60

    print(f"Ticket {ticket.queue_number} - Remaining minutes for room notification: {remaining_minutes} visit type: {ticket.visit_type}")

    if ticket.visit_type == "WALK_IN":
        return -5 < remaining_minutes <= 2 and assign_room_to_ticket(ticket)


    return -5 < remaining_minutes <= 5 and assign_room_to_ticket(ticket)


