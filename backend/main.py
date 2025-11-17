from fastapi import FastAPI, Depends, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from typing import List
from datetime import datetime, date, timedelta
from dateutil.relativedelta import relativedelta
import pandas as pd
import io
import json
from collections import Counter

from database import engine, get_db, Base
import models
import schemas

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Subscription Tracker API")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Helper function to detect category from merchant name
def get_or_create_category(merchant: str, db: Session):
    """Auto-categorize based on merchant name"""
    category_map = {
        'netflix': ('Streaming', '#ec4899'),
        'spotify': ('Streaming', '#ec4899'),
        'disney': ('Streaming', '#ec4899'),
        'youtube': ('Streaming', '#ec4899'),
        'amazon': ('Shopping', '#f59e0b'),
        'adobe': ('Software', '#6366f1'),
        'microsoft': ('Software', '#6366f1'),
        'github': ('Software', '#6366f1'),
        'dropbox': ('Cloud Storage', '#8b5cf6'),
        'chatgpt': ('AI Tools', '#10b981'),
        'openai': ('AI Tools', '#10b981'),
    }

    merchant_lower = merchant.lower()
    for key, (cat_name, color) in category_map.items():
        if key in merchant_lower:
            # Check if category exists
            category = db.query(models.Category).filter(
                models.Category.name == cat_name
            ).first()

            if not category:
                category = models.Category(name=cat_name, color=color)
                db.add(category)
                db.commit()
                db.refresh(category)

            return category

    # Default category
    default_cat = db.query(models.Category).filter(
        models.Category.name == "Other"
    ).first()

    if not default_cat:
        default_cat = models.Category(name="Other", color="#64748b")
        db.add(default_cat)
        db.commit()
        db.refresh(default_cat)

    return default_cat


# Helper function to get or create payment method
def get_or_create_payment_method(payment_method_name: str, db: Session):
    """Get existing payment method or create new one"""
    payment_method = db.query(models.PaymentMethod).filter(
        models.PaymentMethod.name == payment_method_name
    ).first()

    if not payment_method:
        payment_method = models.PaymentMethod(name=payment_method_name)
        db.add(payment_method)
        db.commit()
        db.refresh(payment_method)

    return payment_method


# Helper function to detect recurring subscriptions
def detect_and_create_subscriptions(transactions: List[models.Transaction], db: Session):
    """Detect recurring patterns and auto-create subscriptions"""
    # Group by merchant
    merchant_groups = {}
    for trans in transactions:
        if trans.merchant:
            if trans.merchant not in merchant_groups:
                merchant_groups[trans.merchant] = []
            merchant_groups[trans.merchant].append(trans)

    new_subscriptions = []

    for merchant, trans_list in merchant_groups.items():
        # Need at least 2 transactions to detect pattern
        if len(trans_list) < 2:
            continue

        # Sort by date
        trans_list.sort(key=lambda x: x.date)

        # Check if amounts are similar (within 10%)
        amounts = [abs(t.amount) for t in trans_list]
        avg_amount = sum(amounts) / len(amounts)
        similar_amounts = all(abs(amt - avg_amount) / avg_amount < 0.1 for amt in amounts)

        if not similar_amounts:
            continue

        # Check if subscription already exists
        existing_sub = db.query(models.Subscription).filter(
            models.Subscription.name.ilike(f"%{merchant}%")
        ).first()

        if existing_sub:
            # Match transactions to existing subscription
            for trans in trans_list:
                trans.subscription_id = existing_sub.id
                trans.is_matched = True
            continue

        # Calculate billing cycle based on date differences
        dates = [t.date for t in trans_list]
        if len(dates) >= 2:
            days_diff = (dates[-1] - dates[0]).days / (len(dates) - 1)

            if 25 <= days_diff <= 35:
                billing_cycle = "monthly"
            elif 85 <= days_diff <= 95:
                billing_cycle = "quarterly"
            elif 350 <= days_diff <= 380:
                billing_cycle = "yearly"
            else:
                billing_cycle = "monthly"  # Default

            # Get category
            category = get_or_create_category(merchant, db)

            # Create subscription
            subscription = models.Subscription(
                name=merchant,
                amount=avg_amount,
                currency=trans_list[0].currency,
                billing_cycle=billing_cycle,
                category_id=category.id,
                start_date=trans_list[0].date,
                next_billing_date=trans_list[-1].date + timedelta(days=int(days_diff)),
                is_active=True
            )
            db.add(subscription)
            db.commit()
            db.refresh(subscription)

            # Match all transactions to this subscription
            for trans in trans_list:
                trans.subscription_id = subscription.id
                trans.is_matched = True

            new_subscriptions.append(subscription)

            # Create notification
            notification = models.Notification(
                title="New Subscription Detected",
                message=f"{merchant} - £{avg_amount:.2f}/{billing_cycle}",
                type="success",
                subscription_id=subscription.id
            )
            db.add(notification)

    db.commit()
    return new_subscriptions


