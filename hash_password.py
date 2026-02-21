from passlib.hash import sha256_crypt

# hashes password
hashed = sha256_crypt.hash("1234")
print("Hashed password:", hashed)

