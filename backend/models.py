from sqlalchemy import Column, Integer, String, Float, Date, DateTime, Boolean, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base


class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    color = Column(String, default="#3b82f6")  # Default blue color for pie chart

    subscriptions = relationship("Subscription", back_populates="category")


class PaymentMethod(Base):
    __tablename__ = "payment_methods"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)  # Friendly name like "Visa *1234"
    created_at = Column(DateTime, default=datetime.utcnow)

    subscriptions = relationship("Subscription", back_populates="payment_method")
    transactions = relationship("Transaction", back_populates="payment_method")


class Subscription(Base):
    __tablename__ = "subscriptions"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    description = Column(Text, nullable=True)
    amount = Column(Float, nullable=False)
    currency = Column(String, default="GBP")
    billing_cycle = Column(String, default="monthly")  # monthly, yearly, quarterly, etc.
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=True)
    payment_method_id = Column(Integer, ForeignKey("payment_methods.id"), nullable=True)
    start_date = Column(Date, nullable=False)
    next_billing_date = Column(Date, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    category = relationship("Category", back_populates="subscriptions")
    payment_method = relationship("PaymentMethod", back_populates="subscriptions")
    transactions = relationship("Transaction", back_populates="subscription")


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    subscription_id = Column(Integer, ForeignKey("subscriptions.id"), nullable=True)
    date = Column(Date, nullable=False, index=True)
    description = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    currency = Column(String, default="GBP")
    merchant = Column(String, nullable=True, index=True)
    payment_method_id = Column(Integer, ForeignKey("payment_methods.id"), nullable=True)
    raw_data = Column(Text, nullable=True)  # Store original CSV row as JSON
    is_matched = Column(Boolean, default=False)  # Whether it's matched to a subscription
    created_at = Column(DateTime, default=datetime.utcnow)

    subscription = relationship("Subscription", back_populates="transactions")
    payment_method = relationship("PaymentMethod", back_populates="transactions")


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String, default="info")  # info, warning, alert, success
    is_read = Column(Boolean, default=False)
    subscription_id = Column(Integer, ForeignKey("subscriptions.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    subscription = relationship("Subscription")
