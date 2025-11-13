import { useEffect, useState } from "react";
import "../static/Main.css";

export default function Main({ cart, setCart }) {
  const [flowers, setFlowers] = useState([]);
  const [flower, setFlower] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState("home"); // home | flower | cart
  const [addedToCart, setAddedToCart] = useState(false);

  // --- Загружаем все цветы ---
  useEffect(() => {
    fetch("http://127.0.0.1:5000/flowers")
      .then(res => res.json())
      .then(data => {
        setFlowers(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Не удалось загрузить каталог 😢");
        setLoading(false);
      });
  }, []);

  // --- Отслеживаем hash для навигации ---
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;

      if (hash.startsWith("#flower/")) {
        const id = hash.split("/")[1];
        loadFlower(id);
        setPage("flower");
      } else if (hash === "#cart") {
        setPage("cart");
        loadCart(); // загружаем корзину с бекенда
      } else {
        setPage("home");
        setFlower(null);
      }
    };

    window.addEventListener("hashchange", handleHashChange);
    handleHashChange();
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  // --- Загрузка конкретного цветка ---
  const loadFlower = (id) => {
    setLoading(true);
    fetch(`http://127.0.0.1:5000/flowers/${id}`)
      .then(res => res.json())
      .then(data => {
        setFlower(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Не удалось загрузить информацию о цветке 😢");
        setLoading(false);
      });
  };

  const openFlower = (id) => {
    window.location.hash = `flower/${id}`;
  };

  const goHome = () => {
    window.location.hash = "";
  };

  const goCart = () => {
    window.location.hash = "#cart";
  };

  // --- Загрузка корзины с backend ---
  const loadCart = () => {
    fetch("http://127.0.0.1:5000/cart")
      .then(res => res.json())
      .then(data => {
        setCart(data); // заменяем локальную корзину данными с сервера
      })
      .catch(() => {
        alert("Ошибка при загрузке корзины с сервера 😢");
      });
  };

  // --- Добавление в корзину через backend ---
  const addToCart = (flowerId) => {
    fetch("http://127.0.0.1:5000/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ flower_id: flowerId, quantity: 1 })
    })
      .then(res => res.json())
      .then(data => {
        loadCart(); // сразу обновляем корзину с сервера
        setAddedToCart(true);
      })
      .catch(() => alert("Ошибка при добавлении в корзину"));
  };

  // --- Страница каталога ---
  if (page === "home") {
    return (
      <main className="books-container">
        <div className="catalog-header">
          <h1 className="title">Каталог цветов</h1>
          <button className="cart-btn" onClick={goCart}>🛒 Корзина ({cart.length})</button>
        </div>

        {loading && <p className="loading">Загрузка...</p>}
        {error && <p className="error">{error}</p>}

        {!loading && !error && (
          <div className="books-grid">
            {flowers.map((f) => (
              <div
                className="book-card"
                key={f.id}
                onClick={() => openFlower(f.id)}
              >
                <div className="cover-wrapper">
                  <img src={f.photo_url} alt={f.name} className="book-cover" />
                </div>
                <div className="book-info">
                  <h3 className="book-title">{f.name}</h3>
                  <p className="book-desc">{f.description}</p>
                  <div className="book-rating">⭐ {f.rating.toFixed(1)}</div>
                  <div className="book-author">Цена: {f.price} ₽</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    );
  }

  // --- Страница цветка ---
  if (page === "flower") {
    if (loading) return <p className="loading">Загрузка цветка...</p>;
    if (error) return <p className="error">{error}</p>;
    if (!flower) return <p>Цветок не найден.</p>;

    return (
      <div className="book-detail">
        <button className="back-btn" onClick={goHome}>← Назад</button>

        <div className="book-detail-content">
          <img src={flower.photo_url} alt={flower.name} className="detail-cover" />
          <div className="detail-info">
            <h2>{flower.name}</h2>
            <p><strong>Категория:</strong> {flower.category}</p>
            <p className="detail-desc">{flower.description}</p>
            <p><strong>Цена:</strong> {flower.price} </p>
            <div className="detail-rating">⭐ {flower.rating.toFixed(1)}</div>

            <button
              className="read-btn"
              onClick={() => addToCart(flower.id)}
              disabled={addedToCart}
            >
              {addedToCart ? "В корзине" : "Добавить в корзину"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- Страница корзины ---
  if (page === "cart") {
    return (
      <div className="cart-page">
        <button className="back-btn" onClick={goHome}>← Назад</button>
        <h1>🛍 Ваша корзина</h1>

        {cart.length === 0 ? (
          <p>Корзина пуста 🌸</p>
        ) : (
          <div className="cart-list">
            {cart.map(item => (
              <div key={item.id} className="cart-item">
                <img src={item.photo_url} alt={item.name} />
                <div>
                  <h3>{item.name}</h3>
                  <p>Цена: {item.price} ₽</p>
                  <p>Количество: {item.quantity}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return null;
}
