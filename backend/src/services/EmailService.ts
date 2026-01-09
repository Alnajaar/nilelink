import nodemailer from 'nodemailer';
import { logger } from '../utils/logger';

interface EmailOptions {
    to: string;
    subject: string;
    text: string;
    html: string;
}

class EmailService {
    private transporter: nodemailer.Transporter;
    private readonly MAX_RETRIES = 3;
    private readonly DEFAULT_FROM = '"NileLink" <no-reply@nilelink.app>';

    constructor() {
        if (process.env.SMTP_HOST && process.env.SMTP_USER) {
            this.transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST,
                port: parseInt(process.env.SMTP_PORT || '587'),
                secure: process.env.SMTP_SECURE === 'true',
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS,
                },
            });
            logger.info('EmailService: SMTP Transport configured');
        } else {
            // Mock Transport
            this.transporter = nodemailer.createTransport({
                jsonTransport: true
            });
            logger.warn('EmailService: No SMTP credentials found. Using Mock Transport (logs only).');
        }
    }

    async sendEmail(options: EmailOptions): Promise<boolean> {
        let attempts = 0;

        while (attempts < this.MAX_RETRIES) {
            try {
                const info = await this.transporter.sendMail({
                    from: this.DEFAULT_FROM,
                    to: options.to,
                    subject: options.subject,
                    text: options.text,
                    html: options.html,
                });

                if (this.transporter.transporter.name === 'jsonTransport') {
                    logger.info(`[MOCK EMAIL] Sent to: ${options.to} | Subject: ${options.subject}`);
                    // For mock transport, we log the plain text for verification
                    console.log('--- MOCK EMAIL START ---');
                    console.log(`To: ${options.to}`);
                    console.log(`Subject: ${options.subject}`);
                    console.log('Body:', options.text);
                    console.log('--- MOCK EMAIL END ---');
                } else {
                    logger.info(`Email sent: ${info.messageId} (Attempt ${attempts + 1})`);
                }

                return true;
            } catch (error) {
                attempts++;
                logger.error(`Attempt ${attempts} failed to send email to ${options.to}:`, error);
                if (attempts === this.MAX_RETRIES) {
                    logger.error(`Max retries reached for email to ${options.to}`);
                    return false;
                }
                // Exponential backoff or simple delay could be added here
                await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
            }
        }
        return false;
    }

    // 1️⃣ Registration Confirmation Email
    async sendRegistrationConfirmation(to: string, userName: string, verifyLink: string, expiresIn: string): Promise<boolean> {
        const subject = 'Confirm your NileLink account';
        const text = `Hello ${userName},\n\nWelcome to NileLink.\n\nTo activate your account, please confirm your email address by clicking the link below:\n\n${verifyLink}\n\nThis link will expire in ${expiresIn}.\n\nIf you did not create a NileLink account, you can safely ignore this email.\n\n— NileLink Team\nSecure Commerce Infrastructure`;
        const html = `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; line-height: 1.6;">
                <p>Hello <strong>${userName}</strong>,</p>
                <p>Welcome to NileLink.</p>
                <p>To activate your account, please confirm your email address by clicking the button below:</p>
                <div style="margin: 30px 0;">
                    <a href="${verifyLink}" style="background: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Confirm Account</a>
                </div>
                <p>This link will expire in <strong>${expiresIn}</strong>.</p>
                <p>If you did not create a NileLink account, you can safely ignore this email.</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                <p style="font-size: 12px; color: #666;">— NileLink Team<br>Secure Commerce Infrastructure</p>
            </div>
        `;
        return this.sendEmail({ to, subject, text, html });
    }

    // 2️⃣ Password Reset Email
    async sendPasswordReset(to: string, userName: string, resetLink: string, expiresIn: string): Promise<boolean> {
        const subject = 'Reset your NileLink password';
        const text = `Hello ${userName},\n\nWe received a request to reset your NileLink password.\n\nYou can reset your password using the link below:\n\n${resetLink}\n\nThis link will expire in ${expiresIn}.\n\nIf you did not request a password reset, please ignore this email.\n\n— NileLink Security Team`;
        const html = `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; line-height: 1.6;">
                <p>Hello <strong>${userName}</strong>,</p>
                <p>We received a request to reset your NileLink password.</p>
                <p>You can reset your password using the button below:</p>
                <div style="margin: 30px 0;">
                    <a href="${resetLink}" style="background: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Reset Password</a>
                </div>
                <p>This link will expire in <strong>${expiresIn}</strong>.</p>
                <p>If you did not request a password reset, please ignore this email.</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                <p style="font-size: 12px; color: #666;">— NileLink Security Team</p>
            </div>
        `;
        return this.sendEmail({ to, subject, text, html });
    }

    // 3️⃣ OTP Code Email
    async sendOtpCode(to: string, userName: string, otpCode: string, expiresIn: string): Promise<boolean> {
        const subject = 'Your NileLink verification code';
        const text = `Hello ${userName},\n\nYour NileLink verification code is:\n\n${otpCode}\n\nThis code will expire in ${expiresIn}.\n\nDo not share this code with anyone.\n\n— NileLink Security System`;
        const html = `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; line-height: 1.6;">
                <p>Hello <strong>${userName}</strong>,</p>
                <p>Your NileLink verification code is:</p>
                <div style="margin: 20px 0; background: #f4f4f4; padding: 20px; text-align: center; border-radius: 8px;">
                    <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #000;">${otpCode}</span>
                </div>
                <p>This code will expire in <strong>${expiresIn}</strong>.</p>
                <p>Do not share this code with anyone.</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                <p style="font-size: 12px; color: #666;">— NileLink Security System</p>
            </div>
        `;
        return this.sendEmail({ to, subject, text, html });
    }

    // 4️⃣ Order Receipt Email
    async sendOrderReceipt(to: string, data: {
        orderId: string,
        orderDate: string,
        itemsSummary: string,
        totalAmount: string,
        paymentMethod: string,
        merchantName: string
    }): Promise<boolean> {
        const subject = `Your NileLink receipt — Order ${data.orderId}`;
        const text = `Thank you for your purchase.\n\nOrder ID: ${data.orderId}\nDate: ${data.orderDate}\nMerchant: ${data.merchantName}\n\nItems:\n${data.itemsSummary}\n\nTotal Paid: ${data.totalAmount}\nPayment Method: ${data.paymentMethod}\n\nThis is your official receipt.\n\n— NileLink POS System`;
        const html = `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; line-height: 1.6;">
                <h2 style="color: #000;">Thank you for your purchase.</h2>
                <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #eee;">
                    <p style="margin: 0;"><strong>Order ID:</strong> ${data.orderId}</p>
                    <p style="margin: 0;"><strong>Date:</strong> ${data.orderDate}</p>
                    <p style="margin: 0;"><strong>Merchant:</strong> ${data.merchantName}</p>
                </div>
                <div style="margin-bottom: 20px;">
                    <h3 style="border-bottom: 1px solid #eee; padding-bottom: 10px;">Items</h3>
                    <pre style="font-family: inherit; font-size: 14px; white-space: pre-wrap;">${data.itemsSummary}</pre>
                </div>
                <div style="background: #f4f4f4; padding: 20px; border-radius: 8px;">
                    <p style="margin: 0; font-size: 18px;"><strong>Total Paid: ${data.totalAmount}</strong></p>
                    <p style="margin: 0; color: #666;">Payment Method: ${data.paymentMethod}</p>
                </div>
                <p style="margin-top: 20px;">This is your official receipt.</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                <p style="font-size: 12px; color: #666;">— NileLink POS System</p>
            </div>
        `;
        return this.sendEmail({ to, subject, text, html });
    }

    // 5️⃣ Delivery System Emails
    // 🚚 A) Order Assigned to Driver
    async sendOrderAssigned(to: string, data: {
        driverName: string,
        orderId: string,
        pickupAddress: string,
        deliveryAddress: string
    }): Promise<boolean> {
        const subject = `New delivery assigned — Order ${data.orderId}`;
        const text = `Hello ${data.driverName},\n\nYou have been assigned a new delivery.\n\nOrder ID: ${data.orderId}\nPickup Location: ${data.pickupAddress}\nDelivery Address: ${data.deliveryAddress}\n\nPlease open the NileLink app to view details.\n\n— NileLink Delivery System`;
        const html = `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; line-height: 1.6;">
                <p>Hello <strong>${data.driverName}</strong>,</p>
                <p>You have been assigned a new delivery.</p>
                <div style="background: #eef2ff; padding: 20px; border-radius: 8px; border-left: 4px solid #4f46e5;">
                    <p style="margin: 0;"><strong>Order ID:</strong> ${data.orderId}</p>
                    <p style="margin: 5px 0;"><strong>Pickup:</strong> ${data.pickupAddress}</p>
                    <p style="margin: 5px 0;"><strong>Delivery:</strong> ${data.deliveryAddress}</p>
                </div>
                <p>Please open the <strong>NileLink app</strong> to view full details and start the route.</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                <p style="font-size: 12px; color: #666;">— NileLink Delivery System</p>
            </div>
        `;
        return this.sendEmail({ to, subject, text, html });
    }

    // 🚚 B) Order Delivered (Customer)
    async sendOrderDelivered(to: string, customerName: string, orderId: string): Promise<boolean> {
        const subject = 'Your order has been delivered';
        const text = `Hello ${customerName},\n\nYour order ${orderId} has been successfully delivered.\n\nThank you for using NileLink.\n\n— NileLink Delivery Network`;
        const html = `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; line-height: 1.6;">
                <p>Hello <strong>${customerName}</strong>,</p>
                <div style="text-align: center; margin: 20px 0;">
                    <div style="font-size: 40px;">🚚</div>
                    <h2 style="color: #059669; margin-top: 10px;">Delivered Successfully</h2>
                </div>
                <p>Your order <strong>${orderId}</strong> has been successfully delivered.</p>
                <p>Thank you for using NileLink.</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                <p style="font-size: 12px; color: #666;">— NileLink Delivery Network</p>
            </div>
        `;
        return this.sendEmail({ to, subject, text, html });
    }

    // 6️⃣ Supplier System Emails
    // 🏭 A) New Purchase Order to Supplier
    async sendPurchaseOrder(to: string, data: {
        supplierName: string,
        orderId: string,
        itemsSummary: string,
        deliveryDate: string
    }): Promise<boolean> {
        const subject = `New supply order — ${data.orderId}`;
        const text = `Hello ${data.supplierName},\n\nA new supply order has been placed.\n\nOrder ID: ${data.orderId}\nItems: ${data.itemsSummary}\nExpected Delivery Date: ${data.deliveryDate}\n\nPlease confirm availability in the NileLink Supplier Portal.\n\n— NileLink Supplier Network`;
        const html = `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; line-height: 1.6;">
                <p>Hello <strong>${data.supplierName}</strong>,</p>
                <p>A new supply order has been placed.</p>
                <div style="background: #fff7ed; padding: 20px; border-radius: 8px; border: 1px solid #fdba74;">
                    <p style="margin: 0;"><strong>Order ID:</strong> ${data.orderId}</p>
                    <p style="margin: 5px 0;"><strong>Expected Date:</strong> ${data.deliveryDate}</p>
                    <div style="margin-top: 10px;">
                        <strong>Items:</strong>
                        <pre style="font-family: inherit; font-size: 14px; margin: 5px 0;">${data.itemsSummary}</pre>
                    </div>
                </div>
                <p>Please confirm availability in the <strong>NileLink Supplier Portal</strong>.</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                <p style="font-size: 12px; color: #666;">— NileLink Supplier Network</p>
            </div>
        `;
        return this.sendEmail({ to, subject, text, html });
    }

    // 📦 B) Stock Low Alert (Merchant)
    async sendLowStockAlert(to: string, data: {
        merchantName: string,
        itemName: string,
        currentStock: number
    }): Promise<boolean> {
        const subject = `Low inventory alert — ${data.itemName}`;
        const text = `Hello ${data.merchantName},\n\nYour inventory for the following item is running low:\n\nItem: ${data.itemName}\nCurrent Stock: ${data.currentStock}\n\nConsider reordering to avoid shortages.\n\n— NileLink Inventory System`;
        const html = `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; line-height: 1.6;">
                <p>Hello <strong>${data.merchantName}</strong>,</p>
                <div style="background: #fef2f2; padding: 20px; border-radius: 8px; border-left: 4px solid #dc2626;">
                    <h3 style="color: #991b1b; margin-top: 0;">⚠️ Low Inventory Alert</h3>
                    <p style="margin: 0;">Item: <strong>${data.itemName}</strong></p>
                    <p style="margin: 5px 0;">Current Stock: <span style="color: #dc2626; font-weight: bold;">${data.currentStock}</span></p>
                </div>
                <p>Consider reordering to avoid shortages and maintain operational continuity.</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                <p style="font-size: 12px; color: #666;">— NileLink Inventory System</p>
            </div>
        `;
        return this.sendEmail({ to, subject, text, html });
    }

    // 7️⃣ Investing & Trading System Emails
    // 💰 A) Investment Confirmation
    async sendInvestmentConfirmation(to: string, data: {
        investorName: string,
        amount: string,
        projectName: string,
        transactionId: string
    }): Promise<boolean> {
        const subject = 'Investment confirmed — NileLink';
        const text = `Hello ${data.investorName},\n\nYour investment has been successfully recorded.\n\nAmount: ${data.amount}\nProject: ${data.projectName}\nTransaction ID: ${data.transactionId}\n\nThank you for supporting the NileLink ecosystem.\n\n— NileLink Investment Platform`;
        const html = `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; line-height: 1.6;">
                <p>Hello <strong>${data.investorName}</strong>,</p>
                <div style="text-align: center; margin: 20px 0;">
                    <div style="font-size: 40px;">💰</div>
                    <h2 style="color: #0d9488; margin-top: 10px;">Investment Confirmed</h2>
                </div>
                <div style="background: #f0fdfa; padding: 20px; border-radius: 8px; border: 1px solid #5eead4;">
                    <p style="margin: 0;"><strong>Amount:</strong> ${data.amount}</p>
                    <p style="margin: 5px 0;"><strong>Project:</strong> ${data.projectName}</p>
                    <p style="margin: 5px 0;"><strong>Transaction ID:</strong> ${data.transactionId}</p>
                </div>
                <p>Thank you for supporting the NileLink ecosystem.</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                <p style="font-size: 12px; color: #666;">— NileLink Investment Platform</p>
            </div>
        `;
        return this.sendEmail({ to, subject, text, html });
    }

    // 📈 B) Trade Executed
    async sendTradeExecuted(to: string, data: {
        userName: string,
        assetName: string,
        amount: string,
        price: string,
        transactionId: string
    }): Promise<boolean> {
        const subject = 'Trade executed successfully';
        const text = `Hello ${data.userName},\n\nYour trade has been executed.\n\nAsset: ${data.assetName}\nAmount: ${data.amount}\nPrice: ${data.price}\nTransaction ID: ${data.transactionId}\n\nYou can view details in your dashboard.\n\n— NileLink Trading System`;
        const html = `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; line-height: 1.6;">
                <p>Hello <strong>${data.userName}</strong>,</p>
                <div style="background: #f8fafc; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0;">
                    <h3 style="margin-top: 0; color: #334155;">📈 Trade Executed</h3>
                    <p style="margin: 0;">Asset: <strong>${data.assetName}</strong></p>
                    <p style="margin: 5px 0;">Amount: ${data.amount}</p>
                    <p style="margin: 5px 0;">Price: ${data.price}</p>
                    <p style="margin: 5px 0; font-size: 12px; color: #666;">ID: ${data.transactionId}</p>
                </div>
                <p>You can view full transaction details in your dashboard.</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                <p style="font-size: 12px; color: #666;">— NileLink Trading System</p>
            </div>
        `;
        return this.sendEmail({ to, subject, text, html });
    }
}

export const emailService = new EmailService();
