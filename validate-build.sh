#!/bin/bash
set -e

echo "=============================================="
echo "    M-CLINIC PRE-BUILD VALIDATION SCRIPT"
echo "=============================================="

echo "🔍 1. Validating API TypeScript..."
cd apps/api
# Run tsc with --noEmit to check for type errors without building
if npx tsc --noEmit --skipLibCheck; then
    echo "✅ API TypeScript validation passed."
else
    echo "❌ API TypeScript validation FAILED!"
    exit 1
fi
cd ../..

echo "🔍 2. Validating Web TypeScript..."
cd apps/web
# Run tsc with --noEmit to check for type errors without building
if npx tsc --noEmit --skipLibCheck; then
    echo "✅ Web TypeScript validation passed."
else
    echo "❌ Web TypeScript validation FAILED!"
    exit 1
fi
cd ../..

echo "🔍 3. Validating Prisma Schema..."
if npx prisma validate --schema=apps/api/prisma/schema.prisma; then
    echo "✅ Prisma Schema is valid."
else
    echo "❌ Prisma Schema validation FAILED!"
    exit 1
fi

echo "=============================================="
echo "✅ ALL CHECKS PASSED - READY TO BUILD"
echo "=============================================="
