const { exec } = require('child_process');
const path = require('path');

// Change to the project directory
const projectPath = 'c:\\Users\\dghos\\Desktop\\clicksprout v1.0';
process.chdir(projectPath);

console.log('🚀 Installing required packages for ClickSprout v1.0...');

// Install both Supabase and OpenAI packages
exec('npm install @supabase/supabase-js openai', (error, stdout, stderr) => {
  if (error) {
    console.error('❌ Error installing packages:', error);
    console.log('\n💡 Try running this manually:');
    console.log('cd "c:\\Users\\dghos\\Desktop\\clicksprout v1.0"');
    console.log('npm install @supabase/supabase-js openai');
    return;
  }
  if (stderr) {
    console.error('⚠️  Warning:', stderr);
  }
  console.log('📦 Installation output:', stdout);
  console.log('✅ Packages installed successfully!');
  console.log('\n🎯 Next steps:');
  console.log('1. Add your OpenAI API key to .env.local');
  console.log('2. Configure Supabase credentials (optional)');
  console.log('3. Run npm run dev to start the development server');
});
