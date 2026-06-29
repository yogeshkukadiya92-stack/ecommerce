export const searchAnalytics = {
  noResultTerms: [
    { count: 18, term: "isolate 5lb" },
    { count: 14, term: "lactose free pre workout" },
    { count: 9, term: "vegan mass gainer" },
    { count: 7, term: "omega 3" }
  ],
  recommendedMappings: [
    { mappedProduct: "NutraForge Whey Elite", term: "whey protein" },
    { mappedProduct: "NutraForge Creatine Monohydrate", term: "creatine" },
    { mappedProduct: "VitalStack Daily Multivitamin", term: "daily vitamins" }
  ],
  searchToPurchaseRatePlaceholder: 6.4,
  topTerms: [
    { count: 142, term: "whey protein" },
    { count: 116, term: "creatine" },
    { count: 86, term: "mass gainer" },
    { count: 54, term: "multivitamin" },
    { count: 31, term: "lab report" }
  ]
} as const;
