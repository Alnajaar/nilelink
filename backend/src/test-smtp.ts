import dotenv from 'dotenv';

// Load environment variables from project root
console.log("CWD:", process.cwd());
dotenv.config({ path: '../.env' });
console.log("Loaded .env file");

import { mailer } from './lib/mailer';

// STEP 6️⃣ — TEST SMTP CONNECTION (CRITICAL)
async function testSMTPConnection() {
  console.log("DEBUG: SMTP_HOST =", process.env.SMTP_HOST);
  console.log("DEBUG: SMTP_PORT =", process.env.SMTP_PORT);
  console.log("DEBUG: SMTP_USER =", process.env.SMTP_USER ? "***" : "undefined");

  try {
    await mailer.verify();
    console.log("✅ SMTP IS WORKING");
    return true;
  } catch (error) {
    console.error("❌ SMTP CONNECTION FAILED:", error);
    return false;
  }
}

// STEP 7️⃣ — Send First Real Email Test
async function sendTestEmail() {
  try {
    const result = await mailer.sendMail({
      from: process.env.FROM_EMAIL,
      to: "yourpersonalemail@gmail.com", // Replace with your email
      subject: "NileLink Test Email",
      text: "If you see this, email is working 🎉",
    });

    if (result.accepted && result.accepted.length > 0) {
      console.log("✅ TEST EMAIL SENT SUCCESSFULLY");
      console.log("Check your inbox and spam folder!");
      return true;
    } else {
      console.log("❌ EMAIL SENDING FAILED");
      console.log("Result:", result);
      return false;
    }
  } catch (error) {
    console.error("❌ EMAIL SENDING ERROR:", error);
    return false;
  }
}

// STEP 8️⃣ — OTP Example (Simple & Safe)
async function sendOTPExample() {
  const otp = Math.floor(100000 + Math.random() * 900000);

  try {
    const result = await mailer.sendMail({
      to: "yourpersonalemail@gmail.com", // Replace with user email
      subject: "Your NileLink OTP Code",
      html: `
        <h2>NileLink Verification</h2>
        <p>Your OTP code is:</p>
        <h1>${otp}</h1>
        <p>This code expires in 5 minutes.</p>
      `,
    });

    if (result.accepted && result.accepted.length > 0) {
      console.log("✅ OTP EMAIL SENT:", otp);
      return otp;
    } else {
      console.log("❌ OTP EMAIL FAILED");
      return null;
    }
  } catch (error) {
    console.error("❌ OTP EMAIL ERROR:", error);
    return null;
  }
}

// Run tests
async function runTests() {
  console.log("🔄 Testing SMTP Connection...");
  const smtpWorking = await testSMTPConnection();

  if (smtpWorking) {
    console.log("\n🔄 Sending test email...");
    await sendTestEmail();

    console.log("\n🔄 Sending OTP example...");
    await sendOTPExample();
  } else {
    console.log("\n❌ Fix SMTP configuration before proceeding");
  }
}

// Run if called directly
if (require.main === module) {
  runTests().catch(console.error);
}

export { testSMTPConnection, sendTestEmail, sendOTPExample };
