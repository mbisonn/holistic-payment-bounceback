
import { supabase } from '@/integrations/supabase/client';
import { Product } from './types';
import { mapDbProductToProduct, mapOrderBumpToProduct } from './mappers';

// Get all products
export const getAllProducts = async (): Promise<Product[]> => {
  try {
    // Try to get products from upsell_products table first (preferred table)
    const { data: upsellProducts, error: upsellError } = await supabase
      .from('upsell_products')
      .select('*');

    if (!upsellError && Array.isArray(upsellProducts) && upsellProducts.length > 0) {
      return upsellProducts.map(mapDbProductToProduct);
    }

    console.log('No products found in upsell_products, checking order_bumps');

    // Fallback to order_bumps table
    const { data: orderBumps, error: orderBumpsError } = await supabase
      .from('order_bumps')
      .select('*');

    if (!orderBumpsError && Array.isArray(orderBumps) && orderBumps.length > 0) {
      return orderBumps.map(mapOrderBumpToProduct);
    }

    console.log('No products found in any table, returning static products');
    // Return static products as fallback
    return getStaticProducts();
  } catch (error) {
    console.error('Error fetching products:', error);
    // Return static products as fallback
    return getStaticProducts();
  }
};

// Static products as fallback
const getStaticProducts = (): Product[] => {
  return [
    {
      id: 'blood-booster',
      sku: 'blood-booster',
      name: 'Blood Booster',
      description: 'Iron-rich formula to support healthy blood cell production.',
      price: 25000,
      image: 'https://d1yei2z3i6k35z.cloudfront.net/8917555/679e5740b3e4c_17.png',
      category: 'health',
      featured: true,
      defaultQuantity: 1,
      inStock: true
    },
    {
      id: 'cardio-sure',
      sku: 'cardio-sure',
      name: 'Cardio Sure',
      description: 'Natural blood pressure support formula with hawthorn and hibiscus.',
      price: 25000,
      image: 'https://d1yei2z3i6k35z.cloudfront.net/8917555/679e5776804ef_20.png',
      category: 'cardiovascular',
      featured: true,
      defaultQuantity: 1,
      inStock: true
    },
    {
      id: 'hormone-harmony',
      sku: 'hormone-harmony',
      name: 'Hormone Harmony',
      description: 'Balancing formula for women\'s hormonal health with natural ingredients.',
      price: 25000,
      image: 'https://d1yei2z3i6k35z.cloudfront.net/8917555/67e4000ae3cb2_hormoneharmony3.png',
      category: 'hormonal',
      featured: true,
      defaultQuantity: 1,
      inStock: true
    },
    {
      id: 'prostatitis',
      sku: 'prostatitis',
      name: 'Prostatitis',
      description: 'Herbal blend to support prostate health and reduce inflammation.',
      price: 25000,
      image: 'https://d1yei2z3i6k35z.cloudfront.net/8917555/679e5788914a7_21.png',
      category: 'men-health',
      featured: true,
      defaultQuantity: 1,
      inStock: true
    },
    {
      id: 'prosta-vitality',
      sku: 'prosta-vitality',
      name: 'Prosta Vitality',
      description: 'Advanced prostate support with saw palmetto and pygeum.',
      price: 25000,
      image: 'https://d1yei2z3i6k35z.cloudfront.net/8917555/679e883f4aebe_27.png',
      category: 'men-health',
      featured: false,
      defaultQuantity: 1,
      inStock: true
    },
    {
      id: 'optifertile',
      sku: 'optifertile',
      name: 'Optifertile',
      description: 'Fertility support for men and women with essential vitamins and minerals.',
      price: 25000,
      image: 'https://d1yei2z3i6k35z.cloudfront.net/8917555/679e56df4eea9_16.png',
      category: 'fertility',
      featured: false,
      defaultQuantity: 1,
      inStock: true
    },
    {
      id: 'liver-tea',
      sku: 'liver-tea',
      name: 'Liver Tea',
      description: 'Detoxifying tea blend to support liver health and function.',
      price: 25000,
      image: 'https://d1yei2z3i6k35z.cloudfront.net/8917555/679e57a19604c_22.png',
      category: 'detox',
      featured: false,
      defaultQuantity: 1,
      inStock: true
    },
    {
      id: 'eye-shield',
      sku: 'eye-shield',
      name: 'Eye Shield',
      description: 'Vision support formula with lutein and zeaxanthin.',
      price: 25000,
      image: 'https://d1yei2z3i6k35z.cloudfront.net/8917555/679e56d34f3aa_15.png',
      category: 'vision',
      featured: false,
      defaultQuantity: 1,
      inStock: true
    },
    {
      id: 'activated-charcoal',
      sku: 'activated-charcoal',
      name: 'Activated Charcoal',
      description: 'Natural detoxifier for digestive health and toxin removal.',
      price: 25000,
      image: 'https://d1yei2z3i6k35z.cloudfront.net/8917555/679e57d7a0d4f_23.png',
      category: 'detox',
      featured: false,
      defaultQuantity: 1,
      inStock: true
    },
    {
      id: 'thyro-plus',
      sku: 'thyro-plus',
      name: 'Thyro Plus',
      description: 'Thyroid support formula with iodine and selenium.',
      price: 25000,
      image: 'https://d1yei2z3i6k35z.cloudfront.net/8917555/679e575fa6bcd_191.png',
      category: 'thyroid',
      featured: false,
      defaultQuantity: 1,
      inStock: true
    },
    {
      id: 'sugar-shield-plus',
      sku: 'sugar-shield-plus',
      name: 'Sugar Shield Plus',
      description: 'Blood sugar support formula with chromium and alpha-lipoic acid.',
      price: 25000,
      image: 'https://d1yei2z3i6k35z.cloudfront.net/8917555/67a29f9d77cbc_SUGARSHIELDPLUS2.png',
      category: 'diabetes',
      featured: false,
      defaultQuantity: 1,
      inStock: true
    },
    {
      id: 'nephro-care',
      sku: 'nephro-care',
      name: 'Nephro Care',
      description: 'Kidney support formula with cranberry and parsley.',
      price: 25000,
      image: 'https://d1yei2z3i6k35z.cloudfront.net/8917555/67a1ae057756f_NEPHRO.jpg',
      category: 'kidney',
      featured: false,
      defaultQuantity: 1,
      inStock: true
    },
    {
      id: 'immuno-guard-plus',
      sku: 'immuno-guard-plus',
      name: 'Immuno Guard Plus',
      description: 'Immune support formula with vitamin C and zinc.',
      price: 25000,
      image: 'https://d1yei2z3i6k35z.cloudfront.net/8917555/679e56bf61a00_14.png',
      category: 'immune',
      featured: false,
      defaultQuantity: 1,
      inStock: true
    },
    {
      id: 'vein-thrombus',
      sku: 'vein-thrombus',
      name: 'Vein Thrombus',
      description: 'Circulation support formula with horse chestnut and butcher\'s broom.',
      price: 25000,
      image: 'https://d1yei2z3i6k35z.cloudfront.net/8917555/679e8868780f0_30.png',
      category: 'circulation',
      featured: false,
      defaultQuantity: 1,
      inStock: true
    },
    {
      id: 'cardio-tincture',
      sku: 'cardio-tincture',
      name: 'Cardio Tincture',
      description: 'Heart health tincture with natural herbs and extracts.',
      price: 10000,
      image: 'https://d1yei2z3i6k35z.cloudfront.net/8917555/679e574fc28d2_18.png',
      category: 'cardiovascular',
      featured: false,
      defaultQuantity: 1,
      inStock: true
    },
    {
      id: 'brain-booster',
      sku: 'brain-booster',
      name: 'Brain Booster',
      description: 'Cognitive support formula with ginkgo biloba and bacopa.',
      price: 25000,
      image: 'https://d1yei2z3i6k35z.cloudfront.net/8917555/679e8883aeb12_31.png',
      category: 'cognitive',
      featured: false,
      defaultQuantity: 1,
      inStock: true
    },
    {
      id: 'thyro-max',
      sku: 'thyro-max',
      name: 'Thyro Max',
      description: 'Advanced thyroid support formula with adaptogens.',
      price: 25000,
      image: 'https://d1yei2z3i6k35z.cloudfront.net/8917555/679e885da81e5_29.png',
      category: 'thyroid',
      featured: false,
      defaultQuantity: 1,
      inStock: true
    },
    {
      id: 'immuno-guard',
      sku: 'immuno-guard',
      name: 'Immuno Guard',
      description: 'Daily immune support with elderberry and echinacea.',
      price: 25000,
      image: 'https://d1yei2z3i6k35z.cloudfront.net/8917555/679e884a068e5_28.png',
      category: 'immune',
      featured: false,
      defaultQuantity: 1,
      inStock: true
    },
    {
      id: 'soursop',
      sku: 'soursop',
      name: 'Soursop',
      description: 'Antioxidant-rich soursop leaf extract for cellular health.',
      price: 25000,
      image: 'https://d1yei2z3i6k35z.cloudfront.net/8917555/67d1bc4f4e920_soursopleaf.png',
      category: 'antioxidant',
      featured: false,
      defaultQuantity: 1,
      inStock: true
    }
  ];
};

// For backward compatibility
export const getProducts = getAllProducts;

// Get product by ID
export const getProductById = async (id: string): Promise<Product | null> => {
  try {
    // Try upsell_products first
    const { data: product, error } = await supabase
      .from('upsell_products')
      .select('*')
      .eq('id', id)
      .single();

    if (!error && product) {
      return mapDbProductToProduct(product);
    }

    // Try order_bumps as fallback
    const { data: orderBump, error: orderBumpError } = await supabase
      .from('order_bumps')
      .select('*')
      .eq('id', id)
      .single();

    if (!orderBumpError && orderBump) {
      return mapOrderBumpToProduct(orderBump);
    }

    // Try static products as final fallback
    const staticProducts = getStaticProducts();
    return staticProducts.find(p => p.id === id) || null;
  } catch (error) {
    console.error('Error fetching product by ID:', error);
    // Try static products as fallback
    const staticProducts = getStaticProducts();
    return staticProducts.find(p => p.id === id) || null;
  }
};
