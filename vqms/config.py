class Config:
    SQLALCHEMY_DATABASE_URI = "mysql+pymysql://root:weddymugi@localhost/vqms"
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    JWT_SECRET_KEY = "6e1a1a5149c449c1fe73422c0fa308b6b4a823ad35e998eb995e543a165cd2e0"
    JWT_ACCESS_TOKEN_EXPIRES = 3600  # 1 hour