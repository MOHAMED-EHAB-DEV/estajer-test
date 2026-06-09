"use client";

import { useState } from "react";

export default function Home() {
  const [prompt, setPrompt] = useState("What do you see in this image?");
  const [imageBase64, setImageBase64] = useState("");
  const [generatedText, setGeneratedText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Function to handle file selection and conversion to base64
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        // The result contains the base64-encoded string
        setImageBase64(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!imageBase64) {
      alert("Please select an image first.");
      return;
    }

    setIsLoading(true);
    setGeneratedText("");

    try {
      const response = await fetch("/api/products/test/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Send both the text prompt and the base64 image string
        body: JSON.stringify({ prompt, image: imageBase64 }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate text");
      }

      const data = await response.json();
      setGeneratedText(data.text);
    } catch (error) {
      console.error("Error:", error);
      setGeneratedText("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{ maxWidth: "600px", margin: "50px auto", textAlign: "center" }}
    >
      <h1>Google AI Vision in Next.js</h1>

      <h3>1. Select an Image</h3>
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{ marginBottom: "20px" }}
      />

      {/* Optional: Display a preview of the selected image */}
      {imageBase64 && (
        <div>
          <h4>Image Preview:</h4>
          <img
            src={imageBase64}
            alt="Selected preview"
            style={{ maxWidth: "100%", height: "auto", borderRadius: "5px" }}
          />
        </div>
      )}

      <h3 style={{ marginTop: "20px" }}>2. Ask a Question</h3>
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        rows={2}
        style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
      />

      {/* <button
        onClick={handleGenerate}
        disabled={isLoading || !imageBase64}
        style={{ padding: "10px 20px" }}
      >
        {isLoading ? "Analyzing..." : "Analyze Image"}
      </button> */}

      {generatedText && (
        <div
          style={{
            marginTop: "20px",
            padding: "20px",
            border: "1px solid #ccc",
            borderRadius: "5px",
            textAlign: "left",
          }}
        >
          <h2>AI Response:</h2>
          <p>{generatedText}</p>
        </div>
      )}
    </div>
  );
}
