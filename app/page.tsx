import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-100">
      <h1 className="text-2xl font-bold mb-8">Choose Action</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          href="/upload-guest"
          className="block p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition duration-300 border border-gray-200 hover:bg-gray-50"
        >
          <h2 className="mb-3 text-lg font-semibold text-gray-800">
            Guest List Upload (.xlsx)
          </h2>
          <p className="text-xs text-gray-600">
            👉 Click here to upload your guest list
          </p>
        </Link>

        <Link
          href="/generate-links"
          className="block p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition duration-300 border border-gray-200 hover:bg-gray-50"
        >
          <h2 className="mb-3 text-lg font-semibold text-gray-800">
            Generate Messages
          </h2>
          <p className="text-xs text-gray-600">
            👉 Generate invitation messages from your guest list.
          </p>
        </Link>
      </div>
    </main>
  );
}
