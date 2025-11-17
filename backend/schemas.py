from pydantic import BaseModel
from typing import Optional, List
from datetime import date, datetime


class CategoryBase(BaseModel):
    name: str
    color: Optional[str] = "#3b82f6"


class CategoryCreate(CategoryBase):
    pass


class Category(CategoryBase):
    id: int

    class Config:
        from_attributes = True


class PaymentMethodBase(BaseModel):
    name: str


class PaymentMethodCreate(PaymentMethodBase):
    pass


class PaymentMethod(PaymentMethodBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class SubscriptionBase(BaseModel):
    name: str
    description: Optional[str] = None
    amount: float
    currency: str = "GBP"
    billing_cycle: str = "monthly"
    category_id: Optional[int] = None
    payment_method_id: Optional[int] = None
    start_date: date
    next_billing_date: Optional[date] = None
    is_active: bool = True


class SubscriptionCreate(SubscriptionBase):
    pass


class SubscriptionUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    amount: Optional[float] = None
    currency: Optional[str] = None
    billing_cycle: Optional[str] = None
    category_id: Optional[int] = None
    payment_method_id: Optional[int] = None
    start_date: Optional[date] = None
    next_billing_date: Optional[date] = None
    is_active: Optional[bool] = None


class Subscription(SubscriptionBase):
    id: int
    created_at: datetime
    updated_at: datetime
    category: Optional[Category] = None
    payment_method: Optional[PaymentMethod] = None

    class Config:
        from_attributes = True


class TransactionBase(BaseModel):
    subscription_id: Optional[int] = None
    date: date
    description: str
    amount: float
    currency: str = "GBP"
    merchant: Optional[str] = None
    payment_method_id: Optional[int] = None
    raw_data: Optional[str] = None
    is_matched: bool = False


class TransactionCreate(TransactionBase):
    pass


class Transaction(TransactionBase):
    id: int
    created_at: datetime
    payment_method: Optional[PaymentMethod] = None

    class Config:
        from_attributes = True


class MonthlySpend(BaseModel):
    month: str
    total: float
    currency: str


class YearlySpend(BaseModel):
    year: int
    total: float
    currency: str


class CategorySpend(BaseModel):
    category_name: str
    total: float
    percentage: float
    color: str


class NotificationBase(BaseModel):
    title: str
    message: str
    type: str = "info"
    is_read: bool = False
    subscription_id: Optional[int] = None


class NotificationCreate(NotificationBase):
    pass


class Notification(NotificationBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class DashboardStats(BaseModel):
    active_subscriptions: int
    monthly_spend: float
    yearly_spend: float
    currency: str
    category_breakdown: List[CategorySpend]
    recent_transactions: List[Transaction]
    notifications_count: int = 0
