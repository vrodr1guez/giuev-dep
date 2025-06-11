from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session

# Replace with your actual database URL or environment variable
DATABASE_URL = "postgresql://user:password@localhost/giuev"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    """
    Dependency for fastapi to get a database session
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
