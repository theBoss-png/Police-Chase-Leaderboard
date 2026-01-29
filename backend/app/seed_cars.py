from .database import create_db_and_tables, get_session
from .models import Car

# Tabellen erstellen
create_db_and_tables()
cars = [
    ("car_01", "Carolina Commit"),
    ("car_02", "Deacon Mayflower"),
    ("car_03", "McCall Montpellier"),
    ("car_04", "Galaxy Esquire"),
    ("car_05", "Perry Navigator"),
    ("car_06", "Perry Navigator SUV"),
    ("car_07", "Carolina Corsair"),
    ("car_08", "Gibson Step-Up"),
    ("car_09", "Carolina Pilgrimp"),
    ("car_10", "McCall Manchester"),
    ("car_11", "McCall Miami"),
    ("car_12", "Verhoeven Piranha V8"),
    ("car_13", "McCall Monaco"),
    ("car_14", "McCall Monaco Bald Eagle"),
    ("car_15", "Chevalier Bonheur"),
    ("car_16", "Nakazato Cricket"),
    ("car_17", "Chevalier XIV"),
    ("car_18", "Merkur 668"),
    ("car_19", "Acheron Redhawk"),
    ("car_20", "Automobili Mangione 4000"),
    ("car_21", "Bulldozer"),
]

with get_session() as session:
    for key, name in cars:
        car = Car(key=key, name=name)
        session.add(car)
    session.commit()

print("Seed finished!")
