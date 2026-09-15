import { useState } from "react";
import Logout from "./logout";
import { apiFetch } from "./api"; // assuming you have this helper

export default function ResetPassword() {
  const [oldPw, setOldPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [message, setMessage] = useState("");

  const email = localStorage.getItem("email");

;
const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const res = await apiFetch(
      `/reset_password/${email}`,
      "PUT",
      { old_pw: oldPw, new_pw: newPw }
    );
    setMessage(res.message || "Password updated successfully!");
    setOldPw("");
    setNewPw("");
  } catch (err) {
    console.error(err);
    setMessage("Error resetting password");
  }
};


  return (
    <div className="p-6 max-w-lg mx-auto">
      {/* Navbar with Logout */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold">Reset Password {email}</h1>
        <Logout />
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4 bg-gray-100 p-6 rounded-lg shadow">
        <div>
          <label className="block text-sm font-medium mb-1">Old Password</label>
          <input
            type="password"
            value={oldPw}
            onChange={(e) => setOldPw(e.target.value)}
            required
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">New Password</label>
          <input
            type="password"
            value={newPw}
            onChange={(e) => setNewPw(e.target.value)}
            required
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Update Password
        </button>
      </form>

      {/* Status message */}
      {message && <p className="mt-4 text-center text-sm">{message}</p>}
    </div>
  );
}



