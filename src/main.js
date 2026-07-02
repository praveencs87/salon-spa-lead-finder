import { Actor } from 'apify';
import { CheerioCrawler, log } from 'crawlee';

await Actor.init();

try {
    const input = await Actor.getInput();
    if (!input || !input.searchUrls || input.searchUrls.length === 0) {
        throw new Error('searchUrls input is required!');
    }

    const { searchUrls, maxLeads = 500 } = input;

    let totalLeadsExtracted = 0;

    const crawler = new CheerioCrawler({
        maxConcurrency: 10, // Slightly higher for 2-step process
        maxRequestRetries: 3,
        
        async requestHandler({ request, $, log, enqueueLinks }) {
            const label = request.userData.label || 'DIRECTORY';

            if (label === 'DIRECTORY') {
                log.info(`Scraping Directory Page: ${request.url}`);
                
                if ($('title').text().toLowerCase().includes('robot') || $('title').text().toLowerCase().includes('captcha')) {
                    throw new Error('Blocked by security check. Retrying with new fingerprint...');
                }

                const cards = $('.result, .srp-listing, .business-card').toArray();
                let leadsOnPage = 0;

                for (const card of cards) {
                    if (totalLeadsExtracted >= maxLeads) break;

                    const el = $(card);
                    
                    let salonName = el.find('.business-name, h2 a, .info h2').text().trim() || null;
                    let phone = el.find('.phone, .phones').text().trim() || null;
                    
                    let street = el.find('.street-address').text().trim() || '';
                    let locality = el.find('.locality').text().trim() || '';
                    let address = street && locality ? `${street}, ${locality}` : (street || locality || null);
                    
                    if (!address) {
                        address = el.find('.adr, .address').text().trim().replace(/\s+/g, ' ') || null;
                    }

                    let websiteHref = el.find('a.track-visit-website, a[href^="http"].website').attr('href') || null;
                    if (websiteHref && websiteHref.includes('yellowpages.com')) websiteHref = null;

                    let ratingClass = el.find('.result-rating').attr('class') || '';
                    let rating = null;
                    const ratingMatch = ratingClass.match(/rating?s?-?([\d\.]+)/i);
                    if (ratingMatch) {
                        rating = (parseInt(ratingMatch[1]) / 10).toString();
                    } else {
                        rating = el.find('.rating, .star-rating').text().trim() || null;
                    }

                    let reviewCount = el.find('.count, .reviews').text().trim() || null;
                    if (reviewCount) reviewCount = reviewCount.replace(/[()]/g, '').replace('reviews', '').trim();

                    if (!salonName) continue;

                    const baseLead = {
                        salonName,
                        phone,
                        address,
                        rating,
                        reviewCount,
                        website: websiteHref,
                        instagram: null,
                        whatsapp: null,
                        scrapedAt: new Date().toISOString()
                    };

                    if (websiteHref) {
                        // Enqueue deep scrape
                        await crawler.addRequests([{
                            url: websiteHref,
                            userData: { label: 'WEBSITE', leadData: baseLead },
                            uniqueKey: `website-${websiteHref}`
                        }]);
                        log.info(`Enqueued deep scrape for: ${websiteHref}`);
                    } else {
                        // Push immediately if no website
                        await pushLead(baseLead);
                    }
                    leadsOnPage++;
                }

                // Pagination
                if (totalLeadsExtracted < maxLeads) {
                    const nextBtn = $('a.next, a.next-ajax, a[rel="next"]').attr('href');
                    if (nextBtn) {
                        let nextUrl = nextBtn.startsWith('http') ? nextBtn : new URL(nextBtn, 'https://www.yellowpages.com').href;
                        await crawler.addRequests([{ url: nextUrl, userData: { label: 'DIRECTORY' } }]);
                    }
                }
            } else if (label === 'WEBSITE') {
                // Step 2: Deep Scrape Website for IG/WhatsApp
                log.info(`Deep scraping website: ${request.url}`);
                const leadData = request.userData.leadData;

                // Extract Instagram
                const igLink = $('a[href*="instagram.com/"]').attr('href');
                if (igLink && !igLink.includes('explore/tags')) {
                    leadData.instagram = igLink;
                }

                // Extract WhatsApp
                const waLink = $('a[href*="wa.me/"], a[href*="api.whatsapp.com/send"]').attr('href');
                if (waLink) {
                    leadData.whatsapp = waLink;
                }

                // If not found in hrefs, we could do a quick regex search on the HTML string (optional, but hrefs are safer)
                
                await pushLead(leadData);
            }
        },
        
        async failedRequestHandler({ request, log }) {
            log.error(`Failed to scrape ${request.url} after multiple retries.`);
            if (request.userData.label === 'WEBSITE' && request.userData.leadData) {
                // If website deep-scrape fails, still push the base directory data!
                log.info(`Website scrape failed for ${request.url}, pushing base directory data.`);
                await pushLead(request.userData.leadData);
            }
        },
    });

    async function pushLead(output) {
        if (totalLeadsExtracted >= maxLeads) return;
        await Actor.pushData(output);
        totalLeadsExtracted++;
        
        // PPE Monetization - $2.00 per 1000 leads (higher due to deep scraping value)
        await Actor.charge({ eventName: 'lead-extracted', count: 1 });
    }

    log.info(`Starting Salon and Spa Lead Finder (2-Step) for ${searchUrls.length} start URLs...`);
    
    const initialRequests = searchUrls.map(req => ({ url: typeof req === 'string' ? req : req.url, userData: { label: 'DIRECTORY' } }));
    await crawler.addRequests(initialRequests);
    await crawler.run();

    log.info(`🎉 Finished! Extracted ${totalLeadsExtracted} salon leads.`);
} catch (error) {
    log.error('Actor failed:', error);
    throw error;
}

await Actor.exit();
