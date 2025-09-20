
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Product } from '@/types/product-types';
import { Button } from '@/components/ui/button';
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { ChevronLeft, ChevronRight, CircleCheck, ImageOff } from 'lucide-react';

interface ProductCarouselProps {
  product: Product;
}

const ProductCarousel: React.FC<ProductCarouselProps> = ({ product }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});
  
  // All images including the main one
  const allImages = [product.image, ...(product.secondaryImages || [])];
  
  // Animation variants
  const imageVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.5 }
    },
    exit: { 
      opacity: 0,
      scale: 1.2,
      transition: { duration: 0.3 }
    }
  };
  
  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        duration: 0.5,
        staggerChildren: 0.2
      }
    }
  };
  
  const listItem = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  };

  const handleImageError = (index: number) => {
    console.error(`Failed to load image at index ${index} for product: ${product.name}`);
    setImageErrors(prev => ({ ...prev, [index]: true }));
  };

  const handlePrevious = () => {
    setActiveIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="space-y-6">
      <div className="relative aspect-square overflow-hidden rounded-xl border border-gray-200 shadow-md bg-white">
        {allImages.map((image, index) => (
          <motion.div
            key={index}
            initial="hidden"
            animate={activeIndex === index ? "visible" : "hidden"}
            exit="exit"
            variants={imageVariants}
            className={`absolute inset-0 ${activeIndex === index ? 'z-10' : 'z-0'}`}
          >
            {!imageErrors[index] ? (
              <img
                src={image}
                alt={`${product.name} - Image ${index + 1}`}
                className="h-full w-full object-contain p-4"
                onError={() => handleImageError(index)}
              />
            ) : (
              <div className="h-full w-full flex flex-col items-center justify-center text-gray-400">
                <ImageOff size={60} />
                <p className="mt-4 text-sm">Image not available</p>
              </div>
            )}
          </motion.div>
        ))}
        
        <div className="absolute left-0 top-1/2 z-20 -translate-y-1/2">
          <Button
            onClick={handlePrevious}
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full border border-gray-200 bg-white/80 shadow-sm backdrop-blur-sm hover:bg-white"
          >
            <ChevronLeft className="h-5 w-5 text-green-700" />
          </Button>
        </div>
        
        <div className="absolute right-0 top-1/2 z-20 -translate-y-1/2">
          <Button
            onClick={handleNext}
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full border border-gray-200 bg-white/80 shadow-sm backdrop-blur-sm hover:bg-white"
          >
            <ChevronRight className="h-5 w-5 text-green-700" />
          </Button>
        </div>
        
        <div className="absolute bottom-2 left-1/2 z-20 flex -translate-x-1/2 gap-1">
          {allImages.map((_, index) => (
            <Button
              key={index}
              variant="ghost"
              size="icon"
              className={`h-2 w-2 rounded-full p-0 ${
                activeIndex === index 
                  ? "bg-green-600" 
                  : "bg-gray-300 hover:bg-gray-400"
              }`}
              onClick={() => setActiveIndex(index)}
            />
          ))}
        </div>
      </div>
      
      {product.benefits && (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="space-y-2 p-4 bg-green-50 rounded-lg border border-green-100"
        >
          <h3 className="font-medium text-green-800">Key Benefits:</h3>
          <ul className="space-y-1">
            {product.benefits.map((benefit, index) => (
              <motion.li 
                key={index}
                variants={listItem}
                className="flex items-start gap-2 text-sm text-green-700"
              >
                <CircleCheck className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>{benefit}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      )}
      
      {allImages.length > 1 && (
        <div className="pt-4">
          <Carousel className="w-full">
            <CarouselContent className="-ml-2 md:-ml-4">
              {allImages.map((image, index) => (
                <CarouselItem key={index} className="pl-2 md:pl-4 basis-1/3 sm:basis-1/5">
                  <div 
                    onClick={() => setActiveIndex(index)}
                    className={`cursor-pointer aspect-square rounded-md overflow-hidden border-2 ${
                      activeIndex === index 
                        ? 'border-green-600 ring-2 ring-green-200' 
                        : 'border-transparent hover:border-green-300'
                    }`}
                  >
                    {!imageErrors[index] ? (
                      <img 
                        src={image}
                        alt={`Thumbnail ${index + 1}`}
                        className="h-full w-full object-cover"
                        onError={() => handleImageError(index)}
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-gray-100">
                        <ImageOff size={16} className="text-gray-400" />
                      </div>
                    )}
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="-left-4 bg-white" />
            <CarouselNext className="-right-4 bg-white" />
          </Carousel>
        </div>
      )}
    </div>
  );
};

export default ProductCarousel;
