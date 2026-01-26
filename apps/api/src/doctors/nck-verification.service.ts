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
    imageUrl?: string;
    qualifications?: string;
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

            // Step 1: Search to get the list
            const res = await axios.post(this.baseUrl, payload, {
                httpsAgent: this.httpsAgent,
                timeout: 10000,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                    'Origin': 'https://osp.nckenya.go.ke',
                    'Referer': 'https://osp.nckenya.go.ke/LicenseStatus'
                }
            });

            const html = res.data;
            if (!html || (typeof html === 'string' && html.includes('No records found'))) {
                return { success: false };
            }

            // Extract basic info from the table
            const tbodyStart = html.indexOf('<tbody');
            const tbodyEnd = html.indexOf('</tbody>');
            const tbodyHtml = tbodyStart !== -1 ? html.substring(tbodyStart, tbodyEnd + 8) : html;

            const firstRowMatch = tbodyHtml.match(/<tr[^>]*>([\s\S]*?)<\/tr>/i);
            const rowHtml = firstRowMatch ? firstRowMatch[1] : tbodyHtml;
            const allTds = rowHtml.match(/<td[^>]*>([\s\S]*?)<\/td>/gi) || [];

            const name = allTds[0] ? allTds[0].replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim() : null;
            const licenseNumber = allTds[1] ? allTds[1].replace(/<[^>]+>/g, '').trim() : null;

            const statusCol = allTds[2] || '';
            const statusMatch = statusCol.match(/Status:([^<]+)</i);
            const status = statusMatch ? statusMatch[1].trim() : 'Unknown';

            const dateMatch = statusCol.match(/\d{4}-\d{2}-\d{2}/);
            const expiryDate = dateMatch ? new Date(dateMatch[0]) : undefined;

            // Step 2: Extract "View Details" Link
            // Look for <a href="..." ...>View Details</a> or similar
            // Usually it's in the 4th column
            const viewMoreCol = allTds[3] || '';
            const hrefMatch = viewMoreCol.match(/href="([^"]+)"/i);
            let detailsUrl = hrefMatch ? hrefMatch[1] : null;

            let imageUrl: string | undefined;
            let qualifications: string | undefined;

            if (detailsUrl) {
                if (!detailsUrl.startsWith('http')) {
                    detailsUrl = `https://osp.nckenya.go.ke${detailsUrl}`;
                }

                try {
                    console.log(`[NCK] Fetching details from ${detailsUrl}...`);
                    const detailRes = await axios.get(detailsUrl, {
                        httpsAgent: this.httpsAgent,
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                            'Referer': this.baseUrl
                        }
                    });

                    const detailHtml = detailRes.data;

                    // Step 3: Extract Image
                    // Look for <img ... src="..."> inside the profile area. 
                    // Usually the first substantial image or inside specific container.
                    // A generic regex for img: <img[^>]+src="([^">]+)"

                    // Specific to screenshot: it's on the left.
                    const imgMatch = detailHtml.match(/<img[^>]+src="([^"]+)"[^>]*class="[^"]*img-circle[^"]*"/i) ||
                        detailHtml.match(/<img[^>]+src="([^"]+)"[^>]*alt="User Image"/i);
                    // Fallback

                    if (imgMatch) {
                        imageUrl = imgMatch[1];
                        if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('data:')) {
                            // Handle relative paths
                            imageUrl = `https://osp.nckenya.go.ke${imageUrl}`;
                        }
                    }

                    // Step 4: Extract Qualifications
                    // In screenshot: "Training Information/Qualifications" header, then a list or text below it.
                    // Look for the Header, then grab content after it until some closing div.
                    // Simplistic approach: Search for "Training Information" and grab following text.
                    const qualHeaderIndex = detailHtml.indexOf('Training Information/Qualifications');
                    if (qualHeaderIndex !== -1) {
                        // Grab a chunk after this
                        const chunk = detailHtml.substring(qualHeaderIndex, qualHeaderIndex + 1000);
                        // Remove HTML tags to get raw text, cleanup
                        // It might be in <li> or just <p> or <div>
                        // Let's rely on basic stripping of tags for the immediate content
                        const cleanChunk = chunk.replace(/<[^>]+>/g, '\n').replace(/\s+/g, ' ').trim();
                        // The text "Training Information/Qualifications" itself is in the chunk, remove it
                        qualifications = cleanChunk.replace('Training Information/Qualifications', '').trim();
                        // Truncate to avoid grabbing footer
                        if (qualifications && qualifications.length > 200) {
                            qualifications = qualifications.substring(0, 200) + '...';
                        }
                    }

                } catch (detErr) {
                    console.error('[NCK] Failed to fetch details page:', detErr.message);
                }
            }

            if (!name) return { success: false };

            console.log(`[NCK] Verified ${name} - Status: ${status} - Img: ${!!imageUrl}`);

            return {
                success: true,
                name,
                licenseNumber,
                status,
                expiryDate,
                imageUrl,
                qualifications
            };

        } catch (error) {
            console.error(`[NCK] Verification Failed for ${searchQuery}:`, error.message);
            return { success: false, raw: error.message };
        }
    }
}
