/**
 * Email Templates for CookFort Authentication
 * Used by NextAuth for magic link emails
 */

export function getSignInEmailHtml(params: { url: string; host: string }) {
  const { url, host } = params;
  const brandColor = '#111827'; // gray-900
  const buttonColor = '#111827';
  const backgroundColor = '#f9fafb'; // gray-50

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sign in to CookFort</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: ${backgroundColor};">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: ${backgroundColor};">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">

          <!-- Header -->
          <tr>
            <td align="center" style="padding: 40px 40px 20px 40px;">
              <h1 style="margin: 0; font-size: 28px; font-weight: bold; color: ${brandColor};">
                🍳 CookFort
              </h1>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 20px 40px;">
              <h2 style="margin: 0 0 16px 0; font-size: 24px; font-weight: bold; color: ${brandColor};">
                Sign in to your account
              </h2>
              <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 24px; color: #6b7280;">
                Click the button below to securely sign in to your CookFort account. This link will expire in 24 hours.
              </p>

              <!-- Sign In Button -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="padding: 12px 0;">
                    <a href="${url}" target="_blank" style="display: inline-block; padding: 16px 48px; background-color: ${buttonColor}; color: #ffffff; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 16px;">
                      Sign in to CookFort
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Alternative Link -->
              <p style="margin: 24px 0 0 0; font-size: 14px; line-height: 20px; color: #6b7280;">
                If the button doesn't work, copy and paste this link into your browser:
              </p>
              <p style="margin: 8px 0 0 0; font-size: 12px; line-height: 18px; color: #3b82f6; word-break: break-all;">
                ${url}
              </p>
            </td>
          </tr>

          <!-- Security Notice -->
          <tr>
            <td style="padding: 20px 40px; background-color: #fef3c7; border-radius: 12px; margin: 20px;">
              <p style="margin: 0; font-size: 14px; line-height: 20px; color: #92400e;">
                <strong>🔒 Security Notice:</strong> If you didn't request this email, you can safely ignore it. This link will only work once and expires in 24 hours.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 40px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 8px 0; font-size: 14px; color: #6b7280;">
                This email was sent from <strong>${host}</strong>
              </p>
              <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                © ${new Date().getFullYear()} CookFort. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

export function getSignInEmailText(params: { url: string; host: string }) {
  const { url, host } = params;
  return `
Sign in to CookFort

Click the link below to sign in to your account:

${url}

This link will expire in 24 hours.

If you didn't request this email, you can safely ignore it.

---
This email was sent from ${host}
© ${new Date().getFullYear()} CookFort
  `.trim();
}
