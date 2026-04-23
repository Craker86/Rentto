import { Resend } from "resend";

export async function POST(request) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error(
      "RESEND_API_KEY no está definida. Configúrala en .env.local (desarrollo) o en las variables de entorno del proveedor (producción)."
    );
  }
  const resend = new Resend(apiKey);

  const { monto, metodo, fecha, emailPropietario } = await request.json();

  // Construye la URL base a partir del request (funciona en local y en Vercel)
  const host = request.headers.get("host") || "localhost:3000";
  const proto = request.headers.get("x-forwarded-proto")
    || (host.includes("localhost") ? "http" : "https");
  const appUrl = `${proto}://${host}`;
  const ctaUrl = `${appUrl}/propietario#pendientes`;

  const { error } = await resend.emails.send({
    from: "Rentto <onboarding@resend.dev>",
    to: emailPropietario,
    subject: "Nuevo pago recibido - Rentto",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 20px;">
        <div style="background: #065f46; color: white; padding: 20px; border-radius: 12px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">Rentto</h1>
          <p style="margin: 4px 0 0; opacity: 0.8; font-size: 14px;">Nuevo pago recibido</p>
        </div>
        <div style="padding: 20px; background: #f9fafb; border-radius: 12px; margin-top: 16px;">
          <p style="font-size: 14px; color: #374151;">Se ha registrado un nuevo pago en tu propiedad:</p>
          <table style="width: 100%; font-size: 14px; margin-top: 12px;">
            <tr><td style="color: #6b7280; padding: 6px 0;">Monto</td><td style="text-align: right; font-weight: bold;">$${monto}</td></tr>
            <tr><td style="color: #6b7280; padding: 6px 0;">Método</td><td style="text-align: right;">${metodo}</td></tr>
            <tr><td style="color: #6b7280; padding: 6px 0;">Fecha</td><td style="text-align: right;">${fecha}</td></tr>
            <tr><td style="color: #6b7280; padding: 6px 0;">Estado</td><td style="text-align: right; color: #d97706; font-weight: bold;">Pendiente de confirmación</td></tr>
          </table>
        </div>
        <div style="text-align: center; margin-top: 20px;">
          <a href="${ctaUrl}"
             style="display: inline-block; background: #065f46; color: white; text-decoration: none; padding: 12px 28px; border-radius: 9999px; font-weight: 600; font-size: 14px;">
            Revisar y confirmar pago
          </a>
        </div>
        <p style="font-size: 12px; color: #9ca3af; text-align: center; margin-top: 16px;">
          O ingresa a Rentto manualmente: <a href="${appUrl}" style="color: #059669;">${host}</a>
        </p>
      </div>
    `,
  });

  if (error) {
    return Response.json({ error: error.message }, { status: 400 });
  }

  return Response.json({ success: true });
}
