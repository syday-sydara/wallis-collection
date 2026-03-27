import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

// --- Styles --------------------------------------------------

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 11,
    fontFamily: "Helvetica",
    color: "#1A1A1A",
  },

  header: {
    marginBottom: 30,
    borderBottom: "1px solid #E5E5E5",
    paddingBottom: 12,
  },

  brandName: {
    fontSize: 24,
    fontWeight: 700,
    letterSpacing: 0.5,
  },

  section: {
    marginBottom: 24,
  },

  sectionTitle: {
    fontSize: 14,
    fontWeight: 600,
    marginBottom: 8,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },

  label: {
    color: "#666",
  },

  divider: {
    borderBottom: "1px solid #E5E5E5",
    marginVertical: 12,
  },

  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    fontSize: 13,
    fontWeight: 600,
  },

  footer: {
    marginTop: 40,
    textAlign: "center",
    fontSize: 10,
    color: "#777",
  },
});

// --- Component --------------------------------------------------

export default function ReceiptPDF({ order }: { order: any }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.brandName}>WALLIS COLLECTION</Text>
          <Text>Premium Nigerian Fashion</Text>
        </View>

        {/* Order Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Details</Text>

          <View style={styles.row}>
            <Text style={styles.label}>Order ID</Text>
            <Text>{order.id}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Date</Text>
            <Text>{new Date(order.createdAt).toLocaleDateString()}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Payment Method</Text>
            <Text>{order.paymentMethod}</Text>
          </View>
        </View>

        {/* Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Items</Text>

          {order.items.map((item: any) => (
            <View key={item.id} style={styles.row}>
              <Text>
                {item.product.name} × {item.quantity}
              </Text>
              <Text>
                ₦{((item.priceCents * item.quantity) / 100).toLocaleString()}
              </Text>
            </View>
          ))}

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <Text>Total</Text>
            <Text>₦{(order.totalCents / 100).toLocaleString()}</Text>
          </View>
        </View>

        {/* Shipping */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Shipping</Text>

          {order.shipping?.type === "DELIVERY" ? (
            <>
              <Text>{order.shipping.address}</Text>
              <Text>
                {order.shipping.city}, {order.shipping.state}
              </Text>
              <Text>{order.shipping.postalCode}</Text>
              <Text>Courier: {order.shipping.courierPhone}</Text>
            </>
          ) : (
            <Text>Pickup — You will be notified when your order is ready.</Text>
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Thank you for shopping with Wallis Collection.</Text>
          <Text>www.walliscollection.com</Text>
        </View>
      </Page>
    </Document>
  );
}