# Helper function to generate notifications
def generate_notifications(db: Session):
    """Generate notifications for upcoming bills and alerts"""
    today = date.today()
    week_from_now = today + timedelta(days=7)

    # Check for upcoming bills
    upcoming_subs = db.query(models.Subscription).filter(
        models.Subscription.is_active == True,
        models.Subscription.next_billing_date != None,
        models.Subscription.next_billing_date >= today,
        models.Subscription.next_billing_date <= week_from_now
    ).all()

    for sub in upcoming_subs:
        # Check if notification already exists
        existing = db.query(models.Notification).filter(
            models.Notification.subscription_id == sub.id,
            models.Notification.title == "Upcoming Payment",
            models.Notification.is_read == False
        ).first()

        if not existing:
            days_until = (sub.next_billing_date - today).days
            notification = models.Notification(
                title="Upcoming Payment",
                message=f"{sub.name} - £{sub.amount:.2f} due in {days_until} day{'s' if days_until != 1 else ''}",
                type="warning",
                subscription_id=sub.id
            )
            db.add(notification)

    db.commit()


# Category endpoints
@app.get("/api/categories", response_model=List[schemas.Category])
def get_categories(db: Session = Depends(get_db)):
    return db.query(models.Category).all()


@app.post("/api/categories", response_model=schemas.Category)
def create_category(category: schemas.CategoryCreate, db: Session = Depends(get_db)):
    # Check if category already exists
    existing = db.query(models.Category).filter(models.Category.name == category.name).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Category '{category.name}' already exists")

    db_category = models.Category(**category.model_dump())
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category


@app.delete("/api/categories/{category_id}")
def delete_category(category_id: int, db: Session = Depends(get_db)):
    category = db.query(models.Category).filter(models.Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    # Check if category is in use by subscriptions
    subscription_count = db.query(models.Subscription).filter(
        models.Subscription.category_id == category_id
    ).count()

    if subscription_count > 0:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot delete category. It is used by {subscription_count} subscription(s)"
        )

    db.delete(category)
    db.commit()
    return {"message": "Category deleted successfully"}


# Payment Method endpoints
@app.get("/api/payment-methods", response_model=List[schemas.PaymentMethod])
def get_payment_methods(db: Session = Depends(get_db)):
    return db.query(models.PaymentMethod).all()


@app.post("/api/payment-methods", response_model=schemas.PaymentMethod)
def create_payment_method(payment_method: schemas.PaymentMethodCreate, db: Session = Depends(get_db)):
    # Check if payment method already exists
    existing = db.query(models.PaymentMethod).filter(models.PaymentMethod.name == payment_method.name).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Payment method '{payment_method.name}' already exists")

    db_payment_method = models.PaymentMethod(**payment_method.model_dump())
    db.add(db_payment_method)
    db.commit()
    db.refresh(db_payment_method)
    return db_payment_method


@app.delete("/api/payment-methods/{payment_method_id}")
def delete_payment_method(payment_method_id: int, db: Session = Depends(get_db)):
    payment_method = db.query(models.PaymentMethod).filter(models.PaymentMethod.id == payment_method_id).first()
    if not payment_method:
        raise HTTPException(status_code=404, detail="Payment method not found")

    # Check if payment method is in use by subscriptions or transactions
    subscription_count = db.query(models.Subscription).filter(
        models.Subscription.payment_method_id == payment_method_id
    ).count()

    transaction_count = db.query(models.Transaction).filter(
        models.Transaction.payment_method_id == payment_method_id
    ).count()

    total_usage = subscription_count + transaction_count

    if total_usage > 0:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot delete payment method. It is used by {subscription_count} subscription(s) and {transaction_count} transaction(s)"
        )

    db.delete(payment_method)
    db.commit()
    return {"message": "Payment method deleted successfully"}


