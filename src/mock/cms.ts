import type { WebsiteStudioData } from "@/types/cms";

const now = "2026-06-29T09:00:00.000Z";

export const websiteStudioData: WebsiteStudioData = {
  banners: [
    {
      active: true,
      ctaLabel: "Shop best sellers",
      ctaLink: "/collections/best-sellers",
      desktopImageUrl: "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?auto=format&fit=crop&w=1600&q=80",
      endDate: "2026-07-15",
      id: "banner-hero-sale",
      mobileImageUrl: "https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?auto=format&fit=crop&w=900&q=80",
      startDate: "2026-06-25",
      targetPage: "homepage",
      title: "Protein month banner"
    }
  ],
  blogPosts: [
    {
      author: "FitSupplement Editorial",
      category: "Protein Guide",
      content:
        "Choose protein based on your daily nutrition goal, dietary preference, label transparency, and serving size. Supplements support nutrition planning and are not a substitute for a balanced diet.",
      disclaimerEnabled: true,
      featuredImageUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1000&q=80",
      id: "blog-protein-guide",
      publishedAt: "2026-06-20",
      relatedProductIds: ["prod-whey-elite", "prod-creatine-mono"],
      seoDescription: "A supplement-safe guide to choosing protein powder by goal, label clarity, and serving size.",
      seoTitle: "How to Choose Protein Powder",
      slug: "how-to-choose-protein-powder",
      status: "published",
      title: "How to choose protein powder without overcomplicating it"
    },
    {
      author: "FitSupplement Editorial",
      category: "Wellness",
      content:
        "Daily wellness stacks should be simple, consistent, and label-led. Consult a qualified professional if you are pregnant, nursing, under medication, or have a medical condition.",
      disclaimerEnabled: true,
      id: "blog-wellness-stack",
      publishedAt: "2026-06-22",
      relatedProductIds: ["prod-multivitamin"],
      seoDescription: "Build a simple daily wellness supplement stack with responsible, label-first shopping.",
      seoTitle: "Daily Wellness Stack Guide",
      slug: "daily-wellness-stack-guide",
      status: "published",
      title: "A simple daily wellness stack for busy training weeks"
    }
  ],
  footer: {
    contactEmail: "care@fitsupplement.example",
    contactPhone: "+91 90000 00000",
    copyrightText: "Copyright 2026 FitSupplement Store",
    description:
      "Premium sports nutrition and wellness essentials with transparent labels, batch-aware inventory, and trustworthy shopping flows.",
    footerColumns: [
      {
        enabled: true,
        id: "footer-shop",
        links: [
          { id: "footer-protein", label: "Protein Powders", url: "/categories/protein-powders" },
          { id: "footer-performance", label: "Creatine", url: "/categories/performance" },
          { id: "footer-vitamins", label: "Vitamins", url: "/categories/vitamins-wellness" }
        ],
        title: "Shop"
      },
      {
        enabled: true,
        id: "footer-policies",
        links: [
          { id: "footer-shipping", label: "Shipping Policy", url: "/pages/shipping-policy" },
          { id: "footer-returns", label: "Return Policy", url: "/pages/return-policy" },
          { id: "footer-privacy", label: "Privacy Policy", url: "/pages/privacy-policy" }
        ],
        title: "Policies"
      },
      {
        enabled: true,
        id: "footer-company",
        links: [
          { id: "footer-about", label: "About Us", url: "/pages/about-us" },
          { id: "footer-contact", label: "Contact Us", url: "/pages/contact-us" },
          { id: "footer-admin", label: "Admin", url: "/admin" }
        ],
        title: "Company"
      }
    ],
    newsletterText: "Get product drops, guide updates, and responsible supplement shopping notes.",
    paymentIcons: ["UPI", "Visa", "Mastercard", "Razorpay", "Cashfree"],
    socialLinks: [{ id: "social-instagram", label: "Instagram", url: "https://instagram.com" }]
  },
  header: {
    announcementText: "Free shipping above Rs 1,999 - authenticity checked batches",
    announcementUrl: "/collections/best-sellers",
    enableAccount: true,
    enableCart: true,
    enableSearch: true,
    enableWishlist: true,
    logoAlt: "FitSupplement Store",
    logoText: "FitSupplement Store",
    megaMenuItems: [
      {
        enabled: true,
        id: "menu-shop",
        label: "Shop all",
        linkType: "page",
        url: "/products",
        children: [
          { enabled: true, id: "menu-protein", label: "Protein Powders", linkType: "category", url: "/categories/protein-powders" },
          { enabled: true, id: "menu-performance", label: "Performance", linkType: "category", url: "/categories/performance" }
        ]
      },
      { enabled: true, id: "menu-best", label: "Best Sellers", linkType: "custom_url", url: "/collections/best-sellers" },
      { enabled: true, id: "menu-vegan", label: "Vegan Protein", linkType: "custom_url", url: "/collections/vegan-protein" },
      { enabled: true, id: "menu-guides", label: "Guides", linkType: "page", url: "/blog" }
    ]
  },
  homepageSections: [
    {
      backgroundStyle: "white",
      contentAlignment: "left",
      ctaLabel: "Shop supplements",
      ctaLink: "/products",
      desktopImageUrl: "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?auto=format&fit=crop&w=1600&q=80",
      enabled: true,
      id: "home-hero",
      mobileImageUrl: "https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?auto=format&fit=crop&w=900&q=80",
      order: 1,
      previewNote: "Primary first viewport merchandising hero.",
      references: [{ id: "prod-whey-elite", label: "NutraForge Whey Elite", type: "product" }],
      status: "published",
      subtitle: "Premium protein powders, creatine, vitamins, and fitness essentials with batch-aware stock and supplement-safe product content.",
      title: "Fuel stronger routines with transparent sports nutrition",
      type: "hero_banner"
    },
    {
      backgroundStyle: "mist",
      contentAlignment: "left",
      enabled: true,
      id: "home-goals",
      order: 2,
      references: [
        { id: "muscle-gain", label: "Muscle Gain", type: "collection", url: "/collections/muscle-gain" },
        { id: "fat-loss", label: "Fat Loss", type: "collection", url: "/collections/fat-loss" },
        { id: "daily-wellness", label: "Daily Wellness", type: "collection", url: "/collections/daily-wellness" }
      ],
      status: "published",
      subtitle: "Purpose-led discovery for common supplement shopping goals.",
      title: "Shop by goal",
      type: "goal_cards"
    },
    {
      backgroundStyle: "white",
      contentAlignment: "left",
      enabled: true,
      id: "home-categories",
      order: 3,
      references: [
        { id: "cat-protein-powders", label: "Protein Powders", type: "category" },
        { id: "cat-performance", label: "Performance", type: "category" },
        { id: "cat-vitamins-wellness", label: "Vitamins & Wellness", type: "category" }
      ],
      status: "published",
      subtitle: "Mobile-first category cards with clear supplement discovery paths.",
      title: "Shop by category",
      type: "category_grid"
    },
    {
      backgroundStyle: "white",
      contentAlignment: "left",
      ctaLabel: "View all",
      ctaLink: "/collections/best-sellers",
      enabled: true,
      id: "home-best-sellers",
      order: 4,
      references: [{ id: "best-sellers", label: "Best Sellers", type: "collection", url: "/collections/best-sellers" }],
      status: "published",
      subtitle: "High-converting products selected by merchandising.",
      title: "Best-selling supplements",
      type: "product_carousel"
    },
    {
      backgroundStyle: "ink",
      contentAlignment: "left",
      ctaLabel: "See offer",
      ctaLink: "/collections/combo-deals",
      enabled: true,
      id: "home-flash-sale",
      order: 5,
      references: [{ id: "combo-deals", label: "Combo Deals", type: "collection", url: "/collections/combo-deals" }],
      status: "published",
      subtitle: "Limited-period merchandising banner controlled from Website Studio.",
      title: "Flash stacks for training season",
      type: "flash_sale"
    },
    {
      backgroundStyle: "white",
      contentAlignment: "left",
      enabled: true,
      id: "home-brands",
      order: 6,
      references: [
        { id: "brand-nutraforge", label: "NutraForge", type: "brand" },
        { id: "brand-purelift", label: "PureLift", type: "brand" },
        { id: "brand-vitalstack", label: "VitalStack", type: "brand" }
      ],
      status: "published",
      subtitle: "Feature trusted supplement brands.",
      title: "Featured brands",
      type: "brand_carousel"
    },
    {
      backgroundStyle: "white",
      contentAlignment: "left",
      enabled: true,
      id: "home-trust",
      order: 7,
      references: [],
      status: "published",
      subtitle: "Trust cues stay visible without making health or cure claims.",
      title: "Authenticity and trust",
      type: "trust_badges"
    },
    {
      backgroundStyle: "white",
      contentAlignment: "left",
      enabled: true,
      id: "home-blog",
      order: 8,
      references: [{ id: "blog-protein-guide", label: "Protein Guide", type: "blog" }],
      status: "published",
      subtitle: "SEO-friendly supplement education without cure claims.",
      title: "Fitness guides",
      type: "blog_preview"
    },
    {
      backgroundStyle: "white",
      contentAlignment: "left",
      enabled: true,
      id: "home-testimonials",
      order: 9,
      references: [],
      status: "published",
      subtitle: "Social proof cards for a premium ecommerce feel.",
      title: "Customer testimonials",
      type: "testimonials"
    },
    {
      backgroundStyle: "white",
      contentAlignment: "left",
      enabled: true,
      id: "home-newsletter",
      order: 10,
      references: [],
      status: "published",
      subtitle: "A reusable newsletter module for offers, educational content, and product drops.",
      title: "Join the FitSupplement list",
      type: "newsletter"
    }
  ],
  landingPages: [
    {
      id: "lp-muscle-gain-stack",
      sections: [],
      seoDescription: "A curated muscle gain supplement landing page with protein, creatine, and shaker stack merchandising.",
      seoTitle: "Muscle Gain Supplement Stack",
      slug: "muscle-gain-stack",
      status: "draft",
      title: "Muscle Gain Stack"
    }
  ],
  policies: [
    {
      content:
        "FitSupplement Store offers transparent sports nutrition shopping with batch-aware inventory and clear supplement information. This website does not provide medical advice.",
      id: "policy-about-us",
      seoDescription: "Learn about FitSupplement Store and our responsible supplement commerce principles.",
      seoTitle: "About FitSupplement Store",
      slug: "about-us",
      status: "published",
      title: "About Us"
    },
    {
      content: "Contact our support team at care@fitsupplement.example or +91 90000 00000 for order help.",
      id: "policy-contact-us",
      seoDescription: "Contact FitSupplement Store support.",
      seoTitle: "Contact Us",
      slug: "contact-us",
      status: "published",
      title: "Contact Us"
    },
    {
      content: "Orders are shipped through courier partners. Delivery timelines depend on serviceability and payment verification.",
      id: "policy-shipping",
      seoDescription: "Shipping policy for FitSupplement Store.",
      seoTitle: "Shipping Policy",
      slug: "shipping-policy",
      status: "published",
      title: "Shipping Policy"
    },
    {
      content: "Returns are reviewed for eligibility. Opened consumable products may require QC review before restock or refund.",
      id: "policy-return",
      seoDescription: "Return policy for supplement and fitness accessory orders.",
      seoTitle: "Return Policy",
      slug: "return-policy",
      status: "published",
      title: "Return Policy"
    },
    {
      content: "We collect only the information needed to process orders, customer support requests, and account services.",
      id: "policy-privacy",
      seoDescription: "Privacy policy for FitSupplement Store.",
      seoTitle: "Privacy Policy",
      slug: "privacy-policy",
      status: "published",
      title: "Privacy Policy"
    },
    {
      content: "Use of this website is subject to responsible supplement shopping terms and ecommerce policies.",
      id: "policy-terms",
      seoDescription: "Terms and conditions for FitSupplement Store.",
      seoTitle: "Terms & Conditions",
      slug: "terms-and-conditions",
      status: "published",
      title: "Terms & Conditions"
    },
    {
      content: "Frequently asked questions cover shipping, returns, batch details, subscriptions, and account support.",
      id: "policy-faq",
      seoDescription: "Frequently asked questions for FitSupplement Store.",
      seoTitle: "FAQ",
      slug: "faq",
      status: "published",
      title: "FAQ"
    }
  ],
  popups: [
    {
      active: true,
      displayRules: ["Show after 12 seconds", "Hide after newsletter signup", "Do not show during checkout"],
      id: "popup-newsletter",
      title: "Newsletter popup",
      type: "newsletter"
    },
    {
      active: false,
      displayRules: ["Exit intent placeholder", "Desktop only"],
      id: "popup-coupon",
      title: "Coupon popup",
      type: "coupon"
    }
  ],
  seo: [
    {
      canonicalUrl: "https://fitsupplement.example/",
      metaDescription: "Premium ecommerce store for protein powders, supplements, vitamins, and fitness accessories.",
      noindex: false,
      ogImageUrl: "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?auto=format&fit=crop&w=1200&q=80",
      pageKey: "homepage",
      structuredDataPlaceholder: "Organization + WebSite structured data placeholder.",
      title: "FitSupplement Store | Premium Supplements Online"
    }
  ],
  versionHistory: [
    {
      action: "published",
      at: now,
      editedBy: "FitSupplement Admin",
      entityId: "home-hero",
      id: "ver-home-hero-1",
      note: "Published initial Website Studio homepage."
    }
  ]
};
