
"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { authClient } from "@/lib/auth-client";

type SocialProvider = "google" | "github";

export default function SignUpForm() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] =
    useState<SocialProvider | "">("");

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (loading || socialLoading) return;

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName || !trimmedEmail || !password) {
      toast.error("সবগুলো ফিল্ড পূরণ করো");
      return;
    }

    if (password.length < 8) {
      toast.error("Password কমপক্ষে ৮ অক্ষরের হতে হবে");
      return;
    }

    setLoading(true);

    try {
      const { error } = await authClient.signUp.email({
        name: trimmedName,
        email: trimmedEmail,
        password,
      });

      if (error) {
        toast.error(error.message || "Registration ব্যর্থ হয়েছে");
        return;
      }

      toast.success("Account তৈরি হয়েছে! এখন Login করো।");

      router.replace("/signin");
      router.refresh();
    } catch (error) {
      console.error("Signup error:", error);
      toast.error("Registration করা যায়নি। আবার চেষ্টা করো।");
    } finally {
      setLoading(false);
    }
  }

  async function socialLogin(provider: SocialProvider) {
    if (loading || socialLoading) return;

    setSocialLoading(provider);

    try {
      const { error } = await authClient.signIn.social({
        provider,
        callbackURL: "/",
      });

      if (error) {
        toast.error(error.message || "Social login ব্যর্থ হয়েছে");
        setSocialLoading("");
      }
    } catch (error) {
      console.error(`${provider} login error:`, error);
      toast.error("Social login করা যায়নি। আবার চেষ্টা করো।");
      setSocialLoading("");
    }
  }

  const isBusy = loading || !!socialLoading;

  return (
    <section className="card w-full max-w-md border border-base-300 bg-base-100 shadow-xl">
      <div className="card-body gap-4">
        <div className="text-center">
          <div className="text-4xl" aria-hidden="true">
            🥬
          </div>

          <h1 className="text-3xl font-bold">
            Create Account
          </h1>

          <p className="text-sm opacity-60">
            BazarDor-এ যোগ দাও
          </p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <label className="form-control w-full">
            <span className="label-text mb-2">Name</span>

            <input
              className="input input-bordered w-full"
              type="text"
              name="name"
              autoComplete="name"
              placeholder="তোমার নাম"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={isBusy}
            />
          </label>

          <label className="form-control w-full">
            <span className="label-text mb-2">Email</span>

            <input
              className="input input-bordered w-full"
              type="email"
              name="email"
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
              name="password"
              autoComplete="new-password"
              minLength={8}
              placeholder="কমপক্ষে ৮ অক্ষর"
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
            {loading && (
              <span className="loading loading-spinner loading-sm" />
            )}

            {loading ? "Account তৈরি হচ্ছে..." : "Register"}
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
            {socialLoading === "google" ? (
              <>
                <span className="loading loading-spinner loading-sm" />
                অপেক্ষা করো...
              </>
            ) : (
              "Google"
            )}
          </button>

          <button
            className="btn btn-outline"
            type="button"
            disabled={isBusy}
            onClick={() => socialLogin("github")}
          >
            {socialLoading === "github" ? (
              <>
                <span className="loading loading-spinner loading-sm" />
                অপেক্ষা করো...
              </>
            ) : (
              "GitHub"
            )}
          </button>
        </div>

        <p className="text-center text-sm">
          আগে থেকেই account আছে?{" "}
          <Link
            href="/signin"
            className="link link-primary font-semibold"
          >
            Login করো
          </Link>
        </p>
      </div>
    </section>
  );
}
