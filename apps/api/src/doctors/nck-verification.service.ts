import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as querystring from 'querystring';
import * as https from 'https';

export interface NckVerificationResult {
    success: boolean;
    name?: string;
    licenseNumber?: string;
    status?: string;
    expiryDate?: Date;
    raw?: string;
}

@Injectable()
export class NckVerificationService {
    private readonly baseUrl = 'https://osp.nckenya.go.ke/ajax/public';
    private readonly httpsAgent = new https.Agent({ rejectUnauthorized: false });

    async verifyNurse(searchQuery: string): Promise<NckVerificationResult> {
        try {
            console.log(`[NCK] Probing for ${searchQuery}...`);
            const payload = querystring.stringify({
                search_register: '1',
                search_text: searchQuery
            });

            const res = await axios.post(this.baseUrl, payload, {
                httpsAgent: this.httpsAgent,
                timeout: 10000, // 10s timeout per request
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                    'X-Requested-With': 'XMLHttpRequest',
                    'Origin': 'https://osp.nckenya.go.ke',
                    'Referer': 'https://osp.nckenya.go.ke/LicenseStatus'
                }
            });

            const html = res.data;
            if (!html || (typeof html === 'string' && html.includes('No records found'))) {
                return { success: false };
            }

            // 1. Extract Name (First column)
            // Example: <td style="...">NAME</td> or <td data-th="Name">NAME</td>
            const nameMatch = html.match(/<td[^>]*data-th="Name"[^>]*>\s*([\s\S]*?)\s*<\/td>/i) ||
                html.match(/<td[^>]*>\s*([A-Z\s']+)\s*<\/td>/i);
            const name = nameMatch ? nameMatch[1].replace(/&nbsp;/g, ' ').trim() : null;

            // 2. Extract License (Second column)
            // We look for the second <td> or one with data-th="License Number"
            const allTds = html.match(/<td[^>]*>[\s\S]*?<\/td>/gi) || [];
            const licenseNumber = allTds[1] ? allTds[1].replace(/<[^>]+>/g, '').trim() : null;

            // 3. Extract Status/Date (Third column)
            const statusCol = allTds[2] || '';
            const statusMatch = statusCol.match(/Status:([^<]+)</i);
            const status = statusMatch ? statusMatch[1].trim() : 'Unknown';

            // 4. Extract Date
            const dateMatch = statusCol.match(/\d{4}-\d{2}-\d{2}/);
            const expiryDate = dateMatch ? new Date(dateMatch[0]) : undefined;

            if (!name) {
                console.log(`[NCK] Could not parse results for ${searchQuery}`);
                return { success: false, raw: typeof html === 'string' ? html.substring(0, 200) : 'Invalid data' };
            }

            console.log(`[NCK] Verified ${name} - Status: ${status}`);

            return {
                success: true,
                name,
                licenseNumber,
                status,
                expiryDate
            };

        } catch (error) {
            console.error(`[NCK] Verification Failed for ${searchQuery}:`, error.message);
            return { success: false, raw: error.message };
        }
    }
}
