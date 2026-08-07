export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto py-24 px-6">
        <h1 className="text-5xl font-bold">
          Office Management System
        </h1>

        <p className="mt-4 text-gray-600">
          Welcome to our office system.
        </p>

        <a
          href="/login"
          className="inline-block mt-6 bg-blue-600 text-white px-6 py-3 rounded"
        >
          Login
        </a>
      </div>
    </main>
  );
}