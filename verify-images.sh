#!/bin/bash

# Image verification script for CookFort demo data
# This script checks if all required images are present

echo "🔍 Verifying CookFort Demo Images..."
echo ""

MISSING=0
FOUND=0

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

check_image() {
    local path=$1
    local description=$2

    if [ -f "public/$path" ]; then
        echo -e "${GREEN}✓${NC} $description"
        ((FOUND++))
    else
        echo -e "${RED}✗${NC} $description"
        echo "   Missing: public/$path"
        ((MISSING++))
    fi
}

echo "=== User Profile Pictures (4) ==="
check_image "images/users/alice-profile.jpg" "Alice Johnson profile"
check_image "images/users/bob-profile.jpg" "Bob Smith profile"
check_image "images/users/admin1-profile.jpg" "Sarah Admin profile"
check_image "images/users/admin2-profile.jpg" "Michael SuperAdmin profile"
echo ""

echo "=== Chef Profile Pictures (2) ==="
check_image "images/chefs/maria-profile.jpg" "Maria Garcia profile"
check_image "images/chefs/james-profile.jpg" "James Wilson profile"
echo ""

echo "=== Maria's Gallery Images (6) ==="
check_image "images/chefs/maria/gallery-1.jpg" "Fettuccine Carbonara"
check_image "images/chefs/maria/gallery-2.jpg" "Seafood Risotto"
check_image "images/chefs/maria/gallery-3.jpg" "Margherita Pizza"
check_image "images/chefs/maria/gallery-4.jpg" "Tiramisu"
check_image "images/chefs/maria/gallery-5.jpg" "Caprese Salad"
check_image "images/chefs/maria/gallery-6.jpg" "Osso Buco"
echo ""

echo "=== James's Gallery Images (6) ==="
check_image "images/chefs/james/gallery-1.jpg" "Smoked Brisket"
check_image "images/chefs/james/gallery-2.jpg" "BBQ Ribs"
check_image "images/chefs/james/gallery-3.jpg" "Pulled Pork Sliders"
check_image "images/chefs/james/gallery-4.jpg" "Veggie Skewers"
check_image "images/chefs/james/gallery-5.jpg" "Texas Chili"
check_image "images/chefs/james/gallery-6.jpg" "BBQ Platter"
echo ""

echo "=== Review Photos (5) ==="
check_image "images/reviews/alice-review1-photo1.jpg" "Alice's review 1 - photo 1"
check_image "images/reviews/alice-review1-photo2.jpg" "Alice's review 1 - photo 2"
check_image "images/reviews/alice-review2-photo1.jpg" "Alice's review 2 - photo 1"
check_image "images/reviews/alice-review2-photo2.jpg" "Alice's review 2 - photo 2"
check_image "images/reviews/bob-review1-photo1.jpg" "Bob's review 1 - photo 1"
echo ""

echo "========================================="
echo "Summary:"
echo -e "${GREEN}Found: $FOUND${NC}"
echo -e "${RED}Missing: $MISSING${NC}"
echo "Total: $((FOUND + MISSING))"
echo ""

if [ $MISSING -eq 0 ]; then
    echo -e "${GREEN}✓ All images are present!${NC}"
    echo "You can now run: npm run prisma:seed"
    exit 0
else
    echo -e "${RED}✗ Some images are missing.${NC}"
    echo "Please generate/add the missing images before seeding."
    echo "See IMAGE_REQUIREMENTS.md for details."
    exit 1
fi
