import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";

export default function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({ role: "", skills: "" });
  const [searchQuery, setSearchQuery] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/auth/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        setUsers(data.users || data); // Handle both response formats
        setFilteredUsers(data.users || data);
      } else {
        console.error(data.error);
      }
    } catch (err) {
      console.error("Error fetching users", err);
    }
  };

  const handleEditClick = (user) => {
    setEditingUser(user.email);
    setFormData({
      role: user.role,
      skills: user.skills?.join(", ") || "",
    });
  };

  const handleUpdate = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SERVER_URL}/auth/update-user`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            email: editingUser,
            role: formData.role,
            skills: formData.skills
              .split(",")
              .map((skill) => skill.trim())
              .filter(Boolean),
          }),
        }
      );

      const data = await res.json();
      if (!res.ok) {
        console.error(data.error || "Failed to update user");
        return;
      }

      setEditingUser(null);
      setFormData({ role: "", skills: "" });
      fetchUsers();
    } catch (err) {
      console.error("Update failed", err);
    }
  };

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    setFilteredUsers(
      users.filter((user) => user.email.toLowerCase().includes(query))
    );
  };

  return (
    <>
      <Navbar />
      <div className="max-w-4xl mx-auto mt-10 p-4">
        <h1 className="text-3xl font-bold mb-6">Admin Panel - Manage Users</h1>
        <input
          type="text"
          className="input input-bordered w-full mb-6"
          placeholder="Search by email"
          value={searchQuery}
          onChange={handleSearch}
        />
        {filteredUsers.map((user) => (
          <div
            key={user._id}
            className="bg-base-200 shadow-lg rounded-lg p-6 mb-4 border border-base-300"
          >
            <p className="mb-2">
              <strong>Email:</strong> {user.email}
            </p>
            <p className="mb-2">
              <strong>Current Role:</strong>{" "}
              <span className="badge badge-primary">{user.role}</span>
            </p>
            <p className="mb-2">
              <strong>Skills:</strong>{" "}
              {user.skills && user.skills.length > 0
                ? user.skills.join(", ")
                : "N/A"}
            </p>

            {editingUser === user.email ? (
              <div className="mt-4 space-y-2">
                <select
                  className="select select-bordered w-full"
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                >
                  <option value="user">User</option>
                  <option value="moderator">Moderator</option>
                  <option value="admin">Admin</option>
                </select>

                <input
                  type="text"
                  placeholder="Comma-separated skills"
                  className="input input-bordered w-full"
                  value={formData.skills}
                  onChange={(e) =>
                    setFormData({ ...formData, skills: e.target.value })
                  }
                />

                <div className="flex gap-2">
                  <button
                    className="btn btn-success btn-sm"
                    onClick={handleUpdate}
                  >
                    Save
                  </button>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => setEditingUser(null)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                className="btn btn-primary btn-sm mt-2"
                onClick={() => handleEditClick(user)}
              >
                Edit
              </button>
            )}
          </div>
        ))}
      </div>
    </>
  );
}