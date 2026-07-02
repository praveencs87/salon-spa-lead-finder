# Salon and Spa Lead Finder

**Extract highly targeted B2B lead profiles of local salons and spas from directories, and automatically deep-scrape their websites for verified Instagram profiles and WhatsApp numbers.**

The beauty and wellness industry is massive. Whether you are a beauty product wholesaler, a local digital marketing agency, or a SaaS platform (like Vagaro or Mindbody), building a targeted database of salons is crucial. This actor goes beyond simple directory scraping by performing an **advanced two-step deep scrape**.

## What can this Actor do?

- ✅ **Advanced Two-Step Routing** - First, it scrapes major directories (like YellowPages) for the Salon's Name, Phone, Address, Rating, and Website URL. Second, if a website exists, it instantly visits that website to hunt for social media profiles!
- ✅ **Social Media Extraction** - Parses the salon's actual website to find their official `instagram.com` profile link.
- ✅ **WhatsApp Extraction** - Hunts the website DOM for direct messaging links (`wa.me` or `api.whatsapp.com`), giving you a direct line to the business owner.
- ✅ **High Speed** - Bypasses directory bot protections using advanced TLS fingerprinting (`got-scraping`).

## Why use this Actor?

- 🎯 **Marketing Agencies** - Pitch your social media management services directly to salons via their Instagram DMs.
- 🤝 **Product Wholesalers** - Build massive outreach lists (via WhatsApp) to sell salon equipment, hair products, and spa supplies.
- 📊 **SaaS Sales** - Sell booking and scheduling software to salons with high review counts but poor digital presence.

## How to use it

1. Go to YellowPages (YP.com) and search for "Salon" or "Spa" in your target city.
2. Copy the URL from your browser (e.g., `https://www.yellowpages.com/search?search_terms=salon&geo_location_terms=Los+Angeles%2C+CA`) and paste it into the **Directory Search URLs** field.
3. Set the **Max Leads to Extract** limit (default is 500).
4. Click Start!

## How much does it cost?

Because of the advanced deep-scraping step that yields highly valuable social media and messaging contacts, this actor uses a premium **Pay-Per-Event (PPE)** pricing model. You only pay for the exact number of leads successfully extracted!
- **$2.00 per 1,000 salon leads extracted.**

## Output Example

When a salon lead is fully extracted (after deep-scraping their website), the actor pushes this data to your dataset:

```json
{
  "salonName": "Glow Beauty Bar",
  "phone": "(323) 555-9876",
  "address": "789 Sunset Blvd, Los Angeles, CA 90028",
  "rating": "4.8",
  "reviewCount": "156",
  "website": "http://www.glowbeautybarla.com",
  "instagram": "https://www.instagram.com/glowbeautybarla",
  "whatsapp": "https://wa.me/13235559876",
  "scrapedAt": "2023-10-25T15:00:00.000Z"
}
```
