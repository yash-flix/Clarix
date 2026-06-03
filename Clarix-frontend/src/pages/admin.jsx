import { useEffect, useState } from "react";
import PageLayout from "../components/PageLayout";
import { RoleBadge } from "../components/ui/badges";

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
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        const list = data.users || data;
        setUsers(list);
        setFilteredUsers(list);
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

      if (!res.ok) return;

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
    <PageLayout className="py-0">
      <section className="bg-dots border-b border-neutral-200 -mx-5 sm:-mx-8 px-5 sm:px-8 py-12 sm:py-16">
        <p className="label-caps mb-6">Administration</p>
        <h1 className="font-display text-4xl sm:text-5xl text-ink leading-tight">
          Manage <em className="text-neutral-400">operators.</em>
        </h1>
      </section>

      <div className="py-10 sm:py-14">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <p className="label-caps">{filteredUsers.length} users</p>
          <input
            type="search"
            className="input-field sm:max-w-xs py-2"
            placeholder="Search email…"
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>

        <div className="border-t border-neutral-200">
          <div className="hidden sm:grid grid-cols-[1fr_120px_1fr_140px] gap-4 py-3 border-b border-neutral-200">
            <span className="label-caps">User</span>
            <span className="label-caps">Role</span>
            <span className="label-caps">Skills</span>
            <span className="label-caps text-right">Actions</span>
          </div>

          {filteredUsers.map((user) => (
            <div
              key={user._id}
              className="grid sm:grid-cols-[1fr_120px_1fr_140px] gap-4 py-6 border-b border-neutral-200 items-start"
            >
              <p className="text-sm text-ink font-medium truncate">{user.email}</p>
              <div>
                <RoleBadge role={user.role} />
              </div>
              <p className="text-sm text-neutral-500 truncate">
                {user.skills?.length > 0 ? user.skills.join(", ") : "—"}
              </p>
              <div className="sm:text-right">
                {editingUser === user.email ? (
                  <div className="space-y-3 text-left sm:min-w-[200px]">
                    <select
                      className="input-field py-2"
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
                      placeholder="Skills, comma-separated"
                      className="input-field py-2"
                      value={formData.skills}
                      onChange={(e) =>
                        setFormData({ ...formData, skills: e.target.value })
                      }
                    />
                    <div className="flex gap-2">
                      <button type="button" className="btn-accent py-2 px-4 text-xs" onClick={handleUpdate}>
                        Save
                      </button>
                      <button
                        type="button"
                        className="btn-ghost-nav text-xs py-2"
                        onClick={() => setEditingUser(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="text-sm text-ink underline underline-offset-2 hover:text-accent"
                    onClick={() => handleEditClick(user)}
                  >
                    Edit
                  </button>
                )}
              </div>
            </div>
          ))}

          {filteredUsers.length === 0 && (
            <p className="py-16 text-center font-display text-xl text-neutral-400">
              No users found.
            </p>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
