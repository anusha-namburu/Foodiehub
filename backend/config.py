import os
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = os.path.abspath(os.path.dirname(__file__))

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'foodiehub-super-secret-jwt-key-2026')
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'foodiehub-jwt-secret-token-key-2026')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(days=7)
    
    # MySQL connection string format: mysql+pymysql://<user>:<password>@<host>:<port>/<dbname>
    # Example: mysql+pymysql://root:rootpassword@localhost:3306/foodiehub
    MYSQL_USER = os.environ.get('MYSQL_USER', 'root')
    MYSQL_PASSWORD = os.environ.get('MYSQL_PASSWORD', '')
    MYSQL_HOST = os.environ.get('MYSQL_HOST', 'localhost')
    MYSQL_PORT = os.environ.get('MYSQL_PORT', '3306')
    MYSQL_DB = os.environ.get('MYSQL_DB', 'foodiehub')
    
    # Custom DATABASE_URL if explicitly supplied
    CUSTOM_DB_URL = os.environ.get('DATABASE_URL')
    
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    @classmethod
    def get_database_uri(cls):
        """
        Check if configured MySQL instance is reachable. If yes, use MySQL.
        Otherwise, fall back seamlessly to SQLite for instant plug-and-play operation.
        """
        if cls.CUSTOM_DB_URL:
            return cls.CUSTOM_DB_URL
            
        # Try constructing MySQL URI
        if cls.MYSQL_PASSWORD:
            mysql_uri = f"mysql+pymysql://{cls.MYSQL_USER}:{cls.MYSQL_PASSWORD}@{cls.MYSQL_HOST}:{cls.MYSQL_PORT}/{cls.MYSQL_DB}"
        else:
            mysql_uri = f"mysql+pymysql://{cls.MYSQL_USER}@{cls.MYSQL_HOST}:{cls.MYSQL_PORT}/{cls.MYSQL_DB}"
            
        # Test connection
        try:
            import pymysql
            conn = pymysql.connect(
                host=cls.MYSQL_HOST,
                user=cls.MYSQL_USER,
                password=cls.MYSQL_PASSWORD,
                port=int(cls.MYSQL_PORT),
                connect_timeout=1
            )
            conn.close()
            print(f"[DB INFO] Connected successfully to MySQL at {cls.MYSQL_HOST}:{cls.MYSQL_PORT}")
            return mysql_uri
        except Exception as e:
            sqlite_path = os.path.join(BASE_DIR, 'foodiehub.db')
            print(f"[DB INFO] MySQL is not available ({e}). Seamlessly using SQLite database at: {sqlite_path}")
            return f"sqlite:///{sqlite_path}"
