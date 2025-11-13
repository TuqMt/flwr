export default function Cart({ cart, setCart }) {
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const removeFromCart = async (id) => {
    try {
      const res = await fetch(`http://127.0.0.1:5000/cart/${id}`, {
        method: "DELETE"
      });
      if (!res.ok) throw new Error("Ошибка удаления");
      setCart(cart.filter(f => f.id !== id));
    } catch (err) {
      alert("Не удалось удалить товар из корзины");
      console.error(err);
    }
  };

  if (cart.length === 0) {
    return (
      <div style={{ padding: "2rem", textAlign: "center", fontFamily: "sans-serif", color: "#555" }}>
        <h1 style={{ fontSize: "2rem" }}>🛒 Ваша корзина пуста</h1>
        <p style={{ fontSize: "1.2rem", marginTop: "1rem" }}>Добавьте красивые букеты из каталога 🌸</p>
      </div>
    );
  }

  return (
    
    <div
        style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "100vh", // заполняет весь экран
            maxWidth: "800px",
            margin: "0 auto",
            padding: "2rem"
        }}
        >

      <h1 style={{ textAlign: "center", marginBottom: "2rem" , color:"#222"}}>🛒 Ваша корзина</h1>
      {cart.map((item) => (
        <div 
          key={item.id} 
          style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: "1rem", 
            borderBottom: "1px solid #eee", 
            padding: "1rem 0" 
          }}
        >
          <img src={item.photo_url} alt={item.name} style={{ width: "80px", height: "80px", objectFit: "cover", borderRadius: "8px" }} />
          <div style={{ flexGrow: 1 }}>
            <h3 style={{ margin: "0 0 0.3rem 0", color:"#222"}}>{item.name}</h3>
            <p style={{ margin: "0.2rem 0" , color:"#222"}}>Цена: {item.price} ₽</p>
            <p style={{ margin: "0.2rem 0" , color:"#222"}}>Количество: {item.quantity}</p>
          </div>
          <button 
            onClick={() => removeFromCart(item.id)} 
            style={{
              padding: "0.5rem 0.8rem",
              backgroundColor: "#f44336",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "1rem",
              height: "40px"
            }}
          >
            ❌ Удалить
          </button>
        </div>
      ))}
      <h2 style={{ textAlign: "right", marginTop: "2rem", fontSize: "1.5rem", color:"#222"   }}>💰 Итого: {total} </h2>
    </div>
  );
}
