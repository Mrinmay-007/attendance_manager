# from sqlalchemy import create_engine
# from sqlalchemy.orm import declarative_base, sessionmaker
# import os
# from dotenv import load_dotenv


# load_dotenv(os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env"))

# DATABASE_URL = os.environ["DATABASE_URL"]
# engine = create_engine(DATABASE_URL, pool_pre_ping=True)
# SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
# Base = declarative_base()

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from dotenv import load_dotenv
import os


load_dotenv(
    os.path.join(
        os.path.dirname(os.path.dirname(__file__)),
        ".env"
    )
)

DATABASE_URL = os.environ["DATABASE_URL"]

engine = create_engine(
    DATABASE_URL,
    connect_args={
        "ssl": {
            "check_hostname": True
        }
    },
    pool_pre_ping=True,
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()