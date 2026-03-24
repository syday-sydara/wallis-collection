// lib/verify-payment.ts

/**
 * Calls Paystack's API to verify the true status of a transaction reference.
 */
export async function verifyPaystackPayment(reference: string) {
  try {
    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        // Ensure Next.js doesn't cache this highly dynamic request
        cache: "no-store", 
      }
    );

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Paystack API verification error:", error);
    throw new Error("Failed to communicate with Paystack.");
  }
}