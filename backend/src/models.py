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

    # Явно вказую, які повідомлення надіслані, а які отримані
    sent_messages = relationship("Message", foreign_keys="[Message.sender_id]", back_populates="sender")
    received_messages = relationship("Message", foreign_keys="[Message.receiver_id]", back_populates="receiver")

    def __repr__(self):
        return f"<User(id={self.id}, email={self.email})>"


class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True)
    content = Column(Text, nullable=False)
    message_date = Column(DateTime(timezone=True), server_default=func.now())
    
    sender_id = Column(Integer, ForeignKey("users.id"))
    receiver_id = Column(Integer, ForeignKey("users.id"))
    # явні зв"язки з back_populates до відповідних полів у User:
    sender = relationship("User", foreign_keys=[sender_id])
    receiver = relationship("User", foreign_keys=[receiver_id])
    # Одне повідомлення має багато вкладень - це буде список об'єктів Attachment:
    attachments = relationship("Attachment", back_populates="message", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Message(id={self.id}, sender_id={self.sender_id})>"


class Attachment(Base):
    __tablename__ = "attachments"

    id = Column(Integer, primary_key=True)
    original_filename = Column(String, nullable=False)
    file_path = Column(String, unique=True, nullable=False)
    file_type = Column(String, nullable=True) # ставимо "тру" на випадок, яещо тип файлу буде невідомий
    
    # зв"язок вкладення з конкретним повідомленням:
    message_id = Column(Integer, ForeignKey("messages.id"))

    # це вкладення належить одному повідомленню:
    message = relationship("Message", back_populates="attachments")

    def __repr__(self):
        return f"<Attachment(id={self.id}, filename='{self.original_filename}')>"