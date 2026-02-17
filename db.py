# from sqlalchemy import create_engine, Column, Integer, String, DateTime
# from sqlalchemy.ext.declarative import declarative_base
# from sqlalchemy.orm import sessionmaker
# from datetime import datetime

# DATABASE_URL = "postgresql://your_user:your_password@localhost:5432/your_db"

# engine = create_engine(DATABASE_URL)
# SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
# Base = declarative_base()

# class User(Base):
#     __tablename__ = "users"
#     id = Column(Integer, primary_key=True, index=True)
#     name = Column(String(100))
#     email = Column(String(100), unique=True, index=True)
#     password = Column(String(255))
#     created_at = Column(DateTime, default=datetime.utcnow)

# Base.metadata.create_all(bind=engine)
