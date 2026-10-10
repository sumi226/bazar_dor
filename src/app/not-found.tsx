import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-[60vh] items-center justify-center px-4 py-12">
      <div className="max-w-md text-center">
        <div className="text-6xl">🧺</div>
        <p className="mt-5 text-sm font-bold uppercase tracking-widest text-primary">
          Error 404
        </p>
        <h1 className="mt-3 text-3xl font-bold">পেজটি খুঁজে পাওয়া যায়নি</h1>
        <p className="mt-3 text-base-content/70">
          পেজটি সরানো হয়েছে অথবা ঠিকানাটি সঠিক নয়।
        </p>
        <Link href="/" className="btn btn-primary btn-sm sm:btn-md mt-6">
          হোম পেজে ফিরে যান
        </Link>
      </div>
    </main>
  );
}
