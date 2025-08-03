@echo off
echo 🚨 CLEANING UP CLICKSPROUT WORKSPACE...

echo.
echo 🗑️ Deleting legacy API routes...
rmdir /s /q "src\app\api\scrape" 2>nul
rmdir /s /q "src\app\api\generate" 2>nul
rmdir /s /q "src\app\api\ai-content-generator" 2>nul
rmdir /s /q "src\app\api\market-research" 2>nul
rmdir /s /q "src\app\api\advanced-scraper" 2>nul

echo.
echo 🗑️ Deleting deprecated components...
del /q "src\components\PlatformTester.tsx" 2>nul
del /q "src\components\AdvancedContentGenerator.tsx" 2>nul

echo.
echo 🗑️ Deleting legacy editor pages...
del /q "src\app\editor\page_*.tsx" 2>nul

echo.
echo 🗑️ Deleting legacy submit pages...
del /q "src\app\submit\page_new.tsx" 2>nul
del /q "src\app\submit\page_old.tsx" 2>nul

echo.
echo 🗑️ Deleting old utilities...
del /q "src\utils\scraper.ts" 2>nul

echo.
echo 🗑️ Deleting placeholder files...
del /q "public\favicons\favicon-placeholder.txt" 2>nul

echo.
echo ✅ CLEANUP COMPLETE!
echo.
echo 📋 Remaining core structure:
dir /b src\app > temp_structure.txt
echo.
echo Core pages:
type temp_structure.txt
del temp_structure.txt

pause
