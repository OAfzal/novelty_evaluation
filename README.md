# Hybrid Static Evaluation System v2

This is an updated static evaluation system that supports the hybrid evaluator assignment approach with the latest features from `reference_comparison.py`.

## Features

### ✅ **Hybrid Evaluator Assignment Support**
- **Evaluator-specific samples**: Each evaluator gets their own sample set via evaluator ID
- **Overlap samples**: 25 samples evaluated by all evaluators for inter-rater reliability  
- **Unique samples**: Remaining samples divided among evaluators for efficient coverage
- **Assignment tracking**: Visual indicators for overlap vs unique samples

### ✅ **Updated Evaluation Framework**
- **Latest categories**: Synced with `reference_comparison.py` evaluation categories
  - Novelty Reasoning Alignment
  - Novelty Decision Alignment  
  - Claim Substantiation
  - Analytical Quality
- **Modern response options**: A wins, B wins, Tie, Unclear
- **Enhanced UI**: Better visual design and mobile responsiveness

### ✅ **Deployment Ready**
- **Static hosting**: Works on any static hosting platform (Netlify, GitHub Pages, etc.)
- **No server required**: Pure client-side JavaScript application
- **Local testing**: Built-in development server
- **Offline capable**: Works offline once loaded

## Quick Start

### 1. **Local Testing**
```bash
python serve.py
# Open http://localhost:8000 in browser
```

### 2. **Enter Evaluator ID** 
- Evaluator 0, 1, or 2 (based on hybrid assignment)
- System loads your specific sample set
- Shows assignment details (overlap vs unique samples)

### 3. **Complete Evaluations**
- Compare candidates A & B against reference human review
- Answer 4 evaluation categories
- Submit and continue to next sample

### 4. **Download Results**
- Results saved locally in browser storage
- Download JSON file with all evaluations
- Includes metadata for analysis

## Deployment Options

### **Netlify Drop**
1. Zip the entire directory
2. Drag & drop to [Netlify Drop](https://app.netlify.com/drop)
3. Share the generated URL with evaluators

### **GitHub Pages** 
1. Push to GitHub repository
2. Enable Pages in repository settings
3. Choose "Deploy from branch" → main/docs

### **Vercel**
```bash
npm install -g vercel
vercel --prod
```

## Data Structure

### **Input Files** (in `/data/` directory)
- `static_evaluation_config.json` - Assignment configuration
- `evaluator_0_samples.json` - Samples for evaluator 0
- `evaluator_1_samples.json` - Samples for evaluator 1  
- `evaluator_2_samples.json` - Samples for evaluator 2
- `assignment_info.json` - Overall assignment metadata
- `overlap_analysis.json` - Overlap samples for reliability analysis

### **Output Format**
Each evaluator downloads results as JSON:
```json
{
  "evaluator_id": 0,
  "total_evaluations": 50,
  "export_timestamp": "2025-01-01T12:00:00.000Z",
  "evaluations": [
    {
      "evaluation_id": "eval_0_1234567890_abc123",
      "paper_id": "ABC123XYZ",
      "assignment_type": "overlap",
      "responses": {
        "novelty_reasoning_alignment": "a_wins",
        "novelty_decision_alignment": "tie",
        "claim_substantiation": "b_wins", 
        "analytical_quality": "a_wins"
      },
      "evaluation_time_ms": 120000,
      "timestamp": "2025-01-01T12:02:00.000Z"
    }
  ]
}
```

## Assignment Structure

### **Hybrid Approach (3 Evaluators)**
- **Total samples**: 100
- **Overlap samples**: 25 (all 3 evaluators)
- **Unique samples**: 75 (25 per evaluator)
- **Samples per evaluator**: 50
- **Total evaluations**: 150 (50% overlap, 50% unique)

### **Benefits**
- **Inter-rater reliability**: Measured on 25 overlap samples
- **Efficient coverage**: All 100 samples evaluated
- **Balanced workload**: ~50 samples per evaluator
- **Statistical validity**: Sufficient overlap for reliability analysis

## Integration with Analysis Tools

### **Inter-rater Reliability Analysis**
```python
# Load overlap results for reliability calculation
import json
from collections import defaultdict

overlap_results = defaultdict(list)
for evaluator_id in [0, 1, 2]:
    with open(f'evaluator_{evaluator_id}_results.json') as f:
        data = json.load(f)
        for eval in data['evaluations']:
            if eval['assignment_type'] == 'overlap':
                overlap_results[eval['paper_id']].append(eval['responses'])

# Calculate Cohen's kappa, etc.
```

### **Combined Results Analysis**
```python
# Combine all evaluator results
all_evaluations = []
for evaluator_id in [0, 1, 2]:
    with open(f'evaluator_{evaluator_id}_results.json') as f:
        data = json.load(f)
        all_evaluations.extend(data['evaluations'])

# Analyze system performance, agreement patterns, etc.
```

## Comparison with Original System

### **Improvements in v2**
- ✅ **Evaluator assignment**: Supports hybrid approach vs random sampling
- ✅ **Latest categories**: Synced with current `reference_comparison.py`
- ✅ **Better UI**: Assignment tracking, progress indicators, mobile support
- ✅ **Enhanced metadata**: Assignment type, evaluator sample ID, timing data
- ✅ **Configuration driven**: Uses assignment config files

### **Migration from v1**
- Categories updated from 6 to 4 (focused on key evaluation aspects)
- Response options simplified to 4 choices
- Data format enhanced with assignment metadata
- Supports both hybrid and standard evaluation modes

## Technical Details

### **Client-side Architecture**
- **No dependencies**: Pure HTML/CSS/JavaScript
- **Local storage**: Automatic backup of evaluations
- **Progressive enhancement**: Works without JavaScript (basic functionality)
- **Mobile responsive**: Touch-friendly interface

### **Performance Characteristics**
- **Loading time**: <2 seconds for 50 samples
- **Memory usage**: ~10MB for full sample set
- **Storage**: ~1MB per 100 evaluations
- **Offline support**: Works after initial load

### **Browser Compatibility**
- **Modern browsers**: Chrome 60+, Firefox 55+, Safari 12+, Edge 79+
- **JavaScript features**: ES6, Fetch API, LocalStorage
- **Graceful degradation**: Basic functionality in older browsers

## Troubleshooting

### **Common Issues**

**"Failed to load samples for evaluator X"**
- Check evaluator ID (should be 0, 1, or 2)
- Verify `evaluator_X_samples.json` exists in `/data/` directory
- Check browser console for detailed error

**"Assignment configuration not found"**
- Ensure `static_evaluation_config.json` is in `/data/` directory
- System will work without config but in fallback mode

**"Evaluation not submitting"**
- Ensure all 4 categories are answered
- Check browser console for validation errors
- Try refreshing page and re-entering evaluator ID

### **Development Tips**

**Local testing**
```bash
python serve.py
# Check http://localhost:8000 works
# Verify data files load correctly
```

**Debugging**
```javascript
// Open browser console
console.log(evaluationSystem.evaluatorSamples);
console.log(evaluationSystem.completedEvaluations);
```

**Data validation**
```bash
# Check JSON files are valid
python -m json.tool data/evaluator_0_samples.json
python -m json.tool data/static_evaluation_config.json
```

## Future Enhancements

- **Real-time sync**: Multi-evaluator progress tracking
- **Advanced analytics**: Built-in agreement calculations
- **Export formats**: CSV, XLSX output options
- **Accessibility**: Screen reader support, keyboard navigation
- **Batch operations**: Bulk evaluation submission