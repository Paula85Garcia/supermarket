"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "../../components/app-shell";
import { useCart } from "../../lib/cart-context";
import { safeJson } from "../../lib/safe-json";
import { assignDriverToOrder, assignPickerToOrder } from "../../lib/workforce";
import { buildCartWaText, getPickerWhatsappDigits, openWhatsAppToDigits } from "../../lib/picker-whatsapp";
import { appendOperationalOrder, type PaymentMethod } from "../../lib/orders-operational";
import { loadCustomerLocalProfile, saveCustomerLocalProfile } from "../../lib/customer-local-profile";

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
  const [useOtherAddress, setUseOtherAddress] = useState(false);
  const [otherAddress, setOtherAddress] = useState("");
  const [deliveryWindow, setDeliveryWindow] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("efectivo");
  const deliveryFee = subtotal < 20000 && subtotal > 0 ? 2000 : 0;
  const total = subtotal + deliveryFee;

  useEffect(() => {
    const p = loadCustomerLocalProfile();
    if (!p) return;
    if (p.fullName.trim()) setCustomerName(p.fullName.trim());
    if (p.whatsappPhone.trim()) setCustomerPhone(p.whatsappPhone.trim());
    if (p.homeAddress.trim()) setAddress(p.homeAddress.trim());
    if (p.altDeliveryAddress?.trim()) setOtherAddress(p.altDeliveryAddress.trim());
  }, []);

  const deliveryAddressLine = useOtherAddress ? otherAddress.trim() : address.trim();

  const whatsappSummary = () => {
    const lines = items.map((item) => `- ${item.name} x${item.quantity} ($${(item.priceCOP * item.quantity).toLocaleString("es-CO")})`);
    const text = buildCartWaText({ lines, subtotal, deliveryFee, total });
    openWhatsAppToDigits(getPickerWhatsappDigits(), text);
  };

  const finalizeFromApp = async () => {
    setError("");
    if (!items.length) {
      setError("Tu carrito esta vacio");
      return;
    }
    if (!customerName.trim() || !customerPhone.trim() || !deliveryAddressLine) {
      setError("Completa nombre, telefono y direccion de entrega");
      return;
    }
    if (useOtherAddress && !otherAddress.trim()) {
      setError("Indica la direccion alternativa de entrega");
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
    const prevProfile = loadCustomerLocalProfile();
    appendOperationalOrder({
      id: result.data.id,
      createdAt: new Date().toISOString(),
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      address: deliveryAddressLine,
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
    assignPickerToOrder(result.data.id);
    saveCustomerLocalProfile({
      fullName: customerName.trim(),
      email: (prevProfile?.email ?? "").trim(),
      whatsappPhone: customerPhone.trim(),
      homeAddress: address.trim(),
      altDeliveryAddress: otherAddress.trim() || undefined
    });
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
            placeholder="Direccion principal de entrega"
          />
          <label className="flex cursor-pointer items-center gap-2 md:col-span-2 text-sm text-zinc-300">
            <input
              type="checkbox"
              checked={useOtherAddress}
              onChange={(e) => setUseOtherAddress(e.target.checked)}
              className="accent-merka-yellow"
            />
            Entregar en otra direccion (distinta a la principal)
          </label>
          {useOtherAddress ? (
            <input
              value={otherAddress}
              onChange={(e) => setOtherAddress(e.target.value)}
              className="md:col-span-2 rounded-xl border border-merka-border bg-merka-black px-3 py-2 text-sm text-white outline-none"
              placeholder="Direccion alternativa completa"
            />
          ) : null}
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
            type="button"
            onClick={finalizeFromApp}
            disabled={isFinishing}
            className="rounded-xl bg-merka-green px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {isFinishing ? "Finalizando..." : "Finalizar desde la app"}
          </button>
          <button type="button" onClick={whatsappSummary} className="rounded-xl bg-merka-yellow px-4 py-2 text-sm font-semibold text-merka-black">
            WhatsApp alistamiento
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
