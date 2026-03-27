// app/api/receipts/[orderId]/route.ts

import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import ReceiptPDF from "@/components/receipts/ReceiptPDF";

export async function GET(req: Request, { params }: { params: { orderId: string } }) {
  const order = await prisma.order.findUnique({
    where: { id: params.orderId },
    include: {
      items: { include: { product: true } },
      shipments: true,
    },
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const pdfBuffer = await renderToBuffer(<ReceiptPDF order={order} />);

  return new NextResponse(pdfBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=receipt-${order.id}.pdf`,
    },
  });
}
