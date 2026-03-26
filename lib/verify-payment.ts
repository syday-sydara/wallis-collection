// lib/verify-payment.ts

interface PaystackVerifyResponse {
  status: boolean;
  message: string;
  data?: {
    status: string;
    reference: string;
    amount: number;
    currency: string;
    paid_at: string;
    channel: string;
    metadata?: any;
  };
}

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
        cache: "no-store",
      }
    );

    if (!response.ok) {
      throw new Error(`Paystack responded with ${response.status}`);
    }

    const data: PaystackVerifyResponse = await response.json();

    if (!data.status) {
      throw new Error(`Paystack verification failed: ${data.message}`);
    }

    return data.data;
  } catch (error) {
    console.error("Paystack API verification error:", error);
    throw new Error("Failed to verify payment with Paystack");
  }
}
