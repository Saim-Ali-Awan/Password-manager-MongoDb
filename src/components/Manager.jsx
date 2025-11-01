import React, { useRef, useState, useEffect, useCallback } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BiCopy, BiEdit, BiTrash, BiLockAlt } from "react-icons/bi";

// Use .env or fallback
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";
const CORRECT_PIN = "627426";

const Manager = () => {
  const passwordRef = useRef(null);
  const [form, setForm] = useState({ site: "", username: "", password: "" });
  const [passwords, setPasswords] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [pin, setPin] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);

  useEffect(() => {
    if (isUnlocked) {
      fetchPasswords();
    }
  }, [isUnlocked]);

  const fetchPasswords = async () => {
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setPasswords(data);
    } catch {
      toast.error("Failed to load passwords");
    }
  };

  const copyText = useCallback((text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied!", { theme: "colored" });
  }, []);

  const togglePassword = () => {
    setShowPassword((v) => !v);
    if (passwordRef.current) {
      passwordRef.current.type = showPassword ? "password" : "text";
    }
  };

  const savePassword = async () => {
    if ([form.site, form.username, form.password].some((f) => f.length < 3)) {
      return toast.error("All fields must be ≥ 3 chars");
    }

    const payload = { ...form };
    const method = form.id ? "PUT" : "POST";

    try {
      const res = await fetch(API_URL, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (res.ok && data.id) {
        const entry = { id: data.id, ...payload };
        setPasswords((prev) =>
          prev.filter((p) => p.id !== form.id).concat(entry)
        );
        setForm({ site: "", username: "", password: "" });
        setShowPassword(false);
        toast.success(form.id ? "Updated!" : "Saved!");
      } else {
        toast.error(data.error || "Failed");
      }
    } catch {
      toast.error("Network error");
    }
  };

  const deletePassword = async (id) => {
    if (!confirm("Delete this password?")) return;
    try {
      const res = await fetch(API_URL, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        setPasswords((prev) => prev.filter((p) => p.id !== id));
        toast.success("Deleted!");
      } else {
        toast.error("Delete failed");
      }
    } catch {
      toast.error("Network error");
    }
  };

  const editPassword = (id) => {
    const entry = passwords.find((p) => p.id === id);
    if (entry) {
      setForm(entry);
      setPasswords((prev) => prev.filter((p) => p.id !== id));
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePinChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
    setPin(value);
  };

  const handlePinSubmit = (e) => {
    e.preventDefault();
    if (pin === CORRECT_PIN) {
      setIsUnlocked(true);
      toast.success("Unlocked!", { autoClose: 1500 });
    } else {
      setPin("");
      toast.error("Incorrect PIN", { autoClose: 2000 });
    }
  };

  if (!isUnlocked) {
    return (
      <>
        <ToastContainer position="top-right" theme="colored" autoClose={3000} />
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-[var(--primary)]/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[var(--accent)]/20 rounded-full blur-3xl animate-pulse delay-700" />
        </div>

        <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-4">
          <div className="bg-[var(--card)]/90 backdrop-blur-xl rounded-[var(--radius-lg)] p-8 md:p-12 shadow-[var(--shadow-2xl)] border border-[var(--border)] w-full max-w-md">
            <div className="text-center mb-8">
              <div className="mx-auto w-16 h-16 bg-[var(--primary)]/10 rounded-full flex items-center justify-center mb-4">
                <BiLockAlt className="w-8 h-8 text-[var(--primary)]" />
              </div>
              <h2 className="text-3xl font-bold text-[var(--foreground)]">Enter PIN</h2>
              <p className="text-[var(--muted-foreground)] mt-2">Secure access required</p>
            </div>

            <form onSubmit={handlePinSubmit} className="space-y-6">
              <div className="relative">
                <input
                  type="password"
                  inputMode="numeric"
                  value={pin}
                  onChange={handlePinChange}
                  placeholder="••••••"
                  className="w-full p-4 text-center text-2xl tracking-widest font-mono rounded-[var(--radius-md)] border-2 border-[var(--border)] bg-[var(--input)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] transition"
                  maxLength={6}
                  autoFocus
                />
                <div className="flex justify-center mt-3 gap-2">
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-3 h-3 rounded-full transition-all duration-200 ${
                        pin[i] ? "bg-[var(--primary)] scale-110" : "bg-[var(--border)]"
                      }`}
                    />
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[var(--primary)] text-[var(--primary-foreground)] py-4 rounded-[var(--radius-md)] font-bold text-lg shadow-[var(--shadow-xl)] hover:shadow-[var(--shadow-2xl)] hover:scale-[1.02] transition-all"
              >
                Unlock
              </button>
            </form>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <ToastContainer position="top-right" theme="colored" autoClose={3000} />
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-[var(--primary)]/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[var(--accent)]/20 rounded-full blur-3xl animate-pulse delay-700" />
      </div>

      <div className="min-h-screen bg-[var(--background)] p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <header className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] bg-clip-text text-transparent mb-4">
              Pass<span className="text-[var(--primary)]">World</span>
            </h1>
            <p className="text-xl text-[var(--muted-foreground)]">
              It's secure, all passwords are being stored at our own database.
            </p>
          </header>

          <div className="bg-[var(--card)]/80 backdrop-blur-xl rounded-[var(--radius-lg)] p-8 md:p-12 shadow-[var(--shadow-2xl)] border border-[var(--border)] mb-8">
            <div className="space-y-6">
              <input
                name="site"
                value={form.site}
                onChange={handleChange}
                placeholder="Website URL"
                className="w-full p-4 text-lg rounded-[var(--radius-md)] border-2 border-[var(--border)] bg-[var(--input)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] transition"
              />

              <div className="grid md:grid-cols-2 gap-6">
                <input
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  placeholder="Username"
                  className="p-4 text-lg rounded-[var(--radius-md)] border-2 border-[var(--border)] bg-[var(--input)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] transition"
                />

                <div className="relative">
                  <input
                    ref={passwordRef}
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Password"
                    className="w-full p-4 pr-14 text-lg rounded-[var(--radius-md)] border-2 border-[var(--border)] bg-[var(--input)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] transition"
                  />
                  <button
                    type="button"
                    onClick={togglePassword}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-white/10 rounded-md transition"
                    aria-label="Toggle password"
                  >
                    <img
                      src={showPassword ? "/eyecross.png" : "/eye.png"}
                      alt="Toggle"
                      className="w-5 h-5"
                    />
                  </button>
                </div>
              </div>

              <button
                onClick={savePassword}
                className="w-full bg-[var(--primary)] text-[var(--primary-foreground)] py-4 rounded-[var(--radius-md)] font-bold text-lg shadow-[var(--shadow-xl)] hover:shadow-[var(--shadow-2xl)] hover:scale-[1.02] transition-all"
              >
                {form.id ? "Update Password" : "Save Password"}
              </button>
            </div>
          </div>

          <section className="mt-8">
            <h2 className="text-[var(--primary)] text-4xl font-bold mb-4">
              Your Passwords
            </h2>

            {passwords.length === 0 ? (
              <p className="text-center py-8 text-[var(--muted-foreground)] text-lg">
                No passwords saved yet
              </p>
            ) : (
              <div className="overflow-x-auto rounded-[var(--radius-lg)] border border-[var(--border)]">
                <table className="w-full min-w-[600px]">
                  <thead className="bg-[var(--muted)] text-[var(--muted-foreground)] text-sm uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-4 text-left">Site</th>
                      <th className="px-6 py-4 text-left">Username</th>
                      <th className="px-6 py-4 text-left">Password</th>
                      <th className="px-6 py-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]">
                    {passwords.map((item) => (
                      <tr key={item.id} className="hover:bg-[var(--muted)]/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <a
                              href={item.site.startsWith("http") ? item.site : `https://${item.site}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[var(--primary)] hover:underline truncate max-w-[160px] font-medium"
                            >
                              {item.site}
                            </a>
                            <button
                              onClick={() => copyText(item.site)}
                              className="p-1.5 text-[var(--muted-foreground)] hover:text-[var(--primary)] transition"
                            >
                              <BiCopy className="w-5 h-5" />
                            </button>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <span className="truncate max-w-[120px]">{item.username}</span>
                            <button
                              onClick={() => copyText(item.username)}
                              className="p-1.5 text-[var(--muted-foreground)] hover:text-[var(--primary)] transition"
                            >
                              <BiCopy className="w-5 h-5" />
                            </button>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <code className="font-mono text-sm">
                              {showPassword ? item.password : "•".repeat(item.password.length)}
                            </code>
                            <button
                              onClick={() => copyText(item.password)}
                              className="p-1.5 text-[var(--muted-foreground)] hover:text-[var(--primary)] transition"
                            >
                              <BiCopy className="w-5 h-5" />
                            </button>
                          </div>
                        </td>

                        <td className="px-6 py-4 text-center">
                          <div className="flex justify-center gap-3">
                            <button
                              onClick={() => editPassword(item.id)}
                              className="p-2 rounded-[var(--radius-sm)] bg-[var(--accent)]/20 hover:bg-[var(--accent)]/30 transition"
                            >
                              <BiEdit className="w-5 h-5 text-[var(--accent-foreground)]" />
                            </button>
                            <button
                              onClick={() => deletePassword(item.id)}
                              className="p-2 rounded-[var(--radius-sm)] text-[var(--destructive)] hover:bg-[var(--destructive)]/10 transition"
                            >
                              <BiTrash className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </div>
    </>
  );
};

export default Manager;