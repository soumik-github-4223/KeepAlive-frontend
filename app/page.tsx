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
      .get("http://localhost:5000/api/urls")
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
      await axios.post("http://localhost:5000/api/urls", {
        url: newUrl,
        password: newPassword,
      });
      setNewUrl("");
      setNewPassword("");
      // Refresh list
      const res = await axios.get("http://localhost:5000/api/urls");
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
      await axios.delete(`http://localhost:5000/api/urls/delete`, {
        data: { url: entry.url, password: deletePassword },
      });
      setUrls((prev) => prev.filter((e) => e._id !== id));
      setShowDeleteInput((prev) => ({ ...prev, [id]: false }));
      setDeletePassword("");
      setDeletingId("");
    } catch (err) {
      alert("Wrong password or deletion failed!");
    }
  };

  // ...existing code...
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
              placeholder="Password"
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
      </div>
    </main>
  );
  // ...existing
}
