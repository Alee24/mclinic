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

            // Improved Extraction Logic:
            // 1. Zoom into the first <tbody> row
            const tbodyStart = html.indexOf('<tbody');
            const tbodyEnd = html.indexOf('</tbody>');
            const tbodyHtml = tbodyStart !== -1 ? html.substring(tbodyStart, tbodyEnd + 8) : html;

            const firstRowMatch = tbodyHtml.match(/<tr[^>]*>([\s\S]*?)<\/tr>/i);
            const rowHtml = firstRowMatch ? firstRowMatch[1] : tbodyHtml;

            // 2. Extract <td>s from that row
            const allTds = rowHtml.match(/<td[^>]*>([\s\S]*?)<\/td>/gi) || [];

            // 3. Extract Name (First column)
            const name = allTds[0] ? allTds[0].replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim() : null;

            // 4. Extract License (Second column)
            const licenseNumber = allTds[1] ? allTds[1].replace(/<[^>]+>/g, '').trim() : null;

            // 5. Extract Status/Date (Third column)
            const statusCol = allTds[2] || '';
            const statusMatch = statusCol.match(/Status:([^<]+)</i);
            const status = statusMatch ? statusMatch[1].trim() : 'Unknown';

            // 6. Extract Date
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
