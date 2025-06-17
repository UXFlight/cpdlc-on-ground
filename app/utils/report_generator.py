from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from io import BytesIO
import datetime

def generate_pdf_report(pilot_id: str, stats: dict):
    buffer = BytesIO()
    pdf = canvas.Canvas(buffer, pagesize=A4)
    width, height = A4

    y = height - 50
    pdf.setFont("Helvetica-Bold", 16)
    pdf.drawString(50, y, f"Pilot Report - {pilot_id}")
    y -= 30
    pdf.setFont("Helvetica", 10)
    pdf.drawString(50, y, f"Generated at: {datetime.datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S UTC')}")
    y -= 40

    def draw_section(title, data):
        nonlocal y
        pdf.setFont("Helvetica-Bold", 12)
        pdf.drawString(50, y, title)
        y -= 20
        pdf.setFont("Helvetica", 10)
        for key, value in data.items():
            if isinstance(value, dict):
                pdf.drawString(60, y, f"{key}:")
                y -= 15
                for subkey, subval in value.items():
                    pdf.drawString(80, y, f"- {subkey}: {subval}")
                    y -= 12
            else:
                pdf.drawString(60, y, f"{key}: {value}")
                y -= 15
        y -= 10

    draw_section("System Metrics", stats.get("system_metrics", {}))
    draw_section("Pilot Metrics", stats.get("pilot_metrics", {}))

    pdf.showPage()
    pdf.save()
    buffer.seek(0)
    return buffer
