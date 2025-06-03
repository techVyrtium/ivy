const emailBodyMessage = (secretKey) => {
  const message = `<div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
  <div style="margin:50px auto;width:70%;padding:20px 0">
    <div style="border-bottom:1px solid #eee">
      <a href="" style="font-size:1.4em;color: #4facfe;text-decoration:none;font-weight:600">🤖 Vyrtium Marketing</a>
    </div>
    <p style="font-size:1.1em">Hello!</p>
    <p>Welcome to Vyrtium Marketing AI Agent! Your account has been successfully created. Use the following secret key to access your AI marketing assistant and start creating amazing campaigns.</p>
    <h2 style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);margin: 0 auto;width: max-content;padding: 15px 25px;color: #fff;border-radius: 8px;font-family: 'Courier New', monospace;letter-spacing: 1px;box-shadow: 0 4px 15px rgba(79, 172, 254, 0.3);">secret_key_${secretKey}</h2>
    <div style="background: #f8f9ff;border-left: 4px solid #4facfe;padding: 15px;margin: 20px 0;border-radius: 0 5px 5px 0;">
      <h3 style="margin-top: 0;color: #333;font-size: 1.1em;">🔑 How to use your secret key:</h3>
      <ul style="margin: 10px 0;padding-left: 20px;color: #555;">
        <li>Copy the secret key exactly as shown above</li>
        <li>It is useful when you will change your device</li>
      </ul>
    </div>
    <div style="background: #fff3cd;border: 1px solid #ffeaa7;padding: 15px;border-radius: 5px;margin: 20px 0;">
      <p style="margin: 0;color: #856404;font-weight: 500;">🛡️ <strong>Security Notice:</strong> Keep this key secure and never share it with unauthorized users. This key provides full access to your AI marketing agent.</p>
    </div>
    <p style="font-size:0.9em;">Best regards,<br />Vyrtium Marketing Team</p>
    <hr style="border:none;border-top:1px solid #eee" />
    <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
      <p>Vyrtium Marketing</p>
      <p>AI-Powered Marketing Solutions</p>
      <p>contact@vyrtium.com</p>
    </div>
  </div>
</div>`;

  return message;
};

export default emailBodyMessage;
