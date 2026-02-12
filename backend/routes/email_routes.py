"""
Email Service for PIN Distribution
Uses Resend API for sending collection links and PINs to enumerators.
"""

import os
import asyncio
import logging
from typing import List, Optional
from datetime import datetime, timezone

import resend
from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr

from auth import get_current_user

load_dotenv()

# Configure logging
logger = logging.getLogger(__name__)

# Configure Resend
RESEND_API_KEY = os.environ.get("RESEND_API_KEY")
SENDER_EMAIL = os.environ.get("SENDER_EMAIL", "onboarding@resend.dev")

if RESEND_API_KEY:
    resend.api_key = RESEND_API_KEY
    logger.info("Resend API configured successfully")
else:
    logger.warning("RESEND_API_KEY not set - email sending will be disabled")

router = APIRouter(prefix="/email", tags=["Email"])


# Pydantic Models
class SingleEmailRequest(BaseModel):
    recipient_email: EmailStr
    recipient_name: str
    collection_link: str
    pin: Optional[str] = None
    expiry_date: Optional[str] = None
    template_id: Optional[str] = None  # Custom template ID


class BulkEmailRequest(BaseModel):
    recipients: List[dict]  # List of {email, name, link, pin, expiry}
    subject: Optional[str] = None
    template_id: Optional[str] = None


class EmailResponse(BaseModel):
    success: bool
    message: str
    email_id: Optional[str] = None
    failed_emails: Optional[List[str]] = None