# Subscription endpoints
@app.get("/api/subscriptions", response_model=List[schemas.Subscription])
def get_subscriptions(
    is_active: bool = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    query = db.query(models.Subscription)
    if is_active is not None:
        query = query.filter(models.Subscription.is_active == is_active)
    return query.offset(skip).limit(limit).all()


@app.get("/api/subscriptions/{subscription_id}", response_model=schemas.Subscription)
def get_subscription(subscription_id: int, db: Session = Depends(get_db)):
    subscription = db.query(models.Subscription).filter(
        models.Subscription.id == subscription_id
    ).first()
    if not subscription:
        raise HTTPException(status_code=404, detail="Subscription not found")
    return subscription


@app.post("/api/subscriptions", response_model=schemas.Subscription)
def create_subscription(subscription: schemas.SubscriptionCreate, db: Session = Depends(get_db)):
    db_subscription = models.Subscription(**subscription.model_dump())
    db.add(db_subscription)
    db.commit()
    db.refresh(db_subscription)

    # Create initial transaction for this subscription
    transaction = models.Transaction(
        subscription_id=db_subscription.id,
        date=db_subscription.start_date,
        description=f"{db_subscription.name} - {db_subscription.billing_cycle} subscription",
        amount=-abs(db_subscription.amount),  # Negative for expense
        currency=db_subscription.currency,
        merchant=db_subscription.name,
        payment_method_id=db_subscription.payment_method_id,
        is_matched=True
    )
    db.add(transaction)
    db.commit()

    return db_subscription


@app.put("/api/subscriptions/{subscription_id}", response_model=schemas.Subscription)
def update_subscription(
    subscription_id: int,
    subscription: schemas.SubscriptionUpdate,
    db: Session = Depends(get_db)
):
    db_subscription = db.query(models.Subscription).filter(
        models.Subscription.id == subscription_id
    ).first()
    if not db_subscription:
        raise HTTPException(status_code=404, detail="Subscription not found")

    update_data = subscription.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_subscription, key, value)

    db.commit()
    db.refresh(db_subscription)
    return db_subscription


@app.delete("/api/subscriptions/{subscription_id}")
def delete_subscription(subscription_id: int, db: Session = Depends(get_db)):
    db_subscription = db.query(models.Subscription).filter(
        models.Subscription.id == subscription_id
    ).first()
    if not db_subscription:
        raise HTTPException(status_code=404, detail="Subscription not found")

    db.delete(db_subscription)
    db.commit()
    return {"message": "Subscription deleted successfully"}


