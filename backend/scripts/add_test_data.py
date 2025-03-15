import os
import sys
import random
from datetime import datetime, timedelta
import math

# Add the parent directory to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import SessionLocal
from app.models.models import NetWorthEntry

def generate_realistic_net_worth(months, start_value=100000, volatility=0.02, trend=0.005):
    """
    Generate realistic net worth data with:
    - Monthly compound growth
    - Random volatility
    - Seasonal patterns
    - Market-like trends
    """
    data = []
    current_value = start_value
    
    for i in range(months):
        # Base monthly return (trend)
        monthly_return = trend
        
        # Add random volatility
        monthly_return += random.gauss(0, volatility)
        
        # Add seasonal pattern (slight increase in Q4, decrease in Q1)
        month = i % 12
        if month in [9, 10, 11]:  # Q4
            monthly_return += 0.002
        elif month in [0, 1, 2]:  # Q1
            monthly_return -= 0.001
            
        # Calculate new value with compound interest
        current_value *= (1 + monthly_return)
        
        # Add some major events occasionally (like market corrections or booms)
        if random.random() < 0.05:  # 5% chance each month
            current_value *= random.uniform(0.95, 1.07)
        
        data.append(current_value)
    
    return data

# Connect to database
db = SessionLocal()

try:
    # Clear existing entries
    db.query(NetWorthEntry).delete()
    db.commit()
    
    # Generate 36 months (3 years) of data
    months = 36
    end_date = datetime.now()
    start_date = end_date - timedelta(days=months*30)
    
    # Generate values with realistic patterns
    values = generate_realistic_net_worth(
        months=months,
        start_value=100000,  # Start at $100k
        volatility=0.02,     # 2% monthly volatility
        trend=0.005          # 0.5% average monthly growth
    )
    
    # Add entries to database
    for i in range(months):
        date = start_date + timedelta(days=i*30)
        entry = NetWorthEntry(
            value=round(values[i], 2),
            date=date
        )
        db.add(entry)
    
    db.commit()
    print(f"Added {months} months of test net worth entries successfully!")
    
    # Print some statistics
    latest_value = values[-1]
    initial_value = values[0]
    total_return = (latest_value - initial_value) / initial_value * 100
    
    print(f"\nStatistics:")
    print(f"Initial Value: ${initial_value:,.2f}")
    print(f"Final Value: ${latest_value:,.2f}")
    print(f"Total Return: {total_return:.1f}%")
    print(f"Annualized Return: {(math.pow(latest_value/initial_value, 12/months) - 1) * 100:.1f}%")
    
finally:
    db.close() 