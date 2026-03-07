export default function Page() {
  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">Reset Password</h1>

      <form className="space-y-4">
        <input
          type="password"
          placeholder="New password"
          className="w-full border rounded-lg p-3"
        />

        <input
          type="password"
          placeholder="Confirm password"
          className="w-full border rounded-lg p-3"
        />

        <button className="w-full bg-black text-white p-3 rounded-lg">
          Reset Password
        </button>
      </form>
    </div>
  );
}