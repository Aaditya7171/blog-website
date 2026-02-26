import { useEffect, useState } from "react";
import { API } from "./api.js";

function App() {
  const [posts, setPosts] = useState([]);
  const [search, setSearch] = useState("");

  const fetchPosts = async () => {
    const res = await API.get(`/posts?search=${search}`);
    setPosts(res.data);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <div style={styles.page}>
      <h1 style={styles.heading}>Blog System</h1>
      <div style={styles.searchBox}>
        <input
          style={styles.input}
          placeholder="Search posts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button
          style={styles.button}
          onClick={fetchPosts}
        >
          Search
        </button>
      </div>


      <div style={styles.postContainer}>
        {posts.map((post) => (
          <div
            key={post.id}
            style={styles.card}
          >
            <h2 style={styles.title}>{post.title}</h2>
            <p style={styles.content}>{post.content}</p>
            <small style={styles.tags}>{post.tags?.join(", ")}</small>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  page: {
    backgroundColor: "#f8f5ff",
    minHeight: "100vh",
    padding: 40,
    fontFamily: "Arial",
  },
  heading: {
    color: "#6b2dcf",
  },
  searchBox: {
    marginTop: 20,
    display: "flex",
    gap: 10,
  },
  input: {
    padding: 10,
    borderRadius: 6,
    border: "1px solid #ddd",
    width: 250,
  },
  button: {
    backgroundColor: "#5b21b6",
    color: "white",
    border: "none",
    padding: "10px 16px",
    borderRadius: 6,
    cursor: "pointer",
  },
  postContainer: {
    marginTop: 30,
  },
  card: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    marginBottem: 20,
    boxShadow: "0 5px 15px rgba(0,0,0,0.08)",
  },
  title: {
    color: "#4c1d95"

  },
  content: {
    marginTop: 10,
  },
  tags: {
    color: "#6b7280",
  },





}

export default App;

