import hashlib

def verify_password(password: str) -> bool:
    password_hash = hashlib.sha256(password.encode()).hexdigest()
    return password_hash == "2166b51fcc4ebc9c6787a1ec72b31616ca454c69c1fdf2b8bcb6daf11ede0ab3"
