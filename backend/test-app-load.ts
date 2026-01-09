import { app } from './src/app';

async function main() {
    console.log('App loaded successfully');
    process.exit(0);
}

main().catch(err => {
    console.error('Failed to load app:', err);
    process.exit(1);
});
