# 🔐 Gated Evaluation System Deployment Guide

## Security Overview

The evaluation system now includes **authentication gating** to prevent unauthorized access when deployed on public GitHub Pages.

## 🔑 Authentication System

### **How It Works**
- **Access codes** gate the system before evaluators can load samples
- **Session-based** authentication (cleared when browser closes)
- **Client-side only** - suitable for GitHub Pages static hosting
- **Evaluator ID** still required after authentication

### **Current Access Codes**
```
NOVELTY2025
EVAL2025  
ICLR2025
```

## 📋 Pre-Deployment Checklist

### **1. Update Access Codes**
Edit `data/auth_config.json`:
```json
{
  "access_codes": [
    "YOUR_CUSTOM_CODE_1",
    "YOUR_CUSTOM_CODE_2", 
    "YOUR_CUSTOM_CODE_3"
  ]
}
```

### **2. Test Authentication**
```bash
python serve.py
# Open http://localhost:8000
# Test with valid/invalid codes
```

### **3. Distribution Plan**
- **Share codes privately** with authorized evaluators
- **Different codes** for different evaluator groups (optional)
- **Backup codes** in case of issues

## 🚀 Deployment Options

### **GitHub Pages (Recommended)**
1. **Create public repository** (or use existing)
2. **Upload all files** from `static_evaluation_v2/`
3. **Enable Pages** in repository settings
4. **Share URL + access codes** with evaluators

### **Netlify Drop**
1. **Zip the directory**: `static_evaluation_v2.zip`
2. **Drag & drop** to [Netlify Drop](https://app.netlify.com/drop)
3. **Get deployment URL**
4. **Share URL + access codes**

### **Vercel**
```bash
cd static_evaluation_v2
npx vercel --prod
```

## 🔒 Security Considerations

### **What This Protects Against**
✅ **Casual browsing** - Random visitors can't access the system  
✅ **Search engine indexing** - Content hidden behind authentication  
✅ **Unauthorized participation** - Only people with codes can evaluate  

### **Limitations (Client-Side Security)**
⚠️ **Not cryptographically secure** - Determined users could bypass  
⚠️ **Codes visible in network requests** - Don't use highly sensitive codes  
⚠️ **JavaScript required** - System won't work with JS disabled  

### **Best Practices**
- ✅ **Use descriptive but not guessable codes**
- ✅ **Change codes periodically** if needed
- ✅ **Share codes through secure channels** (email, Slack, etc.)
- ✅ **Monitor usage** through downloaded evaluation files
- ✅ **Consider time-limited deployment** for evaluation periods

## 👥 Evaluator Instructions

### **How to Access the System**
1. **Navigate to deployment URL**
2. **Enter access code** (provided by research team)
3. **Enter evaluator ID** (0, 1, or 2)
4. **Complete assigned evaluations**
5. **Download results** (automatic on each submit)

### **Sample Evaluator Email**
```
Subject: Novelty Assessment Evaluation - Access Instructions

Dear [Evaluator Name],

You have been assigned as Evaluator [ID] for our novelty assessment study.

Access the evaluation system here: [DEPLOYMENT_URL]

Access Code: [PROVIDE_CODE]
Your Evaluator ID: [0, 1, or 2]

Instructions:
1. Enter the access code and your evaluator ID
2. Complete your assigned 50 evaluation samples
3. Results are automatically downloaded after each submission
4. Contact us if you encounter any issues

Thank you for your participation!
```

## 📊 Monitoring & Analytics

### **Track Usage**
- **Downloaded evaluation files** show completion progress
- **Browser console logs** can help debug issues
- **Consider adding analytics** if needed for deployment tracking

### **Common Issues**
- **"Invalid access code"** - Double-check code spelling/case
- **"Failed to load samples"** - Check evaluator ID (0, 1, 2)
- **Download not working** - Check browser download settings
- **Page won't load** - Verify all files uploaded correctly

## 🔄 Code Updates

### **To Change Access Codes**
1. **Update `data/auth_config.json`**
2. **Redeploy to hosting platform**
3. **Notify evaluators of new codes**

### **To Add More Evaluators**
1. **Generate additional assignments** with `hybrid_evaluator_assignment.py`
2. **Update `static_evaluation_config.json`**
3. **Add new evaluator sample files**
4. **Redeploy system**

## ⚡ Quick Deployment

### **One-Command Setup**
```bash
# Generate custom access codes
echo '{"access_codes":["CUSTOM1","CUSTOM2","CUSTOM3"]}' > data/auth_config.json

# Test locally
python serve.py

# Deploy to Netlify (drag & drop the folder)
# Share URL + codes with evaluators
```

The system is now ready for secure deployment on public hosting platforms! 🎉