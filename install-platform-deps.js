// Install platform API dependencies
console.log('Installing platform API dependencies...')

const { spawn } = require('child_process')

const dependencies = [
  'node-cron',
  'axios',
  'dotenv'
]

const devDependencies = [
  '@types/node-cron'
]

// Install dependencies
const install = spawn('npm', ['install', ...dependencies], { stdio: 'inherit' })

install.on('close', (code) => {
  if (code === 0) {
    console.log('✅ Dependencies installed successfully!')
    
    // Install dev dependencies
    const installDev = spawn('npm', ['install', '--save-dev', ...devDependencies], { stdio: 'inherit' })
    
    installDev.on('close', (devCode) => {
      if (devCode === 0) {
        console.log('✅ Dev dependencies installed successfully!')
        console.log('\n🎉 Platform API setup complete!')
        console.log('\n📝 Next steps:')
        console.log('1. Copy .env.local.example to .env.local')
        console.log('2. Add your platform API keys to .env.local')
        console.log('3. Test platform connections in the scheduler')
      } else {
        console.error('❌ Failed to install dev dependencies')
        process.exit(1)
      }
    })
  } else {
    console.error('❌ Failed to install dependencies')
    process.exit(1)
  }
})
