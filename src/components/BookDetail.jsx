import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../static/Main.css";

export default function BookDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`http://127.0.0.1:5000/books/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setBook(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="loading">Загрузка...</p>;
  if (!book) return <p className="error">Книга не найдена 😢</p>;

  return (
    <div className="book-detail">
      <button className="back-btn" onClick={() => navigate("/")}>
        ← Назад
      </button>

      <div className="book-detail-content">
        <img src={book.photo_url} alt={book.title} className="detail-cover" />
        <div className="detail-info">
          <h2>{book.title}</h2>
          <p><strong>Автор:</strong> {book.author}</p>
          <p><strong>Дата публикации:</strong> {book.date_publish}</p>
          <p className="detail-desc">{book.description}</p>
          <div className="detail-rating">⭐ {book.rating}</div>

          <div className="reviews">
            <h4>Отзывы:</h4>
            {Object.entries(book.people_answers).map(([user, text]) => (
              <p key={user}>
                <strong>{user}:</strong> {text}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
