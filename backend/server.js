const express = require("express");
const multer = require("multer");
const path = require("path");
const sharp = require("sharp");
const cors = require("cors");
const fs = require("fs");

const app = express();
app.use(cors());

// Set up storage for uploaded images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// Serve uploaded images statically
app.use("/uploads", express.static("uploads"));

// Basic route for root path
app.get("/", (req, res) => {
  res.send("Welcome to the Image Processing Server!");
});

// Image upload endpoint
app.post("/upload", upload.single("image"), (req, res) => {
  const fileUrl = req.file.filename;
  console.log("Uploaded file:", fileUrl); // Debug log
  res.json({ imageUrl: fileUrl });
});

// Image processing endpoint
app.get("/process-image", async (req, res) => {
  const {
    imageUrl,
    brightness = 100,
    hue = 0,
    saturation = 100,
    rotation = 0,
    format = "jpeg",
    quality = 100,
    cropX = 0,
    cropY = 0,
    cropWidth = null,
    cropHeight = null,
  } = req.query;

  console.log("Received imageUrl:", imageUrl); // Debug log
  const inputPath = path.join(__dirname, "uploads", imageUrl);
  console.log("Processing image from path:", inputPath); // Debug log

  // Check if file exists
  if (!fs.existsSync(inputPath)) {
    return res.status(404).send("Image not found.");
  }

  try {
    const image = sharp(inputPath)
      .rotate(Number(rotation))
      .modulate({
        brightness: Number(brightness) / 100,
        saturation: Number(saturation) / 100,
        hue: Number(hue),
      });

    if (cropWidth && cropHeight) {
      image.extract({
        left: Number(cropX),
        top: Number(cropY),
        width: Number(cropWidth),
        height: Number(cropHeight),
      });
    }

    const data = await image
      .toFormat(format, { quality: Number(quality) })
      .toBuffer();
    res.set("Content-Type", `image/${format}`);
    res.send(data);
  } catch (err) {
    console.error("Error processing image:", err);
    res.status(500).send("Error processing image.");
  }
});

// Start the server
app.listen(5000, () => {
  console.log("Server is running on http://localhost:5000");
});
