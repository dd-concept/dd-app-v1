#!/bin/bash

# Replace imports from sonner.tsx with direct sonner imports
find src -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i '' -E 's/import \{ toast \} from .+\/components\/ui\/sonner[^"]*"/import { toast } from "sonner"/g'

# Update toast function calls to use default pattern
find src -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i '' -E 's/customToast\.(error|success|info|warning)/toast.\1/g'

echo "Toast imports fixed!" 