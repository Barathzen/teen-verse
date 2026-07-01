import time
import statistics
import asyncio
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.user import User
from app.core.security import verify_password, hash_password, create_access_token
from app.main import app
from httpx import AsyncClient
import uuid

def create_test_user(db: Session, email: str, password: str):
    user = db.query(User).filter(User.email == email).first()
    if not user:
        user = User(
            name="Test User",
            email=email,
            password=hash_password(password),
            role="user"
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    return user

def cleanup_test_user(db: Session, email: str):
    db.query(User).filter(User.email == email).delete()
    db.commit()

def test_component_latency(db: Session, email: str, plain_password: str):
    print("--- Component Latency (Single Run) ---")
    
    # 1. DB Query Latency
    start_time = time.perf_counter()
    user = db.query(User).filter(User.email == email).first()
    db_time = (time.perf_counter() - start_time) * 1000
    print(f"Database Query: {db_time:.2f} ms")
    
    if not user:
        print("User not found!")
        return

    # 2. Password Verification Latency
    start_time = time.perf_counter()
    is_valid = verify_password(plain_password, user.password)
    verify_time = (time.perf_counter() - start_time) * 1000
    print(f"Password Verification: {verify_time:.2f} ms")
    
    # 3. JWT Generation Latency
    start_time = time.perf_counter()
    token = create_access_token({"sub": str(user.id)})
    jwt_time = (time.perf_counter() - start_time) * 1000
    print(f"JWT Generation: {jwt_time:.2f} ms")
    print(f"Total Component Time: {(db_time + verify_time + jwt_time):.2f} ms\n")

async def test_e2e_latency(client: AsyncClient, email: str, password: str, num_requests: int = 10):
    print(f"--- End-to-End Latency ({num_requests} requests) ---")
    latencies = []
    
    for _ in range(num_requests):
        start_time = time.perf_counter()
        response = await client.post("/auth/login", json={"email": email, "password": password})
        if response.status_code != 200:
            print(f"Failed login! Status: {response.status_code}")
            break
        end_time = time.perf_counter()
        latencies.append((end_time - start_time) * 1000)
    
    if latencies:
        print(f"Min: {min(latencies):.2f} ms")
        print(f"Max: {max(latencies):.2f} ms")
        print(f"Average: {statistics.mean(latencies):.2f} ms")
        print(f"Median: {statistics.median(latencies):.2f} ms\n")

async def perform_login(client: AsyncClient, email, password):
    start_time = time.perf_counter()
    response = await client.post("/auth/login", json={"email": email, "password": password})
    return response.status_code, (time.perf_counter() - start_time) * 1000

async def test_load_latency(client: AsyncClient, email: str, password: str, concurrency: int = 10, total_requests: int = 50):
    print(f"--- Load Test ({total_requests} requests, {concurrency} concurrent) ---")
    latencies = []
    
    sem = asyncio.Semaphore(concurrency)
    
    async def worker():
        async with sem:
            return await perform_login(client, email, password)

    start_time = time.perf_counter()
    tasks = [worker() for _ in range(total_requests)]
    results = await asyncio.gather(*tasks)
    total_time = time.perf_counter() - start_time
    
    for status, latency in results:
        if status == 200:
            latencies.append(latency)
        else:
            print(f"Failed request with status {status}")
    
    if latencies:
        print(f"Min Latency: {min(latencies):.2f} ms")
        print(f"Max Latency: {max(latencies):.2f} ms")
        print(f"Average Latency: {statistics.mean(latencies):.2f} ms")
        print(f"95th Percentile: {statistics.quantiles(latencies, n=100)[94]:.2f} ms")
        print(f"Total Test Time: {total_time:.2f} seconds")
        print(f"Requests per second: {len(latencies) / total_time:.2f} req/s\n")

async def main():
    db = SessionLocal()
    test_email = f"latency_test_{uuid.uuid4()}@example.com"
    test_password = "SecurePassword123!"
    
    try:
        print("Setting up test user...")
        create_test_user(db, test_email, test_password)
        print("Test user created.\n")
        
        test_component_latency(db, test_email, test_password)
        
        import httpx
        async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://testserver") as client:
            await test_e2e_latency(client, test_email, test_password, num_requests=10)
            await test_load_latency(client, test_email, test_password, concurrency=10, total_requests=50)
            
    finally:
        print("Cleaning up test user...")
        cleanup_test_user(db, test_email)
        db.close()
        print("Cleanup done.")

if __name__ == "__main__":
    asyncio.run(main())
