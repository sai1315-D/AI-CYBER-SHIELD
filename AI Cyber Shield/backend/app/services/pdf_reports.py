from datetime import datetime
from io import BytesIO
from typing import Any

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle


def _format_scan_date(value: str | None) -> str:
    if not value:
        return "Not available"

    try:
        parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
        return parsed.strftime("%Y-%m-%d %H:%M:%S UTC")
    except ValueError:
        return value


def _scan_value(report: dict[str, Any], key: str, fallback: Any = "Not available") -> Any:
    scan = report.get("scan") or {}
    return scan.get(key, fallback)


def generate_scan_pdf(report: dict[str, Any]) -> BytesIO:
    buffer = BytesIO()
    document = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=0.7 * inch,
        leftMargin=0.7 * inch,
        topMargin=0.65 * inch,
        bottomMargin=0.65 * inch,
        title="AI Cyber Shield Scan Report",
    )
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        "CyberTitle",
        parent=styles["Title"],
        textColor=colors.HexColor("#0f172a"),
        fontSize=22,
        leading=28,
        spaceAfter=16,
    )
    section_style = ParagraphStyle(
        "CyberSection",
        parent=styles["Heading2"],
        textColor=colors.HexColor("#0f766e"),
        fontSize=13,
        leading=18,
        spaceBefore=12,
        spaceAfter=8,
    )
    body_style = ParagraphStyle(
        "CyberBody",
        parent=styles["BodyText"],
        textColor=colors.HexColor("#334155"),
        fontSize=10,
        leading=15,
    )

    threat_score = _scan_value(report, "threat_score", 0)
    ai_prediction = _scan_value(report, "status", report.get("status", "Not available"))
    file_name = report.get("original_filename", "Not available")
    scan_date = _format_scan_date(report.get("uploaded_at"))

    rows = [
        ["File name", file_name],
        ["Scan date", scan_date],
        ["Threat score", f"{threat_score}%"],
        ["AI prediction", ai_prediction],
    ]

    table = Table(rows, colWidths=[1.65 * inch, 4.65 * inch])
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (0, -1), colors.HexColor("#ecfeff")),
                ("TEXTCOLOR", (0, 0), (0, -1), colors.HexColor("#0f766e")),
                ("TEXTCOLOR", (1, 0), (1, -1), colors.HexColor("#0f172a")),
                ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
                ("FONTNAME", (1, 0), (1, -1), "Helvetica"),
                ("FONTSIZE", (0, 0), (-1, -1), 10),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("LEFTPADDING", (0, 0), (-1, -1), 10),
                ("RIGHTPADDING", (0, 0), (-1, -1), 10),
                ("TOPPADDING", (0, 0), (-1, -1), 9),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 9),
            ]
        )
    )

    findings = _scan_value(report, "findings", [])
    story = [
        Paragraph("AI Cyber Shield Scan Report", title_style),
        Paragraph("Scan Summary", section_style),
        table,
        Spacer(1, 0.18 * inch),
        Paragraph("AI Findings", section_style),
    ]

    if findings:
        for finding in findings:
            story.append(Paragraph(f"- {finding}", body_style))
            story.append(Spacer(1, 0.04 * inch))
    else:
        story.append(Paragraph("No additional findings were recorded.", body_style))

    story.extend(
        [
            Spacer(1, 0.18 * inch),
            Paragraph("Note", section_style),
            Paragraph(
                "This report is generated from automated analysis signals and should be reviewed by a security analyst before production decisions.",
                body_style,
            ),
        ]
    )

    document.build(story)
    buffer.seek(0)
    return buffer
