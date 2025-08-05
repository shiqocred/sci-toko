// components/checkout/OrderListSection.tsx
import { Layers } from "lucide-react";
import { Product } from "../types";
import { ProductCardDefault } from "./product-card-default";
import { ProductCardVariants } from "./product-card-variants";

interface Props {
  products: Product[];
  totalItems: number;
}

export function OrderListSection({ products, totalItems }: Props) {
  return (
    <div className="w-full rounded-lg shadow p-5 bg-white border flex flex-col gap-4">
      <h3 className="font-semibold text-lg flex items-center gap-2">
        <Layers className="size-5" />
        Order List ({totalItems})
      </h3>

      {products.map((product) => (
        <div key={product.id}>
          {product.default_variant && (
            <ProductCardDefault
              image={product.image}
              title={product.title}
              qty={product.default_variant.qty}
              price={product.default_variant.price}
            />
          )}
          {product.variants.length > 0 && (
            <ProductCardVariants
              image={product.image}
              title={product.title}
              variants={product.variants}
            />
          )}
        </div>
      ))}
    </div>
  );
}
