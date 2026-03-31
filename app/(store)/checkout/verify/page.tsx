"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // Next.js Router hook

export default function VerifyPage({ searchParams }: { searchParams: { orderId?: string } }) {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "error">("loading"); // State for loading or error

  useEffect(() => {
    if (!searchParams.orderId) return setStatus("error"); // If there's no orderId, set status to error

    const verifyPayment = async () => {
      try {
        // Fetch payment verification from the API
        const res = await fetch(`/api/checkout/verify?orderId=${searchParams.orderId}`);
        
        if (res.ok) {
          // If the response is OK, redirect to the success page
          router.replace(`/checkout/success?orderId=${searchParams.orderId}`);
        } else {
          // If the response is not OK, set the status to error
          setStatus("error");
        }
      } catch {
        // If the fetch fails, set the status to error
        setStatus("error");
      }
    };

    // Call the payment verification function
    verifyPayment();
  }, [searchParams.orderId, router]); // Dependencies: orderId and router

  // If there's an error, display this message
  if (status === "error") return <p>Unable to verify payment. Please contact support.</p>;

  // If it's still loading, show this message
  return <p>Verifying your payment… Please wait.</p>;
}