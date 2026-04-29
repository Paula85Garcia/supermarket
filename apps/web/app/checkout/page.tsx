"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "../../components/app-shell";
import { useCart } from "../../lib/cart-context";
import { safeJson } from "../../lib/safe-json";
import { assignDriverToOrder } from "../../lib/workforce";
import { appendOperationalOrder, type PaymentMethod } from "../../lib/orders-operational";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();
  const [isFinishing, setIsFinishing] = useState(false);
  const [error, setError] = useState("");
  const [createdOrderId, setCreatedOrderId] = useState("");
  const [assignedDriver, setAssignedDriver] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [address, setAddress] = useState("");
  const [deliveryWindow, setDeliveryWindow] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("efectivo");
  const deliveryFee = subtotal < 20000 && subtotal > 0 ? 2000 : 0;
  const total = subtotal + deliveryFee;

  const whatsappSummary = () => {
    const lines = items.map((item) => `- ${item.name} x${item.quantity} ($${(item.priceCOP * item.quantity).toLocaleString("es-CO")})`);
    const message =
      `Hola equipo de domicilios MERKAMAX.%0A` +
      `Resumen compra:%0A${lines.join("%0A")}%0A` +
      `Subtotal: $${subtotal.toLocaleString("es-CO")}%0A` +
      `Recargo domicilio: $${deliveryFee.toLocaleString("es-CO")}%0A` +
      `Total: $${total.toLocaleString("es-CO")}`;
    window.open(`https://wa.me/573053700491?text=${message}`, "_blank", "noopener,noreferrer");
  };

  const finalizeFromApp = async () => {
    setError("");
    if (!items.length) {
      setError("Tu carrito esta vacio");
      return;
    }
    if (!customerName.trim() || !customerPhone.trim() || !address.trim()) {
      setError("Completa nombre, telefono y direccion de entrega");
      return;
    }
    setIsFinishing(true);
    const response = await fetch("/api/orders/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subtotal,
        delivery_fee: deliveryFee,
        total,
        items: items.map((item) => ({
          product_id: item.id,
          name: item.name,
          quantity: item.quantity,
          unit_price: item.priceCOP
        }))
      })
    });
    const result = await safeJson<{ data?: { id?: string }; error?: { message?: string } }>(response);
    setIsFinishing(false);
    if (!response.ok || !result?.data?.id) {
      setError(result?.error?.message ?? "No se pudo finalizar la compra desde la app");
      return;
    }
    setCreatedOrderId(result.data.id);
    appendOperationalOrder({
      id: result.data.id,
      createdAt: new Date().toISOString(),
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      address: address.trim(),
      paymentMethod,
      deliveryWindow: deliveryWindow.trim(),
      items: items.map((item) => ({
        productId: item.id,
        name: item.name,
        description: item.description ?? "",
        imageUrl: item.imageUrl ?? "",
        quantity: item.quantity,
        unitPrice: item.priceCOP
      })),
      total
    });
    const assignment = assignDriverToOrder(result.data.id);
    if (assignment) {
      setAssignedDriver(`${assignment.displayName} (${assignment.shift})`);
    }
    setTimeout(() => {
      clearCart();
      router.push(`/orders/${result.data?.id}/track`);
    }, 1200);
  };

  return (
    <AppShell>
      <section className="mt-6 rounded-2xl border border-merka-border bg-merka-surface p-5">
        <h2 className="font-headline text-2xl font-semibold text-white">Checkout</h2>
        <p className="mt-2 text-sm text-zinc-400">Confirma datos de entrega y pago. El pedido llega al panel de alistamiento y domicilio.</p>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <input
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="rounded-xl border border-merka-border bg-merka-black px-3 py-2 text-sm text-white outline-none"
            placeholder="Nombre quien recibe"
          />
          <input
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            className="rounded-xl border border-merka-border bg-merka-black px-3 py-2 text-sm text-white outline-none"
            placeholder="Telefono / WhatsApp"
          />
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="md:col-span-2 rounded-xl border border-merka-border bg-merka-black px-3 py-2 text-sm text-white outline-none"
            placeholder="Direccion completa de entrega"
          />
          <input
            value={deliveryWindow}
            onChange={(e) => setDeliveryWindow(e.target.value)}
            className="md:col-span-2 rounded-xl border border-merka-border bg-merka-black px-3 py-2 text-sm text-white outline-none"
            placeholder="Ventana de entrega (ej: hoy 4-6pm)"
          />
          <div className="md:col-span-2">
            <p className="mb-2 text-xs text-zinc-400">Metodo de pago</p>
            <div className="flex flex-wrap gap-3 text-sm text-zinc-200">
              {(
                [
                  ["efectivo", "Efectivo al recibir"],
                  ["tarjeta", "Tarjeta / en linea"],
                  ["transferencia", "Transferencia"],
                  ["pendiente", "Por definir / cobrar en tienda"]
                ] as const
              ).map(([value, label]) => (
                <label key={value} className="inline-flex cursor-pointer items-center gap-2">
                  <input
                    type="radio"
                    name="pay"
                    checked={paymentMethod === value}
                    onChange={() => setPaymentMethod(value)}
                    className="accent-merka-yellow"
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-4 space-y-2 rounded-xl border border-merka-border bg-merka-black p-4 text-sm text-zinc-200">
          {items.map((item) => (
            <p key={item.id}>
              {item.name} x{item.quantity} - ${(item.priceCOP * item.quantity).toLocaleString("es-CO")}
            </p>
          ))}
          <p>Subtotal: ${subtotal.toLocaleString("es-CO")}</p>
          <p>Recargo domicilio: ${deliveryFee.toLocaleString("es-CO")}</p>
          <p className="font-semibold text-merka-green">Total: ${total.toLocaleString("es-CO")}</p>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={finalizeFromApp}
            disabled={isFinishing}
            className="rounded-xl bg-merka-green px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {isFinishing ? "Finalizando..." : "Finalizar desde la app"}
          </button>
          <button onClick={whatsappSummary} className="rounded-xl bg-merka-yellow px-4 py-2 text-sm font-semibold text-merka-black">
            Enviar resumen a WhatsApp domicilios
          </button>
        </div>
        {createdOrderId ? (
          <p className="mt-3 text-xs text-merka-green">
            Pedido creado #{createdOrderId}. {assignedDriver ? `Domiciliario asignado: ${assignedDriver}. ` : ""}Redirigiendo al tracking...
          </p>
        ) : null}
        {error ? <p className="mt-3 text-xs text-merka-red">{error}</p> : null}
      </section>
    </AppShell>
  );
}
