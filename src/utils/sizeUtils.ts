/**
 * Sorts sizes from smaller to larger (numeric sizes in ascending order, string sizes from XS to XXL)
 * @param sizes Array of size strings to sort
 * @returns Sorted array of sizes
 */
export const sortSizes = (sizes: string[]): string[] => {
  // Helper function to determine if a size is numeric
  const isNumeric = (size: string): boolean => /^[\d.,]+$/.test(size);
  
  // Helper function to convert letter sizes to a numeric value for sorting
  const getLetterSizeValue = (size: string): number => {
    const sizeMap: Record<string, number> = {
      'XXXS': 1, 'XXS': 2, 'XS': 3, 'S': 4, 'M': 5, 'L': 6, 'XL': 7, 'XXL': 8, 'XXXL': 9,
      '3XS': 1, '2XS': 2, '3XL': 9
    };
    
    // Normalize size by removing spaces and converting to uppercase
    const normalizedSize = size.toUpperCase().trim();
    
    // Return the mapped value or a high number (to put unknown sizes at the end)
    return sizeMap[normalizedSize] || 999;
  };
  
  // Separate numeric and non-numeric sizes
  const numericSizes = sizes.filter(isNumeric);
  const letterSizes = sizes.filter(size => !isNumeric(size));
  
  // Sort numeric sizes numerically (ascending)
  const sortedNumericSizes = numericSizes.sort((a, b) => parseFloat(a) - parseFloat(b));
  
  // Sort letter sizes by their mapped value
  const sortedLetterSizes = letterSizes.sort((a, b) => getLetterSizeValue(a) - getLetterSizeValue(b));
  
  // Return numeric sizes first, then letter sizes
  return [...sortedNumericSizes, ...sortedLetterSizes];
}; 