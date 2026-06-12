from models import db, Room


def get_empty_room():
    room = Room.query.filter_by(
        status="EMPTY"
    ).first()

    return room

def update_room_status(room_no, status):
    room = Room.query.filter_by(
        room_no=room_no
    ).first()

    if room:
        room.status = status
        db.session.commit()
        return True
    return False
