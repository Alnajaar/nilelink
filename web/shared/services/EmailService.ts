/**
 * EmailService.ts
 * Shared Email Service for NileLink Ecosystem
 * 
 * Implements the "Trigger Email" pattern using Firebase Firestore.
 * This is perfect for decentralized deployments where no traditional 
 * backend server is available for direct SMTP handling.
 */

import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';

export interface EmailRequest {
    to: string | string[];
    message: {
        subject: string;
        text?: string;
        html: string;
    };
    template?: {
        name: string;
        data: any;
    };
}

class EmailService {
    private db = getFirestore();
    private mailCollection = collection(this.db, 'mail');

    /**
     * Generic method to send an email via Firebase "Trigger Email" extension
     */
    async sendEmail(request: EmailRequest): Promise<{ success: boolean; error?: string }> {
        try {
            await addDoc(this.mailCollection, {
                ...request,
                delivery: {
                    state: 'PENDING',
                    attempts: 0,
                    startTime: serverTimestamp()
                }
            });
            return { success: true };
        } catch (error: any) {
            console.error('Email service error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Specialized method for Order Invoices
     */
    async sendOrderInvoice(email: string, orderData: any): Promise<{ success: boolean; error?: string }> {
        const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <div style="background: #00C389; padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0;">NileLink Order Confirmed</h1>
        </div>
        <div style="padding: 20px; border: 1px solid #eee; border-top: none; border-radius: 0 0 12px 12px;">
          <p>Hi ${orderData.customerName || 'Explorer'},</p>
          <p>Your order <strong>#${orderData.id.slice(-6).toUpperCase()}</strong> has been successfully placed!</p>
          
          <div style="margin: 20px 0; border: 1px solid #eee; padding: 15px; border-radius: 8px;">
            <h3 style="margin-top: 0;">Order Summary</h3>
            <table style="width: 100%; border-collapse: collapse;">
              ${orderData.items.map((item: any) => `
                <tr>
                  <td style="padding: 5px 0;">${item.name} x ${item.quantity}</td>
                  <td style="text-align: right;">$${(item.price * item.quantity).toFixed(2)}</td>
                </tr>
              `).join('')}
              <tr style="border-top: 2px solid #eee;">
                <td style="padding: 10px 0; font-weight: bold;">Total</td>
                <td style="text-align: right; font-weight: bold;">$${orderData.total.toFixed(2)}</td>
              </tr>
            </table>
          </div>
          
          <p>You can track your real-time delivery status in the NileLink Customer app.</p>
          <a href="https://customer.nilelink.app/orders/${orderData.id}" 
             style="display: inline-block; background: #00C389; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">
            Track Order
          </a>
        </div>
        <div style="text-align: center; margin-top: 20px; font-size: 12px; color: #999;">
          &copy; ${new Date().getFullYear()} NileLink. All rights reserved.
        </div>
      </div>
    `;

        return this.sendEmail({
            to: email,
            message: {
                subject: `Order Confirmation #${orderData.id.slice(-6).toUpperCase()}`,
                html
            }
        });
    }

    /**
     * Specialized method for Platform Notifications
     */
    async sendPlatformNotification(email: string, title: string, message: string): Promise<{ success: boolean; error?: string }> {
        const html = `
       <div style="font-family: Arial, sans-serif; padding: 20px;">
         <h2 style="color: #00C389;">${title}</h2>
         <p>${message}</p>
         <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
         <p style="font-size: 12px; color: #999;">This is an automated notification from NileLink.</p>
       </div>
    `;

        return this.sendEmail({
            to: email,
            message: {
                subject: title,
                html
            }
        });
    }
}

export const emailService = new EmailService();
export default emailService;
