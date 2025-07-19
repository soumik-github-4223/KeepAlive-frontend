"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { FiTrash2 } from "react-icons/fi";

type ApiEntry = {
  _id: string;
  url: string;
};

export default function HomePage() {
  const [urls, setUrls] = useState<ApiEntry[]>([]);
  const [newUrl, setNewUrl] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [deletePassword, setDeletePassword] = useState("");
  const [deletingId, setDeletingId] = useState("");
  const [showDeleteInput, setShowDeleteInput] = useState<{
    [key: string]: boolean;
  }>({});

  useEffect(() => {
    axios
      .get("https://keepalive-backend.onrender.com/api/urls")
      .then((res) => setUrls(res.data))
      .catch((err) => console.error(err));
  }, []);

  const isValidUrl = (url: string) => {
    // Basic URL validation (http/https)
    return /^(https?:\/\/)[^\s$.?#].[^\s]*$/.test(url);
  };

  const handleAdd = async () => {
    if (!newUrl || !newPassword)
      return alert("Please enter both URL and password.");
    if (!isValidUrl(newUrl))
      return alert(
        "Please enter a valid URL (must start with http:// or https://)."
      );
    try {
      await axios.post("https://keepalive-backend.onrender.com/api/urls", {
        url: newUrl,
        password: newPassword,
      });
      setNewUrl("");
      setNewPassword("");
      alert(
        "Remember the password given. If you wish to delete your endpoint, use the same password to delete."
      );
      // Refresh list
      const res = await axios.get(
        "https://keepalive-backend.onrender.com/api/urls"
      );
      setUrls(res.data);
    } catch (err) {
      alert("Failed to add URL");
    }
  };

  const handleDelete = async (id: string) => {
    const entry = urls.find((e) => e._id === id);
    if (!entry) return alert("Entry not found!");
    if (!deletePassword) return alert("Please enter password to delete.");
    try {
      await axios.delete(
        `https://keepalive-backend.onrender.com/api/urls/delete`,
        {
          data: { url: entry.url, password: deletePassword },
        }
      );
      setUrls((prev) => prev.filter((e) => e._id !== id));
      setShowDeleteInput((prev) => ({ ...prev, [id]: false }));
      setDeletePassword("");
      setDeletingId("");
    } catch (err) {
      alert("Wrong password or deletion failed!");
    }
  };

  return (
    <main className="min-h-screen bg-white p-8 flex flex-col items-center">
      <div className="w-full max-w-xl">
        {/* App Name & Description */}
        <section className="mb-10 text-center">
          <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-500 to-pink-500 mb-4 tracking-tight drop-shadow-lg">
            KeepAlive
          </h1>
          <p className="text-gray-700 text-lg mx-auto px-2 py-3 rounded-xl bg-gradient-to-br from-indigo-50 via-white to-pink-50 shadow-sm border border-gray-100 w-full md:max-w-3xl md:px-8 md:py-6 md:text-xl text-center">
            <span className="font-semibold text-indigo-700">KeepAlive</span>{" "}
            helps developers keep their apps awake on platforms like{" "}
            <span className="font-semibold text-purple-600">Render</span> by
            automatically pinging your endpoints every{" "}
            <span className="font-semibold text-pink-600">10 minutes</span>.
            <br />
            Just add your app’s URL below and never worry about sleep mode
            again!
          </p>
        </section>

        {/* Add API Form */}
        <section className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 mb-10">
          <h2 className="text-2xl font-extrabold text-gray-900 mb-6 tracking-tight">
            Add Your Endpoint
          </h2>
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <input
              type="text"
              placeholder="Enter URL"
              className="border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition w-full md:w-2/3 placeholder:text-gray-400 bg-gray-50 text-gray-900"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
            />
            <input
              type="text"
              placeholder="New password"
              className="border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition w-full md:w-1/3 placeholder:text-gray-400 bg-gray-50 text-gray-900"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <button
              onClick={handleAdd}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3 rounded-xl shadow-lg transition w-full md:w-auto"
            >
              Add
            </button>
          </div>
        </section>

        {/* List of APIs */}
        <section className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
          <h2 className="text-2xl font-extrabold text-gray-900 mb-6 tracking-tight">
            Already Added Endpoints
          </h2>
          {urls.length === 0 ? (
            <div className="text-gray-400 text-center py-10 text-lg">
              No APIs added yet. Use the form above to get started!
            </div>
          ) : (
            <ul className="space-y-6">
              {urls.map((entry) => (
                <li
                  key={entry._id}
                  className="flex flex-col md:flex-row md:items-center justify-between bg-gray-50 border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition"
                >
                  <div className="flex-1">
                    <span className="block text-xs text-gray-500 mb-1">
                      URL
                    </span>
                    <span className="font-mono text-indigo-700 break-all text-base">
                      {entry.url}
                    </span>
                  </div>
                  <div className="mt-4 md:mt-0 md:ml-6 flex flex-col md:flex-row items-center gap-2">
                    {!showDeleteInput[entry._id] ? (
                      <button
                        onClick={() => {
                          setShowDeleteInput((prev) => ({
                            ...prev,
                            [entry._id]: true,
                          }));
                          setDeletingId(entry._id);
                        }}
                        className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-xl font-bold shadow transition flex items-center gap-2"
                        title="Delete"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    ) : (
                      <>
                        <input
                          type="text"
                          placeholder="Password"
                          className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:border-indigo-400 transition w-40 placeholder:text-gray-400 bg-gray-50 text-gray-900"
                          value={deletingId === entry._id ? deletePassword : ""}
                          onChange={(e) => {
                            setDeletePassword(e.target.value);
                            setDeletingId(entry._id);
                          }}
                        />
                        <button
                          onClick={() => handleDelete(entry._id)}
                          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl font-bold shadow transition"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => {
                            setShowDeleteInput((prev) => ({
                              ...prev,
                              [entry._id]: false,
                            }));
                            setDeletePassword("");
                            setDeletingId("");
                          }}
                          className="text-gray-500 hover:text-gray-700 px-2 py-2 rounded transition font-medium"
                        >
                          Cancel
                        </button>
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Forgot password note */}
        <section className="mt-10 text-center">
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5 text-yellow-900 text-base shadow-sm max-w-xl mx-auto">
            <strong>Note:</strong> If you forgot your password and want to
            remove your endpoint from being pinged every 10 minutes, please send
            an email to{" "}
            <a
              href="mailto:soumiksaha8420@gmail.com"
              className="underline text-indigo-700"
            >
              soumiksaha8420@gmail.com
            </a>{" "}
            with your URL.
          </div>
        </section>
      </div>
      {/* Developer Information */}
      <footer className="mt-16 w-full flex justify-center">
        <div className="bg-gradient-to-r from-indigo-50 via-white to-pink-50 border border-gray-200 rounded-2xl p-6 text-gray-800 text-base shadow-lg max-w-xl w-full mx-auto flex flex-col items-center gap-3">
          <span className="font-semibold text-lg text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-500 to-pink-500 drop-shadow">
            Developed by Soumik Saha
          </span>
          <div className="flex gap-6 justify-center mt-2">
            <a
              href="https://www.linkedin.com/in/soumik-saha-profile/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 underline font-medium transition"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                fill="currentColor"
                viewBox="0 0 24 24"
                className="inline-block"
              >
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.761 0 5-2.239 5-5v-14c0-2.761-2.239-5-5-5zm-11 19h-3v-10h3v10zm-1.5-11.268c-.966 0-1.75-.784-1.75-1.75s.784-1.75 1.75-1.75 1.75.784 1.75 1.75-.784 1.75-1.75 1.75zm13.5 11.268h-3v-5.604c0-1.337-.027-3.063-1.867-3.063-1.868 0-2.155 1.459-2.155 2.967v5.7h-3v-10h2.881v1.367h.041c.401-.759 1.379-1.559 2.841-1.559 3.037 0 3.6 2.001 3.6 4.604v5.588z" />
              </svg>
              LinkedIn
            </a>
            <a
              href="https://github.com/soumik-github-4223"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-gray-700 hover:text-black underline font-medium transition"
            >
              <svg
                width="20"
                height="20"
                fill="currentColor"
                className="inline-block"
              >
                <path d="M10 1C4.5 1 0 5.5 0 11c0 4.4 2.9 8.1 6.9 9.4.5.1.7-.2.7-.5v-1.7c-2.8.6-3.4-1.3-3.4-1.3-.4-1-1-1.3-1-1.3-.8-.6.1-.6.1-.6.9.1 1.4.9 1.4.9.8 1.4 2.1 1 2.6.8.1-.6.3-1 .5-1.2-2.2-.3-4.5-1.1-4.5-4.9 0-1.1.4-2 1-2.7-.1-.3-.4-1.3.1-2.7 0 0 .8-.3 2.8 1 .8-.2 1.7-.3 2.6-.3s1.8.1 2.6.3c2-.1 2.8-1 2.8-1 .5 1.4.2 2.4.1 2.7.6.7 1 1.6 1 2.7 0 3.8-2.3 4.6-4.5 4.9.3.3.6.8.6 1.7v2.5c0 .3.2.6.7.5C17.1 19.1 20 15.4 20 11c0-5.5-4.5-10-10-10z" />
              </svg>
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
