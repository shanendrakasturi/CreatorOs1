import io
import datetime
from typing import Dict, Any

try:
    from reportlab.lib.pagesizes import letter
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib import colors
    REPORTLAB_AVAILABLE = True
except ImportError:
    REPORTLAB_AVAILABLE = False

class PDFService:
    def generate_invoice_pdf(self, invoice: Dict[str, Any]) -> io.BytesIO:
        buffer = io.BytesIO()
        
        if not REPORTLAB_AVAILABLE:
            # Fallback text-based PDF representation
            buffer.write(f"CREATOROS INVOICE\n".encode())
            buffer.write(f"=================\n\n".encode())
            buffer.write(f"Invoice Number: {invoice.get('invoice_number', 'N/A')}\n".encode())
            buffer.write(f"Status: {invoice.get('status', 'Draft')}\n".encode())
            buffer.write(f"Due Date: {invoice.get('due_date', 'N/A')}\n".encode())
            buffer.write(f"Amount: ${invoice.get('amount', 0.00):,.2f}\n\n".encode())
            buffer.write(f"Creator: Alex Rivera\n".encode())
            buffer.write(f"Brand/Client: {invoice.get('brand_name', 'N/A')}\n".encode())
            buffer.write(f"Created via CreatorOS - Professional Suite\n".encode())
            buffer.seek(0)
            return buffer

        doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=40, leftMargin=40, topMargin=40, bottomMargin=40)
        story = []
        styles = getSampleStyleSheet()

        # Styles
        title_style = ParagraphStyle(
            'TitleStyle',
            parent=styles['Heading1'],
            fontSize=24,
            leading=28,
            textColor=colors.HexColor('#155CBE')
        )
        meta_style = ParagraphStyle(
            'MetaStyle',
            parent=styles['Normal'],
            fontSize=10,
            leading=14,
            textColor=colors.HexColor('#222222')
        )
        header_style = ParagraphStyle(
            'HeaderStyle',
            parent=styles['Heading2'],
            fontSize=12,
            leading=16,
            textColor=colors.HexColor('#FFFFFF')
        )

        # Header Info
        story.append(Paragraph("INVOICE", title_style))
        story.append(Spacer(1, 15))

        # Invoice Metadata Table
        invoice_num = invoice.get('invoice_number', 'N/A')
        due_date = invoice.get('due_date', str(datetime.date.today()))
        brand_name = invoice.get('brand_name', 'N/A')
        amount = invoice.get('amount', 0.00)

        meta_data = [
            [Paragraph("<b>From:</b><br/>Alex Rivera<br/>alex@rivera.tech", meta_style), 
             Paragraph(f"<b>Invoice #:</b> {invoice_num}<br/><b>Date:</b> {datetime.date.today()}<br/><b>Due Date:</b> {due_date}", meta_style)],
            [Paragraph(f"<b>To (Client):</b><br/>{brand_name}", meta_style), 
             Paragraph(f"<b>Status:</b> {invoice.get('status', 'Unpaid')}<br/><b>Payment Term:</b> Net 30", meta_style)]
        ]
        
        meta_table = Table(meta_data, colWidths=[260, 260])
        meta_table.setStyle(TableStyle([
            ('VALIGN', (0,0), (-1,-1), 'TOP'),
            ('BOTTOMPADDING', (0,0), (-1,-1), 10),
        ]))
        story.append(meta_table)
        story.append(Spacer(1, 30))

        # Items Table
        items_data = [
            [Paragraph("<b>Item Description</b>", header_style), Paragraph("<b>Qty</b>", header_style), Paragraph("<b>Amount</b>", header_style)],
            [Paragraph(f"Sponsorship & Content Integration - {brand_name}", meta_style), Paragraph("1", meta_style), Paragraph(f"${amount:,.2f}", meta_style)],
            [Paragraph("", meta_style), Paragraph("<b>Total</b>", meta_style), Paragraph(f"<b>${amount:,.2f}</b>", meta_style)]
        ]
        
        items_table = Table(items_data, colWidths=[360, 60, 100])
        items_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#155CBE')),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('GRID', (0,0), (-1,1), 0.5, colors.HexColor('#CCCCCC')),
            ('BOTTOMPADDING', (0,0), (-1,-1), 8),
            ('TOPPADDING', (0,0), (-1,-1), 8),
            ('ALIGN', (1,0), (-1,-1), 'CENTER'),
        ]))
        story.append(items_table)
        
        story.append(Spacer(1, 40))
        story.append(Paragraph("<b>Payment Instructions:</b><br/>Please transfer funds to Bank details listed below.<br/>Bank Name: Creators Bank<br/>Account Number: 1234-5678-9012<br/>Routing: 987654321", meta_style))
        story.append(Spacer(1, 20))
        story.append(Paragraph("<i>Thank you for your business! Let's build together.</i>", meta_style))

        doc.build(story)
        buffer.seek(0)
        return buffer

    def generate_mediakit_pdf(self, creator: Dict[str, Any]) -> io.BytesIO:
        buffer = io.BytesIO()
        
        if not REPORTLAB_AVAILABLE:
            # Fallback text
            buffer.write(f"CREATOROS MEDIA KIT\n".encode())
            buffer.write(f"===================\n\n".encode())
            buffer.write(f"Creator: {creator.get('full_name', 'Alex Rivera')}\n".encode())
            buffer.write(f"Niche: {creator.get('niche', 'Technology')}\n".encode())
            buffer.write(f"Bio: {creator.get('bio', '')}\n\n".encode())
            buffer.write(f"Stats summary:\n".encode())
            buffer.write(f"YouTube: 850k followers\n".encode())
            buffer.write(f"Instagram: 420k followers\n".encode())
            buffer.write(f"TikTok: 1.2M followers\n\n".encode())
            buffer.write(f"Rates:\n".encode())
            buffer.write(f"YouTube Dedicated: $15,000\n".encode())
            buffer.write(f"YouTube Integration: $8,500\n".encode())
            buffer.write(f"Instagram Reel: $5,000\n".encode())
            buffer.seek(0)
            return buffer

        doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=45, leftMargin=45, topMargin=45, bottomMargin=45)
        story = []
        styles = getSampleStyleSheet()

        title_style = ParagraphStyle(
            'KitTitle',
            parent=styles['Heading1'],
            fontSize=28,
            leading=32,
            textColor=colors.HexColor('#155CBE')
        )
        subtitle_style = ParagraphStyle(
            'KitSubtitle',
            parent=styles['Heading3'],
            fontSize=14,
            leading=18,
            textColor=colors.HexColor('#454747')
        )
        body_style = ParagraphStyle(
            'KitBody',
            parent=styles['Normal'],
            fontSize=10,
            leading=15,
            textColor=colors.HexColor('#222222')
        )
        th_style = ParagraphStyle(
            'KitTH',
            parent=styles['Normal'],
            fontSize=10,
            leading=12,
            textColor=colors.HexColor('#FFFFFF'),
            fontName='Helvetica-Bold'
        )

        story.append(Paragraph(creator.get('full_name', 'Alex Rivera'), title_style))
        story.append(Paragraph(creator.get('niche', 'Digital Creator'), subtitle_style))
        story.append(Spacer(1, 15))
        
        story.append(Paragraph(f"<b>About Me:</b> {creator.get('bio', '')}", body_style))
        story.append(Spacer(1, 20))
        
        # Audience Demographics
        story.append(Paragraph("<b>Audience & Channels</b>", subtitle_style))
        story.append(Spacer(1, 10))

        channels_data = [
            [Paragraph("<b>Platform</b>", th_style), Paragraph("<b>Handle</b>", th_style), Paragraph("<b>Subscribers</b>", th_style), Paragraph("<b>Engagement</b>", th_style)],
            [Paragraph("YouTube", body_style), Paragraph("@alexriveratech", body_style), Paragraph("850k", body_style), Paragraph("4.8%", body_style)],
            [Paragraph("Instagram", body_style), Paragraph("@alexrivera", body_style), Paragraph("420k", body_style), Paragraph("5.2%", body_style)],
            [Paragraph("TikTok", body_style), Paragraph("@alexrivera_tech", body_style), Paragraph("1.2M", body_style), Paragraph("8.1%", body_style)],
        ]
        
        channels_table = Table(channels_data, colWidths=[120, 150, 120, 120])
        channels_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#155CBE')),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CCCCCC')),
            ('BOTTOMPADDING', (0,0), (-1,-1), 8),
            ('TOPPADDING', (0,0), (-1,-1), 8),
        ]))
        story.append(channels_table)
        story.append(Spacer(1, 25))

        # Rates Table
        story.append(Paragraph("<b>Rate Card (2026)</b>", subtitle_style))
        story.append(Spacer(1, 10))

        rates_data = [
            [Paragraph("<b>Deliverable Service</b>", th_style), Paragraph("<b>Est. Delivery Time</b>", th_style), Paragraph("<b>Base Cost</b>", th_style)],
            [Paragraph("YouTube Dedicated Review Video", body_style), Paragraph("10-14 days", body_style), Paragraph("$15,000", body_style)],
            [Paragraph("YouTube Integration (60s midroll)", body_style), Paragraph("7 days", body_style), Paragraph("$8,500", body_style)],
            [Paragraph("Instagram Reel / TikTok placement", body_style), Paragraph("3-5 days", body_style), Paragraph("$5,000", body_style)],
            [Paragraph("Cross-Platform Pack (YT + IG)", body_style), Paragraph("14 days", body_style), Paragraph("$18,000", body_style)],
        ]
        
        rates_table = Table(rates_data, colWidths=[240, 140, 130])
        rates_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#454747')),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CCCCCC')),
            ('BOTTOMPADDING', (0,0), (-1,-1), 8),
            ('TOPPADDING', (0,0), (-1,-1), 8),
        ]))
        story.append(rates_table)
        
        story.append(Spacer(1, 30))
        story.append(Paragraph("<i>Rates are baseline estimates and open to package negotiation. Contact: partners@rivera.tech</i>", body_style))

        doc.build(story)
        buffer.seek(0)
        return buffer
