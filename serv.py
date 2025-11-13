from flask import Flask, jsonify, request
import sqlite3
from flask_cors import CORS
import json

app = Flask(__name__)
CORS(app)
cart_items = []


def get_db_connection():
    conn = sqlite3.connect("flowershop.db")
    conn.row_factory = sqlite3.Row
    return conn


def create_db():
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS flowers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        description TEXT,
        price REAL,
        in_stock INTEGER,
        category TEXT,
        photo_url TEXT,
        rating REAL,
        reviews TEXT
    )
    """)

    cursor.execute("SELECT COUNT(*) FROM flowers")
    if cursor.fetchone()[0] == 0:
        flowers = [
            {
                "name": "Красные розы (11 шт.)",
                "description": "Классический букет из 11 красных роз — символ любви и страсти. Идеален для романтических случаев.",
                "price": 2490.0,
                "in_stock": 15,
                "category": "Розы",
                "photo_url": "https://www.roza4u.ru/image/cache/catalog/pomarosa/25_roz_pomarosa_1-1400x1400.jpg",
                "rating": 4.9,
                "reviews": {
                    "Анна": "Очень свежие и ароматные розы!",
                    "Игорь": "Доставили вовремя, выглядели шикарно."
                }
            },
            {
                "name": "Тюльпаны микс (15 шт.)",
                "description": "Яркий весенний букет из разноцветных тюльпанов. Подходит для любого праздника.",
                "price": 1890.0,
                "in_stock": 22,
                "category": "Тюльпаны",
                "photo_url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR1uu0YgWoMjqFaCYdfJ0TFhG6h-2VBKwFE1w&s",
                "rating": 4.7,
                "reviews": {
                    "София": "Подарила маме — она в восторге!",
                    "Максим": "Красиво оформлены, буду заказывать еще."
                }
            },
            {
                "name": "Подсолнухи (7 шт.)",
                "description": "Солнечный букет из крупных подсолнухов. Символ радости и позитива.",
                "price": 1590.0,
                "in_stock": 10,
                "category": "Летние букеты",
                "photo_url": "https://pro-buket.kz/wp-content/uploads/2023/11/2045471690.webp",
                "rating": 4.8,
                "reviews": {
                    "Катя": "Просто великолепные!",
                    "Олег": "Долго стоят, выглядят круто."
                }
            },
            {
                "name": "Орхидея в горшке",
                "description": "Изящная фиолетовая орхидея в керамическом горшке. Отличный подарок для дома или офиса.",
                "price": 2990.0,
                "in_stock": 8,
                "category": "Комнатные растения",
                "photo_url": "https://luxe-flowers.ru/thumb/2/VNHuIa2Qh45xg4z31amlEg/500r500/d/orkh.jpg",
                "rating": 4.6,
                "reviews": {
                    "Марина": "Очень красиво смотрится на подоконнике!",
                    "Артем": "Цветет уже месяц — доволен."
                }
            }
        ]

        for flower in flowers:
            cursor.execute("""
            INSERT INTO flowers (name, description, price, in_stock, category, photo_url, rating, reviews)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                flower["name"],
                flower["description"],
                flower["price"],
                flower["in_stock"],
                flower["category"],
                flower["photo_url"],
                flower["rating"],
                json.dumps(flower["reviews"])
            ))

        print("✅ Таблица создана и добавлены цветы!")

    conn.commit()
    conn.close()

@app.route("/cart", methods=["GET"])
def get_cart():
    return jsonify(cart_items)

@app.route("/flowers", methods=["GET"])
def get_flowers():
    conn = get_db_connection()
    flowers = conn.execute("SELECT * FROM flowers").fetchall()
    conn.close()

    result = []
    for flower in flowers:
        result.append({
            "id": flower["id"],
            "name": flower["name"],
            "description": flower["description"],
            "price": flower["price"],
            "in_stock": flower["in_stock"],
            "category": flower["category"],
            "photo_url": flower["photo_url"],
            "rating": flower["rating"],
            "reviews": json.loads(flower["reviews"])
        })
    return jsonify(result)


@app.route("/flowers/<int:flower_id>", methods=["GET"])
def get_flower(flower_id):
    conn = get_db_connection()
    flower = conn.execute("SELECT * FROM flowers WHERE id = ?", (flower_id,)).fetchone()
    conn.close()

    if flower is None:
        return jsonify({"error": "Flower not found"}), 404

    result = {
        "id": flower["id"],
        "name": flower["name"],
        "description": flower["description"],
        "price": flower["price"],
        "in_stock": flower["in_stock"],
        "category": flower["category"],
        "photo_url": flower["photo_url"],
        "rating": flower["rating"],
        "reviews": json.loads(flower["reviews"])
    }
    return jsonify(result)


@app.route("/cart", methods=["POST"])
def add_to_cart():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Invalid JSON"}), 400

    flower_id = data.get("flower_id")
    quantity = data.get("quantity", 1)

    if not flower_id:
        return jsonify({"error": "flower_id is required"}), 400

    try:
        flower_id = int(flower_id)
    except ValueError:
        return jsonify({"error": "Invalid flower_id"}), 400

    conn = get_db_connection()
    flower = conn.execute("SELECT * FROM flowers WHERE id = ?", (flower_id,)).fetchone()
    conn.close()

    if flower is None:
        return jsonify({"error": "Flower not found"}), 404

    # Работа с корзиной в памяти
    existing = next((item for item in cart_items if item["id"] == flower["id"]), None)
    if existing:
        existing["quantity"] += quantity
    else:
        cart_items.append({
            "id": flower["id"],
            "name": flower["name"],
            "price": flower["price"],
            "quantity": quantity,
            "photo_url": flower["photo_url"]
        })

    return jsonify({
        "message": f"✅ {quantity} x '{flower['name']}' добавлено в корзину.",
        "item": {
            "id": flower["id"],
            "name": flower["name"],
            "price": flower["price"],
            "quantity": quantity,
            "photo_url": flower["photo_url"]
        }
    })

@app.route("/cart/<int:flower_id>", methods=["DELETE"])
def remove_from_cart(flower_id):
    global cart_items
    cart_items = [item for item in cart_items if item["id"] != flower_id]
    return jsonify({"message": f"Товар с id {flower_id} удалён из корзины."})

if __name__ == "__main__":
    create_db()
    app.run(debug=True)
