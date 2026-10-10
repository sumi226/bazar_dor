"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { authClient } from "@/lib/auth-client";

export default function SignInForm() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<"" | "google" | "github">(
    "",
  );

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!email.trim() || !password) {
      toast.error("Email এবং password দিতে হবে");
      return;
    }

    setLoading(true);

    try {
      const { error } = await authClient.signIn.email({
        email: email.trim(),
        password,
      });

      if (error) {
        toast.error(error.message || "Login ব্যর্থ হয়েছে");
        return;
      }

      toast.success("Login সফল হয়েছে!");
      router.replace("/");
      router.refresh();
    } catch {
      toast.error("Login করা যায়নি। আবার চেষ্টা করো।");
    } finally {
      setLoading(false);
    }
  }

  async function socialLogin(provider: "google" | "github") {
    setSocialLoading(provider);

    try {
      const { error } = await authClient.signIn.social({
        provider,
        callbackURL: "/",
      });

      if (error) {
        toast.error(error.message || "Social login ব্যর্থ হয়েছে");
        setSocialLoading("");
      }
    } catch {
      toast.error("Social login করা যায়নি");
      setSocialLoading("");
    }
  }

  const isBusy = loading || socialLoading !== "";

  return (
    <section className="card w-full max-w-md border border-base-300 bg-base-100 shadow-xl">
      <div className="card-body gap-4">
        <div className="text-center">
          <div className="text-4xl">🛒</div>
          <h1 className="text-3xl font-bold">Login</h1>
          <p className="text-sm opacity-60">BazarDor-এ স্বাগতম</p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <label className="form-control w-full">
            <span className="label-text mb-2">Email</span>
            <input
              className="input input-bordered w-full"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isBusy}
            />
          </label>

          <label className="form-control w-full">
            <span className="label-text mb-2">Password</span>
            <input
              className="input input-bordered w-full"
              type="password"
              autoComplete="current-password"
              placeholder="তোমার password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isBusy}
            />
          </label>

          <button
            className="btn btn-primary w-full"
            type="submit"
            disabled={isBusy}
          >
            {loading && <span className="loading loading-spinner loading-sm" />}
            {loading ? "Login হচ্ছে..." : "Login"}
          </button>
        </form>

        <div className="divider">অথবা</div>

        <div className="grid grid-cols-2 gap-3">
          <button
            className="btn btn-outline"
            type="button"
            disabled={isBusy}
            onClick={() => socialLogin("google")}
          >
            {socialLoading === "google" && (
              <span className="loading loading-spinner loading-sm" />
            )}
            {socialLoading === "google" ? "অপেক্ষা করো..." : "Google"}
          </button>

          <button
            className="btn btn-outline"
            type="button"
            disabled={isBusy}
            onClick={() => socialLogin("github")}
          >
            {socialLoading === "github" && (
              <span className="loading loading-spinner loading-sm" />
            )}
            {socialLoading === "github" ? "অপেক্ষা করো..." : "GitHub"}
          </button>
        </div>

        <p className="text-center text-sm">
          নতুন এখানে?{" "}
          <Link href="/signup" className="link link-primary font-semibold">
            Register করো
          </Link>
        </p>
      </div>
    </section>
  );
}
