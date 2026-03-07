export default function Page() {
  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">Create Account</h1>

      <form className="space-y-4">
        <input
          type="text"
          placeholder="Full Name"
          className="w-full border rounded-lg p-3"
        />

        <input
          type="email"
          placeholder="Email"
          className="w-full border rounded-lg p-3"
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full border rounded-lg p-3"
        />

        <button className="w-full bg-black text-white p-3 rounded-lg">
          Register
        </button>
      </form>

      <div className="mt-4 text-sm text-center">
        <a href="/login" className="text-blue-600">
          Already have an account
        </a>
      </div>
    </div>
  );
}