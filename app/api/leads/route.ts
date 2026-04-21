import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: NextRequest) {
  try {
    const fd = await req.formData();

    const name        = fd.get('name') as string;
    const phone       = fd.get('phone') as string;
    const email       = fd.get('email') as string;
    const windowType  = fd.get('window_type') as string;
    const condition   = fd.get('condition') as string;
    const sealProfile = fd.get('seal_profile') as string;
    const sealColor   = fd.get('seal_color') as string;
    const sealColorHex= fd.get('seal_color_hex') as string;
    const aiNotes     = fd.get('ai_notes') as string;
    const totalPrice  = fd.get('total_price') as string;
    const travelFee   = fd.get('travel_fee') as string;
    const itemsRaw    = fd.get('items') as string;

    const items: { label: string; widthCm: number; heightCm: number; condition: string; perimeter: string }[] =
      JSON.parse(itemsRaw ?? '[]');

    // Photo attachments
    const attachments: { filename: string; content: Buffer; contentType: string }[] = [];
    for (const [key, value] of fd.entries()) {
      if ((key.startsWith('window_') || key === 'seal') && value instanceof File) {
        const buffer = Buffer.from(await value.arrayBuffer());
        const label = key === 'seal' ? 'Dichtung-Nahaufnahme' : `Fenster-Foto-${parseInt(key.split('_')[1]) + 1}`;
        attachments.push({
          filename: `${label}.${value.name.split('.').pop() ?? 'jpg'}`,
          content: buffer,
          contentType: value.type,
        });
      }
    }

    const itemsHtml = items.map((item, i) => `
      <tr style="background:${i % 2 === 0 ? '#f8fafc' : '#fff'}">
        <td style="padding:8px">${i + 1}. ${item.label}</td>
        <td style="padding:8px">${item.widthCm} × ${item.heightCm} cm</td>
        <td style="padding:8px">${item.perimeter} m</td>
        <td style="padding:8px">${item.condition}</td>
      </tr>`).join('');

    const colorSwatch = sealColorHex
      ? `<span style="display:inline-block;width:16px;height:16px;background:${sealColorHex};border:1px solid #ccc;border-radius:3px;vertical-align:middle;margin-right:6px"></span>`
      : '';

    const html = `
      <div style="font-family:sans-serif;max-width:620px;margin:0 auto;color:#1e293b">
        <div style="background:#1d4ed8;color:white;padding:20px 24px;border-radius:12px 12px 0 0">
          <h2 style="margin:0;font-size:20px">🪟 Neue Anfrage – Maos Fensterservice</h2>
          <p style="margin:4px 0 0;opacity:0.8;font-size:13px">${new Date().toLocaleString('de-DE')}</p>
        </div>

        <div style="border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px;padding:24px">

          <h3 style="margin:0 0 12px;color:#1d4ed8">📞 Kontakt</h3>
          <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
            <tr style="background:#f1f5f9">
              <td style="padding:10px;font-weight:600;width:140px">Name</td>
              <td style="padding:10px">${name}</td>
            </tr>
            <tr>
              <td style="padding:10px;font-weight:600">Telefon</td>
              <td style="padding:10px"><strong style="font-size:16px;color:#1d4ed8">${phone}</strong></td>
            </tr>
            <tr style="background:#f1f5f9">
              <td style="padding:10px;font-weight:600">E-Mail</td>
              <td style="padding:10px">${email}</td>
            </tr>
          </table>

          <h3 style="margin:0 0 12px;color:#1d4ed8">🔍 Fenster-Analyse (KI + Kundenangaben)</h3>
          <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
            <tr style="background:#f1f5f9">
              <td style="padding:10px;font-weight:600;width:140px">Fenstertyp</td>
              <td style="padding:10px">${windowType}</td>
            </tr>
            <tr>
              <td style="padding:10px;font-weight:600">Dichtungsprofil</td>
              <td style="padding:10px"><strong>${sealProfile || '-'}</strong></td>
            </tr>
            <tr style="background:#f1f5f9">
              <td style="padding:10px;font-weight:600">Dichtungsfarbe</td>
              <td style="padding:10px">${colorSwatch}<strong>${sealColor || '-'}</strong>${sealColorHex ? ` <span style="color:#94a3b8;font-size:12px">(${sealColorHex})</span>` : ''}</td>
            </tr>
            <tr>
              <td style="padding:10px;font-weight:600">Zustand</td>
              <td style="padding:10px">${condition}</td>
            </tr>
            <tr style="background:#f1f5f9">
              <td style="padding:10px;font-weight:600">KI-Notiz</td>
              <td style="padding:10px;font-style:italic;color:#64748b">${aiNotes || '-'}</td>
            </tr>
          </table>

          ${items.length > 0 ? `
          <h3 style="margin:0 0 12px;color:#1d4ed8">📋 Positionen (${items.length})</h3>
          <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
            <thead>
              <tr style="background:#dbeafe">
                <th style="padding:8px;text-align:left">Position</th>
                <th style="padding:8px;text-align:left">Maße</th>
                <th style="padding:8px;text-align:left">Umfang</th>
                <th style="padding:8px;text-align:left">Zustand</th>
              </tr>
            </thead>
            <tbody>${itemsHtml}</tbody>
          </table>` : ''}

          <div style="background:#dbeafe;border-radius:10px;padding:16px;margin-bottom:8px">
            <p style="margin:0;font-size:22px;font-weight:700;color:#1d4ed8">
              Beispielpreis: ${parseFloat(totalPrice).toFixed(0)} €
            </p>
            ${parseFloat(travelFee) > 0
              ? `<p style="margin:4px 0 0;font-size:13px;color:#9a3412">inkl. ${parseFloat(travelFee).toFixed(0)} € Anfahrtspauschale</p>`
              : ''}
            <p style="margin:4px 0 0;font-size:11px;color:#64748b">Unverbindliche Schätzung – kein verbindliches Angebot</p>
          </div>

          ${attachments.length > 0 ? `<p style="color:#64748b;font-size:13px;margin-top:16px">📎 ${attachments.length} Foto(s) im Anhang</p>` : ''}
        </div>
      </div>
    `;

    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, NOTIFY_EMAIL } = process.env;
    if (!SMTP_USER || !SMTP_PASS || !NOTIFY_EMAIL) {
      console.warn('E-Mail-Konfiguration fehlt');
      return NextResponse.json({ ok: true, warn: 'no_email_config' });
    }

    const transporter = nodemailer.createTransport({
      host: SMTP_HOST ?? 'smtp.gmail.com',
      port: parseInt(SMTP_PORT ?? '587'),
      secure: parseInt(SMTP_PORT ?? '587') === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });

    await transporter.sendMail({
      from: `"Maos Fensterservice App" <${SMTP_USER}>`,
      to: NOTIFY_EMAIL,
      subject: `🪟 Neue Anfrage: ${name} – ${phone}`,
      html,
      attachments,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Fehler:', err);
    return NextResponse.json({ error: 'Fehler beim Senden' }, { status: 500 });
  }
}
