import React, { useState } from "react";
import axios from "axios";
import ImageEditor from "./ImageEditor";
import "./App.css";

function App() {
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [resetImageEditor, setResetImageEditor] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && (file.type === "image/jpeg" || file.type === "image/png")) {
      setImage(file);
    } else {
      alert("Please upload a JPG or PNG image.");
    }
  };

  const handleUpload = () => {
    if (!image) {
      alert("Please select an image before uploading.");
      return;
    }

    const formData = new FormData();
    formData.append("image", image);

    axios
      .post("http://localhost:5000/upload", formData)
      .then((response) => {
        setImageUrl(response.data.imageUrl);
        setResetImageEditor(true); // Trigger reset in ImageEditor
        setTimeout(() => setResetImageEditor(false), 0); // Reset after component update
      })
      .catch((error) => {
        console.error("Error uploading image:", error);
      });
  };

  return (
    <div className="App">
      <header className="app-header">
        <h1>Welcome to the Image Processing Website</h1>
        <p>
          Upload your image and customize its appearance with real-time
          adjustments for Brightness, Hue, Saturation, and Rotation.
        </p>
      </header>

      <div className="upload-section">
        <input type="file" onChange={handleImageChange} />
        <button onClick={handleUpload}>Upload Image</button>
      </div>

      {imageUrl && <ImageEditor imageUrl={imageUrl} reset={resetImageEditor} />}
    </div>
  );
}

export default App;
