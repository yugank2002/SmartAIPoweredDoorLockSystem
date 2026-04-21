import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL, getPhotoUrl } from "../config";

export default function RegisterFace() {
  const [user, setUser] = useState(null);
  const [name, setName] = useState("");
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [status, setStatus] = useState(null);
  const [faces, setFaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserAndFaces();
  }, []);

  async function fetchUserAndFaces() {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
        credentials: "include",
      });
      if (res.ok) {
        setUser(await res.json());
      }
    } catch (err) {
      console.error(err);
    }

    await fetchFaces();
  }

  async function fetchFaces() {
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/faces`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setFaces(data.faces || []);
      }
    } catch (err) {
      console.error(err);
    }
  }

  function handleFileChange(e) {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onload = (event) => {
        setFilePreview(event.target.result);
      };
      reader.readAsDataURL(selectedFile);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus(null);

    if (!file) {
      setStatus("Please select a photo");
      return;
    }

    if (!name.trim()) {
      setStatus("Please enter visitor name");
      return;
    }

    setLoading(true);
    const form = new FormData();
    form.append("visitor_name", name);
    form.append("face_image", file);

    try {
      const userId = user?._id;
      if (!userId) {
        setStatus("Unable to determine user ID");
        return;
      }

      const res = await fetch(`${API_BASE_URL}/api/users/${userId}/faces`, {
        method: "POST",
        credentials: "include",
        body: form,
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus(data.error || `Error: ${res.status}`);
        return;
      }

      setStatus("✓ Visitor registered successfully!");
      setName("");
      setFile(null);
      setFilePreview(null);
      await fetchFaces();
    } catch (err) {
      setStatus("An error occurred: " + String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <h2>Register Visitor</h2>

      {user && (
        <p style={{ marginBottom: 24, color: "#666" }}>
          Signed in as: <strong>{user.fullname}</strong> ({user.email})
        </p>
      )}

      <form className="form" onSubmit={handleSubmit}>
        <label>
          <span>Visitor Name</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., John Doe"
            required
          />
        </label>
        <label>
          <span>Visitor Photo</span>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            required
          />
        </label>
        {filePreview && (
          <div className="photo-preview">
            <p>Preview:</p>
            <img src={filePreview} alt="preview" />
          </div>
        )}
        {status && (
          <div
            className={status.startsWith("✓") ? "success" : "error"}
            style={{
              marginTop: 8,
            }}
          >
            {status}
          </div>
        )}
        <button type="submit" disabled={loading}>
          {loading ? "Registering..." : "Register Visitor"}
        </button>
      </form>

      <section style={{ marginTop: 40 }}>
        <h3>Registered Visitors</h3>
        {faces.length === 0 ? (
          <p>No visitors registered yet.</p>
        ) : (
          <div className="photo-grid">
            {faces.map((face) => (
              <div key={face.id} className="photo-card">
                <div className="photo-card-image">
                  {face.face_url ? (
                    <img
                      src={getPhotoUrl(face.face_url)}
                      alt={face.name}
                      onError={(e) => {
                        console.error("Failed to load image:", face.face_url);
                        e.target.style.display = "none";
                      }}
                    />
                  ) : (
                    <span>No photo</span>
                  )}
                </div>
                <div className="photo-card-content">
                  <h4>{face.name}</h4>
                  <p>Added: {new Date(face.created_at).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}