# Deploying to DigitalOcean App Platform

This guide will help you deploy the Guess the Prompt game to DigitalOcean App Platform.

## Prerequisites

1. A DigitalOcean account
2. A GitHub account with this repository
3. Your API keys ready:
   - `FAL_AI_API_KEY` (or `MODEL_ACCESS_KEY`)

## Deployment Steps

### Option 1: Using the DigitalOcean Control Panel (Recommended)

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

2. **Go to DigitalOcean App Platform**
   - Visit [DigitalOcean App Platform](https://cloud.digitalocean.com/apps)
   - Click "Create App"

3. **Connect your GitHub repository**
   - Select "GitHub" as your source
   - Authorize DigitalOcean to access your GitHub account if needed
   - Select your repository: `compare-images`
   - Select the branch: `main`

4. **Configure the app**
   - DigitalOcean will auto-detect Next.js
   - **Build Command**: `npm install && npm run build`
   - **Run Command**: `npm start`
   - **HTTP Port**: `3000`

5. **Set Environment Variables**
   - Click "Environment Variables" section
   - Add the following:
     - `FAL_AI_API_KEY` (or `MODEL_ACCESS_KEY`) - Set as **SECRET**
     - `NODE_ENV` = `production` (set as **GENERAL**)

6. **Choose a plan**
   - Select "Basic" plan
   - Choose the smallest instance size (Basic XXS - $5/month) to start
   - You can scale up later if needed

7. **Review and Deploy**
   - Review your configuration
   - Click "Create Resources"
   - Wait for the build and deployment to complete (5-10 minutes)

### Option 2: Using the App Spec File

1. **Update the app.yaml file**
   - Edit `.do/app.yaml`
   - Replace `YOUR_GITHUB_USERNAME` with your actual GitHub username
   - Update the repository name if different

2. **Deploy using doctl (DigitalOcean CLI)**
   ```bash
   # Install doctl if you haven't already
   # macOS: brew install doctl
   # Linux: See https://docs.digitalocean.com/reference/doctl/how-to/install/
   
   # Authenticate
   doctl auth init
   
   # Create the app
   doctl apps create --spec .do/app.yaml
   ```

3. **Set environment variables via CLI**
   ```bash
   # Get your app ID from the output above
   doctl apps update YOUR_APP_ID --spec .do/app.yaml
   ```

### Option 3: Using GitHub Actions (CI/CD)

You can also set up automatic deployments using GitHub Actions. See DigitalOcean's documentation for this.

## Post-Deployment

1. **Access your app**
   - Once deployed, you'll get a URL like: `https://your-app-name.ondigitalocean.app`
   - Visit the URL to test your app

2. **Monitor your app**
   - Go to the App Platform dashboard
   - Check logs if there are any issues
   - Monitor resource usage

3. **Set up a custom domain (Optional)**
   - In App Platform settings, go to "Domains"
   - Add your custom domain
   - Follow the DNS configuration instructions

## Troubleshooting

### Build Fails
- Check the build logs in App Platform
- Ensure all dependencies are in `package.json`
- Verify Node.js version compatibility

### Runtime Errors
- Check the runtime logs
- Verify environment variables are set correctly
- Ensure API keys are valid

### API Timeout Issues
- The app is configured with a 3-minute timeout for image generation
- If you need longer, you may need to upgrade your plan

## Cost Optimization

- Start with Basic XXS ($5/month)
- Monitor usage and scale up only if needed
- Consider using DigitalOcean's usage-based pricing for API calls

## Environment Variables Reference

| Variable | Type | Description |
|----------|------|-------------|
| `FAL_AI_API_KEY` | SECRET | Your DigitalOcean Gradient AI Platform API key |
| `MODEL_ACCESS_KEY` | SECRET | Alternative name for the API key (used if FAL_AI_API_KEY is not set) |
| `NODE_ENV` | GENERAL | Set to `production` for production builds |

## Support

For issues with:
- **App Platform**: Check [DigitalOcean App Platform Docs](https://docs.digitalocean.com/products/app-platform/)
- **API Keys**: Check [Gradient AI Platform](https://cloud.digitalocean.com/gradient)


