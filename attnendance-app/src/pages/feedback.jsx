
import { useState } from "react";
const API_BASE = import.meta.env.VITE_API_URL;

// Simple regex for email validation
const isValidEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
  return regex.test(email);
};

export default function FeedbackForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ Client-side email validation
    if (!isValidEmail(formData.email)) {
      setStatus("❌ Please enter a valid email address.");
      return;
    }

    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) =>
      data.append(key, value)
    );
    if (file) data.append("file", file);

    try {
      const response = await fetch(`${API_BASE}/contact/`, {
        method: "POST",
        body: data,
      });

      if (response.ok) {
        setStatus("✅ Your message has been sent successfully!");
        setFormData({ name: "", email: "", subject: "", message: "" });
        setFile(null);
      } else {
        setStatus("❌ Failed to send message. Please try again.");
      }
    } catch (error) {
      console.error("Error:", error);
      setStatus("❌ Something went wrong!");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="w-full max-w-2xl bg-white shadow-2xl rounded-2xl p-8">
        <h2 className="text-3xl font-extrabold text-gray-800 mb-2 text-center">
          Contact Us
        </h2>
        <p className="text-gray-500 text-center mb-6">
          We'd love to hear from you! Fill out the form below and we'll get back
          to you soon.
        </p>

        {status && (
          <p
            className={`mb-4 text-sm text-center font-medium ${
              status.startsWith("✅")
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            {status}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Name
            </label>
            <input
              type="text"
              name="name"
              placeholder="Your Name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              placeholder="Your Email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full p-3 border rounded-lg shadow-sm focus:outline-none transition ${
                formData.email && !isValidEmail(formData.email)
                  ? "border-red-500 focus:ring-red-500"
                  : "focus:ring-2 focus:ring-blue-500"
              }`}
              required
            />
            {formData.email && !isValidEmail(formData.email) && (
              <p className="text-red-500 text-xs mt-1">
                Please enter a valid email address.
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Subject
            </label>
            <input
              type="text"
              name="subject"
              placeholder="Subject"
              value={formData.subject}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Message
            </label>
            <textarea
              name="message"
              placeholder="Your Message"
              value={formData.message}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg shadow-sm h-32 resize-none focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
              required
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Upload File (optional)
            </label>
            <input
              type="file"
              name="file"
              onChange={handleFileChange}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 
                         file:rounded-full file:border-0 
                         file:text-sm file:font-semibold 
                         file:bg-blue-50 file:text-blue-700 
                         hover:file:bg-blue-100"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold shadow-md hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500 transition"
          >
            Send Message
          </button>
        </form>
      </div>
    </div>
  );
}
