// lib/admin/client.ts
export class AdminClient {
  constructor(private baseUrl = "/api/admin") {}

  private async request<T>(
    path: string,
    options: RequestInit = {}
  ): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });

    if (!res.ok) {
      let message = "Request failed";
      try {
        const data = await res.json();
        if (data?.error) message = data.error;
      } catch {
        // ignore
      }
      throw new Error(message);
    }

    if (res.status === 204) return undefined as T;
    return res.json();
  }

  // PRODUCTS
  products = {
    list: (cursor?: string) =>
      this.request<{ items: any[]; nextCursor?: string }>(
        `/products${cursor ? `?cursor=${cursor}` : ""}`
      ),

    get: (productId: string) =>
      this.request<any>(`/products/${productId}`),

    create: (data: {
      name: string;
      slug: string;
      basePrice: number | null;
      stock?: number;
      description?: string;
    }) =>
      this.request<any>("/products", {
        method: "POST",
        body: JSON.stringify(data),
      }),

    update: (productId: string, data: Partial<{
      name: string;
      slug: string;
      basePrice: number | null;
      description: string | null;
    }>) =>
      this.request<any>(`/products/${productId}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),

    delete: (productId: string) =>
      this.request<{ ok: true }>(`/products/${productId}`, {
        method: "DELETE",
      }),
  };

  // INVENTORY
  inventory = {
    updateProductStock: (productId: string, stock: number) =>
      this.request<any>(`/products/${productId}/inventory`, {
        method: "PATCH",
        body: JSON.stringify({ stock }),
      }),

    updateVariantStock: (
      productId: string,
      variantId: string,
      stock: number
    ) =>
      this.request<any>(
        `/products/${productId}/variants/${variantId}/stock`,
        {
          method: "PATCH",
          body: JSON.stringify({ stock }),
        }
      ),
  };

  // VARIANTS
  variants = {
    create: (
      productId: string,
      data: { name: string; sku: string; price: number | null; stock: number }
    ) =>
      this.request<any>(`/products/${productId}/variants`, {
        method: "POST",
        body: JSON.stringify(data),
      }),

    update: (
      productId: string,
      variantId: string,
      data: Partial<{
        name: string;
        sku: string;
        price: number | null;
        stock: number;
      }>
    ) =>
      this.request<any>(
        `/products/${productId}/variants/${variantId}`,
        {
          method: "PATCH",
          body: JSON.stringify(data),
        }
      ),

    delete: (productId: string, variantId: string) =>
      this.request<{ ok: true }>(
        `/products/${productId}/variants/${variantId}`,
        {
          method: "DELETE",
        }
      ),
  };

  // IMAGES
  images = {
    upload: async (productId: string, file: File) => {
      const form = new FormData();
      form.append("file", file);

      const res = await fetch(
        `${this.baseUrl}/products/${productId}/images`,
        {
          method: "POST",
          body: form,
        }
      );

      if (!res.ok) throw new Error("Upload failed");
      return res.json();
    },

    delete: (productId: string, imageId: string) =>
      this.request<{ ok: true }>(
        `/products/${productId}/images/${imageId}`,
        {
          method: "DELETE",
        }
      ),
  };
}

const admin = {
  products: {
    images: {
      async upload(productId: string, file: File) {
        const form = new FormData();
        form.append("file", file);

        const res = await fetch(`/api/admin/products/${productId}/images/upload`, {
          method: "POST",
          body: form,
        });

        if (!res.ok) throw new Error("Upload failed");
        return res.json();
      },

      async delete(productId: string, imageId: string) {
        const res = await fetch(
          `/api/admin/products/${productId}/images/${imageId}`,
          { method: "DELETE" }
        );
        if (!res.ok) throw new Error("Delete failed");
      },

      async reorder(productId: string, imageIds: string[]) {
        const res = await fetch(
          `/api/admin/products/${productId}/images/reorder`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ imageIds }),
          }
        );
        if (!res.ok) throw new Error("Reorder failed");
      },

      async setPrimary(productId: string, imageId: string) {
        const res = await fetch(
          `/api/admin/products/${productId}/images/primary`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ imageId }),
          }
        );
        if (!res.ok) throw new Error("Set primary failed");
      },

      async replace(productId: string, imageId: string, file: File) {
        const form = new FormData();
        form.append("file", file);

        const res = await fetch(
          `/api/admin/products/${productId}/images/${imageId}/replace`,
          {
            method: "POST",
            body: form,
          }
        );
        if (!res.ok) throw new Error("Replace failed");
        return res.json();
      },
    },
  },
};

export default admin;

