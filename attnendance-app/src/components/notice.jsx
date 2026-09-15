

import { apiFetch } from "../components/api";
import Logout from "../components/logout";
import { useEffect, useState, useRef } from "react";
import {
  FiTrash2,
  FiBold,
  FiItalic,
  FiUnderline,
  FiList,
  FiRotateCcw,
  FiRotateCw,
} from "react-icons/fi";

const API_BASE = import.meta.env.VITE_API_URL;

export default function Notice() {
  const [department, setDepartment] = useState([]);
  const [selectedDept, setSelectedDept] = useState("");
  const [notices, setNotices] = useState([]);
  const [files, setFiles] = useState([]);
  const [activeFormats, setActiveFormats] = useState({});
  const email = localStorage.getItem("email");

  const editorRef = useRef(null);

  useEffect(() => {
    apiFetch(`/department_students`)
      .then((data) => setDepartment(data))
      .catch((err) => console.error(err));

    fetchNotices();
  }, [email]);

  const fetchNotices = async () => {
    try {
      const data = await apiFetch(`/notice/history/${email}`);
      setNotices(data);
    } catch (err) {
      console.error(err);
    }
  };

  // --- FORMAT FUNCTIONS ---
  const applyFormat = (command, value = null) => {
    document.execCommand(command, false, value);
    updateActiveFormats();
  };



  const updateActiveFormats = () => {
    setActiveFormats({
      bold: document.queryCommandState("bold"),
      italic: document.queryCommandState("italic"),
      underline: document.queryCommandState("underline"),
      insertUnorderedList: document.queryCommandState("insertUnorderedList"),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const content = editorRef.current.innerHTML; // capture formatted text

    const formData = new FormData();
    formData.append("email", email);
    formData.append("Did", selectedDept);
    formData.append("content", content);
    if (files.length > 0) {
      formData.append("file", files[0]);
    }

    try {
      await apiFetch(`/notice/`, "POST", formData, true);
      alert("Notice created successfully!");
      editorRef.current.innerHTML = "";
      setFiles([]);
      setSelectedDept("");
      fetchNotices();
    } catch (err) {
      console.error(err);
      alert("Error creating notice: " + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this notice?")) return;
    try {
      await apiFetch(`/notice/${id}`, "DELETE");
      setNotices((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      console.error(err);
      alert("Error deleting notice: " + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">📝 Notice Board</h2>
        <Logout />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Notice History */}
        <div className="bg-slate-800 rounded-2xl shadow-xl border border-slate-700 p-6">
          <h3 className="text-xl font-semibold mb-4 text-yellow-400">
            Your Notice History
          </h3>

          {notices.length === 0 ? (
            <div className="text-center text-gray-400 py-10">
              No notices posted yet.
            </div>
          ) : (
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 custom-scroll">
              {notices.map((notice) => (
                <div
                  key={notice.id}
                  className="p-4 bg-slate-700 rounded-xl shadow hover:shadow-lg transition relative"
                >
                  {/* Delete Button */}
                  <button
                    onClick={() => handleDelete(notice.id)}
                    className="absolute top-3 right-3 text-red-400 hover:text-red-300"
                    title="Delete Notice"
                  >
                    <FiTrash2 size={18} />
                  </button>

                  <div
                    className="text-gray-200 prose prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: notice.content }}
                  />
                  <p className="text-sm text-gray-400 mt-2">
                    Department: {notice.dep} | Date: {notice.date_time}
                  </p>
                  {notice.file ? (
                    <a
                      href={`${API_BASE}/notice/image/${notice.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mt-3 px-3 py-1 text-sm bg-blue-600 rounded-lg hover:bg-blue-500 transition"
                    >
                      📎 Download File
                    </a>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Create Notice Form */}
        <div className="bg-slate-800 rounded-2xl shadow-xl border border-slate-700 p-6">
          <h3 className="text-xl font-semibold mb-4 text-green-400">
            Create New Notice
          </h3>
          <p className="text-gray-400 mb-6">
            Logged in as: <span className="font-medium">{email}</span>
          </p>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Department Dropdown */}
            <div>
              <label
                htmlFor="dept"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Select Department:
              </label>
              <select
                id="dept"
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="w-full rounded-lg border-gray-600 bg-slate-900 text-gray-200 p-2"
                required
              >
                <option value="">-- Select --</option>
                {department.map((data, index) => (
                  <option key={index} value={data.id}>
                    {data.dep}
                  </option>
                ))}
              </select>
            </div>

            {/* Rich Text Editor */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Notice Content:
              </label>

              {/* Toolbar */}
              <div className="flex flex-wrap gap-2 mb-2 bg-slate-700 p-2 rounded-lg">
                <button
                  type="button"
                  onClick={() => applyFormat("bold")}
                  className={`toolbar-btn ${
                    activeFormats.bold ? "bg-green-600" : ""
                  }`}
                  title="Bold"
                >
                  <FiBold />
                </button>
                <button
                  type="button"
                  onClick={() => applyFormat("italic")}
                  className={`toolbar-btn ${
                    activeFormats.italic ? "bg-green-600" : ""
                  }`}
                  title="Italic"
                >
                  <FiItalic />
                </button>
                <button
                  type="button"
                  onClick={() => applyFormat("underline")}
                  className={`toolbar-btn ${
                    activeFormats.underline ? "bg-green-600" : ""
                  }`}
                  title="Underline"
                >
                  <FiUnderline />
                </button>
                <button
                  type="button"
                  onClick={() => applyFormat("insertUnorderedList")}
                  className={`toolbar-btn ${
                    activeFormats.insertUnorderedList ? "bg-green-600" : ""
                  }`}
                  title="Bullet List"
                >
                  <FiList />
                </button>

                {/* Text Color Picker */}
                <input
                  type="color"
                  onChange={(e) => applyFormat("foreColor", e.target.value)}
                  className="w-8 h-8 cursor-pointer border-none rounded"
                  title="Text Color"
                />

                <button
                  type="button"
                  onClick={() => applyFormat("undo")}
                  className="toolbar-btn"
                  title="Undo"
                >
                  <FiRotateCcw />
                </button>
                <button
                  type="button"
                  onClick={() => applyFormat("redo")}
                  className="toolbar-btn"
                  title="Redo"
                >
                  <FiRotateCw />
                </button>
              </div>

              {/* Editable Area */}
              <div
                ref={editorRef}
                contentEditable
                onKeyUp={updateActiveFormats}
                onMouseUp={updateActiveFormats}
                className="w-full min-h-[150px] p-3 rounded-lg border border-gray-600 bg-slate-900 text-gray-200 focus:outline-none prose prose-invert max-w-none overflow-y-auto custom-scroll"
              ></div>
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Attach File: (optional)
              </label>
              <input
                type="file"
                onChange={(e) => setFiles(e.target.files)}
                className="block w-full text-sm text-gray-400 border border-gray-600 rounded-lg cursor-pointer bg-slate-900"
              />{" "}
              *less than 60kB
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-green-600 text-white py-2 px-4 rounded-lg shadow hover:bg-green-500 focus:ring-2 focus:ring-green-400 transition"
            >
              🚀 Submit Notice
            </button>
          </form>
        </div>
      </div>

      {/* Custom CSS */}
      <style>
        {`
          .toolbar-btn {
            @apply p-2 rounded bg-slate-600 hover:bg-slate-500 transition text-white;
          }
          .custom-scroll::-webkit-scrollbar {
            width: 6px;
          }
          .custom-scroll::-webkit-scrollbar-thumb {
            background-color: #4b5563;
            border-radius: 3px;
          }
          .custom-scroll::-webkit-scrollbar-track {
            background: transparent;
          }
        `}
      </style>
    </div>
  );
}
