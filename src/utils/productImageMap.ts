
// Product image mapping for synchronized products
export const productImageMap: Record<string, string> = {
  "faforon": "https://d1yei2z3i6k35z.cloudfront.net/8219284/679b70fdeb16d_52.png",
  "becool": "https://d1yei2z3i6k35z.cloudfront.net/8219284/679b8aea50919_43.png",
  "dynace_rocenta": "https://d1yei2z3i6k35z.cloudfront.net/8219284/679b708190650_42.png",
  "spidex_12": "https://d1yei2z3i6k35z.cloudfront.net/8219284/679b7105cd6d2_62.png",
  "salud": "https://d1yei2z3i6k35z.cloudfront.net/8219284/679b711b93315_82.png",
  "jigsimur": "https://d1yei2z3i6k35z.cloudfront.net/8219284/679b8afde7c99_63.png",
  "jinja": "https://d1yei2z3i6k35z.cloudfront.net/8219284/679b70301077f_32.png",
  "faforditoz": "https://d1yei2z3i6k35z.cloudfront.net/8219284/679b8af681d36_53.png",
  "spidex_17": "https://d1yei2z3i6k35z.cloudfront.net/8219284/679b71440b18d_121.png",
  "spidex_20": "https://d1yei2z3i6k35z.cloudfront.net/8219284/679b65dfab8a5_12.png",
  "spidex_18": "https://d1yei2z3i6k35z.cloudfront.net/8219284/679b71529fe6c_131.png",
  "men_coffee": "https://d1yei2z3i6k35z.cloudfront.net/8219284/679b8b18acad0_83.png",
  "spidex_21": "https://d1yei2z3i6k35z.cloudfront.net/8219284/679b7135da5ca_101.png",
  "spidex_19": "https://d1yei2z3i6k35z.cloudfront.net/8219284/679b710f8a766_72.png",
  "spidex_15": "https://d1yei2z3i6k35z.cloudfront.net/8219284/679b66c75de26_22.png",
  "prosclick": "https://d1yei2z3i6k35z.cloudfront.net/8219284/679b712643cd7_91.png",
  "green_coffee": "https://d1yei2z3i6k35z.cloudfront.net/8219284/679b8b27469be_92.png",
  "iru_antiseptic_soap": "https://d1yei2z3i6k35z.cloudfront.net/8219284/679b8b09633de_73.png",
  "multi_effect_toothpaste": "https://d1yei2z3i6k35z.cloudfront.net/8219284/679b8b338f624_102.png"
};

// Product descriptions for synchronized products
export const productDescriptions: Record<string, string> = {
  "faforon": "Natural health supplement for overall wellness and vitality",
  "becool": "Cooling and refreshing health supplement",
  "dynace_rocenta": "Premium health supplement for enhanced vitality",
  "spidex_12": "Specialized health supplement - Spidex 12 formula", 
  "salud": "Comprehensive health and wellness supplement",
  "jigsimur": "Natural herbal supplement for digestive health",
  "jinja": "Traditional herbal wellness supplement",
  "faforditoz": "Advanced health supplement for optimal wellness",
  "spidex_17": "Specialized health supplement - Spidex 17 formula",
  "spidex_20": "Specialized health supplement - Spidex 20 formula",
  "spidex_18": "Specialized health supplement - Spidex 18 formula",
  "men_coffee": "Specialized coffee blend for men's health and energy",
  "spidex_21": "Specialized health supplement - Spidex 21 formula",
  "spidex_19": "Specialized health supplement - Spidex 19 formula",
  "spidex_15": "Specialized health supplement - Spidex 15 formula",
  "prosclick": "Prostate health support supplement",
  "green_coffee": "Natural green coffee extract for weight management",
  "iru_antiseptic_soap": "Natural antiseptic soap for skin health",
  "multi_effect_toothpaste": "Multi-effect toothpaste for comprehensive oral care"
};

export const getProductImage = (sku: string): string => {
  return productImageMap[sku] || '/placeholder.svg';
};

export const getProductDescription = (sku: string): string => {
  return productDescriptions[sku] || 'Natural wellness supplement';
};
