from sqlalchemy import Column, Integer, String, DateTime, func, Text, ForeignKey
from sqlalchemy.orm import relationship


from database import Base 


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String(100))
    hashed_password = Column(String, nullable=False)
    user_creation_date = Column(DateTime(timezone=True), server_default=func.now())

    # зв'язки
    messages = relationship("Message", back_populates="user", cascade="all, delete-orphan")
    files = relationship("Attachment", back_populates="user", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<User(id={self.id}, email={self.email})>"


class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True)
    content = Column(Text, nullable=False)
    message_date = Column(DateTime(timezone=True), server_default=func.now())
    
    sender_id = Column(Integer, ForeignKey("users.id"))

    # зв'язки
    user = relationship("User", back_populates="messages")
    # Одне повідомлення має багато вкладень - це буде список об'єктів Attachment:
    attachments = relationship("Attachment", back_populates="message", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Message(id={self.id}, sender_id={self.sender_id})>"


class Attachment(Base):
    __tablename__ = "attachments"

    id = Column(Integer, primary_key=True)
    filename = Column(String, nullable=False)
    file_path = Column(String, unique=True, nullable=False)
    file_type = Column(String, nullable=False)
    file_send_date = Column(DateTime(timezone=True), server_default=func.now())
    
    user_id = Column(Integer, ForeignKey("users.id"))
    # pзв"язок вкладення з конкретним повідомленням:
    message_id = Column(Integer, ForeignKey("messages.id"))

    # зв'язки з ін. таблицями:
    user = relationship("User", back_populates="files")
    # це вкладення належить одному повідомленню:
    message = relationship("Message", back_populates="attachments")

    def __repr__(self):
        return f"<Attachment(id={self.id}, filename='{self.filename}')>"