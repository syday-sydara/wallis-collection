export default function Page() {
  return (
    <div className="text-center">
      <h1 className="text-xl font-semibold mb-4">Verify Your Email</h1>

      <p className="text-neutral-600 mb-4">
        We’ve sent a verification link to your email.
      </p>

      <button className="bg-black text-white px-4 py-2 rounded-lg">
        Resend Email
      </button>
    </div>
  );
}