export default function AuthLoading() {
  return (
    <main className="flex min-h-[75vh] items-center justify-center px-4 py-10">
      <div className="card w-full max-w-md animate-pulse border border-base-300 bg-base-100 shadow-xl">
        <div className="card-body gap-5">
          <div className="skeleton mx-auto h-12 w-12 rounded-full" />
          <div className="skeleton mx-auto h-8 w-44" />
          <div className="skeleton h-12 w-full" />
          <div className="skeleton h-12 w-full" />
          <div className="skeleton h-12 w-full" />
          <div className="skeleton h-10 w-full" />
        </div>
      </div>
    </main>
  );
}
