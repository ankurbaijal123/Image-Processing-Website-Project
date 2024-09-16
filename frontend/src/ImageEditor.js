import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

function ImageEditor({ imageUrl, reset }) {
  const [brightness, setBrightness] = useState(100);
  const [hue, setHue] = useState(0);
  const [saturation, setSaturation] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [processedImage, setProcessedImage] = useState(imageUrl);

  // Reset functionality
  useEffect(() => {
    if (reset) {
      setBrightness(100);
      setHue(0);
      setSaturation(100);
      setRotation(0);
    }
  }, [reset]);

  // Fetch processed image based on current settings
  useEffect(() => {
    const fetchProcessedImage = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/process-image",
          {
            params: {
              imageUrl: imageUrl.split("/").pop(),
              brightness,
              hue,
              saturation,
              rotation,
              quality: 20, // Lower quality for preview
            },
            responseType: "blob",
          }
        );
        const imageBlob = URL.createObjectURL(response.data);
        setProcessedImage(imageBlob);
      } catch (error) {
        console.error("Error processing image:", error);
      }
    };

    if (imageUrl) {
      fetchProcessedImage();
    }
  }, [brightness, hue, saturation, rotation, imageUrl]);

  const handleBrightnessChange = (e) => setBrightness(e.target.value);
  const handleHueChange = (e) => setHue(e.target.value);
  const handleSaturationChange = (e) => setSaturation(e.target.value);
  const handleRotationChange = (e) => setRotation(e.target.value);

  const handleDownload = async (format) => {
    if (!imageUrl) {
      alert("Please upload an image before downloading.");
      return;
    }

    try {
      const response = await axios.get("http://localhost:5000/process-image", {
        params: {
          imageUrl: imageUrl.split("/").pop(),
          brightness,
          hue,
          saturation,
          rotation,
          format,
          quality: 100, // Full quality for download
        },
        responseType: "blob",
      });
      const imageBlob = URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = imageBlob;
      link.download = `processed-image.${format}`;
      link.click();
    } catch (error) {
      console.error("Error downloading image:", error);
    }
  };

  const handleReset = () => {
    setBrightness(100);
    setHue(0);
    setSaturation(100);
    setRotation(0);
  };

  return (
    <div className="image-editor">
      <div className="image-container">
        <img src={processedImage} alt="Processed Preview" />
      </div>

      <div className="controls">
        <label>
          Brightness:
          <input
            type="range"
            min="0"
            max="200"
            value={brightness}
            onChange={handleBrightnessChange}
          />
        </label>
        <label>
          Hue:
          <input
            type="range"
            min="0"
            max="360"
            value={hue}
            onChange={handleHueChange}
          />
        </label>
        <label>
          Saturation:
          <input
            type="range"
            min="0"
            max="200"
            value={saturation}
            onChange={handleSaturationChange}
          />
        </label>
        <label>
          Rotation:
          <input
            type="range"
            min="-180"
            max="180"
            value={rotation}
            onChange={handleRotationChange}
          />
        </label>
      </div>

      {/* Download and Reset buttons */}
      <div className="buttons">
        <button className="reset-btn" onClick={handleReset}>
          Reset
        </button>
        <button
          className="download-btn png-btn"
          onClick={() => handleDownload("png")}
        >
          Download PNG
        </button>
        <button
          className="download-btn jpg-btn"
          onClick={() => handleDownload("jpg")}
        >
          Download JPG
        </button>
      </div>
    </div>
  );
}

export default ImageEditor;
