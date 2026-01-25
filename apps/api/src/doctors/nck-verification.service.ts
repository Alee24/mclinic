
import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as querystring from 'querystring';

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

    async verifyNurse(searchQuery: string): Promise<NckVerificationResult> {
        try {
            const payload = querystring.stringify({
                search_register: '1',
                search_text: searchQuery
            });

            const res = await axios.post(this.baseUrl, payload, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                    'X-Requested-With': 'XMLHttpRequest',
                    'Origin': 'https://osp.nckenya.go.ke',
                    'Referer': 'https://osp.nckenya.go.ke/LicenseStatus'
                }
            });

            const html = res.data;
            if (!html || html.includes('No records found')) {
                return { success: false };
            }

            // Basic HTML parsing without Cheerio
            // Expected structure: <tr><td>NAME</td><td>LICENSE</td><td>Approved: DATE</td>...</tr>

            // 1. Extract Name (First column)
            // data-th="Name">ALICE KAROKI MBUI</td>
            const nameMatch = html.match(/data-th="Name">\s*([^<]+)\s*<\/td>/i) || html.match(/<td>\s*([A-Z\s]+)\s*<\/td>/i);
            const name = nameMatch ? nameMatch[1].trim() : null;

            // 2. Extract License (Second column)
            const licenseMatch = html.match(/data-th="License Number">\s*([^<]+)\s*<\/td>/i);
            const licenseNumber = licenseMatch ? licenseMatch[1].trim() : null;

            // 3. Extract Status/Date (Third column)
            // <span class='label label-danger'>Status:Inactive</span>  2025-07-31  </td>
            const statusMatch = html.match(/Status:([^<]+)</i);
            const status = statusMatch ? statusMatch[1].trim() : 'Unknown';

            // 4. Extract Date
            // The date usually follows the span. 2025-07-31
            const dateMatch = html.match(/\d{4}-\d{2}-\d{2}/);
            const expiryDate = dateMatch ? new Date(dateMatch[0]) : undefined;

            if (!name) return { success: false, raw: html };

            return {
                success: true,
                name,
                licenseNumber,
                status,
                expiryDate
            };

        } catch (error) {
            console.error('NCK Verification Error:', error.message);
            return { success: false, raw: error.message };
        }
    }
}
