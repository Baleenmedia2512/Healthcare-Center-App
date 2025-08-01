const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);

// Function to replace import paths in a file
async function updateImportsInFile(filePath) {
  try {
    const content = await readFileAsync(filePath, 'utf8');
    
    // Replace relative imports with absolute imports using path aliases
    let updatedContent = content
      // Replace imports from src
      .replace(/from\s+['"]\.\.\/src\/components\/(.*?)['"]/g, "from '@/components/$1'")
      .replace(/from\s+['"]\.\.\/\.\.\/src\/components\/(.*?)['"]/g, "from '@/components/$1'")
      .replace(/from\s+['"]\.\.\/\.\.\/\.\.\/src\/components\/(.*?)['"]/g, "from '@/components/$1'")
      
      // Replace lib imports
      .replace(/from\s+['"]\.\.\/src\/lib\/(.*?)['"]/g, "from '@/lib/$1'")
      .replace(/from\s+['"]\.\.\/\.\.\/src\/lib\/(.*?)['"]/g, "from '@/lib/$1'")
      .replace(/from\s+['"]\.\.\/\.\.\/\.\.\/src\/lib\/(.*?)['"]/g, "from '@/lib/$1'")
      
      // Replace config imports
      .replace(/from\s+['"]\.\.\/src\/config['"]/g, "from '@/config'")
      .replace(/from\s+['"]\.\.\/\.\.\/src\/config['"]/g, "from '@/config'")
      
      // Replace theme imports
      .replace(/from\s+['"]\.\.\/src\/theme\/(.*?)['"]/g, "from '@/theme/$1'")
      .replace(/from\s+['"]\.\.\/\.\.\/src\/theme\/(.*?)['"]/g, "from '@/theme/$1'")
      
      // Replace hooks imports
      .replace(/from\s+['"]\.\.\/src\/hooks\/(.*?)['"]/g, "from '@/hooks/$1'")
      .replace(/from\s+['"]\.\.\/\.\.\/src\/hooks\/(.*?)['"]/g, "from '@/hooks/$1'")
      .replace(/from\s+['"]\.\.\/hooks\/(.*?)['"]/g, "from '@/hooks/$1'")
      
      // Replace utils imports
      .replace(/from\s+['"]\.\.\/src\/utils\/(.*?)['"]/g, "from '@/utils/$1'")
      .replace(/from\s+['"]\.\.\/\.\.\/src\/utils\/(.*?)['"]/g, "from '@/utils/$1'");

    // Only write if the content actually changed
    if (content !== updatedContent) {
      await writeFileAsync(filePath, updatedContent, 'utf8');
      console.log(`Updated imports in ${filePath}`);
    }
  } catch (error) {
    console.error(`Error updating imports in ${filePath}:`, error);
  }
}

// Function to recursively walk through directories
async function processDirectory(directory) {
  const files = fs.readdirSync(directory);

  for (const file of files) {
    const filePath = path.join(directory, file);
    const stats = fs.statSync(filePath);

    if (stats.isDirectory()) {
      // Skip node_modules and .next directories
      if (file !== 'node_modules' && file !== '.next') {
        await processDirectory(filePath);
      }
    } else if (stats.isFile() && 
              (file.endsWith('.js') || file.endsWith('.jsx') || file.endsWith('.ts') || file.endsWith('.tsx'))) {
      await updateImportsInFile(filePath);
    }
  }
}

// Main function to start the process
async function main() {
  const rootDir = process.cwd();
  console.log('Starting import path updates...');
  await processDirectory(rootDir);
  console.log('Import path updates completed!');
}

main().catch(console.error);
