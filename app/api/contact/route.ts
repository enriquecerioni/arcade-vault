import { Resend } from "resend";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  const body = await request.json();
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const msg = typeof body.msg === "string" ? body.msg.trim() : "";

  if (!name || !email || !msg || !EMAIL_RE.test(email)) {
    return Response.json({ ok: false, error: "Datos inválidos" }, { status: 400 });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    const { data, error } = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: process.env.CONTACT_TO_EMAIL as string,
      replyTo: email,
      subject: "Nuevo mensaje de contacto — Arcade Vault",
      text: `Nombre: ${name}\nEmail: ${email}\n\nMensaje:\n${msg}`,
    });

    if (error) {
      return Response.json({ ok: false, error: error.message }, { status: 500 });
    }

    return Response.json({ ok: true, id: data?.id });
  } catch {
    return Response.json({ ok: false, error: "Error al enviar el correo" }, { status: 500 });
  }
}