# Email HTML Templates
def get_default_email_html(
    recipient_name: str,
    collection_link: str,
    pin: Optional[str] = None,
    expiry_date: Optional[str] = None
) -> str:
    """Generate default HTML email template for collection link distribution"""
    
    pin_section = ""
    if pin:
        pin_section = f"""
        <tr>
          <td style="padding: 20px 30px; background-color: #fef3c7; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0 0 8px 0; font-size: 14px; color: #92400e;">Your secure PIN:</p>
            <p style="margin: 0; font-size: 32px; font-weight: bold; color: #d97706; letter-spacing: 8px; font-family: monospace;">{pin}</p>
            <p style="margin: 8px 0 0 0; font-size: 12px; color: #92400e;">Keep this PIN confidential. You'll need it to access the collection link.</p>
          </td>
        </tr>
        <tr><td style="height: 20px;"></td></tr>
        """
    
    expiry_text = f"This link expires on <strong>{expiry_date}</strong>." if expiry_date else ""
    
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f3f4f6;">
        <tr>
          <td align="center" style="padding: 40px 20px;">
            <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <!-- Header -->
              <tr>
                <td style="padding: 30px 30px 20px 30px; text-align: center; background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%); border-radius: 12px 12px 0 0;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">FieldForce</h1>
                  <p style="margin: 8px 0 0 0; color: #e0f2fe; font-size: 14px;">Data Collection Platform</p>
                </td>
              </tr>
              
              <!-- Body -->
              <tr>
                <td style="padding: 30px;">
                  <h2 style="margin: 0 0 20px 0; color: #1f2937; font-size: 20px;">Hi {recipient_name}!</h2>
                  
                  <p style="margin: 0 0 20px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                    You have been assigned as a data collector. Use the link below to access your assigned surveys and start collecting data.
                  </p>
                  
                  {pin_section}
                  
                  <!-- CTA Button -->
                  <tr>
                    <td style="padding: 10px 0 20px 0;">
                      <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 0 auto;">
                        <tr>
                          <td style="background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%); border-radius: 8px;">
                            <a href="{collection_link}" target="_blank" style="display: inline-block; padding: 14px 32px; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600;">
                              Open Collection Link
                            </a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  
                  <!-- Link fallback -->
                  <tr>
                    <td style="padding: 20px; background-color: #f9fafb; border-radius: 8px;">
                      <p style="margin: 0 0 8px 0; font-size: 12px; color: #6b7280;">If the button doesn't work, copy and paste this link:</p>
                      <p style="margin: 0; font-size: 12px; color: #0ea5e9; word-break: break-all;">{collection_link}</p>
                    </td>
                  </tr>
                  
                  <tr><td style="height: 20px;"></td></tr>
                  
                  <p style="margin: 0; color: #6b7280; font-size: 14px;">
                    {expiry_text}
                  </p>
                  
                  <p style="margin: 20px 0 0 0; color: #4b5563; font-size: 14px;">
                    If you have any questions, please contact your supervisor.
                  </p>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="padding: 20px 30px; background-color: #f9fafb; border-radius: 0 0 12px 12px; text-align: center;">
                  <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                    Powered by FieldForce - Mobile Data Collection Made Simple
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
    """


def is_email_configured() -> bool:
    """Check if email service is properly configured"""
    return bool(RESEND_API_KEY)


@router.get("/status")
async def email_status():
    """Check if email service is configured and ready"""
    return {
        "configured": is_email_configured(),
        "sender_email": SENDER_EMAIL if is_email_configured() else None,
        "message": "Email service ready" if is_email_configured() else "RESEND_API_KEY not configured"
    }


@router.post("/send-single", response_model=EmailResponse)
async def send_single_email(
    request: SingleEmailRequest,
    current_user: dict = Depends(get_current_user)
):
    """Send a single email with collection link and optional PIN"""
    
    if not is_email_configured():
        raise HTTPException(
            status_code=503,
            detail="Email service not configured. Please add RESEND_API_KEY to environment."
        )
    
    # Generate HTML content
    html_content = get_default_email_html(
        recipient_name=request.recipient_name,
        collection_link=request.collection_link,
        pin=request.pin,
        expiry_date=request.expiry_date
    )
    
    params = {
        "from": SENDER_EMAIL,
        "to": [request.recipient_email],
        "subject": f"Your FieldForce Collection Link{' (PIN Required)' if request.pin else ''}",
        "html": html_content
    }
    
    try:
        # Run sync SDK in thread to keep FastAPI non-blocking
        email = await asyncio.to_thread(resend.Emails.send, params)
        
        logger.info(f"Email sent to {request.recipient_email}, ID: {email.get('id')}")
        
        return EmailResponse(
            success=True,
            message=f"Email sent to {request.recipient_email}",
            email_id=email.get("id")
        )
    except Exception as e:
        logger.error(f"Failed to send email to {request.recipient_email}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to send email: {str(e)}"
        )


@router.post("/send-bulk", response_model=EmailResponse)
async def send_bulk_emails(
    request: BulkEmailRequest,
    current_user: dict = Depends(get_current_user)
):
    """Send emails to multiple recipients with their collection links and PINs"""
    
    if not is_email_configured():
        raise HTTPException(
            status_code=503,
            detail="Email service not configured. Please add RESEND_API_KEY to environment."
        )
    
    if not request.recipients:
        raise HTTPException(status_code=400, detail="No recipients provided")
    
    sent_count = 0
    failed_emails = []
    
    for recipient in request.recipients:
        try:
            email_addr = recipient.get("email")
            name = recipient.get("name", "Team Member")
            link = recipient.get("link")
            pin = recipient.get("pin")
            expiry = recipient.get("expiry")
            
            if not email_addr or not link:
                failed_emails.append(f"{email_addr or 'unknown'} (missing data)")
                continue
            
            html_content = get_default_email_html(
                recipient_name=name,
                collection_link=link,
                pin=pin,
                expiry_date=expiry
            )
            
            subject = request.subject or f"Your FieldForce Collection Link{' (PIN Required)' if pin else ''}"
            
            params = {
                "from": SENDER_EMAIL,
                "to": [email_addr],
                "subject": subject,
                "html": html_content
            }
            
            await asyncio.to_thread(resend.Emails.send, params)
            sent_count += 1
            
            # Small delay between emails to avoid rate limiting
            await asyncio.sleep(0.1)
            
        except Exception as e:
            logger.error(f"Failed to send email to {recipient.get('email')}: {str(e)}")
            failed_emails.append(f"{recipient.get('email')} ({str(e)[:50]})")
    
    success = sent_count > 0
    message = f"Sent {sent_count}/{len(request.recipients)} emails"
    
    if failed_emails:
        message += f". Failed: {len(failed_emails)}"
    
    return EmailResponse(
        success=success,
        message=message,
        failed_emails=failed_emails if failed_emails else None
    )


@router.post("/test")
async def send_test_email(
    recipient_email: EmailStr,
    current_user: dict = Depends(get_current_user)
):
    """Send a test email to verify configuration"""
    
    if not is_email_configured():
        raise HTTPException(
            status_code=503,
            detail="Email service not configured. Please add RESEND_API_KEY to environment."
        )
    
    html_content = get_default_email_html(
        recipient_name="Test User",
        collection_link="https://example.com/collect/t/test123",
        pin="1234",
        expiry_date="March 15, 2026"
    )
    
    params = {
        "from": SENDER_EMAIL,
        "to": [recipient_email],
        "subject": "[TEST] FieldForce Collection Link",
        "html": html_content
    }
    
    try:
        email = await asyncio.to_thread(resend.Emails.send, params)
        return {
            "success": True,
            "message": f"Test email sent to {recipient_email}",
            "email_id": email.get("id")
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to send test email: {str(e)}"
        )
