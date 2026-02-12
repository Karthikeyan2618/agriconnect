from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from io import BytesIO

def generate_invoice_pdf(order):
    buffer = BytesIO()
    p = canvas.Canvas(buffer, pagesize=letter)
    width, height = letter

    # Header
    p.setFont("Helvetica-Bold", 20)
    p.drawString(50, height - 50, "Agriconnect Invoice")

    p.setFont("Helvetica", 12)
    p.drawString(50, height - 80, f"Order ID: #{order.id}")
    p.drawString(50, height - 100, f"Date: {order.created_at.strftime('%Y-%m-%d')}")
    p.drawString(50, height - 120, f"Buyer: {order.buyer.username}")
    p.drawString(50, height - 140, f"Status: {order.get_status_display()}")

    # Table Header
    y = height - 180
    p.setFont("Helvetica-Bold", 12)
    p.drawString(50, y, "Product")
    p.drawString(300, y, "Quantity")
    p.drawString(400, y, "Price")
    p.drawString(500, y, "Total")
    
    y -= 20
    p.line(50, y+15, 550, y+15)

    # Items
    p.setFont("Helvetica", 12)
    for item in order.items.all():
        if y < 100:
            p.showPage()
            y = height - 50
        
        item_total = item.quantity * item.price
        p.drawString(50, y, item.product.name[:30])
        p.drawString(300, y, str(item.quantity))
        p.drawString(400, y, f"${item.price}")
        p.drawString(500, y, f"${item_total}")
        y -= 20

    p.line(50, y+10, 550, y+10)
    y -= 30

    # Total
    p.setFont("Helvetica-Bold", 14)
    p.drawString(400, y, f"Grand Total: ${order.total_amount}")

    p.showPage()
    p.save()

    buffer.seek(0)
    return buffer
