import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const { email, language = 'es' } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: 'El correo electrónico es requerido' },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({ success: true });
    }

    // Generate secure token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Delete any existing tokens for this email
    await prisma.passwordResetToken.deleteMany({
      where: { email: email.toLowerCase() },
    });

    // Create new token
    await prisma.passwordResetToken.create({
      data: {
        email: email.toLowerCase(),
        token,
        expiresAt,
      },
    });

    // Get the base URL for the reset link
    const baseUrl = process.env.NEXTAUTH_URL || 'https://pastoralhistory.com';
    const resetLink = `${baseUrl}/reset-password?token=${token}`;

    // Bilingual email content
    const isEnglish = language === 'en';
    const emailContent = {
      tagline: isEnglish ? 'Pastoral care with integrity' : 'Cuidado pastoral con integridad',
      title: isEnglish ? 'Password Reset Request' : 'Solicitud de Restablecimiento de Contraseña',
      intro: isEnglish 
        ? 'We have received a request to reset the password for your Pastoral History account.'
        : 'Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en Pastoral History.',
      instructions: isEnglish
        ? 'Click the button below to create a new password:'
        : 'Haz clic en el siguiente botón para crear una nueva contraseña:',
      buttonText: isEnglish ? 'Reset Password' : 'Restablecer Contraseña',
      ignoreNote: isEnglish
        ? 'If you did not request this change, you can ignore this email. Your password will remain the same.'
        : 'Si no solicitaste este cambio, puedes ignorar este correo. Tu contraseña permanecerá igual.',
      expiryNote: isEnglish
        ? 'This link will expire in <strong>1 hour</strong>.'
        : 'Este enlace expirará en <strong>1 hora</strong>.',
      fallbackNote: isEnglish
        ? 'If the button doesn\'t work, copy and paste this link into your browser:'
        : 'Si el botón no funciona, copia y pega este enlace en tu navegador:',
      footer: isEnglish
        ? 'Pastoral care with integrity and compassion'
        : 'Cuidado pastoral con integridad y compasión',
    };

    // Send password reset email
    const htmlBody = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #fdfdf5;">
        <div style="background: linear-gradient(135deg, #6B7B3C 0%, #4A5D23 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Pastoral History</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 14px;">${emailContent.tagline}</p>
        </div>
        
        <div style="padding: 40px 30px; background: white;">
          <h2 style="color: #4A5D23; margin: 0 0 20px 0; font-size: 20px;">
            ${emailContent.title}
          </h2>
          
          <p style="color: #555; line-height: 1.6; margin: 0 0 20px 0;">
            ${emailContent.intro}
          </p>
          
          <p style="color: #555; line-height: 1.6; margin: 0 0 30px 0;">
            ${emailContent.instructions}
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" 
               style="display: inline-block; background: #6B7B3C; color: white; padding: 14px 40px; 
                      text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
              ${emailContent.buttonText}
            </a>
          </div>
          
          <p style="color: #888; font-size: 13px; line-height: 1.5; margin: 30px 0 0 0;">
            ${emailContent.ignoreNote}
          </p>
          
          <p style="color: #888; font-size: 13px; line-height: 1.5; margin: 15px 0 0 0;">
            ${emailContent.expiryNote}
          </p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          
          <p style="color: #aaa; font-size: 11px; margin: 0;">
            ${emailContent.fallbackNote}<br>
            <a href="${resetLink}" style="color: #6B7B3C; word-break: break-all;">${resetLink}</a>
          </p>
        </div>
        
        <div style="background: #f5f5f0; padding: 20px; text-align: center;">
          <p style="color: #888; font-size: 12px; margin: 0;">
            © ${new Date().getFullYear()} Pastoral History - ${emailContent.footer}
          </p>
        </div>
      </div>
    `;

    try {
      const emailResponse = await fetch('https://apps.abacus.ai/api/sendNotificationEmail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deployment_token: process.env.ABACUSAI_API_KEY,
          app_id: process.env.WEB_APP_ID,
          notification_id: process.env.NOTIF_ID_PASSWORD_RESET,
          subject: isEnglish ? 'Reset Password - Pastoral History' : 'Restablecer contraseña - Pastoral History',
          body: htmlBody,
          is_html: true,
          recipient_email: user.email,
          sender_email: 'noreply@pastoralhistory.com',
          sender_alias: 'Pastoral History',
        }),
      });

      const emailResult = await emailResponse.json();
      
      if (!emailResult.success) {
        console.error('Failed to send password reset email:', emailResult);
        // Still return success to not reveal if email exists
      }
    } catch (emailError) {
      console.error('Error sending password reset email:', emailError);
      // Still return success to not reveal if email exists
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Error al procesar la solicitud' },
      { status: 500 }
    );
  }
}
