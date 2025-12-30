import React from "react";

export default function ResponsePanel({ response }) {
  return (
    <div style={{ border: "1px solid #ddd", padding: 12, borderRadius: 8, minHeight: 320 }}>
      <h3>AI Response</h3>
      {!response ? (
        <div style={{ color: "#666" }}>No lesson yet. Submit a prompt to generate one.</div>
      ) : (
        <>
          <div style={{ fontSize: 12, color: "#666", marginBottom: 8 }}>
            Created: {new Date(response.createdAt).toLocaleString()}
          </div>
          <pre style={{ whiteSpace: "pre-wrap", fontFamily: "inherit" }}>{response.response}</pre>
        </>
      )}
    </div>
  );
}
