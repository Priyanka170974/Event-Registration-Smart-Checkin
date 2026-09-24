import jsPDF from 'jspdf';
import QRCode from 'qrcode';
import { formatDate, formatTime } from './format';

export async function downloadTicketPdf(registration) {
  const { event, attendeeName, ticketId, qrPayload } = registration;
  const qrDataUrl = await QRCode.toDataURL(qrPayload || ticketId, {
    errorCorrectionLevel: 'H',
    margin: 1,
    width: 420,
    color: { dark: '#172a3a', light: '#ffffff' },
  });

  const document = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageWidth = document.internal.pageSize.getWidth();
  const navy = '#172a3a';
  const teal = '#1f6f68';
  const mint = '#dff3ec';
  const muted = '#667785';
  const light = '#f3f7f6';

  document.setFillColor(light);
  document.rect(0, 0, pageWidth, document.internal.pageSize.getHeight(), 'F');

  document.setFillColor(navy);
  document.roundedRect(14, 14, pageWidth - 28, 42, 5, 5, 'F');
  document.setFillColor(teal);
  document.rect(14, 52, pageWidth - 28, 4, 'F');

  document.setTextColor('#ffffff');
  document.setFont('helvetica', 'bold');
  document.setFontSize(22);
  document.text('EVENTFLOW', 24, 31);
  document.setFont('helvetica', 'normal');
  document.setFontSize(10);
  document.setTextColor('#cce9e1');
  document.text('DIGITAL EVENT TICKET', 24, 40);

  document.setTextColor(teal);
  document.setFont('helvetica', 'bold');
  document.setFontSize(9);
  document.text('ATTENDEE', 24, 76);
  document.setTextColor(navy);
  document.setFontSize(20);
  document.text(attendeeName, 24, 87);

  document.setTextColor(muted);
  document.setFont('helvetica', 'normal');
  document.setFontSize(10);
  document.text('EVENT', 24, 104);
  document.setTextColor(navy);
  document.setFont('helvetica', 'bold');
  document.setFontSize(15);
  document.text(event.name, 24, 114);

  document.setTextColor(muted);
  document.setFont('helvetica', 'normal');
  document.setFontSize(10);
  document.text('DATE', 24, 132);
  document.text('TIME', 83, 132);
  document.text('VENUE', 137, 132);
  document.setTextColor(navy);
  document.setFont('helvetica', 'bold');
  document.setFontSize(11);
  document.text(formatDate(event.date, true), 24, 142);
  document.text(formatTime(event.time), 83, 142);
  document.text(event.venue, 137, 142);

  document.setDrawColor('#b9cbc6');
  document.setLineDashPattern([2, 2], 0);
  document.line(20, 164, pageWidth - 20, 164);
  document.setLineDashPattern([], 0);

  document.addImage(qrDataUrl, 'PNG', 24, 176, 48, 48);
  document.setTextColor(teal);
  document.setFont('helvetica', 'bold');
  document.setFontSize(9);
  document.text('SCAN AT CHECK-IN', 83, 188);
  document.setTextColor(navy);
  document.setFontSize(14);
  document.text(ticketId, 83, 199);
  document.setTextColor(muted);
  document.setFont('helvetica', 'normal');
  document.setFontSize(9);
  document.text('Present this QR code at the event entrance.', 83, 208);
  document.text('Keep your ticket private — it admits one attendee.', 83, 216);

  document.setFillColor(mint);
  document.roundedRect(20, 244, pageWidth - 40, 20, 3, 3, 'F');
  document.setTextColor(teal);
  document.setFont('helvetica', 'bold');
  document.setFontSize(10);
  document.text('ONE TICKET • ONE CHECK-IN', 28, 257);

  document.setTextColor(muted);
  document.setFont('helvetica', 'normal');
  document.setFontSize(8);
  document.text('Generated securely by EventFlow', 20, 282);

  document.save(`${ticketId}.pdf`);
}
