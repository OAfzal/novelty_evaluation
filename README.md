# Static Reference-Based Evaluation System

A client-side web application for conducting reference-based comparisons of AI-generated reviews against human reviews.

## Features

- **Client-side only**: No server required, runs entirely in the browser
- **Reference-based evaluation**: Compare two candidates against a human reference review
- **Local data storage**: Evaluations saved to browser localStorage and auto-downloaded as JSON
- **100 ICLR 2025 papers**: Complete dataset with human reviews and AI system outputs
- **Responsive design**: Works on desktop and mobile devices

## Dataset

- **100 papers** from ICLR 2025 submissions
- **Human reviews**: Multiple reviewers per paper (used as references)
- **AI systems**: Our System, OpenReviewer, DeepReviewer outputs
- **6 evaluation categories**: Reasoning alignment, decision alignment, claim substantiation, novelty assessment, technical depth, critical analysis

## Usage

### Local Testing
1. Open `index.html` in a web browser
2. Enter your evaluator ID
3. Start evaluating!

### Deployment Options

#### Option 1: GitHub Pages (Recommended)
1. Create a new GitHub repository
2. Upload all files to the repository
3. Enable GitHub Pages in repository settings
4. Access via `https://yourusername.github.io/your-repo-name`

#### Option 2: Netlify
1. Drag and drop the folder to [Netlify Drop](https://app.netlify.com/drop)
2. Get instant deployment URL
3. Optional: Connect to GitHub for automatic updates

#### Option 3: Vercel
1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in this directory
3. Follow the prompts for deployment

#### Option 4: Any Static Host
- Upload files to any static hosting service (AWS S3, Azure Static Web Apps, etc.)

## File Structure

```
static_evaluation/
├── index.html          # Main web interface
├── app.js             # Client-side application logic
├── extract_data.py    # Data extraction script
├── data/
│   ├── papers.json    # All paper data (100 papers)
│   └── stats.json     # Dataset statistics
└── README.md          # This file
```

## Data Export

- Evaluations are automatically downloaded as JSON files
- Data is also saved in browser localStorage
- Each evaluation includes:
  - Paper ID and evaluation ID
  - Reference and candidate details
  - All responses and comments
  - Timestamps and duration

## Browser Compatibility

- Chrome/Edge: Full support
- Firefox: Full support  
- Safari: Full support
- Mobile browsers: Responsive design

## Security & Privacy

- No data sent to external servers
- All processing happens locally
- Evaluation data stored locally and downloaded
- No tracking or analytics

## Development

To modify the dataset:
1. Update the source data in `../data_iclr_all_topics/iclr_compiled_v2/`
2. Run `python extract_data.py` to regenerate `data/papers.json`
3. Refresh the web application

## Troubleshooting

**Data not loading**: Check browser console for errors, ensure `data/papers.json` exists

**Evaluations not saving**: Check if browser blocks file downloads, try different browser

**Mobile issues**: Use landscape mode for better experience on small screens

## Support

For issues or questions, refer to the main project documentation or create an issue in the project repository.