# Transaction endpoints
@app.get("/api/transactions", response_model=List[schemas.Transaction])
def get_transactions(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    return db.query(models.Transaction).order_by(
        models.Transaction.date.desc()
    ).offset(skip).limit(limit).all()


@app.post("/api/transactions/import")
async def import_csv(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """
    Import transactions from CSV file and auto-detect subscriptions.
    Expected CSV columns: date, description, amount
    Optional columns: merchant, currency
    """
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="File must be a CSV")

    try:
        contents = await file.read()
        df = pd.read_csv(io.StringIO(contents.decode('utf-8')))

        # Validate required columns
        required_cols = ['date', 'description', 'amount']
        if not all(col in df.columns for col in required_cols):
            raise HTTPException(
                status_code=400,
                detail=f"CSV must contain columns: {', '.join(required_cols)}"
            )

        imported_transactions = []
        imported_count = 0

        for _, row in df.iterrows():
            # Parse date
            try:
                transaction_date = pd.to_datetime(row['date']).date()
            except:
                continue  # Skip invalid dates

            # Extract merchant from description or use merchant column
            merchant = None
            if 'merchant' in row and pd.notna(row['merchant']):
                merchant = str(row['merchant'])
            else:
                # Try to extract merchant from description
                merchant = str(row['description']).split()[0]  # First word as merchant

            # Extract payment method if provided
            payment_method_id = None
            if 'payment_method' in row and pd.notna(row['payment_method']):
                payment_method_name = str(row['payment_method'])
                payment_method = get_or_create_payment_method(payment_method_name, db)
                payment_method_id = payment_method.id

            # Create transaction
            transaction = models.Transaction(
                date=transaction_date,
                description=str(row['description']),
                amount=float(row['amount']),
                currency=str(row.get('currency', 'GBP')),
                merchant=merchant,
                payment_method_id=payment_method_id,
                raw_data=json.dumps(row.to_dict()),
                is_matched=False
            )
            db.add(transaction)
            imported_transactions.append(transaction)
            imported_count += 1

        db.commit()

        # Refresh all transactions to get IDs
        for trans in imported_transactions:
            db.refresh(trans)

        # Detect and create subscriptions
        new_subs = detect_and_create_subscriptions(imported_transactions, db)

        # Generate notifications
        generate_notifications(db)

        return {
            "message": f"Successfully imported {imported_count} transactions and detected {len(new_subs)} subscriptions",
            "count": imported_count,
            "subscriptions_detected": len(new_subs)
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing CSV: {str(e)}")


# Notification endpoints
@app.get("/api/notifications", response_model=List[schemas.Notification])
def get_notifications(
    unread_only: bool = False,
    db: Session = Depends(get_db)
):
    query = db.query(models.Notification).order_by(models.Notification.created_at.desc())
    if unread_only:
        query = query.filter(models.Notification.is_read == False)
    return query.all()


@app.put("/api/notifications/{notification_id}/read")
def mark_notification_read(notification_id: int, db: Session = Depends(get_db)):
    notification = db.query(models.Notification).filter(
        models.Notification.id == notification_id
    ).first()
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")

    notification.is_read = True
    db.commit()
    return {"message": "Notification marked as read"}


@app.post("/api/notifications/mark-all-read")
def mark_all_notifications_read(db: Session = Depends(get_db)):
    db.query(models.Notification).update({"is_read": True})
    db.commit()
    return {"message": "All notifications marked as read"}


# Analytics endpoints
@app.get("/api/analytics/dashboard", response_model=schemas.DashboardStats)
def get_dashboard_stats(db: Session = Depends(get_db)):
    # Generate fresh notifications
    generate_notifications(db)

    # Active subscriptions count
    active_count = db.query(models.Subscription).filter(
        models.Subscription.is_active == True
    ).count()

    # Get current month's spend
    today = date.today()
    current_month_start = today.replace(day=1)
    next_month = current_month_start + relativedelta(months=1)

    monthly_transactions = db.query(func.sum(models.Transaction.amount)).filter(
        models.Transaction.date >= current_month_start,
        models.Transaction.date < next_month
    ).scalar() or 0.0

    # Get yearly spend (last 12 months)
    year_ago = today - relativedelta(months=12)
    yearly_transactions = db.query(func.sum(models.Transaction.amount)).filter(
        models.Transaction.date >= year_ago
    ).scalar() or 0.0

    # Category breakdown
    category_stats = db.query(
        models.Category.name,
        models.Category.color,
        func.sum(models.Subscription.amount).label('total')
    ).join(
        models.Subscription, models.Subscription.category_id == models.Category.id
    ).filter(
        models.Subscription.is_active == True
    ).group_by(models.Category.id).all()

    total_category_spend = sum(stat.total for stat in category_stats) if category_stats else 1

    category_breakdown = [
        schemas.CategorySpend(
            category_name=stat.name,
            total=stat.total,
            percentage=(stat.total / total_category_spend * 100) if total_category_spend > 0 else 0,
            color=stat.color
        )
        for stat in category_stats
    ]

    # Recent transactions
    recent = db.query(models.Transaction).order_by(
        models.Transaction.date.desc()
    ).limit(10).all()

    # Unread notifications count
    notifications_count = db.query(models.Notification).filter(
        models.Notification.is_read == False
    ).count()

    return schemas.DashboardStats(
        active_subscriptions=active_count,
        monthly_spend=abs(monthly_transactions),
        yearly_spend=abs(yearly_transactions),
        currency="GBP",
        category_breakdown=category_breakdown,
        recent_transactions=recent,
        notifications_count=notifications_count
    )


@app.get("/api/analytics/monthly", response_model=List[schemas.MonthlySpend])
def get_monthly_spend(months: int = 12, db: Session = Depends(get_db)):
    """Get spend by month for the last N months"""
    today = date.today()
    start_date = today - relativedelta(months=months)

    results = db.query(
        extract('year', models.Transaction.date).label('year'),
        extract('month', models.Transaction.date).label('month'),
        func.sum(models.Transaction.amount).label('total')
    ).filter(
        models.Transaction.date >= start_date
    ).group_by('year', 'month').order_by('year', 'month').all()

    monthly_data = []
    for result in results:
        month_str = f"{int(result.year)}-{int(result.month):02d}"
        monthly_data.append(schemas.MonthlySpend(
            month=month_str,
            total=abs(result.total),
            currency="GBP"
        ))

    return monthly_data


@app.get("/api/analytics/yearly", response_model=List[schemas.YearlySpend])
def get_yearly_spend(db: Session = Depends(get_db)):
    """Get spend by year"""
    results = db.query(
        extract('year', models.Transaction.date).label('year'),
        func.sum(models.Transaction.amount).label('total')
    ).group_by('year').order_by('year').all()

    return [
        schemas.YearlySpend(
            year=int(result.year),
            total=abs(result.total),
            currency="GBP"
        )
        for result in results
    ]


@app.get("/api/analytics/by-payment-method")
def get_spending_by_payment_method(db: Session = Depends(get_db)):
    """Get spending breakdown by payment method"""
    # Get all transactions with payment methods
    results = db.query(
        models.PaymentMethod.id,
        models.PaymentMethod.name,
        func.sum(models.Transaction.amount).label('total'),
        func.count(models.Transaction.id).label('transaction_count')
    ).join(
        models.Transaction, models.Transaction.payment_method_id == models.PaymentMethod.id
    ).group_by(
        models.PaymentMethod.id, models.PaymentMethod.name
    ).all()

    payment_method_spending = []
    for result in results:
        payment_method_spending.append({
            "payment_method_id": result.id,
            "payment_method_name": result.name,
            "total": abs(result.total),
            "transaction_count": result.transaction_count,
            "currency": "GBP"
        })

    return payment_method_spending


@app.get("/")
def root():
    return {"message": "Subscription Tracker API"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
