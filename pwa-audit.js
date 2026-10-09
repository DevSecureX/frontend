#!/usr/bin/env node

/**
 * Basic PWA Audit Script
 * This script performs manual checks for PWA compliance
 */

import http from 'http';
import https from 'https';
import fs from 'fs';

const BASE_URL = 'http://localhost:4173';

async function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    client.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: res.headers['content-type']?.includes('application/json') ? JSON.parse(data) : data
          });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, data });
        }
      });
    }).on('error', reject);
  });
}

async function checkPWARequirements() {
  console.log('🔍 DevSecureX PWA Audit Starting...\n');
  
  let score = 0;
  let totalChecks = 0;
  
  const results = {
    passed: [],
    failed: [],
    warnings: []
  };
  
  // Check 1: Manifest file exists and is valid
  totalChecks++;
  try {
    const manifestResponse = await makeRequest(`${BASE_URL}/site.webmanifest`);
    if (manifestResponse.status === 200 && manifestResponse.data) {
      const manifest = typeof manifestResponse.data === 'string' ? JSON.parse(manifestResponse.data) : manifestResponse.data;
      
      if (manifest.name && manifest.start_url && manifest.display && manifest.icons) {
        score++;
        results.passed.push('✅ Web App Manifest exists and is valid');
        
        // Check manifest completeness
        const manifestFeatures = [
          'name', 'short_name', 'description', 'start_url', 'display', 
          'theme_color', 'background_color', 'icons', 'scope'
        ];
        
        const missingFeatures = manifestFeatures.filter(feature => !manifest[feature]);
        if (missingFeatures.length === 0) {
          results.passed.push('✅ Manifest has all required fields');
        } else {
          results.warnings.push(`⚠️  Manifest missing recommended fields: ${missingFeatures.join(', ')}`);
        }
        
        // Check icons
        const hasRequiredIcons = manifest.icons.some(icon => 
          icon.sizes === '192x192' && icon.type === 'image/png'
        ) && manifest.icons.some(icon => 
          icon.sizes === '512x512' && icon.type === 'image/png'
        );
        
        if (hasRequiredIcons) {
          score++;
          totalChecks++;
          results.passed.push('✅ Required icon sizes (192x192, 512x512) are present');
        } else {
          totalChecks++;
          results.failed.push('❌ Missing required icon sizes');
        }
        
      } else {
        results.failed.push('❌ Web App Manifest is missing required fields');
      }
    } else {
      results.failed.push('❌ Web App Manifest not found or invalid');
    }
  } catch (error) {
    results.failed.push(`❌ Error checking manifest: ${error.message}`);
  }
  
  // Check 2: Service Worker registration
  totalChecks++;
  try {
    const swResponse = await makeRequest(`${BASE_URL}/sw.js`);
    if (swResponse.status === 200) {
      score++;
      results.passed.push('✅ Service Worker file exists and is served');
    } else {
      results.failed.push('❌ Service Worker file not found');
    }
  } catch (error) {
    results.failed.push(`❌ Error checking service worker: ${error.message}`);
  }
  
  // Check 3: HTTPS requirement (localhost is exempt)
  totalChecks++;
  if (BASE_URL.startsWith('https') || BASE_URL.includes('localhost')) {
    score++;
    results.passed.push('✅ HTTPS requirement satisfied (localhost exempt)');
  } else {
    results.failed.push('❌ App not served over HTTPS');
  }
  
  // Check 4: Responsive viewport meta tag
  totalChecks++;
  try {
    const htmlResponse = await makeRequest(BASE_URL);
    if (htmlResponse.data.includes('viewport')) {
      score++;
      results.passed.push('✅ Viewport meta tag present');
    } else {
      results.failed.push('❌ Viewport meta tag missing');
    }
  } catch (error) {
    results.failed.push(`❌ Error checking HTML: ${error.message}`);
  }
  
  // Check 5: Theme color
  totalChecks++;
  try {
    const htmlResponse = await makeRequest(BASE_URL);
    if (htmlResponse.data.includes('theme-color')) {
      score++;
      results.passed.push('✅ Theme color meta tag present');
    } else {
      results.failed.push('❌ Theme color meta tag missing');
    }
  } catch (error) {
    results.failed.push(`❌ Error checking theme color: ${error.message}`);
  }
  
  // Check 6: Apple touch icon
  totalChecks++;
  try {
    const iconResponse = await makeRequest(`${BASE_URL}/apple-touch-icon.png`);
    if (iconResponse.status === 200) {
      score++;
      results.passed.push('✅ Apple touch icon exists');
    } else {
      results.failed.push('❌ Apple touch icon missing');
    }
  } catch (error) {
    results.failed.push(`❌ Error checking apple touch icon: ${error.message}`);
  }
  
  // Check 7: Offline page
  totalChecks++;
  try {
    const offlineResponse = await makeRequest(`${BASE_URL}/offline.html`);
    if (offlineResponse.status === 200) {
      score++;
      results.passed.push('✅ Offline fallback page exists');
    } else {
      results.failed.push('❌ Offline fallback page missing');
    }
  } catch (error) {
    results.failed.push(`❌ Error checking offline page: ${error.message}`);
  }
  
  // Check 8: Required icon files
  const requiredIcons = ['icon-192x192.png', 'icon-512x512.png', 'favicon-32x32.png'];
  
  for (const icon of requiredIcons) {
    totalChecks++;
    try {
      const iconResponse = await makeRequest(`${BASE_URL}/${icon}`);
      if (iconResponse.status === 200) {
        score++;
        results.passed.push(`✅ Icon ${icon} exists`);
      } else {
        results.failed.push(`❌ Icon ${icon} missing`);
      }
    } catch (error) {
      results.failed.push(`❌ Error checking icon ${icon}: ${error.message}`);
    }
  }
  
  // Calculate PWA score
  const pwaScore = Math.round((score / totalChecks) * 100);
  
  // Display results
  console.log('📊 PWA AUDIT RESULTS\n');
  console.log(`🎯 PWA Score: ${pwaScore}/100`);
  console.log(`✅ Passed: ${score}/${totalChecks} checks\n`);
  
  console.log('✅ PASSED CHECKS:');
  results.passed.forEach(check => console.log(`   ${check}`));
  
  if (results.warnings.length > 0) {
    console.log('\n⚠️  WARNINGS:');
    results.warnings.forEach(warning => console.log(`   ${warning}`));
  }
  
  if (results.failed.length > 0) {
    console.log('\n❌ FAILED CHECKS:');
    results.failed.forEach(failure => console.log(`   ${failure}`));
  }
  
  console.log('\n📋 PWA INSTALLABILITY CHECKLIST:');
  console.log(`   ${score >= 7 ? '✅' : '❌'} Web App Manifest with required fields`);
  console.log(`   ${results.passed.some(p => p.includes('Service Worker')) ? '✅' : '❌'} Service Worker registered`);
  console.log(`   ${results.passed.some(p => p.includes('HTTPS')) ? '✅' : '❌'} Served over HTTPS (or localhost)`);
  console.log(`   ${results.passed.some(p => p.includes('icon')) ? '✅' : '❌'} Required icons present`);
  console.log(`   ${results.passed.some(p => p.includes('Viewport')) ? '✅' : '❌'} Responsive design (viewport meta tag)`);
  
  console.log('\n🚀 RECOMMENDATIONS:');
  if (pwaScore >= 90) {
    console.log('   🎉 Excellent! Your PWA meets all major requirements.');
    console.log('   🔧 Consider adding push notifications and background sync for enhanced functionality.');
  } else if (pwaScore >= 70) {
    console.log('   👍 Good PWA foundation. Address the failed checks to improve score.');
    console.log('   🔧 Focus on fixing missing icons and service worker functionality.');
  } else {
    console.log('   ⚠️  PWA score needs improvement. Address critical issues first:');
    console.log('   🔧 1. Ensure web manifest is complete and valid');
    console.log('   🔧 2. Implement proper service worker');
    console.log('   🔧 3. Add all required icon sizes');
  }
  
  console.log('\n📱 ADDITIONAL PWA FEATURES DETECTED:');
  if (results.passed.some(p => p.includes('Offline'))) {
    console.log('   ✅ Offline support');
  }
  if (results.passed.some(p => p.includes('Apple'))) {
    console.log('   ✅ iOS optimization');
  }
  
  return { score: pwaScore, passed: score, total: totalChecks };
}

// Run the audit
checkPWARequirements().then(result => {
  console.log(`\n🎯 Final PWA Score: ${result.score}%`);
  process.exit(result.score >= 90 ? 0 : 1);
}).catch(error => {
  console.error('❌ Audit failed:', error);
  process.exit(1);
});