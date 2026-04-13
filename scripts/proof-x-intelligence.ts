const BASE_URL = process.env.API_URL || 'http://localhost:3000';
const QUERIES = [
  'AI agents',
  'blockchain',
  'crypto news',
  'machine learning',
  'startup funding',
  'tech layoffs',
  'remote work',
  'cybersecurity',
  'web3 development',
  'data science',
  'cloud computing',
  'fintech',
  'health tech',
  'ed tech',
  'climate tech',
  'space tech',
  'quantum computing',
  'robotics',
  'biotech',
  'saas',
  'devops',
  'kubernetes',
  'typescript',
  'react native',
  'flutter',
];

interface ProofResult {
  timestamp: string;
  query: string;
  status: number;
  success: boolean;
  tweetsCount?: number;
  error?: string;
  responseTime: number;
}

async function runProof(): Promise<ProofResult[]> {
  const results: ProofResult[] = [];
  
  console.log(`Starting proof run with ${QUERIES.length} queries...`);
  console.log(`Base URL: ${BASE_URL}`);
  console.log('---');
  
  for (const query of QUERIES) {
    const start = Date.now();
    try {
      const response = await fetch(`${BASE_URL}/api/x/search?query=${encodeURIComponent(query)}&limit=5`);
      const duration = Date.now() - start;
      
      if (response.status === 402) {
        results.push({
          timestamp: new Date().toISOString(),
          query,
          status: 402,
          success: true,
          responseTime: duration,
        });
        console.log(`✓ ${query} - Payment required (402)`);
      } else if (response.ok) {
        const data = await response.json();
        results.push({
          timestamp: new Date().toISOString(),
          query,
          status: response.status,
          success: true,
          tweetsCount: data.tweets?.length || 0,
          responseTime: duration,
        });
        console.log(`✓ ${query} - ${response.status} - ${data.tweets?.length || 0} tweets`);
      } else {
        const text = await response.text();
        results.push({
          timestamp: new Date().toISOString(),
          query,
          status: response.status,
          success: false,
          error: text,
          responseTime: duration,
        });
        console.log(`✗ ${query} - ${response.status}`);
      }
    } catch (error: any) {
      const duration = Date.now() - start;
      results.push({
        timestamp: new Date().toISOString(),
        query,
        status: 0,
        success: false,
        error: error.message,
        responseTime: duration,
      });
      console.log(`✗ ${query} - Error: ${error.message}`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  return results;
}

async function main() {
  console.log('='.repeat(60));
  console.log('X-Intelligence Real-Time Search API - Proof Script');
  console.log('='.repeat(60));
  
  const results = await runProof();
  
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log('\n' + '='.repeat(60));
  console.log('RESULTS');
  console.log('='.repeat(60));
  console.log(`Total queries: ${results.length}`);
  console.log(`Successful: ${successful}`);
  console.log(`Failed: ${failed}`);
  console.log(`Success rate: ${((successful / results.length) * 100).toFixed(1)}%`);
  
  const avgResponseTime = results.reduce((sum, r) => sum + r.responseTime, 0) / results.length;
  console.log(`Average response time: ${avgResponseTime.toFixed(0)}ms`);
  
  if (failed > 0) {
    console.log('\nFailed queries:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`  - ${r.query}: ${r.error}`);
    });
  }
  
  console.log('\nProof complete!');
  
  const output = {
    timestamp: new Date().toISOString(),
    baseUrl: BASE_URL,
    totalQueries: results.length,
    successful,
    failed,
    successRate: ((successful / results.length) * 100).toFixed(1) + '%',
    avgResponseTime: avgResponseTime.toFixed(0) + 'ms',
    results,
  };
  
  const fs = await import('fs');
  const path = await import('path');
  const outputDir = path.join(process.cwd(), 'listings');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  const outputPath = path.join(outputDir, `x-intelligence-proof-${Date.now()}.json`);
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
  console.log(`\nProof data saved to: ${outputPath}`);
}

main().catch(console.error);
