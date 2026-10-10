
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { authClient } from "@/lib/auth-client";

export default function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function logout() {
    if (loading) return;

    setLoading(true);

    try {
      const { error } = await authClient.signOut();

      if (error) {
        toast.error(error.message || "Logout ব্যর্থ হয়েছে");
        return;
      }

      toast.success("Logout সফল হয়েছে");

      router.replace("/signin");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Logout করা যায়নি। আবার চেষ্টা করো।");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      className="btn btn-outline btn-sm"
      onClick={logout}
      disabled={loading}
      aria-label="Logout"
    >
      {loading && (
        <span className="loading loading-spinner loading-xs" />
      )}

      {loading ? "Logout হচ্ছে..." : "Logout"}
    </button>
  );
}

